# 🚀 Quick Deployment Guide

## Deploy Your Podcast Aggregator in 5 Minutes

### Prerequisites
- GitHub account
- Vercel account (free tier works great)

### Step 1: Push to GitHub

```bash
# Initialize git repository
cd podcast-aggregator
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Podcast Aggregator API"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/podcast-aggregator.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

**Option A: Vercel Dashboard (Easiest)**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel auto-detects the configuration
5. Click "Deploy"
6. Done! 🎉

Your API is now live at: `https://your-project.vercel.app`

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Step 3: Test Your API

```bash
# Replace YOUR_PROJECT with your actual Vercel project name

# Test podcast search
curl "https://YOUR_PROJECT.vercel.app/api/search/podcasts?query=crime&limit=5"

# Test podcast details
curl "https://YOUR_PROJECT.vercel.app/api/podcasts/1380008439"

# Test episodes
curl "https://YOUR_PROJECT.vercel.app/api/episodes?podcast_id=1380008439&limit=10"

# Test episode search
curl "https://YOUR_PROJECT.vercel.app/api/search/episodes?query=interview"
```

### Step 4: Use the Frontend

1. Deploy the React component separately or integrate into your app
2. Update the API base URL in the component:

```javascript
const API_BASE = 'https://YOUR_PROJECT.vercel.app';
```

## 📝 API Endpoints Summary

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `GET /api/search/podcasts` | Search for podcasts | `?query=tech&limit=10` |
| `GET /api/podcasts/[id]` | Get podcast details | `/api/podcasts/123456` |
| `GET /api/episodes` | Get all episodes | `?podcast_id=123456` |
| `GET /api/search/episodes` | Search episodes | `?query=interview` |
| `GET /api/episodes/transcript` | Get transcript | `?url=episode_url` |

## 🎨 Frontend Deployment

Deploy the React component:

```bash
# Create a new Vercel project for frontend
vercel --name podcast-aggregator-frontend

# Or add to existing Next.js/React app
cp podcast-aggregator.jsx your-app/src/components/
```

## ⚙️ Environment Variables (Optional)

Add these in Vercel Dashboard → Settings → Environment Variables:

```
# For enhanced features
PODCAST_INDEX_KEY=your_key
PODCAST_INDEX_SECRET=your_secret
ASSEMBLYAI_API_KEY=your_key
REDIS_URL=your_redis_url
```

## 🔍 Troubleshooting

**API not working?**
- Check Vercel deployment logs
- Verify the repository structure matches the guide
- Make sure CORS headers are enabled (they are by default)

**Need help?**
- Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
- Test endpoints individually
- Verify JSON responses in browser DevTools

## 📊 Monitor Usage

- Vercel Dashboard → Analytics
- Free tier: 100GB bandwidth, 100 hours of serverless function execution
- More than enough for most use cases!

## 🎯 What's Next?

1. ✅ Deploy API to Vercel
2. ✅ Test all endpoints
3. 🔄 Add caching (Vercel KV)
4. 🔄 Add more data sources
5. 🔄 Build your custom frontend
6. 🔄 Add authentication if needed

## 💰 Cost Estimate

**Vercel Free Tier:**
- Unlimited API requests (within fair use)
- 100GB bandwidth/month
- 100 hours serverless execution/month
- More than sufficient for getting started!

**Upgrade if needed:**
- Pro: $20/month for higher limits
- Only needed for high-traffic apps

---

**Congratulations! You now have your own podcast data API! 🎉**
