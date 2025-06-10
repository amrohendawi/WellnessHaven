#!/usr/bin/env node

/**
 * Dynamic Sitemap Generator for Dubai Rose Beauty Center
 * Automatically generates sitemap.xml from services and service groups data
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'https://dubairose.com',
  outputPath: path.join(__dirname, '../client/public/sitemap.xml'),
  servicesDataPath: path.join(__dirname, 'data/services.json'),
  serviceGroupsDataPath: path.join(__dirname, 'data/service-groups.json'),
  lastModDate: new Date().toISOString().split('T')[0],
};

// High-demand services that should get priority 0.8
const HIGH_DEMAND_SERVICES = [
  'hydrafacial-treatment',
  'laser-hair-removal',
  'eyelash-extensions-classic-volume',
  'permanent-makeup-eyebrows',
  'professional-makeup-application',
  'bridal-beauty-package',
];

/**
 * Load JSON data from file
 */
function loadJsonData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Generate XML URL entry
 */
function generateUrlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * Generate sitemap XML content
 */
function generateSitemap() {
  console.log('🚀 Starting sitemap generation...');

  const services = loadJsonData(CONFIG.servicesDataPath);
  const serviceGroups = loadJsonData(CONFIG.serviceGroupsDataPath);

  console.log(`📊 Loaded ${services.length} services and ${serviceGroups.length} service groups`);

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Pages -->`;

  // Add main pages
  sitemap += '\n' + generateUrlEntry(`${CONFIG.baseUrl}/`, CONFIG.lastModDate, 'weekly', 1.0);
  sitemap +=
    '\n' + generateUrlEntry(`${CONFIG.baseUrl}/services`, CONFIG.lastModDate, 'weekly', 0.9);

  // Add service category pages
  sitemap += '\n\n  <!-- Service Category Pages -->';
  for (const group of serviceGroups.filter(g => g.isActive)) {
    sitemap +=
      '\n' +
      generateUrlEntry(
        `${CONFIG.baseUrl}/services/${group.slug}`,
        CONFIG.lastModDate,
        'monthly',
        0.7
      );
  }

  // Add high-priority services
  const highPriorityServices = services.filter(
    service => service.isActive && HIGH_DEMAND_SERVICES.includes(service.slug)
  );

  if (highPriorityServices.length > 0) {
    sitemap += '\n\n  <!-- High-Priority Individual Services -->';
    for (const service of highPriorityServices) {
      sitemap +=
        '\n' +
        generateUrlEntry(
          `${CONFIG.baseUrl}/services/${service.slug}`,
          CONFIG.lastModDate,
          'monthly',
          0.8
        );
    }
  }

  // Add other services
  const otherServices = services.filter(
    service => service.isActive && !HIGH_DEMAND_SERVICES.includes(service.slug)
  );

  if (otherServices.length > 0) {
    sitemap += '\n\n  <!-- Other Individual Services -->';
    for (const service of otherServices) {
      const priority = service.category === 'bridal-special-occasion-packages' ? 0.7 : 0.6;
      sitemap +=
        '\n' +
        generateUrlEntry(
          `${CONFIG.baseUrl}/services/${service.slug}`,
          CONFIG.lastModDate,
          'monthly',
          priority
        );
    }
  }

  // Add static pages
  sitemap += '\n\n  <!-- Other Important Pages -->';
  const staticPages = [
    { path: '/membership', priority: 0.6 },
    { path: '/contact', priority: 0.6 },
    { path: '/about', priority: 0.5 },
  ];

  for (const page of staticPages) {
    sitemap +=
      '\n' +
      generateUrlEntry(
        `${CONFIG.baseUrl}${page.path}`,
        CONFIG.lastModDate,
        'monthly',
        page.priority
      );
  }

  sitemap += '\n</urlset>\n';
  return sitemap;
}

/**
 * Write sitemap to file
 */
function writeSitemap(content) {
  try {
    const dir = path.dirname(CONFIG.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(CONFIG.outputPath, content, 'utf8');
    console.log(`✅ Sitemap generated successfully: ${CONFIG.outputPath}`);

    const urlCount = (content.match(/<url>/g) || []).length;
    console.log(`📈 Generated ${urlCount} URLs in sitemap`);

    return true;
  } catch (error) {
    console.error('❌ Error writing sitemap:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🌟 Dubai Rose Sitemap Generator');
  console.log('================================\n');

  try {
    const sitemapContent = generateSitemap();

    if (!writeSitemap(sitemapContent)) {
      process.exit(1);
    }

    console.log('\n🎉 Sitemap generation completed successfully!');
  } catch (error) {
    console.error('\n❌ Sitemap generation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
