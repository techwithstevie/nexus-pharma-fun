from fastapi import APIRouter
import httpx
from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """Check API and Ollama availability."""
    ollama_ok = False
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            r = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            ollama_ok = r.status_code == 200
    except Exception:
        pass
    return {
        "status": "ok",
        "ollama": "reachable" if ollama_ok else "unreachable",
        "model": settings.OLLAMA_MODEL,
    }
