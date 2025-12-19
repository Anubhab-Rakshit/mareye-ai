"use client"
import { Download, Trash2, AlertTriangle, BarChart3 } from "lucide-react"
import HolographicCard from "./holographic-card"

interface Detection {
  class: string
  confidence: number
  threat_level?: string
  bbox: [number, number, number, number]
  color: string
}

interface DetectionResultProps {
  index: number
  originalImage: string
  detectedImage: string
  originalFileName?: string
  detections: Detection[]
  processingTime: number
  totalObjects: number
  overallThreatLevel?: string
  overallThreatScore?: number
  threatCount?: number
  onDelete: (index: number) => void
  onDownload: (fileData: string, filename: string) => void
}

const DETECTION_CLASSES: Record<string, { label: string; color: string; textColor: string }> = {
  "Mines - v1 2025-05-15 8-03pm": {
    label: "Mines",
    color: "bg-red-500/20",
    textColor: "text-red-400",
  },
  mayin: { label: "Mines", color: "bg-red-500/20", textColor: "text-red-400" },
  Submarine: {
    label: "Submarine",
    color: "bg-blue-500/20",
    textColor: "text-blue-400",
  },
  "auv-rov": {
    label: "AUV/ROV",
    color: "bg-cyan-500/20",
    textColor: "text-cyan-400",
  },
  divers: {
    label: "Divers",
    color: "bg-green-500/20",
    textColor: "text-green-400",
  },
}

export default function DetectionResultsEnhanced({
  index,
  originalImage,
  detectedImage,
  originalFileName,
  detections,
  processingTime,
  totalObjects,
  overallThreatLevel,
  overallThreatScore,
  threatCount,
  onDelete,
  onDownload,
}: DetectionResultProps) {
  const threatColor =
    overallThreatLevel === "CRITICAL"
      ? "#ff4444"
      : overallThreatLevel === "HIGH"
        ? "#ffaa00"
        : overallThreatLevel === "MEDIUM"
          ? "#ffff00"
          : "#00ff88"

  return (
    <HolographicCard className="mb-6" animated>
      <div className="space-y-6">
        {/* Result header */}
        <div className="flex items-start justify-between border-b border-border/50 pb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Detection Result #{index + 1}</h3>
            {originalFileName && <p className="text-xs text-muted-foreground mt-1">File: {originalFileName}</p>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onDownload(detectedImage, `detection-${index}.png`)}
              className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              title="Download result"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(index)}
              className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
              title="Delete result"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border border-border/50 rounded-lg p-3 bg-card/30">
            <p className="text-xs text-muted-foreground mb-1">Objects Detected</p>
            <p className="text-xl font-bold text-primary font-mono">{totalObjects}</p>
          </div>
          <div className="border border-border/50 rounded-lg p-3 bg-card/30">
            <p className="text-xs text-muted-foreground mb-1">Processing Time</p>
            <p className="text-xl font-bold text-secondary font-mono">{processingTime.toFixed(2)}ms</p>
          </div>
          <div className="border border-border/50 rounded-lg p-3 bg-card/30">
            <p className="text-xs text-muted-foreground mb-1">Threat Count</p>
            <p className="text-xl font-bold text-destructive font-mono">{threatCount || 0}</p>
          </div>
          <div className="border border-border/50 rounded-lg p-3 bg-card/30">
            <p className="text-xs text-muted-foreground mb-1">Overall Confidence</p>
            <p className="text-xl font-bold text-accent font-mono">
              {overallThreatScore ? `${Math.round(overallThreatScore)}%` : "N/A"}
            </p>
          </div>
        </div>

        {/* Threat status */}
        {overallThreatLevel && (
          <div
            className="flex items-center gap-3 p-4 rounded-lg border-2"
            style={{
              borderColor: threatColor,
              backgroundColor: `${threatColor}20`,
            }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: threatColor }} />
            <div>
              <p className="text-xs text-muted-foreground">Overall Threat Level</p>
              <p className="text-lg font-bold" style={{ color: threatColor }}>
                {overallThreatLevel}
              </p>
            </div>
          </div>
        )}

        {/* Images comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Original Image</p>
            <img
              src={originalImage || "/placeholder.svg"}
              alt="Original"
              className="w-full rounded-lg border border-border/50 bg-black/30"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Detection Result</p>
            <img
              src={detectedImage || "/placeholder.svg"}
              alt="Detected"
              className="w-full rounded-lg border border-primary/50 bg-black/30"
            />
          </div>
        </div>

        {/* Detections list */}
        {detections.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Detected Objects ({detections.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {detections.map((detection, i) => {
                const classInfo = DETECTION_CLASSES[detection.class as keyof typeof DETECTION_CLASSES]
                return (
                  <div key={i} className={`p-3 rounded-lg border border-border/50 ${classInfo?.color || "bg-card/30"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs font-semibold ${classInfo?.textColor || "text-foreground"}`}>
                          {classInfo?.label || detection.class}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Confidence: {(detection.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: detection.color || "#00d9ff" }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </HolographicCard>
  )
}
