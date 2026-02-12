# 🔐 How to Get Your Admin Session Token

## Quick Steps

1. **Open teamrealtyexperts.com in browser**
   ```
   https://teamrealtyexperts.com
   ```

2. **Log in as admin**
   - Use your admin password

3. **Open Developer Tools**
   - Press `F12` (Windows/Linux)
   - Or `Cmd+Option+I` (Mac)
   - Or Right-click → Inspect

4. **Click "Console" tab**
   - It's usually at the top of the developer tools panel

5. **Type this command:**
   ```javascript
   sessionStorage.getItem('re_session_token')
   ```

6. **Press Enter**

7. **Copy the token**
   - You'll see output like: `"eyJhbGc...long string..."`
   - Copy ONLY the part between the quotes
   - Don't include the quote marks themselves

## Example

**What you type:**
```javascript
sessionStorage.getItem('re_session_token')
```

**What you see:**
```
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YWxpZGF0ZWQiOnRydWUsImV4cCI6MTczOTQwNzYxNjY3Mywicm9sZSI6ImFkbWluIiwibm9uY2UiOiI2YjUzNGEyZjQxIn0.x8Kz3jL9..."
```

**What you copy:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YWxpZGF0ZWQiOnRydWUsImV4cCI6MTczOTQwNzYxNjY3Mywicm9sZSI6ImFkbWluIiwibm9uY2UiOiI2YjUzNGEyZjQxIn0.x8Kz3jL9...
```
(everything EXCEPT the quotes)

## Troubleshooting

### "null" or nothing appears
- **Cause**: Not logged in or session expired
- **Fix**: Log in again and retry

### "Cannot read properties of null"
- **Cause**: Wrong storage location
- **Fix**: Make sure you're using `sessionStorage` (not `localStorage`)

### Token seems short
- **Cause**: Didn't copy the whole thing
- **Fix**: The token should be 200+ characters. Make sure you got it all!

## Security Notes

⚠️ **Keep your token private!**
- Don't share it with anyone
- Don't commit it to Git
- It expires after 24-48 hours
- Get a fresh one when it expires

## Quick Test

After copying your token, test it works:

```bash
# Set it as an environment variable
export ADMIN_SESSION_TOKEN="paste-token-here"

# Run the automation
./run-daily-automation.sh
```

---

**Need more help?** See [QUICKSTART.md](./QUICKSTART.md)
