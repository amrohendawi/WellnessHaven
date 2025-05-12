import fetch from 'node-fetch';

async function testPublic() {
  console.log('=== Public API Smoke Tests ===');

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  try {
    const bookingData = {
      name: 'Smoke Test User',
      email: 'smoke@example.com',
      phone: '+971501234567',
      service: 1,
      date: '2025-05-15',
      time: '14:00',
      vipNumber: ''
    };
    const response = await fetch(`${baseUrl}/api/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    const body = await response.json();
    console.log('POST /api/booking status:', response.status);
    console.log('Response:', body);
    console.log(response.ok ? '✅ Booking endpoint OK' : '❌ Booking endpoint FAILED');
  } catch (err) {
    console.error('Error testing public API:', err);
  }
}

testPublic();
