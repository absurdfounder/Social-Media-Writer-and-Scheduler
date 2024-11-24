"use client"

import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  X,
  Camera,
  Mic,
  Wand2,
  Loader,
  ArrowLeft,
  ArrowRight,
  UserCircle2,
  Video,
  Megaphone,
  Circle,
  CircleCheckBig,
  Blocks,
  BicepsFlexed,
  Download,
  Timer
} from 'lucide-react';

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
    description: 'Optimized for short-form'
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
    description: 'Cinematic content'
  }
};

const AI_TOOL_LOGOS = {
  heygen: 'https://img.icons8.com/?size=512&id=nYpTA1hyYtTK&format=png',
  elevenlabs: 'https://aiora.ai/wp-content/uploads/2023/05/eleven-labs-ai-tool.png.png',
  runway: 'https://digiseller.mycdn.ink/preview/888070/p1_3703730_9aad90bd.png'
};

const INITIAL_SCENE = {
  id: Date.now(),
  content: '',
  type: 'scene',
  aiPrompts: {
    runwayPrompt: '',
    heygenPrompt: '',
    elevenLabsPrompt: ''
  },
  duration: '5',
  key: Date.now(),
  previewUrl: 'https://placehold.co/1920x1080.mp4/808080/FFFFFF?text=New+Scene'
};

