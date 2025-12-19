import os
import sys
import argparse
from pathlib import Path

# Add the current directory to Python path
repo_root = os.path.dirname(os.path.abspath(__file__))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

from test import run_testing
from evaluation_metrics import evaluate_image_pair, print_evaluation_results
from TRAINING_CONFIG import test_image_path, output_images_path

def run_inference_with_metrics(input_image_path=None, output_dir=None):
    """
    Run inference on images and calculate evaluation metrics.
    
    Args:
        input_image_path (str, optional): Path to specific image to process
        output_dir (str, optional): Directory to save enhanced images
    """
    
    # If specific image is provided, copy it to test directory
    if input_image_path:
        if not os.path.exists(input_image_path):
            print(f"Error: Input image {input_image_path} not found!")
            return
        
        # Clear test directory and copy the specific image
        import shutil
        if os.path.exists(test_image_path):
            shutil.rmtree(test_image_path)
        os.makedirs(test_image_path, exist_ok=True)
        
        # Copy the input image
        image_name = os.path.basename(input_image_path)
        shutil.copy2(input_image_path, os.path.join(test_image_path, image_name))
        print(f"Processing image: {image_name}")
    
    # Run the existing inference
    print("Running CNN model inference...")
    run_testing()
    
    # Calculate metrics for all processed images
    if os.path.exists(output_images_path):
        print("\nCalculating evaluation metrics...")
        
        # Get list of processed images
        processed_images = [f for f in os.listdir(output_images_path) 
                          if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
        
        if not processed_images:
            print("No enhanced images found in output directory.")
            return
        
        # Calculate metrics for each processed image
        for enhanced_image in processed_images:
            # Find corresponding original image
            original_image_path = os.path.join(test_image_path, enhanced_image)
            enhanced_image_path = os.path.join(output_images_path, enhanced_image)
            
            if os.path.exists(original_image_path):
                # Calculate metrics
                results = evaluate_image_pair(original_image_path, enhanced_image_path)
                
                if results:
                    print_evaluation_results(results, enhanced_image, enhanced_image)
                    
                    # Save metrics to file
                    metrics_file = os.path.join(output_images_path, f"{os.path.splitext(enhanced_image)[0]}_metrics.txt")
                    with open(metrics_file, 'w') as f:
                        f.write(f"Image Enhancement Evaluation Results\n")
                        f.write(f"Original: {enhanced_image}\n")
                        f.write(f"Enhanced: {enhanced_image}\n")
                        f.write(f"PSNR: {results['PSNR']:.4f} dB\n")
                        f.write(f"SSIM: {results['SSIM']:.4f}\n")
                        f.write(f"UIQM Original: {results['UIQM_original']:.4f}\n")
                        f.write(f"UIQM Enhanced: {results['UIQM_enhanced']:.4f}\n")
                        f.write(f"UIQM Improvement: {results['UIQM_improvement']:+.4f}\n")
                    
                    print(f"Metrics saved to: {metrics_file}")
                else:
                    print(f"Failed to calculate metrics for {enhanced_image}")
            else:
                print(f"Original image not found for {enhanced_image}")
    else:
        print("Output directory not found.")

def main():
    """
    Main function to handle command line arguments.
    """
    parser = argparse.ArgumentParser(description='Run CNN inference with evaluation metrics')
    parser.add_argument('--input', '-i', type=str, help='Path to input image to process')
    parser.add_argument('--output', '-o', type=str, help='Output directory for enhanced images')
    parser.add_argument('--batch', '-b', action='store_true', help='Process all images in test_imgs directory')
    
    args = parser.parse_args()
    
    if args.input:
        # Process single image
        run_inference_with_metrics(input_image_path=args.input, output_dir=args.output)
    elif args.batch:
        # Process all images in test directory
        run_inference_with_metrics()
    else:
        # Default: process all images in test directory
        print("Processing all images in test_imgs directory...")
        run_inference_with_metrics()

if __name__ == "__main__":
    main()
