import { NextRequest, NextResponse } from "next/server"
import { generateGroqResponse } from "@/lib/groq-client"

// Helper to load detections from client (we'll pass data from client)
interface ThreatData {
  totalDetections: number
  totalThreats: number
  criticalThreats: number
  highThreats: number
  mediumThreats: number
  lowThreats: number
  avgConfidence: number
  recentDetections: Array<{
    level: string
    objects: number
    confidence: number
    time: string
    classes: string[]
  }>
  threatBreakdown: {
    critical: number
    high: number
    medium: number
    low: number
  }
  classDistribution: Record<string, number>
  detectionRate: number
  threatTrend: string
  mostDetectedClass: string
  peakThreatLevel: string
  recentActivityCount: number
}

export async function POST(request: NextRequest) {
  try {
    const { type, threatData, query } = await request.json()

    if (!threatData) {
      return NextResponse.json(
        { error: "Threat data is required" },
        { status: 400 }
      )
    }

    const data: ThreatData = threatData

    let prompt = ""
    let context = ""

    switch (type) {
      case "analysis":
        prompt = `Analyze the following marine security threat data and provide a comprehensive intelligence report:

THREAT STATISTICS:
- Total Detections: ${data.totalDetections}
- Total Threats Identified: ${data.totalThreats}
- Critical Threats: ${data.criticalThreats}
- High Threats: ${data.highThreats}
- Medium Threats: ${data.mediumThreats}
- Low Threats: ${data.lowThreats}
- Average Detection Confidence: ${data.avgConfidence}%
- Detection Rate: ${data.detectionRate.toFixed(2)} detections/hour
- Threat Trend: ${data.threatTrend}
- Most Detected Class: ${data.mostDetectedClass}
- Peak Threat Level: ${data.peakThreatLevel}
- Recent Activity (24h): ${data.recentActivityCount} detections

THREAT BREAKDOWN:
- Critical: ${data.threatBreakdown.critical}
- High: ${data.threatBreakdown.high}
- Medium: ${data.threatBreakdown.medium}
- Low: ${data.threatBreakdown.low}

CLASS DISTRIBUTION:
${Object.entries(data.classDistribution).map(([cls, count]) => `- ${cls}: ${count} detections`).join('\n')}

RECENT DETECTIONS (Last 10):
${data.recentDetections.slice(0, 10).map((det, idx) => 
  `${idx + 1}. Level: ${det.level}, Objects: ${det.objects}, Confidence: ${det.confidence}%, Classes: ${det.classes.join(', ')}, Time: ${det.time}`
).join('\n')}

Provide a comprehensive analysis with:
1. **Executive Summary**: Key findings and overall threat assessment
2. **Threat Patterns**: Identify patterns, trends, and anomalies
3. **Risk Assessment**: Evaluate the severity and potential impact
4. **Critical Insights**: Most important observations
5. **Recommended Actions**: Immediate and strategic recommendations
6. **Predictive Analysis**: Potential future threats based on current patterns

Format the response in clear sections with bullet points for easy reading.`

        context = "Marine Security Threat Intelligence Analysis - Advanced AI-powered threat assessment and pattern recognition"
        break

      case "recommendations":
        prompt = `Based on the following marine security threat data, provide strategic recommendations:

THREAT OVERVIEW:
- Total Detections: ${data.totalDetections}
- Critical Threats: ${data.criticalThreats}
- High Threats: ${data.highThreats}
- Detection Rate: ${data.detectionRate.toFixed(2)} detections/hour
- Threat Trend: ${data.threatTrend}
- Most Detected Class: ${data.mostDetectedClass}
- Peak Threat Level: ${data.peakThreatLevel}

THREAT BREAKDOWN:
${JSON.stringify(data.threatBreakdown, null, 2)}

CLASS DISTRIBUTION:
${JSON.stringify(data.classDistribution, null, 2)}

Provide strategic recommendations in the following categories:
1. **Immediate Actions**: Urgent steps to take right now
2. **Resource Allocation**: How to deploy security resources effectively
3. **Preventive Measures**: Steps to prevent future threats
4. **Response Protocols**: Recommended response procedures
5. **Strategic Planning**: Long-term security strategy
6. **Technology Recommendations**: Suggested improvements to detection systems

Format with clear sections and actionable bullet points.`

        context = "Marine Security Strategic Recommendations - AI-powered tactical and strategic guidance"
        break

      case "prediction":
        prompt = `Analyze the threat patterns and predict potential future threats:

HISTORICAL DATA:
- Total Detections: ${data.totalDetections}
- Recent Activity (24h): ${data.recentActivityCount}
- Detection Rate: ${data.detectionRate.toFixed(2)} detections/hour
- Threat Trend: ${data.threatTrend}
- Most Detected Class: ${data.mostDetectedClass}
- Peak Threat Level: ${data.peakThreatLevel}

THREAT BREAKDOWN:
- Critical: ${data.threatBreakdown.critical}
- High: ${data.threatBreakdown.high}
- Medium: ${data.threatBreakdown.medium}
- Low: ${data.threatBreakdown.low}

RECENT PATTERNS:
${data.recentDetections.slice(0, 10).map((det, idx) => 
  `${idx + 1}. ${det.level} threat with ${det.objects} objects (${det.classes.join(', ')}) at ${det.time}`
).join('\n')}

Provide predictive analysis including:
1. **Threat Forecast**: Predicted threat levels for next 24-48 hours
2. **Pattern Analysis**: Identified patterns that may indicate future threats
3. **Risk Zones**: Areas or times of increased risk
4. **Anomaly Detection**: Unusual patterns that require attention
5. **Probability Assessment**: Likelihood of different threat scenarios
6. **Early Warning Indicators**: Signs to watch for

Use data-driven insights and pattern recognition.`

        context = "Marine Security Predictive Threat Intelligence - AI-powered forecasting and pattern prediction"
        break

      case "query":
        if (!query) {
          return NextResponse.json(
            { error: "Query is required for query type" },
            { status: 400 }
          )
        }
        prompt = `Answer the following question about marine security threats based on this data:

QUESTION: ${query}

THREAT DATA:
- Total Detections: ${data.totalDetections}
- Critical Threats: ${data.criticalThreats}
- High Threats: ${data.highThreats}
- Average Confidence: ${data.avgConfidence}%
- Threat Trend: ${data.threatTrend}
- Most Detected Class: ${data.mostDetectedClass}
- Recent Activity: ${data.recentActivityCount} detections in last 24 hours

THREAT BREAKDOWN:
${JSON.stringify(data.threatBreakdown, null, 2)}

CLASS DISTRIBUTION:
${JSON.stringify(data.classDistribution, null, 2)}

Provide a detailed, accurate answer based on the data provided. If the question cannot be answered with the available data, explain what information would be needed.`

        context = "Marine Security Threat Intelligence Q&A - AI-powered threat data analysis and insights"
        break

      default:
        return NextResponse.json(
          { error: "Invalid type. Must be 'analysis', 'recommendations', 'prediction', or 'query'" },
          { status: 400 }
        )
    }

    const response = await generateGroqResponse(prompt, context)

    return NextResponse.json({
      success: true,
      response,
      type,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Threat Intelligence API error:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: `Failed to generate threat intelligence: ${errorMessage}`,
        success: false
      },
      { status: 500 }
    )
  }
}

