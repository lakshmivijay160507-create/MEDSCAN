import { Router } from "express";
import { analyzeWithGroq } from "../services/groqService.js";
import { analyzeWithKnowledgeBase } from "../services/medicalKnowledge.js";

const router = Router();

// All valid symptoms from the frontend
const VALID_SYMPTOMS = new Set([
  // General
  "Fever", "Fatigue", "Chills", "Night sweats", "Weight loss", "Loss of appetite", "Weakness",
  // Head & Throat
  "Headache", "Sore throat", "Runny nose", "Nasal congestion", "Sneezing", "Dizziness", "Ear pain",
  // Respiratory
  "Cough", "Shortness of breath", "Chest pain", "Wheezing", "Chest tightness",
  // Digestive
  "Nausea", "Vomiting", "Diarrhea", "Constipation", "Stomach pain", "Bloating", "Heartburn", "Loss of taste",
  // Skin
  "Rash", "Itching", "Redness", "Swelling", "Dry skin", "Blisters", "Skin discoloration",
  // Mental Health
  "Anxiety", "Depression", "Insomnia", "Mood swings", "Difficulty concentrating", "Irritability", "Panic attacks",
  // Musculoskeletal
  "Muscle aches", "Joint pain", "Back pain", "Stiffness", "Muscle cramps",
  // Heart
  "Palpitations", "Irregular heartbeat", "Rapid heartbeat", "Slow heartbeat", "Chest pressure",
  "Pain radiating to arm", "Pain radiating to jaw", "Shortness of breath on exertion",
  "Leg swelling", "Ankle swelling", "Lightheadedness", "Fainting", "Excessive sweating",
  // Lungs
  "Persistent cough", "Coughing up blood", "Crackling breath sounds", "Barrel chest",
  "Bluish lips", "Bluish fingertips", "Rapid breathing", "Shallow breathing",
  "Inability to take deep breath", "Chronic mucus production", "Frequent respiratory infections",
  "Sleep apnea", "Noisy breathing",
  // Kidneys
  "Decreased urine output", "Foamy urine", "Blood in urine", "Dark urine",
  "Frequent urination at night", "Painful urination", "Puffiness around eyes",
  "Swollen ankles", "Swollen feet", "Flank pain", "Lower back pain",
  "Persistent itching", "Metallic taste in mouth", "Ammonia breath", "Muscle cramps at night",
]);

/**
 * POST /api/analyze
 *
 * Accepts: { symptoms: string[] }
 * Returns: {
 *   possibleConditions: [...],
 *   generalAdvice: string,
 *   warningSign: string,
 *   disclaimer: string,
 *   source: "groq" | "knowledge-base"
 * }
 */
router.post("/analyze", async (req, res) => {
  try {
    const { symptoms } = req.body;

    // ── Input Validation ──
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({
        error: "Invalid request: 'symptoms' must be an array of strings.",
      });
    }

    if (symptoms.length === 0) {
      return res.status(400).json({
        error: "Please select at least one symptom.",
      });
    }

    if (symptoms.length > 20) {
      return res.status(400).json({
        error: "Too many symptoms selected. Please select up to 20.",
      });
    }

    // Validate each symptom is a string and belongs to the valid symptoms list
    const invalidSymptoms = symptoms.filter((s) => typeof s !== "string" || !VALID_SYMPTOMS.has(s));
    if (invalidSymptoms.length > 0) {
      return res.status(400).json({
        error: "Invalid symptom entries detected. Each symptom must be a valid symptom name.",
      });
    }

    console.log(`\n📋 Analyzing ${symptoms.length} symptom(s): ${symptoms.join(", ")}`);

    // ── Try Groq API first ──
    let result;
    let source = "groq";

    try {
      result = await analyzeWithGroq(symptoms);
      console.log("  ✅ Analysis completed via Groq API");
    } catch (groqError) {
      console.warn(`  ⚠️  Groq API failed: ${groqError.message}`);
      console.log("  🔄 Falling back to knowledge base engine...");

      result = analyzeWithKnowledgeBase(symptoms);
      source = "knowledge-base";
      console.log("  ✅ Analysis completed via knowledge base");
    }

    // Add source metadata
    result.source = source;

    return res.json(result);
  } catch (error) {
    console.error("  ❌ Unexpected error in /api/analyze:", error.message);
    return res.status(500).json({
      error: "An unexpected error occurred while analyzing symptoms. Please try again.",
    });
  }
});

/**
 * GET /api/symptoms
 *
 * Returns the full list of valid symptoms (useful for validation/autocomplete).
 */
router.get("/symptoms", (req, res) => {
  res.json({
    symptoms: Array.from(VALID_SYMPTOMS).sort(),
    total: VALID_SYMPTOMS.size,
  });
});

export default router;
