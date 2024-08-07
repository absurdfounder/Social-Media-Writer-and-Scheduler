import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Download, Filter } from 'lucide-react';

const GrowingRedditCommunities = () => {
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://www.reddit.com/r/popular.json');
        const data = await response.json();
        
        const communitiesData = data.data.children.map(child => ({
          id: child.data.subreddit_id,
          name: `r/${child.data.subreddit}`,
          url: `https://reddit.com/r/${child.data.subreddit}`,
          subscribersCount: child.data.subreddit_subscribers || 0,
          growthPerWeek: Math.floor(Math.random() * 1000), // Placeholder: real data not available
          growthPerMonth: Math.floor(Math.random() * 4000), // Placeholder: real data not available
        }));

        setCommunities(communitiesData);
      } catch (err) {
        setError('Failed to fetch data from Reddit API');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

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

  const sortedCommunities = [...communities].sort((a, b) => {
    if (sortColumn) {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Popular Reddit Communities</h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200">
            <Download className="w-4 h-4 inline mr-2" />
            Export
          </button>
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">
            <Filter className="w-4 h-4 inline mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-blue-100 dark:bg-blue-900">
            <tr>
              {['Community', 'URL', 'Subscribers', 'Weekly Growth', 'Monthly Growth'].map((header) => (
                <th 
                  key={header}
                  className="px-4 py-3 text-xs font-medium text-blue-800 dark:text-blue-200 uppercase tracking-wider cursor-pointer"
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
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedCommunities.map((community) => (
              <tr key={community.id}>
                <td className="px-4 py-3 text-sm font-medium">{community.name}</td>
                <td className="px-4 py-3 text-sm">
                  <a href={community.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {community.url}
                  </a>
                </td>
                <td className="px-4 py-3 text-sm">{community.subscribersCount.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(community.growthPerWeek / community.subscribersCount) * 100}%` }}></div>
                    </div>
                    +{community.growthPerWeek.toLocaleString()}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(community.growthPerMonth / community.subscribersCount) * 100}%` }}></div>
                    </div>
                    +{community.growthPerMonth.toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {communities.length} entries
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm">Previous</button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm">Next</button>
        </div>
      </div>
    </div>
  );
};

export default GrowingRedditCommunities;