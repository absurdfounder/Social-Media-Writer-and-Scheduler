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
        // Prepare headers to mimic the browser request
        const headers = {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en',
          'cache-control': 'no-cache',
          'pragma': 'no-cache',
          'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Linux"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none',
          'sec-fetch-user': '?1',
          'upgrade-insecure-requests': '1',
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
        };

        // Include the headers in your fetch call
        const attachmentResponse = await fetch(attachmentUrl, { headers });
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

    const apiKey = request.headers.get('x-api-key') || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Add an Anthropic API key in your settings.' }, { status: 401 });
    }
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
