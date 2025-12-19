# MAR EYE
### AI-Powered Underwater Image Enhancement and Edge Deployment System

> *"The shore is an ancient world… Yet it is a world that keeps alive the sense of continuing creation and of the relentless drive of life."*
> from **The Edge of the Sea** by Rachel Carson

MAR EYE is an AI-powered underwater image enhancement system designed to support maritime security and defense operations. It provides an end-to-end vision pipeline that captures underwater images or live video, enhances them using deep learning models to restore clarity, correct color distortion, and reduce haze, and then deploys efficiently on edge devices like AUVs, ROVs, and submarine cameras.

## 🎯 **System Overview**

### **Core Features:**
- **Real-time underwater image enhancement** using truncated U-Net architecture
- **Video processing pipeline** for low frame rate underwater videos
- **Comprehensive analytics** with detailed metrics and visualizations
- **Edge device deployment** optimized for AUVs, ROVs, and Jetson devices
- **Research-grade evaluation** with PSNR, SSIM, and UIQM metrics

### **Key Capabilities:**
- **Training/Inference Speed** - Optimized for resource-constrained environments
- **Image Quality** - Focus on crispness and detail preservation
- **No GPU requirements** for training and inference
- **No depth map requirements** for training images
- **Minimal training data** requirements

## 🚀 **Quick Start**

### **Image Enhancement:**
```bash
# Enhance a single image
python enhanced_inference.py --input your_image.jpg

# Process all images in test_imgs directory
python enhanced_inference.py --batch
```

### **Video Enhancement:**
```bash
# Enhance underwater video
python run_video_enhancement.py input_video.mp4 output_video.mp4
```

### **Comprehensive Analytics:**
```bash
# Single image analysis with detailed metrics
python run_analytics.py single original.jpg enhanced.jpg

# Batch analysis of multiple images
python run_analytics.py directory ./originals ./enhanced
```

### **Edge Device Deployment:**
```bash
# Export to ONNX for edge devices
python onnx_export.py --format standard

# Deploy to Jetson devices
python edge_deployment.py --devices jetson --benchmark
```

## 📊 **Evaluation Metrics**

### **PSNR (Peak Signal-to-Noise Ratio):**
- **> 30 dB**: Excellent quality
- **20-30 dB**: Good quality
- **< 20 dB**: Low quality (common for underwater images)

### **SSIM (Structural Similarity Index):**
- **> 0.8**: High similarity (preserves structure)
- **0.6-0.8**: Moderate similarity
- **< 0.6**: Low similarity

### **UIQM (Underwater Image Quality Measure):**
- **Positive improvement**: Enhancement successful
- **Negative improvement**: Enhancement failed
- **Large positive values**: Significant improvement

## 🎥 **Video Enhancement Pipeline**

### **Complete Processing Workflow:**
1. **Extract Frames** - Converts video to individual PNG frames
2. **Enhance Frames** - Processes each frame with CNN model
3. **Calculate Metrics** - Computes PSNR, SSIM, and UIQM for each frame
4. **Reassemble Video** - Combines enhanced frames into output video
5. **Generate Report** - Displays and saves comprehensive metrics
6. **Cleanup** - Removes temporary files automatically

### **Supported Formats:**
- **Input**: MP4, AVI, MOV, MKV (any format OpenCV supports)
- **Output**: MP4 (H.264 codec)
- **Frame rates**: Any (optimized for low frame rates like 15-30 FPS)
- **Resolution**: Any (automatically resized to 512x512 for processing)

### **Example Video Output:**
```
======================================================================
VIDEO ENHANCEMENT EVALUATION RESULTS
======================================================================
Input Video: underwater_video.mp4
Output Video: enhanced_video.mp4
Frames Processed: 45
----------------------------------------------------------------------
PSNR (Peak Signal-to-Noise Ratio):
  Mean: 18.4523 dB
  Std:  2.1234 dB
SSIM (Structural Similarity Index):
  Mean: 0.8756
  Std:  0.0234
UIQM (Underwater Image Quality Measure):
  Original Mean: 245.6789
  Enhanced Mean: 312.4567
  Improvement:   +66.7778
======================================================================
```

## 📈 **Comprehensive Analytics System**

### **Generated Visualizations:**
1. **Basic Metrics Comparison** - PSNR, SSIM, UIQM bar charts
2. **Color Analysis** - RGB statistics, colorfulness, unique colors
3. **Texture & Edge Analysis** - Laplacian variance, gradient magnitude
4. **Histogram Analysis** - Channel-wise statistics, entropy
5. **Brightness & Contrast Analysis** - Dynamic range, intensity changes
6. **Quality Dashboard** - Overall assessment with radar charts

### **Detailed Reports:**
- **JSON Reports** - Machine-readable detailed data
- **Text Reports** - Human-readable comprehensive analysis
- **Quality Assessments** - Automatic interpretation
- **Frame-by-frame Analysis** (for videos)

### **Example Analytics Output:**
```
============================================================
ANALYSIS COMPLETED SUCCESSFULLY!
============================================================
Image: Sonardyne_Nekton-Live-Stream
PSNR: 13.9931 dB
SSIM: 0.9236
UIQM Improvement: +210.8718
Overall Assessment: Enhancement successful

Generated Files:
  Visualizations: 6 plots
  Detailed Report (JSON): [path]
  Detailed Report (Text): [path]
============================================================
```

## 🚀 **Edge Device Deployment**

### **ONNX Export:**
```bash
# Export to multiple ONNX formats
python onnx_export.py --format all

# Export specific format
python onnx_export.py --format optimized
```

### **TensorRT Optimization:**
```bash
# Optimize for NVIDIA Jetson devices
python tensorrt_optimization_simple.py --onnx onnx_models/mareye_standard.onnx --benchmark
```

### **Complete Deployment:**
```bash
# Deploy to all device types
python edge_deployment.py --devices all --benchmark --docker
```

### **Target Platforms:**
- **NVIDIA Jetson Xavier NX/AGX** - 15-30 FPS
- **NVIDIA Jetson Orin Nano/NX/AGX** - 25-50 FPS
- **Intel NUC** - 10-20 FPS
- **Raspberry Pi 4+** - 5-15 FPS
- **ARM64 devices** - 5-20 FPS

### **Performance Expectations:**
- **ONNX Runtime**: 2-5x faster than PyTorch on edge devices
- **TensorRT FP16**: 5-10x faster than ONNX Runtime on Jetson
- **TensorRT INT8**: 10-20x faster than ONNX Runtime on Jetson
- **Memory efficient**: Optimized for resource-constrained environments

## 🛠️ **Installation & Setup**

### **Core Dependencies:**
```bash
pip install torch torchvision
pip install opencv-python pillow numpy
pip install scikit-image seaborn matplotlib
pip install onnxruntime onnx
```

### **For Edge Deployment:**
```bash
# ONNX Runtime (required)
pip install onnxruntime

# TensorRT (for Jetson optimization)
pip install tensorrt

# PyCUDA (for TensorRT optimization)
pip install pycuda
```

### **For Analytics:**
```bash
pip install seaborn matplotlib pandas
```

## 📁 **Project Structure**

```
MAR_EYE/
├── Core System
│   ├── model.py                    # U-Net architecture
│   ├── test.py                     # Core inference
│   ├── TRAINING_CONFIG.py          # Configuration
│   └── snapshots/                  # Trained models
│
├── Image Enhancement
│   ├── enhanced_inference.py       # Enhanced inference with metrics
│   ├── evaluation_metrics.py       # PSNR, SSIM, UIQM calculations
│   └── data/test_imgs/             # Test images
│
├── Video Processing
│   ├── video_enhancer.py           # Video enhancement pipeline
│   └── run_video_enhancement.py    # Video processing interface
│
├── Analytics System
│   ├── enhancement_analytics.py    # Comprehensive analytics
│   ├── run_analytics.py            # Analytics interface
│   └── analytics_output/           # Analysis results
│
├── Edge Deployment
│   ├── onnx_export.py              # ONNX export for edge devices
│   ├── tensorrt_optimization_simple.py  # TensorRT optimization
│   ├── edge_deployment.py          # Complete deployment system
│   ├── onnx_models/                # Exported ONNX models
│   └── tensorrt_models/            # Jetson deployment packages
│
└── Documentation
    └── README.md                   # This comprehensive guide
```

