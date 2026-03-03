#!/usr/bin/env node

const fs = require('fs');
const QRCode = require('qrcode');
const { TEMPLATE_PATH } = require('./lib/config');
const { readAdminToken } = require('./lib/tokens');
const { notesApiPost } = require('./lib/api');
const { buildPost } = require('./templates/agent-hub-post');

async function main() {
  // 1. Read JSON template
  const data = JSON.parse(fs.readFileSync(TEMPLATE_PATH, 'utf8'));
  console.log(`Creating Agent Hub post for ${data.date}...`);

  // 2. Read admin token
  const { adminToken, nonce } = readAdminToken();

  // 3. Build post content from template
  const { title, body } = buildPost(data);

  // 4. Create post via notes-api
  const response = await notesApiPost({
    title,
    body,
    category: ['at-a-glance'],
    visibility: 'public',
    body_format: 'html',
    author_name: 'REALTY EXPERTS',
  }, adminToken, nonce);

  const postId = response.id;
  if (!postId) {
    console.error('Error: No post ID returned. Token may be expired.');
    console.error('Response:', JSON.stringify(response, null, 2));
    console.error('Run "node get-tokens.js" in Terminal and try again.');
    process.exit(1);
  }

  const shortId = postId.substring(0, 8);
  const shareUrl = `https://teamrealtyexperts.com/share/${postId}`;
  const qrFile = `note-qr-${shortId}.png`;

  console.log(`\n\u2705 Post created!`);
  console.log(`   Post ID:   ${postId}`);
  console.log(`   Share URL: ${shareUrl}`);

  // 5. Generate QR code
  await new Promise((resolve, reject) => {
    QRCode.toFile(qrFile, shareUrl, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: 'M',
    }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log(`   QR Code:   ${qrFile}`);

  // 6. Write back to JSON template
  data.agent_hub_link = shareUrl;
  data.qr_code_path = qrFile;
  fs.writeFileSync(TEMPLATE_PATH, JSON.stringify(data, null, 2));
  console.log(`\n\u2705 JSON template updated with new post ID and QR path.`);

  return { postId, shortId, shareUrl, qrFile };
}

// Allow both standalone execution and require() from orchestrator
if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { main };
