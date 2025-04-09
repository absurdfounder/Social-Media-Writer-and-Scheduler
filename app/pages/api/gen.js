// pages/api/gen.js
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    
    const { prompt } = req.body;
    console.log('Received prompt:', prompt);

    let imageAttachment = null;
    let finalPrompt = prompt;

    // Look for an "Attachment URL:" line in the prompt.
    const attachmentRegex = /Attachment URL:\s*(\S+)/i;
    const match = prompt.match(attachmentRegex);
    console.log('Mathc ',match);
    if (match && match[1]) {
      const attachmentUrl = match[1];
      console.log("Found attachment URL:", attachmentUrl);
      try {
        // Fetch the attachment content.
        const attachmentResponse = await fetch(attachmentUrl);
        if (attachmentResponse.ok) {
          const arrayBuffer = await attachmentResponse.arrayBuffer();
          const base64Data = Buffer.from(arrayBuffer).toString('base64');
          // Use the response content-type header if available, otherwise default to image/jpeg.
          const mediaType = attachmentResponse.headers.get('content-type') || 'image/jpeg';

          imageAttachment = {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data,
            },
          };
          console.log("Attachment processed as base64 image.");
        } else {
          console.warn("Failed to fetch attachment from URL:", attachmentUrl);
        }
      } catch (err) {
        console.error("Error fetching image attachment:", err);
      }
      // Remove the attachment URL line from the prompt text.
      finalPrompt = prompt.replace(attachmentRegex, "").trim();
    }

    // Set up the message payload.
    // Use an image-capable model when an image attachment is included.
    let userMessage = {};
    let model = 'claude-3-5-sonnet-20241022';
    if (imageAttachment) {
      model = 'claude-3-7-sonnet-20250219';
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
    } else {
      userMessage = { role: 'user', content: finalPrompt };
    }

    // Initialize Anthropic with the API key.
    // Note: In production, secure your API key appropriately.
    const apiKey =
      "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";
    const anthropic = new Anthropic({ apiKey });

    // Make the API call to Anthropic.
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      temperature: 0.7,
      messages: [userMessage],
    });

    console.log('Anthropic response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in /api/gen:', error);
    res.status(500).json({ error: error.message });
  }
}