## 🎯 **Use Cases**

### **Maritime Security & Defense:**
- **AUV/ROV Operations** - Real-time underwater image enhancement
- **Submarine Cameras** - Enhanced visual intelligence
- **Underwater Surveillance** - Improved threat detection capabilities
- **Marine Research** - High-quality underwater documentation

### **Research & Development:**
- **Algorithm Comparison** - Research-grade evaluation metrics
- **Performance Analysis** - Comprehensive quality assessment
- **Publication Support** - Publication-ready visualizations
- **Edge Computing Research** - Optimized deployment strategies

## 🔧 **Advanced Configuration**

### **Model Configuration:**
- **Input Size**: 512x512 pixels (configurable)
- **Batch Size**: 1 (optimized for edge devices)
- **Precision**: FP32/FP16/INT8 (depending on deployment target)
- **Memory Usage**: 100-500MB (depending on model size)

### **Performance Tuning:**
- **Jetson Devices**: Enable maximum power mode (`sudo nvpmodel -m 0`)
- **Memory Optimization**: Use FP16 or INT8 precision
- **Batch Processing**: Process multiple images efficiently
- **GPU Acceleration**: Automatic provider selection

## 🚨 **Troubleshooting**

### **Common Issues:**
1. **Model loading failed** - Check model path in TRAINING_CONFIG.py
2. **ONNX Runtime not found** - Install with `pip install onnxruntime`
3. **CUDA errors** - Install appropriate GPU provider
4. **Memory issues** - Use smaller batch sizes or FP16 precision
5. **Video processing errors** - Check video format and codec support

### **Performance Issues:**
- **Slow inference** - Enable GPU acceleration or use TensorRT
- **High memory usage** - Reduce batch size or use optimized models
- **Poor quality** - Check input image format and preprocessing

## 📊 **Benchmark Results**

### **Current Performance:**
- **CPU Inference**: ~400ms per image (2.5 FPS)
- **ONNX Runtime**: ~440ms per image (2.3 FPS)
- **Model Size**: 7.7MB (ONNX optimized)
- **Memory Usage**: ~200MB during inference

### **Expected Edge Performance:**
- **Jetson Xavier NX**: 15-25 FPS with TensorRT
- **Jetson Orin AGX**: 35-50 FPS with TensorRT
- **Intel NUC**: 10-20 FPS with ONNX Runtime
- **Raspberry Pi 4**: 5-15 FPS with ONNX Runtime

## 🎓 **Technical Details**

### **Architecture:**
- **Base Model**: Truncated U-Net architecture
- **Loss Function**: MS-SSIM + L1 (optimized for underwater images)
- **Training Data**: EUVP dataset (5885 paired underwater images)
- **Optimization**: Focused on speed and quality preservation

### **Dataset:**
- **Source**: U of Minnesota's EUVP dataset
- **Training**: 3700 Paired Underwater ImageNet + 1270 validation
- **Testing**: 2185 Paired Underwater Scenes + 130 validation
- **Total**: 5885 Paired Underwater Image Sets for training + 1400 for validation

## 🔬 **Research Applications**

This system provides **research-grade** analysis suitable for:
- **Academic papers** with publication-ready figures
- **Performance evaluation** of enhancement algorithms
- **Comparative studies** between different methods
- **Quality assessment** for underwater imaging applications
- **Edge computing research** for maritime applications

## 📞 **Support & Documentation**

For detailed usage instructions, see the comprehensive guides integrated into this README:
- **Image Enhancement**: Use `enhanced_inference.py` for single images
- **Video Processing**: Use `run_video_enhancement.py` for videos
- **Analytics**: Use `run_analytics.py` for detailed analysis
- **Edge Deployment**: Use `edge_deployment.py` for device deployment

## 🎯 **Perfect for Your Use Case**

MAR EYE is specifically designed for:
- **Real-time underwater image enhancement**
- **Edge device deployment on AUVs/ROVs**
- **Comprehensive quality assessment**
- **Research-grade evaluation metrics**
- **Production-ready deployment**

The system gives you **every possible metric** with **very detailed reports** and **visually attractive graphs** - exactly what you need for maritime defense applications!

---

**MAR EYE** - Enhancing underwater vision for maritime security and defense operations.