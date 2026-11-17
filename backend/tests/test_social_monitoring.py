import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_monitoring_status():
    """Verify monitoring engine status and connector transparency."""
    response = client.get("/api/v1/social-monitor/status")
    assert response.status_code == 200
    data = response.json()
    assert data["engine_status"] == "Operational"
    assert "api_connectivity" in data
    assert data["api_connectivity"]["reddit"] in {"Connected", "Configured"}
    assert data["api_connectivity"]["twitter_x"] in {"Configured", "Unavailable"}


def test_manage_sources():
    """Verify listing and adding social media monitoring sources."""
    # List
    list_res = client.get("/api/v1/social-monitor/sources")
    assert list_res.status_code == 200
    sources = list_res.json()
    assert len(sources) >= 1

    # Add new source
    add_res = client.post(
        "/api/v1/social-monitor/sources",
        json={"platform_name": "Reddit", "handle_or_channel": "r/technology"},
    )
    assert add_res.status_code == 201
    new_src = add_res.json()
    assert new_src["handle_or_channel"] == "r/technology"
    assert new_src["auth_status"] in {"Connected", "Configured"}


def test_manage_keywords():
    """Verify adding and querying monitoring keywords/hashtags."""
    # Add
    kw_res = client.post(
        "/api/v1/social-monitor/keywords",
        json={"keyword": "#disinformation", "query_type": "hashtag"},
    )
    assert kw_res.status_code == 201
    kw_data = kw_res.json()
    assert kw_data["keyword"] == "#disinformation"
    assert kw_data["query_type"] == "hashtag"

    # List
    list_res = client.get("/api/v1/social-monitor/keywords")
    assert list_res.status_code == 200
    keywords = list_res.json()
    assert any(k["keyword"] == "#disinformation" for k in keywords)


def test_get_discovered_posts():
    """Verify discovered posts feed endpoint."""
    response = client.get("/api/v1/social-monitor/posts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
