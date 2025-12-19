"use client"

import type React from "react"
import { useState } from "react"
import { Radar, AlertTriangle, Eye, Map, Settings } from "lucide-react"
import SonarBackground from "./sonar-background"
import DetectionView from "./detection-view"
import VesselTracking from "./vessel-tracking"
import ThreatAnalysis from "./threat-analysis"
import { getThreatStats, loadDetections } from "@/lib/detection-storage"

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

export default function CommandCenter() {
  const [activeTab, setActiveTab] = useState<"detection" | "vessels" | "threats">("detection")
  const [systemStatus] = useState("ACTIVE")
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>(() => {
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

  const stats = getThreatStats()
  const totalThreats = stats.totalThreats
  const avgAccuracy = stats.avgConfidence
  const criticalThreats = stats.criticalThreats

  const handleDetectionComplete = (results: DetectionResult[]) => {
    setDetectionResults(results)
  }

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      <SonarBackground />

      <div className="relative z-10">
        {/* Top navigation bar */}
        <nav className="border-b border-primary/30 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary rounded-lg opacity-20 blur-lg" />
                  <div className="relative bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
                    <Radar className="w-6 h-6 text-card" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-primary glow-pulse">MAREYE</h1>
                  <p className="text-xs text-muted-foreground">Marine Threat Detection System</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-xs font-mono text-secondary">SYSTEM {systemStatus}</span>
                </div>
                <div className="h-8 w-px bg-border" />

                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="text-sm font-mono text-primary">{detectionResults.length}</div>
                    <p className="text-xs text-muted-foreground">Scans</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-mono ${totalThreats > 0 ? "text-destructive" : "text-secondary"}`}>
                      {totalThreats}
                    </div>
                    <p className="text-xs text-muted-foreground">Threats</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-mono text-secondary">{avgAccuracy}%</div>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                  </div>
                </div>
              </div>

              <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-muted-foreground hover:text-primary" />
              </button>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex border-t border-border/50 px-6">
            <TabButton
              active={activeTab === "detection"}
              onClick={() => setActiveTab("detection")}
              icon={<Eye className="w-4 h-4" />}
              label="Detection"
            />
            <TabButton
              active={activeTab === "vessels"}
              onClick={() => setActiveTab("vessels")}
              icon={<Map className="w-4 h-4" />}
              label="Threat Map"
              badge={totalThreats > 0 ? totalThreats : undefined}
            />
            <TabButton
              active={activeTab === "threats"}
              onClick={() => setActiveTab("threats")}
              icon={<AlertTriangle className="w-4 h-4" />}
              label="Threat Timeline"
              badge={criticalThreats > 0 ? criticalThreats : undefined}
            />
          </div>
        </nav>

        {/* Main content area */}
        <main className="p-6 space-y-6">
          {activeTab === "detection" && <DetectionView onResultsUpdate={handleDetectionComplete} />}
          {activeTab === "vessels" && <VesselTracking detectionResults={detectionResults} />}
          {activeTab === "threats" && <ThreatAnalysis detectionResults={detectionResults} />}
        </main>
      </div>
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: number
}

function TabButton({ active, onClick, icon, label, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all relative ${
        active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-bold">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  )
}
