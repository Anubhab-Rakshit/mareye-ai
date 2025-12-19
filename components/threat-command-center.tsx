"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { 
  AlertTriangle, Shield, Activity, Radio, 
  TrendingUp, Clock, Zap, Target, 
  AlertCircle, CheckCircle2, XCircle,
  Bell, Volume2, VolumeX, Radar, Waves,
  Cpu, HardDrive, Network, Power, Gauge,
  Map, TrendingDown, Layers, Eye, Search,
  Filter, ChevronDown, ChevronUp, Maximize2,
  Minimize2, Download, BarChart3, ArrowUp,
  ArrowDown, RefreshCw, Server, Database,
  Wifi, WifiOff, Globe, Monitor, Smartphone
} from "lucide-react"
import { SonarGridBackground } from "@/components/sonar-grid-background"
import { AnimatedCounter } from "@/components/animated-counter"
import { loadDetections, getThreatStats, getAllThreatObjects } from "@/lib/detection-storage"

interface ThreatAlert {
  id: string
  timestamp: Date
  level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE"
  type: string
  message: string
  confidence: number
  detectionId?: string
  imageUrl?: string
}

interface SystemHealth {
  cpu: number
  memory: number
  network: "ONLINE" | "OFFLINE" | "DEGRADED"
  detection: "ACTIVE" | "IDLE" | "PROCESSING"
  lastUpdate: Date
  uptime: number
  connectionType?: string
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
  jsHeapSizeLimit?: number
  totalJSHeapSize?: number
  usedJSHeapSize?: number
  deviceMemory?: number
  hardwareConcurrency?: number
  platform?: string
  userAgent?: string
  screenResolution?: string
  viewportSize?: string
  pixelRatio?: number
}

interface ThreatStats {
  totalDetections: number
  criticalThreats: number
  highThreats: number
  mediumThreats: number
  lowThreats: number
  totalObjects: number
  avgConfidence: number
  lastDetectionTime: number | null
  detectionRate: number // detections per hour
  avgProcessingTime: number
  threatTrend: "INCREASING" | "DECREASING" | "STABLE"
  peakThreatLevel: string
  mostDetectedClass: string
  recentActivityCount: number // last 24 hours
  historicalData: Array<{ date: string; count: number; level: string }>
}

