import React, { useState } from "react";
import { Play, Cpu, Zap, ArrowRight, Check, Settings, Power } from 'lucide-react';

import SocialBotTable from "./ai-reply-table";

const PostExtractor = () => {
  // State for post type selection and raw HTML input
  const [postType, setPostType] = useState("twitter");
  const [rawHTML, setRawHTML] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [extractionError, setExtractionError] = useState("");

  // State for AI reply generation
  const [aiReply, setAiReply] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);

  const [activeStates, setActiveStates] = useState({
    button1: false,
    button2: false,
    button3: false,
    button4: false,
    button5: false,
    button6: false,
  });

  const toggleActive = (buttonId) => {
    setActiveStates(prev => ({
      ...prev,
      [buttonId]: !prev[buttonId]
    }));
  };

  // --- Extraction Functions ---
  const extractData = (html) => {
    try {
      let data;
      if (postType === "twitter") {
        data = extractTwitterData(html);
      } else if (postType === "reddit") {
        data = extractRedditData(html);
      } else if (postType === "telegram") {
        data = extractTelegramData(html);
      } else if (postType === "discord") {
        data = extractDiscordData(html);
      }
      setExtractedData(data);
      setExtractionError("");
      setAiReply(null);
      setAiError(null);
      return data;
    } catch (err) {
      setExtractionError(err.message);
      setExtractedData(null);
      setAiReply(null);
      setAiError(null);
      throw err;
    }
  };

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

    // Extract user name
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
    // Extract avatar URL
    const avatarElem = doc.querySelector('[data-testid^="UserAvatar-Container"] img');
    if (avatarElem) {
      avatarUrl = avatarElem.getAttribute("src") || "";
    }
    // Extract tweet text
    const tweetTextElem = doc.querySelector('[data-testid="tweetText"]');
    if (tweetTextElem) {
      tweetText = tweetTextElem.textContent.trim();
    } else {
      const articleElements = doc.querySelectorAll('article div[lang]');
      if (articleElements.length > 0) {
        tweetText = Array.from(articleElements)
          .map((el) => el.textContent.trim())
          .join("\n\n");
      }
    }
    if (!tweetText) tweetText = "No text content found";
    // Extract attachment URL (image) if present
    const imageElem = doc.querySelector('[data-testid="tweetPhoto"] img');
    if (imageElem) attachmentUrl = imageElem.getAttribute("src") || "";
    // Extract tweet date
    const timeElem = doc.querySelector("time");
    if (timeElem && timeElem.getAttribute("datetime")) {
      date = timeElem.getAttribute("datetime");
      try {
        date = new Date(date).toLocaleString();
      } catch (e) { /* keep original */ }
    }
    // Extract tweet URL
    const tweetLinkElem = doc.querySelector('a[role="link"][href*="/status/"]');
    if (tweetLinkElem) {
      const href = tweetLinkElem.getAttribute("href");
      if (href) tweetURL = href.startsWith("http") ? href : `https://twitter.com${href}`;
    }
    // Extract user handle
    const userHandleElem = doc.querySelector('div[data-testid="User-Name"] + div span');
    if (userHandleElem && userHandleElem.textContent.trim().startsWith('@')) {
      userHandle = userHandleElem.textContent.trim();
    } else {
      const handleElements = Array.from(doc.querySelectorAll('a[href]'));
      for (const elem of handleElements) {
        const text = elem.textContent.trim();
        if (text.startsWith('@') && text.length > 1 && !text.includes("\n")) {
          userHandle = text;
          break;
        }
      }
    }
    // Helper to extract metrics
    const extractMetric = (metricType) => {
      const metricElem = doc.querySelector(`[data-testid="${metricType.toLowerCase()}"]`);
      if (metricElem) {
        const ariaLabel = metricElem.getAttribute("aria-label");
        if (ariaLabel) {
          const matches = ariaLabel.match(/([\d,]+)/);
          if (matches && matches[1]) return parseInt(matches[1].replace(/,/g, ""), 10);
        }
        const textSpan = metricElem.querySelector('span[data-testid="app-text-transition-container"] span');
        if (textSpan && textSpan.textContent) {
          const text = textSpan.textContent.trim();
          if (/^\d+$/.test(text)) return parseInt(text, 10);
          if (text.endsWith("K")) return parseFloat(text) * 1000;
          if (text.endsWith("M")) return parseFloat(text) * 1000000;
        }
        const group = metricElem?.closest('div[role="group"]');
        if (group) {
          const text = group.textContent || group.innerText || "";
          const matches = text.match(/([\d,]+)/);
          if (matches && matches[1]) return parseInt(matches[1].replace(/,/g, ""), 10);
        }
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
      const contentContainer = article.querySelector('[data-post-click-location="text-body"]');
      if (contentContainer) {
        const paragraphs = contentContainer.querySelectorAll("p");
        if (paragraphs.length > 0) {
          content = Array.from(paragraphs)
            .map((p) => p.textContent.trim())
            .join("\n\n");
        } else {
          content = contentContainer.textContent.trim();
        }
      } else {
        const legacyPostBody = article.querySelector(".md");
        if (legacyPostBody) content = legacyPostBody.textContent.trim();
      }
      if (permalink && !permalink.startsWith("http")) {
        permalink = `https://www.reddit.com${permalink}`;
      }
    } else {
      console.warn("shreddit-post element not found, attempting fallback selectors.");
      const titleElem =
        doc.querySelector('[data-adclicklocation="title"] h1') || doc.querySelector("h1[slot='title']");
      if (titleElem) postTitle = titleElem.textContent.trim();
      const authorLink = doc.querySelector('a[data-testid="post_author_link"]');
      if (authorLink) author = authorLink.textContent.trim();
      const subredditLink = doc.querySelector('a[data-testid="post_subreddit_link"]');
      if (subredditLink) subreddit = subredditLink.textContent.trim();
      const contentArea = doc.querySelector('[data-click-id="text"]');
      if (contentArea) {
        const paragraphs = contentArea.querySelectorAll("p");
        if (paragraphs.length > 0) {
          content = Array.from(paragraphs)
            .map((p) => p.textContent.trim())
            .join("\n\n");
        } else {
          content = contentArea.textContent.trim();
        }
      }
    }
    const numericScore = parseInt(score.replace(/,/g, ""), 10);
    return {
      postType: "reddit",
      post_title: postTitle,
      author,
      subreddit,
      permalink,
      score: isNaN(numericScore) ? 0 : numericScore,
      icon_url: icon,
      content: content || postTitle,
    };
  };

  const extractTelegramData = (html) => {
    console.warn("Telegram extraction is a placeholder. Adapt selectors based on actual HTML.");
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    let author = "Unknown Author",
      messageText = "No text content found",
      date = "Unknown Date",
      messageUrl = "URL not found",
      avatarUrl = "";
    const messageBubble = doc.querySelector(".tgme_widget_message_bubble");
    const authorElem = messageBubble?.querySelector(".tgme_widget_message_author_name");
    const textElem = messageBubble?.querySelector(".tgme_widget_message_text");
    const dateElem = messageBubble?.querySelector(".tgme_widget_message_date time");
    const linkElem = messageBubble?.querySelector(".tgme_widget_message_date a");
    const avatarElem = doc.querySelector(".tgme_widget_message_user_photo img");
    if (authorElem) author = authorElem.textContent.trim();
    if (textElem) messageText = textElem.innerHTML.trim();
    if (dateElem) date = dateElem.getAttribute("datetime");
    if (linkElem) messageUrl = linkElem.getAttribute("href");
    if (avatarElem) avatarUrl = avatarElem.getAttribute("src");
    return {
      postType: "telegram",
      author_name: author,
      message_text: messageText,
      date: date,
      message_url: messageUrl,
      avatar_url: avatarUrl,
    };
  };

  const extractDiscordData = (html) => {
    console.warn("Discord extraction is a placeholder. Adapt selectors based on actual HTML.");
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    let userName = "Unknown User",
      timestamp = "Unknown Time",
      messageContent = "No text content found",
      avatarUrl = "",
      messageUrl = "URL not found";
    const messageCozy = doc.querySelector(".messageCozy_f5869e");
    const avatarElem = messageCozy?.querySelector(".avatar_f8541f");
    const usernameElem = messageCozy?.querySelector(".username_d30d99");
    const timestampElem = messageCozy?.querySelector(".timestamp_c79dd2");
    const contentElem = messageCozy?.querySelector(".contents_f5869e .markup_a7e664");
    const messageLinkElem = messageCozy?.querySelector('a[href*="/channels/"]');
    if (usernameElem) userName = usernameElem.textContent.trim();
    if (timestampElem) timestamp = timestampElem.textContent.trim();
    if (contentElem) messageContent = contentElem.textContent.trim();
    if (avatarElem) avatarUrl = avatarElem.getAttribute("src");
    if (messageLinkElem) messageUrl = messageLinkElem.getAttribute("href");
    return {
      postType: "discord",
      user_name: userName,
      message_content: messageContent,
      timestamp: timestamp,
      avatar_url: avatarUrl,
      message_url: messageUrl,
    };
  };

  // --- Event Handlers ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rawHTML.trim()) {
      setExtractionError("Please paste post HTML content");
      setExtractedData(null);
      setAiReply(null);
      setAiError(null);
      return;
    }
    setExtractionError("");
    setExtractedData(null);
    setAiReply(null);
    setAiError(null);
    try {
      extractData(rawHTML);
    } catch (err) {
      console.error("Extraction failed:", err);
    }
  };

  // AI reply generation using the correct payload structure
  const handleGenerateReply = async () => {
    if (!extractedData) {
      setAiError("No extracted data available to generate a reply from.");
      return;
    }
    // Determine the primary text content based on post type
    let inputText = "";
    switch (extractedData.postType) {
      case "twitter":
        inputText = extractedData.tweet_text;
        break;
      case "reddit":
        inputText = extractedData.content || extractedData.post_title;
        break;
      case "telegram":
        inputText = extractedData.message_text;
        break;
      case "discord":
        inputText = extractedData.message_content;
        break;
      default:
        setAiError(`AI reply generation not configured for post type: ${extractedData.postType}`);
        return;
    }
    if (!inputText || inputText.trim() === "" || inputText.trim() === "No text content found") {
      setAiError("No usable text content found in the extracted data to generate a reply.");
      return;
    }
    setIsGenerating(true);
    setAiError(null);
    setAiReply(null);

    // Build the prompt and payload using the correct structure
    const prompt = `Generate a concise and relevant social media style reply (max 2 sentences) to the following post content:\n\n"${inputText}"\n\nReply:`;
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    };

    // WARNING: Calling the Google API directly from the client exposes your API key.
    // This code is for testing purposes only.
    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBT3_dk3KhmZHFh1FZ_q5TgUSP1_CsW3mc`;

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to generate reply");
      }
      const data = await response.json();
      let generatedText = "Error: Could not parse reply from API response.";
      if (data.candidates && data.candidates[0]?.content?.parts && data.candidates[0].content.parts[0]?.text) {
        generatedText = data.candidates[0].content.parts[0].text;
      } else {
        console.warn("Unexpected API response structure:", data);
      }
      setAiReply(generatedText.trim());
    } catch (error) {
      console.error("AI Generation Fetch Error:", error);
      setAiError(error.message || "Failed to generate AI reply due to a network or API error.");
      setAiReply(null);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Render ---
  return (
    <div className="w-full max-w-6xl mx-auto my-6 px-4 sm:px-6 md:my-10">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">
            Extract & Generate Reply
          </h1>

          <div className="flex items-center bg-gray-50 p-2 rounded-full">
            <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium mr-2 bg-green-100 text-green-800 flex items-center">
              <Check size={16} className="mr-1 hidden sm:inline" />
              <span className="truncate">Connected</span>
            </span>
            <button className="p-1 sm:p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
              <Settings size={16} className="text-slate-700" />
            </button>
          </div>
        </div>

        {/* Automation Button */}
        <div className="rounded-lg shadow-md mb-6">
          <button
            onClick={() => toggleActive('button3')}
            className={`w-full flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-3 px-4 sm:px-6 rounded-md transition-all duration-300 ${
              activeStates.button3
                ? "bg-teal-50 text-teal-600 border border-teal-500"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
          >
            {activeStates.button3 ? (
              <>
                <span className="relative flex h-2 sm:h-3 w-2 sm:w-3">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="rounded-full h-2 sm:h-3 w-2 sm:w-3 bg-teal-500"></span>
                </span>
                <span className="text-sm sm:text-base">Running</span>
              </>
            ) : (
              <>
                <Zap size={16} className="sm:size-18" />
                <span className="text-sm sm:text-base">Start Automation</span>
              </>
            )}
          </button>
        </div>

        {/* Channel Selection */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-sm font-medium sm:text-base">Select Channel</h2>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {["twitter", "reddit", "telegram", "discord"].map((type) => (
              <button
                key={type}
                onClick={() => setPostType(type)}
                className={`px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded transition-colors duration-150 ${
                  postType === type
                    ? "bg-slate-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={rawHTML}
            onChange={(e) => setRawHTML(e.target.value)}
            placeholder={`Paste raw ${postType} post HTML here...`}
            rows={6}
            className="w-full p-3 border border-gray-300 rounded mb-4 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            aria-label="Raw HTML Input"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white text-sm sm:text-base rounded hover:bg-green-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Extract Data
          </button>
        </form>

        {/* Error Messages */}
        {extractionError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
            <strong>Extraction Error:</strong> {extractionError}
          </div>
        )}

        {/* Extracted Data Display */}
        {extractedData && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Extracted Data:</h2>
            <div className="bg-gray-100 p-3 sm:p-4 rounded overflow-x-auto border border-gray-200">
              <pre className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                {JSON.stringify(extractedData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* AI Reply Section */}
        {extractedData && !extractionError && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold mb-3">Generate AI Reply</h2>
            <button
              onClick={handleGenerateReply}
              disabled={isGenerating}
              className={`px-4 py-2 rounded text-white text-sm sm:text-base transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${
                isGenerating ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isGenerating ? "Generating..." : "Generate Reply with AI"}
            </button>

            {aiError && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
                <strong>AI Error:</strong> {aiError}
              </div>
            )}

            {aiReply && !isGenerating && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-gray-700">Suggested Reply:</h3>
                <textarea
                  readOnly
                  value={aiReply}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded bg-gray-50 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  aria-label="Suggested AI Reply"
                />
              </div>
            )}
          </div>
        )}

        {/* Social Bot Table Component */}
        <div className="mt-8">
          <SocialBotTable />
        </div>
      </div>
    </div>
  );
};

export default PostExtractor;