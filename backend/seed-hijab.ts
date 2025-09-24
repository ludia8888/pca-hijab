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
  // 봄 웜 (Spring Warm) - Coral, Peach, Light Brown tones
  {
    name: 'Soft Coral Chiffon Hijab',
    category: 'hijab',
    price: 25000,
    thumbnail_url: '/uploads/hijabs/spring-coral-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['spring_warm'],
    description: '부드러운 코랄 컬러의 시폰 히잡으로 봄 웜톤에 완벽하게 어울립니다',
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
    description: '피치 블로썸 컬러의 새틴 히잡으로 화사한 봄 웜톤을 연출',
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
    description: '라이트 카멜 컬러의 저지 히잡으로 데일리로 착용하기 좋습니다',
    shopee_link: 'https://example.com/camel-hijab',
    is_active: true
  },
  // 여름 쿨 (Summer Cool) - Soft Pink, Lavender, Light Blue tones
  {
    name: 'Rose Quartz Modal Hijab',
    category: 'hijab',
    price: 26000,
    thumbnail_url: '/uploads/hijabs/summer-rose-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['summer_cool'],
    description: '로즈 쿼츠 컬러의 모달 히잡으로 여름 쿨톤에 청량감을 더합니다',
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
    description: '라벤더 미스트 컬러의 시폰 히잡으로 우아한 여름 쿨톤 연출',
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
    description: '파우더 블루 컬러의 코튼 히잡으로 시원한 여름 쿨톤 스타일',
    shopee_link: 'https://example.com/blue-hijab',
    is_active: true
  },
  // 가을 웜 (Autumn Warm) - Burnt Orange, Deep Brown, Khaki tones
  {
    name: 'Burnt Sienna Wool Hijab',
    category: 'hijab',
    price: 32000,
    thumbnail_url: '/uploads/hijabs/autumn-sienna-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['autumn_warm'],
    description: '번트 시에나 컬러의 울 히잡으로 가을 웜톤의 깊이감을 표현',
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
    description: '초콜릿 브라운 컬러의 비스코스 히잡으로 가을 웜톤에 풍부함을 더합니다',
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
    description: '올리브 카키 컬러의 린넨 히잡으로 자연스러운 가을 웜톤 연출',
    shopee_link: 'https://example.com/olive-hijab',
    is_active: true
  },
  // 겨울 쿨 (Winter Cool) - Deep Pink, Burgundy, Navy tones
  {
    name: 'Fuchsia Pink Satin Hijab',
    category: 'hijab',
    price: 31000,
    thumbnail_url: '/uploads/hijabs/winter-fuchsia-hijab.jpg',
    detail_image_urls: [],
    personal_colors: ['winter_cool'],
    description: '퓨샤 핑크 컬러의 새틴 히잡으로 겨울 쿨톤의 화려함을 표현',
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
    description: '버건디 컬러의 벨벳 히잡으로 고급스러운 겨울 쿨톤 스타일',
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
    description: '미드나이트 네이비 컬러의 저지 히잡으로 세련된 겨울 쿨톤 연출',
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