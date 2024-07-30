import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download, Filter } from 'lucide-react';

const AgingReport = () => {
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

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

  // Sample data - replace with actual data fetching logic
  const agingData = [
    { id: 1, partyName: "K.K.C -- C/O JP MANDI(CKKC1)", creditDays: 7, sevenDays: 0, fifteenDays: 0, thirtyDays: 0, fortyFiveDays: 0, sixtyDays: 0, ninetyDays: 18979.50, total: 18979.50 },
    { id: 2, partyName: "(A) SHED NO-6(CA3)", creditDays: 25, sevenDays: 0, fifteenDays: 0, thirtyDays: 0, fortyFiveDays: 0, sixtyDays: 0, ninetyDays: 1273366.75, total: 1273366.75 },
    // Add more data here
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">

        <div className="text-sm text-gray-500 dark:text-gray-400">
          from 01-04-22 to 22-10-22
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
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
        <div className="relative">
          <input
            type="text"
            placeholder="Search parties..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['S. No.', 'Party Name', 'Credit Days', '7+ Days', '15+ Days', '30+ Days', '45+ Days', '60+ Days', '90+ Days', 'Total'].map((header, index) => (
                <th 
                  key={index}
                  className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort(header.toLowerCase())}
                >
                  <div className="flex items-center">
                    {header}
                    <SortIcon column={header.toLowerCase()} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {agingData.map((row, index) => (
              <tr key={row.id} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : ''}>
                <td className="px-4 py-3 text-sm">{row.id}</td>
                <td className="px-4 py-3 text-sm font-medium">{row.partyName}</td>
                <td className="px-4 py-3 text-sm">{row.creditDays}</td>
                <td className="px-4 py-3 text-sm">{row.sevenDays.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm">{row.fifteenDays.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm">{row.thirtyDays.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm">{row.fortyFiveDays.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm">{row.sixtyDays.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm">{row.ninetyDays.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm font-medium">{row.total.toFixed(2)}</td>
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

export default AgingReport;