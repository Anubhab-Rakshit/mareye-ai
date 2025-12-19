"use client"

import type React from "react"

interface TacticalStatProps {
  label: string
  value: string | number
  unit?: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "stable"
  variant?: "primary" | "secondary" | "success" | "warning" | "danger"
}

export default function TacticalStat({ label, value, unit, icon, trend, variant = "primary" }: TacticalStatProps) {
  const colorMap = {
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-green-400",
    warning: "text-yellow-400",
    danger: "text-destructive",
  }

  const bgColorMap = {
    primary: "from-primary/10 to-primary/5",
    secondary: "from-secondary/10 to-secondary/5",
    success: "from-green-500/10 to-green-500/5",
    warning: "from-yellow-500/10 to-yellow-500/5",
    danger: "from-destructive/10 to-destructive/5",
  }

  return (
    <div className={`border border-border/50 rounded-lg p-4 bg-gradient-to-br ${bgColorMap[variant]} backdrop-blur-xl`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <div className={`text-2xl font-bold font-mono ${colorMap[variant]}`}>{value}</div>
            {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          </div>
        </div>
        {icon && <div className={colorMap[variant]}>{icon}</div>}
      </div>
      {trend && (
        <div className="mt-2 text-xs text-muted-foreground">
          {trend === "up" && <span>▲ Increasing</span>}
          {trend === "down" && <span>▼ Decreasing</span>}
          {trend === "stable" && <span>→ Stable</span>}
        </div>
      )}
    </div>
  )
}
