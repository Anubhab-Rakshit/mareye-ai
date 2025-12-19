import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "image" or "video"

    console.log("Dummy Jetson API Request received:")
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

    if (type === "image") {
        console.log("Running dummy ONNX model for image enhancement")
        
        const outputPath = join(outputDir, `jetson_enhanced_${fileName}`)
        
        // Simulate processing delay (4 seconds for images)
        console.log("Simulating ONNX processing...")
        await new Promise(resolve => setTimeout(resolve, 4000))
        
        // Use hardcoded ONNX directory images
        const onnxDir = join(process.cwd(), "onxx")
        const originalImage = "1.png"  // Original image
        const enhancedImage = "2.png"  // Enhanced image (contains "2" which is the enhanced version)
        
        // Use the enhanced image for the result
        const sourceImagePath = join(onnxDir, enhancedImage)
        
        if (existsSync(sourceImagePath)) {
            // Copy the ONNX image as the enhanced result
            const sourceBuffer = await import("fs").then(fs => fs.promises.readFile(sourceImagePath))
            await writeFile(outputPath, sourceBuffer)
            
            // Hardcoded metrics for ONNX (better performance than CNN)
            const metrics = {
                psnr: 25.67 + Math.random() * 4, // Random between 25.67-29.67 (better than CNN)
                ssim: 0.9123 + Math.random() * 0.04, // Random between 0.9123-0.9523 (better than CNN)
                uiqm_original: 245.68 + Math.random() * 20, // Random between 245.68-265.68
                uiqm_enhanced: 345.89 + Math.random() * 40, // Random between 345.89-385.89 (better than CNN)
                uiqm_improvement: 100.21 + Math.random() * 20, // Random between 100.21-120.21 (better than CNN)
                processing_time: 0.065 + Math.random() * 0.02 // Random between 0.065-0.085 (much faster)
            }
            
            if (existsSync(outputPath)) {
                const outputBuffer = await import("fs").then(fs => fs.promises.readFile(outputPath))
                const outputBase64 = outputBuffer.toString("base64")
                
                result = {
                    success: true,
                    type: "image",
                    originalFileName: fileName,
                    enhancedImage: `data:image/png;base64,${outputBase64}`,
                    metrics: metrics,
                    processingTime: metrics.processing_time
                }
                
                console.log("Dummy ONNX image enhancement completed successfully")
            } else {
                return NextResponse.json({ 
                    error: "Enhanced image not found" 
                }, { status: 500 })
            }
        } else {
            return NextResponse.json({ 
                error: "ONNX source image not found" 
            }, { status: 500 })
        }

    } else if (type === "video") {
        console.log("Running dummy ONNX model for video enhancement")
        
        const outputVideoName = `jetson_enhanced_${fileName}`
        const outputVideoPath = join(outputDir, outputVideoName)
        
        // Simulate processing delay (10 seconds for videos)
        console.log("Simulating ONNX video processing...")
        await new Promise(resolve => setTimeout(resolve, 10000))
        
        // Use hardcoded ONNX directory videos
        const onnxDir = join(process.cwd(), "onxx")
        const originalVideo = "ss1.mp4"  // Original video
        const enhancedVideo = "ss2.mp4"  // Enhanced video (contains "2" which is the enhanced version)
        
        // Use the enhanced video for the result
        const sourceVideoPath = join(onnxDir, enhancedVideo)
        
        if (existsSync(sourceVideoPath)) {
            // Copy the ONNX video as the enhanced result
            const sourceBuffer = await import("fs").then(fs => fs.promises.readFile(sourceVideoPath))
            await writeFile(outputVideoPath, sourceBuffer)
            
            // Hardcoded metrics for ONNX video (better performance than CNN)
            const metrics = {
                psnr: 24.89 + Math.random() * 5, // Random between 24.89-29.89 (better than CNN)
                ssim: 0.8945 + Math.random() * 0.07, // Random between 0.8945-0.9645 (better than CNN)
                uiqm_original: 198.45 + Math.random() * 25, // Random between 198.45-223.45
                uiqm_enhanced: 325.67 + Math.random() * 45, // Random between 325.67-370.67 (better than CNN)
                uiqm_improvement: 127.22 + Math.random() * 25, // Random between 127.22-152.22 (better than CNN)
                processing_time: 0.08 + Math.random() * 0.02, // Random between 0.08-0.10 (much faster)
                frames_processed: 200 + Math.floor(Math.random() * 150), // Random between 200-350
                fps: 30,
                duration: 6.0 + Math.random() * 4.0, // Random between 6.0-10.0
                codec_used: "H.264",
                output_size: sourceBuffer.length,
                enhancement_method: "onnx_model_dummy"
            }
            
            if (existsSync(outputVideoPath)) {
                const outputBuffer = await import("fs").then(fs => fs.promises.readFile(outputVideoPath))
                const outputBase64 = outputBuffer.toString("base64")
                
                // Create video IDs for serving from onxx directory
                const enhancedVideoId = Buffer.from(enhancedVideo).toString('base64')
                const enhancedVideoUrl = `/api/jetson/dummy/video/${enhancedVideoId}`
                
                const originalVideoId = Buffer.from(originalVideo).toString('base64')
                const originalVideoUrl = `/api/jetson/dummy/video/${originalVideoId}`
                
                result = {
                    success: true,
                    type: "video",
                    originalFileName: fileName,
                    originalVideo: originalVideoUrl,
                    originalVideoDownload: `data:video/mp4;base64,${Buffer.from(sourceBuffer).toString('base64')}`,
                    enhancedVideo: enhancedVideoUrl,
                    enhancedVideoDownload: `data:video/mp4;base64,${outputBase64}`,
                    metrics: {
                        psnr: metrics.psnr,
                        ssim: metrics.ssim,
                        uiqm_original: metrics.uiqm_original,
                        uiqm_enhanced: metrics.uiqm_enhanced,
                        uiqm_improvement: metrics.uiqm_improvement
                    },
                    processingTime: metrics.processing_time,
                    videoInfo: {
                        framesProcessed: metrics.frames_processed,
                        fps: metrics.fps,
                        duration: metrics.duration,
                        codecUsed: metrics.codec_used,
                        enhancementMethod: metrics.enhancement_method
                    }
                }
                
                console.log("Dummy ONNX video enhancement completed successfully")
            } else {
                return NextResponse.json({ 
                    error: "Enhanced video not found" 
                }, { status: 500 })
            }
        } else {
            return NextResponse.json({ 
                error: "ONNX source video not found" 
            }, { status: 500 })
        }
    }

    // Cleanup temporary files
    try {
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

    console.log("Returning dummy Jetson result to frontend:")
    console.log("- Success:", result.success)
    console.log("- Type:", result.type)
    
    return NextResponse.json(result)

  } catch (error) {
    console.error("Dummy Jetson processing error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
