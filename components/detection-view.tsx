"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, Play, Loader2, Zap, Eye, BarChart3, Settings, ImageIcon, Video } from "lucide-react"
import HolographicCard from "./holographic-card"
import DetectionResultsEnhanced from "./detection-results-enhanced"
import RealTimeFeed from "./real-time-feed"
import TacticalStat from "./tactical-stat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { addDetection, loadDetections } from "@/lib/detection-storage"

interface Detection {
  class: string
  confidence: number
  threat_level?: string
  bbox: [number, number, number, number]
  color: string
}

interface DetectionResult {
  originalImage: string
  detectedImage: string
  originalFileName?: string
  detections: Detection[]
  processingTime: number
  totalObjects: number
  overallThreatLevel?: string
  overallThreatScore?: number
  threatCount?: number
  timestamp?: Date
}

interface DetectionViewProps {
  onResultsUpdate?: (results: DetectionResult[]) => void
}

export default function DetectionView({ onResultsUpdate }: DetectionViewProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [results, setResults] = useState<DetectionResult[]>(() => {
    if (typeof window === "undefined") return []
    const stored = loadDetections()
    return stored.map((s) => ({
      originalImage: s.originalImage,
      detectedImage: s.detectedImage,
      detections: s.detections,
      processingTime: s.processingTime,
      totalObjects: s.totalObjects,
      overallThreatLevel: s.overallThreatLevel,
      overallThreatScore: s.overallThreatScore,
      threatCount: s.threatCount,
      timestamp: new Date(s.timestamp),
    }))
  })
  const [activeTab, setActiveTab] = useState("image")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const updateResults = (newResults: DetectionResult[]) => {
    setResults(newResults)
    onResultsUpdate?.(newResults)
  }

  const processImage = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("type", "image")

      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 500)

      const response = await fetch("/api/detection/process", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProcessingProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Detection failed")
      }

      const result = await response.json()

      if (result.success) {
        const detectionResult: DetectionResult = {
          originalImage: URL.createObjectURL(selectedFile),
          detectedImage: result.detectedImage,
          originalFileName: result.originalFileName,
          detections: result.detections,
          processingTime: result.processingTime,
          totalObjects: result.detections.length,
          overallThreatLevel: result.overallThreatLevel,
          overallThreatScore: result.overallThreatScore,
          threatCount: result.threatCount,
          timestamp: new Date(),
        }

        addDetection({
          originalImage: detectionResult.originalImage,
          detectedImage: detectionResult.detectedImage,
          detections: detectionResult.detections,
          processingTime: detectionResult.processingTime,
          totalObjects: detectionResult.totalObjects,
          overallThreatLevel: detectionResult.overallThreatLevel,
          overallThreatScore: detectionResult.overallThreatScore,
          threatCount: detectionResult.threatCount,
        })

        const newResults = [detectionResult, ...results]
        updateResults(newResults)
        setSelectedFile(null)
      } else {
        throw new Error("Detection failed")
      }
    } catch (error) {
      console.error("Detection error:", error)
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const processVideo = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("type", "video")

      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 5
        })
      }, 1000)

      const response = await fetch("/api/detection/process", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProcessingProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Video detection failed")
      }

      const result = await response.json()

      if (result.success) {
        const detectionResult: DetectionResult = {
          originalImage: URL.createObjectURL(selectedFile),
          detectedImage: result.detectedVideo || result.detectedImage,
          originalFileName: result.originalFileName,
          detections: result.detections,
          processingTime: result.processingTime,
          totalObjects: result.detections.length,
          overallThreatLevel: result.overallThreatLevel,
          overallThreatScore: result.overallThreatScore,
          threatCount: result.threatCount,
          timestamp: new Date(),
        }

        addDetection({
          originalImage: detectionResult.originalImage,
          detectedImage: detectionResult.detectedImage,
          detections: detectionResult.detections,
          processingTime: detectionResult.processingTime,
          totalObjects: detectionResult.totalObjects,
          overallThreatLevel: detectionResult.overallThreatLevel,
          overallThreatScore: detectionResult.overallThreatScore,
          threatCount: detectionResult.threatCount,
        })

        // Dispatch event for real-time command center updates
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("detectionAdded"))
        }

        const newResults = [detectionResult, ...results]
        updateResults(newResults)
        setSelectedFile(null)
      } else {
        throw new Error("Video detection failed")
      }
    } catch (error) {
      console.error("Video detection error:", error)
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const downloadFile = (fileData: string, filename: string) => {
    try {
      const link = document.createElement("a")
      link.href = fileData
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Download failed:", error)
      alert("Download failed. Please try again.")
    }
  }

  const deleteResult = (index: number) => {
    if (window.confirm("Are you sure you want to delete this detection result?")) {
      const newResults = results.filter((_, i) => i !== index)
      updateResults(newResults)
      const stored = loadDetections()
      if (stored[index]) {
        const { deleteDetection } = require("@/lib/detection-storage")
        deleteDetection(stored[index].id)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* System metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TacticalStat
          label="Detection Speed"
          value="30+"
          unit="FPS"
          variant="primary"
          icon={<Zap className="w-5 h-5" />}
        />
        <TacticalStat label="Accuracy Rate" value="95" unit="%" variant="success" icon={<Eye className="w-5 h-5" />} />
        <TacticalStat
          label="Detectable Classes"
          value="5"
          unit="types"
          variant="secondary"
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <TacticalStat label="System Status" value="ONLINE" variant="primary" icon={<Settings className="w-5 h-5" />} />
      </div>

      {/* Upload and Processing */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card/50 border border-border/50 backdrop-blur-xl">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Image Detection
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Video Detection
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="mt-6 space-y-6">
          <HolographicCard>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">Image Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Upload an underwater image for real-time threat detection
                </p>
              </div>

              <div
                className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-foreground mb-2 font-semibold">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">Supports JPG, PNG, BMP formats</p>
                {selectedFile && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="text-sm text-foreground">Selected: {selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={processImage}
                  disabled={!selectedFile || isProcessing}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-secondary text-card hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Detect Objects
                    </>
                  )}
                </button>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Processing image...</span>
                    <span className="text-primary font-mono">{Math.round(processingProgress)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-border/50 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </HolographicCard>
        </TabsContent>

        <TabsContent value="video" className="mt-6 space-y-6">
          <HolographicCard>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">Video Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Process underwater videos for frame-by-frame threat analysis
                </p>
              </div>

              <div
                className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                <Video className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-foreground mb-2 font-semibold">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">Supports MP4, AVI, MOV, MKV formats</p>
                {selectedFile && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="text-sm text-foreground">Selected: {selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={processVideo}
                  disabled={!selectedFile || isProcessing}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-secondary text-card hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Detect in Video
                    </>
                  )}
                </button>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Processing video frames...</span>
                    <span className="text-primary font-mono">{Math.round(processingProgress)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-border/50 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </HolographicCard>
        </TabsContent>
      </Tabs>

      {/* Results section */}
      {results.length > 0 && (
        <HolographicCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-xl font-bold text-primary">Detection History</h2>
              <span className="text-sm text-muted-foreground">{results.length} results</span>
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <DetectionResultsEnhanced
                  key={index}
                  index={index}
                  originalImage={result.originalImage}
                  detectedImage={result.detectedImage}
                  originalFileName={result.originalFileName}
                  detections={result.detections}
                  processingTime={result.processingTime}
                  totalObjects={result.totalObjects}
                  overallThreatLevel={result.overallThreatLevel}
                  overallThreatScore={result.overallThreatScore}
                  threatCount={result.threatCount}
                  onDelete={deleteResult}
                  onDownload={downloadFile}
                />
              ))}
            </div>
          </div>
        </HolographicCard>
      )}

      {/* Live feed */}
      <HolographicCard>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary">Real-Time Activity Feed</h3>
          <RealTimeFeed />
        </div>
      </HolographicCard>
    </div>
  )
}
