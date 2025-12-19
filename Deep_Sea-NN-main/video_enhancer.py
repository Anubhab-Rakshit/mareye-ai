import os
import cv2
import math
import numpy as np
from PIL import Image
import torch
import torchvision.transforms as transforms
import argparse
import shutil
from pathlib import Path

# Import model and config
from model import Unet
from TRAINING_CONFIG import device, test_model_path
from evaluation_metrics import calculate_psnr, calculate_ssim, calculate_uiqu

class VideoEnhancer:
    def __init__(self, model_path=None):
        """
        Initialize the video enhancer with the trained CNN model.
        
        Args:
            model_path (str): Path to the trained model. If None, uses default from config.
        """
        self.model_path = model_path or test_model_path
        self.device = device
        
        # Load the trained model
        print(f"Loading model from {self.model_path}...")
        self.model = torch.load(self.model_path, weights_only=False, map_location=self.device)
        self.model.eval()
        print("Model loaded successfully!")
        
        # Define image transforms
        self.transform = transforms.Compose([
            transforms.Resize((512, 512)),
            transforms.ToTensor()
        ])
    
    def extract_frames(self, video_path, output_dir):
        """
        Extract frames from video and save them as images.
        
        Args:
            video_path (str): Path to input video
            output_dir (str): Directory to save extracted frames
        
        Returns:
            tuple: (fps, frame_count, frame_paths)
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Open video
        vidcap = cv2.VideoCapture(video_path)
        if not vidcap.isOpened():
            raise ValueError(f"Could not open video: {video_path}")
        
        # Get video properties
        fps = int(math.floor(vidcap.get(cv2.CAP_PROP_FPS)))
        frame_count = int(vidcap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        print(f"Video properties: {fps} FPS, {frame_count} frames")
        
        # Extract frames
        success, frame = vidcap.read()
        count = 0
        frame_paths = []
        
        while success:
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Save frame
            frame_path = os.path.join(output_dir, f"frame_{count:06d}.png")
            cv2.imwrite(frame_path, cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR))
            frame_paths.append(frame_path)
            
            count += 1
            success, frame = vidcap.read()
        
        vidcap.release()
        print(f"Extracted {count} frames to {output_dir}")
        
        return fps, count, frame_paths
    
    def enhance_frame(self, frame_path):
        """
        Enhance a single frame using the CNN model.
        
        Args:
            frame_path (str): Path to the frame image
        
        Returns:
            PIL.Image: Enhanced frame
        """
        # Load and preprocess frame
        frame = Image.open(frame_path)
        if frame.mode != 'RGB':
            frame = frame.convert('RGB')
        
        # Apply transforms and add batch dimension
        input_tensor = self.transform(frame).unsqueeze(0).to(self.device)
        
        # Run inference
        with torch.no_grad():
            enhanced_tensor = self.model(input_tensor)
            enhanced_tensor = torch.clamp(enhanced_tensor, 0, 1)
            
            # Convert back to PIL Image
            enhanced_np = enhanced_tensor.squeeze(0).cpu().numpy()
            enhanced_np = (enhanced_np * 255).astype('uint8')
            enhanced_np = enhanced_np.transpose(1, 2, 0)
            enhanced_image = Image.fromarray(enhanced_np)
        
        return enhanced_image
    
    def enhance_frames(self, frame_paths, enhanced_dir):
        """
        Enhance all frames using the CNN model and calculate metrics.
        
        Args:
            frame_paths (list): List of paths to frame images
            enhanced_dir (str): Directory to save enhanced frames
        
        Returns:
            tuple: (enhanced_paths, metrics_summary)
        """
        os.makedirs(enhanced_dir, exist_ok=True)
        enhanced_paths = []
        
        # Initialize metrics tracking
        psnr_values = []
        ssim_values = []
        uiqm_original_values = []
        uiqm_enhanced_values = []
        
        print(f"Enhancing {len(frame_paths)} frames...")
        
        for i, frame_path in enumerate(frame_paths):
            try:
                # Enhance frame
                enhanced_frame = self.enhance_frame(frame_path)
                
                # Save enhanced frame
                frame_name = os.path.basename(frame_path)
                enhanced_path = os.path.join(enhanced_dir, frame_name)
                enhanced_frame.save(enhanced_path)
                enhanced_paths.append(enhanced_path)
                
                # Calculate metrics for this frame
                try:
                    psnr_val = calculate_psnr(frame_path, enhanced_path)
                    ssim_val = calculate_ssim(frame_path, enhanced_path)
                    uiqm_orig = calculate_uiqu(Image.open(frame_path))
                    uiqm_enh = calculate_uiqu(enhanced_frame)
                    
                    psnr_values.append(psnr_val)
                    ssim_values.append(ssim_val)
                    uiqm_original_values.append(uiqm_orig)
                    uiqm_enhanced_values.append(uiqm_enh)
                    
                except Exception as e:
                    print(f"Warning: Could not calculate metrics for frame {i}: {str(e)}")
                
                # Progress update
                if (i + 1) % 10 == 0 or i == len(frame_paths) - 1:
                    print(f"Processed {i + 1}/{len(frame_paths)} frames")
                    
            except Exception as e:
                print(f"Error processing frame {frame_path}: {str(e)}")
                continue
        
        # Calculate summary metrics
        metrics_summary = {
            'frame_count': len(enhanced_paths),
            'psnr_mean': np.mean(psnr_values) if psnr_values else 0,
            'psnr_std': np.std(psnr_values) if psnr_values else 0,
            'ssim_mean': np.mean(ssim_values) if ssim_values else 0,
            'ssim_std': np.std(ssim_values) if ssim_values else 0,
            'uiqm_original_mean': np.mean(uiqm_original_values) if uiqm_original_values else 0,
            'uiqm_enhanced_mean': np.mean(uiqm_enhanced_values) if uiqm_enhanced_values else 0,
            'uiqm_improvement_mean': np.mean(np.array(uiqm_enhanced_values) - np.array(uiqm_original_values)) if uiqm_enhanced_values and uiqm_original_values else 0,
            'psnr_values': psnr_values,
            'ssim_values': ssim_values,
            'uiqm_original_values': uiqm_original_values,
            'uiqm_enhanced_values': uiqm_enhanced_values
        }
        
        print(f"Enhanced {len(enhanced_paths)} frames saved to {enhanced_dir}")
        return enhanced_paths, metrics_summary
    
    def create_video(self, frame_paths, output_video_path, fps):
        """
        Create video from enhanced frames using OpenCV.
        
        Args:
            frame_paths (list): List of paths to enhanced frames
            output_video_path (str): Path for output video
            fps (int): Frames per second
        """
        if not frame_paths:
            raise ValueError("No frames to create video from")
        
        # Get frame dimensions from first frame
        first_frame = cv2.imread(frame_paths[0])
        height, width, _ = first_frame.shape
        
        # Define codec and create VideoWriter
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))
        
        print(f"Creating video: {output_video_path}")
        print(f"Resolution: {width}x{height}, FPS: {fps}")
        
        # Write frames to video
        for i, frame_path in enumerate(frame_paths):
            frame = cv2.imread(frame_path)
            if frame is not None:
                out.write(frame)
            
            # Progress update
            if (i + 1) % 10 == 0 or i == len(frame_paths) - 1:
                print(f"Writing frame {i + 1}/{len(frame_paths)}")
        
        out.release()
        print(f"Video saved successfully: {output_video_path}")
    
    def print_video_metrics(self, metrics_summary, input_video, output_video):
        """
        Print comprehensive video enhancement metrics.
        
        Args:
            metrics_summary (dict): Metrics summary from enhance_frames
            input_video (str): Path to input video
            output_video (str): Path to output video
        """
        print("\n" + "="*70)
        print("VIDEO ENHANCEMENT EVALUATION RESULTS")
        print("="*70)
        print(f"Input Video: {os.path.basename(input_video)}")
        print(f"Output Video: {os.path.basename(output_video)}")
        print(f"Frames Processed: {metrics_summary['frame_count']}")
        print("-"*70)
        print(f"PSNR (Peak Signal-to-Noise Ratio):")
        print(f"  Mean: {metrics_summary['psnr_mean']:.4f} dB")
        print(f"  Std:  {metrics_summary['psnr_std']:.4f} dB")
        print(f"SSIM (Structural Similarity Index):")
        print(f"  Mean: {metrics_summary['ssim_mean']:.4f}")
        print(f"  Std:  {metrics_summary['ssim_std']:.4f}")
        print(f"UIQM (Underwater Image Quality Measure):")
        print(f"  Original Mean: {metrics_summary['uiqm_original_mean']:.4f}")
        print(f"  Enhanced Mean: {metrics_summary['uiqm_enhanced_mean']:.4f}")
        print(f"  Improvement:   {metrics_summary['uiqm_improvement_mean']:+.4f}")
        print("="*70)
        
        # Interpretation
        print("\nINTERPRETATION:")
        psnr_mean = metrics_summary['psnr_mean']
        ssim_mean = metrics_summary['ssim_mean']
        uiqm_improvement = metrics_summary['uiqm_improvement_mean']
        
        print(f"• PSNR: {'High quality' if psnr_mean > 30 else 'Good quality' if psnr_mean > 20 else 'Low quality'}")
        print(f"• SSIM: {'High similarity' if ssim_mean > 0.8 else 'Moderate similarity' if ssim_mean > 0.6 else 'Low similarity'}")
        print(f"• UIQM: {'Significantly improved' if uiqm_improvement > 50 else 'Improved' if uiqm_improvement > 0 else 'Degraded'}")
        print("="*70)
    
    def save_video_metrics(self, metrics_summary, input_video, output_video, output_dir=None):
        """
        Save video metrics to a text file.
        
        Args:
            metrics_summary (dict): Metrics summary from enhance_frames
            input_video (str): Path to input video
            output_video (str): Path to output video
            output_dir (str): Directory to save metrics file (optional)
        
        Returns:
            str: Path to saved metrics file
        """
        if output_dir is None:
            output_dir = os.path.dirname(output_video)
        
        metrics_file = os.path.join(output_dir, f"{os.path.splitext(os.path.basename(output_video))[0]}_video_metrics.txt")
        
        with open(metrics_file, 'w') as f:
            f.write("VIDEO ENHANCEMENT EVALUATION RESULTS\n")
            f.write("="*50 + "\n")
            f.write(f"Input Video: {os.path.basename(input_video)}\n")
            f.write(f"Output Video: {os.path.basename(output_video)}\n")
            f.write(f"Frames Processed: {metrics_summary['frame_count']}\n")
            f.write("-"*50 + "\n")
            f.write(f"PSNR (Peak Signal-to-Noise Ratio):\n")
            f.write(f"  Mean: {metrics_summary['psnr_mean']:.4f} dB\n")
            f.write(f"  Std:  {metrics_summary['psnr_std']:.4f} dB\n")
            f.write(f"SSIM (Structural Similarity Index):\n")
            f.write(f"  Mean: {metrics_summary['ssim_mean']:.4f}\n")
            f.write(f"  Std:  {metrics_summary['ssim_std']:.4f}\n")
            f.write(f"UIQM (Underwater Image Quality Measure):\n")
            f.write(f"  Original Mean: {metrics_summary['uiqm_original_mean']:.4f}\n")
            f.write(f"  Enhanced Mean: {metrics_summary['uiqm_enhanced_mean']:.4f}\n")
            f.write(f"  Improvement:   {metrics_summary['uiqm_improvement_mean']:+.4f}\n")
            f.write("="*50 + "\n")
            
            # Frame-by-frame metrics
            f.write("\nFRAME-BY-FRAME METRICS:\n")
            f.write("-"*30 + "\n")
            for i in range(len(metrics_summary['psnr_values'])):
                f.write(f"Frame {i+1:3d}: PSNR={metrics_summary['psnr_values'][i]:.2f}dB, "
                       f"SSIM={metrics_summary['ssim_values'][i]:.4f}, "
                       f"UIQM_orig={metrics_summary['uiqm_original_values'][i]:.2f}, "
                       f"UIQM_enh={metrics_summary['uiqm_enhanced_values'][i]:.2f}\n")
        
        print(f"Video metrics saved to: {metrics_file}")
        return metrics_file
    
    def enhance_video(self, input_video_path, output_video_path, cleanup=True, save_metrics=True):
        """
        Complete video enhancement pipeline with metrics calculation.
        
        Args:
            input_video_path (str): Path to input video
            output_video_path (str): Path for enhanced output video
            cleanup (bool): Whether to clean up temporary frame files
            save_metrics (bool): Whether to save metrics to file
        
        Returns:
            dict: Metrics summary
        """
        print("="*60)
        print("UNDERWATER VIDEO ENHANCEMENT PIPELINE")
        print("="*60)
        
        # Create temporary directories
        temp_dir = "temp_video_processing"
        frames_dir = os.path.join(temp_dir, "frames")
        enhanced_dir = os.path.join(temp_dir, "enhanced")
        
        try:
            # Step 1: Extract frames
            print("\nStep 1: Extracting frames from video...")
            fps, frame_count, frame_paths = self.extract_frames(input_video_path, frames_dir)
            
            # Step 2: Enhance frames and calculate metrics
            print("\nStep 2: Enhancing frames with CNN model and calculating metrics...")
            enhanced_paths, metrics_summary = self.enhance_frames(frame_paths, enhanced_dir)
            
            # Step 3: Create enhanced video
            print("\nStep 3: Creating enhanced video...")
            self.create_video(enhanced_paths, output_video_path, fps)
            
            # Step 4: Display and save metrics
            print("\nStep 4: Calculating video enhancement metrics...")
            self.print_video_metrics(metrics_summary, input_video_path, output_video_path)
            
            if save_metrics:
                self.save_video_metrics(metrics_summary, input_video_path, output_video_path)
            
            print("\n" + "="*60)
            print("VIDEO ENHANCEMENT COMPLETED SUCCESSFULLY!")
            print(f"Input: {input_video_path}")
            print(f"Output: {output_video_path}")
            print(f"Frames processed: {len(enhanced_paths)}")
            print("="*60)
            
            return metrics_summary
            
        except Exception as e:
            print(f"Error during video enhancement: {str(e)}")
            raise
        
        finally:
            # Cleanup temporary files
            if cleanup and os.path.exists(temp_dir):
                print(f"\nCleaning up temporary files in {temp_dir}...")
                shutil.rmtree(temp_dir)
                print("Cleanup completed.")

def main():
    """
    Main function for command line usage.
    """
    parser = argparse.ArgumentParser(description='Enhance underwater videos using CNN model')
    parser.add_argument('--input', '-i', required=True, help='Path to input video file')
    parser.add_argument('--output', '-o', required=True, help='Path for enhanced output video')
    parser.add_argument('--model', '-m', help='Path to trained model (optional)')
    parser.add_argument('--keep-frames', action='store_true', help='Keep temporary frame files')
    
    args = parser.parse_args()
    
    # Validate input file
    if not os.path.exists(args.input):
        print(f"Error: Input video file not found: {args.input}")
        return
    
    # Create output directory if needed
    output_dir = os.path.dirname(args.output)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
    
    try:
        # Initialize video enhancer
        enhancer = VideoEnhancer(model_path=args.model)
        
        # Enhance video
        enhancer.enhance_video(
            input_video_path=args.input,
            output_video_path=args.output,
            cleanup=not args.keep_frames
        )
        
    except Exception as e:
        print(f"Video enhancement failed: {str(e)}")
        return

if __name__ == "__main__":
    main()
