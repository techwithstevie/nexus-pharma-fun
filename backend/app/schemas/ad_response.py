from pydantic import BaseModel
from typing import Optional


class AdCopyResponse(BaseModel):
    drug_name: str
    headline: str
    body_copy: str
    cta: str
    isi: Optional[str] = None
    compliance_notes: str


class Scene(BaseModel):
    scene_number: int
    duration_seconds: int
    visual_description: str
    voiceover: str
    on_screen_text: Optional[str] = None


class CommercialScriptResponse(BaseModel):
    drug_name: str
    duration_seconds: int
    scenes: list[Scene]
    isi_voiceover: str
    compliance_notes: str
