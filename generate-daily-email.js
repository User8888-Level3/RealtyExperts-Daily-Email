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
    // Check if paragraph is an image embed [IMAGE:url]
    const imageMatch = para.trim().match(/^\[IMAGE:(.+)\]$/);
    if (imageMatch) {
      const imageUrl = imageMatch[1];
      return `<div style="margin: 16px 0; text-align: center;"><img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto; border-radius: 8px;"></div>`;
    }

    // Check if paragraph contains bullet points
    if (para.includes('•')) {
      const lines = para.split('\n');
      let html = '';
      let isFirstLine = true;

      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('•')) {
          // Check if this bullet point has a bold label (ends with :)
          const colonMatch = trimmed.match(/^• ([^:]+):(.*)/);
          if (colonMatch) {
            html += `<div style="margin: 10px 0 6px 0; line-height: 1.8;"><strong style="color: #1e293b;">• ${colonMatch[1]}:</strong>${colonMatch[2]}</div>`;
          } else {
            html += `<div style="margin: 6px 0; padding-left: 0; line-height: 1.8;">${trimmed}</div>`;
          }
        } else if (trimmed.startsWith('📍')) {
          html += `<div style="margin: 20px 0 12px 0; font-weight: 700; font-size: 16px; line-height: 1.6; color: #1e293b;">${trimmed}</div>`;
        } else if (trimmed.startsWith('o ')) {
          // Nested list items (open houses, etc) - normal weight
          html += `<div style="margin: 6px 0; padding-left: 20px; line-height: 1.8; color: #334155;">${trimmed}</div>`;
        } else if (trimmed) {
          // Headers ending with colon should be bold
          if (trimmed.endsWith(':')) {
            html += `<div style="margin: 0 0 10px 0; line-height: 1.8; font-weight: 700; color: #1e293b;">${trimmed}</div>`;
          } else {
            html += `<div style="margin: 10px 0; line-height: 1.8; font-weight: 600;">${trimmed}</div>`;
          }
        }
        if (trimmed) isFirstLine = false;
      });
      return html;
    } else {
      // Check if this paragraph is a location marker or header
      const trimmed = para.trim();
      if (trimmed.startsWith('📍')) {
        return `<div style="margin: 20px 0 12px 0; font-weight: 700; font-size: 16px; line-height: 1.6; color: #1e293b;">${trimmed}</div>`;
      } else if (trimmed.endsWith(':')) {
        return `<div style="margin: 0 0 10px 0; line-height: 1.8; font-weight: 700; color: #1e293b;">${trimmed}</div>`;
      }
      return `<div style="margin: 0 0 16px 0; line-height: 1.8;">${trimmed}</div>`;
    }
  }).join('');
}

// Add up/down arrow indicators to values with percentages
function addArrow(value) {
  if (value.includes('+')) {
    return '▲ ' + value;
  } else if (value.includes('-')) {
    return '▼ ' + value;
  }
  return value;
}

