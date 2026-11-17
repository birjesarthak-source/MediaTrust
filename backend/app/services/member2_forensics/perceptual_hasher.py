"""Member 2 Service: Perceptual Hashing & Recycled Media Detection Engine.

Computes 64-bit perceptual hashes (pHash, dHash, aHash) to identify visually similar
or re-circulated media regardless of resizing, minor color adjustments, or format conversion.

Forensic Standards:
1. Implements aHash (Average), dHash (Difference), and pHash (DCT-based).
2. Computes bitwise Hamming distances between query and indexed reference media.
3. Explicit Epistemic Scope: Discloses clearly that matching queries against the
   internal reference collection does not constitute an exhaustive web search.
"""

import json
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image
from scipy.fftpack import dct

from app.core.config import settings

REFERENCE_CATALOG_FILE = settings.STORAGE_DIR / "reference_catalog.json"

# Default seed reference entries to demonstrate matching of recycled viral media
SEED_REFERENCE_CATALOG = [
    {
        "reference_id": "ref-001-historic-flood",
        "reference_title": "2018 Kerala Monsoon Flood Rescue Photograph",
        "reference_origin": "State Disaster Management Official Release (August 2018)",
        "phash": "8f3c7a1e0b5d9c2a",
        "dhash": "3c7a1e0b5d9c2a8f",
        "ahash": "ffffc38181c3ffff",
        "known_context": "Frequently recycled out-of-context during subsequent flood events in 2021 and 2023.",
    },
    {
        "reference_id": "ref-002-protest-crowd",
        "reference_title": "2019 European Climate Action Rally Crowd Aerial",
        "reference_origin": "Verified Photojournalism Wire (March 2019)",
        "phash": "a1b2c3d4e5f60718",
        "dhash": "f0e1d2c3b4a59687",
        "ahash": "007e7e7e7e7e7e00",
        "known_context": "Recirculated claiming to depict political demonstrations in different countries.",
    },
    {
        "reference_id": "ref-003-military-aircraft",
        "reference_title": "2020 Airshow Precision Flight Demonstration",
        "reference_origin": "Aviation Defense Press Release (2020)",
        "phash": "123456789abcdef0",
        "dhash": "fedcba9876543210",
        "ahash": "81c3e7ffffffe7c3",
        "known_context": "Recycled during active conflict reporting as breaking combat footage.",
    },
]


def _init_catalog() -> list[dict[str, Any]]:
    if not REFERENCE_CATALOG_FILE.exists():
        settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
        REFERENCE_CATALOG_FILE.write_text(json.dumps(SEED_REFERENCE_CATALOG, indent=2), encoding="utf-8")
        return list(SEED_REFERENCE_CATALOG)
    try:
        return json.loads(REFERENCE_CATALOG_FILE.read_text(encoding="utf-8"))
    except Exception:
        return list(SEED_REFERENCE_CATALOG)


def compute_ahash(image: Image.Image) -> str:
    """Average Hash: 8x8 grayscale, mean threshold."""
    img = image.convert("L").resize((8, 8), Image.Resampling.LANCZOS)
    pixels = np.array(img, dtype=np.float32).flatten()
    avg = float(np.mean(pixels))
    bits = "".join(["1" if p > avg else "0" for p in pixels])
    return f"{int(bits, 2):016x}"


def compute_dhash(image: Image.Image) -> str:
    """Difference Hash: 9x8 grayscale, horizontal gradient."""
    img = image.convert("L").resize((9, 8), Image.Resampling.LANCZOS)
    pixels = np.array(img, dtype=np.float32)
    # Compare adjacent pixels horizontally
    diff = pixels[:, 1:] > pixels[:, :-1]
    bits = "".join(["1" if b else "0" for b in diff.flatten()])
    return f"{int(bits, 2):016x}"


def compute_phash(image: Image.Image) -> str:
    """Perceptual Hash: 32x32 grayscale, 2D DCT, top-left 8x8 low-frequency median."""
    img = image.convert("L").resize((32, 32), Image.Resampling.LANCZOS)
    pixels = np.array(img, dtype=np.float32)

    # 2D Discrete Cosine Transform (DCT)
    dct_rows = dct(pixels, axis=0, norm="ortho")
    dct_2d = dct(dct_rows, axis=1, norm="ortho")

    # Extract 8x8 low-frequency block (excluding DC component at [0, 0])
    dct_low = dct_2d[0:8, 0:8]
    med = float(np.median(dct_low[1:, 1:]))
    bits = "".join(["1" if val > med else "0" for val in dct_low.flatten()])
    return f"{int(bits, 2):016x}"


def hamming_distance(hash_hex1: str, hash_hex2: str) -> int:
    """Calculate bitwise Hamming distance between two 64-bit hexadecimal hashes."""
    try:
        val1 = int(hash_hex1, 16)
        val2 = int(hash_hex2, 16)
        xor_val = val1 ^ val2
        return bin(xor_val).count("1")
    except Exception:
        return 64


def compute_all_hashes(file_path: Path) -> dict[str, str]:
    """Compute pHash, dHash, and aHash for an image file."""
    with Image.open(file_path) as img:
        img_rgb = img.convert("RGB")
        p_val = compute_phash(img_rgb)
        d_val = compute_dhash(img_rgb)
        a_val = compute_ahash(img_rgb)

    return {"phash": p_val, "dhash": d_val, "ahash": a_val}


def search_recycled_media(file_path: Path, max_hamming_distance: int = 14) -> dict[str, Any]:
    """Search reference media catalog for visually matching previous instances."""
    hashes = compute_all_hashes(file_path)
    catalog = _init_catalog()

    matches = []
    for ref in catalog:
        ref_phash = ref.get("phash", "")
        dist = hamming_distance(hashes["phash"], ref_phash)

        if dist <= max_hamming_distance:
            # Similarity formula: 100 * (1 - dist / 64)
            similarity = round(100.0 * (1.0 - dist / 64.0), 2)
            confidence = "High Match" if dist <= 6 else ("Moderate Match" if dist <= 10 else "Low Visual Similarity")

            matches.append({
                "reference_id": ref["reference_id"],
                "reference_title": ref["reference_title"],
                "reference_origin": ref["reference_origin"],
                "similarity_percentage": similarity,
                "hamming_distance": dist,
                "match_confidence": confidence,
                "known_context": ref.get("known_context"),
            })

    # Sort matches by highest similarity
    matches.sort(key=lambda m: m["similarity_percentage"], reverse=True)

    return {
        "filename": file_path.name,
        "hashes": hashes,
        "matches_found": len(matches),
        "matches": matches,
        "reference_database_scope": (
            "Reference Collection Search: Evaluated against indexed catalog of verified reference media. "
            "This is not an exhaustive search of the entire internet."
        ),
    }


def add_to_reference_catalog(
    reference_id: str,
    title: str,
    origin: str,
    file_path: Path,
    context: str | None = None,
) -> dict[str, Any]:
    """Add a verified reference media entry to the persistent catalog."""
    catalog = _init_catalog()
    hashes = compute_all_hashes(file_path)

    entry = {
        "reference_id": reference_id,
        "reference_title": title,
        "reference_origin": origin,
        "phash": hashes["phash"],
        "dhash": hashes["dhash"],
        "ahash": hashes["ahash"],
        "known_context": context,
    }

    catalog.append(entry)
    REFERENCE_CATALOG_FILE.write_text(json.dumps(catalog, indent=2), encoding="utf-8")
    return entry


def get_reference_catalog() -> list[dict[str, Any]]:
    """Retrieve full catalog of indexed reference media."""
    return _init_catalog()
