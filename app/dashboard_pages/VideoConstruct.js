"use client"

import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  X,
  Wand2,
  Loader,
  ArrowLeft,
  ArrowRight,
  Circle,
  CircleCheckBig,
  Blocks,
  BicepsFlexed,
  Download,
  Timer,
  Video,
  UserCircle2,
  Settings,
  Camera,
  FileVideo,
  Mic,
  SwitchCamera,
  Image,
  Eye,
  EyeOff
} from 'lucide-react';
import { getAnthropicKey } from '../Utils/getApikey';

// Video Style Prompts
const VIDEO_STYLE_PROMPTS = {
  standard: (videoType, screenSize, toolSettings, contentMood, contentType, includeProduct, overallPrompt) => `
    You are an expert video creator specializing in creating engaging content...

You are an expert video creator specializing in creating engaging content. Create a ${videoType} video script optimized for ${SCREEN_SIZES[screenSize].name} format.

Base concept:
${overallPrompt}

Tools Configuration:
- AI Visuals (Runway): ${toolSettings.AI_VISUALS ? 'Available for generating visual scenes' : 'Not Available'}
- Avatar/Presence: ${toolSettings.AVATAR ? 'Available with following options' : 'Not Available'}
  ${toolSettings.AVATAR ? `
  • Direct Recording: Simple, achievable actions for creator recording
  • AI Avatar: Digital avatar performance instructions
  • Video Transform: Style transfer guidelines` : ''}
- AI Audio: ${toolSettings.AI_AUDIO ? 'Available for voice generation' : 'Not Available'}

    Video Specifications:
    - Format: ${SCREEN_SIZES[screenSize].name} (${SCREEN_SIZES[screenSize].aspectRatio})
    - Style: ${contentMood}, ${contentType}
    - Duration: ${videoType} format (${numberOfScenes} scenes)
${includeProduct ? '- Include natural product/brand integration' : ''}

For each scene, provide:
1. DESCRIPTION: Clear scene content and action
2. FRAME_TYPE: Either AI_VISUAL or AVATAR
3. VISUAL: 
   - For AI_VISUAL: Detailed visual generation prompts for Runway
   - For AVATAR: Clear, achievable actions based on avatar type
4. VOICE: Voice direction and script${toolSettings.AI_AUDIO ? ' (for AI generation)' : ''}

Format each scene as:
SCENE [NUMBER]
DESCRIPTION: [Content]
FRAME_TYPE: [Type]
VISUAL: [Direction]
VOICE: [Script]

Important Guidelines:
- For AI visuals: Focus on clear, detailed visual descriptions
- For recorded actions: Keep them simple and achievable
- For AI avatar: Focus on natural expressions and movements
- For voice: Clear, emotionally appropriate delivery
- Ensure smooth transitions between scenes
- Maintain consistent style and pacing

    // Your existing standard prompt here
  `,

  viral_ad: (videoType, screenSize, toolSettings, contentMood, contentType, includeProduct, overallPrompt) => `
    You are a viral marketing expert specializing in creating attention-grabbing, humorous infomercial-style content...

You are an expert video creator specializing in creating engaging content. Create a ${videoType} video script optimized for ${SCREEN_SIZES[screenSize].name} format.

Base concept:
${overallPrompt}

Tools Configuration:
- AI Visuals (Runway): ${toolSettings.AI_VISUALS ? 'Available for generating visual scenes' : 'Not Available'}
- Avatar/Presence: ${toolSettings.AVATAR ? 'Available with following options' : 'Not Available'}
  ${toolSettings.AVATAR ? `
  • Direct Recording: Simple, achievable actions for creator recording
  • AI Avatar: Digital avatar performance instructions
  • Video Transform: Style transfer guidelines` : ''}
- AI Audio: ${toolSettings.AI_AUDIO ? 'Available for voice generation' : 'Not Available'}

    Video Specifications:
    - Format: ${SCREEN_SIZES[screenSize].name} (${SCREEN_SIZES[screenSize].aspectRatio})
    - Style: ${contentMood}, ${contentType}
    - Duration: ${videoType} format (${numberOfScenes} scenes)
${includeProduct ? '- Include natural product/brand integration' : ''}

For each scene, provide:
1. DESCRIPTION: Clear scene content and action
2. FRAME_TYPE: Either AI_VISUAL or AVATAR
3. VISUAL: 
   - For AI_VISUAL: Detailed visual generation prompts for Runway
   - For AVATAR: Clear, achievable actions based on avatar type
4. VOICE: Voice direction and script${toolSettings.AI_AUDIO ? ' (for AI generation)' : ''}

Format each scene as:
SCENE [NUMBER]
DESCRIPTION: [Content]
FRAME_TYPE: [Type]
VISUAL: [Direction]
VOICE: [Script]

Important Guidelines:
- For AI visuals: Focus on clear, detailed visual descriptions
- For recorded actions: Keep them simple and achievable
- For AI avatar: Focus on natural expressions and movements
- For voice: Clear, emotionally appropriate delivery
- Ensure smooth transitions between scenes
- Maintain consistent style and pacing

    // Your Dollar Shave Club style prompt here
  `,

  movie_remix: (videoType, screenSize, toolSettings, contentMood, contentType, includeProduct) => `
    You are a creative director specializing in reimagining classic movie scenes...

You are an expert video creator specializing in creating engaging content. Create a ${videoType} video script optimized for ${SCREEN_SIZES[screenSize].name} format.

Base concept:
${overallPrompt}

Tools Configuration:
- AI Visuals (Runway): ${toolSettings.AI_VISUALS ? 'Available for generating visual scenes' : 'Not Available'}
- Avatar/Presence: ${toolSettings.AVATAR ? 'Available with following options' : 'Not Available'}
  ${toolSettings.AVATAR ? `
  • Direct Recording: Simple, achievable actions for creator recording
  • AI Avatar: Digital avatar performance instructions
  • Video Transform: Style transfer guidelines` : ''}
- AI Audio: ${toolSettings.AI_AUDIO ? 'Available for voice generation' : 'Not Available'}

    Video Specifications:
    - Format: ${SCREEN_SIZES[screenSize].name} (${SCREEN_SIZES[screenSize].aspectRatio})
    - Style: ${contentMood}, ${contentType}
    - Duration: ${videoType} format (${numberOfScenes} scenes)
${includeProduct ? '- Include natural product/brand integration' : ''}

For each scene, provide:
1. DESCRIPTION: Clear scene content and action
2. FRAME_TYPE: Either AI_VISUAL or AVATAR
3. VISUAL: 
   - For AI_VISUAL: Detailed visual generation prompts for Runway
   - For AVATAR: Clear, achievable actions based on avatar type
4. VOICE: Voice direction and script${toolSettings.AI_AUDIO ? ' (for AI generation)' : ''}

Format each scene as:
SCENE [NUMBER]
DESCRIPTION: [Content]
FRAME_TYPE: [Type]
VISUAL: [Direction]
VOICE: [Script]

Important Guidelines:
- For AI visuals: Focus on clear, detailed visual descriptions
- For recorded actions: Keep them simple and achievable
- For AI avatar: Focus on natural expressions and movements
- For voice: Clear, emotionally appropriate delivery
- Ensure smooth transitions between scenes
- Maintain consistent style and pacing

    // Your movie remix prompt here
  `,

  youtuber: (videoType, screenSize, toolSettings, contentMood, contentType, includeProduct) => `
    You are a successful educational YouTuber known for making complex topics engaging...

You are an expert video creator specializing in creating engaging content. Create a ${videoType} video script optimized for ${SCREEN_SIZES[screenSize].name} format.

Base concept:
${overallPrompt}

Tools Configuration:
- AI Visuals (Runway): ${toolSettings.AI_VISUALS ? 'Available for generating visual scenes' : 'Not Available'}
- Avatar/Presence: ${toolSettings.AVATAR ? 'Available with following options' : 'Not Available'}
  ${toolSettings.AVATAR ? `
  • Direct Recording: Simple, achievable actions for creator recording
  • AI Avatar: Digital avatar performance instructions
  • Video Transform: Style transfer guidelines` : ''}
- AI Audio: ${toolSettings.AI_AUDIO ? 'Available for voice generation' : 'Not Available'}

    Video Specifications:
    - Format: ${SCREEN_SIZES[screenSize].name} (${SCREEN_SIZES[screenSize].aspectRatio})
    - Style: ${contentMood}, ${contentType}
    - Duration: ${videoType} format (${numberOfScenes} scenes)
${includeProduct ? '- Include natural product/brand integration' : ''}

For each scene, provide:
1. DESCRIPTION: Clear scene content and action
2. FRAME_TYPE: Either AI_VISUAL or AVATAR
3. VISUAL: 
   - For AI_VISUAL: Detailed visual generation prompts for Runway
   - For AVATAR: Clear, achievable actions based on avatar type
4. VOICE: Voice direction and script${toolSettings.AI_AUDIO ? ' (for AI generation)' : ''}

Format each scene as:
SCENE [NUMBER]
DESCRIPTION: [Content]
FRAME_TYPE: [Type]
VISUAL: [Direction]
VOICE: [Script]

Important Guidelines:
- For AI visuals: Focus on clear, detailed visual descriptions
- For recorded actions: Keep them simple and achievable
- For AI avatar: Focus on natural expressions and movements
- For voice: Clear, emotionally appropriate delivery
- Ensure smooth transitions between scenes
- Maintain consistent style and pacing

    // Your YouTuber style prompt here
  `,

  how_to: (videoType, screenSize, toolSettings, contentMood, contentType, includeProduct) => `
    You are a technical instruction specialist creating clear, step-by-step tutorial content...

You are an expert video creator specializing in creating engaging content. Create a ${videoType} video script optimized for ${SCREEN_SIZES[screenSize].name} format.

Base concept:
${overallPrompt}

Tools Configuration:
- AI Visuals (Runway): ${toolSettings.AI_VISUALS ? 'Available for generating visual scenes' : 'Not Available'}
- Avatar/Presence: ${toolSettings.AVATAR ? 'Available with following options' : 'Not Available'}
  ${toolSettings.AVATAR ? `
  • Direct Recording: Simple, achievable actions for creator recording
  • AI Avatar: Digital avatar performance instructions
  • Video Transform: Style transfer guidelines` : ''}
- AI Audio: ${toolSettings.AI_AUDIO ? 'Available for voice generation' : 'Not Available'}

    Video Specifications:
    - Format: ${SCREEN_SIZES[screenSize].name} (${SCREEN_SIZES[screenSize].aspectRatio})
    - Style: ${contentMood}, ${contentType}
    - Duration: ${videoType} format (${numberOfScenes} scenes)
${includeProduct ? '- Include natural product/brand integration' : ''}

For each scene, provide:
1. DESCRIPTION: Clear scene content and action
2. FRAME_TYPE: Either AI_VISUAL or AVATAR
3. VISUAL: 
   - For AI_VISUAL: Detailed visual generation prompts for Runway
   - For AVATAR: Clear, achievable actions based on avatar type
4. VOICE: Voice direction and script${toolSettings.AI_AUDIO ? ' (for AI generation)' : ''}

Format each scene as:
SCENE [NUMBER]
DESCRIPTION: [Content]
FRAME_TYPE: [Type]
VISUAL: [Direction]
VOICE: [Script]

Important Guidelines:
- For AI visuals: Focus on clear, detailed visual descriptions
- For recorded actions: Keep them simple and achievable
- For AI avatar: Focus on natural expressions and movements
- For voice: Clear, emotionally appropriate delivery
- Ensure smooth transitions between scenes
- Maintain consistent style and pacing

    // Your how-to prompt here
  `,

  feature_drop: (videoType, screenSize, toolSettings, contentMood, contentType, includeProduct) => `
    You are a product marketing specialist creating hype-building feature announcement videos...

You are an expert video creator specializing in creating engaging content. Create a ${videoType} video script optimized for ${SCREEN_SIZES[screenSize].name} format.

Base concept:
${overallPrompt}

Tools Configuration:
- AI Visuals (Runway): ${toolSettings.AI_VISUALS ? 'Available for generating visual scenes' : 'Not Available'}
- Avatar/Presence: ${toolSettings.AVATAR ? 'Available with following options' : 'Not Available'}
  ${toolSettings.AVATAR ? `
  • Direct Recording: Simple, achievable actions for creator recording
  • AI Avatar: Digital avatar performance instructions
  • Video Transform: Style transfer guidelines` : ''}
- AI Audio: ${toolSettings.AI_AUDIO ? 'Available for voice generation' : 'Not Available'}

    Video Specifications:
    - Format: ${SCREEN_SIZES[screenSize].name} (${SCREEN_SIZES[screenSize].aspectRatio})
    - Style: ${contentMood}, ${contentType}
    - Duration: ${videoType} format (${numberOfScenes} scenes)
${includeProduct ? '- Include natural product/brand integration' : ''}

For each scene, provide:
1. DESCRIPTION: Clear scene content and action
2. FRAME_TYPE: Either AI_VISUAL or AVATAR
3. VISUAL: 
   - For AI_VISUAL: Detailed visual generation prompts for Runway
   - For AVATAR: Clear, achievable actions based on avatar type
4. VOICE: Voice direction and script${toolSettings.AI_AUDIO ? ' (for AI generation)' : ''}

Format each scene as:
SCENE [NUMBER]
DESCRIPTION: [Content]
FRAME_TYPE: [Type]
VISUAL: [Direction]
VOICE: [Script]

Important Guidelines:
- For AI visuals: Focus on clear, detailed visual descriptions
- For recorded actions: Keep them simple and achievable
- For AI avatar: Focus on natural expressions and movements
- For voice: Clear, emotionally appropriate delivery
- Ensure smooth transitions between scenes
- Maintain consistent style and pacing

    // Your feature drop prompt here
  `
};

