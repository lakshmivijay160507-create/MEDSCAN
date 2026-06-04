import { useState } from "react";

const SYMPTOM_CATEGORIES = {
  "General": ["Fever", "Fatigue", "Chills", "Night sweats", "Weight loss", "Loss of appetite", "Weakness"],
  "Head & Throat": ["Headache", "Sore throat", "Runny nose", "Nasal congestion", "Sneezing", "Dizziness", "Ear pain"],
  "Respiratory": ["Cough", "Shortness of breath", "Chest pain", "Wheezing", "Chest tightness"],
  "Digestive": ["Nausea", "Vomiting", "Diarrhea", "Constipation", "Stomach pain", "Bloating", "Heartburn", "Loss of taste"],
  "Skin": ["Rash", "Itching", "Redness", "Swelling", "Dry skin", "Blisters", "Skin discoloration"],
  "Mental Health": ["Anxiety", "Depression", "Insomnia", "Mood swings", "Difficulty concentrating", "Irritability", "Panic attacks"],
  "Musculoskeletal": ["Muscle aches", "Joint pain", "Back pain", "Stiffness", "Muscle cramps"],
  "Heart": ["Chest tightness", "Palpitations", "Irregular heartbeat", "Rapid heartbeat", "Slow heartbeat", "Chest pressure", "Pain radiating to arm", "Pain radiating to jaw", "Shortness of breath on exertion", "Leg swelling", "Ankle swelling", "Lightheadedness", "Fainting", "Excessive sweating"],
  "Lungs": ["Persistent cough", "Coughing up blood", "Crackling breath sounds", "Barrel chest", "Bluish lips", "Bluish fingertips", "Rapid breathing", "Shallow breathing", "Inability to take deep breath", "Chronic mucus production", "Frequent respiratory infections", "Sleep apnea", "Noisy breathing"],
  "Kidneys": ["Decreased urine output", "Foamy urine", "Blood in urine", "Dark urine", "Frequent urination at night", "Painful urination", "Puffiness around eyes", "Swollen ankles", "Swollen feet", "Flank pain", "Lower back pain", "Persistent itching", "Metallic taste in mouth", "Ammonia breath", "Muscle cramps at night"],
};

const categoryIcons = {
  "General": "🌡️",
  "Head & Throat": "🤧",
  "Respiratory": "🫁",
  "Digestive": "🫃",
  "Skin": "🩹",
  "Mental Health": "🧠",
  "Musculoskeletal": "💪",
  "Heart": "❤️",
  "Lungs": "🫧",
  "Kidneys": "🫘",
};

const categoryColors = {
  "General": "#7dd3fc",
  "Head & Throat": "#a78bfa",
  "Respiratory": "#67e8f9",
  "Digestive": "#86efac",
  "Skin": "#fcd34d",
  "Mental Health": "#c4b5fd",
  "Musculoskeletal": "#fb923c",
  "Heart": "#f87171",
  "Lungs": "#93c5fd",
  "Kidneys": "#a3e635",
};

