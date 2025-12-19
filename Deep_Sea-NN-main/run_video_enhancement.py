#!/usr/bin/env python3
"""
Simple script to run video enhancement with the CNN model.
Usage: python run_video_enhancement.py input_video.mp4 output_video.mp4
"""

import sys
import os
from video_enhancer import VideoEnhancer

def main():
    if len(sys.argv) != 3:
        print("Usage: python run_video_enhancement.py <input_video> <output_video>")
        print("Example: python run_video_enhancement.py underwater_video.mp4 enhanced_video.mp4")
        return
    
    input_video = sys.argv[1]
    output_video = sys.argv[2]
    
    # Check if input video exists
    if not os.path.exists(input_video):
        print(f"Error: Input video '{input_video}' not found!")
        return
    
    try:
        print("Initializing video enhancer...")
        enhancer = VideoEnhancer()
        
        print(f"Enhancing video: {input_video}")
        print(f"Output will be saved as: {output_video}")
        
        metrics = enhancer.enhance_video(input_video, output_video)
        
        print(f"\n✅ Video enhancement completed!")
        print(f"Enhanced video saved as: {output_video}")
        print(f"Metrics calculated for {metrics['frame_count']} frames")
        print(f"Average PSNR: {metrics['psnr_mean']:.2f} dB")
        print(f"Average SSIM: {metrics['ssim_mean']:.4f}")
        print(f"UIQM Improvement: {metrics['uiqm_improvement_mean']:+.2f}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return

if __name__ == "__main__":
    main()
