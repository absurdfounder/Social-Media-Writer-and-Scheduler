import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronDown, ChevronUp, Search,
  RefreshCcw, Home, Plus, X, Users,
  Flame, Trophy, HelpCircle, Frown,
  DollarSign, PenTool, Megaphone, Zap,
  Newspaper, Lightbulb, Check, ArrowLeft
} from 'lucide-react';

const Tab = ({ label, active, onClick }) => (
  <button
    className={`px-4 py-2 ${active ? 'bg-blue-200 text-blue-800' : 'bg-gray-50 text-gray-700 hover:bg-gray-300'
      } rounded-t-lg transition-colors duration-200`}
    onClick={onClick}
  >
    {label}
  </button>
);

const RedditExplorer = () => {
  const [activeTab, setActiveTab] = useState('popular');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [communities, setCommunities] = useState([]);
  const [displayedCommunities, setDisplayedCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubreddit, setSelectedSubreddit] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [postContent, setPostContent] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showGroupPopup, setShowGroupPopup] = useState(false);
  const [selectedSubredditsForGroup, setSelectedSubredditsForGroup] = useState([]);

  const observer = useRef();
  const lastCommunityElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && displayedCommunities.length < communities.length) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, displayedCommunities.length, communities.length]);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const filtered = communities.filter(community =>
      community.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDisplayedCommunities(filtered.slice(0, page * 20));
  }, [communities, searchTerm, page]);

  useEffect(() => {
    // Load groups from localStorage or use predefined groups if localStorage is empty
    const savedGroups = localStorage.getItem('redditGroups');
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    } else {
      const predefinedGroups = [
        {
          name: "Tech News",
          subreddits: [
            { id: "technology", name: "technology" },
            { id: "programming", name: "programming" },
            { id: "science", name: "science" }
          ]
        },
        {
          name: "Entertainment",
          subreddits: [
            { id: "movies", name: "movies" },
            { id: "television", name: "television" },
            { id: "music", name: "music" }
          ]
        },
        {
          name: "Finance",
          subreddits: [
            { id: "personalfinance", name: "personalfinance" },
            { id: "investing", name: "investing" },
            { id: "cryptocurrency", name: "cryptocurrency" }
          ]
        }
      ];
      setGroups(predefinedGroups);
      localStorage.setItem('redditGroups', JSON.stringify(predefinedGroups));
    }
  }, []);

  useEffect(() => {
    // Save groups to localStorage whenever they change
    localStorage.setItem('redditGroups', JSON.stringify(groups));
  }, [groups]);

  const fetchData = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint;
      switch (tab) {
        case 'popular':
          endpoint = 'https://www.reddit.com/subreddits/popular.json?limit=100';
          break;
        case 'trending':
          endpoint = 'https://www.reddit.com/trending_subreddits.json';
          break;
        case 'new':
          endpoint = 'https://www.reddit.com/subreddits/new.json?limit=100';
          break;
        default:
          endpoint = 'https://www.reddit.com/subreddits/popular.json?limit=100';
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      let mappedCommunities;
      if (tab === 'trending') {
        mappedCommunities = data.subreddit_names.map(name => ({
          id: name,
          name: name,
          url: `https://reddit.com/r/${name}`,
          subscribersCount: 0,
          growthPerWeek: 0,
          growthPerMonth: 0,
        }));
      } else {
        if (!data || !data.data || !data.data.children) {
          throw new Error('Unexpected data structure from Reddit API');
        }
        mappedCommunities = data.data.children.map(child => ({
          id: child.data.id,
          name: child.data.display_name,
          url: `https://reddit.com${child.data.url}`,
          subscribersCount: child.data.subscribers || 0,
          growthPerWeek: Math.floor(Math.random() * 1000),
          growthPerMonth: Math.floor(Math.random() * 4000),
        }));
      }

      setCommunities(mappedCommunities);
      setDisplayedCommunities(mappedCommunities.slice(0, 20));
      setPage(1);
    } catch (err) {
      setError(`Failed to fetch data from Reddit API: ${err.message}`);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubredditPosts = async (subreddit) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data || !data.data || !data.data.children) {
        throw new Error('Unexpected data structure from Reddit API');
      }
      setPosts(data.data.children.map(child => ({
        id: child.data.id,
        title: child.data.title,
        url: `https://reddit.com${child.data.permalink}`,
        author: child.data.author,
        score: child.data.score,
        numComments: child.data.num_comments,
        created: new Date(child.data.created_utc * 1000).toLocaleDateString(),
        selftext: child.data.selftext
      })));
    } catch (err) {
      setError(`Failed to fetch posts for r/${subreddit}: ${err.message}`);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleSubredditClick = (subreddit) => {
    setSelectedSubreddit(subreddit);
    fetchSubredditPosts(subreddit.name);
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const newGroup = {
        name: newGroupName.trim(),
        subreddits: selectedSubredditsForGroup
      };
      const updatedGroups = [...groups, newGroup];
      setGroups(updatedGroups);
      localStorage.setItem('redditGroups', JSON.stringify(updatedGroups));
      setNewGroupName('');
      setSelectedSubredditsForGroup([]);
      setShowGroupPopup(false);
    }
  };

  const handleAddToGroup = (group, subreddit) => {
    const updatedGroups = groups.map(g => {
      if (g.name === group.name && !g.subreddits.some(s => s.id === subreddit.id)) {
        return { ...g, subreddits: [...g.subreddits, subreddit] };
      }
      return g;
    });
    setGroups(updatedGroups);
    localStorage.setItem('redditGroups', JSON.stringify(updatedGroups));
  };

  const handleRemoveFromGroup = (groupName, subredditId) => {
    const updatedGroups = groups.map(group => {
      if (group.name === groupName) {
        return {
          ...group,
          subreddits: group.subreddits.filter(s => s.id !== subredditId)
        };
      }
      return group;
    });
    setGroups(updatedGroups);
    localStorage.setItem('redditGroups', JSON.stringify(updatedGroups));
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    Promise.all(group.subreddits.map(subreddit =>
      fetch(`https://www.reddit.com/r/${subreddit.name}/hot.json?limit=5`)
        .then(res => res.json())
        .then(data => data.data.children.map(child => ({
          id: child.data.id,
          title: child.data.title,
          url: `https://reddit.com${child.data.permalink}`,
          author: child.data.author,
          score: child.data.score,
          numComments: child.data.num_comments,
          created: new Date(child.data.created_utc * 1000).toLocaleDateString(),
          subreddit: subreddit.name,
          selftext: child.data.selftext
        })))
    )).then(postsArrays => {
      setPosts(postsArrays.flat());
    }).catch(err => {
      setError(`Failed to fetch posts for group: ${err.message}`);
      console.error('Error fetching group posts:', err);
    });
  };

  const handlePostClick = async (post) => {
    setSelectedPost(post);
    setPostContent(post.selftext);
  };

  const handleSubredditSelection = (subreddit) => {
    setSelectedSubredditsForGroup(prev =>
      prev.some(s => s.id === subreddit.id)
        ? prev.filter(s => s.id !== subreddit.id)
        : [...prev, subreddit]
    );
  };

  const filterBadges = [
    { label: 'Hot Discussions', icon: Flame, description: 'Popular discussions this week', count: 329 },
    { label: 'Top Content', icon: Trophy, description: 'Best-performing content of past month', count: 271 },
    { label: 'Advice Requests', icon: HelpCircle, description: 'People asking for advice & resources', count: 224 },
    { label: 'Pain & Anger', icon: Frown, description: 'People expressing pain points & frustrations', count: 163 },
    { label: 'Money Talk', icon: DollarSign, description: 'People talking about spending money', count: 16 },
    { label: 'Solution Requests', icon: PenTool, description: 'People asking for tools & solutions', count: 3 },
    { label: 'Self-Promotion', icon: Megaphone, description: 'People launching products & services', count: 1 },
    { label: 'Opportunities', icon: Zap, description: 'Conversations about things that can be improved', count: 0 },
    { label: 'News', icon: Newspaper, description: 'Conversations about current news & events', count: 0 },
    { label: 'Ideas', icon: Lightbulb, description: 'People suggesting ideas', count: 0 },
  ];

  const sortedCommunities = [...displayedCommunities].sort((a, b) => {
    if (sortColumn) {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  if (loading && communities.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCcw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && communities.length === 0) {
    return (
      <div className="text-center p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex space-x-2">
          <Tab label="Audiences" active={activeTab === 'groups'} onClick={() => setActiveTab('groups')} />
          <Tab label="Popular Subreddits" active={activeTab === 'popular'} onClick={() => setActiveTab('popular')} />
          <Tab label="Trending Subreddits" active={activeTab === 'trending'} onClick={() => setActiveTab('trending')} />
          <Tab label="New Subreddits" active={activeTab === 'new'} onClick={() => setActiveTab('new')} />
        </div>

        <div className='bg-gray-50 border p-4'>
          {activeTab !== 'groups' && (
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search subreddits..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {activeTab !== 'groups' && !selectedSubreddit && !selectedGroup && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    {['Community', 'Members', 'Weekly Growth', 'Monthly Growth'].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort(header.toLowerCase().replace(' ', ''))}
                      >
                        <div className="flex items-center">
                          {header}
                          <SortIcon column={header.toLowerCase().replace(' ', '')} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedCommunities.map((community, index) => (
                    <tr
                      key={community.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                      ref={index === sortedCommunities.length - 1 ? lastCommunityElementRef : null}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        <button onClick={() => handleSubredditClick(community)} className="hover:underline">
                          {community.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {community.subscribersCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        +{community.growthPerWeek.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        +{community.growthPerMonth.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'groups' && !selectedGroup && (
            <div>
              <div className='items-center flex justify-between'>
                <h6 className='font-bold h4'>Curated Audiences</h6>
                <button
                  onClick={() => setShowGroupPopup(true)}
                  className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <div
                    key={group.name}
                    className="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => handleGroupClick(group)}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center justify-between">
                      <span>{group.name}</span>
                      <Users className="w-5 h-5 text-blue-500" />
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {group.subreddits.length} subreddit{group.subreddits.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.subreddits.slice(0, 5).map((subreddit) => (
                        <span key={subreddit.id} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                          {subreddit.name}
                        </span>
                      ))}
                      {group.subreddits.length > 5 && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                          +{group.subreddits.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(selectedSubreddit || selectedGroup) && (
            <div className="mt-8">
              <button
                onClick={() => {
                  setSelectedSubreddit(null);
                  setSelectedGroup(null);
                  setSelectedPost(null);
                }}
                className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {activeTab === 'groups' ? 'Groups' : 'Communities'}
              </button>
              {selectedGroup ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {selectedGroup.name} Group
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedGroup.subreddits.map((subreddit) => (
                      <span key={subreddit.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        r/{subreddit.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  r/{selectedSubreddit.name}
                </h2>
              )}
              <div className="mb-6 flex flex-wrap gap-2">
                {filterBadges.map((badge) => (
                  <button
                    key={badge.label}
                    onClick={() => setActiveFilter(badge.label.toLowerCase())}
                    className={`px-3 py-1 rounded-full text-sm flex items-center ${
                      activeFilter === badge.label.toLowerCase()
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-white border text-gray-700'
                    }`}
                  >
                    <badge.icon className="w-4 h-4 mr-2" />
                    {badge.label}
                    {badge.count > 0 && (
                      <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                        {badge.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {loading && <div className="text-center p-4"><RefreshCcw className="w-8 h-8 animate-spin text-blue-600 mx-auto" /></div>}
              {error && <div className="text-center p-4 text-red-500">{error}</div>}
              {!loading && !error && !selectedPost && (
                <ul className="space-y-4">
                  {posts.map((post) => (
                    <li key={post.id} className="bg-white rounded-lg shadow p-4">
                      <button onClick={() => handlePostClick(post)} className="w-full text-left hover:bg-gray-50 transition-colors duration-200 p-2 rounded">
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                          <span>Posted by u/{post.author} {selectedGroup && `in r/${post.subreddit}`}</span>
                          <span>{post.created}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-4">{post.score} points</span>
                          <span>{post.numComments} comments</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {selectedPost && (
                <div className="bg-white rounded-lg shadow p-6">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="mb-4 text-blue-500 hover:text-blue-600 flex items-center"
                  >
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Back to posts
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedPost.title}</h2>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>Posted by u/{selectedPost.author} {selectedGroup && `in r/${selectedPost.subreddit}`}</span>
                    <span>{selectedPost.created}</span>
                  </div>
                  <div className="prose">
                    {postContent}
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-600">
                    <span className="mr-4">{selectedPost.score} points</span>
                    <span>{selectedPost.numComments} comments</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showGroupPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Group</h2>
            <input
              type="text"
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search subreddits..."
                value={groupSearchTerm}
                onChange={(e) => setGroupSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Subreddit
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Members
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {communities
                    .filter(community => community.name.toLowerCase().includes(groupSearchTerm.toLowerCase()))
                    .map((community) => (
                      <tr key={community.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-3 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedSubredditsForGroup.some(s => s.id === community.id)}
                            onChange={() => handleSubredditSelection(community)}
                            className="form-checkbox h-5 w-5 text-blue-600"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {community.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {community.subscribersCount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end space-x-2 sticky bottom-0 bg-white py-4">
              <button
                onClick={() => setShowGroupPopup(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Save Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedditExplorer;