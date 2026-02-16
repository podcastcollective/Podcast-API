# API Documentation

Complete reference for the Podcast Aggregator API endpoints.

## Base URL

```
https://your-project.vercel.app
```

## Authentication

Currently, no authentication is required. For production use, consider adding API keys.

## Rate Limiting

Default: 1000 requests per hour per IP (configurable)

## Response Format

All responses are in JSON format with the following structure:

**Success Response:**
```json
{
  "results": [...],
  "result_count": 10,
  "query": "search term"
}
```

**Error Response:**
```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

---

## Endpoints

### 1. Search Podcasts

Search for podcasts across the Apple Podcasts directory.

**Endpoint:** `GET /api/search/podcasts`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| query | string | Yes | - | Search term |
| limit | integer | No | 50 | Number of results (max: 200) |
| country | string | No | 'us' | Country code (ISO 3166-1 alpha-2) |
| entity | string | No | 'podcast' | Entity type |

**Example Request:**
```bash
curl "https://your-api.vercel.app/api/search/podcasts?query=true%20crime&limit=10&country=us"
```

**Example Response:**
```json
{
  "results": [
    {
      "id": "1380008439",
      "name": "Crime Junkie",
      "publisher": "audiochuck",
      "description": "If you can never get enough true crime...",
      "artwork": {
        "small": "https://is1-ssl.mzstatic.com/image/60x60.jpg",
        "medium": "https://is1-ssl.mzstatic.com/image/100x100.jpg",
        "large": "https://is1-ssl.mzstatic.com/image/600x600.jpg"
      },
      "feed_url": "https://feeds.simplecast.com/qm_9xx0g",
      "itunes_url": "https://podcasts.apple.com/us/podcast/crime-junkie/id1380008439",
      "genres": ["True Crime", "Society & Culture"],
      "primary_genre": "True Crime",
      "episode_count": 283,
      "country": "USA",
      "language": "en",
      "release_date": "2017-12-17T08:00:00Z",
      "content_rating": "clean",
      "estimated_listeners": 85000,
      "recent_episodes": [
        {
          "id": "1000643876543",
          "title": "MYSTERIOUS DEATH OF: Mitrice Richardson",
          "description": "When 24-year-old Mitrice Richardson...",
          "release_date": "2024-02-12T08:00:00Z",
          "duration": 2850000,
          "url": "https://podcasts.apple.com/us/podcast/..."
        }
      ]
    }
  ],
  "result_count": 1,
  "query": "crime junkie"
}
```

---

### 2. Get Podcast Details

Get comprehensive information about a specific podcast.

**Endpoint:** `GET /api/podcasts/{podcast_id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| podcast_id | string | Yes | iTunes/Apple Podcasts ID |

**Example Request:**
```bash
curl "https://your-api.vercel.app/api/podcasts/1380008439"
```

**Example Response:**
```json
{
  "id": "1380008439",
  "name": "Crime Junkie",
  "publisher": "audiochuck",
  "description": "Detailed description of the podcast...",
  "artwork": {
    "url_60": "https://...60x60.jpg",
    "url_100": "https://...100x100.jpg",
    "url_600": "https://...600x600.jpg"
  },
  "metadata": {
    "feed_url": "https://feeds.simplecast.com/qm_9xx0g",
    "itunes_url": "https://podcasts.apple.com/us/podcast/crime-junkie/id1380008439",
    "itunes_id": 1380008439,
    "website": "https://crimejunkiepodcast.com",
    "copyright": "© 2024 audiochuck",
    "author": "Ashley Flowers",
    "owner": {
      "name": "audiochuck",
      "email": "info@audiochuck.com"
    }
  },
  "categories": {
    "genres": ["True Crime", "Society & Culture"],
    "primary_genre": "True Crime",
    "itunes_categories": ["True Crime", "Documentary"]
  },
  "stats": {
    "episode_count": 283,
    "release_date": "2017-12-17T08:00:00Z",
    "latest_episode_date": "2024-02-12T08:00:00Z",
    "country": "USA",
    "language": "en",
    "explicit": false,
    "podcast_type": "episodic"
  },
  "episode_insights": {
    "average_duration_seconds": 2700,
    "average_duration_minutes": 45,
    "publishing_frequency_days": 7,
    "estimated_schedule": "weekly",
    "total_analyzed": 200
  },
  "recent_episodes": [
    {
      "id": "1000643876543",
      "title": "MYSTERIOUS DEATH OF: Mitrice Richardson",
      "description": "Episode description...",
      "release_date": "2024-02-12T08:00:00Z",
      "duration": 2850000,
      "url": "https://podcasts.apple.com/...",
      "audio_url": "https://audio.simplecast.com/..."
    }
  ],
  "estimated_metrics": {
    "estimated_weekly_listeners": 125000,
    "estimated_downloads_per_episode": 87500,
    "confidence": "low",
    "note": "Estimates based on genre, episode count, and industry averages"
  }
}
```

---

### 3. Get Episodes

Retrieve all episodes for a podcast.

**Endpoint:** `GET /api/episodes`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| podcast_id | string | Yes* | - | iTunes podcast ID |
| feed_url | string | Yes* | - | Direct RSS feed URL |
| limit | integer | No | 100 | Episodes per page |
| offset | integer | No | 0 | Pagination offset |

*Either `podcast_id` or `feed_url` is required

**Example Request:**
```bash
curl "https://your-api.vercel.app/api/episodes?podcast_id=1380008439&limit=20&offset=0"
```

**Example Response:**
```json
{
  "podcast_id": "1380008439",
  "feed_url": "https://feeds.simplecast.com/qm_9xx0g",
  "total_episodes": 283,
  "offset": 0,
  "limit": 20,
  "episodes": [
    {
      "id": "e1a2b3c4-5678-90ab-cdef-1234567890ab",
      "title": "MYSTERIOUS DEATH OF: Mitrice Richardson",
      "description": "Full episode description with HTML formatting...",
      "description_html": "<p>Full HTML description...</p>",
      "release_date": "2024-02-12T08:00:00Z",
      "duration_string": "47:30",
      "duration_seconds": 2850,
      "url": "https://crimejunkiepodcast.com/mysterious-death-mitrice-richardson/",
      "audio_url": "https://audio.simplecast.com/episodes/...",
      "audio_type": "audio/mpeg",
      "audio_length": 45600000,
      "artwork": "https://...artwork.jpg",
      "episode_number": 283,
      "season_number": 5,
      "episode_type": "full",
      "explicit": false
    }
  ],
  "analytics": {
    "total_episodes": 283,
    "average_duration_seconds": 2700,
    "average_duration_formatted": "45:00",
    "min_duration_seconds": 1200,
    "max_duration_seconds": 4200,
    "first_episode_date": "2017-12-17T08:00:00Z",
    "latest_episode_date": "2024-02-12T08:00:00Z",
    "average_days_between_episodes": 7,
    "publishing_frequency": "weekly",
    "episodes_by_year": {
      "2024": 6,
      "2023": 52,
      "2022": 52,
      "2021": 52
    },
    "explicit_episodes": 0,
    "explicit_percentage": "0.0%"
  }
}
```

---

### 4. Search Episodes

Search for episodes across all podcasts or within a specific podcast.

**Endpoint:** `GET /api/search/episodes`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| query | string | Yes | - | Search term |
| limit | integer | No | 50 | Number of results |
| podcast_id | string | No | - | Limit to specific podcast |

**Example Request:**
```bash
curl "https://your-api.vercel.app/api/search/episodes?query=interview&limit=10"
```

**Example Response:**
```json
{
  "results": [
    {
      "episode_id": "1000643876543",
      "podcast_id": "1380008439",
      "podcast_name": "Crime Junkie",
      "podcast_publisher": "audiochuck",
      "title": "Interview with Detective Smith",
      "description": "Episode description...",
      "release_date": "2024-02-12T08:00:00Z",
      "duration_ms": 2850000,
      "duration_formatted": "47:30",
      "url": "https://podcasts.apple.com/...",
      "audio_url": "https://audio.simplecast.com/...",
      "artwork": {
        "small": "https://...60x60.jpg",
        "medium": "https://...160x160.jpg",
        "large": "https://...600x600.jpg"
      },
      "content_rating": "clean",
      "country": "USA",
      "genres": ["True Crime"],
      "primary_genre": "True Crime"
    }
  ],
  "result_count": 1,
  "query": "interview",
  "podcast_id": null
}
```

---

### 5. Get Episode Transcript

Retrieve or generate transcript for an episode.

**Endpoint:** `GET /api/episodes/transcript`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | No | Episode ID |
| url | string | No | Episode page URL |
| audio_url | string | No | Direct audio file URL |

*At least one parameter is required*

**Example Request:**
```bash
curl "https://your-api.vercel.app/api/episodes/transcript?url=https://crimejunkiepodcast.com/episode"
```

**Example Response (when available):**
```json
{
  "episode_id": "ep123",
  "transcript": "Full transcript text here...",
  "available": true,
  "method": "html_extraction",
  "stats": {
    "word_count": 8543,
    "sentence_count": 421,
    "avg_words_per_sentence": 20,
    "character_count": 52341
  }
}
```

**Example Response (when not available):**
```json
{
  "episode_id": "ep123",
  "transcript": null,
  "available": false,
  "message": "Transcript not available. Consider integrating with a transcription service.",
  "integration_suggestions": {
    "assemblyai": "https://www.assemblyai.com/",
    "deepgram": "https://www.deepgram.com/",
    "openai_whisper": "https://openai.com/research/whisper",
    "google_speech": "https://cloud.google.com/speech-to-text"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Missing or invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

## Best Practices

1. **Caching**: Implement client-side caching to reduce API calls
2. **Pagination**: Use offset and limit for large result sets
3. **Error Handling**: Always check for error responses
4. **Rate Limiting**: Respect rate limits to avoid throttling
5. **Bulk Requests**: Batch requests when possible

## Code Examples

### JavaScript/Node.js
```javascript
const API_BASE = 'https://your-api.vercel.app';

async function searchPodcasts(query) {
  const response = await fetch(
    `${API_BASE}/api/search/podcasts?query=${encodeURIComponent(query)}&limit=10`
  );
  const data = await response.json();
  return data.results;
}

async function getPodcastDetails(podcastId) {
  const response = await fetch(`${API_BASE}/api/podcasts/${podcastId}`);
  return await response.json();
}

async function getEpisodes(podcastId, limit = 50, offset = 0) {
  const response = await fetch(
    `${API_BASE}/api/episodes?podcast_id=${podcastId}&limit=${limit}&offset=${offset}`
  );
  return await response.json();
}
```

### Python
```python
import requests

API_BASE = 'https://your-api.vercel.app'

def search_podcasts(query, limit=10):
    response = requests.get(
        f'{API_BASE}/api/search/podcasts',
        params={'query': query, 'limit': limit}
    )
    return response.json()['results']

def get_podcast_details(podcast_id):
    response = requests.get(f'{API_BASE}/api/podcasts/{podcast_id}')
    return response.json()

def get_episodes(podcast_id, limit=50, offset=0):
    response = requests.get(
        f'{API_BASE}/api/episodes',
        params={'podcast_id': podcast_id, 'limit': limit, 'offset': offset}
    )
    return response.json()
```

### cURL
```bash
# Search podcasts
curl "https://your-api.vercel.app/api/search/podcasts?query=tech&limit=5"

# Get podcast details
curl "https://your-api.vercel.app/api/podcasts/1380008439"

# Get episodes with pagination
curl "https://your-api.vercel.app/api/episodes?podcast_id=1380008439&limit=20&offset=40"

# Search episodes
curl "https://your-api.vercel.app/api/search/episodes?query=interview&limit=10"
```

---

## Changelog

### Version 1.0.0 (2024-02-16)
- Initial release
- Podcast search endpoint
- Podcast details endpoint
- Episodes list endpoint
- Episode search endpoint
- Transcript endpoint (basic implementation)
- Full RSS feed parsing
- Episode analytics
- Estimated metrics

---

## Support

For issues, questions, or feature requests:
- Check API error messages
- Review Vercel deployment logs
- Verify request parameters
- Test with cURL examples

## Future Enhancements

- [ ] Podcast Index API integration
- [ ] Spotify podcast data
- [ ] YouTube podcast integration
- [ ] Advanced transcript generation
- [ ] Listener demographics estimation
- [ ] Social media data aggregation
- [ ] Email contact extraction
- [ ] Review and rating aggregation
- [ ] Chart rankings
- [ ] Cross-promotion detection
