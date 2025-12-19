import { NextRequest, NextResponse } from "next/server"
import { readFile, readdir, stat } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(request: NextRequest) {
  try {
    const baseDir = join(process.cwd(), "Deep_Sea-NN-main")
    const onnxDir = join(baseDir, "onnx_models")
    const tensorrtDir = join(baseDir, "tensorrt_models")
    
    const models = {
      onnx: [],
      tensorrt: []
    }

    // Process ONNX models
    if (existsSync(onnxDir)) {
      const onnxFiles = await readdir(onnxDir, { withFileTypes: true })
      
      for (const file of onnxFiles) {
        if (file.isFile() && file.name.endsWith('.onnx')) {
          const filePath = join(onnxDir, file.name)
          const stats = await stat(filePath)
          
          models.onnx.push({
            name: file.name,
            size: stats.size,
            sizeFormatted: formatFileSize(stats.size),
            path: filePath,
            type: 'ONNX',
            lastModified: stats.mtime
          })
        } else if (file.isFile() && (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png'))) {
          // Include test output images
          const filePath = join(onnxDir, file.name)
          const stats = await stat(filePath)
          const imageBuffer = await readFile(filePath)
          const imageBase64 = imageBuffer.toString("base64")
          const isPng = file.name.endsWith('.png')
          
          models.onnx.push({
            name: file.name,
            size: stats.size,
            sizeFormatted: formatFileSize(stats.size),
            path: filePath,
            type: 'Test Output',
            lastModified: stats.mtime,
            image: `data:image/${isPng ? 'png' : 'jpeg'};base64,${imageBase64}`
          })
        }
      }
    }

    // Process TensorRT models
    if (existsSync(tensorrtDir)) {
      const tensorrtFiles = await readdir(tensorrtDir, { withFileTypes: true })
      
      for (const file of tensorrtFiles) {
        if (file.isDirectory()) {
          const subDirPath = join(tensorrtDir, file.name)
          const subFiles = await readdir(subDirPath, { withFileTypes: true })
          
          const deploymentInfo = {
            name: file.name,
            type: 'TensorRT Deployment',
            files: [],
            lastModified: new Date()
          }
          
          for (const subFile of subFiles) {
            const subFilePath = join(subDirPath, subFile.name)
            const stats = await stat(subFilePath)
            
            const fileInfo = {
              name: subFile.name,
              size: stats.size,
              sizeFormatted: formatFileSize(stats.size),
              path: subFilePath,
              type: getFileType(subFile.name),
              lastModified: stats.mtime
            }
            
            // If it's an image, include base64 data
            if (subFile.name.endsWith('.jpg') || subFile.name.endsWith('.jpeg')) {
              const imageBuffer = await readFile(subFilePath)
              const imageBase64 = imageBuffer.toString("base64")
              fileInfo.image = `data:image/jpeg;base64,${imageBase64}`
            } else if (subFile.name.endsWith('.png')) {
              const imageBuffer = await readFile(subFilePath)
              const imageBase64 = imageBuffer.toString("base64")
              fileInfo.image = `data:image/png;base64,${imageBase64}`
            }
            
            // If it's a Python file, include content preview
            if (subFile.name.endsWith('.py')) {
              try {
                const content = await readFile(subFilePath, 'utf-8')
                fileInfo.contentPreview = content.substring(0, 500) + (content.length > 500 ? '...' : '')
              } catch (error) {
                console.warn(`Failed to read ${subFilePath}:`, error)
              }
            }
            
            deploymentInfo.files.push(fileInfo)
          }
          
          models.tensorrt.push(deploymentInfo)
        }
      }
    }

    return NextResponse.json({
      success: true,
      models: models,
      summary: {
        onnxCount: models.onnx.length,
        tensorrtDeployments: models.tensorrt.length
      }
    })

  } catch (error) {
    console.error("Models API error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch models data",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'py': return 'Python Script'
    case 'txt': return 'Text File'
    case 'jpg':
    case 'jpeg':
    case 'png': return 'Image'
    case 'onnx': return 'ONNX Model'
    case 'engine': return 'TensorRT Engine'
    default: return 'File'
  }
}
