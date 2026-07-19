from __future__ import annotations

import logging
import os
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw

from app.media import store
from app.media.prompts import build_video_prompt
from app.schemas.media import MediaJobStatus, VideoGenerateRequest

logger = logging.getLogger(__name__)

ENABLE_REAL_VIDEO = os.getenv("ENABLE_REAL_VIDEO", "0") == "1"
WAN_MODEL = os.getenv("WAN_MODEL", "Wan-AI/Wan2.1-T2V-1.3B")


def _ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def _make_slideshow_clip(
    out_path: Path,
    prompt: str,
    seconds: int,
    fps: int,
    width: int,
    height: int,
    source_image: Path | None,
) -> None:
    """Deterministic free fallback: Ken-Burns style frames via ffmpeg."""
    frames_dir = out_path.parent / f"{out_path.stem}_frames"
    frames_dir.mkdir(parents=True, exist_ok=True)

    if source_image and source_image.exists():
        base = Image.open(source_image).convert("RGB").resize((width, height))
    else:
        base = Image.new("RGB", (width, height), (12, 12, 16))
        draw = ImageDraw.Draw(base)
        draw.rectangle([12, 12, width - 12, height - 12], outline=(50, 50, 60), width=2)
        draw.text((24, 24), "NEXUS · DRAFT MOTION", fill=(200, 200, 210))
        # simple prompt lines
        y = 70
        for i in range(0, min(len(prompt), 180), 40):
            draw.text((24, y), prompt[i : i + 40], fill=(130, 130, 140))
            y += 22

    total = max(seconds * fps, fps * 2)
    for i in range(total):
        # slight zoom/pan
        scale = 1.0 + (i / total) * 0.08
        cw, ch = int(width * scale), int(height * scale)
        frame = base.resize((cw, ch))
        left = int((cw - width) * (i / max(total - 1, 1)))
        top = int((ch - height) * 0.3)
        frame = frame.crop((left, top, left + width, top + height))
        frame.save(frames_dir / f"f_{i:04d}.png")

    if not _ffmpeg_available():
        # last resort: save first frame as fake "video" png path handled upstream
        raise RuntimeError(
            "ffmpeg not found. Install ffmpeg for video export, or enable Wan2.1."
        )

    cmd = [
        "ffmpeg",
        "-y",
        "-framerate",
        str(fps),
        "-i",
        str(frames_dir / "f_%04d.png"),
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(out_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    # cleanup frames
    for f in frames_dir.glob("*.png"):
        f.unlink(missing_ok=True)
    frames_dir.rmdir()


def _run_wan(prompt: str, out_path: Path, req: VideoGenerateRequest) -> None:
    """
    Optional real open-source path.
    Requires separate install of Wan2.1 + GPU.
    See: https://github.com/Wan-Video/Wan2.1
    """
    # Placeholder hook — wire your local Wan CLI/Python entry here.
    # Keeping explicit so the product never silently pretends GPU video exists.
    raise NotImplementedError(
        f"Real Wan video not wired yet (model={WAN_MODEL}). "
        "Set ENABLE_REAL_VIDEO=0 to use slideshow fallback, or implement Wan runner."
    )


def run_video_job(job_id: str, req: VideoGenerateRequest) -> None:
    job = store.load_job(job_id)
    if not job:
        return
    job.status = MediaJobStatus.running
    job.progress = 0.05
    store.save_job(job)

    prompt = build_video_prompt(req.prompt, product_name=req.product_name)
    out_path = store.video_file(job_id)
    source = None
    if req.source_image_job_id:
        candidate = store.image_file(req.source_image_job_id)
        if candidate.exists():
            source = candidate

    try:
        if ENABLE_REAL_VIDEO:
            job.progress = 0.15
            store.save_job(job)
            _run_wan(prompt, out_path, req)
            model_name = WAN_MODEL
        else:
            job.progress = 0.2
            store.save_job(job)
            _make_slideshow_clip(
                out_path,
                prompt,
                seconds=req.seconds,
                fps=req.fps,
                width=req.width,
                height=req.height,
                source_image=source,
            )
            model_name = "ffmpeg-kenburns-fallback"

        job.status = MediaJobStatus.completed
        job.progress = 1.0
        job.result_url = f"/media/files/videos/{job_id}.mp4"
        job.meta.update(
            {
                "model": model_name,
                "seconds": req.seconds,
                "fps": req.fps,
                "source_image_job_id": req.source_image_job_id,
                "product_name": req.product_name,
            }
        )
        store.save_job(job)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Video job failed")
        job.status = MediaJobStatus.failed
        job.error = str(exc)
        store.save_job(job)