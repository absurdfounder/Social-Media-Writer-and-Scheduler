"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  PlusCircle,
  X,
  Smile,
  Image as ImageIcon,
  Link as LinkIcon,
  Wand2,
  FileText,
  Video,
  Loader,
  ToggleLeft,
  ToggleRight,
  Circle,
  CircleCheck,
  Blocks,
  BicepsFlexed,
  CircleCheckBig,
  InfoIcon,
  User,
  LetterText,
  HeartCrackIcon,
  Eclipse
} from 'lucide-react';
import { getAnthropicKey, decryptKey } from '../Utils/getApikey';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

// ===== TipTapEditor Component =====
const TipTapEditor = ({ content, onUpdate, onImageUpload, onVideoUpload, onLinkAdd }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: {
          keepMarks: true,
          HTMLAttributes: {
            class: 'my-custom-class',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-slate-500 hover:underline',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose w-full min-h-[100px] focus:outline-none whitespace-pre-wrap',
      },
    },
    immediatelyRender: false,
  }, []);

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!isClient) {
    return <div>Loading editor...</div>;
  }

  return (
    <div>
      <EditorContent editor={editor} />
      <div className="flex space-x-2 mt-2">
        <button
          onClick={onImageUpload}
          className="p-2 rounded-full hover:bg-slate-100"
        >
          <ImageIcon size={20} />
        </button>
        <button
          onClick={onVideoUpload}
          className="p-2 rounded-full hover:bg-slate-100"
        >
          <Video size={20} />
        </button>
        <button
          onClick={onLinkAdd}
          className="p-2 rounded-full hover:bg-slate-100"
        >
          <LinkIcon size={20} />
        </button>
      </div>
    </div>
  );
};

// ===== LinkPreview Component =====
const LinkPreview = ({ url }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        setPreview(data);
      } catch (error) {
        console.error('Error fetching link preview:', error);
      }
    };

    fetchPreview();
  }, [url]);

  if (!preview) return null;

  return (
    <div className="border rounded-md overflow-hidden mt-2">
      {preview.image && <img src={preview.image} alt={preview.title} className="w-full h-32 object-cover" />}
      <div className="p-2">
        <h3 className="font-bold">{preview.title}</h3>
        <p className="text-sm text-gray-500">{preview.description}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:underline text-sm">
          {url}
        </a>
      </div>
    </div>
  );
};

// ===== TweetContent Component =====
const TweetContent = ({ images, links, videos }) => {
  return (
    <div className="mb-4">
      {images.map((img, i) => (
        <img key={i} src={img} alt={`Tweet image ${i + 1}`} className="mb-2 mt-2 rounded-md max-w-full h-auto" />
      ))}
      {videos.map((video, i) => (
        <div key={i} className="mb-2 mt-2 rounded-md overflow-hidden">
          <iframe
            src={video}
            title={`Tweet video ${i + 1}`}
            className="w-full aspect-video"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      ))}
      {links.map((link, i) => (
        <LinkPreview key={i} url={link} />
      ))}
    </div>
  );
};

