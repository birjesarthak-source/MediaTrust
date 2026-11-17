-- ==============================================================================
-- MediaTrust AI: Database Schema (MySQL 8.0)
-- AI-Powered Multimedia Authenticity and Misinformation Detection System
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS mediatrust_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE mediatrust_db;

-- 1. Media Files Table
CREATE TABLE IF NOT EXISTS media_files (
    id CHAR(36) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    media_type ENUM('image', 'video') NOT NULL,
    file_format VARCHAR(10) NOT NULL,
    file_size_bytes BIGINT UNSIGNED NOT NULL,
    sha256_hash CHAR(64) NOT NULL,
    phash_hex VARCHAR(64) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sha256 (sha256_hash),
    INDEX idx_phash (phash_hex),
    INDEX idx_media_type (media_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- 2. Image Analysis Table (Member 1: Pixel & AI)
CREATE TABLE IF NOT EXISTS image_analysis (
    id CHAR(36) PRIMARY KEY,
    media_id CHAR(36) NOT NULL UNIQUE,
    width INT UNSIGNED NOT NULL,
    height INT UNSIGNED NOT NULL,
    channels TINYINT UNSIGNED NOT NULL DEFAULT 3,
    edge_density FLOAT NOT NULL,
    laplacian_variance FLOAT NOT NULL,
    texture_score FLOAT NOT NULL,
    shannon_entropy FLOAT NOT NULL,
    noise_variance FLOAT NOT NULL,
    ela_mean_divergence FLOAT NOT NULL,
    fft_high_freq_ratio FLOAT NOT NULL,
    ai_model_name VARCHAR(100) DEFAULT NULL,
    ai_model_probability FLOAT DEFAULT NULL,
    ai_model_prediction VARCHAR(50) DEFAULT NULL,
    rgb_distribution JSON DEFAULT NULL,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES media_files(id) ON DELETE CASCADE,
    INDEX idx_ai_prediction (ai_model_prediction)
) ENGINE=InnoDB;

-- 3. Video Analysis Table (Member 1: Deepfake & Frames)
CREATE TABLE IF NOT EXISTS video_analysis (
    id CHAR(36) PRIMARY KEY,
    media_id CHAR(36) NOT NULL UNIQUE,
    duration_seconds FLOAT NOT NULL,
    total_frames INT UNSIGNED NOT NULL,
    sampled_frames INT UNSIGNED NOT NULL,
    fps FLOAT NOT NULL,
    detected_faces_count INT UNSIGNED NOT NULL DEFAULT 0,
    mean_deepfake_score FLOAT DEFAULT NULL,
    max_deepfake_score FLOAT DEFAULT NULL,
    suspicious_frame_count INT UNSIGNED NOT NULL DEFAULT 0,
    video_assessment VARCHAR(50) NOT NULL DEFAULT 'Requires Further Verification',
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES media_files(id) ON DELETE CASCADE,
    INDEX idx_video_assessment (video_assessment)
) ENGINE=InnoDB;

-- 4. Frame Analysis Table (Member 1: Frame-Level Evidence)
CREATE TABLE IF NOT EXISTS frame_analysis (
    id CHAR(36) PRIMARY KEY,
    video_analysis_id CHAR(36) NOT NULL,
    frame_number INT UNSIGNED NOT NULL,
    timestamp_seconds FLOAT NOT NULL,
    frame_storage_path VARCHAR(500) NOT NULL,
    face_detected BOOLEAN NOT NULL DEFAULT FALSE,
    face_bounding_box JSON DEFAULT NULL,
    deepfake_probability FLOAT DEFAULT NULL,
    is_suspicious BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_analysis_id) REFERENCES video_analysis(id) ON DELETE CASCADE,
    INDEX idx_video_frame (video_analysis_id, frame_number),
    INDEX idx_suspicious_frames (video_analysis_id, is_suspicious)
) ENGINE=InnoDB;

-- 5. Metadata Records Table (Member 2: Digital Forensics)
CREATE TABLE IF NOT EXISTS metadata_records (
    id CHAR(36) PRIMARY KEY,
    media_id CHAR(36) NOT NULL UNIQUE,
    camera_make VARCHAR(100) DEFAULT NULL,
    camera_model VARCHAR(100) DEFAULT NULL,
    software_editing_tool VARCHAR(150) DEFAULT NULL,
    capture_timestamp DATETIME DEFAULT NULL,
    gps_latitude DECIMAL(10, 8) DEFAULT NULL,
    gps_longitude DECIMAL(11, 8) DEFAULT NULL,
    video_codec VARCHAR(50) DEFAULT NULL,
    metadata_stripped BOOLEAN NOT NULL DEFAULT FALSE,
    raw_exif_json JSON DEFAULT NULL,
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES media_files(id) ON DELETE CASCADE,
    INDEX idx_camera (camera_make, camera_model)
) ENGINE=InnoDB;

-- 6. C2PA Records Table (Member 2: Provenance Credentials)
CREATE TABLE IF NOT EXISTS c2pa_records (
    id CHAR(36) PRIMARY KEY,
    media_id CHAR(36) NOT NULL UNIQUE,
    manifest_present BOOLEAN NOT NULL DEFAULT FALSE,
    validation_status ENUM('Valid', 'Invalid', 'Unavailable') NOT NULL DEFAULT 'Unavailable',
    claim_generator VARCHAR(255) DEFAULT NULL,
    signing_issuer VARCHAR(255) DEFAULT NULL,
    signing_time DATETIME DEFAULT NULL,
    assertion_actions JSON DEFAULT NULL,
    c2pa_summary TEXT DEFAULT NULL,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES media_files(id) ON DELETE CASCADE,
    INDEX idx_c2pa_status (validation_status)
) ENGINE=InnoDB;

-- 7. Recycled Media Matches Table (Member 2: Perceptual Hashing)
CREATE TABLE IF NOT EXISTS recycled_media_matches (
    id CHAR(36) PRIMARY KEY,
    query_media_id CHAR(36) NOT NULL,
    reference_media_id CHAR(36) DEFAULT NULL,
    hamming_distance TINYINT UNSIGNED NOT NULL,
    similarity_percentage FLOAT NOT NULL,
    reference_title VARCHAR(255) NOT NULL,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_media_id) REFERENCES media_files(id) ON DELETE CASCADE,
    INDEX idx_match_query (query_media_id),
    INDEX idx_similarity (similarity_percentage)
) ENGINE=InnoDB;

