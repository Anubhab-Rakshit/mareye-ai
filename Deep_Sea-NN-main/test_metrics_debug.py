#!/usr/bin/env python3
"""
Debug the metrics calculation
"""

import sys
import os

# Add the current directory to Python path
repo_root = os.path.dirname(os.path.abspath(__file__))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

def test_metrics():
    """Test the metrics calculation directly"""
    try:
        from evaluation_metrics import evaluate_image_pair
        
        # Test with the images we know exist
        original_path = "data/test_imgs/WhatsApp Image 2025-10-14 at 23.36.53_e10f093d.jpg"
        enhanced_path = "data/test_output/unetssim/WhatsApp Image 2025-10-14 at 23.36.53_e10f093d.jpg"
        
        print(f"Testing metrics calculation...")
        print(f"Original: {original_path}")
        print(f"Enhanced: {enhanced_path}")
        
        if not os.path.exists(original_path):
            print(f"Original image not found: {original_path}")
            return
            
        if not os.path.exists(enhanced_path):
            print(f"Enhanced image not found: {enhanced_path}")
            return
        
        metrics = evaluate_image_pair(original_path, enhanced_path)
        print(f"Metrics result: {metrics}")
        
        if metrics:
            print(f"PSNR: {metrics.get('PSNR', 'N/A')}")
            print(f"SSIM: {metrics.get('SSIM', 'N/A')}")
            print(f"UIQM Original: {metrics.get('UIQM_original', 'N/A')}")
            print(f"UIQM Enhanced: {metrics.get('UIQM_enhanced', 'N/A')}")
            print(f"UIQM Improvement: {metrics.get('UIQM_improvement', 'N/A')}")
        else:
            print("Metrics calculation failed")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_metrics()
