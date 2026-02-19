/**
 * get-tokens.js
 * Decrypts credentials and logs in to fetch fresh agent + admin tokens.
 * Saves them to .env for use by other scripts.
 * Tokens expire every ~4 hours, so run this at the start of each session.
 *
 * Usage: node get-tokens.js
 */

const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

const CREDS_FILE = path.join(__dirname, '.credentials.enc');
const ENV_FILE = path.join(__dirname, '.env');
const SUPABASE_HOST = 'rdxzxokcbmmjjgyevqxq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeHp4b2tjYm1tampneWV2cXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwODY4NTEsImV4cCI6MjA4NDY2Mjg1MX0.oiIewgoknkmVCZ4NvU8ElkjrVPoIjT7pBjHCaABVsl4';

// ── Crypto helpers ────────────────────────────────────────────────────────────

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 200000, 32, 'sha256');
}

function decrypt(encryptedB64, password) {
  const buf = Buffer.from(encryptedB64, 'base64');
  const salt = buf.slice(0, 32);
  const iv = buf.slice(32, 44);
  const tag = buf.slice(44, 60);
  const ciphertext = buf.slice(60);
  const key = deriveKey(password, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext) + decipher.final('utf8');
}

// ── Password prompt (hidden input) ────────────────────────────────────────────

function promptPassword(msg) {
  return new Promise((resolve) => {
    process.stdout.write(msg);
    process.stdin.resume();
    process.stdin.setRawMode(true);
    let password = '';
    process.stdin.on('data', function handler(char) {
      char = char + '';
      if (char === '\n' || char === '\r' || char === '\u0004') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', handler);
        process.stdout.write('\n');
        resolve(password);
      } else if (char === '\u0003') {
        process.exit();
      } else if (char === '\u007f') {
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        password += char;
        process.stdout.write('*');
      }
    });
  });
}

// ── API call ──────────────────────────────────────────────────────────────────

function validateCode(code, loginType) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ code, loginType });
    const opts = {
      hostname: SUPABASE_HOST,
      path: '/functions/v1/validate-access-code',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'apikey': SUPABASE_ANON_KEY,
        'authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    };
    const req = https.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (res.statusCode === 200) resolve(parsed);
          else reject(new Error(`${loginType} login failed (${res.statusCode}): ${raw}`));
        } catch {
          reject(new Error(`Could not parse response: ${raw}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(CREDS_FILE)) {
    console.error('No credentials file found. Run "node setup-credentials.js" first.');
    process.exit(1);
  }

  const password = await promptPassword('Encryption password: ');

  let creds;
  try {
    const encrypted = fs.readFileSync(CREDS_FILE, 'utf8');
    creds = JSON.parse(decrypt(encrypted, password));
  } catch {
    console.error('Wrong password or corrupted file.');
    process.exit(1);
  }

  console.log('\nLogging in...');

  // Agent login
  process.stdout.write('  Agent token... ');
  const agentRes = await validateCode(creds.agentCode, 'agent');
  const agentToken = agentRes.token || agentRes.sessionToken || agentRes.access_token;
  if (!agentToken) throw new Error('No token in agent response: ' + JSON.stringify(agentRes));
  console.log('OK');

  // Admin login
  process.stdout.write('  Admin token... ');
  const adminRes = await validateCode(creds.adminCode, 'admin');
  const adminToken = adminRes.token || adminRes.sessionToken || adminRes.access_token;
  if (!adminToken) throw new Error('No token in admin response: ' + JSON.stringify(adminRes));
  console.log('OK');

  // Save to .env
  const envContent = `AGENT_TOKEN=${agentToken}\nADMIN_TOKEN=${adminToken}\n`;
  fs.writeFileSync(ENV_FILE, envContent, 'utf8');

  console.log('\nTokens saved to .env — ready to go.\n');
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
