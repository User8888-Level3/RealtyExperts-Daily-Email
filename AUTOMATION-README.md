# 🤖 Automated Daily Market System

Complete automation system for creating and publishing daily market updates across GitHub Pages and the REALTY EXPERTS Agent Hub.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Workflow Details](#workflow-details)
- [Troubleshooting](#troubleshooting)
- [Configuration](#configuration)

## 🎯 Overview

This automation system handles the entire workflow for creating daily market updates:

1. **Image Management**: Commits and pushes daily market images to GitHub
2. **GitHub Pages**: Waits for images to be available via GitHub Pages
3. **Agent Hub Post**: Creates a formatted post with images and market analysis
4. **Email Generation**: Generates HTML email with Agent Hub link and QR code
5. **Cross-Reference**: Updates Agent Hub post with email browser link

## 🚀 Quick Start

```bash
# 1. Prepare your daily images (use today's date in MMDDYY format)
# Example for February 12, 2026:
#   - RE-Daily-1-021226.png
#   - RE-Daily-2-021226.png

# 2. Update the template with today's data
nano daily-market-template.json

# 3. Get your admin session token (see Authentication section below)

# 4. Run the automation
node automate-daily-market.js [MMDDYY] [SESSION_TOKEN]

# Or use environment variable:
export ADMIN_SESSION_TOKEN="your-token-here"
node automate-daily-market.js

# For custom date:
node automate-daily-market.js 021226  # February 12, 2026
```

## ✅ Prerequisites

### Required Files

Before running the automation, ensure you have:

1. **Daily Images** (in this directory):
   - `RE-Daily-1-MMDDYY.png` - Housing statistics infographic
   - `RE-Daily-2-MMDDYY.png` - Market analysis chart

2. **Updated Template**:
   - `daily-market-template.json` - Current market data

3. **Admin Session Token**:
   - Valid admin session token from Agent Hub
   - See [Authentication](#authentication) section below

### Software Requirements

- Node.js >= 14.0.0
- Git configured with GitHub access
- npm dependencies (automatically installed)

## 📦 Installation

```bash
# Install dependencies
npm install --cache /tmp/npm-cache-temp

# Make the script executable (optional)
chmod +x automate-daily-market.js
```

## 🔐 Authentication

### Getting Your Admin Session Token

You need an admin session token to create and edit Agent Hub posts. Here's how to get it:

#### Method 1: Using Browser DevTools (Recommended)

1. Open https://teamrealtyexperts.com in your browser
2. Open Developer Tools (F12 or right-click → Inspect)
3. Go to the **Console** tab
4. Log in with your admin password
5. In the console, type:
   ```javascript
   sessionStorage.getItem('re_session_token')
   ```
6. Copy the token value (without quotes)
7. Use it with the automation script

#### Method 2: Using the Helper Script

Create a file called `get-token.js`:

```javascript
// This would require implementing a login flow
// For now, use Method 1 above
```

#### Method 3: Environment Variable

```bash
# Add to your ~/.bashrc or ~/.zshrc
export ADMIN_SESSION_TOKEN="your-token-here"

# Or create a .env file (add to .gitignore!)
echo "ADMIN_SESSION_TOKEN=your-token-here" > .env
```

⚠️ **Security Warning**: Never commit your session token to Git!

## 💻 Usage

### Basic Usage (Today's Date)

```bash
# Using command line argument
node automate-daily-market.js "" "your-session-token"

# Using environment variable
export ADMIN_SESSION_TOKEN="your-session-token"
node automate-daily-market.js
```

### Custom Date

```bash
# For a specific date (e.g., February 12, 2026)
node automate-daily-market.js 021226 "your-session-token"
```

### Expected Output

```
🚀 AUTOMATED DAILY MARKET SYSTEM

============================================================
ℹ️  Processing daily market for: February 12, 2026
ℹ️  Date string: 021226
============================================================

📍 STEP 1: Verifying image files exist
✅ Found: RE-Daily-1-021226.png
✅ Found: RE-Daily-2-021226.png

📍 STEP 2: Committing and pushing images to GitHub
📍 Staging images...
📍 Creating commit...
📍 Pushing to GitHub...
✅ Images successfully pushed to GitHub

📍 STEP 3: Waiting for GitHub Pages to update
ℹ️  Checking URL availability (attempt 1/10)...
✅ URL is accessible: https://raw.githubusercontent.com/...
✅ GitHub Pages URLs are accessible

📍 STEP 4: Creating Agent Hub post
✅ Agent Hub post created: https://teamrealtyexperts.com/share/...
ℹ️  Note ID: 26aeac57-03ce-438f-80eb-37bc1b81630e

📍 STEP 5: Generating daily market email HTML
ℹ️  Generating QR code for Agent Hub post...
✅ QR code available at: https://raw.githubusercontent.com/...
✅ Email generated and available at: https://user8888-level3.github.io/...

📍 STEP 6: Updating Agent Hub post with email URL
✅ Agent Hub post updated with email URL

============================================================
✅ AUTOMATION COMPLETE!

📊 Summary:
   • Date: February 12, 2026
   • Agent Hub Post: https://teamrealtyexperts.com/share/...
   • Email URL: https://user8888-level3.github.io/...
   • Subject: "At a Glance" Local Housing STATS and News February 12, 2026
============================================================
```

## 🔄 Workflow Details

### Step 1: Verify Images
- Checks that both `RE-Daily-1-MMDDYY.png` and `RE-Daily-2-MMDDYY.png` exist
- Fails early if images are missing

### Step 2: Push to GitHub
- Stages the two image files
- Creates a commit with message format: `Add daily market images for MMDDYY`
- Pushes to the `main` branch
- Skips if images already committed

### Step 3: Wait for GitHub Pages
- Polls GitHub raw URLs to verify images are accessible
- Uses exponential backoff (default: 10 retries, 5 seconds between attempts)
- Ensures CDN has propagated before proceeding

### Step 4: Create Agent Hub Post
- Title format: `"At a Glance" Local Housing STATS and News [Full Date]`
- Embeds both images at the top
- Generates comprehensive market analysis from template
- Sections: Real Estate, Stocks, Economy, Crypto (if present)
- Sets visibility to `public` for shareable URL
- Returns note ID and shareable URL

### Step 5: Generate Email
- Creates QR code pointing to Agent Hub post
- Pushes QR code to GitHub
- Runs `generate-daily-email.js` with dynamic Agent Hub URL
- Generates `daily-market-glance-MMDDYY.html`
- Pushes HTML to GitHub Pages
- Waits for email URL to be accessible

### Step 6: Update Agent Hub Post
- Fetches the created note
- Prepends a styled banner with "Open Email in Browser" link
- Updates the note via API
- Creates perfect cross-reference between email and post

## 🛠️ Troubleshooting

### "Image not found" Error

```bash
❌ Image not found: RE-Daily-1-021226.png
```

**Solution**: Verify images exist with correct naming:
```bash
ls -la RE-Daily-*.png
# Should show: RE-Daily-1-MMDDYY.png and RE-Daily-2-MMDDYY.png
```

### "URL not accessible after X attempts"

**Cause**: GitHub Pages taking longer than expected to update

**Solutions**:
1. Wait a few minutes and try again
2. Verify GitHub Actions completed successfully
3. Check GitHub Pages settings are enabled
4. Increase `maxRetries` in CONFIG

### "Admin session token required"

**Solutions**:
1. Get fresh token from browser (see Authentication section)
2. Verify token is not expired (24-48 hour lifetime)
3. Check environment variable is set correctly

### "Permission denied" on Git Push

**Solutions**:
```bash
# Check Git credentials
git config --list | grep user

# Verify GitHub authentication
git remote -v

# May need to re-authenticate with GitHub
```

### "Failed to create note" API Error

**Possible causes**:
- Session token expired → Get fresh token
- Network connectivity issues → Check internet
- Supabase service down → Check status page
- Invalid HTML in content → Review template JSON

## ⚙️ Configuration

### Editing CONFIG Object

Located in `automate-daily-market.js`:

```javascript
const CONFIG = {
  // GitHub repository configuration
  githubRepo: 'https://github.com/User8888-Level3/RealtyExperts-Daily-Email.git',
  githubPagesBase: 'https://user8888-level3.github.io/RealtyExperts-Daily-Email',
  githubRawBase: 'https://raw.githubusercontent.com/User8888-Level3/RealtyExperts-Daily-Email/main',

  // Agent Hub API configuration
  agentHubApiBase: 'https://rdxzxokcbmmjjgyevqxq.supabase.co/functions/v1',
  agentHubWebBase: 'https://teamrealtyexperts.com',
  supabaseAnonKey: 'eyJhbGci...',

  // Retry configuration
  maxRetries: 10,        // Increase for slower GitHub Pages updates
  retryDelay: 5000,      // Milliseconds between retries
};
```

### Customizing Email Template

Edit `daily-market-template.json`:

```json
{
  "date": "02/12/26",
  "time": "08:00",
  "stocks": {
    "sp500": "6,941 (-0.00%)",
    "dow": "50,121 (-0.13%)",
    "nasdaq": "23,066 (-0.16%)",
    "note": "*Numbers as of market close on Feb 11th",
    "news": "Your market news here..."
  },
  "economy": { ... },
  "crypto": { ... },
  "real_estate": { ... }
}
```

## 📝 Daily Checklist

- [ ] Prepare daily images (RE-Daily-1-MMDDYY.png, RE-Daily-2-MMDDYY.png)
- [ ] Update daily-market-template.json with latest data
- [ ] Get fresh admin session token (if expired)
- [ ] Run automation script
- [ ] Verify Agent Hub post looks correct
- [ ] Verify email renders properly in browser
- [ ] Test QR code with phone camera
- [ ] Send email to distribution list

## 🔗 Related Files

- `automate-daily-market.js` - Main automation script
- `generate-daily-email.js` - Email HTML generator
- `daily-market-template.json` - Market data template
- `package.json` - Node.js dependencies

## 📚 Additional Resources

- [Agent Hub Documentation](../REALTY-EXPERTS-Agent-Hub/realtyexperts/CLAUDE.md)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## 🆘 Support

If you encounter issues not covered in this guide:

1. Check the error message carefully
2. Review the troubleshooting section
3. Verify all prerequisites are met
4. Check GitHub Actions and Supabase logs
5. Contact the development team

---

**REALTY EXPERTS® - "Our Experience is the Difference"**
