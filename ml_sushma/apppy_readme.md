# 🛍️ Image-Based Grocery Product Matcher

This is a Flask API that accepts a product image and a search keyword, scrapes matching grocery items from Nepali e-commerce websites, and returns the top 2 visually similar products per site based on **ResNet50** feature extraction and **cosine similarity**.

---

## 🚀 Features

- 🔍 Scrapes products from:
  - [Khadyanna](https://www.khadyanna.com)
  - [MilanWholesale](https://www.milanwholesale.com)
  - [MeroKirana](https://www.merokirana.com)
- 🖼️ Accepts user-uploaded images via API.
- 🧠 Uses **ResNet50** from `torchvision` for image feature extraction.
- 🧮 Ranks products using cosine similarity and returns the top 2 from each site.

---

## ⚙️ Tech Stack

- Python 
- Flask
- Torch + Torchvision
- BeautifulSoup
- Selenium (for MeroKirana)
- PIL (Pillow)
- NumPy


Setup

python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install <the above tech stack>

run: python app.py

By default, the server will start on http://127.0.0.1:5000/

Endpoint 
POST /match


### Example Request in Postman
Method: POST

URL: http://127.0.0.1:5000/match

Body: form-data

image: [select your image file]

keyword: tea

## SAMPLE RESPONSE

{
  "khadyanna": [
    {
      "name": "Top Tea 500g",
      "price": "Rs. 250",
      "image_url": "https://...",
      "similarity": 0.8427
    },
    ...
  ],
  "milanwholesale": [
    ...
  ],
  "merokirana": [
    ...
  ]
}
