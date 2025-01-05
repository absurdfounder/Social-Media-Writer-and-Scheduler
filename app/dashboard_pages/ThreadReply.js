"use client"

import React, { useState, useCallback, useEffect, use } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { PlusCircle, X, Smile, Image as ImageIcon, Link as LinkIcon, Wand2, FileText, Video, Loader, ToggleLeft, ToggleRight, Circle, CircleCheck, Blocks, BicepsFlexed, CircleCheckBig, InfoIcon } from 'lucide-react';
import { getAnthropicKey } from '../Utils/getApikey';

const TipTapEditor = ({ content, onUpdate, onImageUpload, onVideoUpload, onLinkAdd }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: {
          keepMarks: true,
          HTMLAttributes: {
            class: 'my-custom-class',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:underline',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose w-full min-h-[100px] focus:outline-none whitespace-pre-wrap',
      },
    },
    immediatelyRender: false,
  }, []);

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!isClient) {
    return <div>Loading editor...</div>;
  }

  return (
    <div>
      <EditorContent editor={editor} />
      <div className="flex space-x-2 mt-2">
        <button
          onClick={onImageUpload}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ImageIcon size={20} />
        </button>
        <button
          onClick={onVideoUpload}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <Video size={20} />
        </button>
        <button
          onClick={onLinkAdd}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <LinkIcon size={20} />
        </button>
      </div>
    </div>
  );
};

const LinkPreview = ({ url }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        setPreview(data);
      } catch (error) {
        console.error('Error fetching link preview:', error);
      }
    };

    fetchPreview();
  }, [url]);

  if (!preview) return null;

  return (
    <div className="border rounded-md overflow-hidden mt-2">
      {preview.image && <img src={preview.image} alt={preview.title} className="w-full h-32 object-cover" />}
      <div className="p-2">
        <h3 className="font-bold">{preview.title}</h3>
        <p className="text-sm text-gray-500">{preview.description}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
          {url}
        </a>
      </div>
    </div>
  );
};


const TweetContent = ({ images, links, videos }) => {
  return (
    <div className="mb-4">
      {images.map((img, i) => (
        <img key={i} src={img} alt={`Tweet image ${i + 1}`} className="mb-2 mt-2 rounded-md max-w-full h-auto" />
      ))}
      {videos.map((video, i) => (
        <div key={i} className="mb-2 mt-2 rounded-md overflow-hidden">
          <iframe
            src={video}
            title={`Tweet video ${i + 1}`}
            className="w-full aspect-video"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      ))}
      {links.map((link, i) => (
        <LinkPreview key={i} url={link} />
      ))}
    </div>
  );
};

