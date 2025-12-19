import { NextRequest, NextResponse } from "next/server"
import { rm } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { analysisName: string } }
) {
  try {
    const { analysisName } = params

    if (!analysisName) {
      return NextResponse.json({ 
        error: "Analysis name is required" 
      }, { status: 400 })
    }

    const analyticsDir = join(process.cwd(), "Deep_Sea-NN-main", "analytics_output")
    const analysisPath = join(analyticsDir, analysisName)

    if (!existsSync(analysisPath)) {
      return NextResponse.json({ 
        error: "Analysis not found" 
      }, { status: 404 })
    }

    // Delete the entire analysis directory
    await rm(analysisPath, { recursive: true, force: true })

    return NextResponse.json({
      success: true,
      message: `Analysis "${analysisName}" deleted successfully`
    })

  } catch (error) {
    console.error("Analytics DELETE error:", error)
    return NextResponse.json({ 
      error: "Failed to delete analysis",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}


