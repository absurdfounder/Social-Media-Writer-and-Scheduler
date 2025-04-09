// app/api/gen/route.js
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    // Parse JSON from the request body
    const { prompt } = await request.json();
    console.log('📝 Received prompt:', prompt);

    // Initialize variables for the final text prompt and image attachment (if any)
    let finalPrompt = prompt;
    let imageAttachment = null;

    // Look for an "Attachment URL:" line within the prompt.
    const attachmentRegex = /Attachment URL:\s*(\S+)/i;
    const match = prompt.match(attachmentRegex);
    if (match && match[1]) {
      const attachmentUrl = match[1];
      console.log("🔗 Found attachment URL:", attachmentUrl);
      try {
        console.log("📤 Attempting to fetch image from URL...");
        // Attempt to fetch the image from the provided URL
        const attachmentResponse = await fetch(attachmentUrl);
        if (attachmentResponse.ok) {
          const arrayBuffer = await attachmentResponse.arrayBuffer();
          const base64Data = Buffer.from(arrayBuffer).toString('base64');
          // Use the content-type header if available; default to "image/jpeg"
          const mediaType = attachmentResponse.headers.get('content-type') || 'image/jpeg';
  
          // Directly add the attachment as a base64 image
          imageAttachment = {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data,
            },
          };
          console.log("✅ Attachment processed as base64 image.");
        } else {
          console.warn(
            `❌ Failed to fetch image from URL ${attachmentUrl}. Response status: ${attachmentResponse.status}`
          );
        }
      } catch (err) {
        // Log a warning and continue without the attachment if fetch fails.
        console.warn(`⚠️ Error fetching image attachment: ${err}`);
      }
      // Remove the attachment URL line from the prompt text
      finalPrompt = prompt.replace(attachmentRegex, "").trim();
      console.log("📝 Final prompt after removing attachment URL:", finalPrompt);
    } else {
      console.log("ℹ️ No attachment URL found in the prompt.");
    }

    // Determine model and build the user message based on whether an image was processed.
    let model = 'claude-3-5-sonnet-20241022';
    let userMessage;
    if (imageAttachment) {
      model = 'claude-3-7-sonnet-20250219'; // use an image-capable model
      userMessage = {
        role: 'user',
        content: [
          imageAttachment,
          {
            type: 'text',
            text: finalPrompt,
          },
        ],
      };
      console.log("🤖 Using image-capable model:", model);
    } else {
      userMessage = { role: 'user', content: finalPrompt };
      console.log("🤖 Using default text-based model:", model);
    }

    // Use a hard-coded API key (be sure to secure it in production)
    const apiKey =
      "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";
    const anthropic = new Anthropic({ apiKey });

    // Call the Anthropic API to generate content.
    console.log("🚀 Sending request to Anthropic API...");
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      temperature: 0.7,
      messages: [userMessage],
    });

    console.log('🤖 Anthropic response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('🚨 Error in /api/gen:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
