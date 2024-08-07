import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { PlusCircle, X, Smile, Image as ImageIcon, Edit, Wand2, Link as LinkIcon } from 'lucide-react';

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
        class: 'prose max-w-full min-h-[100px] focus:outline-none',
      },
    },
  }, [key]);

  const handleImageUpload = useCallback(async () => {
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
              onImageUpload(e.target.result);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }, [onImageUpload]);

  const handleLinkAdd = useCallback(() => {
    const url = window.prompt('Enter the URL');
    if (url) {
      onLinkAdd(url);
    }
  }, [onLinkAdd]);

  const handleAIWrite = useCallback(async () => {
    try {
      const aiGeneratedText = "This is AI-generated text. Replace this with actual AI-generated content.";
      editor?.chain().focus().insertContent(aiGeneratedText).run();
    } catch (error) {
      console.error('Error generating AI text:', error);
    }
  }, [editor]);

  const handleAIImageGenerate = useCallback(async () => {
    try {
      const aiGeneratedImageUrl = "/api/placeholder/300/200?text=AI+Generated+Image";
      onImageUpload(aiGeneratedImageUrl);
    } catch (error) {
      console.error('Error generating AI image:', error);
    }
  }, [onImageUpload]);

  if (!isClient) {
    return <div>Loading editor...</div>;
  }

  return (
    <div>
      <EditorContent editor={editor} />
      <div className="flex space-x-2 mt-2">
        <button onClick={handleImageUpload} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
          <ImageIcon size={20} />
        </button>
        <button onClick={handleLinkAdd} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
          <LinkIcon size={20} />
        </button>
      </div>
    </div>
  );
};

const ThreadWriter = () => {
  const [tweets, setTweets] = useState([{ id: Date.now(), content: '', image: null, link: null, key: Date.now() }]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleImageUpload = (id, imageUrl) => {
    setTweets(prevTweets =>
      prevTweets.map(tweet =>
        tweet.id === id ? { ...tweet, image: imageUrl, link: null } : tweet
      )
    );
  };

  const handleLinkAdd = (id, url) => {
    setTweets(prevTweets =>
      prevTweets.map(tweet =>
        tweet.id === id ? { ...tweet, link: url, image: null } : tweet
      )
    );
  };

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

  return (
    <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden mb-16">
      {tweets.map((tweet, index) => (
        <div key={tweet.key} className="border-b border-gray-200 last:border-b-0">
          <div className="p-4">
            <div className="flex items-center mb-4">
              <img src="https://placehold.co/40x40/333333/ffffff?text=U&font=Raleway" alt="User avatar" className="w-10 h-10 rounded-full mr-3" />
              <div>
                <h2 className="font-bold">John Doe</h2>
                <p className="text-gray-500 text-sm">@johndoe</p>
              </div>
              {index > 0 && (
                <button 
                  onClick={() => removeTweet(tweet.id)} 
                  className="ml-auto text-gray-500 hover:text-red-500"
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
              <div className="mt-4 p-2 bg-gray-100 rounded">
                <a href={tweet.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {tweet.link}
                </a>
              </div>
            )}

            <div className='flex gap-4'>
            <button
              onClick={() => generateAITweet(tweet.id)}
              disabled={isGenerating}
              className={`flex gap-2 mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition duration-200 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
             <Wand2 size={20} /> {isGenerating ? 'Generating...' : 'AI Tweet'}
            </button>

            <button
              onClick={() => generateAITweet(tweet.id)}
              disabled={isGenerating}
              className={`flex gap-2 mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition duration-200 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
             <Wand2 size={20} /> {isGenerating ? 'Generating thread...' : 'AI Thread'}
            </button>
            </div>

          </div>
        </div>
      ))}
      <div className="p-4">
        <button 
          onClick={addNewTweet}
          className="flex items-center text-blue-500 hover:text-blue-600"
        >
          <PlusCircle size={20} className="mr-2" />
          Add another tweet
        </button>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex justify-between items-center">
        <div className="flex space-x-4">
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} />
          </button>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-200">
          Post
        </button>
      </div>
      {showEmojiPicker && (
        <div className="fixed bottom-16 left-0 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div>Emoji Picker Placeholder</div>
        </div>
      )}
    </div>
  );
};

export default ThreadWriter;