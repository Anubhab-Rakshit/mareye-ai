#!/usr/bin/env python3
"""
Threat Detection System for Website Integration
Clean, focused script for detecting threats using the trained YOLO model
"""

import cv2
import numpy as np
from ultralytics import YOLO
import os
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple

class ThreatDetector:
    """
    Main threat detection class for website integration
    """
    
    def __init__(self, model_path: str = "best.pt", confidence_threshold: float = 0.5, verbose: bool = True):
        """
        Initialize the threat detector
        
        Args:
            model_path: Path to the trained YOLO model
            confidence_threshold: Minimum confidence for detections
            verbose: Whether to print status messages
        """
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self.verbose = verbose
        self.model = None
        self.class_names = {}
        self.load_model()
    
    def load_model(self) -> bool:
        """
        Load the YOLO model
        
        Returns:
            bool: True if model loaded successfully, False otherwise
        """
        try:
            if not os.path.exists(self.model_path):
                if self.verbose:
                    print(f"Model file not found: {self.model_path}")
                return False
            
            self.model = YOLO(self.model_path)
            self.class_names = self.model.names
            
            if self.verbose:
                print(f"Threat detector initialized successfully")
                print(f"Model classes: {self.class_names}")
                print(f"Confidence threshold: {self.confidence_threshold}")
            
            return True
            
        except Exception as e:
            if self.verbose:
                print(f"Error loading model: {e}")
            return False
    
    def detect_threats(self, image_path: str) -> Dict:
        """
        Detect threats in an image
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dict: Detection results with threats and metadata
        """
        if not self.model:
            return {
                'success': False,
                'error': 'Model not loaded',
                'threats': [],
                'metadata': {}
            }
        
        try:
            # Check if image exists
            if not os.path.exists(image_path):
                return {
                    'success': False,
                    'error': f'Image file not found: {image_path}',
                    'threats': [],
                    'metadata': {}
                }
            
            # Load image info
            image = cv2.imread(image_path)
            if image is None:
                return {
                    'success': False,
                    'error': f'Could not load image: {image_path}',
                    'threats': [],
                    'metadata': {}
                }
            
            height, width = image.shape[:2]
            
            # Run detection
            results = self.model(image_path, conf=self.confidence_threshold, iou=0.45, verbose=False)
            
            if not results:
                return {
                    'success': False,
                    'error': 'No detection results returned',
                    'threats': [],
                    'metadata': {
                        'image_width': width,
                        'image_height': height,
                        'image_size_kb': os.path.getsize(image_path) / 1024
                    }
                }
            
            result = results[0]
            threats = []
            
            if result.boxes is not None and len(result.boxes) > 0:
                for box in result.boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = box.conf[0].cpu().numpy()
                    class_id = int(box.cls[0].cpu().numpy())
                    class_name = self.class_names[class_id]
                    
                    # Calculate threat level based on confidence
                    threat_level = self._calculate_threat_level(confidence, class_name)
                    
                    threat = {
                        'id': len(threats) + 1,
                        'class': class_name,
                        'class_id': class_id,
                        'confidence': float(confidence),
                        'confidence_percentage': float(confidence * 100),
                        'threat_level': threat_level,
                        'bounding_box': {
                            'x1': float(x1),
                            'y1': float(y1),
                            'x2': float(x2),
                            'y2': float(y2),
                            'width': float(x2 - x1),
                            'height': float(y2 - y1),
                            'center_x': float(x1 + (x2 - x1) / 2),
                            'center_y': float(y1 + (y2 - y1) / 2)
                        },
                        'area_pixels': float((x2 - x1) * (y2 - y1)),
                        'relative_size': float(((x2 - x1) * (y2 - y1)) / (width * height) * 100)
                    }
                    threats.append(threat)
            
            # Calculate overall threat assessment
            overall_threat = self._assess_overall_threat(threats)
            
            return {
                'success': True,
                'threats': threats,
                'threat_count': len(threats),
                'overall_threat_level': overall_threat['level'],
                'overall_threat_score': overall_threat['score'],
                'metadata': {
                    'image_path': image_path,
                    'image_width': width,
                    'image_height': height,
                    'image_size_kb': round(os.path.getsize(image_path) / 1024, 2),
                    'model_used': self.model_path,
                    'confidence_threshold': self.confidence_threshold,
                    'detection_timestamp': self._get_timestamp()
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Detection error: {str(e)}',
                'threats': [],
                'metadata': {}
            }
    
    def _calculate_threat_level(self, confidence: float, class_name: str) -> str:
        """
        Calculate threat level based on confidence and class
        
        Args:
            confidence: Detection confidence (0-1)
            class_name: Detected class name
            
        Returns:
            str: Threat level (LOW, MEDIUM, HIGH, CRITICAL)
        """
        # Define threat priorities for different classes
        threat_priorities = {
            'Mines - v1 2025-05-15 8-03pm': 4,  # Highest priority
            'mayin': 4,  # Mines in different language
            'Submarine': 3,  # High priority
            'auv-rov': 2,  # Medium priority
            'divers': 1   # Lower priority
        }
        
        priority = threat_priorities.get(class_name, 2)
        
        # Calculate threat level based on confidence and priority
        if confidence >= 0.8 and priority >= 3:
            return 'CRITICAL'
        elif confidence >= 0.7 and priority >= 2:
            return 'HIGH'
        elif confidence >= 0.5 and priority >= 1:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _assess_overall_threat(self, threats: List[Dict]) -> Dict:
        """
        Assess overall threat level based on all detections
        
        Args:
            threats: List of detected threats
            
        Returns:
            Dict: Overall threat assessment
        """
        if not threats:
            return {'level': 'NONE', 'score': 0.0}
        
        # Calculate weighted threat score
        total_score = 0.0
        threat_weights = {
            'CRITICAL': 4.0,
            'HIGH': 3.0,
            'MEDIUM': 2.0,
            'LOW': 1.0
        }
        
        for threat in threats:
            weight = threat_weights.get(threat['threat_level'], 1.0)
            total_score += threat['confidence'] * weight
        
        # Normalize score
        max_possible_score = len(threats) * 4.0  # All critical threats
        normalized_score = total_score / max_possible_score if max_possible_score > 0 else 0.0
        
        # Determine overall threat level
        if normalized_score >= 0.8:
            level = 'CRITICAL'
        elif normalized_score >= 0.6:
            level = 'HIGH'
        elif normalized_score >= 0.4:
            level = 'MEDIUM'
        elif normalized_score >= 0.2:
            level = 'LOW'
        else:
            level = 'MINIMAL'
        
        return {
            'level': level,
            'score': round(normalized_score, 3)
        }
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def save_detection_result(self, result: Dict, output_path: str = None) -> str:
        """
        Save detection result as JSON
        
        Args:
            result: Detection result dictionary
            output_path: Path to save the result (optional)
            
        Returns:
            str: Path where result was saved
        """
        if output_path is None:
            timestamp = self._get_timestamp().replace(':', '-').replace(' ', '_')
            output_path = f"threat_detection_result_{timestamp}.json"
        
        try:
            with open(output_path, 'w') as f:
                json.dump(result, f, indent=2)
            
            if self.verbose:
                print(f"Detection result saved: {output_path}")
            return output_path
            
        except Exception as e:
            if self.verbose:
                print(f"Error saving result: {e}")
            return ""
    
    def create_annotated_image(self, image_path: str, result: Dict, output_path: str = None) -> str:
        """
        Create annotated image with threat detections
        
        Args:
            image_path: Path to original image
            result: Detection result dictionary
            output_path: Path to save annotated image (optional)
            
        Returns:
            str: Path where annotated image was saved
        """
        if not result['success'] or not result['threats']:
            return ""
        
        try:
            # Load original image
            image = cv2.imread(image_path)
            if image is None:
                return ""
            
            # Draw bounding boxes and labels
            for threat in result['threats']:
                bbox = threat['bounding_box']
                x1, y1, x2, y2 = int(bbox['x1']), int(bbox['y1']), int(bbox['x2']), int(bbox['y2'])
                
                # Choose color based on threat level
                colors = {
                    'CRITICAL': (0, 0, 255),    # Red
                    'HIGH': (0, 165, 255),      # Orange
                    'MEDIUM': (0, 255, 255),    # Yellow
                    'LOW': (0, 255, 0)          # Green
                }
                color = colors.get(threat['threat_level'], (255, 255, 255))
                
                # Draw bounding box
                cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
                
                # Draw label
                label = f"{threat['class']} {threat['confidence_percentage']:.1f}%"
                label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
                cv2.rectangle(image, (x1, y1 - label_size[1] - 10), (x1 + label_size[0], y1), color, -1)
                cv2.putText(image, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            # Save annotated image
            if output_path is None:
                timestamp = self._get_timestamp().replace(':', '-').replace(' ', '_')
                output_path = f"threat_detection_annotated_{timestamp}.jpg"
            
            cv2.imwrite(output_path, image)
            if self.verbose:
                print(f"Annotated image saved: {output_path}")
            return output_path
            
        except Exception as e:
            if self.verbose:
                print(f"Error creating annotated image: {e}")
            return ""

def main():
    """
    Main function for testing the threat detector
    """
    print("=" * 60)
    print("THREAT DETECTION SYSTEM")
    print("=" * 60)
    
    # Initialize threat detector
    detector = ThreatDetector(confidence_threshold=0.3)  # Lower threshold for better detection
    
    if not detector.model:
        print("❌ Failed to initialize threat detector")
        return
    
    # Find test images
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
    all_files = [f for f in os.listdir('.') if os.path.isfile(f)]
    image_files = [f for f in all_files if any(f.lower().endswith(ext) for ext in image_extensions)]
    
    # Filter out result images and model files
    test_images = [f for f in image_files if not f.startswith('threat_') and 
                   not f.startswith('result_') and not f.startswith('comprehensive_') and 
                   f != 'best.pt']
    
    if not test_images:
        print("❌ No test images found")
        return
    
    print(f"📷 Found {len(test_images)} test image(s)")
    
    # Process each image
    for i, image_path in enumerate(test_images, 1):
        print(f"\n🔍 Processing image {i}: {Path(image_path).name}")
        print("-" * 50)
        
        # Detect threats
        result = detector.detect_threats(image_path)
        
        if result['success']:
            print(f"✅ Detection successful")
            print(f"🎯 Threats found: {result['threat_count']}")
            print(f"⚠️  Overall threat level: {result['overall_threat_level']}")
            print(f"📊 Threat score: {result['overall_threat_score']}")
            
            if result['threats']:
                print(f"\n🚨 DETECTED THREATS:")
                for threat in result['threats']:
                    print(f"   • {threat['class']} - {threat['threat_level']} threat")
                    print(f"     Confidence: {threat['confidence_percentage']:.1f}%")
                    print(f"     Size: {threat['relative_size']:.1f}% of image")
            
            # Save results
            detector.save_detection_result(result)
            detector.create_annotated_image(image_path, result)
            
        else:
            print(f"❌ Detection failed: {result['error']}")
    
    print(f"\n{'='*60}")
    print("THREAT DETECTION COMPLETED")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
