#!/bin/bash

##############################################
# PASTE AND PUBLISH - Super Simple Workflow
##############################################

echo "📋 PASTE YOUR MARKET DATA"
echo "=========================="
echo ""
echo "Paste all your market content below, then press Ctrl+D when done:"
echo ""

# Read all content from stdin
CONTENT=$(cat)

# Save to temporary file
echo "$CONTENT" > /tmp/market-data.txt

echo ""
echo "✅ Content received!"
echo ""

# Create a basic daily-market-template.json with the content
# For now, put everything in the real_estate commentary section
# You can refine this later to parse sections

DATE=$(date +%m/%d/%y)
DATE_SHORT=$(date +%m%d%y)

cat > daily-market-template.json <<EOF
{
  "date": "$DATE",
  "time": "08:00",
  "stocks": {
    "sp500": "6,941 (-0.00%)",
    "dow": "50,121 (-0.13%)",
    "nasdaq": "23,066 (-0.16%)",
    "note": "*Numbers as of market close yesterday",
    "news": "Update with latest stock news"
  },
  "economy": {
    "us10year": "4.17% (+0.02%)",
    "gold": "\$5,092 (+1.67%)",
    "silver": "\$84.58 (+4.79%)",
    "note": "*Numbers as of 4:20pm ET yesterday",
    "commentary": "Update with economy news"
  },
  "crypto": {
    "btc": "\$67,643 (-1.66%)",
    "eth": "\$1,953 (-3.31%)",
    "xrp": "\$1.38 (-1.33%)",
    "note": "*Numbers as of 4:25 pm ET yesterday",
    "commentary": "Update with crypto news"
  },
  "real_estate": {
    "rate_30year": "6.14%",
    "rate_15year": "5.71%",
    "homebuilder": "Update with homebuilder news",
    "commentary": $(echo "$CONTENT" | jq -R -s .)
  }
}
EOF

echo "📝 Updated daily-market-template.json"
echo ""

# Check if images exist
if [ -f "RE-Daily-1.png" ] && [ -f "RE-Daily-2.png" ]; then
  echo "✅ Found images: RE-Daily-1.png and RE-Daily-2.png"
  echo ""

  # Add everything
  git add RE-Daily-1.png RE-Daily-2.png daily-market-template.json

  # Commit
  git commit -m "Daily market update $DATE

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

  # Push
  echo ""
  echo "🚀 Pushing to GitHub..."
  git push

  echo ""
  echo "✅ DONE! GitHub Actions is now running the automation."
  echo ""
  echo "📊 Watch progress at:"
  echo "https://github.com/User8888-Level3/RealtyExperts-Daily-Email/actions"
  echo ""
else
  echo "⚠️  Images not found!"
  echo ""
  echo "Please add your images first:"
  echo "  mv ~/Downloads/RE-Daily-1.png ."
  echo "  mv ~/Downloads/RE-Daily-2.png ."
  echo ""
  echo "Then run this script again."
fi
