import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

// EmbedContent Component
const EmbedContent = ({ url }) => {
  const [embedType, setEmbedType] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    determineEmbedType(url);
  }, [url]);

  const convertXToTwitterUrl = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'x.com') {
        return url.replace('x.com', 'twitter.com');
      }
      return url;
    } catch (err) {
      return url;
    }
  };

  const determineEmbedType = (url) => {
    try {
      const convertedUrl = convertXToTwitterUrl(url);
      const urlObj = new URL(convertedUrl);
      
      if (urlObj.hostname.includes('twitter.com') || urlObj.hostname.includes('x.com')) {
        setEmbedType('twitter');
      } else if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        setEmbedType('youtube');
      } else if (urlObj.hostname.includes('vimeo.com')) {
        setEmbedType('vimeo');
      } else if (isImageUrl(url)) {
        setEmbedType('image');
      } else {
        setEmbedType('link');
      }
    } catch (err) {
      setError('Invalid URL');
      setEmbedType('error');
    }
  };

  const isImageUrl = (url) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const getYoutubeId = (url) => {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }
    return urlObj.searchParams.get('v');
  };

  const getVimeoId = (url) => {
    const urlObj = new URL(url);
    return urlObj.pathname.split('/').pop();
  };

  const renderEmbed = () => {
    const convertedUrl = convertXToTwitterUrl(url);
    
    switch (embedType) {
      case 'twitter':
        return <TwitterEmbed url={convertedUrl} />;
      
      case 'youtube':
        const youtubeId = getYoutubeId(url);
        return (
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
            />
          </div>
        );
      
      case 'vimeo':
        const vimeoId = getVimeoId(url);
        return (
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
            />
          </div>
        );
      
      case 'image':
        return (
          <img
            src={url}
            alt="Embedded content"
            className="w-full h-auto rounded-lg"
          />
        );
      
      case 'link':
        return (
          <div className="border rounded-lg p-4 bg-white">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 break-all"
            >
              {url}
            </a>
          </div>
        );
      
      case 'error':
        return (
          <div className="border rounded-lg p-4 bg-red-50 text-red-500">
            {error}
          </div>
        );
      
      default:
        return (
          <div className="border rounded-lg p-4 bg-gray-50">
            Loading...
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderEmbed()}
    </div>
  );
};

// Twitter embed component
const TwitterEmbed = ({ url }) => {
  useEffect(() => {
    // Remove any existing Twitter script
    const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new Twitter script
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [url]);

  return (
    <div className="w-full rounded-lg">
      <blockquote className="twitter-tweet" data-dnt="true">
        <a href={url}>Loading tweet...</a>
      </blockquote>
    </div>
  );
};

// Tag Summary Component
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

// Tag List Component
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
            className="px-2 py-1 bg-blue-500 text-white rounded-r-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Check size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <Plus size={16} />
        </button>
      )}
    </div>
  );
};

