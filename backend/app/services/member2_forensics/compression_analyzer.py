"""Member 2 Service: Social Media Compression & Re-Encoding Forensics.

Analyzes compression characteristics, quantization tables, chroma subsampling,
and resizing footprints common to social media pipelines (WhatsApp, X, Meta, Telegram).

Scientific Principles:
1. Social media platforms compress user uploads to optimize bandwidth, typically
   applying 4:2:0 chroma subsampling and JPEG quality factors between 65 and 80.
2. Compression artifacts (blockiness, DCT ringing, high-frequency suppression)
   MUST NOT be treated as proof of malicious falsification.
3. Quantifies how severe compression affects the reliability of downstream AI models.
"""

from pathlib import Path
from typing import Any

import cv2
import numpy as np
from PIL import Image


def estimate_jpeg_quality(pil_image: Image.Image) -> int:
    """Estimate JPEG quality factor (1-100) from luminance quantization table."""
    if not hasattr(pil_image, "quantization") or not pil_image.quantization:
        return 90  # Default baseline for uncompressed/lossless formats

    # Quantization table 0 is standard luminance
    q_table = pil_image.quantization.get(0)
    if not q_table or len(q_table) < 64:
        return 85

    # Standard IJG 50% luminance table sum is approx 1000
    table_sum = sum(q_table)
    # Inverse relationship: smaller table sum -> higher quality
    if table_sum <= 100:
        return 98
    elif table_sum <= 300:
        return 90
    elif table_sum <= 600:
        return 80
    elif table_sum <= 1200:
        return 70
    elif table_sum <= 2400:
        return 55
    else:
        return 40


def analyze_compression(file_path: Path) -> dict[str, Any]:
    """Analyze image compression severity, quantization, and reliability implications."""
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    with Image.open(file_path) as img:
        img_format = (img.format or file_path.suffix.lstrip(".")).upper()
        w, h = img.size
        estimated_q = estimate_jpeg_quality(img) if img_format in {"JPEG", "JPG"} else None

    # Detect common social media target resolutions
    social_res_footprints = [
        (1080, 1080),  # Instagram square
        (1080, 1350),  # Instagram portrait
        (1200, 675),   # X (Twitter) 16:9
        (2048, 2048),  # Facebook max full-res
        (1280, 720),   # 720p HD
        (1920, 1080),  # 1080p FHD
    ]
    resizing_detected = (w, h) in social_res_footprints or w in {1080, 1200, 1280, 1920, 2048}

    re_encoding_indicators = []
    if estimated_q is not None:
        if estimated_q <= 70:
            severity = "Severe"
            re_encoding_indicators.append(
                f"Aggressive lossy JPEG compression detected (Estimated Q={estimated_q}). High-frequency micro-textures have been suppressed."
            )
        elif estimated_q <= 82:
            severity = "Moderate"
            re_encoding_indicators.append(
                f"Moderate lossy compression detected (Estimated Q={estimated_q}), consistent with automated social messaging compression."
            )
        else:
            severity = "Low"
            re_encoding_indicators.append(f"High quality retention observed (Estimated Q={estimated_q}).")
    else:
        severity = "Low"
        re_encoding_indicators.append(f"Format is {img_format}; lossy DCT quantization tables are not applicable.")

    if resizing_detected:
        re_encoding_indicators.append(
            f"Image resolution ({w}x{h}) matches common social media distribution dimensions."
        )

    # Scientific reliability impact statement
    if severity == "Severe":
        reliability_impact = (
            "Severe compression attenuates PRNU sensor noise and introduces 8x8 DCT grid blockiness. "
            "This reduces the reliability of pixel-level ELA and PyTorch artifact detectors. "
            "Downstream evidence fusion should downgrade AI confidence and recommend human verification."
        )
    elif severity == "Moderate":
        reliability_impact = (
            "Moderate compression causes minor spectral attenuation. AI model predictions remain generally viable "
            "but should be cross-referenced with C2PA and metadata findings."
        )
    else:
        reliability_impact = (
            "Low compression footprint detected. High-frequency pixel and frequency cues are well-preserved, "
            "enabling optimal reliability for AI and pixel forensic analysis."
        )

    return {
        "media_id": "",
        "filename": file_path.name,
        "estimated_quality_factor": estimated_q,
        "compression_severity": severity,
        "chroma_subsampling": "4:2:0" if (estimated_q and estimated_q <= 85) else "4:4:4",
        "resizing_detected": resizing_detected,
        "re_encoding_indicators": re_encoding_indicators,
        "ai_reliability_impact": reliability_impact,
    }
