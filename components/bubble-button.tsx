"use client"

import type React from "react"

import { useState, useRef, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BubbleEffect {
  id: number
  x: number
  y: number
  size: number
}

interface BubbleButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export const BubbleButton = forwardRef<HTMLButtonElement, BubbleButtonProps>(({
  children,
  className,
  onClick,
  variant = "default",
  size = "default",
}, ref) => {
  const [bubbles, setBubbles] = useState<BubbleEffect[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const createBubbles = (e: React.MouseEvent) => {
    const buttonElement = e.currentTarget as HTMLButtonElement
    if (!buttonElement) return

    const rect = buttonElement.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Play bubble sound
    if (!audioRef.current) {
      audioRef.current = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/soft_sound_of_bubble-1757138098521-HJsxhc5ZykB6KSM1vP84vPhk21phtX.mp3")
      audioRef.current.volume = 0.3
    }
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})

    // Create multiple bubbles
    const newBubbles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
      size: Math.random() * 20 + 10,
    }))

    setBubbles((prev) => [...prev, ...newBubbles])

    // Remove bubbles after animation
    setTimeout(() => {
      setBubbles((prev) => prev.filter((bubble) => !newBubbles.includes(bubble)))
    }, 1000)

    onClick?.()
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "relative overflow-hidden backdrop-blur-md bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 hover:from-cyan-400/30 hover:to-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25",
        className,
      )}
      onClick={createBubbles}
    >
      {children}

      {/* Bubble effects */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full bg-gradient-to-br from-cyan-400/60 to-blue-500/40 border border-cyan-300/40 animate-ping"
          style={{
            left: bubble.x - bubble.size / 2,
            top: bubble.y - bubble.size / 2,
            width: bubble.size,
            height: bubble.size,
            animationDuration: "1s",
            boxShadow: `0 0 ${bubble.size}px rgba(6, 182, 212, 0.4), inset 0 0 ${bubble.size / 2}px rgba(255, 255, 255, 0.2)`,
          }}
        />
      ))}
    </Button>
  )
})

BubbleButton.displayName = "BubbleButton"
