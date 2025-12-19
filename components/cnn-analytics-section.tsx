"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Palette, Layers, FileText, Download, RotateCcw, Zap, Maximize2, Loader2, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { generateAnalyticsPDF } from "@/lib/pdf-generator"

interface AnalyticsSectionProps {
  result: any
  analytics: any
  loadingAnalytics: boolean
  onRefresh: () => void
}

export function AnalyticsSection({ result, analytics, loadingAnalytics, onRefresh }: AnalyticsSectionProps) {
  const [analyticsTab, setAnalyticsTab] = useState<string>("dashboard")
  const [selectedGraph, setSelectedGraph] = useState<string | null>(null)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  const handleDownloadPDF = async () => {
    if (!analytics || !result) {
      alert("Analytics data not available. Please wait for analytics to load.")
      return
    }
    
    setGeneratingPDF(true)
    try {
      console.log("Starting PDF generation...", { analytics, result })
      await generateAnalyticsPDF(analytics, result)
      console.log("PDF generated successfully")
    } catch (error) {
      console.error("Error generating PDF:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to generate PDF: ${errorMessage}\n\nPlease check the console for details.`)
    } finally {
      setGeneratingPDF(false)
    }
  }

  if (!result) return null

  if (loadingAnalytics) {
    return (
      <Card className="bg-slate-900/40 backdrop-blur-md border border-cyan-500/20 mt-6">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-cyan-400 animate-spin" />
          <p className="text-cyan-300">Generating comprehensive analytics...</p>
        </CardContent>
      </Card>
    )
  }

  if (!analytics || !analytics.graphs) {
    return (
      <Card className="bg-slate-900/40 backdrop-blur-md border border-cyan-500/20 mt-6">
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-cyan-400/50" />
          <p className="text-cyan-300/60 text-sm">Analytics are being generated...</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="mt-3 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
          >
            <RotateCcw className="w-3 h-3 mr-2" />
            Check Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-slate-900/40 backdrop-blur-md border border-cyan-500/20 shadow-xl mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-cyan-300">
              <BarChart3 className="w-5 h-5" />
              Comprehensive Analytics Report
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={generatingPDF}
                className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
              >
                {generatingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={analyticsTab} onValueChange={setAnalyticsTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-slate-800/50 mb-4">
              <TabsTrigger value="dashboard" className="text-xs">
                <BarChart3 className="w-3 h-3 mr-1" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="basic" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="color" className="text-xs">
                <Palette className="w-3 h-3 mr-1" />
                Color
              </TabsTrigger>
              <TabsTrigger value="texture" className="text-xs">
                <Layers className="w-3 h-3 mr-1" />
                Texture
              </TabsTrigger>
              <TabsTrigger value="histogram" className="text-xs">
                <BarChart3 className="w-3 h-3 mr-1" />
                Histogram
              </TabsTrigger>
              <TabsTrigger value="brightness" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Brightness
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              {analytics.graphs.quality_dashboard && (
                <div className="relative group">
                  <img
                    src={analytics.graphs.quality_dashboard}
                    alt="Quality Dashboard"
                    className="w-full rounded-lg border border-cyan-500/20 cursor-pointer hover:border-cyan-400/50 transition-all"
                    onClick={() => setSelectedGraph(analytics.graphs.quality_dashboard)}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-slate-900/80 border-cyan-500/30 text-cyan-300"
                      onClick={() => setSelectedGraph(analytics.graphs.quality_dashboard)}
                    >
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              {analytics.reportData && (
                <div className="p-4 bg-slate-800/30 rounded-lg border border-cyan-500/20">
                  <h4 className="text-sm font-semibold text-cyan-300 mb-2">Quality Assessment</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-cyan-300/60">PSNR Quality</p>
                      <p className="text-cyan-200 font-bold">{analytics.reportData.quality_assessment?.psnr_quality || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-cyan-300/60">SSIM Quality</p>
                      <p className="text-cyan-200 font-bold">{analytics.reportData.quality_assessment?.ssim_quality || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-cyan-300/60">UIQM Quality</p>
                      <p className="text-cyan-200 font-bold">{analytics.reportData.quality_assessment?.uiqm_quality || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-cyan-300/60">Overall</p>
                      <p className="text-emerald-300 font-bold">{analytics.reportData.quality_assessment?.overall_assessment || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="basic" className="space-y-4">
              {analytics.graphs.basic_metrics && (
                <div className="relative group">
                  <img
                    src={analytics.graphs.basic_metrics}
                    alt="Basic Metrics"
                    className="w-full rounded-lg border border-cyan-500/20 cursor-pointer hover:border-cyan-400/50 transition-all"
                    onClick={() => setSelectedGraph(analytics.graphs.basic_metrics)}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-slate-900/80 border-cyan-500/30 text-cyan-300"
                      onClick={() => setSelectedGraph(analytics.graphs.basic_metrics)}
                    >
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="color" className="space-y-4">
              {analytics.graphs.color_analysis && (
                <div className="relative group">
                  <img
                    src={analytics.graphs.color_analysis}
                    alt="Color Analysis"
                    className="w-full rounded-lg border border-cyan-500/20 cursor-pointer hover:border-cyan-400/50 transition-all"
                    onClick={() => setSelectedGraph(analytics.graphs.color_analysis)}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-slate-900/80 border-cyan-500/30 text-cyan-300"
                      onClick={() => setSelectedGraph(analytics.graphs.color_analysis)}
                    >
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="texture" className="space-y-4">
              {analytics.graphs.texture_edge_analysis && (
                <div className="relative group">
                  <img
                    src={analytics.graphs.texture_edge_analysis}
                    alt="Texture & Edge Analysis"
                    className="w-full rounded-lg border border-cyan-500/20 cursor-pointer hover:border-cyan-400/50 transition-all"
                    onClick={() => setSelectedGraph(analytics.graphs.texture_edge_analysis)}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-slate-900/80 border-cyan-500/30 text-cyan-300"
                      onClick={() => setSelectedGraph(analytics.graphs.texture_edge_analysis)}
                    >
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="histogram" className="space-y-4">
              {analytics.graphs.histogram_analysis && (
                <div className="relative group">
                  <img
                    src={analytics.graphs.histogram_analysis}
                    alt="Histogram Analysis"
                    className="w-full rounded-lg border border-cyan-500/20 cursor-pointer hover:border-cyan-400/50 transition-all"
                    onClick={() => setSelectedGraph(analytics.graphs.histogram_analysis)}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-slate-900/80 border-cyan-500/30 text-cyan-300"
                      onClick={() => setSelectedGraph(analytics.graphs.histogram_analysis)}
                    >
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="brightness" className="space-y-4">
              {analytics.graphs.brightness_contrast_analysis && (
                <div className="relative group">
                  <img
                    src={analytics.graphs.brightness_contrast_analysis}
                    alt="Brightness & Contrast Analysis"
                    className="w-full rounded-lg border border-cyan-500/20 cursor-pointer hover:border-cyan-400/50 transition-all"
                    onClick={() => setSelectedGraph(analytics.graphs.brightness_contrast_analysis)}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-slate-900/80 border-cyan-500/30 text-cyan-300"
                      onClick={() => setSelectedGraph(analytics.graphs.brightness_contrast_analysis)}
                    >
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Detailed Report Section */}
          {analytics.reportData && (
            <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-cyan-500/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Detailed Report Data
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const dataStr = JSON.stringify(analytics.reportData, null, 2)
                    const dataBlob = new Blob([dataStr], { type: 'application/json' })
                    const url = URL.createObjectURL(dataBlob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `${analytics.analysisName}_report.json`
                    link.click()
                  }}
                  className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                >
                  <Download className="w-3 h-3 mr-2" />
                  Download JSON
                </Button>
              </div>
              <div className="max-h-64 overflow-y-auto text-xs font-mono bg-slate-900/50 p-3 rounded border border-cyan-500/10">
                <pre className="text-cyan-200 whitespace-pre-wrap">
                  {JSON.stringify(analytics.reportData, null, 2).substring(0, 2000)}
                  {JSON.stringify(analytics.reportData, null, 2).length > 2000 && '...\n\n(Truncated - Download full report above)'}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Screen Graph Modal */}
      <Dialog open={!!selectedGraph} onOpenChange={() => setSelectedGraph(null)}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto bg-slate-900 border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-cyan-300">Full Size Graph</DialogTitle>
          </DialogHeader>
          {selectedGraph && (
            <img
              src={selectedGraph}
              alt="Full size graph"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

