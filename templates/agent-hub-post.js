const { GITHUB_RAW_BASE, GITHUB_PAGES_BASE } = require('../lib/config');
const { buildPostBody } = require('../lib/html-builders');

/**
 * Build Agent Hub post title and body from JSON template data.
 * @param {Object} data - Parsed daily-market-template.json
 * @returns {{ title: string, body: string, emailUrl: string, img1Url: string, img2Url: string }}
 */
function buildPost(data) {
  const dateShort = data.date.replace(/\//g, '');
  const emailUrl = `${GITHUB_PAGES_BASE}/daily-market-glance-${dateShort}.html`;
  const img1Url = `${GITHUB_RAW_BASE}/RE-Daily-1-${dateShort}.png`;
  const img2Url = `${GITHUB_RAW_BASE}/RE-Daily-2-${dateShort}.png`;

  // Title with smart/curly quotes
  const title = `\u201cAt a Glance\u201d Local Housing STATS and News ${data.date}`;
  const body = buildPostBody(data, emailUrl, img1Url, img2Url);

  return { title, body, emailUrl, img1Url, img2Url };
}

module.exports = { buildPost };
