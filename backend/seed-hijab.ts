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
// Sample hijab products for each season
const hijabProducts: ProductData[] = [
  // Spring Warm - coral, peach, and light brown tones
  {
    name: 'Soft Coral Chiffon Hijab',
    category: 'hijab',
    price: 25000,
    thumbnail_url: '/uploads/hijabs/spring-coral-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['spring_warm'],
    description: 'Soft coral chiffon hijab that flatters every Spring Warm complexion.',
    shopee_link: 'https://example.com/coral-hijab',
    is_active: true
  },
  {
    name: 'Peach Blossom Satin Hijab',
    category: 'hijab',
    price: 28000,
    thumbnail_url: '/uploads/hijabs/spring-peach-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['spring_warm'],
    description: 'Peach blossom satin hijab that delivers a bright, warm finish.',
    shopee_link: 'https://example.com/peach-hijab',
    is_active: true
  },
  {
    name: 'Light Camel Jersey Hijab',
    category: 'hijab',
    price: 22000,
    thumbnail_url: '/uploads/hijabs/spring-camel-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['spring_warm'],
    description: 'Light camel jersey hijab designed for effortless everyday styling.',
    shopee_link: 'https://example.com/camel-hijab',
    is_active: true
  },
  // Summer Cool - soft pink, lavender, and light blue tones
  {
    name: 'Rose Quartz Modal Hijab',
    category: 'hijab',
    price: 26000,
    thumbnail_url: '/uploads/hijabs/summer-rose-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['summer_cool'],
    description: 'Rose quartz modal hijab that adds a refreshing touch to Summer Cool looks.',
    shopee_link: 'https://example.com/rose-hijab',
    is_active: true
  },
  {
    name: 'Lavender Mist Chiffon Hijab',
    category: 'hijab',
    price: 27000,
    thumbnail_url: '/uploads/hijabs/summer-lavender-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['summer_cool'],
    description: 'Lavender mist chiffon hijab for an elegant Summer Cool finish.',
    shopee_link: 'https://example.com/lavender-hijab',
    is_active: true
  },
  {
    name: 'Powder Blue Cotton Hijab',
    category: 'hijab',
    price: 24000,
    thumbnail_url: '/uploads/hijabs/summer-blue-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['summer_cool'],
    description: 'Powder blue cotton hijab that keeps warm-weather outfits light and airy.',
    shopee_link: 'https://example.com/blue-hijab',
    is_active: true
  },
  // Autumn Warm - burnt orange, deep brown, and khaki tones
  {
    name: 'Burnt Sienna Wool Hijab',
    category: 'hijab',
    price: 32000,
    thumbnail_url: '/uploads/hijabs/autumn-sienna-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['autumn_warm'],
    description: 'Burnt sienna wool hijab that highlights the richness of Autumn Warm skin.',
    shopee_link: 'https://example.com/sienna-hijab',
    is_active: true
  },
  {
    name: 'Chocolate Brown Viscose Hijab',
    category: 'hijab',
    price: 29000,
    thumbnail_url: '/uploads/hijabs/autumn-brown-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['autumn_warm'],
    description: 'Chocolate-brown viscose hijab that adds depth to fall wardrobes.',
    shopee_link: 'https://example.com/brown-hijab',
    is_active: true
  },
  {
    name: 'Olive Khaki Linen Hijab',
    category: 'hijab',
    price: 30000,
    thumbnail_url: '/uploads/hijabs/autumn-olive-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['autumn_warm'],
    description: 'Olive khaki linen hijab for an easy, earthy Autumn Warm style.',
    shopee_link: 'https://example.com/olive-hijab',
    is_active: true
  },
  // Winter Cool - deep pink, burgundy, and navy tones
  {
    name: 'Fuchsia Pink Satin Hijab',
    category: 'hijab',
    price: 31000,
    thumbnail_url: '/uploads/hijabs/winter-fuchsia-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['winter_cool'],
    description: 'Fuchsia pink satin hijab that amplifies the drama of Winter Cool tones.',
    shopee_link: 'https://example.com/fuchsia-hijab',
    is_active: true
  },
  {
    name: 'Burgundy Velvet Hijab',
    category: 'hijab',
    price: 35000,
    thumbnail_url: '/uploads/hijabs/winter-burgundy-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['winter_cool'],
    description: 'Burgundy velvet hijab for a luxurious cold-weather statement.',
    shopee_link: 'https://example.com/burgundy-hijab',
    is_active: true
  },
  {
    name: 'Midnight Navy Jersey Hijab',
    category: 'hijab',
    price: 28000,
    thumbnail_url: '/uploads/hijabs/winter-navy-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['winter_cool'],
    description: 'Midnight navy jersey hijab that delivers a sleek Winter Cool finish.',
    shopee_link: 'https://example.com/navy-hijab',
    is_active: true
  }
];
async function seedHijabs() {
  try {
    console.log('Connecting to database...');
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    // Insert hijab products
    for (const hijab of hijabProducts) {
      await pool.query(`
        INSERT INTO products (
          id, name, category, price, thumbnail_url, detail_image_urls,
          personal_colors, description, shopee_link, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        randomUUID(),
        hijab.name,
        hijab.category,
        hijab.price,
        hijab.thumbnail_url,
        hijab.detail_image_urls,
        hijab.personal_colors,
        hijab.description,
        hijab.shopee_link,
        hijab.is_active
      ]);
      console.log(`Added hijab: ${hijab.name}`);
    }
    console.log(`\nSuccessfully seeded ${hijabProducts.length} hijab products!`);
    // Verify all products
    const result = await pool.query('SELECT category, COUNT(*) FROM products GROUP BY category');
    console.log('\nProducts by category:');
    result.rows.forEach(row => {
      console.log(`${row.category}: ${row.count} products`);
    });
  } catch (error) {
    console.error('Error seeding hijabs:', error);
  } finally {
    await pool.end();
  }
}
seedHijabs();