-- 8. Verification Reports Table (Member 3: Evidence Fusion)
CREATE TABLE IF NOT EXISTS verification_reports (
    id CHAR(36) PRIMARY KEY,
    media_id CHAR(36) NOT NULL UNIQUE,
    overall_assessment ENUM(
        'Likely Authentic',
        'Potentially AI-Generated',
        'Potentially Manipulated',
        'Previously Circulated / Similar Media Found',
        'Requires Further Verification'
    ) NOT NULL DEFAULT 'Requires Further Verification',
    confidence_score FLOAT NOT NULL,
    evidence_summary TEXT NOT NULL,
    limitations_notice TEXT NOT NULL,
    human_action_recommendation TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES media_files(id) ON DELETE CASCADE,
    INDEX idx_assessment (overall_assessment)
) ENGINE=InnoDB;

-- 9. Alerts Table (Member 3: Notification System)
CREATE TABLE IF NOT EXISTS alerts (
    id CHAR(36) PRIMARY KEY,
    report_id CHAR(36) NOT NULL,
    severity ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
    category VARCHAR(50) NOT NULL,
    headline VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES verification_reports(id) ON DELETE CASCADE,
    INDEX idx_severity (severity),
    INDEX idx_ack (acknowledged)
) ENGINE=InnoDB;

-- 10. Social Media Sources Table (Member 3: Automated Monitoring)
CREATE TABLE IF NOT EXISTS social_media_sources (
    id CHAR(36) PRIMARY KEY,
    platform_name VARCHAR(50) NOT NULL,
    handle_or_channel VARCHAR(100) NOT NULL,
    auth_status ENUM('Configured', 'Connected', 'Unavailable') NOT NULL DEFAULT 'Unavailable',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_polled_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_platform (platform_name),
    INDEX idx_status (auth_status)
) ENGINE=InnoDB;

-- 11. Social Media Posts Table (Member 3: Discovered Content)
CREATE TABLE IF NOT EXISTS social_media_posts (
    id CHAR(36) PRIMARY KEY,
    source_id CHAR(36) NOT NULL,
    platform_post_id VARCHAR(100) NOT NULL,
    post_author VARCHAR(255) NOT NULL,
    post_content TEXT,
    post_url VARCHAR(500) NOT NULL,
    media_id CHAR(36) DEFAULT NULL,
    published_at DATETIME NOT NULL,
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES social_media_sources(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media_files(id) ON DELETE SET NULL,
    UNIQUE KEY uq_platform_post (platform_post_id)
) ENGINE=InnoDB;

-- 12. Monitoring Keywords Table (Member 3: Query Terms)
CREATE TABLE IF NOT EXISTS monitoring_keywords (
    id CHAR(36) PRIMARY KEY,
    keyword VARCHAR(100) NOT NULL,
    query_type ENUM('keyword', 'hashtag', 'account') NOT NULL DEFAULT 'keyword',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_keyword (keyword),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;
