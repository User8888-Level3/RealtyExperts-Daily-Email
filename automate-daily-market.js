#!/usr/bin/env node

/**
 * Automated Daily Market System
 *
 * Workflow:
 * 1. Take two local image files (RE-Daily-1-MMDDYY.png and RE-Daily-2-MMDDYY.png)
 * 2. Commit/push to GitHub repository 'RealtyExperts-Daily-Email'
 * 3. Wait for GitHub Pages URLs to be accessible
 * 4. Create Agent Hub post with title format and images
 * 5. Generate email HTML with Agent Hub URL
 * 6. Edit Agent Hub post to add email URL at top
 * 7. Generate QR code for Agent Hub post
 * 8. Update email with QR code
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

// Configuration
const CONFIG = {
  githubRepo: 'https://github.com/User8888-Level3/RealtyExperts-Daily-Email.git',
  githubPagesBase: 'https://user8888-level3.github.io/RealtyExperts-Daily-Email',
  githubRawBase: 'https://raw.githubusercontent.com/User8888-Level3/RealtyExperts-Daily-Email/main',
  agentHubApiBase: 'https://rdxzxokcbmmjjgyevqxq.supabase.co/functions/v1',
  agentHubWebBase: 'https://teamrealtyexperts.com',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeHp4b2tjYm1tampneWV2cXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwODY4NTEsImV4cCI6MjA4NDY2Mjg1MX0.oiIewgoknkmVCZ4NvU8ElkjrVPoIjT7pBjHCaABVsl4',
  maxRetries: 10,
  retryDelay: 5000, // 5 seconds
};

// Utility functions
function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    step: '📍'
  };
  console.log(`${icons[type]} ${message}`);
}

function isCI() {
  return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
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

function execCommand(command, description) {
  try {
    log(`${description}...`, 'step');
    const output = execSync(command, { encoding: 'utf-8' });
    return output.trim();
  } catch (error) {
    throw new Error(`Failed to ${description.toLowerCase()}: ${error.message}`);
  }
}

async function waitForUrl(url, maxRetries = CONFIG.maxRetries) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkUrl = () => {
      attempts++;
      log(`Checking URL availability (attempt ${attempts}/${maxRetries})...`, 'info');

      https.get(url, (res) => {
        if (res.statusCode === 200) {
          log(`URL is accessible: ${url}`, 'success');
          resolve(true);
        } else if (attempts < maxRetries) {
          log(`URL returned ${res.statusCode}, retrying in ${CONFIG.retryDelay/1000}s...`, 'warning');
          setTimeout(checkUrl, CONFIG.retryDelay);
        } else {
          reject(new Error(`URL not accessible after ${maxRetries} attempts: ${url}`));
        }
      }).on('error', (err) => {
        if (attempts < maxRetries) {
          log(`Request failed: ${err.message}, retrying in ${CONFIG.retryDelay/1000}s...`, 'warning');
          setTimeout(checkUrl, CONFIG.retryDelay);
        } else {
          reject(new Error(`URL not accessible after ${maxRetries} attempts: ${err.message}`));
        }
      });
    };

    checkUrl();
  });
}

async function loginAndGetToken(password) {
  log('Logging in to get fresh session token...', 'info');

  try {
    const response = await makeApiRequest(
      `${CONFIG.agentHubApiBase}/validate-session`,
      'POST',
      { password: password },
      {}
    );

    if (response.token) {
      log('Successfully logged in and obtained fresh token', 'success');
      return response.token;
    } else {
      throw new Error('Login successful but no token received');
    }
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
}

async function makeApiRequest(endpoint, method, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': CONFIG.supabaseAnonKey,
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API error (${res.statusCode}): ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function generateQRCode(noteId) {
  const QRCode = require('qrcode');
  const noteUrl = `${CONFIG.agentHubWebBase}/share/${noteId}`;
  const qrFilename = `note-qr-${noteId.slice(0, 8)}.png`;
  const qrPath = path.join(__dirname, qrFilename);

  await QRCode.toFile(qrPath, noteUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: '#2563eb',
      light: '#ffffff'
    }
  });

  return qrFilename;
}

// Main workflow steps
async function step1_verifyImages(dateStr) {
  log('STEP 1: Verifying image files exist', 'step');

  const genericImage1 = 'RE-Daily-1.png';
  const genericImage2 = 'RE-Daily-2.png';
  const image1 = `RE-Daily-1-${dateStr}.png`;
  const image2 = `RE-Daily-2-${dateStr}.png`;

  // Check if generic files exist and rename them
  if (fs.existsSync(genericImage1)) {
    log(`Found generic file: ${genericImage1}`, 'info');
    fs.renameSync(genericImage1, image1);
    log(`Renamed to: ${image1}`, 'success');
  }
  if (fs.existsSync(genericImage2)) {
    log(`Found generic file: ${genericImage2}`, 'info');
    fs.renameSync(genericImage2, image2);
    log(`Renamed to: ${image2}`, 'success');
  }

  // Verify dated files now exist
  if (!fs.existsSync(image1)) {
    throw new Error(`Image not found: ${image1}. Please provide either ${genericImage1} or ${image1}`);
  }
  if (!fs.existsSync(image2)) {
    throw new Error(`Image not found: ${image2}. Please provide either ${genericImage2} or ${image2}`);
  }

  log(`✓ ${image1}`, 'success');
  log(`✓ ${image2}`, 'success');

  return { image1, image2 };
}

async function step2_pushToGitHub(images, dateStr) {
  log('STEP 2: Committing and pushing images to GitHub', 'step');

  // Add files
  execCommand(`git add ${images.image1} ${images.image2}`, 'Staging images');

  // Skip commit/push in CI - let GitHub Actions workflow handle it
  if (isCI()) {
    log('Running in CI - files staged, workflow will commit/push', 'info');
    return;
  }

  // Check if there are changes to commit
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (!status.trim()) {
      log('No changes to commit (images already pushed)', 'warning');
      return;
    }
  } catch (e) {
    // Continue if status check fails
  }

  // Commit
  const commitMessage = `Add daily market images for ${dateStr}`;
  execCommand(`git commit -m "${commitMessage}"`, 'Creating commit');

  // Push
  execCommand('git push origin main', 'Pushing to GitHub');

  log('Images successfully pushed to GitHub', 'success');
}

async function step3_waitForGitHubPages(images, dateStr) {
  log('STEP 3: Waiting for GitHub Pages to update', 'step');

  const image1Url = `${CONFIG.githubRawBase}/${images.image1}`;
  const image2Url = `${CONFIG.githubRawBase}/${images.image2}`;

  await waitForUrl(image1Url);
  await waitForUrl(image2Url);

  log('GitHub Pages URLs are accessible', 'success');

  return { image1Url, image2Url };
}

async function step4_createAgentHubPost(imageUrls, dateInfo, sessionToken) {
  log('STEP 4: Creating Agent Hub post', 'step');

  const title = `"At a Glance" Local Housing STATS and News ${dateInfo.readable}`;

  // Read the JSON template for analysis content
  const templatePath = path.join(__dirname, 'daily-market-template.json');
  const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

  // Generate comprehensive HTML content
  const htmlContent = `
<div style="text-align: center; margin-bottom: 30px;">
  <img src="${imageUrls.image1Url}" alt="Local Housing Statistics" style="max-width: 100%; height: auto; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  <img src="${imageUrls.image2Url}" alt="Market Analysis Chart" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
</div>

<h2 style="color: #ea580c; border-left: 4px solid #ea580c; padding-left: 12px; margin: 30px 0 15px 0;">🏠 Real Estate Market Update</h2>
<div style="padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(234, 88, 12, 0.2);">
  <p><strong>30-Year Fixed:</strong> ${templateData.real_estate.rate_30year}</p>
  <p><strong>15-Year Fixed:</strong> ${templateData.real_estate.rate_15year}</p>
  <div style="margin-top: 15px; line-height: 1.8;">
    ${formatAnalysisText(templateData.real_estate.homebuilder)}
    ${formatAnalysisText(templateData.real_estate.commentary)}
  </div>
</div>

<h2 style="color: #2563eb; border-left: 4px solid #2563eb; padding-left: 12px; margin: 30px 0 15px 0;">📈 Stock Market</h2>
<div style="padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(37, 99, 235, 0.2);">
  <p><strong>S&P 500:</strong> ${templateData.stocks.sp500}</p>
  <p><strong>DOW:</strong> ${templateData.stocks.dow}</p>
  <p><strong>NASDAQ:</strong> ${templateData.stocks.nasdaq}</p>
  <p style="font-size: 12px; font-style: italic; opacity: 0.7;">${templateData.stocks.note}</p>
  <div style="margin-top: 15px; line-height: 1.8;">
    ${formatAnalysisText(templateData.stocks.news)}
  </div>
</div>

<h2 style="color: #16a34a; border-left: 4px solid #16a34a; padding-left: 12px; margin: 30px 0 15px 0;">💰 Economy</h2>
<div style="padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(22, 163, 74, 0.2);">
  <p><strong>US 10-Year:</strong> ${templateData.economy.us10year}</p>
  <p><strong>Gold:</strong> ${templateData.economy.gold}</p>
  <p><strong>Silver:</strong> ${templateData.economy.silver}</p>
  <p style="font-size: 12px; font-style: italic; opacity: 0.7;">${templateData.economy.note}</p>
  <div style="margin-top: 15px; line-height: 1.8;">
    ${formatAnalysisText(templateData.economy.commentary)}
  </div>
</div>

${templateData.crypto ? `
<h2 style="color: #f59e0b; border-left: 4px solid #f59e0b; padding-left: 12px; margin: 30px 0 15px 0;">₿ Cryptocurrency</h2>
<div style="padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(245, 158, 11, 0.2);">
  <p><strong>BTC:</strong> ${templateData.crypto.btc}</p>
  <p><strong>ETH:</strong> ${templateData.crypto.eth}</p>
  <p><strong>XRP:</strong> ${templateData.crypto.xrp}</p>
  <p style="font-size: 12px; font-style: italic; opacity: 0.7;">${templateData.crypto.note}</p>
  <div style="margin-top: 15px; line-height: 1.8;">
    ${formatAnalysisText(templateData.crypto.commentary)}
  </div>
</div>
` : ''}

<div style="margin-top: 30px; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; opacity: 0.8;">
  <p style="margin: 0; font-size: 13px;">
    <strong>Disclaimer:</strong> The market data, rates, and information provided are for informational purposes only and should not be considered financial advice. Always verify rates and data with your lender or financial advisor before making any decisions.
  </p>
</div>
`.trim();

  // Create the note via API
  const noteResponse = await makeApiRequest(
    `${CONFIG.agentHubApiBase}/notes-api`,
    'POST',
    {
      title: title,
      body: htmlContent,
      category: 'general',
      visibility: 'public',
      body_format: 'html'
    },
    {
      'x-session-token': sessionToken,
      'x-session-id': generateSessionId()
    }
  );

  const noteId = noteResponse.id;
  const noteUrl = `${CONFIG.agentHubWebBase}/share/${noteId}`;

  log(`Agent Hub post created: ${noteUrl}`, 'success');
  log(`Note ID: ${noteId}`, 'info');

  return { noteId, noteUrl, title };
}

async function step5_generateEmail(noteUrl, noteId, dateInfo) {
  log('STEP 5: Generating daily market email HTML', 'step');

  // Generate QR code first
  log('Generating QR code for Agent Hub post...', 'info');
  const qrFilename = await generateQRCode(noteId);

  // Push QR code to GitHub
  execCommand(`git add ${qrFilename}`, 'Staging QR code');

  // Skip commit/push in CI - let GitHub Actions workflow handle it
  if (!isCI()) {
    execCommand(`git commit -m "Add QR code for daily market ${dateInfo.mmddyy}"`, 'Committing QR code');
    execCommand('git push origin main', 'Pushing QR code');
  } else {
    log('Running in CI - QR code staged, workflow will commit/push', 'info');
  }

  // Wait for QR code to be available
  const qrUrl = `${CONFIG.githubRawBase}/${qrFilename}`;
  if (!isCI()) {
    await waitForUrl(qrUrl);
  } else {
    // In CI, QR code won't be available until workflow pushes, so skip wait
    log('Skipping QR code URL wait in CI mode', 'info');
  }

  log(`QR code available at: ${qrUrl}`, 'success');

  // Now modify the existing generate-daily-email.js to use the Agent Hub URL
  const templatePath = path.join(__dirname, 'daily-market-template.json');
  const generateScriptPath = path.join(__dirname, 'generate-daily-email.js');

  // Read the template and modify it to include the note URL
  const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

  // Backup the original script
  const scriptContent = fs.readFileSync(generateScriptPath, 'utf8');

  // Temporarily modify the script to inject the Agent Hub URL and QR code
  const modifiedScript = scriptContent
    .replace(
      /href="https:\/\/teamrealtyexperts\.com\/share\/[^"]*"/,
      `href="${noteUrl}"`
    )
    .replace(
      /note-qr-[a-f0-9]+\.png/g,
      qrFilename
    );

  fs.writeFileSync(generateScriptPath + '.tmp', modifiedScript);

  // Generate the HTML
  execCommand(`node ${generateScriptPath}.tmp ${templatePath}`, 'Generating email HTML');

  // Clean up temp file
  fs.unlinkSync(generateScriptPath + '.tmp');

  const htmlFileName = `daily-market-glance-${dateInfo.mmddyy}.html`;
  const emailUrl = `${CONFIG.githubPagesBase}/${htmlFileName}`;

  // Push the HTML file
  execCommand(`git add ${htmlFileName}`, 'Staging email HTML');

  // Skip commit/push in CI - let GitHub Actions workflow handle it
  if (!isCI()) {
    execCommand(`git commit -m "Add daily market email ${dateInfo.mmddyy}"`, 'Committing email');
    execCommand('git push origin main', 'Pushing email');
  } else {
    log('Running in CI - email HTML staged, workflow will commit/push', 'info');
  }

  // Wait for email to be available
  if (!isCI()) {
    await waitForUrl(emailUrl);
  } else {
    // In CI, email won't be available until workflow pushes, so skip wait
    log('Skipping email URL wait in CI mode', 'info');
  }

  log(`Email generated and available at: ${emailUrl}`, 'success');

  return { emailUrl, htmlFileName };
}

async function step6_updateAgentHubPost(noteId, emailUrl, sessionToken) {
  log('STEP 6: Updating Agent Hub post with email URL', 'step');

  // Fetch the existing note
  const noteResponse = await makeApiRequest(
    `${CONFIG.agentHubApiBase}/notes-api`,
    'POST',
    { action: 'get', id: noteId },
    {
      'x-session-token': sessionToken,
      'x-session-id': generateSessionId()
    }
  );

  const existingNote = noteResponse.note;

  // Prepend the email URL at the top
  const updatedBody = `
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center; box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);">
  <h3 style="margin: 0 0 12px 0; color: white; font-size: 20px;">📧 View Full Email Version</h3>
  <p style="margin: 0 0 15px 0; color: rgba(255,255,255,0.9); font-size: 14px;">Open in your browser for the complete formatted daily market update</p>
  <a href="${emailUrl}" style="display: inline-block; background: white; color: #667eea; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">Open Email in Browser</a>
</div>

${existingNote.body}
`.trim();

  // Update the note
  await makeApiRequest(
    `${CONFIG.agentHubApiBase}/notes-api/${noteId}`,
    'PUT',
    {
      title: existingNote.title,
      body: updatedBody,
      category: existingNote.category,
      visibility: existingNote.visibility,
      body_format: 'html'
    },
    {
      'x-session-token': sessionToken,
      'x-session-id': generateSessionId()
    }
  );

  log('Agent Hub post updated with email URL', 'success');
}

// Helper functions
function formatAnalysisText(text) {
  // Convert newlines to paragraphs and bullet points to HTML
  return text
    .split('\n\n')
    .map(para => {
      if (para.includes('•')) {
        const lines = para.split('\n').map(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('•')) {
            const colonMatch = trimmed.match(/^• ([^:]+):(.*)/);
            if (colonMatch) {
              return `<p style="margin: 8px 0;"><strong>${colonMatch[1]}:</strong>${colonMatch[2]}</p>`;
            }
            return `<p style="margin: 8px 0;">${trimmed}</p>`;
          }
          if (trimmed.startsWith('📍')) {
            return `<p style="margin: 15px 0 10px 0; font-weight: 700; font-size: 16px;">${trimmed}</p>`;
          }
          if (trimmed.endsWith(':')) {
            return `<p style="margin: 12px 0 8px 0; font-weight: 700;">${trimmed}</p>`;
          }
          return trimmed ? `<p style="margin: 8px 0;">${trimmed}</p>` : '';
        });
        return lines.join('');
      } else {
        const trimmed = para.trim();
        if (trimmed.startsWith('📍')) {
          return `<p style="margin: 15px 0 10px 0; font-weight: 700; font-size: 16px;">${trimmed}</p>`;
        }
        if (trimmed.endsWith(':')) {
          return `<p style="margin: 12px 0 8px 0; font-weight: 700;">${trimmed}</p>`;
        }
        return `<p style="margin: 8px 0;">${trimmed}</p>`;
      }
    })
    .join('');
}

function generateSessionId() {
  return 'automation-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Main execution
async function main() {
  console.log('\n🚀 AUTOMATED DAILY MARKET SYSTEM\n');
  console.log('='.repeat(60));

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const customDate = args[0]; // Optional: MMDDYY format
    let sessionToken = args[1] || process.env.ADMIN_SESSION_TOKEN;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // If no session token but we have a password, log in to get a fresh token
    if (!sessionToken && adminPassword) {
      log('No session token provided, logging in with password...', 'info');
      sessionToken = await loginAndGetToken(adminPassword);
    }

    if (!sessionToken) {
      throw new Error('Admin authentication required. Set either ADMIN_SESSION_TOKEN or ADMIN_PASSWORD env variable.');
    }

    // Get date info
    let dateInfo;
    if (customDate) {
      // Parse custom date (MMDDYY)
      const month = parseInt(customDate.slice(0, 2)) - 1;
      const day = parseInt(customDate.slice(2, 4));
      const year = 2000 + parseInt(customDate.slice(4, 6));
      dateInfo = formatDate(new Date(year, month, day));
    } else {
      dateInfo = formatDate();
    }

    log(`Processing daily market for: ${dateInfo.readable}`, 'info');
    log(`Date string: ${dateInfo.mmddyy}`, 'info');
    console.log('='.repeat(60) + '\n');

    // Execute workflow
    const images = await step1_verifyImages(dateInfo.mmddyy);
    await step2_pushToGitHub(images, dateInfo.mmddyy);
    const imageUrls = await step3_waitForGitHubPages(images, dateInfo.mmddyy);
    const { noteId, noteUrl, title } = await step4_createAgentHubPost(imageUrls, dateInfo, sessionToken);
    const { emailUrl, htmlFileName } = await step5_generateEmail(noteUrl, noteId, dateInfo);
    await step6_updateAgentHubPost(noteId, emailUrl, sessionToken);

    // Success summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ AUTOMATION COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   • Date: ${dateInfo.readable}`);
    console.log(`   • Agent Hub Post: ${noteUrl}`);
    console.log(`   • Email URL: ${emailUrl}`);
    console.log(`   • Subject: ${title}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    log(`Automation failed: ${error.message}`, 'error');
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, CONFIG };
