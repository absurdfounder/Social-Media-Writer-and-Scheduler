import React, { useState } from 'react';
import { Upload, FileSpreadsheet, DollarSign, Users, ShoppingBag, TrendingUp, Clock, AlertCircle, Calendar, Briefcase } from 'lucide-react';

const DashboardCard = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const FileUploader = ({ onUpload, type }) => (
  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors duration-200">
    <input type="file" id={`file-upload-${type}`} className="hidden" onChange={(e) => onUpload(e, type)} />
    <label htmlFor={`file-upload-${type}`} className="cursor-pointer">
      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload {type}</span>
    </label>
  </div>
);

const LogEntry = ({ timestamp, filename, status, type }) => (
  <div className="flex items-center space-x-4 py-2">
    <div className="flex-shrink-0">
      <FileSpreadsheet className="h-6 w-6 text-blue-500" />
    </div>
    <div className="flex-grow">
      <p className="text-sm font-medium">{filename}</p>
      <p className="text-xs text-gray-500">{timestamp} - {type}</p>
    </div>
    <div className="flex-shrink-0">
      <span className={`px-2 py-1 rounded-full text-xs ${
        status === 'Uploaded successfully' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {status}
      </span>
    </div>
  </div>
);

const StatCard = ({ title, value, subValue, icon: Icon, trend, trendValue }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${Icon === AlertCircle ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500 dark:text-gray-400">{subValue}</p>
      {trend && (
        <p className={`text-sm font-medium ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </p>
      )}
    </div>
  </div>
);

const MainDashboardContent = () => {
  const [logs, setLogs] = useState([]);

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const newLog = {
        timestamp: new Date().toLocaleString(),
        filename: file.name,
        status: 'Uploaded successfully',
        type: type
      };
      setLogs([newLog, ...logs]);
      console.log(`${type} file uploaded:`, file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="₹31,142,263"
          subValue="Buyer Gross Amount"
          icon={DollarSign}
          trend="up"
          trendValue="8.76%"
        />
        <StatCard
          title="Active Buyers"
          value="246"
          subValue="From Party List"
          icon={Users}
          trend="up"
          trendValue="12"
        />
        <StatCard
          title="Total Boxes Sold"
          value="25,220"
          subValue="Last 30 days"
          icon={ShoppingBag}
          trend="up"
          trendValue="1,234"
        />
        <StatCard
          title="Commission Earned"
          value="₹2,727,268"
          subValue="Last 30 days"
          icon={TrendingUp}
          trend="up"
          trendValue="15.3%"
        />
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Upload Files">
          <div className="grid grid-cols-2 gap-4">
            <FileUploader onUpload={handleFileUpload} type="Ledger" />
            <FileUploader onUpload={handleFileUpload} type="Commission" />
          </div>
        </DashboardCard>
        <DashboardCard title="Recent Uploads">
          <div className="space-y-4">
            {logs.length > 0 ? (
              logs.slice(0, 3).map((log, index) => (
                <LogEntry key={index} {...log} />
              ))
            ) : (
              <p className="text-gray-500 text-center">No recent uploads</p>
            )}
          </div>
        </DashboardCard>
        <DashboardCard title="Total Due">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">$123,456</p>
            <p className="text-sm text-gray-500">As of today</p>
          </div>
        </DashboardCard>
        <DashboardCard title="Aging Summary">
          <div className="space-y-4">
            {[
              { label: '0-30 days', value: 50000, percentage: 40 },
              { label: '31-60 days', value: 30000, percentage: 24 },
              { label: '61-90 days', value: 20000, percentage: 16 },
              { label: '90+ days', value: 23456, percentage: 20 },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm font-medium">${item.value.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard title="Recent Parties">
          <ul className="space-y-2">
            {['Acme Corp', 'GlobalTech Industries', 'Smith & Co.'].map((company, index) => (
              <li key={index} className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-medium">{company.split(' ').map(word => word[0]).join('')}</span>
                </div>
                <span>{company}</span>
              </li>
            ))}
          </ul>
        </DashboardCard>
        <DashboardCard title="Upcoming Collections">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">This week</span>
              <span className="text-green-600 font-bold">$25,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Next week</span>
              <span className="text-blue-600 font-bold">$35,000</span>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default MainDashboardContent;