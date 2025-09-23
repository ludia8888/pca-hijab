-- Database initialization script for PCA-HIJAB
-- This file creates the necessary tables for the application

-- Create tables only if they don't exist
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    instagram_id VARCHAR(255),
    user_id VARCHAR(255),
    uploaded_image_url TEXT,
    analysis_result JSONB,
    journey_status VARCHAR(50),
    priority VARCHAR(20),
    offer_sent_at TIMESTAMP,
    notes TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) REFERENCES sessions(id),
    instagram_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    personal_color_result JSONB NOT NULL,
    user_preferences JSONB NOT NULL,
    uploaded_image_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    instagram_id VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMP,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token VARCHAR(512) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ko VARCHAR(255),
    brand VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    personal_colors TEXT[] NOT NULL,
    price INTEGER NOT NULL,
    sale_price INTEGER,
    description TEXT,
    features TEXT[],
    product_link TEXT,
    image_url TEXT NOT NULL,
    additional_images TEXT[],
    is_available BOOLEAN DEFAULT TRUE,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contents (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    author VARCHAR(255) DEFAULT 'PCA-HIJAB Team',
    featured_image TEXT,
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_instagram_id ON sessions(instagram_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_session_id ON recommendations(session_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_contents_slug ON contents(slug);
CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);