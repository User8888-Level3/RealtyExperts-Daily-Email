const https = require('https');
const fs = require('fs');

// Read tokens from .env
const envContent = fs.readFileSync('.env', 'utf8');
const adminTokenLine = envContent.split('\n').find(l => l.startsWith('ADMIN_TOKEN='));
const ADMIN_TOKEN = adminTokenLine ? adminTokenLine.split('=').slice(1).join('=').trim() : '';

if (!ADMIN_TOKEN) {
  console.error('ERROR: ADMIN_TOKEN not found in .env — run node get-tokens.js first');
  process.exit(1);
}

// Parse nonce from custom JWT (2-part: payload.signature)
function getNonce(token) {
  const parts = token.split('.');
  const base64 = parts[0];
  const padded = base64 + '==='.slice((base64.length + 3) % 4);
  const decoded = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  return decoded.nonce;
}

const SESSION_ID = getNonce(ADMIN_TOKEN);
const SUPABASE_URL = 'rdxzxokcbmmjjgyevqxq.supabase.co';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeHp4b2tjYm1tampneWV2cXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwODY4NTEsImV4cCI6MjA4NDY2Mjg1MX0.oiIewgoknkmVCZ4NvU8ElkjrVPoIjT7pBjHCaABVsl4';

const DATE = '02/25/26';
const DATE_SHORT = '022526';
const EMAIL_URL = `https://user8888-level3.github.io/RealtyExperts-Daily-Email/daily-market-glance-${DATE_SHORT}.html`;
const IMG1_URL = `https://raw.githubusercontent.com/User8888-Level3/RealtyExperts-Daily-Email/main/RE-Daily-1-${DATE_SHORT}.png`;
const IMG2_URL = `https://raw.githubusercontent.com/User8888-Level3/RealtyExperts-Daily-Email/main/RE-Daily-2-${DATE_SHORT}.png`;

