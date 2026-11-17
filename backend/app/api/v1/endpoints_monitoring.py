from typing import Any
from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.monitoring_schema import (
    AddKeywordPayload,
    AddSourcePayload,
    DiscoveredPostItem,
    KeywordItem,
    PollResultResponse,
    SocialSourceItem,
)
from app.services.member3_integration.social_monitor import (
    add_keyword,
    add_source,
    get_monitoring_status,
    list_discovered_posts,
    list_keywords,
    list_sources,
    poll_social_source,
)

router = APIRouter(prefix="/social-monitor", tags=["Social Media Monitoring"])


@router.get("/status", response_model=dict[str, Any])
def get_status() -> dict[str, Any]:
    """Retrieve operational status of social media API monitoring connectors."""
    return get_monitoring_status()


@router.get("/sources", response_model=list[SocialSourceItem])
def get_sources() -> list[SocialSourceItem]:
    """List monitored public accounts, subreddits, or channels."""
    sources = list_sources()
    return [SocialSourceItem(**s) for s in sources]


@router.post("/sources", response_model=SocialSourceItem, status_code=status.HTTP_201_CREATED)
def create_source(payload: AddSourcePayload) -> SocialSourceItem:
    """Add a new social media source for automated monitoring."""
    src = add_source(payload.platform_name, payload.handle_or_channel, payload.api_key_or_token)
    return SocialSourceItem(**src)


@router.get("/keywords", response_model=list[KeywordItem])
def get_keywords() -> list[KeywordItem]:
    """List monitored keywords and hashtags."""
    keywords = list_keywords()
    return [KeywordItem(**k) for k in keywords]


@router.post("/keywords", response_model=KeywordItem, status_code=status.HTTP_201_CREATED)
def create_keyword(payload: AddKeywordPayload) -> KeywordItem:
    """Add a new keyword or hashtag to the automated monitoring engine."""
    kw = add_keyword(payload.keyword, payload.query_type)
    return KeywordItem(**kw)


@router.post("/poll", response_model=PollResultResponse)
def poll_source(source_id: str = Query(..., description="ID of source to poll")) -> PollResultResponse:
    """Poll an authorized source (e.g. Reddit authorized JSON API), ingest new media, and trigger verification."""
    try:
        result = poll_social_source(source_id)
        return PollResultResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Polling failed: {exc}") from exc


@router.get("/posts", response_model=list[DiscoveredPostItem])
def get_posts(limit: int = Query(50, ge=1, le=100)) -> list[DiscoveredPostItem]:
    """Retrieve feed of discovered posts and their verification status."""
    posts = list_discovered_posts(limit=limit)
    return [DiscoveredPostItem(**p) for p in posts]
