"""Lightweight media registry and persistence store.

Provides fast, durable media tracking so uploaded images/videos can be queried by media_id
across endpoints, with persistence in storage/media_registry.json.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from app.core.config import settings

REGISTRY_FILE = settings.STORAGE_DIR / "media_registry.json"


def _load_registry() -> dict[str, dict[str, Any]]:
    if not REGISTRY_FILE.exists():
        return {}
    try:
        data = json.loads(REGISTRY_FILE.read_text(encoding="utf-8"))
        return data
    except Exception:
        return {}


def _save_registry(registry: dict[str, dict[str, Any]]) -> None:
    settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    REGISTRY_FILE.write_text(json.dumps(registry, indent=2, default=str), encoding="utf-8")


def save_media_record(
    media_id: str,
    original_filename: str,
    storage_path: str,
    media_type: str,
    file_format: str,
    file_size_bytes: int,
    sha256_hash: str,
) -> dict[str, Any]:
    registry = _load_registry()
    record = {
        "media_id": media_id,
        "original_filename": original_filename,
        "storage_path": str(storage_path),
        "media_type": media_type,
        "file_format": file_format.upper(),
        "file_size_bytes": file_size_bytes,
        "sha256_hash": sha256_hash,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "pixel_analysis": None,
        "ai_analysis": None,
        "metadata_analysis": None,
    }
    registry[media_id] = record
    _save_registry(registry)
    return record


def get_media_record(media_id: str) -> Optional[dict[str, Any]]:
    registry = _load_registry()
    return registry.get(media_id)


def update_media_analysis(media_id: str, analysis_type: str, analysis_data: dict[str, Any]) -> None:
    registry = _load_registry()
    if media_id in registry:
        registry[media_id][analysis_type] = analysis_data
        _save_registry(registry)


def list_media_records(limit: int = 50) -> list[dict[str, Any]]:
    registry = _load_registry()
    records = list(registry.values())
    records.sort(key=lambda r: r.get("created_at", ""), reverse=True)
    return records[:limit]
