import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO
import torch
from torchvision import models, transforms
import numpy as np
import tkinter as tk
from tkinter import filedialog
import easyocr
import re
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')

def get_user_image():
    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename(title="Select a product image")
    if not file_path:
        print("No image selected, exiting.")
        exit()
    return Image.open(file_path).convert("RGB")



def extract_keyword_from_image_easyocr(img):
    reader = easyocr.Reader(['en'], gpu=True)
    result = reader.readtext(np.array(img))

    print("\n🧾 OCR Detected Text Blocks:")
    texts = []
    for res in result:
        print(f"→ {res[1]}")
        texts.append(res[1].strip().lower())

    # Extract individual words using regex
    words = []
    for text in texts:
        words.extend(re.findall(r'\b\w+\b', text))

    # Filter out stopwords and short/junk tokens
    stop_words = set(stopwords.words('english'))
    filtered = [word for word in words if word not in stop_words and len(word) > 2 and word.isalpha()]

    if not filtered:
        print("⚠️ No clear keyword found. Please enter manually.")
        return input("Enter product keyword manually: ")

    print(f"\n🧠 Filtered OCR Words: {filtered}")
    return filtered[0]  # Pick the most likely one



def scrape_products(search_term):
    url = f"https://www.khadyanna.com/search/product?product_keyword={search_term}"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    products = []
    for item in soup.select(".p-wrap"):
        info = item.select_one(".p-info")
        name_tag = info.select_one("h3 a")
        price_tag = info.select_one(".final-price")
        image_tag = item.select_one(".img-wrap img")
        link_tag = item.select_one(".img-wrap a")

        if name_tag and price_tag and image_tag and link_tag:
            name = name_tag.text.strip()
            price = price_tag.text.strip()
            image_url = image_tag["src"].strip()
            if image_url.startswith("//"):
                image_url = "https:" + image_url
            product_url = "https://www.khadyanna.com" + link_tag["href"].strip()

            products.append({
                "name": name,
                "price": price,
                "image_url": image_url,
                "product_url": product_url
            })
    return products



def init_model():
    model = models.resnet50(pretrained=True)
    model.eval()
    feature_extractor = torch.nn.Sequential(*list(model.children())[:-1])
    return feature_extractor



preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

def get_image_embedding(img, model):
    input_tensor = preprocess(img).unsqueeze(0)
    with torch.no_grad():
        features = model(input_tensor)
    return features.squeeze().numpy()


def cosine_similarity(a, b):
    a = a.flatten()
    b = b.flatten()
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))



if __name__ == "__main__":
    print("📷 Please select an image of the product...")
    user_img = get_user_image()
    user_img.show()

    print("\n🔍 Extracting keyword from image using EasyOCR...")
    search_term = extract_keyword_from_image_easyocr(user_img)
    print(f"\n✅ Using extracted keyword: {search_term}")

    print(f"\n🌐 Scraping products for keyword: '{search_term}' from Khadyanna...")
    products = scrape_products(search_term)
    if not products:
        print("❌ No products found. Try another image.")
        exit()
    print(f"✅ Found {len(products)} products.")

    print("\n🧠 Initializing ResNet50 model for image comparison...")
    model = init_model()

    user_embedding = get_image_embedding(user_img, model)

    print("\n🔄 Comparing your image to product images...")
    best_score = -1
    best_product = None

    for i, product in enumerate(products):
        try:
            response = requests.get(product["image_url"])
            prod_img = Image.open(BytesIO(response.content)).convert("RGB")
            prod_embedding = get_image_embedding(prod_img, model)
            score = cosine_similarity(user_embedding, prod_embedding)

            print(f"🔹 {i+1}) {product['name'][:30]}... | Score: {score:.4f}")

            if score > best_score:
                best_score = score
                best_product = product
        except Exception as e:
            print(f"⚠️ Error processing: {product['name']} → {e}")

    if best_product:
        print("\n🎯 Best Match Found:")
        print(f"🛒 Product: {best_product['name']}")
        print(f"💵 Price: {best_product['price']}")
        print(f"🔗 URL: {best_product['product_url']}")
        print(f"📈 Similarity Score: {best_score:.4f}")
    else:
        print("❌ Could not match any product.")