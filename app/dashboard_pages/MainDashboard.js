"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { PlusCircle, X, Smile, Image as ImageIcon, Link as LinkIcon, Wand2, FileText, Video, Loader, ToggleLeft, ToggleRight, Circle, CircleCheck, Blocks, BicepsFlexed, CircleCheckBig } from 'lucide-react';

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
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <ImageIcon size={20} />
        </button>
        <button
          onClick={onVideoUpload}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <Video size={20} />
        </button>
        <button
          onClick={onLinkAdd}
          className="p-2 rounded-full hover:bg-gray-200"
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

  const generateAITweet = async (id) => {
    setRewritingTweetId(id);
    try {
      const tweetToRewrite = tweets.find(tweet => tweet.id === id);
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperature: 0.7,
          max_tokens: 280,
          messages: [{ role: "user", content: `Rewrite the following tweet in a more engaging way, and include suggestions for an image, video, or link to add context: "${tweetToRewrite.content}"` }],
          system: "You are a helpful AI assistant that rewrites tweets to make them more engaging and suggests relevant media to include. For image suggestions, use 'Image: https://placehold.co/600x400?text=Your+Text+Here'. For video suggestions, use 'Video: https://placehold.co/1920x1080.mp4?text=Your+Video+Text+Here'. For link suggestions, use 'Link: https://example.com'. Always include these suggestions after the main content, separated by two newlines.",
          model: "claude-3-5-sonnet-20240620",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rewrittenContent = data.content[0].text.trim();
      const { content, images, links, videos } = parseAIResponse(rewrittenContent);

      setTweets(prevTweets =>
        prevTweets.map(tweet =>
          tweet.id === id ? { ...tweet, content, images, links, videos, key: Date.now() } : tweet
        )
      );
    } catch (error) {
      console.error('Error rewriting tweet:', error);
      alert(`Failed to rewrite tweet: ${error.message}`);
    } finally {
      setRewritingTweetId(null);
    }
  };

  const generateAIThread = async () => {
    playSound(sentSound);
    setIsGenerating(true);
    try {
      let maxTweets;
      switch (threadType) {
        case 'single':
          maxTweets = 1;
          break;
        case 'three':
          maxTweets = 3;
          break;
        case 'full':
        default:
          maxTweets = 10;
      }

      let promptContent = overallPrompt;
      if (includeProduct && productInfo) {
        promptContent += "\n\nIncorporate information about my product/service:";
        for (const [key, value] of Object.entries(productInfo)) {
          if (value) {
            promptContent += `\n${key}: ${value}`;
          }
        }
      }

      const feelingPrompt = getFeelingPrompt(feeling);

      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperature: 0.7,
          max_tokens: 1000,
          messages: [{ role: "user", content: `Generate a ${threadType === 'single' ? 'single tweet' : `thread of ${maxTweets} tweets`} about the following ${mode === 'share' ? 'update' : 'reply'}, including suggestions for images, videos, or links to add context: "${promptContent}" ${feelingPrompt} NOTE: i just need the tweet no extra text , Dont use emojis unless its asked , Dont write numbers infront of each tweet. One media image or video. decide how it should be, in the url provide text what the image should be about or what to show what to add etc; spacing breaks etc is what makes the tweet stand out.` }],
          system: `You are an indie founder building your audience and personal brand on Twitter while developing a side-product. Your goal is to create engaging, high-impact tweets that resonate with your audience and showcase your journey. When writing tweets, follow these guidelines:

          ${mode === 'reply' ? `
          For reply mode, consider these additional guidelines:
          - Address the original tweet's main points or questions directly
          - Show empathy and understanding in your response
          - Provide additional value or insights related to the topic
          - Use a conversational tone that encourages further discussion
          - If appropriate, share a relevant personal experience or anecdote
          - End with a question to keep the conversation going

          Examples of good replies:
          1. "Interesting point about [topic]. In my experience, [share insight]. Have you considered [alternative viewpoint]? It might offer a different perspective on the issue."

          2. "I can relate to your struggle with [problem]. Last year, I faced a similar challenge and found that [solution] really helped. What strategies have you tried so far?"

          3. "Your success with [achievement] is inspiring! It reminds me of when I [similar experience]. What's the next big goal you're aiming for?"
          ` :''}

          Start with a strong hook or attention-grabbing statement
          Use simple, concise language that conveys your message quickly
          Incorporate personal stories or experiences to make your content relatable
          Structure your tweets for easy readability (e.g., bullet points, numbered lists, or before/after comparisons)
          Include a clear value proposition or takeaway for your audience
          For longer content, break it into a thread with each tweet focusing on a single point
          Always include a visual element (image, video, or gif) in the first tweet of a thread or standalone tweet
          End with a call-to-action or thought-provoking question to encourage engagement
          
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
          5. End with a question or call-to-action
          6. Include relevant media suggestion
          7. Close with /endtweet

          Remember:
          - No emojis
          - Concise, impactful language
          - Focus on personal experiences and lessons learned
          - Always provide value to the audience

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

          Remember to maintain a consistent voice that's authentic, slightly humorous, and always focused on providing value to your audience. Each tweet should be able to stand alone while also contributing to your overall brand narrative as an indie founder.`,
          model: "claude-3-5-sonnet-20240620",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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

  const getFeelingPrompt = (feeling) => {
    const feelingPrompts = {
      curiosity: "Express curiosity and a desire to learn more in the tweet. Use phrases that encourage exploration and questioning.",
      humor: "Inject humor into the tweet. Use witty observations or playful language to entertain the audience.",
      excitement: "Convey excitement and enthusiasm in the tweet. Use energetic language and express optimism about the topic.",
      trust: "Build trust with the audience in the tweet. Share authentic experiences and be transparent about challenges and successes.",
      inspiration: "Inspire the audience with the tweet. Share motivational content and encourage others to pursue their goals.",
      surprise: "Express surprise or amazement in the tweet. Share unexpected insights or revelations that might intrigue the audience.",
      anger: "Channel constructive frustration into the tweet. Address pain points in the industry or common challenges faced by indie founders.",
      hope: "Express hope and positivity in the tweet. Focus on potential solutions and opportunities for growth.",
      fear: "Acknowledge common fears or anxieties in the indie founder journey, but frame them in a way that encourages overcoming obstacles."
    };
    return feelingPrompts[feeling] || "";
  };

  return (
    <div className="bg-white rounded-md overflow-hidden">
      <div className="p-2 sm:p-4 border-gray-400 grid items-center mb-2 sm:mb-4">
        <div className='bg-white rounded-md p-2 sm:p-4'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-4'>
            <h1 className="text-lg sm:text-xl font-bold text-blue-500 mb-2 sm:mb-0">What is this update about?</h1>

            <div className="flex items-center p-0.5 rounded-full bg-gray-100 shadow-inner w-fit">
              <button
                onClick={() => {
                  setMode('share');
                  playSound(toggleSound);
                }}
                className={`relative px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  mode === 'share'
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
                className={`relative px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  mode === 'reply'
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
            <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
              <select
                value={threadType}
                onChange={(e) => setThreadType(e.target.value)}
                className="p-2 rounded-md bg-white text-black border border-gray-300 text-xs sm:text-sm w-full sm:w-auto"
              >
                <option value="single">Single Tweet</option>
                <option value="three">3 Tweet Thread</option>
                <option value="full">Full Thread</option>
              </select>

              <select
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                className="p-2 rounded-md bg-white text-black border border-gray-300 text-xs sm:text-sm w-full sm:w-auto"
              >
                <option value="not_specified">Not Specified</option>
                <option value="curiosity">🤔 Curiosity</option>
                <option value="humor">😄 Humor</option>
                <option value="excitement">🎉 Excitement</option>
                <option value="trust">🤝 Trust</option>
                <option value="inspiration">💡 Inspiration</option>
                <option value="surprise">😮 Surprise</option>
                <option value="anger">😠 Frustration</option>
                <option value="hope">🌟 Hope</option>
                <option value="fear">😨 Concern</option>
              </select>
            </div>

            <button
              className='bg-blue-500 text-white px-4 p-2 rounded-md flex items-center justify-center gap-2 text-blue-900 text-xs sm:text-sm w-full sm:w-auto'
              onClick={generateAIThread}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader size={14} className="animate-spin" /> : <Wand2 size={14} />}
              Generate {threadType === 'single' ? 'Tweet' : 'Thread'}
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center mt-2 sm:mt-4 space-y-2 sm:space-y-0 sm:space-x-2 gap-2 mt-4">
            <button
              onClick={() => setIncludeProduct(!includeProduct)}
              className="flex items-center text-blue-500 hover:text-blue-500 text-xs sm:text-sm"
            >
              {includeProduct ? <Circle size={20} /> : <CircleCheckBig size={20} />}
              <span className="ml-2 flex gap-1 sm:gap-2 items-center text-slate-500">Include my <i className='flex gap-1 sm:gap-2 text-blue-500'><Blocks size={16} />product/service</i> with my <i className='flex gap-1 sm:gap-2 text-blue-500'> <BicepsFlexed size={16} />personal journey</i> </span>
            </button>
            <button 
              className='flex gap-2 bg-blue-100 text-blue-600 p-1 px-2 sm:px-4 rounded-2xl text-xs sm:text-sm'
              onClick={onConfigureTrainingData}
            >
              Configure Training Data
            </button>
          </div>
        </div>
      </div>
      <div className='bg-blue-200 p-2 sm:p-4'>
        <div className="max-w-full sm:max-w-xl mx-auto border shadow-lg rounded-lg mb-4 sm:mb-8 bg-white">
          {tweets.map((tweet, index) => (
            <div key={tweet.key} className="relative border-b border-gray-200 last:border-b-0">
              <div className="absolute left-0 top-0 -ml-4 sm:-ml-6 mt-2 text-xs font-bold text-white">
                {index + 1}
              </div>
              <div className="p-2 sm:p-4">
                <div className="flex items-center mb-2 sm:mb-4">
                  <img src="https://placehold.co/40x40/333333/ffffff?text=U&font=Raleway" alt="User avatar" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2" />
                  <div>
                    <h2 className="font-bold text-xs sm:text-sm">John Doe</h2>
                    <p className="text-gray-500 text-xs">@johndoe</p>
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
                  <button
                    onClick={() => generateAITweet(tweet.id)}
                    className="p-1 flex gap-1 rounded-full hover:bg-gray-200 text-xs hidden"
                    disabled={rewritingTweetId === tweet.id}
                  >
                    {rewritingTweetId === tweet.id ? <Loader size={12} className="animate-spin" /> : <Wand2 size={12} />} Rewrite
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="p-2 sm:p-4">
            <button
              onClick={addNewTweet}
              className="flex items-center text-blue-500 hover:text-blue-500 text-xs sm:text-sm"
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