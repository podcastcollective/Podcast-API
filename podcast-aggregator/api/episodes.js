// api/episodes.js
// Vercel Serverless Function for fetching all episodes of a podcast

const fetch = require('node-fetch');
const Parser = require('rss-parser');
const parser = new Parser({
  customFields: {
    item: [
      ['itunes:duration', 'duration'],
      ['itunes:explicit', 'explicit'],
      ['itunes:episode', 'episodeNumber'],
      ['itunes:season', 'seasonNumber'],
      ['itunes:episodeType', 'episodeType'],
      ['itunes:image', 'image'],
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

  const { podcast_id, feed_url, limit = 100, offset = 0 } = req.query;

  if (!podcast_id && !feed_url) {
    return res.status(400).json({ 
      error: 'Either podcast_id or feed_url is required' 
    });
  }

  try {
    let episodes = [];
    let podcastInfo = null;

    // Method 1: Use iTunes API if podcast_id provided
    if (podcast_id) {
      const lookupResponse = await fetch(
        `https://itunes.apple.com/lookup?id=${podcast_id}&entity=podcastEpisode&limit=200`
      );
      const lookupData = await lookupResponse.json();

      if (lookupData.results && lookupData.results.length > 0) {
        podcastInfo = lookupData.results[0];
        episodes = lookupData.results.slice(1).map(ep => ({
          id: ep.trackId?.toString(),
          title: ep.trackName,
          description: ep.description,
          release_date: ep.releaseDate,
          duration_ms: ep.trackTimeMillis,
          duration_formatted: formatDuration(ep.trackTimeMillis),
          url: ep.trackViewUrl,
          audio_url: ep.previewUrl,
          artwork: ep.artworkUrl600 || ep.artworkUrl160,
          episode_number: null,
          season_number: null,
          episode_type: 'full',
          explicit: false
        }));
      }
    }

    // Method 2: Parse RSS feed for more complete data
    let feedUrl = feed_url;
    if (!feedUrl && podcastInfo?.feedUrl) {
      feedUrl = podcastInfo.feedUrl;
    }

    if (feedUrl) {
      try {
        const feed = await parser.parseURL(feedUrl);
        
        const rssEpisodes = feed.items.map(item => ({
          id: item.guid || item.link || item.title,
          title: item.title,
          description: item.contentSnippet || item.content,
          description_html: item.content,
          release_date: item.pubDate,
          duration_string: item.itunes?.duration || item.duration,
          duration_seconds: parseDuration(item.itunes?.duration || item.duration),
          url: item.link,
          audio_url: item.enclosure?.url,
          audio_type: item.enclosure?.type,
          audio_length: item.enclosure?.length,
          artwork: item.itunes?.image || feed.itunes?.image,
          episode_number: item.itunes?.episode,
          season_number: item.itunes?.season,
          episode_type: item.itunes?.episodeType || 'full',
          explicit: item.itunes?.explicit === 'yes'
        }));

        // Merge with iTunes data if available
        if (episodes.length > 0) {
          // Use RSS as primary source, supplement with iTunes data
          episodes = rssEpisodes;
        } else {
          episodes = rssEpisodes;
        }
      } catch (rssError) {
        console.error('RSS parsing error:', rssError);
        // Continue with iTunes data if RSS fails
      }
    }

    // Apply pagination
    const total = episodes.length;
    const paginatedEpisodes = episodes.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );

    // Add episode analytics
    const analytics = generateEpisodeAnalytics(episodes);

    return res.status(200).json({
      podcast_id: podcast_id || null,
      feed_url: feedUrl || null,
      total_episodes: total,
      offset: parseInt(offset),
      limit: parseInt(limit),
      episodes: paginatedEpisodes,
      analytics: analytics
    });

  } catch (error) {
    console.error('Episodes fetch error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch episodes',
      message: error.message 
    });
  }
}

function parseDuration(duration) {
  if (!duration) return 0;
  if (typeof duration === 'number') return duration;
  
  const parts = duration.toString().split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

function formatDuration(ms) {
  if (!ms) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function generateEpisodeAnalytics(episodes) {
  if (episodes.length === 0) {
    return null;
  }

  const durations = episodes
    .map(ep => ep.duration_seconds || parseDuration(ep.duration_string))
    .filter(d => d > 0);

  const avgDuration = durations.length > 0 
    ? durations.reduce((a, b) => a + b, 0) / durations.length 
    : 0;

  const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

  // Analyze release dates
  const dates = episodes
    .map(ep => new Date(ep.release_date))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => b - a);

  const firstEpisode = dates.length > 0 ? dates[dates.length - 1] : null;
  const latestEpisode = dates.length > 0 ? dates[0] : null;

  // Calculate average days between episodes
  let avgDaysBetween = null;
  if (dates.length > 1) {
    const intervals = [];
    for (let i = 0; i < Math.min(dates.length - 1, 20); i++) {
      const days = (dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24);
      intervals.push(days);
    }
    avgDaysBetween = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  // Count episodes by year
  const episodesByYear = {};
  dates.forEach(date => {
    const year = date.getFullYear();
    episodesByYear[year] = (episodesByYear[year] || 0) + 1;
  });

  // Count explicit episodes
  const explicitCount = episodes.filter(ep => ep.explicit).length;

  return {
    total_episodes: episodes.length,
    average_duration_seconds: Math.round(avgDuration),
    average_duration_formatted: formatDuration(avgDuration * 1000),
    min_duration_seconds: minDuration,
    max_duration_seconds: maxDuration,
    first_episode_date: firstEpisode?.toISOString(),
    latest_episode_date: latestEpisode?.toISOString(),
    average_days_between_episodes: avgDaysBetween ? Math.round(avgDaysBetween) : null,
    publishing_frequency: estimateFrequency(avgDaysBetween),
    episodes_by_year: episodesByYear,
    explicit_episodes: explicitCount,
    explicit_percentage: ((explicitCount / episodes.length) * 100).toFixed(1) + '%'
  };
}

function estimateFrequency(avgDays) {
  if (!avgDays) return 'unknown';
  if (avgDays <= 1.5) return 'daily';
  if (avgDays <= 4) return 'multiple times per week';
  if (avgDays <= 9) return 'weekly';
  if (avgDays <= 18) return 'biweekly';
  if (avgDays <= 35) return 'monthly';
  return 'irregular';
}
