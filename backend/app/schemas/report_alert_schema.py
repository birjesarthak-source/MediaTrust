from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


class AlertItem(BaseModel):
    id: str
    report_id: str
    media_id: str
    severity: str = Field(..., description="'Low', 'Medium', 'High', 'Critical'")
    category: str = Field(..., description="e.g. 'AI Generation', 'Deepfake Face Manipulation', 'Recycled Misinformation'")
    headline: str
    details: str
    acknowledged: bool = False
    acknowledged_at: Optional[str] = None
    created_at: str


class AcknowledgeAlertRequest(BaseModel):
    notes: Optional[str] = None


class VerificationReportResponse(BaseModel):
    report_id: str
    media_id: str
    filename: str
    media_type: str
    overall_assessment: str = Field(
        ...,
        description="One of: 'Likely Authentic', 'Potentially AI-Generated', 'Potentially Manipulated', 'Previously Circulated / Similar Media Found', 'Requires Further Verification'",
    )
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    key_evidence: list[str]
    uncertainty_and_limitations: str
    human_verification_recommendation: str
    module_summaries: dict[str, Any]
    generated_at: str
    alert_generated: Optional[AlertItem] = None
