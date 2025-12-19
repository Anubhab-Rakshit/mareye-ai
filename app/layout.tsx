import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Orbitron, Space_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ConditionalNavigation } from "@/components/conditional-navigation"
import { Chatbot } from "@/components/chatbot"

import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weights: ["400", "700", "900"],
})

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "MarEye - Marine Security Defense Platform",
  description:
    "Advanced AI-powered platform for deep-sea marine species identification, environmental threat assessment, water quality monitoring, and conservation insights using cutting-edge machine learning and environmental DNA analysis.",
  keywords:
    "marine biodiversity, deep sea research, species identification, AI, environmental DNA, water quality, conservation, marine biology",
  authors: [{ name: "AI-Driven Biodiversity Research Team" }],
  openGraph: {
    title: "MarEye - Marine Security Defense Platform",
    description: "Revolutionary AI platform for marine conservation and species discovery",
    type: "website",
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`font-body ${GeistSans.variable} ${GeistMono.variable} ${orbitron.variable} ${spaceMono.variable}`}
      >
        <ConditionalNavigation />
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>

        <Chatbot />

        <Analytics />
      </body>
    </html>
  )
}
