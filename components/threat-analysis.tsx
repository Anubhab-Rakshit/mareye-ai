"use client"

import { useState, useMemo } from "react"
import { Clock, AlertTriangle, TrendingDown } from "lucide-react"
import { loadDetections } from "@/lib/detection-storage"

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

interface ThreatAnalysisProps {
  detectionResults: DetectionResult[]
}

const DETECTION_CLASSES = {
  "Mines - v1 2025-05-15 8-03pm": { label: "Mines", color: "#ff4444", bg: "bg-red-500/10" },
  mayin: { label: "Mines", color: "#ff4444", bg: "bg-red-500/10" },
  Submarine: { label: "Submarine", color: "#4488ff", bg: "bg-blue-500/10" },
  "auv-rov": { label: "AUV/ROV", color: "#00d9ff", bg: "bg-cyan-500/10" },
  divers: { label: "Divers", color: "#00ff88", bg: "bg-green-500/10" },
}

export default function ThreatAnalysis({ detectionResults }: ThreatAnalysisProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const threatTimeline = useMemo(() => {
    const stored = loadDetections()
    return stored
      .filter((result) => result.threatCount && result.threatCount > 0)
      .map((result, idx) => ({
        id: result.id,
        time: new Date(result.timestamp),
        type:
          result.overallThreatLevel === "CRITICAL"
            ? "Critical Threat Detected"
            : result.overallThreatLevel === "HIGH"
              ? "High Priority Alert"
              : "Anomaly Detected",
        severity: result.overallThreatLevel || "MEDIUM",
        description: `${result.detections.length} object(s) detected with threat level ${result.overallThreatLevel}`,
        confidence: result.overallThreatScore || 0,
        detectionCount: result.detections.length,
        image: result.detectedImage,
        detections: result.detections,
        scanIndex: idx,
      }))
      .reverse() // Show newest first
  }, [detectionResults])

  const classHeatmap = useMemo(() => {
    const stored = loadDetections()
    const classCount: Record<string, number> = {}
    const classThreatScore: Record<string, number> = {}

    stored.forEach((result) => {
      result.detections.forEach((detection) => {
        const classLabel =
          DETECTION_CLASSES[detection.class as keyof typeof DETECTION_CLASSES]?.label || detection.class
        classCount[classLabel] = (classCount[classLabel] || 0) + 1
        classThreatScore[classLabel] = (classThreatScore[classLabel] || 0) + detection.confidence
      })
    })

    return Object.entries(classCount)
      .map(([className, count]) => ({
        class: className,
        count,
        avgConfidence: classThreatScore[className] / count,
        intensity: Math.min((count / Math.max(...Object.values(classCount), 1)) * 100, 100),
      }))
      .sort((a, b) => b.count - a.count)
  }, [detectionResults])

  const getThreatColor = (level: string) => {
    return level === "CRITICAL" ? "#ff4444" : level === "HIGH" ? "#ffaa00" : level === "MEDIUM" ? "#ffff00" : "#00ff88"
  }

  return (
    <div className="space-y-6">
      {/* Timeline header */}
      <div className="border border-primary/30 rounded-lg p-6 bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary animate-pulse" />
          <h2 className="text-lg font-bold text-primary">Threat Timeline</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {threatTimeline.length} threat event(s) • Total scans: {detectionResults.length}
        </p>
      </div>

      <div className="space-y-3">
        {threatTimeline.length === 0 ? (
          <div className="border border-primary/30 rounded-lg p-6 bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-xl text-center">
            <TrendingDown className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">No threats detected. System operating normally.</p>
          </div>
        ) : (
          threatTimeline.map((threat, index) => (
            <button
              key={threat.id}
              onClick={() => setExpandedId(expandedId === threat.id ? null : threat.id)}
              className="w-full text-left border rounded-lg transition-all"
              style={{
                borderColor: `${getThreatColor(threat.severity)}40`,
                backgroundColor: `${getThreatColor(threat.severity)}08`,
              }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      style={{ color: getThreatColor(threat.severity) }}
                    />
                    <div>
                      <h3 className="font-bold text-foreground">{threat.type}</h3>
                      <p className="text-xs text-muted-foreground">
                        {threat.time.toLocaleTimeString()} • Scan #{threat.scanIndex + 1}
                      </p>
                    </div>
                  </div>
                  <div
                    className="text-sm font-bold px-3 py-1 rounded"
                    style={{
                      color: getThreatColor(threat.severity),
                      backgroundColor: `${getThreatColor(threat.severity)}20`,
                    }}
                  >
                    {threat.severity}
                  </div>
                </div>

                {/* Expanded threat details */}
                {expandedId === threat.id && (
                  <div className="mt-4 space-y-4 border-t border-border/50 pt-4">
                    <p className="text-sm text-foreground">{threat.description}</p>

                    {/* Threat metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/50 rounded p-2">
                        <p className="text-xs text-muted-foreground mb-1">Objects Detected</p>
                        <p className="text-lg font-bold text-primary">{threat.detectionCount}</p>
                      </div>
                      <div className="bg-black/50 rounded p-2">
                        <p className="text-xs text-muted-foreground mb-1">Avg Confidence</p>
                        <p className="text-lg font-bold text-secondary">{(threat.confidence * 100).toFixed(0)}%</p>
                      </div>
                    </div>

                    {/* Detection types in this threat */}
                    <div className="bg-black/50 rounded p-3">
                      <p className="text-xs font-semibold text-foreground mb-2">Detection Breakdown</p>
                      <div className="space-y-2">
                        {threat.detections.map((detection, idx) => {
                          const classInfo = DETECTION_CLASSES[detection.class as keyof typeof DETECTION_CLASSES]
                          return (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{classInfo?.label || detection.class}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-foreground">
                                  {(detection.confidence * 100).toFixed(0)}%
                                </span>
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: detection.color || "#00d9ff" }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Threat image thumbnail */}
                    {threat.image && (
                      <div className="bg-black/50 rounded overflow-hidden">
                        <img
                          src={threat.image || "/placeholder.svg"}
                          alt="Threat detection"
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      <div className="border border-primary/30 rounded-lg p-6 bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-primary">Detection Heatmap by Type</h3>
        </div>

        {classHeatmap.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No detection data available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {classHeatmap.map((item) => {
              const classInfo = DETECTION_CLASSES[item.class as keyof typeof DETECTION_CLASSES]
              return (
                <div key={item.class}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{item.class}</span>
                    <div className="flex gap-2 text-xs">
                      <span className="text-muted-foreground">Count: {item.count}</span>
                      <span className="text-primary font-mono">{(item.avgConfidence * 100).toFixed(0)}% avg</span>
                    </div>
                  </div>
                  <div className="w-full h-3 rounded-full bg-border/50 overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${item.intensity}%`,
                        backgroundColor: classInfo?.color || "#00d9ff",
                        boxShadow: `0 0 10px ${classInfo?.color || "#00d9ff"}`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Statistics footer */}
        <div className="mt-6 grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Detections</p>
            <p className="text-xl font-bold text-primary">{classHeatmap.reduce((sum, c) => sum + c.count, 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Classes Found</p>
            <p className="text-xl font-bold text-secondary">{classHeatmap.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Avg Confidence</p>
            <p className="text-xl font-bold text-accent">
              {classHeatmap.length > 0
                ? Math.round((classHeatmap.reduce((sum, c) => sum + c.avgConfidence, 0) / classHeatmap.length) * 100)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
