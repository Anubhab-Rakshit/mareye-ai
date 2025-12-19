#!/usr/bin/env python3
"""
MAR EYE Edge Deployment Script
Complete pipeline for deploying MAR EYE to edge devices (AUVs, ROVs, Jetson devices)
"""

import os
import argparse
import time
import json
import shutil
from pathlib import Path
import subprocess
import sys

# Import our modules
from onnx_export import ONNXExporter
from tensorrt_optimization_simple import SimpleTensorRTOptimizer

class MAREdgeDeployment:
    def __init__(self, model_path=None, output_dir="edge_deployment"):
        """
        Initialize MAR EYE edge deployment.
        
        Args:
            model_path (str): Path to trained model
            output_dir (str): Output directory for deployment packages
        """
        self.model_path = model_path
        self.output_dir = output_dir
        self.deployment_info = {}
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        print("MAR EYE Edge Deployment System")
        print("=" * 50)
        print(f"Model: {model_path or 'Default from config'}")
        print(f"Output: {output_dir}")
    
    def deploy_to_edge_devices(self, target_devices=None, run_benchmarks=True):
        """
        Deploy MAR EYE to multiple edge device types.
        
        Args:
            target_devices (list): List of target devices ['jetson', 'generic', 'all']
            run_benchmarks (bool): Whether to run performance benchmarks
        
        Returns:
            dict: Deployment results
        """
        if target_devices is None:
            target_devices = ['jetson', 'generic']
        
        if 'all' in target_devices:
            target_devices = ['jetson', 'generic']
        
        print(f"\n🚀 Starting deployment to: {', '.join(target_devices)}")
        
        deployment_results = {}
        
        # Step 1: Export to ONNX
        print(f"\n{'='*50}")
        print("STEP 1: ONNX EXPORT")
        print(f"{'='*50}")
        
        try:
            onnx_exporter = ONNXExporter(self.model_path, 
                                       output_dir=os.path.join(self.output_dir, "onnx_models"))
            onnx_models = onnx_exporter.export_multiple_formats()
            deployment_results['onnx_models'] = onnx_models
            print("✅ ONNX export completed")
        except Exception as e:
            print(f"❌ ONNX export failed: {e}")
            return deployment_results
        
        # Step 2: Deploy to different device types
        for device_type in target_devices:
            print(f"\n{'='*50}")
            print(f"STEP 2: {device_type.upper()} DEPLOYMENT")
            print(f"{'='*50}")
            
            try:
                if device_type == 'jetson':
                    result = self._deploy_to_jetson(onnx_models, run_benchmarks)
                elif device_type == 'generic':
                    result = self._deploy_to_generic(onnx_models)
                else:
                    print(f"⚠️ Unknown device type: {device_type}")
                    continue
                
                deployment_results[device_type] = result
                print(f"✅ {device_type} deployment completed")
                
            except Exception as e:
                print(f"❌ {device_type} deployment failed: {e}")
                deployment_results[device_type] = {'error': str(e)}
        
        # Step 3: Create deployment summary
        self._create_deployment_summary(deployment_results)
        
        return deployment_results
    
    def _deploy_to_jetson(self, onnx_models, run_benchmarks=True):
        """Deploy to NVIDIA Jetson devices."""
        print("Deploying to NVIDIA Jetson devices...")
        
        # Use optimized ONNX model for TensorRT
        onnx_model_path = onnx_models.get('optimized')
        if not onnx_model_path or not os.path.exists(onnx_model_path):
            onnx_model_path = onnx_models.get('standard')
        
        if not onnx_model_path or not os.path.exists(onnx_model_path):
            raise RuntimeError("No suitable ONNX model found for Jetson deployment")
        
        # Initialize TensorRT optimizer
        tensorrt_dir = os.path.join(self.output_dir, "jetson_deployment")
        optimizer = SimpleTensorRTOptimizer(onnx_model_path, tensorrt_dir)
        
        # Run benchmarks if requested
        benchmark_results = None
        if run_benchmarks:
            print("Running Jetson benchmarks...")
            benchmark_results = optimizer.benchmark_onnx_performance()
        
        # Create deployment package
        package_dir = optimizer.create_jetson_deployment_package(benchmark_results)
        
        return {
            'benchmark_results': benchmark_results,
            'package_dir': package_dir,
            'device_type': 'jetson',
            'target_platforms': [
                'NVIDIA Jetson Xavier NX',
                'NVIDIA Jetson Xavier AGX', 
                'NVIDIA Jetson Orin Nano',
                'NVIDIA Jetson Orin NX',
                'NVIDIA Jetson Orin AGX'
            ]
        }
    
    def _deploy_to_generic(self, onnx_models):
        """Deploy to generic edge devices."""
        print("Deploying to generic edge devices...")
        
        # Use standard ONNX model for generic deployment
        onnx_model_path = onnx_models.get('standard')
        if not onnx_model_path or not os.path.exists(onnx_model_path):
            onnx_model_path = onnx_models.get('dynamic')
        
        if not onnx_model_path or not os.path.exists(onnx_model_path):
            raise RuntimeError("No suitable ONNX model found for generic deployment")
        
        # Create generic deployment package
        package_dir = os.path.join(self.output_dir, "generic_deployment")
        os.makedirs(package_dir, exist_ok=True)
        
        # Copy ONNX model
        model_filename = os.path.basename(onnx_model_path)
        package_model_path = os.path.join(package_dir, model_filename)
        shutil.copy2(onnx_model_path, package_model_path)
        
        # Create generic inference script
        generic_script = self._create_generic_inference_script(package_model_path)
        script_path = os.path.join(package_dir, "generic_inference.py")
        with open(script_path, 'w') as f:
            f.write(generic_script)
        
        # Create requirements file
        requirements = self._create_generic_requirements()
        req_path = os.path.join(package_dir, "requirements.txt")
        with open(req_path, 'w') as f:
            f.write(requirements)
        
        # Create README
        readme = self._create_generic_readme()
        readme_path = os.path.join(package_dir, "README.md")
        with open(readme_path, 'w') as f:
            f.write(readme)
        
        return {
            'onnx_model': package_model_path,
            'package_dir': package_dir,
            'device_type': 'generic',
            'target_platforms': [
                'Intel NUC',
                'Raspberry Pi 4+',
                'ARM64 devices',
                'x86_64 devices',
                'AUV/ROV computers'
            ]
        }
    
    def _create_generic_inference_script(self, onnx_model_path):
        """Create inference script for generic edge devices."""
        return f'''#!/usr/bin/env python3
"""
MAR EYE Generic Edge Device Inference
Compatible with various edge computing platforms
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

class MARGenericInference:
    def __init__(self, model_path):
        """
        Initialize MAR EYE generic inference.
        
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
            # Create inference session with optimal providers
            providers = ['CPUExecutionProvider']
            
            # Try to add GPU providers if available
            available_providers = ort.get_available_providers()
            
            if 'CUDAExecutionProvider' in available_providers:
                providers.insert(0, 'CUDAExecutionProvider')
                print("CUDA provider available")
            elif 'DmlExecutionProvider' in available_providers:
                providers.insert(0, 'DmlExecutionProvider')
                print("DirectML provider available")
            elif 'OpenVINOExecutionProvider' in available_providers:
                providers.insert(0, 'OpenVINOExecutionProvider')
                print("OpenVINO provider available")
            
            self.session = ort.InferenceSession(self.model_path, providers=providers)
            
            # Get input/output names
            self.input_name = self.session.get_inputs()[0].name
            self.output_name = self.session.get_outputs()[0].name
            
            print(f"✅ MAR EYE model loaded successfully")
            print(f"Input: {{self.input_name}}")
            print(f"Output: {{self.output_name}}")
            print(f"Providers: {{self.session.get_providers()}}")
            
        except Exception as e:
            print(f"❌ Failed to load model: {{str(e)}}")
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
        Enhance underwater image.
        
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
        outputs = self.session.run([self.output_name], {{self.input_name: input_tensor}})
        
        # Postprocess
        enhanced_image = self.postprocess_image(outputs[0])
        
        inference_time = time.time() - start_time
        print(f"Inference time: {{inference_time:.3f}} seconds")
        
        # Save if output path provided
        if output_path:
            enhanced_image.save(output_path)
            print(f"Enhanced image saved: {{output_path}}")
        
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
        print(f"Benchmarking performance with {{num_iterations}} iterations...")
        
        # Create dummy input
        dummy_input = np.random.randn(1, 3, 512, 512).astype(np.float32)
        
        # Warmup
        for _ in range(10):
            self.session.run([self.output_name], {{self.input_name: dummy_input}})
        
        # Benchmark
        start_time = time.time()
        for _ in range(num_iterations):
            self.session.run([self.output_name], {{self.input_name: dummy_input}})
        
        total_time = time.time() - start_time
        avg_time = total_time / num_iterations
        
        results = {{
            'avg_time_ms': avg_time * 1000,
            'fps': 1.0 / avg_time,
            'total_time': total_time,
            'iterations': num_iterations
        }}
        
        print(f"Average inference time: {{avg_time*1000:.2f}}ms")
        print(f"FPS: {{1.0/avg_time:.1f}}")
        
        return results

def main():
    """Main function for command line usage."""
    parser = argparse.ArgumentParser(description='MAR EYE Generic Edge Inference')
    parser.add_argument('--model', required=True, help='Path to ONNX model')
    parser.add_argument('--input', required=True, help='Path to input image')
    parser.add_argument('--output', help='Path to save enhanced image')
    parser.add_argument('--benchmark', action='store_true', help='Run performance benchmark')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.model):
        print(f"Error: Model file not found: {{args.model}}")
        return
    
    if not os.path.exists(args.input):
        print(f"Error: Input image not found: {{args.input}}")
        return
    
    try:
        # Initialize inference
        inference = MARGenericInference(args.model)
        
        # Run benchmark if requested
        if args.benchmark:
            benchmark_results = inference.benchmark_performance()
            print(f"Benchmark results: {{benchmark_results}}")
        
        # Enhance image
        enhanced_image = inference.enhance_image(args.input, args.output)
        
        print("✅ Image enhancement completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {{str(e)}}")

if __name__ == "__main__":
    main()
'''
    
    def _create_generic_requirements(self):
        """Create requirements file for generic deployment."""
        return '''# MAR EYE Generic Edge Device Requirements
# Core dependencies
numpy>=1.21.0
opencv-python>=4.5.0
Pillow>=8.0.0
onnxruntime>=1.12.0

# Optional GPU acceleration (choose one based on your hardware)
# onnxruntime-gpu>=1.12.0  # For NVIDIA GPUs
# onnxruntime-openvino>=1.12.0  # For Intel hardware

# For video processing
# opencv-contrib-python>=4.5.0  # Uncomment for additional OpenCV features
'''
    
    def _create_generic_readme(self):
        """Create README for generic deployment."""
        return '''# MAR EYE Generic Edge Device Deployment

## Overview
This package contains MAR EYE underwater image enhancement model optimized for generic edge computing platforms.

## Files
- `mareye_*.onnx` - ONNX model
- `generic_inference.py` - Inference script for edge devices
- `requirements.txt` - Python dependencies
- `README.md` - This file

## Installation
```bash
pip install -r requirements.txt
```

## Usage

### Single Image Enhancement
```bash
python generic_inference.py --model mareye_standard.onnx --input image.jpg --output enhanced.jpg
```

### Performance Benchmark
```bash
python generic_inference.py --model mareye_standard.onnx --input image.jpg --benchmark
```

### Python API
```python
from generic_inference import MARGenericInference

# Initialize
inference = MARGenericInference("mareye_standard.onnx")

# Enhance image
enhanced = inference.enhance_image("input.jpg", "output.jpg")

# Enhance video frame
enhanced_frame = inference.enhance_video_frame(frame)

# Benchmark performance
results = inference.benchmark_performance()
```

## Performance
- **Inference Time**: ~50-500ms per frame (depending on hardware)
- **Memory Usage**: ~100-500MB (depending on model size)
- **Supported Platforms**: Intel NUC, Raspberry Pi 4+, ARM64 devices, x86_64 devices

## Hardware Requirements
- **CPU**: ARM64 or x86_64
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 500MB for model and dependencies
- **GPU**: Optional (CUDA, DirectML, or OpenVINO compatible)

## Troubleshooting
1. **ONNX Runtime not found**: Install with `pip install onnxruntime`
2. **GPU errors**: Install appropriate GPU provider (onnxruntime-gpu, onnxruntime-openvino)
3. **Memory issues**: Reduce batch size or use smaller model variant
4. **Performance issues**: Enable GPU acceleration if available
'''
    
    def _create_deployment_summary(self, deployment_results):
        """Create comprehensive deployment summary."""
        summary_path = os.path.join(self.output_dir, "deployment_summary.json")
        
        # Add metadata
        summary = {
            'deployment_date': time.strftime('%Y-%m-%d %H:%M:%S'),
            'model_path': self.model_path,
            'output_directory': self.output_dir,
            'deployment_results': deployment_results
        }
        
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        # Create human-readable report
        report_path = os.path.join(self.output_dir, "deployment_report.txt")
        with open(report_path, 'w') as f:
            f.write("MAR EYE Edge Deployment Report\n")
            f.write("=" * 50 + "\n\n")
            
            f.write(f"Deployment Date: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Model: {self.model_path or 'Default from config'}\n")
            f.write(f"Output Directory: {self.output_dir}\n\n")
            
            # ONNX Models
            if 'onnx_models' in deployment_results:
                f.write("ONNX Models:\n")
                f.write("-" * 15 + "\n")
                for format_name, model_path in deployment_results['onnx_models'].items():
                    if os.path.exists(model_path):
                        size_mb = os.path.getsize(model_path) / (1024 * 1024)
                        f.write(f"  {format_name.upper()}: {model_path} ({size_mb:.1f} MB)\n")
                f.write("\n")
            
            # Device Deployments
            for device_type, result in deployment_results.items():
                if device_type == 'onnx_models':
                    continue
                
                f.write(f"{device_type.upper()} Deployment:\n")
                f.write("-" * (len(device_type) + 12) + "\n")
                
                if 'error' in result:
                    f.write(f"  Status: FAILED - {result['error']}\n")
                else:
                    f.write(f"  Status: SUCCESS\n")
                    f.write(f"  Package: {result.get('package_dir', 'N/A')}\n")
                    
                    if 'target_platforms' in result:
                        f.write(f"  Target Platforms:\n")
                        for platform in result['target_platforms']:
                            f.write(f"    - {platform}\n")
                    
                    if 'benchmark_results' in result and result['benchmark_results']:
                        f.write(f"  Performance:\n")
                        for model_name, perf in result['benchmark_results'].items():
                            if 'avg_time_ms' in perf:
                                f.write(f"    {model_name}: {perf['avg_time_ms']:.1f}ms ({perf['fps']:.1f} FPS)\n")
                
                f.write("\n")
            
            f.write("Deployment Instructions:\n")
            f.write("-" * 25 + "\n")
            f.write("1. Choose appropriate deployment package based on target device\n")
            f.write("2. Copy package to target device\n")
            f.write("3. Install requirements: pip install -r requirements.txt\n")
            f.write("4. Run inference with provided scripts\n")
            f.write("5. For Jetson devices, use TensorRT engines for best performance\n")
            f.write("6. For generic devices, use ONNX models with ONNX Runtime\n")
        
        print(f"✅ Deployment summary created: {summary_path}")
        print(f"✅ Deployment report created: {report_path}")
    
    def create_docker_deployment(self):
        """Create Docker deployment for containerized edge deployment."""
        print(f"\n{'='*50}")
        print("CREATING DOCKER DEPLOYMENT")
        print(f"{'='*50}")
        
        docker_dir = os.path.join(self.output_dir, "docker_deployment")
        os.makedirs(docker_dir, exist_ok=True)
        
        # Create Dockerfile
        dockerfile = self._create_dockerfile()
        dockerfile_path = os.path.join(docker_dir, "Dockerfile")
        with open(dockerfile_path, 'w') as f:
            f.write(dockerfile)
        
        # Create docker-compose.yml
        compose_file = self._create_docker_compose()
        compose_path = os.path.join(docker_dir, "docker-compose.yml")
        with open(compose_path, 'w') as f:
            f.write(compose_file)
        
        # Create entrypoint script
        entrypoint = self._create_docker_entrypoint()
        entrypoint_path = os.path.join(docker_dir, "entrypoint.sh")
        with open(entrypoint_path, 'w') as f:
            f.write(entrypoint)
        
        # Copy ONNX model
        onnx_models = self.deployment_info.get('onnx_models', {})
        if onnx_models:
            standard_model = onnx_models.get('standard')
            if standard_model and os.path.exists(standard_model):
                shutil.copy2(standard_model, os.path.join(docker_dir, "mareye_model.onnx"))
        
        print(f"✅ Docker deployment created: {docker_dir}")
        return docker_dir
    
    def _create_dockerfile(self):
        """Create Dockerfile for containerized deployment."""
        return '''# MAR EYE Docker Deployment
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    libglib2.0-0 \\
    libsm6 \\
    libxext6 \\
    libxrender-dev \\
    libgomp1 \\
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Expose port for web interface (if needed)
EXPOSE 8080

# Set entrypoint
ENTRYPOINT ["./entrypoint.sh"]

# Default command
CMD ["python", "generic_inference.py", "--model", "mareye_model.onnx", "--input", "/data/input.jpg", "--output", "/data/output.jpg"]
'''
    
    def _create_docker_compose(self):
        """Create docker-compose.yml for easy deployment."""
        return '''version: '3.8'

services:
  mareye:
    build: .
    container_name: mareye-edge
    volumes:
      - ./data:/data
      - ./logs:/app/logs
    ports:
      - "8080:8080"
    environment:
      - MODEL_PATH=/app/mareye_model.onnx
      - INPUT_DIR=/data/input
      - OUTPUT_DIR=/data/output
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
'''
    
    def _create_docker_entrypoint(self):
        """Create entrypoint script for Docker container."""
        return '''#!/bin/bash

# MAR EYE Docker Entrypoint
echo "Starting MAR EYE Edge Deployment..."

# Create necessary directories
mkdir -p /data/input /data/output /app/logs

# Check if model exists
if [ ! -f "$MODEL_PATH" ]; then
    echo "Error: Model file not found at $MODEL_PATH"
    exit 1
fi

# Run the application
exec "$@"
'''

