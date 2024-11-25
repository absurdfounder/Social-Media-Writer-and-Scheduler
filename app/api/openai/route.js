import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  console.log('API route called (App Router)');

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set');
    return NextResponse.json({ error: 'OPENAI_API_KEY is not set' }, { status: 500 });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const { temperature, max_tokens, messages, system } = await request.json();

    console.log('Received request:', { temperature, max_tokens, system, messages });

    // Prepare messages array with system message if provided
    const messageArray = system
      ? [{ role: 'system', content: system }, ...messages]
      : messages;

    const response = await openai.chat.completions.create({
      model:"gpt-4o-mini", // Latest GPT-4 model, please verify the exact model name in OpenAI docs
      messages: messageArray,
      max_tokens:  16384, // Adjusted max tokens to be more conservative
      temperature: temperature || 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    console.log('OpenAI API response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({
      error: 'An error occurred while processing your request',
      details: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}