// Using built-in fetch API (available in Node.js 18+)

const API_URL = 'http://localhost:5001/api';
const ADMIN_API_KEY = '1234';

const mockProducts = [
  {
    name: 'Satin Premium Hijab - Rose Gold',
    category: 'hijab',
    price: 250000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=800&q=80',
    detailImageUrls: [
      'https://images.unsplash.com/photo-1586716402203-79219bede43c?w=800&q=80',
      'https://images.unsplash.com/photo-1641889011051-ec59ad75aa65?w=800&q=80'
    ],
    personalColors: ['spring_warm', 'autumn_warm'],
    description: 'Premium satin hijab dengan warna rose gold yang elegan, cocok untuk acara formal.',
    shopeeLink: 'https://shopee.co.id/hijab-satin-premium',
    isActive: true
  },
  {
    name: 'Voal Ultrafine Square - Dusty Pink',
    category: 'hijab',
    price: 180000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&q=80',
    detailImageUrls: [],
    personalColors: ['summer_cool', 'spring_warm'],
    description: 'Hijab voal ultrafine dengan tekstur lembut dan warna dusty pink yang cantik.',
    shopeeLink: 'https://shopee.co.id/voal-ultrafine',
    isActive: true
  },
  {
    name: 'Pashmina Inner Ninja - Nude Beige',
    category: 'hijab',
    price: 75000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1603344448201-340e91e5f14f?w=800&q=80',
    detailImageUrls: [],
    personalColors: ['spring_warm', 'summer_cool', 'autumn_warm', 'winter_cool'],
    description: 'Inner ninja dari bahan pashmina yang nyaman, warna nude universal.',
    shopeeLink: 'https://shopee.co.id/pashmina-inner',
    isActive: true
  },
  {
    name: 'Chiffon Ceruty - Navy Blue',
    category: 'hijab',
    price: 195000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1591730830341-718a2e4afc34?w=800&q=80',
    detailImageUrls: [],
    personalColors: ['winter_cool', 'summer_cool'],
    description: 'Hijab chiffon ceruty dengan tekstur yang jatuh sempurna, warna navy yang klasik.',
    shopeeLink: 'https://shopee.co.id/chiffon-ceruty',
    isActive: true
  },
  {
    name: 'Softlens X2 Bio Color - Honey Brown',
    category: 'lens',
    price: 350000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=800&q=80',
    detailImageUrls: [],
    personalColors: ['spring_warm', 'autumn_warm'],
    description: 'Softlens dengan warna honey brown natural, nyaman dipakai seharian.',
    shopeeLink: 'https://shopee.co.id/softlens-x2',
    isActive: true
  },
  {
    name: 'Daily Lens Aqua - Gray Pearl',
    category: 'lens',
    price: 125000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1597983073512-990c86bdc256?w=800&q=80',
    detailImageUrls: [],
    personalColors: ['summer_cool', 'winter_cool'],
    description: 'Softlens harian dengan warna gray pearl yang elegan.',
    shopeeLink: 'https://shopee.co.id/daily-lens',
    isActive: true
  },
  {
    name: 'Monthly Lens Premium - Hazel Green',
    category: 'lens',
    price: 450000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=800&q=80',
    detailImageUrls: [],
    personalColors: ['spring_warm', 'summer_cool'],
    description: 'Softlens bulanan premium dengan warna hazel green yang cantik alami.',
    shopeeLink: 'https://shopee.co.id/monthly-lens',
    isActive: true
  },
  {
    name: 'Velvet Lip Tint - Coral Crush',
    category: 'lip',
    price: 89000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
    detailImageUrls: [],
    personalColors: ['spring_warm'],
    description: 'Lip tint dengan tekstur velvet, warna coral yang segar.',
    shopeeLink: 'https://shopee.co.id/velvet-lip-tint',
    isActive: true
  },
  {
    name: 'Matte Liquid Lipstick - Brick Red',
    category: 'lip',
    price: 135000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1614086229600-2a8c227b3952?w=800&q=80',
    detailImageUrls: [],
    personalColors: ['autumn_warm'],
    description: 'Liquid lipstick matte dengan warna brick red yang bold.',
    shopeeLink: 'https://shopee.co.id/matte-liquid',
    isActive: true
  },
  {
    name: 'Glossy Lip Balm - Rose Pink',
    category: 'lip',
    price: 65000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1599948884769-ddbec7eb8f29?w=800&q=80',
    detailImageUrls: [],
    personalColors: ['summer_cool'],
    description: 'Lip balm dengan finish glossy, warna rose pink yang natural.',
    shopeeLink: 'https://shopee.co.id/glossy-balm',
    isActive: true
  },
  {
    name: 'Satin Lipstick - Deep Berry',
    category: 'lip',
    price: 155000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1586090090113-b485132cc307?w=800&q=80',
    detailImageUrls: [],
    personalColors: ['winter_cool'],
    description: 'Lipstick satin dengan warna deep berry yang elegan.',
    shopeeLink: 'https://shopee.co.id/satin-lipstick',
    isActive: true
  },
  {
    name: '9-Color Palette - Warm Sunset',
    category: 'eyeshadow',
    price: 285000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1512207576147-b31a1f3d7b8f?w=800&q=80',
    detailImageUrls: [],
    personalColors: ['spring_warm', 'autumn_warm'],
    description: 'Eyeshadow palette dengan 9 warna warm tone yang pigmented.',
    shopeeLink: 'https://shopee.co.id/palette-warm',
    isActive: true
  },
  {
    name: 'Duo Chrome Shadow - Aurora Pink',
    category: 'eyeshadow',
    price: 95000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80',
    detailImageUrls: [],
    personalColors: ['spring_warm', 'summer_cool'],
    description: 'Single eyeshadow dengan efek duo chrome aurora pink yang unik.',
    shopeeLink: 'https://shopee.co.id/duo-chrome',
    isActive: true
  },
  {
    name: 'Matte Quad Palette - Cool Mauve',
    category: 'eyeshadow',
    price: 165000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1583241800698-e8ab01396cc6?w=800&q=80',
    detailImageUrls: [],
    personalColors: ['summer_cool', 'winter_cool'],
    description: 'Eyeshadow palette mini dengan 4 warna matte cool tone.',
    shopeeLink: 'https://shopee.co.id/quad-palette',
    isActive: true
  },
  {
    name: 'Glitter Topper - Ice Crystal',
    category: 'eyeshadow',
    price: 75000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1616734046915-1e35e55278d2?w=800&q=80',
    detailImageUrls: [],
    personalColors: ['winter_cool'],
    description: 'Glitter eyeshadow topper dengan efek ice crystal yang berkilau.',
    shopeeLink: 'https://shopee.co.id/glitter-topper',
    isActive: true
  }
];

