import os
import tempfile
from io import BytesIO

import numpy as np
import requests
import torch
from bs4 import BeautifulSoup
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
from torchvision import models, transforms

# ensure cors


app = Flask(__name__)
CORS(app)


# -------- Scrape khadyanna.com --------
def scrape_khadyanna(search_term):
    url = f"https://www.khadyanna.com/search/product?product_keyword={search_term}"
    headers = {"User-Agent": "Mozilla/5.0"}
    products = []
    try:
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        for item in soup.select(".p-wrap"):
            info = item.select_one(".p-info")
            name_tag = info.select_one("h3 a") if info else None
            price_tag = info.select_one(".final-price") if info else None
            image_tag = item.select_one(".img-wrap img")
            link_tag = item.select_one(".img-wrap a")
            if name_tag and price_tag and image_tag and link_tag:
                name = name_tag.text.strip()
                price = price_tag.text.strip()
                image_url = image_tag["src"].strip()
                if image_url.startswith("//"):
                    image_url = "https:" + image_url
                product_url = "https://www.khadyanna.com" + link_tag["href"].strip()
                products.append(
                    {
                        "name": name,
                        "price": price,
                        "image_url": image_url,
                        "product_url": product_url,
                    }
                )
    except Exception as e:
        print(f"Error scraping khadyanna.com: {e}")
    return products


# -------- Scrape milanwholesale.com --------
def scrape_milanwholesale(search_term):
    url = f"https://www.milanwholesale.com/search/product?product_keyword={search_term}"
    headers = {"User-Agent": "Mozilla/5.0"}
    products = []
    try:
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, "html.parser")
        for product in soup.find_all("div", class_="p-wrap"):
            name_tag = product.find("h3")
            name = name_tag.get_text(strip=True) if name_tag else "N/A"
            price_tag = product.find("div", class_="product-price")
            price = (
                price_tag.get_text(strip=True).replace("\xa0", " ")
                if price_tag
                else "N/A"
            )
            img_tag = product.find("img")
            img_url = img_tag["src"] if img_tag and img_tag.has_attr("src") else "N/A"
            if img_url.startswith("//"):
                img_url = "https:" + img_url
            link_tag = product.find("a")
            product_url = (
                link_tag["href"] if link_tag and link_tag.has_attr("href") else ""
            )
            if product_url and not product_url.startswith("http"):
                product_url = "https://www.milanwholesale.com" + product_url
            products.append(
                {
                    "name": name,
                    "price": price,
                    "image_url": img_url,
                    "product_url": product_url,
                }
            )
    except Exception as e:
        print(f"Error scraping milanwholesale.com: {e}")
    return products


# -------- Scrape merokirana.com (Selenium required) --------
def scrape_merokirana(search_term):
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options

        options = Options()
        options.add_argument("--headless")
        driver = webdriver.Chrome(options=options)
        url = (
            f"https://merokirana.com/#/search/KiranaProduct/{search_term}/{search_term}"
        )
        products = []
        import time

        driver.get(url)
        time.sleep(5)
        soup = BeautifulSoup(driver.page_source, "html.parser")
        product_cards = soup.select(".product-card")
        for card in product_cards:
            name_tag = card.select_one(".product-card__title a")
            name = name_tag.text.strip() if name_tag else "N/A"
            price_tag = card.select_one(".product-card__price-amount")
            price = price_tag.text.strip() if price_tag else "N/A"
            img_tag = card.select_one(".product-card__image img")
            img_src = img_tag["src"] if img_tag else "N/A"
            if img_src.startswith("//"):
                img_src = "https:" + img_src
            link_tag = card.select_one(".product-card__title a")
            product_url = (
                link_tag["href"] if link_tag and link_tag.has_attr("href") else ""
            )
            if product_url and not product_url.startswith("http"):
                product_url = "https://merokirana.com" + product_url
            products.append(
                {
                    "name": name,
                    "price": price,
                    "image_url": img_src,
                    "product_url": product_url,
                }
            )
        driver.quit()
        return products
    except Exception as e:
        print(f"Error scraping merokirana.com: {e}")
        return []


# -------- Load pretrained ResNet50 for feature extraction --------
def init_model():
    model = models.resnet50(pretrained=True)
    model.eval()
    feature_extractor = torch.nn.Sequential(*list(model.children())[:-1])
    return feature_extractor


# -------- Image preprocessor --------
preprocess = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)


def get_image_embedding(img, model):
    input_tensor = preprocess(img).unsqueeze(0)
    with torch.no_grad():
        features = model(input_tensor)
    return features.squeeze().numpy()


def cosine_similarity(a, b):
    a = a.flatten()
    b = b.flatten()
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def find_best_match(products, user_embedding, model):
    best_score = -1
    best_product = None
    for product in products:
        try:
            if not product["image_url"] or product["image_url"] == "N/A":
                continue
            response = requests.get(product["image_url"], timeout=10)
            prod_img = Image.open(BytesIO(response.content)).convert("RGB")
            prod_embedding = get_image_embedding(prod_img, model)
            score = cosine_similarity(user_embedding, prod_embedding)
            if score > best_score:
                best_score = score
                best_product = product
        except Exception as e:
            continue
    return best_product


@app.route("/match", methods=["POST"])
def match_product():
    if "image" not in request.files or "keyword" not in request.form:
        return jsonify({"error": "Image file and keyword required"}), 400

    image_file = request.files["image"]
    keyword = request.form["keyword"]

    # Save image to temp file and open with PIL
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp:
        image_file.save(temp.name)
        user_img = Image.open(temp.name).convert("RGB")
    os.unlink(temp.name)

    # Scrape products
    products_khadyanna = scrape_khadyanna(keyword)
    products_milan = scrape_milanwholesale(keyword)
    products_merokirana = scrape_merokirana(keyword)

    # Feature extraction
    model = init_model()
    user_embedding = get_image_embedding(user_img, model)

    # For each site, calculate similarity for all products
    def get_products_with_scores(products):
        product_list = []
        for product in products:
            try:
                print("Processing product: %s", product["name"])
                if not product["image_url"] or product["image_url"] == "N/A":
                    continue
                response = requests.get(product["image_url"], timeout=10)
                prod_img = Image.open(BytesIO(response.content)).convert("RGB")
                prod_embedding = get_image_embedding(prod_img, model)
                score = cosine_similarity(user_embedding, prod_embedding)
                product_list.append(
                    {
                        "name": product["name"],
                        "price": product["price"],
                        "image_url": product["image_url"],
                        "similarity": float(score),
                    }
                )
            except Exception as e:
                continue
        print(f"Found {len(product_list)} products with valid images")
        # Sort by similarity descending and return only top 2
        product_list.sort(key=lambda x: x["similarity"], reverse=True)
        return product_list[:2]

    result = {
        "khadyanna": get_products_with_scores(products_khadyanna),
        "milanwholesale": get_products_with_scores(products_milan),
        "merokirana": get_products_with_scores(products_merokirana),
    }

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=7000)
