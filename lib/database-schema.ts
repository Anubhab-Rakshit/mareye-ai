// Database schema definitions for the biodiversity platform

export interface Species {
  _id?: string
  scientificName: string
  commonName?: string
  classification: {
    kingdom: string
    phylum: string
    class: string
    order: string
    family: string
    genus: string
    species: string
  }
  habitat: string
  depth: {
    min: number
    max: number
  }
  conservationStatus: "LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX" | "DD"
  imageUrl?: string
  description?: string
  threats: string[]
  discoveredDate?: Date
  lastSeen?: Date
  createdAt: Date
  updatedAt: Date
}

export interface WaterQualityData {
  _id?: string
  location: {
    latitude: number
    longitude: number
    depth: number
    region: string
  }
  measurements: {
    temperature: number // Celsius
    salinity: number // PSU
    pH: number
    dissolvedOxygen: number // mg/L
    turbidity: number // NTU
    pollutants: {
      microplastics: number // particles/m³
      heavyMetals: {
        mercury: number // µg/L
        lead: number // µg/L
        cadmium: number // µg/L
      }
      chemicals: {
        pesticides: number // µg/L
        hydrocarbons: number // µg/L
      }
    }
  }
  qualityIndex: number // 0-100 scale
  contaminationLevel: "low" | "moderate" | "high" | "severe"
  samplingDate: Date
  samplingMethod: string
  researchTeam: string
  createdAt: Date
}

export interface GeneSequence {
  _id?: string
  sequenceId: string
  dnaSequence: string
  sequenceType: "COI" | "16S" | "18S" | "ITS" | "other"
  species?: {
    predicted: string
    confidence: number
    alternativeMatches: Array<{
      species: string
      confidence: number
    }>
  }
  location: {
    latitude: number
    longitude: number
    depth: number
  }
  samplingDate: Date
  analysisStatus: "pending" | "processing" | "completed" | "failed"
  analysisResults?: {
    speciesIdentification: string
    confidence: number
    phylogeneticPosition: string
    noveltyScore: number // 0-1, higher means more novel
  }
  createdAt: Date
  updatedAt: Date
}

export interface ResearchProject {
  _id?: string
  title: string
  description: string
  leadResearcher: string
  institution: string
  startDate: Date
  endDate?: Date
  status: "active" | "completed" | "paused"
  objectives: string[]
  methodology: string
  studyArea: {
    coordinates: Array<[number, number]> // [longitude, latitude] pairs for polygon
    depth: {
      min: number
      max: number
    }
  }
  speciesFound: string[] // Species IDs
  dataCollected: {
    waterQualitySamples: number
    geneSequences: number
    speciesObservations: number
  }
  findings: string[]
  publications: Array<{
    title: string
    journal: string
    doi?: string
    publishedDate: Date
  }>
  createdAt: Date
  updatedAt: Date
}

export interface ConservationAlert {
  _id?: string
  alertType: "species_decline" | "habitat_degradation" | "pollution_spike" | "new_threat"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  location: {
    latitude: number
    longitude: number
    region: string
  }
  affectedSpecies: string[] // Species IDs
  threatFactors: string[]
  recommendedActions: string[]
  status: "active" | "monitoring" | "resolved"
  reportedBy: string
  reportedDate: Date
  lastUpdated: Date
}

export interface AIAnalysis {
  _id?: string
  analysisType: "species_identification" | "threat_assessment" | "conservation_recommendation"
  inputData: {
    type: "image" | "gene_sequence" | "environmental_data"
    data: string // Base64 image, sequence string, or JSON data
  }
  results: {
    primary: string
    confidence: number
    alternatives?: Array<{
      result: string
      confidence: number
    }>
    explanation: string
  }
  modelUsed: string
  processingTime: number // milliseconds
  createdAt: Date
}
