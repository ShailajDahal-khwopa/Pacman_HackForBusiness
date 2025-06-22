from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json

app = Flask(__name__)
CORS(app)

# 🔐 Configure Gemini API
genai.configure(api_key="AIzaSyCYsGOuuizEZ2y4nJ-d5K5hiLuJ39fmUYg")  # Replace with your key

# 💰 Nepal price list for the labeled products (in NPR)
nepal_price_list = {
    "red_pringles": 275,
    "purple_pringles": 275,
    "green_pringles": 275,
    "yellow_pringles": 275,
    "red_lays": 50,
    "blue_lays": 50,
    "green_lays": 50,
    "oreo": 25,
    "parle-g": 200,
    "chocos": 390,
    "coffee": 160, #380
    "bread": 50,
    "fanta": 250,
    "coke": 250,
    "sprite": 250,
    "glucose": 190, #200
    "redbull": 100, #110
    "frooti": 25,
    "aloevera": 60,
    "appy": 20,
    "top": 60,
    "chocopie": 140,
    "2pm": 220,
    "mariegold": 100, #80
    "monaco": 50, #10,100
    "honey": 420, #775
    "realjuice": 45,
    "horlicks": 430,
    "prawn": 35
}

def generate_invoice_with_gemini(cart, price_list):
    """Generate invoice using Gemini 2.0"""
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        prompt = f"""
You are an invoice generator for a grocery store in Nepal.
Here is the shopping cart:
{json.dumps(cart, indent=2)}

Here is the price list (in Rs - Rupees):
{json.dumps(price_list, indent=2)}

Generate a JSON invoice with these exact fields:
- "items": list of item dictionaries with "name", "quantity", "unit_price", "total_price"
- "subtotal": sum of all item total_prices
- "total": same as subtotal (no tax)
- "currency": "Rs"

Rules:
1. Only include items that exist in both cart and price list
2. Calculate total_price = quantity × unit_price
3. Only return valid JSON, no explanation or markdown formatting

Example format:
{{
  "items": [
    {{
      "name": "oreo",
      "quantity": 2,
      "unit_price": 30,
      "total_price": 60
    }}
  ],
  "subtotal": 60,
  "total": 60,
  "currency": "Rs"
}}
"""
        
        response = model.generate_content(prompt)
        
        # Clean response (remove markdown if present)
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        return json.loads(response_text)
        
    except Exception as e:
        # Fallback: generate invoice manually if Gemini fails
        return generate_invoice_manually(cart, price_list)

def generate_invoice_manually(cart, price_list):
    """Fallback manual invoice generation"""
    items = []
    subtotal = 0
    
    for product, quantity in cart.items():
        if product in price_list:
            unit_price = price_list[product]
            total_price = quantity * unit_price
            subtotal += total_price
            
            items.append({
                "name": product,
                "quantity": quantity,
                "unit_price": unit_price,
                "total_price": total_price
            })
    
    return {
        "items": items,
        "subtotal": subtotal,
        "total": subtotal,
        "currency": "Rs"
    }


@app.route('/generate-invoice', methods=['POST'])
def generate_invoice():
    """
    Generate invoice from cart
    Expected JSON input: {"cart": {"product_name": quantity, ...}}
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data or 'cart' not in data:
            return jsonify({
                "error": "Missing 'cart' in request body",
                "expected_format": {
                    "cart": {
                        "oreo": 2,
                        "coke": 1
                    }
                }
            }), 400
        
        cart = data['cart']
        
        # Validate cart format
        if not isinstance(cart, dict) or not cart:
            return jsonify({
                "error": "Cart must be a non-empty dictionary",
                "example": {"oreo": 2, "coke": 1}
            }), 400
        
        # Check for invalid products
        invalid_products = [product for product in cart.keys() if product not in nepal_price_list]
        if invalid_products:
            return jsonify({
                "error": f"Unknown products: {invalid_products}",
                "available_products": list(nepal_price_list.keys())
            }), 400
        
        # Generate invoice using Gemini
        invoice = generate_invoice_with_gemini(cart, nepal_price_list)
        
        return jsonify(invoice)
        
    except json.JSONDecodeError:
        return jsonify({
            "error": "Invalid JSON format"
        }), 400
    except Exception as e:
        return jsonify({
            "error": f"Server error: {str(e)}"
        }), 500

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({
        "error": "Method not allowed",
        "allowed_methods": ["GET", "POST"]
    }), 405

@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "error": "Endpoint not found",
        "available_endpoints": ["/", "/products", "/generate-invoice"]
    }), 404

if __name__ == '__main__':
    print("Starting Nepal Grocery Invoice API...")
    print("Available products:", len(nepal_price_list))
    app.run(debug=True, host='0.0.0.0', port=5000)