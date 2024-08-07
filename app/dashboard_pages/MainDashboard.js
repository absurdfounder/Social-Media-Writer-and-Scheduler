import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { PlusCircle, X, Smile, Image as ImageIcon, Link as LinkIcon, Wand2, FileText } from 'lucide-react';

const TipTapEditor = ({ content, onUpdate, onImageUpload, onLinkAdd, key }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
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
        class: 'prose max-w-full min-h-[100px] focus:outline-none dark:text-white',
      },
    },
  }, [key]);

  if (!isClient) {
    return <div>Loading editor...</div>;
  }

  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  );
};

const ThreadWriter = () => {
  const [tweets, setTweets] = useState([{ id: Date.now(), content: '', image: null, link: null, key: Date.now() }]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const addNewTweet = () => {
    setTweets(prevTweets => [...prevTweets, { id: Date.now(), content: '', image: null, link: null, key: Date.now() }]);
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
                  tweet.id === id ? { ...tweet, image: e.target.result, link: null } : tweet
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

  const handleLinkAdd = useCallback((id) => {
    const url = window.prompt('Enter the URL');
    if (url) {
      setTweets(prevTweets =>
        prevTweets.map(tweet =>
          tweet.id === id ? { ...tweet, link: url, image: null } : tweet
        )
      );
    }
  }, []);

  const generateAITweet = async (id) => {
    setIsGenerating(true);
    try {
      console.log('Sending request to /api/anthropic');
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperature: 0.7,
          max_tokens: 280,
          messages: [{ role: "user", content: "Generate a tweet about a random interesting topic." }],
          system: "You are a helpful AI assistant that generates engaging tweets.",
          model: "claude-3-sonnet-20240229",
        }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('Invalid JSON response from server');
      }

      if (!data.content || data.content.length === 0) {
        throw new Error('No content received from the API');
      }
      const generatedTweet = data.content[0].text.trim();

      setTweets(prevTweets =>
        prevTweets.map(tweet =>
          tweet.id === id ? { ...tweet, content: generatedTweet, key: Date.now() } : tweet
        )
      );
    } catch (error) {
      console.error('Error generating AI tweet:', error);
      alert(`Failed to generate AI tweet: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAIThread = async () => {
    setIsGenerating(true);
    try {
      // This is a placeholder for the actual API call
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperature: 0.7,
          max_tokens: 1000,
          messages: [{ role: "user", content: "Generate a thread of 3 tweets about a random interesting topic." }],
          system: "You are a helpful AI assistant that generates engaging tweet threads.",
          model: "claude-3-sonnet-20240229",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const generatedThreadContent = data.content[0].text.split('\n\n').filter(tweet => tweet.trim() !== '');

      const generatedThread = generatedThreadContent.map(content => ({
        id: Date.now() + Math.random(),
        content,
        image: null,
        link: null,
        key: Date.now() + Math.random()
      }));

      setTweets(prevTweets => [...prevTweets, ...generatedThread]);
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
    <div>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 grid items-center mb-4">
        <h1 className="text-xl font-bold">What is this update about ?</h1>
        <textarea className='w-full border p-4 rounded-md mt-4'>I need to share an update with the community..</textarea>
        <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
          <div className={`max-w-xl mx-auto ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'} shadow-lg rounded-lg overflow-hidden mb-16`}>
      {tweets.map((tweet, index) => (
        <div key={tweet.key} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} last:border-b-0`}>
          <div className="p-4">
            <div className="flex items-center mb-4">
              <img src={`https://placehold.co/40x40/${isDarkMode ? '999999/111111' : '333333/ffffff'}?text=U&font=Raleway`} alt="User avatar" className="w-10 h-10 rounded-full mr-3" />
              <div>
                <h2 className="font-bold">John Doe</h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>@johndoe</p>
              </div>
              {index > 0 && (
                <button 
                  onClick={() => removeTweet(tweet.id)} 
                  className={`ml-auto ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
                >
                  <X size={20} />
                </button>
              )}
            </div>
            {tweet.image && (
              <div className="mb-4">
                <img src={tweet.image} alt="Uploaded content" className="max-w-full h-auto rounded-lg" />
              </div>
            )}
            <TipTapEditor
              key={tweet.key}
              content={tweet.content}
              onUpdate={(content) => handleEditorChange(tweet.id, content)}
              onImageUpload={(imageUrl) => handleImageUpload(tweet.id, imageUrl)}
              onLinkAdd={(url) => handleLinkAdd(tweet.id, url)}
            />
            {tweet.link && (
              <div className={`mt-4 p-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded`}>
                <a href={tweet.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {tweet.link}
                </a>
              </div>
            )}
            <div className="flex space-x-2 mt-2">
              <button 
                onClick={() => handleImageUpload(tweet.id)} 
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
              >
                <ImageIcon size={20} />
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
                disabled={isGenerating}
              >
                <Wand2 size={20} />
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

      {showEmojiPicker && (
        <div className={`fixed bottom-16 left-0 p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg`}>
          <div>Emoji Picker Placeholder</div>
        </div>
      )}
    </div>
    </div>
  );
};

export default ThreadWriter;