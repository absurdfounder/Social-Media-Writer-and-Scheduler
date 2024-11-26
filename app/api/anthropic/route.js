import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {

  const { temperature, max_tokens, messages, system, model ,claudapikey } = await request.json();

  console.log('API route called (App Router)');

  if (!claudapikey) {
    console.error('ANTHROPIC_API_KEY is not set');
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set' }, { status: 500 });
  }

  const anthropic = new Anthropic({
    apiKey: claudapikey,
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