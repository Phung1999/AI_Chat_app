const { chromium } = require('playwright');

const API = 'http://localhost:3000';
const WEB = 'http://localhost:5173';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function test() {
  console.log('=== Full Automation Tests ===\n');
  const results = [];
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Test API trực tiếp
  console.log('1. Testing Backend API...');
  try {
    // Health
    const healthRes = await fetch(`${API}/api/health`);
    const health = await healthRes.json();
    console.log('   ✓ Health:', health.success ? 'OK' : 'Failed');
    results.push({ test: 'health', success: health.success });
    
    // Register
    const user = 'user' + Date.now();
    const email = user + '@test.com';
    const pass = '123456';
    
    const regRes = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: pass,
        displayName: user
      })
    });
    const reg = await regRes.json();
    console.log('   ✓ Register:', reg.success ? 'OK' : reg.error?.message || 'Failed');
    results.push({ test: 'register', success: reg.success });
    
    // Login
    const loginRes = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: pass
      })
    });
    const login = await loginRes.json();
    console.log('   ✓ Login:', login.success ? 'OK' : login.error?.message || 'Failed');
    results.push({ test: 'login', success: login.success });
    
    const token = login.data?.token;
    
    // Get Profile
    if (token) {
      const profileRes = await fetch(`${API}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profile = await profileRes.json();
      console.log('   ✓ Profile:', profile.success ? 'OK' : 'Failed');
      results.push({ test: 'profile', success: profile.success });
    }
    
  } catch (e) {
    console.log('   ✗ API Error:', e.message);
    results.push({ test: 'api', success: false, error: e.message });
  }

  // Test UI
  console.log('\n2. Testing Web UI...');
  try {
    await page.goto(WEB + '/login');
    await sleep(1500);
    const loginTitle = await page.title();
    console.log('   ✓ Login page:', loginTitle);
    results.push({ test: 'login_page', success: true });
    
    await page.goto(WEB + '/register');
    await sleep(1500);
    const regTitle = await page.title();
    console.log('   ✓ Register page:', regTitle);
    results.push({ test: 'register_page', success: true });
    
  } catch (e) {
    console.log('   ✗ UI Error:', e.message);
    results.push({ test: 'ui', success: false, error: e.message });
  }

  // Summary
  console.log('\n=== Results ===');
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`Passed: ${passed}/${total}\n`);
  results.forEach(r => {
    console.log(`${r.success ? '✓' : '✗'} ${r.test}`);
  });

  await browser.close();
}

test();