from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class MediaJobStatus(str, Enum):
    queued = "queued"
    running = "running"
    completed = "completed"
    failed = "failed"


class MediaKind(str, Enum):
    image = "image"
    video = "video"


class ImageGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=2000)
    negative_prompt: str = Field(
        default=(
            "blurry, low quality, watermark, logo, text overlay, "
            "deformed anatomy, celebrity likeness, real patient photo"
        ),
        max_length=1000,
    )
    width: int = Field(default=768, ge=512, le=1280)
    height: int = Field(default=768, ge=512, le=1280)
    steps: int = Field(default=28, ge=4, le=50)
    seed: int | None = None
    product_name: str | None = None
    style: str = Field(
        default="cinematic pharmaceutical commercial, clean modern, high-end",
        max_length=300,
    )


class VideoGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=2000)
    negative_prompt: str = Field(
        default="blurry, watermark, text, logo, low quality, flicker",
        max_length=1000,
    )
    # short clips only for local open models
    seconds: int = Field(default=4, ge=2, le=8)
    fps: int = Field(default=16, ge=8, le=24)
    width: int = Field(default=640, ge=480, le=832)
    height: int = Field(default=384, ge=288, le=480)
    seed: int | None = None
    # optional: animate from a previously generated image
    source_image_job_id: str | None = None
    product_name: str | None = None


class SceneAssetRequest(BaseModel):
    """Generate still + optional clip from a commercial scene."""
    drug_name: str
    scene_number: int
    visual_description: str
    voiceover: str = ""
    on_screen_text: str | None = None
    generate_video: bool = True
    style: str = "cinematic pharmaceutical commercial, clean modern lighting"


class MediaJobResponse(BaseModel):
    id: str
    kind: MediaKind
    status: MediaJobStatus
    prompt: str
    created_at: str
    updated_at: str
    progress: float = 0.0
    error: str | None = None
    result_url: str | None = None
    thumbnail_url: str | None = None
    meta: dict[str, Any] = Field(default_factory=dict)