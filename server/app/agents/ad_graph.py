"""LangGraph pipelines for ad copy and commercial script generation."""
from __future__ import annotations

import json
from typing import Any, cast

from langgraph.graph import END, StateGraph
from typing_extensions import TypedDict

from app.agents.llm import get_llm
from app.agents.prompts import (
    get_ad_copy_prompt,
    get_commercial_prompt,
    get_review_prompt,
)
from app.schemas.ad_request import AdGenerationRequest, CommercialScriptRequest
from app.schemas.ad_response import AdCopyResponse, CommercialScriptResponse, Scene


def _as_str(value: Any) -> str:
    if isinstance(value, list):
        return ", ".join(str(v) for v in value)
    if value is None:
        return ""
    return str(value)


def _message_to_text(response: Any) -> str:
    """Normalize LangChain message content to a plain str."""
    text_attr = getattr(response, "text", None)
    if callable(text_attr):
        try:
            value = text_attr()
            if isinstance(value, str) and value.strip():
                return value
        except Exception:
            pass
    elif isinstance(text_attr, str) and text_attr.strip():
        return text_attr

    content: Any = getattr(response, "content", response)

    if content is None:
        return ""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict):
                text_val = block.get("text")
                content_val = block.get("content")
                if isinstance(text_val, str):
                    parts.append(text_val)
                elif isinstance(content_val, str):
                    parts.append(content_val)
                else:
                    parts.append(str(block))
            else:
                parts.append(str(block))
        return "".join(parts)
    return str(content)


def _strip_code_fence(text: str) -> str:
    """If text is wrapped in fences, return the inner body."""
    cleaned: str = text.strip()
    fence = "```"
    if fence not in cleaned:
        return cleaned

    parts_open: list[str] = cleaned.split(fence, 1)
    if len(parts_open) < 2:
        return cleaned

    after_open: str = str(parts_open)

    newline_parts: list[str] = after_open.split("\n", 1)
    if len(newline_parts) == 2:
        first_line: str = str(newline_parts)
        rest: str = str(newline_parts)
        lang: str = first_line.strip().lower()
        if lang in {"", "json", "javascript", "js"}:
            after_open = rest

    parts_close: list[str] = after_open.split(fence, 1)
    if len(parts_close) >= 1:
        inner: str = str(parts_close)
    else:
        inner = after_open

    return inner.strip()


def _parse_json_object(raw: str) -> dict[str, Any]:
    """Parse model output into a dict, tolerating markdown fences."""
    text: str = raw.strip()
    if not text:
        raise ValueError("Model returned empty content")

    candidates: list[str] = [text, _strip_code_fence(text)]

    last_error: Exception | None = None
    for candidate in candidates:
        if not candidate:
            continue
        try:
            parsed: Any = json.loads(candidate)
        except json.JSONDecodeError as exc:
            last_error = exc
            continue

        if isinstance(parsed, dict):
            return cast(dict[str, Any], parsed)

        last_error = ValueError("Model JSON was not an object")

    raise ValueError(f"Failed to parse model JSON: {last_error}")


