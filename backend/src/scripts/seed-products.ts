import { db } from '../db';
import type { Product, ProductCategory, PersonalColorType } from '../types';

interface ProductFormData {
  name: string;
  category: ProductCategory;
  price: number;
  description?: string;
  thumbnailUrl: string;
  detailImageUrls: string[];
  personalColors: PersonalColorType[];
  shopeeLink: string;
  isActive: boolean;
}

const PLACEHOLDER_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

const mockProducts: ProductFormData[] = [
  // Hijab Products
  {
    name: "Satin Premium Hijab - Rose Gold",
    category: "hijab",
    price: 89000,
    description: "Hijab satin premium dengan warna rose gold yang elegan. Tekstur lembut dan tidak mudah kusut.",
    thumbnailUrl: PLACEHOLDER_IMAGE,
    detailImageUrls: [
      PLACEHOLDER_IMAGE
    ],
    personalColors: ["spring_warm", "autumn_warm"],
    shopeeLink: "https://shopee.co.id/hijab-satin-premium-rose-gold",
    isActive: true
  },
  {
    name: "Voal Ultrafine Square - Dusty Pink",
    category: "hijab",
    price: 125000,
    description: "Hijab voal ultrafine dengan ukuran 110x110cm. Warna dusty pink yang cocok untuk kulit cool tone.",
    thumbnailUrl: PLACEHOLDER_IMAGE,
    detailImageUrls: [
      PLACEHOLDER_IMAGE
    ],
    personalColors: ["summer_cool", "winter_cool"],
    shopeeLink: "https://shopee.co.id/voal-ultrafine-dusty-pink",
    isActive: true
  },
  {
    name: "Pashmina Inner Ninja - Nude Beige",
    category: "hijab",
    price: 45000,
    description: "Inner ninja dengan bahan jersey premium. Warna nude beige yang natural untuk semua tone kulit.",
    thumbnailUrl: PLACEHOLDER_IMAGE,
    detailImageUrls: [
      PLACEHOLDER_IMAGE
    ],
    personalColors: ["spring_warm", "autumn_warm", "summer_cool", "winter_cool"],
    shopeeLink: "https://shopee.co.id/pashmina-inner-nude",
    isActive: true
  },
  {
    name: "Chiffon Ceruty - Navy Blue",
    category: "hijab",
    price: 95000,
    description: "Hijab chiffon ceruty dengan tekstur yang jatuh sempurna. Navy blue untuk tampilan profesional.",
    thumbnailUrl: PLACEHOLDER_IMAGE,
    detailImageUrls: [
      PLACEHOLDER_IMAGE
    ],
    personalColors: ["winter_cool", "summer_cool"],
    shopeeLink: "https://shopee.co.id/chiffon-ceruty-navy",
    isActive: true
  },

  // Lens Products
  {
    name: "Softlens X2 Bio Color - Honey Brown",
    category: "lens",
    price: 175000,
    description: "Softlens dengan diameter 14.2mm, water content 38%. Warna honey brown natural untuk warm tone.",
    thumbnailUrl: PLACEHOLDER_IMAGE,
    detailImageUrls: [
      PLACEHOLDER_IMAGE
    ],
    personalColors: ["spring_warm", "autumn_warm"],
    shopeeLink: "https://shopee.co.id/softlens-x2-honey-brown",
    isActive: true
  },
  {
    name: "Daily Lens Aqua - Gray Pearl",
    category: "lens",
    price: 135000,
    description: "Softlens harian dengan efek natural. Gray pearl memberikan kesan mata yang lebih terang.",
    thumbnailUrl: PLACEHOLDER_IMAGE,
    detailImageUrls: [
      PLACEHOLDER_IMAGE
    ],
    personalColors: ["summer_cool", "winter_cool"],
    shopeeLink: "https://shopee.co.id/daily-lens-gray-pearl",
    isActive: true
  },
  {
    name: "Monthly Lens Premium - Hazel Green",
    category: "lens",
    price: 225000,
    description: "Softlens bulanan dengan kualitas premium. Hazel green untuk tampilan exotic yang natural.",
    thumbnailUrl: PLACEHOLDER_IMAGE,
    detailImageUrls: [
      PLACEHOLDER_IMAGE
    ],
    personalColors: ["autumn_warm"],
    shopeeLink: "https://shopee.co.id/monthly-lens-hazel-green",
    isActive: true
  },

  // Lip Products
  {
    name: "Velvet Lip Tint - Coral Crush",
    category: "lip",
    price: 68000,
    description: "Lip tint dengan hasil velvet matte. Coral crush untuk spring warm tone yang segar.",
    thumbnailUrl: PLACEHOLDER_IMAGE,
    detailImageUrls: [
      PLACEHOLDER_IMAGE
    ],
    personalColors: ["spring_warm"],
    shopeeLink: "https://shopee.co.id/velvet-lip-coral",
    isActive: true
  },
  {
    name: "Matte Liquid Lipstick - Brick Red",
    category: "lip",
    price: 125000,
    description: "Liquid lipstick dengan formula long lasting. Brick red untuk autumn warm tone yang bold.",
    thumbnailUrl: PLACEHOLDER_IMAGE,
    detailImageUrls: [
      PLACEHOLDER_IMAGE
    ],
    personalColors: ["autumn_warm"],
    shopeeLink: "https://shopee.co.id/matte-liquid-brick",
    isActive: true
  },
  {
    name: "Glossy Lip Balm - Rose Pink",
    category: "lip",
    price: 55000,
    description: "Lip balm dengan efek glossy natural. Rose pink untuk summer cool tone yang fresh.",
    thumbnailUrl: PLACEHOLDER_IMAGE,
    detailImageUrls: [
      PLACEHOLDER_IMAGE
    ],
    personalColors: ["summer_cool"],
    shopeeLink: "https://shopee.co.id/glossy-balm-rose",
    isActive: true
  },
  {
    name: "Satin Lipstick - Deep Berry",
    category: "lip",
    price: 98000,
    description: "Lipstick dengan hasil satin yang mewah. Deep berry untuk winter cool tone yang dramatis.",
    thumbnailUrl: PLACEHOLDER_IMAGE,
    detailImageUrls: [
      PLACEHOLDER_IMAGE
    ],
    personalColors: ["winter_cool"],
    shopeeLink: "https://shopee.co.id/satin-lipstick-berry",
    isActive: true
  },

  // Eyeshadow Products
  {
    name: "9-Color Palette - Warm Sunset",
    category: "blush",
    price: 185000,
    description: "Eyeshadow palette dengan 9 warna warm tone. Kombinasi matte dan shimmer untuk berbagai look.",
    thumbnailUrl: PLACEHOLDER_IMAGE,
    detailImageUrls: [
      PLACEHOLDER_IMAGE
    ],
    personalColors: ["spring_warm", "autumn_warm"],
    shopeeLink: "https://shopee.co.id/palette-warm-sunset",
    isActive: true
  },
  {
    name: "Duo Chrome Shadow - Aurora Pink",
    category: "blush",
    price: 75000,
    description: "Eyeshadow duo chrome dengan efek color shifting. Aurora pink untuk tampilan dreamy.",
    thumbnailUrl: PLACEHOLDER_IMAGE,
    detailImageUrls: [
      PLACEHOLDER_IMAGE
    ],
    personalColors: ["spring_warm", "summer_cool"],
    shopeeLink: "https://shopee.co.id/duo-chrome-aurora",
    isActive: true
  },
  {
    name: "Matte Quad Palette - Cool Mauve",
    category: "blush",
    price: 145000,
    description: "Quad palette dengan 4 warna matte cool tone. Perfect untuk daily makeup yang elegant.",
    thumbnailUrl: PLACEHOLDER_IMAGE,
    detailImageUrls: [
      PLACEHOLDER_IMAGE
    ],
    personalColors: ["summer_cool", "winter_cool"],
    shopeeLink: "https://shopee.co.id/quad-palette-mauve",
    isActive: true
  },
  {
    name: "Glitter Topper - Ice Crystal",
    category: "blush",
    price: 65000,
    description: "Glitter topper dengan partikel halus. Ice crystal untuk efek glamour yang stunning.",
    thumbnailUrl: PLACEHOLDER_IMAGE,
    detailImageUrls: [
      PLACEHOLDER_IMAGE
    ],
    personalColors: ["winter_cool"],
    shopeeLink: "https://shopee.co.id/glitter-ice-crystal",
    isActive: true
  }
];

// Strip external image sources (Unsplash) for seeds; use data URI placeholder
const seededProducts: ProductFormData[] = mockProducts.map((p) => ({
  ...p,
  thumbnailUrl: PLACEHOLDER_IMAGE,
  detailImageUrls: (p.detailImageUrls || []).map(() => PLACEHOLDER_IMAGE)
}));

export async function seedProducts() {
  console.log('🌱 Seeding products...');
  
  if (!db.createProduct || !db.deleteAllProducts) {
    console.error('❌ Product methods not available in database');
    return false;
  }

  try {
    // Clear existing products first
    console.log('🗑️  Clearing existing products...');
    await db.deleteAllProducts();
    
    // Add mock products
    let successCount = 0;
    for (const productData of seededProducts) {
      try {
        const product = await db.createProduct(productData);
        console.log(`✅ Created product: ${product.name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create product: ${productData.name}`, error);
      }
    }
    
    console.log(`\n🎉 Successfully seeded ${successCount} products!`);
    return successCount > 0;
  } catch (error) {
    console.error('❌ Failed to seed products:', error);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  seedProducts().then(() => {
    console.log('✅ Seeding completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}
