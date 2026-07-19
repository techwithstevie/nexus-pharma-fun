from __future__ import annotations


PHARMA_STYLE_SUFFIX = (
    "high-end pharmaceutical commercial photography, clean modern aesthetic, "
    "soft natural light, shallow depth of field, premium lifestyle, "
    "diverse adult representation, tasteful, non-clinical unless specified, "
    "no readable drug packaging claims, no logos, no watermarks"
)

PHARMA_NEGATIVE = (
    "blurry, lowres, jpeg artifacts, watermark, logo, brand mark, "
    "readable small text, misspelled text, deformed hands, extra fingers, "
    "celebrity, politician, real identifiable patient, hospital gore, "
    "blood, needles close-up horror, sexualized, cartoon, anime"
)


def build_image_prompt(
    base: str,
    *,
    product_name: str | None = None,
    style: str | None = None,
) -> str:
    parts = [base.strip()]
    if product_name:
        parts.append(
            f"conceptual campaign visual for {product_name}, "
            "do not invent clinical claim text"
        )
    parts.append(style or PHARMA_STYLE_SUFFIX)
    return ", ".join(p for p in parts if p)


def build_scene_image_prompt(
    *,
    drug_name: str,
    scene_number: int,
    visual_description: str,
    style: str,
) -> str:
    return build_image_prompt(
        f"Scene {scene_number}: {visual_description}",
        product_name=drug_name,
        style=style or PHARMA_STYLE_SUFFIX,
    )


def build_video_prompt(base: str, *, product_name: str | None = None) -> str:
    parts = [
        base.strip(),
        "smooth cinematic camera motion, subtle movement, professional commercial",
    ]
    if product_name:
        parts.append(f"brand campaign mood for {product_name}")
    parts.append("high quality, stable frames")
    return ", ".join(parts)