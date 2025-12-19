"use client"

interface TacticalCornerBracketsProps {
  className?: string
  color?: "cyan" | "blue" | "emerald"
}

const colorMap = {
  cyan: "border-cyan-500",
  blue: "border-blue-500",
  emerald: "border-emerald-500",
}

export function TacticalCornerBrackets({ className = "", color = "cyan" }: TacticalCornerBracketsProps) {
  const colorClass = colorMap[color]

  return (
    <div className={`relative ${className}`}>
      {/* Top-left corner */}
      <div className={`absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 ${colorClass} opacity-60`} />

      {/* Top-right corner */}
      <div className={`absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 ${colorClass} opacity-60`} />

      {/* Bottom-left corner */}
      <div className={`absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 ${colorClass} opacity-60`} />

      {/* Bottom-right corner */}
      <div className={`absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 ${colorClass} opacity-60`} />
    </div>
  )
}
