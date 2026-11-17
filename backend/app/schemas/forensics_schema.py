from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


class GPSCoordinates(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    altitude: Optional[float] = None


class ImageMetadata(BaseModel):
    format: str
    file_size_bytes: int
    dimensions: dict[str, int]
    camera_make: Optional[str] = None
    camera_model: Optional[str] = None
    lens_model: Optional[str] = None
    software: Optional[str] = None
    creation_date: Optional[str] = None
    iso: Optional[int] = None
    exposure_time: Optional[str] = None
    f_number: Optional[float] = None
    focal_length: Optional[float] = None
    gps: GPSCoordinates = Field(default_factory=GPSCoordinates)
    metadata_stripped: bool = Field(..., description="True if standard EXIF headers have been stripped")
    raw_exif_tags: dict[str, Any] = Field(default_factory=dict)


class VideoMetadata(BaseModel):
    format: str
    file_size_bytes: int
    duration_seconds: float
    dimensions: dict[str, int]
    fps: float
    total_frames: int
    codec: str
    creation_date: Optional[str] = None


class MetadataAnalysisResponse(BaseModel):
    media_id: str
    media_type: str
    filename: str
    image_metadata: Optional[ImageMetadata] = None
    video_metadata: Optional[VideoMetadata] = None
    anomalies_and_flags: list[str]
    scientific_note: str


class C2PAAssertionAction(BaseModel):
    action: str = Field(..., description="e.g., c2pa.created, c2pa.edited, c2pa.color_adjustments")
    software_agent: Optional[str] = None
    timestamp: Optional[str] = None
    parameters: Optional[dict[str, Any]] = None


class C2PARecordResponse(BaseModel):
    media_id: str
    manifest_present: bool = Field(..., description="Whether C2PA JUMBF Content Credentials exist in the file")
    validation_status: str = Field(..., description="'Valid', 'Invalid', or 'Unavailable'")
    claim_generator: Optional[str] = None
    signing_issuer: Optional[str] = None
    signing_time: Optional[str] = None
    certificate_digest: Optional[str] = None
    assertion_actions: list[C2PAAssertionAction] = Field(default_factory=list)
    c2pa_summary: str
    epistemic_disclaimer: str = Field(
        default="Important: A valid C2PA manifest confirms digital asset provenance and cryptographic signature integrity; it does not verify whether the depicted real-world event is factually true.",
        description="Forensic principle regarding provenance verification",
    )
