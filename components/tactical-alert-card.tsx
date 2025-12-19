"use client"

import type { ReactNode } from "react"
import { X } from "lucide-react"

interface TacticalAlertCardProps {
  icon: ReactNode
  title: string
  message: string
  severity: "critical" | "warning" | "info"
  onDismiss?: () => void
  timestamp?: string
  className?: string
}

const severityMap = {
  critical: {
    border: "border-red-500/40",
    bg: "bg-red-500/10",
    icon: "text-red-400",
    title: "text-red-300",
    badge: "bg-red-500/20 border-red-500/40 text-red-300",
  },
  warning: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    icon: "text-amber-400",
    title: "text-amber-300",
    badge: "bg-amber-500/20 border-amber-500/40 text-amber-300",
  },
  info: {
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/10",
    icon: "text-cyan-400",
    title: "text-cyan-300",
    badge: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
  },
}

export function TacticalAlertCard({
  icon,
  title,
  message,
  severity,
  onDismiss,
  timestamp,
  className = "",
}: TacticalAlertCardProps) {
  const styles = severityMap[severity]
  const timeAgo = timestamp
    ? new Date(timestamp).toLocaleDateString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })
    : "Now"

  return (
    <div
      className={`group relative overflow-hidden rounded-lg bg-slate-900/40 backdrop-blur-md border ${styles.border} ${styles.bg} transition-all duration-300 p-4 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${styles.bg} border ${styles.border}`}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={`font-orbitron font-bold text-sm ${styles.title} tracking-wide`}>{title}</h4>
              <p className="text-xs text-slate-300/70 mt-1 leading-relaxed">{message}</p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`text-[10px] font-space-mono font-bold uppercase tracking-wider px-2 py-1 rounded border ${styles.badge}`}
            >
              {severity.toUpperCase()}
            </span>
            <span className="text-[10px] font-space-mono text-slate-400">{timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Pulsing border for critical alerts */}
      {severity === "critical" && (
        <div className="absolute inset-0 rounded-lg border border-red-500/60 animate-pulse pointer-events-none" />
      )}
    </div>
  )
}