// ===== ThreadWriter Component =====
const ThreadWriter = ({ onConfigureTrainingData }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [isClient, setIsClient] = useState(false); // Add the missing state
  const [tweets, setTweets] = useState([{ id: Date.now(), content: '', images: [], links: [], videos: [], key: Date.now() }]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [overallPrompt, setOverallPrompt] = useState('');
  const [rewritingTweetId, setRewritingTweetId] = useState(null);
  const [threadType, setThreadType] = useState('single');
  const [includeProduct, setIncludeProduct] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [mode, setMode] = useState('share');
  const [feeling, setFeeling] = useState('not_specified');
  const [replyLength, setReplyLength] = useState('super_short');
  const [replyStance, setReplyStance] = useState('controversial');

  const [apikeyAdded, setApikeyAdded] = useState(false);
  const [TrainingData, setTraningData] = useState('');

  useEffect(() => {
    const storedData = localStorage.getItem("getTrainingData");
    if (storedData) {
      setTraningData(storedData);
    }
  }, []);

  // Log training data when it changes
  useEffect(() => {
    if (TrainingData) {
      console.log('Training data updated:', TrainingData);
    }
  }, [TrainingData]);

  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState('unchecked'); // 'unchecked', 'validating', 'valid', 'invalid'

  // New state for profiles and selected profiles
  const [profiles, setProfiles] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null); // Add this for single profile selection

  // New state for Training Data Popup visibility
  const [isTrainingPopupOpen, setIsTrainingPopupOpen] = useState(false);

  // New state for celebrity mode
  const [celebrityMode, setCelebrityMode] = useState("");

  // Define celebrity prompts
  const celebrityPrompts = {
    marclou: "When replying, channel Marc Lou's sharp wit and confident tone. Use punchy, memorable phrases with a laid-back style.",
    johnrush: "When replying, use John Rush's energetic and direct style. Keep it brief, impactful and slightly irreverent.",
    examplecelebrity: "For Example Celebrity, use a quirky and fun tone with clever wordplay and a hint of irony."
  };

  // Define validateApiKey function before using it
  const validateApiKey = async () => {
    const key = localStorage.getItem('anthropicKey');
    if (!key) {
      setApiKeyStatus('invalid');
      setApikeyAdded(false);
      return;
    }

    if (!key.startsWith('sk-')) {
      setApiKeyStatus('invalid');
      setApikeyAdded(false);
      return;
    }

    setApiKeyStatus('validating');
    setIsValidatingKey(true);

    // Simulate API validation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setApiKeyStatus('valid');
    setApikeyAdded(true);
    setIsValidatingKey(false);
  };

  // Load profiles from Firebase
  useEffect(() => {
    setIsClient(true);
    validateApiKey();

    const loadProfiles = async () => {
      try {
        const auth = getAuth();
        // Wait for auth to initialize and check if user is logged in
        if (!auth || !auth.currentUser) {
          console.log("User not authenticated yet, waiting for auth state");
          // Add a listener for auth state changes
          const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
              fetchProfiles(user.uid);
              unsubscribe();
            }
          });
          return;
        }

        // If we already have a user, fetch profiles directly
        fetchProfiles(auth.currentUser.uid);
      } catch (error) {
        console.error('Error in loadProfiles:', error);
        // Fallback with test data if in development
        if (process.env.NODE_ENV === 'development') {
          setProfiles([
            { id: "test1", name: "Test Profile 1", description: "For testing purposes" },
            { id: "test2", name: "Test Profile 2", description: "Another test profile" }
          ]);
        }
      }
    };

    const fetchProfiles = async (userId) => {
      try {
        console.log("Fetching profiles for user:", userId);
        const db = getFirestore();
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("No profiles found for this user");
          return;
        }

        const loadedProfiles = [];
        querySnapshot.forEach((doc) => {
          loadedProfiles.push({ id: doc.id, ...doc.data() });
        });

        console.log("Loaded profiles:", loadedProfiles.length);
        setProfiles(loadedProfiles);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        toast.error("Failed to load profiles");
      }
    };

    loadProfiles();
  }, []);

  // Handler for single profile selection
  const handleProfileSelect = (profileId) => {
    setSelectedProfile(profileId);

    // Find the selected profile from the profiles array
    const profile = profiles.find(p => p.id === profileId);

    // If a profile was found, set its data as training data
    if (profile) {
      // You can update the training data based on the selected profile
      setTraningData(profile.description || '');

      // And save to localStorage if needed
      localStorage.setItem("getTrainingData", profile.description || '');
    }
  };

  // Update the apiKey effect
  useEffect(() => {
    const validateApiKey = async () => {
      const key = localStorage.getItem('anthropicKey');
      if (!key) {
        setApiKeyStatus('invalid');
        setApikeyAdded(false);
        return;
      }

      if (!key.startsWith('sk-')) {
        setApiKeyStatus('invalid');
        setApikeyAdded(false);
        return;
      }

      setApiKeyStatus('validating');
      setIsValidatingKey(true);

      // Simulate API validation delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setApiKeyStatus('valid');
      setApikeyAdded(true);
      setIsValidatingKey(false);
    };

    validateApiKey();
  }, []);

  // Update the status message JSX
  const getStatusMessage = () => {
    switch (apiKeyStatus) {
      case 'validating':
        return (
          <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm">
            <Loader size={20} className="animate-spin" />
            Please wait validating API key...
          </div>
        );
      case 'invalid':
        return (
          <div className="flex items-center gap-2 text-red-500 text-xs sm:text-sm">
            <InfoIcon size={20} />
            Claude API key added seems wrong or invalid - save again.
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    setIsBrowser(true);
    const storedProductInfo = localStorage.getItem('productQuestionnaire');
    if (storedProductInfo) {
      setProductInfo(JSON.parse(storedProductInfo));
    }
  }, []);

  const receivedSound = isBrowser ? new Audio('https://dazzling-cat.netlify.app/recievedmsg.mp3') : null;
  const sentSound = isBrowser ? new Audio('https://dazzling-cat.netlify.app/sendmsg1.mp3') : null;
  const toggleSound = isBrowser ? new Audio('https://dazzling-cat.netlify.app/sendmsg2.mp3') : null;

  const playSound = (sound) => {
    if (isBrowser && sound) {
      sound.play().catch(error => console.error('Error playing sound:', error));
    }
  };

  const addNewTweet = () => {
    setTweets(prevTweets => [...prevTweets, { id: Date.now(), content: '', images: [], links: [], videos: [], key: Date.now() }]);
  };

  const removeTweet = (id) => {
    if (tweets.length > 1) {
      setTweets(prevTweets => prevTweets.filter(tweet => tweet.id !== id));
    }
  };

  const handleEditorChange = (id, content) => {
    setTweets(prevTweets =>
      prevTweets.map(tweet =>
        tweet.id === id ? { ...tweet, content } : tweet
      )
    );
  };

  const handleImageUpload = useCallback(async (id) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = false;
      input.onchange = async () => {
        if (input.files && input.files[0]) {
          const file = input.files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
              setTweets(prevTweets =>
                prevTweets.map(tweet =>
                  tweet.id === id ? { ...tweet, images: [...tweet.images, e.target.result] } : tweet
                )
              );
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }, []);

  const handleVideoUpload = useCallback(async (id) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.multiple = false;
      input.onchange = async () => {
        if (input.files && input.files[0]) {
          const file = input.files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
              setTweets(prevTweets =>
                prevTweets.map(tweet =>
                  tweet.id === id ? { ...tweet, videos: [...(tweet.videos || []), e.target.result] } : tweet
                )
              );
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  }, []);

  const handleLinkAdd = useCallback((id) => {
    const url = window.prompt('Enter the URL');
    if (url) {
      setTweets(prevTweets =>
        prevTweets.map(tweet =>
          tweet.id === id ? { ...tweet, links: [...tweet.links, url] } : tweet
        )
      );
    }
  }, []);

  const parseAIResponse = (response) => {
    const lines = response.split('\n');
    let content = '';
    let images = [];
    let links = [];
    let videos = [];

    lines.forEach(line => {
      if (line.startsWith('Image:')) {
        const match = line.match(/\[(.+?)\]/);
        if (match) {
          const imageUrl = match[1].trim();
          images.push(imageUrl);
        }
      } else if (line.startsWith('Video:')) {
        const match = line.match(/\[(.+?)\]/);
        if (match) {
          const videoUrl = match[1].trim();
          videos.push(videoUrl);
        }
      } else if (line.startsWith('Link:')) {
        const match = line.match(/\[(.+?)\]/);
        if (match) {
          const linkUrl = match[1].trim();
          links.push(linkUrl);
        }
      } else {
        content += line + ' ';
      }
    });

    return { content: content.trim(), images, links, videos };
  };

  // Get feeling prompt function
  const getFeelingPrompt = (feeling) => {
    const feelingPrompts = {
      curiosity: {
        prompt: "Share something that's been keeping you up at night lately - you know, that weird dev thing you can't stop thinking about",
      },
      insight: {
        prompt: "Tell us about that random realization you just had - the kind that hits you in the shower or during a coffee break",
      },
      authenticity: {
        prompt: "Share that behind-the-scenes moment that probably isn't going in the portfolio",
      },
      achievement: {
        prompt: "Share that tiny win you can't tell non-tech friends about (but we'll get it)",
      },
      helpful: {
        prompt: "Share that trick you discovered by accident that's actually kind of genius",
      },
      reflection: {
        prompt: "Look back at something you used to do and now realize was either genius or totally wrong",
      }
    };

    if (!feeling || feeling === 'not_specified') return "";
    return feelingPrompts[feeling]?.prompt || "";
  };

  // Function to get reply style prompt
  const getReplyStylePrompt = (length, stance) => {
    const replyStyles = {
      super_short: {
        instruction: `Keep reply under 120 chars, like a quick thought. Be conversational and natural.`,
        maxLength: 120,
        examples: [
          "ship it already mate",
          "hmm makes sense actually",
          "just start small tbh",
          "ah thats actually smart",
          "been there last week",
          "nah wait until v2",
          "exactly what I needed"
        ]
      },
      medium: {
        instruction: `1-2 casual sentences sharing quick insight or experience`,
        maxLength: 240,
        examples: [
          "tried that last month with my saas actually ended up pivoting completely",
          "speaking of bootstrapping just crossed 10k mrr doing exactly this",
          "funny you mention that ran into same issue with docker last week",
          "the hardest part isnt the code its finding the right users tbh"
        ]
      },
      detailed: {
        instruction: `2-3 sentences sharing specific experience or insight while keeping casual tone`,
        maxLength: 400,
        examples: [
          "learned that one the hard way with my first product spent 6 months building features nobody wanted now I validate everything with a landing page first",
          "turns out most devs overcomplicate auth built my own solution in a weekend using supabase now onboarding takes 30 seconds",
          "found out theres actually a better way to handle this just use serverless functions and you wont have to worry about scaling at all"
        ]
      }
    };

    const stancePatterns = {
      neutral: {
        instruction: "Share balanced perspective drawing from experience",
        examples: [
          "depends on your use case tbh",
          "both approaches work here actually",
          "interesting way to look at it ngl"
        ]
      },
      in_favour: {
        instruction: "Express agreement while adding value",
        examples: [
          "exactly what worked for me too",
          "this is the way honestly",
          "100% agree from experience"
        ]
      },
      not_in_favour: {
        instruction: "Express disagreement thoughtfully with evidence",
        examples: [
          "might want to rethink that approach tbh",
          "actually found the opposite here",
          "careful with that one"
        ]
      },
      controversial: {
        instruction: "Present thought-provoking alternative casually",
        examples: [
          "hot take but hear me out",
          "plot twist its actually the opposite",
          "unpopular opinion but"
        ]
      },
      advice: {
        instruction: "Helping other users based on your experience, pointing them in the right direction.",
        examples: [
          "with my app i use to face this issue, i started doing this..",
          "your right, that greatly helps but you could also do this  ______ on the side it works great.",
          "unpopular opinion but i think you should take 15 min power naps boosts my productivity i feel quite focused. i dont slack anymore."
        ]
      }      
    };

    const selectedLength = replyStyles[length];
    const selectedStance = stancePatterns[stance];

    return `
    You are replying as an indie founder. Keep your response:
    - Length: ${selectedLength.instruction}
    - Stance: ${selectedStance.instruction}
    - Use natural conversational language
    - Add value through experience or insight
    - Keep it casual like talking to a friend
    - Use minimal punctuation
    - No line breaks needed

Reply Guidelines:
- Share quick personal experiences
- Add supportive elements for struggles
- Keep it casual but insightful
- Use natural flow and timing

Reply Structures Based on Length:

Super Short (under 120 chars):
- Quick reactions ("literally did this yesterday")
- Supportive comments ("the localhost struggles are real")
- Brief shared experiences ("took me 6 months to learn this")

Medium (1-2 sentences):
- Quick story ("reminds me of when I broke prod doing exactly this")
- Relatable moment ("my docker containers are feeling very seen right now")
- Friendly advice ("quick tip: found that using X saves tons of time here")

Detailed (2-3 sentences):
- Mini experience share ("ok so funny story about this - last week I...")
- Expanded perspective ("actually discovered something similar when...")
- Helpful context ("been working with this pattern for a while and...")

Add personality markers:
- Time references ("currently doing this exact thing")
- Location context ("writing this from my error log screen")
- State of mind ("3 coffees into debugging this same issue")

sharing a few examples how joshua replies, make this your style when replying also including threads so that you understand how he sees context and then replies ...


Thread with Anthony GG (@anthdm):


Anthony: "Wow wow. You are doing great. Keep going."
Joshua: "can smell the sarcasm through the screen 😂"
Anthony: "10k a month is broke. Just FYI."
Joshua: "well f me then right haha not even making half of that with my day job..."


Tweet by Alex Derocq (@akaasten):
"I can know how to recognize a post targeting @fullstackmiguel when I see one 😂"


Joshua: "hahaha wasn't even the purpose lol"


Tweet by Faizan (@FaizanKing):
"what about the laptops charger?😅"


Joshua: "😅"


Tweet by ChrisRookieDev (@AICultureWorld):
"Needs more coffee"


Joshua: "true haha"


Tweet by Domaghooy (@domaghooy):
"minus the caffeine addiction"


Joshua: "thats going to be hard one not gonna lie"


Tweet by Ilya (@UkhanovIlya):
"When did you pass the 1k ARR cap?"


Joshua: "I didnt (yet) just saying thats all I need to reach 10k mrr"


Tweet by Devarno (@Dev4rno):
"Finally added social links to my portfolio site 🦋 A small win, but it feels good to finally check it off the list. What do you think?"


Joshua: "yooo that looks super clean man 🔥"


Standalone post by Joshua [Dec 28, 2024]:
"SaaS welcome email still lands in spam... How do I fix this? (everything I found on the web is pitching a tool for this...)"
Standalone post by Joshua [Dec 28, 2024]:
"if you have no copycats you are doing something wrong"
Tweet by Miguel (@fullstackmiguel):
"What's the worst thing about adulthood? The Christmas presents you receive are all terrible or boring AF."


Joshua: "not gonna lie I was kinda happy about the socks I got but maybe I am getting old and boring haha"


Tweet by TimurNegru (@TimurNegru):
"💯"


Joshua: "🔥🙏"


Tweet by Jacob (@jacobrodri_):
"2025...🔥"


Joshua: "ohh yeah man 2025 gonna be crazy"


Tweet by Santiago Pablo Ortiz (@llm_san):
"It's funny how my chart is similar. At the beginning action it's mostly driven by motivation. Then consistency kicks off. Not a sprint, a marathon."


Joshua: "100% I went crazy posting like +5 things per day now the sweet spot is 2-3 posts per day"


Tweet by JESSICA LARSON (@harlek___):
"Consistency truly is key! 118 days is a huge milestone—proof that showing up daily can create real change. Keep inspiring us."


Joshua: "I will try :) thank you"


Tweet by Abhinandan (@Abhi_Hertz):
"How about sharing some tips 😀"


Joshua: "have none bro I still on the road to 10k just saying all you need is a laptop and some coffee haha"

    
NOTE : EVERY TIME I ASK, DO NOT USE THE SAME STYLE OF RESPONDING... GIVE ME VARIETY

    Examples for this style:
    ${selectedLength.examples.join('\n')}
    
    Examples for this stance:
    ${selectedStance.examples.join('\n')}`;
  };

  // Define the base system prompt
  const getBaseSystemPrompt = (maxTweets) => {
    return `
    You are an indie founder building your audience and personal brand on Twitter while developing a side-product. Your goal is to create engaging, high-impact tweets that resonate with your audience and showcase your journey. When writing tweets, follow these guidelines:

    Start with a strong hook or attention-grabbing statement
    Use simple, concise language that conveys your message quickly
    Incorporate personal stories or experiences to make your content relatable
    Structure your tweets for easy readability (e.g., bullet points, numbered lists, or before/after comparisons)
    Include a clear value proposition or takeaway for your audience
    For longer content, break it into a thread with each tweet focusing on a single point
    Always include a visual element (image, video, or gif) in the first tweet of a thread or standalone tweet
    End with a call-to-action or don't ask questions twitter does take it well
    
    ${includeProduct ? "When mentioning the product, focus on its unique selling points and how it solves problems for the target audience. Incorporate product details naturally into the tweets without making them sound like advertisements." : ""}

    When I provide a prompt, generate ${maxTweets} tweet${maxTweets > 1 ? 's' : ''} that align with these principles. NOTE: at the end of each tweet you need to use '/endtweet'
    For image suggestions, use 'Image: [https://placehold.co/600x400?text=Your+Text+Here]'.
    For video suggestions, use 'Video: [https://placehold.co/1920x1080.mp4?text=Your+Video+Text+Here]'.
    For link suggestions, use 'Link: [https://example.com]'.
    Always put these media suggestions on separate lines after the main tweet content.

    Your writing style should follow these guidelines:

    - Use simple structures (listicles, before/after comparisons)
    - Convey the main message in the first sentence
    - Add space between lines for better readability
    - Keep language concise and straightforward
    - Avoid using emojis completely

    As a solo founder we can write about:

    Technical tips with actionable code snippets 
    Personal journey updates that showcase growth and lessons learned
    Work/life balance insights that highlight the indie founder lifestyle
    Lessons learned from mistakes or challenges overcome
    Content strategy insights that provide value to other creators
    ${includeProduct ? "Updates and insights about the product being developed" : ""}

    LEARN FROM THIS: This is good writing format & style 

    Example 1:
    Me, last month:<br>
    "Do you seriously think you can make money online?"<br><br>
    Me, today:<br>
    {image of my stripe chart}<br>
    /endtweet

    Example 2:
    Last year:<br>
    0 users, $0 MRR<br><br>
    Today:<br>
    1000 users, $10k MRR<br><br>
    The difference?<br>
    - Consistent shipping<br>
    - Daily learning<br>
    - Community building<br><br>
    What's your growth story?<br>
    Image: [https://placehold.co/600x400?text=User+and+MRR+Growth+Chart]<br>
    /endtweet

    Example 3:
    Indie hacking reality check:<br><br>
    Expectation:<br>
    Launch product, get rich overnight<br><br>
    Reality:<br>
    - 6 months of coding<br>
    - 3 pivots<br>
    - 100 cold emails<br>
    - 1 paying customer<br><br>
    But that one "yes" makes it all worth it.<br>
    Video: [https://placehold.co/1920x1080.mp4?text=Journey+to+First+Customer]<br>
    /endtweet

    When generating tweets, always follow this structure:
    1. Strong opening statement
    2. Use <br> for line breaks between sections
    3. Short, punchy lines or bullet points
    4. Before/after comparisons when applicable
    6. Include relevant media suggestion
    7. Close with /endtweet

    Remember:
    - Write like you're messaging a friend
    - Include those "oh wait" moments and self-corrections
    - Share the messy parts of development
    - Let your personality show through
    - Keep it technical but relatable

    # IMPORTANT: DO NOT USE EMOJIS IN ANY TWEETS
    `;
  };

  // Updated generateAIThread function to call Anthropic API directly
  // Add this to your imports if not already there
  // import { getAnthropicKey } from '../Utils/getApikey';

  // Replace your generateAIThread function with this version
  const generateAIThread = async () => {
    playSound(sentSound);
    setIsGenerating(true);
    try {
      let maxTweets;
      switch (threadType) {
        case 'single': maxTweets = 1; break;
        case 'three': maxTweets = 3; break;
        case 'full': maxTweets = 10; break;
        default: maxTweets = 1;
      }

      let promptContent = overallPrompt;
      if (includeProduct) {
        const storedProductInfo = localStorage.getItem('productQuestionnaire');
        if (storedProductInfo) {
          const productData = JSON.parse(storedProductInfo);
          promptContent += "\n\nIncorporate the following information about my product/service into the tweet(s), blending it naturally with my personal journey as an indie founder:\n";
          promptContent += JSON.stringify(productData, null, 2);
        }
      }

      const feelingPrompt = getFeelingPrompt(feeling);

      // Build system prompt based on mode
      let systemPrompt = mode === 'reply'
        ? getReplyStylePrompt(replyLength, replyStance)
        : getBaseSystemPrompt(maxTweets);

      // Append celebrity prompt if celebrity mode is selected
      if (celebrityMode && celebrityPrompts[celebrityMode]) {
        systemPrompt += `\n\nCelebrity Mode Instruction:\n${celebrityPrompts[celebrityMode]}`;
      }

      // Add existing training data
      if (TrainingData) {
        systemPrompt = `${systemPrompt} Here Training Data for this response ${TrainingData}`;
      }

      // Call Anthropic API through our /api/anthropic endpoint
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
            content: `${mode === 'reply' ? 'Generate a reply' : 'Generate a new tweet or thread'} ${threadType === 'single' ? '(single tweet)' : `(thread of ${maxTweets} tweets)`} ${mode === 'reply' ? 'in response to' : 'about'} the following ${mode === 'share' ? 'update' : 'tweet'}: "${promptContent}" ${feelingPrompt} NOTE: i just need the tweet content without any extra text. Don't use emojis unless specifically requested. Don't write numbers in front of each tweet. Include one media suggestion (image or video) per tweet. In the URL, provide text describing what the image or video should show. Use spacing and line breaks to make the tweet stand out.`
          }],
          system: systemPrompt,
          model: "claude-3-5-sonnet-20241022",
          claudapikey: getAnthropicKey()
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const generatedThreadContent = data.content[0].text.split('/endtweet').filter(tweet => tweet.trim() !== '');

      const generatedThread = generatedThreadContent.map((tweetContent) => {
        const { content, images, links, videos } = parseAIResponse(tweetContent);
        return {
          id: Date.now() + Math.random(),
          content,
          images,
          links,
          videos,
          key: Date.now() + Math.random()
        };
      });

      setTweets(generatedThread);
      playSound(receivedSound);
    } catch (error) {
      console.error('Error generating AI thread:', error);
      alert(`Failed to generate AI thread: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const key = localStorage.getItem('anthropicKey');
    if (key && key.startsWith('sk-')) {
      setApikeyAdded(true);
    }
  }, []);

  return (
    <div className="bg-white rounded-md overflow-hidden p-4">
      <div className="p-2 sm:p-4 border-gray-400 grid items-center mb-2 sm:mb-4">
        <div className='bg-white rounded-md p-2 sm:p-4'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-4'>
            <div className='grid gap-2'>
              <h1 className="text-lg sm:text-xl font-bold text-slate-500 mb-2 sm:mb-0">What is this update about?</h1>
              {!apikeyAdded ? (
                <div className='flex items-center gap-2 text-red-500 text-xs sm:text-sm'>
                  <InfoIcon size={20} />
                  Claude API key added seems wrong or invalid - save again.
                </div>
              ) : null}
            </div>

            <div className={`flex items-center p-0.5 rounded-full bg-slate-100 shadow-inner w-fit`}>
              <button
                onClick={() => {
                  setMode('share');
                  playSound(toggleSound);
                }}
                className={`relative px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 ${mode === 'share'
                  ? 'text-white bg-green-600'
                  : 'text-gray-500 hover:text-gray-500'
                  }`}
                aria-pressed={mode === 'share'}
              >
                <span className="relative z-10">Share</span>
                {mode === 'share' && <span className="absolute inset-0 rounded-full bg-green-600 animate-fadeIn" />}
              </button>
              <button
                onClick={() => {
                  setMode('reply');
                  playSound(toggleSound);
                }}
                className={`relative px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 ${mode === 'reply'
                  ? 'text-white bg-green-600'
                  : 'text-gray-500 hover:text-gray-500'
                  }`}
                aria-pressed={mode === 'reply'}
              >
                <span className="relative z-10">Reply</span>
                {mode === 'reply' && <span className="absolute inset-0 rounded-full bg-green-600 animate-fadeIn" />}
              </button>
            </div>
          </div>
          <textarea
            className='w-full p-2 sm:p-4 rounded-md mt-2 sm:mt-4 bg-slate-50 text-slate-900 text-sm sm:text-base border-slate-200 border'
            value={overallPrompt}
            onChange={(e) => setOverallPrompt(e.target.value)}
            placeholder={mode === 'share' ? "I need to share an update with the community.." : "I want to reply to..."}
            rows={4}
          />
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 sm:mt-4 space-y-2 sm:space-y-0'>
            <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
              {mode === 'reply' ? (
                <>
                  <div className='grid'>
                    <label className="font-bold text-xs flex gap-2 mb-2"><LetterText size={14} /> Reply Length</label>
                    <select
                      value={replyLength}
                      onChange={(e) => setReplyLength(e.target.value)}
                      className="p-2 rounded-md bg-white text-black border border-gray-300 text-xs sm:text-sm w-full sm:w-auto"
                    >
                      <option value="super_short">Ultra-Brief Reply</option>
                      <option value="medium">Standard Reply</option>
                      <option value="detailed">Detailed Reply</option>
                    </select>
                  </div>
                  <div className='grid'>
                    <label className="font-bold text-xs flex gap-2 mb-2"> <Eclipse size={14} />Stance</label>
                    <select
                      value={replyStance}
                      onChange={(e) => setReplyStance(e.target.value)}
                      className="p-2 rounded-md bg-white text-black border border-gray-300 text-xs sm:text-sm w-full sm:w-auto"
                    >
                      <option value="neutral">Neutral Stance</option>
                      <option value="in_favour">In Favor</option>
                      <option value="not_in_favour">Not in Favor</option>
                      <option value="controversial">Controversial</option>
                      <option value="advice">Advice</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
                  <div>
                    <label className="font-bold text-xs flex gap-2 mb-2"><LetterText size={14} />Post Length</label>
                    <select
                      value={threadType}
                      onChange={(e) => setThreadType(e.target.value)}
                      className="p-2 rounded-md bg-white text-black border border-gray-300 text-xs sm:text-sm w-full"
                    >
                      <option value="single">Single Tweet</option>
                      <option value="three">3 Tweet Thread</option>
                      <option value="full">Full Thread</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-xs flex gap-2 mb-2"><HeartCrackIcon size={14} />Perspective</label>
                    <select
                      value={feeling}
                      onChange={(e) => setFeeling(e.target.value)}
                      className="p-2 rounded-md bg-white text-black border border-gray-300 text-xs sm:text-sm w-full"
                    >
                      <option value="not_specified">Not Specified</option>
                      <option value="curiosity">🔍 Curiosity</option>
                      <option value="insight">💡 Insight</option>
                      <option value="authenticity">🎭 Authenticity</option>
                      <option value="achievement">🏆 Achievement</option>
                      <option value="helpful">🤝 Helpful</option>
                      <option value="reflection">🤔 Reflection</option>
                      <option value="encouragement">💪 Encouragement</option>
                      <option value="process">⚙️ Process</option>
                      <option value="observation">👀 Observation</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-xs flex gap-2 mb-2"><User size={14} /> Celebrity Mode</label>
                    <select
                      value={celebrityMode}
                      onChange={(e) => setCelebrityMode(e.target.value)}
                      className="p-2 rounded-md bg-white text-black border border-gray-300 text-xs sm:text-sm w-full"
                    >
                      <option value="">None</option>
                      <option value="marclou">Marc Lou</option>
                      <option value="johnrush">John Rush</option>
                      <option value="examplecelebrity">Example Celebrity</option>
                    </select>
                  </div>
                </div>

              )}
            </div>

            {/* Training Data button and multi-select placed side-by-side */}
            <div className="flex items-center gap-2">

              <button
                className='flex gap-2 bg-slate-100 text-slate-600 p-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm'
                onClick={() => setIsTrainingPopupOpen(true)}
              >
                Training Data
              </button>

              {(apiKeyStatus === 'valid' || apiKeyStatus === 'validating') && (
                <button
                  className="bg-green-600 text-white px-4 p-2 rounded-md flex items-center justify-center gap-2 text-slate-900 text-xs sm:text-sm"
                  onClick={generateAIThread}
                  disabled={isGenerating || apiKeyStatus === 'validating'}
                >
                  {isGenerating || apiKeyStatus === 'validating' ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Wand2 size={14} />
                  )}
                  {apiKeyStatus === 'validating' ? 'Validating API Key...' : `Generate ${threadType === 'single' ? 'Tweet' : 'Thread'}`}
                </button>
              )}


            </div>
          </div>

          {/* Popup Modal for Training Data & Multi-select */}
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

                  {profiles && profiles.length > 0 ? (
                    <div className="space-y-2">
                      {profiles.map((profile) => (
                        <div
                          key={profile.id}
                          onClick={() => {
                            handleProfileSelect(profile.id);
                            toast.success(`Profile "${profile.name}" selected`);
                            setIsTrainingPopupOpen(false);
                          }}
                          className={`p-3 rounded-md cursor-pointer flex items-center ${selectedProfile === profile.id
                              ? 'bg-slate-100 border border-slate-300'
                              : 'bg-gray-50 hover:bg-slate-100'
                            }`}
                        >
                          <User size={18} className="mr-2 text-slate-500" />
                          <div className="flex-1">
                            <div className="font-medium">{profile.name || "Unnamed Profile"}</div>
                            {profile.description && (
                              <div className="text-xs text-gray-500">{profile.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-slate-100 rounded-md">
                      <p className="text-gray-500">No profiles found. Please create a profile first.</p>
                      <button
                        className="mt-2 text-sm text-slate-500 hover:underline"
                        onClick={() => {
                          // You can add navigation to profile manager here
                          setIsTrainingPopupOpen(false);
                          // window.location.href = '/profile-manager';
                          toast.info("Please create a profile in the Profile Manager");
                        }}
                      >
                        Create a Profile
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  {selectedProfile && (
                    <button
                      onClick={() => {
                        setSelectedProfile(null);
                        setTraningData('');
                        toast.info("Profile selection cleared");
                      }}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-md"
                    >
                      Clear Selection
                    </button>
                  )}
                  <button
                    onClick={() => setIsTrainingPopupOpen(false)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <div className='bg-slate-200 p-2 sm:p-4 rounded-md'>
        <div className="max-w-full sm:max-w-xl mx-auto border shadow-lg rounded-lg mb-4 sm:mb-8 bg-white">
          {tweets.map((tweet, index) => (
            <div key={tweet.key} className="relative border-b border-gray-200 last:border-b-0">
              <div className="absolute left-0 top-0 -ml-4 sm:-ml-6 mt-2 text-xs font-bold text-slate-500">
                {index + 1}
              </div>
              <div className="p-2 sm:p-4">
                <div className="flex items-center mb-2 sm:mb-4">
                  <img src="https://placehold.co/40x40/333333/ffffff?text=B&font=Raleway" alt="User avatar" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2" />
                  <div>
                    <h2 className="font-bold text-xs sm:text-sm">Big Mouth</h2>
                    <p className="text-gray-500 text-xs">@absurdfounder</p>
                  </div>
                  {tweets.length > 1 && (
                    <button
                      onClick={() => removeTweet(tweet.id)}
                      className="ml-auto text-gray-500 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <TipTapEditor
                  key={tweet.key}
                  content={tweet.content}
                  onUpdate={(content) => handleEditorChange(tweet.id, content)}
                  onImageUpload={() => handleImageUpload(tweet.id)}
                  onVideoUpload={() => handleVideoUpload(tweet.id)}
                  onLinkAdd={() => handleLinkAdd(tweet.id)}
                />
                <TweetContent
                  images={tweet.images}
                  links={tweet.links}
                  videos={tweet.videos}
                />
                <div className="flex space-x-2 mt-2">
                  {/* Additional tweet-specific actions can go here */}
                </div>
              </div>
            </div>
          ))}
          <div className="p-2 sm:p-4">
            <button
              onClick={addNewTweet}
              className="flex items-center text-slate-500 hover:text-slate-500 text-xs sm:text-sm gap-4"
            >
              <PlusCircle size={14} className="mr-1" />
              Add another tweet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadWriter;