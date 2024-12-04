// app/api/anthropic/route.js
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAnthropicKey } from '@/app/Utils/getApikey';

export async function POST(request) {
  const { temperature, max_tokens, messages, system, model } = await request.json();

  // Get API key from request headers
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    console.error('Anthropic API key not provided');
    return NextResponse.json({ error: 'Anthropic API key not provided' }, { status: 500 });
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  try {
    console.log('Received request:', { temperature, max_tokens, system, messages, model });

    const response = await anthropic.messages.create({
      model: model || 'claude-3-5-sonnet-20240620',
      max_tokens: max_tokens || 8192,
      temperature: temperature || 0.7,
      system: system,
      messages: messages,
    });

    console.log('Anthropic API response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Anthropic API error:', error);
    return NextResponse.json({
      error: 'An error occurred while processing your request',
      details: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}