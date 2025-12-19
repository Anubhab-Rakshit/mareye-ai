"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, Image as ImageIcon, Video, Sparkles, Download, RotateCcw, Zap, TrendingUp, Eye, FileImage, FileVideo, Loader2, CheckCircle2, AlertCircle, BarChart3, Palette, Layers, FileText, Maximize2, X, Radar, Shield, Lock, Activity, AlertTriangle, Radio, Satellite, Waves, Gauge, Cpu, HardDrive, Network, Power, Monitor, GaugeCircle, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { SonarGridBackground } from "@/components/sonar-grid-background"
import { AnalyticsSection } from "@/components/cnn-analytics-section"

interface EnhancementMetrics {
  psnr?: number
  ssim?: number
  uiqm_original?: number
  uiqm_enhanced?: number
  uiqm_improvement?: number
  processingTime?: number
}

interface EnhancementResult {
  success: boolean
  type: "image" | "video"
  originalImage?: string
  enhancedImage?: string
  originalVideo?: string
  enhancedVideo?: string
  metrics?: EnhancementMetrics
  error?: string
  originalFileName?: string
}

export function CNNEnhancementView() {
  const [activeTab, setActiveTab] = useState<"image" | "video">("image")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<EnhancementResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string | null>(null)
  const [enhancedPreview, setEnhancedPreview] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [analyticsTab, setAnalyticsTab] = useState<string>("dashboard")
  const [selectedGraph, setSelectedGraph] = useState<string | null>(null)
  const [systemStatus, setSystemStatus] = useState<"secure" | "processing" | "ready">("ready")
  const [depth, setDepth] = useState(450) // Realistic submarine depth: 450m
  const [pressure, setPressure] = useState(4500) // Realistic pressure at depth
  const [temperature, setTemperature] = useState(4)
  const [cpuUsage, setCpuUsage] = useState(45) // CPU usage percentage
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isProcessing) {
      setSystemStatus("processing")
    } else if (result) {
      setSystemStatus("secure")
    } else {
      setSystemStatus("ready")
    }
  }, [isProcessing, result])

  // Simulate submarine depth, pressure, temperature, and CPU readings
  useEffect(() => {
    const interval = setInterval(() => {
      // Depth: realistic submarine depth between 200-800m, with small variations
      setDepth(prev => {
        const variation = (Math.random() - 0.5) * 5 // ±2.5m variation
        const newDepth = prev + variation
        // Keep depth in realistic submarine range (200-800m)
        const clampedDepth = Math.max(200, Math.min(800, newDepth))
        
        // Pressure: calculated from depth (1 bar per 10m depth + atmospheric pressure)
        const calculatedPressure = 1013 + (clampedDepth * 10) + (Math.random() * 20 - 10)
        setPressure(calculatedPressure)
        
        return clampedDepth
      })
      
      // Temperature: deep ocean temperature 2-6°C
      setTemperature(prev => {
        const variation = (Math.random() - 0.5) * 0.5
        return Math.max(2, Math.min(6, prev + variation))
      })
      
      // CPU Usage: varies between 30-75% with realistic fluctuations
      setCpuUsage(prev => {
        const variation = (Math.random() - 0.5) * 8 // ±4% variation
        const newCpu = prev + variation
        return Math.max(30, Math.min(75, Math.round(newCpu)))
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (activeTab === "image") {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file")
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setOriginalPreview(e.target?.result as string)
        setResult(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    } else {
      if (!file.type.startsWith("video/")) {
        setError("Please select a video file")
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setOriginalPreview(e.target?.result as string)
        setResult(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEnhance = async () => {
    const input = activeTab === "image" ? fileInputRef.current : videoInputRef.current
    const file = input?.files?.[0]
    
    if (!file) {
      setError("Please select a file first")
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", activeTab)

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch("/api/cnn/process", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Enhancement failed")
      }

      const data = await response.json()
      
      if (data.success) {
        setResult(data)
        if (data.enhancedImage) {
          setEnhancedPreview(data.enhancedImage)
        } else if (data.enhancedVideo) {
          setEnhancedPreview(data.enhancedVideo)
        }
        
        setTimeout(() => {
          fetchAnalytics(file.name)
        }, 2000)
      } else {
        throw new Error(data.error || "Enhancement failed")
      }
    } catch (err) {
      console.error("Enhancement error:", err)
      setError(err instanceof Error ? err.message : "Failed to enhance file")
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const fetchAnalytics = async (imageName: string) => {
    setLoadingAnalytics(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const response = await fetch('/api/analytics')
      const data = await response.json()
      
      if (data.success && data.analyses.length > 0) {
        const imageNameBase = imageName.replace(/\.[^/.]+$/, "").toLowerCase()
        const imageAnalytics = data.analyses.find((a: any) => 
          a.analysisName.toLowerCase().includes(imageNameBase)
        ) || data.analyses[0]
        
        setAnalytics(imageAnalytics)
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setOriginalPreview(null)
    setEnhancedPreview(null)
    setAnalytics(null)
    setError(null)
    setAnalyticsTab("dashboard")
    setSelectedGraph(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (videoInputRef.current) videoInputRef.current.value = ""
  }

  const handleDownload = () => {
    if (!result) return

    if (activeTab === "image" && result.enhancedImage) {
      const link = document.createElement("a")
      link.href = result.enhancedImage
      link.download = `enhanced_${Date.now()}.jpg`
      link.click()
    } else if (activeTab === "video" && result.enhancedVideo) {
      const link = document.createElement("a")
      link.href = result.enhancedVideo
      link.download = `enhanced_${Date.now()}.avi`
      link.click()
    }
  }

  return (
    <div className="relative min-h-screen w-full text-foreground overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
      <SonarGridBackground />
      
      {/* Multiple Radar Scanners - Submarine Control Room Style - Top Right */}
      <div className="fixed top-28 right-4 w-40 h-40 z-20 pointer-events-none hidden md:block">
        <div className="relative w-full h-full">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="absolute inset-0 border border-cyan-500/30 rounded-full"
              style={{
                width: `${100 - i * 12}%`,
                height: `${100 - i * 12}%`,
                left: `${i * 6}%`,
                top: `${i * 6}%`,
              }}
            />
          ))}
          <div className="absolute inset-0">
            <div
              className="absolute top-1/2 left-1/2 w-1/2 h-1 origin-top-left"
              style={{
                background: 'linear-gradient(to bottom, transparent, rgba(6, 182, 212, 0.5))',
                transform: 'translate(-50%, -50%)',
                animation: 'radar-sweep 2s linear infinite',
                clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
              }}
            />
          </div>
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-cyan-400/70 animate-pulse" />
          {/* Crosshairs */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-cyan-500/20" />
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-cyan-500/20" />
        </div>
      </div>

      {/* Secondary Radar - Bottom Right Corner */}
      <div className="fixed bottom-24 right-4 w-28 h-28 z-20 pointer-events-none hidden md:block">
        <div className="relative w-full h-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute inset-0 border border-blue-500/20 rounded-full"
              style={{
                width: `${100 - i * 20}%`,
                height: `${100 - i * 20}%`,
                left: `${i * 10}%`,
                top: `${i * 10}%`,
                animation: `sonar-pulse ${2 + i * 0.3}s ease-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Control Room Status Panels - Left Side */}
      <div className="fixed top-28 left-4 z-30 space-y-3 w-52 hidden md:block">
        {/* Main System Status */}
        <Card className="bg-slate-900/90 backdrop-blur-md border-2 border-cyan-500/40 shadow-xl shadow-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-4 h-4 rounded-full ${
                  systemStatus === "secure" ? "bg-emerald-400" :
                  systemStatus === "processing" ? "bg-yellow-400" :
                  "bg-cyan-400"
                }`} />
                <div className={`absolute inset-0 rounded-full ${
                  systemStatus === "secure" ? "bg-emerald-400" :
                  systemStatus === "processing" ? "bg-yellow-400" :
                  "bg-cyan-400"
                } animate-ping opacity-75`} />
              </div>
              <div>
                <p className="text-xs text-cyan-300/60 font-space-mono uppercase tracking-wider">SYSTEM STATUS</p>
                <p className="text-sm font-bold text-white font-orbitron">
                  {systemStatus === "secure" ? "SECURE" :
                   systemStatus === "processing" ? "PROCESSING" :
                   "READY"}
                </p>
              </div>
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        {/* Submarine Depth Gauge */}
        <Card className="bg-slate-900/90 backdrop-blur-md border-2 border-blue-500/40 shadow-xl">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-blue-300/60 font-space-mono uppercase">DEPTH</p>
                <Waves className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-black text-blue-300 font-orbitron">{Math.floor(depth)}</p>
                <p className="text-xs text-blue-300/60">m</p>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                  style={{ width: `${(depth / 5000) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pressure Gauge */}
        <Card className="bg-slate-900/90 backdrop-blur-md border-2 border-cyan-500/40 shadow-xl">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-cyan-300/60 font-space-mono uppercase">PRESSURE</p>
                <Gauge className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-black text-cyan-300 font-orbitron">{Math.floor(pressure)}</p>
                <p className="text-xs text-cyan-300/60">hPa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temperature Display */}
        <Card className="bg-slate-900/90 backdrop-blur-md border-2 border-cyan-500/40 shadow-xl">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-cyan-300/60 font-space-mono uppercase">TEMP</p>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-black text-cyan-300 font-orbitron">{temperature.toFixed(1)}</p>
                <p className="text-xs text-cyan-300/60">°C</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel - Right Side (Below Radar) */}
      <div className="fixed top-[19rem] right-4 z-30 space-y-3 w-40 hidden md:block">
        {/* Power Status */}
        <Card className="bg-slate-900/90 backdrop-blur-md border-2 border-emerald-500/40 shadow-xl">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Power className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <p className="text-xs text-emerald-300/60 font-space-mono uppercase">POWER</p>
                <p className="text-sm font-bold text-emerald-300 font-orbitron">ONLINE</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CPU Status */}
        <Card className="bg-slate-900/90 backdrop-blur-md border-2 border-cyan-500/40 shadow-xl">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-xs text-cyan-300/60 font-space-mono uppercase">CPU</p>
                <p className="text-sm font-bold text-cyan-300 font-orbitron">{cpuUsage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Status */}
        <Card className="bg-slate-900/90 backdrop-blur-md border-2 border-blue-500/40 shadow-xl">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-400 animate-pulse" />
              <div>
                <p className="text-xs text-blue-300/60 font-space-mono uppercase">NETWORK</p>
                <p className="text-sm font-bold text-blue-300 font-orbitron">ACTIVE</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Control Room Interface */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8">
        {/* Responsive layout - add margin for fixed panels on desktop */}
        <div className="md:ml-64 md:mr-56 ml-0 mr-0 max-w-none">
          {/* Submarine Control Room Header */}
          <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-6 mb-6 flex-wrap">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/40 rounded-2xl blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-2xl flex items-center justify-center border-2 border-cyan-500/60 backdrop-blur-md shadow-2xl shadow-cyan-500/30">
                <Radar className="w-12 h-12 md:w-16 md:h-16 text-cyan-300 animate-spin-slow" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-2 bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent animate-gradient font-orbitron tracking-wider">
                SUBMARINE
              </h1>
              <h2 className="text-3xl md:text-4xl lg:text-6xl font-black mb-2 bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent animate-gradient font-orbitron tracking-wider">
                CONTROL ROOM
              </h2>
              <p className="text-lg md:text-xl text-cyan-200 font-space-mono tracking-widest mt-2">
                CNN ENHANCEMENT SYSTEM | MARINE SECURITY
              </p>
            </div>
          </div>
          
          {/* Security Badges Row */}
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/40 px-5 py-2.5 shadow-lg">
              <Lock className="w-4 h-4 mr-2" />
              ENCRYPTED
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500/40 px-5 py-2.5 shadow-lg">
              <Shield className="w-4 h-4 mr-2" />
              SECURE
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-2 border-blue-500/40 px-5 py-2.5 shadow-lg">
              <Satellite className="w-4 h-4 mr-2" />
              ACTIVE
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-2 border-purple-500/40 px-5 py-2.5 shadow-lg">
              <Monitor className="w-4 h-4 mr-2" />
              OPERATIONAL
            </Badge>
          </div>
        </div>

        {/* Main Control Panel */}
        <div className="w-full max-w-none">
          <Card className="bg-slate-900/80 backdrop-blur-md border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/20 relative overflow-hidden">
            {/* HUD Corner Brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/60" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/60" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/60" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/60" />
            
            {/* Scan Line Effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-scan" />
            </div>

            <CardContent className="p-0 relative z-10">
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as "image" | "video"); handleReset() }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-transparent backdrop-blur-md border-0 border-b-2 border-cyan-500/40 rounded-none shadow-none m-0 p-0 h-auto">
                  <TabsTrigger value="image" className="flex items-center gap-3 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-400 border-0 border-b-2 data-[state=active]:border-b-cyan-400 border-transparent rounded-none py-4 px-6 font-orbitron font-bold text-lg">
                    <ImageIcon className="w-6 h-6" />
                    <span>IMAGE ENHANCEMENT</span>
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-3 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-400 border-0 border-b-2 data-[state=active]:border-b-cyan-400 border-transparent rounded-none py-4 px-6 font-orbitron font-bold text-lg">
                    <Video className="w-6 h-6" />
                    <span>VIDEO ENHANCEMENT</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="image" className="space-y-6 mt-0 p-6">
                <CardHeader className="border-b-2 border-cyan-500/30 relative z-10 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-4 text-cyan-300 text-2xl font-orbitron">
                      <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/40">
                        <FileImage className="w-8 h-8" />
                      </div>
                      <span className="tracking-wider">IMAGE PROCESSING STATION</span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40">ACTIVE</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 relative z-10">
                  {/* Upload Area - Control Panel Style */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-cyan-500/50 rounded-xl p-16 text-center cursor-pointer hover:border-cyan-400/70 hover:bg-cyan-500/10 transition-all duration-300 group overflow-hidden"
                  >
                    {/* Grid Pattern Background */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }} />
                    </div>
                    
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Scanning lines effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-30">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent animate-scan" />
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="relative z-10">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-cyan-500/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 border-2 border-cyan-500/40 shadow-lg shadow-cyan-500/20">
                        <Upload className="w-12 h-12 text-cyan-400" />
                      </div>
                      <p className="text-cyan-200 font-bold mb-3 text-xl font-orbitron tracking-wider">
                        CLICK TO UPLOAD OR DRAG AND DROP
                      </p>
                      <p className="text-sm text-cyan-300/70 font-space-mono uppercase tracking-wider">
                        PNG, JPG, JPEG up to 10MB
                      </p>
                    </div>
                  </div>

                  {/* Preview and Results - Control Room Display Style */}
                  {(originalPreview || result) && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Original - HUD Display */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2 uppercase tracking-wider font-orbitron">
                            <Eye className="w-5 h-5" />
                            Original Feed
                          </h3>
                          <Badge className="bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500/40 font-space-mono">SOURCE</Badge>
                        </div>
                        {originalPreview && (
                          <div className="relative rounded-lg overflow-hidden border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/20 group">
                            {/* HUD Overlay */}
                            <div className="absolute inset-0 pointer-events-none z-20">
                              <div className="absolute top-2 left-2 bg-slate-900/80 px-2 py-1 rounded border border-cyan-500/40">
                                <p className="text-xs text-cyan-300 font-space-mono">CAM-01</p>
                              </div>
                              <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded border border-cyan-500/40">
                                <p className="text-xs text-cyan-300 font-space-mono">LIVE</p>
                              </div>
                              <div className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-1 rounded border border-cyan-500/40">
                                <p className="text-xs text-cyan-300 font-space-mono">ORIGINAL</p>
                              </div>
                            </div>
                            <img
                              src={originalPreview}
                              alt="Original"
                              className="w-full h-auto"
                            />
                          </div>
                        )}
                      </div>

                      {/* Enhanced - HUD Display */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2 uppercase tracking-wider font-orbitron">
                            <Zap className="w-5 h-5" />
                            Enhanced Feed
                          </h3>
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/40 font-space-mono">ENHANCED</Badge>
                        </div>
                        {enhancedPreview ? (
                          <div className="relative rounded-lg overflow-hidden border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/20 group">
                            {/* HUD Overlay */}
                            <div className="absolute inset-0 pointer-events-none z-20">
                              <div className="absolute top-2 left-2 bg-slate-900/80 px-2 py-1 rounded border border-emerald-500/40">
                                <p className="text-xs text-emerald-300 font-space-mono">CNN-ENH</p>
                              </div>
                              <div className="absolute top-2 right-2 bg-emerald-500/80 px-2 py-1 rounded border border-emerald-500/40">
                                <p className="text-xs text-white font-space-mono flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  ACTIVE
                                </p>
                              </div>
                              <div className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-1 rounded border border-emerald-500/40">
                                <p className="text-xs text-emerald-300 font-space-mono">ENHANCED</p>
                              </div>
                            </div>
                            <img
                              src={enhancedPreview}
                              alt="Enhanced"
                              className="w-full h-auto"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-slate-800/70 rounded-lg border-2 border-cyan-500/30 flex items-center justify-center relative overflow-hidden">
                            {/* Grid Pattern */}
                            <div className="absolute inset-0 opacity-20">
                              <div className="absolute inset-0" style={{
                                backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
                                backgroundSize: '20px 20px'
                              }} />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-shimmer" />
                            <div className="relative z-10 text-center">
                              <Loader2 className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
                              <p className="text-cyan-300/70 font-space-mono uppercase tracking-wider">ENHANCED FEED WILL APPEAR HERE</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Metrics - Control Panel Gauges */}
                  {result?.metrics && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-slate-800/60 rounded-lg border-2 border-cyan-500/30 shadow-xl relative overflow-hidden">
                      {/* Grid Background */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
                          backgroundSize: '30px 30px'
                        }} />
                      </div>
                      
                      {result.metrics.psnr && (
                        <div className="text-center p-4 bg-slate-900/70 rounded-lg border-2 border-cyan-500/30 relative z-10">
                          <GaugeCircle className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                          <p className="text-xs text-cyan-300/60 mb-2 font-space-mono uppercase tracking-wider">PSNR</p>
                          <p className="text-3xl font-black text-cyan-300 font-orbitron">{result.metrics.psnr.toFixed(2)}</p>
                          <p className="text-xs text-cyan-300/40 font-space-mono">dB</p>
                        </div>
                      )}
                      {result.metrics.ssim && (
                        <div className="text-center p-4 bg-slate-900/70 rounded-lg border-2 border-cyan-500/30 relative z-10">
                          <BarChart3 className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                          <p className="text-xs text-cyan-300/60 mb-2 font-space-mono uppercase tracking-wider">SSIM</p>
                          <p className="text-3xl font-black text-cyan-300 font-orbitron">{result.metrics.ssim.toFixed(3)}</p>
                        </div>
                      )}
                      {result.metrics.uiqm_improvement && (
                        <div className="text-center p-4 bg-slate-900/70 rounded-lg border-2 border-emerald-500/30 relative z-10">
                          <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                          <p className="text-xs text-emerald-300/60 mb-2 font-space-mono uppercase tracking-wider">UIQM</p>
                          <p className="text-3xl font-black text-emerald-300 font-orbitron">+{result.metrics.uiqm_improvement.toFixed(2)}</p>
                        </div>
                      )}
                      {result.metrics.processingTime && (
                        <div className="text-center p-4 bg-slate-900/70 rounded-lg border-2 border-cyan-500/30 relative z-10">
                          <Activity className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                          <p className="text-xs text-cyan-300/60 mb-2 font-space-mono uppercase tracking-wider">Time</p>
                          <p className="text-3xl font-black text-cyan-300 font-orbitron">{result.metrics.processingTime.toFixed(1)}</p>
                          <p className="text-xs text-cyan-300/40 font-space-mono">sec</p>
                        </div>
                      )}
                      {result.metrics.processingTime === undefined && result.metrics && (
                        <div className="text-center p-4 bg-slate-900/70 rounded-lg border-2 border-emerald-500/30 relative z-10">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                          <p className="text-xs text-emerald-300/60 mb-2 font-space-mono uppercase tracking-wider">Status</p>
                          <p className="text-3xl font-black text-emerald-300 font-orbitron flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-8 h-8" />
                          </p>
                          <p className="text-xs text-emerald-300/60 font-space-mono">ENHANCED</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comprehensive Analytics Section */}
                  <AnalyticsSection
                    result={result}
                    analytics={analytics}
                    loadingAnalytics={loadingAnalytics}
                    onRefresh={() => fetchAnalytics(result?.originalFileName || "")}
                  />

                  {/* Error Message - Alert Panel */}
                  {error && (
                    <div className="flex items-center gap-4 p-5 bg-red-500/20 border-2 border-red-500/50 rounded-lg text-red-200 backdrop-blur-md relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent animate-shimmer" />
                      <AlertTriangle className="w-6 h-6 animate-pulse relative z-10" />
                      <p className="text-sm font-bold font-space-mono uppercase tracking-wider relative z-10">{error}</p>
                    </div>
                  )}

                  {/* Progress - Control Panel Display */}
                  {isProcessing && (
                    <div className="space-y-4 p-6 bg-slate-800/60 rounded-lg border-2 border-cyan-500/30 shadow-xl relative overflow-hidden">
                      {/* Grid Background */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
                          backgroundSize: '20px 20px'
                        }} />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm relative z-10">
                        <div className="flex items-center gap-3">
                          <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                          <span className="text-cyan-300 font-bold font-space-mono uppercase tracking-wider">Processing Enhancement...</span>
                        </div>
                        <span className="text-cyan-300 font-black text-xl font-orbitron">{progress}%</span>
                      </div>
                      <div className="relative h-4 bg-slate-900/70 rounded-full overflow-hidden border-2 border-cyan-500/30 z-10">
                        <div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/50"
                          style={{ width: `${progress}%` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons - Control Panel Style */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handleEnhance}
                      disabled={!originalPreview || isProcessing}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black py-7 text-xl shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all duration-300 disabled:opacity-50 border-2 border-cyan-400/50 font-orbitron tracking-wider relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-3 animate-spin relative z-10" />
                          <span className="relative z-10 uppercase">Enhancing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6 mr-3 relative z-10" />
                          <span className="relative z-10 uppercase">Initiate Enhancement</span>
                        </>
                      )}
                    </Button>
                    {result && (
                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        className="border-2 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20 font-black py-7 px-8 shadow-xl font-orbitron tracking-wider"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        <span className="uppercase">Download</span>
                      </Button>
                    )}
                    {(originalPreview || result) && (
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="border-2 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 font-black py-7 px-6 shadow-xl font-orbitron"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
            </TabsContent>

            <TabsContent value="video" className="space-y-6 mt-0 p-6">
                <CardHeader className="border-b-2 border-cyan-500/30 relative z-10 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-4 text-cyan-300 text-2xl font-orbitron">
                      <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/40">
                        <FileVideo className="w-8 h-8" />
                      </div>
                      <span className="tracking-wider">VIDEO PROCESSING STATION</span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40">ACTIVE</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 relative z-10">
                  {/* Upload Area */}
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="relative border-2 border-dashed border-cyan-500/50 rounded-xl p-16 text-center cursor-pointer hover:border-cyan-400/70 hover:bg-cyan-500/10 transition-all duration-300 group overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-30">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent animate-scan" />
                    </div>
                    
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="relative z-10">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-cyan-500/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 border-2 border-cyan-500/40 shadow-lg shadow-cyan-500/20">
                        <Upload className="w-12 h-12 text-cyan-400" />
                      </div>
                      <p className="text-cyan-200 font-bold mb-3 text-xl font-orbitron tracking-wider">
                        CLICK TO UPLOAD OR DRAG AND DROP
                      </p>
                      <p className="text-sm text-cyan-300/70 font-space-mono uppercase tracking-wider">
                        MP4, AVI, MOV up to 100MB
                      </p>
                    </div>
                  </div>

                  {/* Preview and Results */}
                  {(originalPreview || result) && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2 uppercase tracking-wider font-orbitron">
                            <Eye className="w-5 h-5" />
                            Original Feed
                          </h3>
                          <Badge className="bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500/40 font-space-mono">SOURCE</Badge>
                        </div>
                        {originalPreview && (
                          <div className="relative rounded-lg overflow-hidden border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/20">
                            <div className="absolute inset-0 pointer-events-none z-20">
                              <div className="absolute top-2 left-2 bg-slate-900/80 px-2 py-1 rounded border border-cyan-500/40">
                                <p className="text-xs text-cyan-300 font-space-mono">VID-01</p>
                              </div>
                              <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded border border-cyan-500/40">
                                <p className="text-xs text-cyan-300 font-space-mono">LIVE</p>
                              </div>
                            </div>
                            <video
                              src={originalPreview}
                              controls
                              className="w-full h-auto"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2 uppercase tracking-wider font-orbitron">
                            <Zap className="w-5 h-5" />
                            Enhanced Feed
                          </h3>
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/40 font-space-mono">ENHANCED</Badge>
                        </div>
                        {enhancedPreview ? (
                          <div className="relative rounded-lg overflow-hidden border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/20">
                            <div className="absolute inset-0 pointer-events-none z-20">
                              <div className="absolute top-2 left-2 bg-slate-900/80 px-2 py-1 rounded border border-emerald-500/40">
                                <p className="text-xs text-emerald-300 font-space-mono">CNN-ENH</p>
                              </div>
                              <div className="absolute top-2 right-2 bg-emerald-500/80 px-2 py-1 rounded border border-emerald-500/40">
                                <p className="text-xs text-white font-space-mono flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  ACTIVE
                                </p>
                              </div>
                            </div>
                            <video
                              src={enhancedPreview}
                              controls
                              className="w-full h-auto"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-slate-800/70 rounded-lg border-2 border-cyan-500/30 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20">
                              <div className="absolute inset-0" style={{
                                backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
                                backgroundSize: '20px 20px'
                              }} />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-shimmer" />
                            <div className="relative z-10 text-center">
                              <Loader2 className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
                              <p className="text-cyan-300/70 font-space-mono uppercase tracking-wider">ENHANCED FEED WILL APPEAR HERE</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Metrics */}
                  {result?.metrics && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-slate-800/60 rounded-lg border-2 border-cyan-500/30 shadow-xl relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
                          backgroundSize: '30px 30px'
                        }} />
                      </div>
                      {result.metrics.psnr && (
                        <div className="text-center p-4 bg-slate-900/70 rounded-lg border-2 border-cyan-500/30 relative z-10">
                          <GaugeCircle className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                          <p className="text-xs text-cyan-300/60 mb-2 font-space-mono uppercase tracking-wider">PSNR</p>
                          <p className="text-3xl font-black text-cyan-300 font-orbitron">{result.metrics.psnr.toFixed(2)}</p>
                          <p className="text-xs text-cyan-300/40 font-space-mono">dB</p>
                        </div>
                      )}
                      {result.metrics.ssim && (
                        <div className="text-center p-4 bg-slate-900/70 rounded-lg border-2 border-cyan-500/30 relative z-10">
                          <BarChart3 className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                          <p className="text-xs text-cyan-300/60 mb-2 font-space-mono uppercase tracking-wider">SSIM</p>
                          <p className="text-3xl font-black text-cyan-300 font-orbitron">{result.metrics.ssim.toFixed(3)}</p>
                        </div>
                      )}
                      {result.metrics.uiqm_improvement && (
                        <div className="text-center p-4 bg-slate-900/70 rounded-lg border-2 border-emerald-500/30 relative z-10">
                          <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                          <p className="text-xs text-emerald-300/60 mb-2 font-space-mono uppercase tracking-wider">UIQM</p>
                          <p className="text-3xl font-black text-emerald-300 font-orbitron">+{result.metrics.uiqm_improvement.toFixed(2)}</p>
                        </div>
                      )}
                      {result.metrics.processingTime && (
                        <div className="text-center p-4 bg-slate-900/70 rounded-lg border-2 border-cyan-500/30 relative z-10">
                          <Activity className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                          <p className="text-xs text-cyan-300/60 mb-2 font-space-mono uppercase tracking-wider">Time</p>
                          <p className="text-3xl font-black text-cyan-300 font-orbitron">{result.metrics.processingTime.toFixed(1)}</p>
                          <p className="text-xs text-cyan-300/40 font-space-mono">sec</p>
                        </div>
                      )}
                      {result.metrics.processingTime === undefined && result.metrics && (
                        <div className="text-center p-4 bg-slate-900/70 rounded-lg border-2 border-emerald-500/30 relative z-10">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                          <p className="text-xs text-emerald-300/60 mb-2 font-space-mono uppercase tracking-wider">Status</p>
                          <p className="text-3xl font-black text-emerald-300 font-orbitron flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-8 h-8" />
                          </p>
                          <p className="text-xs text-emerald-300/60 font-space-mono">ENHANCED</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comprehensive Analytics Section */}
                  <AnalyticsSection
                    result={result}
                    analytics={analytics}
                    loadingAnalytics={loadingAnalytics}
                    onRefresh={() => fetchAnalytics(result?.originalFileName || "")}
                  />

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-4 p-5 bg-red-500/20 border-2 border-red-500/50 rounded-lg text-red-200 backdrop-blur-md relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent animate-shimmer" />
                      <AlertTriangle className="w-6 h-6 animate-pulse relative z-10" />
                      <p className="text-sm font-bold font-space-mono uppercase tracking-wider relative z-10">{error}</p>
                    </div>
                  )}

                  {/* Progress */}
                  {isProcessing && (
                    <div className="space-y-4 p-6 bg-slate-800/60 rounded-lg border-2 border-cyan-500/30 shadow-xl relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
                          backgroundSize: '20px 20px'
                        }} />
                      </div>
                      <div className="flex items-center justify-between text-sm relative z-10">
                        <div className="flex items-center gap-3">
                          <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                          <span className="text-cyan-300 font-bold font-space-mono uppercase tracking-wider">Processing Video Enhancement...</span>
                        </div>
                        <span className="text-cyan-300 font-black text-xl font-orbitron">{progress}%</span>
                      </div>
                      <div className="relative h-4 bg-slate-900/70 rounded-full overflow-hidden border-2 border-cyan-500/30 z-10">
                        <div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/50"
                          style={{ width: `${progress}%` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handleEnhance}
                      disabled={!originalPreview || isProcessing}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black py-7 text-xl shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all duration-300 disabled:opacity-50 border-2 border-cyan-400/50 font-orbitron tracking-wider relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-3 animate-spin relative z-10" />
                          <span className="relative z-10 uppercase">Enhancing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6 mr-3 relative z-10" />
                          <span className="relative z-10 uppercase">Initiate Enhancement</span>
                        </>
                      )}
                    </Button>
                    {result && (
                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        className="border-2 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20 font-black py-7 px-8 shadow-xl font-orbitron tracking-wider"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        <span className="uppercase">Download</span>
                      </Button>
                    )}
                    {(originalPreview || result) && (
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="border-2 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 font-black py-7 px-6 shadow-xl font-orbitron"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
            </TabsContent>
          </Tabs>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>

      {/* Add custom CSS animations */}
      <style jsx>{`
        @keyframes radar-sweep {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes animate-gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: animate-gradient 3s ease infinite;
        }
        
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}</style>
    </div>
  )
}
