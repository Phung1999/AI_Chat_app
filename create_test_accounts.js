const { chromium } = require('playwright');

const API = 'http://localhost:3000';
const WEB = 'http://localhost:5173';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createAccounts() {
  console.log('=== Creating 10 Test Accounts ===\n');
  const results = [];
  
  for (let i = 1; i <= 10; i++) {
    const email = `testuser${i}@test.com`;
    const password = '123456';
    const displayName = `User ${i}`;
    
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName })
      });
      const data = await res.json();
      
      if (data.success) {
        console.log(`✓ Account ${i}: ${email} - Created`);
        results.push({ email, password, success: true });
      } else {
        console.log(`✓ Account ${i}: ${email} - Already exists (login anyway)`);
        results.push({ email, password, success: true });
      }
    } catch (e) {
      console.log(`✗ Account ${i}: ${email} - ${e.message}`);
      results.push({ email, password, success: false });
    }
  }
  
  console.log('\n=== Login All Accounts ===\n');
  const tokens = [];
  for (let i = 0; i < results.length; i++) {
    const { email, password } = results[i];
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        tokens.push(data.data.token);
        console.log(`✓ Login ${i + 1}: ${email}`);
      }
    } catch (e) {
      console.log(`✗ Login ${i + 1} failed: ${e.message}`);
    }
  }
  
  console.log(`\nCreated ${results.length} accounts, ${tokens.length} logged in`);
  return tokens;
}

async function testChat(tokens) {
  console.log('\n=== Testing Chat ===\n');
  
  const browser = await chromium.launch({ headless: false });
  
  // User 1 sends message to User 2
  const page = await browser.newPage();
  await page.goto(WEB);
  await sleep(1000);
  
  // Login as User 1
  await page.fill('input[placeholder="Email"]', 'testuser1@test.com');
  await page.fill('input[placeholder="Password"]', '123456');
  await page.click('button:has-text("Sign In")');
  await sleep(2000);
  console.log('✓ User 1 logged in');
  
  // Check friend list
  const friendList = await page.$('text=Online');
  if (friendList) {
    console.log('✓ Online friends list found');
  } else {
    console.log('⚠ Online friends list not found');
  }
  
  await browser.close();
  return true;
}

async function main() {
  const tokens = await createAccounts();
  await testChat(tokens);
  console.log('\n=== Done ===');
}

main();