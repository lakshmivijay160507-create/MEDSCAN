/**
 * Medical Knowledge Engine — Rule-based Fallback
 *
 * Provides symptom analysis when the Groq API is unavailable.
 * Uses a comprehensive knowledge base mapping symptom combinations
 * to medical conditions with scoring.
 */

// ──────────────────────────────────────────────────────────────
// Medical Knowledge Base
// Each condition has: name, matched symptoms, description, urgency
// ──────────────────────────────────────────────────────────────
const CONDITIONS = [
  // ─── General / Infectious ───
  {
    name: "Common Cold",
    symptoms: ["Fever", "Fatigue", "Runny nose", "Nasal congestion", "Sneezing", "Sore throat", "Cough", "Headache"],
    description: "A viral upper respiratory tract infection causing nasal congestion, sore throat, and mild systemic symptoms. Usually self-limiting within 7-10 days.",
    urgency: "Self-care",
  },
  {
    name: "Influenza (Flu)",
    symptoms: ["Fever", "Fatigue", "Chills", "Muscle aches", "Headache", "Cough", "Sore throat", "Weakness", "Loss of appetite", "Night sweats"],
    description: "A contagious respiratory illness caused by influenza viruses, characterized by sudden onset of high fever, body aches, and respiratory symptoms.",
    urgency: "Monitor at home",
  },
  {
    name: "COVID-19",
    symptoms: ["Fever", "Cough", "Fatigue", "Shortness of breath", "Loss of taste", "Headache", "Muscle aches", "Sore throat", "Nasal congestion", "Chills"],
    description: "Respiratory illness caused by SARS-CoV-2 virus. Symptoms range from mild to severe and may include loss of taste or smell.",
    urgency: "See doctor soon",
  },

  // ─── Respiratory ───
  {
    name: "Bronchitis",
    symptoms: ["Cough", "Chest pain", "Fatigue", "Shortness of breath", "Wheezing", "Fever", "Sore throat", "Chronic mucus production"],
    description: "Inflammation of the bronchial tubes causing persistent cough with mucus production, chest discomfort, and sometimes wheezing.",
    urgency: "See doctor soon",
  },
  {
    name: "Pneumonia",
    symptoms: ["Fever", "Cough", "Shortness of breath", "Chest pain", "Fatigue", "Chills", "Night sweats", "Wheezing", "Rapid breathing"],
    description: "An infection that inflames air sacs in one or both lungs, which may fill with fluid. Requires prompt medical attention.",
    urgency: "See doctor soon",
  },
  {
    name: "Asthma",
    symptoms: ["Wheezing", "Shortness of breath", "Chest tightness", "Cough", "Inability to take deep breath"],
    description: "A chronic condition where airways narrow and swell, producing extra mucus, making breathing difficult and triggering coughing and wheezing.",
    urgency: "See doctor soon",
  },
  {
    name: "COPD",
    symptoms: ["Persistent cough", "Shortness of breath", "Wheezing", "Chest tightness", "Chronic mucus production", "Fatigue", "Barrel chest", "Frequent respiratory infections"],
    description: "Chronic obstructive pulmonary disease is a group of progressive lung diseases causing obstructed airflow and breathing difficulty.",
    urgency: "See doctor soon",
  },
  {
    name: "Pulmonary Embolism",
    symptoms: ["Shortness of breath", "Chest pain", "Coughing up blood", "Rapid breathing", "Rapid heartbeat", "Lightheadedness", "Excessive sweating", "Leg swelling"],
    description: "A blood clot in the lungs that blocks blood flow. This is a life-threatening emergency requiring immediate medical attention.",
    urgency: "Emergency",
  },

  // ─── Digestive ───
  {
    name: "Gastroenteritis",
    symptoms: ["Nausea", "Vomiting", "Diarrhea", "Stomach pain", "Fever", "Fatigue", "Loss of appetite", "Chills"],
    description: "Inflammation of the stomach and intestines, usually from a viral or bacterial infection, causing vomiting and diarrhea.",
    urgency: "Monitor at home",
  },
  {
    name: "Gastroesophageal Reflux Disease (GERD)",
    symptoms: ["Heartburn", "Nausea", "Stomach pain", "Chest pain", "Bloating", "Sore throat", "Cough"],
    description: "A chronic condition where stomach acid frequently flows back into the esophagus, causing irritation and heartburn.",
    urgency: "See doctor soon",
  },
  {
    name: "Irritable Bowel Syndrome (IBS)",
    symptoms: ["Stomach pain", "Bloating", "Diarrhea", "Constipation", "Nausea", "Fatigue"],
    description: "A chronic gastrointestinal disorder affecting the large intestine, causing cramping, abdominal pain, and altered bowel habits.",
    urgency: "See doctor soon",
  },
  {
    name: "Food Poisoning",
    symptoms: ["Nausea", "Vomiting", "Diarrhea", "Stomach pain", "Fever", "Chills", "Weakness", "Loss of appetite"],
    description: "Illness caused by consuming contaminated food or water. Symptoms typically appear within hours of ingestion.",
    urgency: "Monitor at home",
  },

  // ─── Head & Neurological ───
  {
    name: "Migraine",
    symptoms: ["Headache", "Nausea", "Dizziness", "Fatigue", "Vomiting", "Difficulty concentrating", "Insomnia"],
    description: "A neurological condition causing intense, throbbing headaches often accompanied by nausea, light sensitivity, and visual disturbances.",
    urgency: "Monitor at home",
  },
  {
    name: "Sinusitis",
    symptoms: ["Nasal congestion", "Headache", "Sore throat", "Ear pain", "Fever", "Fatigue", "Runny nose", "Dizziness"],
    description: "Inflammation of the sinuses causing facial pain, nasal congestion, and discharge. Can be acute or chronic.",
    urgency: "See doctor soon",
  },
  {
    name: "Ear Infection (Otitis Media)",
    symptoms: ["Ear pain", "Fever", "Headache", "Dizziness", "Nasal congestion", "Sore throat"],
    description: "An infection of the middle ear causing pain, pressure, and sometimes hearing difficulties. Common after upper respiratory infections.",
    urgency: "See doctor soon",
  },

  // ─── Skin ───
  {
    name: "Allergic Dermatitis",
    symptoms: ["Rash", "Itching", "Redness", "Swelling", "Dry skin", "Blisters"],
    description: "An inflammatory skin reaction caused by contact with an allergen, resulting in an itchy, red rash that may blister.",
    urgency: "Monitor at home",
  },
  {
    name: "Eczema (Atopic Dermatitis)",
    symptoms: ["Itching", "Dry skin", "Rash", "Redness", "Skin discoloration", "Blisters"],
    description: "A chronic skin condition causing dry, itchy, inflamed patches of skin. Often associated with allergies and asthma.",
    urgency: "See doctor soon",
  },
  {
    name: "Psoriasis",
    symptoms: ["Rash", "Dry skin", "Itching", "Skin discoloration", "Redness", "Joint pain"],
    description: "A chronic autoimmune condition causing rapid skin cell buildup, resulting in thick, scaly patches on the skin.",
    urgency: "See doctor soon",
  },
  {
    name: "Cellulitis",
    symptoms: ["Redness", "Swelling", "Fever", "Rash", "Fatigue", "Chills", "Skin discoloration"],
    description: "A bacterial skin infection causing redness, swelling, and warmth in the affected area. Requires antibiotic treatment.",
    urgency: "See doctor soon",
  },

  // ─── Mental Health ───
  {
    name: "Generalized Anxiety Disorder",
    symptoms: ["Anxiety", "Insomnia", "Difficulty concentrating", "Irritability", "Fatigue", "Muscle aches", "Headache", "Panic attacks", "Palpitations"],
    description: "A mental health condition characterized by persistent, excessive worry about various aspects of daily life, often with physical symptoms.",
    urgency: "See doctor soon",
  },
  {
    name: "Major Depression",
    symptoms: ["Depression", "Fatigue", "Insomnia", "Loss of appetite", "Difficulty concentrating", "Mood swings", "Irritability", "Weakness", "Weight loss"],
    description: "A mood disorder causing persistent feelings of sadness, hopelessness, and loss of interest in activities, affecting daily functioning.",
    urgency: "See doctor soon",
  },
  {
    name: "Panic Disorder",
    symptoms: ["Panic attacks", "Anxiety", "Palpitations", "Chest tightness", "Shortness of breath", "Dizziness", "Nausea", "Excessive sweating"],
    description: "Characterized by recurrent, unexpected panic attacks — sudden episodes of intense fear with physical symptoms like racing heart and chest pain.",
    urgency: "See doctor soon",
  },

  // ─── Musculoskeletal ───
  {
    name: "Fibromyalgia",
    symptoms: ["Muscle aches", "Fatigue", "Insomnia", "Joint pain", "Headache", "Difficulty concentrating", "Stiffness", "Depression"],
    description: "A chronic condition causing widespread musculoskeletal pain, fatigue, sleep disturbances, and cognitive difficulties.",
    urgency: "See doctor soon",
  },
  {
    name: "Osteoarthritis",
    symptoms: ["Joint pain", "Stiffness", "Muscle aches", "Back pain", "Fatigue", "Swelling"],
    description: "A degenerative joint disease where cartilage breaks down, causing pain, stiffness, and reduced range of motion.",
    urgency: "See doctor soon",
  },
  {
    name: "Muscle Strain",
    symptoms: ["Muscle aches", "Back pain", "Stiffness", "Muscle cramps", "Weakness", "Swelling"],
    description: "An overstretching or tearing of muscle fibers, commonly caused by overexertion, improper lifting, or sudden movements.",
    urgency: "Self-care",
  },

  // ─── Heart / Cardiovascular ───
  {
    name: "Hypertensive Crisis",
    symptoms: ["Headache", "Chest pain", "Shortness of breath", "Dizziness", "Nausea", "Rapid heartbeat", "Chest pressure", "Anxiety"],
    description: "A severe increase in blood pressure that can lead to organ damage. Requires urgent medical attention.",
    urgency: "Emergency",
  },
  {
    name: "Angina / Coronary Artery Disease",
    symptoms: ["Chest pain", "Chest tightness", "Chest pressure", "Shortness of breath on exertion", "Pain radiating to arm", "Pain radiating to jaw", "Fatigue", "Excessive sweating", "Palpitations"],
    description: "Chest pain caused by reduced blood flow to the heart muscle. May indicate underlying coronary artery disease.",
    urgency: "Emergency",
  },
  {
    name: "Heart Failure",
    symptoms: ["Shortness of breath", "Fatigue", "Leg swelling", "Ankle swelling", "Rapid heartbeat", "Persistent cough", "Wheezing", "Weakness", "Palpitations"],
    description: "A condition where the heart cannot pump blood efficiently, causing fluid buildup in the lungs and extremities.",
    urgency: "Emergency",
  },
  {
    name: "Atrial Fibrillation",
    symptoms: ["Irregular heartbeat", "Palpitations", "Rapid heartbeat", "Shortness of breath", "Fatigue", "Dizziness", "Chest tightness", "Lightheadedness", "Fainting"],
    description: "An irregular and often rapid heart rhythm that can increase the risk of stroke and other heart complications.",
    urgency: "See doctor soon",
  },
  {
    name: "Myocardial Infarction (Heart Attack)",
    symptoms: ["Chest pain", "Chest pressure", "Pain radiating to arm", "Pain radiating to jaw", "Shortness of breath", "Excessive sweating", "Nausea", "Lightheadedness", "Fainting"],
    description: "A medical emergency where blood flow to part of the heart is blocked. Requires immediate emergency medical services.",
    urgency: "Emergency",
  },

  // ─── Kidney / Renal ───
  {
    name: "Chronic Kidney Disease",
    symptoms: ["Fatigue", "Decreased urine output", "Foamy urine", "Swollen ankles", "Swollen feet", "Puffiness around eyes", "Persistent itching", "Muscle cramps at night", "Nausea", "Loss of appetite", "Metallic taste in mouth", "Ammonia breath"],
    description: "A gradual loss of kidney function over time, leading to waste buildup in the body and fluid imbalances.",
    urgency: "See doctor soon",
  },
  {
    name: "Urinary Tract Infection (UTI)",
    symptoms: ["Painful urination", "Frequent urination at night", "Blood in urine", "Lower back pain", "Fever", "Chills", "Nausea", "Fatigue"],
    description: "A bacterial infection in any part of the urinary system, most commonly the bladder and urethra.",
    urgency: "See doctor soon",
  },
  {
    name: "Kidney Stones",
    symptoms: ["Flank pain", "Lower back pain", "Blood in urine", "Painful urination", "Nausea", "Vomiting", "Fever", "Chills"],
    description: "Hard mineral deposits that form inside the kidneys, causing severe pain as they pass through the urinary tract.",
    urgency: "See doctor soon",
  },
  {
    name: "Nephrotic Syndrome",
    symptoms: ["Foamy urine", "Swollen ankles", "Swollen feet", "Puffiness around eyes", "Fatigue", "Loss of appetite", "Weight loss"],
    description: "A kidney disorder causing excessive protein loss in urine, leading to swelling and increased risk of infections.",
    urgency: "See doctor soon",
  },
  {
    name: "Acute Kidney Injury",
    symptoms: ["Decreased urine output", "Dark urine", "Swollen ankles", "Fatigue", "Nausea", "Shortness of breath", "Confusion", "Chest pressure"],
    description: "A sudden episode of kidney failure occurring within hours or days, causing dangerous waste buildup in the blood.",
    urgency: "Emergency",
  },

  // ─── Allergies ───
  {
    name: "Seasonal Allergies (Hay Fever)",
    symptoms: ["Sneezing", "Runny nose", "Nasal congestion", "Itching", "Headache", "Fatigue", "Sore throat", "Ear pain"],
    description: "An allergic response to outdoor or indoor allergens like pollen, causing sneezing, congestion, and itchy/watery eyes.",
    urgency: "Self-care",
  },

  // ─── Thyroid ───
  {
    name: "Hypothyroidism",
    symptoms: ["Fatigue", "Weight loss", "Dry skin", "Constipation", "Depression", "Muscle aches", "Stiffness", "Weakness", "Difficulty concentrating"],
    description: "An underactive thyroid gland that doesn't produce enough hormones, slowing metabolism and causing fatigue and weight changes.",
    urgency: "See doctor soon",
  },

  // ─── Anemia ───
  {
    name: "Iron Deficiency Anemia",
    symptoms: ["Fatigue", "Weakness", "Dizziness", "Shortness of breath", "Headache", "Rapid heartbeat", "Palpitations", "Dry skin"],
    description: "A condition where the blood lacks adequate healthy red blood cells due to insufficient iron, reducing oxygen delivery to tissues.",
    urgency: "See doctor soon",
  },
];

