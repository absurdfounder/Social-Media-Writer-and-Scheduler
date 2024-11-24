import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Pencil, Check, X, Plus, Trash2 } from 'lucide-react';

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

const TagSummary = ({ tags }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">My Knowledge Wall</h2>
      <div className="flex flex-wrap gap-4">
        {Object.entries(tags).map(([tag, count]) => (
          <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
            {tag} <span className="ml-2 bg-blue-200 rounded-full px-2">{count}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const TagList = ({ tags, onAddTag, onEditTag, onDeleteTag }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingTag, setEditingTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
    setIsAdding(false);
  };

  const handleEditTag = (index) => {
    onEditTag(index, editingTag.trim());
    setEditingIndex(null);
    setEditingTag('');
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2 items-center">
      {tags.map((tag, index) => (
        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
          {editingIndex === index ? (
            <>
              <input
                type="text"
                value={editingTag}
                onChange={(e) => setEditingTag(e.target.value)}
                className="px-1 py-0 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button onClick={() => handleEditTag(index)} className="ml-1 text-green-500">
                <Check size={12} />
              </button>
              <button onClick={() => setEditingIndex(null)} className="ml-1 text-red-500">
                <X size={12} />
              </button>
            </>
          ) : (
            <>
              {tag}
              <button onClick={() => { setEditingIndex(index); setEditingTag(tag); }} className="ml-1 text-blue-500">
                <Pencil size={12} />
              </button>
              <button onClick={() => onDeleteTag(index)} className="ml-1 text-red-500">
                <X size={12} />
              </button>
            </>
          )}
        </span>
      ))}
      {isAdding ? (
        <div className="flex items-center">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="px-2 py-1 text-sm border rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="New tag"
          />
          <button
            onClick={handleAddTag}
            className="px-2 py-1 bg-blue-500 text-white rounded-r-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Check size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <Plus size={16} />
        </button>
      )}
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

  const isEmpty = !note.trim();

  return (
    <div className={`mt-4 bg-yellow-200 p-4 rounded-lg shadow-md transform -rotate-2 transition-all duration-300 hover:rotate-0 hover:shadow-lg ${isEmpty ? 'grayscale hover:grayscale-0' : ''}`}>
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
              className="p-1 rounded-full bg-green-500 text-white hover:bg-green-500 transition-colors duration-300"
              onClick={handleSave}
            >
              <Check size={16} />
            </button>
            <button
              className="p-1 rounded-full bg-red-500 text-white hover:bg-red-500 transition-colors duration-300"
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
            className="mt-2 p-1 rounded-full bg-blue-500 text-white hover:bg-blue-500 transition-colors duration-300"
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

const AddTweetForm = ({ onAdd }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onAdd(url.trim());
      setUrl('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Tweet URL"
          className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Embed Tweet
        </button>
      </div>
    </form>
  );
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const TweetCard = ({ url, note: initialNote, tags: initialTags, onTagsChange, onRemove, index }) => {
  const [note, setNote] = useState(initialNote);
  const [tags, setTags] = useState(initialTags);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAddTag = (newTag) => {
    if (!tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      onTagsChange(updatedTags);
    }
  };

  const handleEditTag = (index, newTag) => {
    const updatedTags = [...tags];
    updatedTags[index] = newTag;
    setTags(updatedTags);
    onTagsChange(updatedTags);
  };

  const handleDeleteTag = (index) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
    onTagsChange(updatedTags);
  };

  return (
    <Draggable draggableId={`tweet-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-xl overflow-hidden p-4 transition-all duration-300  ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
        >
          <Tweet url={url} />
          <TagList
            tags={tags}
            onAddTag={handleAddTag}
            onEditTag={handleEditTag}
            onDeleteTag={handleDeleteTag}
          />
          <PostItNote
            note={note}
            onEdit={() => {}}
            onSave={(newNote) => setNote(newNote)}
            onCancel={() => {}}
          />
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex gap-2 items-center mt-4 p-2 px-6 bg-red-100 text-red-400 rounded-full hover:bg-red-200 transition-colors duration-300"
          >
            <Trash2 size={16} />
            Remove Tweet
          </button>
          <ConfirmDialog
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={() => {
              setShowDeleteConfirm(false);
              onRemove(index);
            }}
            message="Are you sure you want to delete this tweet?"
          />
        </div>
      )}
    </Draggable>
  );
};

const TweetGrid = () => {
  const [tweets, setTweets] = useState(() => {
    const savedTweets = localStorage.getItem('tweets');
    return savedTweets ? JSON.parse(savedTweets) : [
      { url: 'https://twitter.com/trunarla/status/1817988695167025597', note: 'Record daily shorts like this... ', tags: ['Video', 'Inspiration'] },
      { url: 'https://twitter.com/mikeginleyseo/status/1822732460397932808', note: 'Record raw video intro like this', tags: ['Video', 'SEO'] },
      { url: 'https://twitter.com/mikeginleyseo/status/1823424084618666439', note: '', tags: ['SEO', 'Performance'] },
      { url: 'https://twitter.com/tibo_maker/status/1823365147382984796', note: '', tags: ['Research', 'Inspiration'] },
      { url: 'https://twitter.com/marc_louvion/status/1822977595006492694', note: '', tags: ['Video', 'SEO'] },
      { url: 'https://twitter.com/johnrushx/status/1822403351025160511', note: '', tags: ['Performance', 'Research'] },
    ];
  });

  const [tagSummary, setTagSummary] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tweetToDelete, setTweetToDelete] = useState(null);

  useEffect(() => {
    updateTagSummary();
    localStorage.setItem('tweets', JSON.stringify(tweets));
  }, [tweets]);

  const updateTagSummary = () => {
    const summary = {};
    tweets.forEach(tweet => {
      tweet.tags.forEach(tag => {
        summary[tag] = (summary[tag] || 0) + 1;
      });
    });
    setTagSummary(summary);
  };

  const handleTagsChange = (index, newTags) => {
    const updatedTweets = [...tweets];
    updatedTweets[index].tags = newTags;
    setTweets(updatedTweets);
  };

  const handleAddTweet = (url) => {
    setTweets([...tweets, { url, note: '', tags: [] }]);
  };

  const handleRemoveTweet = (index) => {
    setTweetToDelete(index);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTweet = () => {
    const updatedTweets = tweets.filter((_, i) => i !== tweetToDelete);
    setTweets(updatedTweets);
    setShowDeleteConfirm(false);
    setTweetToDelete(null);
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (destination.droppableId === 'delete-zone') {
      handleRemoveTweet(source.index);
      return;
    }

    const newTweets = Array.from(tweets);
    const [reorderedTweet] = newTweets.splice(source.index, 1);
    newTweets.splice(destination.index, 0, reorderedTweet);

    setTweets(newTweets);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="container mx-auto p-8 bg-gray-100 min-h-screen">
        <AddTweetForm onAdd={handleAddTweet} />
        <TagSummary tags={tagSummary} />
        <Droppable droppableId="tweet-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {tweets.map((tweet, index) => (
                <TweetCard
                  key={`tweet-${index}`}
                  index={index}
                  url={tweet.url}
                  note={tweet.note}
                  tags={tweet.tags}
                  onTagsChange={(newTags) => handleTagsChange(index, newTags)}
                  onRemove={() => handleRemoveTweet(index)}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDeleteTweet}
          message="Are you sure you want to delete this tweet?"
        />
      </div>
    </DragDropContext>
  );
};

export default TweetGrid;