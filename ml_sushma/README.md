# 🛍️ Image-Based Grocery Product Matcher

A Flask API and toolkit for matching user-uploaded grocery product images to visually similar products from Nepali e-commerce sites using deep learning and web scraping.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
  - [Running the API](#running-the-api)
  - [API Endpoint](#api-endpoint)
  - [Example Request](#example-request)
  - [Sample Response](#sample-response)
- [Scripts](#scripts)
- [How It Works](#how-it-works)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This project provides a REST API and scripts to:
- Accept a product image and a search keyword.
- Scrape product listings from Nepali grocery e-commerce sites:
  - [Khadyanna](https://www.khadyanna.com)
  - [MilanWholesale](https://www.milanwholesale.com)
  - [MeroKirana](https://www.merokirana.com)
- Use a pretrained ResNet50 model to extract image features.
- Compute cosine similarity between the uploaded image and product images.
- Return the top visually similar products per site.

---

## Features

- 🔍 Multi-site product scraping
- 🖼️ Image upload and deep feature extraction
- 🧠 Visual similarity ranking using ResNet50
- 🚦 REST API for integration with web/mobile apps
- 📝 OCR-based keyword extraction (see `khadyanna.py`)
- 🛡️ CORS enabled for frontend integration

---

## Tech Stack

- Python 3.x
- Flask
- Torch + Torchvision
- BeautifulSoup
- Selenium (for MeroKirana)
- Pillow (PIL)
- NumPy
- EasyOCR (for OCR keyword extraction)
- Tkinter (for interactive scripts)

---

## Installation

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd ml_sushma
   ```

2. **Create and activate a virtual environment:**
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```sh
   pip install flask torch torchvision pillow numpy beautifulsoup4 requests easyocr selenium nltk
   ```

4. **(Optional) Download NLTK stopwords for OCR scripts:**
   ```sh
   python -c "import nltk; nltk.download('stopwords')"
   ```

5. **(Optional) Install ChromeDriver for Selenium (for MeroKirana scraping):**
   - Download from https://chromedriver.chromium.org/downloads and ensure it's in your PATH.

---

## Usage

### Running the API

```sh
python app.py
```

By default, the server will start at [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

### API Endpoint

#### `POST /match`

- **Form Data:**
  - `image`: (file) The product image to match.
  - `keyword`: (string) The product keyword (e.g., "tea", "rice").

- **Response:** JSON with top 2 visually similar products per site.

### Example Request (Postman or cURL)

**Postman:**
- Method: `POST`
- URL: `http://127.0.0.1:5000/match`
- Body: `form-data`
  - `image`: [select your image file]
  - `keyword`: tea

**cURL:**
```sh
curl -X POST -F "image=@/path/to/image.jpg" -F "keyword=tea" http://127.0.0.1:5000/match
```

### Sample Response

```json
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
```

---

## Scripts

- **`app.py`**: Main Flask API for image matching.
- **`competition.py`**: Alternative script for the same API logic.
- **`khadyanna.py`**: Interactive script for OCR-based keyword extraction and matching against Khadyanna.

---

## How It Works

1. **Image Upload:** User uploads a product image and provides a keyword.
2. **Scraping:** The API scrapes product listings and images from supported e-commerce sites.
3. **Feature Extraction:** Both the user image and product images are processed through ResNet50 (pretrained on ImageNet) to obtain feature vectors.
4. **Similarity Calculation:** Cosine similarity is computed between the user image and each product image.
5. **Ranking:** The top 2 most similar products per site are returned.

---

## Troubleshooting

- **Selenium/ChromeDriver:** For MeroKirana scraping, ensure ChromeDriver is installed and matches your Chrome version.
- **CUDA/CPU:** The scripts use CPU by default. For GPU, ensure PyTorch is installed with CUDA support and set `gpu=True` in EasyOCR if available.
- **OCR Accuracy:** If OCR fails to extract a good keyword, you can enter it manually in the interactive script.

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

---

## License

MIT License. See [LICENSE](../LICENSE)