from __future__ import annotations

import asyncio

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.media import store
from app.media.jobs import enqueue_image, enqueue_video
from app.media.prompts import build_scene_image_prompt, build_video_prompt
from app.schemas.media import (
    ImageGenerateRequest,
    MediaJobResponse,
    MediaKind,
    SceneAssetRequest,
    VideoGenerateRequest,
)

router = APIRouter(prefix="/media", tags=["media"])


@router.post("/images", response_model=MediaJobResponse)
async def create_image(req: ImageGenerateRequest) -> MediaJobResponse:
    job = store.create_job(MediaKind.image, req.prompt, meta={"product_name": req.product_name})
    asyncio.create_task(enqueue_image(job.id, req))
    return job


@router.post("/videos", response_model=MediaJobResponse)
async def create_video(req: VideoGenerateRequest) -> MediaJobResponse:
    job = store.create_job(MediaKind.video, req.prompt, meta={"product_name": req.product_name})
    asyncio.create_task(enqueue_video(job.id, req))
    return job


@router.post("/scenes", response_model=dict)
async def create_scene_assets(req: SceneAssetRequest) -> dict:
    """Generate a still (and optional video) for one commercial scene."""
    img_prompt = build_scene_image_prompt(
        drug_name=req.drug_name,
        scene_number=req.scene_number,
        visual_description=req.visual_description,
        style=req.style,
    )
    img_req = ImageGenerateRequest(
        prompt=img_prompt,
        product_name=req.drug_name,
        style=req.style,
    )
    image_job = store.create_job(
        MediaKind.image,
        img_prompt,
        meta={
            "drug_name": req.drug_name,
            "scene_number": req.scene_number,
            "kind": "scene_still",
        },
    )
    asyncio.create_task(enqueue_image(image_job.id, img_req))

    video_job = None
    if req.generate_video:
        vid_prompt = build_video_prompt(
            req.visual_description,
            product_name=req.drug_name,
        )
        vid_req = VideoGenerateRequest(
            prompt=vid_prompt,
            product_name=req.drug_name,
            source_image_job_id=image_job.id,
            seconds=4,
        )
        video_job = store.create_job(
            MediaKind.video,
            vid_prompt,
            meta={
                "drug_name": req.drug_name,
                "scene_number": req.scene_number,
                "source_image_job_id": image_job.id,
                "kind": "scene_clip",
            },
        )

        async def _video_after_image() -> None:
            # wait until image completes (max ~10 min)
            for _ in range(600):
                j = store.load_job(image_job.id)
                if j and j.status.value in {"completed", "failed"}:
                    break
                await asyncio.sleep(1)
            await enqueue_video(video_job.id, vid_req)

        asyncio.create_task(_video_after_image())

    return {
        "image_job": image_job,
        "video_job": video_job,
    }


@router.get("/jobs", response_model=list[MediaJobResponse])
async def list_jobs(limit: int = 50) -> list[MediaJobResponse]:
    return store.list_jobs(limit=limit)


@router.get("/jobs/{job_id}", response_model=MediaJobResponse)
async def get_job(job_id: str) -> MediaJobResponse:
    job = store.load_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/files/images/{name}")
async def get_image_file(name: str):
    path = store.IMAGES / name
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="image/png")


@router.get("/files/videos/{name}")
async def get_video_file(name: str):
    path = store.VIDEOS / name
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="video/mp4")