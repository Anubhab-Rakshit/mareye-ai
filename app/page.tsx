import { HeroSection } from "@/components/hero-section"
import { BubbleCursor } from "@/components/bubble-cursor"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { HomePageEnhanced } from "@/components/home-page-enhanced"

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      <BubbleCursor />
      <HomePageEnhanced />
    </div>
  )
}
