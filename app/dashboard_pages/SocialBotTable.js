"use client";

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Eye,
  Reply,
  Star,
  Twitter,
  Facebook,
  MessageCircle,
  Users,
  X,
} from 'lucide-react';
import ReplyModal from './ReplyModal';

export default function SocialBotTable({ posts }) {
  // Filter states
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");

  // View modal
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reply modal
  const [replyPost, setReplyPost] = useState(null);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyGenerated, setReplyGenerated] = useState(null);
  const [replyError, setReplyError] = useState(null);

  // Quote modal
  const [quotePost, setQuotePost] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteGenerated, setQuoteGenerated] = useState(null);
  const [quoteError, setQuoteError] = useState(null);

  // Repost modal
  const [repostPost, setRepostPost] = useState(null);
  const [repostLoading, setRepostLoading] = useState(false);
  const [repostGenerated, setRepostGenerated] = useState(null);
  const [repostError, setRepostError] = useState(null);

  // Computed posts with relevance scores
  const [computedPosts, setComputedPosts] = useState([]);
  const [relevanceLoading, setRelevanceLoading] = useState(false);

  // Shared AI generator for Reply, Quote, Repost, etc.
  async function generateAIContent(prompt, setLoading, setError, setResult) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/gen', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }
      // Extract the generated text from the response's content array.
      const generatedText =
        data.content && data.content.length > 0
          ? data.content[0].text
          : 'No content generated.';
      setResult(generatedText);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  // Compute relevance for a single post using Gemini API (kept unchanged)
  async function generateRelevanceForPost(post, prompt) {
    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBT3_dk3KhmZHFh1FZ_q5TgUSP1_CsW3mc`;
    const requestBody = { contents: [{ parts: [{ text: prompt }] }] };
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Generation failed');
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      const score = parseFloat(text);
      if (isNaN(score)) {
        return "N/A";
      }
      return `${score}%`;
    } catch (error) {
      console.error("Error generating relevance for post", post.id, error);
      return "Error";
    }
  }

  // Compute relevance for all posts when posts change
  async function computeRelevanceForAllPosts() {
    setRelevanceLoading(true);
    try {
      const results = await Promise.all(
        posts.map(async (post) => {
          const prompt = `Evaluate the relevance of the following tweet to the topic "market sale". Provide the relevance as a percentage from 0 to 100. Only output the number.\n\n"${post.tweet_text || post.content}"`;
          const relevance = await generateRelevanceForPost(post, prompt);
          return { ...post, relevance };
        })
      );
      const sorted = results.sort((a, b) => {
        const getVal = (item) => {
          const num = parseFloat(item.relevance);
          return isNaN(num) ? 0 : num;
        };
        return getVal(b) - getVal(a);
      });
      setComputedPosts(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setRelevanceLoading(false);
    }
  }

  // When posts change, compute relevance automatically
  useEffect(() => {
    if (posts && posts.length) {
      computeRelevanceForAllPosts();
    }
  }, [posts]);

  // Delete a tweet from the computed posts list
  function handleDeleteTweet(id) {
    const updated = computedPosts.filter(post => post.id !== id);
    setComputedPosts(updated);
  }

  // Handlers for Reply, Quote, Repost, and Post View

  const handleGenerateReplyForPost = (post) => {
    setReplyPost(post);
    let prompt = `Generate a concise and relevant social media style reply (max 2 sentences) to the following post content:\n\n"${post.tweet_text || post.content}"`;
    if (post.attachment_url || post.attachment) {
      prompt += `\n\nAttachment URL: ${post.attachment_url || post.attachment}`;
    }
    prompt += `\n\nReply:`;
    generateAIContent(prompt, setReplyLoading, setReplyError, setReplyGenerated);
  };

  const handleReplyClick = (post) => {
    handleGenerateReplyForPost(post);
  };

  const handleQuoteClick = (post) => {
    setQuotePost(post);
    let prompt = `Write a concise “quote tweet” that offers a learning or new perspective on:\n\n"${post.tweet_text || post.content}"`;
    if (post.attachment_url || post.attachment) {
      prompt += `\n\nAttachment URL: ${post.attachment_url || post.attachment}`;
    }
    prompt += `\n\nQuote Tweet:`;
    generateAIContent(prompt, setQuoteLoading, setQuoteError, setQuoteGenerated);
  };

  const handleRepostClick = (post) => {
    setRepostPost(post);
    let prompt = `Rewrite the following tweet in your own words, preserving its meaning and tone:\n\n"${post.tweet_text || post.content}"`;
    if (post.attachment_url || post.attachment) {
      prompt += `\n\nAttachment URL: ${post.attachment_url || post.attachment}`;
    }
    prompt += `\n\nRewritten Tweet:`;
    generateAIContent(prompt, setRepostLoading, setRepostError, setRepostGenerated);
  };

  const openPostModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleViewReplyNow = () => {
    if (selectedPost) {
      handleGenerateReplyForPost(selectedPost);
      closeModal();
    }
  };

  // Apply filters to computed posts
  const filteredPosts = computedPosts.filter((post) => {
    const matchesPriority = priorityFilter === "all" || post.priority === priorityFilter;
    const matchesChannel = channelFilter === "all" || post.postType === channelFilter;
    return matchesPriority && matchesChannel;
  });

  // Icon helpers
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'twitter': return <Twitter size={16} className="text-blue-400" />;
      case 'reddit': return <MessageCircle size={16} className="text-orange-500" />;
      case 'facebook': return <Facebook size={16} className="text-blue-600" />;
      case 'discord': return <MessageSquare size={16} className="text-indigo-500" />;
      default: return <MessageCircle size={16} className="text-gray-500" />;
    }
  };

  const getLargePlatformIcon = (platform) => {
    switch (platform) {
      case 'twitter': return <Twitter size={20} className="text-blue-400" />;
      case 'reddit': return <MessageCircle size={20} className="text-orange-500" />;
      case 'facebook': return <Facebook size={20} className="text-blue-600" />;
      case 'discord': return <MessageSquare size={20} className="text-indigo-500" />;
      default: return <MessageCircle size={20} className="text-gray-500" />;
    }
  };

  // Display computed relevance as a badge
  const displayRelevance = (relevance) => {
    return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">{relevance}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-6">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Social Posts Requiring Response</h2>
        <p className="text-sm text-gray-500">Posts collected from various platforms by your AI social assistant</p>
        {relevanceLoading && <p className="text-sm text-gray-500">Loading relevance scores...</p>}
      </div>

      {/* Filter Controls */}
      <div className="flex space-x-4 p-4">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border rounded p-1"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="border rounded p-1"
        >
          <option value="all">All Channels</option>
          <option value="twitter">Twitter</option>
          <option value="reddit">Reddit</option>
          <option value="discord">Discord</option>
          <option value="telegram">Telegram</option>
        </select>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {filteredPosts.map((post) => (
          <div key={post.id} className="border-b border-gray-200 p-4">
            <div className="flex items-start space-x-3">
              <img className="h-10 w-10 rounded-full flex-shrink-0" src={post.avatar_url || post.avatar} alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {getPlatformIcon(post.postType)}
                    <p className="text-sm font-medium text-gray-900 truncate">{post.user_name}</p>
                  </div>
                  {displayRelevance(post.relevance)}
                </div>
                <p className="text-sm text-gray-500">{post.date}</p>
                {post.group && (
                  <div className="flex items-center mt-1">
                    <Users size={14} className="mr-1 text-gray-400" />
                    <span className="text-xs text-gray-500">{post.group}</span>
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-700 text-start">{post.tweet_text || post.content}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => openPostModal(post)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye size={14} className="mr-1" /> View
                  </button>
                  <button
                    onClick={() => handleReplyClick(post)}
                    className="inline-flex items-center px-2.5 py-1.5 bg-indigo-600 text-white rounded shadow-sm text-xs font-medium"
                  >
                    <Reply size={14} className="mr-1" /> Reply
                  </button>
                  <button
                    onClick={() => handleQuoteClick(post)}
                    className="inline-flex items-center px-2.5 py-1.5 bg-indigo-600 text-white rounded shadow-sm text-xs font-medium"
                  >
                    <Reply size={14} className="mr-1" /> Quote
                  </button>
                  <button
                    onClick={() => handleRepostClick(post)}
                    className="inline-flex items-center px-2.5 py-1.5 bg-indigo-600 text-white rounded shadow-sm text-xs font-medium"
                  >
                    <Reply size={14} className="mr-1" /> Repost
                  </button>
                  <button
                    onClick={() => handleDeleteTweet(post.id)}
                    className="inline-flex items-center px-2.5 py-1.5 bg-red-500 text-white rounded shadow-sm text-xs font-medium"
                  >
                    <X size={14} className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avatar</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Post</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Relevance</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPosts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    {getPlatformIcon(post.postType)}
                    <span className="text-sm font-medium text-gray-900">{post.user_name}</span>
                  </div>
                  <div className="text-xs text-gray-500">{post.date}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <img className="h-10 w-10 rounded-full" src={post.avatar_url || post.avatar} alt="" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {post.group ? (
                    <div className="flex items-center">
                      <Users size={14} className="mr-1 text-gray-400" />
                      <span className="text-sm text-gray-500">{post.group}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900 max-w-xs lg:max-w-sm xl:max-w-md">
                    {post.tweet_text || post.content}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {displayRelevance(post.relevance)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openPostModal(post)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 bg-white text-gray-700 rounded text-xs"
                    >
                      <Eye size={14} className="mr-1" /> View
                    </button>
                    <button
                      onClick={() => handleReplyClick(post)}
                      className="inline-flex items-center px-2.5 py-1.5 bg-indigo-600 text-white rounded shadow-sm text-xs"
                    >
                      <Reply size={14} className="mr-1" /> Reply
                    </button>
                    <button
                      onClick={() => handleQuoteClick(post)}
                      className="inline-flex items-center px-2 py-1 text-gray-400 hover:text-yellow-500"
                    >
                      <Reply size={14} className="mr-1" /> Quote
                    </button>
                    <button
                      onClick={() => handleRepostClick(post)}
                      className="inline-flex items-center px-2 py-1 text-gray-400 hover:text-yellow-500"
                    >
                      <Reply size={14} className="mr-1" /> Repost
                    </button>
                    <button
                      onClick={() => handleDeleteTweet(post.id)}
                      className="inline-flex items-center px-2 py-1 bg-red-500 text-white rounded text-xs"
                    >
                      <X size={14} className="mr-1" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Post View Modal */}
      {isModalOpen && selectedPost && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4 text-center">
            <div className="fixed inset-0 bg-gray-500 opacity-75" />
            <div className="inline-block bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg w-full">
              <div className="relative bg-white px-4 pt-5 pb-4 sm:p-6">
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center mb-4">
                  <img className="h-12 w-12 rounded-full mr-4" src={selectedPost.avatar_url || selectedPost.avatar} alt="" />
                  <div>
                    <div className="flex items-center">
                      {getLargePlatformIcon(selectedPost.postType)}
                      <h3 className="ml-1 text-lg font-medium text-gray-900">
                        {selectedPost.user_name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">{selectedPost.date}</p>
                  </div>
                </div>

                {(selectedPost.attachment_url || selectedPost.attachment) && (
                  <div className="mb-4">
                    <img
                      src={selectedPost.attachment_url || selectedPost.attachment}
                      alt="Post attachment"
                      className="w-full rounded-lg object-cover"
                    />
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 text-start">{selectedPost.tweet_text || selectedPost.content}</p>
                </div>

                <div className="flex space-x-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <span className="mr-1">❤️</span>
                    {selectedPost.metrics?.likes}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">🔁</span>
                    {selectedPost.metrics?.retweets}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">💬</span>
                    {selectedPost.metrics?.replies}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  {displayRelevance(selectedPost.relevance)}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleViewReplyNow}
                      className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md"
                    >
                      <Reply size={16} className="mr-2" />
                      Reply Now
                    </button>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <Star size={16} className="mr-2" />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      <ReplyModal
        post={replyPost}
        loading={replyLoading}
        error={replyError}
        generated={replyGenerated}
        onClose={() => setReplyPost(null)}
        onSend={() => {
          setReplyPost(null);
        }}
      />

      {/* Quote Modal */}
      <ReplyModal
        post={quotePost}
        loading={quoteLoading}
        error={quoteError}
        generated={
          quoteGenerated
            ? `${quoteGenerated}\n\n${quotePost?.tweet_url || quotePost?.permalink || ''}`
            : null
        }
        onClose={() => setQuotePost(null)}
        onSend={() => {
          setQuotePost(null);
        }}
      />

      {/* Repost Modal */}
      <ReplyModal
        post={repostPost}
        loading={repostLoading}
        error={repostError}
        generated={repostGenerated}
        onClose={() => setRepostPost(null)}
        onSend={() => {
          setRepostPost(null);
        }}
      />
    </div>
  );
}
