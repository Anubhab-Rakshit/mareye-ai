import { NextRequest, NextResponse } from "next/server"
import { runPythonCommand } from "@/lib/python-runner"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "image" or "video"

    console.log("Jetson API Request received:")
    console.log("- File:", file ? file.name : "No file")
    console.log("- Type:", type)
    console.log("- File size:", file ? file.size : "No file")

    if (!file) {
      console.log("Error: No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!type) {
      console.log("Error: No type provided")
      return NextResponse.json({ error: "No type provided" }, { status: 400 })
    }

    // Create temporary directories
    const tempDir = join(process.cwd(), "temp")
    const inputDir = join(tempDir, "input")
    const outputDir = join(tempDir, "output")
    
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true })
    }
    if (!existsSync(inputDir)) {
      await mkdir(inputDir, { recursive: true })
    }
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true })
    }

    // Save uploaded file
    const fileBuffer = await file.arrayBuffer()
    const fileName = file.name
    const inputPath = join(inputDir, fileName)
    await writeFile(inputPath, Buffer.from(fileBuffer))

    let result: any = {}
    const jetsonDir = join(process.cwd(), "Deep_Sea-NN-main")
    const onnxModelPath = join(jetsonDir, "onnx_models", "mareye_standard.onnx")
    let outputVideoPath: string = "" // Initialize for cleanup

    if (type === "image") {
        // Use ONNX model for image enhancement
        console.log("Running ONNX model for image enhancement")
        
        const outputPath = join(outputDir, `jetson_enhanced_${fileName}`)
        
        // Create Python script for ONNX image enhancement
        const onnxEnhancementScript = `
import cv2
import numpy as np
import os
import time
import json
import onnxruntime as ort
from skimage.metrics import peak_signal_noise_ratio as psnr
from skimage.metrics import structural_similarity as ssim

def enhance_image_onnx(input_path, output_path, model_path):
    """Enhance image using ONNX model"""
    start_time = time.time()
    
    # Read the original image
    original = cv2.imread(input_path)
    if original is None:
        return {'error': 'Could not read input image'}
    
    # Resize to model input size (512x512)
    input_size = (512, 512)
    resized = cv2.resize(original, input_size)
    
    # Normalize to [0, 1] and convert to float32
    input_tensor = resized.astype(np.float32) / 255.0
    
    # Convert BGR to RGB
    input_tensor = cv2.cvtColor(input_tensor, cv2.COLOR_BGR2RGB)
    
    # Add batch dimension and transpose to CHW format
    input_tensor = np.transpose(input_tensor, (2, 0, 1))
    input_tensor = np.expand_dims(input_tensor, axis=0)
    
    try:
        # Load ONNX model
        session = ort.InferenceSession(model_path)
        
        # Get input and output names
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        
        # Run inference
        outputs = session.run([output_name], {input_name: input_tensor})
        enhanced_tensor = outputs[0]
        
        # Post-process output
        # Remove batch dimension and transpose back to HWC
        enhanced_tensor = np.squeeze(enhanced_tensor, axis=0)
        enhanced_tensor = np.transpose(enhanced_tensor, (1, 2, 0))
        
        # Convert RGB to BGR
        enhanced_tensor = cv2.cvtColor(enhanced_tensor, cv2.COLOR_RGB2BGR)
        
        # Denormalize and clip values
        enhanced_tensor = np.clip(enhanced_tensor * 255.0, 0, 255).astype(np.uint8)
        
        # Resize back to original size
        enhanced = cv2.resize(enhanced_tensor, (original.shape[1], original.shape[0]))
        
    except Exception as e:
        print(f"ONNX inference failed: {e}")
        # Fallback to OpenCV enhancement
        enhanced = enhance_image_opencv_fallback(original)
    
    # Save enhanced image
    cv2.imwrite(output_path, enhanced)
    
    # Calculate metrics
    processing_time = time.time() - start_time
    
    # Convert to grayscale for SSIM calculation
    original_gray = cv2.cvtColor(original, cv2.COLOR_BGR2GRAY)
    enhanced_gray = cv2.cvtColor(enhanced, cv2.COLOR_BGR2GRAY)
    
    # Calculate PSNR
    psnr_value = psnr(original_gray, enhanced_gray)
    
    # Calculate SSIM
    ssim_value = ssim(original_gray, enhanced_gray)
    
    # Calculate UIQM (Underwater Image Quality Measure)
    def calculate_uiqm(img):
        # Convert to float
        img_float = img.astype(np.float32) / 255.0
        
        # Calculate contrast (standard deviation)
        contrast = np.std(img_float)
        
        # Calculate saturation
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        saturation = np.mean(hsv[:,:,1]) / 255.0
        
        # Calculate sharpness (using Laplacian variance)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Calculate colorfulness
        b, g, r = cv2.split(img)
        colorfulness = np.sqrt(np.var(r) + np.var(g) + np.var(b)) / 255.0
        
        # Combine metrics (simplified UIQM)
        uiqm = (contrast * 100) + (saturation * 50) + (sharpness / 100) + (colorfulness * 25)
        return uiqm
    
    uiqm_original = calculate_uiqm(original)
    uiqm_enhanced = calculate_uiqm(enhanced)
    uiqm_improvement = uiqm_enhanced - uiqm_original
    
    return {
        'psnr': psnr_value,
        'ssim': ssim_value,
        'uiqm_original': uiqm_original,
        'uiqm_enhanced': uiqm_enhanced,
        'uiqm_improvement': uiqm_improvement,
        'processing_time': processing_time
    }

def enhance_image_opencv_fallback(img):
    """Fallback OpenCV enhancement if ONNX fails"""
    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    l = clahe.apply(l)
    enhanced_lab = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
    
    # Apply bilateral filter for noise reduction
    enhanced = cv2.bilateralFilter(enhanced, 9, 75, 75)
    
    # Apply unsharp masking for sharpening
    gaussian = cv2.GaussianBlur(enhanced, (0, 0), 2.0)
    enhanced = cv2.addWeighted(enhanced, 1.5, gaussian, -0.5, 0)
    
    return enhanced

if __name__ == "__main__":
    import sys
    if len(sys.argv) >= 4:
        input_path = sys.argv[1]
        output_path = sys.argv[2]
        model_path = sys.argv[3]
    else:
        input_path = "${inputPath}"
        output_path = "${outputPath}"
        model_path = "${onnxModelPath}"
    
    result = enhance_image_onnx(input_path, output_path, model_path)
    print(json.dumps(result))
`
      
      // Write the ONNX enhancement script
      const scriptPath = join(tempDir, "jetson_image_enhancement.py")
      await writeFile(scriptPath, onnxEnhancementScript)
      
      // Run the ONNX enhancement script
      const pythonResult = await runPythonCommand([
        scriptPath,
        inputPath,
        outputPath,
        onnxModelPath
      ], tempDir)
      
      if (pythonResult.code !== 0) {
        console.error("ONNX Enhancement error:", pythonResult.stderr)
        return NextResponse.json({ 
          error: "ONNX image enhancement failed", 
          details: pythonResult.stderr 
        }, { status: 500 })
      }
      
      // Parse the results
      let metrics
      try {
        console.log("Python stdout:", pythonResult.stdout)
        console.log("Python stderr:", pythonResult.stderr)
        metrics = JSON.parse(pythonResult.stdout)
        console.log("Parsed metrics:", metrics)
      } catch (parseError) {
        console.error("Failed to parse ONNX enhancement results:", parseError)
        console.error("Raw stdout:", pythonResult.stdout)
        return NextResponse.json({ 
          error: "Failed to parse ONNX enhancement results",
          details: `Parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}, Raw output: ${pythonResult.stdout}`
        }, { status: 500 })
      }
      
      if (existsSync(outputPath)) {
        const outputBuffer = await import("fs").then(fs => fs.promises.readFile(outputPath))
        const outputBase64 = outputBuffer.toString("base64")
        
        result = {
          success: true,
          type: "image",
          originalFileName: fileName,
          enhancedImage: `data:image/jpeg;base64,${outputBase64}`,
          metrics: {
            psnr: metrics.psnr || 0,
            ssim: metrics.ssim || 0,
            uiqm_original: metrics.uiqm_original || 0,
            uiqm_enhanced: metrics.uiqm_enhanced || 0,
            uiqm_improvement: metrics.uiqm_improvement || 0
          },
          processingTime: metrics.processing_time || 0
        }
        
        // Generate analytics after successful enhancement
        await generateJetsonAnalytics(inputPath, outputPath, result.metrics, fileName)
        
      } else {
        return NextResponse.json({ 
          error: "Enhanced image not found" 
        }, { status: 500 })
      }


    } else if (type === "video") {
      // Process video frame by frame using ONNX model
      console.log("Running frame-by-frame video enhancement with ONNX")
      console.log("- Input file:", fileName)
      console.log("- Input path:", inputPath)
      
      const outputVideoName = `jetson_enhanced_${fileName}`
      outputVideoPath = join(outputDir, outputVideoName)
      console.log("- Output path:", outputVideoPath)
      
      // Create ONNX video enhancement script
      const onnxVideoScript = `
import cv2
import numpy as np
import time
import json
import os
import onnxruntime as ort

def enhance_video_onnx(input_path, output_path, model_path):
    start_time = time.time()
    
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        return {'error': 'Could not open input video'}
    
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Ensure even dimensions
    if width % 2 != 0: width -= 1
    if height % 2 != 0: height -= 1
    
    # Try different codecs
    codecs_to_try = [
        ('mp4v', cv2.VideoWriter_fourcc(*'mp4v')),
        ('MJPG', cv2.VideoWriter_fourcc(*'MJPG')),
        ('XVID', cv2.VideoWriter_fourcc(*'XVID'))
    ]
    
    out = None
    used_codec = None
    
    for codec_name, fourcc in codecs_to_try:
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        if out.isOpened():
            used_codec = codec_name
            break
        else:
            out.release()
            out = None
    
    if not out or not out.isOpened():
        cap.release()
        return {'error': 'Could not create output video with any codec'}
    
    # Load ONNX model
    try:
        session = ort.InferenceSession(model_path)
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        onnx_available = True
    except Exception as e:
        print(f"ONNX model loading failed: {e}")
        onnx_available = False
    
    frame_count = 0
    total_psnr = 0
    total_ssim = 0
    total_uiqm_original = 0
    total_uiqm_enhanced = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        if frame.shape[1] != width or frame.shape[0] != height:
            frame = cv2.resize(frame, (width, height))
        
        # Apply ONNX enhancement or fallback
        if onnx_available:
            enhanced_frame = enhance_frame_onnx(frame, session, input_name, output_name)
        else:
            enhanced_frame = enhance_frame_opencv(frame)
        
        out.write(enhanced_frame)
        
        # Calculate metrics
        original_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        enhanced_gray = cv2.cvtColor(enhanced_frame, cv2.COLOR_BGR2GRAY)
        
        frame_psnr = cv2.PSNR(original_gray, enhanced_gray)
        frame_ssim = calculate_ssim(original_gray, enhanced_gray)
        frame_uiqm_original = calculate_uiqm(frame)
        frame_uiqm_enhanced = calculate_uiqm(enhanced_frame)
        
        total_psnr += frame_psnr
        total_ssim += frame_ssim
        total_uiqm_original += frame_uiqm_original
        total_uiqm_enhanced += frame_uiqm_enhanced
        
        frame_count += 1
    
    cap.release()
    out.release()
    
    if not os.path.exists(output_path):
        return {'error': 'Output video file was not created'}
    
    file_size = os.path.getsize(output_path)
    processing_time = time.time() - start_time
    
    avg_psnr = total_psnr / frame_count if frame_count > 0 else 0
    avg_ssim = total_ssim / frame_count if frame_count > 0 else 0
    avg_uiqm_original = total_uiqm_original / frame_count if frame_count > 0 else 0
    avg_uiqm_enhanced = total_uiqm_enhanced / frame_count if frame_count > 0 else 0
    avg_uiqm_improvement = avg_uiqm_enhanced - avg_uiqm_original
    
    return {
        'psnr': avg_psnr,
        'ssim': avg_ssim,
        'uiqm_original': avg_uiqm_original,
        'uiqm_enhanced': avg_uiqm_enhanced,
        'uiqm_improvement': avg_uiqm_improvement,
        'processing_time': processing_time,
        'frames_processed': frame_count,
        'fps': fps,
        'duration': frame_count / fps if fps > 0 else 0,
        'codec_used': used_codec,
        'output_size': file_size,
        'enhancement_method': 'onnx_model' if onnx_available else 'opencv_fallback'
    }

def enhance_frame_onnx(frame, session, input_name, output_name):
    """Enhance frame using ONNX model"""
    try:
        # Resize to model input size
        input_size = (512, 512)
        resized = cv2.resize(frame, input_size)
        
        # Normalize and convert to float32
        input_tensor = resized.astype(np.float32) / 255.0
        
        # Convert BGR to RGB
        input_tensor = cv2.cvtColor(input_tensor, cv2.COLOR_BGR2RGB)
        
        # Add batch dimension and transpose to CHW format
        input_tensor = np.transpose(input_tensor, (2, 0, 1))
        input_tensor = np.expand_dims(input_tensor, axis=0)
        
        # Run inference
        outputs = session.run([output_name], {input_name: input_tensor})
        enhanced_tensor = outputs[0]
        
        # Post-process output
        enhanced_tensor = np.squeeze(enhanced_tensor, axis=0)
        enhanced_tensor = np.transpose(enhanced_tensor, (1, 2, 0))
        
        # Convert RGB to BGR
        enhanced_tensor = cv2.cvtColor(enhanced_tensor, cv2.COLOR_RGB2BGR)
        
        # Denormalize and clip values
        enhanced_tensor = np.clip(enhanced_tensor * 255.0, 0, 255).astype(np.uint8)
        
        # Resize back to original frame size
        enhanced = cv2.resize(enhanced_tensor, (frame.shape[1], frame.shape[0]))
        
        return enhanced
        
    except Exception as e:
        print(f"ONNX frame enhancement failed: {e}")
        return enhance_frame_opencv(frame)

def enhance_frame_opencv(frame):
    """Fallback OpenCV enhancement"""
    # Apply CLAHE
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    l = clahe.apply(l)
    enhanced_lab = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
    
    # Apply sharpening
    kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
    sharpened = cv2.filter2D(enhanced, -1, kernel)
    
    # Blend original and sharpened
    result = cv2.addWeighted(enhanced, 0.7, sharpened, 0.3, 0)
    
    return result

def calculate_ssim(img1, img2):
    """Simple SSIM calculation"""
    mu1 = cv2.GaussianBlur(img1.astype(np.float32), (11, 11), 1.5)
    mu2 = cv2.GaussianBlur(img2.astype(np.float32), (11, 11), 1.5)
    mu1_sq = mu1 * mu1
    mu2_sq = mu2 * mu2
    mu1_mu2 = mu1 * mu2
    
    sigma1_sq = cv2.GaussianBlur((img1.astype(np.float32) * img1.astype(np.float32)), (11, 11), 1.5) - mu1_sq
    sigma2_sq = cv2.GaussianBlur((img2.astype(np.float32) * img2.astype(np.float32)), (11, 11), 1.5) - mu2_sq
    sigma12 = cv2.GaussianBlur((img1.astype(np.float32) * img2.astype(np.float32)), (11, 11), 1.5) - mu1_mu2
    
    c1 = (0.01 * 255) ** 2
    c2 = (0.03 * 255) ** 2
    
    ssim_map = ((2 * mu1_mu2 + c1) * (2 * sigma12 + c2)) / ((mu1_sq + mu2_sq + c1) * (sigma1_sq + sigma2_sq + c2))
    ssim_value = np.mean(ssim_map)
    
    return max(0.0, min(1.0, ssim_value))

def calculate_uiqm(img):
    """Calculate UIQM metric"""
    img_float = img.astype(np.float32) / 255.0
    contrast = np.std(img_float)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    saturation = np.mean(hsv[:,:,1]) / 255.0
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
    b, g, r = cv2.split(img)
    colorfulness = np.sqrt(np.var(r) + np.var(g) + np.var(b)) / 255.0
    uiqm = (contrast * 100) + (saturation * 50) + (sharpness / 100) + (colorfulness * 25)
    return uiqm

if __name__ == "__main__":
    import sys
    if len(sys.argv) >= 4:
        input_path = sys.argv[1]
        output_path = sys.argv[2]
        model_path = sys.argv[3]
        result = enhance_video_onnx(input_path, output_path, model_path)
        print(json.dumps(result))
    else:
        print(json.dumps({'error': 'Invalid arguments'}))
`
      
      // Write the ONNX video enhancement script
      const videoScriptPath = join(tempDir, "jetson_video_enhancement.py")
      await writeFile(videoScriptPath, onnxVideoScript)
      
      // Run the ONNX video enhancement script
      const pythonResult = await runPythonCommand([
        videoScriptPath,
        inputPath,
        outputVideoPath,
        onnxModelPath
      ], tempDir)
      
      console.log("ONNX Video script execution completed:")
      console.log("- Exit code:", pythonResult.code)
      console.log("- Stdout length:", pythonResult.stdout.length)
      console.log("- Stderr length:", pythonResult.stderr.length)
      console.log("- Stdout content:", pythonResult.stdout)
      if (pythonResult.stderr) {
        console.log("- Stderr content:", pythonResult.stderr)
      }
      
      if (pythonResult.code !== 0) {
        console.error("ONNX Video enhancement error:")
        console.error("- Exit code:", pythonResult.code)
        console.error("- Stderr:", pythonResult.stderr)
        console.error("- Stdout:", pythonResult.stdout)
        
        // Try to extract meaningful error message
        let errorMessage = "ONNX video processing failed"
        if (pythonResult.stderr.includes("Could not open input video")) {
          errorMessage = "Could not open input video file"
        } else if (pythonResult.stderr.includes("Could not create output video")) {
          errorMessage = "Could not create output video (codec issue)"
        } else if (pythonResult.stderr.includes("Failed to load ONNX model")) {
          errorMessage = "Failed to load ONNX model"
        } else if (pythonResult.stderr.includes("No such file or directory")) {
          errorMessage = "Required file not found"
        } else if (pythonResult.stderr.includes("UnicodeEncodeError")) {
          errorMessage = "Video processing failed due to encoding issue"
        } else if (pythonResult.stderr.includes("OpenH264")) {
          errorMessage = "Video codec not supported - trying alternative codecs"
        }
        
        return NextResponse.json({ 
          error: errorMessage, 
          details: pythonResult.stderr,
          stdout: pythonResult.stdout
        }, { status: 500 })
      }
      
      // Parse the results
      let metrics
      try {
        // Clean the stdout to extract only the JSON part
        const stdout = pythonResult.stdout.trim()
        console.log("Parsing JSON from stdout:", stdout)
        
        const jsonStart = stdout.indexOf('{')
        const jsonEnd = stdout.lastIndexOf('}') + 1
        
        console.log("JSON boundaries:", { jsonStart, jsonEnd })
        
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          const jsonString = stdout.substring(jsonStart, jsonEnd)
          console.log("Extracted JSON string:", jsonString)
          metrics = JSON.parse(jsonString)
          console.log("Parsed metrics:", metrics)
        } else {
          throw new Error("No valid JSON found in output")
        }
      } catch (parseError) {
        console.error("Failed to parse ONNX video enhancement results:", parseError)
        console.error("Raw stdout:", pythonResult.stdout)
        return NextResponse.json({ 
          error: "Failed to parse ONNX video enhancement results",
          details: `Parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}, Raw output: ${pythonResult.stdout}`
        }, { status: 500 })
      }
      
      if (existsSync(outputVideoPath)) {
        console.log("Enhanced video file exists")
        
        // Try to convert to H.264 for better browser compatibility
        let finalVideoPath = outputVideoPath
        let finalVideoName = outputVideoName
        
        if (metrics.codec_used === "MPEG-4" || metrics.codec_used === "mp4v") {
          console.log("Attempting to convert MPEG-4 to H.264 for browser compatibility...")
          const h264VideoName = outputVideoName.replace('.mp4', '_h264.mp4')
          const h264VideoPath = join(outputDir, h264VideoName)
          
          try {
            const convertScript = join(process.cwd(), "convert_to_h264.py")
            const conversionResult = await runPythonCommand([
              convertScript,
              outputVideoPath,
              h264VideoPath
            ], process.cwd())
            
            if (conversionResult.code === 0 && existsSync(h264VideoPath)) {
              console.log("Successfully converted to H.264")
              finalVideoPath = h264VideoPath
              finalVideoName = h264VideoName
              metrics.codec_used = "H.264"
              
              // Delete the original mp4v file
              try {
                await unlink(outputVideoPath)
              } catch (e) {
                console.warn("Failed to delete original mp4v file:", e)
              }
            } else {
              console.warn("H.264 conversion failed, using original video")
              console.warn("Conversion stderr:", conversionResult.stderr)
            }
          } catch (conversionError) {
            console.warn("H.264 conversion error:", conversionError)
            console.warn("Using original video")
          }
        }
        
        const outputBuffer = await import("fs").then(fs => fs.promises.readFile(finalVideoPath))
        console.log("Final video file size:", outputBuffer.length, "bytes")
        console.log("Final codec:", metrics.codec_used)
        
        // Instead of base64, create a video ID and serve via API endpoint
        const videoId = Buffer.from(finalVideoName).toString('base64')
        const videoUrl = `/api/jetson/video/${videoId}`
        
        // Create original video ID and URL
        const originalVideoId = Buffer.from(fileName).toString('base64')
        const originalVideoUrl = `/api/jetson/video/${originalVideoId}`
        
        // Also provide base64 as fallback for download
        const outputBase64 = outputBuffer.toString("base64")
        
        // Read original video for base64 fallback
        const originalBuffer = await import("fs").then(fs => fs.promises.readFile(inputPath))
        const originalBase64 = originalBuffer.toString("base64")
        
        let mimeType = "video/mp4"
          
        result = {
          success: true,
          type: "video",
          originalFileName: fileName,
          originalVideo: originalVideoUrl,
          originalVideoDownload: `data:${mimeType};base64,${originalBase64}`,
          enhancedVideo: videoUrl,
          enhancedVideoDownload: `data:${mimeType};base64,${outputBase64}`,
          metrics: {
            psnr: metrics.psnr || 0,
            ssim: metrics.ssim || 0,
            uiqm_original: metrics.uiqm_original || 0,
            uiqm_enhanced: metrics.uiqm_enhanced || 0,
            uiqm_improvement: metrics.uiqm_improvement || 0
          },
          processingTime: metrics.processing_time || 0,
          videoInfo: {
            framesProcessed: metrics.frames_processed || 0,
            fps: metrics.fps || 0,
            duration: metrics.duration || 0,
            codecUsed: metrics.codec_used || "Unknown",
            enhancementMethod: metrics.enhancement_method || "onnx_model"
          }
        }
        
        console.log("ONNX Video result created successfully")
        console.log("Result keys:", Object.keys(result))
        
        // Generate analytics for video enhancement (skip if metrics are invalid)
        if (result.metrics && result.metrics.ssim <= 1.0 && result.metrics.psnr > 0) {
          await generateJetsonAnalytics(inputPath, outputVideoPath, result.metrics, fileName)
        } else {
          console.warn("Skipping analytics generation due to invalid metrics:", result.metrics)
        }
        
      } else {
        console.error("Enhanced video file not found at:", outputVideoPath)
        return NextResponse.json({ 
          error: "Enhanced video not found" 
        }, { status: 500 })
      }
    }

    // Cleanup temporary files
    try {
      // Don't delete input video immediately - it needs to be served via API for original video display
      // Don't delete video files immediately - they need to be served via API
      // Video files will be cleaned up by a separate cleanup job
      if (result.success && result.type === "image") {
        // Images are embedded as base64, so we can delete them
        await unlink(inputPath)
        const outputPath = join(outputDir, `jetson_enhanced_${fileName}`)
        if (existsSync(outputPath)) {
          await unlink(outputPath)
        }
      }
    } catch (error) {
      console.warn("Failed to cleanup files:", error)
    }

    console.log("Returning Jetson result to frontend:")
    console.log("- Success:", result.success)
    console.log("- Type:", result.type)
    console.log("- Result size:", JSON.stringify(result).length, "characters")
    
    // Check if response is too large
    const responseSize = JSON.stringify(result).length
    if (responseSize > 50 * 1024 * 1024) { // 50MB limit
      console.warn("Response size is very large:", responseSize, "characters")
      return NextResponse.json({ 
        error: "Response too large. Please try with a shorter video.",
        details: `Response size: ${Math.round(responseSize / 1024 / 1024)}MB`
      }, { status: 413 })
    }
    
    return NextResponse.json(result)

  } catch (error) {
    console.error("Jetson processing error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

async function generateJetsonAnalytics(inputPath: string, outputPath: string, metrics: any, fileName: string) {
  try {
    console.log("Generating Jetson analytics for:", fileName)
    
    // Create analytics directory
    const analyticsDir = join(process.cwd(), "Deep_Sea-NN-main", "analytics_output")
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const baseName = fileName.replace(/\.[^/.]+$/, "")
    const analysisName = `jetson_${baseName}_analysis_${timestamp}`
    const analysisPath = join(analyticsDir, analysisName)
    
    // Create directory
    await import("fs").then(fs => fs.promises.mkdir(analysisPath, { recursive: true }))
    
    // Create analytics report
    const reportData = {
      image_name: baseName,
      timestamp: new Date().toISOString(),
      model_type: "ONNX",
      file_paths: {
        original: inputPath,
        enhanced: outputPath
      },
      basic_metrics: {
        psnr: metrics.psnr || 0,
        ssim: metrics.ssim || 0,
        uiqm_original: metrics.uiqm_original || 0,
        uiqm_enhanced: metrics.uiqm_enhanced || 0,
        uiqm_improvement: metrics.uiqm_improvement || 0
      },
      quality_assessment: {
        psnr_quality: (metrics.psnr || 0) > 20 ? "Good" : (metrics.psnr || 0) > 15 ? "Moderate" : "Poor",
        ssim_quality: (metrics.ssim || 0) > 0.8 ? "High similarity" : (metrics.ssim || 0) > 0.6 ? "Moderate similarity" : "Low similarity",
        uiqm_quality: (metrics.uiqm_improvement || 0) > 50 ? "Significantly improved" : (metrics.uiqm_improvement || 0) > 0 ? "Improved" : "No improvement",
        overall_assessment: (metrics.uiqm_improvement || 0) > 0 ? "ONNX Enhancement successful" : "ONNX Enhancement failed"
      }
    }
    
    // Save JSON report
    const reportPath = join(analysisPath, `${analysisName}_jetson_report.json`)
    await import("fs").then(fs => fs.promises.writeFile(reportPath, JSON.stringify(reportData, null, 2)))
    
    console.log(`Jetson analytics generated for ${fileName} in ${analysisPath}`)
    
  } catch (error) {
    console.error("Failed to generate Jetson analytics:", error)
  }
}
