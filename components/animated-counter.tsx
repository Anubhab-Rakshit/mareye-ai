"use client"

import { useEffect, useState } from "react"

interface AnimatedCounterProps {
  target: number
  duration?: number
  suffix?: string
  prefix?: string
}

export function AnimatedCounter({ target, duration = 2000, suffix = "", prefix = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (hasAnimated) return

    const increment = target / (duration / 16)
    let current = 0

    const interval = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        setHasAnimated(true)
        clearInterval(interval)
      } else {
        setCount(Math.floor(current))
      }
    }, 16)

    return () => clearInterval(interval)
  }, [target, duration, hasAnimated])

  return (
    <span className="font-orbitron font-bold tracking-wider">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}
