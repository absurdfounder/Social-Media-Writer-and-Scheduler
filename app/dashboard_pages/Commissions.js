import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download, Filter, TrendingUp, Package, DollarSign, Percent } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-xl font-semibold mt-1">{value}</p>
      </div>
      <Icon className="h-8 w-8 text-blue-500" />
    </div>
  </div>
);

const CommissionReport = () => {
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
  const commissionData = [
    { date: "25/06/2022", boxes: 25, supplierGrossAmt: 30000.00, buyerGrossAmount: 32500.00, commission: 2500.00, percentage: 7.69 },
    { date: "27/06/2022", boxes: 12, supplierGrossAmt: 14900.00, buyerGrossAmount: 15400.00, commission: 500.00, percentage: 3.25 },
    // Add more data here
  ];

  const formatNumber = (number) => {
    return number.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getPercentageColor = (percentage) => {
    if (percentage > 5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (percentage > 0) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-lg p-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Boxes" value="25220" icon={Package} />
        <StatCard title="Supplier Gross Amt" value="₹28,414,995" icon={DollarSign} />
        <StatCard title="Buyer Gross Amount" value="₹31,142,263" icon={DollarSign} />
        <StatCard title="Commission" value="₹2,727,268" icon={TrendingUp} />
        <StatCard title="Average Percentage" value="8.76%" icon={Percent} />
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
        <div className="text-sm text-gray-500 dark:text-gray-400">
          108 box
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-yellow-200 dark:bg-yellow-900">
            <tr>
              {['Date', 'Boxes', 'Supplier Gross Amt', 'Buyer Gross Amount', 'Commission', 'Percentage'].map((header) => (
                <th 
                  key={header}
                  className="px-4 py-3 text-xs font-medium text-yellow-800 dark:text-yellow-200 uppercase tracking-wider cursor-pointer"
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
            {commissionData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-2 text-sm">{row.date}</td>
                <td className="px-4 py-2 text-sm">{row.boxes}</td>
                <td className="px-4 py-2 text-sm">{formatNumber(row.supplierGrossAmt)}</td>
                <td className="px-4 py-2 text-sm">{formatNumber(row.buyerGrossAmount)}</td>
                <td className="px-4 py-2 text-sm">{formatNumber(row.commission)}</td>
                <td className={`px-4 py-2 text-sm ${getPercentageColor(row.percentage)}`}>
                  {row.percentage.toFixed(2)}%
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

export default CommissionReport;