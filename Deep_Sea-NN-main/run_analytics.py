#!/usr/bin/env python3
"""
Comprehensive Enhancement Analytics Interface
Usage: python run_analytics.py <mode> [options]
"""

import sys
import os
import argparse
from pathlib import Path
from enhancement_analytics import EnhancementAnalytics

def analyze_single_image(original_path, enhanced_path, output_dir=None):
    """
    Analyze a single image pair with comprehensive metrics and visualizations.
    
    Args:
        original_path (str): Path to original image
        enhanced_path (str): Path to enhanced image
        output_dir (str): Output directory for results
    """
    if not os.path.exists(original_path):
        print(f"Error: Original image not found: {original_path}")
        return
    
    if not os.path.exists(enhanced_path):
        print(f"Error: Enhanced image not found: {enhanced_path}")
        return
    
    # Initialize analytics
    analytics = EnhancementAnalytics(output_dir or "analytics_output")
    
    # Get image name
    image_name = os.path.splitext(os.path.basename(original_path))[0]
    
    print(f"Starting comprehensive analysis for: {image_name}")
    print("="*60)
    
    try:
        # Perform analysis
        results = analytics.analyze_single_image(original_path, enhanced_path, image_name)
        
        # Create visualizations
        print("Creating visualizations...")
        plot_files = analytics.create_visualizations(results, save_plots=True)
        
        # Generate detailed reports
        print("Generating detailed reports...")
        json_file, text_file = analytics.generate_detailed_report(results)
        
        print("\n" + "="*60)
        print("ANALYSIS COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"Image: {image_name}")
        print(f"PSNR: {results['basic_metrics']['psnr']:.4f} dB")
        print(f"SSIM: {results['basic_metrics']['ssim']:.4f}")
        print(f"UIQM Improvement: {results['basic_metrics']['uiqm_improvement']:+.4f}")
        print(f"Overall Assessment: {results['quality_assessment']['overall_assessment']}")
        print("\nGenerated Files:")
        print(f"  Visualizations: {len(plot_files)} plots")
        print(f"  Detailed Report (JSON): {json_file}")
        print(f"  Detailed Report (Text): {text_file}")
        print("="*60)
        
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        return

def analyze_batch_images(image_pairs, output_dir=None):
    """
    Analyze multiple image pairs in batch.
    
    Args:
        image_pairs (list): List of (original_path, enhanced_path, name) tuples
        output_dir (str): Output directory for results
    """
    if not image_pairs:
        print("Error: No image pairs provided")
        return
    
    # Initialize analytics
    analytics = EnhancementAnalytics(output_dir or "analytics_output")
    
    print(f"Starting batch analysis for {len(image_pairs)} image pairs")
    print("="*60)
    
    try:
        # Perform batch analysis
        batch_results = analytics.batch_analyze_images(image_pairs, output_dir)
        
        print("\n" + "="*60)
        print("BATCH ANALYSIS COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"Total Images: {batch_results['total_images']}")
        
        # Display summary statistics
        stats = batch_results['summary_statistics']
        print(f"\nSummary Statistics:")
        print(f"  PSNR - Mean: {stats['psnr']['mean']:.4f} dB, Std: {stats['psnr']['std']:.4f}")
        print(f"  SSIM - Mean: {stats['ssim']['mean']:.4f}, Std: {stats['ssim']['std']:.4f}")
        print(f"  UIQM Improvement - Mean: {stats['uiqm_improvement']['mean']:+.4f}, Std: {stats['uiqm_improvement']['std']:.4f}")
        
        # Display comparative analysis
        comp = batch_results['comparative_analysis']
        print(f"\nBest Performers:")
        print(f"  Best PSNR: {comp['best_psnr'][0]} ({comp['best_psnr'][1]:.4f} dB)")
        print(f"  Best SSIM: {comp['best_ssim'][0]} ({comp['best_ssim'][1]:.4f})")
        print(f"  Best UIQM: {comp['best_uiqm'][0]} ({comp['best_uiqm'][1]:+.4f})")
        
        print(f"\nResults saved to: {output_dir or 'analytics_output'}")
        print("="*60)
        
    except Exception as e:
        print(f"Error during batch analysis: {str(e)}")
        return

def analyze_directory_pairs(original_dir, enhanced_dir, output_dir=None):
    """
    Analyze all image pairs in two directories.
    
    Args:
        original_dir (str): Directory containing original images
        enhanced_dir (str): Directory containing enhanced images
        output_dir (str): Output directory for results
    """
    if not os.path.exists(original_dir):
        print(f"Error: Original directory not found: {original_dir}")
        return
    
    if not os.path.exists(enhanced_dir):
        print(f"Error: Enhanced directory not found: {enhanced_dir}")
        return
    
    # Find matching image pairs
    image_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif')
    
    original_files = [f for f in os.listdir(original_dir) 
                     if f.lower().endswith(image_extensions)]
    
    image_pairs = []
    for orig_file in original_files:
        orig_path = os.path.join(original_dir, orig_file)
        enh_path = os.path.join(enhanced_dir, orig_file)
        
        if os.path.exists(enh_path):
            image_name = os.path.splitext(orig_file)[0]
            image_pairs.append((orig_path, enh_path, image_name))
        else:
            print(f"Warning: Enhanced version not found for {orig_file}")
    
    if not image_pairs:
        print("Error: No matching image pairs found")
        return
    
    print(f"Found {len(image_pairs)} matching image pairs")
    analyze_batch_images(image_pairs, output_dir)

def main():
    """Main function for command line interface."""
    parser = argparse.ArgumentParser(
        description='Comprehensive Enhancement Analytics',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Analyze single image pair
  python run_analytics.py single original.jpg enhanced.jpg

  # Analyze single image pair with custom output directory
  python run_analytics.py single original.jpg enhanced.jpg --output my_analysis

  # Analyze all images in directories
  python run_analytics.py directory ./originals ./enhanced

  # Analyze specific image pairs
  python run_analytics.py batch --pairs img1_orig.jpg img1_enh.jpg img1 --pairs img2_orig.jpg img2_enh.jpg img2
        """
    )
    
    subparsers = parser.add_subparsers(dest='mode', help='Analysis mode')
    
    # Single image analysis
    single_parser = subparsers.add_parser('single', help='Analyze single image pair')
    single_parser.add_argument('original', help='Path to original image')
    single_parser.add_argument('enhanced', help='Path to enhanced image')
    single_parser.add_argument('--output', '-o', help='Output directory')
    
    # Directory analysis
    dir_parser = subparsers.add_parser('directory', help='Analyze all images in directories')
    dir_parser.add_argument('original_dir', help='Directory containing original images')
    dir_parser.add_argument('enhanced_dir', help='Directory containing enhanced images')
    dir_parser.add_argument('--output', '-o', help='Output directory')
    
    # Batch analysis
    batch_parser = subparsers.add_parser('batch', help='Analyze specific image pairs')
    batch_parser.add_argument('--pairs', nargs=3, action='append', 
                             metavar=('ORIGINAL', 'ENHANCED', 'NAME'),
                             help='Image pair: original_path enhanced_path name')
    batch_parser.add_argument('--output', '-o', help='Output directory')
    
    args = parser.parse_args()
    
    if not args.mode:
        parser.print_help()
        return
    
    if args.mode == 'single':
        analyze_single_image(args.original, args.enhanced, args.output)
    
    elif args.mode == 'directory':
        analyze_directory_pairs(args.original_dir, args.enhanced_dir, args.output)
    
    elif args.mode == 'batch':
        if not args.pairs:
            print("Error: No image pairs specified. Use --pairs to specify pairs.")
            return
        
        image_pairs = [(pair[0], pair[1], pair[2]) for pair in args.pairs]
        analyze_batch_images(image_pairs, args.output)

if __name__ == "__main__":
    main()
