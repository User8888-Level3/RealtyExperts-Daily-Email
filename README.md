# REALTY EXPERTS - Daily Market Glance Email Generator

Automated HTML email generator for daily market updates featuring stocks, economy, crypto, and real estate data.

## 🚀 Quick Start

### Generate Today's Email
```bash
node generate-daily-email.js daily-market-template.json
```

### Daily Workflow
1. Update `daily-market-template.json` with current market data
2. Download today's images and save as:
   - `RE-Daily-1-MMDDYY.png` (data table)
   - `RE-Daily-2-MMDDYY.png` (chart)
3. Run generator script
4. Copy/paste HTML output into Outlook
5. Commit and push to GitHub for web hosting

## 📁 Files

- **generate-daily-email.js** - Main generator script
- **daily-market-template.json** - Data template (update daily)
- **daily-market-glance-MMDDYY.html** - Generated email output
- **RE-Daily-1-MMDDYY.png** - Data table screenshot
- **RE-Daily-2-MMDDYY.png** - Market chart screenshot

## 🌐 GitHub Pages Setup

**One-time setup** to enable web hosting:

1. Go to repository settings: https://github.com/User8888-Level3/RealtyExperts-Daily-Email/settings/pages
2. Under "Source", select **Deploy from a branch**
3. Choose **main** branch and **/ (root)** folder
4. Click **Save**

After setup, emails are accessible at:
`https://user8888-level3.github.io/RealtyExperts-Daily-Email/daily-market-glance-MMDDYY.html`

## 📧 Email Features

- **View in Browser** - Link at top for recipients with email rendering issues
- **Agent Hub Link** - Click or scan QR code to view full post
- **Four Sections**: Stocks, Economy, Crypto, Real Estate
- **Outlook-Compatible** - Table-based layout with inline styles
- **GitHub-Hosted Images** - Images served from repository for reliability

## 🔄 Publishing Updates

```bash
git add -A
git commit -m "Daily email: MM/DD/YY"
git push
```

Images and HTML will be publicly accessible within 1-2 minutes via GitHub Pages.

## 📊 Data Structure

See `daily-market-template.json` for the JSON schema. Key sections:
- **stocks**: S&P 500, DOW, NASDAQ with % changes
- **economy**: US10YEAR, Gold, Silver with commentary
- **crypto**: BTC, ETH, XRP with analysis
- **real_estate**: Mortgage rates and local market updates

## 🎨 Design

- Modern, light-mode layout
- Color-coded sections (blue, green, amber, orange)
- Responsive design for desktop and mobile
- Professional REALTY EXPERTS branding

## Example JSON Structure

```json
{
  "date": "02/05/26",
  "time": "16:15",
  "stocks": {
    "sp500": "6,798 (-1.23%)",
    "dow": "48,909 (-1.20%)",
    "nasdaq": "22,541 (-1.59%)",
    "note": "*Numbers as of market close on Feb 5th",
    "news": "Market commentary here..."
  },
  "economy": {
    "us10year": "4.19% (-0.09%)",
    "gold": "$4,811 (-2.39%)",
    "silver": "$73.68 (-13.01%)",
    "note": "*Numbers as of 4:15pm ET Feb 5th",
    "commentary": "Economic analysis here..."
  },
  "crypto": {
    "btc": "$63,632 (-12.85%)",
    "eth": "$1,875 (-12.54%)",
    "xrp": "$1.45 (-22.01%)",
    "commentary": "Crypto market insights..."
  },
  "real_estate": {
    "rate_30year": "6.17%",
    "rate_15year": "5.75%",
    "homebuilder": "Market headline",
    "commentary": "Local market updates with bullet points..."
  }
}
```
