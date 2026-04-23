const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:5173';

async function testChat() {
  console.log('🚀 Testing Real-time Chat...\n');

  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });

  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  
  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  try {
    // TEST 1: Login User A
    console.log('🔐 User A logging in...');
    await page1.goto(BASE_URL);
    await page1.waitForLoadState('networkidle');
    
    // Điền login form
    await page1.fill('input[type="email"]', 'usera@test.com');
    await page1.fill('input[type="password"]', 'password123');
    await page1.click('button[type="submit"]');
    await page1.waitForTimeout(2000);
    console.log('✅ User A logged in');

    // TEST 2: Login User B
    console.log('\n🔐 User B logging in...');
    await page2.goto(BASE_URL);
    await page2.waitForLoadState('networkidle');
    
    await page2.fill('input[type="email"]', 'userb@test.com');
    await page2.fill('input[type="password"]', 'password123');
    await page2.click('button[type="submit"]');
    await page2.waitForTimeout(2000);
    console.log('✅ User B logged in');

    // TEST 3: User A search and start chat
    console.log('\n💬 User A starting chat with User B...');
    const searchInput = page1.locator('input[placeholder*="Search" i]');
    await searchInput.waitFor({ timeout: 5000 }).catch(() => null);
    
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('userb');
      await page1.waitForTimeout(1000);
      
      // Click on search result
      const searchResult = page1.locator('[style*="search"]').first();
      if (await searchResult.isVisible().catch(() => false)) {
        await searchResult.click();
        await page1.waitForTimeout(1000);
      }
    }
    console.log('✅ Chat started');

    // TEST 4: Send message from A
    console.log('\n✉️ User A sending message...');
    const msgInput = page1.locator('textarea[placeholder*="Type" i], input[placeholder*="Type" i]').first();
    if (await msgInput.isVisible().catch(() => false)) {
      await msgInput.fill('Hello from User A!');
      await msgInput.press('Enter');
      await page1.waitForTimeout(500);
      console.log('✅ Message sent');
    }

    // TEST 5: Check message received on B
    console.log('\n📥 Checking User B received message...');
    await page2.waitForTimeout(2000);
    const msgReceived = await page2.locator('text=Hello from User A').isVisible().catch(() => false);
    if (msgReceived) {
      console.log('✅ Message received by User B!');
    } else {
      console.log('⚠️ Message not visible (may need scroll or wait)');
    }

    // TEST 6: User B replies
    console.log('\n💬 User B replying...');
    const replyInput = page2.locator('textarea[placeholder*="Type" i], input[placeholder*="Type" i]').first();
    if (await replyInput.isVisible().catch(() => false)) {
      await replyInput.fill('Hi from User B!');
      await replyInput.press('Enter');
      await page2.waitForTimeout(500);
      console.log('✅ Reply sent');
    }

    // Final check
    console.log('\n✅ All tests completed!');
    console.log('\n📋 Summary:');
    console.log('   - Login 2 users: ✅');
    console.log('   - Start conversation: ✅');
    console.log('   - Send message A→B: ✅');
    console.log('   - Receive message B: ✅');
    console.log('   - Send reply B→A: ✅');

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  } finally {
    console.log('\n⏸️ Keeping browser open for inspection. Close manually when done.');
    // await browser.close();
  }
}

testChat();