const VideoScriptConstructor = ({ onConfigureTrainingData }) => {
  // Core States
  const [overallPrompt, setOverallPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeProduct, setIncludeProduct] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [isBrowser, setIsBrowser] = useState(false);

  // Video Configuration States
  const [videoType, setVideoType] = useState('short');
  const [contentMood, setContentMood] = useState('engaging');
  const [contentType, setContentType] = useState('educational');
  const [screenSize, setScreenSize] = useState('HORIZONTAL');
  const [scenes, setScenes] = useState([INITIAL_SCENE]);
  const [currentScene, setCurrentScene] = useState(0);

  // Audio feedback
  const receivedSound = isBrowser ? new Audio('https://dazzling-cat.netlify.app/recievedmsg.mp3') : null;
  const sentSound = isBrowser ? new Audio('https://dazzling-cat.netlify.app/sendmsg1.mp3') : null;
  const toggleSound = isBrowser ? new Audio('https://dazzling-cat.netlify.app/sendmsg2.mp3') : null;

  useEffect(() => {
    setIsBrowser(true);
    const storedProductInfo = localStorage.getItem('productQuestionnaire');
    if (storedProductInfo) {
      setProductInfo(JSON.parse(storedProductInfo));
    }
  }, []);

  const playSound = (sound) => {
    if (isBrowser && sound) {
      sound.play().catch(error => console.error('Error playing sound:', error));
    }
  };

  // Helper Functions
  const getPreviewUrl = (scene, index) => {
    const dimensions = SCREEN_SIZES[screenSize].dimensions;
    const bgColor = generateColorCode(index);
    const text = encodeURIComponent(scene.content.slice(0, 30));
    return `https://placehold.co/${dimensions}.mp4/${bgColor}/FFFFFF?text=${text}`;
  };

  const extractContent = (block, section) => {
    const regex = new RegExp(`${section}:(.+?)(?=RUNWAY:|HEYGEN:|ELEVENLABS:|$)`, 's');
    const match = block.match(regex);
    return match ? match[1].trim() : '';
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

  // Scene Management Functions
  const addNewScene = () => {
    setScenes(prev => [...prev, {
      ...INITIAL_SCENE,
      id: Date.now(),
      key: Date.now(),
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

  const updateAIPrompt = (id, tool, prompt) => {
    setScenes(prev => prev.map(scene =>
      scene.id === id ? {
        ...scene,
        aiPrompts: { ...scene.aiPrompts, [tool]: prompt }
      } : scene
    ));
  };

  // AI Generation Function
  const generateVideoScript = async () => {
    playSound(sentSound);
    setIsGenerating(true);
    try {
      let promptContent = overallPrompt;
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

      const systemPrompt = `You are an expert video creator specializing in viral-worthy content and memes. Create a ${videoType} video script optimized for ${SCREEN_SIZES[screenSize].name} format that's designed to have high meme potential and shareability.

Base concept:
${promptContent}

Follow these viral content guidelines:

1. MEME POTENTIAL OPTIMIZATION:
- Create "template-worthy" moments that are easy to remix
- Include subversion of expectations or twist endings
- Design scenes with clear emotional triggers
- Focus on relatable, human moments
- Create opportunities for reaction shots and memorable frames

2. PLATFORM-SPECIFIC OPTIMIZATION:
Format: ${SCREEN_SIZES[screenSize].name} (${SCREEN_SIZES[screenSize].aspectRatio})
${screenSize === 'VERTICAL' ? '- Optimize for mobile viewing and scrolling behavior' :
          screenSize === 'SQUARE' ? '- Focus on center-weighted composition for feed stopping power' :
            '- Use cinematic wide-format composition for immersive viewing'}

3. VIRAL TRIGGERS:
- Emotional Resonance: Focus on universally relatable moments
- Pattern Interruption: Create unexpected twists or surprises
- Memetic Elements: Include easily remixable moments
- Screenshot Potential: Create freeze-frame worthy moments
- Sound Bite Potential: Include quotable/remixable audio moments

4. SCENE STRUCTURE:
For each scene, provide:
a) Scene Description: Clear action and key memetic moments
b) Visual Direction (Runway):
   - Camera movements and transitions
   - Visual composition for ${SCREEN_SIZES[screenSize].name} format
   - Key frame moments for screenshots/memes
   - Visual hook elements
   
c) Personal Avatar Direction (Heygen):
   - Your digital clone's reactions and expressions
   - Genuine, relatable emotions and gestures
   - Memorable reactions or expressions
   - Position in frame for ${screenSize} format
   
d) Voice Direction (ElevenLabs):
   - Tone and delivery style
   - Potential sound bite moments
   - Quotable phrases or hooks
   - Timing for memetic impact

5. VIRAL STORYTELLING:
- Hook: Immediate pattern interruption or curiosity gap
- Setup: Relatable situation or problem
- Twist: Unexpected element or surprise
- Payoff: Satisfying or memorable resolution
- Template Potential: Scene structure that's easy to remix

6. MEME CHARACTERISTICS:
- Keep reactions and expressions authentic and genuine
- Create moments that can be easily taken out of context
- Include versatile reactions that could work in different contexts
- Design scenes with clear before/after or expectation/reality dynamics
- Include moments that could become reaction GIFs or image macros

Remember:
- Optimize for shareability and remixability
- Create moments that work as reaction images/videos
- Include clear emotional triggers
- Design for screenshot-worthy moments
- Focus on authentic, relatable situations
- Create scenes that can be easily recontextualized
- Include potential catchphrases or quotable moments

${includeProduct ? `Incorporate product naturally while maintaining meme potential. Treat product integration as part of the authentic story rather than forced placement.` : ''}

FORMAT EACH SCENE AS:
SCENE [NUMBER]
DESCRIPTION: [Scene content with focus on meme-worthy moments]
RUNWAY: [Visual generation prompts optimized for ${SCREEN_SIZES[screenSize].name}]
HEYGEN: [Your digital clone's performance and reactions]
ELEVENLABS: [Voice direction with potential sound bite moments]`;

      // Make API call with the enhanced prompt
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperature: 0.7,
          max_tokens: 1500,
          messages: [{
            role: "user",
            content: `Generate a detailed ${videoType} video script for: "${promptContent}". Create ${numberOfScenes} scenes, each with scene description, visual prompts for Runway.ai, avatar directions for Heygen, and voice instructions for ElevenLabs. Focus on creating highly memeable and shareable moments.`
          }],
          system: systemPrompt,
          model: "claude-3-5-sonnet-20240620",
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const data = await response.json();
      const generatedContent = data.content[0].text;

      // Parse the generated content into scenes
      const newScenes = [];
      const sceneBlocks = generatedContent.split('SCENE');

      sceneBlocks.forEach((block, index) => {
        if (block.trim()) {
          const scene = {
            id: Date.now() + index,
            content: extractContent(block, 'DESCRIPTION'),
            type: 'scene',
            aiPrompts: {
              runwayPrompt: extractContent(block, 'RUNWAY'),
              heygenPrompt: extractContent(block, 'HEYGEN'),
              elevenLabsPrompt: extractContent(block, 'ELEVENLABS')
            },
            duration: sceneDuration,
            key: Date.now() + index,
            previewUrl: getPreviewUrl({
              content: extractContent(block, 'DESCRIPTION')
            }, index)
          };
          newScenes.push(scene);
        }
      });

      setScenes(newScenes);
      playSound(receivedSound);
    } catch (error) {
      console.error('Error generating video script:', error);
      alert('Failed to generate video script. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-md overflow-hidden">
      {/* Input Section */}
      <div className="p-4 border-gray-400">
        <div className="bg-white rounded-md p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h1 className="text-lg sm:text-xl font-bold text-blue-500 mb-2 sm:mb-0">
              Create Your Viral Video
            </h1>

            <div className="flex flex-wrap gap-2">
              <select
                value={screenSize}
                onChange={(e) => setScreenSize(e.target.value)}
                className="p-2 rounded-md bg-white text-black border border-gray-300 text-sm"
              >
                {Object.entries(SCREEN_SIZES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name}
                  </option>
                ))}
              </select>

              <select
                value={videoType}
                onChange={(e) => setVideoType(e.target.value)}
                className="p-2 rounded-md bg-white text-black border border-gray-300 text-sm"
              >
                <option value="short">Short (30s)</option>
                <option value="standard">Standard (1-2min)</option>
                <option value="long">Long Form (3-5min)</option>
              </select>

              <select
                value={contentMood}
                onChange={(e) => setContentMood(e.target.value)}
                className="p-2 rounded-md bg-white text-black border border-gray-300 text-sm"
              >
                <option value="engaging">Engaging</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="dramatic">Dramatic</option>
                <option value="humorous">Humorous</option>
                <option value="satirical">Satirical</option>
              </select>

              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="p-2 rounded-md bg-white text-black border border-gray-300 text-sm"
              >
                <option value="educational">Educational</option>
                <option value="promotional">Promotional</option>
                <option value="storytelling">Story-based</option>
                <option value="tutorial">Tutorial</option>
                <option value="testimonial">Testimonial</option>
                <option value="meme">Pure Meme</option>
              </select>
            </div>

          </div>

          <textarea
            className="w-full p-4 rounded-md bg-blue-50 text-blue-900 text-sm mb-4"
            value={overallPrompt}
            onChange={(e) => setOverallPrompt(e.target.value)}
            placeholder="Describe your video concept. What's the main hook or message? Include any specific meme formats or trends you want to reference..."
            rows={4}
          />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setIncludeProduct(!includeProduct);
                  playSound(toggleSound);
                }}
                className="flex items-center text-blue-500 hover:text-blue-500 text-sm gap-2"
              >
                {includeProduct ? <CircleCheckBig size={20} /> : <Circle size={20} />}
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
              <button
                className="flex gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-2xl text-sm"
                onClick={onConfigureTrainingData}
              >
                Training Data
              </button>
            </div>

            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-md flex items-center gap-2 text-sm w-full sm:w-auto"
              onClick={generateVideoScript}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader size={16} className="animate-spin" /> : <Wand2 size={16} />}
              Generate Viral Script
            </button>
          </div>

          {/* Format Info */}
          <div className="mt-4 text-sm text-gray-500">
            Format: {SCREEN_SIZES[screenSize].description} • {SCREEN_SIZES[screenSize].aspectRatio}
          </div>
        </div>
      </div>

      {/* Generated Script Display */}
      {scenes.length > 0 && (
        <div className="bg-blue-200 p-2 sm:p-4">
          <div className="max-w-6xl mx-auto">
            {/* Scene Timeline */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Scene Timeline</h2>
                {/* Export Options */}
                <div className="flex justify-end gap-4 items-center">

                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() => {
                      const scriptData = {
                        videoType,
                        contentMood,
                        contentType,
                        screenSize,
                        overallPrompt,
                        scenes
                      };
                      const blob = new Blob([JSON.stringify(scriptData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'viral-video-script.json';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download size={16} />
                  </button>

                  <span className="flex gap-2 text-sm text-gray-600">
                  <Timer size={16} /> Total Duration: {scenes.reduce((acc, scene) => acc + parseInt(scene.duration), 0)}s
                  </span>

                </div>

              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 px-2">
                <div className="flex gap-4">
                  {scenes.map((scene, index) => (
                    <div
                      key={scene.key}
                      onClick={() => setCurrentScene(index)}
                      className={`flex-shrink-0 w-64 bg-white rounded-lg shadow-sm border-2 cursor-pointer transition-all ${currentScene === index ? 'border-blue-500 shadow-md' : 'border-transparent'
                        }`}
                    >
                      {/* Video Preview */}
                      <div className={`w-full overflow-hidden relative group rounded-t-lg ${screenSize === 'VERTICAL' ? 'aspect-[9/16]' :
                        screenSize === 'SQUARE' ? 'aspect-square' :
                          screenSize === 'WIDE' ? 'aspect-[21/9]' : 'aspect-video'
                        }`}>
                        <img
                          src={scene.previewUrl?.replace('.mp4', '')}
                          alt={`Scene ${index + 1} preview`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200" />
                      </div>

                      <div className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold">Scene {index + 1}</span>
                          <span className="text-xs text-gray-500">{scene.duration}s</span>
                        </div>
                        <div className="text-xs text-gray-600 line-clamp-2">{scene.content}</div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addNewScene}
                    className={`flex-shrink-0 w-64 rounded-lg border-2 border-dashed border-blue-400 flex items-center justify-center hover:border-blue-500 hover:bg-blue-100 transition-colors ${screenSize === 'VERTICAL' ? 'aspect-[9/16]' :
                      screenSize === 'SQUARE' ? 'aspect-square' :
                        screenSize === 'WIDE' ? 'aspect-[21/9]' : 'aspect-video'
                      }`}
                  >
                    <div className="flex flex-col items-center text-blue-500 hover:shadow-md">
                      <PlusCircle className="w-6 h-6 mb-1" />
                      <span className="text-sm">Add Scene</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Current Scene Editor */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">Scene {currentScene + 1}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (currentScene > 0) setCurrentScene(currentScene - 1);
                      }}
                      disabled={currentScene === 0}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (currentScene < scenes.length - 1) setCurrentScene(currentScene + 1);
                      }}
                      disabled={currentScene === scenes.length - 1}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <input
                      type="number"
                      value={scenes[currentScene].duration}
                      onChange={(e) => {
                        const newScenes = [...scenes];
                        newScenes[currentScene].duration = e.target.value;
                        setScenes(newScenes);
                      }}
                      className="w-20 p-1 border rounded text-center"
                      min="1"
                    />
                    <span className="text-gray-600">seconds</span>
                  </label>
                  {scenes.length > 1 && (
                    <button
                      onClick={() => removeScene(scenes[currentScene].id)}
                      className="text-red-500 hover:text-red-600"
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
                    value={scenes[currentScene].content}
                    onChange={(e) => updateSceneContent(scenes[currentScene].id, e.target.value)}
                    className="w-full p-3 border rounded-md text-sm"
                    rows={3}
                    placeholder="Describe what happens in this scene..."
                  />
                </div>


                {/* AI Tool Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Runway Prompt */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm font-medium mb-3">
                      <img
                        src={AI_TOOL_LOGOS.runway}
                        alt="Runway"
                        className="w-6 h-6 rounded"
                      />
                      <span>Runway (AI Visual)</span>
                    </div>
                    <textarea
                      value={scenes[currentScene].aiPrompts.runwayPrompt}
                      onChange={(e) => updateAIPrompt(scenes[currentScene].id, 'runwayPrompt', e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                      rows={4}
                      placeholder="Describe the visual scene, lighting, and composition..."
                    />
                  </div>

                  {/* Heygen Prompt */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm font-medium mb-3">
                      <img
                        src={AI_TOOL_LOGOS.heygen}
                        alt="Heygen"
                        className="w-6 h-6 rounded"
                      />
                      <span>HeyGen : Your Digital Clone</span>
                    </div>
                    <textarea
                      value={scenes[currentScene].aiPrompts.heygenPrompt}
                      onChange={(e) => updateAIPrompt(scenes[currentScene].id, 'heygenPrompt', e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                      rows={4}
                      placeholder="Describe your digital clone's expressions and actions..."
                    />
                  </div>

                  {/* ElevenLabs Prompt */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm font-medium mb-3">
                      <img
                        src={AI_TOOL_LOGOS.elevenlabs}
                        alt="ElevenLabs"
                        className="w-6 h-6 rounded"
                      />
                      <span>ElevenLabs (AI Voice)</span>
                    </div>
                    <textarea
                      value={scenes[currentScene].aiPrompts.elevenLabsPrompt}
                      onChange={(e) => updateAIPrompt(scenes[currentScene].id, 'elevenLabsPrompt', e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                      rows={4}
                      placeholder="Describe voice tone, pace, and emotional quality..."
                    />
                  </div>
                </div>


                {/* Video Preview */}
                <div className={`rounded-lg overflow-hidden bg-gray-100 ${screenSize === 'VERTICAL' ? 'aspect-[9/16] max-w-[540px] mx-auto' :
                  screenSize === 'SQUARE' ? 'aspect-square max-w-[720px] mx-auto' :
                    screenSize === 'WIDE' ? 'aspect-[21/9]' : 'aspect-video'
                  }`}>
                  <img
                    src={scenes[currentScene].previewUrl?.replace('.mp4', '')}
                    alt={`Scene ${currentScene + 1} preview`}
                    className="w-full h-full object-cover"
                  />
                </div>

              </div>
            </div>


          </div>
        </div>
      )}
    </div>
  );
};

export default VideoScriptConstructor;
