// A simple script to test the booking API endpoint

import fetch from 'node-fetch';

async function testBooking() {
  console.log('Testing booking API...');

  const bookingData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+971501234567',
    service: 1, // Using service ID 1 for test
    date: '2025-05-15',
    time: '14:00:00',
    vipNumber: '',
  };

  try {
    const response = await fetch('http://localhost:3000/api/booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();

    console.log('Response status:', response.status);
    console.log('Response body:', result);

    if (result.success) {
      console.log('✅ Booking API test PASSED!');
    } else {
      console.log('❌ Booking API test FAILED!');
    }
  } catch (error) {
    console.error('Error testing booking API:', error);
    console.log('❌ Booking API test FAILED with error!');
  }
}

testBooking();
