import React, { useState, useEffect } from 'react';
import { generatePostSuggestions } from './ai-post-generator';

const HackerNewsPostGenerator = () => {
  const [projectName, setProjectName] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [keyFeatures, setKeyFeatures] = useState(['', '', '']);
  const [projectLink, setProjectLink] = useState('');
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...keyFeatures];
    newFeatures[index] = value;
    setKeyFeatures(newFeatures);
  };

  const generatePost = () => {
    const post = `Show HN: ${projectName}

${problemStatement}

Features:
- ${keyFeatures[0]}
- ${keyFeatures[1]}
- ${keyFeatures[2]}

${generateClosingLine()}

[${projectLink}]`;

    setGeneratedPosts([post, ...generatedPosts]);
  };

  const generateClosingLine = () => {
    const closingLines = [
      'Stop configuring. Start building.',
      'Technical overhead? Deleted.',
      'Your workflow, simplified.',
      'Innovation without the complexity.',
      'Ship faster, build smarter.'
    ];
    return closingLines[Math.floor(Math.random() * closingLines.length)];
  };

  const generateAISuggestions = async () => {
    try {
      const suggestions = await generatePostSuggestions(projectName, problemStatement);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('AI suggestion generation failed', error);
    }
  };

  const copyToClipboard = (post) => {
    navigator.clipboard.writeText(post);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Hacker News Post Generator</h1>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Project Name (e.g., I Built a...)"
            className="w-full p-2 border rounded"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          
          <textarea
            placeholder="Problem Statement (What pain point does your project solve?)"
            className="w-full p-2 border rounded h-24"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
          />
          
          {keyFeatures.map((feature, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Key Feature ${index + 1}`}
              className="w-full p-2 border rounded"
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
            />
          ))}
          
          <input
            type="text"
            placeholder="Project Link (GitHub/Website)"
            className="w-full p-2 border rounded"
            value={projectLink}
            onChange={(e) => setProjectLink(e.target.value)}
          />
          
          <div className="flex space-x-4">
            <button
              onClick={generatePost}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Generate Post
            </button>
            <button
              onClick={generateAISuggestions}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              AI Suggestions
            </button>
          </div>
        </div>
        
        {aiSuggestions.length > 0 && (
          <div className="mt-6 bg-gray-100 p-4 rounded">
            <h2 className="font-bold mb-2">AI Suggestions:</h2>
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="mb-2 p-2 bg-white rounded shadow-sm">
                {suggestion}
              </div>
            ))}
          </div>
        )}
        
        {generatedPosts.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold mb-2">Generated Posts:</h2>
            {generatedPosts.map((post, index) => (
              <div 
                key={index} 
                className="bg-white p-4 border rounded mb-4 relative"
              >
                <pre className="whitespace-pre-wrap">{post}</pre>
                <button
                  onClick={() => copyToClipboard(post)}
                  className="absolute top-2 right-2 bg-gray-200 px-2 py-1 rounded text-sm hover:bg-gray-300"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Mock AI generation function (replace with actual AI API call)
const generatePostSuggestions = async (projectName, problemStatement) => {
  // Simulated AI suggestions
  return [
    `Show HN: Revolutionizing ${projectName} with Innovative Approach`,
    `Solving ${problemStatement} Like Never Before`,
    `The ${projectName} That Will Change How You Work`
  ];
};

export default HackerNewsPostGenerator;