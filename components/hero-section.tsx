"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SonarGridBackground } from "@/components/sonar-grid-background"
import { TacticalCornerBrackets } from "@/components/tactical-corner-brackets"
import { AnimatedCounter } from "@/components/animated-counter"
import { ImageSlideshow } from "@/components/image-slideshow"
import { ArrowRight, Sofa as Sonar, Shield, Crosshair } from "lucide-react"

interface HeroStats {
  speciesIdentified: number
  waterQualityPoints: number
  conservationProjects: number
}

export function HeroSection() {
  const router = useRouter()
  const [stats, setStats] = useState<HeroStats>({
    speciesIdentified: 0,
    waterQualityPoints: 0,
    conservationProjects: 0,
  })
  const [loading, setLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)

  const deepSeaImages = [
    "/deep-sea-images/security1.jpg",
    "/deep-sea-images/security2.jpg",
    "/deep-sea-images/security3.jpg",
    "/deep-sea-images/security4.jpg",
  ]

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    fetchHeroStats()
  }, [])

  const fetchHeroStats = async () => {
    try {
      const response = await fetch("/api/dashboard-data?timeframe=all")
      if (response.ok) {
        const data = await response.json()
        setStats({
          speciesIdentified: data.totalSpecies || 0,
          waterQualityPoints: data.waterQualityPoints || 0,
          conservationProjects: data.conservationProjects || 0,
        })
      }
    } catch (error) {
      console.error("Failed to fetch hero stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToSolutions = () => {
    console.log("Explore Our Solution button clicked")
    router.push("/subscription")
  }

  const scrollToData = () => {
    console.log("View Research Data button clicked")
    router.push("/solutions/data-collection")
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <SonarGridBackground />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-slate-950/80" />

      <div
        className="absolute inset-0 opacity-30"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-15" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content - Main messaging */}
          <div className="space-y-8 animate-slide-down">
            {/* Tactical HUD header label */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 w-fit">
              <Sonar className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-space-mono font-bold tracking-widest text-cyan-300 uppercase">
                ACTIVE SURVEILLANCE SYSTEM
              </span>
            </div>

            {/* Main headline with tactical styling */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-orbitron font-black text-balance leading-tight tracking-wider">
                <span className="text-white drop-shadow-lg">MAREYE</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                  MARINE SECURITY
                </span>
                <br />
                <span className="text-white drop-shadow-lg">DEFENSE PLATFORM</span>
              </h1>
              <p className="text-lg text-cyan-100/90 text-pretty max-w-2xl leading-relaxed font-space-mono">
                Advanced AI-powered marine security system for submarine detection, mine identification, diver tracking,
                drone surveillance, torpedo analysis, and real-time threat assessment in underwater environments.
              </p>
            </div>

            {/* Tactical capability cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="group relative p-4 rounded-lg bg-slate-900/40 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-md bg-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/30 transition-colors duration-300">
                    <Shield className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-orbitron font-bold text-sm text-white group-hover:text-cyan-100 transition-colors duration-300 tracking-wide">
                      SUBMARINE DETECTION
                    </h3>
                  </div>
                </div>
              </div>

              <div className="group relative p-4 rounded-lg bg-slate-900/40 backdrop-blur-md border border-blue-500/20 hover:border-blue-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors duration-300">
                    <Crosshair className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-orbitron font-bold text-sm text-white group-hover:text-blue-100 transition-colors duration-300 tracking-wide">
                      MINE IDENTIFICATION
                    </h3>
                  </div>
                </div>
              </div>

              <div className="group relative p-4 rounded-lg bg-slate-900/40 backdrop-blur-md border border-emerald-500/20 hover:border-emerald-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-md bg-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/30 transition-colors duration-300">
                    <Sonar className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-orbitron font-bold text-sm text-white group-hover:text-emerald-100 transition-colors duration-300 tracking-wide">
                      DIVER TRACKING
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons with holographic effect */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={scrollToSolutions} className="tactical-button group relative">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  ACTIVATE SYSTEM
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
              </button>
              <button
                onClick={scrollToData}
                className="tactical-button group relative border-emerald-400/50 hover:border-emerald-300/80"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  VIEW ANALYTICS
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
            </div>
          </div>

          {/* Right side - Visual showcase with stats */}
          <div className="relative space-y-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative group">
              {/* Tactical corner brackets */}
              <TacticalCornerBrackets className="w-full h-full" color="cyan" />

              {/* Main showcase card with glass morphism */}
              <div className="relative w-full h-96 lg:h-[500px] rounded-xl overflow-hidden border-2 border-cyan-500/40 backdrop-blur-2xl bg-slate-900/20 shadow-2xl shadow-cyan-500/10 group-hover:shadow-cyan-500/30 transition-all duration-500 group-hover:border-cyan-400/60">
                {/* Glow effect background */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5" />

                {/* Image Slideshow */}
                <ImageSlideshow images={deepSeaImages} autoSlide={true} slideInterval={5000} />

                {/* AI workflow visualization overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-6">
                  <div className="space-y-3">
                    <h3 className="font-orbitron font-bold text-white text-sm tracking-wider">AI DEFENSE PIPELINE</h3>
                    <div className="flex items-center justify-between text-xs font-space-mono text-cyan-300 space-x-2">
                      <span className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/40">SURVEILLANCE</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                      <span className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/40">DETECTION</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                      <span className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/40">RESPONSE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="group p-4 rounded-lg bg-slate-900/40 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 text-center hover:shadow-lg hover:shadow-cyan-500/10">
                <div className="text-2xl font-orbitron font-bold text-cyan-400 mb-1">
                  <AnimatedCounter target={stats.speciesIdentified} duration={2000} suffix="+" />
                </div>
                <p className="text-xs font-space-mono text-cyan-200/70 uppercase tracking-wide">THREATS DETECTED</p>
              </div>

              <div className="group p-4 rounded-lg bg-slate-900/40 backdrop-blur-md border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 text-center hover:shadow-lg hover:shadow-blue-500/10">
                <div className="text-2xl font-orbitron font-bold text-blue-400 mb-1">
                  <AnimatedCounter target={stats.waterQualityPoints} duration={2000} suffix="%" />
                </div>
                <p className="text-xs font-space-mono text-blue-200/70 uppercase tracking-wide">SYSTEM UPTIME</p>
              </div>

              <div className="group p-4 rounded-lg bg-slate-900/40 backdrop-blur-md border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300 text-center hover:shadow-lg hover:shadow-emerald-500/10">
                <div className="text-2xl font-orbitron font-bold text-emerald-400 mb-1">
                  <AnimatedCounter target={stats.conservationProjects} duration={2000} suffix="+" />
                </div>
                <p className="text-xs font-space-mono text-emerald-200/70 uppercase tracking-wide">ACTIVE MISSIONS</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator with tactical styling */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex flex-col items-center space-y-2">
          <span className="text-xs font-space-mono text-cyan-300/50 uppercase tracking-widest">SCROLL</span>
          <div className="animate-bounce">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
