#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read JSON data
function loadData(jsonFile) {
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  return data;
}

// Format commentary text with proper paragraphs and bullets
function formatCommentary(text) {
  // Split by double newlines for paragraphs
  const paragraphs = text.split('\n\n');

  return paragraphs.map(para => {
    // Check if paragraph contains bullet points
    if (para.includes('•')) {
      const lines = para.split('\n');
      let html = '';
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('•')) {
          html += `<div style="margin: 6px 0; padding-left: 0; line-height: 1.8;">${trimmed}</div>`;
        } else if (trimmed.startsWith('📍')) {
          html += `<div style="margin: 24px 0 12px 0; font-weight: 700; font-size: 16px; line-height: 1.6; color: #1e293b;">${trimmed}</div>`;
        } else if (trimmed) {
          html += `<div style="margin: 10px 0; line-height: 1.8; font-weight: 600;">${trimmed}</div>`;
        }
      });
      return html;
    } else {
      return `<div style="margin: 0 0 16px 0; line-height: 1.8;">${para.trim()}</div>`;
    }
  }).join('');
}

// Generate HTML with inline styles for Outlook compatibility
function generateHTML(data) {
  // Format date for filenames (MMDDYY)
  const dateForFile = data.date.replace(/\//g, '');
  const htmlFileName = `daily-market-glance-${dateForFile}.html`;
  const githubBaseUrl = 'https://user8888-level3.github.io/RealtyExperts-Daily-Email';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/png" href="https://raw.githubusercontent.com/User8888-Level3/RealtyExperts-Daily-Email/main/Realty%20Experts%20-%20RE.png">
  <title>Daily Market Glance - ${data.date}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f4f8; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">

          <!-- View in Browser Link -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 12px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                Having trouble viewing this email? <a href="${githubBaseUrl}/${htmlFileName}" style="color: #2563eb; text-decoration: none; font-weight: 600;">View in Browser</a>
              </p>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 30px 40px; text-align: center;">
              <img src="https://harvinder.dscloud.me/blog/wp-content/uploads/2024/02/cropped-2022_Logo_WhiteBox-Realtor-1.jpg" alt="REALTY EXPERTS" width="250" style="display: block; margin: 0 auto 15px; max-width: 100%; height: auto;">
              <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #ffffff;">Daily Market Glance</h1>
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9);">${data.date} - ${data.time}</p>
            </td>
          </tr>

          <!-- Agent Hub Banner -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; border-bottom: 2px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="70%" style="vertical-align: middle; padding-right: 20px;">
                    <div style="font-size: 15px; color: #1e293b; line-height: 1.6;">
                      <strong style="font-size: 16px;">📱 <a href="https://teamrealtyexperts.com/note/b3788c1a-6af1-442f-b562-1b9ad1032bc4" style="color: #2563eb; text-decoration: none;">View Full Post on Agent Hub</a></strong>
                      <div style="margin-top: 8px; color: #475569;">
                        Scan the QR code or visit our Agent Hub for the complete market update. Contact the front desk for your access code.
                      </div>
                    </div>
                  </td>
                  <td width="30%" style="vertical-align: middle; text-align: center;">
                    <img src="https://harvinder.dscloud.me/blog/wp-content/uploads/2026/02/note-qr-b3788c1a.png" alt="Agent Hub QR Code" width="100" style="display: block; margin: 0 auto; max-width: 100px; height: auto;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">

              <!-- STOCKS Section -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 35px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #2563eb; padding-bottom: 10px; border-bottom: 3px solid #2563eb;">
                      📈 STOCKS
                    </h2>
                    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #f8fafc; border-left: 4px solid #2563eb; margin-bottom: 12px;">
                      <tr>
                        <td style="font-weight: 600; color: #475569; font-size: 14px;">S&P:</td>
                        <td align="right" style="font-weight: 700; font-size: 18px; color: ${data.stocks.sp500.includes('+') ? '#16a34a' : data.stocks.sp500.includes('-') ? '#dc2626' : '#1e293b'};">${data.stocks.sp500}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #475569; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 12px;">DOW:</td>
                        <td align="right" style="font-weight: 700; font-size: 18px; color: ${data.stocks.dow.includes('+') ? '#16a34a' : data.stocks.dow.includes('-') ? '#dc2626' : '#1e293b'}; border-top: 1px solid #e2e8f0; padding-top: 12px;">${data.stocks.dow}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #475569; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 12px;">NASDAQ:</td>
                        <td align="right" style="font-weight: 700; font-size: 18px; color: ${data.stocks.nasdaq.includes('+') ? '#16a34a' : data.stocks.nasdaq.includes('-') ? '#dc2626' : '#1e293b'}; border-top: 1px solid #e2e8f0; padding-top: 12px;">${data.stocks.nasdaq}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="font-size: 12px; color: #64748b; font-style: italic; padding-top: 12px;">${data.stocks.note}</td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="16" cellspacing="0" border="0" style="background-color: #f8fafc; border-left: 4px solid #2563eb;">
                      <tr>
                        <td style="font-size: 15px; color: #334155;"><div style="margin: 0; line-height: 1.8;">${data.stocks.news}</div></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ECONOMY Section -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 35px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #16a34a; padding-bottom: 10px; border-bottom: 3px solid #16a34a;">
                      💰 ECONOMY
                    </h2>
                    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #f8fafc; border-left: 4px solid #16a34a;  margin-bottom: 12px;">
                      <tr>
                        <td style="font-weight: 600; color: #475569; font-size: 14px;">US10YEAR:</td>
                        <td align="right" style="font-weight: 700; font-size: 18px; color: ${data.economy.us10year.includes('+') ? '#16a34a' : data.economy.us10year.includes('-') ? '#dc2626' : '#1e293b'};">${data.economy.us10year}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #475569; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 12px;">Gold:</td>
                        <td align="right" style="font-weight: 700; font-size: 18px; color: ${data.economy.gold.includes('+') ? '#16a34a' : data.economy.gold.includes('-') ? '#dc2626' : '#1e293b'}; border-top: 1px solid #e2e8f0; padding-top: 12px;">${data.economy.gold}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #475569; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 12px;">Silver:</td>
                        <td align="right" style="font-weight: 700; font-size: 18px; color: ${data.economy.silver.includes('+') ? '#16a34a' : data.economy.silver.includes('-') ? '#dc2626' : '#1e293b'}; border-top: 1px solid #e2e8f0; padding-top: 12px;">${data.economy.silver}</td>
                      </tr>
                      ${data.economy.note ? `<tr>
                        <td colspan="2" style="font-size: 12px; color: #64748b; font-style: italic; padding-top: 12px;">${data.economy.note}</td>
                      </tr>` : ''}
                    </table>
                    <table width="100%" cellpadding="16" cellspacing="0" border="0" style="background-color: #f8fafc; border-left: 4px solid #16a34a;">
                      <tr>
                        <td style="font-size: 15px; color: #334155;">${formatCommentary(data.economy.commentary)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${data.crypto ? `<!-- CRYPTO Section -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 35px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #f59e0b; padding-bottom: 10px; border-bottom: 3px solid #f59e0b;">
                      ₿ CRYPTO
                    </h2>
                    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #f8fafc; border-left: 4px solid #f59e0b;  margin-bottom: 12px;">
                      <tr>
                        <td style="font-weight: 600; color: #475569; font-size: 14px;">BTC:</td>
                        <td align="right" style="font-weight: 700; font-size: 18px; color: ${data.crypto.btc.includes('+') ? '#16a34a' : data.crypto.btc.includes('-') ? '#dc2626' : '#1e293b'};">${data.crypto.btc}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #475569; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 12px;">ETH:</td>
                        <td align="right" style="font-weight: 700; font-size: 18px; color: ${data.crypto.eth.includes('+') ? '#16a34a' : data.crypto.eth.includes('-') ? '#dc2626' : '#1e293b'}; border-top: 1px solid #e2e8f0; padding-top: 12px;">${data.crypto.eth}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #475569; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 12px;">XRP:</td>
                        <td align="right" style="font-weight: 700; font-size: 18px; color: ${data.crypto.xrp.includes('+') ? '#16a34a' : data.crypto.xrp.includes('-') ? '#dc2626' : '#1e293b'}; border-top: 1px solid #e2e8f0; padding-top: 12px;">${data.crypto.xrp}</td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="16" cellspacing="0" border="0" style="background-color: #f8fafc; border-left: 4px solid #f59e0b;">
                      <tr>
                        <td style="font-size: 15px; color: #334155;">${formatCommentary(data.crypto.commentary)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>` : ''}

              <!-- REAL ESTATE Section -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 35px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #ea580c; padding-bottom: 10px; border-bottom: 3px solid #ea580c;">
                      🏠 REAL ESTATE
                    </h2>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
                      <tr>
                        <td width="48%" style="vertical-align: top;">
                          <table width="100%" cellpadding="16" cellspacing="0" border="0" style="background-color: #f8fafc; border-left: 4px solid #ea580c;  text-align: center;">
                            <tr>
                              <td>
                                <div style="font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">30-Year</div>
                                <div style="font-size: 32px; font-weight: 700; color: #1e293b;">${data.real_estate.rate_30year}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="4%"></td>
                        <td width="48%" style="vertical-align: top;">
                          <table width="100%" cellpadding="16" cellspacing="0" border="0" style="background-color: #f8fafc; border-left: 4px solid #ea580c;  text-align: center;">
                            <tr>
                              <td>
                                <div style="font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">15-Year</div>
                                <div style="font-size: 32px; font-weight: 700; color: #1e293b;">${data.real_estate.rate_15year}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="16" cellspacing="0" border="0" style="background-color: #f8fafc; border-left: 4px solid #ea580c;">
                      <tr>
                        <td style="font-size: 15px; color: #334155;">
                          <div style="margin: 0 0 16px 0; font-weight: 700; font-size: 16px;">${data.real_estate.homebuilder}</div>
                          ${formatCommentary(data.real_estate.commentary)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Image 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <img src="https://raw.githubusercontent.com/User8888-Level3/RealtyExperts-Daily-Email/main/RE-Daily-1-${dateForFile}.png" alt="Local Housing Statistics" width="100%" style="display: block; max-width: 100%; height: auto;">
                  </td>
                </tr>
              </table>

              <!-- Image 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <img src="https://raw.githubusercontent.com/User8888-Level3/RealtyExperts-Daily-Email/main/RE-Daily-2-${dateForFile}.png" alt="Market Analysis Chart" width="100%" style="display: block; max-width: 100%; height: auto;">
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #2563eb; font-size: 14px;">REALTY EXPERTS</p>
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">"Our Experience is the Difference"</p>
              <p style="margin: 0; color: #64748b; font-size: 13px;">Daily Market Glance · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Main execution
const args = process.argv.slice(2);
const jsonFile = args[0] || 'daily-market-template.json';

if (!fs.existsSync(jsonFile)) {
  console.error(`Error: File "${jsonFile}" not found`);
  process.exit(1);
}

const data = loadData(jsonFile);
const html = generateHTML(data);
const dateForFile = data.date.replace(/\//g, '');
const outputFile = `daily-market-glance-${dateForFile}.html`;

fs.writeFileSync(outputFile, html);
console.log(`✅ Generated: ${outputFile}`);
console.log(`📧 Subject: "At a Glance" Local Housing STATS and News ${data.date}`);
console.log(`🌐 Web View: https://user8888-level3.github.io/RealtyExperts-Daily-Email/${outputFile}`);
