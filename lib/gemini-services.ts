import { getGeminiFlashModel, getGeminiFlashVisionModel } from "./gemini-client"
import type {
  SpeciesIdentificationResult,
  ThreatAssessmentResult,
  ConservationRecommendation,
  WaterQualityAnalysis,
} from "./gemini-client"

export class GeminiAIService {
  /**
   * Identify species from image using Gemini 2.0 Flash Vision
   */
  static async identifySpeciesFromImage(
    imageData: string,
    additionalContext?: string,
  ): Promise<SpeciesIdentificationResult> {
    try {

      const prompt = `
        Analyze this deep-sea marine organism image and identify the species.
  
  Output must be concise and well-structured for UI display:
  - Species: single best guess
  - Confidence: number 0-100
  - Classification: Kingdom, Phylum, Class, Order, Family, Genus (comma-separated)
  - Habitat: 1–2 complete sentences
  - Conservation: short phrase or status code if known
  - Known Threats: 3–6 short phrases (no paragraphs)
  - Description: 1–2 complete sentences summarizing key identifying features
        
        Rules:
        - No markdown headers or emphasis characters (no #, *, _, bullets)
        - Keep sections brief; avoid long paragraphs
        - Prefer plain text labels as shown above
        ${additionalContext ? `- Context: ${additionalContext}` : ""}
        
        If species cannot be definitive, give nearest likely species and state uncertainty in Description.
      `

      // Convert base64 to the format Gemini expects
      // Detect MIME type from the data URL (supports png, jpeg, webp, etc.)
      const mimeMatch = imageData.match(/^data:([^;]+);base64,/)
      const mimeType = mimeMatch?.[1] || "image/jpeg"
      const base64Data = imageData.replace(/^data:[^,]+,/, "")

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      }

      const geminiFlashVisionModel = getGeminiFlashVisionModel()

      // Retry with exponential backoff on transient overload/rate-limit errors
      const maxAttempts = 4
      const baseDelayMs = 500
      let lastError: unknown
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const result = await geminiFlashVisionModel.generateContent([prompt, imagePart])
          const response = await result.response
          const text = response.text()
          return this.parseSpeciesIdentification(text)
        } catch (err) {
          lastError = err
          const message = err instanceof Error ? err.message : String(err)
          const isOverloaded = /503|overloaded|temporarily unavailable/i.test(message)
          const isRateLimited = /429|rate limit/i.test(message)
          if ((isOverloaded || isRateLimited) && attempt < maxAttempts) {
            const jitter = Math.floor(Math.random() * 200)
            const delay = baseDelayMs * Math.pow(2, attempt - 1) + jitter
            await new Promise((res) => setTimeout(res, delay))
            continue
          }
          throw err
        }
      }
      throw lastError instanceof Error ? lastError : new Error("Unknown error from Gemini Vision model")
    } catch (error) {
      console.error("[v0] Species identification error:", error)
      const message = error instanceof Error ? error.message : "Unknown error"
      throw new Error(`Failed to identify species from image: ${message}`)
    }
  }

  /**
   * Analyze environmental threats using human activity data
   */
  static async assessEnvironmentalThreats(
    locationData: {
      latitude: number
      longitude: number
      depth: number
      region: string
    },
    environmentalData: {
      temperature: number
      salinity: number
      pH: number
      pollutants: any
    },
    humanActivityData?: string,
  ): Promise<ThreatAssessmentResult> {
    try {

      const prompt = `
        Analyze environmental threats to deep-sea marine ecosystems based on the following data:
        
        Location: ${locationData.region} (${locationData.latitude}, ${locationData.longitude}) at ${locationData.depth}m depth
        
        Environmental Conditions:
        - Temperature: ${environmentalData.temperature}°C
        - Salinity: ${environmentalData.salinity} PSU
        - pH: ${environmentalData.pH}
        - Pollutant levels: ${JSON.stringify(environmentalData.pollutants)}
        
        ${humanActivityData ? `Human Activity Context: ${humanActivityData}` : ""}
        
        Please provide:
        1. Overall threat level assessment (low/moderate/high/critical)
        2. Primary environmental threats identified
        3. Human impact factors contributing to threats
        4. Species likely to be affected
        5. Timeframe for potential impacts
        6. Specific recommendations for threat mitigation
        7. Urgency rating (1-10 scale)
        
        Focus on actionable insights for marine conservation efforts.
      `

      const geminiFlashModel = getGeminiFlashModel()
      const result = await geminiFlashModel.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return this.parseThreatAssessment(text)
    } catch (error) {
      console.error("[v0] Threat assessment error:", error)
      throw new Error("Failed to assess environmental threats")
    }
  }

  /**
   * Generate conservation recommendations
   */
  static async generateConservationRecommendations(
    speciesData: string[],
    threatData: ThreatAssessmentResult,
    resourceConstraints?: string,
  ): Promise<ConservationRecommendation> {
    try {

      const prompt = `
        Generate comprehensive conservation recommendations based on:
        
        Affected Species: ${speciesData.join(", ")}
        
        Threat Assessment:
        - Threat Level: ${threatData.threatLevel}
        - Primary Threats: ${threatData.primaryThreats.join(", ")}
        - Human Impact Factors: ${threatData.humanImpactFactors.join(", ")}
        - Urgency: ${threatData.urgency}/10
        
        ${resourceConstraints ? `Resource Constraints: ${resourceConstraints}` : ""}
        
        Please provide:
        1. Priority level for conservation action
        2. Specific actionable conservation measures
        3. Implementation timeline
        4. Required resources and expertise
        5. Expected conservation outcomes
        6. Long-term monitoring plan
        7. Key stakeholders to involve
        
        Focus on practical, science-based conservation strategies that can be implemented effectively.
      `

      const geminiFlashModel = getGeminiFlashModel()
      const result = await geminiFlashModel.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return this.parseConservationRecommendations(text)
    } catch (error) {
      console.error("[v0] Conservation recommendations error:", error)
      throw new Error("Failed to generate conservation recommendations")
    }
  }

  /**
   * Analyze water quality and contamination levels
   */
  static async analyzeWaterQuality(
    waterQualityData: {
      temperature: number
      salinity: number
      pH: number
      dissolvedOxygen: number
      turbidity: number
      pollutants: {
        microplastics: number
        heavyMetals: any
        chemicals: any
      }
    },
    location: {
      latitude: number
      longitude: number
      depth: number
      region: string
    },
  ): Promise<WaterQualityAnalysis> {
    try {

      const prompt = `
        Analyze water quality data for deep-sea marine environment:
        
        Location: ${location.region} (${location.latitude}, ${location.longitude}) at ${location.depth}m depth
        
        Water Quality Parameters:
        - Temperature: ${waterQualityData.temperature}°C
        - Salinity: ${waterQualityData.salinity} PSU
        - pH: ${waterQualityData.pH}
        - Dissolved Oxygen: ${waterQualityData.dissolvedOxygen} mg/L
        - Turbidity: ${waterQualityData.turbidity} NTU
        - Microplastics: ${waterQualityData.pollutants.microplastics} particles/m³
        - Heavy Metals: ${JSON.stringify(waterQualityData.pollutants.heavyMetals)}
        - Chemical Pollutants: ${JSON.stringify(waterQualityData.pollutants.chemicals)}
        
        Please provide:
        1. Overall water quality assessment (excellent/good/moderate/poor/critical)
        2. Water Quality Index (0-100 scale)
        3. Contamination level classification
        4. Primary contaminants of concern
        5. Health risks to marine life
        6. Ecosystem impact assessment
        7. Specific recommendations for improvement
        8. Monitoring priorities
        
        Consider deep-sea ecosystem standards and marine life requirements.
      `

      const geminiFlashModel = getGeminiFlashModel()
      const result = await geminiFlashModel.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return this.parseWaterQualityAnalysis(text)
    } catch (error) {
      console.error("[v0] Water quality analysis error:", error)
      throw new Error("Failed to analyze water quality")
    }
  }

  /**
   * Analyze gene sequences for species identification
   */
  static async analyzeGeneSequence(
    dnaSequence: string,
    sequenceType: "COI" | "16S" | "18S" | "ITS" | "other",
    locationContext?: string,
  ): Promise<SpeciesIdentificationResult> {
    try {

      const prompt = `
        Analyze this ${sequenceType} gene sequence for species identification:
        
        DNA Sequence: ${dnaSequence}
        Sequence Type: ${sequenceType}
        ${locationContext ? `Location Context: ${locationContext}` : ""}
        
        Please provide:
        1. Most likely species identification with confidence level
        2. Complete taxonomic classification
        3. Alternative possible matches with confidence levels
        4. Phylogenetic relationships
        5. Habitat and ecological information
        6. Conservation status
        7. Known threats and conservation concerns
        8. Novelty assessment (likelihood of new species)
        
        Focus on marine organisms, particularly deep-sea species.
        If this appears to be a novel or undescribed species, highlight this finding.
      `

      const geminiFlashModel = getGeminiFlashModel()
      const result = await geminiFlashModel.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return this.parseSpeciesIdentification(text)
    } catch (error) {
      console.error("[v0] Gene sequence analysis error:", error)
      throw new Error("Failed to analyze gene sequence")
    }
  }

  // Helper methods to parse AI responses into structured data
  private static parseSpeciesIdentification(text: string): SpeciesIdentificationResult {
    console.log("[DEBUG] Raw AI response:", text)
    const normalized = this.preprocessAiText(text)
    console.log("[DEBUG] Normalized text:", normalized)
    
    // Try to extract species name from various patterns

    const species = this.extractValue(normalized, "species") || 
                   this.extractValue(normalized, "Species") || 
                   this.extractValue(normalized, "species name") ||
                   this.extractValue(normalized, "Species Name") ||
                   this.extractValue(normalized, "identified") ||
                   this.extractValue(normalized, "identification") ||
                   this.extractValue(normalized, "organism") ||
                   this.extractValue(normalized, "marine") ||
                   "Unknown Species"
    
    const confidence = Number.parseFloat(this.extractValue(normalized, "confidence") || 
                                        this.extractValue(normalized, "Confidence") || 
                                        this.extractValue(normalized, "probability") ||
                                        this.extractValue(normalized, "certainty") ||
                                        "75")
    
    const scientificName = this.extractValue(normalized, "scientific") || 
                          this.extractValue(normalized, "Scientific") || 
                          this.extractValue(normalized, "scientific name") ||
                          this.extractValue(normalized, "Scientific Name") ||
                          this.extractValue(normalized, "binomial") ||
                          this.extractValue(normalized, "taxonomic") ||
                          species
  

    // If we still don't have a species, try to extract from the first line
    const finalSpecies = species === "Unknown Species" ? 
      normalized.split('\n')[0]?.trim().substring(0, 50) || "Unknown Marine Species" : 
      species
  
    // FIXED: Parse taxonomic classification from comma-separated values
    const classificationText = this.extractValue(normalized, "classification") || 
                              this.extractValue(normalized, "Classification") ||
                              this.extractValue(normalized, "taxonomic") ||
                              ""
    
    let classification = {
      kingdom: "",
      phylum: "",
      class: "",
      order: "",
      family: "",
      genus: ""
    }
  
    if (classificationText && classificationText.includes(',')) {
      // Split by comma and clean each part
      const parts = classificationText.split(',').map(part => part.trim())
      
      // Assign based on position (standard taxonomic order)
      if (parts.length >= 1) classification.kingdom = parts[0]
      if (parts.length >= 2) classification.phylum = parts[1]
      if (parts.length >= 3) classification.class = parts[2]
      if (parts.length >= 4) classification.order = parts[3]
      if (parts.length >= 5) classification.family = parts[4]
      if (parts.length >= 6) classification.genus = parts[5]
    } else {
      // Fallback to individual extraction if comma-separated doesn't work
      classification = {
        kingdom: this.cleanTaxon(
                   this.extractValue(normalized, "kingdom") || 
                   this.extractValue(normalized, "Kingdom") || 
                   "Animalia"
                 ),
        phylum: this.cleanTaxon(
                  this.extractValue(normalized, "phylum") || 
                  this.extractValue(normalized, "Phylum") || ""
                ),
        class: this.cleanTaxon(
                 this.extractValue(normalized, "class") || 
                 this.extractValue(normalized, "Class") || ""
               ),
        order: this.cleanTaxon(
                 this.extractValue(normalized, "order") || 
                 this.extractValue(normalized, "Order") || ""
               ),
        family: this.cleanTaxon(
                  this.extractValue(normalized, "family") || 
                  this.extractValue(normalized, "Family") || ""
                ),
        genus: this.cleanTaxon(
                 this.extractValue(normalized, "genus") || 
                 this.extractValue(normalized, "Genus") || ""
               ),
      }
    }
  
    return {
      species: finalSpecies,
      confidence: isNaN(confidence) ? 75 : confidence,
      scientificName: scientificName || finalSpecies,
      commonName: this.extractValue(normalized, "common") || 
                  this.extractValue(normalized, "Common") || 
                  this.extractValue(normalized, "common name") ||
                  this.extractValue(normalized, "Common Name") ||
                  finalSpecies,

      classification,
      habitat: this.summarizeToSentences(
                 this.extractValue(normalized, "habitat") || 
                 this.extractValue(normalized, "Habitat") || 
                 this.extractValue(normalized, "environment") ||
                 this.extractValue(normalized, "depth") ||
                 "Marine environment",
                 2
               ),
      conservationStatus: this.extractValue(normalized, "conservation") || 
                         this.extractValue(normalized, "Conservation") || 
                         this.extractValue(normalized, "status") ||
                         this.extractValue(normalized, "threatened") ||
                         "Unknown",
      threats: this.extractList(normalized, "threats") || 
               this.extractList(normalized, "Threats") || 
               this.extractList(normalized, "Known Threats to this Species") ||
               this.extractList(normalized, "Known Threats") ||
               this.extractList(normalized, "known threats") ||
               this.extractList(normalized, "risks") ||

               [],
      description: this.buildDescription(
                    normalized,
                    this.summarizeToSentences(
                      this.extractBlock(normalized, "description") || 
                      this.extractBlock(normalized, "Description") || 
                      this.extractBlock(normalized, "characteristics") ||
                      normalized.substring(0, 200),
                      2
                    )
                  ),
    }
  }

  private static parseThreatAssessment(text: string): ThreatAssessmentResult {
    const threatLevel = this.extractThreatLevel(text)
    const urgency = Number.parseInt(this.extractValue(text, "urgency") || "0")

    if (!threatLevel) {
      throw new Error("Failed to parse threat assessment from AI response")
    }

    return {
      threatLevel,
      primaryThreats: this.extractList(text, "threats") || [],
      humanImpactFactors: this.extractList(text, "human") || [],
      affectedSpecies: this.extractList(text, "species") || [],
      timeframe: this.extractValue(text, "timeframe") || "",
      recommendations: this.extractList(text, "recommendations") || [],
      urgency,
    }
  }

  private static parseConservationRecommendations(text: string): ConservationRecommendation {
    const priority = this.extractPriority(text)

    if (!priority) {
      throw new Error("Failed to parse conservation recommendations from AI response")
    }

    return {
      priority,
      actions: this.extractList(text, "actions") || [],
      timeline: this.extractValue(text, "timeline") || "",
      resources: this.extractList(text, "resources") || [],
      expectedOutcome: this.extractValue(text, "outcome") || "",
      monitoringPlan: this.extractList(text, "monitoring") || [],
      stakeholders: this.extractList(text, "stakeholders") || [],
    }
  }

  private static parseWaterQualityAnalysis(text: string): WaterQualityAnalysis {
    const overallQuality = this.extractQualityLevel(text)
    const qualityIndex = Number.parseInt(this.extractValue(text, "index") || "0")
    const contaminationLevel = this.extractContaminationLevel(text)

    if (!overallQuality || !contaminationLevel) {
      throw new Error("Failed to parse water quality analysis from AI response")
    }

    return {
      overallQuality,
      qualityIndex,
      contaminationLevel,
      primaryContaminants: this.extractList(text, "contaminants") || [],
      healthRisks: this.extractList(text, "risks") || [],
      ecosystemImpact: this.extractValue(text, "impact") || "",
      recommendations: this.extractList(text, "recommendations") || [],
      monitoringNeeds: this.extractList(text, "monitoring") || [],
    }
  }

  // Utility methods for parsing
  private static extractValue(text: string, key: string): string | undefined {
    // First try to find the key at the start of a line
    const lines = text.split('\n')
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (new RegExp(`^${key}\\s*:`, "i").test(trimmedLine)) {
        let value = trimmedLine.replace(new RegExp(`^${key}\\s*:\\s*`, "i"), "").trim()
        // Stop at the next section key like "Phylum:", "Class:", etc.
        const nextKeyRegex = /(Kingdom|Phylum|Class|Order|Family|Genus|Habitat|Status|Conservation|Threats|Known Threats|Species|Scientific|Common)\s*:/i
        const splitAt = value.search(nextKeyRegex)
        if (splitAt > -1) {
          value = value.substring(0, splitAt).trim()
        }
        if (value && value !== key.toLowerCase() && !value.includes(":")) {
          return value.replace(/\**/g, "").trim()
        }
      }
    }
    
    // Fallback to regex patterns
    const patterns = [
      new RegExp(`${key}[\\s]*[:=-]?[\\s]*([^\\n]+)`, "i"),
      new RegExp(`${key}[\\s]*\\|[\\s]*([^\\n]+)`, "i"),
    ]
    for (const regex of patterns) {
      const match = text.match(regex)
      if (match && match[1]) {
        const value = match[1].replace(/\**/g, "").trim()
        if (value && value !== key.toLowerCase() && !value.includes(":")) {
          return value
        }
      }
    }
    
    return undefined
  }

  private static summarizeToSentences(text: string, maxSentences: number): string {
    const clean = text
      .replace(/\n+/g, " ")
      .replace(/[_#*]+/g, "")
      .replace(/\s{2,}/g, " ")
      .trim()
    const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean)
    return sentences.slice(0, maxSentences).join(" ")
  }

  private static splitLongClause(line: string): string[] {
    // Split on connectors to create shorter threat phrases
    const parts = line.split(/\s*(?:and|or|as well as|, but|;|:|—|–)\s+/i).map(s => s.trim())
    return parts.length > 1 ? parts.filter(Boolean) : [line]
  }

  private static truncateWords(text: string, maxWords: number): string {
    const words = text.split(/\s+/).filter(Boolean)
    if (words.length <= maxWords) return text
    
    // For threats, try to avoid cutting off important phrases
    if (maxWords >= 20) {
      // Look for common threat phrases and try to keep them intact
      const truncated = words.slice(0, maxWords).join(" ")
      const lastWord = words[maxWords - 1]
      
      // If the last word is a short connector or article, include the next word
      if (lastWord && lastWord.length <= 3 && words[maxWords]) {
        const nextWord = words[maxWords]
        if (nextWord && nextWord.length <= 8) {
          return words.slice(0, maxWords + 1).join(" ")
        }
      }
      
      return truncated
    }
    
    return words.slice(0, maxWords).join(" ") + "…"
  }

  private static cleanTaxon(value: string): string {
    const first = value.split(/,\s*/)[0] || value
    return first
      .replace(/^[,\s]+/, "")
      .replace(/[,\s]+$/, "")
      .replace(/^[A-Za-z]+:,?\s*/g, "")
      .replace(/\s*,\s*/g, ", ")
      .trim()
  }

  private static normalizeThreatText(text: string): string {
    return text
      .replace(/\s+mitigate[s]? the risk of extinction\.?/gi, "")
      .replace(/\s+overall risk remains (?:low|moderate|high)\.?/gi, "")
      .replace(/\bto this\b/gi, "")
  }

  private static extractBlock(text: string, key: string): string | undefined {
    // Look for the key followed by content until next section or end
    const lines = text.split('\n')
    let foundKey = false
    let content: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (new RegExp(`^${key}\\s*:`, "i").test(line)) {
        foundKey = true
        // Get content after the colon
        const afterColon = line.replace(new RegExp(`^${key}\\s*:\\s*`, "i"), "").trim()
        if (afterColon) {
          content.push(afterColon)
        }
        continue
      }
      
      if (foundKey) {
        // Stop if we hit another section header (capitalized word followed by colon)
        if (line && /^[A-Z][a-zA-Z\s]*:\s*$/.test(line)) {
          break
        }
        // Stop if we hit an empty line followed by another section
        if (line === "" && i + 1 < lines.length && /^[A-Z][a-zA-Z\s]*:\s*$/.test(lines[i + 1]?.trim())) {
          break
        }
        if (line) {
          content.push(line)
        }
      }
    }
    
    if (content.length > 0) {
      return content.join(' ').replace(/\**/g, "").trim()
    }
    
    // Fallback to regex
    const regex = new RegExp(`${key}[^\n]*:?\n?([\n\r\s\S]*?)(?:\n\s*\n|$)`, "i")
    const match = text.match(regex)
    if (match && match[1]) {
      return match[1].replace(/\**/g, "").trim()
    }
    return this.extractValue(text, key)
  }

  private static extractList(text: string, key: string): string[] | undefined {
    const block = this.extractBlock(text, key)
    if (block) {
      // Split by lines first, then by commas/semicolons
      const items = this.normalizeThreatText(block)
        .split(/\n/)
        .flatMap(line => {
          // For threats, be more careful about splitting to preserve phrases
          if (/threat/i.test(key)) {
            // Split on commas but preserve phrases like "over-collection for the pet trade"
            return line.split(/,(?=\s*[a-z])/).map(item => item.trim())
          }
          return line.split(/[,;]/)
        })
        .map((item) => item.replace(/^[\s•−-]+/, "").trim())
        .map((item) => {
          if (/threat/i.test(key) && item.includes(":")) {
            return item.split(":")[0].trim()
          }
          return item
        })
        .filter((item) => item.length > 0 && !/^to this$/i.test(item))
        .filter((item) => !/(description|identification|though|min)\b/i.test(item))
        // Enhanced filtering for threats to prevent description text contamination
        .filter((item) => {
          if (/threat/i.test(key)) {
            // Filter out items that look like descriptions rather than threats
            const lowerItem = item.toLowerCase()
            return !lowerItem.includes('scale-like markings') &&
                   !lowerItem.includes('fins exhibit') &&
                   !lowerItem.includes('striking combination') &&
                   !lowerItem.includes('yellow and blue') &&
                   !lowerItem.includes('coloration') &&
                   !lowerItem.includes('vibrant') &&
                   !lowerItem.includes('body covered') &&
                   !lowerItem.includes('display') &&
                   !lowerItem.includes('appears') &&
                   !lowerItem.includes('shows') &&
                   !lowerItem.includes('features') &&
                   !lowerItem.includes('characteristics') &&
                   !lowerItem.includes('note:') &&
                   !lowerItem.includes('(note:') &&
                   !lowerItem.includes('parsing error') &&
                   !lowerItem.includes('display glitch') &&
                   !lowerItem.includes('miscategorized') &&
                   // Ensure it's actually a threat-related term
                   (lowerItem.includes('threat') || 
                    lowerItem.includes('loss') || 
                    lowerItem.includes('invasive') || 
                    lowerItem.includes('overfishing') || 
                    lowerItem.includes('trade') || 
                    lowerItem.includes('pollution') || 
                    lowerItem.includes('climate') || 
                    lowerItem.includes('habitat') || 
                    lowerItem.includes('destruction') || 
                    lowerItem.includes('degradation') ||
                    lowerItem.includes('exploitation') ||
                    lowerItem.includes('hunting') ||
                    lowerItem.includes('fishing') ||
                    lowerItem.includes('collection') ||
                    lowerItem.includes('development') ||
                    lowerItem.includes('mining') ||
                    lowerItem.includes('dredging') ||
                    lowerItem.includes('tourism') ||
                    lowerItem.includes('recreation'))
          }
          return true
        })
        .flatMap((item) => this.splitLongClause(item))
        .map((s) => this.truncateWords(s, 25)) // Increased word limit for threats
        .slice(0, 4) // Limit to 4 threats as requested
      if (items.length > 0) return items
    }
    
    // Try direct value extraction for simple lists
    const value = this.extractValue(text, key)
    if (value) {
      const items = value
        .split(/[,;]/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && !item.includes(":"))
      if (items.length > 0) return items
    }
    
    return undefined
  }

  private static preprocessAiText(text: string): string {
    let t = text
      .replace(/\r\n/g, "\n")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/\u2022/g, "•")
      .replace(/^#+\s*/gm, "")
    
    // Ensure section headers are on their own lines
    const keys = ["Kingdom","Phylum","Class","Order","Family","Genus","Habitat","Status","Conservation","Threats","Known Threats","Known Threats to this Species","Description","Species","Scientific","Common","Body Shape","Fins","Coloration"]
    for (const k of keys) {
      const re = new RegExp(`\\s+${k}\\s*:`, "g")
      t = t.replace(re, `\n${k}:`)
      // Also handle cases where the key might be in the middle of a line
      const re2 = new RegExp(`([^\\n])${k}\\s*:`, "g")
      t = t.replace(re2, `$1\n${k}:`)
    }
    
    // Clean up multiple spaces and normalize line breaks
    t = t.replace(/[ \t]{2,}/g, " ")
    t = t.replace(/\n\s*\n\s*\n/g, "\n\n") // Remove excessive blank lines
    
    return t
  }

  private static extractThreatLevel(text: string): "low" | "moderate" | "high" | "critical" {
    const lower = text.toLowerCase()
    if (lower.includes("critical")) return "critical"
    if (lower.includes("high")) return "high"
    if (lower.includes("moderate")) return "moderate"
    return "low"
  }

  private static extractPriority(text: string): "low" | "medium" | "high" | "urgent" {
    const lower = text.toLowerCase()
    if (lower.includes("urgent")) return "urgent"
    if (lower.includes("high")) return "high"
    if (lower.includes("medium")) return "medium"
    return "low"
  }

  private static extractQualityLevel(text: string): "excellent" | "good" | "moderate" | "poor" | "critical" {
    const lower = text.toLowerCase()
    if (lower.includes("excellent")) return "excellent"
    if (lower.includes("good")) return "good"
    if (lower.includes("poor")) return "poor"
    if (lower.includes("critical")) return "critical"
    return "moderate"
  }

  private static extractContaminationLevel(text: string): "low" | "moderate" | "high" | "severe" {
    const lower = text.toLowerCase()
    if (lower.includes("severe")) return "severe"
    if (lower.includes("high")) return "high"
    if (lower.includes("moderate")) return "moderate"
    return "low"
  }


  private static buildDescription(normalized: string, base: string): string {
    const cleaned = base.replace(/[_#*]+/g, "").trim()
    if (cleaned.length >= 120) return cleaned
    const parts: string[] = []
    const body = this.extractBlock(normalized, "Body Shape")
    const fins = this.extractBlock(normalized, "Fins")
    const color = this.extractBlock(normalized, "Coloration")
    if (body) parts.push(body)
    if (fins) parts.push(fins)
    if (color) parts.push(color)
    if (parts.length === 0) return cleaned
    const summary = this.summarizeToSentences(parts.join(" "), 2)
    return cleaned ? `${cleaned} ${summary}` : summary
  }
}
