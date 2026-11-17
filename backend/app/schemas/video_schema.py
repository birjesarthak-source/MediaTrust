from typing import Any, Optional
from pydantic import BaseModel, Field


class FaceBoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int


class FrameAnalysisResult(BaseModel):
    frame_number: int
    timestamp_seconds: float
    frame_path: str
    face_detected: bool
    bounding_box: Optional[FaceBoundingBox] = None
    deepfake_probability: Optional[float] = None
    boundary_discontinuity_score: Optional[float] = None
    is_suspicious: bool = False


class VideoAnalysisResponse(BaseModel):
    media_id: str
    filename: str
    duration_seconds: float
    total_frames: int
    sampled_frames_count: int
    fps: float
    faces_detected_count: int
    mean_deepfake_score: Optional[float] = None
    max_deepfake_score: Optional[float] = None
    suspicious_frame_count: int
    temporal_jitter_score: float = Field(..., description="Variance in facial landmark and boundary positions over time")
    video_assessment: str = Field(..., description="'Likely Authentic', 'Potentially Manipulated', or 'Inapplicable: No Human Subjects Detected'")
    sampled_frames: list[FrameAnalysisResult]
    scientific_evidence_notes: list[str]
