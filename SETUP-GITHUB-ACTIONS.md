# 🤖 GitHub Actions Auto-Automation Setup

## What This Does

When you commit and push your daily images, GitHub automatically:
1. ✅ Detects the new images
2. ✅ Runs the automation script
3. ✅ Creates the Agent Hub post
4. ✅ Generates the email HTML
5. ✅ Creates the QR code
6. ✅ Pushes everything back to GitHub

**You just commit your images - everything else is automatic!**

## One-Time Setup (5 minutes)

### Step 1: Get Your Admin Session Token

1. Go to https://teamrealtyexperts.com
2. Log in as admin
3. Press **F12** (DevTools)
4. **Console** tab
5. Type: `sessionStorage.getItem('re_session_token')`
6. Copy the token (without quotes)

### Step 2: Add Token to GitHub Secrets

1. Go to your GitHub repository:
   ```
   https://github.com/User8888-Level3/RealtyExperts-Daily-Email
   ```

2. Click **Settings** (top right)

3. In left sidebar, click **Secrets and variables** → **Actions**

4. Click **New repository secret**

5. Fill in:
   - **Name:** `ADMIN_SESSION_TOKEN`
   - **Secret:** Paste your token here

6. Click **Add secret**

### Step 3: Push the GitHub Actions Workflow

```bash
cd RealtyExperts-Daily-Email

# Add the workflow file
git add .github/workflows/auto-daily-market.yml

# Commit it
git commit -m "Add GitHub Actions auto-automation workflow"

# Push to GitHub
git push origin main
```

## ✅ That's It! Now It's Fully Automatic!

## 🚀 Daily Workflow (Super Simple)

### Old Way (Manual):
```bash
1. Create images
2. Update template
3. Get session token from browser
4. Run script with token
5. Wait for completion
6. Verify outputs
```

### New Way (Automatic):
```bash
1. Create images (RE-Daily-1-MMDDYY.png, RE-Daily-2-MMDDYY.png)
2. Update template (daily-market-template.json)
3. Commit and push:
   git add RE-Daily-*.png daily-market-template.json
   git commit -m "Daily market update"
   git push

# That's it! GitHub does the rest automatically!
```

## 📊 What Happens Automatically

```
You Push Images → GitHub Actions Triggers
                        ↓
                  Detects Date from Filename
                        ↓
                  Runs Automation Script
                        ↓
            ┌───────────┼───────────┐
            ↓           ↓           ↓
      GitHub Pages  Agent Hub    Email HTML
            ↓           ↓           ↓
        QR Code    Cross-Links   Published
            └───────────┼───────────┘
                        ↓
                  ✅ Complete!
                  (2-3 minutes)
```

## 🔍 Monitor Progress

1. After pushing, go to:
   ```
   https://github.com/User8888-Level3/RealtyExperts-Daily-Email/actions
   ```

2. Click on the latest workflow run

3. Watch it execute in real-time!

4. When complete, you'll see:
   - ✅ All steps passed
   - 📊 Summary with URLs
   - 🔗 Links to Agent Hub and Email

## 🔄 Updating Your Token

Your token expires every 24-48 hours. When it does:

1. Get a fresh token from browser (same steps as before)
2. Go to GitHub repository → Settings → Secrets
3. Click **ADMIN_SESSION_TOKEN** → **Update**
4. Paste new token
5. Save

**Tip:** Set a calendar reminder to update it every 2 days!

## 🧪 Test It Now

```bash
# Make a small change to trigger the workflow
echo "# Test" >> README.md
git add README.md
git commit -m "Test GitHub Actions automation"
git push

# Go watch it run:
# https://github.com/User8888-Level3/RealtyExperts-Daily-Email/actions
```

## 🛠️ Manual Trigger (If Needed)

You can also manually trigger the automation:

1. Go to: https://github.com/User8888-Level3/RealtyExperts-Daily-Email/actions
2. Click **Automated Daily Market Publishing**
3. Click **Run workflow**
4. Click green **Run workflow** button

## ⚠️ Troubleshooting

### Workflow doesn't run
- Check you pushed `.github/workflows/auto-daily-market.yml`
- Verify you committed image files (RE-Daily-*.png)
- Check GitHub Actions is enabled in repo settings

### "Secret not found" error
- Make sure you created the `ADMIN_SESSION_TOKEN` secret
- Name must be exactly: `ADMIN_SESSION_TOKEN` (case-sensitive)

### Authentication errors
- Your token expired - get a fresh one
- Update the GitHub Secret with new token

### Automation fails
- Check the workflow logs in GitHub Actions
- Look for specific error messages
- Token might be invalid or expired

## 📝 Example Daily Routine

**Morning (8:00 AM):**
```bash
# 1. Create your daily images
# RE-Daily-1-021226.png
# RE-Daily-2-021226.png

# 2. Update template
nano daily-market-template.json

# 3. Commit and push (triggers automation)
git add RE-Daily-*.png daily-market-template.json
git commit -m "Daily market update $(date +%m/%d/%y)"
git push

# 4. Go get coffee ☕
# By the time you're back, it's done!
```

**Check Results (8:03 AM):**
- Open: https://github.com/User8888-Level3/RealtyExperts-Daily-Email/actions
- See the workflow completed ✅
- Click to see the summary with URLs
- Done! 🎉

## 🎯 Benefits of This Approach

✅ **No manual script execution**
✅ **No typing long commands**
✅ **No copy-pasting tokens every time**
✅ **Consistent and reliable**
✅ **Audit trail in GitHub Actions**
✅ **Can monitor from anywhere**
✅ **Works from any computer**

## 🔐 Security Notes

- Token is stored securely in GitHub Secrets
- Never visible in logs or code
- Encrypted at rest
- Only accessible by GitHub Actions
- Can be rotated anytime

## 🚀 Next Level: Scheduled Automation

Want it to run automatically every day at 8 AM?

Add this to the workflow file:

```yaml
on:
  schedule:
    - cron: '0 8 * * *'  # 8 AM daily
```

(But you'd still need to update template data somehow)

---

**You're now running a production-grade automated system!** 🎉
