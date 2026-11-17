from pathlib import Path
from typing import Any
from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from app.core.config import settings
from app.core.media_store import get_media_record, save_media_record, update_media_analysis
from app.core.security import compute_sha256, generate_storage_filename
from app.schemas.recycled_compression_schema import (
    CompressionAnalysisResponse,
    PerceptualHashes,
    RecycledMediaResponse,
    ReferenceMatch,
)
from app.services.member2_forensics.compression_analyzer import analyze_compression
from app.services.member2_forensics.perceptual_hasher import (
    get_reference_catalog,
    search_recycled_media,
)

router = APIRouter(prefix="/forensics", tags=["Recycled Media & Compression Forensics"])


@router.post("/recycled/{media_id}", response_model=RecycledMediaResponse)
def check_recycled_media(
    media_id: str,
    max_hamming_distance: int = Query(14, ge=0, le=32, description="Max Hamming distance threshold for matching"),
) -> RecycledMediaResponse:
    """Compute perceptual hashes (pHash, dHash, aHash) and match against indexed reference media."""
    record = get_media_record(media_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Media '{media_id}' not found.")

    storage_path = Path(record["storage_path"])
    if not storage_path.exists():
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Media file missing from storage.")

    try:
        data = search_recycled_media(storage_path, max_hamming_distance=max_hamming_distance)
        data["media_id"] = media_id
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Recycled media check failed: {exc}") from exc

    update_media_analysis(media_id, "recycled_analysis", data)
    return RecycledMediaResponse(**data)


@router.get("/recycled/reference-index", response_model=list[dict[str, Any]])
def list_reference_catalog() -> list[dict[str, Any]]:
    """Retrieve catalog of indexed reference media hashes."""
    return get_reference_catalog()


@router.post("/compression/{media_id}", response_model=CompressionAnalysisResponse)
def check_compression_artifacts(media_id: str) -> CompressionAnalysisResponse:
    """Analyze JPEG quantization tables, estimated quality factor, and compression reliability impacts."""
    record = get_media_record(media_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Media '{media_id}' not found.")

    storage_path = Path(record["storage_path"])
    if not storage_path.exists():
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Media file missing from storage.")

    try:
        data = analyze_compression(storage_path)
        data["media_id"] = media_id
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Compression analysis failed: {exc}") from exc

    update_media_analysis(media_id, "compression_analysis", data)
    return CompressionAnalysisResponse(**data)


@router.post("/recycled-upload", response_model=RecycledMediaResponse, status_code=status.HTTP_201_CREATED)
async def upload_and_check_recycled(file: UploadFile = File(...)) -> RecycledMediaResponse:
    """Convenience upload and immediate perceptual hash search."""
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file filename provided.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    import uuid

    media_id = str(uuid.uuid4())
    safe_filename = generate_storage_filename(file.filename)
    target_path = settings.UPLOAD_DIR / safe_filename
    target_path.write_bytes(file_bytes)

    file_ext = Path(file.filename).suffix.lower().lstrip(".")
    save_media_record(
        media_id=media_id,
        original_filename=file.filename,
        storage_path=str(target_path),
        media_type="image",
        file_format=file_ext.upper(),
        file_size_bytes=len(file_bytes),
        sha256_hash=compute_sha256(file_bytes),
    )

    data = search_recycled_media(target_path, max_hamming_distance=14)
    data["media_id"] = media_id
    update_media_analysis(media_id, "recycled_analysis", data)
    return RecycledMediaResponse(**data)
