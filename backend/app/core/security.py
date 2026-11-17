import hashlib
import re
import uuid
from pathlib import Path


def sanitize_filename(filename: str) -> str:
    """Sanitize uploaded filename to prevent directory traversal and special character injection."""
    name = Path(filename).name
    # Strip any characters except alphanumerics, dots, underscores, dashes
    clean_name = re.sub(r"[^a-zA-Z0-9_.-]", "_", name)
    return clean_name


def generate_storage_filename(original_filename: str) -> str:
    """Generate a unique, collision-proof filename incorporating a UUID4 prefix."""
    safe_name = sanitize_filename(original_filename)
    unique_id = uuid.uuid4().hex[:12]
    return f"{unique_id}_{safe_name}"


def compute_sha256(file_bytes: bytes) -> str:
    """Compute standard SHA-256 cryptographic digest of file bytes."""
    hasher = hashlib.sha256()
    hasher.update(file_bytes)
    return hasher.hexdigest()
