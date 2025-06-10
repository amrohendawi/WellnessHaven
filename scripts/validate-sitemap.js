#!/usr/bin/env node

/**
 * Sitemap Validation and Testing Script
 * Validates the generated sitemap against XML standards and SEO best practices
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  sitemapPath: path.join(__dirname, '../client/public/sitemap.xml'),
  baseUrl: 'https://dubai-rose.vercel.app',
};

/**
 * Validate XML structure
 */
function validateXMLStructure(content) {
  console.log('🔍 Validating XML structure...');

  const checks = [
    {
      test: content.startsWith('<?xml version="1.0" encoding="UTF-8"?>'),
      message: 'XML declaration with UTF-8 encoding',
      severity: 'error',
    },
    {
      test: content.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'),
      message: 'Valid sitemap namespace',
      severity: 'error',
    },
    {
      test: content.includes('</urlset>'),
      message: 'Properly closed urlset tag',
      severity: 'error',
    },
    {
      test: (content.match(/<url>/g) || []).length > 0,
      message: 'Contains URL entries',
      severity: 'error',
    },
    {
      test: (content.match(/<url>/g) || []).length === (content.match(/<\/url>/g) || []).length,
      message: 'All URL tags properly closed',
      severity: 'error',
    },
  ];

  let passed = 0;
  let failed = 0;

  checks.forEach(check => {
    if (check.test) {
      console.log(`  ✅ ${check.message}`);
      passed++;
    } else {
      console.log(`  ❌ ${check.message} (${check.severity})`);
      failed++;
    }
  });

  return { passed, failed, total: checks.length };
}

/**
 * Validate sitemap content and SEO best practices
 */
function validateSEOBestPractices(content) {
  console.log('\n🎯 Validating SEO best practices...');

  const urlCount = (content.match(/<url>/g) || []).length;
  const priorityValues = content.match(/<priority>([\d.]+)<\/priority>/g) || [];
  const lastmodDates = content.match(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g) || [];
  const changefreqValues = content.match(/<changefreq>(\w+)<\/changefreq>/g) || [];

  const checks = [
    {
      test: urlCount <= 50000,
      message: `URL count (${urlCount}) within sitemap limit`,
      severity: urlCount > 50000 ? 'error' : 'info',
    },
    {
      test: urlCount >= 30,
      message: `Good URL coverage (${urlCount} URLs)`,
      severity: urlCount < 10 ? 'warning' : 'info',
    },
    {
      test: priorityValues.length === urlCount,
      message: 'All URLs have priority values',
      severity: 'warning',
    },
    {
      test: lastmodDates.length === urlCount,
      message: 'All URLs have lastmod dates',
      severity: 'warning',
    },
    {
      test: changefreqValues.length === urlCount,
      message: 'All URLs have changefreq values',
      severity: 'warning',
    },
    {
      test: content.includes('<priority>1.0</priority>'),
      message: 'Homepage has highest priority (1.0)',
      severity: 'warning',
    },
    {
      test: (content.match(/<priority>0\.8<\/priority>/g) || []).length > 0,
      message: 'High-priority services identified',
      severity: 'info',
    },
  ];

  let passed = 0;
  let warnings = 0;
  let errors = 0;

  checks.forEach(check => {
    if (check.test) {
      console.log(`  ✅ ${check.message}`);
      passed++;
    } else {
      const icon = check.severity === 'error' ? '❌' : '⚠️';
      console.log(`  ${icon} ${check.message} (${check.severity})`);
      if (check.severity === 'error') errors++;
      else warnings++;
    }
  });

  return { passed, warnings, errors, total: checks.length };
}

/**
 * Check for common issues
 */
