import { GoogleGenerativeAI } from "@google/generative-ai"

export const TEXT_MODEL_ID = "gemini-2.0-flash"
export const VISION_MODEL_ID = process.env.GEMINI_VISION_MODEL_ID || "gemini-1.5-flash"

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable")
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
}

// Get the Gemini 2.0 Flash model for text generation
export const getGeminiFlashModel = () => {
  const genAI = getGeminiClient()
  return genAI.getGenerativeModel({ model: TEXT_MODEL_ID })
}

// Get the Gemini 2.0 Flash model for image analysis
export const getGeminiFlashVisionModel = () => {
  const genAI = getGeminiClient()
  return genAI.getGenerativeModel({ model: VISION_MODEL_ID })
}

export interface SpeciesIdentificationResult {
  species: string
  confidence: number
  scientificName: string
  commonName?: string
  classification: {
    kingdom: string
    phylum: string
    class: string
    order: string
    family: string
    genus: string
  }
  habitat: string
  conservationStatus: string
  threats: string[]
  description: string
}

export interface ThreatAssessmentResult {
  threatLevel: "low" | "moderate" | "high" | "critical"
  primaryThreats: string[]
  humanImpactFactors: string[]
  affectedSpecies: string[]
  timeframe: string
  recommendations: string[]
  urgency: number // 1-10 scale
}

export interface ConservationRecommendation {
  priority: "low" | "medium" | "high" | "urgent"
  actions: string[]
  timeline: string
  resources: string[]
  expectedOutcome: string
  monitoringPlan: string[]
  stakeholders: string[]
}

export interface WaterQualityAnalysis {
  overallQuality: "excellent" | "good" | "moderate" | "poor" | "critical"
  qualityIndex: number // 0-100
  contaminationLevel: "low" | "moderate" | "high" | "severe"
  primaryContaminants: string[]
  healthRisks: string[]
  ecosystemImpact: string
  recommendations: string[]
  monitoringNeeds: string[]
}
