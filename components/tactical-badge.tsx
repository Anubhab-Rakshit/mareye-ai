"use client"

interface TacticalBadgeProps {
  label: string
  color?: "cyan" | "blue" | "emerald" | "red" | "amber"
  variant?: "solid" | "outlined"
  size?: "sm" | "md"
  animated?: boolean
  className?: string
}

const colorMap = {
  cyan: {
    solid: "bg-cyan-500/30 border-cyan-400/60 text-cyan-200",
    outlined: "border-cyan-500/40 text-cyan-300",
  },
  blue: {
    solid: "bg-blue-500/30 border-blue-400/60 text-blue-200",
    outlined: "border-blue-500/40 text-blue-300",
  },
  emerald: {
    solid: "bg-emerald-500/30 border-emerald-400/60 text-emerald-200",
    outlined: "border-emerald-500/40 text-emerald-300",
  },
  red: {
    solid: "bg-red-500/30 border-red-400/60 text-red-200",
    outlined: "border-red-500/40 text-red-300",
  },
  amber: {
    solid: "bg-amber-500/30 border-amber-400/60 text-amber-200",
    outlined: "border-amber-500/40 text-amber-300",
  },
}

const sizeMap = {
  sm: "px-2 py-1 text-[10px]",
  md: "px-3 py-1.5 text-xs",
}

export function TacticalBadge({
  label,
  color = "cyan",
  variant = "solid",
  size = "md",
  animated = false,
  className = "",
}: TacticalBadgeProps) {
  const colorStyles = colorMap[color][variant]
  const sizeStyles = sizeMap[size]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-space-mono font-bold uppercase tracking-wider transition-all duration-300 ${sizeStyles} ${colorStyles} ${animated ? "animate-pulse" : ""} ${className}`}
    >
      {animated && <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {label}
    </span>
  )
}
