#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');
const { TEMPLATE_PATH } = require('./lib/config');
const { readAdminToken } = require('./lib/tokens');

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      if (normalized === 'n' || normalized === 'no') {
        console.log('\nAborted by user.');
        process.exit(0);
      }
      resolve();
    });
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('  REALTY EXPERTS\u00ae Daily Market Glance - Workflow Runner');
  console.log('='.repeat(60));

  // --- PRE-FLIGHT CHECKS ---
  console.log('\nPre-flight checks...');

  // Check .env and token
  try {
    readAdminToken();
    console.log('  \u2705 ADMIN_TOKEN found in .env');
  } catch (err) {
    console.error(`  \u274c ${err.message}`);
    process.exit(1);
  }

  // Check JSON template
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error('  \u274c daily-market-template.json not found');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(TEMPLATE_PATH, 'utf8'));
  console.log(`  \u2705 JSON template loaded (date: ${data.date})`);

  // Check images
  const dateShort = data.date.replace(/\//g, '');
  const hasFreshImages = fs.existsSync('RE-Daily-1.png') && fs.existsSync('RE-Daily-2.png');
  const hasDatedImages = fs.existsSync(`RE-Daily-1-${dateShort}.png`) && fs.existsSync(`RE-Daily-2-${dateShort}.png`);

  if (hasFreshImages) {
    console.log('  \u2705 Fresh images found (RE-Daily-1.png, RE-Daily-2.png)');
  } else if (hasDatedImages) {
    console.log(`  \u2705 Dated images found (RE-Daily-1-${dateShort}.png, RE-Daily-2-${dateShort}.png)`);
  } else {
    console.warn('  \u26a0\ufe0f  No images found. Run "node fetch-images.js" first.');
  }

  console.log('\n' + '-'.repeat(60));

  // ========== STAGE 1: CREATE AGENT HUB POST ==========
  console.log('\n\ud83d\udce1 STAGE 1: Creating Agent Hub Post + QR Code\n');

  // Import and run create-post directly (no shell needed)
  const { main: createPost } = require('./create-post');
  await createPost();

  // Re-read JSON to get updated post info
  const updatedData = JSON.parse(fs.readFileSync(TEMPLATE_PATH, 'utf8'));
  console.log(`\n\ud83d\udd17 Verify post: ${updatedData.agent_hub_link}`);

  await ask('\nStage 1 complete. Continue to generate email? [Y/n] ');

  // ========== STAGE 2: RENAME IMAGES + GENERATE EMAIL ==========
  console.log('\n' + '-'.repeat(60));
  console.log('\n\ud83d\udce7 STAGE 2: Generating HTML Email\n');

  // Rename images if undated originals exist
  if (fs.existsSync('RE-Daily-1.png')) {
    const dest1 = `RE-Daily-1-${dateShort}.png`;
    const dest2 = `RE-Daily-2-${dateShort}.png`;
    fs.copyFileSync('RE-Daily-1.png', dest1);
    fs.copyFileSync('RE-Daily-2.png', dest2);
    fs.unlinkSync('RE-Daily-1.png');
    fs.unlinkSync('RE-Daily-2.png');
    console.log(`  Renamed images: RE-Daily-1.png \u2192 ${dest1}`);
    console.log(`  Renamed images: RE-Daily-2.png \u2192 ${dest2}`);
  } else {
    console.log(`  Using existing dated images.`);
  }

  // Generate HTML email (runs as child process since it writes at module level)
  // Using hardcoded command — no user input involved
  execSync('node generate-daily-email.js daily-market-template.json', { stdio: 'inherit' });

  const emailFile = `daily-market-glance-${dateShort}.html`;
  console.log(`\n\ud83c\udf10 Open to verify: ${emailFile}`);

  await ask('\nStage 2 complete. Continue to update inventory + commit? [Y/n] ');

  // ========== STAGE 3: UPDATE INVENTORY + GIT ==========
  console.log('\n' + '-'.repeat(60));
  console.log('\n\ud83d\udcca STAGE 3: Updating Inventory + Git Commit\n');

  // Update todays-inventory
  const { main: updateInventory } = require('./update-inventory');
  await updateInventory();

  console.log('\n\ud83d\udce6 Committing and pushing...\n');

  // Git operations — all hardcoded commands, no user input
  const qrFile = updatedData.qr_code_path;
  const filesToAdd = [
    emailFile,
    `RE-Daily-1-${dateShort}.png`,
    `RE-Daily-2-${dateShort}.png`,
    qrFile,
    'daily-market-template.json',
  ].filter(f => fs.existsSync(f));

  execSync(`git add ${filesToAdd.join(' ')}`, { stdio: 'inherit' });
  execSync(`git commit -m "Daily email - ${data.date}"`, { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('  \u2705 ALL DONE!');
  console.log('='.repeat(60));
  console.log(`\n  \ud83d\udce7 Email:     ${emailFile}`);
  console.log(`  \ud83c\udf10 Web View:  https://user8888-level3.github.io/RealtyExperts-Daily-Email/${emailFile}`);
  console.log(`  \ud83d\udcf1 Agent Hub: ${updatedData.agent_hub_link}`);
  console.log(`  \ud83d\udcf7 QR Code:   ${qrFile}`);
  console.log(`\n  Subject: \u201cAt a Glance\u201d Local Housing STATS and News ${data.date}`);
  console.log(`\n  Next: Open ${emailFile} and copy/paste into Outlook.\n`);
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
