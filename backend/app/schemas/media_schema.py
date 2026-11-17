from datetime import datetime, timezone
from pydantic import BaseModel, Field


class MediaUploadResponse(BaseModel):
    media_id: str = Field(..., description="Unique UUID identifier for the uploaded media")
    original_filename: str = Field(..., description="Original name of the uploaded file")
    storage_path: str = Field(..., description="Internal disk storage path")
    media_type: str = Field(..., description="'image' or 'video'")
    file_format: str = Field(..., description="File extension / format (e.g., JPEG, PNG, MP4)")
    file_size_bytes: int = Field(..., description="File size in bytes")
    sha256_hash: str = Field(..., description="Cryptographic SHA-256 checksum")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Upload timestamp")


class MediaDetailsResponse(BaseModel):
    media_id: str
    original_filename: str
    media_type: str
    file_format: str
    file_size_bytes: int
    sha256_hash: str
    created_at: datetime
