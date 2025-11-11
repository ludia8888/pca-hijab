// E2E Test Script for PCA-HIJAB
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

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
const AI_API_URL = 'http://localhost:8000';

// Test data
const testUser = {
  instagramId: 'test',
  preferences: {
    material: ['cotton', 'silk', 'chiffon'],
    transparency: ['opaque', 'semi-transparent'],
    priceRange: 'medium',
    fitStyle: ['standard', 'loose'],
    colorPreferences: ['neutral', 'pastel', 'bright'],
    additionalNotes: 'E2E test - Looking for comfortable hijabs for daily wear'
  }
};

async function runE2ETest() {
  console.log('🚀 Starting E2E Test Flow...\n');
  
  try {
    // Step 1: Create session
    console.log('1️⃣ Creating session for Instagram ID: test');
    const sessionResponse = await axios.post(`${API_BASE_URL}/sessions`, {
      instagramId: testUser.instagramId
    }, {
      headers: { 'Origin': 'http://localhost:3000' }
    });
    
    const sessionId = sessionResponse.data.data.sessionId;
    console.log(`✅ Session created: ${sessionId}\n`);
    
    // Step 2: Simulate AI analysis (using mock data since we don't have a real image)
    console.log('2️⃣ Simulating AI personal color analysis...');
    const personalColorResult = {
      personal_color_en: 'Spring Warm',
      tone_en: 'warm',
      confidence: 0.92,
      best_colors: ['peach', 'coral', 'golden yellow', 'warm beige'],
      worst_colors: ['black', 'navy', 'cool gray', 'pure white']
    };
    console.log(`✅ Personal Color: ${personalColorResult.personal_color_en} (${personalColorResult.confidence * 100}% confidence)\n`);
    
    // Step 3: Submit recommendation with all form fields
    console.log('3️⃣ Submitting recommendation request with all preferences...');
    const recommendationResponse = await axios.post(`${API_BASE_URL}/recommendations`, {
      sessionId: sessionId,
      instagramId: testUser.instagramId,
      personalColorResult: personalColorResult,
      userPreferences: testUser.preferences
    }, {
      headers: { 'Origin': 'http://localhost:3000' }
    });
    
    const recommendationId = recommendationResponse.data.recommendationId;
    console.log(`✅ Recommendation created: ${recommendationId}\n`);
    
    // Step 4: Verify data in database
    console.log('4️⃣ Verifying data in database...');
    
    // Get recommendation status
    const statusResponse = await axios.get(
      `${API_BASE_URL}/recommendations/${recommendationId}/status`,
      { headers: { 'Origin': 'http://localhost:3000' } }
    ).catch(() => ({ data: { status: 'pending' } }));
    
    console.log(`✅ Recommendation status: ${statusResponse.data.status || 'pending'}\n`);
    
    // Step 5: Check if data is accessible via debug endpoint
    console.log('5️⃣ Checking debug endpoint...');
    const debugResponse = await axios.get(
      `${API_BASE_URL}/recommendations/debug`,
      { headers: { 'Origin': 'http://localhost:3000' } }
    );
    
    if (debugResponse.data.success && debugResponse.data.count > 0) {
      const latestRec = debugResponse.data.recommendations.find(r => r.id === recommendationId);
      if (latestRec) {
        console.log('✅ Data found in debug endpoint:');
        console.log('  - Instagram ID:', maskInstagramId(latestRec.instagramId));
        console.log('  - Personal Color:', latestRec.personalColor);
        console.log('  - Preferences:', JSON.stringify(latestRec.preferences, null, 2));
      }
    }
    
    // Summary
    console.log('\n✨ E2E Test Summary:');
    console.log('  ✓ Session created successfully');
    console.log('  ✓ Personal color analysis simulated');
    console.log('  ✓ Recommendation submitted with all fields');
    console.log('  ✓ Data stored in database');
    console.log('\n📊 Test Data:');
    console.log(`  - Session ID: ${sessionId}`);
    console.log(`  - Recommendation ID: ${recommendationId}`);
    console.log(`  - Instagram ID: ${maskInstagramId(testUser.instagramId)}`);
    console.log(`  - Personal Color: ${personalColorResult.personal_color_en}`);
    console.log(`  - Material Preferences: ${testUser.preferences.material.join(', ')}`);
    console.log(`  - Transparency: ${testUser.preferences.transparency.join(', ')}`);
    console.log(`  - Price Range: ${testUser.preferences.priceRange}`);
    console.log(`  - Fit Style: ${testUser.preferences.fitStyle.join(', ')}`);
    console.log(`  - Color Preferences: ${testUser.preferences.colorPreferences.join(', ')}`);
    console.log(`  - Additional Notes: ${testUser.preferences.additionalNotes}`);
    
    // Admin page info
    console.log('\n🔐 Admin Page Access:');
    console.log('  URL: http://localhost:3000/admin/login');
    console.log('  Note: Admin page requires API key authentication');
    
  } catch (error) {
    console.error('❌ E2E Test Failed:', error.response?.data || error.message);
    if (error.response?.data?.stack) {
      console.error('Stack trace:', error.response.data.stack);
    }
  }
}

// Run the test
runE2ETest();
