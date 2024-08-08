import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronDown, ChevronUp, Search, 
  RefreshCcw, Home, Plus, X, Users,
  Flame, Trophy, HelpCircle, Frown,
  DollarSign, PenTool, Megaphone, Zap,
  Newspaper, Lightbulb
} from 'lucide-react';

const Tab = ({ label, active, onClick }) => (
  <button
    className={`px-4 py-2 ${
      active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
      setGroups([...groups, { name: newGroupName.trim(), subreddits: [] }]);
      setNewGroupName('');
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
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex space-x-2 mb-6">
          <Tab label="Popular" active={activeTab === 'popular'} onClick={() => setActiveTab('popular')} />
          <Tab label="Trending" active={activeTab === 'trending'} onClick={() => setActiveTab('trending')} />
          <Tab label="New" active={activeTab === 'new'} onClick={() => setActiveTab('new')} />
          <Tab label="Groups" active={activeTab === 'groups'} onClick={() => setActiveTab('groups')} />
        </div>

        {activeTab !== 'groups' && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search subreddits..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {activeTab !== 'groups' && !selectedSubreddit && !selectedGroup && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Community', 'Members', 'Weekly Growth', 'Monthly Growth'].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
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
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedCommunities.map((community, index) => (
                  <tr 
                    key={community.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    ref={index === sortedCommunities.length - 1 ? lastCommunityElementRef : null}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      <button onClick={() => handleSubredditClick(community)} className="hover:underline">
                        {community.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                      {community.subscribersCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">
                      +{community.growthPerWeek.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">
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
            <div className="mb-4 flex items-center">
              <input
                type="text"
                placeholder="New group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
              />
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-blue-500 border text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div key={group.name} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center justify-between">
                    <span>{group.name}</span>
                    <button
                      onClick={() => handleGroupClick(group)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <Users className="w-5 h-5" />
                    </button>
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {group.subreddits.length} subreddit{group.subreddits.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.subreddits.slice(0, 5).map((subreddit) => (
                      <span key={subreddit.id} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                        {subreddit.name}
                      </span>
                    ))}
                    {group.subreddits.length > 5 && (
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                        +{group.subreddits.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Add Subreddits to Groups</h3>
              <input
                type="text"
                placeholder="Search subreddits to add..."
                value={groupSearchTerm}
                onChange={(e) => setGroupSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Subreddit
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Add to Group
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {communities
                      .filter(community => community.name.toLowerCase().includes(groupSearchTerm.toLowerCase()))
                      .slice(0, 10)
                      .map((community) => (
                        <tr key={community.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {community.name}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              {groups.map((group) => (
                                <button
                                  key={group.name}
                                  onClick={() => handleAddToGroup(group, community)}
                                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 text-xs"
                                >
                                  Add to {group.name}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
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
              className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to {activeTab === 'groups' ? 'Groups' : 'Communities'}
            </button>
            {selectedGroup ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  {selectedGroup.name} Group
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedGroup.subreddits.map((subreddit) => (
                    <span key={subreddit.id} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      r/{subreddit.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
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
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <badge.icon className="w-4 h-4 mr-2" />
                  {badge.label}
                  {badge.count > 0 && (
                    <span className="ml-2 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-xs">
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
                  <li key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <button onClick={() => handlePostClick(post)} className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 p-2 rounded">
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <span>Posted by u/{post.author} {selectedGroup && `in r/${post.subreddit}`}</span>
                        <span>{post.created}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{post.title}</h3>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <span className="mr-4">{post.score} points</span>
                        <span>{post.numComments} comments</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedPost && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="mb-4 text-blue-500 hover:text-blue-600 flex items-center"
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Back to posts
                </button>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{selectedPost.title}</h2>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>Posted by u/{selectedPost.author} {selectedGroup && `in r/${selectedPost.subreddit}`}</span>
                  <span>{selectedPost.created}</span>
                </div>
                <div className="prose dark:prose-invert">
                  {postContent}
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <span className="mr-4">{selectedPost.score} points</span>
                  <span>{selectedPost.numComments} comments</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RedditExplorer;