# 🎯 Automated Daily Market System - Overview

## System Architecture

This automation system creates a seamless workflow connecting three platforms:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTOMATED WORKFLOW                           │
└─────────────────────────────────────────────────────────────────┘

    📁 Local Images
         │
         ├── RE-Daily-1-MMDDYY.png
         └── RE-Daily-2-MMDDYY.png
              │
              ▼
    🔧 Automation Script
    (automate-daily-market.js)
              │
              ├──────────────┬──────────────┬──────────────┐
              ▼              ▼              ▼              ▼
         GitHub Repo   GitHub Pages   Agent Hub      Email HTML
              │              │              │              │
              ▼              ▼              ▼              ▼
         Store Images   Serve Images   Create Post   Generate Email
              │              │              │              │
              └──────────────┴──────────────┴──────────────┘
                              │
                              ▼
                   ✅ Cross-Linked Content
                   • Agent Hub → Email URL
                   • Email → Agent Hub URL
                   • QR Code → Agent Hub
```

## Key Components

### 1. Automation Scripts

| File | Purpose | Usage |
|------|---------|-------|
| `automate-daily-market.js` | Main automation engine | `node automate-daily-market.js [date] [token]` |
| `run-daily-automation.sh` | User-friendly wrapper | `./run-daily-automation.sh` |
| `test-automation.js` | Pre-flight checks | `./test-automation.js` |
| `generate-daily-email.js` | Email HTML generator | Called automatically |

### 2. Data Files

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `daily-market-template.json` | Market data source | Daily (before automation) |
| `RE-Daily-1-MMDDYY.png` | Housing statistics image | Daily (before automation) |
| `RE-Daily-2-MMDDYY.png` | Market analysis image | Daily (before automation) |
| `package.json` | Node.js dependencies | One-time setup |

### 3. Documentation

| File | Purpose | Audience |
|------|---------|----------|
| `QUICKSTART.md` | 5-minute quick start | First-time users |
| `AUTOMATION-README.md` | Detailed reference | All users |
| `SYSTEM-OVERVIEW.md` | Architecture guide | Developers |

### 4. Generated Outputs

| File Pattern | Purpose | Auto-Generated |
|--------------|---------|----------------|
| `daily-market-glance-MMDDYY.html` | Email browser version | Yes |
| `note-qr-[id].png` | QR code for Agent Hub | Yes |

## Workflow Steps Explained

### Step 1: Image Upload (30 seconds)
- Adds images to Git staging
- Creates commit with descriptive message
- Pushes to GitHub main branch
- **Output**: Images stored in GitHub repository

### Step 2: GitHub Pages Wait (30-60 seconds)
- Polls GitHub Raw URLs for accessibility
- Uses retry logic with exponential backoff
- Verifies CDN propagation
- **Output**: Public URLs for images

### Step 3: Agent Hub Post (15 seconds)
- Calls Supabase Edge Function `notes-api`
- Creates public note with HTML content
- Embeds images at top
- Formats market analysis below
- **Output**: Shareable Agent Hub URL

### Step 4: QR Code Generation (10 seconds)
- Generates QR code pointing to Agent Hub
- Commits and pushes QR to GitHub
- Waits for availability
- **Output**: QR code image URL

### Step 5: Email Generation (20 seconds)
- Modifies email template with Agent Hub URL
- Runs email generator script
- Embeds QR code in email
- Commits and pushes HTML to GitHub
- **Output**: Email browser URL

### Step 6: Cross-Reference (10 seconds)
- Fetches created Agent Hub note
- Prepends "Open Email in Browser" banner
- Updates note via API
- **Output**: Fully cross-linked content

**Total Time**: ~2-3 minutes (mostly waiting for GitHub Pages)

## API Integrations

### Supabase Edge Functions

**Endpoint**: `https://rdxzxokcbmmjjgyevqxq.supabase.co/functions/v1`

#### notes-api
- **POST** - Create note
- **PUT** - Update note
- **Requires**: Session token, Session ID

**Request Example**:
```javascript
{
  headers: {
    'x-session-token': 'admin-token-here',
    'x-session-id': 'automation-generated-id'
  },
  body: {
    title: 'Post title',
    body: 'HTML content',
    category: 'general',
    visibility: 'public',
    body_format: 'html'
  }
}
```

### GitHub API

