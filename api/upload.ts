import type { VercelRequest, VercelResponse } from '@vercel/node';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'https://dubai-rose.vercel.app',
  'https://dubai-rose-spa.vercel.app',
];

// Configure bodyParser size limit for Vercel serverless function
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    const origin = req.headers.origin as string;
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
    }

    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS request (preflight)
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get credentials from environment variables
    const clientId = process.env.VITE_IMGUR_CLIENT_ID;
    const accessToken = process.env.VITE_IMGUR_ACCESS_TOKEN;

    if (!clientId) {
      return res.status(500).json({ error: 'Imgur credentials not configured' });
    }

    console.log('Processing image upload request');

    // Validate request body
    if (!req.body || !req.body.image) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    let base64Image = req.body.image;
    const fileName = req.body.fileName || 'upload';

    // Remove data URL prefix if present
    if (base64Image.startsWith('data:')) {
      const parts = base64Image.split(',');
      base64Image = parts[1];
    }

    // Create form data for Imgur API
    const formData = new FormData();
    formData.append('image', base64Image);
    formData.append('type', 'base64');
    formData.append('title', fileName);
    formData.append('description', 'Uploaded from Dubai Rose admin dashboard');

    // Set headers for Imgur API
    const headers: Record<string, string> = {
      Authorization: `Client-ID ${clientId}`,
    };

    // Add Bearer token if available
    if (accessToken) {
      console.log('Using access token for Imgur upload');
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log('Sending request to Imgur API');

    // Send request to Imgur
    let data;
    try {
      // Add artificial delay to avoid hitting rate limits
      // This helps space out requests from development testing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers,
        // @ts-ignore - form-data types issue with node-fetch
        body: formData,
      });

      // Parse response
      data = await response.json();

      // Handle rate limiting explicitly
      if (response.status === 429) {
        console.warn('Imgur rate limit hit. Consider waiting or using a different client ID');
        const retryAfter = response.headers.get('X-RateLimit-UserReset') || '3600';
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests to Imgur API. Please try again later.',
          retryAfter: Number.parseInt(retryAfter, 10),
          data,
        });
      }

      if (!response.ok) {
        console.error('Imgur API error:', data);
        return res.status(response.status).json(data);
      }

      // Check for success in the data
      if (!data?.success) {
        console.error('Imgur upload failed:', data);
        return res.status(500).json({ error: 'Failed to upload image to Imgur', details: data });
      }
    } catch (fetchError) {
      console.error('Error fetching from Imgur:', fetchError);
      return res.status(500).json({
        error: 'Error communicating with Imgur API',
        details: fetchError.message,
      });
    }

    console.log('Image uploaded successfully to Imgur');

    // Return the image URL
    return res.status(200).json({
      success: true,
      data: {
        link: data.data.link,
      },
    });
  } catch (error) {
    console.error('Error in upload handler:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
