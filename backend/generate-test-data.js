// Generate test data for Admin page demonstration
const axios = require('axios');

// Secure logging function to mask sensitive data
const maskInstagramId = (instagramId) => {
  if (!instagramId || typeof instagramId !== 'string') return '[INVALID_ID]';
  if (instagramId.length <= 2) return '*'.repeat(instagramId.length);
  const first = instagramId[0];
  const last = instagramId[instagramId.length - 1];
  const masked = '*'.repeat(Math.max(instagramId.length - 2, 3));
  return `${first}${masked}${last}`;
};

const API_BASE_URL = 'http://localhost:5001/api';

// Test users with Korean names and various scenarios
const testUsers = [
  {
    instagramId: 'jihyun_kim',
    personalColor: { personal_color_en: 'Spring Warm', tone_en: 'warm', confidence: 0.95 },
    preferences: {
      material: ['실크', '쉬폰'],
      transparency: ['불투명'],
      priceRange: '고가',
      fitStyle: ['스탠다드'],
      colorPreferences: ['파스텔', '밝은색'],
      additionalNotes: '결혼식 참석용 히잡을 찾고 있습니다. 밝고 화사한 색상 선호해요.'
    },
    status: 'completed'
  },
  {
    instagramId: 'soyeon_park',
    personalColor: { personal_color_en: 'Summer Cool', tone_en: 'cool', confidence: 0.88 },
    preferences: {
      material: ['면', '저지'],
      transparency: ['불투명'],
      priceRange: '중간',
      fitStyle: ['루즈핏', '스탠다드'],
      colorPreferences: ['무채색', '차분한색'],
      additionalNotes: '일상복으로 편하게 착용할 수 있는 히잡 원해요'
    },
    status: 'processing'
  },
  {
    instagramId: 'minjung_lee',
    personalColor: { personal_color_en: 'Autumn Warm', tone_en: 'warm', confidence: 0.92 },
    preferences: {
      material: ['면', '실크', '모달'],
      transparency: ['반투명', '불투명'],
      priceRange: '중간',
      fitStyle: ['스탠다드'],
      colorPreferences: ['무채색', '파스텔'],
      additionalNotes: '직장에서 착용하기 좋은 단정한 스타일'
    },
    status: 'pending'
  },
  {
    instagramId: 'yuna_choi',
    personalColor: { personal_color_en: 'Winter Cool', tone_en: 'cool', confidence: 0.91 },
    preferences: {
      material: ['쉬폰', '실크'],
      transparency: ['불투명'],
      priceRange: '저가',
      fitStyle: ['루즈핏'],
      colorPreferences: ['밝은색', '무채색'],
      additionalNotes: '학생이라 가격대가 낮으면 좋겠어요'
    },
    status: 'completed'
  },
  {
    instagramId: 'haerin_oh',
    personalColor: { personal_color_en: 'Spring Warm', tone_en: 'warm', confidence: 0.87 },
    preferences: {
      material: ['면'],
      transparency: ['불투명'],
      priceRange: '저가',
      fitStyle: ['스탠다드', '타이트'],
      colorPreferences: ['파스텔'],
      additionalNotes: '운동할 때도 착용 가능한 활동적인 스타일'
    },
    status: 'pending'
  }
];

async function generateTestData() {
  console.log('🚀 Generating test data for Admin page...\n');
  
  for (const user of testUsers) {
    try {
      // Step 1: Create session
      console.log(`Creating session for @${maskInstagramId(user.instagramId)}...`);
      const sessionResponse = await axios.post(`${API_BASE_URL}/sessions`, {
        instagramId: user.instagramId
      }, {
        headers: { 'Origin': 'http://localhost:3000' }
      });
      
      const sessionId = sessionResponse.data.data.sessionId;
      
      // Step 2: Create recommendation
      const recommendationResponse = await axios.post(`${API_BASE_URL}/recommendations`, {
        sessionId: sessionId,
        instagramId: user.instagramId,
        personalColorResult: user.personalColor,
        userPreferences: user.preferences
      }, {
        headers: { 'Origin': 'http://localhost:3000' }
      });
      
      const recommendationId = recommendationResponse.data.recommendationId;
      console.log(`✅ Created recommendation for @${maskInstagramId(user.instagramId)} (${recommendationId})`);
      
      // Step 3: Update status if not pending
      if (user.status !== 'pending') {
        await axios.patch(`${API_BASE_URL}/admin/recommendations/${recommendationId}/status`, {
          status: user.status
        }, {
          headers: { 
            'Origin': 'http://localhost:3000',
            'x-api-key': 'dev-admin-key-123'
          }
        });
        console.log(`   Updated status to: ${user.status}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to create data for @${maskInstagramId(user.instagramId)}:`, error.response?.data || error.message);
    }
  }
  
  console.log('\n✨ Test data generation complete!');
  console.log('\n📊 Admin page access:');
  console.log('   URL: http://localhost:3000/admin/login');
  console.log('   API Key: dev-admin-key-123');
  console.log('\n💡 You can now see:');
  console.log('   - 5 different users with Korean preferences');
  console.log('   - Different personal color types (Spring, Summer, Autumn, Winter)');
  console.log('   - Various status states (pending, processing, completed)');
  console.log('   - Different price ranges and material preferences');
}

// Run the data generation
generateTestData();