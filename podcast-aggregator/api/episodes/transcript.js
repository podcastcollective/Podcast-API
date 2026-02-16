// api/episodes/[id]/transcript.js
// Vercel Serverless Function for fetching episode transcripts

const fetch = require('node-fetch');
const cheerio = require('cheerio');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id, url, audio_url } = req.query;

  if (!id && !url && !audio_url) {
    return res.status(400).json({ 
      error: 'Episode ID, URL, or audio_url is required' 
    });
  }

  try {
    // Note: This is a basic implementation
    // For production, you'd want to integrate with services like:
    // - AssemblyAI
    // - Deepgram
    // - OpenAI Whisper
    // - Google Speech-to-Text
    
    // For now, we'll try to extract any existing transcripts from the episode page
    let transcript = null;
    let method = 'none';

    if (url) {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Try to find transcript in common locations
        const transcriptSelectors = [
          '.transcript',
          '#transcript',
          '[class*="transcript"]',
          '.episode-transcript',
          '.show-notes'
        ];

        for (const selector of transcriptSelectors) {
          const element = $(selector);
          if (element.length > 0) {
            transcript = element.text().trim();
            method = 'html_extraction';
            break;
          }
        }
      } catch (htmlError) {
        console.error('HTML extraction error:', htmlError);
      }
    }

    if (!transcript) {
      return res.status(200).json({
        episode_id: id,
        transcript: null,
        available: false,
        message: 'Transcript not available. Consider integrating with a transcription service like AssemblyAI or Deepgram.',
        integration_suggestions: {
          assemblyai: 'https://www.assemblyai.com/',
          deepgram: 'https://www.deepgram.com/',
          openai_whisper: 'https://openai.com/research/whisper',
          google_speech: 'https://cloud.google.com/speech-to-text'
        }
      });
    }

    // Basic transcript processing
    const words = transcript.split(/\s+/).length;
    const sentences = transcript.split(/[.!?]+/).length;
    const avgWordsPerSentence = Math.round(words / sentences);

    return res.status(200).json({
      episode_id: id,
      transcript: transcript,
      available: true,
      method: method,
      stats: {
        word_count: words,
        sentence_count: sentences,
        avg_words_per_sentence: avgWordsPerSentence,
        character_count: transcript.length
      }
    });

  } catch (error) {
    console.error('Transcript fetch error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch transcript',
      message: error.message 
    });
  }
}
