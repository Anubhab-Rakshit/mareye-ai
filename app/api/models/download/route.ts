import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filePath = searchParams.get("path")

    if (!filePath) {
      return NextResponse.json({ 
        error: "File path is required" 
      }, { status: 400 })
    }

    if (!existsSync(filePath)) {
      return NextResponse.json({ 
        error: "File not found" 
      }, { status: 404 })
    }

    // Security: Ensure the path is within the project directory
    const projectRoot = process.cwd()
    if (!filePath.startsWith(projectRoot)) {
      return NextResponse.json({ 
        error: "Invalid file path" 
      }, { status: 403 })
    }

    const fileBuffer = await readFile(filePath)
    const fileName = filePath.split('/').pop() || 'model'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })

  } catch (error) {
    console.error("Model download error:", error)
    return NextResponse.json({ 
      error: "Failed to download model",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

