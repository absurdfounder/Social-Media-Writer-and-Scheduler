import React, { useState } from 'react';
import { ChevronDown, Search, FileText, AlertCircle, DollarSign, Calendar, Clock } from 'lucide-react';


const LedgerCheckDashboard = () => {
  const [selectedParty, setSelectedParty] = useState("(B) B-198(CB)");
  const [ledgerData, setLedgerData] = useState([
    { party: 'Acme Corp', date: '2024-07-15', cases: '5', debit: '10000.00', credit: '5000.00', settlements: '2000.00', daysOld: '15' },
    { party: 'TechGlobal', date: '2024-07-20', cases: '3', debit: '7500.00', credit: '3000.00', settlements: '1500.00', daysOld: '10' },
    // Add more sample data as needed
  ]);

  const handleRunQuery = () => {
    console.log("Running query for", selectedParty);
    // Implement query logic here
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">

        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">DATE TODAY</div>
          <div className="text-lg font-semibold text-gray-500 dark:text-gray-300">30-Jul-2024</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <label htmlFor="party-select" className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">Select Party</label>
            <div className="relative">
              <select
                id="party-select"
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
                className="w-full p-2 bg-white dark:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>(B) B-198(CB)</option>
                <option>Acme Corp</option>
                <option>TechGlobal</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <button
            onClick={handleRunQuery}
            className="w-full md:w-auto bg-blue-500 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center"
          >
            <Search className="mr-2" size={18} />
            Run Query for Party
          </button>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-500 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Lookup Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-500 p-4 rounded-md shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Credit Days</div>
            <div className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <Calendar className="mr-2 text-blue-500" size={20} />
              15
            </div>
          </div>
          <div className="bg-white dark:bg-gray-500 p-4 rounded-md shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Budget</div>
            <div className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <DollarSign className="mr-2 text-green-500" size={20} />
              ₹200,000
            </div>
          </div>
          <div className="bg-white dark:bg-gray-500 p-4 rounded-md shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Exceeded by</div>
            <div className="text-xl font-bold text-red-500 flex items-center">
              <AlertCircle className="mr-2" size={20} />
              -200,000
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-200 dark:bg-gray-500">
            <tr>
              {['Party', 'Date', 'Cases', 'Debit', 'Credit', 'Settlements', 'Days Old'].map((header) => (
                <th key={header} className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-500">
            {ledgerData.map((row, index) => (
              <tr key={index}>
                <td className="p-3 text-sm text-gray-900 dark:text-gray-100">{row.party}</td>
                <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{row.date}</td>
                <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{row.cases}</td>
                <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{row.debit}</td>
                <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{row.credit}</td>
                <td className="p-3 text-sm text-green-500 dark:text-green-400 font-medium">{row.settlements}</td>
                <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{row.daysOld}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LedgerCheckDashboard;