const ThreadWriter = ({ onConfigureTrainingData }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [tweets, setTweets] = useState([{ id: Date.now(), content: '', images: [], links: [], videos: [], key: Date.now() }]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [overallPrompt, setOverallPrompt] = useState('');
  const [rewritingTweetId, setRewritingTweetId] = useState(null);
  const [threadType, setThreadType] = useState('single');
  const [includeProduct, setIncludeProduct] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [mode, setMode] = useState('share');
  const [feeling, setFeeling] = useState('not_specified');
  const [replyLength, setReplyLength] = useState('super_short');
  const [replyStance, setReplyStance] = useState('controversial');

  const [apikeyAdded, setApikeyAdded] = useState(false);
  const [TrainingData, setTraningData] = useState({});
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState('unchecked'); // 'unchecked', 'validating', 'valid', 'invalid'

  // Update the apiKey effect
  useEffect(() => {
    const validateApiKey = async () => {
      const key = localStorage.getItem('anthropicKey');
      if (!key) {
        setApiKeyStatus('invalid');
        setApikeyAdded(false);
        return;
      }

      if (!key.startsWith('sk-')) {
        setApiKeyStatus('invalid');
        setApikeyAdded(false);
        return;
      }

      setApiKeyStatus('validating');
      setIsValidatingKey(true);

      // Simulate API validation delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setApiKeyStatus('valid');
      setApikeyAdded(true);
      setIsValidatingKey(false);
    };

    validateApiKey();
  }, []);

  // Update the status message JSX
  const getStatusMessage = () => {
    switch (apiKeyStatus) {
      case 'validating':
        return (
          <div className="flex items-center gap-2 text-blue-500 text-xs sm:text-sm">
            <Loader size={20} className="animate-spin" />
            Please wait validating API key...
          </div>
        );
      case 'invalid':
        return (
          <div className="flex items-center gap-2 text-red-500 text-xs sm:text-sm">
            <InfoIcon size={20} />
            Claude API key added seems wrong or invalid - save again.
          </div>
        );
      default:
        return null;
    }
  };



  useEffect(() => {

    setTraningData(localStorage.getItem("getTrainingData"))
    console.log('Traning data ', TrainingData);
  }, [TrainingData])

  useEffect(() => {
    setIsBrowser(true);
    const storedProductInfo = localStorage.getItem('productQuestionnaire');
    if (storedProductInfo) {
      setProductInfo(JSON.parse(storedProductInfo));
    }
  }, []);

  const receivedSound = isBrowser ? new Audio('https://dazzling-cat.netlify.app/recievedmsg.mp3') : null;
  const sentSound = isBrowser ? new Audio('https://dazzling-cat.netlify.app/sendmsg1.mp3') : null;
  const toggleSound = isBrowser ? new Audio('https://dazzling-cat.netlify.app/sendmsg2.mp3') : null;

  const playSound = (sound) => {
    if (isBrowser && sound) {
      sound.play().catch(error => console.error('Error playing sound:', error));
    }
  };

  const addNewTweet = () => {
    setTweets(prevTweets => [...prevTweets, { id: Date.now(), content: '', images: [], links: [], videos: [], key: Date.now() }]);
  };

  const removeTweet = (id) => {
    if (tweets.length > 1) {
      setTweets(prevTweets => prevTweets.filter(tweet => tweet.id !== id));
    }
  };

  const handleEditorChange = (id, content) => {
    setTweets(prevTweets =>
      prevTweets.map(tweet =>
        tweet.id === id ? { ...tweet, content } : tweet
      )
    );
  };

  const handleImageUpload = useCallback(async (id) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = false;
      input.onchange = async () => {
        if (input.files && input.files[0]) {
          const file = input.files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
              setTweets(prevTweets =>
                prevTweets.map(tweet =>
                  tweet.id === id ? { ...tweet, images: [...tweet.images, e.target.result] } : tweet
                )
              );
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }, []);

  const handleVideoUpload = useCallback(async (id) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.multiple = false;
      input.onchange = async () => {
        if (input.files && input.files[0]) {
          const file = input.files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
              setTweets(prevTweets =>
                prevTweets.map(tweet =>
                  tweet.id === id ? { ...tweet, videos: [...(tweet.videos || []), e.target.result] } : tweet
                )
              );
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  }, []);

  const handleLinkAdd = useCallback((id) => {
    const url = window.prompt('Enter the URL');
    if (url) {
      setTweets(prevTweets =>
        prevTweets.map(tweet =>
          tweet.id === id ? { ...tweet, links: [...tweet.links, url] } : tweet
        )
      );
    }
  }, []);

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



  const generateAIThread = async () => {
    playSound(sentSound);
    setIsGenerating(true);
    try {
      let maxTweets;
      switch (threadType) {
        case 'single': maxTweets = 1; break;
        case 'three': maxTweets = 3; break;
        case 'full': maxTweets = 10; break;
      }

      let promptContent = overallPrompt;
      if (includeProduct) {
        const storedProductInfo = localStorage.getItem('productQuestionnaire');
        if (storedProductInfo) {
          const productData = JSON.parse(storedProductInfo);
          promptContent += "\n\nIncorporate the following information about my product/service into the tweet(s), blending it naturally with my personal journey as an indie founder:\n";
          promptContent += JSON.stringify(productData, null, 2);
        }
      }

      const feelingPrompt = getFeelingPrompt(feeling);

      // Add this function outside generateAIThread
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
- Start with reactive phrases ("Oh man", "Wait what", "Been there")
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

      
      Examples for this style:
      ${selectedLength.examples.join('\n')}
      
      Examples for this stance:
      ${selectedStance.examples.join('\n')}`;
      };



      const replyModePrompt = mode === 'reply' ?
        `${getReplyStylePrompt(replyLength, replyStance)}
      
    Reply to this tweet as an indie founder: "${promptContent}"
    
    Note: Just give me the reply text directly, no extra formatting or explanation needed.
    
    1. Media Formatting:
    Image: [https://placehold.co/600x400?text=Your+Text+Here]
    Video: [https://placehold.co/1920x1080.mp4?text=Your+Video+Text+Here]
    Link: [https://example.com]
    
    When generating tweets, always follow this structure:
    1. Strong opening statement
    2. Use <br> for line breaks between sections
    3. Short, punchy lines or bullet points
    4. Before/after comparisons when applicable
    6. Include relevant media suggestion
    7. Close with /endtweet

      How to return reply response , this is just an understanding for structure only:
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

    ` : '';


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

If the tweet involves code or technical concepts:
- Add real-world context ("Found this while debugging our payment system")
- Include specific problems ("Kept getting that weird AWS timeout")
- Share actual mistakes ("Forgot to increment the loop... classic")
- Add time references ("Spent 3 hours before realizing...")
  
      # IMPORTANT: DO NOT USE EMOJIS IN ANY TWEETS
  
      For image suggestions, use 'Image: [https://placehold.co/600x400?text=Your+Text+Here]'. When describing images:
  
      1. Emphasize zooming in on crucial details:
         - Focus on the most important part of the image
         - Describe a tight crop that eliminates unnecessary elements
         - Mention if specific numbers, text, or data points should be prominently featured
  
      2. Specify centering of key information:
         - Describe how the main focus should be in the center of the image
         - Mention any important elements that should be prominently displayed
  
      3. Include explanatory elements:
         - Suggest arrows pointing to significant areas
         - Recommend underlining or highlighting crucial information
         - Propose adding explanatory text overlays when necessary
  
      4. Specify image format:
         - Suggest square or portrait format for better visibility in the feed
         - For screenshots of data or analytics, recommend a mobile-style crop
  
      5. Background considerations:
         - Generally, suggest clean, simple backgrounds
         - Only recommend colorful or gradient backgrounds for significant milestones or achievements with minimal content
  
      For video suggestions, use 'Video: [https://placehold.co/1920x1080.mp4?text=Your+Video+Text+Here]'. When describing videos:
  
      1. Specify zooming and framing:
         - Suggest tight framing on the most crucial elements
         - Recommend zooming in on important details or text
  
      2. Describe motion and focus:
         - Suggest panning or zooming to guide viewer attention
         - Recommend focusing on key data points or visual elements
  
      3. Propose explanatory elements:
         - Suggest adding animated arrows or highlights
         - Recommend including text overlays for clarity
  
      4. Specify video format and duration:
         - Suggest vertical or square format for better feed visibility
         - Recommend keeping videos short and focused (e.g., 30 seconds or less)
  
      Always put these detailed media suggestions on separate lines after the main tweet content.
  
      Remember to maintain a consistent voice that's authentic, slightly humorous, and always focused on providing value to your audience. Each tweet should be able to stand alone while also contributing to your overall brand narrative as an indie founder.
      
      here's a few understanding of how to have a higher probability of going viral :

      1. PSYCHOLOGICAL ARCHITECTURE
A. Primary Emotional Triggers
1. Surprise Elements

Pattern Interruption

Unexpected twists in familiar situations
Subversion of established formats
Timing manipulation for maximum impact
Cultural expectation breaks
Format disruption techniques



2. Relatability Factors

Universal Experiences

Daily life moments
Common frustrations
Shared social awkwardness
Workplace scenarios
Relationship dynamics



3. Nostalgia Activation

Temporal References

Childhood memories
Pop culture callbacks
Historical parallels
Generational experiences
Cultural touchstones



B. Cognitive Engagement Patterns
1. Pattern Recognition

Format Familiarity

Template consistency
Visual hierarchy
Information flow
Cognitive shortcuts
Memory triggers



2. Cultural Context

Referential Framework

Current events integration
Pop culture literacy
Social commentary
Subcultural knowledge
Trending topics



2. TECHNICAL OPTIMIZATION
A. Visual Architecture
1. Composition Elements

Frame Construction
Copy- Focal point positioning: Rule of thirds grid
- Background-foreground relationship
- Color psychology implementation
- Movement flow patterns
- Visual weight distribution


2. Quality Parameters

Technical Specifications
Copy- Resolution optimization
- Compression ratios
- Color space management
- File format selection
- Platform-specific requirements


B. Platform-Specific Requirements
1. Format Specifications
CopyInstagram:
- Feed Posts: 1080 x 1080px (1:1)
- Stories: 1080 x 1920px (9:16)
- Reels: 1080 x 1920px (9:16)
- Carousel: 1080 x 1080px (multiple)

TikTok:
- Standard: 1080 x 1920px (9:16)
- Sound integration requirements
- Caption character limits
- Hashtag optimization
- Effect compatibility

Twitter:
- Timeline: 1200 x 675px (16:9)
- Card display: 800 x 418px
- Profile images: 400 x 400px
- Header images: 1500 x 500px
3. CONTENT DEVELOPMENT STRATEGY
A. Conceptualization Process
1. Trend Analysis Framework

Research Parameters
Copy- Platform trend monitoring
- Hashtag tracking
- Community sentiment analysis
- Format evolution tracking
- Cross-platform correlation


2. Format Selection Criteria

Decision Matrix
Copy- Audience alignment
- Platform suitability
- Technical feasibility
- Trend timing
- Resource availability


B. Production Methodology
1. Technical Setup

Equipment Configuration
Copy- Camera settings optimization
- Lighting arrangement
- Audio capture setup
- Background preparation
- Props and materials


2. Capture Process

Recording Protocol
Copy- Multiple angle coverage
- Backup recording systems
- Audio redundancy
- Timing synchronization
- Version control


4. DISTRIBUTION OPTIMIZATION
A. Platform Strategy
1. Timing Optimization

Peak Engagement Windows
CopyWeekdays:
- Early morning: 6-8 AM local
- Lunch break: 12-2 PM
- Evening commute: 5-7 PM
- Late night: 9-11 PM

Weekends:
- Mid-morning: 9-11 AM
- Early evening: 4-6 PM


2. Cross-Platform Synergy

Distribution Sequence
Copy1. Primary platform launch
2. Secondary platform adaptation
3. Cross-platform referencing
4. Community engagement phase
5. Remix encouragement


B. Community Engagement
1. Interaction Framework

Response Protocol
Copy- Comment engagement timing
- Reply strategy
- User-generated content integration
- Community recognition
- Collaboration opportunities


5. MEASUREMENT AND ITERATION
A. Analytics Framework
1. Key Performance Indicators

Metric Categories
CopyEngagement Metrics:
- View-to-share ratio
- Comment velocity
- Save rate
- Remix frequency
- Cross-platform spread

Quality Metrics:
- Sentiment analysis
- Comment quality
- Remix creativity
- Community adoption
- Longevity indicators


2. Optimization Cycle

Iteration Process
Copy1. Data collection phase
2. Analysis and interpretation
3. Strategy adjustment
4. Implementation
5. Performance monitoring


6. ADVANCED TECHNIQUES
A. Viral Engineering
1. Trigger Mechanisms

Activation Elements
Copy- Emotional hooks
- Curiosity gaps
- Pattern breaks
- Cultural touchpoints
- Participatory elements


2. Amplification Strategy

Growth Tactics
Copy- Influencer seeding
- Community activation
- Platform algorithm optimization
- Cross-platform synergy
- Timing coordination


B. Sustainability Planning
1. Content Evolution

Development Path
Copy- Format adaptation
- Theme expansion
- Character development
- Narrative building
- Community integration


2. Brand Building

Identity Development
Copy- Style guide creation
- Voice consistency
- Visual cohesion
- Community guidelines
- Growth strategy
      
      
      
      `;

      let systemPrompt = mode === 'reply' ? replyModePrompt : baseSystemPrompt;

      // Add existing training data
      systemPrompt = `${systemPrompt} Here Training Data for this response ${TrainingData}`;

      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': localStorage.getItem('anthropicKey')
        },
        body: JSON.stringify({
          temperature: 0.7,
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `${mode === 'reply' ? 'Generate a reply' : 'Generate a new tweet or thread'} ${threadType === 'single' ? '(single tweet)' : `(thread of ${maxTweets} tweets)`} ${mode === 'reply' ? 'in response to' : 'about'} the following ${mode === 'share' ? 'update' : 'tweet'}: "${promptContent}" ${feelingPrompt} NOTE: i just need the tweet content without any extra text. Don't use emojis unless specifically requested. Don't write numbers in front of each tweet. Include one media suggestion (image or video) per tweet. In the URL, provide text describing what the image or video should show. Use spacing and line breaks to make the tweet stand out.`
          }],
          system: systemPrompt,
          model: "claude-3-5-sonnet-20241022",
          claudapikey: getAnthropicKey()
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const generatedThreadContent = data.content[0].text.split('/endtweet').filter(tweet => tweet.trim() !== '');

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

      setTweets(generatedThread);
      playSound(receivedSound);
    } catch (error) {
      console.error('Error generating AI thread:', error);
      alert(`Failed to generate AI thread: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };


// First, update the getFeelingPrompt function to be more natural
const getFeelingPrompt = (feeling) => {
  const feelingPrompts = {
    curiosity: {
      prompt: "Share something that's been keeping you up at night lately - you know, that weird dev thing you can't stop thinking about",
      examples: [
        "3am thought: what if we've been doing databases wrong this whole time...",
        "Been thinking about this all week: why do we still..."
      ]
    },
    insight: {
      prompt: "Tell us about that random realization you just had - the kind that hits you in the shower or during a coffee break",
      examples: [
        "Wait hold up. Just realized after 4 years of coding that...",
        "Ok this is gonna sound obvious but it just clicked..."
      ]
    },
    authenticity: {
      prompt: "Share that behind-the-scenes moment that probably isn't going in the portfolio",
      examples: [
        "Currently: debugging what I swore was 'just a quick fix' (4 hours ago)",
        "Honest dev update: pretty sure my code is held together by..."
      ]
    },
    achievement: {
      prompt: "Share that tiny win you can't tell non-tech friends about (but we'll get it)",
      examples: [
        "Literally jumping around my room rn because this bug that's been haunting me for weeks...",
        "Not to brag but I just fixed a production issue without breaking anything else"
      ]
    },
    helpful: {
      prompt: "Share that trick you discovered by accident that's actually kind of genius",
      examples: [
        "Found this by mistake but turns out you can...",
        "Ok this might be obvious but it blew my mind when..."
      ]
    },
    reflection: {
      prompt: "Look back at something you used to do and now realize was either genius or totally wrong",
      examples: [
        "Past me thought they were so clever using... Present me has thoughts",
        "Cleaning up old code and wow, past me really said..."
      ]
    }
  };

  if (!feeling || feeling === 'not_specified') return "";
  return feelingPrompts[feeling]?.prompt || "";
};




  useEffect(() => {
    const key = localStorage.getItem('anthropicKey');
    if (key && key.startsWith('sk-')) {
      setApikeyAdded(true);
    }
  }, []);


  return (
    <div className="bg-white rounded-md overflow-hidden p-4">
      <div className="p-2 sm:p-4 border-gray-400 grid items-center mb-2 sm:mb-4">
        <div className='bg-white rounded-md p-2 sm:p-4'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-4'>
            <div className='grid gap-2'>
              <h1 className="text-lg sm:text-xl font-bold text-blue-500 mb-2 sm:mb-0">What is this update about?</h1>
              {!apikeyAdded ? <div className='flex items-center gap-2 text-red-500 text-xs sm:text-sm'><InfoIcon size={20} />Claude API key added seems wrong or invalid - save again. </div> : null}
            </div>

            <div className={`  flex items-center p-0.5 rounded-full bg-gray-100 shadow-inner w-fit`}>
              <button
                onClick={() => {
                  setMode('share');
                  playSound(toggleSound);
                }}

                className={`relative px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${mode === 'share'
                  ? 'text-white bg-blue-500'
                  : 'text-gray-500 hover:text-gray-500'
                  }`}
                aria-pressed={mode === 'share'}
              >
                <span className="relative z-10">Share</span>
                {mode === 'share' && (
                  <span className="absolute inset-0 rounded-full bg-blue-500 animate-fadeIn" />
                )}
              </button>
              <button
                onClick={() => {
                  setMode('reply');
                  playSound(toggleSound);
                }}
                className={`relative px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${mode === 'reply'
                  ? 'text-white bg-blue-500'
                  : 'text-gray-500 hover:text-gray-500'
                  }`}
                aria-pressed={mode === 'reply'}
              >
                <span className="relative z-10">Reply</span>
                {mode === 'reply' && (
                  <span className="absolute inset-0 rounded-full bg-blue-500 animate-fadeIn" />
                )}
              </button>
            </div>
          </div>
          <textarea
            className='w-full p-2 sm:p-4 rounded-md mt-2 sm:mt-4 bg-blue-50 text-blue-900 text-sm sm:text-base'
            value={overallPrompt}
            onChange={(e) => setOverallPrompt(e.target.value)}
            placeholder={mode === 'share' ? "I need to share an update with the community.." : "I want to reply to..."}
            rows={4}
          />
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 sm:mt-4 space-y-2 sm:space-y-0 sm:space-x-2">

            <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto gap-4'>
              {mode === 'reply' ? (
                <>
                <div className='grid'>
                <label class="font-bold text-xs">Reply Length</label>
                  <select
                    value={replyLength}
                    onChange={(e) => setReplyLength(e.target.value)}
                    className="p-2 rounded-md bg-white text-black border border-gray-300 text-xs sm:text-sm w-full sm:w-auto"
                  >
                    <option value="super_short">Ultra-Brief Reply</option>
                    <option value="medium">Standard Reply</option>
                    <option value="detailed">Detailed Reply</option>
                  </select>
                  </div>
                  <div className='grid'>
                  <label class="font-bold text-xs">Stance</label>
                  <select
                    value={replyStance}
                    onChange={(e) => setReplyStance(e.target.value)}
                    className="p-2 rounded-md bg-white text-black border border-gray-300 text-xs sm:text-sm w-full sm:w-auto"
                  >
                    <option value="neutral">Neutral Stance</option>
                    <option value="in_favour">In Favor</option>
                    <option value="not_in_favour">Not in Favor</option>
                    <option value="controversial">Controversial</option>
                  </select>
                  </div>
                </>
              ) : (

                <div className='flex gap-2'>

<div className='grid'>
                  <label class="font-bold text-xs">Post Length</label>
                  <select
                    value={threadType}
                    onChange={(e) => setThreadType(e.target.value)}
                    className="p-2 rounded-md bg-white text-black border border-gray-300 text-xs sm:text-sm w-full sm:w-auto"
                  >
                    <option value="single">Single Tweet</option>
                    <option value="three">3 Tweet Thread</option>
                    <option value="full">Full Thread</option>
                  </select>
                  </div>


                  <div className='grid'>
                  <label class="font-bold text-xs">Prespective</label>
                  <select
                    value={feeling}
                    onChange={(e) => setFeeling(e.target.value)}
                    className="p-2 rounded-md bg-white text-black border border-gray-300 text-xs sm:text-sm w-full sm:w-auto"
                  >
                    <option value="not_specified">Not Specified</option>
                    <option value="curiosity">🔍 Curiosity</option>
                    <option value="insight">💡 Insight</option>
                    <option value="authenticity">🎭 Authenticity</option>
                    <option value="achievement">🏆 Achievement</option>
                    <option value="helpful">🤝 Helpful</option>
                    <option value="reflection">🤔 Reflection</option>
                    <option value="encouragement">💪 Encouragement</option>
                    <option value="process">⚙️ Process</option>
                    <option value="observation">👀 Observation</option>
                  </select>
                  </div>

                </div>

              )}
            </div>



            {(apiKeyStatus === 'valid' || apiKeyStatus === 'validating') && (
              <button
                className="bg-blue-500 text-white px-4 p-2 rounded-md flex items-center justify-center gap-2 text-blue-900 text-xs sm:text-sm w-full sm:w-auto"
                onClick={generateAIThread}
                disabled={isGenerating || apiKeyStatus === 'validating'}
              >
                {isGenerating || apiKeyStatus === 'validating' ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Wand2 size={14} />
                )}
                {apiKeyStatus === 'validating' ? 'Validating API Key...' : `Generate ${threadType === 'single' ? 'Tweet' : 'Thread'}`}
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center mt-2 sm:mt-4 space-y-2 sm:space-y-0 sm:space-x-2 gap-2 mt-4">
            <button
              onClick={() => setIncludeProduct(!includeProduct)}
              className="flex items-center text-blue-500 hover:text-blue-500 text-xs sm:text-sm gap-4"
            >
              {includeProduct ? <CircleCheckBig size={20} /> : <Circle size={20} />}
              <span className="flex items-center gap-2 text-slate-500">
                Include my <span className='hidden lg:flex gap-1 sm:gap-2'>
                  <i className='flex gap-1 sm:gap-2 text-blue-500'>
                    <Blocks size={16} />product/service
                  </i> with my
                  <i className='flex gap-1 sm:gap-2 text-blue-500'>
                    <BicepsFlexed size={16} />personal journey
                  </i>
                </span>
              </span>
            </button>
            <button
              className='flex gap-2 bg-blue-100 text-blue-600 p-1 px-2 sm:px-4 rounded-2xl text-xs sm:text-sm'
              onClick={onConfigureTrainingData}
            >
              Training Data
            </button>
          </div>
        </div>
      </div>
      <div className='bg-blue-200 p-2 sm:p-4 rounded-md'>
        <div className="max-w-full sm:max-w-xl mx-auto border shadow-lg rounded-lg mb-4 sm:mb-8 bg-white">
          {tweets.map((tweet, index) => (
            <div key={tweet.key} className="relative border-b border-gray-200 last:border-b-0">
              <div className="absolute left-0 top-0 -ml-4 sm:-ml-6 mt-2 text-xs font-bold text-white">
                {index + 1}
              </div>
              <div className="p-2 sm:p-4">
                <div className="flex items-center mb-2 sm:mb-4">
                  <img src="https://placehold.co/40x40/333333/ffffff?text=B&font=Raleway" alt="User avatar" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2" />
                  <div>
                    <h2 className="font-bold text-xs sm:text-sm">Big Mouth</h2>
                    <p className="text-gray-500 text-xs">@absurdfounder</p>
                  </div>
                  {tweets.length > 1 && (
                    <button
                      onClick={() => removeTweet(tweet.id)}
                      className="ml-auto text-gray-500 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <TipTapEditor
                  key={tweet.key}
                  content={tweet.content}
                  onUpdate={(content) => handleEditorChange(tweet.id, content)}
                  onImageUpload={() => handleImageUpload(tweet.id)}
                  onVideoUpload={() => handleVideoUpload(tweet.id)}
                  onLinkAdd={() => handleLinkAdd(tweet.id)}
                />
                <TweetContent
                  images={tweet.images}
                  links={tweet.links}
                  videos={tweet.videos}
                />
                <div className="flex space-x-2 mt-2">

                </div>
              </div>
            </div>
          ))}
          <div className="p-2 sm:p-4">
            <button
              onClick={addNewTweet}
              className="flex items-center text-blue-500 hover:text-blue-500 text-xs sm:text-sm gap-4"
            >
              <PlusCircle size={14} className="mr-1" />
              Add another tweet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadWriter;
