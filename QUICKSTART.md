# ⚡ Quick Start Guide - Daily Market Automation

**Get your daily market update published in under 5 minutes!**

## 📋 Pre-Flight Checklist

- [ ] Two daily images ready (RE-Daily-1-MMDDYY.png and RE-Daily-2-MMDDYY.png)
- [ ] Market data updated in `daily-market-template.json`
- [ ] Admin session token available

## 🚀 3-Step Process

### Step 1: Prepare Images

Name your images with today's date in MMDDYY format:

```bash
# Example for February 12, 2026:
RE-Daily-1-021226.png
RE-Daily-2-021226.png
```

Place them in the `RealtyExperts-Daily-Email` folder.

### Step 2: Get Session Token

1. Go to https://teamrealtyexperts.com
2. Log in as admin
3. Press **F12** (open DevTools)
4. Click **Console** tab
5. Type: `sessionStorage.getItem('re_session_token')`
6. Copy the token (without quotes)

### Step 3: Run Automation

**Option A: Interactive Script (Recommended)**

```bash
cd RealtyExperts-Daily-Email
./run-daily-automation.sh
```

When prompted, paste your session token.

**Option B: Command Line**

```bash
cd RealtyExperts-Daily-Email
node automate-daily-market.js "" "YOUR_SESSION_TOKEN_HERE"
```

**Option C: Using Environment Variable**

```bash
cd RealtyExperts-Daily-Email
export ADMIN_SESSION_TOKEN="YOUR_SESSION_TOKEN_HERE"
./run-daily-automation.sh
```

## ✅ Success Looks Like This

```
✅ AUTOMATION COMPLETE!

📊 Summary:
   • Date: February 12, 2026
   • Agent Hub Post: https://teamrealtyexperts.com/share/abc123...
   • Email URL: https://user8888-level3.github.io/RealtyExperts-Daily-Email/daily-market-glance-021226.html
   • Subject: "At a Glance" Local Housing STATS and News February 12, 2026
```

## 🎯 What Happens Automatically

1. ✅ Images uploaded to GitHub
2. ✅ GitHub Pages URLs generated
3. ✅ Agent Hub post created with images
4. ✅ QR code generated for post
5. ✅ Email HTML generated
6. ✅ Agent Hub post updated with email link
7. ✅ Everything cross-linked perfectly!

## 🔍 Verify Your Work

1. **Agent Hub Post**: Open the provided URL and verify:
   - Images display correctly
   - Market data is accurate
   - "Open Email in Browser" link works

2. **Email**: Open the email URL and check:
   - Images load properly
   - "View Full Post on Agent Hub" link works
   - QR code is present

3. **QR Code**: Scan with your phone to ensure it opens the Agent Hub post

## 🆘 Troubleshooting

### "Image not found"
- Check image names match format: `RE-Daily-1-MMDDYY.png`
- Verify you're in the correct directory
- Make sure date is in MMDDYY format

### "Session token required"
- Get fresh token from browser (tokens expire after 24-48 hours)
- Make sure you copied the entire token
- Don't include the quotes when pasting

### "URL not accessible"
- GitHub Pages can take 1-2 minutes to update
- The script will retry automatically (up to 10 times)
- If it fails, wait a few minutes and run again

### "Permission denied on git push"
- Verify Git credentials: `git config user.name`
- Check GitHub authentication
- May need to re-authenticate with GitHub

## 💡 Pro Tips

1. **Save Your Token**: Export it to your shell profile:
   ```bash
   echo 'export ADMIN_SESSION_TOKEN="your-token-here"' >> ~/.zshrc
   source ~/.zshrc
   ```

2. **Batch Process**: Update multiple days at once:
   ```bash
   # Process yesterday, today, tomorrow
   ./run-daily-automation.sh 021126  # Feb 11
   ./run-daily-automation.sh 021226  # Feb 12
   ./run-daily-automation.sh 021326  # Feb 13
   ```

3. **Template Backup**: Keep a copy of your template:
   ```bash
   cp daily-market-template.json daily-market-template-backup.json
   ```

## 📚 Need More Help?

- **Detailed Guide**: See [AUTOMATION-README.md](./AUTOMATION-README.md)
- **Email Template**: See [daily-market-template.json](./daily-market-template.json)
- **Source Code**: See [automate-daily-market.js](./automate-daily-market.js)

---

**Ready? Let's automate!** 🚀

```bash
./run-daily-automation.sh
```
