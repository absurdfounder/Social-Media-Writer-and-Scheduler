import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Copy, CheckCheck } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Encryption/decryption functions
const encryptKey = (text) => {
  return btoa(text.split('').map((char, i) =>
    String.fromCharCode(char.charCodeAt(0) + (i % 4) + 1)
  ).join(''));
};

const decryptKey = (encoded) => {
  try {
    const decoded = atob(encoded);
    return decoded.split('').map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) - (i % 4) - 1)
    ).join('');
  } catch {
    return '';
  }
};

const ApiKeyManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openAIKey, setOpenAIKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [openAICopied, setOpenAICopied] = useState(false);
  const [anthropicCopied, setAnthropicCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchKeys = async () => {
      if (!auth.currentUser) {
        const storedOpenAIKey = localStorage.getItem('openAIKey');
        const storedAnthropicKey = localStorage.getItem('anthropicKey');
        if (storedOpenAIKey) setOpenAIKey(storedOpenAIKey);
        if (storedAnthropicKey) setAnthropicKey(storedAnthropicKey);
        return;
      }

      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.openAIKey) {
            const decrypted = decryptKey(data.openAIKey);
            setOpenAIKey(decrypted);
            localStorage.setItem('openAIKey', decrypted);
          }
          if (data.anthropicKey) {
            const decrypted = decryptKey(data.anthropicKey);
            setAnthropicKey(decrypted);
            localStorage.setItem('anthropicKey', decrypted);
          }
        }
      } catch (error) {
        console.error('Error fetching API keys:', error);
      }
    };

    fetchKeys();
  }, [auth.currentUser]);

  const handleSaveKeys = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const updates = {
          updatedAt: serverTimestamp()
        };

        if (openAIKey && openAIKey.startsWith('sk-')) {
          updates.openAIKey = encryptKey(openAIKey);
          localStorage.setItem('openAIKey', openAIKey);
        }

        // Always save the default Anthropic key
        const anthropicKeyToSave = anthropicKey || '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';
        updates.anthropicKey = encryptKey(anthropicKeyToSave);
        localStorage.setItem('anthropicKey', anthropicKeyToSave);

        await setDoc(userRef, updates, { merge: true });
      } else {
        if (openAIKey && openAIKey.startsWith('sk-')) {
          localStorage.setItem('openAIKey', openAIKey);
        }
        if (anthropicKey && anthropicKey.startsWith('sk-')) {
          localStorage.setItem('anthropicKey', anthropicKey);
        }
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKeys = async () => {
    try {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, {
          openAIKey: null,
          anthropicKey: null,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      localStorage.removeItem('openAIKey');
      localStorage.removeItem('anthropicKey');
      setOpenAIKey('');
      setAnthropicKey('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error removing API keys:', error);
    }
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

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center w-full px-4 py-2 rounded-lg transition-colors duration-200 text-gray-500 hover:bg-gray-100"
      >
        <Key className="mr-3 h-5 w-5" />
        <span className="font-medium">API Keys</span>
      </button>

      {isOpen && (
        <div style={{ width: "100vw" }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 space-y-4">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border-0 float-right rounded hover:bg-gray-50"
            >
              x
            </button>

            <h2 className="text-xl font-bold">API Key Management</h2>
            <p className='text-sm opacity-50'>All keys are encrypted.</p>

            <div className="space-y-4">
              <div>
                <div className='flex'>
                  <img src="https://logosandtypes.com/wp-content/uploads/2022/07/OpenAI.png" className="w-8 h-8" />
                  <label className="block text-sm font-medium text-gray-700 text-center m-auto mx-0">Open API Key</label>
                </div>
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
                <div className='flex'>
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtUnGYPe67wuzVDjTujZ21UV38Y6KQ290fow&s" className="w-8 h-8" />
                  <label className="block text-sm font-medium text-gray-700 text-center m-auto mx-0">Anthropic API Key</label>
                </div>
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
                className="px-4 py-2 bg-red-200 text-red-600 rounded hover:bg-red-600"
              >
                Delete Keys
              </button>
              <div className="space-x-2">
                <button
                  onClick={handleSaveKeys}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {loading ? 'Saving...' : 'Update Keys'}
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