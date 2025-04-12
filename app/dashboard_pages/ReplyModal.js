// ReplyModal.js
"use client";

import React from 'react';
import { X } from 'lucide-react';

export default function ReplyModal({
  post,
  loading,
  error,
  generated,
  onClose,
  onSend,
  actionType, // "reply" | "quote" | "repost"
}) {
  if (!post) return null;

  // Determine header, button text, and Twitter URL based on the action type.
  let headerText = "";
  let sendButtonText = "";
  let twitterUrl = "";

  if (actionType === "reply") {
    headerText = "Reply";
    sendButtonText = "Reply Now";
    // Twitter reply URL (update in_reply_to parameter dynamically if needed)
    twitterUrl = "https://x.com/intent/post?in_reply_to=1910674031252037843&text=I%20agree%20with%20your%20point";
  } else if (actionType === "quote") {
    headerText = "Quote Post";
    sendButtonText = "Post Now";
    twitterUrl = "https://x.com/intent/post?text=Hello%2C%20world!%20Check%20out%20this%20link.";
  } else if (actionType === "repost") {
    headerText = "Re-Post";
    sendButtonText = "Post Now";
    twitterUrl = "https://x.com/intent/post?text=Hello%2C%20world!%20Check%20out%20this%20link.";
  }

  // Function to open the Twitter URL
  const handleSendClick = () => {
    window.open(twitterUrl, "_blank");
    onSend(); // Optionally close the modal or clear state after sending
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      {/* Modal */}
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-3xl z-10">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-bold mb-4">{headerText}</h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : generated ? (
          <textarea
            readOnly
            value={generated}
            rows={18}
            className="w-full p-3 border border-gray-300 rounded mb-4 bg-gray-50"
          />
        ) : null}

        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 border rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
            onClick={handleSendClick}
            disabled={loading || !generated}
          >
            {sendButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
