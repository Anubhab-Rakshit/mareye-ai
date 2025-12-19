"use client"

import type { ReactNode } from "react"

interface TacticalDataPanelProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  color?: "cyan" | "blue" | "emerald"
  className?: string
}

const colorMap = {
  cyan: "border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-cyan-500/20",
  blue: "border-blue-500/30 hover:border-blue-400/60 hover:shadow-blue-500/20",
  emerald: "border-emerald-500/30 hover:border-emerald-400/60 hover:shadow-emerald-500/20",
}

export function TacticalDataPanel({ title, icon, children, color = "cyan", className = "" }: TacticalDataPanelProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-lg bg-slate-900/40 backdrop-blur-md border ${colorMap[color]} transition-all duration-300 hover:shadow-lg p-6 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
        {icon && <div className="text-lg text-current opacity-80">{icon}</div>}
        <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-widest">{title}</h3>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Corner brackets */}
      <div className="absolute -top-2 -left-2 w-3 h-3 border-t border-l border-current opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      <div className="absolute -bottom-2 -right-2 w-3 h-3 border-b border-r border-current opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
    </div>
  )
}
