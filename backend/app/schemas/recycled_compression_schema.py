from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


class PerceptualHashes(BaseModel):
    phash: str = Field(..., description="Perceptual DCT hash (64-bit hex)")
    dhash: str = Field(..., description="Difference gradient hash (64-bit hex)")
    ahash: str = Field(..., description="Average luminance hash (64-bit hex)")


class ReferenceMatch(BaseModel):
    reference_id: str
    reference_title: str
    reference_origin: str
    similarity_percentage: float
    hamming_distance: int
    match_confidence: str
    known_context: Optional[str] = None


class RecycledMediaResponse(BaseModel):
    media_id: str
    filename: str
    hashes: PerceptualHashes
    matches_found: int
    matches: list[ReferenceMatch]
    reference_database_scope: str = Field(
        default="Reference Collection Search: Evaluated against indexed internal catalog of verified reference media. This is not an exhaustive search of the entire internet.",
        description="Epistemic scope notice",
    )


class CompressionAnalysisResponse(BaseModel):
    media_id: str
    filename: str
    estimated_quality_factor: Optional[int] = Field(None, description="Estimated JPEG Quality Factor (1-100)")
    compression_severity: str = Field(..., description="'Low', 'Moderate', or 'Severe'")
    chroma_subsampling: Optional[str] = Field(None, description="e.g. 4:2:0, 4:4:4, or Standard")
    resizing_detected: bool
    re_encoding_indicators: list[str]
    ai_reliability_impact: str = Field(..., description="Explanation of how compression affects AI model confidence")
