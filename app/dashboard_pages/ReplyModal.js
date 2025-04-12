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
}) {
  if (!post) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-96 z-10">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-bold mb-4">
          Reply
        </h3>
        <h3 className="text-lg font-bold mb-4">
          Quote post
        </h3>
        <h3 className="text-lg font-bold mb-4">
          Re-Post
        </h3>



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
            onClick={onSend}
            disabled={loading || !generated}
          >
            Reply to Post
          </button>

          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
            onClick={onSend}
            disabled={loading || !generated}
          >
            Repost
          </button>

          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
            onClick={onSend}
            disabled={loading || !generated}
          >
            Quote
          </button>

        </div>
      </div>
    </div>
  );
}