const mockContents = [
  {
    title: '2025년 히잡 트렌드 컬러',
    subtitle: '올해 주목해야 할 히잡 컬러 트렌드',
    slug: '2025-hijab-trend-colors',
    category: 'trend',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=800&q=80',
    content: '<h2>2025년 주목해야 할 트렌드 컬러</h2><p>올해 히잡 패션계에서 가장 주목받는 컬러는 <strong>로즈 골드</strong>와 <strong>세이지 그린</strong>입니다.</p><p>특히 봄 웜톤에게는 로즈 골드가, 여름 쿨톤에게는 세이지 그린이 잘 어울립니다.</p><h3>시즌별 추천 컬러</h3><ul><li>봄: 코랄 핑크, 피치, 라이트 옐로우</li><li>여름: 파스텔 블루, 라벤더, 민트</li><li>가을: 버건디, 테라코타, 머스타드</li><li>겨울: 네이비, 와인, 에메랄드</li></ul>',
    excerpt: '올해 가장 주목받는 히잡 컬러 트렌드를 알아보고, 퍼스널 컬러에 맞는 스타일링 팁을 제공합니다.',
    tags: ['트렌드', '히잡', '컬러'],
    status: 'published',
    metaDescription: '올해 주목해야 할 히잡 컬러 트렌드와 스타일링 팁'
  },
  {
    title: '퍼스널 컬러별 히잡 스타일링 가이드',
    subtitle: '봄 웜톤을 위한 완벽한 히잡 매칭',
    slug: 'personal-color-hijab-styling-spring',
    category: 'color_guide',
    thumbnailUrl: 'https://images.unsplash.com/photo-1631214540553-a4c31910fb94?w=800&q=80',
    content: '<h2>봄 웜톤의 특징</h2><p>봄 웜톤은 따뜻하고 화사한 이미지를 가지고 있습니다. 피부톤이 밝고 황색 베이스를 띠며, 머리카락과 눈동자 색이 밝은 갈색을 띱니다.</p><h3>추천 히잡 컬러</h3><ul><li>코랄 핑크</li><li>살구색</li><li>연한 오렌지</li><li>아이보리</li></ul><blockquote>봄 웜톤은 너무 어두운 색보다는 밝고 화사한 색상이 잘 어울립니다.</blockquote>',
    excerpt: '봄 웜톤의 특징과 어울리는 히잡 컬러, 메이크업 팁까지 총정리했습니다.',
    tags: ['퍼스널컬러', '봄웜톤', '스타일링'],
    status: 'published'
  },
  {
    title: '히잡과 함께하는 데일리 메이크업',
    subtitle: '자연스럽고 화사한 메이크업 튜토리얼',
    slug: 'hijab-daily-makeup-tutorial',
    category: 'tutorial',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80',
    content: '<h2>히잡과 함께하는 자연스러운 메이크업</h2><p>히잡을 착용할 때는 얼굴이 더 부각되므로, 자연스러우면서도 화사한 메이크업이 중요합니다.</p><h3>Step 1: 베이스 메이크업</h3><p>가벼운 텍스처의 파운데이션으로 피부결을 정돈합니다.</p><h3>Step 2: 아이 메이크업</h3><p>내추럴한 브라운 톤으로 음영을 주고, 속눈썹을 강조합니다.</p><h3>Step 3: 립 메이크업</h3><p>MLBB(My Lips But Better) 컬러로 자연스럽게 마무리합니다.</p>',
    excerpt: '히잡 착용 시 더욱 돋보이는 자연스러운 메이크업 방법을 단계별로 알려드립니다.',
    tags: ['메이크업', '튜토리얼', '데일리룩'],
    status: 'published'
  },
  {
    title: '여름 쿨톤을 위한 히잡 컬러 추천',
    subtitle: '시원하고 청량한 여름 스타일링',
    slug: 'summer-cool-tone-hijab-colors',
    category: 'color_guide',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&q=80',
    content: '<h2>여름 쿨톤을 위한 컬러 가이드</h2><p>여름 쿨톤은 부드럽고 우아한 이미지를 가지고 있습니다. 핑크빛이 도는 피부톤과 회갈색 머리카락이 특징입니다.</p><h3>베스트 컬러</h3><ul><li>파우더 핑크</li><li>라벤더</li><li>스카이 블루</li><li>로즈 쿼츠</li></ul><p>여름 쿨톤은 채도가 낮고 밝은 파스텔 톤이 가장 잘 어울립니다.</p>',
    excerpt: '여름 쿨톤의 맑고 시원한 이미지를 살려주는 히잡 컬러와 스타일링 방법을 소개합니다.',
    tags: ['퍼스널컬러', '여름쿨톤', '컬러추천'],
    status: 'published'
  },
  {
    title: '히잡 스타일링 기초 가이드',
    subtitle: '처음 시작하는 분들을 위한 A to Z',
    slug: 'hijab-styling-basics',
    category: 'hijab_styling',
    thumbnailUrl: 'https://images.unsplash.com/photo-1591730830341-718a2e4afc34?w=800&q=80',
    content: '<p>히잡 스타일링의 기초를 알려드립니다.</p>',
    excerpt: '히잡 착용이 처음이신 분들을 위한 기초 스타일링 가이드와 유용한 팁들을 모았습니다.',
    tags: ['히잡', '기초', '스타일링가이드'],
    status: 'published'
  }
];

async function seedViaAPI() {
  console.log('🌱 Seeding data via API...');
  
  try {
    // Seed products
    console.log('\n📦 Seeding products...');
    for (const product of mockProducts) {
      try {
        const response = await fetch(`${API_URL}/admin/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ADMIN_API_KEY
          },
          body: JSON.stringify(product)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Created product: ${product.name}`);
      } catch (error) {
        console.error(`❌ Failed to create product: ${product.name}`, error instanceof Error ? error.message : error);
      }
    }

    // Seed contents
    console.log('\n📄 Seeding contents...');
    for (const content of mockContents) {
      try {
        const response = await fetch(`${API_URL}/admin/contents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ADMIN_API_KEY
          },
          body: JSON.stringify(content)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Created content: ${content.title}`);
      } catch (error) {
        console.error(`❌ Failed to create content: ${content.title}`, error instanceof Error ? error.message : error);
      }
    }

    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedViaAPI()
    .then(() => {
      console.log('✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}