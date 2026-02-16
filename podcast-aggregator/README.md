# Podcast Aggregator API

An independent podcast data aggregation tool that serves as a free, open-source alternative to Rephonic. This tool aggregates podcast data from multiple public sources including Apple Podcasts/iTunes API, RSS feeds, and more.

## 🎯 Features

- **Podcast Search**: Search across millions of podcasts using iTunes/Apple Podcasts API
- **Detailed Metadata**: Get comprehensive podcast information including:
  - Basic info (title, publisher, description, artwork)
  - Episode counts and publishing frequency
  - Genre and category information
  - RSS feed data
  - Contact information when available
- **Episode Data**: Fetch complete episode lists with:
  - Episode metadata (title, description, duration)
  - Audio file URLs
  - Publishing dates
  - Episode analytics
- **Analytics**: Built-in analytics including:
  - Publishing frequency detection
  - Average episode duration
  - Episode trends over time
  - Estimated listener metrics (rough approximations)

## 🚀 Deployment to Vercel

### Prerequisites
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Git repository (GitHub, GitLab, or Bitbucket)

### Step-by-Step Deployment

1. **Clone or create this repository structure:**
```
podcast-aggregator/
├── api/
│   ├── search/
│   │   └── podcasts.js
│   ├── podcasts/
│   │   └── [id].js
│   ├── episodes/
│   │   └── [id]/
│   │       └── transcript.js
│   └── episodes.js
├── package.json
├── vercel.json
└── README.md
```

2. **Install Vercel CLI (optional but recommended):**
```bash
npm install -g vercel
```

3. **Deploy to Vercel:**

**Option A: Via Vercel CLI**
```bash
cd podcast-aggregator
vercel login
vercel
```

**Option B: Via Vercel Dashboard**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect the configuration
4. Click "Deploy"

4. **Your API will be live at:**
```
https://your-project-name.vercel.app/api/...
```

## 📡 API Endpoints

### 1. Search Podcasts
```
GET /api/search/podcasts?query={search_term}&limit={number}
```

**Parameters:**
- `query` (required): Search term
- `limit` (optional): Number of results (default: 50)
- `country` (optional): Country code (default: 'us')

**Example:**
```bash
curl "https://your-api.vercel.app/api/search/podcasts?query=true%20crime&limit=10"
```

**Response:**
```json
{
  "results": [
    {
      "id": "1234567890",
      "name": "Crime Junkie",
      "publisher": "audiochuck",
      "description": "True crime podcast...",
      "artwork": {
        "small": "https://...",
        "medium": "https://...",
        "large": "https://..."
      },
      "episode_count": 250,
      "estimated_listeners": 50000,
      "recent_episodes": [...]
    }
  ],
  "result_count": 10,
  "query": "true crime"
}
```

### 2. Get Podcast Details
```
GET /api/podcasts/{podcast_id}
```

**Example:**
```bash
curl "https://your-api.vercel.app/api/podcasts/1234567890"
```

**Response:**
```json
{
  "id": "1234567890",
  "name": "Crime Junkie",
  "publisher": "audiochuck",
  "description": "Full description...",
  "metadata": {
    "feed_url": "https://...",
    "itunes_url": "https://...",
    "website": "https://...",
    "author": "Ashley Flowers",
    "owner": {...}
  },
  "categories": {
    "genres": ["True Crime", "Society & Culture"],
    "primary_genre": "True Crime"
  },
  "stats": {
    "episode_count": 250,
    "release_date": "2017-12-01",
    "latest_episode_date": "2024-02-15",
    "language": "en",
    "explicit": false
  },
  "episode_insights": {
    "average_duration_minutes": 45,
    "publishing_frequency_days": 7,
    "estimated_schedule": "weekly"
  },
  "estimated_metrics": {
    "estimated_weekly_listeners": 75000,
    "estimated_downloads_per_episode": 52500
  }
}
```

### 3. Get Episodes
```
GET /api/episodes?podcast_id={id}&limit={number}&offset={number}
```

