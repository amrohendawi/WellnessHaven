// Custom build script for Vercel deployment
console.log('🔧 Starting custom Vercel build process...');

// This script is executed by Vercel during the build process
// It helps ensure that the proper build steps are executed
// and that the output is structured correctly for Vercel

const { execSync } = require('child_process');

// Run build commands
try {
  // Run the client-side build only (not the server)
  console.log('📦 Building client assets...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Client build completed successfully');

  console.log('🚀 Build process completed');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
