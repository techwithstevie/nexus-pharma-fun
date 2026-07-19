from __future__ import annotations

import asyncio
from concurrent.futures import ThreadPoolExecutor

from app.media.image_runner import run_image_job
from app.media.video_runner import run_video_job
from app.schemas.media import ImageGenerateRequest, VideoGenerateRequest

_executor = ThreadPoolExecutor(max_workers=1)  # serial GPU-safe


async def enqueue_image(job_id: str, req: ImageGenerateRequest) -> None:
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(_executor, run_image_job, job_id, req)


async def enqueue_video(job_id: str, req: VideoGenerateRequest) -> None:
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(_executor, run_video_job, job_id, req)