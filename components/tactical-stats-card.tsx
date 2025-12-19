"use client"

import type { ReactNode } from "react"
import { AnimatedCounter } from "@/components/animated-counter"

interface TacticalStatsCardProps {
  icon?: ReactNode
  title?: string
  label?: string
  value: number | string
  suffix?: string
  color?: "cyan" | "blue" | "emerald" | "purple"
  className?: string
}

const colorMap = {
  cyan: {
    border: "border-cyan-500/30",
    hoverBorder: "hover:border-cyan-400/60",
    hover: "hover:shadow-cyan-500/20",
    icon: "bg-cyan-500/20 group-hover:bg-cyan-500/30 text-cyan-400",
    label: "text-cyan-200/70",
    value: "text-cyan-400",
  },
  blue: {
    border: "border-blue-500/30",
    hoverBorder: "hover:border-blue-400/60",
    hover: "hover:shadow-blue-500/20",
    icon: "bg-blue-500/20 group-hover:bg-blue-500/30 text-blue-400",
    label: "text-blue-200/70",
    value: "text-blue-400",
  },
  emerald: {
    border: "border-emerald-500/30",
    hoverBorder: "hover:border-emerald-400/60",
    hover: "hover:shadow-emerald-500/20",
    icon: "bg-emerald-500/20 group-hover:bg-emerald-500/30 text-emerald-400",
    label: "text-emerald-200/70",
    value: "text-emerald-400",
  },
  purple: {
    border: "border-purple-500/30",
    hoverBorder: "hover:border-purple-400/60",
    hover: "hover:shadow-purple-500/20",
    icon: "bg-purple-500/20 group-hover:bg-purple-500/30 text-purple-400",
    label: "text-purple-200/70",
    value: "text-purple-400",
  },
}

export function TacticalStatsCard({
  icon,
  title,
  label,
  value,
  suffix = "",
  color = "cyan",
  className = "",
}: TacticalStatsCardProps) {
  const colors = colorMap[color]
  const displayLabel = title || label

  return (
    <div
      className={`group relative overflow-hidden rounded-lg bg-slate-900/40 backdrop-blur-md border ${colors.border} ${colors.hoverBorder} transition-all duration-300 hover:shadow-lg ${colors.hover} p-6 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 space-y-4">
        {icon && (
          <div
            className={`w-12 h-12 rounded-lg ${colors.icon} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}
          >
            {icon}
          </div>
        )}

        <div className="space-y-2">
          <div className={`text-3xl font-orbitron font-bold ${colors.value}`}>
            {typeof value === 'number' ? (
              <AnimatedCounter target={value} duration={2000} suffix={suffix} />
            ) : (
              <span>{value}{suffix}</span>
            )}
          </div>
          {displayLabel && (
            <p className={`text-xs font-space-mono font-bold uppercase tracking-wider ${colors.label}`}>
              {displayLabel}
            </p>
          )}
        </div>
      </div>

      {/* Tactical corner accents */}
      <div className={`absolute -top-2 -left-2 w-4 h-4 border-t border-l ${colors.border} opacity-40`} />
      <div className={`absolute -bottom-2 -right-2 w-4 h-4 border-b border-r ${colors.border} opacity-40`} />
    </div>
  )
}
