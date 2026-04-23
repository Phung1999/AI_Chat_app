// Test Script for AI Chat App
// Copy và chạy trên DevTools Console (F12)

const API_BASE = 'http://localhost:3000';

const test = {
  results: [],
  
  async request(url, method, body) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(url, options);
    return res.json();
  },
  
  async run() {
    console.log('=== Starting Tests ===\n');
    
    // 1. Test Health Check
    console.log('1. Testing Health Check...');
    try {
      const health = await this.request(`${API_BASE}/api/health`, 'GET');
      console.log('✓ Health:', health);
      this.results.push({ test: 'health', success: health.success });
    } catch (e) {
      console.log('✗ Health Failed:', e.message);
      this.results.push({ test: 'health', success: false, error: e.message });
    }
    
    // 2. Test Register
    console.log('\n2. Testing Register...');
    const randomUser = 'user' + Date.now();
    try {
      const reg = await this.request(`${API_BASE}/api/auth/register`, 'POST', {
        username: randomUser,
        email: randomUser + '@test.com',
        password: '123456'
      });
      console.log('✓ Register:', reg);
      this.results.push({ test: 'register', success: reg.success });
      this.currentUser = randomUser;
    } catch (e) {
      console.log('✗ Register Failed:', e.message);
      this.results.push({ test: 'register', success: false, error: e.message });
    }
    
    // 3. Test Login
    console.log('\n3. Testing Login...');
    try {
      const login = await this.request(`${API_BASE}/api/auth/login`, 'POST', {
        username: this.currentUser || 'testuser',
        password: '123456'
      });
      console.log('✓ Login:', login);
      this.results.push({ test: 'login', success: login.success });
      this.token = login.data?.token;
    } catch (e) {
      console.log('✗ Login Failed:', e.message);
      this.results.push({ test: 'login', success: false, error: e.message });
    }
    
    // 4. Test Get Profile
    if (this.token) {
      console.log('\n4. Testing Get Profile...');
      try {
        const profile = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        }).then(r => r.json());
        console.log('✓ Profile:', profile);
        this.results.push({ test: 'profile', success: profile.success });
      } catch (e) {
        console.log('✗ Profile Failed:', e.message);
        this.results.push({ test: 'profile', success: false, error: e.message });
      }
    }
    
    // Summary
    console.log('\n=== Test Summary ===');
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    console.log(`Passed: ${passed}/${total}`);
    this.results.forEach(r => {
      console.log(`${r.success ? '✓' : '✗'} ${r.test}`);
    });
    
    return this.results;
  }
};

test.run();