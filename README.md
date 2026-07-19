# 🧬 NEXUS — Content Operations

> AI-assisted **pharmaceutical content authoring** for patient-facing copy, broadcast scripts, and draft creative assets — built for **MLR-ready** internal workflows.

![Stack](https://img.shields.io/badge/client-Expo%20%2B%20TypeScript-blue)
![API](https://img.shields.io/badge/server-FastAPI%20%2B%20LangGraph-green)
![LLM](https://img.shields.io/badge/LLM-Ollama%20(local)-purple)
![Media](https://img.shields.io/badge/media-open--source%20image%2Fvideo-orange)

---

## ⚠️ Compliance first

- All outputs are **drafts only**
- **Medical, Legal & Regulatory (MLR) review required** before any external use
- This system does **not** provide medical or legal advice
- This system does **not** approve promotional claims
- Do **not** enter PHI / patient-identifiable data into prompts

---

## ✨ Features

### 📝 Content authoring
- 🧪 **Patient-facing copy** — headline, body, CTA, ISI, compliance notes
- 🎬 **Broadcast scripts** — multi-scene VO, visuals, on-screen text, ISI voiceover
- 🧭 **Guided wizard** — Product → Audience → Message → Safety → Generate
- 📚 **Content library** — save drafts with MLR status workflow  
  `Needs MLR → In review → Approved`

### 🎨 Creative assets (open source)
- 🖼️ **Image generation** — Diffusers / SDXL-Turbo (or safe placeholders)
- 🎥 **Short motion clips** — ffmpeg Ken-Burns fallback; optional Wan-class models later
- 🧩 **Scene-linked assets** — generate still / still+clip from each script scene
- 📁 **Asset studio tab** — freeform prompts + job library

### 🏢 Enterprise UX
- 🌑 Near-black **ops console** design system
- 🏷️ Status badges, steppers, form fields, disclaimer banners
- 📱 Expo Go on device (LAN or ngrok)

---

## 🏗️ Architecture

```text
📱 Expo client (TypeScript)
        │  REST
        ▼
⚙️ FastAPI  (/api/v1)
   ├── 🧠 LangGraph agents  →  🦙 Ollama (copy & scripts)
   └── 🎞️ Media jobs
          ├── images  → Diffusers or placeholder PNG
          └── video   → ffmpeg motion or open T2V model
```

### 📂 Repository layout

```text
nexus-pharma/
├── 📱 client/                  # Expo + expo-router
│   ├── app/
│   │   ├── (tabs)/             # Workspace, Create, Library, Assets, System
│   │   └── result.tsx          # Review + per-scene asset actions
│   ├── components/ui/          # Button, Card, FormField, StatusBadge, …
│   ├── constants/theme.ts      # Design tokens
│   ├── lib/api.ts              # API client + media helpers
│   └── store/                  # Zustand + persistence
│
└── 🖥️ server/                  # FastAPI backend
    ├── app/
    │   ├── agents/             # LangGraph graphs, prompts, LLM
    │   ├── api/routes/         # ads, health, …
    │   ├── core/config.py      # pydantic-settings
    │   ├── media/              # image_runner, video_runner, jobs, store
    │   └── main.py
    └── media/                  # images/  videos/  jobs/
```

---

## 🛠️ Tech stack

| Layer | Tools |
|------|--------|
| 📱 Client | Expo, React Native, TypeScript, expo-router, Zustand |
| 🖥️ API | FastAPI, Uvicorn, Pydantic Settings |
| 🧠 Agents | LangGraph, LangChain, Ollama |
| 🖼️ Images | Pillow, optional Diffusers + Torch |
| 🎥 Video | ffmpeg (default), optional open video models |
| 🔐 Config | `.env` + `Settings` (`extra="ignore"`) |

---

## ✅ Prerequisites

- 🐍 Python **3.11+** + [uv](https://github.com/astral-sh/uv)
- 📦 Node.js + [Bun](https://bun.sh) (or npm)
- 🦙 [Ollama](https://ollama.com) with a chat model pulled
- 🎬 `ffmpeg` (for draft video export)
- 📲 Expo Go (optional physical device)
- 🎮 GPU optional (real image generation)

---

## 🚀 Quick start

### 1️⃣ Start Ollama

```bash
ollama serve
ollama pull llama3.2
```

### 2️⃣ Start the API

```bash
cd ~/nexus-pharma/server
uv sync

# create .env if needed (see Configuration)
uv run python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> 💡 **Important:** always use  
> `uv run python -m uvicorn ...`  
> so you don’t pick up a global uvicorn without project packages.

Health check:

```bash
curl -s http://127.0.0.1:8000/api/v1/health
```

Docs: http://127.0.0.1:8000/docs

### 3️⃣ Start the mobile app

```bash
cd ~/nexus-pharma/client
bun install

# Phone cannot use localhost — use LAN IP or ngrok
echo 'EXPO_PUBLIC_API_BASE_URL=http://YOUR_LAN_IP:8000/api/v1' > .env

bun start
# or
bunx expo start --clear
```

Scan the QR code with **Expo Go**.

### 4️⃣ App icons (if missing)

```bash
cd ~/nexus-pharma/client
mkdir -p assets/images
# add: icon.png, adaptive-icon.png, splash-icon.png, favicon.png
```

---

## ⚙️ Configuration

### 🖥️ `server/.env`

```env
# LLM
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2

# Media (safe defaults — no GPU required)
ENABLE_REAL_IMAGE=0
ENABLE_REAL_VIDEO=0
IMAGE_MODEL=stabilityai/sdxl-turbo
IMAGE_DEVICE=cpu
```

| Variable | Description |
|----------|-------------|
| 🦙 `OLLAMA_BASE_URL` | Ollama HTTP endpoint |
| 🧠 `OLLAMA_MODEL` | Local chat model name |
| 🖼️ `ENABLE_REAL_IMAGE` | `1` = Diffusers, `0` = placeholders |
| 🎥 `ENABLE_REAL_VIDEO` | `1` only when real T2V is wired |
| 📦 `IMAGE_MODEL` | Hugging Face / Diffusers model id |
| 💻 `IMAGE_DEVICE` | `cuda` · `mps` · `cpu` |

### 📱 `client/.env`

```env
EXPO_PUBLIC_API_BASE_URL=
```

---

## 🔌 API overview

Base path: **`/api/v1`**

| Method | Endpoint | Description |
|--------|----------|-------------|
| 💚 `GET` | `/health` | API + Ollama status |
| 📝 `POST` | `/ads/copy` | Generate patient-facing copy |
| 🎬 `POST` | `/ads/commercial` | Generate broadcast script |
| 🖼️ `POST` | `/media/images` | Queue image job |
| 🎥 `POST` | `/media/videos` | Queue video job |
| 🧩 `POST` | `/media/scenes` | Scene still (+ optional clip) |
| 📋 `GET` | `/media/jobs` | List media jobs |
| 🔍 `GET` | `/media/jobs/{id}` | Job status / result URLs |
| 📂 `GET` | `/media/files/images/{name}` | PNG file |
| 📂 `GET` | `/media/files/videos/{name}` | MP4 file |

Generated files live under `server/media/` and are served at `/media/files/...`.

---

## 📱 App map

| Screen | What it does |
|--------|----------------|
| 🏠 **Workspace** | Metrics, recent drafts, primary CTA |
| ✍️ **Create** | Multi-step regulated authoring wizard |
| 📚 **Library** | Saved projects + MLR status actions |
| 🎨 **Assets** | Freeform image/video studio |
| ⚙️ **System** | Endpoint + connectivity health |
| 📄 **Content review** | Structured draft + Still / Still+clip per scene |

---

## 🎨 Design system

- 🌑 Base background `#050505`
- ⬜ White primary buttons, quiet secondary/ghost hierarchy
- 🧵 Hairline borders + inset surfaces
- 🔴🟡🟢 Semantic status pills (Needs MLR, In review, Approved, …)
- 📛 Product framing: **NEXUS Content Operations** (not “ad toy”)

Tokens live in `client/constants/theme.ts`.

---

## 🖼️ Media modes

| Mode | Images | Video |
|------|--------|--------|
| 🧸 **Demo / no GPU** | Placeholder PNGs | ffmpeg Ken-Burns |
| ⚡ **GPU enabled** | SDXL-Turbo / FLUX-class via Diffusers | Wire open T2V when ready |

```env
# turn on real images when the machine can handle it
ENABLE_REAL_IMAGE=1
IMAGE_DEVICE=cuda
```

Install host ffmpeg for motion export:

```bash
# Debian/Ubuntu
sudo apt install ffmpeg
# macOS
brew install ffmpeg
```

---

Install ImageMagick

```bash
# Debian/Ubuntu
sudo apt install imagemagick
# macOS
brew install imagemagick
```

## 🧭 Typical workflow

1. ✍️ **Create** a copy or broadcast draft  
2. 📄 Review on **Content review** (`/result`)  
3. 🖼️ Generate **scene stills / clips** (open-source, draft-only)  
4. 💾 **Save to library** → status **Needs MLR**  
5. 🔁 Move **In review → Approved** only after human MLR  

---

## 🐛 Troubleshooting

| 💥 Symptom | ✅ Fix |
|------------|--------|
| `No module named 'langgraph'` | Use `uv run python -m uvicorn ...` · `uv add langgraph` |
| Global uvicorn path (`~/.local/...`) | Prefer `python -m uvicorn` inside project venv |
| `Extra inputs are not permitted` | Add Settings fields or `extra="ignore"` |
| `Config` + `model_config` together | Keep **only** `model_config` (Pydantic v2) |
| `exist_ok` is not defined | Use `mkdir(..., exist_ok=True)` |
| Missing `icon.png` | Add files under `client/assets/images/` |
| Phone can’t reach API | LAN IP or ngrok — not `localhost` |
| Media jobs fail | `ffmpeg` installed? try `ENABLE_REAL_IMAGE=0` |

---

## 🗺️ Roadmap

- [ ] 🔐 Auth + role-based MLR queues  
- [ ] 🗄️ Server-side project store + immutable versions  
- [ ] 🔗 Claim ↔ evidence linking  
- [ ] 🎥 Production open video model (e.g. Wan2.1)  
- [ ] 📦 Replace `expo-av` with `expo-video`  
- [ ] 📄 PDF / review-package export  
- [ ] 🧾 Structured audit log API  

---

## 📜 Disclaimer

Generated text, images, and video are **unapproved creative/scientific communication drafts**. They may be incomplete or non-compliant with FDA promotional rules and company policy. **No material may be used externally without required MLR (and any other) approvals.**

---

## 👥 Team

Built for internal **content operations** demos and regulated authoring pilots.

---

<p align="center">
  <b>NEXUS</b> · Draft with precision. Review with control.
</p>