# 🏥 MedScan AI – Symptom Analyzer

An AI-powered disease detection web app built with React + Vite. Select your symptoms and get instant AI-driven analysis of possible conditions, medical advice, and urgency levels.

## Features

- 10 symptom categories: General, Head & Throat, Respiratory, Digestive, Skin, Mental Health, Musculoskeletal, Heart, Lungs, Kidneys
- AI analysis powered by Claude (Anthropic)
- Possible conditions with probability bars and urgency badges
- General health advice and warning signs
- Clean, dark clinical UI

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/medscan-ai.git
cd medscan-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add your Anthropic API key

Copy `.env.example` to `.env` and add your key:
```bash
cp .env.example .env
```

Then open `.env` and replace `your_api_key_here` with your key from [console.anthropic.com](https://console.anthropic.com/).

Also update `src/App.jsx` line with the API call to include the key header:
```js
"x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
```

### 4. Run locally
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Build for production
```bash
npm run build
```

## ⚠️ Disclaimer

This app is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.

## Tech Stack

- React 18
- Vite 5
- Anthropic Claude API (claude-sonnet-4-20250514)
