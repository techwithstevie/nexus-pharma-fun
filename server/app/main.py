from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from pathlib import Path

from app.api.routes import ads, health
from app.core.config import settings
from app.routers import media as media_router


load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    print(f"[Pharma Ad Studio] Starting — model: {settings.OLLAMA_MODEL}")
    yield
    print("[Pharma Ad Studio] Shutting down")


app = FastAPI(
    title="Pharma Ad Studio API",
    description="AI-powered pharmaceutical ad generator using LangGraph + Ollama",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

media_root = Path(__file__).resolve().parents[1] / "media"
media_root.mkdir(parents=True, exist_ok=True)
(media_root / "images").mkdir(exist_ok=True)
(media_root / "videos").mkdir(exist_ok=True)
(media_root / "jobs").mkdir(exist_ok=True)

app.mount(
    "/media/files",
    StaticFiles(directory=str(media_root)),
    name="media",
)

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(ads.router, prefix="/api/v1", tags=["ads"])
app.include_router(media_router.router, prefix="/api/v1")
