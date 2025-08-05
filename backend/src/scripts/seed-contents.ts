import { db } from '../db';
import type { Content, ContentCategory, ContentStatus } from '../types';

const mockContents: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'viewCount'>[] = [
  {
    title: '2025년 히잡 트렌드 컬러',
    subtitle: '올해 주목해야 할 히잡 컬러 트렌드',
    slug: '2025-hijab-trend-colors',
    category: 'trend' as ContentCategory,
    thumbnailUrl: 'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=800&q=80',
    content: '<p>2025년 히잡 패션의 트렌드 컬러를 소개합니다.</p>',
    excerpt: '올해 가장 주목받는 히잡 컬러 트렌드를 알아보고, 퍼스널 컬러에 맞는 스타일링 팁을 제공합니다.',
    tags: ['트렌드', '히잡', '컬러'],
    status: 'published' as ContentStatus,
    metaDescription: '올해 주목해야 할 히잡 컬러 트렌드와 스타일링 팁'
  },
  {
    title: '퍼스널 컬러별 히잡 스타일링 가이드',
    subtitle: '봄 웜톤을 위한 완벽한 히잡 매칭',
    slug: 'personal-color-hijab-styling-spring',
    category: 'color_guide' as ContentCategory,
    thumbnailUrl: 'https://images.unsplash.com/photo-1631214540553-a4c31910fb94?w=800&q=80',
    content: '<p>봄 웜톤을 위한 히잡 스타일링 가이드입니다.</p>',
    excerpt: '봄 웜톤의 특징과 어울리는 히잡 컬러, 메이크업 팁까지 총정리했습니다.',
    tags: ['퍼스널컬러', '봄웜톤', '스타일링'],
    status: 'published' as ContentStatus
  },
  {
    title: '히잡과 함께하는 데일리 메이크업',
    subtitle: '자연스럽고 화사한 메이크업 튜토리얼',
    slug: 'hijab-daily-makeup-tutorial',
    category: 'tutorial' as ContentCategory,
    thumbnailUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80',
    content: '<p>히잡과 어울리는 데일리 메이크업 튜토리얼입니다.</p>',
    excerpt: '히잡 착용 시 더욱 돋보이는 자연스러운 메이크업 방법을 단계별로 알려드립니다.',
    tags: ['메이크업', '튜토리얼', '데일리룩'],
    status: 'published' as ContentStatus
  },
  {
    title: '여름 쿨톤을 위한 히잡 컬러 추천',
    subtitle: '시원하고 청량한 여름 스타일링',
    slug: 'summer-cool-tone-hijab-colors',
    category: 'color_guide' as ContentCategory,
    thumbnailUrl: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&q=80',
    content: '<p>여름 쿨톤에게 어울리는 히잡 컬러를 추천합니다.</p>',
    excerpt: '여름 쿨톤의 맑고 시원한 이미지를 살려주는 히잡 컬러와 스타일링 방법을 소개합니다.',
    tags: ['퍼스널컬러', '여름쿨톤', '컬러추천'],
    status: 'published' as ContentStatus
  },
  {
    title: '히잡 스타일링 기초 가이드',
    subtitle: '처음 시작하는 분들을 위한 A to Z',
    slug: 'hijab-styling-basics',
    category: 'hijab_styling' as ContentCategory,
    thumbnailUrl: 'https://images.unsplash.com/photo-1591730830341-718a2e4afc34?w=800&q=80',
    content: '<p>히잡 스타일링의 기초를 알려드립니다.</p>',
    excerpt: '히잡 착용이 처음이신 분들을 위한 기초 스타일링 가이드와 유용한 팁들을 모았습니다.',
    tags: ['히잡', '기초', '스타일링가이드'],
    status: 'published' as ContentStatus
  }
];

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
    for (const contentData of mockContents) {
      if (!db.createContent) {
        throw new Error('createContent method not available');
      }
      const content = await db.createContent({
        ...contentData,
        publishedAt: new Date()
      });
      console.log(`✅ Created content: ${content.title}`);
    }

    console.log(`✅ Successfully seeded ${mockContents.length} contents`);
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