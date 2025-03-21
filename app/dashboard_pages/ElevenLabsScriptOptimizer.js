import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { getAnthropicKey, decryptKey } from '../Utils/getApikey';

const ElevenLabsScriptOptimizer = () => {
  const [inputScript, setInputScript] = useState('');
  const [outputScript, setOutputScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [includeEmphasis, setIncludeEmphasis] = useState(true);
  const [includePauses, setIncludePauses] = useState(true);
  const [includePronunciation, setIncludePronunciation] = useState(true);
  const [selectedVoiceStyle, setSelectedVoiceStyle] = useState('neutral');
  const [attentionDeficit, setAttentionDeficit] = useState(true);
  const [activeTab, setActiveTab] = useState('input');
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [error, setError] = useState(null);

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

  const voiceStyles = {
    neutral: "Standard speaking style",
    energetic: "High-energy and enthusiastic delivery",
    professional: "Clear and formal presentation style",
    conversational: "Casual and natural speaking style",
    narrative: "Storytelling with dramatic elements"
  };
  
  const handleOptimize = async () => {
    // Reset previous state
    setIsLoading(true);
    setError(null);

    if (!inputScript.trim()) {
      setIsLoading(false);
      return;
    }

    const PROMPT_TEMPLATE = `
You are an expert script optimizer for ElevenLabs text-to-speech system. Your job is to take a raw script and optimize it with proper SSML tags to make it sound more natural and engaging.

${attentionDeficit ? "IMPORTANT: The audience has a very limited attention span. Use audio techniques to maintain focus throughout." : ""}

INSTRUCTIONS:
1. Format the script with the following ElevenLabs controls:
${includeEmphasis ? "- Use <emphasis level=\"strong\"> or <emphasis level=\"moderate\"> for IMPORTANT keywords and phrases" : ""}
${includePauses ? "- Add <break time=\"x.xs\" /> for strategic pauses (use sparingly to avoid instability)" : ""}
${includePronunciation ? "- Use <phoneme alphabet=\"cmu-arpabet\" ph=\"PRONUNCIATION\"> for difficult words" : ""}

2. Normalize text for optimal speech:
- Format numbers properly (cardinal, ordinal, phone numbers, dates)
- Expand abbreviations and acronyms when needed
- Format symbols, URLs, and special characters for clear pronunciation

3. Voice style: ${selectedVoiceStyle.toUpperCase()}
${selectedVoiceStyle === 'energetic' ? "- Add more emphasis and varied pacing to create excitement" : ""}
${selectedVoiceStyle === 'professional' ? "- Use measured pacing and clear articulation" : ""}
${selectedVoiceStyle === 'conversational' ? "- Add natural speech patterns, slight hesitations" : ""}
${selectedVoiceStyle === 'narrative' ? "- Create dramatic pauses and emotional emphasis" : ""}

${attentionDeficit ? `
4. ATTENTION MANAGEMENT TECHNIQUES:
- Emphasize a keyword every 5-7 seconds to recapture wandering attention
- Use strategic pauses before important information
- Create tonal variation with rising and falling emphasis
- Make transitions very clear with emphasis markers
- Use emphasis to create "peaks" of engagement at regular intervals
` : ""}

ORIGINAL SCRIPT:
"""
${inputScript}
"""

Return ONLY the optimized script with appropriate SSML tags, with no explanations.`;

    try {
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': localStorage.getItem('anthropicKey')
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          temperature: 0.7,
          messages: [{ role: 'user', content: PROMPT_TEMPLATE }],
          system: 'You are an expert at optimizing scripts for text-to-speech, focusing on natural and engaging delivery.',
          claudapikey: getAnthropicKey()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to optimize script');
      }

      const data = await response.json();
      const optimizedScript = data.content[0].text.trim();

      setOutputScript(optimizedScript);
      setActiveTab('output');
    } catch (err) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputScript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">ElevenLabs Script Optimizer</h2>
          <p className="mt-1 text-sm text-gray-600">
            Transform plain text scripts into optimized ElevenLabs-ready content with SSML tags for emphasis, pauses, and pronunciation
          </p>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button 
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'input' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('input')}
            >
              Input Script
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'output' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('output')}
            >
              Optimized Output
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </nav>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Error Handling */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Input Tab */}
          {activeTab === 'input' && (
            <div className="space-y-4">
              <textarea 
                placeholder="Paste your script here..." 
                className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                value={inputScript}
                onChange={(e) => setInputScript(e.target.value)}
              />
              <button 
                onClick={handleOptimize} 
                disabled={isLoading || !inputScript.trim() || !apiKeyValid} 
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  isLoading || !inputScript.trim() || !apiKeyValid 
                    ? 'bg-blue-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } flex items-center justify-center`}
              >
                {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Optimizing...' : 'Optimize Script'}
              </button>
            </div>
          )}
          
          {/* Output Tab */}
          {activeTab === 'output' && (
            <div className="space-y-4">
              {outputScript ? (
                <>
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-green-600" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Optimization Complete</h3>
                        <p className="text-sm text-green-700 mt-1">
                          Your script has been optimized with SSML tags for ElevenLabs.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <textarea 
                      className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-mono"
                      value={outputScript}
                      readOnly
                    />
                    <button 
                      className="absolute top-2 right-2 px-3 py-1 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm flex items-center"
                      onClick={copyToClipboard}
                    >
                      {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                  <p>No optimized script yet. Enter your script and click "Optimize Script".</p>
                </div>
              )}
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Optimization Features</h3>
                
                <div className="flex items-center space-x-3">
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={includeEmphasis}
                      onChange={() => setIncludeEmphasis(!includeEmphasis)}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ms-3">Keyword Emphasis</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={includePauses}
                      onChange={() => setIncludePauses(!includePauses)}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ms-3">Strategic Pauses</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={includePronunciation}
                      onChange={() => setIncludePronunciation(!includePronunciation)}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ms-3">Pronunciation Guidance</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={attentionDeficit}
                      onChange={() => setAttentionDeficit(!attentionDeficit)}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ms-3">Attention Deficit Optimization</span>
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Voice Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(voiceStyles).map(([style, description]) => (
                    <div key={style} className="flex items-start space-x-2">
                      <input 
                        type="radio" 
                        id={style} 
                        name="voiceStyle" 
                        value={style}
                        checked={selectedVoiceStyle === style}
                        onChange={() => setSelectedVoiceStyle(style)}
                        className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor={style} className="font-medium capitalize text-gray-700">{style}</label>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-center text-xs text-gray-500">
            <p>This tool helps create ElevenLabs-optimized scripts with proper SSML tags.</p>
            <p className="mt-1">The output can be directly used in ElevenLabs text-to-speech platform.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElevenLabsScriptOptimizer;