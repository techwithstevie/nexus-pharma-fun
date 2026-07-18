from fastapi import APIRouter, HTTPException
from app.schemas.ad_request import AdGenerationRequest, CommercialScriptRequest
from app.schemas.ad_response import AdCopyResponse, CommercialScriptResponse
from app.agents.ad_graph import run_ad_copy_graph, run_commercial_graph

router = APIRouter()


@router.post("/ads/copy", response_model=AdCopyResponse)
async def generate_ad_copy(request: AdGenerationRequest):
    """Generate compliant pharmaceutical ad copy."""
    try:
        result = await run_ad_copy_graph(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ads/commercial", response_model=CommercialScriptResponse)
async def generate_commercial_script(request: CommercialScriptRequest):
    """Generate a full 30 or 60-second commercial script with scenes."""
    try:
        result = await run_commercial_graph(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
