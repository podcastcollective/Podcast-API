// api/podcasts/[id].js
// Vercel Serverless Function for podcast details

const fetch = require('node-fetch');
const Parser = require('rss-parser');
const parser = new Parser({
  customFields: {
    feed: [
      ['itunes:author', 'author'],
      ['itunes:owner', 'owner'],
      ['itunes:explicit', 'explicit'],
      ['itunes:type', 'type'],
      ['itunes:category', 'categories'],
    ],
    item: [
      ['itunes:duration', 'duration'],
      ['itunes:explicit', 'explicit'],
      ['itunes:episode', 'episodeNumber'],
      ['itunes:season', 'seasonNumber'],
      ['itunes:episodeType', 'episodeType'],
    ]
  }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Podcast ID is required' });
  }

  try {
    // Lookup podcast from iTunes
    const lookupResponse = await fetch(
      `https://itunes.apple.com/lookup?id=${id}&entity=podcastEpisode&limit=200`
    );
    const lookupData = await lookupResponse.json();

    if (!lookupData.results || lookupData.results.length === 0) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    const podcastInfo = lookupData.results[0];
    const episodes = lookupData.results.slice(1);

    // Parse RSS feed if available
    let rssData = null;
    let fullEpisodes = [];
    
    if (podcastInfo.feedUrl) {
      try {
        const feed = await parser.parseURL(podcastInfo.feedUrl);
        rssData = {
          description: feed.description,
          language: feed.language,
          copyright: feed.copyright,
          author: feed.itunes?.author || feed.author,
          owner: feed.itunes?.owner,
          website: feed.link,
          explicit: feed.itunes?.explicit,
          type: feed.itunes?.type,
          categories: Array.isArray(feed.itunes?.categories) 
            ? feed.itunes.categories 
            : [],
          image: feed.itunes?.image || feed.image?.url
        };

        fullEpisodes = feed.items.map(item => ({
          id: item.guid || item.link,
          title: item.title,
          description: item.contentSnippet || item.content,
          pub_date: item.pubDate,
          duration: item.itunes?.duration || item.duration,
          audio_url: item.enclosure?.url,
          episode_url: item.link,
          episode_number: item.itunes?.episode,
          season_number: item.itunes?.season,
          episode_type: item.itunes?.episodeType || 'full',
          explicit: item.itunes?.explicit === 'yes'
        }));
      } catch (rssError) {
        console.error('RSS parsing error:', rssError);
      }
    }

    // Analyze episodes for insights
    const episodeAnalysis = analyzeEpisodes(fullEpisodes.length > 0 ? fullEpisodes : episodes);

    // Compile comprehensive podcast data
    const podcastDetails = {
      id: podcastInfo.collectionId.toString(),
      name: podcastInfo.collectionName,
      publisher: podcastInfo.artistName,
      description: rssData?.description || podcastInfo.collectionCensoredName,
      
      artwork: {
        url_60: podcastInfo.artworkUrl60,
        url_100: podcastInfo.artworkUrl100,
        url_600: podcastInfo.artworkUrl600,
      },

      metadata: {
        feed_url: podcastInfo.feedUrl,
        itunes_url: podcastInfo.collectionViewUrl,
        itunes_id: podcastInfo.collectionId,
        website: rssData?.website || null,
        copyright: rssData?.copyright || null,
        author: rssData?.author || podcastInfo.artistName,
        owner: rssData?.owner || null,
      },

      categories: {
        genres: podcastInfo.genres || [],
        primary_genre: podcastInfo.primaryGenreName,
        itunes_categories: rssData?.categories || []
      },

      stats: {
        episode_count: podcastInfo.trackCount || fullEpisodes.length,
        release_date: podcastInfo.releaseDate,
        latest_episode_date: episodes[0]?.releaseDate || fullEpisodes[0]?.pub_date,
        country: podcastInfo.country,
        language: rssData?.language || podcastInfo.languageCodesISO2A?.[0] || 'en',
        explicit: rssData?.explicit === 'yes' || podcastInfo.contentAdvisoryRating === 'Explicit',
        podcast_type: rssData?.type || 'episodic'
      },

      episode_insights: episodeAnalysis,

      recent_episodes: (fullEpisodes.length > 0 ? fullEpisodes : episodes).slice(0, 10).map(ep => ({
        id: ep.id || ep.trackId?.toString(),
        title: ep.title || ep.trackName,
        description: ep.description?.substring(0, 200) || '',
        release_date: ep.pub_date || ep.releaseDate,
        duration: ep.duration || ep.trackTimeMillis,
        url: ep.episode_url || ep.trackViewUrl,
        audio_url: ep.audio_url || null
      })),

      estimated_metrics: estimateMetrics(podcastInfo, episodes.length || fullEpisodes.length)
    };

    return res.status(200).json(podcastDetails);

  } catch (error) {
    console.error('Podcast details error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch podcast details',
      message: error.message 
    });
  }
}

