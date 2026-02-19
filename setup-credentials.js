/**
 * setup-credentials.js
 * One-time setup: encrypts your agent + admin access codes and saves to
 * .credentials.enc (AES-256-GCM). Run this once, then never again unless
 * your codes change.
 *
 * Usage: node setup-credentials.js
 */

const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline');

const OUT_FILE = '.credentials.enc';

function prompt(rl, question, hidden = false) {
  return new Promise((resolve) => {
    if (hidden) {
      process.stdout.write(question);
      // Suppress echo for password input
      const stdin = process.openStdin();
      process.stdin.setRawMode(true);
      let input = '';
      process.stdin.on('data', function handler(char) {
        char = char + '';
        if (char === '\n' || char === '\r' || char === '\u0004') {
          process.stdin.setRawMode(false);
          process.stdin.removeListener('data', handler);
          process.stdout.write('\n');
          resolve(input);
        } else if (char === '\u0003') {
          process.exit();
        } else if (char === '\u007f') {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          input += char;
          process.stdout.write('*');
        }
      });
    } else {
      rl.question(question, resolve);
    }
  });
}

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 200000, 32, 'sha256');
}

function encrypt(plaintext, password) {
  const salt = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const key = deriveKey(password, salt);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: salt(32) + iv(12) + tag(16) + ciphertext
  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

async function main() {
  console.log('\n=== REALTY EXPERTS — Credential Setup ===\n');
  console.log('Your credentials will be encrypted and saved locally.');
  console.log('They are never sent anywhere or stored in plain text.\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const agentCode = await prompt(rl, 'Agent access code: ');
  const adminCode = await prompt(rl, 'Admin access code: ');

  rl.close();

  // Password input (hidden)
  process.stdout.write('\nChoose an encryption password (you\'ll enter this each morning): ');
  process.stdin.resume();
  process.stdin.setRawMode(true);
  let password = '';
  await new Promise((resolve) => {
    process.stdin.on('data', function handler(char) {
      char = char + '';
      if (char === '\n' || char === '\r' || char === '\u0004') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', handler);
        process.stdout.write('\n');
        resolve();
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

  if (!agentCode || !adminCode || !password) {
    console.error('\nAll fields are required. Aborted.');
    process.exit(1);
  }

  const payload = JSON.stringify({ agentCode, adminCode });
  const encrypted = encrypt(payload, password);
  fs.writeFileSync(OUT_FILE, encrypted, 'utf8');

  console.log(`\nSaved to ${OUT_FILE}`);
  console.log('Run "node get-tokens.js" each morning to fetch fresh tokens.\n');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
