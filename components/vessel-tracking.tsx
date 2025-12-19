"use client"

import { useState, useMemo } from "react"
import { Map, Activity } from "lucide-react"
import { getAllThreatObjects } from "@/lib/detection-storage"

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

interface VesselTrackingProps {
  detectionResults: DetectionResult[]
}

const DETECTION_CLASSES = {
  "Mines - v1 2025-05-15 8-03pm": { label: "Mines", color: "#ff4444" },
  mayin: { label: "Mines", color: "#ff4444" },
  Submarine: { label: "Submarine", color: "#4488ff" },
  "auv-rov": { label: "AUV/ROV", color: "#00d9ff" },
  divers: { label: "Divers", color: "#00ff88" },
}

// Function to generate deterministic but varied coordinates for each threat
function generateThreatCoordinates(threatId: string, totalThreats: number, index: number) {
  // Use threat ID to generate consistent but varied positions
  const hash = threatId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const angleVariation = (hash % 360) + index * (360 / Math.max(totalThreats, 1))
  const radiusVariation = 40 + ((hash % 100) / 100) * 40 + (index % 3) * 15

  const angle = (angleVariation * Math.PI) / 180
  const radius = radiusVariation

  return {
    x: 50 + (Math.cos(angle) * radius) / 5,
    y: 50 + (Math.sin(angle) * radius) / 5,
    angle: angleVariation,
    radius: radiusVariation,
  }
}

