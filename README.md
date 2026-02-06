# REALTY EXPERTS Daily Market Glance

Modern, light-mode daily email template for market updates.

## Quick Start

1. **Update the JSON file** with today's data:
   ```bash
   nano daily-market-template.json
   ```

2. **Generate the HTML email**:
   ```bash
   node generate-daily-email.js daily-market-template.json
   ```

3. **Add your images**:
   - Save data table screenshot as `data-table.png`
   - Save chart screenshot as `chart.png`
   - Update paths in JSON if different

4. **Open the generated HTML** in browser to preview

## JSON Structure

```json
{
  "date": "02/05/26",
  "time": "08:01",
  "stocks": {
    "sp500": "6,883 (-0.51%)",
    "dow": "49,501 (+0.53%)",
    "nasdaq": "22,905 (-1.51%)",
    "note": "*Numbers as of market close on Feb 4th",
    "news": "Your market news here..."
  },
  "economy": {
    "us10year": "4.27% (-0.01%)",
    "gold": "$4,872 (-0.72%)",
    "silver": "$76.23 (-8.37%)",
    "commentary": "Economic commentary here..."
  },
  "real_estate": {
    "rate_30year": "6.20%",
    "rate_15year": "5.76%",
    "homebuilder": "Homebuilder news...",
    "commentary": "Real estate commentary..."
  },
  "data_table_image": "data-table.png",
  "chart_image": "chart.png"
}
```

## Features

- ✅ Modern light design with REALTY EXPERTS branding
- ✅ Color-coded sections (Stocks: Blue, Economy: Green, Real Estate: Orange)
- ✅ Automatic positive/negative value coloring
- ✅ Responsive design for mobile
- ✅ Embedded images for data tables and charts
- ✅ Clean, scannable layout

## Daily Workflow

1. Update JSON with today's market data
2. Take screenshots of data table and chart
3. Save images in this folder
4. Run generator script
5. Open HTML file to preview
6. Copy/paste into email client or send as attachment

## Tips

- Use `+` for positive changes (green)
- Use `-` for negative changes (red)
- Images automatically scale to fit
- Subject line is auto-generated
