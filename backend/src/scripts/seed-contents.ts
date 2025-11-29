import { db } from '../db';
import type { Content, ContentCategory, ContentStatus } from '../types';

const PLACEHOLDER_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

const mockContents: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'viewCount'>[] = [
  {
    title: '2025 Hijab Color Trends',
    subtitle: 'The shades to watch this year',
    slug: '2025-hijab-trend-colors',
    category: 'trend' as ContentCategory,
    thumbnailUrl: PLACEHOLDER_IMAGE,
    content: '<p>Discover the hijab colors dominating 2025 fashion runways. From rose-gold metallics to sage green neutrals, we break down how to style each tone for different undertones.</p>',
    excerpt: 'A quick look at 2025’s must-have hijab shades plus styling tips for every personal color season.',
    tags: ['trend', 'hijab', 'color'],
    status: 'published' as ContentStatus,
    metaDescription: '2025 hijab color trend report with styling tips.'
  },
  {
    title: 'Spring Warm Hijab Styling Guide',
    subtitle: 'Your perfect match by personal color',
    slug: 'personal-color-hijab-styling-spring',
    category: 'color_guide' as ContentCategory,
    thumbnailUrl: PLACEHOLDER_IMAGE,
    content: '<p>Spring Warm beauties glow in peach, apricot, and light ivory. We cover the fabrics, accessories, and makeup pairings that keep your look fresh.</p>',
    excerpt: 'Everything you need to know to style spring-warm hijab looks with confidence.',
    tags: ['personal-color', 'spring-warm', 'styling'],
    status: 'published' as ContentStatus
  },
  {
    title: 'Daily Makeup with a Hijab',
    subtitle: 'Fresh, natural, camera-ready',
    slug: 'hijab-daily-makeup-tutorial',
    category: 'tutorial' as ContentCategory,
    thumbnailUrl: PLACEHOLDER_IMAGE,
    content: '<p>Follow this three-step base, eye, and lip routine for a polished everyday look that complements your hijab without overpowering it.</p>',
    excerpt: 'Step-by-step natural makeup tutorial tailored for hijab wearers.',
    tags: ['makeup', 'tutorial', 'daily-look'],
    status: 'published' as ContentStatus
  },
  {
    title: 'Summer Cool Hijab Colors',
    subtitle: 'Light, airy styling inspiration',
    slug: 'summer-cool-tone-hijab-colors',
    category: 'color_guide' as ContentCategory,
    thumbnailUrl: PLACEHOLDER_IMAGE,
    content: '<p>Soft lavender, powder blue, and rose quartz instantly brighten Summer Cool complexions. Explore outfit pairings and fabric suggestions.</p>',
    excerpt: 'Color and styling ideas to highlight the clarity of Summer Cool tones.',
    tags: ['personal-color', 'summer-cool', 'color-guide'],
    status: 'published' as ContentStatus
  },
  {
    title: 'Hijab Styling Basics',
    subtitle: 'A-Z starter guide',
    slug: 'hijab-styling-basics',
    category: 'hijab_styling' as ContentCategory,
    thumbnailUrl: PLACEHOLDER_IMAGE,
    content: '<p>New to hijab styling? Learn how to choose breathable fabrics, essential accessories, and simple wraps that stay put all day.</p>',
    excerpt: 'Foundational hijab styling advice plus beginner-friendly tips.',
    tags: ['hijab', 'basics', 'styling-guide'],
    status: 'published' as ContentStatus
  }
];

// Replace external thumbnails with placeholder to avoid remote Unsplash usage
const seededContents = mockContents.map((c) => ({
  ...c,
  thumbnailUrl: PLACEHOLDER_IMAGE
}));

export async function seedContents() {
  console.log('🌱 Seeding contents...');
  
  try {
    // Clear existing contents
    const allContents = await db.getAllContents?.() || [];
    for (const content of allContents) {
      if (db.deleteContent) {
        await db.deleteContent(content.id);
      }
    }
    console.log('✅ Cleared existing contents');

    // Add mock contents
    for (const contentData of seededContents) {
      if (!db.createContent) {
        throw new Error('createContent method not available');
      }
      const content = await db.createContent({
        ...contentData,
        publishedAt: new Date()
      });
      console.log(`✅ Created content: ${content.title}`);
    }

    console.log(`✅ Successfully seeded ${seededContents.length} contents`);
  } catch (error) {
    console.error('❌ Error seeding contents:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedContents()
    .then(() => {
      console.log('✅ Content seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Content seeding failed:', error);
      process.exit(1);
    });
}
