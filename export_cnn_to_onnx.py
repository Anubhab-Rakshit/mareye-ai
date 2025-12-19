#!/usr/bin/env python3
"""
Export CNN PyTorch models to ONNX format for Jetson deployment
This script converts the trained U-Net models to ONNX format for optimized inference
"""

import os
import sys
import torch
import torch.onnx
import numpy as np
from pathlib import Path
import argparse
import json
from datetime import datetime

# Fix Windows console encoding for emojis
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
    sys.stderr = codecs.getwriter("utf-8")(sys.stderr.detach())

# Add the Deep_Sea-NN-main directory to Python path
script_dir = os.path.dirname(os.path.abspath(__file__))
cnn_dir = os.path.join(script_dir, 'Deep_Sea-NN-main')
sys.path.insert(0, cnn_dir)

# Import the model architecture
from model import Unet

class CNNToONNXExporter:
    def __init__(self, cnn_dir=None):
        """Initialize the exporter"""
        if cnn_dir is None:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            cnn_dir = os.path.join(script_dir, 'Deep_Sea-NN-main')
        self.cnn_dir = cnn_dir
        self.snapshots_dir = os.path.join(cnn_dir, "snapshots", "unetSSIM")
        self.onnx_dir = os.path.join(cnn_dir, "onnx_models")
        
        # Create ONNX directory if it doesn't exist
        os.makedirs(self.onnx_dir, exist_ok=True)
        
        # Device selection
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        
    def find_model_files(self):
        """Find all available model checkpoint files"""
        model_files = []
        
        if os.path.exists(self.snapshots_dir):
            for file in os.listdir(self.snapshots_dir):
                if file.endswith('.ckpt'):
                    model_path = os.path.join(self.snapshots_dir, file)
                    model_files.append(model_path)
                    print(f"Found model: {file}")
        
        return model_files
    
    def load_pytorch_model(self, model_path):
        """Load PyTorch model from checkpoint"""
        print(f"Loading PyTorch model from: {model_path}")
        
        try:
            # Load the checkpoint
            checkpoint = torch.load(model_path, map_location=self.device, weights_only=False)
            
            # Create model instance
            model = Unet(in_channels=3, out_channels=3, init_features=32)
            
            # Handle different checkpoint formats
            if isinstance(checkpoint, dict):
                if 'state_dict' in checkpoint:
                    state_dict = checkpoint['state_dict']
                elif 'model_state_dict' in checkpoint:
                    state_dict = checkpoint['model_state_dict']
                else:
                    # Assume it's a state dict directly
                    state_dict = checkpoint
                
                # Load state dict
                model.load_state_dict(state_dict)
            else:
                # The checkpoint is the model object itself
                model = checkpoint
            
            model.to(self.device)
            model.eval()
            
            print(f"[OK] Model loaded successfully from {model_path}")
            return model
            
        except Exception as e:
            print(f"[ERROR] Error loading model from {model_path}: {e}")
            return None
    
    def export_to_onnx(self, model, model_path, input_size=(512, 512)):
        """Export PyTorch model to ONNX format"""
        model_name = os.path.basename(model_path).replace('.ckpt', '')
        onnx_path = os.path.join(self.onnx_dir, f"{model_name}.onnx")
        
        print(f"Exporting model to ONNX: {onnx_path}")
        
        try:
            # Create dummy input tensor
            dummy_input = torch.randn(1, 3, input_size[0], input_size[1]).to(self.device)
            
            # Export to ONNX
            torch.onnx.export(
                model,                          # Model to export
                dummy_input,                    # Dummy input
                onnx_path,                      # Output path
                export_params=True,             # Store trained parameters
                opset_version=11,               # ONNX opset version
                do_constant_folding=True,       # Optimize constant folding
                input_names=['input'],          # Input tensor name
                output_names=['output'],        # Output tensor name
                dynamic_axes={                  # Dynamic axes for batch size
                    'input': {0: 'batch_size'},
                    'output': {0: 'batch_size'}
                },
                verbose=False
            )
            
            # Verify the exported model
            if os.path.exists(onnx_path):
                file_size = os.path.getsize(onnx_path) / (1024 * 1024)  # Size in MB
                print(f"[OK] ONNX model exported successfully!")
                print(f"   Path: {onnx_path}")
                print(f"   Size: {file_size:.2f} MB")
                print(f"   Input size: {input_size}")
                
                return onnx_path, file_size
            else:
                print(f"[ERROR] ONNX export failed - file not created")
                return None, 0
                
        except Exception as e:
            print(f"[ERROR] Error exporting to ONNX: {e}")
            return None, 0
    
    def test_onnx_model(self, onnx_path, input_size=(512, 512)):
        """Test the exported ONNX model"""
        try:
            import onnxruntime as ort
            
            print(f"Testing ONNX model: {onnx_path}")
            
            # Create ONNX runtime session
            session = ort.InferenceSession(onnx_path)
            
            # Get input and output names
            input_name = session.get_inputs()[0].name
            output_name = session.get_outputs()[0].name
            
            # Create test input
            test_input = np.random.randn(1, 3, input_size[0], input_size[1]).astype(np.float32)
            
            # Run inference
            outputs = session.run([output_name], {input_name: test_input})
            output = outputs[0]
            
            print(f"[OK] ONNX model test successful!")
            print(f"   Input shape: {test_input.shape}")
            print(f"   Output shape: {output.shape}")
            print(f"   Input name: {input_name}")
            print(f"   Output name: {output_name}")
            
            return True
            
        except ImportError:
            print("[WARNING] ONNX Runtime not available - skipping test")
            return False
        except Exception as e:
            print(f"[ERROR] ONNX model test failed: {e}")
            return False
    
    def export_all_models(self, input_size=(512, 512), test_models=True):
        """Export all available models to ONNX"""
        print("[START] Starting CNN to ONNX export process...")
        print("=" * 60)
        
        # Find all model files
        model_files = self.find_model_files()
        
        if not model_files:
            print("[ERROR] No model files found!")
            return []
        
        exported_models = []
        
        for model_path in model_files:
            print(f"\n[PROCESSING] Processing: {os.path.basename(model_path)}")
            print("-" * 40)
            
            # Load PyTorch model
            model = self.load_pytorch_model(model_path)
            if model is None:
                continue
            
            # Export to ONNX
            onnx_path, file_size = self.export_to_onnx(model, model_path, input_size)
            if onnx_path is None:
                continue
            
            # Test ONNX model
            test_success = False
            if test_models:
                test_success = self.test_onnx_model(onnx_path, input_size)
            
            # Store export info
            export_info = {
                'pytorch_path': model_path,
                'onnx_path': onnx_path,
                'model_name': os.path.basename(model_path).replace('.ckpt', ''),
                'file_size_mb': file_size,
                'input_size': input_size,
                'test_success': test_success,
                'export_time': datetime.now().isoformat()
            }
            
            exported_models.append(export_info)
            
            # Clean up model from memory
            del model
            torch.cuda.empty_cache() if torch.cuda.is_available() else None
        
        return exported_models
    
    def generate_export_report(self, exported_models):
        """Generate a detailed export report"""
        report_path = os.path.join(self.onnx_dir, "export_report.json")
        
        report = {
            'export_timestamp': datetime.now().isoformat(),
            'total_models_exported': len(exported_models),
            'models': exported_models,
            'summary': {
                'total_size_mb': sum(model['file_size_mb'] for model in exported_models),
                'successful_tests': sum(1 for model in exported_models if model['test_success']),
                'input_size': exported_models[0]['input_size'] if exported_models else None
            }
        }
        
        # Save report
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n[REPORT] Export report saved: {report_path}")
        return report
    
    def print_summary(self, exported_models):
        """Print export summary"""
        print("\n" + "=" * 60)
        print("EXPORT SUMMARY")
        print("=" * 60)
        
        if not exported_models:
            print("[ERROR] No models were exported successfully")
            return
        
        print(f"[OK] Successfully exported {len(exported_models)} model(s)")
        print(f"ONNX models saved in: {self.onnx_dir}")
        
        total_size = sum(model['file_size_mb'] for model in exported_models)
        print(f"Total size: {total_size:.2f} MB")
        
        print(f"\nExported Models:")
        for i, model in enumerate(exported_models, 1):
            status = "[OK]" if model['test_success'] else "[WARNING]"
            print(f"   {i}. {model['model_name']}.onnx")
            print(f"      Size: {model['file_size_mb']:.2f} MB")
            print(f"      Test: {status}")
        
        print(f"\nNext Steps:")
        print(f"   1. Update Jetson API to use these ONNX models")
        print(f"   2. Test image/video enhancement with Jetson webpage")
        print(f"   3. Deploy to NVIDIA Jetson devices")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Export CNN PyTorch models to ONNX format')
    parser.add_argument('--input-size', type=int, nargs=2, default=[512, 512],
                       help='Input image size (width height)')
    parser.add_argument('--skip-test', action='store_true',
                       help='Skip ONNX model testing')
    parser.add_argument('--cnn-dir', default='Deep_Sea-NN-main',
                       help='CNN directory path')
    
    args = parser.parse_args()
    
    # Create exporter
    exporter = CNNToONNXExporter(args.cnn_dir)
    
    # Export all models
    exported_models = exporter.export_all_models(
        input_size=tuple(args.input_size),
        test_models=not args.skip_test
    )
    
    # Generate report
    if exported_models:
        exporter.generate_export_report(exported_models)
    
    # Print summary
    exporter.print_summary(exported_models)
    
    return len(exported_models) > 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
