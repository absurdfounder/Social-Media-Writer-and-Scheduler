// app/api/anthropic/route.js
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    const { temperature, max_tokens, messages, system, model } = await request.json();
    const apiKey = request.headers.get('x-api-key') || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Add an Anthropic API key in your settings.' }, { status: 401 });
    }

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: max_tokens || 8192,
      temperature: temperature || 0.7,
      system: system,
      messages: messages,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Anthropic API error:', error);
    const errorResponse = {
      error: 'An error occurred while processing your request',
      details: error.message,
      type: error.constructor.name,
    };

    if (error.response) {
      errorResponse.status = error.response.status;
      errorResponse.data = error.response.data;
    }

    return NextResponse.json(errorResponse, {
      status: error.response?.status || 500,
    });
  }
}
