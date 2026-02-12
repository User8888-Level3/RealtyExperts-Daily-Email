#!/bin/bash

###############################################################################
# Daily Market Automation Runner
# Simplified wrapper script for automate-daily-market.js
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Print banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║         REALTY EXPERTS® Daily Market Automation          ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to print colored messages
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Please install Node.js >= 14.0.0"
    exit 1
fi

# Get date (default to today)
DATE_ARG=""
if [ ! -z "$1" ]; then
    DATE_ARG="$1"
    info "Using custom date: $DATE_ARG"
else
    # Generate today's date in MMDDYY format
    DATE_ARG=$(date +"%m%d%y")
    info "Using today's date: $DATE_ARG"
fi

# Check for session token
SESSION_TOKEN="${ADMIN_SESSION_TOKEN:-$2}"

if [ -z "$SESSION_TOKEN" ]; then
    echo ""
    warning "No session token found!"
    echo ""
    echo "Please provide your admin session token in one of these ways:"
    echo ""
    echo "  1. Set environment variable:"
    echo "     export ADMIN_SESSION_TOKEN='your-token-here'"
    echo ""
    echo "  2. Pass as second argument:"
    echo "     $0 $DATE_ARG 'your-token-here'"
    echo ""
    echo "  3. Create a .env file (see AUTOMATION-README.md)"
    echo ""
    echo "To get your session token:"
    echo "  1. Go to https://teamrealtyexperts.com"
    echo "  2. Log in with admin password"
    echo "  3. Open browser DevTools (F12)"
    echo "  4. Go to Console tab"
    echo "  5. Type: sessionStorage.getItem('re_session_token')"
    echo "  6. Copy the token value"
    echo ""
    exit 1
fi

# Verify image files exist
info "Verifying image files..."
IMAGE1="RE-Daily-1-${DATE_ARG}.png"
IMAGE2="RE-Daily-2-${DATE_ARG}.png"

if [ ! -f "$IMAGE1" ]; then
    error "Image not found: $IMAGE1"
    echo ""
    echo "Please ensure you have created the daily images with the correct naming:"
    echo "  - RE-Daily-1-${DATE_ARG}.png"
    echo "  - RE-Daily-2-${DATE_ARG}.png"
    echo ""
    exit 1
fi

if [ ! -f "$IMAGE2" ]; then
    error "Image not found: $IMAGE2"
    echo ""
    echo "Please ensure you have created the daily images with the correct naming:"
    echo "  - RE-Daily-1-${DATE_ARG}.png"
    echo "  - RE-Daily-2-${DATE_ARG}.png"
    echo ""
    exit 1
fi

success "Found: $IMAGE1"
success "Found: $IMAGE2"

# Check if template exists
if [ ! -f "daily-market-template.json" ]; then
    error "Template not found: daily-market-template.json"
    exit 1
fi

success "Found: daily-market-template.json"

# Verify Git is configured
if ! git config user.name &> /dev/null || ! git config user.email &> /dev/null; then
    error "Git is not configured. Please set your Git credentials:"
    echo "  git config --global user.name 'Your Name'"
    echo "  git config --global user.email 'your@email.com'"
    exit 1
fi

# Check for uncommitted changes (excluding the images we're about to add)
if git diff --quiet && git diff --cached --quiet; then
    : # No uncommitted changes
else
    warning "You have uncommitted changes in the repository"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Confirm before running
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Ready to run automation with the following configuration:"
echo "───────────────────────────────────────────────────────────"
echo "  Date:          $(date -j -f "%m%d%y" "$DATE_ARG" "+%B %d, %Y" 2>/dev/null || echo $DATE_ARG)"
echo "  Image 1:       $IMAGE1"
echo "  Image 2:       $IMAGE2"
echo "  Session Token: ${SESSION_TOKEN:0:20}..."
echo "═══════════════════════════════════════════════════════════"
echo ""
read -p "Proceed with automation? (Y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Nn]$ ]]; then
    info "Automation cancelled"
    exit 0
fi

# Run the automation
echo ""
info "Starting automation..."
echo ""

if node automate-daily-market.js "$DATE_ARG" "$SESSION_TOKEN"; then
    echo ""
    success "Automation completed successfully! 🎉"
    echo ""
    echo "Next steps:"
    echo "  1. Review the Agent Hub post"
    echo "  2. Test the email in a browser"
    echo "  3. Verify the QR code works"
    echo "  4. Send the email to your distribution list"
    echo ""
else
    echo ""
    error "Automation failed. Please check the error messages above."
    echo ""
    echo "Common issues:"
    echo "  - GitHub authentication expired"
    echo "  - Session token expired (get a fresh one)"
    echo "  - Network connectivity problems"
    echo "  - GitHub Pages not yet updated (wait and retry)"
    echo ""
    echo "See AUTOMATION-README.md for detailed troubleshooting."
    echo ""
    exit 1
fi
