import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const videoId = params.videoId
    const fileName = Buffer.from(videoId, 'base64').toString('utf-8')
    
    console.log(`Serving Jetson video: ${fileName}`)
    
    // Path to the onxx directory
    const videoPath = join(process.cwd(), "onxx", fileName)
    
    if (!existsSync(videoPath)) {
      console.log(`Jetson video not found: ${videoPath}`)
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }
    
    // Read the video file
    const videoBuffer = await readFile(videoPath)
    
    // Set appropriate headers for video streaming
    const headers = new Headers()
    headers.set('Content-Type', 'video/mp4')
    headers.set('Content-Length', videoBuffer.length.toString())
    headers.set('Accept-Ranges', 'bytes')
    headers.set('Cache-Control', 'public, max-age=3600')
    
    return new NextResponse(new Uint8Array(videoBuffer), {
      status: 200,
      headers
    })
    
  } catch (error) {
    console.error("Error serving Jetson video:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
