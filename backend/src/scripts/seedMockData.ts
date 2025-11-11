import dotenv from 'dotenv';
dotenv.config();

import { db } from '../db';
import type { Product, Content, ProductCategory, ContentCategory, ContentStatus, PersonalColorType } from '../types';

const mockProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Premium Hijabs
  {
    name: 'Premium Chiffon Hijab - Rose Gold',
    description: 'Lightweight and breathable chiffon hijab with subtle shimmer. Perfect for warm undertones and special occasions. Features premium quality fabric that drapes beautifully.',
    category: 'hijab' as ProductCategory,
    price: 89000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1590038767624-dac5740a997b?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1590038767624-dac5740a997b?w=800&q=80',
      'https://images.unsplash.com/photo-1597308680537-7e0a0d64d6e1?w=800&q=80',
      'https://images.unsplash.com/photo-1554811987-e9cf588e2124?w=800&q=80'
    ],
    personalColors: ['spring_warm', 'autumn_warm'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Premium-Chiffon-Hijab-Rose-Gold-i.123456789.987654321',
    isActive: true
  },
  {
    name: 'Silk Square Hijab - Navy Blue',
    description: 'Luxurious 100% silk square hijab with elegant drape. Perfect for formal occasions and professional settings. Cool-toned navy complements winter and summer types.',
    category: 'hijab' as ProductCategory,
    price: 135000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1552874869-5c39ec9288dc?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1552874869-5c39ec9288dc?w=800&q=80',
      'https://images.unsplash.com/photo-1586083702768-190ae093d34d?w=800&q=80'
    ],
    personalColors: ['winter_cool', 'summer_cool'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Silk-Square-Hijab-Navy-Blue-i.123456789.987654322',
    isActive: true
  },
  {
    name: 'Cotton Everyday Hijab - Dusty Pink',
    description: 'Soft and comfortable cotton hijab for daily wear. The muted dusty pink shade is perfect for spring types. Easy to style and maintain.',
    category: 'hijab' as ProductCategory,
    price: 65000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&q=80',
      'https://images.unsplash.com/photo-1603924812553-0dceb5cf7c04?w=800&q=80'
    ],
    personalColors: ['spring_warm'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Cotton-Everyday-Hijab-Dusty-Pink-i.123456789.987654323',
    isActive: true
  },
  {
    name: 'Jersey Sport Hijab - Black',
    description: 'Stretchable jersey material perfect for active lifestyle. Moisture-wicking, quick-dry, and stays in place during activities. Universal black suits all color types.',
    category: 'hijab' as ProductCategory,
    price: 55000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1586083702768-190ae093d34d?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1586083702768-190ae093d34d?w=800&q=80'
    ],
    personalColors: ['spring_warm', 'summer_cool', 'autumn_warm', 'winter_cool'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Jersey-Sport-Hijab-Black-i.123456789.987654324',
    isActive: true
  },
  {
    name: 'Satin Luxury Hijab - Emerald Green',
    description: 'Glossy satin hijab with rich color depth. The jewel-toned emerald is ideal for winter types and creates a luxurious look for special events.',
    category: 'hijab' as ProductCategory,
    price: 145000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80'
    ],
    personalColors: ['winter_cool', 'autumn_warm'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Satin-Luxury-Hijab-Emerald-Green-i.123456789.987654325',
    isActive: true
  },

  // Accessories
  {
    name: 'Pearl Hijab Pin Set',
    description: 'Elegant pearl hijab pins with gold-plated base. Set of 5 decorative pins perfect for securing and beautifying your hijab.',
    category: 'hijab' as ProductCategory,
    price: 35000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'
    ],
    personalColors: ['spring_warm', 'summer_cool', 'autumn_warm', 'winter_cool'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Pearl-Hijab-Pin-Set-i.123456789.987654326',
    isActive: true
  },
  {
    name: 'Magnetic Hijab Clips - Rose Gold',
    description: 'Strong magnetic hijab clips that hold fabric securely without pins. Rose gold finish complements warm undertones.',
    category: 'hijab' as ProductCategory,
    price: 45000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80'
    ],
    personalColors: ['spring_warm', 'autumn_warm'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Magnetic-Hijab-Clips-Rose-Gold-i.123456789.987654327',
    isActive: true
  },

  // Color Lenses
  {
    name: 'Natural Hazel Contact Lenses',
    description: 'Monthly disposable colored contact lenses in natural hazel. Perfect for warm-toned individuals looking to enhance their eye color.',
    category: 'lens' as ProductCategory,
    price: 150000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&q=80'
    ],
    personalColors: ['spring_warm', 'autumn_warm'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Natural-Hazel-Contact-Lenses-i.123456789.987654328',
    isActive: true
  },
  {
    name: 'Cool Gray Contact Lenses',
    description: 'Subtle gray contact lenses that complement cool undertones. Creates a sophisticated look for winter and summer types.',
    category: 'lens' as ProductCategory,
    price: 155000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&q=80'
    ],
    personalColors: ['winter_cool', 'summer_cool'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Cool-Gray-Contact-Lenses-i.123456789.987654329',
    isActive: true
  },

  // Lip Products
  {
    name: 'Matte Lipstick - Coral Crush',
    description: 'Long-lasting matte lipstick in a vibrant coral shade. Perfect for spring types with warm undertones. Moisturizing formula prevents drying.',
    category: 'lip' as ProductCategory,
    price: 75000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80'
    ],
    personalColors: ['spring_warm'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Matte-Lipstick-Coral-Crush-i.123456789.987654330',
    isActive: true
  },
  {
    name: 'Velvet Lip Tint - Berry Kiss',
    description: 'Lightweight velvet lip tint in deep berry shade. Ideal for winter types who want a bold lip color with comfortable wear.',
    category: 'lip' as ProductCategory,
    price: 65000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=800&q=80'
    ],
    personalColors: ['winter_cool'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Velvet-Lip-Tint-Berry-Kiss-i.123456789.987654331',
    isActive: true
  },
  {
    name: 'Glossy Lip Oil - Rose Petal',
    description: 'Nourishing lip oil with subtle rose tint. Perfect for summer types who prefer a natural, glossy finish.',
    category: 'lip' as ProductCategory,
    price: 55000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1560207434-b14b8496bf6f?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1560207434-b14b8496bf6f?w=800&q=80'
    ],
    personalColors: ['summer_cool'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Glossy-Lip-Oil-Rose-Petal-i.123456789.987654332',
    isActive: true
  },
  {
    name: 'Cream Lipstick - Autumn Spice',
    description: 'Creamy lipstick in warm terracotta shade. Perfect autumn color with comfortable wear and buildable coverage.',
    category: 'lip' as ProductCategory,
    price: 70000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800&q=80'
    ],
    personalColors: ['autumn_warm'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Cream-Lipstick-Autumn-Spice-i.123456789.987654333',
    isActive: true
  },

  // Eyeshadow Palettes
  {
    name: 'Spring Garden Eyeshadow Palette',
    description: '12-shade eyeshadow palette with warm peach, coral, and golden tones. Perfect for creating fresh spring looks.',
    category: 'eyeshadow' as ProductCategory,
    price: 185000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80'
    ],
    personalColors: ['spring_warm'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Spring-Garden-Eyeshadow-Palette-i.123456789.987654334',
    isActive: true
  },
  {
    name: 'Summer Breeze Eyeshadow Palette',
    description: '9-shade palette featuring soft pastels and cool-toned neutrals. Ideal for creating subtle summer eye looks.',
    category: 'eyeshadow' as ProductCategory,
    price: 165000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1631730486784-74b517e72b75?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1631730486784-74b517e72b75?w=800&q=80'
    ],
    personalColors: ['summer_cool'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Summer-Breeze-Eyeshadow-Palette-i.123456789.987654335',
    isActive: true
  },
  {
    name: 'Autumn Sunset Eyeshadow Palette',
    description: '15-shade palette with rich browns, burnt oranges, and deep reds. Perfect for creating warm, dramatic eye looks.',
    category: 'eyeshadow' as ProductCategory,
    price: 195000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1609207825181-52d3214556dd?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1609207825181-52d3214556dd?w=800&q=80'
    ],
    personalColors: ['autumn_warm'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Autumn-Sunset-Eyeshadow-Palette-i.123456789.987654336',
    isActive: true
  },
  {
    name: 'Winter Nights Eyeshadow Palette',
    description: '12-shade palette featuring jewel tones and cool metallics. Creates striking looks for winter color types.',
    category: 'eyeshadow' as ProductCategory,
    price: 175000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?w=800&q=80'
    ],
    personalColors: ['winter_cool'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Winter-Nights-Eyeshadow-Palette-i.123456789.987654337',
    isActive: true
  },
  {
    name: 'Universal Nude Eyeshadow Palette',
    description: 'Versatile 8-shade nude palette with matte and shimmer finishes. Suitable for all personal color types.',
    category: 'eyeshadow' as ProductCategory,
    price: 145000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=800&q=80'
    ],
    personalColors: ['spring_warm', 'summer_cool', 'autumn_warm', 'winter_cool'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Universal-Nude-Eyeshadow-Palette-i.123456789.987654338',
    isActive: true
  },
  {
    name: 'Glitter Topper Set - All Seasons',
    description: 'Set of 4 glitter toppers in gold, rose gold, silver, and bronze. Perfect for adding sparkle to any eye look.',
    category: 'eyeshadow' as ProductCategory,
    price: 95000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=800&q=80'
    ],
    personalColors: ['spring_warm', 'summer_cool', 'autumn_warm', 'winter_cool'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Glitter-Topper-Set-All-Seasons-i.123456789.987654339',
    isActive: true
  },
  {
    name: 'Monochrome Eyeshadow Duo - Mauve',
    description: 'Two-shade compact with matte and shimmer mauve tones. Perfect for quick, elegant eye looks for cool-toned individuals.',
    category: 'eyeshadow' as ProductCategory,
    price: 85000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1583241800879-6bb7d116fd36?w=400&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1583241800879-6bb7d116fd36?w=800&q=80'
    ],
    personalColors: ['summer_cool', 'winter_cool'] as PersonalColorType[],
    shopeeLink: 'https://shopee.co.id/Monochrome-Eyeshadow-Duo-Mauve-i.123456789.987654340',
    isActive: true
  }
];

