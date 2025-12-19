"use client"

import React, { useState, useEffect, useCallback } from "react"
import { loadDetections } from "@/lib/detection-storage"
import {
  Brain, Sparkles, TrendingUp, AlertTriangle,
  Target, Lightbulb, BarChart3, Zap,
  RefreshCw, Loader2, MessageSquare, Send,
  ChevronDown, ChevronUp, Download, FileText,
  Shield, Eye, Search, CheckCircle2
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AnimatedCounter } from "@/components/animated-counter"

interface ThreatData {
  totalDetections: number
  totalThreats: number
  criticalThreats: number
  highThreats: number
  mediumThreats: number
  lowThreats: number
  avgConfidence: number
  recentDetections: Array<{
    level: string
    objects: number
    confidence: number
    time: string
    classes: string[]
  }>
  threatBreakdown: {
    critical: number
    high: number
    medium: number
    low: number
  }
  classDistribution: Record<string, number>
  detectionRate: number
  threatTrend: string
  mostDetectedClass: string
  peakThreatLevel: string
  recentActivityCount: number
}

interface AIResponse {
  response: string
  type: string
  timestamp: string
}

export function AIThreatIntelligence({ threatStats }: { 
  threatStats: any
}) {
  const [mounted, setMounted] = useState(false)
  const [detections, setDetections] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      try {
        setDetections(loadDetections())
      } catch (error) {
        console.error("Failed to load detections:", error)
        setDetections([])
      }
    }
  }, [mounted, threatStats.totalDetections])
  const [analysis, setAnalysis] = useState<AIResponse | null>(null)
  const [recommendations, setRecommendations] = useState<AIResponse | null>(null)
  const [prediction, setPrediction] = useState<AIResponse | null>(null)
  const [query, setQuery] = useState("")
  const [queryResponse, setQueryResponse] = useState<AIResponse | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    analysis: true,
    recommendations: false,
    prediction: false,
    query: false
  })
  const [error, setError] = useState<string | null>(null)

  // Prepare threat data for AI
  const prepareThreatData = useCallback((): ThreatData => {
    const recentDetections = detections
      .filter((d: any) => d.timestamp && Date.now() - d.timestamp < 24 * 60 * 60 * 1000)
      .slice(0, 10)
      .map((d: any) => ({
        level: d.overallThreatLevel || "NONE",
        objects: d.totalObjects || 0,
        confidence: d.overallThreatScore || 0,
        time: new Date(d.timestamp).toISOString(),
        classes: d.detections?.map((det: any) => det.class) || []
      }))

    const classDistribution: Record<string, number> = {}
    detections.forEach((d: any) => {
      d.detections?.forEach((det: any) => {
        const className = det.class || "Unknown"
        classDistribution[className] = (classDistribution[className] || 0) + 1
      })
    })

    return {
      totalDetections: threatStats.totalDetections || 0,
      totalThreats: (threatStats.criticalThreats || 0) + (threatStats.highThreats || 0) + 
                   (threatStats.mediumThreats || 0) + (threatStats.lowThreats || 0),
      criticalThreats: threatStats.criticalThreats || 0,
      highThreats: threatStats.highThreats || 0,
      mediumThreats: threatStats.mediumThreats || 0,
      lowThreats: threatStats.lowThreats || 0,
      avgConfidence: threatStats.avgConfidence || 0,
      recentDetections,
      threatBreakdown: {
        critical: threatStats.criticalThreats || 0,
        high: threatStats.highThreats || 0,
        medium: threatStats.mediumThreats || 0,
        low: threatStats.lowThreats || 0
      },
      classDistribution,
      detectionRate: threatStats.detectionRate || 0,
      threatTrend: threatStats.threatTrend || "STABLE",
      mostDetectedClass: threatStats.mostDetectedClass || "None",
      peakThreatLevel: threatStats.peakThreatLevel || "NONE",
      recentActivityCount: threatStats.recentActivityCount || 0
    }
  }, [threatStats, detections])

  const fetchAIResponse = async (type: "analysis" | "recommendations" | "prediction" | "query", customQuery?: string) => {
    setLoading(prev => ({ ...prev, [type]: true }))
    setError(null)

    try {
      const threatData = prepareThreatData()
      const response = await fetch("/api/ai/threat-intelligence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type,
          threatData,
          query: customQuery || query
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Request failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (type === "analysis") setAnalysis(data)
      else if (type === "recommendations") setRecommendations(data)
      else if (type === "prediction") setPrediction(data)
      else if (type === "query") setQueryResponse(data)

    } catch (err) {
      console.error(`Error fetching ${type}:`, err)
      setError(err instanceof Error ? err.message : "Failed to fetch AI response")
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }))
    }
  }

  // Auto-load analysis on mount
  useEffect(() => {
    if (threatStats.totalDetections > 0) {
      fetchAIResponse("analysis")
    }
  }, [threatStats.totalDetections])

  // Parse markdown text and convert to React elements
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = []
    let currentIndex = 0
    
    // Regex to find **bold** text
    const boldRegex = /\*\*([^*]+)\*\*/g
    const lines = text.split('\n')
    
    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim()
      if (!trimmed) {
        parts.push(<br key={`br-${lineIndex}`} />)
        return
      }
      
      // Check if it's a section header (starts with ** and ends with ** or has colon)
      if (trimmed.match(/^\*\*.*\*\*:?$/) || trimmed.match(/^\d+\.\s+\*\*.*\*\*:?$/)) {
        const title = trimmed.replace(/^\d+\.\s+/, '').replace(/\*\*/g, '').replace(/:$/, '')
        parts.push(
          <h4 key={`header-${lineIndex}`} className="text-emerald-400 font-bold text-base uppercase tracking-wide mt-4 mb-2 first:mt-0">
            {title}
          </h4>
        )
        return
      }
      
      // Check if it's a bullet point
      if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.match(/^[\d•]/)) {
        const bulletText = trimmed.replace(/^[-*•\d.\s]+/, '').trim()
        const bulletContent = parseInlineMarkdown(bulletText)
        
        parts.push(
          <div key={`bullet-${lineIndex}`} className="flex items-start gap-3 my-2">
            <span className="text-emerald-400 font-bold mt-1 flex-shrink-0">▸</span>
            <div className="text-gray-300 text-sm leading-relaxed flex-1">
              {bulletContent}
            </div>
          </div>
        )
        return
      }
      
      // Regular paragraph
      const paragraphContent = parseInlineMarkdown(trimmed)
      parts.push(
        <p key={`para-${lineIndex}`} className="text-gray-300 text-sm leading-relaxed my-2">
          {paragraphContent}
        </p>
      )
    })
    
    return parts
  }
  
  // Parse inline markdown (bold, percentages, etc.)
  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let keyIndex = 0
    
    // Find all **bold** text (including nested or multiple instances)
    const boldRegex = /\*\*([^*]+?)\*\*/g
    let match
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index)
        if (beforeText) {
          // Also check for percentages/numbers in regular text
          const numberMatch = beforeText.match(/(\d+%?)/g)
          if (numberMatch) {
            let textIndex = 0
            numberMatch.forEach(num => {
              const numIndex = beforeText.indexOf(num, textIndex)
              if (numIndex > textIndex) {
                parts.push(<span key={`text-${keyIndex++}`}>{beforeText.substring(textIndex, numIndex)}</span>)
              }
              parts.push(
                <span key={`num-${keyIndex++}`} className="text-emerald-400 font-semibold">
                  {num}
                </span>
              )
              textIndex = numIndex + num.length
            })
            if (textIndex < beforeText.length) {
              parts.push(<span key={`text-${keyIndex++}`}>{beforeText.substring(textIndex)}</span>)
            }
          } else {
            parts.push(<span key={`text-${keyIndex++}`}>{beforeText}</span>)
          }
        }
      }
      
      // Add bold text
      const boldText = match[1].trim()
      // Check if it's a percentage or number
      if (boldText.match(/^\d+%?$/)) {
        parts.push(
          <span key={`bold-${keyIndex++}`} className="text-emerald-400 font-bold text-base">
            {boldText}
          </span>
        )
      } else if (boldText.match(/^(Critical|High|Medium|Low|Moderate|Stable|Increasing|Decreasing|INCREASING|DECREASING|STABLE)$/i)) {
        const level = boldText.toLowerCase()
        const colorClass = 
          level.includes('critical') || level.includes('high') ? 'text-red-400' :
          level.includes('medium') || level.includes('moderate') ? 'text-yellow-400' :
          level.includes('low') || level.includes('stable') ? 'text-cyan-400' :
          'text-emerald-400'
        parts.push(
          <span key={`bold-${keyIndex++}`} className={`${colorClass} font-bold`}>
            {boldText}
          </span>
        )
      } else if (boldText.match(/^\d+-\d+/) || boldText.match(/UTC|GMT|hours?|days?/i)) {
        // Time ranges or dates
        parts.push(
          <span key={`bold-${keyIndex++}`} className="text-cyan-400 font-semibold">
            {boldText}
          </span>
        )
      } else {
        parts.push(
          <span key={`bold-${keyIndex++}`} className="text-emerald-300 font-semibold">
            {boldText}
          </span>
        )
      }
      
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex)
      if (remainingText) {
        // Check for percentages/numbers in remaining text
        const numberMatch = remainingText.match(/(\d+%?)/g)
        if (numberMatch) {
          let textIndex = 0
          numberMatch.forEach(num => {
            const numIndex = remainingText.indexOf(num, textIndex)
            if (numIndex > textIndex) {
              parts.push(<span key={`text-${keyIndex++}`}>{remainingText.substring(textIndex, numIndex)}</span>)
            }
            parts.push(
              <span key={`num-${keyIndex++}`} className="text-emerald-400 font-semibold">
                {num}
              </span>
            )
            textIndex = numIndex + num.length
          })
          if (textIndex < remainingText.length) {
            parts.push(<span key={`text-${keyIndex++}`}>{remainingText.substring(textIndex)}</span>)
          }
        } else {
          parts.push(<span key={`text-${keyIndex++}`}>{remainingText}</span>)
        }
      }
    }
    
    // If no bold text found, check for numbers/percentages
    if (parts.length === 0) {
      const numberMatch = text.match(/(\d+%?)/g)
      if (numberMatch) {
        let textIndex = 0
        numberMatch.forEach(num => {
          const numIndex = text.indexOf(num, textIndex)
          if (numIndex > textIndex) {
            parts.push(<span key={`text-${keyIndex++}`}>{text.substring(textIndex, numIndex)}</span>)
          }
          parts.push(
            <span key={`num-${keyIndex++}`} className="text-emerald-400 font-semibold">
              {num}
            </span>
          )
          textIndex = numIndex + num.length
        })
        if (textIndex < text.length) {
          parts.push(<span key={`text-${keyIndex++}`}>{text.substring(textIndex)}</span>)
        }
      } else {
        return [<span key="text-0">{text}</span>]
      }
    }
    
    return parts
  }
  
  const formatResponse = (text: string) => {
    // Split by sections (lines starting with ** or numbers)
    const lines = text.split('\n')
    const sections: Array<{ title: string; content: string[] }> = []
    let currentSection: { title: string; content: string[] } | null = null

    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed.match(/^\*\*.*\*\*:?$/) || trimmed.match(/^\d+\.\s+\*\*.*\*\*:?$/)) {
        if (currentSection) sections.push(currentSection)
        const title = trimmed.replace(/^\d+\.\s+/, '').replace(/\*\*/g, '').replace(/:$/, '')
        currentSection = { title, content: [] }
      } else if (trimmed) {
        if (currentSection) {
          currentSection.content.push(trimmed)
        } else {
          // First line without section header
          if (sections.length === 0) {
            sections.push({ title: "", content: [trimmed] })
          } else {
            sections[sections.length - 1].content.push(trimmed)
          }
        }
      }
    })
    if (currentSection) sections.push(currentSection)

    return sections.length > 0 ? sections : [{ title: "", content: text.split('\n').filter(l => l.trim()) }]
  }

  const ResponseCard = ({ 
    title, 
    icon: Icon, 
    response, 
    loading: isLoading, 
    type,
    onRefresh 
  }: { 
    title: string
    icon: any
    response: AIResponse | null
    loading: boolean
    type: "analysis" | "recommendations" | "prediction"
    onRefresh: () => void
  }) => {
    const isExpanded = expanded[type]
    const sections = response ? formatResponse(response.response) : []

    return (
      <Card className="bg-black/40 backdrop-blur-sm border-emerald-500/30 hover:border-emerald-500/50 transition-all">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-emerald-300">{title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(prev => ({ ...prev, [type]: !prev[type] }))}
                className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className="space-y-4">
              {isLoading && !response ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                  <span className="ml-2 text-emerald-300">Analyzing threats...</span>
                </div>
              ) : response ? (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-slate-800/50 hover:scrollbar-thumb-emerald-500/50">
                  <div className="space-y-1">
                    {parseMarkdown(response.response)}
                  </div>
                  {response.timestamp && (
                    <div className="text-xs text-gray-500 pt-4 mt-4 border-t border-emerald-500/20">
                      <span className="text-emerald-400/60">Generated:</span> {new Date(response.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Click refresh to generate {title.toLowerCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-300">AI Threat Intelligence</h2>
            <p className="text-sm text-gray-400">Advanced AI-powered analysis and recommendations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
            <span className="text-xs text-emerald-300 font-medium">
              <AnimatedCounter value={threatStats.totalDetections || 0} /> Detections
            </span>
          </div>
        </div>
      </div>

      {error && (
        <Card className="bg-red-500/10 border-red-500/30 p-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-emerald-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-400">Critical Threats</span>
          </div>
          <div className="text-2xl font-bold text-red-400">
            <AnimatedCounter value={threatStats.criticalThreats || 0} />
          </div>
        </Card>
        <Card className="bg-black/40 border-emerald-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-400">Threat Trend</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {threatStats.threatTrend || "STABLE"}
          </div>
        </Card>
        <Card className="bg-black/40 border-emerald-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-400">Detection Rate</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            <AnimatedCounter value={threatStats.detectionRate || 0} decimals={1} />/hr
          </div>
        </Card>
        <Card className="bg-black/40 border-emerald-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-400">Avg Confidence</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            <AnimatedCounter value={threatStats.avgConfidence || 0} decimals={1} />%
          </div>
        </Card>
      </div>

      {/* AI Analysis Cards */}
      <div className="space-y-4">
        <ResponseCard
          title="Threat Analysis"
          icon={Brain}
          response={analysis}
          loading={loading.analysis}
          type="analysis"
          onRefresh={() => fetchAIResponse("analysis")}
        />

        <ResponseCard
          title="Strategic Recommendations"
          icon={Lightbulb}
          response={recommendations}
          loading={loading.recommendations}
          type="recommendations"
          onRefresh={() => fetchAIResponse("recommendations")}
        />

        <ResponseCard
          title="Predictive Intelligence"
          icon={Sparkles}
          response={prediction}
          loading={loading.prediction}
          type="prediction"
          onRefresh={() => fetchAIResponse("prediction")}
        />
      </div>

      {/* Query Interface */}
      <Card className="bg-black/40 backdrop-blur-sm border-emerald-500/30">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-emerald-300">Ask AI About Threats</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(prev => ({ ...prev, query: !prev.query }))}
              className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300 ml-auto"
            >
              {expanded.query ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {expanded.query && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask questions about threats, patterns, recommendations..."
                  className="bg-black/40 border-emerald-500/30 text-gray-300 placeholder:text-gray-500 min-h-[100px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      fetchAIResponse("query")
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Press Ctrl+Enter to submit</p>
                <Button
                  onClick={() => fetchAIResponse("query")}
                  disabled={!query.trim() || loading.query}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {loading.query ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Ask AI
                    </>
                  )}
                </Button>
              </div>

              {queryResponse && (
                <Card className="bg-emerald-500/10 border-emerald-500/30 p-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-300">AI Response</span>
                    </div>
                    <div className="text-sm text-gray-300 leading-relaxed space-y-1">
                      {parseMarkdown(queryResponse.response)}
                    </div>
                    {queryResponse.timestamp && (
                      <div className="text-xs text-gray-500 pt-4 mt-4 border-t border-emerald-500/20">
                        <span className="text-emerald-400/60">Generated:</span> {new Date(queryResponse.timestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

