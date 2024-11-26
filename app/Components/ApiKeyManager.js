import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Copy, CheckCheck } from 'lucide-react';

const ApiKeyManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openAIKey, setOpenAIKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [openAICopied, setOpenAICopied] = useState(false);
  const [anthropicCopied, setAnthropicCopied] = useState(false);

  useEffect(() => {
    const storedOpenAIKey = localStorage.getItem('openAIKey');
    const storedAnthropicKey = localStorage.getItem('anthropicKey');
    if (storedOpenAIKey) setOpenAIKey(storedOpenAIKey);
    if (storedAnthropicKey) setAnthropicKey(storedAnthropicKey);
  }, []);

  const handleSaveKeys = () => {
    if (openAIKey && openAIKey.startsWith('sk-')) {
      localStorage.setItem('openAIKey', openAIKey);
    }
    if (anthropicKey && anthropicKey.startsWith('sk-')) {
      localStorage.setItem('anthropicKey', anthropicKey);
    }
    setIsOpen(false);
  };

  const handleRemoveKeys = () => {
    localStorage.removeItem('openAIKey');
    localStorage.removeItem('anthropicKey');
    setOpenAIKey('');
    setAnthropicKey('');
    setIsOpen(false);
  };

  const handleCopyKey = (key, type) => {
    navigator.clipboard.writeText(key).then(() => {
      if (type === 'openai') {
        setOpenAICopied(true);
        setTimeout(() => setOpenAICopied(false), 2000);
      } else {
        setAnthropicCopied(true);
        setTimeout(() => setAnthropicCopied(false), 2000);
      }
    });
  };

  const maskKey = (key) => {
    if (!key) return '';
    return '****************************************';
  };

  return (
    <div className="px-4">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center w-full px-4 py-2 rounded-lg transition-colors duration-200 text-gray-500 hover:bg-gray-100"
      >
        <Key className="mr-3 h-5 w-5" />
        <span className="font-medium">API Keys</span>
      </button>

      {isOpen && (
        <div style={{width:"100vw"}} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 space-y-4">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border-0 float-right rounded hover:bg-gray-50"
            >
              x
            </button>

            <h2 className="text-xl font-bold">API Key Management</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">OpenAI API Key</label>
                <div className="relative">
                  <input
                    type={showOpenAIKey ? "text" : "password"}
                    placeholder="Enter OpenAI API key"
                    value={openAIKey}
                    onChange={(e) => setOpenAIKey(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    <button
                      onClick={() => handleCopyKey(openAIKey, 'openai')}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {openAICopied ? <CheckCheck size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                    <button
                      onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {showOpenAIKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Anthropic API Key</label>
                <div className="relative">
                  <input
                    type={showAnthropicKey ? "text" : "password"}
                    placeholder="Enter Anthropic API key"
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    <button
                      onClick={() => handleCopyKey(anthropicKey, 'anthropic')}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {anthropicCopied ? <CheckCheck size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                    <button
                      onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {showAnthropicKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={handleRemoveKeys}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove 
              </button>
              <div className="space-x-2">
                <button
                  onClick={handleSaveKeys}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save 
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManager;