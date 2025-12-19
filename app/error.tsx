// CREATE: app/error.tsx (One file handles everything)
'use client'

import { useEffect } from 'react'
import { VideoBackground } from '@/components/video-background'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Application Error:', error)
  }, [error])

  // Determine error type and customize response
  const getErrorInfo = () => {
    const message = error.message.toLowerCase()
    
    if (message.includes('unauthorized') || message.includes('jwt') || message.includes('token')) {
      return {
        title: "Authentication Error",
        description: "Your session has expired or is invalid. Please log in again.",
        icon: "🔐",
        actions: [
          { 
            label: "Login", 
            onClick: () => {
              document.cookie = "auth_token=; path=/; max-age=0"
              router.push("/auth/login")
            },
            primary: true 
          },
          { label: "Try Again", onClick: reset }
        ]
      }
    }
    
    if (message.includes('database') || message.includes('mongo') || message.includes('connection')) {
      return {
        title: "Database Connection Error",
        description: "Unable to connect to our servers. This is usually temporary.",
        icon: "🌊",
        actions: [
          { label: "Try Again", onClick: reset, primary: true },
          { label: "Go Home", onClick: () => router.push("/") }
        ]
      }
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        title: "Network Error",
        description: "Check your internet connection and try again.",
        icon: "📡",
        actions: [
          { label: "Try Again", onClick: reset, primary: true },
          { label: "Go Home", onClick: () => router.push("/") }
        ]
      }
    }
    
    if (message.includes('not found') || error.name === 'NotFoundError') {
      return {
        title: "Page Not Found",
        description: "The page you're looking for doesn't exist or has been moved.",
        icon: "🔍",
        actions: [
          { label: "Go Home", onClick: () => router.push("/"), primary: true },
          { label: "Try Again", onClick: reset }
        ]
      }
    }
    
    // Default error
    return {
      title: "Something Went Wrong",
      description: "We encountered an unexpected error. Our team has been notified.",
      icon: "⚠️",
      actions: [
        { label: "Try Again", onClick: reset, primary: true },
        { label: "Go Home", onClick: () => router.push("/") }
      ]
    }
  }

  const errorInfo = getErrorInfo()

  return (
    <div className="relative min-h-screen w-full text-foreground">
      <VideoBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 shadow-2xl backdrop-blur-md">
            {/* Error Icon */}
            <div className="text-6xl mb-4">{errorInfo.icon}</div>
            
            {/* Error Title */}
            <h1 className="text-2xl font-bold text-white mb-3">
              {errorInfo.title}
            </h1>
            
            {/* Error Description */}
            <p className="text-white/70 mb-6 leading-relaxed">
              {errorInfo.description}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {errorInfo.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    action.primary
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
            
            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-red-300 cursor-pointer hover:text-red-200">
                  🐛 Developer Details
                </summary>
                <div className="mt-3 p-3 bg-black/30 rounded-lg">
                  <p className="text-xs text-red-200 font-mono break-all">
                    <strong>Error:</strong> {error.name}
                  </p>
                  <p className="text-xs text-red-200 font-mono break-all mt-1">
                    <strong>Message:</strong> {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-200 font-mono break-all mt-1">
                      <strong>Digest:</strong> {error.digest}
                    </p>
                  )}
                </div>
              </details>
            )}
            
            {/* Retry Counter */}
            <div className="mt-4 text-xs text-white/50">
              Error ID: {error.digest || 'ERR_' + Date.now()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
