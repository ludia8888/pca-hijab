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
  // 봄 웜 (Spring Warm)
  {
    name: 'Moonshot - Melting Mood Lip - Alluring',
    category: 'lip',
    price: 15000,
    thumbnail_url: '/uploads/products/moonshot-alluring.jpg',
    detail_image_urls: [],
    personal_colors: ['spring_warm'],
    description: '봄 웜톤을 위한 따뜻한 코랄 립 컬러',
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
    description: '부드러운 버터 코랄 컬러로 봄 웜톤에 완벽',
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
    description: '사과처럼 상큼한 봄 웜톤 립 컬러',
    shopee_link: 'http://smartstore.naver.com/molette_official/products/11582095583',
    is_active: true
  },
  // 여름 쿨 (Summer Cool)
  {
    name: 'Moonshot - Shy',
    category: 'lip',
    price: 15000,
    thumbnail_url: '/uploads/products/moonshot-shy.jpg',
    detail_image_urls: [],
    personal_colors: ['summer_cool'],
    description: '여름 쿨톤을 위한 부드러운 핑크 립 컬러',
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
    description: '포근한 핑크 컬러로 여름 쿨톤에 어울림',
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
    description: '촉촉한 베리 컬러로 여름 쿨톤에 완벽',
    shopee_link: '',
    is_active: true
  },
  // 가을 웜 (Autumn Warm)
  {
    name: 'Moonshot - Honest',
    category: 'lip',
    price: 15000,
    thumbnail_url: '/uploads/products/moonshot-honest.jpg',
    detail_image_urls: [],
    personal_colors: ['autumn_warm'],
    description: '가을 웜톤을 위한 정직한 브라운 립 컬러',
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
    description: '피칸 샌드 컬러로 가을 웜톤에 어울림',
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
    description: '초콜릿 브라운 컬러로 가을 웜톤에 완벽',
    shopee_link: '',
    is_active: true
  },
  // 겨울 쿨 (Winter Cool)
  {
    name: 'Moonshot - Jelly Moon Glow Tint - Oort Pink',
    category: 'lip',
    price: 17000,
    thumbnail_url: '/uploads/products/moonshot-oort-pink.jpg',
    detail_image_urls: [],
    personal_colors: ['winter_cool'],
    description: '겨울 쿨톤을 위한 선명한 핑크 립 틴트',
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
    description: '로지 베리 컬러로 겨울 쿨톤에 어울림',
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
    description: '체리 레드 컬러로 겨울 쿨톤에 완벽',
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