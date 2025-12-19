"use client"

import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
}

export function DeepSeaBackground() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Initialize particles
    const initialParticles = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.5 + 0.1,
    }))
    setParticles(initialParticles)

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            y: particle.y - particle.speed,
            x: particle.x + Math.sin(particle.y * 0.01) * 0.5,
            opacity: particle.opacity + (Math.random() - 0.5) * 0.02,
          }))
          .map((particle) =>
            particle.y < -10
              ? { ...particle, y: window.innerHeight + 10, x: Math.random() * window.innerWidth }
              : particle,
          ),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep sea gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950 to-cyan-950"></div>

      {/* Animated particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            opacity: Math.max(0.1, Math.min(0.6, particle.opacity)),
            boxShadow: `0 0 ${particle.size * 2}px rgba(6, 182, 212, 0.3)`,
          }}
        />
      ))}

      {/* Underwater light rays */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-cyan-400/40 to-transparent transform rotate-12"></div>
        <div className="absolute top-0 right-1/3 w-0.5 h-full bg-gradient-to-b from-blue-400/30 to-transparent transform -rotate-6"></div>
        <div className="absolute top-0 left-2/3 w-1.5 h-full bg-gradient-to-b from-cyan-300/20 to-transparent transform rotate-3"></div>
      </div>
    </div>
  )
}
