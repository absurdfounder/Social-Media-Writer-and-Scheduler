import OpenAI from 'openai';

export default async function handler(req, res) {
  console.log('API route called (Pages Router)');
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set');
    return res.status(500).json({ error: 'OPENAI_API_KEY is not set' });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const { temperature, max_tokens, messages, system } = req.body;

    console.log('Received request:', { temperature, max_tokens, system, messages });

    // Prepare messages array with system message if provided
    const messageArray = system
      ? [{ role: 'system', content: system }, ...messages]
      : messages;

    const response = await openai.chat.completions.create({
     "model":  "gpt-4o-mini",
      messages: messageArray,
      max_tokens: max_tokens || 3000,
      temperature: temperature || 0.7,
    });

    console.log('OpenAI API response:', response);

    res.status(200).json(response);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({
      error: 'An error occurred while processing your request',
      details: error.message,
      stack: error.stack,
    });
  }
}