// Auto-login script for development
// This script will automatically log in the test user

async function autoLogin() {
  try {
    // First get CSRF token
    const csrfResponse = await fetch('http://localhost:5001/api/csrf-token', {
      credentials: 'include'
    });
    const csrfData = await csrfResponse.json();
    
    // Now login
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test1234'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      // Save to Zustand store via localStorage
      const authStorage = {
        state: {
          user: loginData.data.user,
          accessToken: loginData.data.accessToken,
          refreshToken: loginData.data.refreshToken,
          isAuthenticated: true
        },
        version: 0
      };
      
      localStorage.setItem('auth-storage', JSON.stringify(authStorage));
      
      console.log('✅ Auto-login successful!');
      console.log('User:', loginData.data.user);
      console.log('🔄 Refreshing page in 2 seconds...');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      console.error('❌ Login failed:', loginData.error);
    }
  } catch (error) {
    console.error('❌ Auto-login error:', error);
  }
}

// Run auto-login
console.log('🔐 Starting auto-login...');
autoLogin();