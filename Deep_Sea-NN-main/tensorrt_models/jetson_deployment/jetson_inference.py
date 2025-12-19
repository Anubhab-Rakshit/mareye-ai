#!/usr/bin/env python3
"""
MAR EYE Jetson Inference Script
Optimized for NVIDIA Jetson devices with ONNX Runtime
"""

import numpy as np
import cv2
from PIL import Image
import argparse
import time
import os

try:
    import onnxruntime as ort
    ONNX_AVAILABLE = True
except ImportError:
    ONNX_AVAILABLE = False
    print("Error: ONNX Runtime not available. Install with: pip install onnxruntime")

class MARJetsonInference:
    def __init__(self, model_path):
        """
        Initialize MAR EYE Jetson inference.
        
        Args:
            model_path (str): Path to ONNX model
        """
        if not ONNX_AVAILABLE:
            raise ImportError("ONNX Runtime not available")
        
        self.model_path = model_path
        self.session = None
        self.input_name = None
        self.output_name = None
        
        self._load_model()
    
    def _load_model(self):
        """Load ONNX model for inference."""
        try:
            # Create inference session with optimal providers for Jetson
            providers = ['CPUExecutionProvider']
            
            # Try to add GPU providers if available
            available_providers = ort.get_available_providers()
            
            if 'CUDAExecutionProvider' in available_providers:
                providers.insert(0, 'CUDAExecutionProvider')
                print("CUDA provider available")
            elif 'TensorrtExecutionProvider' in available_providers:
                providers.insert(0, 'TensorrtExecutionProvider')
                print("TensorRT provider available")
            
            self.session = ort.InferenceSession(self.model_path, providers=providers)
            
            # Get input/output names
            self.input_name = self.session.get_inputs()[0].name
            self.output_name = self.session.get_outputs()[0].name
            
            print(f"MAR EYE Jetson model loaded successfully")
            print(f"Input: {self.input_name}")
            print(f"Output: {self.output_name}")
            print(f"Providers: {self.session.get_providers()}")
            
        except Exception as e:
            print(f"Failed to load model: {str(e)}")
            raise
    
    def preprocess_image(self, image_path, target_size=(512, 512)):
        """
        Preprocess image for inference.
        
        Args:
            image_path (str): Path to input image
            target_size (tuple): Target size (width, height)
        
        Returns:
            np.ndarray: Preprocessed image tensor
        """
        # Load image
        if isinstance(image_path, str):
            image = Image.open(image_path)
        else:
            image = image_path
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image
        image = image.resize(target_size, Image.Resampling.LANCZOS)
        
        # Convert to numpy array and normalize
        image_array = np.array(image, dtype=np.float32) / 255.0
        
        # Transpose to CHW format and add batch dimension
        image_tensor = np.transpose(image_array, (2, 0, 1))
        image_tensor = np.expand_dims(image_tensor, axis=0)
        
        return image_tensor
    
    def postprocess_image(self, output_tensor):
        """
        Postprocess model output.
        
        Args:
            output_tensor (np.ndarray): Model output tensor
        
        Returns:
            PIL.Image: Enhanced image
        """
        # Remove batch dimension and transpose to HWC
        output_array = np.squeeze(output_tensor, axis=0)
        output_array = np.transpose(output_array, (1, 2, 0))
        
        # Clamp values to [0, 1] and convert to uint8
        output_array = np.clip(output_array, 0, 1)
        output_array = (output_array * 255).astype(np.uint8)
        
        # Convert to PIL Image
        enhanced_image = Image.fromarray(output_array)
        
        return enhanced_image
    
    def enhance_image(self, image_path, output_path=None):
        """
        Enhance underwater image using ONNX Runtime.
        
        Args:
            image_path (str): Path to input image
            output_path (str): Path to save enhanced image
        
        Returns:
            PIL.Image: Enhanced image
        """
        start_time = time.time()
        
        # Preprocess
        input_tensor = self.preprocess_image(image_path)
        
        # Run inference
        outputs = self.session.run([self.output_name], {self.input_name: input_tensor})
        
        # Postprocess
        enhanced_image = self.postprocess_image(outputs[0])
        
        inference_time = time.time() - start_time
        print(f"Jetson inference time: {inference_time:.3f} seconds")
        
        # Save if output path provided
        if output_path:
            enhanced_image.save(output_path)
            print(f"Enhanced image saved: {output_path}")
        
        return enhanced_image
    
    def enhance_video_frame(self, frame):
        """
        Enhance single video frame.
        
        Args:
            frame (np.ndarray): Video frame
        
        Returns:
            np.ndarray: Enhanced frame
        """
        # Convert OpenCV frame to PIL Image
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(frame_rgb)
        
        # Enhance image
        enhanced_pil = self.enhance_image(pil_image)
        
        # Convert back to OpenCV format
        enhanced_array = np.array(enhanced_pil)
        enhanced_frame = cv2.cvtColor(enhanced_array, cv2.COLOR_RGB2BGR)
        
        return enhanced_frame
    
    def benchmark_performance(self, num_iterations=100):
        """
        Benchmark inference performance.
        
        Args:
            num_iterations (int): Number of benchmark iterations
        
        Returns:
            dict: Benchmark results
        """
        print(f"Benchmarking Jetson performance with {num_iterations} iterations...")
        
        # Create dummy input
        dummy_input = np.random.randn(1, 3, 512, 512).astype(np.float32)
        
        # Warmup
        for _ in range(10):
            self.session.run([self.output_name], {self.input_name: dummy_input})
        
        # Benchmark
        start_time = time.time()
        for _ in range(num_iterations):
            self.session.run([self.output_name], {self.input_name: dummy_input})
        
        total_time = time.time() - start_time
        avg_time = total_time / num_iterations
        
        results = {
            'avg_time_ms': avg_time * 1000,
            'fps': 1.0 / avg_time,
            'total_time': total_time,
            'iterations': num_iterations
        }
        
        print(f"Average inference time: {avg_time*1000:.2f}ms")
        print(f"FPS: {1.0/avg_time:.1f}")
        
        return results

def main():
    """Main function for command line usage."""
    parser = argparse.ArgumentParser(description='MAR EYE Jetson Inference')
    parser.add_argument('--model', required=True, help='Path to ONNX model')
    parser.add_argument('--input', required=True, help='Path to input image')
    parser.add_argument('--output', help='Path to save enhanced image')
    parser.add_argument('--benchmark', action='store_true', help='Run performance benchmark')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.model):
        print(f"Error: Model file not found: {args.model}")
        return
    
    if not os.path.exists(args.input):
        print(f"Error: Input image not found: {args.input}")
        return
    
    try:
        # Initialize inference
        inference = MARJetsonInference(args.model)
        
        # Run benchmark if requested
        if args.benchmark:
            benchmark_results = inference.benchmark_performance()
            print(f"Benchmark results: {benchmark_results}")
        
        # Enhance image
        enhanced_image = inference.enhance_image(args.input, args.output)
        
        print("Image enhancement completed successfully!")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