const postBody = `
<!-- Banner -->
<div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;padding:32px 24px;text-align:center;margin-bottom:24px;">
  <div style="font-size:13px;font-weight:600;letter-spacing:2px;color:rgba(255,255,255,0.8);text-transform:uppercase;margin-bottom:8px;">REALTY EXPERTS®</div>
  <div style="font-size:26px;font-weight:700;color:#ffffff;margin-bottom:6px;">Daily Market Glance</div>
  <div style="font-size:15px;color:rgba(255,255,255,0.85);margin-bottom:20px;">${DATE} · Real Estate · Stocks · Economy · Crypto</div>
  <a href="${EMAIL_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:white;color:#667eea;font-weight:700;font-size:14px;padding:10px 24px;border-radius:6px;text-decoration:none;">Open Email in Browser</a>
</div>

<!-- Images -->
<div style="margin-bottom:24px;">
  <img src="${IMG1_URL}" alt="Market Data Table" style="width:100%;max-width:650px;display:block;margin:0 auto 12px;" />
  <img src="${IMG2_URL}" alt="Market Chart" style="width:100%;max-width:650px;display:block;margin:0 auto;" />
</div>

<!-- Real Estate -->
<div style="background:#fff7ed;border-left:4px solid #ea580c;border-radius:6px;padding:20px;margin-bottom:20px;">
  <div style="font-size:18px;font-weight:700;color:#ea580c;margin-bottom:12px;">🏠 Real Estate</div>
  <div style="display:flex;gap:12px;margin-bottom:16px;">
    <div style="background:#ea580c;color:white;border-radius:6px;padding:14px 20px;text-align:center;flex:1;">
      <div style="font-size:12px;font-weight:600;letter-spacing:1px;opacity:0.85;margin-bottom:4px;">30-YEAR FIXED</div>
      <div style="font-size:28px;font-weight:700;">6.04%</div>
    </div>
    <div style="background:#ea580c;color:white;border-radius:6px;padding:14px 20px;text-align:center;flex:1;">
      <div style="font-size:12px;font-weight:600;letter-spacing:1px;opacity:0.85;margin-bottom:4px;">15-YEAR FIXED</div>
      <div style="font-size:28px;font-weight:700;">5.58%</div>
    </div>
  </div>
  <p style="color:#1e293b;font-size:14px;margin:0 0 12px;font-weight:600;">Mattamy Homes' Tampa Division has been recognized as a "Best Place to Work" for the eighth consecutive year, highlighted as a top mid-sized employer.</p>
  <p style="color:#334155;font-size:14px;margin:0 0 12px;">The Bay Area continues to be a strong seller's market characterized by historically tight inventory and stable-to-rising median prices, particularly in high-demand pockets supported by AI sector growth.</p>
  <p style="color:#1e293b;font-size:14px;font-weight:600;margin:0 0 8px;">Latest Real Estate News in the Bay Area:</p>
  <p style="color:#334155;font-size:14px;margin:0 0 8px;">🏡 <strong>Inventory Shortages Persist:</strong> Across Silicon Valley, single-family home inventory remains down 12% year-over-year, keeping the region firmly in a seller's market with less than one month of supply in Santa Clara County.</p>
  <p style="color:#334155;font-size:14px;margin:0 0 8px;">🏡 <strong>A Tale of Two Markets:</strong> A significant divergence has emerged between property types; single-family homes in Alameda County move quickly in roughly 19 days, while condominiums are sitting for an average of 51 days as their values soften.</p>
  <p style="color:#334155;font-size:14px;margin:0;">🏡 <strong>Price Performance Trends:</strong> While Santa Clara County saw a modest 3.89% year-over-year dip in median single-family prices to $1,730,051, Alameda County saw a turnaround with prices rising 2.86% to a median of $1,150,000.</p>
</div>

<!-- Stocks -->
<div style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:6px;padding:20px;margin-bottom:20px;">
  <div style="font-size:18px;font-weight:700;color:#2563eb;margin-bottom:12px;">📈 Stocks</div>
  <div style="display:flex;gap:10px;margin-bottom:16px;">
    <div style="background:white;border-left:4px solid #2563eb;border-radius:4px;padding:12px;flex:1;text-align:center;">
      <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:1px;margin-bottom:4px;">S&P 500</div>
      <div style="font-size:20px;font-weight:700;color:#1e293b;">6,890.07</div>
    </div>
    <div style="background:white;border-left:4px solid #2563eb;border-radius:4px;padding:12px;flex:1;text-align:center;">
      <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:1px;margin-bottom:4px;">DOW</div>
      <div style="font-size:20px;font-weight:700;color:#1e293b;">49,174.50</div>
    </div>
    <div style="background:white;border-left:4px solid #2563eb;border-radius:4px;padding:12px;flex:1;text-align:center;">
      <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:1px;margin-bottom:4px;">NASDAQ</div>
      <div style="font-size:20px;font-weight:700;color:#1e293b;">22,863.68</div>
    </div>
  </div>
  <p style="color:#334155;font-size:14px;margin:0 0 10px;"><strong>Cava Beats Earnings:</strong> Cava (CAVA) cleared earnings expectations, reporting record revenue and guiding for continued growth in 2026. Cava, Chipotle (CMG) and other fast casual chains have had a tough year in the market overall — but Cava's results stood out.</p>
</div>

<!-- Economy -->
<div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:6px;padding:20px;margin-bottom:20px;">
  <div style="font-size:18px;font-weight:700;color:#16a34a;margin-bottom:12px;">💰 Economy</div>
  <div style="display:flex;gap:10px;margin-bottom:16px;">
    <div style="background:white;border-left:4px solid #16a34a;border-radius:4px;padding:12px;flex:1;text-align:center;">
      <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:1px;margin-bottom:4px;">10-YR TREASURY</div>
      <div style="font-size:20px;font-weight:700;color:#1e293b;">4.04%</div>
    </div>
    <div style="background:white;border-left:4px solid #16a34a;border-radius:4px;padding:12px;flex:1;text-align:center;">
      <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:1px;margin-bottom:4px;">GOLD</div>
      <div style="font-size:20px;font-weight:700;color:#1e293b;">$5,248.89</div>
    </div>
    <div style="background:white;border-left:4px solid #16a34a;border-radius:4px;padding:12px;flex:1;text-align:center;">
      <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:1px;margin-bottom:4px;">SILVER</div>
      <div style="font-size:20px;font-weight:700;color:#1e293b;">$90.70</div>
    </div>
  </div>
  <p style="color:#334155;font-size:14px;margin:0 0 10px;"><strong>Consumer Confidence Rebounds:</strong> U.S. consumer confidence had been trending lower but got a bounce in the latest report. Respondents said they're feeling better about job opportunities and inflation. Note: The survey was conducted before the Supreme Court struck down President Trump's tariffs.</p>
  <p style="color:#334155;font-size:14px;margin:0 0 10px;"><strong>Trump's 401k Plan:</strong> President Trump called for government-backed 401k plans in last night's State of the Union address.</p>
  <p style="color:#334155;font-size:14px;margin:0;"><strong>New Tariffs in Effect:</strong> President Trump's new global tariffs took effect Tuesday at 10% for the next 150 days. Trump has stated his goal remains 15%, and an ING analyst suggests he could continue ordering 150-day tariff extensions as a recurring strategy.</p>
</div>

<!-- Crypto -->
<div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:6px;padding:20px;margin-bottom:20px;">
  <div style="font-size:18px;font-weight:700;color:#f59e0b;margin-bottom:12px;">₿ Crypto</div>
  <div style="display:flex;gap:10px;margin-bottom:16px;">
    <div style="background:white;border-left:4px solid #f59e0b;border-radius:4px;padding:12px;flex:1;text-align:center;">
      <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:1px;margin-bottom:4px;">BTC</div>
      <div style="font-size:20px;font-weight:700;color:#1e293b;">$67,117.88</div>
    </div>
    <div style="background:white;border-left:4px solid #f59e0b;border-radius:4px;padding:12px;flex:1;text-align:center;">
      <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:1px;margin-bottom:4px;">ETH</div>
      <div style="font-size:20px;font-weight:700;color:#1e293b;">$1,935.00</div>
    </div>
    <div style="background:white;border-left:4px solid #f59e0b;border-radius:4px;padding:12px;flex:1;text-align:center;">
      <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:1px;margin-bottom:4px;">XRP</div>
      <div style="font-size:20px;font-weight:700;color:#1e293b;">$1.38</div>
    </div>
  </div>
  <p style="color:#334155;font-size:14px;margin:0;"><strong>No Pardon for SBF:</strong> According to reports, President Trump will not issue a pardon for Sam Bankman-Fried, founder of the collapsed crypto exchange FTX. Some expected a pardon after Binance's founder Changpeng Zhao was pardoned, but the White House has reiterated there are no plans for SBF.</p>
</div>

<!-- Sources -->
<div style="background:#f8fafc;border-radius:6px;padding:16px;margin-bottom:16px;">
  <div style="font-size:13px;font-weight:700;color:#64748b;letter-spacing:1px;margin-bottom:10px;">SOURCES</div>
  <div style="font-size:12px;color:#64748b;line-height:1.8;">
    <a href="https://www.mortgagenewsdaily.com/mortgage-rates/15-year-fixed" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;">Mortgage News Daily — 15yr Rate</a><br>
    <a href="https://www.bankrate.com/mortgages/todays-rates/mortgage-rates-for-wednesday-february-25-2026/" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;">Bankrate — Mortgage Rates Feb 25, 2026</a><br>
    <a href="https://marksrealtygroup.com/blog/san-francisco-and-marin-county-february-real-estate-market-report" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;">Marks Realty Group — SF/Marin Feb Market Report</a><br>
    <a href="https://ascendre.com/blog/silicon-valley-market-update-february-2026" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;">Ascendre — Silicon Valley Market Update</a><br>
    <a href="https://ascendre.com/blog/east-bay-housing-update-february-2026" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;">Ascendre — East Bay Housing Update</a><br>
    <a href="https://www.nasdaq.com/articles/stock-market-news-feb-25-2026" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;">Nasdaq — Stock Market News Feb 25, 2026</a><br>
    <a href="https://www.theblock.co/post/391104/white-house-reiterates-trump-has-no-plans-to-pardon-sam-bankman-fried-despite-ftx-founders-social-media-push" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;">The Block — No Pardon for SBF</a><br>
    <a href="https://www.reuters.com/business/new-us-tariffs-come-lower-10-rate-2026-02-24/" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;">Reuters — New US Tariffs at 10%</a><br>
    <a href="https://www.bloomberg.com/news/articles/2026-02-24/us-consumer-confidence-rises-on-stronger-views-of-economy-jobs" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;">Bloomberg — Consumer Confidence Rises</a><br>
    <a href="https://www.investing.com/news/economy-news/jp-morgan-raises-longterm-gold-price-forecast-to-4500-4524848" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;">Investing.com — JP Morgan Gold Forecast</a><br>
    <a href="https://sanjosespotlight.com/news/politics-government/milpitas/" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;">San Jose Spotlight — Milpitas</a>
  </div>
</div>

<!-- Disclaimer -->
<div style="font-size:11px;color:#94a3b8;text-align:center;padding:12px;border-top:1px solid #e2e8f0;">
  Market data is for informational purposes only. Always verify rates and financial data with a licensed lender or financial advisor before making any decisions. © 2026 REALTY EXPERTS®
</div>
`.trim();

const payload = JSON.stringify({
  title: '\u201cAt a Glance\u201d Local Housing STATS and News 02/25/26',
  body: postBody,
  category: ['at-a-glance'],
  visibility: 'public',
  body_format: 'html',
  author_name: 'REALTY EXPERTS'
});

const options = {
  hostname: SUPABASE_URL,
  path: '/functions/v1/notes-api',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': API_KEY,
    'x-session-token': ADMIN_TOKEN,
    'x-session-id': SESSION_ID,
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log('Response:', JSON.stringify(parsed, null, 2));
      if (parsed.id) {
        console.log('\n✅ Post created!');
        console.log('Post ID:', parsed.id);
        console.log('Short ID (first 8):', parsed.id.substring(0, 8));
        console.log('Share URL:', `https://teamrealtyexperts.com/share/${parsed.id}`);
        console.log('\nNext steps:');
        console.log(`1. node generate-qr-022526.js  (after creating that file with the post ID)`);
        console.log(`2. Update daily-market-template.json with agent_hub_link + qr_code_path`);
        console.log(`3. Update generate-daily-email.js lines ~234, ~241`);
        console.log(`4. node generate-daily-email.js daily-market-template.json`);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', e => console.error('Error:', e));
req.write(payload);
req.end();
