import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set' });
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const { temperature, max_tokens, messages, system, model } = req.body;

    console.log('Received request:', { temperature, max_tokens, system, messages, model });

    const response = await anthropic.messages.create({
      model: model || 'claude-3-sonnet-20240229',
      max_tokens: max_tokens || 3000,
      temperature: temperature || 0.7,
      system: system,
      messages: messages,
    });

    console.log('Anthropic API response:', response);

    res.status(200).json(response);
  } catch (error) {
    console.error('Anthropic API error:', error);
    res.status(500).json({
      error: 'An error occurred while processing your request',
      details: error.message,
      stack: error.stack,
    });
  }
}