// Get value color based on +/- indicator
function valueColor(value) {
  if (value.includes('+')) return '#16a34a';
  if (value.includes('-')) return '#dc2626';
  return '#1e293b';
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
  <style>
    /* Lightbox styles */
    .lightbox-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      z-index: 9999;
      cursor: zoom-out;
    }
    .lightbox-overlay.active {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lightbox-image {
      max-width: 95%;
      max-height: 95%;
      object-fit: contain;
      box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
    }
    .lightbox-close {
      position: absolute;
      top: 20px;
      right: 30px;
      color: white;
      font-size: 40px;
      font-weight: bold;
      cursor: pointer;
      background: none;
      border: none;
      z-index: 10000;
    }
    .clickable-image {
      cursor: zoom-in;
      transition: opacity 0.2s;
    }
    .clickable-image:hover {
      opacity: 0.9;
    }
  </style>
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
              <img src="https://harvinder.dscloud.me/blog/wp-content/uploads/2024/02/cropped-2022_Logo_WhiteBox-Realtor-1.jpg" alt="REALTY EXPERTS®" width="250" style="display: block; margin: 0 auto 15px; max-width: 100%; height: auto;">
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
                      <strong style="font-size: 16px;">📱 <a href="https://teamrealtyexperts.com/share/0c870e8a-bfed-4aba-ac41-b64d8960f14c" style="color: #2563eb; text-decoration: none;">View Full Post on Agent Hub</a></strong>
                      <div style="margin-top: 8px; color: #475569;">
                        Scan the QR code or visit our Agent Hub for the complete market update. Contact the front desk for your access code.
                      </div>
                    </div>
                  </td>
                  <td width="30%" style="vertical-align: middle; text-align: center;">
                    <img src="https://harvinder.dscloud.me/blog/wp-content/uploads/2026/02/note-qr-0c870e8a.png" alt="Agent Hub QR Code" width="100" style="display: block; margin: 0 auto; max-width: 100px; height: auto;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">

              <!-- Image 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center">
                    <img src="https://harvinder.dscloud.me/blog/wp-content/uploads/2026/02/re-daily-1-4.png" alt="Local Housing Statistics" width="100%" class="clickable-image" onclick="openLightbox(this.src)" style="display: block; max-width: 100%; height: auto; cursor: zoom-in;">
                  </td>
                </tr>
              </table>

              <!-- Image 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 35px 0;">
                <tr>
                  <td align="center">
                    <img src="https://harvinder.dscloud.me/blog/wp-content/uploads/2026/02/re-daily-2-4.png" alt="Market Analysis Chart" width="100%" class="clickable-image" onclick="openLightbox(this.src)" style="display: block; max-width: 100%; height: auto; cursor: zoom-in;">
                  </td>
                </tr>
              </table>

              <!-- REAL ESTATE Section -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #ea580c; padding: 14px 20px;">
                          <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                            🏠 REAL ESTATE
                          </h2>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 12px 0;">
                      <tr>
                        <td width="48%" style="vertical-align: top;">
                          <table width="100%" cellpadding="16" cellspacing="0" border="0" style="background-color: #ea580c; text-align: center;">
                            <tr>
                              <td>
                                <div style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">30-Year Fixed</div>
                                <div style="font-size: 32px; font-weight: 700; color: #ffffff;">${data.real_estate.rate_30year}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="4%"></td>
                        <td width="48%" style="vertical-align: top;">
                          <table width="100%" cellpadding="16" cellspacing="0" border="0" style="background-color: #ea580c; text-align: center;">
                            <tr>
                              <td>
                                <div style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">15-Year Fixed</div>
                                <div style="font-size: 32px; font-weight: 700; color: #ffffff;">${data.real_estate.rate_15year}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="16" cellspacing="0" border="0" style="background-color: #fff7ed; border-top: 4px solid #ea580c;">
                      <tr>
                        <td style="font-size: 15px; color: #334155;">
                          ${formatCommentary(data.real_estate.homebuilder)}
                          ${formatCommentary(data.real_estate.commentary)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Section Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 10px 0;">
                <tr><td style="border-bottom: 1px solid #e2e8f0; font-size: 1px; height: 1px;">&nbsp;</td></tr>
              </table>

              <!-- STOCKS Section -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #2563eb; padding: 14px 20px;">
                          <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                            📈 STOCKS
                          </h2>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 12px 0;">
                      <tr>
                        <td width="32%" style="vertical-align: top;">
                          <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #eff6ff; border-left: 4px solid #2563eb;">
                            <tr>
                              <td>
                                <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">S&amp;P 500</div>
                                <div style="font-size: 17px; font-weight: 700; white-space: nowrap; color: ${valueColor(data.stocks.sp500)};">${addArrow(data.stocks.sp500)}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="2%"></td>
                        <td width="32%" style="vertical-align: top;">
                          <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #eff6ff; border-left: 4px solid #2563eb;">
                            <tr>
                              <td>
                                <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">DOW</div>
                                <div style="font-size: 17px; font-weight: 700; white-space: nowrap; color: ${valueColor(data.stocks.dow)};">${addArrow(data.stocks.dow)}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="2%"></td>
                        <td width="32%" style="vertical-align: top;">
                          <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #eff6ff; border-left: 4px solid #2563eb;">
                            <tr>
                              <td>
                                <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">NASDAQ</div>
                                <div style="font-size: 17px; font-weight: 700; white-space: nowrap; color: ${valueColor(data.stocks.nasdaq)};">${addArrow(data.stocks.nasdaq)}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <div style="font-size: 12px; color: #64748b; font-style: italic; margin-bottom: 12px;">${data.stocks.note}</div>
                    <table width="100%" cellpadding="16" cellspacing="0" border="0" style="background-color: #eff6ff; border-top: 4px solid #2563eb;">
                      <tr>
                        <td style="font-size: 15px; color: #334155;"><div style="margin: 0; line-height: 1.8;">${data.stocks.news}</div></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Section Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 10px 0;">
                <tr><td style="border-bottom: 1px solid #e2e8f0; font-size: 1px; height: 1px;">&nbsp;</td></tr>
              </table>

              <!-- ECONOMY Section -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #16a34a; padding: 14px 20px;">
                          <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                            💰 ECONOMY
                          </h2>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 12px 0;">
                      <tr>
                        <td width="32%" style="vertical-align: top;">
                          <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #f0fdf4; border-left: 4px solid #16a34a;">
                            <tr>
                              <td>
                                <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">US 10-Year</div>
                                <div style="font-size: 17px; font-weight: 700; white-space: nowrap; color: ${valueColor(data.economy.us10year)};">${addArrow(data.economy.us10year)}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="2%"></td>
                        <td width="32%" style="vertical-align: top;">
                          <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #f0fdf4; border-left: 4px solid #16a34a;">
                            <tr>
                              <td>
                                <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Gold</div>
                                <div style="font-size: 17px; font-weight: 700; white-space: nowrap; color: ${valueColor(data.economy.gold)};">${addArrow(data.economy.gold)}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="2%"></td>
                        <td width="32%" style="vertical-align: top;">
                          <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #f0fdf4; border-left: 4px solid #16a34a;">
                            <tr>
                              <td>
                                <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Silver</div>
                                <div style="font-size: 17px; font-weight: 700; white-space: nowrap; color: ${valueColor(data.economy.silver)};">${addArrow(data.economy.silver)}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    ${data.economy.note ? `<div style="font-size: 12px; color: #64748b; font-style: italic; margin-bottom: 12px;">${data.economy.note}</div>` : ''}
                    <table width="100%" cellpadding="16" cellspacing="0" border="0" style="background-color: #f0fdf4; border-top: 4px solid #16a34a;">
                      <tr>
                        <td style="font-size: 15px; color: #334155;">${formatCommentary(data.economy.commentary)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${data.crypto ? `<!-- Section Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 10px 0;">
                <tr><td style="border-bottom: 1px solid #e2e8f0; font-size: 1px; height: 1px;">&nbsp;</td></tr>
              </table>

              <!-- CRYPTO Section -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #f59e0b; padding: 14px 20px;">
                          <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                            ₿ CRYPTO
                          </h2>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 12px 0;">
                      <tr>
                        <td width="32%" style="vertical-align: top;">
                          <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #fffbeb; border-left: 4px solid #f59e0b;">
                            <tr>
                              <td>
                                <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">BTC</div>
                                <div style="font-size: 17px; font-weight: 700; white-space: nowrap; color: ${valueColor(data.crypto.btc)};">${addArrow(data.crypto.btc)}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="2%"></td>
                        <td width="32%" style="vertical-align: top;">
                          <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #fffbeb; border-left: 4px solid #f59e0b;">
                            <tr>
                              <td>
                                <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">ETH</div>
                                <div style="font-size: 17px; font-weight: 700; white-space: nowrap; color: ${valueColor(data.crypto.eth)};">${addArrow(data.crypto.eth)}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="2%"></td>
                        <td width="32%" style="vertical-align: top;">
                          <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #fffbeb; border-left: 4px solid #f59e0b;">
                            <tr>
                              <td>
                                <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">XRP</div>
                                <div style="font-size: 17px; font-weight: 700; white-space: nowrap; color: ${valueColor(data.crypto.xrp)};">${addArrow(data.crypto.xrp)}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    ${data.crypto.note ? `<div style="font-size: 12px; color: #64748b; font-style: italic; margin-bottom: 12px;">${data.crypto.note}</div>` : ''}
                    <table width="100%" cellpadding="16" cellspacing="0" border="0" style="background-color: #fffbeb; border-top: 4px solid #f59e0b;">
                      <tr>
                        <td style="font-size: 15px; color: #334155;">${formatCommentary(data.crypto.commentary)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>` : ''}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #2563eb; height: 4px; font-size: 1px;">&nbsp;</td>
                </tr>
              </table>
              <table width="100%" cellpadding="24" cellspacing="0" border="0" style="background-color: #f8fafc;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #2563eb; font-size: 14px;">REALTY EXPERTS®</p>
                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">"Our Experience is the Difference"</p>
                    <p style="margin: 0 0 12px 0; color: #64748b; font-size: 13px;">Daily Market Glance · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p style="margin: 0 0 16px 0; color: #2563eb; font-size: 13px;"><a href="https://TeamRealtyExperts.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">TeamRealtyExperts.com</a></p>
                    <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 14px;">Disclaimer: The market data, rates, and information provided in this email are for informational purposes only and should not be considered financial advice. Figures are sourced from third-party providers and may be delayed or subject to change. Always verify rates and data with your lender or financial advisor before making any decisions.</p>
                    <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 11px; line-height: 1.6;">If you would like to stop receiving this email, simply reply with <strong style="color: #64748b;">UNSUBSCRIBE</strong>.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

  <!-- Lightbox Overlay -->
  <div id="lightbox" class="lightbox-overlay" onclick="closeLightbox()">
    <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
    <img id="lightbox-img" class="lightbox-image" src="" alt="Full screen view">
  </div>

  <script>
    function openLightbox(src) {
      document.getElementById('lightbox').classList.add('active');
      document.getElementById('lightbox-img').src = src;
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeLightbox() {
      document.getElementById('lightbox').classList.remove('active');
      document.body.style.overflow = ''; // Re-enable scrolling
    }

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    });
  </script>
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
