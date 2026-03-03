/**
 * HTML building blocks for Agent Hub posts.
 * Dark-mode-safe white card layout with colored header bars.
 */

// --- Text formatting utilities (shared with generate-daily-email.js) ---

function formatCommentary(text) {
  if (!text) return '';
  const paragraphs = text.split('\n\n');

  return paragraphs.map(para => {
    if (para.includes('\u2022')) {
      const lines = para.split('\n');
      let html = '';
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('\u2022')) {
          const colonMatch = trimmed.match(/^\u2022 ([^:]+):(.*)/);
          if (colonMatch) {
            html += `<div style="margin: 10px 0 6px 0; line-height: 1.8;"><strong style="color: #1e293b;">\u2022 ${colonMatch[1]}:</strong>${colonMatch[2]}</div>`;
          } else {
            html += `<div style="margin: 6px 0; padding-left: 0; line-height: 1.8;">${trimmed}</div>`;
          }
        } else if (trimmed.startsWith('\ud83d\udccd')) {
          html += `<div style="margin: 20px 0 12px 0; font-weight: 700; font-size: 16px; line-height: 1.6; color: #1e293b;">${trimmed}</div>`;
        } else if (trimmed.startsWith('o ')) {
          html += `<div style="margin: 6px 0; padding-left: 20px; line-height: 1.8; color: #334155;">${trimmed}</div>`;
        } else if (trimmed) {
          if (trimmed.endsWith(':')) {
            html += `<div style="margin: 0 0 10px 0; line-height: 1.8; font-weight: 700; color: #1e293b;">${trimmed}</div>`;
          } else {
            html += `<div style="margin: 10px 0; line-height: 1.8; font-weight: 600;">${trimmed}</div>`;
          }
        }
      });
      return html;
    } else {
      const trimmed = para.trim();
      if (trimmed.startsWith('\ud83d\udccd')) {
        return `<div style="margin: 20px 0 12px 0; font-weight: 700; font-size: 16px; line-height: 1.6; color: #1e293b;">${trimmed}</div>`;
      } else if (trimmed.endsWith(':')) {
        return `<div style="margin: 0 0 10px 0; line-height: 1.8; font-weight: 700; color: #1e293b;">${trimmed}</div>`;
      }
      return `<div style="margin: 0 0 16px 0; line-height: 1.8;">${trimmed}</div>`;
    }
  }).join('');
}

function addArrow(value) {
  if (value.includes('+')) return '\u25b2 ' + value;
  if (value.includes('-')) return '\u25bc ' + value;
  return value;
}

function valueColor(value) {
  if (value.includes('+')) return '#16a34a';
  if (value.includes('-')) return '#dc2626';
  return '#1e293b';
}

// --- Agent Hub post HTML builders ---

function card(emoji, title, color, content) {
  return `<div style="background:#ffffff;border-radius:10px;overflow:hidden;margin-bottom:20px;border:1px solid #e2e8f0;">
  <div style="background:${color};padding:12px 18px;">
    <span style="color:#ffffff;font-size:16px;font-weight:700;">${emoji} ${title}</span>
  </div>
  <div style="padding:18px 18px 12px;background:#ffffff;">
    ${content}
  </div>
</div>`;
}

const p = (t) => `<p style="color:#1e293b;margin:0 0 10px;font-size:14px;line-height:1.6;">${t}</p>`;
const sm = (t) => `<p style="color:#64748b;font-size:12px;margin:0 0 10px;font-style:italic;">${t}</p>`;
const b = (l) => `<strong style="color:#1e293b;">${l}</strong>`;
const a = (href, label) => `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;">${label}</a>`;

