import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { PlusCircle, X, Smile, Image as ImageIcon, Link as LinkIcon, Wand2, FileText, Video, Loader } from 'lucide-react';



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
        class: 'prose w-full min-h-[100px] focus:outline-none dark:text-white whitespace-pre-wrap',
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
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <ImageIcon size={20} />
        </button>
        <button
          onClick={onVideoUpload}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <Video size={20} />
        </button>
        <button
          onClick={onLinkAdd}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
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
        <p className="text-sm text-gray-600">{preview.description}</p>
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

const ThreadWriter = () => {
  const [tweets, setTweets] = useState([{ id: Date.now(), content: '', images: [], links: [], videos: [], key: Date.now() }]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [overallPrompt, setOverallPrompt] = useState('');
  const [rewritingTweetId, setRewritingTweetId] = useState(null);
  const [threadType, setThreadType] = useState('full');

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
          model: "claude-3-sonnet-20240229",
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

      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperature: 0.7,
          max_tokens: 1000,
          messages: [{ role: "user", content: `Generate a ${threadType === 'single' ? 'single tweet' : `thread of ${maxTweets} tweets`} about the following update, including suggestions for images, videos, or links to add context: "${overallPrompt}" NOTE: i just need the tweet no extra text , Dont use emojis unless its asked , Dont write numbers infront of each tweet. One media image or video. decide how it should be, in the url provide text what the image should be about or what to show what to add etc; spacing breaks etc is what makes the tweet stand out.` }],
          system: `You are an indie founder building your audience and personal brand on Twitter while developing a side-product. Your goal is to create engaging, high-impact tweets that resonate with your audience and showcase your journey. When writing tweets, follow these guidelines:

Start with a strong hook or attention-grabbing statement
Use simple, concise language that conveys your message quickly
Incorporate personal stories or experiences to make your content relatable
Structure your tweets for easy readability (e.g., bullet points, numbered lists, or before/after comparisons)
Include a clear value proposition or takeaway for your audience
For longer content, break it into a thread with each tweet focusing on a single point
Always include a visual element (image, video, or gif) in the first tweet of a thread or standalone tweet
End with a call-to-action or thought-provoking question to encourage engagement

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
          model: "claude-3-sonnet-20240229",
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
    } catch (error) {
      console.error('Error generating AI thread:', error);
      alert(`Failed to generate AI thread: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white rounded-md overflow-hidden'}`}>
      <div className="p-4 border-gray-400 dark:border-gray-700 grid items-center mb-4">
        <div className='flex justify-between'>
          <h1 className="text-xl font-bold">What is this update about?</h1>
          <button onClick={toggleDarkMode} className="p-2 border border-gray-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-md p-4 mt-4'>
          <textarea 
            className='w-full p-4 rounded-md mt-4 bg-white dark:bg-gray-700 text-black dark:text-white'
            value={overallPrompt}
            onChange={(e) => setOverallPrompt(e.target.value)}
            placeholder="I need to share an update with the community.."
          />
          <div className="flex justify-between items-center mt-4">
            <select
              value={threadType}
              onChange={(e) => setThreadType(e.target.value)}
              className="p-2 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600"
            >
              <option value="single">Single Tweet</option>
              <option value="three">3 Tweet Thread</option>
              <option value="full">Full Thread</option>
            </select>
            <button 
              className='bg-blue-100 dark:bg-blue-900 p-4 rounded-md flex gap-4 text-blue-900 dark:text-blue-100'
              onClick={generateAIThread}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader size={20} className="animate-spin" /> : <Wand2 size={20} />}
              Generate {threadType === 'single' ? 'Tweet' : 'Thread'}
            </button>
          </div>
        </div>
      </div>
      <div className='bg-gray-900 py-8'>
        <div className="max-w-xl mx-auto border shadow-lg rounded-lg mb-16 bg-white">
          {tweets.map((tweet, index) => (
            <div key={tweet.key} className={`relative border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} last:border-b-0`}>
              <div className="absolute left-0 top-0 -ml-8 mt-4 text-sm font-bold text-white">
                {index + 1}
              </div>
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <img src={`https://placehold.co/40x40/${isDarkMode ? '999999/111111' : '333333/ffffff'}?text=U&font=Raleway`} alt="User avatar" className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <h2 className="font-bold">John Doe</h2>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>@johndoe</p>
                  </div>
                  {tweets.length > 1 && (
                    <button
                      onClick={() => removeTweet(tweet.id)}
                      className={`ml-auto ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
                    >
                      <X size={20} />
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
                    className={`p-2 flex gap-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                    disabled={rewritingTweetId === tweet.id}
                  >
                    {rewritingTweetId === tweet.id ? <Loader size={20} className="animate-spin" /> : <Wand2 size={20} />} Rewrite
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="p-4">
            <button
              onClick={addNewTweet}
              className={`flex items-center ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'}`}
            >
              <PlusCircle size={20} className="mr-2" />
              Add another tweet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadWriter;