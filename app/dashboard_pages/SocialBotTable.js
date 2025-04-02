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
} from 'lucide-react';

const SocialBotTable = ({ posts }) => {
  // Filter states
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");

  // State for view modal (to view post details)
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for reply modal
  const [replyPost, setReplyPost] = useState(null);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyGenerated, setReplyGenerated] = useState(null);
  const [replyError, setReplyError] = useState(null);

  // Platform icon helper functions
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'twitter':
        return <Twitter size={16} className="text-blue-400" />;
      case 'reddit':
        return <MessageCircle size={16} className="text-orange-500" />;
      case 'facebook':
        return <Facebook size={16} className="text-blue-600" />;
      case 'discord':
        return <MessageSquare size={16} className="text-indigo-500" />;
      default:
        return <MessageCircle size={16} className="text-gray-500" />;
    }
  };

  const getLargePlatformIcon = (platform) => {
    switch (platform) {
      case 'twitter':
        return <Twitter size={20} className="text-blue-400" />;
      case 'reddit':
        return <MessageCircle size={20} className="text-orange-500" />;
      case 'facebook':
        return <Facebook size={20} className="text-blue-600" />;
      case 'discord':
        return <MessageSquare size={20} className="text-indigo-500" />;
      default:
        return <MessageCircle size={20} className="text-gray-500" />;
    }
  };

  // Priority badge helper
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

  // Open view modal for a post
  const openPostModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  // Filter posts based on the selected criteria
  const filteredPosts = posts.filter((post) => {
    const matchesPriority = priorityFilter === "all" || post.priority === priorityFilter;
    const matchesChannel = channelFilter === "all" || post.platform === channelFilter;
    return matchesPriority && matchesChannel;
  });

  // Gemini reply generation for a post when Reply is clicked
  const handleGenerateReplyForPost = async (post) => {
    setReplyLoading(true);
    setReplyError(null);
    setReplyGenerated(null);
    const prompt = `Generate a concise and relevant social media style reply (max 2 sentences) to the following post content:\n\n"${post.content}"\n\nReply:`;
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    };

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
      let generatedText = "Error: Could not parse reply from API response.";
      if (
        data.candidates &&
        data.candidates[0]?.content?.parts &&
        data.candidates[0].content.parts[0]?.text
      ) {
        generatedText = data.candidates[0].content.parts[0].text;
      } else {
        console.warn("Unexpected API response structure:", data);
      }
      setReplyGenerated(generatedText.trim());
    } catch (error) {
      setReplyError(error.message || "Failed to generate AI reply");
    } finally {
      setReplyLoading(false);
    }
  };

  // When the user clicks the Reply button in the table row
  const handleReplyClick = (post) => {
    setReplyPost(post);
    // Trigger Gemini reply generation using the post content.
    handleGenerateReplyForPost(post);
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
              <div className="flex-shrink-0">
                <img className="h-10 w-10 rounded-full" src={post.avatar} alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {getPlatformIcon(post.platform)}
                    <p className="text-sm font-medium text-gray-900 truncate">{post.username}</p>
                  </div>
                  <div>{getPriorityBadge(post.priority)}</div>
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
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Eye size={14} className="mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleReplyClick(post)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Reply size={14} className="mr-1" />
                    Reply
                  </button>
                  <button className="inline-flex items-center px-2 py-1 text-gray-400 hover:text-yellow-500 focus:outline-none">
                    <Star size={16} />
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                  <div className="flex-shrink-0 h-10 w-10">
                    <img className="h-10 w-10 rounded-full" src={post.avatar} alt="" />
                  </div>
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
                  <div className="text-sm text-gray-900 max-w-xs truncate lg:max-w-sm xl:max-w-md">{post.content}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{getPriorityBadge(post.priority)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openPostModal(post)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Eye size={14} className="mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleReplyClick(post)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Reply size={14} className="mr-1" />
                      Reply
                    </button>
                    <button className="inline-flex items-center px-2 py-1 text-gray-400 hover:text-yellow-500 focus:outline-none">
                      <Star size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (Static Example) */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredPosts.length}</span> of <span className="font-medium">{posts.length}</span> posts
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">1</a>
            <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-50 text-sm font-medium text-indigo-600 hover:bg-gray-50">2</a>
            <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">3</a>
            <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
          </nav>
        </div>
      </div>

      {/* Post View Modal */}
      {isModalOpen && selectedPost && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                      <button
                        type="button"
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={closeModal}
                      >
                        <span className="sr-only">Close</span>
                        <X size={20} />
                      </button>
                    </div>
                    <div className="flex items-center mb-4">
                      <img className="h-12 w-12 rounded-full mr-4" src={selectedPost.avatar} alt="" />
                      <div>
                        <div className="flex items-center">
                          {getLargePlatformIcon(selectedPost.platform)}
                          <h3 className="ml-1 text-lg leading-6 font-medium text-gray-900">
                            {selectedPost.username}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500">{selectedPost.timestamp}</p>
                      </div>
                    </div>
                    {selectedPost.group && (
                      <div className="flex items-center mb-3 bg-gray-50 px-3 py-2 rounded-md">
                        <Users size={16} className="mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600">{selectedPost.group}</span>
                      </div>
                    )}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">{selectedPost.content}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>{getPriorityBadge(selectedPost.priority)}</div>
                      <div className="flex space-x-2">
                        <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          <Reply size={16} className="mr-2" />
                          Reply Now
                        </button>
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          <Star size={16} className="mr-2" />
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyPost && (
        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-bold mb-2">Reply to {replyPost.username}</h3>
              {replyLoading ? (
                <p className="text-sm text-gray-600">Generating reply...</p>
              ) : replyError ? (
                <p className="text-sm text-red-600">{replyError}</p>
              ) : replyGenerated ? (
                <textarea
                  readOnly
                  value={replyGenerated}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded bg-gray-50 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                  aria-label="Generated Reply"
                />
              ) : null}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setReplyPost(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Add your reply submission logic here.
                    setReplyPost(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialBotTable;