const mockContents: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>[] = [
  {
    title: 'The Complete Guide to Personal Color Analysis for Hijabis',
    subtitle: 'Discover your perfect hijab colors based on your skin tone',
    slug: 'complete-guide-personal-color-analysis-hijabis',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590038767624-dac5740a997b?w=800&q=80',
    content: `
      <article class="prose prose-lg max-w-none">
        <h1>The Complete Guide to Personal Color Analysis for Hijabis</h1>
        
        <p class="lead">Understanding your personal color can transform how you choose hijabs and makeup. This comprehensive guide will help you discover which colors make you glow and which ones to avoid.</p>

        <h2>What is Personal Color Analysis?</h2>
        
        <p>Personal color analysis is a system that helps identify which colors harmonize best with your natural coloring - your skin tone, eye color, and hair color. For hijabis, this knowledge is especially valuable as the hijab frames your face every day.</p>

        <h3>The Four Seasons System</h3>
        
        <p>The most common personal color system divides people into four seasonal categories:</p>
        
        <ul>
          <li><strong>Spring (Warm & Light):</strong> Clear, warm undertones with golden or peachy skin</li>
          <li><strong>Summer (Cool & Soft):</strong> Cool undertones with pink or rosy skin</li>
          <li><strong>Autumn (Warm & Deep):</strong> Warm undertones with golden or bronze skin</li>
          <li><strong>Winter (Cool & Bright):</strong> Cool undertones with contrast between features</li>
        </ul>

        <h2>How to Determine Your Season</h2>
        
        <h3>Step 1: Check Your Undertone</h3>
        
        <p>Look at the veins on your inner wrist:</p>
        <ul>
          <li>Green veins = Warm undertone (Spring or Autumn)</li>
          <li>Blue/Purple veins = Cool undertone (Summer or Winter)</li>
          <li>Mix of both = Neutral (could be any season)</li>
        </ul>

        <h3>Step 2: Consider Your Natural Coloring</h3>
        
        <p>Examine your natural hair color (if visible), eye color, and skin tone together. Look for patterns:</p>
        <ul>
          <li>High contrast between features = Winter</li>
          <li>Low contrast, soft features = Summer</li>
          <li>Golden, warm tones throughout = Spring or Autumn</li>
          <li>Depth and richness = Autumn or Winter</li>
        </ul>

        <h2>Best Hijab Colors for Each Season</h2>
        
        <h3>Spring</h3>
        <p>Springs look best in clear, warm colors:</p>
        <ul>
          <li>Coral, peach, warm pink</li>
          <li>Ivory, cream, warm beige</li>
          <li>Light aqua, turquoise</li>
          <li>Golden yellow, warm green</li>
        </ul>
        
        <h3>Summer</h3>
        <p>Summers shine in soft, cool colors:</p>
        <ul>
          <li>Powder blue, lavender</li>
          <li>Rose pink, dusty rose</li>
          <li>Soft gray, dove gray</li>
          <li>Mauve, periwinkle</li>
        </ul>
        
        <h3>Autumn</h3>
        <p>Autumns look stunning in rich, warm colors:</p>
        <ul>
          <li>Burnt orange, terracotta</li>
          <li>Olive green, moss</li>
          <li>Camel, chocolate brown</li>
          <li>Rust, golden yellow</li>
        </ul>
        
        <h3>Winter</h3>
        <p>Winters are enhanced by bold, cool colors:</p>
        <ul>
          <li>True red, burgundy</li>
          <li>Royal blue, navy</li>
          <li>Pure white, black</li>
          <li>Emerald green, hot pink</li>
        </ul>

        <h2>Makeup Tips for Your Season</h2>
        
        <p>Your personal color extends beyond hijabs to makeup choices:</p>
        
        <h3>Foundation</h3>
        <p>Choose foundation with the right undertone - warm for Spring/Autumn, cool for Summer/Winter.</p>
        
        <h3>Lipstick</h3>
        <ul>
          <li><strong>Spring:</strong> Coral, peach, warm pink</li>
          <li><strong>Summer:</strong> Rose, berry, mauve</li>
          <li><strong>Autumn:</strong> Brick red, terracotta, brown</li>
          <li><strong>Winter:</strong> True red, burgundy, fuchsia</li>
        </ul>
        
        <h3>Eyeshadow</h3>
        <p>Stay within your seasonal palette for the most harmonious look, but don't be afraid to experiment with neutrals from your palette.</p>

        <h2>Common Mistakes to Avoid</h2>
        
        <ol>
          <li><strong>Wearing the wrong white:</strong> Cool types should wear pure white, warm types look better in ivory or cream</li>
          <li><strong>Ignoring undertones:</strong> Even "neutral" colors have undertones that can clash with your coloring</li>
          <li><strong>Following trends blindly:</strong> Not every trending color will suit your personal color</li>
          <li><strong>Wearing too many colors:</strong> Stick to 2-3 colors from your palette for a cohesive look</li>
        </ol>

        <h2>Building Your Hijab Wardrobe</h2>
        
        <p>Start with these essentials in your seasonal colors:</p>
        <ul>
          <li>3-5 everyday hijabs in your best neutrals</li>
          <li>2-3 hijabs in your power colors</li>
          <li>1-2 special occasion hijabs in your most flattering shades</li>
          <li>Underscarves in nude tones that match your skin</li>
        </ul>

        <h2>Conclusion</h2>
        
        <p>Understanding your personal color is a journey of self-discovery that can boost your confidence and simplify your daily choices. Remember, these are guidelines, not rules - the most important thing is that you feel beautiful and confident in what you wear.</p>
        
        <p>Take our AI-powered personal color analysis to discover your season and get personalized hijab recommendations tailored just for you!</p>
      </article>
    `,
    excerpt: 'Understanding your personal color can transform how you choose hijabs and makeup. This comprehensive guide will help you discover which colors make you glow.',
    category: 'color_guide' as ContentCategory,
    tags: ['personal-color', 'hijab', 'color-analysis', 'fashion', 'beauty'],
    status: 'published' as ContentStatus,
    publishedAt: new Date('2024-01-15'),
    metaDescription: 'Discover your personal color season and find the perfect hijab colors for your skin tone with our comprehensive guide.',
    metaKeywords: 'personal color, hijab colors, color analysis, skin tone, seasonal color analysis'
  },
  {
    title: '10 Hijab Styling Techniques Every Woman Should Know',
    subtitle: 'Master these essential hijab styles for any occasion',
    slug: '10-hijab-styling-techniques',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554811987-e9cf588e2124?w=800&q=80',
    content: `
      <article class="prose prose-lg max-w-none">
        <h1>10 Hijab Styling Techniques Every Woman Should Know</h1>
        
        <p class="lead">From everyday casual looks to elegant formal styles, mastering these hijab techniques will give you versatility and confidence in your styling choices.</p>

        <h2>1. The Classic Wrap</h2>
        
        <p>The foundation of all hijab styles, the classic wrap is timeless and versatile.</p>
        
        <h3>How to achieve it:</h3>
        <ol>
          <li>Place the hijab on your head with one side longer than the other</li>
          <li>Pin the shorter side near your temple</li>
          <li>Wrap the longer side around your head</li>
          <li>Pin at the opposite temple or let it drape</li>
        </ol>
        
        <p><strong>Best for:</strong> Daily wear, work, casual outings</p>
        <p><strong>Face shapes:</strong> All face shapes</p>

        <h2>2. The Turkish Style</h2>
        
        <p>A sophisticated square scarf style that frames the face beautifully.</p>
        
        <h3>Steps:</h3>
        <ol>
          <li>Fold a square scarf diagonally</li>
          <li>Place the fold at your forehead</li>
          <li>Tie the two ends under your chin</li>
          <li>Take the remaining fabric and wrap around your neck</li>
        </ol>
        
        <p><strong>Best for:</strong> Formal events, professional settings</p>
        <p><strong>Face shapes:</strong> Oval, heart-shaped faces</p>

        <h2>3. The Side Swept Style</h2>
        
        <p>Modern and chic, this asymmetrical style adds visual interest.</p>
        
        <h3>Technique:</h3>
        <ol>
          <li>Start with one side significantly longer</li>
          <li>Pin the short side behind your ear</li>
          <li>Sweep the long side across your chest</li>
          <li>Pin at the shoulder for a cascading effect</li>
        </ol>
        
        <p><strong>Best for:</strong> Special occasions, photoshoots</p>
        <p><strong>Face shapes:</strong> Round, square faces</p>

        <h2>4. The Turban Wrap</h2>
        
        <p>A trendy, voluminous style that makes a fashion statement.</p>
        
        <h3>Method:</h3>
        <ol>
          <li>Use an underscarf or volumizing scrunchie</li>
          <li>Wrap the hijab around your head multiple times</li>
          <li>Twist the fabric as you wrap for texture</li>
          <li>Tuck the end neatly</li>
        </ol>
        
        <p><strong>Best for:</strong> Fashion events, creative settings</p>
        <p><strong>Face shapes:</strong> Long, oval faces</p>

        <h2>5. The Loose and Flowy</h2>
        
        <p>Effortless and comfortable, perfect for a relaxed look.</p>
        
        <h3>How to style:</h3>
        <ol>
          <li>Drape the hijab loosely over your head</li>
          <li>Pin only at the chin area</li>
          <li>Let the fabric flow naturally</li>
          <li>Adjust for desired coverage</li>
        </ol>
        
        <p><strong>Best for:</strong> Casual days, hot weather</p>
        <p><strong>Face shapes:</strong> All face shapes</p>

        <h2>6. The Chest Coverage Style</h2>
        
        <p>Provides maximum coverage while maintaining elegance.</p>
        
        <h3>Steps:</h3>
        <ol>
          <li>Use a longer hijab</li>
          <li>Wrap once around your head</li>
          <li>Bring both ends to the front</li>
          <li>Cross over your chest and pin at shoulders</li>
        </ol>
        
        <p><strong>Best for:</strong> Formal occasions, religious events</p>
        <p><strong>Face shapes:</strong> All face shapes</p>

        <h2>7. The Layered Look</h2>
        
        <p>Creates dimension and allows for color play.</p>
        
        <h3>Technique:</h3>
        <ol>
          <li>Start with a neutral underscarf</li>
          <li>Add a complementary colored hijab</li>
          <li>Layer a lighter, sheer fabric on top</li>
          <li>Pin strategically to show all layers</li>
        </ol>
        
        <p><strong>Best for:</strong> Special events, creative expression</p>
        <p><strong>Face shapes:</strong> Best for oval, heart-shaped faces</p>

        <h2>8. The Knotted Style</h2>
        
        <p>Adds interesting detail without pins.</p>
        
        <h3>Method:</h3>
        <ol>
          <li>Drape hijab with equal sides</li>
          <li>Tie a loose knot at the side of your neck</li>
          <li>Adjust the knot position</li>
          <li>Style the remaining fabric</li>
        </ol>
        
        <p><strong>Best for:</strong> Casual outings, young professionals</p>
        <p><strong>Face shapes:</strong> Round, square faces</p>

        <h2>9. The Braided Crown</h2>
        
        <p>Incorporates braided details for a romantic look.</p>
        
        <h3>How to achieve:</h3>
        <ol>
          <li>Create a loose braid with part of the hijab</li>
          <li>Wrap the braid across your crown</li>
          <li>Pin securely</li>
          <li>Style the remaining fabric</li>
        </ol>
        
        <p><strong>Best for:</strong> Weddings, special occasions</p>
        <p><strong>Face shapes:</strong> All face shapes</p>

        <h2>10. The Business Professional</h2>
        
        <p>Clean, polished, and workplace-appropriate.</p>
        
        <h3>Steps:</h3>
        <ol>
          <li>Use a crisp, non-slip fabric</li>
          <li>Create a smooth, fitted wrap</li>
          <li>Ensure no loose ends</li>
          <li>Pin invisibly under the chin</li>
        </ol>
        
        <p><strong>Best for:</strong> Office, interviews, presentations</p>
        <p><strong>Face shapes:</strong> All face shapes</p>

        <h2>Pro Tips for All Styles</h2>
        
        <ul>
          <li><strong>Invest in good underscarves:</strong> They provide grip and shape</li>
          <li><strong>Use the right pins:</strong> Straight pins for thick fabrics, small pins for delicate materials</li>
          <li><strong>Consider your outfit:</strong> Match the formality and style</li>
          <li><strong>Practice makes perfect:</strong> Try new styles when you have time</li>
          <li><strong>Keep emergency pins:</strong> Always have extras in your bag</li>
        </ul>

        <h2>Choosing the Right Fabric</h2>
        
        <p>Different fabrics work better for different styles:</p>
        <ul>
          <li><strong>Jersey:</strong> Great for turban styles and casual looks</li>
          <li><strong>Chiffon:</strong> Perfect for formal, flowy styles</li>
          <li><strong>Cotton:</strong> Ideal for everyday wear</li>
          <li><strong>Silk:</strong> Best for special occasions</li>
          <li><strong>Modal:</strong> Versatile for all styles</li>
        </ul>

        <h2>Conclusion</h2>
        
        <p>Mastering these 10 hijab styles gives you the flexibility to express yourself while maintaining modesty. Remember, the best style is one that makes you feel confident and comfortable. Experiment with different techniques to find what works best for your lifestyle and personal aesthetic.</p>
      </article>
    `,
    excerpt: 'From everyday casual looks to elegant formal styles, master these essential hijab techniques for versatility and confidence.',
    category: 'hijab_styling' as ContentCategory,
    tags: ['hijab-styles', 'tutorials', 'fashion', 'styling-tips', 'how-to'],
    status: 'published' as ContentStatus,
    publishedAt: new Date('2024-01-20'),
    metaDescription: 'Learn 10 essential hijab styling techniques for any occasion with our step-by-step guide.',
    metaKeywords: 'hijab styles, hijab tutorial, hijab fashion, hijab wrapping techniques'
  },
  {
    title: 'Skincare Routine for Hijabis: Preventing Acne and Maintaining Healthy Skin',
    subtitle: 'Expert tips for skincare under the hijab',
    slug: 'skincare-routine-hijabis',
    thumbnailUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80',
    content: `
      <article class="prose prose-lg max-w-none">
        <h1>Skincare Routine for Hijabis: Preventing Acne and Maintaining Healthy Skin</h1>
        
        <p class="lead">Wearing hijab requires special attention to skincare. This guide provides expert tips for maintaining clear, healthy skin while wearing hijab daily.</p>

        <h2>Understanding Hijab-Related Skin Concerns</h2>
        
        <p>Common skin issues faced by hijabis include:</p>
        <ul>
          <li>Forehead acne from fabric friction</li>
          <li>Hairline breakouts from trapped sweat</li>
          <li>Uneven skin tone from partial sun exposure</li>
          <li>Oily T-zone from reduced air circulation</li>
        </ul>

        <h2>Morning Skincare Routine</h2>
        
        <h3>Step 1: Gentle Cleansing</h3>
        <p>Start with a pH-balanced cleanser to remove overnight oil buildup without stripping natural moisture.</p>
        
        <h3>Step 2: Toner</h3>
        <p>Use an alcohol-free toner to balance skin pH and prep for other products.</p>
        
        <h3>Step 3: Serum</h3>
        <p>Apply a lightweight, non-comedogenic serum targeting your specific concerns.</p>
        
        <h3>Step 4: Moisturizer</h3>
        <p>Choose a gel-based moisturizer for oily skin or a light lotion for normal/dry skin.</p>
        
        <h3>Step 5: Sunscreen</h3>
        <p>Yes, you still need SPF! UV rays can penetrate fabric, especially lighter colors.</p>

        <h2>Evening Skincare Routine</h2>
        
        <h3>Step 1: Double Cleansing</h3>
        <p>Remove sunscreen and makeup with an oil cleanser, then follow with your regular cleanser.</p>
        
        <h3>Step 2: Exfoliation (2-3 times weekly)</h3>
        <p>Use a gentle chemical exfoliant (BHA for acne-prone, AHA for texture).</p>
        
        <h3>Step 3: Treatment</h3>
        <p>Apply targeted treatments like retinol or niacinamide.</p>
        
        <h3>Step 4: Night Moisturizer</h3>
        <p>Use a richer formula to repair and hydrate overnight.</p>

        <h2>Hijab Hygiene Tips</h2>
        
        <ul>
          <li>Wash hijabs after 1-2 wears</li>
          <li>Use fragrance-free, hypoallergenic detergent</li>
          <li>Have multiple underscarves and rotate daily</li>
          <li>Choose breathable fabrics like cotton or bamboo</li>
          <li>Avoid fabric softeners that can clog pores</li>
        </ul>

        <h2>Preventing Forehead Acne</h2>
        
        <ol>
          <li>Apply a barrier cream along the hairline</li>
          <li>Use silk or satin underscarves to reduce friction</li>
          <li>Blot excess oil during the day with oil-absorbing sheets</li>
          <li>Keep hijab pins clean</li>
          <li>Avoid touching or adjusting hijab with unwashed hands</li>
        </ol>

        <h2>Recommended Products</h2>
        
        <h3>For Oily/Acne-Prone Skin:</h3>
        <ul>
          <li>Salicylic acid cleanser</li>
          <li>Niacinamide serum</li>
          <li>Oil-free gel moisturizer</li>
          <li>Clay masks (weekly)</li>
        </ul>
        
        <h3>For Dry/Sensitive Skin:</h3>
        <ul>
          <li>Cream cleanser</li>
          <li>Hyaluronic acid serum</li>
          <li>Ceramide moisturizer</li>
          <li>Calming sheet masks</li>
        </ul>

        <h2>Lifestyle Tips</h2>
        
        <ul>
          <li>Stay hydrated - aim for 8 glasses of water daily</li>
          <li>Change pillowcases frequently</li>
          <li>Avoid heavy makeup under hijab</li>
          <li>Let skin breathe when at home</li>
          <li>Maintain a balanced diet rich in antioxidants</li>
        </ul>

        <h2>When to See a Dermatologist</h2>
        
        <p>Consult a professional if you experience:</p>
        <ul>
          <li>Persistent acne despite routine changes</li>
          <li>Unusual rashes or irritation</li>
          <li>Hyperpigmentation concerns</li>
          <li>Severe dryness or sensitivity</li>
        </ul>

        <h2>Conclusion</h2>
        
        <p>With the right routine and habits, you can maintain beautiful, healthy skin while wearing hijab. Remember, consistency is key, and it may take time to see results. Be patient with your skin and adjust your routine as needed.</p>
      </article>
    `,
    excerpt: 'Expert skincare tips for hijabis to prevent acne and maintain healthy, glowing skin under the hijab.',
    category: 'beauty_tips' as ContentCategory,
    tags: ['skincare', 'hijab', 'acne-prevention', 'beauty', 'health'],
    status: 'published' as ContentStatus,
    publishedAt: new Date('2024-01-25'),
    metaDescription: 'Complete skincare guide for hijabis with tips to prevent acne and maintain healthy skin.',
    metaKeywords: 'hijabi skincare, acne prevention, skincare routine, hijab beauty tips'
  },
  {
    title: 'Trending Hijab Colors for 2024: What\'s Hot This Season',
    subtitle: 'Stay stylish with the latest hijab color trends',
    slug: 'trending-hijab-colors-2024',
    thumbnailUrl: 'https://images.unsplash.com/photo-1597308680537-7e0a0d64d6e1?w=800&q=80',
    content: `
      <article class="prose prose-lg max-w-none">
        <h1>Trending Hijab Colors for 2024: What's Hot This Season</h1>
        
        <p class="lead">Discover the hottest hijab colors dominating 2024 fashion and learn how to incorporate them into your wardrobe while staying true to your personal color season.</p>

        <h2>Top Color Trends of 2024</h2>
        
        <h3>1. Peach Fuzz - Pantone Color of the Year</h3>
        <p>A soft, nurturing peach tone that works beautifully for Spring and Autumn types. This versatile shade bridges the gap between pink and orange.</p>
        
        <h3>2. Digital Lavender</h3>
        <p>A modern twist on traditional purple, perfect for Summer types seeking a contemporary look.</p>
        
        <h3>3. Sage Green</h3>
        <p>Earthy and calming, this muted green complements all seasons when chosen in the right undertone.</p>
        
        <h3>4. Chocolate Brown</h3>
        <p>Rich and luxurious, making a major comeback for Autumn and Winter types.</p>
        
        <h3>5. Butter Yellow</h3>
        <p>Soft and optimistic, ideal for Spring types wanting to embrace color.</p>

        <h2>How to Wear Trending Colors for Your Season</h2>
        
        <h3>Spring Types</h3>
        <ul>
          <li>Embrace Peach Fuzz in its warmest variation</li>
          <li>Try Butter Yellow as a statement piece</li>
          <li>Choose Sage Green with yellow undertones</li>
        </ul>
        
        <h3>Summer Types</h3>
        <ul>
          <li>Digital Lavender is your perfect trend color</li>
          <li>Opt for Sage Green in cooler, grayer tones</li>
          <li>Try Peach Fuzz in its softest, most muted form</li>
        </ul>
        
        <h3>Autumn Types</h3>
        <ul>
          <li>Chocolate Brown is your power color this season</li>
          <li>Wear Sage Green in its deepest variation</li>
          <li>Choose Peach Fuzz with coral undertones</li>
        </ul>
        
        <h3>Winter Types</h3>
        <ul>
          <li>Try Digital Lavender in its boldest form</li>
          <li>Chocolate Brown works in its darkest shade</li>
          <li>Skip the soft trends and opt for classic jewel tones</li>
        </ul>

        <h2>Seasonal Trend Forecasts</h2>
        
        <h3>Spring 2024</h3>
        <p>Fresh pastels and nature-inspired hues dominate. Think blooming gardens and morning sky colors.</p>
        
        <h3>Summer 2024</h3>
        <p>Ocean-inspired blues and sunset oranges create a vacation-ready palette.</p>
        
        <h3>Fall 2024</h3>
        <p>Expect rich earth tones, deep berries, and metallic accents for added glamour.</p>
        
        <h3>Winter 2024</h3>
        <p>Jewel tones paired with unexpected neons for a bold, modern contrast.</p>

        <h2>Styling Tips</h2>
        
        <ul>
          <li>Pair trending colors with classic neutrals from your palette</li>
          <li>Use trending colors as accent pieces if unsure</li>
          <li>Consider the occasion when choosing bold trends</li>
          <li>Mix textures to add dimension to monochromatic looks</li>
        </ul>

        <h2>Investment Pieces vs. Trend Pieces</h2>
        
        <p>Invest in quality hijabs in your core colors, and experiment with trends through:</p>
        <ul>
          <li>Affordable fashion hijabs</li>
          <li>Accessories like hijab pins and brooches</li>
          <li>Underscarves in trending colors</li>
          <li>Printed hijabs featuring trend colors</li>
        </ul>

        <h2>Conclusion</h2>
        
        <p>While trends are exciting, remember that the best color is one that makes you feel confident and aligns with your personal style. Use trends as inspiration, but always filter them through your personal color palette for the most flattering results.</p>
      </article>
    `,
    excerpt: 'Discover 2024\'s hottest hijab colors and learn how to style them according to your personal color season.',
    category: 'trend' as ContentCategory,
    tags: ['trends', 'fashion', 'hijab-colors', '2024', 'style'],
    status: 'published' as ContentStatus,
    publishedAt: new Date('2024-01-30'),
    metaDescription: 'Explore trending hijab colors for 2024 and styling tips for every personal color season.',
    metaKeywords: 'hijab trends 2024, trending colors, hijab fashion, color trends'
  },
  {
    title: 'Quick Hijab Tutorial: 5-Minute Styles for Busy Mornings',
    subtitle: 'Fast and fabulous hijab styles when you\'re short on time',
    slug: 'quick-hijab-tutorial-5-minute-styles',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586716402203-79219bede43c?w=800&q=80',
    content: `
      <article class="prose prose-lg max-w-none">
        <h1>Quick Hijab Tutorial: 5-Minute Styles for Busy Mornings</h1>
        
        <p class="lead">Running late? These quick and easy hijab styles will have you looking polished in under 5 minutes, perfect for busy mornings when every second counts.</p>

        <h2>The 2-Pin Wonder</h2>
        <p><strong>Time: 2 minutes</strong></p>
        
        <h3>Steps:</h3>
        <ol>
          <li>Place hijab on head with one side longer (70/30 ratio)</li>
          <li>Pin the short side under your chin</li>
          <li>Wrap the long side around and pin at the temple</li>
          <li>Done! Adjust for comfort</li>
        </ol>
        
        <p><strong>Pro tip:</strong> Use magnetic pins for even faster securing</p>

        <h2>The Simple Drape</h2>
        <p><strong>Time: 1 minute</strong></p>
        
        <h3>Steps:</h3>
        <ol>
          <li>Center the hijab on your head</li>
          <li>Let both sides drape equally</li>
          <li>Pin once under the chin</li>
          <li>Throw one or both sides over your shoulder</li>
        </ol>
        
        <p><strong>Best with:</strong> Jersey or modal fabrics that don't slip</p>

        <h2>The Quick Wrap & Tuck</h2>
        <p><strong>Time: 3 minutes</strong></p>
        
        <h3>Steps:</h3>
        <ol>
          <li>Start with one side longer</li>
          <li>Pin the short side at your temple</li>
          <li>Wrap the long side around your head</li>
          <li>Tuck the end into the wrap at the neck</li>
        </ol>
        
        <p><strong>No pins needed</strong> for the wrap if you tuck securely!</p>

        <h2>The Instant Turban</h2>
        <p><strong>Time: 4 minutes</strong></p>
        
        <h3>Steps:</h3>
        <ol>
          <li>Use a long rectangular scarf</li>
          <li>Place the middle at your nape</li>
          <li>Bring both ends up and cross at forehead</li>
          <li>Wrap around head and tuck ends</li>
        </ol>
        
        <p><strong>Perfect for:</strong> Bad hijab days or when you need volume</p>

        <h2>The One-Pin Style</h2>
        <p><strong>Time: 90 seconds</strong></p>
        
        <h3>Steps:</h3>
        <ol>
          <li>Drape hijab with one side slightly longer</li>
          <li>Cross the longer side under your chin</li>
          <li>Bring it up and over your head to the opposite shoulder</li>
          <li>Pin once at the shoulder</li>
        </ol>
        
        <p><strong>Great for:</strong> Casual outings and errands</p>

        <h2>Time-Saving Prep Tips</h2>
        
        <ul>
          <li><strong>Night before:</strong> Lay out tomorrow's hijab and pins</li>
          <li><strong>Use underscarves:</strong> They provide grip and reduce adjusting time</li>
          <li><strong>Invest in no-snag hijabs:</strong> Jersey and modal materials save time</li>
          <li><strong>Keep a "emergency hijab" in your bag:</strong> Pre-styled or easy-wear options</li>
          <li><strong>Practice on weekends:</strong> Muscle memory makes mornings faster</li>
        </ul>

        <h2>Essential Tools for Quick Styling</h2>
        
        <ul>
          <li>Magnetic pins (faster than traditional pins)</li>
          <li>Volumizing scrunchies (instant volume, no layering)</li>
          <li>No-slip underscarves</li>
          <li>Hijab caps with built-in grip</li>
          <li>Safety pins for secure, invisible pinning</li>
        </ul>

        <h2>Fabric Choices for Speed</h2>
        
        <p>Some fabrics are naturally faster to style:</p>
        <ul>
          <li><strong>Jersey:</strong> Stretchy, stays in place, minimal pins needed</li>
          <li><strong>Modal:</strong> Soft, doesn't slip, drapes well</li>
          <li><strong>Cotton blend:</strong> Breathable, easy to manage</li>
          <li><strong>Instant hijabs:</strong> Pre-sewn styles you just slip on</li>
        </ul>

        <h2>Common Morning Mistakes to Avoid</h2>
        
        <ol>
          <li>Choosing slippery fabrics when rushed</li>
          <li>Attempting complex styles without practice</li>
          <li>Not having pins ready and accessible</li>
          <li>Forgetting to check the back view</li>
          <li>Pulling too tight (causes headaches)</li>
        </ol>

        <h2>Emergency Fixes</h2>
        
        <p>When something goes wrong:</p>
        <ul>
          <li><strong>Hijab slipping:</strong> Add a bobby pin at the problem area</li>
          <li><strong>Too short on one side:</strong> Pin and drape as an asymmetrical style</li>
          <li><strong>Wrinkled hijab:</strong> Spray with water and smooth</li>
          <li><strong>Lost pin:</strong> Use a paperclip or bobby pin temporarily</li>
        </ul>

        <h2>Building a Quick-Style Hijab Wardrobe</h2>
        
        <p>Keep these on hand for rushed mornings:</p>
        <ul>
          <li>3-5 neutral colored jersey hijabs</li>
          <li>2 instant hijabs for emergencies</li>
          <li>1 versatile printed hijab (hides wrinkles)</li>
          <li>Multiple underscarves</li>
          <li>A hijab organizer for easy selection</li>
        </ul>

        <h2>Conclusion</h2>
        
        <p>With these quick styles and tips, you'll never have to sacrifice style for speed. Remember, the key to fast hijab styling is preparation, practice, and choosing the right materials. Start with the simplest style that makes you feel confident, and you'll naturally get faster with time.</p>
      </article>
    `,
    excerpt: 'Master these 5-minute hijab styles for busy mornings when you need to look polished fast.',
    category: 'tutorial' as ContentCategory,
    tags: ['hijab-tutorial', 'quick-styles', 'time-saving', 'morning-routine', 'how-to'],
    status: 'published' as ContentStatus,
    publishedAt: new Date('2024-02-01'),
    metaDescription: 'Quick 5-minute hijab tutorials for busy mornings with step-by-step instructions.',
    metaKeywords: 'quick hijab styles, 5 minute hijab, hijab tutorial, fast hijab wrapping'
  }
];

async function seedMockData() {
  try {
    console.log('🌱 Starting to seed mock data...');
    
    // Check if product/content methods are available
    if (!db.createProduct || !db.createContent) {
      console.error('❌ Database does not support products/contents. Make sure you are using the correct database implementation.');
      process.exit(1);
    }

    // Seed products
    console.log('\n📦 Seeding products...');
    for (const product of mockProducts) {
      const created = await db.createProduct(product);
      console.log(`✅ Created product: ${created.name}`);
    }
    console.log(`✅ Successfully seeded ${mockProducts.length} products`);

    // Seed contents
    console.log('\n📝 Seeding contents...');
    for (const content of mockContents) {
      const created = await db.createContent(content);
      console.log(`✅ Created content: ${created.title}`);
    }
    console.log(`✅ Successfully seeded ${mockContents.length} contents`);

    console.log('\n🎉 Mock data seeding completed successfully!');
    
    // Display summary
    console.log('\n📊 Summary:');
    console.log(`- Products created: ${mockProducts.length}`);
    console.log(`- Contents created: ${mockContents.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding mock data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedMockData();
