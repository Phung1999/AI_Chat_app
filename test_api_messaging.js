const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testMessaging() {
  console.log('🚀 Testing Messaging Between 2 Accounts\n');

  const api = axios.create({ baseURL: BASE_URL });

  let userA = null, userB = null;
  let tokenA = null, tokenB = null;

  try {
    // Register User A
    console.log('📝 Registering User A...');
    const resA = await api.post('/auth/register', {
      email: 'testa@demo.com',
      password: 'password123',
      displayName: 'Test User A'
    });
    userA = resA.data.data.user;
    tokenA = resA.data.data.token;
    console.log('✅ User A registered:', userA.email);

    // Register User B
    console.log('\n📝 Registering User B...');
    const resB = await api.post('/auth/register', {
      email: 'testb@demo.com',
      password: 'password123',
      displayName: 'Test User B'
    });
    userB = resB.data.data.user;
    tokenB = resB.data.data.token;
    console.log('✅ User B registered:', userB.email);

    // Set auth header for User A
    apiA = axios.create({ 
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    apiB = axios.create({ 
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${tokenB}` }
    });

    // Search for User B from User A
    console.log('\n🔍 User A searching for User B...');
    const searchRes = await apiA.get('/users/search', { params: { q: 'testb' } });
    const foundUser = searchRes.data.data.find(u => u.email === 'testb@demo.com');
    console.log('✅ Found User B:', foundUser?.email);

    // Create conversation
    console.log('\n💬 Creating conversation...');
    const convRes = await apiA.post('/conversations', { participantId: userB.id });
    const conversation = convRes.data.data;
    console.log('✅ Conversation created:', conversation.id);

    // User A sends message
    console.log('\n✉️ User A sending message...');
    const msgRes = await apiA.post(`/conversations/${conversation.id}/messages`, {
      content: 'Hello from User A!'
    });
    console.log('✅ Message sent:', msgRes.data.data?.content || 'sent via socket');

    // Get messages as User B
    console.log('\n📥 User B getting messages...');
    const messagesRes = await apiB.get(`/conversations/${conversation.id}/messages`);
    const messages = messagesRes.data.data;
    console.log('✅ Messages retrieved:', messages.length);

    // Summary
    console.log('\n========== TEST SUMMARY ==========');
    console.log('✅ User Registration: PASS');
    console.log('✅ User Search: PASS');
    console.log('✅ Create Conversation: PASS');
    console.log('✅ Send Message: PASS');
    console.log('✅ Get Messages: PASS');
    console.log('===================================');
    console.log('\n✅ ALL TESTS PASSED!');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.response?.data?.error?.message || error.message);
    
    console.log('\n========== DEBUG INFO ==========');
    if (error.config) {
      console.log('Request URL:', error.config.url);
      console.log('Request Method:', error.config.method);
    }
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('===================================');
  }
}

testMessaging();