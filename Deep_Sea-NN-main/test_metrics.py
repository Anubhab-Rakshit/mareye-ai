import os
import sys
from pathlib import Path

# Add the current directory to Python path
repo_root = os.path.dirname(os.path.abspath(__file__))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

from evaluation_metrics import evaluate_image_pair, print_evaluation_results

def test_existing_images():
    """
    Test evaluation metrics on existing enhanced images.
    """
    test_imgs_dir = "./data/test_imgs/"
    output_dir = "./data/test_output/unetssim/"
    
    if not os.path.exists(test_imgs_dir) or not os.path.exists(output_dir):
        print("Test directories not found. Please run inference first.")
        return
    
    # Get list of images in test directory
    test_images = [f for f in os.listdir(test_imgs_dir) 
                   if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
    
    if not test_images:
        print("No test images found.")
        return
    
    print(f"Found {len(test_images)} test images. Calculating metrics...")
    
    for image_name in test_images:
        original_path = os.path.join(test_imgs_dir, image_name)
        enhanced_path = os.path.join(output_dir, image_name)
        
        if os.path.exists(enhanced_path):
            print(f"\nEvaluating: {image_name}")
            results = evaluate_image_pair(original_path, enhanced_path)
            
            if results:
                print_evaluation_results(results, image_name, image_name)
            else:
                print(f"Failed to calculate metrics for {image_name}")
        else:
            print(f"Enhanced version not found for {image_name}")

if __name__ == "__main__":
    test_existing_images()
