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

const LinkPreview = ({ url }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        setPreview(data);
      } catch (error) {
        console.error('Error fetching link preview:', error);
      }
    };

    fetchPreview();
  }, [url]);

  if (!preview) return null;

  return (
    <div className="border rounded-md overflow-hidden mt-2">
      {preview.image && <img src={preview.image} alt={preview.title} className="w-full h-32 object-cover" />}
      <div className="p-2">
        <h3 className="font-bold">{preview.title}</h3>
        <p className="text-sm text-gray-600">{preview.description}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
          {url}
        </a>
      </div>
    </div>
  );
};

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
  const [analyzedPosts, setAnalyzedPosts] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
        },
        {
          name: "Gaming",
          subreddits: [
            { id: "gaming", name: "gaming" },
            { id: "pcgaming", name: "pcgaming" },
            { id: "console", name: "console" }
          ]
        },
        {
          name: "Health & Fitness",
          subreddits: [
            { id: "fitness", name: "fitness" },
            { id: "nutrition", name: "nutrition" },
            { id: "health", name: "health" }
          ]
        },
        {
          name: "Travel",
          subreddits: [
            { id: "travel", name: "travel" },
            { id: "solotravel", name: "solotravel" },
            { id: "travelhacks", name: "travelhacks" }
          ]
        },
        {
          name: "Cooking",
          subreddits: [
            { id: "cooking", name: "cooking" },
            { id: "recipes", name: "recipes" },
            { id: "food", name: "food" }
          ]
        },
        {
          name: "Education",
          subreddits: [
            { id: "education", name: "education" },
            { id: "learnprogramming", name: "learnprogramming" },
            { id: "languagelearning", name: "languagelearning" }
          ]
        },
        {
          name: "DIY & Crafts",
          subreddits: [
            { id: "DIY", name: "DIY" },
            { id: "crafts", name: "crafts" },
            { id: "woodworking", name: "woodworking" }
          ]
        },
        {
          name: "Sports",
          subreddits: [
            { id: "sports", name: "sports" },
            { id: "soccer", name: "soccer" },
            { id: "nba", name: "nba" }
          ]
        },
        {
          name: "Pet Lovers",
          subreddits: [
            { id: "cats", name: "cats" },
            { id: "dogs", name: "dogs" },
            { id: "Aquariums", name: "Aquariums" },
            { id: "Dogtraining", name: "Dogtraining" },
            { id: "dogpictures", name: "dogpictures" },
            { id: "parrots", name: "parrots" },
            { id: "dogswithjobs", name: "dogswithjobs" },
            { id: "RATS", name: "RATS" },
            { id: "birding", name: "birding" },
            { id: "BeardedDragons", name: "BeardedDragons" },
            { id: "DOG", name: "DOG" },
            { id: "puppy101", name: "puppy101" },
            { id: "Ornithology", name: "Ornithology" },
            { id: "cat", name: "cat" },
            { id: "CatAdvice", name: "CatAdvice" },
            { id: "Pets", name: "Pets" },
            { id: "DogAdvice", name: "DogAdvice" },
            { id: "germanshepherds", name: "germanshepherds" },
            { id: "reptiles", name: "reptiles" },
            { id: "lookatmydog", name: "lookatmydog" },
            { id: "herpetology", name: "herpetology" },
            { id: "ballpython", name: "ballpython" },
            { id: "leopardgeckos", name: "leopardgeckos" },
            { id: "turtle", name: "turtle" },
            { id: "cockatiel", name: "cockatiel" },
            { id: "doggrooming", name: "doggrooming" },
            { id: "PetAdvice", name: "PetAdvice" },
            { id: "DogTrainingTips", name: "DogTrainingTips" },
            { id: "Dogowners", name: "Dogowners" },
            { id: "DogBreeds101", name: "DogBreeds101" },
            { id: "dogbreed", name: "dogbreed" }
          ]
        },
        {
          name: "Software Developers",
          subreddits: [
            { id: "programming", name: "programming" },
            { id: "learnprogramming", name: "learnprogramming" },
            { id: "webdev", name: "webdev" },
            { id: "javascript", name: "javascript" },
            { id: "AskEngineers", name: "AskEngineers" },
            { id: "cscareerquestions", name: "cscareerquestions" },
            { id: "linux", name: "linux" },
            { id: "Python", name: "Python" },
            { id: "learnpython", name: "learnpython" },
            { id: "coding", name: "coding" },
            { id: "reactjs", name: "reactjs" },
            { id: "computerscience", name: "computerscience" },
            { id: "devops", name: "devops" },
            { id: "rust", name: "rust" },
            { id: "csharp", name: "csharp" },
            { id: "learnjavascript", name: "learnjavascript" },
            { id: "software", name: "software" },
            { id: "ExperiencedDevs", name: "ExperiencedDevs" },
            { id: "iOSProgramming", name: "iOSProgramming" },
            { id: "reactnative", name: "reactnative" },
            { id: "SoftwareEngineering", name: "SoftwareEngineering" },
            { id: "softwaredevelopment", name: "softwaredevelopment" },
            { id: "AskComputerScience", name: "AskComputerScience" },
            { id: "coolgithubprojects", name: "coolgithubprojects" },
            { id: "elixir", name: "elixir" },
            { id: "Development", name: "Development" }
          ]
        },
        {
          name: "No-Code",
          subreddits: [
            { id: "nocode", name: "nocode" },
            { id: "webflow", name: "webflow" },
            { id: "Airtable", name: "Airtable" },
            { id: "NoCodeSaaS", name: "NoCodeSaaS" },
            { id: "lowcode", name: "lowcode" },
            { id: "nocodelowcode", name: "nocodelowcode" },
            { id: "NoCodeMovement", name: "NoCodeMovement" },
            { id: "Adalo", name: "Adalo" },
            { id: "nocodedevelopers", name: "nocodedevelopers" }
          ]
        },
        {
          name: "Stock Investors",
          subreddits: [
            { id: "stocks", name: "stocks" },
            { id: "Daytrading", name: "Daytrading" },
            { id: "StockMarket", name: "StockMarket" },
            { id: "investing", name: "investing" },
            { id: "finance", name: "finance" },
            { id: "FinancialCareers", name: "FinancialCareers" },
            { id: "options", name: "options" },
            { id: "dividends", name: "dividends" },
            { id: "Forex", name: "Forex" },
            { id: "ValueInvesting", name: "ValueInvesting" },
            { id: "SecurityAnalysis", name: "SecurityAnalysis" },
            { id: "Trading", name: "Trading" },
            { id: "StocksAndTrading", name: "StocksAndTrading" },
            { id: "swingtrading", name: "swingtrading" },
            { id: "technicalanalysis", name: "technicalanalysis" }
          ]
        },
        {
          name: "Startup Founders",
          subreddits: [
            { id: "Entrepreneur", name: "Entrepreneur" },
            { id: "business", name: "business" },
            { id: "smallbusiness", name: "smallbusiness" },
            { id: "startups", name: "startups" },
            { id: "EntrepreneurRideAlong", name: "EntrepreneurRideAlong" },
            { id: "SideProject", name: "SideProject" },
            { id: "startup", name: "startup" },
            { id: "SaaS", name: "SaaS" },
            { id: "Entrepreneurship", name: "Entrepreneurship" },
            { id: "ycombinator", name: "ycombinator" },
            { id: "growmybusiness", name: "growmybusiness" },
            { id: "advancedentrepreneur", name: "advancedentrepreneur" },
            { id: "Entrepreneurs", name: "Entrepreneurs" },
            { id: "indiehackers", name: "indiehackers" },
            { id: "indiebiz", name: "indiebiz" },
            { id: "startup_resources", name: "startup_resources" }
          ]
        },
        {
          name: "Designers",
          subreddits: [
            { id: "Design", name: "Design" },
            { id: "graphic_design", name: "graphic_design" },
            { id: "web_design", name: "web_design" },
            { id: "typography", name: "typography" },
            { id: "logodesign", name: "logodesign" },
            { id: "UI_Design", name: "UI_Design" },
            { id: "UXDesign", name: "UXDesign" },
            { id: "userexperience", name: "userexperience" },
            { id: "UXResearch", name: "UXResearch" },
            { id: "learndesign", name: "learndesign" },
            { id: "product_design", name: "product_design" },
            { id: "UX_Design", name: "UX_Design" },
            { id: "uidesign", name: "uidesign" }
          ]
        },
        {
          name: "Marketers",
          subreddits: [
            { id: "socialmedia", name: "socialmedia" },
            { id: "marketing", name: "marketing" },
            { id: "SEO", name: "SEO" },
            { id: "digital_marketing", name: "digital_marketing" },
            { id: "advertising", name: "advertising" },
            { id: "Affiliatemarketing", name: "Affiliatemarketing" },
            { id: "PPC", name: "PPC" },
            { id: "DigitalMarketing", name: "DigitalMarketing" },
            { id: "content_marketing", name: "content_marketing" },
            { id: "InstagramMarketing", name: "InstagramMarketing" },
            { id: "bigseo", name: "bigseo" },
            { id: "FacebookAds", name: "FacebookAds" },
            { id: "AskMarketing", name: "AskMarketing" },
            { id: "Emailmarketing", name: "Emailmarketing" },
            { id: "googleads", name: "googleads" },
            { id: "MarketingResearch", name: "MarketingResearch" },
            { id: "affiliate_marketing", name: "affiliate_marketing" },
            { id: "OnlineMarketing", name: "OnlineMarketing" }
          ]
        },
        {
          name: "NFT Collectors",
          subreddits: [
            { id: "NFT", name: "NFT" },
            { id: "NFTsMarketplace", name: "NFTsMarketplace" },
            { id: "opensea", name: "opensea" },
            { id: "NFTExchange", name: "NFTExchange" },
            { id: "NFTmarket", name: "NFTmarket" },
            { id: "NFTMarketplace", name: "NFTMarketplace" },
            { id: "OpenSeaNFT", name: "OpenSeaNFT" },
            { id: "CryptoArt", name: "CryptoArt" },
            { id: "OpenseaMarket", name: "OpenseaMarket" },
            { id: "DigitalItems", name: "DigitalItems" },
            { id: "NftGiveawayOnly", name: "NftGiveawayOnly" },
            { id: "NFTCollect", name: "NFTCollect" },
            { id: "NFTgiveaway", name: "NFTgiveaway" },
            { id: "NFTheaven", name: "NFTheaven" },
            { id: "AllCryptoBets", name: "AllCryptoBets" },
            { id: "EtherMining", name: "EtherMining" },
            { id: "NFT_", name: "NFT_" },
            { id: "Crypto_General", name: "Crypto_General" },
            { id: "CryptoInvesting", name: "CryptoInvesting" },
            { id: "FreeNFTs", name: "FreeNFTs" },
            { id: "CoinBase", name: "CoinBase" },
            { id: "cosmosnetwork", name: "cosmosnetwork" }
          ]
        }
      ];
      
      setGroups(predefinedGroups);
      localStorage.setItem('redditGroups', JSON.stringify(predefinedGroups));
    }
  }, []);

  useEffect(() => {
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

  const analyzePostContent = async (post) => {
    try {
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperature: 0.7,
          max_tokens: 500,
          messages: [{ role: "user", content: `Analyze the following Reddit post. Extract keywords, provide a brief summary, and categorize it into one or more of the following categories: Hot Discussions, Top Content, Advice Requests, Pain & Anger, Money Talk, Solution Requests, Self-Promotion, Opportunities, News, Ideas.

Title: ${post.title}
Content: ${post.selftext}` }],
          system: `You are an AI assistant that analyzes Reddit posts. Your task is to extract keywords, provide a brief summary, and categorize each post into one or more predefined categories. Use the following format for your response:

Keywords: [comma-separated list of keywords]
Summary: [A brief 1-2 sentence summary of the post]
Categories: [comma-separated list of categories from the following options: Hot Discussions, Top Content, Advice Requests, Pain & Anger, Money Talk, Solution Requests, Self-Promotion, Opportunities, News, Ideas]

Ensure that your analysis is concise and accurately captures the essence of the post. Assign categories based on the content and tone of the post, and you may assign multiple categories if appropriate.`,
          model: "claude-3-sonnet-20240229",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const analysisResult = data.content[0].text;

      const keywordsMatch = analysisResult.match(/Keywords: (.*)/);
      const summaryMatch = analysisResult.match(/Summary: (.*)/);
      const categoriesMatch = analysisResult.match(/Categories: (.*)/);

      return {
        ...post,
        keywords: keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [],
        summary: summaryMatch ? summaryMatch[1].trim() : '',
        categories: categoriesMatch ? categoriesMatch[1].split(',').map(c => c.trim()) : [],
      };
    } catch (error) {
      console.error('Error analyzing post:', error);
      return post;
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

  const handleGroupClick = async (group) => {
    setSelectedGroup(group);
    setIsAnalyzing(true);
    try {
      const postsData = await Promise.all(group.subreddits.map(subreddit =>
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
      ));
      
      const flattenedPosts = postsData.flat();
      setPosts(flattenedPosts);

      // Analyze posts
      const analyzedPostsData = await Promise.all(flattenedPosts.map(analyzePostContent));
      setAnalyzedPosts(analyzedPostsData);
    } catch (err) {
      setError(`Failed to fetch and analyze posts for group: ${err.message}`);
      console.error('Error fetching and analyzing group posts:', err);
    } finally {
      setIsAnalyzing(false);
    }
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
    { label: 'All', icon: Home, description: 'All posts' },
    { label: 'Hot Discussions', icon: Flame, description: 'Popular discussions this week' },
    { label: 'Top Content', icon: Trophy, description: 'Best-performing content of past month' },
    { label: 'Advice Requests', icon: HelpCircle, description: 'People asking for advice & resources' },
    { label: 'Pain & Anger', icon: Frown, description: 'People expressing pain points & frustrations' },
    { label: 'Money Talk', icon: DollarSign, description: 'People talking about spending money' },
    { label: 'Solution Requests', icon: PenTool, description: 'People asking for tools & solutions' },
    { label: 'Self-Promotion', icon: Megaphone, description: 'People launching products & services' },
    { label: 'Opportunities', icon: Zap, description: 'Conversations about things that can be improved' },
    { label: 'News', icon: Newspaper, description: 'Conversations about current news & events' },
    { label: 'Ideas', icon: Lightbulb, description: 'People suggesting ideas' },
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
                    onClick={() => setActiveFilter(badge.label === 'All' ? 'all' : badge.label)}
                    className={`px-3 py-1 rounded-full text-sm flex items-center ${
                      activeFilter === (badge.label === 'All' ? 'all' : badge.label)
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-white border text-gray-700'
                    }`}
                  >
                    <badge.icon className="w-4 h-4 mr-2" />
                    {badge.label}
                  </button>
                ))}
              </div>
              {isAnalyzing && (
                <div className="text-center p-4">
                  <RefreshCcw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                  <p className="mt-2 text-gray-600">Analyzing posts...</p>
                </div>
              )}
              {!isAnalyzing && !selectedPost && (
                <ul className="space-y-4">
                  {analyzedPosts
                    .filter(post => activeFilter === 'all' || post.categories.includes(activeFilter))
                    .map((post) => (
                      <li key={post.id} className="bg-white rounded-lg shadow p-4">
                        <button onClick={() => handlePostClick(post)} className="w-full text-left hover:bg-gray-50 transition-colors duration-200 p-2 rounded">
                          <div className="flex justify-between text-sm text-gray-500 mb-2">
                            <span>Posted by u/{post.author} {selectedGroup && `in r/${post.subreddit}`}</span>
                            <span>{post.created}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{post.summary}</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {post.categories.map((category, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {category}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {post.keywords.slice(0, 5).map((keyword, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                {keyword}
                              </span>
                            ))}
                          </div>
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