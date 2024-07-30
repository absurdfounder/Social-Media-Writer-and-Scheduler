import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download, Filter, Edit2, Save, X } from 'lucide-react';

const PartyList = () => {
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingId, setEditingId] = useState(null);
  const [partyData, setPartyData] = useState([
    { id: 1, name: "(A) SHED NO-6(CA3)", creditDays: 25, budget: 50000 },
    { id: 2, name: "(B) B-198(CB)", creditDays: 15, budget: 200000 },
    { id: 3, name: "(D) C/O JXL(CD)", creditDays: 30, budget: 230000 },
    // Add more data here
  ]);

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

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSave = (id) => {
    setEditingId(null);
    // Here you would typically send the updated data to your backend
  };

  const handleCancel = () => {
    setEditingId(null);
    // Reset the data to its original state if needed
  };

  const handleChange = (id, field, value) => {
    setPartyData(partyData.map(party => 
      party.id === id ? { ...party, [field]: value } : party
    ));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Party List
        </h2>
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

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search parties..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-blue-100 dark:bg-blue-900">
            <tr>
              {['Party Name', 'Credit Days', 'Budget'].map((header, index) => (
                <th 
                  key={index}
                  className="px-4 py-3 text-xs font-medium text-blue-800 dark:text-blue-200 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort(header.toLowerCase())}
                >
                  <div className="flex items-center">
                    {header}
                    <SortIcon column={header.toLowerCase()} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-xs font-medium text-blue-800 dark:text-blue-200 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {partyData.map((party) => (
              <tr key={party.id}>
                <td className="px-4 py-3 text-sm font-medium">{party.name}</td>
                <td className="px-4 py-3 text-sm">
                  {editingId === party.id ? (
                    <input
                      type="number"
                      value={party.creditDays}
                      onChange={(e) => handleChange(party.id, 'creditDays', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    party.creditDays
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editingId === party.id ? (
                    <input
                      type="number"
                      value={party.budget}
                      onChange={(e) => handleChange(party.id, 'budget', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    `₹${party.budget.toLocaleString()}`
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editingId === party.id ? (
                    <div className="flex space-x-2">
                      <button onClick={() => handleSave(party.id)} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200">
                        <Save className="w-5 h-5" />
                      </button>
                      <button onClick={handleCancel} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit(party.id)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing 1 to 10 of 100 entries
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm">Previous</button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm">Next</button>
        </div>
      </div>
    </div>
  );
};

export default PartyList;