// Post-it Note Component
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
            className="mt-2 p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300"
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// Add Content Form Component
const AddContentForm = ({ onAdd }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (url.trim()) {
      setIsLoading(true);
      try {
        await onAdd(url.trim());
        setUrl('');
        toast.success('Content added successfully');
      } catch (error) {
        toast.error('Failed to add content');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to embed (Twitter, YouTube, Vimeo, Images, etc.)"
          className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Embed Content'}
        </button>
      </div>
    </form>
  );
};

// Confirm Dialog Component
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
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Content Card Component
const ContentCard = ({ url, note: initialNote, tags: initialTags, onTagsChange, onNoteChange, onRemove, index }) => {
  const [note, setNote] = useState(initialNote);
  const [tags, setTags] = useState(initialTags);

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

  const handleNoteChange = (newNote) => {
    setNote(newNote);
    onNoteChange(newNote);
  };

  return (
    <Draggable draggableId={`content-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-xl overflow-hidden p-4 transition-all duration-300 ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
        >
          <EmbedContent url={url} />
          <TagList
            tags={tags}
            onAddTag={handleAddTag}
            onEditTag={handleEditTag}
            onDeleteTag={handleDeleteTag}
          />
          <PostItNote
            note={note}
            onEdit={() => {}}
            onSave={handleNoteChange}
            onCancel={() => {}}
          />
          <button
            onClick={() => onRemove(index)}
            className="flex gap-2 items-center mt-4 p-2 px-6 bg-red-100 text-red-400 rounded-full hover:bg-red-200 transition-colors duration-300"
          >
            <Trash2 size={16} />
            Remove Content
          </button>
        </div>
      )}
    </Draggable>
  );
};

// Main Content Grid Component
const ContentGrid = () => {
  const [contents, setContents] = useState([]);
  const [tagSummary, setTagSummary] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    if (auth.currentUser) {
      loadContents();
    }
  }, [auth.currentUser]);

  const loadContents = async () => {
    if (!auth.currentUser) {
      setIsLoading(false);
      return;
    }

    try {
      const contentsRef = doc(db, 'embeds', auth.currentUser.uid);
      const contentsDoc = await getDoc(contentsRef);

      if (contentsDoc.exists()) {
        const loadedContents = contentsDoc.data().tweets || [];
        setContents(loadedContents);
      } else {
        const defaultContents = [
          { url: 'https://twitter.com/trunarla/status/1817988695167025597', note: 'Record daily shorts like this... ', tags: ['Video', 'Inspiration'] },
          { url: 'https://twitter.com/mikeginleyseo/status/1822732460397932808', note: 'Record raw video intro like this', tags: ['Video', 'SEO'] },
          { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', note: 'Example YouTube video', tags: ['Video', 'Example'] },
          { url: 'https://vimeo.com/148751763', note: 'Example Vimeo video', tags: ['Video', 'Example'] }
        ];
        await saveContents(defaultContents);
        setContents(defaultContents);
      }
    } catch (error) {
      console.error('Error loading contents:', error);
      toast.error('Failed to load contents');
    } finally {
      setIsLoading(false);
    }
  };

  const saveContents = async (updatedContents) => {
    if (!auth.currentUser) return false;

    try {
      const contentsRef = doc(db, 'embeds', auth.currentUser.uid);
      await setDoc(contentsRef, {
        tweets: updatedContents,
        userId: auth.currentUser.uid,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error saving contents:', error);
      toast.error('Failed to save contents');
      return false;
    }
  };

  useEffect(() => {
    updateTagSummary();
    if (contents.length > 0 && !isLoading) {
      saveContents(contents);
    }
  }, [contents, isLoading]);

  const updateTagSummary = () => {
    const summary = {};
    contents.forEach(content => {
      content.tags.forEach(tag => {
        summary[tag] = (summary[tag] || 0) + 1;
      });
    });
    setTagSummary(summary);
  };

  const handleTagsChange = (index, newTags) => {
    const updatedContents = [...contents];
    updatedContents[index].tags = newTags;
    setContents(updatedContents);
  };

  const handleNoteChange = (index, newNote) => {
    const updatedContents = [...contents];
    updatedContents[index].note = newNote;
    setContents(updatedContents);
  };

  const handleAddContent = async (url) => {
    const newContents = [...contents, { url, note: '', tags: [] }];
    const success = await saveContents(newContents);
    if (success) {
      setContents(newContents);
      return true;
    }
    return false;
  };

  const handleRemoveContent = async (index) => {
    const updatedContents = contents.filter((_, i) => i !== index);
    const success = await saveContents(updatedContents);
    if (success) {
      setContents(updatedContents);
      toast.success('Content removed successfully');
    } else {
      toast.error('Failed to remove content');
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newContents = Array.from(contents);
    const [reorderedContent] = newContents.splice(source.index, 1);
    newContents.splice(destination.index, 0, reorderedContent);

    const success = await saveContents(newContents);
    if (success) {
      setContents(newContents);
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-500">Please sign in to start organizing your content.</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="container mx-auto p-8 bg-gray-100 min-h-screen">
        <AddContentForm onAdd={handleAddContent} />
        <TagSummary tags={tagSummary} />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Droppable droppableId="content-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {contents.map((content, index) => (
                  <ContentCard
                    key={`content-${index}`}
                    index={index}
                    url={content.url}
                    note={content.note}
                    tags={content.tags}
                    onTagsChange={(newTags) => handleTagsChange(index, newTags)}
                    onNoteChange={(newNote) => handleNoteChange(index, newNote)}
                    onRemove={() => handleRemoveContent(index)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </div>
    </DragDropContext>
  );
};

export default ContentGrid;