function checkCommonIssues(content) {
  console.log('\n🔧 Checking for common issues...');

  const issues = [];

  // Check for duplicate URLs
  const urls = [...content.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index);
  if (duplicates.length > 0) {
    issues.push(`Duplicate URLs found: ${duplicates.join(', ')}`);
  }

  // Check for invalid URLs
  const invalidUrls = urls.filter(url => !url.startsWith(CONFIG.baseUrl));
  if (invalidUrls.length > 0) {
    issues.push(`URLs with wrong base domain: ${invalidUrls.join(', ')}`);
  }

  // Check for missing essential pages
  const essentialPages = [
    `${CONFIG.baseUrl}/`,
    `${CONFIG.baseUrl}/services`,
    `${CONFIG.baseUrl}/contact`,
  ];

  const missingPages = essentialPages.filter(page => !urls.includes(page));
  if (missingPages.length > 0) {
    issues.push(`Missing essential pages: ${missingPages.join(', ')}`);
  }

  // Check priority distribution
  const priorities = [...content.matchAll(/<priority>([\d.]+)<\/priority>/g)].map(match =>
    Number.parseFloat(match[1])
  );
  const highPriority = priorities.filter(p => p >= 0.8).length;

  if (highPriority === 0) {
    issues.push('No high-priority pages (0.8+) found');
  }

  if (highPriority > priorities.length * 0.3) {
    issues.push('Too many high-priority pages (should be <30% of total)');
  }

  if (issues.length === 0) {
    console.log('  ✅ No common issues detected');
  } else {
    issues.forEach(issue => console.log(`  ⚠️ ${issue}`));
  }

  return issues;
}

/**
 * Generate validation report
 */
function generateReport(xmlResults, seoResults, issues) {
  console.log('\n📋 Validation Report');
  console.log('==================');

  console.log(`\n📊 XML Structure: ${xmlResults.passed}/${xmlResults.total} checks passed`);
  if (xmlResults.failed > 0) {
    console.log(`❌ ${xmlResults.failed} critical XML issues found`);
  }

  console.log(`\n🎯 SEO Best Practices: ${seoResults.passed}/${seoResults.total} checks passed`);
  if (seoResults.warnings > 0) {
    console.log(`⚠️ ${seoResults.warnings} warnings`);
  }
  if (seoResults.errors > 0) {
    console.log(`❌ ${seoResults.errors} errors`);
  }

  console.log(`\n🔧 Common Issues: ${issues.length} issues found`);

  // Overall grade
  const totalIssues = xmlResults.failed + seoResults.errors + issues.length;
  const totalWarnings = seoResults.warnings;

  console.log('\n🎖️ Overall Grade:');
  if (totalIssues === 0 && totalWarnings === 0) {
    console.log('  🌟 EXCELLENT - Ready for production!');
  } else if (totalIssues === 0 && totalWarnings <= 2) {
    console.log('  ✅ GOOD - Minor optimizations recommended');
  } else if (totalIssues <= 2) {
    console.log('  ⚠️ FAIR - Some issues need attention');
  } else {
    console.log('  ❌ POOR - Critical issues must be fixed');
  }

  return totalIssues === 0;
}

/**
 * Main validation function
 */
function validateSitemap() {
  console.log('🌟 Dubai Rose Sitemap Validator');
  console.log('===============================\n');

  try {
    // Check if sitemap exists
    if (!fs.existsSync(CONFIG.sitemapPath)) {
      console.error(`❌ Sitemap not found: ${CONFIG.sitemapPath}`);
      console.log('💡 Run "npm run sitemap:generate" to create it');
      return false;
    }

    // Read sitemap content
    const content = fs.readFileSync(CONFIG.sitemapPath, 'utf8');
    const fileSize = (content.length / 1024).toFixed(2);
    console.log(`📄 Sitemap loaded: ${CONFIG.sitemapPath} (${fileSize} KB)`);

    // Run validations
    const xmlResults = validateXMLStructure(content);
    const seoResults = validateSEOBestPractices(content);
    const issues = checkCommonIssues(content);

    // Generate report
    const isValid = generateReport(xmlResults, seoResults, issues);

    // Additional info
    console.log('\n📚 Next Steps:');
    console.log('  1. Submit to Google Search Console: https://search.google.com/search-console');
    console.log('  2. Submit to Bing Webmaster Tools: https://www.bing.com/webmasters');
    console.log('  3. Monitor indexing status in search engines');
    console.log(`  4. Add to robots.txt: Sitemap: ${CONFIG.baseUrl}/sitemap.xml`);

    return isValid;
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  const isValid = validateSitemap();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateSitemap };
