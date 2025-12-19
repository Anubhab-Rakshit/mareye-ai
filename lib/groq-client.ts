import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

function sanitizeKey(key: string) {
  // common .env mistakes: quotes + trailing spaces
  const trimmed = key.trim()
  return trimmed.replace(/^['"]|['"]$/g, "").trim()
}

function isInvalidKeyError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  return /invalid api key|invalid_api_key|statuscode:\s*401/i.test(msg)
}

function isModelError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  return /decommissioned|model_decommissioned|model not found|invalid model/i.test(msg)
}

export async function generateGroqResponse(message: string, context: string = "") {
  const key = sanitizeKey(process.env.GROQ_API_KEY || "")
  if (!key) {
    throw new Error("Missing GROQ_API_KEY in environment variables")
  }

  // Ensure the SDK sees GROQ_API_KEY
  process.env.GROQ_API_KEY = key

  const systemPrompt = `You are an AI assistant for the MarEye Marine Security Platform. This platform focuses on:

${context}

Key features of the platform include:
- AI-powered submarine detection using advanced machine learning
- Mine identification and classification systems
- Diver tracking and monitoring
- Threat assessment and risk evaluation
- Real-time surveillance and monitoring
- Advanced AI processing for marine security
- Environmental data analysis for security operations

You should help users with:
- Understanding how to use the platform features
- Explaining marine security concepts
- Providing information about underwater defense systems
- Guiding users through detection processes
- Answering questions about threat assessment
- Explaining AI/ML techniques used in marine security

IMPORTANT: When providing lists or multiple points, use proper bullet point formatting with "-" at the beginning of each line. This will ensure proper display in the chat interface.

Keep responses helpful, informative, and focused on the platform's capabilities. Be concise but thorough.

User message: ${message}`

  // Allow override via env, but fall back to a safe list.
  // Use a cheaper/free-ish default first.
  const preferred = (process.env.GROQ_MODEL || "").trim()
  const candidates = [
    preferred,
    // cheaper / fast
    "llama-3.1-8b-instant",
    // fallbacks (may or may not be enabled on a given account)
    "llama-3.3-70b-versatile",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
  ].filter(Boolean)

  let lastError: unknown = null
  for (const modelId of candidates) {
    try {
      const result = await generateText({
        model: groq(modelId),
        prompt: systemPrompt,
        temperature: 0.7,
      })
      return result.text
    } catch (err) {
      lastError = err
      if (isInvalidKeyError(err)) {
        throw new Error("Invalid GROQ_API_KEY. Paste a valid Groq API key and restart the dev server.")
      }
      // If this model is invalid/decommissioned, try the next one.
      if (isModelError(err)) {
        continue
      }
      // For other errors, try the next model as well.
      continue
    }
  }

  const msg = lastError instanceof Error ? lastError.message : String(lastError)
  throw new Error(`Groq request failed across models. Last error: ${msg}`)
}





