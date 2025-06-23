# 🧾 Grocery Invoice Generator & Object Detection API

This project provides Flask APIs for:
- Detecting grocery items in images using YOLOv11.
- Generating a detailed invoice (with pricing) using Google Gemini AI or a fallback manual method.
- Simple object detection/counting for grocery items.

---

## 📋 Table of Contents

- Overview
- Features
- Tech Stack
- Installation
- Usage
  - Running the API
  - API Endpoints
  - Example Request
  - Sample Response
- How It Works
- Troubleshooting
- Contributing
- License

---

## Overview

This module enables you to:
- Upload an image of a grocery cart or shelf.
- Detect and count known grocery items using a custom-trained YOLOv11 model.
- Generate a detailed invoice with itemized pricing using Google Gemini AI (with fallback to manual calculation).
- Use a simple detection/counting API for quick item recognition.

---

## Features

- 🛒 Grocery item detection using YOLOv11
- 🧾 Invoice generation with pricing (Nepalese Rupees)
- 🤖 Gemini AI integration for smart invoice formatting
- 🔢 Fallback manual invoice calculation
- 🔄 CORS enabled for frontend integration
- 🧮 Simple object counting endpoint

---

## Tech Stack

- Python 3.x
- Flask
- Flask-CORS
- Ultralytics YOLOv10
- Pillow (PIL)
- OpenCV (for detection.py)
- Google Generative AI (Gemini)
- NumPy

---

## Installation

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd ml_supriya
   ```

2. **Create and activate a virtual environment:**
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```sh
   pip install flask flask-cors ultralytics pillow opencv-python numpy google-generativeai
   ```

4. **Download your YOLOv model:**
   - Place your `best.pt` YOLOv10odel file in this directory.

5. **Set up Google Gemini API key:**
   - Replace the placeholder API key in `invoice.py` with your own Gemini API key.

---

## Usage

### Running the Invoice API

```sh
python invoice.py
```
- Starts at: [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

### Running the Simple Detection API

```sh
python detection.py
```
- Starts at: [http://127.0.0.1:4000/](http://127.0.0.1:4000/)

---

## API Endpoints

### 1. `/detect` (POST) — Invoice API (`invoice.py`)

- **Description:** Detects items in an image and returns a detailed invoice.
- **Request:** `multipart/form-data`
  - `image`: (file) The image to process.
- **Response:** JSON invoice with items, quantities, unit prices, and totals.

### 2. `/detect` (POST) — Simple Detection API (`detection.py`)

- **Description:** Detects and counts items in an image.
- **Request:** `multipart/form-data`
  - `image`: (file) The image to process.
- **Response:** JSON dictionary of item counts.

---

## Example Request

**Postman:**
- Method: `POST`
- URL: `http://127.0.0.1:5000/detect`
- Body: `form-data`
  - `image`: [select your image file]

**cURL:**
```sh
curl -X POST -F "image=@/path/to/image.jpg" http://127.0.0.1:5000/detect
```

---

## Sample Response

### Invoice API (`invoice.py`)
```json
{
  "items": [
    {"name": "oreo", "quantity": 2, "unit_price": 25, "total_price": 50},
    {"name": "red_lays", "quantity": 1, "unit_price": 50, "total_price": 50}
  ],
  "subtotal": 100,
  "total": 100,
  "currency": "Rs"
}
```

### Simple Detection API (`detection.py`)
```json
{
  "oreo": 2,
  "red_lays": 1
}
```

---

## How It Works

1. **Image Upload:** User uploads a grocery image.
2. **YOLOv11 Detection:** The model detects and classifies known grocery items.
3. **Counting:** Items are counted and mapped to a price list.
4. **Invoice Generation:** Gemini AI formats the invoice (with fallback to manual calculation).
5. **Response:** The API returns a detailed invoice or a simple item count.

---

## Troubleshooting

- **YOLO Model:** Ensure `best.pt` is present and compatible with Ultralytics YOLOv11.
- **Gemini API:** Use a valid API key and ensure internet access.
- **Dependencies:** Install all required Python packages as listed above.
- **Image Format:** Use clear, well-lit images for best results.

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

---

## License

MIT License. See LICENSE