import React, { useState } from 'react';
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
} from 'lucide-react';z
import ReplyModal from './ReplyModal';

const SocialBotTable = ({ posts }) => {
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

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">High</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Low</span>;
      default:
        return null;
    }
  };

  const openPostModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesPriority = priorityFilter === "all" || post.priority === priorityFilter;
    const matchesChannel = channelFilter === "all" || post.platform === channelFilter;
    return matchesPriority && matchesChannel;
  });

  const handleGenerateReplyForPost = async (post) => {
    setReplyLoading(true);
    setReplyError(null);
    setReplyGenerated(null);

    const prompt = `Generate a concise and relevant social media style reply (max 2 sentences) to the following post content:\n\n"${post.content}"\n\nReply:`;
    const requestBody = { contents: [{ parts: [{ text: prompt }] }] };
    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBT3_dk3KhmZHFh1FZ_q5TgUSP1_CsW3mc`;

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to generate reply");
      }
      const data = await response.json();
      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setReplyGenerated(candidate?.trim() || "No reply generated.");
    } catch (err) {
      setReplyError(err.message || "Failed to generate AI reply");
    } finally {
      setReplyLoading(false);
    }
  };

  const handleReplyClick = (post) => {
    setReplyPost(post);
    handleGenerateReplyForPost(post);
  };

  const handleViewReplyNow = () => {
    if (selectedPost) {
      handleReplyClick(selectedPost);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-6">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Social Posts Requiring Response</h2>
        <p className="text-sm text-gray-500">Posts collected from various platforms by your AI social assistant</p>
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
              <img className="h-10 w-10 rounded-full flex-shrink-0" src={post.avatar} alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {getPlatformIcon(post.platform)}
                    <p className="text-sm font-medium text-gray-900 truncate">{post.username}</p>
                  </div>
                  {getPriorityBadge(post.priority)}
                </div>
                <p className="text-sm text-gray-500">{post.timestamp}</p>
                {post.group && (
                  <div className="flex items-center mt-1">
                    <Users size={14} className="mr-1 text-gray-400" />
                    <span className="text-xs text-gray-500">{post.group}</span>
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-700 line-clamp-2">{post.content}</p>
                <div className="mt-3 flex space-x-2">
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
                  <button className="inline-flex items-center px-2 py-1 text-gray-400 hover:text-yellow-500">
                  <Reply size={14} className="mr-1" /> Quote It
                  </button>
                  <button className="inline-flex items-center px-2 py-1 text-gray-400 hover:text-yellow-500">
                  <Reply size={14} className="mr-1" /> Repost
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
                    {getPlatformIcon(post.platform)}
                    <span className="text-sm font-medium text-gray-900">{post.username}</span>
                  </div>
                  <div className="text-xs text-gray-500">{post.timestamp}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <img className="h-10 w-10 rounded-full" src={post.avatar} alt="" />
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
                  <div className="text-sm text-gray-900 max-w-xs truncate lg:max-w-sm xl:max-w-md">
                    {post.content}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getPriorityBadge(post.priority)}
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
                    <button className="inline-flex items-center px-2 py-1 text-gray-400 hover:text-yellow-500">
                      <Star size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:flex sm:items-center sm:justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredPosts.length}</span> of <span className="font-medium">{posts.length}</span> posts
        </div>

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
                  <img className="h-12 w-12 rounded-full mr-4" src={selectedPost.avatar} alt="" />
                  <div>
                    <div className="flex items-center">
                      {getLargePlatformIcon(selectedPost.platform)}
                      <h3 className="ml-1 text-lg font-medium text-gray-900">
                        {selectedPost.username}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">{selectedPost.timestamp}</p>
                  </div>
                </div>

                {selectedPost.attachment && (
                  <div className="mb-4">
                    <img
                      src={selectedPost.attachment}
                      alt="Post attachment"
                      className="w-full rounded-lg object-cover"
                    />
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">{selectedPost.content}</p>
                </div>

                <div className="flex space-x-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <span className="mr-1">❤️</span>
                    {selectedPost.metrics.likes}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">🔁</span>
                    {selectedPost.metrics.retweets}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">💬</span>
                    {selectedPost.metrics.replies}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  {getPriorityBadge(selectedPost.priority)}
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
          // your send logic here…
          setReplyPost(null);
        }}
      />
    </div>
  );
};

export default SocialBotTable;
