from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.schemas.media import MediaJobResponse, MediaJobStatus, MediaKind

ROOT = Path(__file__).resolve().parents[2] / "media"
IMAGES = ROOT / "images"
VIDEOS = ROOT / "videos"
JOBS = ROOT / "jobs"

for p in (IMAGES, VIDEOS, JOBS):
    p.mkdir(parents=True, exist_ok=True)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_job_id() -> str:
    return uuid.uuid4().hex[:12]


def job_path(job_id: str) -> Path:
    return JOBS / f"{job_id}.json"


def save_job(job: MediaJobResponse) -> MediaJobResponse:
    job.updated_at = _now()
    job_path(job.id).write_text(job.model_dump_json(indent=2), encoding="utf-8")
    return job


def load_job(job_id: str) -> MediaJobResponse | None:
    path = job_path(job_id)
    if not path.exists():
        return None
    return MediaJobResponse.model_validate_json(path.read_text(encoding="utf-8"))


def create_job(kind: MediaKind, prompt: str, meta: dict[str, Any] | None = None) -> MediaJobResponse:
    now = _now()
    job = MediaJobResponse(
        id=new_job_id(),
        kind=kind,
        status=MediaJobStatus.queued,
        prompt=prompt,
        created_at=now,
        updated_at=now,
        meta=meta or {},
    )
    return save_job(job)


def list_jobs(limit: int = 50) -> list[MediaJobResponse]:
    files = sorted(JOBS.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    out: list[MediaJobResponse] = []
    for f in files[:limit]:
        try:
            out.append(MediaJobResponse.model_validate_json(f.read_text(encoding="utf-8")))
        except Exception:
            continue
    return out


def image_file(job_id: str) -> Path:
    return IMAGES / f"{job_id}.png"


def video_file(job_id: str) -> Path:
    return VIDEOS / f"{job_id}.mp4"