**Raw Content**: `https://raw.githubusercontent.com/User8888-Level3/RealtyExperts-Daily-Email/main/`

**GitHub Pages**: `https://user8888-level3.github.io/RealtyExperts-Daily-Email/`

## Security Considerations

### Session Tokens
- Admin session tokens expire after 24-48 hours
- Never commit tokens to Git
- Use environment variables or pass as arguments
- Tokens are HMAC-SHA256 signed

### Git Authentication
- Uses local Git credentials
- Must have push access to repository
- SSH or HTTPS authentication supported

### API Keys
- Supabase anon key is public (safe to include)
- Service role key NOT used (stays on server)

## Error Handling

### Retry Logic
- GitHub Pages: 10 retries, 5 seconds apart
- API calls: Single attempt (fail fast)
- Git operations: Single attempt (fail fast)

### Common Failures

| Error | Cause | Solution |
|-------|-------|----------|
| Image not found | Wrong filename/date | Verify naming |
| Session expired | Token too old | Get fresh token |
| Git push failed | Auth issues | Re-authenticate |
| URL timeout | GitHub Pages slow | Increase retries |
| API 403 | Wrong token | Use admin token |

## Performance Optimization

### Parallel Operations
- Cannot parallelize (sequential dependencies)
- Each step requires previous step's output

### Caching
- Git objects cached locally
- GitHub CDN caches images
- No application-level caching needed

### Bottlenecks
1. **GitHub Pages propagation** (1-2 minutes)
   - Largest time sink
   - Cannot be optimized
2. **Network latency** (2-5 seconds total)
   - API calls and Git pushes
   - Minimal impact

## Monitoring & Debugging

### Success Indicators
```
✅ AUTOMATION COMPLETE!
📊 Summary shows all URLs
```

### Debug Mode
```bash
# Add verbose logging
NODE_DEBUG=* node automate-daily-market.js
```

### Log Files
- Automation outputs to stdout
- Git outputs captured and logged
- No persistent log files (intentional)

## Maintenance

### Daily Tasks
- Update `daily-market-template.json`
- Create daily images
- Run automation

### Weekly Tasks
- Verify QR codes working
- Check GitHub Pages status
- Test email rendering

### Monthly Tasks
- Review generated files
- Archive old HTML files
- Update dependencies: `npm update`

## Extension Points

### Adding New Sections
Edit `automate-daily-market.js` → `formatAnalysisText()`:
```javascript
// Add new section to template
<h2>🌟 New Section</h2>
<div>${formatAnalysisText(templateData.new_section.content)}</div>
```

### Custom Email Styling
Edit `generate-daily-email.js` → inline styles:
```javascript
style="background-color: #custom; ..."
```

### Different QR Code Styles
Edit `automate-daily-market.js` → `generateQRCode()`:
```javascript
QRCode.toFile(qrPath, noteUrl, {
  width: 500,  // Larger size
  color: { dark: '#custom-color' }
});
```

## Backup & Recovery

### Backup Strategy
- All outputs stored in Git (version controlled)
- Template data backed up daily
- No database state to backup

### Recovery Procedures
1. **Corrupted HTML**: Re-run automation for that date
2. **Lost QR code**: QR regenerates automatically
3. **Wrong Agent Hub post**: Delete and re-run
4. **Git conflicts**: Force push or manual resolution

## Future Enhancements

### Possible Improvements
- [ ] Automated template data fetching (API integration)
- [ ] Scheduled cron job for daily execution
- [ ] Email distribution integration
- [ ] Analytics tracking (opens, clicks)
- [ ] Multi-region support
- [ ] Template validation
- [ ] Automated testing suite

### Known Limitations
- Requires manual token refresh every 1-2 days
- No automatic retry on complete failure
- Single-threaded execution
- No progress persistence (must start over on error)

## Support & Resources

### Internal Documentation
- `QUICKSTART.md` - Getting started
- `AUTOMATION-README.md` - Detailed guide
- Code comments in scripts

### External Resources
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [QRCode npm package](https://www.npmjs.com/package/qrcode)

### Contact
- For bugs: Review error messages in this document
- For features: Document in `README.md`
- For emergencies: Manual fallback (see `generate-daily-email.js`)

---

**Version**: 1.0.0
**Last Updated**: February 12, 2026
**Maintained By**: REALTY EXPERTS® Development Team
