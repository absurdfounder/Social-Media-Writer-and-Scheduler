import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { PlusCircle, X, Smile, Image as ImageIcon, Link as LinkIcon, Wand2, FileText, Video, Loader } from 'lucide-react';

const TipTapEditor = ({ content, onUpdate, onImageUpload, onVideoUpload, onLinkAdd, key }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
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
        class: 'prose w-full min-h-[100px] focus:outline-none dark:text-white',
      },
    },
  }, [key]);

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
    </div>
  );
};

const TweetContent = ({ content, images, links, index }) => {
  return (
    <div>
      {images.map((img, i) => (
        <img key={i} src={img} alt={`Tweet image ${i + 1}`} className="mb-2 rounded-md max-w-full h-auto" />
      ))}
      <div dangerouslySetInnerHTML={{ __html: content }} />
      {links.length > 0 && (
        <div className="mt-2">
          {links.map((link, i) => (
            <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="block text-blue-500 hover:underline">
              {link}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const ThreadWriter = () => {
  const [tweets, setTweets] = useState([{ id: Date.now(), content: '', images: [], links: [], key: Date.now() }]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [overallPrompt, setOverallPrompt] = useState('');
  const [rewritingTweetId, setRewritingTweetId] = useState(null);
  const [threadType, setThreadType] = useState('full');

  const addNewTweet = () => {
    setTweets(prevTweets => [...prevTweets, { id: Date.now(), content: '', images: [], links: [], key: Date.now() }]);
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
  
    lines.forEach(line => {
      if (line.startsWith('Image:')) {
        const imageUrl = line.split('Image:')[1].trim();
        images.push(imageUrl);
      } else if (line.startsWith('Link:')) {
        const linkUrl = line.split('Link:')[1].trim();
        links.push(linkUrl);
      } else {
        content += line + ' ';
      }
    });
  
    return { content: content.trim(), images, links };
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
          system: "You are a helpful AI assistant that rewrites tweets to make them more engaging and suggests relevant media to include. For image suggestions, use 'Image: https://placehold.co/600x400?text=Your+Text+Here'. For video suggestions, use 'Video: https://example.com/video.mp4'. For link suggestions, use 'Link: https://example.com'. Always include these suggestions after the main content, separated by two newlines.",
          model: "claude-3-sonnet-20240229",
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      const rewrittenContent = data.content[0].text.trim();
      const { content, images, links } = parseAIResponse(rewrittenContent);
  
      setTweets(prevTweets =>
        prevTweets.map(tweet =>
          tweet.id === id ? { ...tweet, content, images, links, key: Date.now() } : tweet
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
          maxTweets = 10; // Or any other reasonable maximum for a "full" thread
      }

      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperature: 0.7,
          max_tokens: 1000,
          messages: [{ role: "user", content: `Generate a ${threadType === 'single' ? 'single tweet' : `thread of ${maxTweets} tweets`} about the following update, including suggestions for images, videos, or links to add context: "${overallPrompt}"` }],
          system: `You are a helpful AI assistant that generates engaging ${threadType === 'single' ? 'tweets' : 'tweet threads'} based on user prompts and suggests relevant media to include. For image suggestions, use 'Image: https://placehold.co/600x400?text=Your+Text+Here'. For video suggestions, use 'Video: https://example.com/video.mp4'. For link suggestions, use 'Link: https://example.com'. Always include an image suggestion for the first tweet. Limit the response to ${maxTweets} tweet${maxTweets > 1 ? 's' : ''}.`,
          model: "claude-3-sonnet-20240229",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const generatedThreadContent = data.content[0].text.split('\n\n').filter(tweet => tweet.trim() !== '');

      const generatedThread = generatedThreadContent.map((tweetContent, index) => {
        const { content, images, links } = parseAIResponse(tweetContent);
        return {
          id: Date.now() + Math.random(),
          content,
          images: index === 0 && images.length === 0 ? ['https://placehold.co/600x400?text=Default+Image'] : images,
          links,
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
        <div className="max-w-xl mx-auto border shadow-lg rounded-lg  mb-16 bg-white">
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
                  <TweetContent
                    content={tweet.content}
                    images={tweet.images}
                    links={tweet.links}
                  />
                  <TipTapEditor
                    key={tweet.key}
                    content={tweet.content}
                    onUpdate={(content) => handleEditorChange(tweet.id, content)}
                    onImageUpload={() => handleImageUpload(tweet.id)}
                    onVideoUpload={() => handleVideoUpload(tweet.id)}
                    onLinkAdd={() => handleLinkAdd(tweet.id)}
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleImageUpload(tweet.id)}
                      className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                    >
                      <ImageIcon size={20} />
                    </button>
                    <button
                      onClick={() => handleVideoUpload(tweet.id)}
                      className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                    >
                      <Video size={20} />
                    </button>
                    <button
                      onClick={() => handleLinkAdd(tweet.id)}
                      className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                    >
                      <LinkIcon size={20} />
                    </button>
                    <button
                      onClick={() => generateAITweet(tweet.id)}
                      className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                      disabled={rewritingTweetId === tweet.id}
                    >
                      {rewritingTweetId === tweet.id ? <Loader size={20} className="animate-spin" /> : <Wand2 size={20} />}
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