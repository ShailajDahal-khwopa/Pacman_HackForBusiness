from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import google.generativeai as genai
import json
import io

# -------------------- Setup --------------------
app = Flask(__name__)
CORS(app)

# Load YOLOv8 model
yolo_model = YOLO("best.pt")  # ⚠️ Ensure this model is in your project folder

# Gemini API key (⚠️ Replace with your own)
genai.configure(api_key="AIzaSyCYsGOuuizEZ2y4nJ-d5K5hiLuJ39fmUYg")

# Price list in Nepalese Rupees
nepal_price_list = {
    "red_pringles": 275, "purple_pringles": 275, "green_pringles": 275, "yellow_pringles": 275,
    "red_lays": 50, "blue_lays": 50, "green_lays": 50, "oreo": 25, "parle-g": 200,
    "chocos": 390, "coffee": 160, "bread": 50, "fanta": 250, "coke": 250,
    "sprite": 250, "glucose": 190, "redbull": 100, "frooti": 25, "aloevera": 60,
    "appy": 20, "top": 60, "chocopie": 140, "2pm": 220, "mariegold": 100,
    "monaco": 50, "honey": 420, "realjuice": 45, "horlicks": 430, "prawn": 35
}

# -------------------- Helper: Generate Invoice --------------------
def generate_invoice_with_gemini(cart):
    try:
        model = genai.GenerativeModel("gemini-2.0-flash-exp")
        prompt = f"""
You are an invoice generator for a grocery store in Nepal.
Cart:
{json.dumps(cart, indent=2)}
Price list:
{json.dumps(nepal_price_list, indent=2)}
Rules:
- Only use items present in both cart and price list
- Calculate total_price = quantity * unit_price
- Return valid JSON only, format:
{{
  "items": [{{"name": "oreo", "quantity": 2, "unit_price": 25, "total_price": 50}}],
  "subtotal": 50,
  "total": 50,
  "currency": "Rs"
}}
"""
        response = model.generate_content(prompt)
        clean = response.text.strip().removeprefix("```json").removesuffix("```").strip()
        return json.loads(clean)
    except:
        return generate_invoice_manually(cart)

def generate_invoice_manually(cart):
    items, subtotal = [], 0
    for item, qty in cart.items():
        if item in nepal_price_list:
            price = nepal_price_list[item]
            total = qty * price
            subtotal += total
            items.append({
                "name": item,
                "quantity": qty,
                "unit_price": price,
                "total_price": total
            })
    return {
        "items": items,
        "subtotal": subtotal,
        "total": subtotal,
        "currency": "Rs"
    }

# -------------------- Main Endpoint --------------------
@app.route('/detect', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        # Load and predict
        image = Image.open(request.files['image'].stream).convert("RGB")
        results = yolo_model.predict(image, conf=0.25)

        # Count detections
        cart = {}
        for result in results:
            for box in result.boxes:
                label = yolo_model.names[int(box.cls)]
                cart[label] = cart.get(label, 0) + 1

        if not cart:
            return jsonify({"message": "No known items detected."}), 200

        # Generate invoice
        invoice = generate_invoice_with_gemini(cart)
        return jsonify(invoice)

    except Exception as e:
        return jsonify({"error": f"Something went wrong: {str(e)}"}), 500

# -------------------- Error Handlers --------------------
@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "error": "Endpoint not found",
        "available": ["/upload-image"]
    }), 404

@app.errorhandler(405)
def not_allowed(e):
    return jsonify({
        "error": "Method not allowed",
        "allowed_methods": ["POST"]
    }), 405

# -------------------- Start Server --------------------
if __name__ == '__main__':
    print("🛒 Starting YOLO+Gemini Invoice API...")
    app.run(host='0.0.0.0', port=5000, debug=True)