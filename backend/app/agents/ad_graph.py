"""LangGraph pipelines for ad copy and commercial script generation."""
import json
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage

from app.agents.llm import get_llm
from app.agents.prompts import get_ad_copy_prompt, get_commercial_prompt, get_review_prompt
from app.schemas.ad_request import AdGenerationRequest, CommercialScriptRequest
from app.schemas.ad_response import AdCopyResponse, CommercialScriptResponse, Scene


# ─── Ad Copy Graph State ──────────────────────────────────────────────────────

class AdCopyState(TypedDict):
    request: dict
    draft: dict
    review: dict
    final: dict
    attempts: int


def generate_draft(state: AdCopyState) -> AdCopyState:
    llm = get_llm(temperature=0.7)
    prompt = get_ad_copy_prompt()
    chain = prompt | llm
    req = state["request"]
    response = chain.invoke(req)
    try:
        draft = json.loads(response.content)
    except json.JSONDecodeError:
        # Attempt to extract JSON from markdown code blocks
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        draft = json.loads(content)
    return {**state, "draft": draft}


def review_draft(state: AdCopyState) -> AdCopyState:
    llm = get_llm(temperature=0.2)
    prompt = get_review_prompt()
    chain = prompt | llm
    response = chain.invoke({"content": json.dumps(state["draft"], indent=2)})
    try:
        review = json.loads(response.content)
    except json.JSONDecodeError:
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        review = json.loads(content)
    return {**state, "review": review, "attempts": state.get("attempts", 0) + 1}


def should_revise(state: AdCopyState) -> str:
    review = state.get("review", {})
    if not review.get("approved", True) and state.get("attempts", 0) < 2:
        return "revise"
    return "finalize"


def revise_draft(state: AdCopyState) -> AdCopyState:
    """Inject review feedback and regenerate."""
    req = state["request"].copy()
    issues = state["review"].get("issues", [])
    suggestions = state["review"].get("suggestions", [])
    req["key_benefits"] = req.get("key_benefits", []) + [
        f"[REVISION NEEDED] Issues: {'; '.join(issues)}. Suggestions: {'; '.join(suggestions)}"
    ]
    return generate_draft({**state, "request": req})


def finalize_ad_copy(state: AdCopyState) -> AdCopyState:
    draft = state["draft"]
    req = state["request"]
    final = {
        "drug_name": req["drug_name"],
        "headline": draft.get("headline", ""),
        "body_copy": draft.get("body_copy", ""),
        "cta": draft.get("cta", ""),
        "isi": draft.get("isi"),
        "compliance_notes": draft.get("compliance_notes", "Requires MLR review before use."),
    }
    return {**state, "final": final}


def build_ad_copy_graph() -> StateGraph:
    graph = StateGraph(AdCopyState)
    graph.add_node("generate", generate_draft)
    graph.add_node("review", review_draft)
    graph.add_node("revise", revise_draft)
    graph.add_node("finalize", finalize_ad_copy)

    graph.set_entry_point("generate")
    graph.add_edge("generate", "review")
    graph.add_conditional_edges("review", should_revise, {"revise": "revise", "finalize": "finalize"})
    graph.add_edge("revise", "review")
    graph.add_edge("finalize", END)

    return graph.compile()


async def run_ad_copy_graph(request: AdGenerationRequest) -> AdCopyResponse:
    graph = build_ad_copy_graph()
    initial_state: AdCopyState = {
        "request": {
            "drug_name": request.drug_name,
            "indication": request.indication,
            "key_benefits": ", ".join(request.key_benefits),
            "target_audience": request.target_audience,
            "tone": request.tone,
            "include_isi": str(request.include_isi),
            "black_box_warning": request.black_box_warning or "None",
        },
        "draft": {},
        "review": {},
        "final": {},
        "attempts": 0,
    }
    result = graph.invoke(initial_state)
    return AdCopyResponse(**result["final"])


# ─── Commercial Script Graph State ───────────────────────────────────────────

class CommercialState(TypedDict):
    request: dict
    draft: dict
    review: dict
    final: dict
    attempts: int


def generate_commercial_draft(state: CommercialState) -> CommercialState:
    llm = get_llm(temperature=0.8)
    prompt = get_commercial_prompt()
    chain = prompt | llm
    response = chain.invoke(state["request"])
    try:
        draft = json.loads(response.content)
    except json.JSONDecodeError:
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        draft = json.loads(content)
    return {**state, "draft": draft}


def review_commercial_draft(state: CommercialState) -> CommercialState:
    llm = get_llm(temperature=0.2)
    prompt = get_review_prompt()
    chain = prompt | llm
    response = chain.invoke({"content": json.dumps(state["draft"], indent=2)})
    try:
        review = json.loads(response.content)
    except json.JSONDecodeError:
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        review = json.loads(content)
    return {**state, "review": review, "attempts": state.get("attempts", 0) + 1}


def commercial_should_revise(state: CommercialState) -> str:
    review = state.get("review", {})
    if not review.get("approved", True) and state.get("attempts", 0) < 2:
        return "revise"
    return "finalize"


def revise_commercial(state: CommercialState) -> CommercialState:
    req = state["request"].copy()
    issues = state["review"].get("issues", [])
    suggestions = state["review"].get("suggestions", [])
    req["key_benefits"] = req.get("key_benefits", "") + f" [REVISION: {'; '.join(issues + suggestions)}]"
    return generate_commercial_draft({**state, "request": req})


def finalize_commercial(state: CommercialState) -> CommercialState:
    draft = state["draft"]
    req = state["request"]
    scenes = [
        Scene(
            scene_number=s.get("scene_number", i + 1),
            duration_seconds=s.get("duration_seconds", 5),
            visual_description=s.get("visual_description", ""),
            voiceover=s.get("voiceover", ""),
            on_screen_text=s.get("on_screen_text"),
        )
        for i, s in enumerate(draft.get("scenes", []))
    ]
    final = {
        "drug_name": req["drug_name"],
        "duration_seconds": int(req["duration_seconds"]),
        "scenes": [s.model_dump() for s in scenes],
        "isi_voiceover": draft.get("isi_voiceover", ""),
        "compliance_notes": draft.get("compliance_notes", "Requires MLR review before use."),
    }
    return {**state, "final": final}


def build_commercial_graph() -> StateGraph:
    graph = StateGraph(CommercialState)
    graph.add_node("generate", generate_commercial_draft)
    graph.add_node("review", review_commercial_draft)
    graph.add_node("revise", revise_commercial)
    graph.add_node("finalize", finalize_commercial)

    graph.set_entry_point("generate")
    graph.add_edge("generate", "review")
    graph.add_conditional_edges("review", commercial_should_revise, {"revise": "revise", "finalize": "finalize"})
    graph.add_edge("revise", "review")
    graph.add_edge("finalize", END)

    return graph.compile()


async def run_commercial_graph(request: CommercialScriptRequest) -> CommercialScriptResponse:
    graph = build_commercial_graph()
    initial_state: CommercialState = {
        "request": {
            "drug_name": request.drug_name,
            "indication": request.indication,
            "key_benefits": ", ".join(request.key_benefits),
            "target_audience": request.target_audience,
            "tone": request.tone,
            "include_isi": str(request.include_isi),
            "black_box_warning": request.black_box_warning or "None",
            "duration_seconds": str(request.duration_seconds),
            "setting": request.setting,
            "protagonist_description": request.protagonist_description,
        },
        "draft": {},
        "review": {},
        "final": {},
        "attempts": 0,
    }
    result = graph.invoke(initial_state)
    return CommercialScriptResponse(**result["final"])
