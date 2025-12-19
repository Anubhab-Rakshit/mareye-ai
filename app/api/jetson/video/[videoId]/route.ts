import { NextRequest, NextResponse } from "next/server"
import { readFile, existsSync } from "fs"
import { join } from "path"
import { promisify } from "util"

const readFileAsync = promisify(readFile)

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params
    
    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    // Decode the video ID to get the filename
    const fileName = Buffer.from(videoId, 'base64').toString('utf-8')
    console.log("Serving Jetson video:", fileName)

    // Look for the video file in the temp/output directory
    const tempDir = join(process.cwd(), "temp", "output")
    const videoPath = join(tempDir, fileName)

    if (!existsSync(videoPath)) {
      console.error("Video file not found:", videoPath)
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Read the video file
    const videoBuffer = await readFileAsync(videoPath)
    
    // Determine content type based on file extension
    let contentType = "video/mp4"
    if (fileName.toLowerCase().endsWith('.avi')) {
      contentType = "video/x-msvideo"
    } else if (fileName.toLowerCase().endsWith('.mov')) {
      contentType = "video/quicktime"
    } else if (fileName.toLowerCase().endsWith('.mkv')) {
      contentType = "video/x-matroska"
    }

    // Return the video file with appropriate headers
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': videoBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Accept-Ranges': 'bytes',
      },
    })

  } catch (error) {
    console.error("Error serving Jetson video:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
