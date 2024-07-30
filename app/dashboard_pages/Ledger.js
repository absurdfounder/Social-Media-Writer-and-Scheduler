import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download, Filter, Folder } from 'lucide-react';

const LedgerDB = () => {
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
  const ledgerData = [
    { id: 1, party: "(A) SHED NO-6(CA3)", date: "13/07/22", cases: 68, debit: 85361.00, credit: 0, settlements: 53186003.14, daysOld: 748 },
    { id: 2, party: "(A) SHED NO-6(CA3)", date: "15/07/22", cases: 16, debit: 23412.00, credit: 0, settlements: -23412.00, daysOld: 746 },
    // Add more data here
  ];

  const formatNumber = (number) => {
    return number.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          XYZ LTD
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
            placeholder="Search ledger..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              {['Party', 'Date', 'Cases', 'Debit', 'Credit', 'Settlements', 'Days Old'].map((header) => (
                <th 
                  key={header}
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
            <tr className="bg-gray-100 dark:bg-gray-900">
              <td colSpan="3" className="px-4 py-2"></td>
              <td className="px-4 py-2 text-sm font-medium">51,891,718.83</td>
              <td className="px-4 py-2 text-sm font-medium">53,271,364.14</td>
              <td colSpan="2" className="px-4 py-2"></td>
            </tr>
            {ledgerData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-2 text-sm font-medium">{row.party}</td>
                <td className="px-4 py-2 text-sm">{row.date}</td>
                <td className="px-4 py-2 text-sm">{row.cases}</td>
                <td className="px-4 py-2 text-sm">{formatNumber(row.debit)}</td>
                <td className="px-4 py-2 text-sm">{formatNumber(row.credit)}</td>
                <td className={`px-4 py-2 text-sm ${row.settlements < 0 ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : ''}`}>
                  {formatNumber(row.settlements)}
                </td>
                <td className="px-4 py-2 text-sm">{row.daysOld}</td>
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

export default LedgerDB;