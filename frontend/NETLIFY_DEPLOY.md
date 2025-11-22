# Netlify Deployment Guide for Peer-to-Peer Platform

## Quick Setup

### 1. Environment Variables (CRITICAL)
In your Netlify dashboard, go to **Site settings → Environment variables** and add:

```
VITE_API_BASE_URL = https://peer-to-peer-platform.onrender.com
```

⚠️ **Important**: The `.env` file is NOT deployed to Netlify. You MUST set this in the Netlify dashboard.

### 2. Build Settings
These should already be configured in `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

### 3. Deploy
Push to your connected repository or drag the `dist` folder to Netlify.

## Troubleshooting Common Errors

### Error: "Module not found" or Import errors
**Solution**: 
```cmd
cd d:\new\frontend
npm install
npm run build
```

### Error: Blank page after deployment
**Causes**:
1. Missing `VITE_API_BASE_URL` environment variable in Netlify
2. API calls failing due to CORS issues
3. Missing `_redirects` file (now added in `public/`)

**Solution**: 
- Check browser DevTools Console for errors
- Verify environment variable is set in Netlify
- Ensure backend CORS allows your Netlify domain

### Error: 404 on page refresh
**Solution**: Already fixed with `_redirects` file and `netlify.toml` redirects

### Error: Build fails with "command not found"
**Solution**: Verify `package.json` has:
```json
"scripts": {
  "build": "vite build"
}
```

## Manual Deploy (Testing)

```cmd
cd d:\new\frontend
npm run build
```

Then drag the `dist` folder to Netlify's manual deploy area.

## Post-Deployment Checklist

- [ ] Set `VITE_API_BASE_URL` in Netlify environment variables
- [ ] Verify build logs show no errors
- [ ] Test login/signup functionality
- [ ] Check browser console for API errors
- [ ] Verify backend CORS includes your Netlify URL
- [ ] Test all routes (questions, resources, contributors)

## Update Backend CORS

Your backend needs to allow your Netlify domain. In `backend/src/server.js`, update:

```javascript
app.use(cors({
  origin: [
    'https://peertopeer-platform.netlify.app',  // Your actual Netlify URL
    'https://peer-to-peer-platform.onrender.com',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
```

Replace `peertopeer-platform.netlify.app` with your actual Netlify URL.
