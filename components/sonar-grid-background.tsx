"use client"

export function SonarGridBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Base deep ocean background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950" />

      {/* Radial sonar pulse from center */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute border border-cyan-500/40 rounded-full"
            style={{
              width: `${100 + i * 150}px`,
              height: `${100 + i * 150}px`,
              animation: `sonar-pulse ${3 + i * 0.5}s ease-out infinite`,
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
      </div>

      {/* Hexagonal grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
        <defs>
          <pattern id="hex-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 30 0 L 60 15 L 60 45 L 30 60 L 0 45 L 0 15 Z"
              fill="none"
              stroke="url(#cyan-gradient)"
              strokeWidth="1"
            />
          </pattern>
          <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(0, 217, 255)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(0, 217, 255)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-grid)" />
      </svg>

      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 opacity-20 animate-grid-pulse">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-15" />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-cyan-400 rounded-full blur-3xl opacity-10" />
      </div>

      {/* Underwater light rays */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-cyan-400/50 to-transparent" />
        <div
          className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-blue-400/30 to-transparent"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-0 left-2/3 w-0.5 h-full bg-gradient-to-b from-cyan-300/20 to-transparent"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Particle effect - subtle floating elements */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Coordinate grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(0, 217, 255)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}
