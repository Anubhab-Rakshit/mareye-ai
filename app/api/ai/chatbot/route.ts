import { NextRequest, NextResponse } from "next/server"
import { generateGroqResponse } from "@/lib/groq-client"

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const ctx = context || ""
    const debugFlags = {
      hasGROQ_API_KEY: Boolean(process.env.GROQ_API_KEY),
      nodeEnv: process.env.NODE_ENV || "unknown",
      groqModel: process.env.GROQ_MODEL || "",
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[chatbot] env flags:", debugFlags)
    }

    // Groq only
    if (process.env.GROQ_API_KEY) {
      const response = await generateGroqResponse(message, ctx)
      return NextResponse.json({ response, provider: "groq" })
    }

    // Offline fallback (no key configured)
    const offline = [
      "I’m running in offline mode (no AI provider is configured).",
      "",
      "To enable AI responses, set this in `.env.local`:",
      "- GROQ_API_KEY",
      "",
      "Optional:",
      "- GROQ_MODEL=llama-3.1-8b-instant",
      "",
      "Meanwhile, I can still help with platform navigation:",
      "- Use /auth/login to sign in (password or OTP)",
      "- Use /auth/register to create an account (OTP verification)",
      "- Use /profile to view your account profile",
    ].join("\n")

    return NextResponse.json({
      response: offline,
      provider: "offline",
      ...(process.env.NODE_ENV !== "production" ? { debug: debugFlags } : {}),
    })
  } catch (error) {
    console.error("Chatbot API error:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to generate response: ${errorMessage}` },
      { status: 500 }
    )
  }
}
