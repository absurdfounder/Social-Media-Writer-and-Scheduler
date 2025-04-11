import React, { useState, useCallback, useEffect } from 'react';
import _ from 'lodash';
import { getAnthropicKey, decryptKey } from '../Utils/getApikey';

const CLOSING_LINES = [
  "Technical overhead? Deleted.",
  "Stop configuring. Start building.",
  "Innovation without complexity.",
  "Ship faster, build smarter.",
  "Your workflow, reimagined.",
  "Complexity solved in one tool.",
];

const HackerNewsPostGenerator = () => {
  const [post, setPost] = useState('');
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKeyValid, setApiKeyValid] = useState(false);

  useEffect(() => {
    const checkApiKey = () => {
      const key = localStorage.getItem('anthropicKey');
      if (key && key.startsWith('sk-')) {
        setApiKeyValid(true);
      } else {
        setApiKeyValid(false);
      }
    };
    
    checkApiKey();
  }, []);

  const generatePost = useCallback(async () => {
    if (!post.trim()) {
      alert('Please enter your post content');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use Anthropic API to enhance the post
      const prompt = `You are an expert at generating Hacker News launch posts. 
      
      Here's the user's post idea:
      
      ${post}
      
      Generate a compelling Hacker News-style post that captures the essence of this project.`;

      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': localStorage.getItem('anthropicKey')
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          temperature: 0.7,
          messages: [{ role: 'user', content: prompt }],
          system: 'You are an expert at generating concise, technical Hacker News launch posts that capture the essence of innovative software projects.',
          claudapikey: getAnthropicKey()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate post');
      }

      const data = await response.json();
      const generatedPost = data.content[0].text + '\n\n' + CLOSING_LINES[Math.floor(Math.random() * CLOSING_LINES.length)];
      
      setGeneratedPosts(prev => [generatedPost, ...prev]);
      setPost(''); // Clear the textarea after successful generation
      
    } catch (err) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [post]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-2xl rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
          Reddit Post Generator
        </h1>

        {/* Single Textarea for Post Generation */}
        <div className="space-y-4">
          <textarea
            placeholder="Describe your project, the problem it solves, and what makes it special..."
            className="w-full p-4 border rounded-lg h-64 focus:ring-2 focus:ring-slate-500 text-gray-700"
            value={post}
            onChange={(e) => setPost(e.target.value)}
          />

          <button
            onClick={generatePost}
            disabled={isLoading || !apiKeyValid}
            className={`w-full text-white p-3 rounded-lg transition ${
              isLoading || !apiKeyValid 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-slate-600'
            }`}
          >
            {isLoading ? 'Generating...' : 'Generate Post'}
          </button>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Generated Posts */}
        {generatedPosts.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold mb-4 text-xl border-b pb-2">Generated Posts</h2>
            {generatedPosts.map((generatedPost, index) => (
              <div 
                key={index} 
                className="bg-white p-4 border rounded-lg mb-4 relative"
              >
                <pre className="whitespace-pre-wrap font-sans">{generatedPost}</pre>
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(generatedPost)}
                    className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HackerNewsPostGenerator;