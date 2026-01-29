# Fix: Unauthorized Domain Error for Firebase OAuth

## Error Message
```
Firebase: This domain is not authorized for OAuth operations for your Firebase project.
```

## Solution: Add Your Domain to Authorized Domains

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **shadowdef-6a79f**

### Step 2: Navigate to Authentication Settings
1. Click on **Authentication** in the left sidebar
2. Click on the **Settings** tab (gear icon or Settings)
3. Scroll down to **Authorized domains** section

### Step 3: Add Your Domain

You'll see a list of authorized domains. By default, Firebase includes:
- `localhost` (for local development)
- Your Firebase project domain
- Any custom domains you've added

**For Local Development:**
- If testing on `localhost`, make sure `localhost` is in the list
- Also add `127.0.0.1` if you're using that
- If using a custom local domain like `shadowdef.local`, add that

**To Add a Domain:**
1. Click **"Add domain"** button
2. Enter your domain (e.g., `localhost`, `127.0.0.1`, or your production domain)
3. Click **"Add"**

**Common Development Domains to Add:**
- `localhost`
- `127.0.0.1`
- `file://` (if testing locally without a server - though this has limitations)

**For Production:**
- Add your actual domain (e.g., `yourdomain.com`)
- Add any subdomains you use (e.g., `www.yourdomain.com`)

### Step 4: Verify

After adding the domain:
1. Wait a few seconds for changes to propagate
2. Refresh your game page
3. Try Google login again

## Quick Reference: Common Domains

If you're testing locally, make sure these are authorized:
- ✅ `localhost` (usually included by default)
- ✅ `127.0.0.1` (if you access via IP)
- ✅ Your production domain when deployed

## Alternative: Using file:// Protocol

If you're opening the HTML file directly (file:// protocol), Firebase OAuth won't work due to browser security restrictions. You need to:

1. **Use a local server** instead:
   - Python: `python -m http.server 8000`
   - Node.js: `npx http-server`
   - VS Code: Use "Live Server" extension
   - Then access via `http://localhost:8000`

2. **Or add localhost to authorized domains** and use a local server

## Still Having Issues?

1. **Check browser console** for the exact domain being used
2. **Verify the domain** matches exactly (case-sensitive, includes port if needed)
3. **Wait a minute** after adding the domain (changes can take a moment)
4. **Clear browser cache** and try again
5. **Check Firebase Console** to confirm the domain was added successfully

---

**Note:** The domain must match exactly, including the port number if you're using one (e.g., `localhost:8000` vs `localhost`).

