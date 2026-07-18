from pydantic import BaseModel, Field
from typing import Optional, Literal


class AdGenerationRequest(BaseModel):
    drug_name: str = Field(..., description="Brand or generic drug name", min_length=1)
    indication: str = Field(..., description="Medical condition the drug treats")
    key_benefits: list[str] = Field(..., description="Up to 5 key clinical benefits", max_length=5)
    target_audience: str = Field(default="adults", description="Target patient demographic")
    tone: Literal["hopeful", "clinical", "empowering", "informative"] = "hopeful"
    include_isi: bool = Field(default=True, description="Include Important Safety Information block")
    black_box_warning: Optional[str] = Field(default=None, description="Black box warning text if applicable")


class CommercialScriptRequest(AdGenerationRequest):
    duration_seconds: Literal[30, 60] = 30
    setting: str = Field(default="everyday life", description="Visual setting/environment for the commercial")
    protagonist_description: str = Field(default="a middle-aged adult", description="Main character description")
