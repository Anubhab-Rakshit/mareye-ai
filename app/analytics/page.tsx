"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TacticalStatsCard } from "@/components/tactical-stats-card"
import { SonarGridBackground } from "@/components/sonar-grid-background"
import { AnalyticsSection } from "@/components/cnn-analytics-section"
import { BarChart3, Cpu, Zap, Radar, Activity, Trash2, Eye, Calendar, TrendingUp, FileText, Image as ImageIcon, X, Download, Upload, Play, Pause, RefreshCw, CheckCircle2, AlertCircle, Clock, HardDrive, Code, FileCode, Loader2, ExternalLink, Settings, Power } from "lucide-react"

interface AnalysisData {
  analysisName: string
  timestamp: string
  reportData: {
    basic_metrics?: {
      psnr?: number
      ssim?: number
      uiqm_original?: number
      uiqm_enhanced?: number
      uiqm_improvement?: number
    }
    quality_assessment?: {
      psnr_quality?: string
      ssim_quality?: string
      uiqm_quality?: string
      overall_assessment?: string
    }
    enhanced_image?: string
    original_image?: string
    advanced_analysis?: any
  }
  graphs?: Record<string, string>
}

interface ModelData {
  onnx: Array<{
    name: string
    type: string
    sizeFormatted: string
    size?: number
    path?: string
    lastModified: string
    image?: string
    contentPreview?: string
  }>
  tensorrt: Array<{
    name: string
    type: string
    files?: Array<{
      name: string
      type: string
      sizeFormatted: string
      path?: string
      lastModified: string
      image?: string
      contentPreview?: string
    }>
    lastModified: string
  }>
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalysisData[]>([])
  const [modelsData, setModelsData] = useState<ModelData>({ onnx: [], tensorrt: [] })
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(null)
  const [detailedViewAnalysis, setDetailedViewAnalysis] = useState<AnalysisData | null>(null)
  const [selectedModel, setSelectedModel] = useState<any>(null)
  const [configuringDeployment, setConfiguringDeployment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [testingModel, setTestingModel] = useState<string | null>(null)
  const [deploying, setDeploying] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const [analyticsRes, modelsRes] = await Promise.all([fetch("/api/analytics"), fetch("/api/models")])

      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        const analyses = data.analyses || (Array.isArray(data) ? data : [])
        setAnalyticsData(Array.isArray(analyses) ? analyses : [])
        if (Array.isArray(analyses) && analyses.length > 0 && !selectedAnalysis) {
          setSelectedAnalysis(analyses[0])
        }
      }

