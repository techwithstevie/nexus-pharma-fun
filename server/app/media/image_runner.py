from __future__ import annotations

import logging
import os
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from app.media import store
from app.media.prompts import PHARMA_NEGATIVE, build_image_prompt
from app.schemas.media import ImageGenerateRequest, MediaJobStatus

logger = logging.getLogger(__name__)

# e.g. "black-forest-labs/FLUX.1-schnell" or "stabilityai/sdxl-turbo"
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "stabilityai/sdxl-turbo")
IMAGE_DEVICE = os.getenv("IMAGE_DEVICE", "cuda")  # cuda | mps | cpu
ENABLE_REAL_IMAGE = os.getenv("ENABLE_REAL_IMAGE", "1") == "1"

_pipe = None


def _get_pipe():
    global _pipe
    if _pipe is not None:
        return _pipe
    if not ENABLE_REAL_IMAGE:
        return None
    try:
        import torch
        from diffusers.pipelines.auto_pipeline import AutoPipelineForText2Image

        dtype = torch.float16 if IMAGE_DEVICE in {"cuda", "mps"} else torch.float32
        pipe = AutoPipelineForText2Image.from_pretrained(
            IMAGE_MODEL,
            torch_dtype=dtype,
            use_safetensors=True,
        )
        pipe = pipe.to(IMAGE_DEVICE)
        if hasattr(pipe, "enable_attention_slicing"):
            pipe.enable_attention_slicing()
        _pipe = pipe
        logger.info("Loaded image model %s on %s", IMAGE_MODEL, IMAGE_DEVICE)
        return _pipe
    except Exception as exc:  # noqa: BLE001
        logger.warning("Image model unavailable, using placeholder: %s", exc)
        return None


def _placeholder(prompt: str, width: int, height: int) -> Image.Image:
    img = Image.new("RGB", (width, height), (10, 10, 12))
    draw = ImageDraw.Draw(img)
    # frame
    draw.rectangle([16, 16, width - 16, height - 16], outline=(42, 42, 48), width=2)
    draw.rectangle([16, 16, width - 16, 72], fill=(18, 18, 22))
    title = "NEXUS · DRAFT VISUAL"
    draw.text((32, 34), title, fill=(180, 180, 190))
    # wrap prompt
    y = 100
    words = prompt.split()
    line = ""
    for w in words[:80]:
        test = f"{line} {w}".strip()
        if len(test) > 48:
            draw.text((32, y), line, fill=(120, 120, 130))
            y += 22
            line = w
            if y > height - 80:
                break
        else:
            line = test
    if line and y <= height - 80:
        draw.text((32, y), line, fill=(120, 120, 130))
    draw.text(
        (32, height - 48),
        "Placeholder · enable GPU image model for production renders",
        fill=(90, 90, 100),
    )
    return img


def run_image_job(job_id: str, req: ImageGenerateRequest) -> None:
    job = store.load_job(job_id)
    if not job:
        return
    job.status = MediaJobStatus.running
    job.progress = 0.05
    store.save_job(job)

    prompt = build_image_prompt(
        req.prompt,
        product_name=req.product_name,
        style=req.style,
    )
    negative = req.negative_prompt or PHARMA_NEGATIVE
    out_path = store.image_file(job_id)

    try:
        pipe = _get_pipe()
        if pipe is None:
            image = _placeholder(prompt, req.width, req.height)
        else:
            import torch

            generator = None
            if req.seed is not None:
                generator = torch.Generator(device=IMAGE_DEVICE).manual_seed(req.seed)

            # SDXL-Turbo / schnell prefer few steps
            steps = req.steps
            kwargs = {
                "prompt": prompt,
                "negative_prompt": negative,
                "num_inference_steps": steps,
                "width": req.width,
                "height": req.height,
                "generator": generator,
            }
            # turbo models often use guidance_scale 0
            if "turbo" in IMAGE_MODEL.lower() or "schnell" in IMAGE_MODEL.lower():
                kwargs["guidance_scale"] = 0.0
                kwargs["num_inference_steps"] = min(steps, 8)

            job.progress = 0.2
            store.save_job(job)
            result = pipe(**kwargs)
            image = result.images[0]

        image.save(out_path, format="PNG")
        job.status = MediaJobStatus.completed
        job.progress = 1.0
        job.result_url = f"/media/files/images/{job_id}.png"
        job.thumbnail_url = job.result_url
        job.meta.update(
            {
                "model": IMAGE_MODEL if pipe else "placeholder",
                "width": req.width,
                "height": req.height,
                "product_name": req.product_name,
            }
        )
        store.save_job(job)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Image job failed")
        job.status = MediaJobStatus.failed
        job.error = str(exc)
        store.save_job(job)