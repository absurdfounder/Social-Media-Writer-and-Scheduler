import React, { useState, useEffect } from 'react';
import { Key } from 'lucide-react';

const ApiKeyManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openAIKey, setOpenAIKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');

  useEffect(() => {
    const storedOpenAIKey = localStorage.getItem('openAIKey');
    const storedAnthropicKey = localStorage.getItem('anthropicKey');
    if (storedOpenAIKey) setOpenAIKey('****************************************');
    if (storedAnthropicKey) setAnthropicKey('****************************************');
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
                  className="px-4 py-2 border-0s float-right  rounded hover:bg-gray-50"
                >
                  x
                </button>

            <h2 className="text-xl font-bold">API Key Management</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">OpenAI API Key</label>
                <input
                  type="password"
                  placeholder="Enter OpenAI API key"
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Anthropic API Key</label>
                <input
                  type="password"
                  placeholder="Enter Anthropic API key"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
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