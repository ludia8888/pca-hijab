import axios from 'axios';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5001/api';

async function createTestUserAndLogin() {
  try {
    // First, let's create/update test user with proper password
    const password = 'test1234';
    const hashedPassword = await bcryptjs.hash(password, 10);
    
    console.log('🔐 Setting up test user with password...');
    
    // Since we can't directly update the database from here,
    // let's use the auth API to login with a temporary approach
    
    // Try to login with test account
    console.log('🔑 Attempting to login with test account...');
    
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'test1234' // We'll use this password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('\n📋 Login Response:');
    console.log(JSON.stringify(loginResponse.data, null, 2));
    
    console.log('\n🔐 To use this login state in the browser:');
    console.log('1. Open browser console at http://localhost:8081');
    console.log('2. Run the following command:');
    console.log(`\nlocalStorage.setItem('auth-storage', '${JSON.stringify({
      state: {
        user: loginResponse.data.data.user,
        accessToken: loginResponse.data.data.accessToken,
        refreshToken: loginResponse.data.data.refreshToken,
        isAuthenticated: true
      },
      version: 0
    })}');\n`);
    console.log('3. Refresh the page');
    
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('❌ Login failed - password mismatch');
      console.log('Let\'s update the test user password in the database...');
      
      // Create a script to update password
      console.log('\nRun this SQL command to set the test user password:');
      const hashedPassword = await bcryptjs.hash('test1234', 10);
      console.log(`UPDATE users SET password_hash = '${hashedPassword}' WHERE email = 'test@example.com';`);
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
}

createTestUserAndLogin();