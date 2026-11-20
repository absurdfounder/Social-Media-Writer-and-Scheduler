import { NextResponse } from 'next/server';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request) {
  const authorization = request.headers.get('authorization') || '';
  const apiKey = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : request.headers.get('x-api-key');
  const effectiveApiKey = apiKey || process.env.OPENROUTER_API_KEY;

  if (!effectiveApiKey || !effectiveApiKey.startsWith('sk-or-')) {
    return NextResponse.json({ error: 'A valid OpenRouter API key is required.' }, { status: 401 });
  }

  try {
    const { temperature = 0.7, max_tokens = 3000, messages = [], system, model = 'openrouter/auto' } = await request.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'At least one message is required.' }, { status: 400 });
    }

    const requestMessages = system
      ? [{ role: 'system', content: system }, ...messages]
      : messages;
    const upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${effectiveApiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'Big Mouth Social Writer',
      },
      body: JSON.stringify({ model, messages: requestMessages, temperature, max_tokens }),
    });

    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const message = result?.error?.message || `OpenRouter returned HTTP ${upstream.status}.`;
      return NextResponse.json({ error: message, details: result?.error }, { status: upstream.status });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Could not process the OpenRouter request.', details: error.message },
      { status: 500 }
    );
  }
}