// Video Styles Configuration
const VIDEO_STYLES = {
  STANDARD: {
    name: 'Standard Video',
    description: 'Classic video format with flexible structure',
    value: 'standard'
  },
  VIRAL_AD: {
    name: 'Dollar Shave Club Style',
    description: 'Witty, direct-to-camera viral marketing style',
    value: 'viral_ad'
  },
  MOVIE_REMIX: {
    name: 'Movie Scene Remix',
    description: 'Creative adaptation of famous movie scenes',
    value: 'movie_remix'
  },
  YOUTUBER: {
    name: 'Informative YouTuber',
    description: 'Educational content with high engagement',
    value: 'youtuber'
  },
  HOW_TO: {
    name: 'How-To Guide',
    description: 'Clear step-by-step instructions and tutorials',
    value: 'how_to'
  },
  FEATURE_DROP: {
    name: 'Feature Announcement',
    description: 'Exciting product/feature reveal videos',
    value: 'feature_drop'
  }
};

// Tool Settings
const TOOL_SETTINGS = {
  AI_VISUALS: {
    name: 'AI Visuals',
    description: 'Generate scenes using Runway',
    enabled: true,
    icon: Camera
  },
  AVATAR: {
    name: 'Avatar/Presence',
    description: 'Your presence in the video',
    enabled: true,
    icon: UserCircle2,
    types: {
      RECORDED: {
        name: 'Direct Recording',
        description: 'Simple, achievable recording instructions',
        icon: FileVideo
      },
      AI_AVATAR: {
        name: 'AI Generated Avatar',
        description: 'Controlled digital avatar performance',
        icon: UserCircle2
      },
      VID_TO_VID: {
        name: 'Video Transform',
        description: 'Transform recorded video into new style',
        icon: SwitchCamera
      }
    }
  },
  AI_AUDIO: {
    name: 'AI Audio',
    description: 'Generate voice using AI',
    enabled: true,
    icon: Mic
  }
};

