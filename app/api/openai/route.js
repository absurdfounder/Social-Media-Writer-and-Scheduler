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
    const { temperature, max_tokens, messages, system, model } = await request.json();

    console.log('Received request:', { temperature, max_tokens, system, messages, model });

    // Prepare messages array with system message if provided
    const messageArray = system
      ? [{ role: 'system', content: system }, ...messages]
      : messages;

    const completion = await openai.chat.completions.create({
      model:"gpt-4o-mini",
      messages: messageArray,
      max_tokens: 16384,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Restructure the OpenAI response to match Anthropic's format
    const response = {
      id: completion.id,
      type: 'message',
      role: 'assistant',
      model: completion.model,
      content: [
        {
          type: 'text',
          text: completion.choices[0].message.content
        }
      ],
      stop_reason: completion.choices[0].finish_reason,
      stop_sequence: null,
      usage: {
        input_tokens: completion.usage.prompt_tokens,
        output_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens
      }
    };

    console.log('Formatted OpenAI API response:', response);

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