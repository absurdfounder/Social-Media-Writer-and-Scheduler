import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  console.log('API route called (App Router)');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set');
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set' }, { status: 500 });
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const { temperature, max_tokens, messages, system, model } = await request.json();

    console.log('Received request:', { temperature, max_tokens, system, messages, model });

    const response = await anthropic.messages.create({
      model: model || 'claude-3-sonnet-20240229',
      max_tokens: max_tokens || 3000,
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