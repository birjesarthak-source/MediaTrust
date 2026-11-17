"""Member 1 Service: Pixel-Level Image Forensics Engine.

Performs authentic, non-random, mathematically grounded pixel and image analysis
using OpenCV, NumPy, and Pillow.

Indicators extracted:
1. Color Distribution & Channel Statistics (R, G, B mean, std, min, max, median, skewness)
2. 256-Bin Color Histograms for R, G, and B
3. Edge Detection & Edge Density (Sobel gradients & Laplacian variance)
4. Texture Analysis (Local variance / Gray-level gradient entropy)
5. Noise Estimation (High-frequency residual via median filter subtraction)
6. Error Level Analysis (ELA) divergence metrics (JPEG resave at 90% Q)
7. 2D Fast Fourier Transform (FFT) Frequency Domain Energy Distribution
"""

import io
from pathlib import Path
from typing import Any

import cv2
import numpy as np
from PIL import Image


def compute_channel_stats(channel: np.ndarray) -> dict[str, float]:
    """Calculate mean, standard deviation, min, max, median, and skewness for a single channel."""
    flat = channel.flatten().astype(np.float64)
    mean = float(np.mean(flat))
    std = float(np.std(flat))
    min_val = float(np.min(flat))
    max_val = float(np.max(flat))
    median_val = float(np.median(flat))

    # Fisher-Pearson coefficient of skewness
    if std > 1e-6:
        skewness = float(np.mean(((flat - mean) / std) ** 3))
    else:
        skewness = 0.0

    return {
        "mean": round(mean, 2),
        "std_dev": round(std, 2),
        "min": round(min_val, 2),
        "max": round(max_val, 2),
        "median": round(median_val, 2),
        "skewness": round(skewness, 4),
    }


def compute_histograms(image_rgb: np.ndarray) -> dict[str, list[int]]:
    """Compute 256-bin histograms for R, G, and B channels."""
    hist_r = cv2.calcHist([image_rgb], [0], None, [256], [0, 256]).flatten().tolist()
    hist_g = cv2.calcHist([image_rgb], [1], None, [256], [0, 256]).flatten().tolist()
    hist_b = cv2.calcHist([image_rgb], [2], None, [256], [0, 256]).flatten().tolist()

    return {
        "r": [int(v) for v in hist_r],
        "g": [int(v) for v in hist_g],
        "b": [int(v) for v in hist_b],
    }


def compute_edge_metrics(gray: np.ndarray) -> dict[str, Any]:
    """Compute Laplacian edge variance and Sobel edge density.

    - Laplacian variance measures sharpness and high-frequency edge definition.
    - Edge density indicates the fraction of pixels classified as significant edges.
    """
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    laplacian_var = float(laplacian.var())

    sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    sobel_mag = cv2.magnitude(sobel_x, sobel_y)

    edge_threshold = 50.0
    edge_pixel_ratio = float(np.count_nonzero(sobel_mag > edge_threshold) / gray.size)

    return {
        "laplacian_variance": round(laplacian_var, 2),
        "edge_density": round(edge_pixel_ratio, 4),
        "sobel_gradient_mean": round(float(np.mean(sobel_mag)), 2),
        "sobel_gradient_max": round(float(np.max(sobel_mag)), 2),
    }


def compute_texture_metrics(gray: np.ndarray) -> dict[str, float]:
    """Compute local texture variation and entropy.

    Unnatural smoothing in generative diffusion models often produces abnormally low
    local texture entropy in fine skin or background regions.
    """
    # Local standard deviation filter as texture representation
    kernel_size = 5
    mean = cv2.blur(gray.astype(np.float32), (kernel_size, kernel_size))
    mean_sq = cv2.blur((gray.astype(np.float32)) ** 2, (kernel_size, kernel_size))
    variance = np.maximum(mean_sq - mean**2, 0)
    local_std = np.sqrt(variance)

    # Shannon Entropy of 8-bit image
    hist, _ = np.histogram(gray, bins=256, range=(0, 256), density=True)
    hist = hist[hist > 0]
    entropy = float(-np.sum(hist * np.log2(hist)))

    return {
        "texture_score": round(float(np.mean(local_std)), 3),
        "texture_variance": round(float(np.var(local_std)), 3),
        "shannon_entropy": round(entropy, 4),
    }


def compute_noise_estimate(gray: np.ndarray) -> dict[str, float]:
    """Estimate sensor pattern noise residual by subtracting a 3x3 median-filtered image.

    Authentic camera captures retain sensor pattern noise (PRNU). AI-generated or heavily
    smoothed images often exhibit unusually low or artificial noise patterns.
    """
    denoised = cv2.medianBlur(gray, 3)
    noise_residual = cv2.absdiff(gray, denoised).astype(np.float64)

    noise_var = float(np.var(noise_residual))
    noise_mean = float(np.mean(noise_residual))

    return {
        "noise_variance": round(noise_var, 4),
        "noise_mean": round(noise_mean, 4),
        "snr_db": round(float(10 * np.log10((np.mean(gray) ** 2 + 1e-6) / (noise_var + 1e-6))), 2),
    }


