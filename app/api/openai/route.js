import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    const { temperature, max_tokens, messages, system } = await request.json();

    console.log('API route called (App Router)');

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

    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    console.log('Received request:', { temperature, max_tokens, system, messages });

    // Format messages array with proper roles
    const messageArray = system
      ? [{ role: 'developer', content: system }, ...messages]
      : messages;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messageArray.map(msg => ({
        role: msg.role === 'developer' ? 'developer' : msg.role,
        content: Array.isArray(msg.content) 
          ? msg.content
          : [{ type: 'text', text: msg.content }]
      })),
      max_tokens: max_tokens || 16384,
      temperature: temperature || 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Restructure the response
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