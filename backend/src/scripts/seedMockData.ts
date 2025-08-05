import dotenv from 'dotenv';
dotenv.config();

import { db } from '../db';
import type { Product, Content } from '../types';

const mockProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Hijab Products
  {
    name: 'Spring Coral Hijab',
    description: 'Perfect coral shade for Spring Warm personal color. Made from premium chiffon material.',
    category: 'hijab',
    price: 89000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1554811987-e9cf588e2124?w=400',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1590038767624-dac5740a997b?w=800',
      'https://images.unsplash.com/photo-1597308680537-7e0a0d64d6e1?w=800'
    ],
    shopeeLink: 'https://shopee.co.id/SpringCoralHijab',
    personalColors: ['spring_warm'],
    isActive: true
  },
  {
    name: 'Summer Sky Blue Hijab',
    description: 'Elegant sky blue hijab ideal for Summer Cool tone. Lightweight and breathable.',
    category: 'hijab',
    price: 95000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1590038767624-dac5740a997b?w=400',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1554811987-e9cf588e2124?w=800'
    ],
    shopeeLink: 'https://shopee.co.id/SummerSkyHijab',
    personalColors: ['summer_cool'],
    isActive: true
  },
  {
    name: 'Autumn Burnt Orange Hijab',
    description: 'Rich burnt orange color perfect for Autumn Warm skin tone. Premium cotton blend.',
    category: 'hijab',
    price: 105000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1603924812553-0dceb5cf7c04?w=400',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1597308680537-7e0a0d64d6e1?w=800'
    ],
    shopeeLink: 'https://shopee.co.id/AutumnOrangeHijab',
    personalColors: ['autumn_warm'],
    isActive: true
  },
  {
    name: 'Winter Deep Burgundy Hijab',
    description: 'Sophisticated deep burgundy shade for Winter Cool. Luxurious satin finish.',
    category: 'hijab',
    price: 115000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1597308680537-7e0a0d64d6e1?w=400',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1603924812553-0dceb5cf7c04?w=800'
    ],
    shopeeLink: 'https://shopee.co.id/WinterBurgundyHijab',
    personalColors: ['winter_cool'],
    isActive: true
  },
  {
    name: 'Multi-Season Neutral Beige Hijab',
    description: 'Versatile beige hijab that complements multiple personal colors.',
    category: 'hijab',
    price: 85000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1586716402203-79219bede43c?w=400',
    detailImageUrls: [],
    shopeeLink: 'https://shopee.co.id/NeutralBeigeHijab',
    personalColors: ['spring_warm', 'autumn_warm'],
    isActive: true
  },

  // Lens Products
  {
    name: 'Spring Hazel Contact Lens',
    description: 'Natural hazel brown lens perfect for Spring Warm personal color.',
    category: 'lens',
    price: 125000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1583248369069-9d91f1640fe6?w=400',
    detailImageUrls: [],
    shopeeLink: 'https://shopee.co.id/SpringHazelLens',
    personalColors: ['spring_warm'],
    isActive: true
  },
  {
    name: 'Summer Gray Contact Lens',
    description: 'Soft gray lens ideal for Summer Cool tone. Monthly disposable.',
    category: 'lens',
    price: 135000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=400',
    detailImageUrls: [],
    shopeeLink: 'https://shopee.co.id/SummerGrayLens',
    personalColors: ['summer_cool'],
    isActive: true
  },
  {
    name: 'Autumn Amber Contact Lens',
    description: 'Warm amber lens perfect for Autumn Warm skin tone.',
    category: 'lens',
    price: 130000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=400',
    detailImageUrls: [],
    shopeeLink: 'https://shopee.co.id/AutumnAmberLens',
    personalColors: ['autumn_warm'],
    isActive: true
  },

  // Lip Products
  {
    name: 'Spring Coral Lip Tint',
    description: 'Fresh coral lip tint perfect for Spring Warm tone. Long-lasting formula.',
    category: 'lip',
    price: 65000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1560421683-6856ea585c78?w=400',
    detailImageUrls: [],
    shopeeLink: 'https://shopee.co.id/SpringCoralLip',
    personalColors: ['spring_warm'],
    isActive: true
  },
  {
    name: 'Summer Rose Pink Lipstick',
    description: 'Soft rose pink shade ideal for Summer Cool personal color.',
    category: 'lip',
    price: 75000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    detailImageUrls: [],
    shopeeLink: 'https://shopee.co.id/SummerRoseLip',
    personalColors: ['summer_cool'],
    isActive: true
  },
  {
    name: 'Winter Berry Red Lipstick',
    description: 'Bold berry red perfect for Winter Cool tone. Matte finish.',
    category: 'lip',
    price: 85000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1547887538-047f814bfb64?w=400',
    detailImageUrls: [],
    shopeeLink: 'https://shopee.co.id/WinterBerryLip',
    personalColors: ['winter_cool'],
    isActive: true
  },

  // Eyeshadow Products
  {
    name: 'Spring Peach Eyeshadow Palette',
    description: 'Warm peach tones perfect for Spring Warm personal color.',
    category: 'eyeshadow',
    price: 145000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
    detailImageUrls: [],
    shopeeLink: 'https://shopee.co.id/SpringPeachPalette',
    personalColors: ['spring_warm'],
    isActive: true
  },
  {
    name: 'Autumn Bronze Eyeshadow Palette',
    description: 'Rich bronze and copper shades for Autumn Warm tone.',
    category: 'eyeshadow',
    price: 155000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1583241800698-e8ab01830cc7?w=400',
    detailImageUrls: [],
    shopeeLink: 'https://shopee.co.id/AutumnBronzePalette',
    personalColors: ['autumn_warm'],
    isActive: true
  },
  {
    name: 'Winter Cool Tones Eyeshadow Palette',
    description: 'Cool-toned purples and grays for Winter Cool personal color.',
    category: 'eyeshadow',
    price: 165000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1551392505-f4056032826e?w=400',
    detailImageUrls: [],
    shopeeLink: 'https://shopee.co.id/WinterCoolPalette',
    personalColors: ['winter_cool'],
    isActive: true
  }
];