export default function App() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [activeCategory, setActiveCategory] = useState("General");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("symptoms");

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;
    setLoading(true);
    setStep("result");

    try {
      const response = await fetch("http://localhost:3001/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms: selectedSymptoms }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${response.status})`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message || "Unable to analyze symptoms. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedSymptoms([]);
    setResult(null);
    setStep("symptoms");
    setActiveCategory("General");
  };

  const tryAgain = () => {
    setResult(null);
    setStep("symptoms");
  };

  const urgencyColor = (urgency) => {
    if (urgency === "Emergency") return "#ff4757";
    if (urgency === "See doctor soon") return "#ffa502";
    if (urgency === "Monitor at home") return "#2ed573";
    return "#1e90ff";
  };

  const probabilityWidth = (p) => {
    if (p === "High") return "85%";
    if (p === "Medium") return "55%";
    return "30%";
  };

  const probabilityColor = (p) => {
    if (p === "High") return "#ff6b6b";
    if (p === "Medium") return "#feca57";
    return "#48dbfb";
  };

  const generalCategories = ["General", "Head & Throat", "Respiratory", "Digestive", "Skin", "Mental Health", "Musculoskeletal"];
  const organCategories = ["Heart", "Lungs", "Kidneys"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 50%, #0a1628 100%)",
      fontFamily: "'Outfit', sans-serif",
      color: "#e8f4f8",
      padding: "0",
      margin: "0",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(100,180,255,0.15)",
        padding: "24px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            background: "linear-gradient(135deg, #1a6fff, #00c9ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 0 20px rgba(26,111,255,0.4)",
          }}>⚕️</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.5px", color: "#e8f4f8" }}>MedScan AI</div>
            <div style={{ fontSize: 11, color: "#7ba7bc", letterSpacing: "2px", textTransform: "uppercase" }}>Symptom Analyzer</div>
          </div>
        </div>
        {step === "result" && (
          <button onClick={reset} className="btn-secondary" style={{
            background: "rgba(100,180,255,0.1)",
            border: "1px solid rgba(100,180,255,0.3)",
            color: "#7dd3fc",
            padding: "8px 20px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
            letterSpacing: "1px",
          }}>← New Analysis</button>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

        {/* STEP 1: Symptom Selection */}
        {step === "symptoms" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h1 style={{
                fontSize: 36, fontWeight: 300, letterSpacing: "-0.5px",
                background: "linear-gradient(90deg, #a8d8f0, #ffffff, #7dd3fc)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                margin: "0 0 12px",
              }}>What symptoms are you experiencing?</h1>
              <p style={{ color: "#7ba7bc", fontSize: 15, margin: 0 }}>
                Select all that apply across categories below
              </p>
            </div>

            {/* Category Tabs */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, color: "#4a6a7a", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
                General Symptoms
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
                {generalCategories.map((cat) => {
                  const color = categoryColors[cat];
                  const active = activeCategory === cat;
                  return (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className="btn-category" style={{
                      padding: "8px 16px", borderRadius: 20,
                      border: active ? `1px solid ${color}99` : "1px solid rgba(100,180,255,0.12)",
                      background: active ? `${color}22` : "rgba(255,255,255,0.03)",
                      color: active ? color : "#7ba7bc",
                      cursor: "pointer", fontSize: 13,
                    }}>
                      {categoryIcons[cat]} {cat}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: 10, color: "#4a6a7a", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
                Organ Diseases
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                {organCategories.map((cat) => {
                  const color = categoryColors[cat];
                  const active = activeCategory === cat;
                  return (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className="btn-category" style={{
                      padding: "10px 28px", borderRadius: 20,
                      border: active ? `1px solid ${color}bb` : `1px solid ${color}33`,
                      background: active ? `${color}28` : `${color}0a`,
                      color: active ? color : `${color}88`,
                      cursor: "pointer", fontSize: 14, fontWeight: active ? 600 : 400,
                      boxShadow: active ? `0 0 16px ${color}33` : "none",
                    }}>
                      {categoryIcons[cat]} {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Symptom Grid */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${categoryColors[activeCategory]}22`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 28,
            }}>
              <div style={{ fontSize: 12, color: categoryColors[activeCategory], letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16 }}>
                {categoryIcons[activeCategory]} {activeCategory} Symptoms
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 10,
              }}>
                {SYMPTOM_CATEGORIES[activeCategory].map((symptom) => {
                  const selected = selectedSymptoms.includes(symptom);
                  const color = categoryColors[activeCategory];
                  return (
                    <button key={symptom} onClick={() => toggleSymptom(symptom)} className="btn-symptom" style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: selected ? `1px solid ${color}88` : "1px solid rgba(100,180,255,0.12)",
                      background: selected ? `${color}22` : "rgba(255,255,255,0.02)",
                      color: selected ? color : "#7ba7bc",
                      cursor: "pointer",
                      fontSize: 13,
                      textAlign: "left",
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <span style={{
                        width: 16, height: 16, borderRadius: "50%",
                        border: selected ? "none" : "1px solid rgba(100,180,255,0.3)",
                        background: selected ? color : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, flexShrink: 0, color: "#fff",
                      }}>{selected ? "✓" : ""}</span>
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected symptoms bar */}
            {selectedSymptoms.length > 0 && (
              <div style={{
                background: "rgba(26,111,255,0.08)",
                border: "1px solid rgba(26,111,255,0.2)",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 24,
              }}>
                <div style={{ fontSize: 12, color: "#7ba7bc", marginBottom: 10, letterSpacing: "1px", textTransform: "uppercase" }}>
                  Selected ({selectedSymptoms.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selectedSymptoms.map((s) => (
                    <span key={s} onClick={() => toggleSymptom(s)} className="badge-symptom" style={{
                      background: "rgba(26,111,255,0.2)",
                      border: "1px solid rgba(100,180,255,0.35)",
                      borderRadius: 20,
                      padding: "4px 12px",
                      fontSize: 12,
                      color: "#a8d8f0",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      {s} <span style={{ color: "#ff6b6b", fontSize: 10 }}>✕</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <div style={{ textAlign: "center" }}>
              <button onClick={analyzeSymptoms} disabled={selectedSymptoms.length === 0} className="btn-primary" style={{
                padding: "14px 48px",
                borderRadius: 50,
                border: "none",
                background: selectedSymptoms.length > 0
                  ? "linear-gradient(135deg, #1a6fff, #00c9ff)"
                  : "rgba(100,180,255,0.1)",
                color: selectedSymptoms.length > 0 ? "#fff" : "#4a6a7a",
                fontSize: 15,
                fontWeight: 600,
                cursor: selectedSymptoms.length > 0 ? "pointer" : "not-allowed",
                letterSpacing: "1px",
                boxShadow: selectedSymptoms.length > 0 ? "0 4px 24px rgba(26,111,255,0.4)" : "none",
              }}>
                Analyze Symptoms →
              </button>
              {selectedSymptoms.length === 0 && (
                <p style={{ color: "#4a6a7a", fontSize: 13, marginTop: 10 }}>Select at least one symptom to continue</p>
              )}
            </div>
          </>
        )}

        {/* STEP 2: Results */}
        {step === "result" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <h2 style={{
                fontSize: 28, fontWeight: 300,
                background: "linear-gradient(90deg, #a8d8f0, #ffffff)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                margin: "0 0 8px",
              }}>Analysis Results</h2>
              <p style={{ color: "#7ba7bc", fontSize: 14 }}>
                Based on {selectedSymptoms.length} symptom{selectedSymptoms.length > 1 ? "s" : ""}: {selectedSymptoms.slice(0, 4).join(", ")}{selectedSymptoms.length > 4 ? "..." : ""}
              </p>
            </div>

            {loading && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div className="animate-spin" style={{
                  width: 56, height: 56, borderRadius: "50%",
                  border: "3px solid rgba(100,180,255,0.15)",
                  borderTop: "3px solid #1a6fff",
                  margin: "0 auto 20px",
                }} />
                <p style={{ color: "#7ba7bc", fontSize: 15 }}>Analyzing your symptoms with AI...</p>
              </div>
            )}

            {result && !loading && !result.error && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Possible Conditions */}
                <div>
                  <div style={{ fontSize: 12, color: "#7ba7bc", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 14 }}>
                    Possible Conditions
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {result.possibleConditions?.map((cond, i) => (
                      <div key={i} className="condition-card card-glass" style={{
                        borderRadius: 14,
                        padding: "20px 24px",
                        borderLeft: `3px solid ${urgencyColor(cond.urgency)}`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                          <div style={{ fontSize: 17, color: "#e8f4f8", fontWeight: 600 }}>{cond.name}</div>
                          <span style={{
                            background: `${urgencyColor(cond.urgency)}22`,
                            border: `1px solid ${urgencyColor(cond.urgency)}55`,
                            color: urgencyColor(cond.urgency),
                            padding: "3px 12px", borderRadius: 20, fontSize: 12,
                          }}>{cond.urgency}</span>
                        </div>
                        <p style={{ color: "#9ab8c8", fontSize: 14, margin: "0 0 14px", lineHeight: 1.6 }}>{cond.description}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ fontSize: 11, color: "#7ba7bc", letterSpacing: "1px", textTransform: "uppercase", minWidth: 80 }}>
                            {cond.probability} match
                          </div>
                          <div style={{
                            flex: 1, height: 5, background: "rgba(255,255,255,0.06)",
                            borderRadius: 10, overflow: "hidden",
                          }}>
                            <div style={{
                              width: probabilityWidth(cond.probability),
                              height: "100%",
                              background: `linear-gradient(90deg, ${probabilityColor(cond.probability)}, ${probabilityColor(cond.probability)}99)`,
                              borderRadius: 10,
                              transition: "width 1s ease",
                            }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advice + Warning */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{
                    background: "rgba(46,213,115,0.06)",
                    border: "1px solid rgba(46,213,115,0.2)",
                    borderRadius: 14, padding: "20px 22px",
                  }}>
                    <div style={{ fontSize: 12, color: "#2ed573", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>
                      💊 General Advice
                    </div>
                    <p style={{ color: "#9ab8c8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{result.generalAdvice}</p>
                  </div>
                  <div style={{
                    background: "rgba(255,71,87,0.06)",
                    border: "1px solid rgba(255,71,87,0.2)",
                    borderRadius: 14, padding: "20px 22px",
                  }}>
                    <div style={{ fontSize: 12, color: "#ff4757", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>
                      ⚠️ Warning Sign
                    </div>
                    <p style={{ color: "#9ab8c8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{result.warningSign}</p>
                  </div>
                </div>

                {/* Disclaimer */}
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(100,180,255,0.08)",
                  borderRadius: 12, padding: "14px 20px",
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
                  <p style={{ color: "#5a7a8a", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{result.disclaimer}</p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center", paddingTop: 8 }}>
                  <button onClick={reset} className="btn-secondary" style={{
                    padding: "12px 32px", borderRadius: 50,
                    border: "1px solid rgba(100,180,255,0.3)",
                    background: "transparent",
                    color: "#7dd3fc", cursor: "pointer", fontSize: 14,
                  }}>Start Over</button>
                </div>
              </div>
            )}

            {result?.error && (
              <div style={{
                background: "rgba(255,71,87,0.08)",
                border: "1px solid rgba(255,71,87,0.25)",
                borderRadius: 14, padding: 24, textAlign: "center",
              }}>
                <p style={{ color: "#ff6b81", margin: "0 0 16px" }}>{result.error}</p>
                <button onClick={tryAgain} className="btn-text" style={{
                  padding: "10px 28px", borderRadius: 50,
                  border: "1px solid rgba(255,71,87,0.4)",
                  background: "transparent", color: "#ff6b81",
                  cursor: "pointer", fontSize: 13,
                }}>Try Again</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