// Frame Types
const FRAME_TYPES = {
  AI_VISUAL: 'ai_visual',
  AVATAR: 'avatar'
};

// Screen Sizes Configuration
const SCREEN_SIZES = {
  HORIZONTAL: {
    name: 'Horizontal (YouTube/Web)',
    dimensions: '1920x1080',
    aspectRatio: '16:9',
    description: 'Desktop Video'
  },
  VERTICAL: {
    name: 'Vertical (TikTok/Shorts)',
    dimensions: '1080x1920',
    aspectRatio: '9:16',
    description: 'Short-form'
  },
  SQUARE: {
    name: 'Square (Instagram)',
    dimensions: '1080x1080',
    aspectRatio: '1:1',
    description: 'Social Feeds'
  },
  WIDE: {
    name: 'Ultra-Wide',
    dimensions: '2560x1080',
    aspectRatio: '21:9',
    description: 'Cinematic'
  }
};

// Initial Scene Configuration
const INITIAL_SCENE = {
  id: Date.now(),
  content: '',
  type: 'scene',
  frameType: FRAME_TYPES.AI_VISUAL,
  avatarType: TOOL_SETTINGS.AVATAR.types.AI_AVATAR.name,
  aiPrompts: {
    runwayPrompt: '',
    avatarPrompt: '',
    voicePrompt: ''
  },
  duration: '5',
  key: Date.now(),
  previewUrl: 'https://placehold.co/1920x1080.mp4/808080/FFFFFF?text=New+Scene'
};

