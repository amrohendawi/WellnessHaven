#!/usr/bin/env node

/**
 * Pre-build hook to generate sitemap before building the application
 * This ensures the sitemap is always up-to-date in production builds
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Running pre-build hook: Generating sitemap...');

try {
  // Generate sitemap
  execSync('node scripts/generate-sitemap.js', {
    stdio: 'inherit',
    cwd: path.dirname(__dirname),
  });

  console.log('✅ Pre-build hook completed successfully');
} catch (error) {
  console.error('❌ Pre-build hook failed:', error.message);
  process.exit(1);
}
