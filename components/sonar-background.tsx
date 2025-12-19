"use client"

export default function SonarBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      {/* Hexagonal grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30 sonar-rotate"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="hexagon" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path
              d="M 25 50 L 50 0 L 75 50 L 75 150 L 50 200 L 25 150 Z"
              fill="none"
              stroke="url(#gradientStroke)"
              strokeWidth="0.5"
            />
          </pattern>
          <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#00ffa3" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <rect width="1000" height="1000" fill="url(#hexagon)" />
      </svg>

      {/* Radial sonar pulses */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-primary/30"
            style={{
              animation: `sonar-pulse ${2 + i * 0.5}s ease-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `sonar-pulse ${3 + Math.random() * 2}s ease-out infinite`,
              animationDelay: `${Math.random() * 1}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle wave effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent pointer-events-none" />
    </div>
  )
}