export function ThreatCommandCenter() {
  const [mounted, setMounted] = useState(false)
  const [alerts, setAlerts] = useState<ThreatAlert[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    cpu: 0,
    memory: 0,
    network: "ONLINE",
    detection: "IDLE",
    lastUpdate: new Date(),
    uptime: 0
  })
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [threatStats, setThreatStats] = useState<ThreatStats>({
    totalDetections: 0,
    criticalThreats: 0,
    highThreats: 0,
    mediumThreats: 0,
    lowThreats: 0,
    totalObjects: 0,
    avgConfidence: 0,
    lastDetectionTime: null,
    detectionRate: 0,
    avgProcessingTime: 0,
    threatTrend: "STABLE",
    peakThreatLevel: "NONE",
    mostDetectedClass: "None",
    recentActivityCount: 0,
    historicalData: []
  })
  const [recentDetections, setRecentDetections] = useState<any[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastAlertIdRef = useRef<Set<string>>(new Set())
  const startTimeRef = useRef<number>(0)

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true)
    startTimeRef.current = Date.now()
  }, [])

  // Get real system health metrics using browser APIs
  const updateSystemHealth = useCallback(() => {
    if (typeof window === "undefined") return

    // Get memory usage from Performance API
    const memoryInfo = (performance as any).memory
    const memoryUsage = memoryInfo 
      ? Math.round((memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100)
      : 0

    // Estimate CPU based on memory and activity (browser doesn't expose real CPU)
    const baseCpu = memoryUsage || 30
    const activityVariation = Math.sin(Date.now() / 5000) * 5 // Simulate activity
    const cpuUsage = Math.max(20, Math.min(85, baseCpu + activityVariation))

    // Check network status and connection info
    const networkStatus = navigator.onLine ? "ONLINE" : "OFFLINE"
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    // Calculate uptime
    const uptime = Math.floor((Date.now() - startTimeRef.current) / 1000)

    // Get device and screen info
    const screen = window.screen
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    setSystemHealth({
      cpu: Math.round(cpuUsage),
      memory: memoryUsage,
      network: networkStatus,
      detection: "ACTIVE",
      lastUpdate: new Date(),
      uptime,
      connectionType: connection?.type || "unknown",
      effectiveType: connection?.effectiveType || "unknown",
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false,
      jsHeapSizeLimit: memoryInfo?.jsHeapSizeLimit,
      totalJSHeapSize: memoryInfo?.totalJSHeapSize,
      usedJSHeapSize: memoryInfo?.usedJSHeapSize,
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      platform: navigator.platform,
      userAgent: navigator.userAgent.split(" ")[0], // First part only
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${viewport.width}x${viewport.height}`,
      pixelRatio: window.devicePixelRatio
    })
  }, [])

  // Load real threat statistics from localStorage
  const updateThreatStats = useCallback(() => {
    try {
      const stats = getThreatStats()
      const detections = loadDetections()
      
      // Calculate real statistics
      let criticalCount = 0
      let highCount = 0
      let mediumCount = 0
      let lowCount = 0
      let totalConfidence = 0
      let totalObjects = 0
      let lastDetectionTime: number | null = null

      detections.forEach((detection: any) => {
        if (detection.overallThreatLevel === "CRITICAL") criticalCount++
        else if (detection.overallThreatLevel === "HIGH") highCount++
        else if (detection.overallThreatLevel === "MEDIUM") mediumCount++
        else if (detection.overallThreatLevel === "LOW") lowCount++

        if (detection.overallThreatScore) {
          totalConfidence += detection.overallThreatScore
        }
        if (detection.totalObjects) {
          totalObjects += detection.totalObjects
        }
        if (detection.timestamp && (!lastDetectionTime || detection.timestamp > lastDetectionTime)) {
          lastDetectionTime = detection.timestamp
        }
      })

      const avgConfidence = detections.length > 0 
        ? Math.round((totalConfidence / detections.length) * 10) / 10
        : 0

      // Calculate detection rate (detections per hour)
      const now = Date.now()
      const oneDayAgo = now - 24 * 60 * 60 * 1000
      const recentDetections = detections.filter((d: any) => d.timestamp && d.timestamp > oneDayAgo)
      const detectionRate = recentDetections.length > 0 
        ? Math.round((recentDetections.length / 24) * 10) / 10
        : 0

      // Calculate average processing time
      const totalProcessingTime = detections.reduce((sum: number, d: any) => sum + (d.processingTime || 0), 0)
      const avgProcessingTime = detections.length > 0 
        ? Math.round((totalProcessingTime / detections.length) * 10) / 10
        : 0

      // Determine threat trend (compare last 24h vs previous 24h)
      const twoDaysAgo = now - 48 * 60 * 60 * 1000
      const previousDayDetections = detections.filter((d: any) => 
        d.timestamp && d.timestamp > twoDaysAgo && d.timestamp <= oneDayAgo
      )
      let threatTrend: "INCREASING" | "DECREASING" | "STABLE" = "STABLE"
      if (recentDetections.length > previousDayDetections.length * 1.1) threatTrend = "INCREASING"
      else if (recentDetections.length < previousDayDetections.length * 0.9) threatTrend = "DECREASING"

      // Find peak threat level
      const threatLevels = detections.map((d: any) => d.overallThreatLevel).filter(Boolean)
      const threatCounts: Record<string, number> = {}
      threatLevels.forEach((level: string) => {
        threatCounts[level] = (threatCounts[level] || 0) + 1
      })
      const peakThreatLevel = Object.entries(threatCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || "NONE"

      // Find most detected class
      const classCounts: Record<string, number> = {}
      detections.forEach((d: any) => {
        d.detections?.forEach((det: any) => {
          const className = det.class || "Unknown"
          classCounts[className] = (classCounts[className] || 0) + 1
        })
      })
      const mostDetectedClass = Object.entries(classCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || "None"

      // Generate historical data (last 7 days)
      const historicalData: Array<{ date: string; count: number; level: string }> = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000)
        const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime()
        const dayEnd = dayStart + 24 * 60 * 60 * 1000
        const dayDetections = detections.filter((d: any) => 
          d.timestamp && d.timestamp >= dayStart && d.timestamp < dayEnd
        )
        const dayPeakLevel = dayDetections
          .map((d: any) => d.overallThreatLevel)
          .filter(Boolean)
          .sort((a: string, b: string) => {
            const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 }
            return (order[b as keyof typeof order] || 0) - (order[a as keyof typeof order] || 0)
          })[0] || "NONE"
        
        historicalData.push({
          date: date.toISOString().split('T')[0],
          count: dayDetections.length,
          level: dayPeakLevel
        })
      }

      setThreatStats({
        totalDetections: detections.length,
        criticalThreats: criticalCount,
        highThreats: highCount,
        mediumThreats: mediumCount,
        lowThreats: lowCount,
        totalObjects: totalObjects || stats.totalObjects || 0,
        avgConfidence,
        lastDetectionTime,
        detectionRate,
        avgProcessingTime,
        threatTrend,
        peakThreatLevel,
        mostDetectedClass,
        recentActivityCount: recentDetections.length,
        historicalData
      })

      // Get recent detections (last 5)
      const recent = detections
        .filter((d: any) => d.overallThreatLevel && d.overallThreatLevel !== "NONE")
        .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 5)
        .map((d: any) => ({
          id: d.id,
          timestamp: d.timestamp ? new Date(d.timestamp) : new Date(),
          level: d.overallThreatLevel || "NONE",
          type: d.detections?.[0]?.class || "Unknown",
          confidence: d.overallThreatScore || 0,
          imageUrl: d.detectedImage,
          totalObjects: d.totalObjects || 0
        }))

      setRecentDetections(recent)

      // Generate alerts from new detections
      detections.forEach((detection: any) => {
        if (!detection.id || lastAlertIdRef.current.has(detection.id)) return
        if (!detection.overallThreatLevel || detection.overallThreatLevel === "NONE") return

        const alert: ThreatAlert = {
          id: detection.id,
          timestamp: detection.timestamp ? new Date(detection.timestamp) : new Date(),
          level: detection.overallThreatLevel as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
          type: detection.detections?.[0]?.class || "Unknown Object",
          message: `${detection.overallThreatLevel} threat detected: ${detection.totalObjects || 0} object(s) found`,
          confidence: detection.overallThreatScore || 0,
          detectionId: detection.id,
          imageUrl: detection.detectedImage
        }

        setAlerts(prev => {
          // Check if alert already exists
          if (prev.some(a => a.id === alert.id)) return prev
          return [alert, ...prev].slice(0, 20) // Keep last 20 alerts
        })

        lastAlertIdRef.current.add(detection.id)

        // Play sound for critical/high threats
        if ((alert.level === "CRITICAL" || alert.level === "HIGH")) {
          playAlertSound()
        }
      })
    } catch (error) {
      console.error("Error updating threat stats:", error)
    }
  }, [soundEnabled])

  // Real-time updates - only after mount
  useEffect(() => {
    if (!mounted) return

    // Initial load
    updateThreatStats()
    updateSystemHealth()

    // Poll for new detections every 2 seconds
    const detectionInterval = setInterval(() => {
      updateThreatStats()
    }, 2000)

    // Update system health every 3 seconds
    const healthInterval = setInterval(() => {
      updateSystemHealth()
    }, 3000)

    // Listen for storage changes (when new detections are added)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mareye_detections") {
        updateThreatStats()
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange)
    }

    // Auto-dismiss old alerts (older than 5 minutes)
    const cleanupInterval = setInterval(() => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      setAlerts(prev => prev.filter(alert => alert.timestamp.getTime() > fiveMinutesAgo))
    }, 10000)

    return () => {
      clearInterval(detectionInterval)
      clearInterval(healthInterval)
      clearInterval(cleanupInterval)
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageChange)
      }
    }
  }, [mounted, updateThreatStats, updateSystemHealth])

  // Listen for custom events (when detections are added in same tab)
  useEffect(() => {
    const handleDetectionAdded = () => {
      updateThreatStats()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("detectionAdded", handleDetectionAdded)
      return () => window.removeEventListener("detectionAdded", handleDetectionAdded)
    }
  }, [updateThreatStats])

  // Generate alert sound using Web Audio API (fallback if audio file not available)
  const generateAlertSound = useCallback(() => {
    if (typeof window === "undefined") return
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.warn("Could not generate alert sound:", error)
    }
  }, [])

  const playAlertSound = useCallback(() => {
    if (!soundEnabled) return
    
    // Use Web Audio API to generate alert sound
    generateAlertSound()
  }, [soundEnabled, generateAlertSound])

  const getThreatColor = (level: string) => {
    switch(level) {
      case "CRITICAL": return "red"
      case "HIGH": return "orange"
      case "MEDIUM": return "yellow"
      case "LOW": return "cyan"
      default: return "gray"
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  // Threat Map Visualization Component
  const ThreatMapVisualization = () => {
    const threatObjects = useMemo(() => {
      if (!mounted) return []
      try {
        return getAllThreatObjects()
      } catch {
        return []
      }
    }, [mounted, threatStats.totalDetections])

    const generateThreatCoordinates = (threatId: string, index: number, total: number) => {
      const hash = threatId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const angle = ((hash % 360) + index * (360 / Math.max(total, 1))) * (Math.PI / 180)
      const radius = 30 + ((hash % 100) / 100) * 30
      return {
        x: 50 + (Math.cos(angle) * radius) / 5,
        y: 50 + (Math.sin(angle) * radius) / 5,
      }
    }

    return (
      <div className="bg-slate-900/80 backdrop-blur-md border-2 border-blue-500/40 rounded-2xl p-6 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-500/60" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-500/60" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-500/60" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-500/60" />
        
        <div className="relative z-10">
          <h3 className="text-xl font-black text-blue-300 font-orbitron mb-4 flex items-center gap-3">
            <Map className="w-5 h-5" />
            THREAT MAP
          </h3>

          <div className="relative aspect-square bg-slate-950/80 rounded-xl border-2 border-blue-500/30 overflow-hidden">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
              <defs>
                <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid circles */}
              {[1, 2, 3, 4].map((i) => (
                <circle
                  key={`grid-${i}`}
                  cx="100"
                  cy="100"
                  r={25 * i}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              ))}

              {/* Center point */}
              <circle cx="100" cy="100" r="2" fill="#3b82f6" opacity="0.8" />

              {/* Threat objects */}
              {threatObjects.slice(0, 20).map((threat, index) => {
                const coords = generateThreatCoordinates(threat.id, index, threatObjects.length)
                const threatColor = threat.threat_level === "CRITICAL" ? "#ef4444" :
                  threat.threat_level === "HIGH" ? "#f97316" :
                  threat.threat_level === "MEDIUM" ? "#eab308" : "#06b6d4"
                
                return (
                  <g key={threat.id}>
                    <circle
                      cx={coords.x * 2}
                      cy={coords.y * 2}
                      r="3"
                      fill={threatColor}
                      opacity="0.8"
                      filter="url(#glow)"
                      className="animate-pulse"
                    />
                    <circle
                      cx={coords.x * 2}
                      cy={coords.y * 2}
                      r="6"
                      fill="none"
                      stroke={threatColor}
                      strokeWidth="0.5"
                      opacity="0.4"
                    />
                  </g>
                )
              })}

              {/* Radar sweep */}
              <g className="animate-spin" style={{ animationDuration: "4s", transformOrigin: "100px 100px" }}>
                <line
                  x1="100"
                  y1="100"
                  x2="200"
                  y2="100"
                  stroke="#3b82f6"
                  strokeWidth="1"
                  opacity="0.6"
                />
              </g>
            </svg>

            {threatObjects.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Target className="w-8 h-8 text-blue-400/50 mx-auto mb-2" />
                  <p className="text-xs text-blue-300/60 font-space-mono">No Threats Detected</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-blue-300/60 font-space-mono">
            <span>Active Threats: {threatObjects.length}</span>
            <span>Live Tracking</span>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced Interactive Threat Activity Timeline Component
  const ThreatActivityTimeline = () => {
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [filterLevel, setFilterLevel] = useState<string>("ALL")
    const [searchQuery, setSearchQuery] = useState("")
    const [isExpanded, setIsExpanded] = useState(false)

    const activityTimeline = useMemo(() => {
      if (!mounted) return []
      try {
        const detections = loadDetections()
        let filtered = detections
          .filter(d => d.overallThreatLevel && d.overallThreatLevel !== "NONE")
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
          .map(d => ({
            id: d.id,
            time: d.timestamp ? new Date(d.timestamp) : new Date(),
            level: d.overallThreatLevel || "NONE",
            count: d.totalObjects || 0,
            score: d.overallThreatScore || 0,
            processingTime: d.processingTime || 0,
            detections: d.detections || [],
            imageUrl: d.detectedImage,
            originalImage: d.originalImage,
            fileName: d.originalFileName || "unknown"
          }))

        // Apply filter
        if (filterLevel !== "ALL") {
          filtered = filtered.filter(a => a.level === filterLevel)
        }

        // Apply search
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          filtered = filtered.filter(a => 
            a.level.toLowerCase().includes(query) ||
            a.fileName.toLowerCase().includes(query) ||
            a.detections.some((det: any) => det.class?.toLowerCase().includes(query))
          )
        }

        return isExpanded ? filtered : filtered.slice(0, 8)
      } catch {
        return []
      }
    }, [mounted, threatStats.totalDetections, filterLevel, searchQuery, isExpanded])

    const allLevels = useMemo(() => {
      if (!mounted) return []
      try {
        const detections = loadDetections()
        const levels = new Set(detections
          .filter(d => d.overallThreatLevel && d.overallThreatLevel !== "NONE")
          .map(d => d.overallThreatLevel))
        return Array.from(levels) as string[]
      } catch {
        return []
      }
    }, [mounted, threatStats.totalDetections])

    return (
      <div className="bg-slate-900/80 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl p-6 shadow-2xl shadow-purple-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-purple-500/60" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-purple-500/60" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-purple-500/60" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-purple-500/60" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-purple-300 font-orbitron flex items-center gap-3">
              <Activity className="w-5 h-5" />
              INTERACTIVE TIMELINE
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4 text-purple-300" /> : <Maximize2 className="w-4 h-4 text-purple-300" />}
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-4 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300/60" />
              <input
                type="text"
                placeholder="Search threats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-purple-500/30 rounded-lg text-sm text-white placeholder-purple-300/40 font-space-mono focus:outline-none focus:border-purple-400"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-purple-300/60" />
              <button
                onClick={() => setFilterLevel("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-space-mono transition-all ${
                  filterLevel === "ALL"
                    ? "bg-purple-500/30 border border-purple-400 text-purple-200"
                    : "bg-slate-800/60 border border-purple-500/20 text-purple-300/60 hover:border-purple-400/40"
                }`}
              >
                ALL
              </button>
              {allLevels.map(level => {
                const color = getThreatColor(level)
                return (
                  <button
                    key={level}
                    onClick={() => setFilterLevel(level)}
                    className={`px-3 py-1 rounded-lg text-xs font-space-mono transition-all ${
                      filterLevel === level
                        ? `bg-${color}-500/30 border border-${color}-400 text-${color}-200`
                        : `bg-slate-800/60 border border-${color}-500/20 text-${color}-300/60 hover:border-${color}-400/40`
                    }`}
                  >
                    {level}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityTimeline.length === 0 ? (
              <div className="text-center py-8">
                <TrendingDown className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
                <p className="text-sm text-purple-300/60 font-space-mono">No Activity Found</p>
                <p className="text-xs text-purple-300/40 mt-1">Try adjusting filters or search</p>
              </div>
            ) : (
              activityTimeline.map((activity, index) => {
                const color = getThreatColor(activity.level)
                const isExpanded = expandedId === activity.id
                
                return (
                  <div key={activity.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          color === "red" ? "bg-red-400" :
                          color === "orange" ? "bg-orange-400" :
                          color === "yellow" ? "bg-yellow-400" :
                          "bg-cyan-400"
                        } animate-pulse`} />
                        {index < activityTimeline.length - 1 && (
                          <div className={`w-0.5 h-12 ${
                            color === "red" ? "bg-red-500/30" :
                            color === "orange" ? "bg-orange-500/30" :
                            color === "yellow" ? "bg-yellow-500/30" :
                            "bg-cyan-500/30"
                          }`} />
                        )}
                      </div>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                        className="flex-1 bg-slate-800/60 rounded-lg p-3 border border-purple-500/20 hover:border-purple-400/40 transition-all text-left group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black font-orbitron uppercase px-2 py-1 rounded ${
                              color === "red" ? "bg-red-500/20 text-red-300" :
                              color === "orange" ? "bg-orange-500/20 text-orange-300" :
                              color === "yellow" ? "bg-yellow-500/20 text-yellow-300" :
                              "bg-cyan-500/20 text-cyan-300"
                            }`}>
                              {activity.level}
                            </span>
                            <span className="text-xs text-purple-300/60 font-space-mono">
                              {activity.time.toLocaleString()}
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-purple-300/60" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-purple-300/60" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-purple-300/60 font-space-mono">
                          <span>{activity.count} objects</span>
                          <span>{Math.round(activity.score)}% confidence</span>
                          <span>{activity.processingTime.toFixed(2)}s</span>
                        </div>
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="ml-8 bg-slate-800/80 rounded-lg p-4 border border-purple-500/30 space-y-3">
                        {activity.imageUrl && (
                          <div className="relative">
                            <img 
                              src={activity.imageUrl} 
                              alt="Detection" 
                              className="w-full h-48 object-contain rounded-lg border border-purple-500/30"
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 text-xs font-space-mono">
                          <div>
                            <span className="text-purple-300/60">File:</span>
                            <span className="text-purple-200 ml-2">{activity.fileName}</span>
                          </div>
                          <div>
                            <span className="text-purple-300/60">Processing:</span>
                            <span className="text-purple-200 ml-2">{activity.processingTime.toFixed(2)}s</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-purple-300/60">Detected Objects:</span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {activity.detections.map((det: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 rounded bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs"
                                >
                                  {det.class} ({(det.confidence * 100).toFixed(1)}%)
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    )
  }

  // Threat Heatmap Component
  const ThreatHeatmap = () => {
    const classHeatmap = useMemo(() => {
      if (!mounted) return []
      try {
        const detections = loadDetections()
        const classCount: Record<string, { count: number; totalConfidence: number; maxThreat: string }> = {}

        detections.forEach(detection => {
          detection.detections.forEach(det => {
            const className = det.class || "Unknown"
            if (!classCount[className]) {
              classCount[className] = { count: 0, totalConfidence: 0, maxThreat: "LOW" }
            }
            classCount[className].count++
            classCount[className].totalConfidence += det.confidence * 100
            if (det.threat_level === "CRITICAL") classCount[className].maxThreat = "CRITICAL"
            else if (det.threat_level === "HIGH" && classCount[className].maxThreat !== "CRITICAL") {
              classCount[className].maxThreat = "HIGH"
            } else if (det.threat_level === "MEDIUM" && !["CRITICAL", "HIGH"].includes(classCount[className].maxThreat)) {
              classCount[className].maxThreat = "MEDIUM"
            }
          })
        })

        return Object.entries(classCount)
          .map(([className, data]) => ({
            class: className,
            count: data.count,
            avgConfidence: Math.round(data.totalConfidence / data.count),
            maxThreat: data.maxThreat,
            intensity: Math.min((data.count / Math.max(detections.length, 1)) * 100, 100)
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)
      } catch {
        return []
      }
    }, [mounted, threatStats.totalDetections])

    const maxCount = Math.max(...classHeatmap.map(c => c.count), 1)

    return (
      <div className="bg-slate-900/80 backdrop-blur-md border-2 border-emerald-500/40 rounded-2xl p-6 shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500/60" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500/60" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500/60" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500/60" />
        
        <div className="relative z-10">
          <h3 className="text-xl font-black text-emerald-300 font-orbitron mb-6 flex items-center gap-3">
            <Layers className="w-5 h-5" />
            THREAT HEATMAP BY CLASS
          </h3>

          {classHeatmap.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 text-emerald-400/50 mx-auto mb-3" />
              <p className="text-emerald-300/60 font-space-mono uppercase">No Threat Data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {classHeatmap.map((item) => {
                const color = getThreatColor(item.maxThreat)
                const widthPercent = (item.count / maxCount) * 100
                
                return (
                  <div key={item.class} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          color === "red" ? "bg-red-400" :
                          color === "orange" ? "bg-orange-400" :
                          color === "yellow" ? "bg-yellow-400" :
                          "bg-cyan-400"
                        }`} />
                        <span className="text-sm font-bold text-white font-orbitron">{item.class}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          color === "red" ? "bg-red-500/20 text-red-300" :
                          color === "orange" ? "bg-orange-500/20 text-orange-300" :
                          color === "yellow" ? "bg-yellow-500/20 text-yellow-300" :
                          "bg-cyan-500/20 text-cyan-300"
                        } font-space-mono uppercase`}>
                          {item.maxThreat}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-emerald-300/60 font-space-mono">
                        <span>{item.count} detections</span>
                        <span>{item.avgConfidence}% avg</span>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          color === "red" ? "bg-gradient-to-r from-red-500 to-red-600" :
                          color === "orange" ? "bg-gradient-to-r from-orange-500 to-orange-600" :
                          color === "yellow" ? "bg-gradient-to-r from-yellow-500 to-yellow-600" :
                          "bg-gradient-to-r from-cyan-500 to-cyan-600"
                        }`}
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Prevent hydration mismatch by not rendering client-only content until mounted
  if (!mounted) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
        <SonarGridBackground />
        <div className="relative z-10 min-h-screen pt-32 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-cyan-300 font-space-mono uppercase">Loading Command Center...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
      <SonarGridBackground />
      
      {/* Audio for alerts - Web Audio API will be used */}
      <audio ref={audioRef} preload="none" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/40 rounded-3xl blur-2xl animate-pulse" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-red-500/30 to-orange-500/30 rounded-3xl flex items-center justify-center border-2 border-red-500/60 backdrop-blur-md shadow-2xl shadow-red-500/30">
                  <AlertTriangle className="w-12 h-12 text-red-300 animate-pulse" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-red-300 via-orange-300 to-red-300 bg-clip-text text-transparent font-orbitron tracking-wider">
                  THREAT COMMAND CENTER
                </h1>
                <p className="text-lg text-cyan-200 font-space-mono tracking-wider mt-2">
                  REAL-TIME MARINE SECURITY MONITORING | LIVE THREAT DETECTION
                </p>
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="flex justify-center">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 font-orbitron tracking-wider flex items-center gap-2 ${
                  soundEnabled
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30"
                    : "bg-slate-800/60 border-slate-600/50 text-slate-400 hover:bg-slate-800/80"
                }`}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span className="uppercase">{soundEnabled ? "Alerts On" : "Alerts Off"}</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - System Health & Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Enhanced System Health Card */}
              <div className="bg-slate-900/80 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-500/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-500/60" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-500/60" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-500/60" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-500/60" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-cyan-300 font-orbitron flex items-center gap-3">
                      <Activity className="w-6 h-6" />
                      SYSTEM STATUS
                    </h3>
                    <button
                      onClick={updateSystemHealth}
                      className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-cyan-300" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* CPU */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm text-cyan-300/60 font-space-mono uppercase">CPU Usage</span>
                        </div>
                        <span className="text-lg font-black text-cyan-300 font-orbitron">
                          <AnimatedCounter target={systemHealth.cpu} suffix="%" />
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            systemHealth.cpu > 70 ? "bg-gradient-to-r from-red-500 to-red-600" :
                            systemHealth.cpu > 50 ? "bg-gradient-to-r from-orange-500 to-orange-600" :
                            "bg-gradient-to-r from-cyan-500 to-blue-500"
                          }`}
                          style={{ width: `${systemHealth.cpu}%` }}
                        />
                      </div>
                    </div>

                    {/* Memory */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm text-cyan-300/60 font-space-mono uppercase">Memory</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-cyan-300 font-orbitron">
                            <AnimatedCounter target={systemHealth.memory} suffix="%" />
                          </span>
                          {systemHealth.usedJSHeapSize && systemHealth.totalJSHeapSize && (
                            <span className="text-xs text-cyan-300/50 font-space-mono">
                              ({(systemHealth.usedJSHeapSize / 1024 / 1024).toFixed(0)}MB / {(systemHealth.totalJSHeapSize / 1024 / 1024).toFixed(0)}MB)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            systemHealth.memory > 80 ? "bg-gradient-to-r from-red-500 to-red-600" :
                            systemHealth.memory > 60 ? "bg-gradient-to-r from-orange-500 to-orange-600" :
                            "bg-gradient-to-r from-blue-500 to-cyan-500"
                          }`}
                          style={{ width: `${systemHealth.memory}%` }}
                        />
                      </div>
                    </div>

                    {/* Network Status */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border border-cyan-500/20">
                        <div className="flex items-center gap-2">
                          {systemHealth.network === "ONLINE" ? (
                            <Wifi className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <WifiOff className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-xs text-cyan-300/60 font-space-mono uppercase">Network</span>
                        </div>
                        <span className={`text-xs font-black font-orbitron ${
                          systemHealth.network === "ONLINE" ? "text-emerald-300" : "text-red-300"
                        }`}>
                          {systemHealth.network}
                        </span>
                      </div>
                      {systemHealth.effectiveType && systemHealth.effectiveType !== "unknown" && (
                        <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border border-cyan-500/20">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs text-cyan-300/60 font-space-mono uppercase">Connection</span>
                          </div>
                          <span className="text-xs font-black text-cyan-300 font-orbitron">
                            {systemHealth.effectiveType.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Device Info */}
                    <div className="space-y-2 pt-2 border-t border-cyan-500/20">
                      {systemHealth.hardwareConcurrency && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-cyan-300/60 font-space-mono">CPU Cores:</span>
                          <span className="text-cyan-300 font-orbitron">{systemHealth.hardwareConcurrency}</span>
                        </div>
                      )}
                      {systemHealth.deviceMemory && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-cyan-300/60 font-space-mono">Device Memory:</span>
                          <span className="text-cyan-300 font-orbitron">{systemHealth.deviceMemory}GB</span>
                        </div>
                      )}
                      {systemHealth.screenResolution && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-cyan-300/60 font-space-mono">Screen:</span>
                          <span className="text-cyan-300 font-orbitron">{systemHealth.screenResolution}</span>
                        </div>
                      )}
                      {systemHealth.downlink && systemHealth.downlink > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-cyan-300/60 font-space-mono">Downlink:</span>
                          <span className="text-cyan-300 font-orbitron">{systemHealth.downlink.toFixed(1)} Mbps</span>
                        </div>
                      )}
                    </div>

                    {/* Uptime */}
                    <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border border-cyan-500/20">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm text-cyan-300/60 font-space-mono uppercase">Uptime</span>
                      </div>
                      <span className="text-sm font-black text-cyan-300 font-orbitron">
                        {formatUptime(systemHealth.uptime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Live Statistics Card */}
              <div className="bg-slate-900/80 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-500/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-500/60" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-500/60" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-500/60" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-500/60" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-cyan-300 font-orbitron flex items-center gap-3">
                      <BarChart3 className="w-6 h-6" />
                      LIVE STATISTICS
                    </h3>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${
                      threatStats.threatTrend === "INCREASING" ? "bg-red-500/10 border-red-500/30" :
                      threatStats.threatTrend === "DECREASING" ? "bg-emerald-500/10 border-emerald-500/30" :
                      "bg-yellow-500/10 border-yellow-500/30"
                    }`}>
                      {threatStats.threatTrend === "INCREASING" ? (
                        <ArrowUp className="w-4 h-4 text-red-300" />
                      ) : threatStats.threatTrend === "DECREASING" ? (
                        <ArrowDown className="w-4 h-4 text-emerald-300" />
                      ) : (
                        <Activity className="w-4 h-4 text-yellow-300" />
                      )}
                      <span className={`text-xs font-orbitron uppercase ${
                        threatStats.threatTrend === "INCREASING" ? "text-red-300" :
                        threatStats.threatTrend === "DECREASING" ? "text-emerald-300" :
                        "text-yellow-300"
                      }`}>
                        {threatStats.threatTrend}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/60 rounded-lg p-4 border border-cyan-500/20 text-center hover:border-cyan-400/50 transition-all">
                        <div className="text-3xl font-black text-cyan-300 font-orbitron mb-1">
                          <AnimatedCounter target={threatStats.totalDetections} suffix="" />
                        </div>
                        <div className="text-xs text-cyan-300/60 font-space-mono uppercase">Total Scans</div>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-4 border border-cyan-500/20 text-center hover:border-cyan-400/50 transition-all">
                        <div className="text-3xl font-black text-cyan-300 font-orbitron mb-1">
                          <AnimatedCounter target={threatStats.totalObjects} suffix="" />
                        </div>
                        <div className="text-xs text-cyan-300/60 font-space-mono uppercase">Objects</div>
                      </div>
                    </div>

                    {/* Threat Level Breakdown */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/15 transition-all">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-red-300 font-space-mono uppercase">Critical</span>
                          <span className="text-xs text-red-300/60">({threatStats.peakThreatLevel === "CRITICAL" ? "Peak" : ""})</span>
                        </div>
                        <span className="text-lg font-black text-red-300 font-orbitron">
                          <AnimatedCounter target={threatStats.criticalThreats} suffix="" />
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg hover:bg-orange-500/15 transition-all">
                        <span className="text-sm text-orange-300 font-space-mono uppercase">High</span>
                        <span className="text-lg font-black text-orange-300 font-orbitron">
                          <AnimatedCounter target={threatStats.highThreats} suffix="" />
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/15 transition-all">
                        <span className="text-sm text-yellow-300 font-space-mono uppercase">Medium</span>
                        <span className="text-lg font-black text-yellow-300 font-orbitron">
                          <AnimatedCounter target={threatStats.mediumThreats} suffix="" />
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/15 transition-all">
                        <span className="text-sm text-cyan-300 font-space-mono uppercase">Low</span>
                        <span className="text-lg font-black text-cyan-300 font-orbitron">
                          <AnimatedCounter target={threatStats.lowThreats} suffix="" />
                        </span>
                      </div>
                    </div>

                    {/* Advanced Metrics */}
                    <div className="pt-4 border-t border-cyan-500/20 space-y-3">
                      {threatStats.avgConfidence > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-cyan-300/60 font-space-mono uppercase">Avg Confidence</span>
                          <span className="text-lg font-black text-cyan-300 font-orbitron">
                            <AnimatedCounter target={Math.round(threatStats.avgConfidence)} suffix="%" />
                          </span>
                        </div>
                      )}
                      {threatStats.detectionRate > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-cyan-300/60 font-space-mono uppercase">Detection Rate</span>
                          <span className="text-lg font-black text-cyan-300 font-orbitron">
                            {threatStats.detectionRate.toFixed(1)}/hr
                          </span>
                        </div>
                      )}
                      {threatStats.avgProcessingTime > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-cyan-300/60 font-space-mono uppercase">Avg Processing</span>
                          <span className="text-lg font-black text-cyan-300 font-orbitron">
                            {threatStats.avgProcessingTime.toFixed(2)}s
                          </span>
                        </div>
                      )}
                      {threatStats.recentActivityCount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-cyan-300/60 font-space-mono uppercase">24h Activity</span>
                          <span className="text-lg font-black text-cyan-300 font-orbitron">
                            <AnimatedCounter target={threatStats.recentActivityCount} suffix="" />
                          </span>
                        </div>
                      )}
                      {threatStats.mostDetectedClass !== "None" && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-cyan-300/60 font-space-mono uppercase">Top Class</span>
                          <span className="text-sm font-black text-cyan-300 font-orbitron">
                            {threatStats.mostDetectedClass}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Historical Chart Preview */}
                    {threatStats.historicalData.length > 0 && (
                      <div className="pt-4 border-t border-cyan-500/20">
                        <div className="text-xs text-cyan-300/60 font-space-mono uppercase mb-2">7-Day Trend</div>
                        <div className="flex items-end justify-between h-16 gap-1">
                          {threatStats.historicalData.map((day, idx) => {
                            const maxCount = Math.max(...threatStats.historicalData.map(d => d.count), 1)
                            const height = (day.count / maxCount) * 100
                            const color = getThreatColor(day.level)
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center">
                                <div
                                  className={`w-full rounded-t transition-all duration-500 ${
                                    color === "red" ? "bg-red-500/60" :
                                    color === "orange" ? "bg-orange-500/60" :
                                    color === "yellow" ? "bg-yellow-500/60" :
                                    "bg-cyan-500/60"
                                  }`}
                                  style={{ height: `${Math.max(height, 5)}%` }}
                                />
                                <div className="text-[8px] text-cyan-300/40 font-space-mono mt-1">
                                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Alerts & Recent Detections */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Alerts */}
              <div className="bg-slate-900/80 backdrop-blur-md border-2 border-red-500/40 rounded-2xl p-6 shadow-2xl shadow-red-500/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500/60" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500/60" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500/60" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500/60" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black text-red-300 font-orbitron tracking-wider flex items-center gap-3">
                      <Bell className="w-6 h-6 animate-pulse" />
                      ACTIVE ALERTS
                    </h3>
                    <div className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg">
                      <span className="text-sm font-black text-red-300 font-orbitron">{alerts.length}</span>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                        <p className="text-emerald-300 font-space-mono uppercase">No Active Threats</p>
                        <p className="text-sm text-emerald-300/60 mt-1">System is secure</p>
                      </div>
                    ) : (
                      alerts.map((alert) => {
                        const color = getThreatColor(alert.level)
                        return (
                          <div
                            key={alert.id}
                            className={`bg-slate-800/60 border-2 rounded-xl p-4 transition-all duration-300 hover:scale-105 ${
                              color === "red" ? "border-red-500/50 hover:border-red-400" :
                              color === "orange" ? "border-orange-500/50 hover:border-orange-400" :
                              color === "yellow" ? "border-yellow-500/50 hover:border-yellow-400" :
                              "border-cyan-500/50 hover:border-cyan-400"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  color === "red" ? "bg-red-500/20" :
                                  color === "orange" ? "bg-orange-500/20" :
                                  color === "yellow" ? "bg-yellow-500/20" :
                                  "bg-cyan-500/20"
                                }`}>
                                  <AlertTriangle className={`w-5 h-5 ${
                                    color === "red" ? "text-red-400" :
                                    color === "orange" ? "text-orange-400" :
                                    color === "yellow" ? "text-yellow-400" :
                                    "text-cyan-400"
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-black font-orbitron uppercase px-2 py-1 rounded ${
                                      color === "red" ? "bg-red-500/20 text-red-300" :
                                      color === "orange" ? "bg-orange-500/20 text-orange-300" :
                                      color === "yellow" ? "bg-yellow-500/20 text-yellow-300" :
                                      "bg-cyan-500/20 text-cyan-300"
                                    }`}>
                                      {alert.level}
                                    </span>
                                    <span className="text-xs text-cyan-300/60 font-space-mono">
                                      {formatTimeAgo(alert.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-sm font-bold text-white mb-1">{alert.message}</p>
                                  <div className="flex items-center gap-4 text-xs text-cyan-300/60 font-space-mono">
                                    <span>Type: {alert.type}</span>
                                    <span>Confidence: {Math.round(alert.confidence)}%</span>
                                  </div>
                                </div>
                              </div>
                              {alert.imageUrl && (
                                <img 
                                  src={alert.imageUrl} 
                                  alt="Detection" 
                                  className="w-20 h-20 rounded-lg object-cover border-2 border-cyan-500/30"
                                />
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Detections */}
              <div className="bg-slate-900/80 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-500/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/60" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/60" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/60" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/60" />
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-cyan-300 font-orbitron mb-6 tracking-wider flex items-center gap-3">
                    <Radar className="w-6 h-6" />
                    RECENT DETECTIONS
                  </h3>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {recentDetections.length === 0 ? (
                      <div className="text-center py-8">
                        <Target className="w-12 h-12 text-cyan-400/50 mx-auto mb-3" />
                        <p className="text-cyan-300/60 font-space-mono uppercase">No Recent Detections</p>
                        <p className="text-sm text-cyan-300/40 mt-1">Run detection to see results here</p>
                      </div>
                    ) : (
                      recentDetections.map((detection) => {
                        const color = getThreatColor(detection.level)
                        return (
                          <div
                            key={detection.id}
                            className={`bg-slate-800/60 border-2 rounded-xl p-4 transition-all duration-300 hover:scale-105 ${
                              color === "red" ? "border-red-500/30 hover:border-red-400" :
                              color === "orange" ? "border-orange-500/30 hover:border-orange-400" :
                              color === "yellow" ? "border-yellow-500/30 hover:border-yellow-400" :
                              "border-cyan-500/30 hover:border-cyan-400"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              {detection.imageUrl && (
                                <img 
                                  src={detection.imageUrl} 
                                  alt="Detection" 
                                  className="w-16 h-16 rounded-lg object-cover border-2 border-cyan-500/30"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs font-black font-orbitron uppercase px-2 py-1 rounded ${
                                    color === "red" ? "bg-red-500/20 text-red-300" :
                                    color === "orange" ? "bg-orange-500/20 text-orange-300" :
                                    color === "yellow" ? "bg-yellow-500/20 text-yellow-300" :
                                    "bg-cyan-500/20 text-cyan-300"
                                  }`}>
                                    {detection.level}
                                  </span>
                                  <span className="text-xs text-cyan-300/60 font-space-mono">
                                    {formatTimeAgo(detection.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm font-bold text-white mb-1">{detection.type}</p>
                                <div className="flex items-center gap-4 text-xs text-cyan-300/60 font-space-mono">
                                  <span>Objects: {detection.totalObjects}</span>
                                  <span>Confidence: {Math.round(detection.confidence)}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Real-Time Threat Map & Activity Feed */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Interactive Threat Map */}
                <ThreatMapVisualization />
                
                {/* Threat Activity Timeline */}
                <ThreatActivityTimeline />
              </div>

              {/* Threat Heatmap by Class */}
              <ThreatHeatmap />
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  )
}

