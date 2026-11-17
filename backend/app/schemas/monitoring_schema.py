from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


class SocialSourceItem(BaseModel):
    id: str
    platform_name: str
    handle_or_channel: str
    auth_status: str = Field(..., description="'Configured', 'Connected', or 'Unavailable'")
    is_active: bool = True
    last_polled_at: Optional[str] = None
    created_at: str


class AddSourcePayload(BaseModel):
    platform_name: str
    handle_or_channel: str
    api_key_or_token: Optional[str] = None


class KeywordItem(BaseModel):
    id: str
    keyword: str
    query_type: str = Field(..., description="'keyword', 'hashtag', or 'account'")
    is_active: bool = True
    created_at: str


class AddKeywordPayload(BaseModel):
    keyword: str
    query_type: str = "keyword"


class DiscoveredPostItem(BaseModel):
    id: str
    platform_name: str
    platform_post_id: str
    author: str
    content: str
    post_url: str
    media_url: Optional[str] = None
    media_id: Optional[str] = None
    verification_status: str = "Pending"
    overall_assessment: Optional[str] = None
    published_at: str
    discovered_at: str


class PollResultResponse(BaseModel):
    source: str
    posts_evaluated: int
    new_media_ingested: int
    duplicates_skipped: int
    alerts_triggered: int
    details: list[str]
