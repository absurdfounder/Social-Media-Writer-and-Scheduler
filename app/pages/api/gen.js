// pages/api/gen.js
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { prompt } = req.body;
    console.log('Received prompt:', prompt);

    // Use a hard-coded API key directly
    const apiKey = "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";

    // Initialize Anthropic with the API key
    const anthropic = new Anthropic({ apiKey });

    // Generate content using Anthropic's API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // default model
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    console.log('Anthropic response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in /api/gen:', error);
    res.status(500).json({ error: error.message });
  }
}