export default function VesselTracking({ detectionResults }: VesselTrackingProps) {
  const [selectedThreatId, setSelectedThreatId] = useState<string | null>(null)

  const threatObjects = useMemo(() => {
    const storedThreats = getAllThreatObjects()
    return storedThreats.map((threat, index) => ({
      ...threat,
      coordinates: generateThreatCoordinates(threat.id, storedThreats.length, index),
    }))
  }, [detectionResults])

  const selectedThreat = selectedThreatId ? threatObjects.find((t) => t.id === selectedThreatId) : null

  const getThreatColor = (threatLevel?: string) => {
    return threatLevel === "CRITICAL"
      ? "#ff4444"
      : threatLevel === "HIGH"
        ? "#ffaa00"
        : threatLevel === "MEDIUM"
          ? "#ffff00"
          : "#00ff88"
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main threat map */}
      <div className="lg:col-span-2 border border-primary/30 rounded-lg p-6 bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">Tactical Threat Map</h2>
          <Activity className="w-5 h-5 text-muted-foreground animate-pulse" />
        </div>

        {/* Radar visualization with unique threat positions */}
        <div className="relative aspect-square bg-black/50 rounded-lg border border-primary/20 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
            <defs>
              <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#00d9ff" stopOpacity="0" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid circles */}
            {[1, 2, 3, 4].map((i) => (
              <circle
                key={`circle-${i}`}
                cx="200"
                cy="200"
                r={50 * i}
                fill="none"
                stroke="#00d9ff"
                strokeWidth="0.5"
                opacity="0.2"
              />
            ))}

            {/* Hexagonal grid overlay */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i * 60 * Math.PI) / 180
              return (
                <line
                  key={`hex-${i}`}
                  x1="200"
                  y1="200"
                  x2={200 + Math.cos(angle) * 150}
                  y2={200 + Math.sin(angle) * 150}
                  stroke="#00d9ff"
                  strokeWidth="0.5"
                  opacity="0.15"
                />
              )
            })}

            {/* Center crosshair */}
            <circle cx="200" cy="200" r="3" fill="#00d9ff" opacity="0.5" />
            <line x1="200" y1="100" x2="200" y2="300" stroke="#00d9ff" strokeWidth="0.5" opacity="0.15" />
            <line x1="100" y1="200" x2="300" y2="200" stroke="#00d9ff" strokeWidth="0.5" opacity="0.15" />

            {/* Connection lines between threats - dynamic */}
            {threatObjects.slice(0, 10).map((threat, i) => {
              const nextThreat = threatObjects[(i + 1) % threatObjects.length]
              if (!nextThreat) return null
              return (
                <line
                  key={`connection-${threat.id}`}
                  x1={200 + (threat.coordinates.x - 50) * 4}
                  y1={200 + (threat.coordinates.y - 50) * 4}
                  x2={200 + (nextThreat.coordinates.x - 50) * 4}
                  y2={200 + (nextThreat.coordinates.y - 50) * 4}
                  stroke="#00d9ff"
                  strokeWidth="0.5"
                  opacity="0.1"
                  strokeDasharray="3,3"
                />
              )
            })}
          </svg>

          {/* Threat markers with unique positions */}
          {threatObjects.map((threat) => {
            const threatColor = getThreatColor(threat.threat_level)
            const isSelected = selectedThreatId === threat.id

            return (
              <button
                key={threat.id}
                onClick={() => setSelectedThreatId(isSelected ? null : threat.id)}
                className="absolute group transition-all"
                style={{
                  left: `${threat.coordinates.x}%`,
                  top: `${threat.coordinates.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: isSelected ? 20 : 10,
                }}
              >
                {/* Pulsing outer ring */}
                <div
                  className={`absolute inset-0 rounded-full ${isSelected ? "animate-pulse" : "animate-ping"}`}
                  style={{
                    backgroundColor: threatColor,
                    opacity: isSelected ? 0.6 : 0.3,
                    width: "24px",
                    height: "24px",
                    marginLeft: "-12px",
                    marginTop: "-12px",
                  }}
                />

                {/* Center dot with glow */}
                <div
                  className="absolute rounded-full transition-all"
                  style={{
                    backgroundColor: threatColor,
                    width: isSelected ? "12px" : "8px",
                    height: isSelected ? "12px" : "8px",
                    marginLeft: isSelected ? "-6px" : "-4px",
                    marginTop: isSelected ? "-6px" : "-4px",
                    boxShadow: `0 0 ${isSelected ? 20 : 12}px ${threatColor}, 0 0 ${isSelected ? 30 : 20}px ${threatColor}80`,
                  }}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block bg-card/95 border border-primary/50 rounded px-2 py-1 whitespace-nowrap text-xs text-foreground z-30 backdrop-blur-sm shadow-lg">
                  <div className="font-semibold">
                    {DETECTION_CLASSES[threat.class as keyof typeof DETECTION_CLASSES]?.label || threat.class}
                  </div>
                  <div className="text-muted-foreground">{(threat.confidence * 100).toFixed(0)}%</div>
                </div>
              </button>
            )
          })}

          {/* Empty state */}
          {threatObjects.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Map className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No threats detected yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Map stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs text-muted-foreground">Total Threats</p>
            <p className="text-xl font-bold text-primary font-mono">{threatObjects.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-xs text-muted-foreground">Critical</p>
            <p className="text-xl font-bold text-destructive font-mono">
              {threatObjects.filter((t) => t.threat_level === "CRITICAL").length}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/30">
            <p className="text-xs text-muted-foreground">Avg Confidence</p>
            <p className="text-xl font-bold text-secondary font-mono">
              {threatObjects.length > 0
                ? Math.round((threatObjects.reduce((sum, t) => sum + t.confidence, 0) / threatObjects.length) * 100)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Threat details panel */}
      <div className="space-y-4">
        <div className="border border-primary/30 rounded-lg p-4 bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-xl">
          <h3 className="text-sm font-bold text-primary mb-4">Detected Threats ({threatObjects.length})</h3>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {threatObjects.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No detections</p>
            ) : (
              threatObjects.map((threat) => {
                const classInfo = DETECTION_CLASSES[threat.class as keyof typeof DETECTION_CLASSES]
                const isSelected = selectedThreatId === threat.id

                return (
                  <button
                    key={threat.id}
                    onClick={() => setSelectedThreatId(isSelected ? null : threat.id)}
                    className={`w-full p-3 rounded-lg border transition-all text-left text-xs ${
                      isSelected
                        ? "border-primary bg-primary/20 ring-2 ring-primary/50"
                        : "border-border/50 bg-card/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getThreatColor(threat.threat_level) }}
                      />
                      <span className="font-semibold text-foreground">{classInfo?.label || threat.class}</span>
                    </div>

                    {isSelected && (
                      <div className="space-y-2 border-t border-border/50 pt-2 mt-2">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Confidence:</span>
                          <span className="text-foreground font-mono">{(threat.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Threat Level:</span>
                          <span className="text-foreground font-mono">{threat.threat_level || "LOW"}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Scan ID:</span>
                          <span className="text-foreground font-mono text-[10px]">#{threat.scanIndex + 1}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Detected:</span>
                          <span className="text-foreground font-mono text-[10px]">
                            {new Date(threat.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Selected threat details */}
        {selectedThreat && (
          <div className="border border-primary/30 rounded-lg p-4 bg-gradient-to-br from-primary/10 to-card/20 backdrop-blur-xl">
            <h4 className="text-sm font-bold text-primary mb-3">Threat Details</h4>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Class</p>
                <p className="text-foreground font-semibold">
                  {DETECTION_CLASSES[selectedThreat.class as keyof typeof DETECTION_CLASSES]?.label ||
                    selectedThreat.class}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Confidence Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-border/50 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${selectedThreat.confidence * 100}%` }} />
                  </div>
                  <span className="font-mono text-primary">{(selectedThreat.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Threat Level</p>
                <div
                  className="px-2 py-1 rounded text-white font-semibold text-center"
                  style={{ backgroundColor: getThreatColor(selectedThreat.threat_level) }}
                >
                  {selectedThreat.threat_level || "LOW"}
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Detection Time</p>
                <p className="text-foreground font-mono">{new Date(selectedThreat.timestamp).toLocaleString()}</p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Position on Radar</p>
                <p className="text-foreground font-mono">
                  X: {selectedThreat.coordinates.x.toFixed(1)}% Y: {selectedThreat.coordinates.y.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