def main():
    """Main function for command line usage."""
    parser = argparse.ArgumentParser(description='MAR EYE Edge Deployment')
    parser.add_argument('--model', help='Path to trained model (optional)')
    parser.add_argument('--output', default='edge_deployment', help='Output directory')
    parser.add_argument('--devices', nargs='+', choices=['jetson', 'generic', 'all'], 
                       default=['jetson', 'generic'], help='Target devices')
    parser.add_argument('--benchmark', action='store_true', help='Run benchmarks')
    parser.add_argument('--docker', action='store_true', help='Create Docker deployment')
    
    args = parser.parse_args()
    
    try:
        # Initialize deployment
        deployment = MAREdgeDeployment(model_path=args.model, output_dir=args.output)
        
        # Deploy to edge devices
        results = deployment.deploy_to_edge_devices(
            target_devices=args.devices,
            run_benchmarks=args.benchmark
        )
        
        # Create Docker deployment if requested
        if args.docker:
            deployment.create_docker_deployment()
        
        print(f"\n{'='*50}")
        print("DEPLOYMENT COMPLETED SUCCESSFULLY!")
        print(f"{'='*50}")
        print(f"Output directory: {args.output}")
        print(f"Deployment summary: {os.path.join(args.output, 'deployment_summary.json')}")
        print(f"Deployment report: {os.path.join(args.output, 'deployment_report.txt')}")
        
        # Print quick summary
        print(f"\nQuick Summary:")
        for device_type, result in results.items():
            if device_type == 'onnx_models':
                continue
            if 'error' in result:
                print(f"  {device_type.upper()}: ❌ FAILED")
            else:
                print(f"  {device_type.upper()}: ✅ SUCCESS")
        
    except Exception as e:
        print(f"❌ Deployment failed: {str(e)}")
        return

if __name__ == "__main__":
    main()
