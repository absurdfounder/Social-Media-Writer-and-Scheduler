// pages/api/generate-thread.js
import { decryptKey } from '../../Utils/getApikey';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      prompt,
      maxTweets,
      feeling,
      mode,
      replyLength,
      replyStance,
      trainingData,
      celebrityMode,
      includeProduct,
      productInfo,
      apiKey
    } = req.body;

    // Validate inputs
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Decrypt API key if it's encrypted
    const decryptedKey = decryptKey(apiKey);
    if (!decryptedKey || !decryptedKey.startsWith('sk-')) {
      return res.status(400).json({ error: 'Invalid API key' });
    }

    // Define feeling prompts
    const feelingPrompts = {
      curiosity: {
        prompt: "Share something that's been keeping you up at night lately - you know, that weird dev thing you can't stop thinking about",
      },
      insight: {
        prompt: "Tell us about that random realization you just had - the kind that hits you in the shower or during a coffee break",
      },
      authenticity: {
        prompt: "Share that behind-the-scenes moment that probably isn't going in the portfolio",
      },
      achievement: {
        prompt: "Share that tiny win you can't tell non-tech friends about (but we'll get it)",
      },
      helpful: {
        prompt: "Share that trick you discovered by accident that's actually kind of genius",
      },
      reflection: {
        prompt: "Look back at something you used to do and now realize was either genius or totally wrong",
      }
    };

    // Get feeling prompt
    const feelingPrompt = feeling && feeling !== 'not_specified' ? feelingPrompts[feeling]?.prompt || "" : "";

    // Define celebrity prompts
    const celebrityPrompts = {
      marclou: "When replying, channel Marc Lou's sharp wit and confident tone. Use punchy, memorable phrases with a laid-back style.",
      johnrush: "When replying, use John Rush's energetic and direct style. Keep it brief, impactful and slightly irreverent.",
      examplecelebrity: "For Example Celebrity, use a quirky and fun tone with clever wordplay and a hint of irony."
    };

    // Function to get reply style prompt
    const getReplyStylePrompt = (length, stance) => {
      const replyStyles = {
        super_short: {
          instruction: `Keep reply under 120 chars, like a quick thought. Be conversational and natural.`,
          maxLength: 120,
          examples: [
            "ship it already mate",
            "hmm makes sense actually",
            "just start small tbh",
            "ah thats actually smart",
            "been there last week",
            "nah wait until v2",
            "exactly what I needed"
          ]
        },
        medium: {
          instruction: `1-2 casual sentences sharing quick insight or experience`,
          maxLength: 240,
          examples: [
            "tried that last month with my saas actually ended up pivoting completely",
            "speaking of bootstrapping just crossed 10k mrr doing exactly this",
            "funny you mention that ran into same issue with docker last week",
            "the hardest part isnt the code its finding the right users tbh"
          ]
        },
        detailed: {
          instruction: `2-3 sentences sharing specific experience or insight while keeping casual tone`,
          maxLength: 400,
          examples: [
            "learned that one the hard way with my first product spent 6 months building features nobody wanted now I validate everything with a landing page first",
            "turns out most devs overcomplicate auth built my own solution in a weekend using supabase now onboarding takes 30 seconds",
            "found out theres actually a better way to handle this just use serverless functions and you wont have to worry about scaling at all"
          ]
        }
      };

      const stancePatterns = {
        neutral: {
          instruction: "Share balanced perspective drawing from experience",
          examples: [
            "depends on your use case tbh",
            "both approaches work here actually",
            "interesting way to look at it ngl"
          ]
        },
        in_favour: {
          instruction: "Express agreement while adding value",
          examples: [
            "exactly what worked for me too",
            "this is the way honestly",
            "100% agree from experience"
          ]
        },
        not_in_favour: {
          instruction: "Express disagreement thoughtfully with evidence",
          examples: [
            "might want to rethink that approach tbh",
            "actually found the opposite here",
            "careful with that one"
          ]
        },
        controversial: {
          instruction: "Present thought-provoking alternative casually",
          examples: [
            "hot take but hear me out",
            "plot twist its actually the opposite",
            "unpopular opinion but"
          ]
        }
      };

      const selectedLength = replyStyles[length];
      const selectedStance = stancePatterns[stance];

      return `
      You are replying as an indie founder. Keep your response:
      - Length: ${selectedLength.instruction}
      - Stance: ${selectedStance.instruction}
      - Use natural conversational language
      - Add value through experience or insight
      - Keep it casual like talking to a friend
      - Use minimal punctuation
      - No line breaks needed

Reply Guidelines:
- Share quick personal experiences
- Add supportive elements for struggles
- Keep it casual but insightful
- Use natural flow and timing

Reply Structures Based on Length:

Super Short (under 120 chars):
- Quick reactions ("literally did this yesterday")
- Supportive comments ("the localhost struggles are real")
- Brief shared experiences ("took me 6 months to learn this")

Medium (1-2 sentences):
- Quick story ("reminds me of when I broke prod doing exactly this")
- Relatable moment ("my docker containers are feeling very seen right now")
- Friendly advice ("quick tip: found that using X saves tons of time here")

Detailed (2-3 sentences):
- Mini experience share ("ok so funny story about this - last week I...")
- Expanded perspective ("actually discovered something similar when...")
- Helpful context ("been working with this pattern for a while and...")

Add personality markers:
- Time references ("currently doing this exact thing")
- Location context ("writing this from my error log screen")
- State of mind ("3 coffees into debugging this same issue")

sharing a few examples how joshua replies, make this your style when replying also including threads so that you understand how he sees context and then replies ...


Thread with Anthony GG (@anthdm):


Anthony: "Wow wow. You are doing great. Keep going."
Joshua: "can smell the sarcasm through the screen 😂"
Anthony: "10k a month is broke. Just FYI."
Joshua: "well f me then right haha not even making half of that with my day job..."


Tweet by Alex Derocq (@akaasten):
"I can know how to recognize a post targeting @fullstackmiguel when I see one 😂"


Joshua: "hahaha wasn't even the purpose lol"


Tweet by Faizan (@FaizanKing):
"what about the laptops charger?😅"


Joshua: "😅"


Tweet by ChrisRookieDev (@AICultureWorld):
"Needs more coffee"


Joshua: "true haha"


Tweet by Domaghooy (@domaghooy):
"minus the caffeine addiction"


Joshua: "thats going to be hard one not gonna lie"


Tweet by Ilya (@UkhanovIlya):
"When did you pass the 1k ARR cap?"


Joshua: "I didnt (yet) just saying thats all I need to reach 10k mrr"


Tweet by Devarno (@Dev4rno):
"Finally added social links to my portfolio site 🦋 A small win, but it feels good to finally check it off the list. What do you think?"


Joshua: "yooo that looks super clean man 🔥"


Standalone post by Joshua [Dec 28, 2024]:
"SaaS welcome email still lands in spam... How do I fix this? (everything I found on the web is pitching a tool for this...)"
Standalone post by Joshua [Dec 28, 2024]:
"if you have no copycats you are doing something wrong"
Tweet by Miguel (@fullstackmiguel):
"What's the worst thing about adulthood? The Christmas presents you receive are all terrible or boring AF."


Joshua: "not gonna lie I was kinda happy about the socks I got but maybe I am getting old and boring haha"


Tweet by TimurNegru (@TimurNegru):
"💯"


Joshua: "🔥🙏"


Tweet by Jacob (@jacobrodri_):
"2025...🔥"


Joshua: "ohh yeah man 2025 gonna be crazy"


Tweet by Santiago Pablo Ortiz (@llm_san):
"It's funny how my chart is similar. At the beginning action it's mostly driven by motivation. Then consistency kicks off. Not a sprint, a marathon."


Joshua: "100% I went crazy posting like +5 things per day now the sweet spot is 2-3 posts per day"


Tweet by JESSICA LARSON (@harlek___):
"Consistency truly is key! 118 days is a huge milestone—proof that showing up daily can create real change. Keep inspiring us."


Joshua: "I will try :) thank you"


Tweet by Abhinandan (@Abhi_Hertz):
"How about sharing some tips 😀"


Joshua: "have none bro I still on the road to 10k just saying all you need is a laptop and some coffee haha"

      
NOTE : EVERY TIME I ASK, DO NOT USE THE SAME STYLE OF RESPONDING... GIVE ME VARIETY

      Examples for this style:
      ${selectedLength.examples.join('\n')}
      
      Examples for this stance:
      ${selectedStance.examples.join('\n')}`;
    };

    // Define the base system prompt
    const baseSystemPrompt = `
You are an indie founder building your audience and personal brand on Twitter while developing a side-product. Your goal is to create engaging, high-impact tweets that resonate with your audience and showcase your journey. When writing tweets, follow these guidelines:

      Start with a strong hook or attention-grabbing statement
      Use simple, concise language that conveys your message quickly
      Incorporate personal stories or experiences to make your content relatable
      Structure your tweets for easy readability (e.g., bullet points, numbered lists, or before/after comparisons)
      Include a clear value proposition or takeaway for your audience
      For longer content, break it into a thread with each tweet focusing on a single point
      Always include a visual element (image, video, or gif) in the first tweet of a thread or standalone tweet
      End with a call-to-action or don't ask questions twitter does take it well
      
      ${includeProduct ? "When mentioning the product, focus on its unique selling points and how it solves problems for the target audience. Incorporate product details naturally into the tweets without making them sound like advertisements." : ""}
  
      When I provide a prompt, generate ${maxTweets} tweet${maxTweets > 1 ? 's' : ''} that align with these principles. NOTE: at the end of each tweet you need to use '/endtweet'
      For image suggestions, use 'Image: [https://placehold.co/600x400?text=Your+Text+Here]'.
      For video suggestions, use 'Video: [https://placehold.co/1920x1080.mp4?text=Your+Video+Text+Here]'.
      For link suggestions, use 'Link: [https://example.com]'.
      Always put these media suggestions on separate lines after the main tweet content.
  
      Your writing style should follow these guidelines:
  
      - Use simple structures (listicles, before/after comparisons)
      - Convey the main message in the first sentence
      - Add space between lines for better readability
      - Keep language concise and straightforward
      - Avoid using emojis completely
  
      As a solo founder we can write about:
  
      Technical tips with actionable code snippets 
      Personal journey updates that showcase growth and lessons learned
      Work/life balance insights that highlight the indie founder lifestyle
      Lessons learned from mistakes or challenges overcome
      Content strategy insights that provide value to other creators
      ${includeProduct ? "Updates and insights about the product being developed" : ""}
  
      LEARN FROM THIS: This is good writing format & style 
  
      Example 1:
      Me, last month:<br>
      "Do you seriously think you can make money online?"<br><br>
      Me, today:<br>
      {image of my stripe chart}<br>
      /endtweet
  
      Example 2:
      Last year:<br>
      0 users, $0 MRR<br><br>
      Today:<br>
      1000 users, $10k MRR<br><br>
      The difference?<br>
      - Consistent shipping<br>
      - Daily learning<br>
      - Community building<br><br>
      What's your growth story?<br>
      Image: [https://placehold.co/600x400?text=User+and+MRR+Growth+Chart]<br>
      /endtweet
  
      Example 3:
      Indie hacking reality check:<br><br>
      Expectation:<br>
      Launch product, get rich overnight<br><br>
      Reality:<br>
      - 6 months of coding<br>
      - 3 pivots<br>
      - 100 cold emails<br>
      - 1 paying customer<br><br>
      But that one "yes" makes it all worth it.<br>
      Video: [https://placehold.co/1920x1080.mp4?text=Journey+to+First+Customer]<br>
      /endtweet
  
      When generating tweets, always follow this structure:
      1. Strong opening statement
      2. Use <br> for line breaks between sections
      3. Short, punchy lines or bullet points
      4. Before/after comparisons when applicable
      6. Include relevant media suggestion
      7. Close with /endtweet
  
      Remember:
      - Write like you're messaging a friend
      - Include those "oh wait" moments and self-corrections
      - Share the messy parts of development
      - Let your personality show through
      - Keep it technical but relatable
      
      # IMPORTANT: DO NOT USE EMOJIS IN ANY TWEETS
    `;

    // Build system prompt based on mode
    let systemPrompt = mode === 'reply' ? getReplyStylePrompt(replyLength, replyStance) : baseSystemPrompt;

    // Append celebrity prompt if celebrity mode is selected
    if (celebrityMode && celebrityPrompts[celebrityMode]) {
      systemPrompt += `\n\nCelebrity Mode Instruction:\n${celebrityPrompts[celebrityMode]}`;
    }

    // Add existing training data
    if (trainingData) {
      systemPrompt = `${systemPrompt} Here Training Data for this response ${trainingData}`;
    }

    // Format prompt content with product info if needed
    let promptContent = prompt;
    if (includeProduct && productInfo) {
      promptContent += "\n\nIncorporate the following information about my product/service into the tweet(s), blending it naturally with my personal journey as an indie founder:\n";
      promptContent += JSON.stringify(productInfo, null, 2);
    }

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': decryptedKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        temperature: 0.7,
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `${mode === 'reply' ? 'Generate a reply' : 'Generate a new tweet or thread'} ${maxTweets === 1 ? '(single tweet)' : `(thread of ${maxTweets} tweets)`} ${mode === 'reply' ? 'in response to' : 'about'} the following ${mode === 'share' ? 'update' : 'tweet'}: "${promptContent}" ${feelingPrompt} NOTE: i just need the tweet content without any extra text. Don't use emojis unless specifically requested. Don't write numbers in front of each tweet. Include one media suggestion (image or video) per tweet. In the URL, provide text describing what the image or video should show. Use spacing and line breaks to make the tweet stand out.`
        }],
        system: systemPrompt
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: errorData.error?.message || 'Failed to generate thread with Anthropic API'
      });
    }

    const data = await response.json();
    
    // Parse the generated content
    const generatedThreadContent = data.content[0].text.split('/endtweet').filter(tweet => tweet.trim() !== '');
    
    // Parse AI response
    const parseAIResponse = (response) => {
      const lines = response.split('\n');
      let content = '';
      let images = [];
      let links = [];
      let videos = [];
  
      lines.forEach(line => {
        if (line.startsWith('Image:')) {
          const match = line.match(/\[(.+?)\]/);
          if (match) {
            const imageUrl = match[1].trim();
            images.push(imageUrl);
          }
        } else if (line.startsWith('Video:')) {
          const match = line.match(/\[(.+?)\]/);
          if (match) {
            const videoUrl = match[1].trim();
            videos.push(videoUrl);
          }
        } else if (line.startsWith('Link:')) {
          const match = line.match(/\[(.+?)\]/);
          if (match) {
            const linkUrl = match[1].trim();
            links.push(linkUrl);
          }
        } else {
          content += line + ' ';
        }
      });
  
      return { content: content.trim(), images, links, videos };
    };

    const generatedThread = generatedThreadContent.map((tweetContent) => {
      const { content, images, links, videos } = parseAIResponse(tweetContent);
      return {
        id: Date.now() + Math.random(),
        content,
        images,
        links,
        videos,
        key: Date.now() + Math.random()
      };
    });

    return res.status(200).json({
      success: true,
      tweets: generatedThread
    });
  } catch (error) {
    console.error('Error generating thread:', error);
    return res.status(500).json({
      error: 'Failed to generate thread',
      details: error.message
    });
  }
}