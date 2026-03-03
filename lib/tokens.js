const fs = require('fs');
const { ENV_PATH } = require('./config');

/**
 * Read ADMIN_TOKEN from .env file and parse the nonce from the custom 2-part JWT.
 * @returns {{ adminToken: string, nonce: string }}
 */
function readAdminToken() {
  if (!fs.existsSync(ENV_PATH)) {
    throw new Error('.env file not found. Run "node get-tokens.js" in Terminal first.');
  }

  const env = fs.readFileSync(ENV_PATH, 'utf8');
  const match = env.match(/ADMIN_TOKEN=(.+)/);
  if (!match) {
    throw new Error('ADMIN_TOKEN not found in .env. Run "node get-tokens.js" in Terminal first.');
  }

  const adminToken = match[1].trim();

  // Custom 2-part JWT: payload.signature
  const parts = adminToken.split('.');
  const base64 = parts[0];
  const padded = base64 + '==='.slice((base64.length + 3) % 4);
  const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  const nonce = payload.nonce;

  if (!nonce) {
    throw new Error('Could not parse nonce from ADMIN_TOKEN. Token may be malformed or expired.');
  }

  return { adminToken, nonce };
}

module.exports = { readAdminToken };