**Parameters:**
- `podcast_id` (required if no feed_url): iTunes podcast ID
- `feed_url` (optional): Direct RSS feed URL
- `limit` (optional): Number of episodes (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Example:**
```bash
curl "https://your-api.vercel.app/api/episodes?podcast_id=1234567890&limit=20"
```

**Response:**
```json
{
  "podcast_id": "1234567890",
  "total_episodes": 250,
  "offset": 0,
  "limit": 20,
  "episodes": [
    {
      "id": "ep-001",
      "title": "Episode Title",
      "description": "Episode description...",
      "release_date": "2024-02-15T00:00:00Z",
      "duration_seconds": 2700,
      "duration_formatted": "45:00",
      "audio_url": "https://...",
      "url": "https://...",
      "episode_number": 250,
      "season_number": 5
    }
  ],
  "analytics": {
    "average_duration_seconds": 2700,
    "publishing_frequency": "weekly",
    "episodes_by_year": {
      "2024": 8,
      "2023": 52,
      "2022": 50
    }
  }
}
```

### 4. Get Episode Transcript
```
GET /api/episodes/{episode_id}/transcript?url={episode_url}
```

**Note**: Basic implementation. For production use, integrate with:
- [AssemblyAI](https://www.assemblyai.com/)
- [Deepgram](https://www.deepgram.com/)
- [OpenAI Whisper](https://openai.com/research/whisper)

## 🎨 Frontend Integration

The included React component (`podcast-aggregator.jsx`) provides a beautiful UI for interacting with the API.

### Deploy Frontend as Artifact

The React component is designed to work as a standalone artifact that can be:
1. Embedded in any React application
2. Deployed separately on Vercel
3. Used as a template for your own UI

### Using the Frontend

Simply copy the `podcast-aggregator.jsx` file and update the API endpoints to point to your deployed Vercel API:

```javascript
// Update API base URL
const API_BASE = 'https://your-api.vercel.app';

// In your API calls:
const response = await fetch(`${API_BASE}/api/search/podcasts?query=${query}`);
```

## 🔧 Advanced Configuration

### Adding More Data Sources

You can extend the API by adding more data sources:

1. **Podcast Index API**: Add podcast-index.org integration
2. **Listen Notes API**: Integrate ListenNotes for additional data
3. **Spotify**: Add Spotify Web API for more podcasts
4. **YouTube**: Include YouTube podcast data

### Example: Adding Podcast Index

```javascript
// In api/search/podcasts.js
const podcastIndexResponse = await fetch(
  'https://api.podcastindex.org/api/1.0/search/byterm',
  {
    headers: {
      'X-Auth-Key': process.env.PODCAST_INDEX_KEY,
      'X-Auth-Date': Date.now().toString(),
      'User-Agent': 'YourApp/1.0'
    }
  }
);
```

### Environment Variables

Add to your Vercel project settings:

```
PODCAST_INDEX_KEY=your_key_here
PODCAST_INDEX_SECRET=your_secret_here
ASSEMBLYAI_API_KEY=your_key_here
```

## 📊 Rate Limits & Caching

The iTunes API has rate limits. Consider adding:

1. **Redis caching** (Vercel KV):
```javascript
import { kv } from '@vercel/kv';

// Cache for 1 hour
await kv.set(`podcast:${id}`, data, { ex: 3600 });
```

2. **Vercel Edge Config** for frequently accessed data

## 🤝 Contributing

This is an open-source alternative to Rephonic. Contributions welcome!

### Areas for Improvement:
- [ ] Add more data sources
- [ ] Implement caching layer
- [ ] Add authentication/API keys
- [ ] Integrate transcription services
- [ ] Add podcast analytics
- [ ] Social media data aggregation
- [ ] Email contact extraction
- [ ] Listener demographics estimation

## 📄 License

MIT License - feel free to use commercially or modify as needed.

## ⚠️ Disclaimer

This tool aggregates publicly available podcast data. Estimated metrics (listener counts, demographics) are rough approximations based on publicly available information and should not be considered accurate. For precise analytics, use official podcast hosting analytics.

## 🔗 Data Sources

- **iTunes/Apple Podcasts API**: Primary source for podcast search and metadata
- **RSS Feeds**: Direct parsing of podcast RSS feeds for detailed episode data
- **Public Podcast Directories**: Various public sources

## 💡 Tips

1. **Caching**: Implement caching to reduce API calls and improve performance
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Error Handling**: The API includes basic error handling, enhance as needed
4. **Monitoring**: Use Vercel Analytics to monitor API usage
5. **Costs**: Vercel's free tier is generous, but monitor usage for scaling

## 🆘 Support

For issues or questions:
1. Check the API response error messages
2. Review Vercel deployment logs
3. Test endpoints with the provided examples
4. Verify your API structure matches the documentation

## 🚀 Next Steps

1. Deploy to Vercel
2. Test all endpoints
3. Integrate with your frontend
4. Add caching layer
5. Monitor usage and optimize
6. Consider adding premium features

---

**Built with ❤️ as an open-source alternative to Rephonic**