function analyzeEpisodes(episodes) {
  if (episodes.length === 0) {
    return null;
  }

  const durations = episodes
    .map(ep => {
      if (typeof ep.duration === 'number') return ep.duration / 1000; // Convert ms to seconds
      if (typeof ep.duration === 'string') return parseDuration(ep.duration);
      return 0;
    })
    .filter(d => d > 0);

  const avgDuration = durations.length > 0 
    ? durations.reduce((a, b) => a + b, 0) / durations.length 
    : 0;

  // Calculate publishing frequency
  const dates = episodes
    .map(ep => new Date(ep.pub_date || ep.releaseDate))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => b - a);

  let avgDaysBetween = null;
  if (dates.length > 1) {
    const intervals = [];
    for (let i = 0; i < Math.min(dates.length - 1, 10); i++) {
      const days = (dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24);
      intervals.push(days);
    }
    avgDaysBetween = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  return {
    average_duration_seconds: Math.round(avgDuration),
    average_duration_minutes: Math.round(avgDuration / 60),
    publishing_frequency_days: avgDaysBetween ? Math.round(avgDaysBetween) : null,
    estimated_schedule: estimateSchedule(avgDaysBetween),
    total_analyzed: episodes.length
  };
}

function parseDuration(duration) {
  // Parse duration strings like "1:23:45" or "45:30"
  if (typeof duration !== 'string') return 0;
  
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

function estimateSchedule(avgDays) {
  if (!avgDays) return 'unknown';
  if (avgDays <= 1.5) return 'daily';
  if (avgDays <= 4) return '2-3 times per week';
  if (avgDays <= 9) return 'weekly';
  if (avgDays <= 18) return 'biweekly';
  if (avgDays <= 35) return 'monthly';
  return 'irregular';
}

function estimateMetrics(podcast, episodeCount) {
  // Rough estimation algorithms
  const genreMultipliers = {
    'True Crime': 2.5,
    'News': 2.0,
    'Comedy': 1.8,
    'Business': 1.6,
    'Technology': 1.5,
    'Sports': 1.7,
    'Health & Fitness': 1.4,
    'default': 1.0
  };

  const multiplier = genreMultipliers[podcast.primaryGenreName] || genreMultipliers.default;
  const episodeFactor = Math.log10(episodeCount + 1);
  
  const baseListeners = 5000;
  const estimatedWeeklyListeners = Math.floor(baseListeners * multiplier * episodeFactor);
  const estimatedDownloadsPerEpisode = Math.floor(estimatedWeeklyListeners * 0.7);

  return {
    estimated_weekly_listeners: estimatedWeeklyListeners,
    estimated_downloads_per_episode: estimatedDownloadsPerEpisode,
    confidence: 'low', // Always low since we're estimating
    note: 'Estimates based on genre, episode count, and industry averages'
  };
}
