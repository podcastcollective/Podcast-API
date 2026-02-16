import React, { useState, useEffect } from 'react';
import { Search, Radio, TrendingUp, Users, Mail, Globe, Download, Play, Calendar, Clock, ExternalLink, Database, BarChart2, Zap, Star } from 'lucide-react';

export default function PodcastAggregator() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search podcasts using iTunes API
  const searchPodcasts = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=podcast&entity=podcast&limit=50`
      );
      const data = await response.json();
      
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (err) {
      setError('Failed to search podcasts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch podcast details and RSS feed
  const fetchPodcastDetails = async (podcast) => {
    setLoading(true);
    setError(null);
    setSelectedPodcast(podcast);
    setActiveTab('details');
    
    try {
      // Lookup detailed podcast info
      const lookupResponse = await fetch(
        `https://itunes.apple.com/lookup?id=${podcast.collectionId}&entity=podcastEpisode&limit=200`
      );
      const lookupData = await lookupResponse.json();
      
      if (lookupData.results && lookupData.results.length > 1) {
        const podcastInfo = lookupData.results[0];
        const episodesList = lookupData.results.slice(1);
        
        setSelectedPodcast({
          ...podcast,
          ...podcastInfo,
          genres: podcastInfo.genres || [],
          episodeCount: podcastInfo.trackCount || 0
        });
        
        setEpisodes(episodesList);
      }
      
      // Fetch RSS feed for additional data
      if (podcast.feedUrl) {
        try {
          const rssResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(podcast.feedUrl)}`);
          const rssData = await rssResponse.json();
          
          if (rssData.contents) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(rssData.contents, 'text/xml');
            
            // Extract additional metadata from RSS
            const channel = xmlDoc.querySelector('channel');
            if (channel) {
              const rssInfo = {
                description: channel.querySelector('description')?.textContent || '',
                language: channel.querySelector('language')?.textContent || '',
                copyright: channel.querySelector('copyright')?.textContent || '',
                author: channel.querySelector('itunes\\:author, author')?.textContent || '',
                owner: {
                  name: channel.querySelector('itunes\\:owner itunes\\:name, owner name')?.textContent || '',
                  email: channel.querySelector('itunes\\:owner itunes\\:email, owner email')?.textContent || ''
                },
                categories: Array.from(channel.querySelectorAll('itunes\\:category, category')).map(cat => 
                  cat.getAttribute('text') || cat.textContent
                ).filter(Boolean),
                explicit: channel.querySelector('itunes\\:explicit, explicit')?.textContent || 'no',
                website: channel.querySelector('link')?.textContent || ''
              };
              
              setSelectedPodcast(prev => ({ ...prev, ...rssInfo }));
            }
          }
        } catch (rssErr) {
          console.log('RSS fetch failed:', rssErr);
        }
      }
      
    } catch (err) {
      setError('Failed to fetch podcast details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Parse RSS feed manually
  const parseRSSFeed = async (feedUrl) => {
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`);
      const data = await response.json();
      
      if (data.contents) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
        
        const items = xmlDoc.querySelectorAll('item');
        const episodes = Array.from(items).map((item, index) => ({
          episodeId: `ep-${index}`,
          title: item.querySelector('title')?.textContent || 'Untitled',
          description: item.querySelector('description')?.textContent || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          duration: item.querySelector('itunes\\:duration, duration')?.textContent || '',
          audioUrl: item.querySelector('enclosure')?.getAttribute('url') || '',
          episodeUrl: item.querySelector('link')?.textContent || '',
          episodeType: item.querySelector('itunes\\:episodeType')?.textContent || 'full',
          season: item.querySelector('itunes\\:season')?.textContent || '',
          episode: item.querySelector('itunes\\:episode')?.textContent || ''
        }));
        
        return episodes;
      }
    } catch (err) {
      console.error('RSS parse error:', err);
      return [];
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchPodcasts(searchQuery);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <Radio className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
                    Podcast Aggregator
                  </h1>
                  <p className="text-sm text-purple-300">Independent podcast data aggregation</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('search')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'search'
                      ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'details'
                      ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  disabled={!selectedPodcast}
                >
                  <Database className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8 shadow-2xl">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-purple-300" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for podcasts..."
                      className="w-full pl-14 pr-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Searching...' : 'Search Podcasts'}
                  </button>
                </form>
              </div>

              {/* Error Display */}
              {error && (
                <div className="backdrop-blur-xl bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200">
                  {error}
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-purple-300">Found {searchResults.length} Podcasts</h2>
                  <div className="grid gap-4">
                    {searchResults.map((podcast) => (
                      <div
                        key={podcast.collectionId}
                        onClick={() => fetchPodcastDetails(podcast)}
                        className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all cursor-pointer group"
                      >
                        <div className="flex gap-6">
                          <img
                            src={podcast.artworkUrl600 || podcast.artworkUrl100}
                            alt={podcast.collectionName}
                            className="w-32 h-32 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-shadow"
                          />
                          <div className="flex-1 space-y-2">
                            <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                              {podcast.collectionName}
                            </h3>
                            <p className="text-purple-200">{podcast.artistName}</p>
                            <p className="text-sm text-purple-300 line-clamp-2">{podcast.collectionCensoredName}</p>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {podcast.genres?.slice(0, 3).map((genre, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-purple-500/30 rounded-full text-xs text-purple-200"
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 pt-2 text-sm text-purple-300">
                              <span className="flex items-center gap-1">
                                <Play className="w-4 h-4" />
                                {podcast.trackCount || 0} episodes
                              </span>
                              <span className="flex items-center gap-1">
                                <Globe className="w-4 h-4" />
                                {podcast.country}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <ExternalLink className="w-6 h-6 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && selectedPodcast && (
            <div className="space-y-6">
              {/* Podcast Header */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
                <div className="flex gap-8">
                  <img
                    src={selectedPodcast.artworkUrl600 || selectedPodcast.artworkUrl100}
                    alt={selectedPodcast.collectionName}
                    className="w-48 h-48 rounded-2xl shadow-2xl shadow-purple-500/30"
                  />
                  <div className="flex-1 space-y-4">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                      {selectedPodcast.collectionName}
                    </h1>
                    <p className="text-xl text-purple-200">{selectedPodcast.artistName}</p>
                    <p className="text-purple-300">{selectedPodcast.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-purple-300 mb-1">
                          <Play className="w-4 h-4" />
                          <span className="text-sm">Episodes</span>
                        </div>
                        <div className="text-2xl font-bold">{selectedPodcast.trackCount || episodes.length}</div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-purple-300 mb-1">
                          <Globe className="w-4 h-4" />
                          <span className="text-sm">Country</span>
                        </div>
                        <div className="text-2xl font-bold">{selectedPodcast.country}</div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-purple-300 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">Released</span>
                        </div>
                        <div className="text-lg font-bold">{formatDate(selectedPodcast.releaseDate)}</div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-purple-300 mb-1">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm">Language</span>
                        </div>
                        <div className="text-lg font-bold">{selectedPodcast.language || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-white/10">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Author Information
                    </h3>
                    <p className="text-white">{selectedPodcast.author || selectedPodcast.artistName}</p>
                    {selectedPodcast.owner?.name && (
                      <p className="text-purple-200">Owner: {selectedPodcast.owner.name}</p>
                    )}
                    {selectedPodcast.owner?.email && (
                      <p className="text-purple-200 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedPodcast.owner.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-purple-300">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedPodcast.categories || selectedPodcast.genres || []).map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-500/30 border border-purple-500/50 rounded-full text-sm text-purple-100"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="flex gap-4 mt-6">
                  {selectedPodcast.collectionViewUrl && (
                    <a
                      href={selectedPodcast.collectionViewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Apple Podcasts
                    </a>
                  )}
                  {selectedPodcast.website && (
                    <a
                      href={selectedPodcast.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                </div>
              </div>

              {/* Episodes List */}
              {episodes.length > 0 && (
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
                  <h2 className="text-2xl font-bold text-purple-300 mb-6 flex items-center gap-2">
                    <Play className="w-6 h-6" />
                    Episodes ({episodes.length})
                  </h2>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {episodes.map((episode, idx) => (
                      <div
                        key={episode.trackId || idx}
                        className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex gap-4">
                          {episode.artworkUrl600 && (
                            <img
                              src={episode.artworkUrl600}
                              alt={episode.trackName}
                              className="w-20 h-20 rounded-lg"
                            />
                          )}
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                              {episode.trackName}
                            </h3>
                            <p className="text-sm text-purple-300 line-clamp-2">
                              {episode.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-purple-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(episode.releaseDate)}
                              </span>
                              {episode.trackTimeMillis && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {Math.floor(episode.trackTimeMillis / 60000)} min
                                </span>
                              )}
                            </div>
                          </div>
                          {episode.trackViewUrl && (
                            <a
                              href={episode.trackViewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-lg hover:bg-purple-500/40 transition-all"
                            >
                              <Play className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}