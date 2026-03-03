const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

module.exports = {
  SUPABASE_HOSTNAME: 'rdxzxokcbmmjjgyevqxq.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeHp4b2tjYm1tampneWV2cXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwODY4NTEsImV4cCI6MjA4NDY2Mjg1MX0.oiIewgoknkmVCZ4NvU8ElkjrVPoIjT7pBjHCaABVsl4',
  GITHUB_RAW_BASE: 'https://raw.githubusercontent.com/User8888-Level3/RealtyExperts-Daily-Email/main',
  GITHUB_PAGES_BASE: 'https://user8888-level3.github.io/RealtyExperts-Daily-Email',
  CHART_HTML_PATH: '/Users/harvinderbalu1/Documents/ClaudeCode/REALTY-EXPERTS-Agent-Hub/latest_inventory_chart.html',
  TEMPLATE_PATH: path.join(PROJECT_ROOT, 'daily-market-template.json'),
  ENV_PATH: path.join(PROJECT_ROOT, '.env'),
};