def _list_of_str(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [_as_str(v) for v in value]
    return [_as_str(value)]


# ─── Ad Copy Graph ────────────────────────────────────────────────────────────


class AdCopyState(TypedDict):
    request: dict[str, Any]
    draft: dict[str, Any]
    review: dict[str, Any]
    final: dict[str, Any]
    attempts: int


def generate_draft(state: AdCopyState) -> AdCopyState:
    llm = get_llm(temperature=0.7)
    chain = get_ad_copy_prompt() | llm
    response = chain.invoke(state["request"])
    draft = _parse_json_object(_message_to_text(response))
    return {
        "request": state["request"],
        "draft": draft,
        "review": state["review"],
        "final": state["final"],
        "attempts": state["attempts"],
    }


def review_draft(state: AdCopyState) -> AdCopyState:
    llm = get_llm(temperature=0.2)
    chain = get_review_prompt() | llm
    response = chain.invoke({"content": json.dumps(state["draft"], indent=2)})
    review = _parse_json_object(_message_to_text(response))
    return {
        "request": state["request"],
        "draft": state["draft"],
        "review": review,
        "final": state["final"],
        "attempts": state["attempts"] + 1,
    }


def should_revise(state: AdCopyState) -> str:
    review = state["review"]
    approved = bool(review.get("approved", True))
    if (not approved) and state["attempts"] < 2:
        return "revise"
    return "finalize"


def revise_draft(state: AdCopyState) -> AdCopyState:
    req = dict(state["request"])
    issues = _list_of_str(state["review"].get("issues"))
    suggestions = _list_of_str(state["review"].get("suggestions"))

    feedback = (
        f"[REVISION NEEDED] Issues: {'; '.join(issues)}. "
        f"Suggestions: {'; '.join(suggestions)}"
    )
    req["key_benefits"] = f"{_as_str(req.get('key_benefits'))}. {feedback}".strip(". ")

    return generate_draft(
        {
            "request": req,
            "draft": state["draft"],
            "review": state["review"],
            "final": state["final"],
            "attempts": state["attempts"],
        }
    )


def finalize_ad_copy(state: AdCopyState) -> AdCopyState:
    draft = state["draft"]
    req = state["request"]
    final: dict[str, Any] = {
        "drug_name": _as_str(req.get("drug_name")),
        "headline": _as_str(draft.get("headline")),
        "body_copy": _as_str(draft.get("body_copy")),
        "cta": _as_str(draft.get("cta")),
        "isi": draft.get("isi"),
        "compliance_notes": _as_str(
            draft.get("compliance_notes") or "Requires MLR review before use."
        ),
    }
    return {
        "request": state["request"],
        "draft": state["draft"],
        "review": state["review"],
        "final": final,
        "attempts": state["attempts"],
    }


def build_ad_copy_graph():
    graph: StateGraph = StateGraph(AdCopyState)
    graph.add_node("generate", generate_draft)
    graph.add_node("review", review_draft)
    graph.add_node("revise", revise_draft)
    graph.add_node("finalize", finalize_ad_copy)

    graph.set_entry_point("generate")
    graph.add_edge("generate", "review")
    graph.add_conditional_edges(
        "review",
        should_revise,
        {"revise": "revise", "finalize": "finalize"},
    )
    graph.add_edge("revise", "review")
    graph.add_edge("finalize", END)
    return graph.compile()


async def run_ad_copy_graph(request: AdGenerationRequest) -> AdCopyResponse:
    graph = build_ad_copy_graph()
    initial_state: AdCopyState = {
        "request": {
            "drug_name": request.drug_name,
            "indication": request.indication,
            "key_benefits": _as_str(request.key_benefits),
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
    result = cast(AdCopyState, graph.invoke(initial_state))
    return AdCopyResponse(**result["final"])


# ─── Commercial Script Graph ──────────────────────────────────────────────────


class CommercialState(TypedDict):
    request: dict[str, Any]
    draft: dict[str, Any]
    review: dict[str, Any]
    final: dict[str, Any]
    attempts: int


def generate_commercial_draft(state: CommercialState) -> CommercialState:
    llm = get_llm(temperature=0.8)
    chain = get_commercial_prompt() | llm
    response = chain.invoke(state["request"])
    draft = _parse_json_object(_message_to_text(response))
    return {
        "request": state["request"],
        "draft": draft,
        "review": state["review"],
        "final": state["final"],
        "attempts": state["attempts"],
    }


def review_commercial_draft(state: CommercialState) -> CommercialState:
    llm = get_llm(temperature=0.2)
    chain = get_review_prompt() | llm
    response = chain.invoke({"content": json.dumps(state["draft"], indent=2)})
    review = _parse_json_object(_message_to_text(response))
    return {
        "request": state["request"],
        "draft": state["draft"],
        "review": review,
        "final": state["final"],
        "attempts": state["attempts"] + 1,
    }


def commercial_should_revise(state: CommercialState) -> str:
    review = state["review"]
    approved = bool(review.get("approved", True))
    if (not approved) and state["attempts"] < 2:
        return "revise"
    return "finalize"


def revise_commercial(state: CommercialState) -> CommercialState:
    req = dict(state["request"])
    issues = _list_of_str(state["review"].get("issues"))
    suggestions = _list_of_str(state["review"].get("suggestions"))
    feedback = f"[REVISION: {'; '.join(issues + suggestions)}]"
    req["key_benefits"] = f"{_as_str(req.get('key_benefits'))} {feedback}".strip()

    return generate_commercial_draft(
        {
            "request": req,
            "draft": state["draft"],
            "review": state["review"],
            "final": state["final"],
            "attempts": state["attempts"],
        }
    )


def finalize_commercial(state: CommercialState) -> CommercialState:
    draft = state["draft"]
    req = state["request"]

    raw_scenes: Any = draft.get("scenes", [])
    if not isinstance(raw_scenes, list):
        raw_scenes = []

    scenes: list[Scene] = []
    for i, item in enumerate(raw_scenes):
        if not isinstance(item, dict):
            continue
        scene_dict = cast(dict[str, Any], item)
        on_screen = scene_dict.get("on_screen_text")
        scenes.append(
            Scene(
                scene_number=int(scene_dict.get("scene_number", i + 1) or i + 1),
                duration_seconds=int(scene_dict.get("duration_seconds", 5) or 5),
                visual_description=_as_str(scene_dict.get("visual_description")),
                voiceover=_as_str(scene_dict.get("voiceover")),
                on_screen_text=None if on_screen is None else _as_str(on_screen),
            )
        )

    final: dict[str, Any] = {
        "drug_name": _as_str(req.get("drug_name")),
        "duration_seconds": int(req.get("duration_seconds") or 30),
        "scenes": [s.model_dump() for s in scenes],
        "isi_voiceover": _as_str(draft.get("isi_voiceover")),
        "compliance_notes": _as_str(
            draft.get("compliance_notes") or "Requires MLR review before use."
        ),
    }
    return {
        "request": state["request"],
        "draft": state["draft"],
        "review": state["review"],
        "final": final,
        "attempts": state["attempts"],
    }


def build_commercial_graph():
    graph: StateGraph = StateGraph(CommercialState)
    graph.add_node("generate", generate_commercial_draft)
    graph.add_node("review", review_commercial_draft)
    graph.add_node("revise", revise_commercial)
    graph.add_node("finalize", finalize_commercial)

    graph.set_entry_point("generate")
    graph.add_edge("generate", "review")
    graph.add_conditional_edges(
        "review",
        commercial_should_revise,
        {"revise": "revise", "finalize": "finalize"},
    )
    graph.add_edge("revise", "review")
    graph.add_edge("finalize", END)
    return graph.compile()


async def run_commercial_graph(
    request: CommercialScriptRequest,
) -> CommercialScriptResponse:
    graph = build_commercial_graph()
    initial_state: CommercialState = {
        "request": {
            "drug_name": request.drug_name,
            "indication": request.indication,
            "key_benefits": _as_str(request.key_benefits),
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
    result = cast(CommercialState, graph.invoke(initial_state))
    return CommercialScriptResponse(**result["final"])