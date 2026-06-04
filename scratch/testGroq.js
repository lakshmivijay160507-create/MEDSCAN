import fs from 'fs';
import path from 'path';

// Read server/.env file manually
const envPath = 'c:/Users/acer/Downloads/medscan-ai (4)/medscan-ai/server/.env';
const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');
let apiKey = '';
for (const line of lines) {
  if (line.startsWith('GROQ_API_KEY=')) {
    apiKey = line.split('GROQ_API_KEY=')[1].trim();
  }
}

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

const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: "You are a medical analysis AI. Always respond with valid JSON only. Never include markdown formatting, code blocks, or explanatory text outside the JSON.",
      },
      {
        role: "user",
        content: buildPrompt(["Fever", "Cough", "Runny nose"]),
      },
    ],
    temperature: 0.3,
    max_tokens: 1500,
    top_p: 0.9,
  }),
});

console.log('Status:', response.status);
const data = await response.json();
console.log('Choices message:', JSON.stringify(data.choices?.[0]?.message, null, 2));
