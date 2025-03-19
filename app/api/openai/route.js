// pages/api/openai.js (API Routes) or app/api/openai/route.js (App Router)
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    const { temperature, max_tokens, messages, model } = await request.json();

    console.log('API route called with model:', model);

    // Get API key from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No Authorization header or invalid format');
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const openaiKey = authHeader.split(' ')[1];
    if (!openaiKey) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json({ error: 'OPENAI_API_KEY is not set' }, { status: 500 });
    }

    // Create OpenAI client with organization and project ID
// Create OpenAI client without hardcoded values
const openai = new OpenAI({
  apiKey: openaiKey
});

    console.log('Sending request to OpenAI API with model:', model || 'gpt-4o-mini');

    const completion = await openai.chat.completions.create({
      model: model || "gpt-4o-mini",
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: max_tokens || 4000,
      temperature: temperature || 0.7,
    });

    console.log('Received response from OpenAI API');

    const response = {
      id: completion.id,
      object: completion.object,
      created: completion.created,
      model: completion.model,
      choices: completion.choices,
      usage: completion.usage
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    const errorResponse = {
      error: 'An error occurred while processing your request',
      details: error.message,
      type: error.constructor.name
    };

    if (error.response) {
      errorResponse.status = error.response.status;
      errorResponse.data = error.response.data;
    }

    return NextResponse.json(errorResponse, { 
      status: error.response?.status || 500 
    });
  }
}