function banner(dateStr, emailUrl) {
  // Format date for display (e.g., "Mar 2, 2026" from "03/02/26")
  const parts = dateStr.split('/');
  const dateObj = new Date(2000 + parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
  const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return `<div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;padding:32px 24px;text-align:center;margin-bottom:24px;">
  <div style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">REALTY EXPERTS\u00ae</div>
  <div style="color:#ffffff;font-size:26px;font-weight:700;margin-bottom:8px;">Daily Market Glance</div>
  <div style="color:rgba(255,255,255,0.8);font-size:14px;margin-bottom:20px;">${displayDate} \u00b7 Real Estate \u00b7 Stocks \u00b7 Economy \u00b7 Crypto</div>
  <a href="${emailUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:white;color:#667eea;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">Open Email in Browser</a>
</div>`;
}

function images(img1Url, img2Url) {
  return `<div style="margin-bottom:20px;">
  <img src="${img1Url}" alt="Daily Market Data Table" style="width:100%;max-width:650px;display:block;margin:0 auto 12px;border-radius:8px;" />
  <img src="${img2Url}" alt="Market Chart" style="width:100%;max-width:650px;display:block;margin:0 auto;border-radius:8px;" />
</div>`;
}

// --- Section builders ---

function realEstateSection(data) {
  const re = data.real_estate;
  let content = '';
  content += p(`${b('30-Year Rate:')} ${re.rate_30year} &nbsp;|&nbsp; ${b('15-Year Rate:')} ${re.rate_15year}`);

  // homebuilder content — split paragraphs and format each
  if (re.homebuilder) {
    const paras = re.homebuilder.split('\n\n');
    paras.forEach(para => {
      const trimmed = para.trim();
      // Check for bold label pattern "Label: description"
      const colonMatch = trimmed.match(/^([^:]+):(.*)/s);
      if (colonMatch && colonMatch[1].length < 60) {
        content += p(`${b(colonMatch[1] + ':')} ${colonMatch[2].trim()}`);
      } else {
        content += p(trimmed);
      }
    });
  }

  // commentary
  if (re.commentary) {
    const paras = re.commentary.split('\n\n');
    paras.forEach(para => {
      const trimmed = para.trim();
      if (trimmed.startsWith('\ud83c\udfe1') || trimmed.startsWith('\ud83d\udcf0')) {
        // Emoji-prefixed items: bold the label portion
        const colonMatch = trimmed.match(/^([^\n:]+):(.*)/s);
        if (colonMatch) {
          content += p(`${b(colonMatch[1] + ':')} ${colonMatch[2].trim()}`);
        } else {
          content += p(`${b(trimmed)}`);
        }
      } else if (trimmed.endsWith(':')) {
        content += p(b(trimmed));
      } else {
        content += p(trimmed);
      }
    });
  }

  return card('\ud83c\udfe0', 'Real Estate', '#ea580c', content);
}

function stocksSection(data) {
  const s = data.stocks;
  let content = '';
  content += p(`${b('S&amp;P 500:')} ${s.sp500} &nbsp;|&nbsp; ${b('DOW:')} ${s.dow} &nbsp;|&nbsp; ${b('NASDAQ:')} ${s.nasdaq}`);
  if (s.note) content += sm(s.note);

  if (s.news) {
    const paras = s.news.split('\n\n');
    paras.forEach(para => {
      const trimmed = para.trim();
      const colonMatch = trimmed.match(/^([^:]+):(.*)/s);
      if (colonMatch && colonMatch[1].length < 60) {
        content += p(`${b(colonMatch[1] + ':')} ${colonMatch[2].trim()}`);
      } else {
        content += p(trimmed);
      }
    });
  }

  return card('\ud83d\udcc8', 'Stocks', '#2563eb', content);
}

function economySection(data) {
  const e = data.economy;
  let content = '';
  content += p(`${b('10-Year Treasury:')} ${e.us10year} &nbsp;|&nbsp; ${b('Gold:')} ${e.gold} &nbsp;|&nbsp; ${b('Silver:')} ${e.silver}`);
  if (e.note) content += sm(e.note);

  if (e.commentary) {
    const paras = e.commentary.split('\n\n');
    paras.forEach(para => {
      const trimmed = para.trim();
      const colonMatch = trimmed.match(/^([^:]+):(.*)/s);
      if (colonMatch && colonMatch[1].length < 60) {
        content += p(`${b(colonMatch[1] + ':')} ${colonMatch[2].trim()}`);
      } else {
        content += p(trimmed);
      }
    });
  }

  return card('\ud83c\udfe6', 'Economy', '#16a34a', content);
}

function cryptoSection(data) {
  if (!data.crypto) return '';
  const c = data.crypto;
  let content = '';
  content += p(`${b('BTC:')} ${c.btc} &nbsp;|&nbsp; ${b('ETH:')} ${c.eth} &nbsp;|&nbsp; ${b('XRP:')} ${c.xrp}`);
  if (c.note) content += sm(c.note);

  if (c.commentary) {
    const paras = c.commentary.split('\n\n');
    paras.forEach(para => {
      const trimmed = para.trim();
      const colonMatch = trimmed.match(/^([^:]+):(.*)/s);
      if (colonMatch && colonMatch[1].length < 60) {
        content += p(`${b(colonMatch[1] + ':')} ${colonMatch[2].trim()}`);
      } else {
        content += p(trimmed);
      }
    });
  }

  return card('\u20bf', 'Crypto', '#f59e0b', content);
}

function sourcesBlock(sources) {
  if (!sources || sources.length === 0) return '';

  function labelFromUrl(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace('www.', '');
      const publishers = {
        'bloomberg.com': 'Bloomberg',
        'cnbc.com': 'CNBC',
        'reuters.com': 'Reuters',
        'wsj.com': 'WSJ',
        'coindesk.com': 'CoinDesk',
        'tradingeconomics.com': 'Trading Economics',
        'mortgagenewsdaily.com': 'Mortgage News Daily',
        'bankrate.com': 'Bankrate',
        'yahoo.com': 'Yahoo Finance',
        'finance.yahoo.com': 'Yahoo Finance',
        'fool.com': 'Motley Fool',
        'decrypt.co': 'Decrypt',
        'tricityvoice.com': 'Tri-City Voice',
        'wrenews.com': 'WRE News',
      };
      const publisher = publishers[host] || host.split('.')[0].charAt(0).toUpperCase() + host.split('.')[0].slice(1);
      const pathParts = u.pathname.split('/').filter(Boolean);
      const slug = pathParts[pathParts.length - 1] || '';
      const topic = slug
        .replace(/\.html?$/, '')
        .replace(/\d{4}-\d{2}-\d{2}/, '')
        .replace(/-+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim()
        .slice(0, 40);
      return topic ? `${publisher} \u2014 ${topic}` : publisher;
    } catch {
      return url.slice(0, 50);
    }
  }

  const links = sources.map(url =>
    `<p style="font-size:12px;margin:0 0 3px;">${a(url, labelFromUrl(url))}</p>`
  ).join('\n  ');

  return `<div style="background:#f8fafc;border-radius:10px;padding:16px 18px;margin-bottom:16px;border:1px solid #e2e8f0;">
  <p style="color:#475569;font-size:13px;font-weight:600;margin:0 0 8px;">Sources</p>
  ${links}
</div>
<p style="color:#94a3b8;font-size:11px;margin:0;"><em>Market data is for informational purposes only. Always verify with your lender or financial advisor before making decisions.</em></p>`;
}

/**
 * Build the complete Agent Hub post body HTML from JSON data.
 */
function buildPostBody(data, emailUrl, img1Url, img2Url) {
  const parts = [
    banner(data.date, emailUrl),
    images(img1Url, img2Url),
    realEstateSection(data),
    stocksSection(data),
    economySection(data),
    cryptoSection(data),
    sourcesBlock(data.sources),
  ].filter(Boolean);

  return parts.join('\n');
}

module.exports = {
  // Text formatting (shared with generate-daily-email.js)
  formatCommentary,
  addArrow,
  valueColor,
  // Agent Hub post builders
  card,
  p,
  sm,
  b,
  a,
  banner,
  images,
  realEstateSection,
  stocksSection,
  economySection,
  cryptoSection,
  sourcesBlock,
  buildPostBody,
};
