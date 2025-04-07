// app/api/anthropic/route.js
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    const { temperature, max_tokens, messages, system, model } = await request.json();
    console.log('Anthropic API route called with model:', model);

    // Use hard-coded API key directly
    const apiKey = "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";

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    console.log(
      'Sending request to Anthropic API with model:',
      model || 'claude-3-5-sonnet-20241022'
    );

    const response = await anthropic.messages.create({
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: max_tokens || 8192,
      temperature: temperature || 0.7,
      system: system,
      messages: messages,
    });

    console.log('Received response from Anthropic API:', response);
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
