import { NextRequest, NextResponse } from "next/server"
import { readFile, readdir, rm } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(request: NextRequest) {
  try {
    const analyticsDir = join(process.cwd(), "Deep_Sea-NN-main", "analytics_output")
    
    if (!existsSync(analyticsDir)) {
      return NextResponse.json({ 
        error: "Analytics directory not found" 
      }, { status: 404 })
    }

    // Get all analysis directories
    const analysisDirs = await readdir(analyticsDir, { withFileTypes: true })
    const analysisResults = []

    for (const dir of analysisDirs) {
      if (dir.isDirectory()) {
        const analysisPath = join(analyticsDir, dir.name)
        
        // Look for JSON report (try different naming patterns)
        let jsonReportPath = join(analysisPath, `${dir.name}_detailed_report.json`)
        if (!existsSync(jsonReportPath)) {
          // Try alternative naming pattern
          const files = await readdir(analysisPath)
          const jsonFile = files.find(file => file.endsWith('_detailed_report.json'))
          if (jsonFile) {
            jsonReportPath = join(analysisPath, jsonFile)
          }
        }
        
        if (existsSync(jsonReportPath)) {
          try {
            const jsonContent = await readFile(jsonReportPath, "utf-8")
            const reportData = JSON.parse(jsonContent)
            
            // Get all PNG files (graphs)
            const files = await readdir(analysisPath)
            const graphFiles = files.filter(file => file.endsWith('.png'))
            
            // Convert graph files to base64
            const graphs: Record<string, string> = {}
            for (const graphFile of graphFiles) {
              const graphPath = join(analysisPath, graphFile)
              const graphBuffer = await readFile(graphPath)
              const graphBase64 = graphBuffer.toString("base64")
              const graphName = graphFile.replace('.png', '')
              graphs[graphName] = `data:image/png;base64,${graphBase64}`
            }
            
            // Try to load original and enhanced images if file paths exist
            const enhancedReportData = { ...reportData }
            if (reportData.file_paths) {
              // Try to load original image
              if (reportData.file_paths.original && existsSync(reportData.file_paths.original)) {
                try {
                  const originalBuffer = await readFile(reportData.file_paths.original)
                  const originalBase64 = originalBuffer.toString("base64")
                  const ext = reportData.file_paths.original.split('.').pop()?.toLowerCase() || 'jpg'
                  enhancedReportData.original_image = `data:image/${ext === 'png' ? 'png' : 'jpeg'};base64,${originalBase64}`
                } catch (error) {
                  console.warn(`Failed to load original image for ${dir.name}:`, error)
                }
              }
              
              // Try to load enhanced image
              if (reportData.file_paths.enhanced && existsSync(reportData.file_paths.enhanced)) {
                try {
                  const enhancedBuffer = await readFile(reportData.file_paths.enhanced)
                  const enhancedBase64 = enhancedBuffer.toString("base64")
                  const ext = reportData.file_paths.enhanced.split('.').pop()?.toLowerCase() || 'jpg'
                  enhancedReportData.enhanced_image = `data:image/${ext === 'png' ? 'png' : 'jpeg'};base64,${enhancedBase64}`
                } catch (error) {
                  console.warn(`Failed to load enhanced image for ${dir.name}:`, error)
                }
              }
            }
            
            analysisResults.push({
              analysisName: dir.name,
              reportData: enhancedReportData,
              graphs: graphs,
              timestamp: reportData.timestamp || new Date().toISOString()
            })
          } catch (error) {
            console.warn(`Failed to process analysis ${dir.name}:`, error)
          }
        }
      }
    }

    // Sort by timestamp (newest first)
    analysisResults.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      success: true,
      analyses: analysisResults,
      totalAnalyses: analysisResults.length
    })

  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch analytics data",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysisName } = body

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