// ──────────────────────────────────────────────────────────────
// Analysis Engine
// ──────────────────────────────────────────────────────────────

/**
 * Analyze symptoms using the built-in medical knowledge base.
 * @param {string[]} symptoms - Array of symptom strings
 * @returns {object} Structured analysis result
 */
export function analyzeWithKnowledgeBase(symptoms) {
  const normalizedSymptoms = symptoms.map((s) => s.toLowerCase().trim());

  // Score each condition based on symptom overlap
  const scored = CONDITIONS.map((condition) => {
    const conditionSymptoms = condition.symptoms.map((s) => s.toLowerCase());
    const matchCount = normalizedSymptoms.filter((s) => conditionSymptoms.includes(s)).length;
    const matchRatio = matchCount / condition.symptoms.length;
    const coverageRatio = matchCount / normalizedSymptoms.length;

    // Combined score: weighted average of match ratio and coverage
    const score = (matchRatio * 0.6) + (coverageRatio * 0.4);

    return {
      ...condition,
      matchCount,
      matchRatio,
      coverageRatio,
      score,
    };
  });

  // Filter conditions with at least 2 matching symptoms and meaningful score
  const relevant = scored
    .filter((c) => c.matchCount >= 2 && c.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  // If no relevant conditions found, return generic result
  if (relevant.length === 0) {
    return {
      possibleConditions: [
        {
          name: "Unspecified Symptoms",
          probability: "Low",
          description: "The combination of symptoms you've selected doesn't strongly match a specific condition in our database. A healthcare professional can provide a more thorough evaluation.",
          urgency: "See doctor soon",
        },
      ],
      generalAdvice: "Your symptom combination is unusual and may require professional evaluation. Keep a symptom diary noting when symptoms occur, their severity, and any triggers. Stay hydrated and get adequate rest.",
      warningSign: "Seek immediate medical attention if you experience sudden severe pain, difficulty breathing, chest pain, or loss of consciousness.",
      disclaimer: "This analysis is generated by a rule-based system and is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.",
    };
  }

  // Map scores to probability labels
  const mapProbability = (score) => {
    if (score >= 0.45) return "High";
    if (score >= 0.28) return "Medium";
    return "Low";
  };

  const possibleConditions = relevant.map((c) => ({
    name: c.name,
    probability: mapProbability(c.score),
    description: c.description,
    urgency: c.urgency,
  }));

  // Generate contextual advice based on top conditions
  const topCondition = relevant[0];
  const hasEmergency = relevant.some((c) => c.urgency === "Emergency");

  let generalAdvice;
  if (hasEmergency) {
    generalAdvice = "Some of the conditions matching your symptoms may require urgent medical attention. Please do not delay seeking care. Call emergency services or visit the nearest emergency room if you are experiencing severe symptoms.";
  } else if (topCondition.urgency === "See doctor soon") {
    generalAdvice = "Based on your symptoms, it is advisable to schedule an appointment with a healthcare provider for a proper evaluation. In the meantime, rest adequately, stay hydrated, and monitor your symptoms for any changes.";
  } else {
    generalAdvice = "Your symptoms appear manageable with self-care measures. Rest, stay well-hydrated, and maintain a balanced diet. Over-the-counter medications may help alleviate some symptoms. If symptoms persist beyond a week or worsen, consult a doctor.";
  }

  // Generate warning sign based on conditions
  const warningSignMap = {
    "Emergency": "Call emergency services (911) immediately if you experience sudden worsening of symptoms, loss of consciousness, or inability to breathe.",
    "See doctor soon": "Seek immediate medical attention if symptoms suddenly worsen, you develop high fever (above 103°F/39.4°C), or experience new severe pain.",
    "Monitor at home": "Watch for persistent worsening of symptoms over 48-72 hours, new symptoms appearing, or inability to keep fluids down.",
    "Self-care": "Consult a doctor if symptoms do not improve within 7-10 days or if you develop new, unexpected symptoms.",
  };
  const warningSign = warningSignMap[topCondition.urgency] || warningSignMap["Monitor at home"];

  return {
    possibleConditions,
    generalAdvice,
    warningSign,
    disclaimer: "This analysis is generated by a rule-based medical knowledge system and is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider.",
  };
}
