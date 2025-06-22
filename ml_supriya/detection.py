from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
from ultralytics import YOLO
from collections import Counter
import numpy as np

app = Flask(__name__)
CORS(app)

# Load model
model = YOLO('best.pt')

@app.route('/detect', methods=['POST'])
def detect_objects():

    # Get image file
    file = request.files['image']
    
    # Read and decode image
    image_bytes = file.read()
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Run detection
    results = model(image) 
    
    # Extract classes
    detected_classes = []
    if results[0].boxes is not None:
        for box in results[0].boxes:
            class_id = int(box.cls)
            class_name = model.names[class_id]
            detected_classes.append(class_name)
    
    # Count classes
    class_counts = Counter(detected_classes)
    print(class_counts)

    return jsonify(dict(class_counts))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=4000)