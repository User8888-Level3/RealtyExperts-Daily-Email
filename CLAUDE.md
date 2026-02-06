# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Daily email generator for REALTY EXPERTS "At a Glance" market updates. Generates modern, light-mode HTML emails from JSON data containing stock market, economy, and real estate information.

**Related Project**: This is a companion to the RealtyExperts-Meeting-Notes project (parent directory). Both share similar design patterns and REALTY EXPERTS branding.

## Core Commands

### Generate Daily Email
```bash
node generate-daily-email.js daily-market-template.json
```

Output: `daily-market-glance-{date}.html` with auto-generated subject line

### Quick Update Workflow
```bash
# 1. Edit JSON with today's data
nano daily-market-template.json

# 2. Generate HTML
node generate-daily-email.js daily-market-template.json

# 3. Open in browser to preview
open daily-market-glance-*.html
```

## Architecture

### Single-File Generator (`generate-daily-email.js`)
Standalone Node.js script with no external dependencies (uses only built-in modules: `fs`, `path`).

**Key Functions:**
- `loadData(jsonFile)` - Parses JSON input
- `formatValue(value)` - Auto-detects positive (+) / negative (-) values and applies CSS classes
- `generateHTML(data)` - Main template generator with inline CSS

### Data Structure

Three main sections with distinct data patterns:

**STOCKS** (Blue #2563eb):
- Three market indices with percentage changes
- Market close timestamp note
- News commentary (single paragraph)

**ECONOMY** (Green #16a34a):
- US10YEAR, Gold, Silver with values and changes
- Multi-paragraph commentary supporting `\n\n` for paragraphs

**REAL ESTATE** (Orange #ea580c):
- 30-year and 15-year mortgage rates (displayed as large cards)
- Homebuilder news highlight
- Extended commentary with multiple paragraphs

### Design System

**Modern Light Mode:**
- Blue gradient header with REALTY EXPERTS logo
- White content container with subtle shadows
- Color-coded section borders and titles
- Automatic value coloring: green for positive (+), red for negative (-)
- Responsive: 800px max-width desktop, stacks on mobile

**Layout:**
1. Header - Logo + "Daily Market Glance" + Date/Time
2. Three content sections with data grids and commentary boxes
3. Image containers for data table and chart screenshots
4. Footer with branding and date

### Image Handling

Two optional images referenced in JSON:
- `data_table_image` - City-by-city housing statistics table
- `chart_image` - Market analysis bar chart

Images are embedded with automatic scaling and rounded corners. If paths are missing from JSON, image containers are omitted from output.

## Template JSON Structure

```json
{
  "date": "02/05/26",
  "time": "08:01",
  "stocks": {
    "sp500": "value (±%)",
    "dow": "value (±%)",
    "nasdaq": "value (±%)",
    "note": "Disclaimer text",
    "news": "Commentary paragraph"
  },
  "economy": {
    "us10year": "value (±%)",
    "gold": "value (±%)",
    "silver": "value (±%)",
    "commentary": "Multi-paragraph text with \\n\\n separators"
  },
  "real_estate": {
    "rate_30year": "percentage",
    "rate_15year": "percentage",
    "homebuilder": "Highlight sentence",
    "commentary": "Multi-paragraph analysis"
  },
  "data_table_image": "path/to/image.png",
  "chart_image": "path/to/chart.png"
}
```

## Design Consistency with Meeting Notes

This project shares the same design language as `../RealtyExperts-Meeting-Notes/`:
- Same logo and favicon (references `../RealtyExperts-Meeting-Notes/Realty Experts - RE.png`)
- Same color palette and gradient styles
- Same typography and spacing system
- Same responsive breakpoints

**Key Difference**: Daily emails use a simpler layout focused on data presentation, while meeting notes use sectioned content with more complex nesting.

## Daily Workflow

1. Update JSON with current market data
2. Take screenshots of data table and chart (if needed)
3. Save images to project folder
4. Run generator script
5. Preview HTML in browser
6. Copy/paste into Outlook or email client

## Output Details

**Subject Line (auto-generated):**
`"At a Glance" Local Housing STATS and News {date}`

**File Naming:**
`daily-market-glance-{date-with-dashes}.html`
Example: `daily-market-glance-02-05-26.html`

**Console Output:**
- Success message with filename
- Auto-generated subject line
