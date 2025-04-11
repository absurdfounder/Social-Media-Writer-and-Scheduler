"use client";

import React, { useState, useEffect } from "react";
import { Check, Settings, Zap, RefreshCw, Eye, EyeOff, Twitter, MessageCircle, Share2, Filter } from 'lucide-react';
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

  // Platform selector icons
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "twitter": return <Twitter size={18} />;
      case "reddit": return <MessageCircle size={18} />;
      case "telegram": return <MessageCircle size={18} />;
      case "discord": return <Share2 size={18} />;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-6 px-4 sm:px-6 md:my-10">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">


          <div className="flex space-x-2 justify-between w-full">
            <div className="flex items-center">
              <div className="flex items-center bg-gray-100 p-2 rounded-full border">
                <span className="px-2 sm:px-3 py-1 rounded-full border text-xs sm:text-sm font-medium mr-2 bg-green-100 text-green-800 flex items-center">
                  <Check size={16} className="mr-1 hidden sm:inline" />
                  <span className="truncate">Connected</span>
                </span>
                <button className="p-1 sm:p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                  <Settings size={16} className="text-slate-700" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setPosts([])}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 text-xs font-medium flex items-center"
            >
              <RefreshCw size={16} className="mr-1" />
              Clear All
            </button>



          </div>
        </div>

        {/* Platform Selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {["twitter", "reddit", "telegram", "discord"].map((platform) => (
              <button
                key={platform}
                onClick={() => setPostType(platform)}
                className={`px-3 py-2 rounded-md flex items-center ${postType === platform
                  ? 'bg-green-600 text-white'
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

        {/* Manual Extract Form */}
        <div className="hidden mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-md font-medium text-gray-700 mb-3">Manual Extraction</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={rawHTML}
              onChange={(e) => setRawHTML(e.target.value)}
              placeholder={`Paste ${postType} HTML here...`}
              className="w-full h-24 p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium flex items-center justify-center"
            >
              <Zap size={16} className="mr-2" />
              Extract {postType.charAt(0).toUpperCase() + postType.slice(1)} Data
            </button>
          </form>
        </div>

        {/* Extracted Data JSON Toggle */}
        {extractedData && (
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowExtractedJSON(!showExtractedJSON)}
                className="mb-2 text-indigo-600 hover:underline text-sm flex items-center"
              >
                {showExtractedJSON ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
                {showExtractedJSON ? "Hide" : "Show"} Extracted Data JSON
              </button>
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={hideDuplicates}
                  onChange={() => setHideDuplicates(!hideDuplicates)}
                  className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                />
                <span className="text-sm flex items-center">
                  <Filter size={14} className="mr-1" />
                  Hide duplicates
                </span>
              </label>
            </div>
            {showExtractedJSON && (
              <div className="bg-gray-100 p-3 rounded overflow-x-auto">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(extractedData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Posts Header */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-800">Posts ({posts.length})</h3>
          {posts.length > 0 && (
            <span className="text-sm text-gray-500">
              {hideDuplicates ? 'Showing unique posts only' : 'Showing all posts'}
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-[60vh] border rounded-lg">
          {posts.length > 0 ? (
            <SocialBotTable
              posts={
                hideDuplicates
                  ? posts.filter((post, idx, arr) =>
                    arr.findIndex(p => p.key === post.key) === idx
                  )
                  : posts
              }
            />
          ) : (
            <div className="py-12 text-center text-gray-500">
              <p>No posts tracked yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}