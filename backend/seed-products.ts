import { Pool } from 'pg';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
dotenv.config();
// SSL configuration for PostgreSQL
const getSSLConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return false;
  }
  if (databaseUrl.includes('render.com') || 
      databaseUrl.includes('railway.app') || 
      databaseUrl.includes('dpg-')) {
    return { 
      rejectUnauthorized: false
    };
  }
  return false;
};
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSSLConfig(),
});
interface ProductData {
  name: string;
  category: string;
  price: number;
  thumbnail_url: string;
  detail_image_urls: string[];
  personal_colors: string[];
  description: string;
  shopee_link: string;
  is_active: boolean;
}
const products: ProductData[] = [
  // Spring Warm
  {
    name: 'Moonshot - Melting Mood Lip - Alluring',
    category: 'lip',
    price: 15000,
    thumbnail_url: '/uploads/products/moonshot-alluring.jpg',
    detail_image_urls: [],
    personal_colors: ['spring_warm'],
    description: 'A warm coral lip color tailored for Spring Warm tones.',
    shopee_link: 'https://en.moonshot-beauty.com/product/melting-mood-lip-and-cheeksheer-glow/131/?cate_no=1&display_group=2',
    is_active: true
  },
  {
    name: 'KARADIUM - Butter Coral',
    category: 'lip',
    price: 12000,
    thumbnail_url: '/uploads/products/karadium-butter-coral.jpg',
    detail_image_urls: [],
    personal_colors: ['spring_warm'],
    description: 'Soft butter-coral finish that flatters Spring Warm skin.',
    shopee_link: 'https://smartstore.naver.com/karadium/products/9255588817',
    is_active: true
  },
  {
    name: 'molette - Apple Cheeky',
    category: 'lip',
    price: 18000,
    thumbnail_url: '/uploads/products/molette-apple-cheeky.jpg',
    detail_image_urls: [],
    personal_colors: ['spring_warm'],
    description: 'A fresh apple-inspired lip shade for Spring looks.',
    shopee_link: 'http://smartstore.naver.com/molette_official/products/11582095583',
    is_active: true
  },
  // Summer Cool
  {
    name: 'Moonshot - Shy',
    category: 'lip',
    price: 15000,
    thumbnail_url: '/uploads/products/moonshot-shy.jpg',
    detail_image_urls: [],
    personal_colors: ['summer_cool'],
    description: 'A gentle pink lip color designed for Summer Cool undertones.',
    shopee_link: '',
    is_active: true
  },
  {
    name: 'KARADIUM - Cozy Pink',
    category: 'lip',
    price: 12000,
    thumbnail_url: '/uploads/products/karadium-cozy-pink.jpg',
    detail_image_urls: [],
    personal_colors: ['summer_cool'],
    description: 'Cozy pink pigment that suits Summer Cool complexions.',
    shopee_link: '',
    is_active: true
  },
  {
    name: 'molette - Dewy Berry',
    category: 'lip',
    price: 18000,
    thumbnail_url: '/uploads/products/molette-dewy-berry.jpg',
    detail_image_urls: [],
    personal_colors: ['summer_cool'],
    description: 'Moist berry shade that complements Summer Cool palettes.',
    shopee_link: '',
    is_active: true
  },
  // Autumn Warm
  {
    name: 'Moonshot - Honest',
    category: 'lip',
    price: 15000,
    thumbnail_url: '/uploads/products/moonshot-honest.jpg',
    detail_image_urls: [],
    personal_colors: ['autumn_warm'],
    description: 'A true brown lip color made for Autumn Warm tones.',
    shopee_link: '',
    is_active: true
  },
  {
    name: 'KARADIUM - Pecan Sand',
    category: 'lip',
    price: 12000,
    thumbnail_url: '/uploads/products/karadium-pecan-sand.jpg',
    detail_image_urls: [],
    personal_colors: ['autumn_warm'],
    description: 'Pecan-sand hue that enhances autumn-inspired makeup.',
    shopee_link: '',
    is_active: true
  },
  {
    name: 'molette - Coco Choco',
    category: 'lip',
    price: 18000,
    thumbnail_url: '/uploads/products/molette-coco-choco.jpg',
    detail_image_urls: [],
    personal_colors: ['autumn_warm'],
    description: 'Chocolate-brown finish ideal for Autumn Warm styling.',
    shopee_link: '',
    is_active: true
  },
  // Winter Cool
  {
    name: 'Moonshot - Jelly Moon Glow Tint - Oort Pink',
    category: 'lip',
    price: 17000,
    thumbnail_url: '/uploads/products/moonshot-oort-pink.jpg',
    detail_image_urls: [],
    personal_colors: ['winter_cool'],
    description: 'A vivid pink lip tint created for Winter Cool tones.',
    shopee_link: 'https://en.moonshot-beauty.com/product/jelly-moon-glow-tint/158/?cate_no=56&display_group=1',
    is_active: true
  },
  {
    name: 'KARADIUM - Rosy Berry',
    category: 'lip',
    price: 12000,
    thumbnail_url: '/uploads/products/karadium-rosy-berry.jpg',
    detail_image_urls: [],
    personal_colors: ['winter_cool'],
    description: 'Rosy berry shade perfect for Winter Cool complexions.',
    shopee_link: '',
    is_active: true
  },
  {
    name: 'molette - Tingle Cherry',
    category: 'lip',
    price: 18000,
    thumbnail_url: '/uploads/products/molette-tingle-cherry.jpg',
    detail_image_urls: [],
    personal_colors: ['winter_cool'],
    description: 'Cherry-red pigment that brings Winter Cool looks to life.',
    shopee_link: '',
    is_active: true
  }
];
async function seedProducts() {
  try {
    console.log('Connecting to database...');
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    // Check if products table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      );
    `);
    if (!tableCheck.rows[0].exists) {
      console.log('Creating products table...');
      await pool.query(`
        CREATE TABLE products (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(50) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          image_url TEXT NOT NULL,
          additional_images TEXT[],
          personal_colors TEXT[] NOT NULL,
          description TEXT,
          product_link TEXT,
          is_available BOOLEAN DEFAULT true,
          brand VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Products table created');
    }
    // Clear existing products
    await pool.query('DELETE FROM products');
    console.log('Cleared existing products');
    // Insert new products
    for (const product of products) {
      await pool.query(`
        INSERT INTO products (
          id, name, category, price, thumbnail_url, detail_image_urls,
          personal_colors, description, shopee_link, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        randomUUID(),
        product.name,
        product.category,
        product.price,
        product.thumbnail_url,
        product.detail_image_urls,
        product.personal_colors,
        product.description,
        product.shopee_link,
        product.is_active
      ]);
      console.log(`Added product: ${product.name}`);
    }
    console.log(`\nSuccessfully seeded ${products.length} products!`);
    // Verify the products were added
    const result = await pool.query('SELECT COUNT(*) FROM products');
    console.log(`Total products in database: ${result.rows[0].count}`);
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await pool.end();
  }
}
seedProducts();