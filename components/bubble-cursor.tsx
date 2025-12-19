"use client"

import { useEffect, useState } from "react"

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  velocity: { x: number; y: number }
  wobble: number
  shimmer: number
  depth: number
}

export function BubbleCursor() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    let bubbleId = 0

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })

      if (Math.random() < 0.15) {
        const newBubble: Bubble = {
          id: bubbleId++,
          x: e.clientX + (Math.random() - 0.5) * 30,
          y: e.clientY + (Math.random() - 0.5) * 30,
          size: Math.random() * 12 + 6,
          opacity: Math.random() * 0.4 + 0.3,
          velocity: {
            x: (Math.random() - 0.5) * 1.5,
            y: -Math.random() * 4 - 2,
          },
          wobble: Math.random() * Math.PI * 2,
          shimmer: Math.random() * 0.3 + 0.1,
          depth: Math.random() * 0.5 + 0.5,
        }

        setBubbles((prev) => [...prev.slice(-25), newBubble])
      }
    }

    window.addEventListener("mousemove", handleMouseMove)

    const interval = setInterval(() => {
      setBubbles((prev) =>
        prev
          .map((bubble) => ({
            ...bubble,
            x: bubble.x + bubble.velocity.x + Math.sin(bubble.wobble) * 0.5,
            y: bubble.y + bubble.velocity.y,
            opacity: bubble.opacity - 0.015,
            size: bubble.size + 0.08,
            wobble: bubble.wobble + 0.1,
            shimmer: bubble.shimmer + 0.05,
          }))
          .filter((bubble) => bubble.opacity > 0 && bubble.y > -100),
      )
    }, 40)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            left: bubble.x - bubble.size / 2,
            top: bubble.y - bubble.size / 2,
            width: bubble.size,
            height: bubble.size,
            opacity: bubble.opacity,
            background: `radial-gradient(circle at 30% 30%, 
              rgba(255, 255, 255, ${0.8 * bubble.depth}) 0%, 
              rgba(6, 182, 212, ${0.4 * bubble.depth}) 30%, 
              rgba(59, 130, 246, ${0.3 * bubble.depth}) 60%, 
              rgba(6, 182, 212, ${0.1 * bubble.depth}) 100%)`,
            border: `1px solid rgba(6, 182, 212, ${0.3 * bubble.depth})`,
            boxShadow: `
              0 0 ${bubble.size * 0.8}px rgba(6, 182, 212, ${0.2 * bubble.depth}),
              inset 0 0 ${bubble.size * 0.3}px rgba(255, 255, 255, ${0.4 * bubble.depth}),
              inset ${bubble.size * 0.2}px ${bubble.size * 0.2}px ${bubble.size * 0.1}px rgba(255, 255, 255, ${0.6 * bubble.depth})
            `,
            transform: `scale(${bubble.depth}) rotate(${bubble.shimmer * 10}deg)`,
            filter: `blur(${(1 - bubble.depth) * 0.5}px)`,
          }}
        />
      ))}
    </div>
  )
}
