#!/usr/bin/env node

/**
 * Test Mode for Daily Market Automation
 *
 * This script simulates the automation workflow without making any actual changes.
 * Use this to verify your setup before running the real automation.
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatDate(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return {
    mmddyy: `${month}${day}${year}`,
    slashed: `${month}/${day}/${year}`,
    readable: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  };
}

async function runTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  log('║         🧪 Daily Market Automation - TEST MODE 🧪         ║', 'blue');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  let allPassed = true;
  let warnings = [];

  // Parse arguments
  const args = process.argv.slice(2);
  const customDate = args[0];
  const dateInfo = customDate
    ? formatDate(new Date(2000 + parseInt(customDate.slice(4, 6)), parseInt(customDate.slice(0, 2)) - 1, parseInt(customDate.slice(2, 4))))
    : formatDate();

  log(`Testing configuration for: ${dateInfo.readable}`, 'blue');
  log(`Date string: ${dateInfo.mmddyy}\n`, 'blue');

  // Test 1: Check image files
  log('TEST 1: Checking for image files...', 'yellow');
  const image1 = `RE-Daily-1-${dateInfo.mmddyy}.png`;
  const image2 = `RE-Daily-2-${dateInfo.mmddyy}.png`;

  if (fs.existsSync(image1)) {
    log(`  ✓ Found: ${image1}`, 'green');
    const stats1 = fs.statSync(image1);
    log(`    Size: ${(stats1.size / 1024).toFixed(2)} KB`, 'reset');
  } else {
    log(`  ✗ Missing: ${image1}`, 'red');
    allPassed = false;
  }

  if (fs.existsSync(image2)) {
    log(`  ✓ Found: ${image2}`, 'green');
    const stats2 = fs.statSync(image2);
    log(`    Size: ${(stats2.size / 1024).toFixed(2)} KB`, 'reset');
  } else {
    log(`  ✗ Missing: ${image2}`, 'red');
    allPassed = false;
  }

  // Test 2: Check template file
  log('\nTEST 2: Checking template file...', 'yellow');
  const templatePath = 'daily-market-template.json';

  if (fs.existsSync(templatePath)) {
    log(`  ✓ Found: ${templatePath}`, 'green');
    try {
      const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      log(`    Date in template: ${template.date}`, 'reset');

      // Validate template structure
      const requiredFields = ['date', 'time', 'stocks', 'economy', 'real_estate'];
      const missingFields = requiredFields.filter(field => !template[field]);

      if (missingFields.length > 0) {
        log(`  ⚠ Missing template fields: ${missingFields.join(', ')}`, 'yellow');
        warnings.push(`Template missing fields: ${missingFields.join(', ')}`);
      }

      // Check if template date matches test date
      if (template.date !== dateInfo.slashed) {
        log(`  ⚠ Template date (${template.date}) doesn't match test date (${dateInfo.slashed})`, 'yellow');
        warnings.push('Template date mismatch');
      }
    } catch (e) {
      log(`  ✗ Invalid JSON in template: ${e.message}`, 'red');
      allPassed = false;
    }
  } else {
    log(`  ✗ Missing: ${templatePath}`, 'red');
    allPassed = false;
  }

  // Test 3: Check Git configuration
  log('\nTEST 3: Checking Git configuration...', 'yellow');
  const { execSync } = require('child_process');

  try {
    const gitUserName = execSync('git config user.name', { encoding: 'utf8' }).trim();
    const gitUserEmail = execSync('git config user.email', { encoding: 'utf8' }).trim();
    log(`  ✓ Git user: ${gitUserName} <${gitUserEmail}>`, 'green');

    // Check remote
    const gitRemote = execSync('git remote -v', { encoding: 'utf8' }).trim();
    if (gitRemote.includes('RealtyExperts-Daily-Email')) {
      log(`  ✓ Git remote configured correctly`, 'green');
    } else {
      log(`  ✗ Git remote not configured for RealtyExperts-Daily-Email`, 'red');
      allPassed = false;
    }

    // Check current branch
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    if (branch === 'main') {
      log(`  ✓ On main branch`, 'green');
    } else {
      log(`  ⚠ Not on main branch (currently on: ${branch})`, 'yellow');
      warnings.push('Not on main branch');
    }
  } catch (e) {
    log(`  ✗ Git not configured: ${e.message}`, 'red');
    allPassed = false;
  }

  // Test 4: Check Node.js and dependencies
  log('\nTEST 4: Checking Node.js and dependencies...', 'yellow');

  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (nodeMajor >= 14) {
    log(`  ✓ Node.js version: ${nodeVersion}`, 'green');
  } else {
    log(`  ✗ Node.js version ${nodeVersion} is too old (need >= 14.0.0)`, 'red');
    allPassed = false;
  }

  if (fs.existsSync('package.json')) {
    log(`  ✓ Found: package.json`, 'green');

    if (fs.existsSync('node_modules')) {
      log(`  ✓ Dependencies installed`, 'green');

      // Check for qrcode
      if (fs.existsSync('node_modules/qrcode')) {
        log(`  ✓ QRCode package installed`, 'green');
      } else {
        log(`  ✗ QRCode package not found`, 'red');
        log(`    Run: npm install --cache /tmp/npm-cache-temp`, 'yellow');
        allPassed = false;
      }
    } else {
      log(`  ✗ Dependencies not installed`, 'red');
      log(`    Run: npm install --cache /tmp/npm-cache-temp`, 'yellow');
      allPassed = false;
    }
  } else {
    log(`  ✗ Missing: package.json`, 'red');
    allPassed = false;
  }

  // Test 5: Check automation script
  log('\nTEST 5: Checking automation scripts...', 'yellow');

  const scripts = [
    'automate-daily-market.js',
    'generate-daily-email.js',
    'run-daily-automation.sh'
  ];

  scripts.forEach(script => {
    if (fs.existsSync(script)) {
      const stats = fs.statSync(script);
      const isExecutable = (stats.mode & 0o111) !== 0;
      log(`  ✓ Found: ${script} ${isExecutable ? '(executable)' : ''}`, 'green');

      if (script.endsWith('.sh') && !isExecutable) {
        log(`    ⚠ Not executable. Run: chmod +x ${script}`, 'yellow');
        warnings.push(`${script} not executable`);
      }
    } else {
      log(`  ✗ Missing: ${script}`, 'red');
      allPassed = false;
    }
  });

  // Test 6: Check session token
  log('\nTEST 6: Checking session token...', 'yellow');

  const sessionToken = process.env.ADMIN_SESSION_TOKEN || args[1];

  if (sessionToken) {
    log(`  ✓ Session token provided`, 'green');
    log(`    Token length: ${sessionToken.length} characters`, 'reset');
    log(`    Token preview: ${sessionToken.slice(0, 30)}...`, 'reset');

    if (sessionToken.length < 50) {
      log(`  ⚠ Token seems short - verify it's complete`, 'yellow');
      warnings.push('Session token may be incomplete');
    }
  } else {
    log(`  ⚠ No session token provided`, 'yellow');
    log(`    This is OK for testing, but required for actual automation`, 'reset');
    warnings.push('No session token (required for real run)');
  }

  // Test 7: Simulate GitHub URLs
  log('\nTEST 7: Simulating GitHub URLs...', 'yellow');

  const githubBaseUrl = 'https://raw.githubusercontent.com/User8888-Level3/RealtyExperts-Daily-Email/main';
  const image1Url = `${githubBaseUrl}/${image1}`;
  const image2Url = `${githubBaseUrl}/${image2}`;
  const emailUrl = `https://user8888-level3.github.io/RealtyExperts-Daily-Email/daily-market-glance-${dateInfo.mmddyy}.html`;

  log(`  Image 1 URL would be:`, 'green');
  log(`    ${image1Url}`, 'reset');
  log(`  Image 2 URL would be:`, 'green');
  log(`    ${image2Url}`, 'reset');
  log(`  Email URL would be:`, 'green');
  log(`    ${emailUrl}`, 'reset');

  // Test 8: Simulate Agent Hub post
  log('\nTEST 8: Simulating Agent Hub post...', 'yellow');

  const noteTitle = `"At a Glance" Local Housing STATS and News ${dateInfo.readable}`;
  const noteUrl = `https://teamrealtyexperts.com/share/[NOTE_ID]`;

  log(`  Title would be:`, 'green');
  log(`    ${noteTitle}`, 'reset');
  log(`  URL would be:`, 'green');
  log(`    ${noteUrl}`, 'reset');

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');

  if (allPassed) {
    log('\n✅ ALL TESTS PASSED!', 'green');
    if (warnings.length > 0) {
      log(`\n⚠️  Warnings (${warnings.length}):`, 'yellow');
      warnings.forEach((w, i) => log(`  ${i + 1}. ${w}`, 'yellow'));
    }
    log('\nYour setup looks good! Ready to run the actual automation.\n', 'green');
    log('Next step:', 'blue');
    log('  ./run-daily-automation.sh', 'green');
  } else {
    log('\n❌ SOME TESTS FAILED', 'red');
    log('\nPlease fix the issues above before running the automation.', 'yellow');
    log('See AUTOMATION-README.md for help.\n', 'yellow');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════════════\n');
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Test script error: ${error.message}`, 'red');
  process.exit(1);
});
