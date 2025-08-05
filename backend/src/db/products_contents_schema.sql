-- Products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('hijab', 'lens', 'lip', 'eyeshadow')),
    price INTEGER NOT NULL,
    thumbnail_url TEXT NOT NULL,
    detail_image_urls TEXT[] DEFAULT '{}',
    personal_colors TEXT[] NOT NULL,
    description TEXT,
    shopee_link TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for products
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Contents table
CREATE TABLE IF NOT EXISTS contents (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    thumbnail_url TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('beauty_tips', 'hijab_styling', 'color_guide', 'trend', 'tutorial')),
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMP WITH TIME ZONE,
    meta_description TEXT,
    meta_keywords TEXT,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for contents
CREATE INDEX idx_contents_slug ON contents(slug);
CREATE INDEX idx_contents_category ON contents(category);
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_contents_published_at ON contents(published_at DESC);
CREATE INDEX idx_contents_view_count ON contents(view_count DESC);

-- Trigger for products updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for contents updated_at
CREATE TRIGGER update_contents_updated_at 
    BEFORE UPDATE ON contents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();