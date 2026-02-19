/**
 * fetch-images.js
 * Downloads RE-Daily-1.png and RE-Daily-2.png from Google Drive (Raw-data folder)
 * using a service account key. No external dependencies — only Node.js built-ins.
 *
 * Usage: node fetch-images.js
 */

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEY_FILE = path.join(__dirname, 'harvrealtor-0819122f6566-google-drive.json');
const FILES_TO_FETCH = ['RE-Daily-1.png', 'RE-Daily-2.png'];

// ── JWT helpers ──────────────────────────────────────────────────────────────

function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function makeJwt(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsigned);
  const sig = sign.sign(credentials.private_key, 'base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${unsigned}.${sig}`;
}

// ── HTTP helpers ─────────────────────────────────────────────────────────────

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(body);
    const opts = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length,
      },
    };
    const req = https.request(url, opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve(JSON.parse(raw)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function httpsGet(url, token) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Authorization: `Bearer ${token}` } }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve(JSON.parse(raw)));
    }).on('error', reject);
  });
}

function downloadFile(url, token, dest) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { Authorization: `Bearer ${token}` } }, (res) => {
      // Follow redirect if needed
      if (res.statusCode === 302 || res.statusCode === 301) {
        return downloadFile(res.headers.location, token, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: HTTP ${res.statusCode}`));
        return;
      }
      const out = fs.createWriteStream(dest);
      res.pipe(out);
      out.on('finish', resolve);
      out.on('error', reject);
    });
    req.on('error', reject);
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Load credentials
  const creds = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));

  // 2. Get access token
  process.stdout.write('Authenticating with Google Drive... ');
  const jwt = makeJwt(creds);
  const tokenRes = await httpsPost(
    'https://oauth2.googleapis.com/token',
    `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  );
  if (!tokenRes.access_token) {
    console.error('FAILED\n', tokenRes);
    process.exit(1);
  }
  console.log('OK');
  const token = tokenRes.access_token;

  // 3. Download each file
  for (const filename of FILES_TO_FETCH) {
    process.stdout.write(`Searching for ${filename}... `);

    const q = encodeURIComponent(`name='${filename}' and trashed=false`);
    const listUrl = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=5`;
    const listRes = await httpsGet(listUrl, token);

    if (!listRes.files || listRes.files.length === 0) {
      console.log(`NOT FOUND — skipping`);
      continue;
    }

    const file = listRes.files[0];
    console.log(`found (id: ${file.id})`);

    process.stdout.write(`Downloading ${filename}... `);
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
    const dest = path.join(__dirname, filename);
    await downloadFile(downloadUrl, token, dest);
    console.log(`saved to ${filename}`);
  }

  console.log('\nDone. RE-Daily-1.png and RE-Daily-2.png are ready.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
