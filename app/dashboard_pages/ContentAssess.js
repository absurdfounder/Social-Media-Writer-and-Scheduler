"use client";

import React, { useState, useEffect } from "react";
import { 
  Check, 
  Settings, 
  Twitter, 
  MessageCircle, 
  Send, 
  Discord, 
  Filter, 
  EyeOff, 
  Code, 
  Trash2, 
  Layers 
} from 'lucide-react';
import SocialBotTable from "./SocialBotTable";

export default function PostExtractor() {
  const [postType, setPostType] = useState("twitter");
  const [rawHTML, setRawHTML] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [extractionError, setExtractionError] = useState("");
  const [activeStates, setActiveStates] = useState({
    button1: false,
    button2: false,
    button3: false,
    button4: false,
    button5: false,
    button6: false,
  });

  // Posts + dedupe
  const [posts, setPosts] = useState([]);
  const seenKeys = React.useRef(new Set());

  // Toggles
  const [hideDuplicates, setHideDuplicates] = useState(false);
  const [showExtractedJSON, setShowExtractedJSON] = useState(false);

  // — START_TRACKER → content script —
  useEffect(() => {
    if (activeStates.button3) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (!tabId) return;
        chrome.tabs.sendMessage(tabId, { type: "START_TRACKER" });
      });
    }
  }, [activeStates.button3]);
  // — end START_TRACKER —

  const toggleActive = (buttonId) => {
    setActiveStates(prev => ({
      ...prev,
      [buttonId]: !prev[buttonId]
    }));
  };

  // --- Extraction Functions ---

  const extractTwitterData = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    let userName = "Unknown",
      avatarUrl = "",
      tweetText = "No text content found",
      attachmentUrl = "",
      date = "Unknown date",
      tweetURL = "URL not found",
      userHandle = "Unknown",
      likeCount = 0,
      retweetCount = 0,
      replyCount = 0;

    const userNameElem = doc.querySelector('[data-testid="User-Name"]');
    if (userNameElem) {
      userName = userNameElem.textContent.trim();
    } else {
      const possibleNameElements = doc.querySelectorAll('div[dir="auto"] span');
      for (const elem of possibleNameElements) {
        if (elem.textContent && !elem.textContent.includes('@') && elem.textContent.length > 0) {
          userName = elem.textContent.trim();
          break;
        }
      }
    }

    const avatarElem = doc.querySelector('[data-testid^="UserAvatar-Container"] img');
    if (avatarElem) avatarUrl = avatarElem.src;

    const tweetTextElem = doc.querySelector('[data-testid="tweetText"]');
    if (tweetTextElem) {
      tweetText = tweetTextElem.textContent.trim();
    } else {
      const articleElements = doc.querySelectorAll('article div[lang]');
      if (articleElements.length) {
        tweetText = Array.from(articleElements)
          .map(el => el.textContent.trim())
          .join("\n\n");
      }
    }

    const imageElem = doc.querySelector('[data-testid="tweetPhoto"] img');
    if (imageElem) attachmentUrl = imageElem.src;

    const timeElem = doc.querySelector("time");
    if (timeElem && timeElem.dateTime) {
      date = new Date(timeElem.dateTime).toLocaleString();
    }

    const tweetLinkElem = doc.querySelector('a[role="link"][href*="/status/"]');
    if (tweetLinkElem) {
      const href = tweetLinkElem.getAttribute("href");
      tweetURL = href.startsWith("http") ? href : `https://twitter.com${href}`;
    }

    const userHandleElem = doc.querySelector('div[data-testid="User-Name"] + div span');
    if (userHandleElem && userHandleElem.textContent.trim().startsWith('@')) {
      userHandle = userHandleElem.textContent.trim();
    } else {
      Array.from(doc.querySelectorAll('a[href]')).some(elem => {
        const t = elem.textContent.trim();
        if (t.startsWith('@') && t.length > 1 && !t.includes("\n")) {
          userHandle = t;
          return true;
        }
      });
    }

    const extractMetric = (type) => {
      const el = doc.querySelector(`[data-testid="${type.toLowerCase()}"]`);
      if (!el) return 0;
      const aria = el.getAttribute("aria-label") || "";
      const m = aria.match(/([\d,]+)/);
      if (m) return parseInt(m[1].replace(/,/g, ""), 10);
      const span = el.querySelector('span[data-testid="app-text-transition-container"] span');
      if (span) {
        const txt = span.textContent.trim();
        if (/^\d+$/.test(txt)) return parseInt(txt, 10);
        if (txt.endsWith("K")) return parseFloat(txt) * 1000;
        if (txt.endsWith("M")) return parseFloat(txt) * 1000000;
      }
      const grp = el.closest('div[role="group"]');
      if (grp) {
        const txt = grp.textContent.match(/([\d,]+)/);
        if (txt) return parseInt(txt[1].replace(/,/g, ""), 10);
      }
      return 0;
    };

    likeCount = extractMetric("like");
    retweetCount = extractMetric("retweet");
    replyCount = extractMetric("reply");

    return {
      postType: "twitter",
      user_name: userName,
      user_handle: userHandle,
      avatar_url: avatarUrl,
      tweet_text: tweetText,
      attachment_url: attachmentUrl,
      date,
      tweet_url: tweetURL,
      metrics: { likes: likeCount, retweets: retweetCount, replies: replyCount },
    };
  };

  const extractRedditData = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    let postTitle = "Unknown Title",
      author = "Unknown",
      subreddit = "Unknown",
      permalink = "",
      score = "0",
      icon = "",
      content = "";

    const article = doc.querySelector("shreddit-post");
    if (article) {
      postTitle = article.getAttribute("post-title") || postTitle;
      author = article.getAttribute("author") || author;
      subreddit = article.getAttribute("subreddit-prefixed-name") || subreddit;
      permalink = article.getAttribute("permalink") || permalink;
      score = article.getAttribute("score") || score;
      icon = article.getAttribute("icon-url") || article.getAttribute("profile-icon-url") || icon;

      const body = article.querySelector('[data-post-click-location="text-body"]');
      if (body) {
        const ps = body.querySelectorAll("p");
        if (ps.length) {
          content = Array.from(ps).map(p => p.textContent.trim()).join("\n\n");
        } else {
          content = body.textContent.trim();
        }
      } else {
        const legacy = article.querySelector(".md");
        if (legacy) content = legacy.textContent.trim();
      }

      if (permalink && !permalink.startsWith("http")) {
        permalink = `https://www.reddit.com${permalink}`;
      }
    } else {
      const titleElem = doc.querySelector('[data-adclicklocation="title"] h1') || doc.querySelector("h1[slot='title']");
      if (titleElem) postTitle = titleElem.textContent.trim();
      const authorLink = doc.querySelector('a[data-testid="post_author_link"]');
      if (authorLink) author = authorLink.textContent.trim();
      const subLink = doc.querySelector('a[data-testid="post_subreddit_link"]');
      if (subLink) subreddit = subLink.textContent.trim();
      const contentArea = doc.querySelector('[data-click-id="text"]');
      if (contentArea) {
        const ps = contentArea.querySelectorAll("p");
        if (ps.length) {
          content = Array.from(ps).map(p => p.textContent.trim()).join("\n\n");
        } else {
          content = contentArea.textContent.trim();
        }
      }
    }

    const numericScore = parseInt(score.replace(/,/g, ""), 10) || 0;
    return {
      postType: "reddit",
      post_title: postTitle,
      author,
      subreddit,
      permalink,
      score: numericScore,
      icon_url: icon,
      content: content || postTitle,
    };
  };

  const extractTelegramData = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    let author = "Unknown Author",
      messageText = "No text content found",
      date = "Unknown Date",
      messageUrl = "URL not found",
      avatarUrl = "";

    const bubble = doc.querySelector(".tgme_widget_message_bubble");
    if (bubble) {
      const aElem = bubble.querySelector(".tgme_widget_message_author_name");
      const tElem = bubble.querySelector(".tgme_widget_message_text");
      const dElem = bubble.querySelector(".tgme_widget_message_date time");
      const lElem = bubble.querySelector(".tgme_widget_message_date a");
      if (aElem) author = aElem.textContent.trim();
      if (tElem) messageText = tElem.innerHTML.trim();
      if (dElem && dElem.dateTime) date = dElem.dateTime;
      if (lElem) messageUrl = lElem.href;
    }
    const avatarElem = doc.querySelector(".tgme_widget_message_user_photo img");
    if (avatarElem) avatarUrl = avatarElem.src;

    return {
      postType: "telegram",
      author_name: author,
      message_text: messageText,
      date,
      message_url: messageUrl,
      avatar_url: avatarUrl,
    };
  };

  const extractDiscordData = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    let userName = "Unknown User",
      timestamp = "Unknown Time",
      messageContent = "No text content found",
      avatarUrl = "",
      messageUrl = "URL not found";

    const cozy = doc.querySelector(".messageCozy_f5869e");
    if (cozy) {
      const uElem = cozy.querySelector(".username_d30d99");
      const tElem = cozy.querySelector(".timestamp_c79dd2");
      const cElem = cozy.querySelector(".contents_f5869e .markup_a7e664");
      const aElem = cozy.querySelector(".avatar_f8541f img");
      const lElem = cozy.querySelector('a[href*="/channels/"]');
      if (uElem) userName = uElem.textContent.trim();
      if (tElem) timestamp = tElem.textContent.trim();
      if (cElem) messageContent = cElem.textContent.trim();
      if (aElem) avatarUrl = aElem.src;
      if (lElem) messageUrl = lElem.href;
    }

    return {
      postType: "discord",
      user_name: userName,
      message_content: messageContent,
      timestamp,
      avatar_url: avatarUrl,
      message_url: messageUrl,
    };
  };

  const extractData = (html) => {
    if (postType === "twitter") return extractTwitterData(html);
    if (postType === "reddit") return extractRedditData(html);
    if (postType === "telegram") return extractTelegramData(html);
    if (postType === "discord") return extractDiscordData(html);
    throw new Error("Unknown post type: " + postType);
  };

  // Listen for messages
  useEffect(() => {
    const handleMessage = (event) => {
      const msg = event.data;
      if (msg.type === 'PASTE_HTML') {
        setRawHTML(msg.payload);
        setExtractedData(null);
        setExtractionError("");
      } else if (msg.type === 'EXTRACTED_DATA') {
        setExtractionError("");
        setExtractedData(msg.payload);

        const data = msg.payload;
        const key = data.tweet_url || data.permalink || `${data.postType}-${Date.now()}`;
        if (!seenKeys.current.has(key)) {
          seenKeys.current.add(key);
          setPosts(prev => [
            ...prev,
            {
              key,
              id: Date.now(),
              username: data.user_handle || data.author || 'unknown',
              platform: data.postType,
              avatar: data.avatar_url || data.icon_url || '/api/placeholder/40/40',
              group: data.subreddit || data.group || null,
              content:
                data.tweet_text ||
                data.content ||
                data.message_text ||
                data.message_content ||
                '',
              priority: 'medium',
              timestamp: new Date().toLocaleTimeString(),
              attachment: data.attachment_url || null,
              metrics: data.metrics || { likes: 0, retweets: 0, replies: 0 },
            }
          ]);
        }
      } else if (msg.type === 'EXTRACT_ERROR') {
        setExtractedData(null);
        setExtractionError(msg.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [postType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rawHTML.trim()) {
      setExtractionError("Please paste post HTML content");
      setExtractedData(null);
      return;
    }
    setExtractionError("");
    setExtractedData(null);

    try {
      const data = extractData(rawHTML);
      const key = data.tweet_url || data.permalink || `${data.postType}-${Date.now()}`;
      if (!seenKeys.current.has(key)) {
        seenKeys.current.add(key);
        setPosts(prev => [
          ...prev,
          {
            key,
            id: prev.length + 1,
            username: data.user_handle || data.author || "unknown",
            platform: postType,
            avatar: data.avatar_url || data.icon_url || '/api/placeholder/40/40',
            group: data.subreddit || data.group || null,
            content: data.tweet_text || data.content || data.message_text || data.message_content,
            priority: "medium",
            timestamp: new Date().toLocaleTimeString(),
            attachment: data.attachment_url || null,
            metrics: data.metrics || { likes: 0, retweets: 0, replies: 0 },
          }
        ]);
      }
    } catch (err) {
      console.error("Extraction failed:", err);
      setExtractionError("Extraction failed: " + err.message);
    }
  };

  // Get the icon based on platform type
  const getPlatformIcon = (type) => {
    switch(type) {
      case "twitter": return <Twitter size={18} />;
      case "reddit": return <MessageCircle size={18} />;
      case "telegram": return <Send size={18} />;
      case "discord": return <Discord size={18} />;
      default: return <MessageCircle size={18} />;
    }
  };

  const clearAllPosts = () => {
    setPosts([]);
    seenKeys.current.clear();
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-6 px-4 sm:px-6 md:my-10">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-800 mr-4">Social Post Extractor</h2>
            <div className="flex items-center bg-gray-50 p-2 rounded-full">
              <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium mr-2 bg-green-100 text-green-800 flex items-center">
                <Check size={16} className="mr-1 hidden sm:inline" />
                <span className="truncate">Connected</span>
              </span>
              <button 
                className="p-1 sm:p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                title="Settings"
              >
                <Settings size={16} className="text-slate-700" />
              </button>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => toggleActive('button3')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                activeStates.button3 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <Layers size={16} className="mr-2" />
                Track Posts
              </div>
            </button>
            
            <button
              onClick={clearAllPosts}
              className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <div className="flex items-center">
                <Trash2 size={16} className="mr-2" />
                Clear All
              </div>
            </button>
          </div>
        </div>
        
        {/* Platform Selection */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {["twitter", "reddit", "telegram", "discord"].map((platform) => (
              <button
                key={platform}
                onClick={() => setPostType(platform)}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                  postType === platform
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getPlatformIcon(platform)}
                <span className="ml-2 capitalize">{platform}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {extractionError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
            <strong>Extraction Error:</strong> {extractionError}
          </div>
        )}

        {/* HTML Input Area */}
        <div className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="rawHTML" className="block text-sm font-medium text-gray-700 mb-1">
                Paste Post HTML
              </label>
              <textarea
                id="rawHTML"
                value={rawHTML}
                onChange={(e) => setRawHTML(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                rows="4"
                placeholder={`Paste ${postType} post HTML here...`}
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Extract Data
              </button>
            </div>
          </form>
        </div>

        {/* Extracted Data JSON Toggle */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            {extractedData && (
              <button
                onClick={() => setShowExtractedJSON(!showExtractedJSON)}
                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
              >
                <Code size={16} className="mr-1" />
                {showExtractedJSON ? "Hide" : "Show"} Extracted JSON
              </button>
            )}
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={hideDuplicates}
                onChange={() => setHideDuplicates(!hideDuplicates)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm flex items-center">
                <EyeOff size={14} className="mr-1" />
                Hide duplicates
              </span>
            </label>
          </div>
          
          {showExtractedJSON && extractedData && (
            <div className="mt-3 bg-gray-100 p-3 rounded overflow-x-auto border border-gray-200">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(extractedData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-auto border rounded-lg shadow-sm">
          <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
            <h3 className="font-medium text-gray-700 flex items-center">
              <Filter size={16} className="mr-2" />
              Extracted Posts ({posts.length})
            </h3>
          </div>
          <div className="max-h-[60vh] overflow-auto">
            <SocialBotTable
              posts={
                hideDuplicates
                  ? posts.filter((post, idx, arr) =>
                      arr.findIndex(p => p.key === post.key) === idx
                    )
                  : posts
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}