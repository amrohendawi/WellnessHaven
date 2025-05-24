import fetch from 'node-fetch';

// Helper function to interpret admin user data with Clerk
(async () => {
  console.log('=== Admin API Smoke Tests ===');
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const token = process.env.CLERK_JWT || 'YOUR_ADMIN_JWT';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  try {
    // Test GET bookings
    let res = await fetch(`${baseUrl}/api/admin/bookings`, { headers });
    console.log('GET /api/admin/bookings status:', res.status);
    console.log(await res.json());

    // Test GET services
    res = await fetch(`${baseUrl}/api/admin/services`, { headers });
    console.log('GET /api/admin/services status:', res.status);
    console.log(await res.json());

    // Test GET blocked slots
    res = await fetch(`${baseUrl}/api/admin/blocked-slots`, { headers });
    console.log('GET /api/admin/blocked-slots status:', res.status);
    console.log(await res.json());

    console.log('✅ Admin API smoke tests completed.');
  } catch (err) {
    console.error('Error testing admin API:', err);
  }
})();
