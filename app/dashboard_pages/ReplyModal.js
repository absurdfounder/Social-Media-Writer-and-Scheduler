"use client";

import React from 'react';
import { X, Send } from 'lucide-react';

export default function ReplyModal({
  post,
  loading,
  error,
  generated,
  onClose,
  onSend,
  onGeneratedChange, // Optional handler for editing
  actionType, // "reply" | "quote" | "repost"
}) {
  if (!post) return null;

  // Determine header, button text based on the action type
  let headerText = "";
  let sendButtonText = "";
  
  if (actionType === "reply") {
    headerText = "Reply";
    sendButtonText = "Reply Now";
  } else if (actionType === "quote") {
    headerText = "Quote Post";
    sendButtonText = "Post Now";
  } else if (actionType === "repost") {
    headerText = "Re-Post";
    sendButtonText = "Post Now";
  }

  // Function to build the proper Twitter URL based on action type and post data
  const buildTwitterUrl = () => {
    // Default fallback URL in case something goes wrong
    let twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(generated || "")}`;
    
    console.log('Post data:', post);
    
    try {
      // Get tweet URL based on the actual data structure
      // The key field appears to contain the full tweet URL
      const tweetUrl = post.key || "";
      
      if (tweetUrl && tweetUrl.includes('twitter.com') && tweetUrl.includes('/status/')) {
        // Extract tweet ID from the key field
        const urlParts = tweetUrl.split('/');
        const tweetId = urlParts[urlParts.length - 1];
        
        console.log('Extracted tweet ID:', tweetId);
        
        // Build appropriate URL based on action type
        if (actionType === "reply" && tweetId) {
          twitterUrl = `https://x.com/intent/tweet?in_reply_to=${tweetId}&text=${encodeURIComponent(generated || "")}`;
          console.log('Generated reply URL:', twitterUrl);
        } else if (actionType === "quote" && tweetUrl) {
          twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(generated || "")}&url=${encodeURIComponent(tweetUrl)}`;
          console.log('Generated quote URL:', twitterUrl);
        } else if (actionType === "repost") {
          twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(generated || "")}`;
          console.log('Generated repost URL:', twitterUrl);
        }
      } else {
        console.warn('No valid tweet URL found in post data:', post);
      }
    } catch (error) {
      console.error("Error building Twitter URL:", error);
      // Fall back to the default URL defined above
    }
    
    return twitterUrl;
  };

  // Function to open the Twitter URL
  const handleSendClick = () => {
    const twitterUrl = buildTwitterUrl();
    window.open(twitterUrl, "_blank");
    onSend(); // Close the modal or clear state after sending
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      {/* Modal */}
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl z-10">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-bold mb-4">{headerText}</h3>
        
        {/* Original tweet reference */}
        <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
          <div className="flex items-center mb-2">
            <img src={post.avatar} alt="" className="w-8 h-8 rounded-full mr-2" />
            <span className="font-medium">{post.username || "Unknown user"}</span>
          </div>
          <p className="text-sm text-gray-700">{post.content}</p>
          {post.attachment && (
            <div className="mt-2">
              <img 
                src={post.attachment}
                alt="Attachment"
                className="max-h-32 rounded object-cover"
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : generated ? (
          <textarea
            readOnly={false}
            value={generated}
            onChange={(e) => {
              if (typeof onGeneratedChange === 'function') {
                onGeneratedChange(e.target.value);
              }
            }}
            rows={6}
            className="w-full p-3 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-indigo-500"
          />
        ) : null}

        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            onClick={handleSendClick}
            disabled={loading || !generated}
          >
            <Send size={16} className="mr-2" />
            {sendButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}