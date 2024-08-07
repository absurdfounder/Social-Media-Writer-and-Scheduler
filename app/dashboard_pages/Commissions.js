import React, { useState } from 'react';
import { Tag, MessageCircle, Repeat, Heart, Share2 } from 'lucide-react';

const Commissions = () => {
  const [selectedTags, setSelectedTags] = useState([]);

  const tags = ['Technology', 'Politics', 'Sports', 'Entertainment', 'Business'];

  const tweets = [
    {
      id: 1,
      author: 'John Doe',
      handle: '@johndoe',
      content: 'Just launched our new product! #excited #tech',
      timestamp: '2h ago',
      replies: 5,
      retweets: 12,
      likes: 24,
      tags: ['Technology', 'Business']
    },
    {
      id: 2,
      author: 'Jane Smith',
      handle: '@janesmith',
      content: 'Breaking: Major policy change announced #politics',
      timestamp: '4h ago',
      replies: 18,
      retweets: 45,
      likes: 67,
      tags: ['Politics']
    },
    {
      id: 3,
      author: 'Sports Fan',
      handle: '@sportsfan',
      content: 'What a game! Cant believe that last-minute goal #soccer',
      timestamp: '6h ago',
      replies: 8,
      retweets: 20,
      likes: 56,
      tags: ['Sports']
    }
  ];

  const handleTagClick = (tag) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag)
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag]
    );
  };

  const filteredTweets = selectedTags.length > 0
    ? tweets.filter(tweet => tweet.tags.some(tag => selectedTags.includes(tag)))
    : tweets;

  return (
    <div className="tweet-library">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Tweet Tags</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTags.includes(tag)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredTweets.map(tweet => (
          <div key={tweet.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
              <div>
                <p className="font-semibold">{tweet.author}</p>
                <p className="text-gray-500 text-sm">{tweet.handle}</p>
              </div>
            </div>
            <p className="mb-2">{tweet.content}</p>
            <p className="text-gray-500 text-sm mb-2">{tweet.timestamp}</p>
            <div className="flex justify-between text-gray-500">
              <div className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">{tweet.replies}</span>
              </div>
              <div className="flex items-center">
                <Repeat className="w-4 h-4 mr-1" />
                <span className="text-sm">{tweet.retweets}</span>
              </div>
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                <span className="text-sm">{tweet.likes}</span>
              </div>
              <div className="flex items-center">
                <Share2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Commissions;