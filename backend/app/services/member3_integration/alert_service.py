"""Member 3 Service: Alert and Notification Engine.

Stores and manages forensic alerts triggered by evidence fusion.
Supports alert categorization, severity levels, acknowledgment workflows,
and linking to full verification audit reports.
"""

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from app.core.config import settings

ALERTS_FILE = settings.STORAGE_DIR / "alerts_registry.json"


def _load_alerts() -> list[dict[str, Any]]:
    if not ALERTS_FILE.exists():
        return []
    try:
        return json.loads(ALERTS_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def _save_alerts(alerts: list[dict[str, Any]]) -> None:
    settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    ALERTS_FILE.write_text(json.dumps(alerts, indent=2, default=str), encoding="utf-8")


def create_alert(
    report_id: str,
    media_id: str,
    severity: str,
    category: str,
    headline: str,
    details: str,
) -> dict[str, Any]:
    """Create a new forensic alert and persist it in the alert catalog."""
    alerts = _load_alerts()
    alert_id = str(uuid.uuid4())
    alert = {
        "id": alert_id,
        "report_id": report_id,
        "media_id": media_id,
        "severity": severity,
        "category": category,
        "headline": headline,
        "details": details,
        "acknowledged": False,
        "acknowledged_at": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    alerts.append(alert)
    _save_alerts(alerts)
    return alert


def list_alerts(severity: Optional[str] = None, acknowledged: Optional[bool] = None) -> list[dict[str, Any]]:
    """List forensic alerts with optional filtering."""
    alerts = _load_alerts()
    filtered = alerts
    if severity:
        filtered = [a for a in filtered if a.get("severity", "").lower() == severity.lower()]
    if acknowledged is not None:
        filtered = [a for a in filtered if a.get("acknowledged") == acknowledged]
    filtered.sort(key=lambda a: a.get("created_at", ""), reverse=True)
    return filtered


def acknowledge_alert(alert_id: str, notes: Optional[str] = None) -> Optional[dict[str, Any]]:
    """Mark an alert as acknowledged by human verification officer."""
    alerts = _load_alerts()
    for a in alerts:
        if a["id"] == alert_id:
            a["acknowledged"] = True
            a["acknowledged_at"] = datetime.now(timezone.utc).isoformat()
            if notes:
                a["resolution_notes"] = notes
            _save_alerts(alerts)
            return a
    return None
