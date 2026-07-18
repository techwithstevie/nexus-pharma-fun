# 💊 Pharma Ad Studio

AI-powered pharmaceutical advertisement and commercial creator built with **Expo SDK 54**, **FastAPI**, **LangChain**, and **LangGraph**, powered by local LLMs via **Ollama**.

---

## 🏗️ Architecture

```
pharma-ad-studio/
├── mobile/          # Expo SDK 54 React Native app
└── backend/         # FastAPI + LangChain + LangGraph server
```

### Stack
| Layer | Technology |
|---|---|
| Mobile | Expo SDK 54, React Native, TypeScript |
| State | Zustand |
| Navigation | Expo Router v3 |
| Backend | FastAPI, Python 3.11+ |
| AI Orchestration | LangChain, LangGraph |
| LLM Runtime | Ollama (local) |
| Validation | Pydantic v2 |
| Linting | ESLint, Ruff |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- [Ollama](https://ollama.ai) installed and running
- Expo CLI: `npm install -g expo-cli`

### 1. Pull Required Ollama Model
```bash
ollama pull llama3
```

### 2. Start the Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Start the Mobile App
```bash
cd mobile
npm install
npx expo start
```

---

## 📋 Features
- Generate regulatory-compliant pharma ad copy (FDA/DTC guidelines)
- Create full 30/60-second commercial scripts with scene breakdowns
- ISI (Important Safety Information) auto-generation
- Multi-step LangGraph agent pipeline with human-in-the-loop review
- Local-first LLM — no data leaves your machine
- Ad history and project management

---

## ⚠️ Disclaimer
This tool is for **creative and educational purposes only**. All generated pharmaceutical advertising content must be reviewed by qualified medical, legal, and regulatory professionals before any real-world use. This application does not constitute medical or legal advice.