const mockContents: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>[] = [
  {
    title: 'Understanding Your Personal Color Season',
    slug: 'understanding-personal-color-season',
    content: `<h1>Understanding Your Personal Color Season</h1>
<p>Personal color analysis is a system that helps you discover which colors complement your natural skin tone, hair color, and eye color. By understanding your personal color season, you can make more informed choices about hijab colors, makeup, and accessories.</p>
<h2>The Four Seasons</h2>
<h3>Spring Warm</h3>
<p>Spring types have warm undertones with fresh, clear coloring. They look best in warm, bright colors like coral, peach, and golden yellows.</p>
<h3>Summer Cool</h3>
<p>Summer types have cool undertones with soft, muted coloring. They shine in cool, soft colors like powder blue, lavender, and dusty rose.</p>
<h3>Autumn Warm</h3>
<p>Autumn types have warm undertones with rich, deep coloring. They look stunning in warm, earthy colors like rust, olive green, and golden brown.</p>
<h3>Winter Cool</h3>
<p>Winter types have cool undertones with high contrast coloring. They look best in cool, bold colors like true red, emerald green, and deep purple.</p>`,
    excerpt: 'Learn about the four personal color seasons and how to identify yours.',
    category: 'tutorial',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
    status: 'published',
    tags: ['personal color', 'color analysis', 'seasonal color'],
    metaDescription: 'Discover your personal color season and learn which hijab colors suit you best.',
    metaKeywords: 'personal color, color analysis, hijab colors'
  },
  {
    title: 'How to Choose the Perfect Hijab Color for Your Skin Tone',
    slug: 'choose-hijab-color-skin-tone',
    content: `<h1>How to Choose the Perfect Hijab Color for Your Skin Tone</h1>
<p>Choosing the right hijab color can enhance your natural beauty and make you feel more confident. Here's a comprehensive guide to help you select the perfect hijab colors based on your skin tone.</p>
<h2>Step 1: Identify Your Undertone</h2>
<p>Look at the veins on your wrist. If they appear green, you have warm undertones. If they appear blue or purple, you have cool undertones.</p>
<h2>Step 2: Consider Your Personal Color Season</h2>
<p>Once you know your undertone, you can determine your personal color season and choose hijab colors accordingly.</p>
<h2>Best Hijab Colors by Season</h2>
<ul>
<li><strong>Spring Warm:</strong> Coral, peach, warm pink, light orange</li>
<li><strong>Summer Cool:</strong> Powder blue, lavender, soft pink, mint green</li>
<li><strong>Autumn Warm:</strong> Rust, olive, burnt orange, mustard yellow</li>
<li><strong>Winter Cool:</strong> True red, royal blue, emerald green, deep purple</li>
</ul>`,
    excerpt: 'A comprehensive guide to selecting hijab colors that complement your skin tone.',
    category: 'color_guide',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554811987-e9cf588e2124?w=800',
    status: 'published',
    tags: ['hijab', 'color selection', 'skin tone'],
    metaDescription: 'Find the perfect hijab colors for your skin tone with our expert guide.',
    metaKeywords: 'hijab colors, skin tone, color guide'
  },
  {
    title: 'Top 5 Hijab Trends for 2025',
    slug: 'hijab-trends-2025',
    content: `<h1>Top 5 Hijab Trends for 2025</h1>
<p>Stay ahead of the fashion curve with these trending hijab styles and colors for 2025.</p>
<h2>1. Personalized Color Palettes</h2>
<p>More women are embracing their personal color seasons and choosing hijabs that complement their natural coloring.</p>
<h2>2. Sustainable Materials</h2>
<p>Eco-friendly fabrics like bamboo and organic cotton are becoming increasingly popular.</p>
<h2>3. Minimalist Neutrals</h2>
<p>Sophisticated neutral tones that work across multiple seasons are trending.</p>
<h2>4. Bold Monochromatic Looks</h2>
<p>Wearing hijabs in the same color family as your outfit creates a cohesive, elegant look.</p>
<h2>5. Tech-Enhanced Fabrics</h2>
<p>Moisture-wicking and temperature-regulating hijabs are gaining popularity.</p>`,
    excerpt: 'Discover the latest hijab trends and styles for 2025.',
    category: 'trend',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590038767624-dac5740a997b?w=800',
    status: 'published',
    tags: ['trends', 'fashion', '2025'],
    metaDescription: 'Explore the top hijab trends for 2025 including colors, styles, and materials.',
    metaKeywords: 'hijab trends, 2025 fashion, hijab styles'
  }
];