// Toggle Switch Component
const Toggle = ({ enabled, onToggle, size = 'default' }) => {
  const baseStyles = "relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
  const sizeStyles = size === 'small' ? 'h-5 w-9' : 'h-6 w-11';
  const thumbSizeStyles = size === 'small' ? 'h-4 w-4' : 'h-5 w-5';
  const translateStyles = size === 'small' ? 'translate-x-4' : 'translate-x-5';

  return (
    <button
      type="button"
      className={`${baseStyles} ${sizeStyles} ${enabled ? 'bg-blue-500' : 'bg-gray-200'}`}
      onClick={onToggle}
    >
      <span className="sr-only">Toggle</span>
      <span
        className={`${thumbSizeStyles} inline-block transform rounded-full bg-white transition-transform
          ${enabled ? translateStyles : 'translate-x-1'}`}
      />
    </button>
  );
};

// Frame Type Toggle Component
const FrameToggle = ({ isAvatar, onToggle, className = "" }) => {
  return (
    <div className={`relative inline-flex items-center rounded-full p-1 bg-gray-100 ${className}`}>
      <button
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${!isAvatar ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        onClick={() => onToggle(false)}
      >
        <Image size={16} />
        <span className="text-sm font-medium">Visual</span>
      </button>
      <button
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${isAvatar ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        onClick={() => onToggle(true)}
      >
        <UserCircle2 size={16} />
        <span className="text-sm font-medium">Avatar</span>
      </button>
    </div>
  );
};

// Settings Dialog Component
const SettingsDialog = ({ show, onClose, toolSettings, setToolSettings, playSound, toggleSound, defaultAvatarType, setDefaultAvatarType }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg w-full max-w-md mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-6">Video Creation Settings</h2>

        <div className="space-y-6">
          {/* AI Visuals Setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-blue-500" />
                <h4 className="font-medium">{TOOL_SETTINGS.AI_VISUALS.name}</h4>
              </div>
              <p className="text-sm text-gray-500">{TOOL_SETTINGS.AI_VISUALS.description}</p>
            </div>
            <Toggle
              enabled={toolSettings.AI_VISUALS}
              onToggle={() => {
                setToolSettings(prev => ({ ...prev, AI_VISUALS: !prev.AI_VISUALS }));
                playSound(toggleSound);
              }}
            />
          </div>

          {/* Avatar Setting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UserCircle2 size={18} className="text-blue-500" />
                  <h4 className="font-medium">{TOOL_SETTINGS.AVATAR.name}</h4>
                </div>
                <p className="text-sm text-gray-500">{TOOL_SETTINGS.AVATAR.description}</p>
              </div>
              <Toggle
                enabled={toolSettings.AVATAR}
                onToggle={() => {
                  setToolSettings(prev => ({ ...prev, AVATAR: !prev.AVATAR }));
                  playSound(toggleSound);
                }}
              />
            </div>

            {toolSettings.AVATAR && (
              <div className="pl-7">
                <select
                  value={defaultAvatarType}
                  onChange={(e) => setDefaultAvatarType(e.target.value)}
                  className="w-full p-2 text-sm border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(TOOL_SETTINGS.AVATAR.types).map((type) => (
                    <option key={type.name} value={type.name}>
                      {type.name} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* AI Audio Setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mic size={18} className="text-blue-500" />
                <h4 className="font-medium">{TOOL_SETTINGS.AI_AUDIO.name}</h4>
              </div>
              <p className="text-sm text-gray-500">{TOOL_SETTINGS.AI_AUDIO.description}</p>
            </div>
            <Toggle
              enabled={toolSettings.AI_AUDIO}
              onToggle={() => {
                setToolSettings(prev => ({ ...prev, AI_AUDIO: !prev.AI_AUDIO }));
                playSound(toggleSound);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const VideoScriptConstructor = ({ onConfigureTrainingData }) => {
  // Core States
  const [overallPrompt, setOverallPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeProduct, setIncludeProduct] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [isBrowser, setIsBrowser] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [videoStyle, setVideoStyle] = useState('standard');

  // Tool Settings State
  const [toolSettings, setToolSettings] = useState({
    AI_VISUALS: true,
    AVATAR: true,
    AI_AUDIO: true
  });

  // Video Configuration States
  const [videoType, setVideoType] = useState('short');
  const [contentMood, setContentMood] = useState('engaging');
  const [contentType, setContentType] = useState('educational');
  const [screenSize, setScreenSize] = useState('HORIZONTAL');
  const [scenes, setScenes] = useState([INITIAL_SCENE]);
  const [currentScene, setCurrentScene] = useState(0);
  const [defaultAvatarType, setDefaultAvatarType] = useState(TOOL_SETTINGS.AVATAR.types.AI_AVATAR.name);

  // Sound Effects
  const receivedSound = isBrowser ? new Audio('https://dazzling-cat.netlify.app/recievedmsg.mp3') : null;
  const sentSound = isBrowser ? new Audio('https://dazzling-cat.netlify.app/sendmsg1.mp3') : null;
  const toggleSound = isBrowser ? new Audio('https://dazzling-cat.netlify.app/sendmsg2.mp3') : null;

  // Effect Hooks
  useEffect(() => {
    setIsBrowser(true);
    const storedProductInfo = localStorage.getItem('productQuestionnaire');
    if (storedProductInfo) {
      setProductInfo(JSON.parse(storedProductInfo));
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsAuthChecking(true);
        const key = localStorage.getItem('anthropicKey');
        console.log('Retrieved key:', key ? 'exists' : 'not found');
        const isValid = key && key.startsWith('sk-');
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (scenes.length > 0 && currentScene >= scenes.length) {
      setCurrentScene(scenes.length - 1);
    }
  }, [scenes.length, currentScene]);

  // Utility Functions
  const playSound = (sound) => {
    if (isBrowser && sound) {
      sound.play().catch(error => console.error('Error playing sound:', error));
    }
  };

  const getCurrentScene = () => {
    if (!scenes.length || currentScene < 0 || currentScene >= scenes.length) {
      return INITIAL_SCENE;
    }
    return scenes[currentScene];
  };

  const getPromptPlaceholder = (frameType, avatarType) => {
    if (frameType === FRAME_TYPES.AI_VISUAL) {
      return "Describe the visual scene in detail including:\n- Composition and framing\n- Camera movements\n- Lighting and mood\n- Visual effects and transitions\n- Key elements and their placement";
    }

    switch (avatarType) {
      case TOOL_SETTINGS.AVATAR.types.RECORDED.name:
        return "Describe a simple, easy-to-record action for the creator:\n- Basic pose or position\n- Simple movements or gestures\n- Expression and emotion\n- Consider lighting and background";
      case TOOL_SETTINGS.AVATAR.types.AI_AVATAR.name:
        return "Describe the AI avatar's performance:\n- Expression and emotions\n- Gestures and body language\n- Speaking style and mannerisms\n- Position in frame";
      case TOOL_SETTINGS.AVATAR.types.VID_TO_VID.name:
        return "Describe the transformation settings:\n- Target style or character\n- Desired movements and expressions\n- Key features to maintain\n- Visual style preferences";
      default:
        return "Describe the scene direction...";
    }
  };

  const getPreviewUrl = (scene, index) => {
    const dimensions = SCREEN_SIZES[screenSize].dimensions;
    const bgColor = generateColorCode(index);
    const text = encodeURIComponent(scene.content.slice(0, 30));
    return `https://placehold.co/${dimensions}.mp4/${bgColor}/FFFFFF?text=${text}`;
  };

  const generateColorCode = (index) => {
    const colors = [
      '2E5090', // Professional blue
      '206040', // Rich green
      '904090', // Purple
      'CC5500', // Burnt orange
      '4A4A4A', // Dark gray
      '808080', // Medium gray
      '1E90FF', // Bright blue
      '228B22', // Forest green
      '8B008B', // Dark magenta
      'CD853F', // Peru
    ];
    return colors[index % colors.length];
  };

  const extractContent = (block, section) => {
    const regex = new RegExp(`${section}:(.+?)(?=DESCRIPTION:|FRAME_TYPE:|VISUAL:|VOICE:|$)`, 's');
    const match = block.match(regex);
    return match ? match[1].trim() : '';
  };

  // Scene Management Functions
  const addNewScene = () => {
    setScenes(prev => [...prev, {
      ...INITIAL_SCENE,
      id: Date.now(),
      key: Date.now(),
      avatarType: defaultAvatarType,
      previewUrl: getPreviewUrl({ content: 'New Scene' }, scenes.length)
    }]);
  };

  const removeScene = (id) => {
    if (scenes.length > 1) {
      setScenes(prev => prev.filter(scene => scene.id !== id));
      if (currentScene >= scenes.length - 1) {
        setCurrentScene(scenes.length - 2);
      }
    }
  };

  const updateSceneContent = (id, content) => {
    setScenes(prev => prev.map(scene =>
      scene.id === id ? {
        ...scene,
        content,
        previewUrl: getPreviewUrl({ ...scene, content }, prev.findIndex(s => s.id === id))
      } : scene
    ));
  };

  const toggleFrameType = (id, frameType) => {
    setScenes(prev => prev.map(scene =>
      scene.id === id ? {
        ...scene,
        frameType
      } : scene
    ));
  };

  const updateAvatarType = (id, type) => {
    setScenes(prev => prev.map(scene =>
      scene.id === id ? {
        ...scene,
        avatarType: type
      } : scene
    ));
  };

  const updateAIPrompt = (id, tool, prompt) => {
    setScenes(prev => prev.map(scene =>
      scene.id === id ? {
        ...scene,
        aiPrompts: { ...scene.aiPrompts, [tool]: prompt }
      } : scene
    ));
  };

  // Export Formatted Script
  const exportFormattedScript = () => {
    let scriptText = `VIDEO SCRIPT: ${overallPrompt}\n\n`;
    scriptText += `FORMAT & SETTINGS\n`;
    scriptText += `----------------\n`;
    scriptText += `Format: ${SCREEN_SIZES[screenSize].name} (${SCREEN_SIZES[screenSize].aspectRatio})\n`;
    scriptText += `Type: ${videoType}\n`;
    scriptText += `Mood: ${contentMood}\n`;
    scriptText += `Content Style: ${contentType}\n`;
    scriptText += `Total Duration: ${scenes.reduce((acc, scene) => acc + parseInt(scene.duration), 0)}s\n\n`;

    scriptText += `ENABLED TOOLS\n`;
    scriptText += `-------------\n`;
    scriptText += `□ AI Visuals: ${toolSettings.AI_VISUALS ? '✓' : '×'}\n`;
    scriptText += `□ Avatar/Presence: ${toolSettings.AVATAR ? '✓' : '×'}\n`;
    scriptText += `□ AI Audio: ${toolSettings.AI_AUDIO ? '✓' : '×'}\n\n`;

    scriptText += `SCENE BREAKDOWN\n`;
    scriptText += `---------------\n\n`;

    scenes.forEach((scene, index) => {
      scriptText += `SCENE ${index + 1} [${scene.duration}s]\n`;
      scriptText += `==========${`=`.repeat(String(index + 1).length)}=\n`;
      scriptText += `Frame Type: ${scene.frameType === FRAME_TYPES.AI_VISUAL ? 'AI Visual Scene' : 'Avatar Scene'}\n`;
      if (scene.frameType === FRAME_TYPES.AVATAR) {
        scriptText += `Avatar Type: ${scene.avatarType}\n`;
      }
      scriptText += `\nDescription:\n${scene.content}\n\n`;

      if (scene.frameType === FRAME_TYPES.AI_VISUAL) {
        scriptText += `Visual Direction (Runway):\n${scene.aiPrompts.runwayPrompt}\n\n`;
      } else {
        scriptText += `Avatar Direction:\n${scene.aiPrompts.avatarPrompt}\n\n`;
      }

      if (toolSettings.AI_AUDIO) {
        scriptText += `Voice Direction:\n${scene.aiPrompts.voicePrompt}\n`;
      }
      scriptText += `\n----------------------------------------\n\n`;
    });

    const blob = new Blob([scriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video-script.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Script Generation
  const generateVideoScript = async () => {
    if (!overallPrompt.trim()) {
      setError("Please provide a video concept before generating the script.");
      return;
    }

    setError(null);
    playSound(sentSound);
    setIsGenerating(true);

    try {
      let sceneDuration;
      let numberOfScenes;

      switch (videoType) {
        case 'short':
          sceneDuration = 5;
          numberOfScenes = 6;
          break;
        case 'standard':
          sceneDuration = 8;
          numberOfScenes = 10;
          break;
        case 'long':
          sceneDuration = 10;
          numberOfScenes = 15;
          break;
        default:
          sceneDuration = 5;
          numberOfScenes = 6;
      }

      const systemPrompt = `You are an expert video creator specializing in creating engaging content. Create a ${videoType} video script optimized for ${SCREEN_SIZES[screenSize].name} format.
  
  Base concept:
  ${overallPrompt}
  
  Tools Configuration:
  - AI Visuals (Runway): ${toolSettings.AI_VISUALS ? 'Available for generating visual scenes' : 'Not Available'}
  - Avatar/Presence: ${toolSettings.AVATAR ? 'Available with following options' : 'Not Available'}
    ${toolSettings.AVATAR ? `
    • Direct Recording: Simple, achievable actions for creator recording
    • AI Avatar: Digital avatar performance instructions
    • Video Transform: Style transfer guidelines` : ''}
  - AI Audio: ${toolSettings.AI_AUDIO ? 'Available for voice generation' : 'Not Available'}
  
  Video Specifications:
  - Format: ${SCREEN_SIZES[screenSize].name} (${SCREEN_SIZES[screenSize].aspectRatio})
  - Style: ${contentMood}, ${contentType}
  - Duration: ${videoType} format (${numberOfScenes} scenes)
  ${includeProduct ? '- Include natural product/brand integration' : ''}
  
  For each scene, provide:
  1. DESCRIPTION: Clear scene content and action
  2. FRAME_TYPE: Either AI_VISUAL or AVATAR
  3. VISUAL: 
     - For AI_VISUAL: Detailed visual generation prompts for Runway
     - For AVATAR: Clear, achievable actions based on avatar type
  4. VOICE: Voice direction and script${toolSettings.AI_AUDIO ? ' (for AI generation)' : ''}
  
  Format each scene as:
  SCENE [NUMBER]
  DESCRIPTION: [Content]
  FRAME_TYPE: [Type]
  VISUAL: [Direction]
  VOICE: [Script]
  
  Important Guidelines:
  - For AI visuals: Focus on clear, detailed visual descriptions
  - For recorded actions: Keep them simple and achievable
  - For AI avatar: Focus on natural expressions and movements
  - For voice: Clear, emotionally appropriate delivery
  - Ensure smooth transitions between scenes
  - Maintain consistent style and pacing`;


      const apiKey = localStorage.getItem('anthropicKey');
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          temperature: 0.7,
          max_tokens: 1500,
          messages: [{
            role: "user",
            content: `Generate a detailed ${videoType} video script for: "${overallPrompt}". Create ${numberOfScenes} scenes, optimized for ${SCREEN_SIZES[screenSize].name} format with appropriate scene distribution between AI visuals and avatar presence.`
          }],
          system: systemPrompt,
          model: "claude-3-5-sonnet-20241022",
          claudapikey: getAnthropicKey()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate script');
      }

      const data = await response.json();
      if (!data.content?.[0]?.text || data.content[0].text.includes("haven't provided")) {
        throw new Error("Please provide more details about your video concept.");
      }

      const generatedContent = data.content[0].text;
      const sceneBlocks = generatedContent.split(/SCENE\s+\d+/i).filter(block => block.trim());

      const newScenes = sceneBlocks.map((block, index) => ({
        id: Date.now() + index,
        content: extractContent(block, 'DESCRIPTION'),
        type: 'scene',
        frameType: extractContent(block, 'FRAME_TYPE').toLowerCase().includes('avatar') ?
          FRAME_TYPES.AVATAR : FRAME_TYPES.AI_VISUAL,
        avatarType: defaultAvatarType,
        aiPrompts: {
          runwayPrompt: extractContent(block, 'VISUAL'),
          avatarPrompt: extractContent(block, 'VISUAL'),
          voicePrompt: extractContent(block, 'VOICE')
        },
        duration: sceneDuration,
        key: Date.now() + index,
        previewUrl: getPreviewUrl({
          content: extractContent(block, 'DESCRIPTION')
        }, index)
      }));

      if (newScenes.length === 0) {
        throw new Error("Failed to parse the generated script. Please try again.");
      }

      setScenes(newScenes);
      playSound(receivedSound);
    } catch (error) {
      console.error('Error generating video script:', error);
      setError(error.message || 'Failed to generate video script. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Loading and Auth States
  if (isAuthChecking) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-blue-500">
          <Loader className="animate-spin" size={20} />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-red-500">Please add your Claude API key in settings</div>
      </div>
    );
  }

  // Main Component Render
  return (
    <div className="bg-white rounded-md overflow-hidden p-4">
      {/* Settings Dialog */}
      <SettingsDialog
        show={showSettings}
        onClose={() => setShowSettings(false)}
        toolSettings={toolSettings}
        setToolSettings={setToolSettings}
        playSound={playSound}
        toggleSound={toggleSound}
        defaultAvatarType={defaultAvatarType}
        setDefaultAvatarType={setDefaultAvatarType}
      />

      {/* Main Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Create Your <span className='text-blue-600'>TikTok / IG Video</span> Script</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Settings size={18} />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="p-4">
        <div className="space-y-4">
          {/* Format Controls */}
          <div className="flex gap-4">


            <div className='grid w-full whitespace-nowrap'>
              <label className='font-bold text-xs'>Type of Video</label>
              <div className="mt-1 text-xs text-gray-500 pb-2">
                {VIDEO_STYLES[Object.keys(VIDEO_STYLES).find(key =>
                  VIDEO_STYLES[key].value === videoStyle
                )]?.description}
              </div>
              <select
                value={videoStyle}
                onChange={(e) => setVideoStyle(e.target.value)}
                className="w-full p-2 rounded-md bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(VIDEO_STYLES).map(([key, style]) => (
                  <option key={key} value={style.value}>
                    {style.name}
                  </option>
                ))}
              </select>
            </div>

            <div className='grid w-full'>
              <label className='font-bold text-xs'>Format</label>
              <div className="mt-1 text-xs text-gray-500 pb-2">
                Where are you posting ?
              </div>
              <select
                value={screenSize}
                onChange={(e) => setScreenSize(e.target.value)}
                className="p-2 rounded-md bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(SCREEN_SIZES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name}
                  </option>
                ))}
              </select>
            </div>

            <div className='grid w-full'>
              <label className='font-bold text-xs'>Length</label>
              <div className="mt-1 text-xs text-gray-500 pb-2">
                How long ?
              </div>
              <select
                value={videoType}
                onChange={(e) => setVideoType(e.target.value)}
                className="p-2 rounded-md bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="short">Short (30s)</option>
                <option value="standard">Standard (1-2min)</option>
                <option value="long">Long Form (3-5min)</option>
              </select>
            </div>

            <div className='grid w-full'>
              <label className='font-bold text-xs'>Tone</label>
              <div className="mt-1 text-xs text-gray-500 pb-2">
                whats your style ?
              </div>
              <select
                value={contentMood}
                onChange={(e) => setContentMood(e.target.value)}
                className="p-2 rounded-md bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="engaging">Engaging</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="dramatic">Dramatic</option>
                <option value="humorous">Humorous</option>
                <option value="satirical">Satirical</option>
              </select>
            </div>


          </div>

          {/* Main Prompt Input */}
          <div className="space-y-2">
            <textarea
              className="w-full p-4 rounded-md bg-blue-50 text-blue-900 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={overallPrompt}
              onChange={(e) => setOverallPrompt(e.target.value)}
              placeholder="Describe your video concept. What's the main message or story?"
              rows={4}
            />
            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setIncludeProduct(!includeProduct);
                  playSound(toggleSound);
                }}
                className="flex items-center text-gray-600 hover:text-blue-500 text-sm gap-2"
              >
                {includeProduct ? (
                  <CircleCheckBig size={20} className="text-blue-500" />
                ) : (
                  <Circle size={20} />
                )}

                <span className="flex items-center gap-2 text-slate-500">
                  Include my <span className='hidden lg:flex gap-1 sm:gap-2'>
                    <i className='flex gap-1 sm:gap-2 text-blue-500'>
                      <Blocks size={16} />product/service
                    </i> with my
                    <i className='flex gap-1 sm:gap-2 text-blue-500'>
                      <BicepsFlexed size={16} />personal journey
                    </i>
                  </span>
                </span>
              </button>
            </div>


            <div className='flex gap-4'>

              <div className="text-sm text-gray-500 m-auto">
                Format: {SCREEN_SIZES[screenSize].description} • {SCREEN_SIZES[screenSize].aspectRatio}
              </div>

              <button
                className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm transition-colors
                ${isGenerating ?
                    'bg-gray-100 text-gray-400 cursor-not-allowed' :
                    'bg-blue-500 text-white hover:bg-blue-600'}`}
                onClick={generateVideoScript}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Wand2 size={16} />
                )}
                Generate Script
              </button>

            </div>

          </div>

          {/* Format Info */}

        </div>
      </div>

      {/* Generated Script Display */}
      {scenes.length > 0 && (
        <div className="bg-blue-200 p-4 rounded-md">
          <div className="mx-auto">
            {/* Scene Timeline */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Scene Timeline</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={exportFormattedScript}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    <Download size={16} />
                    Export Script
                  </button>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Timer size={16} />
                    <span>Total Duration: {scenes.reduce((acc, scene) => acc + parseInt(scene.duration), 0)}s</span>
                  </div>
                </div>
              </div>

              {/* Scene Cards */}
              <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x">
                <div className="flex gap-4">
                  {scenes.map((scene, index) => (
                    <div
                      key={scene.key}
                      onClick={() => setCurrentScene(index)}
                      className={`flex-shrink-0 w-64 bg-white rounded-lg shadow-sm cursor-pointer transition-all snap-start
                        ${currentScene === index ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
                    >
                      {/* Preview */}
                      <div className={`w-full overflow-hidden relative rounded-t-lg ${screenSize === 'VERTICAL' ? 'aspect-[9/16]' :
                        screenSize === 'SQUARE' ? 'aspect-square' :
                          screenSize === 'WIDE' ? 'aspect-[21/9]' : 'aspect-video'
                        }`}>
                        <img
                          src={scene.previewUrl?.replace('.mp4', '')}
                          alt={`Scene ${index + 1} preview`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                          <div className="flex items-center justify-between text-white">
                            <span className="text-sm font-medium">Scene {index + 1}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{scene.duration}s</span>
                              {scene.frameType === FRAME_TYPES.AI_VISUAL ?
                                <Image size={14} /> :
                                <UserCircle2 size={14} />
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-600 line-clamp-2">{scene.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Add Scene Button */}
                  <button
                    onClick={addNewScene}
                    className={`flex-shrink-0 w-64 rounded-lg border-2 border-dashed border-blue-300 
                      hover:border-blue-400 hover:bg-blue-50/50 transition-colors snap-start
                      flex items-center justify-center
                      ${screenSize === 'VERTICAL' ? 'aspect-[9/16]' :
                        screenSize === 'SQUARE' ? 'aspect-square' :
                          screenSize === 'WIDE' ? 'aspect-[21/9]' : 'aspect-video'}`}
                  >
                    <div className="flex flex-col items-center text-blue-500">
                      <PlusCircle className="w-6 h-6 mb-1" />
                      <span className="text-sm font-medium">Add Scene</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Current Scene Editor */}
            {getCurrentScene() && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">Scene {currentScene + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (currentScene > 0) setCurrentScene(currentScene - 1);
                        }}
                        disabled={currentScene === 0}
                        className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                      >
                        <ArrowLeft size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          if (currentScene < scenes.length - 1) setCurrentScene(currentScene + 1);
                        }}
                        disabled={currentScene === scenes.length - 1}
                        className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                      >
                        <ArrowRight size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Frame Type Toggle */}
                    <FrameToggle
                      isAvatar={getCurrentScene().frameType === FRAME_TYPES.AVATAR}
                      onToggle={(avatarMode) => toggleFrameType(
                        getCurrentScene().id,
                        avatarMode ? FRAME_TYPES.AVATAR : FRAME_TYPES.AI_VISUAL
                      )}
                      className="w-full sm:w-auto"
                    />

                    {/* Duration Input */}
                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      <label className="text-sm text-gray-600">Duration:</label>
                      <input
                        type="number"
                        value={getCurrentScene().duration}
                        onChange={(e) => {
                          const newScenes = [...scenes];
                          newScenes[currentScene].duration = e.target.value;
                          setScenes(newScenes);
                        }}
                        className="w-20 p-1 border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                      <span className="text-sm text-gray-600">s</span>
                    </div>

                    {/* Remove Scene Button */}
                    {scenes.length > 1 && (
                      <button
                        onClick={() => removeScene(getCurrentScene().id)}
                        className="p-1.5 text-white bg-red-400 hover:bg-red-800 rounded-full transition-colors"
                        title="Remove Scene"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Scene Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scene Description
                    </label>
                    <textarea
                      value={getCurrentScene().content}
                      onChange={(e) => updateSceneContent(getCurrentScene().id, e.target.value)}
                      className="w-full p-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe what happens in this scene..."
                    />
                  </div>

                  {/* AI Prompts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Visual/Avatar Prompt */}
                    <div className="border rounded-lg p-4 bg-gray-100">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        {getCurrentScene().frameType === FRAME_TYPES.AI_VISUAL ?
                          'AI Visual Scene Direction' :
                          `Avatar Direction (${getCurrentScene().avatarType})`
                        }
                      </h4>
                      <textarea
                        value={getCurrentScene().frameType === FRAME_TYPES.AI_VISUAL ?
                          getCurrentScene().aiPrompts.runwayPrompt :
                          getCurrentScene().aiPrompts.avatarPrompt
                        }
                        onChange={(e) => updateAIPrompt(
                          getCurrentScene().id,
                          getCurrentScene().frameType === FRAME_TYPES.AI_VISUAL ?
                            'runwayPrompt' : 'avatarPrompt',
                          e.target.value
                        )}
                        className="w-full p-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={6}
                        placeholder={getPromptPlaceholder(
                          getCurrentScene().frameType,
                          getCurrentScene().avatarType
                        )}
                      />
                      {getCurrentScene().frameType === FRAME_TYPES.AVATAR &&
                        getCurrentScene().avatarType === TOOL_SETTINGS.AVATAR.types.RECORDED.name && (
                          <div className="mt-2 text-xs text-gray-500">
                            Tip: Keep actions simple and achievable with basic equipment
                          </div>
                        )}
                    </div>

                    {/* Voice Direction */}
                    {toolSettings.AI_AUDIO && (
                      <div className="border rounded-lg p-4 bg-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Voice Direction</h4>
                        <textarea
                          value={getCurrentScene().aiPrompts.voicePrompt}
                          onChange={(e) => updateAIPrompt(getCurrentScene().id, 'voicePrompt', e.target.value)}
                          className="w-full p-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={6}
                          placeholder="Describe voice tone, pacing, and emotional delivery..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Export the component
export default VideoScriptConstructor;