import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "image" or "video"

    console.log("Dummy CNN API Request received:")
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
        console.log("Running dummy CNN model for image enhancement")
        
        const outputPath = join(outputDir, `cnn_enhanced_${fileName}`)
        
        // Simulate processing delay (4 seconds for images)
        console.log("Simulating CNN processing...")
        await new Promise(resolve => setTimeout(resolve, 4000))
        
        // Use hardcoded CNN directory images
        const cnnDir = join(process.cwd(), "CNN")
        const originalImage = "11.jpg"  // Original image
        const enhancedImage = "22.jpg"  // Enhanced image (contains "2" which is the enhanced version)
        
        // Use the enhanced image for the result
        const sourceImagePath = join(cnnDir, enhancedImage)
        
        if (existsSync(sourceImagePath)) {
            // Copy the CNN image as the enhanced result
            const sourceBuffer = await import("fs").then(fs => fs.promises.readFile(sourceImagePath))
            await writeFile(outputPath, sourceBuffer)
            
            // Hardcoded metrics for CNN
            const metrics = {
                psnr: 22.45 + Math.random() * 3, // Random between 22.45-25.45
                ssim: 0.8756 + Math.random() * 0.05, // Random between 0.8756-0.9256
                uiqm_original: 245.68 + Math.random() * 20, // Random between 245.68-265.68
                uiqm_enhanced: 312.46 + Math.random() * 30, // Random between 312.46-342.46
                uiqm_improvement: 66.78 + Math.random() * 10, // Random between 66.78-76.78
                processing_time: 4.0 + Math.random() * 0.5 // Random between 4.0-4.5
            }
            
            if (existsSync(outputPath)) {
                const outputBuffer = await import("fs").then(fs => fs.promises.readFile(outputPath))
                const outputBase64 = outputBuffer.toString("base64")
                
                result = {
                    success: true,
                    type: "image",
                    originalFileName: fileName,
                    enhancedImage: `data:image/jpeg;base64,${outputBase64}`,
                    metrics: metrics,
                    processingTime: metrics.processing_time
                }
                
                console.log("Dummy CNN image enhancement completed successfully")
            } else {
                return NextResponse.json({ 
                    error: "Enhanced image not found" 
                }, { status: 500 })
            }
        } else {
            return NextResponse.json({ 
                error: "CNN source image not found" 
            }, { status: 500 })
        }

    } else if (type === "video") {
        console.log("Running dummy CNN model for video enhancement")
        
        const outputVideoName = `cnn_enhanced_${fileName}`
        const outputVideoPath = join(outputDir, outputVideoName)
        
        // Simulate processing delay (10 seconds for videos)
        console.log("Simulating CNN video processing...")
        await new Promise(resolve => setTimeout(resolve, 10000))
        
        // Use hardcoded CNN directory videos
        const cnnDir = join(process.cwd(), "CNN")
        const originalVideo = "1.mp4"  // Original video
        const enhancedVideo = "2.mp4"  // Enhanced video (contains "2" which is the enhanced version)
        
        // Use the enhanced video for the result
        const sourceVideoPath = join(cnnDir, enhancedVideo)
        
        if (existsSync(sourceVideoPath)) {
            // Copy the CNN video as the enhanced result
            const sourceBuffer = await import("fs").then(fs => fs.promises.readFile(sourceVideoPath))
            await writeFile(outputVideoPath, sourceBuffer)
            
            // Hardcoded metrics for CNN video
            const metrics = {
                psnr: 20.15 + Math.random() * 4, // Random between 20.15-24.15
                ssim: 0.8234 + Math.random() * 0.06, // Random between 0.8234-0.8834
                uiqm_original: 198.45 + Math.random() * 25, // Random between 198.45-223.45
                uiqm_enhanced: 287.32 + Math.random() * 35, // Random between 287.32-322.32
                uiqm_improvement: 88.87 + Math.random() * 15, // Random between 88.87-103.87
                processing_time: 10.0 + Math.random() * 1.0, // Random between 10.0-11.0
                frames_processed: 150 + Math.floor(Math.random() * 100), // Random between 150-250
                fps: 30,
                duration: 5.0 + Math.random() * 3.0, // Random between 5.0-8.0
                codec_used: "H.264",
                output_size: sourceBuffer.length,
                enhancement_method: "cnn_model_dummy"
            }
            
            if (existsSync(outputVideoPath)) {
                const outputBuffer = await import("fs").then(fs => fs.promises.readFile(outputVideoPath))
                const outputBase64 = outputBuffer.toString("base64")
                
                 // Create video IDs for serving from CNN directory
                 const enhancedVideoId = Buffer.from(enhancedVideo).toString('base64')
                 const enhancedVideoUrl = `/api/cnn/dummy/video/${enhancedVideoId}`
                 
                 const originalVideoId = Buffer.from(originalVideo).toString('base64')
                 const originalVideoUrl = `/api/cnn/dummy/video/${originalVideoId}`
                 
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
                
                console.log("Dummy CNN video enhancement completed successfully")
            } else {
                return NextResponse.json({ 
                    error: "Enhanced video not found" 
                }, { status: 500 })
            }
        } else {
            return NextResponse.json({ 
                error: "CNN source video not found" 
            }, { status: 500 })
        }
    }

    // Cleanup temporary files
    try {
        if (result.success && result.type === "image") {
            // Images are embedded as base64, so we can delete them
            await unlink(inputPath)
            const outputPath = join(outputDir, `cnn_enhanced_${fileName}`)
            if (existsSync(outputPath)) {
                await unlink(outputPath)
            }
        }
    } catch (error) {
        console.warn("Failed to cleanup files:", error)
    }

    console.log("Returning dummy CNN result to frontend:")
    console.log("- Success:", result.success)
    console.log("- Type:", result.type)
    
    return NextResponse.json(result)

  } catch (error) {
    console.error("Dummy CNN processing error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
