// app/api/gen/route.js
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    // Parse JSON from the request body
    const { prompt } = await request.json();
    console.log('Received prompt:', prompt);

    // Use a hard-coded API key directly
    const apiKey = "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";
    
    // Initialize Anthropic with the API key
    const anthropic = new Anthropic({ apiKey });

    // Call the Anthropic API to generate content
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // default model
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    console.log('Anthropic response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/gen:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
