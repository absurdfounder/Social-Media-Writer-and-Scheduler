"use client"

import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  Loader, 
  InfoIcon, 
  User, 
  AtSign, 
  Mail, 
  Linkedin, 
  Briefcase,
  Target,
  MessageCircle,
  Copy,
  Check,
  FileText,
  X,
  Database,
  StickyNote,
  Save,
  Trash2
} from 'lucide-react';
import { getAnthropicKey } from '../Utils/getApikey';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

// ===== OutreachAgent Component =====
const OutreachAgent = () => {
  const [isClient, setIsClient] = useState(false);
  const [userContext, setUserContext] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [platform, setPlatform] = useState('twitter');
  const [messageType, setMessageType] = useState('cold_outreach');
  const [tone, setTone] = useState('friendly');
  const [goal, setGoal] = useState('sales');
  const [messageLength, setMessageLength] = useState('short');
  
  const [apiKeyStatus, setApiKeyStatus] = useState('unchecked');
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // State variables
  const [trainingData, setTrainingData] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isTrainingPopupOpen, setIsTrainingPopupOpen] = useState(false);
  
  // Notes feature state
  const [notes, setNotes] = useState('');
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [includeNotesInGeneration, setIncludeNotesInGeneration] = useState(false);

  // Load training data from localStorage
  useEffect(() => {
    const storedTrainingData = localStorage.getItem("getTrainingData");
    if (storedTrainingData) {
      setTrainingData(storedTrainingData);
    }
    
    // Load saved notes from localStorage
    const savedNotes = localStorage.getItem("outreachNotes");
    if (savedNotes) {
      setNotes(savedNotes);
    }
    
    // Load notes inclusion preference
    const savedIncludeNotes = localStorage.getItem("includeNotesInGeneration");
    if (savedIncludeNotes) {
      setIncludeNotesInGeneration(savedIncludeNotes === 'true');
    }
  }, []);

  // Load profiles from Firebase
  useEffect(() => {
    const loadProfiles = async () => {
      const auth = getAuth();
      if (!auth.currentUser) return;
      try {
        const db = getFirestore();
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, where('userId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const loadedProfiles = [];
        querySnapshot.forEach((doc) => {
          loadedProfiles.push({ id: doc.id, ...doc.data() });
        });
        setProfiles(loadedProfiles);
      } catch (error) {
        console.error('Error loading profiles:', error);
      }
    };
    
    setIsClient(true);
    validateApiKey();
    loadProfiles();
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (isClient && notes !== undefined) {
      localStorage.setItem("outreachNotes", notes);
    }
  }, [notes, isClient]);
  
  // Save include notes preference
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("includeNotesInGeneration", includeNotesInGeneration.toString());
    }
  }, [includeNotesInGeneration, isClient]);

  const validateApiKey = async () => {
    const key = localStorage.getItem('anthropicKey');
    if (!key) {
      setApiKeyStatus('invalid');
      return;
    }

    if (!key.startsWith('sk-')) {
      setApiKeyStatus('invalid');
      return;
    }

    setApiKeyStatus('validating');
    setIsValidatingKey(true);

    // Simulate API validation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setApiKeyStatus('valid');
    setIsValidatingKey(false);
  };

  const getStatusMessage = () => {
    switch (apiKeyStatus) {
      case 'validating':
        return (
          <div className="flex items-center gap-2 text-blue-500 text-xs sm:text-sm">
            <Loader size={20} className="animate-spin" />
            Please wait validating API key...
          </div>
        );
      case 'invalid':
        return (
          <div className="flex items-center gap-2 text-red-500 text-xs sm:text-sm">
            <InfoIcon size={20} />
            Claude API key appears invalid - please add a valid key in settings.
          </div>
        );
      default:
        return null;
    }
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'twitter':
        return <AtSign size={16} />;
      case 'linkedin':
        return <Linkedin size={16} />;
      case 'email':
        return <Mail size={16} />;
      default:
        return <MessageCircle size={16} />;
    }
  };

  const generateMessage = async () => {
    if (!userContext.trim()) {
      toast.error("Please provide context about the recipient");
      return;
    }
    
    setIsGenerating(true);
    try {
      // System prompt based on selected preferences
      const systemPrompt = getSystemPrompt();
      
      // Create enhanced user content including notes if enabled
      let userContent = `Generate a ${messageLength} ${messageType} message for ${platform} based on this context about the recipient: "${userContext}"`;
      userContent += `. The goal is ${goal}.`;
      
      // Add notes as additional instructions if enabled
      if (includeNotesInGeneration && notes.trim()) {
        userContent += `\n\nAdditional instructions or context for generating this message: "${notes.trim()}"`;
      }
      
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': localStorage.getItem('anthropicKey')
        },
        body: JSON.stringify({
          temperature: 0.7,
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: userContent
          }],
          system: systemPrompt,
          model: "claude-3-5-sonnet-20241022",
          claudapikey: getAnthropicKey()
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setGeneratedMessage(data.content[0].text);
    } catch (error) {
      console.error('Error generating message:', error);
      toast.error(`Failed to generate message: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getSystemPrompt = () => {
    // Base prompt that applies to all platforms
    let prompt = `You are an expert outreach message writer who specializes in creating personalized, effective messages for ${platform}.

Your task is to craft a ${messageLength} message in a ${tone} tone with the goal of ${goal}.
The message type is: ${messageType}.

Guidelines for your message:
- Be concise and respectful of the recipient's time
- Personalize the message based on the context provided
- Avoid generic language that feels like a template
- Make a clear connection between the sender and recipient
- Include a specific, low-friction call to action
- Write in a natural, conversational style
- Focus on value for the recipient, not just what you want
- Don't use emojis unless specifically requested

${trainingData ? `Here is Training Data about me and my products/services to incorporate naturally in the message:\n${trainingData}\n` : ""}
`;

    // Platform-specific additions
    switch (platform) {
      case 'twitter':
        prompt += `
For Twitter/X DMs:
- Keep it ultra-concise (max 280 characters is ideal)
- Be casual but professional
- Get to the point immediately
- Use a friendly, conversational tone
- Make it easy to respond to
- Don't use hashtags in DMs
`;
        break;
      case 'linkedin':
        prompt += `
For LinkedIn messages:
- Maintain professional language while being personable
- Reference specific aspects of their profile or content
- Establish credibility and relevant connection points
- Be respectful of professional boundaries
- Keep paragraphs short (1-2 sentences)
- Avoid sales-focused language
`;
        break;
      case 'email':
        prompt += `
For Email outreach:
- Include a clear, specific subject line
- Use a proper greeting
- Keep paragraphs short and scannable
- End with a specific, actionable next step
- Include a professional sign-off
- Format the email properly with subject line on the first line
`;
        break;
    }

    // Message type specific additions
    switch (messageType) {
      case 'cold_outreach':
        prompt += `
For cold outreach:
- Be extra respectful of their time
- Make it crystal clear why you're reaching out specifically to them
- Demonstrate you've done your homework
- Keep it shorter than you think necessary
- One clear ask only
`;
        break;
      case 'follow_up':
        prompt += `
For follow-up messages:
- Reference previous interaction specifically
- Be brief and to the point
- Provide a compelling reason for the follow-up
- Add new value in each follow-up
- Be patient and respectful
`;
        break;
      case 'networking':
        prompt += `
For networking messages:
- Focus on mutual interests or connections
- Be specific about why you want to connect
- Mention how you discovered them
- Express genuine interest in their work
- Suggest a low-friction way to start the conversation
`;
        break;
    }

    return prompt;
  };

  const copyToClipboard = () => {
    if (!generatedMessage) return;
    
    navigator.clipboard.writeText(generatedMessage)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Message copied to clipboard!");
      })
      .catch(err => {
        console.error('Failed to copy message:', err);
        toast.error("Failed to copy message");
      });
  };

  // Handle profile selection
  const handleProfileSelect = (profileId) => {
    setSelectedProfile(profileId);
    const selectedProfileData = profiles.find(p => p.id === profileId);
    if (selectedProfileData && selectedProfileData.trainingData) {
      setTrainingData(selectedProfileData.trainingData);
    }
  };

  // Clear notes
  const clearNotes = () => {
    if (window.confirm("Are you sure you want to clear your notes?")) {
      setNotes('');
      localStorage.removeItem("outreachNotes");
      toast.success("Notes cleared successfully");
    }
  };

  if (!isClient) {
    return <div>Loading agent...</div>;
  }

  return (
    <div className="bg-white rounded-md overflow-hidden p-4">
      <div className="p-2 sm:p-4 border-gray-400 mb-2 sm:mb-4">
        <div className='bg-white rounded-md p-2 sm:p-4'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-4'>
            <div className='grid gap-2'>
              <h1 className="text-lg sm:text-xl font-bold text-blue-500 mb-2 sm:mb-0">Outreach Message Generator</h1>
              {getStatusMessage()}
            </div>
          </div>
          
          {/* Platform Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setPlatform('twitter')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  platform === 'twitter' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <AtSign size={16} className="mr-2" /> Twitter/X
              </button>
              <button
                onClick={() => setPlatform('linkedin')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  platform === 'linkedin' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Linkedin size={16} className="mr-2" /> LinkedIn
              </button>
              <button
                onClick={() => setPlatform('email')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  platform === 'email' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Mail size={16} className="mr-2" /> Email
              </button>
            </div>
          </div>
          
          {/* Configuration Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="cold_outreach">Cold Outreach</option>
                <option value="follow_up">Follow-up</option>
                <option value="networking">Networking</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="respectful">Respectful</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="partnership">Partnership</option>
                <option value="meeting">Schedule a Meeting</option>
                <option value="advice">Ask for Advice</option>
                <option value="sales">Sales Opportunity</option>
                <option value="connection">Connect</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
              <select
                value={messageLength}
                onChange={(e) => setMessageLength(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="very_short">Very Short (1-2 sentences)</option>
                <option value="short">Short (3-4 sentences)</option>
                <option value="medium">Medium (5-7 sentences)</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>
          

          {/* Recipient Context */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User size={16} className="mr-2" /> Recipient Context
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
              placeholder="Paste information about the recipient here (profile bio, recent posts, articles, etc.)"
              rows={6}
            />
          </div>
          

          {/* Notes Section */}
          <div className="mb-4">
            <div 
              className="flex items-center justify-between cursor-pointer p-2 bg-yellow-50 rounded-t-md border border-yellow-200"
              onClick={() => setIsNotesExpanded(!isNotesExpanded)}
            >
              <div className="flex items-center gap-2 text-yellow-700">
                <StickyNote size={16} />
                <span className="font-medium">Personal Notes</span>
                <span className="text-xs text-yellow-600">(saved locally)</span>
              </div>
              <div className="text-yellow-600">
                {isNotesExpanded ? '−' : '+'}
              </div>
            </div>
            
            {isNotesExpanded && (
              <div className="border border-t-0 border-yellow-200 rounded-b-md p-2">
                <textarea
                  className="w-full p-2 border border-yellow-100 rounded-md bg-white focus:ring-yellow-500 focus:border-yellow-500 min-h-24"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your personal notes here. These will be saved locally and won't be lost when you refresh the page."
                  rows={4}
                />
                <div className="flex justify-between mt-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeNotes"
                      checked={includeNotesInGeneration}
                      onChange={(e) => setIncludeNotesInGeneration(e.target.checked)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includeNotes" className="text-sm text-gray-700">
                      Use notes as additional instructions for message generation
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={clearNotes}
                      className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-md hover:bg-red-100"
                      title="Clear notes"
                    >
                      <Trash2 size={14} /> Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          

          {/* Generate Button */}
          {/* Training Data & Profile Selection */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <button
              onClick={() => setIsTrainingPopupOpen(true)}
              className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-md"
            >
              <Database size={16} /> Select Profile
            </button>
            
            {selectedProfile && profiles.find(p => p.id === selectedProfile) && (
              <div className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-md">
                <User size={16} className="mr-2" />
                <span>Using profile: {profiles.find(p => p.id === selectedProfile).name}</span>
              </div>
            )}
            
            <div className="flex justify-end">
              {(apiKeyStatus === 'valid' || apiKeyStatus === 'validating') && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
                  onClick={generateMessage}
                  disabled={isGenerating || apiKeyStatus === 'validating' || !userContext.trim()}
                >
                  {isGenerating ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Wand2 size={16} />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate Message'}
                </button>
              )}
            </div>
          </div>

          
          
          {/* Profile Selection Modal */}
          {isTrainingPopupOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-md p-4 sm:p-6 w-80 sm:w-96 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Select Profile</h2>
                  <button 
                    onClick={() => setIsTrainingPopupOpen(false)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Select a profile to personalize your outreach messages with your information and style.
                  </p>
                  
                  {profiles.length === 0 ? (
                    <div className="text-center p-4 bg-gray-100 rounded-md">
                      <p className="text-gray-500">No profiles found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {profiles.map((profile) => (
                        <div 
                          key={profile.id}
                          onClick={() => {
                            handleProfileSelect(profile.id);
                            setIsTrainingPopupOpen(false);
                          }}
                          className={`p-3 rounded-md cursor-pointer flex items-center ${
                            selectedProfile === profile.id 
                              ? 'bg-blue-100 border border-blue-300' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <User size={18} className="mr-2 text-blue-500" />
                          <div>
                            <div className="font-medium">{profile.name}</div>
                            {profile.description && (
                              <div className="text-xs text-gray-500">{profile.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsTrainingPopupOpen(false)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Generated Message Output */}
          {generatedMessage && (
            <div className="border rounded-md p-4 bg-white relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getPlatformIcon()}
                  <span className="ml-2 text-sm font-medium capitalize">
                    {platform} {messageType.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="text-gray-500 hover:text-blue-500"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div className="whitespace-pre-wrap text-gray-800">
                {generatedMessage}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutreachAgent;