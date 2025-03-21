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

const TECHNICAL_DOMAINS = [
  'Web Development',
  'AI/Machine Learning',
  'DevOps',
  'Mobile Development',
  'Data Science',
  'Cloud Infrastructure',
  'Cybersecurity',
  'Blockchain',
  'IoT',
  'Enterprise Software'
];

const HackerNewsPostGenerator = () => {
  const [state, setState] = useState({
    projectName: '',
    problemStatement: '',
    targetUser: '',
    technicalDomain: '',
    features: [
      { 
        name: '', 
        technicalImplementation: '', 
        userBenefit: '', 
        competitiveDifferentiation: '', 
        potentialUseCases: '' 
      },
      { 
        name: '', 
        technicalImplementation: '', 
        userBenefit: '', 
        competitiveDifferentiation: '', 
        potentialUseCases: '' 
      },
      { 
        name: '', 
        technicalImplementation: '', 
        userBenefit: '', 
        competitiveDifferentiation: '', 
        potentialUseCases: '' 
      }
    ],
    projectLink: '',
    generatedPosts: [],
    aiSuggestions: []
  });

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

  const updateFeature = useCallback((index, field, value) => {
    setState(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }));
  }, []);

  const generateAISuggestions = useCallback(async () => {
    // Reset previous state
    setIsLoading(true);
    setError(null);

    try {
      // Construct detailed prompt for AI suggestions
      const prompt = `You are an expert at generating Hacker News launch posts. 

Context:
- Project Name: ${state.projectName}
- Problem Statement: ${state.problemStatement}
- Technical Domain: ${state.technicalDomain}
- Target User: ${state.targetUser}

Features:
${state.features.filter(f => f.name).map(f => 
  `- ${f.name}: ${f.userBenefit}`
).join('\n')}

Generate 3 unique, compelling Hacker News-style post variations that capture the essence of this project. Focus on:
1. Technical innovation
2. Problem-solving approach
3. Unique value proposition
4. Authentic founder voice`;

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
        throw new Error('Failed to generate AI suggestions');
      }

      const data = await response.json();
      const suggestions = data.content[0].text.split('\n').filter(line => line.trim() !== '');

      setState(prev => ({
        ...prev,
        aiSuggestions: suggestions
      }));
    } catch (err) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [state]);

  const generatePost = useCallback(() => {
    // Validate input
    if (!state.projectName || !state.problemStatement) {
      alert('Please fill in project name and problem statement');
      return;
    }

    // Generate post with comprehensive structure
    const post = `Show HN: ${state.projectName}

${state.problemStatement}

${state.features.filter(f => f.name).map(feature => 
  `- ${feature.name}: ${feature.userBenefit}`
).join('\n')}

${CLOSING_LINES[Math.floor(Math.random() * CLOSING_LINES.length)]}

[${state.projectLink}]`;

    setState(prev => ({
      ...prev,
      generatedPosts: [post, ...prev.generatedPosts]
    }));
  }, [state]);

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
          Hacker News Post Generator
        </h1>

        {/* Project Core Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Project Name (e.g., I Built a...)"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={state.projectName}
            onChange={(e) => setState(prev => ({ ...prev, projectName: e.target.value }))}
          />
          <select
            className="w-full p-3 border rounded-lg"
            value={state.technicalDomain}
            onChange={(e) => setState(prev => ({ ...prev, technicalDomain: e.target.value }))}
          >
            <option value="">Select Technical Domain</option>
            {TECHNICAL_DOMAINS.map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
        </div>

        {/* Problem Statement */}
        <textarea
          placeholder="Detailed Problem Statement (What pain point does your project solve?)"
          className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500"
          value={state.problemStatement}
          onChange={(e) => setState(prev => ({ ...prev, problemStatement: e.target.value }))}
        />

        {/* Target User */}
        <input
          type="text"
          placeholder="Target User Persona (e.g., Developers, Startup Founders)"
          className="w-full p-3 border rounded-lg"
          value={state.targetUser}
          onChange={(e) => setState(prev => ({ ...prev, targetUser: e.target.value }))}
        />

        {/* Features Dynamic Input */}
        {state.features.map((feature, index) => (
          <div key={index} className="space-y-2 p-4 bg-gray-100 rounded-lg">
            <input
              type="text"
              placeholder={`Feature ${index + 1} Name`}
              className="w-full p-2 border rounded"
              value={feature.name}
              onChange={(e) => updateFeature(index, 'name', e.target.value)}
            />
            <textarea
              placeholder="Technical Implementation"
              className="w-full p-2 border rounded h-20"
              value={feature.technicalImplementation}
              onChange={(e) => updateFeature(index, 'technicalImplementation', e.target.value)}
            />
            <textarea
              placeholder="User Benefit"
              className="w-full p-2 border rounded h-20"
              value={feature.userBenefit}
              onChange={(e) => updateFeature(index, 'userBenefit', e.target.value)}
            />
          </div>
        ))}

        {/* Project Link */}
        <input
          type="text"
          placeholder="Project Link (GitHub/Website)"
          className="w-full p-3 border rounded-lg"
          value={state.projectLink}
          onChange={(e) => setState(prev => ({ ...prev, projectLink: e.target.value }))}
        />

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={generatePost}
            className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
          >
            Generate Post
          </button>
          <button
            onClick={generateAISuggestions}
            disabled={isLoading || !apiKeyValid}
            className={`flex-1 text-white p-3 rounded-lg transition ${
              isLoading || !apiKeyValid 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isLoading ? 'Generating...' : 'AI Suggestions'}
          </button>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* AI Suggestions */}
        {state.aiSuggestions.length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="font-bold mb-2">AI Suggestions:</h2>
            {state.aiSuggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="bg-white p-3 rounded-lg mb-2 shadow-sm flex justify-between items-center"
              >
                <span>{suggestion}</span>
                <button 
                  onClick={() => copyToClipboard(suggestion)}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Generated Posts */}
        {state.generatedPosts.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold mb-4 text-xl border-b pb-2">Generated Posts</h2>
            {state.generatedPosts.map((post, index) => (
              <div 
                key={index} 
                className="bg-white p-4 border rounded-lg mb-4 relative"
              >
                <pre className="whitespace-pre-wrap font-sans">{post}</pre>
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(post)}
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