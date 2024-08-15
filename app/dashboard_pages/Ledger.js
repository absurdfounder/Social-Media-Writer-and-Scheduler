import React, { useEffect, useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

const Tweet = ({ url }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full rounded-lg">
      <blockquote className="twitter-tweet" data-dnt="true">
        <a href={url}>Loading tweet...</a>
      </blockquote>
    </div>
  );
};

const PostItNote = ({ note, onEdit, onSave, onCancel }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState(note);

  const handleSave = () => {
    onSave(currentNote);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentNote(note);
    setIsEditing(false);
    onCancel();
  };

  return (
    <div className="mt-4 bg-yellow-100 p-4 rounded-lg shadow-md transform -rotate-2 transition-all duration-300 hover:rotate-0 hover:shadow-lg">
      {isEditing ? (
        <div>
          <textarea
            className="w-full p-2 bg-yellow-50 border-none rounded resize-none focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            rows={3}
            placeholder="Add your note here..."
          />
          <div className="flex justify-end mt-2 space-x-2">
            <button
              className="p-1 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors duration-300"
              onClick={handleSave}
            >
              <Check size={16} />
            </button>
            <button
              className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-300"
              onClick={handleCancel}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-gray-800 font-handwriting">{note || "No note added yet."}</p>
          <button
            className="mt-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 p-2 transition-colors duration-300"
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

const TweetCard = ({ url, note: initialNote }) => {
  const [note, setNote] = useState(initialNote);

  return (
    <div className="rounded-xl overflow-hidden p-4 transition-all duration-300">
      <Tweet url={url} />
      <PostItNote
        note={note}
        onEdit={() => {}}
        onSave={(newNote) => setNote(newNote)}
        onCancel={() => {}}
      />
    </div>
  );
};

const TweetGrid = () => {
  const tweets = [
    { url: 'https://twitter.com/mikeginleyseo/status/1823396936939909197', note: '' },
    { url: 'https://twitter.com/mikeginleyseo/status/1822732460397932808', note: 'Record video like this' },
    { url: 'https://twitter.com/mikeginleyseo/status/1823424084618666439', note: '' },
    { url: 'https://twitter.com/i/web/status/1823365147382984796', note: '' },
    { url: 'https://twitter.com/i/web/status/1822977595006492694', note: '' },
    { url: 'https://twitter.com/i/web/status/1822403351025160511', note: '' },
    { url: 'https://twitter.com/i/web/status/1817988695167025597', note: '' },
  ];

  return (
    <div className="container mx-auto p-8 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tweets.map((tweet, index) => (
          <TweetCard key={index} url={tweet.url} note={tweet.note} />
        ))}
      </div>
    </div>
  );
};

export default TweetGrid;