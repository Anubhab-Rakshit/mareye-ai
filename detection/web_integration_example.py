#!/usr/bin/env python3
"""
Web Integration Example for Threat Detection
Simple Flask-based web API for threat detection
"""

from flask import Flask, request, jsonify, render_template_string
from threat_detector import ThreatDetector
import os
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)

# Initialize threat detector
detector = ThreatDetector(confidence_threshold=0.3)

# HTML template for the web interface
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Threat Detection System</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .upload-area { border: 2px dashed #ccc; padding: 20px; text-align: center; margin: 20px 0; }
        .result { margin: 20px 0; padding: 15px; border-radius: 5px; }
        .threat-critical { background-color: #ffebee; border-left: 5px solid #f44336; }
        .threat-high { background-color: #fff3e0; border-left: 5px solid #ff9800; }
        .threat-medium { background-color: #fffde7; border-left: 5px solid #ffc107; }
        .threat-low { background-color: #e8f5e8; border-left: 5px solid #4caf50; }
        .threat-none { background-color: #f5f5f5; border-left: 5px solid #9e9e9e; }
        button { background-color: #2196f3; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #1976d2; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚨 Threat Detection System</h1>
        <p>Upload an image to detect potential threats using AI-powered analysis.</p>
        
        <form id="uploadForm" enctype="multipart/form-data">
            <div class="upload-area">
                <input type="file" id="imageFile" name="image" accept="image/*" required>
                <p>Select an image file to analyze</p>
            </div>
            <button type="submit">🔍 Detect Threats</button>
        </form>
        
        <div id="result"></div>
    </div>

    <script>
        document.getElementById('uploadForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            const fileInput = document.getElementById('imageFile');
            const resultDiv = document.getElementById('result');
            
            if (!fileInput.files[0]) {
                alert('Please select an image file');
                return;
            }
            
            formData.append('image', fileInput.files[0]);
            
            resultDiv.innerHTML = '<p>🔍 Analyzing image...</p>';
            
            try {
                const response = await fetch('/detect', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                displayResult(result);
            } catch (error) {
                resultDiv.innerHTML = '<p style="color: red;">❌ Error: ' + error.message + '</p>';
            }
        });
        
        function displayResult(result) {
            const resultDiv = document.getElementById('result');
            
            if (!result.success) {
                resultDiv.innerHTML = '<p style="color: red;">❌ ' + result.error + '</p>';
                return;
            }
            
            const threatLevel = result.overall_threat_level.toLowerCase();
            const threatClass = 'threat-' + threatLevel;
            
            let html = `
                <div class="result ${threatClass}">
                    <h3>🎯 Detection Results</h3>
                    <p><strong>Threats Found:</strong> ${result.threat_count}</p>
                    <p><strong>Overall Threat Level:</strong> ${result.overall_threat_level}</p>
                    <p><strong>Threat Score:</strong> ${result.overall_threat_score}</p>
            `;
            
            if (result.threats && result.threats.length > 0) {
                html += '<h4>🚨 Detected Threats:</h4><ul>';
                result.threats.forEach(threat => {
                    html += `
                        <li>
                            <strong>${threat.class}</strong> - ${threat.threat_level} threat
                            <br>Confidence: ${threat.confidence_percentage.toFixed(1)}%
                            <br>Size: ${threat.relative_size.toFixed(1)}% of image
                        </li>
                    `;
                });
                html += '</ul>';
            }
            
            html += '</div>';
            resultDiv.innerHTML = html;
        }
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    """Serve the main web interface"""
    return render_template_string(HTML_TEMPLATE)

@app.route('/detect', methods=['POST'])
def detect_threats():
    """API endpoint for threat detection"""
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image file provided'})
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No image file selected'})
        
        # Save uploaded file temporarily
        temp_path = f"temp_{file.filename}"
        file.save(temp_path)
        
        # Detect threats
        result = detector.detect_threats(temp_path)
        
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/detect', methods=['POST'])
def api_detect():
    """REST API endpoint for threat detection"""
    try:
        data = request.get_json()
        
        if not data or 'image_path' not in data:
            return jsonify({'success': False, 'error': 'image_path required'})
        
        image_path = data['image_path']
        confidence_threshold = data.get('confidence_threshold', 0.3)
        
        # Update detector confidence threshold if provided
        if confidence_threshold != detector.confidence_threshold:
            detector.confidence_threshold = confidence_threshold
        
        # Detect threats
        result = detector.detect_threats(image_path)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': detector.model is not None,
        'classes': list(detector.class_names.values()) if detector.class_names else []
    })

if __name__ == '__main__':
    print("🌐 Starting Threat Detection Web Server...")
    print("📱 Web Interface: http://localhost:5000")
    print("🔗 API Endpoint: http://localhost:5000/api/detect")
    print("❤️  Health Check: http://localhost:5000/health")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
