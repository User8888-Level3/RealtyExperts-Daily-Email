#!/usr/bin/env node

const fs = require('fs');
const { TEMPLATE_PATH, GITHUB_RAW_BASE, GITHUB_PAGES_BASE, CHART_HTML_PATH } = require('./lib/config');
const { readAdminToken } = require('./lib/tokens');
const { glanceApiUpdate } = require('./lib/api');
const { banner } = require('./lib/html-builders');

async function main() {
  // 1. Read JSON template
  const data = JSON.parse(fs.readFileSync(TEMPLATE_PATH, 'utf8'));
  const dateShort = data.date.replace(/\//g, '');

  console.log(`Updating todays-inventory for ${data.date}...\n`);

  // 2. Read admin token
  const { adminToken } = readAdminToken();

  // 3. Build URLs
  const emailUrl = `${GITHUB_PAGES_BASE}/daily-market-glance-${dateShort}.html`;
  const img1Url = `${GITHUB_RAW_BASE}/RE-Daily-1-${dateShort}.png`;
  const img2Url = `${GITHUB_RAW_BASE}/RE-Daily-2-${dateShort}.png`;

  // 4. Update news banner
  const bannerHTML = banner(data.date, emailUrl);
  console.log('  Updating news (banner)...');
  await glanceApiUpdate('news', bannerHTML, adminToken);
  console.log('  \u2705 news updated');

  // 5. Update images (must pass both content AND image_url)
  console.log('  Updating image_1...');
  await glanceApiUpdate('image_1', img1Url, adminToken, img1Url);
  console.log('  \u2705 image_1 updated');

  console.log('  Updating image_2...');
  await glanceApiUpdate('image_2', img2Url, adminToken, img2Url);
  console.log('  \u2705 image_2 updated');

  // 6. Update chart HTML
  if (fs.existsSync(CHART_HTML_PATH)) {
    console.log('  Updating html_display (chart)...');
    const chartHTML = fs.readFileSync(CHART_HTML_PATH, 'utf8');
    await glanceApiUpdate('html_display', chartHTML, adminToken);
    console.log('  \u2705 html_display updated');
  } else {
    console.warn(`  \u26a0\ufe0f  Chart file not found at: ${CHART_HTML_PATH}`);
    console.warn('  Skipping html_display update.');
  }

  console.log('\n\u2705 All todays-inventory fields updated!');
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { main };
