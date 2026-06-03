/**
 * Groq API Service — Symptom Analysis using openai/gpt-oss-120b
 *
 * Sends symptom data to the Groq API and returns structured
 * medical analysis in JSON format.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";

/**
 * Build the medical analysis prompt for the AI model.
 */
function buildPrompt(symptoms) {
  return `You are MedScan AI, an advanced medical symptom analysis assistant. A user has reported the following symptoms:

${symptoms.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Analyze these symptoms and provide a structured medical assessment. Consider:
- How the symptoms relate to each other
- Common conditions that present with this combination
- The severity and urgency level
- Practical advice for the patient

You MUST respond with ONLY valid JSON (no markdown, no backticks, no extra text) in this exact format:
{
  "possibleConditions": [
    {
      "name": "Condition name",
      "probability": "High" or "Medium" or "Low",
      "description": "Brief 1-2 sentence clinical description of this condition and how it relates to the reported symptoms",
      "urgency": "Emergency" or "See doctor soon" or "Monitor at home" or "Self-care"
    }
  ],
  "generalAdvice": "2-3 sentences of practical, actionable health advice specific to these symptoms",
  "warningSign": "One critical warning sign the patient should watch for that would require immediate medical attention",
  "disclaimer": "Brief medical disclaimer reminding this is not a substitute for professional medical advice"
}

Important rules:
- List 2-4 most likely conditions, ordered by probability
- Be medically accurate and responsible
- Match urgency levels appropriately to condition severity
- Keep descriptions concise but informative
- The response must be ONLY the JSON object, nothing else`;
}

/**
 * Call the Groq API to analyze symptoms.
 * @param {string[]} symptoms - Array of symptom strings
 * @returns {Promise<object>} Parsed analysis result
 * @throws {Error} If the API call fails or response is invalid
 */
export async function analyzeWithGroq(symptoms) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  console.log(`  → Calling Groq API (${MODEL}) with ${symptoms.length} symptoms...`);

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a medical analysis AI. Always respond with valid JSON only. Never include markdown formatting, code blocks, or explanatory text outside the JSON.",
        },
        {
          role: "user",
          content: buildPrompt(symptoms),
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`  ✗ Groq API error (${response.status}):`, errorBody);
    throw new Error(`Groq API returned ${response.status}: ${errorBody}`);
  }

  const data = await response.json();

  // Extract the text content from the response
  const rawText = data.choices?.[0]?.message?.content;

  if (!rawText) {
    console.error("  ✗ No content in Groq response:", JSON.stringify(data));
    throw new Error("Empty response from Groq API");
  }

  console.log(`  ✓ Groq API responded (${rawText.length} chars)`);

  // Clean and parse the JSON response
  // Remove any markdown code fences or extra whitespace
  const cleaned = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);

    // Validate the response structure
    if (!parsed.possibleConditions || !Array.isArray(parsed.possibleConditions)) {
      throw new Error("Invalid response structure: missing possibleConditions array");
    }

    // Ensure each condition has required fields
    parsed.possibleConditions = parsed.possibleConditions.map((cond) => ({
      name: cond.name || "Unknown Condition",
      probability: ["High", "Medium", "Low"].includes(cond.probability) ? cond.probability : "Medium",
      description: cond.description || "No description available",
      urgency: ["Emergency", "See doctor soon", "Monitor at home", "Self-care"].includes(cond.urgency)
        ? cond.urgency
        : "Monitor at home",
    }));

    parsed.generalAdvice = parsed.generalAdvice || "Please consult a healthcare professional for personalized advice.";
    parsed.warningSign = parsed.warningSign || "Seek immediate medical attention if symptoms worsen significantly.";
    parsed.disclaimer = parsed.disclaimer || "This analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.";

    return parsed;
  } catch (parseError) {
    console.error("  ✗ Failed to parse Groq response as JSON:", parseError.message);
    console.error("  Raw response:", cleaned.substring(0, 500));
    throw new Error("Failed to parse AI response as valid JSON");
  }
}