      if (modelsRes.ok) {
        const response = await modelsRes.json()
        const models = response.models || { onnx: [], tensorrt: [] }
        setModelsData({
          onnx: Array.isArray(models.onnx) ? models.onnx : [],
          tensorrt: Array.isArray(models.tensorrt) ? models.tensorrt : [],
        })
      }
    } catch (error) {
      console.error("[Analytics] Error fetching data:", error)
      setModelsData({ onnx: [], tensorrt: [] })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
  }

  const handleDeleteAnalysis = async (analysisName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Are you sure you want to delete "${analysisName}"?`)) return
    
    try {
      const encodedName = encodeURIComponent(analysisName)
      const response = await fetch(`/api/analytics/${encodedName}`, { 
        method: "DELETE"
      })
      if (response.ok) {
        setAnalyticsData((prev) => prev.filter((a) => a.analysisName !== analysisName))
        if (selectedAnalysis?.analysisName === analysisName) {
          setSelectedAnalysis(null)
        }
        if (detailedViewAnalysis?.analysisName === analysisName) {
          setDetailedViewAnalysis(null)
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete")
      }
    } catch (error) {
      console.error("[Analytics] Delete error:", error)
      alert(`Failed to delete analysis: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleDownloadModel = async (model: any) => {
    try {
      // Create download link for model file
      const response = await fetch(`/api/models/download?path=${encodeURIComponent(model.path)}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = model.name
        link.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download model")
    }
  }

  const handleTestModel = async (model: any) => {
    setTestingModel(model.name)
    try {
      // Call actual test API
      const response = await fetch('/api/models/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelPath: model.path, modelName: model.name })
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(`Model ${model.name} tested successfully!\n${result.message || ''}`)
      } else {
        throw new Error('Test failed')
      }
    } catch (error) {
      alert(`Model test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTestingModel(null)
    }
  }

  const handleDeploy = async (deployment: any) => {
    setDeploying(deployment.name)
    try {
      const response = await fetch('/api/deployments/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deploymentName: deployment.name, deploymentPath: deployment.path })
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(`Deployment ${deployment.name} started successfully!`)
        await fetchData() // Refresh data
      } else {
        throw new Error('Deployment failed')
      }
    } catch (error) {
      alert(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeploying(null)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(hours / 24)
      
      if (hours < 1) return "Just now"
      if (hours < 24) return `${hours}h ago`
      if (days < 7) return `${days}d ago`
      return date.toLocaleDateString()
    } catch {
      return timestamp
    }
  }

  const getQualityBadge = (quality?: string) => {
    if (!quality) return null
    const lower = quality.toLowerCase()
    if (lower.includes("good") || lower.includes("high") || lower.includes("significantly") || lower.includes("successful")) {
      return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Excellent</Badge>
    }
    if (lower.includes("moderate") || lower.includes("improved")) {
      return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Good</Badge>
    }
    return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Needs Improvement</Badge>
  }

  const getModelStatus = (model: any) => {
    if (model.type === 'ONNX') return { status: 'active', color: 'emerald', text: 'Active' }
    if (model.type === 'Test Output') return { status: 'ready', color: 'cyan', text: 'Ready' }
    return { status: 'available', color: 'blue', text: 'Available' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 relative pt-28 pb-12 flex items-center justify-center">
        <SonarGridBackground />
        <div className="relative z-10">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500/50 border-t-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-cyan-300 font-space-mono text-sm">INITIALIZING ANALYTICS SYSTEMS...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 relative pt-28 pb-12">
      <SonarGridBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-2xl flex items-center justify-center mr-4">
                <BarChart3 className="w-8 h-8 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-orbitron font-black text-white">ANALYTICS COMMAND</h1>
                <p className="text-cyan-200 text-sm font-space-mono mt-1">
                  {analyticsData.length} CNN Enhancement Reports Available
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
            >
              <Activity className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <TacticalStatsCard
            title="TOTAL REPORTS"
            value={analyticsData?.length ?? 0}
            icon={<BarChart3 className="w-6 h-6" />}
            color="cyan"
          />
          <TacticalStatsCard
            title="ONNX MODELS"
            value={modelsData?.onnx?.length ?? 0}
            icon={<Cpu className="w-6 h-6" />}
            color="blue"
          />
          <TacticalStatsCard
            title="TENSORRT"
            value={modelsData?.tensorrt?.length ?? 0}
            icon={<Zap className="w-6 h-6" />}
            color="purple"
          />
          <TacticalStatsCard 
            title="STATUS" 
            value="ACTIVE"
            suffix=""
            icon={<Radar className="w-6 h-6" />} 
            color="emerald" 
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="reports" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/40 backdrop-blur-md border border-cyan-500/30">
            <TabsTrigger value="reports" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              All Reports ({analyticsData.length})
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center">
              <Cpu className="w-4 h-4 mr-2" />
              Models
            </TabsTrigger>
            <TabsTrigger value="deployments" className="flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Deployments
            </TabsTrigger>
          </TabsList>

          {/* Reports Tab - Grid View */}
          <TabsContent value="reports" className="space-y-6">
            {!analyticsData || analyticsData.length === 0 ? (
              <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
                <CardContent className="p-12">
                  <div className="text-center">
                    <Activity className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Reports Available</h3>
                    <p className="text-cyan-300">Run CNN image enhancements to generate analytics reports</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyticsData.map((analysis) => {
                  const metrics = analysis.reportData?.basic_metrics
                  const quality = analysis.reportData?.quality_assessment
                  
                  return (
                    <Card 
                      key={analysis.analysisName} 
                      className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30 hover:border-cyan-400/50 transition-all cursor-pointer group"
                      onClick={() => setSelectedAnalysis(analysis)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-white text-sm font-semibold truncate mb-1">
                              {analysis.analysisName.replace(/_/g, ' ').substring(0, 40)}
                              {analysis.analysisName.length > 40 ? '...' : ''}
                            </CardTitle>
                            <CardDescription className="text-cyan-300/60 text-xs flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatTimestamp(analysis.timestamp)}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                            onClick={(e) => handleDeleteAnalysis(analysis.analysisName, e)}
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Preview Images */}
                        <div className="grid grid-cols-2 gap-2">
                          {analysis.reportData?.original_image && (
                            <div className="relative aspect-square rounded-lg overflow-hidden border border-cyan-500/20">
                              <img
                                src={analysis.reportData.original_image}
                                alt="Original"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                                Original
                              </div>
                            </div>
                          )}
                          {analysis.reportData?.enhanced_image && (
                            <div className="relative aspect-square rounded-lg overflow-hidden border border-cyan-500/20">
                              <img
                                src={analysis.reportData.enhanced_image}
                                alt="Enhanced"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                                Enhanced
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Metrics Summary */}
                        {metrics && (
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-slate-800/50 rounded p-2 border border-cyan-500/10">
                              <p className="text-cyan-300/60 mb-1">PSNR</p>
                              <p className="text-white font-bold">{metrics.psnr?.toFixed(2) ?? "N/A"} dB</p>
                            </div>
                            <div className="bg-slate-800/50 rounded p-2 border border-cyan-500/10">
                              <p className="text-cyan-300/60 mb-1">SSIM</p>
                              <p className="text-white font-bold">{metrics.ssim?.toFixed(3) ?? "N/A"}</p>
                            </div>
                            <div className="bg-slate-800/50 rounded p-2 border border-cyan-500/10">
                              <p className="text-cyan-300/60 mb-1">UIQM</p>
                              <p className="text-emerald-400 font-bold">{metrics.uiqm_improvement?.toFixed(1) ?? "N/A"}</p>
                            </div>
                          </div>
                        )}

                        {/* Quality Assessment */}
                        {quality?.overall_assessment && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-cyan-300/60">Status:</span>
                            {getQualityBadge(quality.overall_assessment)}
                          </div>
                        )}

                        {/* View Details Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDetailedViewAnalysis(analysis)
                          }}
                        >
                          <Eye className="w-3 h-3 mr-2" />
                          View Full Report
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Models tab - Enhanced */}
          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ONNX Models - Enhanced */}
              <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <Cpu className="w-5 h-5 mr-2 text-cyan-400" />
                      ONNX Models
                    </CardTitle>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                      {modelsData?.onnx?.length ?? 0} Models
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {!modelsData?.onnx || modelsData.onnx.length === 0 ? (
                    <div className="text-center py-8">
                      <Cpu className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                      <p className="text-cyan-300 text-sm mb-4">No ONNX models available</p>
                      <Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-300">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Model
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {modelsData.onnx.map((model) => {
                        const status = getModelStatus(model)
                        return (
                          <div key={model.name} className="group p-4 bg-slate-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-400/50 transition-all">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-white text-sm truncate">{model.name}</h4>
                                  <Badge className={`bg-${status.color}-500/20 text-${status.color}-300 border-0 text-xs`}>
                                    {model.type}
                                  </Badge>
                                  <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {status.text}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-cyan-300/70">
                                  <div className="flex items-center gap-1">
                                    <HardDrive className="w-3 h-3" />
                                    <span>{model.sizeFormatted}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(model.lastModified).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Model Preview */}
                            {model.image && (
                              <div className="mb-3 rounded-lg overflow-hidden border border-cyan-500/20">
                                <img src={model.image} alt={model.name} className="w-full h-32 object-cover" />
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs"
                                onClick={() => handleDownloadModel(model)}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs"
                                onClick={() => handleTestModel(model)}
                                disabled={testingModel === model.name}
                              >
                                {testingModel === model.name ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <Play className="w-3 h-3 mr-1" />
                                )}
                                Test
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20 text-xs"
                                onClick={() => setSelectedModel(model)}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* TensorRT Models - Enhanced */}
              <Card className="bg-slate-900/40 backdrop-blur-md border-purple-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-purple-400" />
                      TensorRT Models
                    </CardTitle>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {modelsData?.tensorrt?.length ?? 0} Deployments
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {!modelsData?.tensorrt || modelsData.tensorrt.length === 0 ? (
                    <div className="text-center py-8">
                      <Zap className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                      <p className="text-purple-300 text-sm mb-4">No TensorRT deployments available</p>
                      <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-300">
                        <Upload className="w-4 h-4 mr-2" />
                        Create Deployment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {modelsData.tensorrt.map((deployment) => (
                        <div key={deployment.name} className="group p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-400/50 transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-white text-sm truncate">{deployment.name}</h4>
                                <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                                  {deployment.type}
                                </Badge>
                                <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs flex items-center gap-1">
                                  <Power className="w-3 h-3" />
                                  Active
                                </Badge>
                              </div>
                              <div className="text-xs text-purple-300/70 flex items-center gap-1 mb-2">
                                <Clock className="w-3 h-3" />
                                <span>Modified: {new Date(deployment.lastModified).toLocaleDateString()}</span>
                              </div>
                              {deployment.files && deployment.files.length > 0 && (
                                <div className="text-xs text-purple-300/60">
                                  {deployment.files.length} file{deployment.files.length !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Files List */}
                          {deployment.files && deployment.files.length > 0 && (
                            <div className="space-y-2 mt-3">
                              {deployment.files.slice(0, 3).map((file, idx) => (
                                <div key={idx} className="p-2 bg-slate-900/50 rounded text-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      {file.type === 'Python Script' && <Code className="w-3 h-3 text-blue-400" />}
                                      {file.type === 'Image' && <ImageIcon className="w-3 h-3 text-green-400" />}
                                      {file.type === 'File' && <FileCode className="w-3 h-3 text-cyan-400" />}
                                      <span className="text-cyan-300 truncate">{file.name}</span>
                                    </div>
                                    <span className="text-cyan-300/60">{file.sizeFormatted}</span>
                                  </div>
                                  {/* Show image preview if available */}
                                  {file.image && (
                                    <div className="mt-2 rounded overflow-hidden border border-purple-500/20">
                                      <img src={file.image} alt={file.name} className="w-full h-24 object-cover" />
                                    </div>
                                  )}
                                </div>
                              ))}
                              {deployment.files.length > 3 && (
                                <p className="text-xs text-purple-300/60 text-center">+{deployment.files.length - 3} more files</p>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs"
                              onClick={() => setConfiguringDeployment(deployment)}
                            >
                              <Settings className="w-3 h-3 mr-1" />
                              Configure
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs"
                              onClick={() => handleDeploy(deployment)}
                              disabled={deploying === deployment.name}
                            >
                              {deploying === deployment.name ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <Play className="w-3 h-3 mr-1" />
                              )}
                              Deploy
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deployments tab - Enhanced */}
          <TabsContent value="deployments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ONNX Runtime Deployment */}
              <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <Cpu className="w-5 h-5 mr-2 text-cyan-400" />
                      ONNX Runtime
                    </CardTitle>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-emerald-500/30">
                      <div className="flex items-center gap-2">
                        <Radar className="w-4 h-4 text-emerald-400" />
                        <span className="text-white font-semibold">Status</span>
                      </div>
                      <span className="text-emerald-300 font-bold">Online</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-300">Models</span>
                      </div>
                      <span className="text-white font-bold">{modelsData?.onnx?.length ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-300">Latency</span>
                      </div>
                      <span className="text-emerald-300 font-bold">{"<"}50ms</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-300">Throughput</span>
                      </div>
                      <span className="text-white font-bold">~20 FPS</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20">
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Restart
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-blue-500/30 text-blue-300 hover:bg-blue-500/20">
                      <Settings className="w-3 h-3 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* TensorRT GPU Deployment */}
              <Card className="bg-slate-900/40 backdrop-blur-md border-purple-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-purple-400" />
                      TensorRT GPU
                    </CardTitle>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-emerald-500/30">
                      <div className="flex items-center gap-2">
                        <Radar className="w-4 h-4 text-emerald-400" />
                        <span className="text-white font-semibold">Status</span>
                      </div>
                      <span className="text-emerald-300 font-bold">Online</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300">Models</span>
                      </div>
                      <span className="text-white font-bold">{modelsData?.tensorrt?.length ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300">Latency</span>
                      </div>
                      <span className="text-emerald-300 font-bold">{"<"}10ms</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300">Throughput</span>
                      </div>
                      <span className="text-white font-bold">~100 FPS</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Restart
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-blue-500/30 text-blue-300 hover:bg-blue-500/20">
                      <Settings className="w-3 h-3 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detailed Report Modal */}
      <Dialog open={!!detailedViewAnalysis} onOpenChange={(open) => !open && setDetailedViewAnalysis(null)}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto bg-slate-900 border-cyan-500/30">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-cyan-300 text-xl">
                Full Detailed Report: {detailedViewAnalysis?.analysisName}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDetailedViewAnalysis(null)}
                className="text-cyan-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          {detailedViewAnalysis && (
            <div className="mt-4">
              <AnalyticsSection
                result={{
                  metrics: detailedViewAnalysis.reportData?.basic_metrics,
                  originalFileName: detailedViewAnalysis.analysisName,
                }}
                analytics={detailedViewAnalysis}
                loadingAnalytics={false}
                onRefresh={handleRefresh}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Model Details Modal */}
      <Dialog open={!!selectedModel} onOpenChange={(open) => !open && setSelectedModel(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-slate-900 border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-cyan-300">Model Details: {selectedModel?.name}</DialogTitle>
          </DialogHeader>
          {selectedModel && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded border border-cyan-500/20">
                  <p className="text-cyan-300/60 text-xs mb-1">Type</p>
                  <p className="text-white font-bold">{selectedModel.type}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded border border-cyan-500/20">
                  <p className="text-cyan-300/60 text-xs mb-1">Size</p>
                  <p className="text-white font-bold">{selectedModel.sizeFormatted}</p>
                </div>
                {selectedModel.lastModified && (
                  <div className="p-3 bg-slate-800/50 rounded border border-cyan-500/20">
                    <p className="text-cyan-300/60 text-xs mb-1">Last Modified</p>
                    <p className="text-white font-bold">{new Date(selectedModel.lastModified).toLocaleString()}</p>
                  </div>
                )}
                {selectedModel.path && (
                  <div className="p-3 bg-slate-800/50 rounded border border-cyan-500/20">
                    <p className="text-cyan-300/60 text-xs mb-1">Path</p>
                    <p className="text-white font-bold text-xs truncate">{selectedModel.path}</p>
                  </div>
                )}
              </div>
              {selectedModel.image && (
                <div className="rounded-lg overflow-hidden border border-cyan-500/20">
                  <img src={selectedModel.image} alt={selectedModel.name} className="w-full max-h-96 object-contain bg-slate-900" />
                </div>
              )}
              {selectedModel.contentPreview && (
                <div className="p-3 bg-slate-800/50 rounded border border-cyan-500/20">
                  <p className="text-cyan-300/60 text-xs mb-2">Content Preview</p>
                  <pre className="text-xs text-cyan-200 font-mono overflow-auto max-h-64">
                    {selectedModel.contentPreview}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deployment Configuration Modal */}
      <Dialog open={!!configuringDeployment} onOpenChange={(open) => !open && setConfiguringDeployment(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto bg-slate-900 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-purple-300 text-xl flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configure Deployment: {configuringDeployment?.name}
            </DialogTitle>
          </DialogHeader>
          {configuringDeployment && (
            <div className="space-y-6 mt-4">
              {/* Deployment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                  <p className="text-purple-300/60 text-xs mb-2">Deployment Type</p>
                  <p className="text-white font-bold">{configuringDeployment.type}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                  <p className="text-purple-300/60 text-xs mb-2">Status</p>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-0">
                    <Power className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>

              {/* Configuration Settings */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-400" />
                  Configuration Settings
                </h3>
                
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800/50 rounded border border-purple-500/20">
                    <label className="text-purple-300 text-sm mb-2 block">Batch Size</label>
                    <input 
                      type="number" 
                      defaultValue={1} 
                      min={1} 
                      max={32}
                      className="w-full bg-slate-900 border border-purple-500/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  
                  <div className="p-3 bg-slate-800/50 rounded border border-purple-500/20">
                    <label className="text-purple-300 text-sm mb-2 block">Precision</label>
                    <select className="w-full bg-slate-900 border border-purple-500/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400">
                      <option value="fp32">FP32</option>
                      <option value="fp16">FP16</option>
                      <option value="int8">INT8</option>
                    </select>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded border border-purple-500/20">
                    <label className="text-purple-300 text-sm mb-2 block">Device</label>
                    <select className="w-full bg-slate-900 border border-purple-500/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400">
                      <option value="cuda">CUDA (GPU)</option>
                      <option value="cpu">CPU</option>
                    </select>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded border border-purple-500/20">
                    <label className="text-purple-300 text-sm mb-2 block">Max Batch Size</label>
                    <input 
                      type="number" 
                      defaultValue={8} 
                      min={1} 
                      max={64}
                      className="w-full bg-slate-900 border border-purple-500/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* Files in Deployment */}
              {configuringDeployment.files && configuringDeployment.files.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    Deployment Files ({configuringDeployment.files.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {configuringDeployment.files.map((file: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-800/50 rounded border border-purple-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {file.type === 'Python Script' && <Code className="w-4 h-4 text-blue-400" />}
                            {file.type === 'Image' && <ImageIcon className="w-4 h-4 text-green-400" />}
                            {file.type === 'File' && <FileCode className="w-4 h-4 text-cyan-400" />}
                            <span className="text-white font-semibold text-sm">{file.name}</span>
                          </div>
                          <span className="text-purple-300/60 text-xs">{file.sizeFormatted}</span>
                        </div>
                        {file.image && (
                          <div className="mt-2 rounded overflow-hidden border border-purple-500/20">
                            <img src={file.image} alt={file.name} className="w-full h-32 object-cover" />
                          </div>
                        )}
                        {file.contentPreview && (
                          <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs">
                            <pre className="text-purple-200 font-mono text-xs overflow-auto max-h-32">
                              {file.contentPreview}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-purple-500/20">
                <Button
                  variant="outline"
                  className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                  onClick={() => {
                    alert('Configuration saved successfully!')
                    setConfiguringDeployment(null)
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-500/30 text-slate-300 hover:bg-slate-500/20"
                  onClick={() => setConfiguringDeployment(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