def compute_ela(image_path: Path, quality: int = 90) -> dict[str, Any]:
    """Error Level Analysis (ELA) simulation.

    Resaves the image at a known JPEG quality factor (default 90) and calculates
    the absolute difference per pixel. Regions with differing compression levels
    or post-processing edits exhibit distinct error rates.
    """
    try:
        orig = Image.open(image_path).convert("RGB")
        buffer = io.BytesIO()
        orig.save(buffer, format="JPEG", quality=quality)
        buffer.seek(0)
        resaved = Image.open(buffer).convert("RGB")

        orig_np = np.asarray(orig, dtype=np.float32)
        resaved_np = np.asarray(resaved, dtype=np.float32)

        # Difference scaled for visibility and statistical measurement
        diff = np.abs(orig_np - resaved_np)
        mean_diff = float(np.mean(diff))
        max_diff = float(np.max(diff))
        std_diff = float(np.std(diff))

        return {
            "ela_quality_tested": quality,
            "ela_mean_divergence": round(mean_diff, 3),
            "ela_max_divergence": round(max_diff, 2),
            "ela_std_divergence": round(std_diff, 3),
            "divergence_uniformity_score": round(float(1.0 / (1.0 + std_diff)), 4),
        }
    except Exception as exc:
        return {
            "ela_quality_tested": quality,
            "ela_mean_divergence": 0.0,
            "ela_max_divergence": 0.0,
            "ela_std_divergence": 0.0,
            "divergence_uniformity_score": 0.0,
            "error": str(exc),
        }


def compute_fft_frequency_metrics(gray: np.ndarray) -> dict[str, float]:
    """2D Fast Fourier Transform (FFT) frequency domain analysis.

    Analyzes periodic spectral artifacts. Generative models (GANs with transposed
    convolutions and latent diffusion upsampling) frequently display anomalous
    checkerboard artifacts visible in high-frequency spectral bands.
    """
    h, w = gray.shape
    # Compute 2D-FFT and shift zero frequency to center
    f_transform = np.fft.fft2(gray.astype(np.float64))
    f_shift = np.fft.fftshift(f_transform)
    magnitude_spectrum = np.abs(f_shift)

    # Radial frequency partitioning
    center_y, center_x = h // 2, w // 2
    y_indices, x_indices = np.ogrid[:h, :w]
    radii = np.sqrt((x_indices - center_x) ** 2 + (y_indices - center_y) ** 2)
    max_radius = np.sqrt(center_x**2 + center_y**2)

    # Low frequency: inner 20% radius; High frequency: outer 50% radius
    low_freq_mask = radii <= (0.20 * max_radius)
    high_freq_mask = radii >= (0.50 * max_radius)

    total_energy = float(np.sum(magnitude_spectrum)) + 1e-8
    low_freq_energy = float(np.sum(magnitude_spectrum[low_freq_mask]))
    high_freq_energy = float(np.sum(magnitude_spectrum[high_freq_mask]))

    high_to_low_ratio = high_freq_energy / (low_freq_energy + 1e-8)

    return {
        "fft_total_energy": round(total_energy, 1),
        "high_frequency_ratio": round(high_freq_energy / total_energy, 4),
        "low_frequency_ratio": round(low_freq_energy / total_energy, 4),
        "high_to_low_energy_ratio": round(high_to_low_ratio, 4),
    }


def analyze_image_pixels(image_path: Path) -> dict[str, Any]:
    """Primary entry point for Member 1 Pixel Analysis Engine.

    Reads image file, computes full mathematical pixel forensics, and structures
    the explainable indicators.
    """
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found at path: {image_path}")

    # Load with OpenCV
    img_bgr = cv2.imread(str(image_path))
    if img_bgr is None:
        # Fallback load using PIL for WebP or non-standard JPEG variants
        pil_img = Image.open(image_path).convert("RGB")
        img_rgb = np.array(pil_img)
        img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    else:
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    height, width, channels = img_rgb.shape
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 1. Channel Statistics
    r_stats = compute_channel_stats(img_rgb[:, :, 0])
    g_stats = compute_channel_stats(img_rgb[:, :, 1])
    b_stats = compute_channel_stats(img_rgb[:, :, 2])

    # 2. Histograms
    histograms = compute_histograms(img_rgb)

    # 3. Edge metrics
    edge_metrics = compute_edge_metrics(gray)

    # 4. Texture metrics
    texture_metrics = compute_texture_metrics(gray)

    # 5. Noise metrics
    noise_metrics = compute_noise_estimate(gray)

    # 6. Error Level Analysis
    ela_metrics = compute_ela(image_path, quality=90)

    # 7. 2D-FFT Frequency metrics
    fft_metrics = compute_fft_frequency_metrics(gray)

    # Explanatory notes detailing the scientific context of these indicators
    notes = [
        "Channel statistics depict overall color balance and illumination dynamics.",
        "Laplacian variance quantifies edge gradient sharpness; authentic camera captures typically exhibit natural depth-of-field blur gradients.",
        "Error Level Analysis measures pixel compression divergence. High non-uniformity indicates composite editing or varying compression histories.",
        "2D-FFT metrics analyze spectral energy. Periodic high-frequency spikes can indicate synthetic upsampling or GAN grid artifacts.",
        "These pixel indicators serve as technical forensic evidence and do not by themselves constitute a definitive authenticity verdict.",
    ]

    return {
        "dimensions": {
            "width": width,
            "height": height,
            "channels": channels,
            "aspect_ratio": round(width / max(height, 1), 3),
            "total_pixels": width * height,
        },
        "channel_statistics": {
            "red": r_stats,
            "green": g_stats,
            "blue": b_stats,
        },
        "histograms": histograms,
        "edge_analysis": edge_metrics,
        "texture_analysis": texture_metrics,
        "noise_analysis": noise_metrics,
        "error_level_analysis": ela_metrics,
        "frequency_analysis": fft_metrics,
        "scientific_notes": notes,
    }