async function seedMockData() {
  try {
    console.log('🌱 Starting to seed mock data...');

    // Clear existing data
    if (db.clearAllData) {
      await db.clearAllData();
      console.log('✅ Cleared existing data');
    }

    // Create products
    console.log('📦 Creating products...');
    for (const productData of mockProducts) {
      if (db.createProduct) {
        const product = await db.createProduct(productData);
        console.log(`  ✅ Created product: ${product.name}`);
      }
    }
    console.log(`✅ Created ${mockProducts.length} products`);

    // Create contents
    console.log('📄 Creating contents...');
    for (const contentData of mockContents) {
      if (db.createContent) {
        const content = await db.createContent(contentData);
        console.log(`  ✅ Created content: ${content.title}`);
      }
    }
    console.log(`✅ Created ${mockContents.length} contents`);

    // Create a test user for development
    console.log('👤 Creating test user...');
    if (db.createUser) {
      // Hash for 'test1234'
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('test1234', 10);
      const testUser = await db.createUser({
        email: 'test@example.com',
        passwordHash: hashedPassword,
        fullName: 'Test User',
        emailVerified: true
      });
      console.log(`✅ Created test user: ${testUser.email}`);
    }

    console.log('\n🎉 Mock data seeding completed successfully!');
    console.log('📌 You can now:');
    console.log('   - View products at http://localhost:8081/products');
    console.log('   - Login with test@example.com');
    console.log('   - Access admin panel at http://localhost:8081/admin/login (API Key: 1234)');

  } catch (error) {
    console.error('❌ Error seeding mock data:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedMockData().then(() => {
  console.log('\n✅ All done! Exiting...');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});