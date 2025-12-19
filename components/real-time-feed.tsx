"use client"

import { useState } from "react"
import { Activity, TrendingUp, AlertCircle } from "lucide-react"

export default function RealTimeFeed() {
  const [feedItems, setFeedItems] = useState([
    {
      id: 1,
      timestamp: new Date(),
      type: "detection",
      message: "Submarine detected at 42.35°N, 71.06°W",
      confidence: 98,
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 120000),
      type: "alert",
      message: "Proximity warning: Vessel approaching restricted zone",
      confidence: 87,
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 300000),
      type: "info",
      message: "System status: All sensors operational",
      confidence: 100,
    },
  ])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "detection":
        return "text-primary"
      case "alert":
        return "text-yellow-400"
      case "info":
        return "text-secondary"
      default:
        return "text-muted-foreground"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "detection":
        return <Activity className="w-4 h-4" />
      case "alert":
        return <AlertCircle className="w-4 h-4" />
      case "info":
        return <TrendingUp className="w-4 h-4" />
      default:
        return null
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {feedItems.map((item) => (
        <div
          key={item.id}
          className="p-3 rounded-lg border border-border/50 bg-card/30 flex gap-3 hover:bg-card/50 transition-colors"
        >
          <div className={`flex-shrink-0 ${getTypeColor(item.type)}`}>{getTypeIcon(item.type)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{item.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{formatTime(item.timestamp)}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-xs font-mono text-primary">{item.confidence}%</p>
          </div>
        </div>
      ))}
    </div>
  )
}
