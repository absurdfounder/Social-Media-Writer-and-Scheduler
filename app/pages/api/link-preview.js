// pages/api/link-preview.js
import fetch from 'node-fetch';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || '';

    res.status(200).json({ title, description, image });
  } catch (error) {
    console.error('Error fetching link preview:', error);
    res.status(500).json({ error: 'Failed to fetch link preview' });
  }
}