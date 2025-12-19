"use client"

import type React from "react"

interface HolographicCardProps {
  children: React.ReactNode
  className?: string
  glowing?: boolean
  animated?: boolean
}

export default function HolographicCard({
  children,
  className = "",
  glowing = true,
  animated = false,
}: HolographicCardProps) {
  return (
    <div
      className={`
        relative border border-primary/30 rounded-lg p-6 
        bg-gradient-to-br from-card/40 to-card/20 
        backdrop-blur-xl overflow-hidden
        ${glowing ? "shadow-lg" : ""}
        ${className}
      `}
      style={{
        boxShadow: glowing
          ? `
            0 0 20px rgba(0, 217, 255, 0.1),
            0 0 40px rgba(0, 217, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `
          : undefined,
      }}
    >
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Animated border scan (optional) */}
      {animated && (
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.1), transparent)`,
            animation: "scan-line 3s ease-in-out infinite",
          }}
        />
      )}
    </div>
  )
}
