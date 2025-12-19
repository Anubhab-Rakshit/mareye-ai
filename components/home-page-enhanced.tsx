"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Brain, Target, BarChart3, Zap, Shield, Lock, 
  Radar, Waves, Cpu, Network, Satellite, 
  ArrowRight, Play, Sparkles, TrendingUp,
  Activity, Gauge, Monitor, CheckCircle2,
  Image as ImageIcon, Video, Eye, Layers
} from "lucide-react"
import { SonarGridBackground } from "@/components/sonar-grid-background"
import { AnimatedCounter } from "@/components/animated-counter"
import { ImageSlideshow } from "@/components/image-slideshow"
import { TacticalCornerBrackets } from "@/components/tactical-corner-brackets"

export function HomePageEnhanced() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [activeFeature, setActiveFeature] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  const deepSeaImages = [
    "/deep-sea-images/security1.jpg",
    "/deep-sea-images/security2.jpg",
    "/deep-sea-images/security3.jpg",
    "/deep-sea-images/security4.jpg",
  ]

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("mousemove", handleMouseMove)
    
    // Auto-rotate features
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3)
    }, 4000)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("mousemove", handleMouseMove)
      clearInterval(featureInterval)
    }
  }, [])

  const features = [
    {
      icon: Brain,
      title: "CNN Enhancement",
      description: "Advanced neural networks for underwater image and video enhancement with real-time processing capabilities",
      color: "cyan",
      highlights: ["Deep Learning", "Image Quality", "Video Processing"]
    },
    {
      icon: Target,
      title: "AI Detection",
      description: "Real-time object detection for submarines, mines, and marine threats using YOLO technology",
      color: "emerald",
      highlights: ["YOLO v8", "Multi-Class", "Real-Time"]
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Comprehensive analytics and reporting for marine security operations with detailed insights",
      color: "blue",
      highlights: ["Reports", "Metrics", "Insights"]
    }
  ]

  // Removed fake stats - will use creative content instead

  const capabilities = [
    { icon: Zap, title: "Real-Time Processing", desc: "Instant image enhancement" },
    { icon: Shield, title: "Military Grade Security", desc: "Encrypted operations" },
    { icon: Radar, title: "Advanced Sonar Tech", desc: "Deep sea detection" },
    { icon: Cpu, title: "AI-Powered Analysis", desc: "Neural network processing" },
    { icon: Network, title: "Cloud Integration", desc: "Scalable infrastructure" },
    { icon: Satellite, title: "Satellite Link", desc: "Global connectivity" }
  ]

  return (
    <main className="relative overflow-hidden">
      <SonarGridBackground />
      
      {/* Hero Section - Full Power */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      >
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {/* Parallax Layers */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            transform: `translateY(${scrollY * 0.5}px) translateX(${typeof window !== 'undefined' ? (mousePosition.x - window.innerWidth / 2) * 0.01 : 0}px)`,
          }}
        >
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500 rounded-full blur-3xl" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Text Content */}
            <div className="text-center lg:text-left space-y-8">
              {/* Animated Logo/Icon */}
              <div className="flex justify-center lg:justify-start mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/40 rounded-3xl blur-2xl animate-pulse" />
                  <div className="relative w-32 h-32 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-3xl flex items-center justify-center border-2 border-cyan-500/60 backdrop-blur-md shadow-2xl shadow-cyan-500/30">
                    <Radar className="w-16 h-16 text-cyan-300 animate-spin-slow" />
                  </div>
                </div>
              </div>

              {/* Main Title with Gradient Animation */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6">
                <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
                  MAREYE
                </span>
                <span className="block text-3xl md:text-5xl lg:text-6xl mt-4 bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
                  MARINE SECURITY
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-cyan-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-space-mono tracking-wider">
                Advanced AI-Powered Platform for Underwater Image Enhancement, 
                Object Detection & Marine Security Operations
              </p>

              {/* Creative Feature Pills */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-6">
                <div className="group px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-cyan-300 font-space-mono font-bold">Real-Time</span>
                  </div>
                </div>
                <div className="group px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full hover:bg-blue-500/20 hover:border-blue-400/50 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-blue-300 font-space-mono font-bold">Secure</span>
                  </div>
                </div>
                <div className="group px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Radar className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform animate-pulse" />
                    <span className="text-sm text-emerald-300 font-space-mono font-bold">AI-Powered</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mt-8">
                <Link href="/cnn">
                  <button className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black text-lg rounded-xl shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all duration-300 hover:scale-105 font-orbitron tracking-wider overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative z-10 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      START ENHANCEMENT
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </Link>
                
                <Link href="/detection">
                  <button className="group px-8 py-4 bg-slate-900/60 backdrop-blur-md border-2 border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 font-black text-lg rounded-xl transition-all duration-300 hover:scale-105 font-orbitron tracking-wider">
                    <span className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      OBJECT DETECTION
                    </span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Side - Image Slideshow */}
            <div className="relative space-y-8">
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

              {/* Creative Capabilities Grid Below Image */}
              <div className="grid grid-cols-3 gap-4">
                <div className="group bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 text-center hover:border-cyan-400/60 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer">
                  <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-xs text-cyan-300/80 font-space-mono uppercase tracking-wider font-bold">Real-Time</div>
                  <div className="text-xs text-cyan-300/50 font-space-mono mt-1">Processing</div>
                </div>
                <div className="group bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 text-center hover:border-cyan-400/60 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer">
                  <Shield className="w-6 h-6 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-xs text-cyan-300/80 font-space-mono uppercase tracking-wider font-bold">Secure</div>
                  <div className="text-xs text-cyan-300/50 font-space-mono mt-1">Encrypted</div>
                </div>
                <div className="group bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 text-center hover:border-cyan-400/60 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer">
                  <Radar className="w-6 h-6 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform animate-pulse" />
                  <div className="text-xs text-cyan-300/80 font-space-mono uppercase tracking-wider font-bold">Active</div>
                  <div className="text-xs text-cyan-300/50 font-space-mono mt-1">Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-cyan-400/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section - Interactive */}
      <section className="relative py-32 bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent font-orbitron">
              POWERFUL FEATURES
            </h2>
            <p className="text-xl text-cyan-200 max-w-3xl mx-auto font-space-mono">
              Cutting-edge AI technology for marine security operations
            </p>
          </div>

          {/* Feature Cards with Rotation */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`group relative bg-slate-900/60 backdrop-blur-md border-2 rounded-2xl p-8 cursor-pointer transition-all duration-500 ${
                  activeFeature === index
                    ? "border-cyan-400/80 scale-105 shadow-2xl shadow-cyan-500/30"
                    : "border-cyan-500/30 hover:border-cyan-400/50"
                }`}
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  activeFeature === index ? "opacity-100" : ""
                }`}>
                  {feature.color === "cyan" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-2xl" />
                  )}
                  {feature.color === "emerald" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-2xl" />
                  )}
                  {feature.color === "blue" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent rounded-2xl" />
                  )}
                </div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center border-2 transition-transform duration-300 ${
                    activeFeature === index ? "scale-110 rotate-3" : "group-hover:scale-105"
                  } ${
                    feature.color === "cyan" ? "bg-gradient-to-br from-cyan-400/30 to-cyan-600/30 border-cyan-500/40" :
                    feature.color === "emerald" ? "bg-gradient-to-br from-emerald-400/30 to-emerald-600/30 border-emerald-500/40" :
                    "bg-gradient-to-br from-blue-400/30 to-blue-600/30 border-blue-500/40"
                  }`}>
                    <feature.icon className={`w-8 h-8 ${
                      feature.color === "cyan" ? "text-cyan-300" :
                      feature.color === "emerald" ? "text-emerald-300" :
                      "text-blue-300"
                    }`} />
                  </div>

                  {/* Feature Highlights */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {feature.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-full text-xs font-space-mono font-bold ${
                          feature.color === "cyan" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" :
                          feature.color === "emerald" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                          "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        }`}
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 text-center font-orbitron">{feature.title}</h3>
                  <p className="text-cyan-200/80 text-center leading-relaxed">{feature.description}</p>
                </div>

                {/* Active Indicator */}
                {activeFeature === index && (
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Capabilities Grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {capabilities.map((cap, index) => (
              <div
                key={index}
                className="group bg-slate-900/40 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 text-center"
              >
                <cap.icon className="w-8 h-8 text-cyan-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-bold text-white mb-2 font-orbitron">{cap.title}</h4>
                <p className="text-xs text-cyan-200/60 font-space-mono">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section - Enhanced */}
      <section className="relative py-32 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent font-orbitron">
              AI-POWERED SOLUTIONS
            </h2>
            <p className="text-xl text-cyan-200 max-w-3xl mx-auto font-space-mono">
              Advanced AI-powered platform combining CNN image processing and object detection
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* CNN Card */}
            <Link href="/cnn">
              <div className="group relative bg-slate-900/60 backdrop-blur-md border-2 border-cyan-500/30 rounded-3xl p-8 hover:border-cyan-400/80 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/30 hover:-translate-y-2 overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-cyan-500/20">
                    <Brain className="w-10 h-10 text-cyan-300" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-white mb-4 text-center font-orbitron group-hover:text-cyan-100 transition-colors">
                    CNN ENHANCEMENT
                  </h3>
                  <p className="text-cyan-200 mb-6 text-center leading-relaxed">
                    Advanced Convolutional Neural Network for underwater image and video enhancement with real-time processing
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    {["Image Enhancement", "Video Processing", "Quality Improvement", "Real-time Analysis"].map((feature, i) => (
                      <div key={i} className="flex items-center text-emerald-400 group-hover:text-emerald-300 transition-colors">
                        <CheckCircle2 className="w-5 h-5 mr-3" />
                        <span className="font-space-mono">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center text-cyan-300 group-hover:text-cyan-200 font-bold font-orbitron">
                    <span>Explore Solution</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Detection Card */}
            <Link href="/detection">
              <div className="group relative bg-slate-900/60 backdrop-blur-md border-2 border-cyan-500/30 rounded-3xl p-8 hover:border-cyan-400/80 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/30 hover:-translate-y-2 overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-400/30 to-cyan-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-emerald-500/20">
                    <Target className="w-10 h-10 text-emerald-300" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-white mb-4 text-center font-orbitron group-hover:text-emerald-100 transition-colors">
                    OBJECT DETECTION
                  </h3>
                  <p className="text-cyan-200 mb-6 text-center leading-relaxed">
                    AI-powered object detection system for submarines, mines, divers, and marine threats with YOLO technology
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    {["YOLO Detection", "Real-time Analysis", "Multi-class Recognition", "Threat Assessment"].map((feature, i) => (
                      <div key={i} className="flex items-center text-emerald-400 group-hover:text-emerald-300 transition-colors">
                        <CheckCircle2 className="w-5 h-5 mr-3" />
                        <span className="font-space-mono">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center text-cyan-300 group-hover:text-cyan-200 font-bold font-orbitron">
                    <span>Explore Solution</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
        
        @keyframes animate-gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: animate-gradient 3s ease infinite;
        }
        
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}</style>
    </main>
  )
}

