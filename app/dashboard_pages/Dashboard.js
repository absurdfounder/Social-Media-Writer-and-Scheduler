"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  PlusCircle,
  X,
  CircleCheck,
  Paperclip,
  Send,
  Users,
  Target,
  Award,
  FileText,
  AlertTriangle,
  MessageSquare,
  MessageCircle
} from 'lucide-react';

// Component for GitHub-style contribution graph
const ContributionGraph = ({ data }) => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364); // Get data for past year
  
  const days = [];
  let currentDate = new Date(startDate);
  
  // Generate array of dates for the past year
  while (currentDate <= today) {
    const dateString = currentDate.toISOString().split('T')[0];
    days.push({
      date: dateString,
      count: data[dateString] || 0
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Group by week for rendering
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  // Get color based on activity count
  const getColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count < 3) return 'bg-green-200';
    if (count < 6) return 'bg-green-300';
    if (count < 9) return 'bg-green-400';
    return 'bg-green-500';
  };

  // Choose a random quote about marketing impact
  const quotes = [
    { quote: "When we started consistently tracking our marketing efforts, we saw a 3x increase in conversions within 3 months.", author: "Sarah Chen, Founder of GrowthMate" },
    { quote: "Marketing isn't an expense, it's an investment. When we finally understood that, our business transformed.", author: "Michael Rodriguez, CEO of Elevate" },
    { quote: "The day we started focusing on our brand story rather than just features, everything changed for us.", author: "Aisha Johnson, Co-founder of StoryBrand" },
    { quote: "Consistency in marketing beats intensity. Our slow but steady approach outperformed all our competitors.", author: "David Park, Founder of SteadyGrowth" },
    { quote: "When we started collecting proof of our marketing work, we could finally see what was working and what wasn't.", author: "Emma Williams, Founder of DataDriven" }
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">My Marketing Contribution</h3>
        <div className="text-sm text-gray-500">
          Total Activities: {Object.values(data).reduce((sum, count) => sum + count, 0)}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex space-x-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col space-y-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`w-3 h-3 rounded-sm ${getColor(day.count)}`}
                  title={`${day.date}: ${day.count} activities`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-500 my-2 pt-2">
        <div className="text-sm font-medium">Learn how we count contributions</div>
        <div className="flex items-center">
          <span>Less</span>
          <div className="flex space-x-1 mx-2">
            <div className="w-3 h-3 rounded-sm bg-gray-100" />
            <div className="w-3 h-3 rounded-sm bg-green-200" />
            <div className="w-3 h-3 rounded-sm bg-green-300" />
            <div className="w-3 h-3 rounded-sm bg-green-400" />
            <div className="w-3 h-3 rounded-sm bg-green-500" />
          </div>
          <span>More</span>
        </div>
      </div>
      
      {/* Added quote section */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
        <p className="text-sm text-gray-700 italic">{randomQuote.quote}</p>
        <p className="text-xs text-gray-500 mt-1 text-right">— {randomQuote.author}</p>
      </div>
    </div>
  );
};

// Component for Marketing Milestones
const MarketingMilestones = ({ milestones, onAddMilestone }) => {
  const [showForm, setShowForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    impact: ''
  });
  
  const handleSubmit = () => {
    if (newMilestone.title.trim() && newMilestone.description.trim()) {
      onAddMilestone({
        ...newMilestone,
        id: Date.now()
      });
      setNewMilestone({
        title: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        impact: ''
      });
      setShowForm(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Marketing Milestones</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm flex items-center"
        >
          <PlusCircle size={16} className="mr-1" /> Add Milestone
        </button>
      </div>
      
      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium mb-3">New Milestone</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Milestone title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newMilestone.date}
                onChange={(e) => setNewMilestone({...newMilestone, date: e.target.value})}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your milestone"
              rows="2"
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
            <textarea
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What impact did this milestone have?"
              rows="2"
              value={newMilestone.impact}
              onChange={(e) => setNewMilestone({...newMilestone, impact: e.target.value})}
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Milestone
            </button>
          </div>
        </div>
      )}
      
      {milestones.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No milestones added yet. Add your first marketing achievement!
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative pl-10">
                <div className="absolute left-2 top-1.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <Award size={12} className="text-white" />
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-lg">{milestone.title}</h4>
                    <span className="text-sm text-gray-500">{new Date(milestone.date).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-2 text-gray-700">{milestone.description}</p>
                  {milestone.impact && (
                    <div className="mt-3 pt-3 border-t">
                      <h5 className="text-sm font-medium text-gray-700">Impact:</h5>
                      <p className="text-sm text-gray-600">{milestone.impact}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Component for marketing task list with proof and notes
const MarketingTaskList = ({ tasks, onTaskToggle, onTaskAdd, onTaskDelete, onProofAttach, onAddNotes }) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('content');
  const fileInputRef = useRef(null);
  const [expandedTask, setExpandedTask] = useState(null);
  const [noteText, setNoteText] = useState('');
  
  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onTaskAdd({
        id: Date.now(),
        text: newTaskText,
        completed: false,
        category: selectedCategory,
        proofs: [],
        notes: ''
      });
      setNewTaskText('');
    }
  };
  
  const handleProofClick = (taskId) => {
    fileInputRef.current.taskId = taskId;
    fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const taskId = fileInputRef.current.taskId;
    
    if (files.length > 0 && taskId) {
      const proofs = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString()
      }));
      
      onProofAttach(taskId, proofs);
    }
  };
  
  const handleAddNotes = (taskId) => {
    if (noteText.trim()) {
      onAddNotes(taskId, noteText);
      setNoteText('');
    }
  };
  
  const categories = ['Content', 'Social', 'Email', 'SEO', 'Partnership', 'Analysis'];
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Marketing Tasks</h2>
      
      <div className="mb-6">
        <div className="flex mb-2">
          <input
            type="text"
            className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a new marketing task..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <button
            onClick={handleAddTask}
            className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600"
          >
            <PlusCircle size={20} />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category.toLowerCase())}
              className={`px-3 py-1 text-xs rounded-full ${
                selectedCategory === category.toLowerCase()
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        multiple
      />
      
      <div className="space-y-6">
        {categories.map(category => {
          const categoryTasks = tasks.filter(task => task.category.toLowerCase() === category.toLowerCase());
          if (categoryTasks.length === 0) return null;
          
          return (
            <div key={category} className="pb-4">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                {category} 
                <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                  {categoryTasks.length}
                </span>
              </h3>
              <div className="space-y-3">
              {categoryTasks.map(task => (
                  <div key={task.id} className="border rounded-md p-3 group hover:shadow-sm">
                    <div className="flex items-center">
                      <button
                        onClick={() => onTaskToggle(task.id)}
                        className={`flex-shrink-0 w-5 h-5 rounded-full border ${
                          task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        } mr-3 flex items-center justify-center`}
                      >
                        {task.completed && <CircleCheck size={16} className="text-white" />}
                      </button>
                      <span 
                        className={`flex-1 cursor-pointer font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}
                        onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                      >
                        {task.text}
                      </span>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleProofClick(task.id)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                          title="Attach proof"
                        >
                          <Paperclip size={16} />
                        </button>
                        {!task.proofs || task.proofs.length === 0 ? (
                          <span className="ml-1 text-xs text-red-500">*</span>
                        ) : null}
                        <button
                          onClick={() => onTaskDelete(task.id)}
                          className="ml-3 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {expandedTask === task.id && (
                      <div className="mt-3 pt-3 border-t">
                        {task.proofs && task.proofs.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                              <FileText size={14} className="mr-1" /> Attached Proofs:
                            </div>
                            <div className="space-y-1 pl-1">
                              {task.proofs.map(proof => (
                                <div key={proof.id} className="flex items-center text-xs bg-gray-50 p-2 rounded">
                                  <Paperclip size={12} className="mr-1 text-gray-500" />
                                  <a 
                                    href={proof.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline truncate"
                                  >
                                    {proof.name}
                                  </a>
                                  <span className="ml-auto text-gray-500">
                                    {new Date(proof.uploadDate).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                            <MessageSquare size={14} className="mr-1" /> 
                            Notes: 
                            {!task.notes ? <span className="ml-1 text-xs text-red-500">*</span> : null}
                          </div>
                          {task.notes ? (
                            <div className="bg-yellow-50 p-2 rounded text-sm text-gray-700">
                              {task.notes}
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <input
                                type="text"
                                placeholder="Add notes about this task..."
                                className="flex-1 p-2 text-sm border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddNotes(task.id)}
                              />
                              <button
                                onClick={() => handleAddNotes(task.id)}
                                className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600"
                              >
                                <Send size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-start">
          <AlertTriangle size={20} className="text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-700">Task Requirements</h4>
            <p className="text-sm text-gray-600 mt-1">
              Remember to attach proof of completion and add notes for each task. Both are required for proper tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Chat Button Component
const AIChatButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Message bubble */}
      {isHovered && (
        <div className="absolute bottom-16 right-0 bg-white shadow-lg rounded-lg p-3 mb-2 max-w-xs animate-fade-in">
          <p className="text-sm">Have any doubts about how to market?</p>
          <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white"></div>
        </div>
      )}
      
      {/* Chat button */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-105"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

// AI Chat Modal Component
const AIChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi there! How can I help with your marketing today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  
  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // Add user message
      setMessages([...messages, { type: 'user', text: inputValue }]);
      
      // Simulate AI response (in a real app, this would call an API)
      setTimeout(() => {
        const botResponses = [
          "That's a great marketing question! I'd recommend focusing on identifying your target audience first, then crafting messaging that speaks directly to their needs.",
          "For content marketing, consistency is key. Having a regular publishing schedule helps build audience expectation and improves engagement over time.",
          "Social media marketing works best when you're actively engaging with your community, not just broadcasting messages. Try asking questions and responding to comments.",
          "Email marketing still has one of the highest ROIs of any marketing channel. Make sure your subject lines are compelling and your content provides real value.",
          "When measuring marketing success, look beyond vanity metrics like followers. Focus on conversions, engagement rates, and ultimately revenue attributed to your campaigns."
        ];
        
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
        setMessages(prev => [...prev, { type: 'bot', text: randomResponse }]);
      }, 1000);
      
      setInputValue('');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-medium">Marketing GOD</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
        
        {/* Input */}
        <div className="border-t p-4">
          <div className="flex">
            <input
              type="text"
              placeholder="Ask about marketing strategies..."
              className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Marketing Dashboard Component
const MarketingDashboard = () => {
  // State for AI chat
  const [chatOpen, setChatOpen] = useState(false);
  
  // Task state
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Create blog post about customer success story', completed: true, category: 'content', proofs: [
      { id: 101, name: 'blog-post-screenshot.png', url: '#', type: 'image/png', size: 245000, uploadDate: '2023-03-15T10:30:00Z' }
    ], notes: 'Published on the company blog and shared to social media channels' },
    { id: 2, text: 'Schedule social media posts for the week', completed: false, category: 'social', proofs: [], notes: '' },
    { id: 3, text: 'Analyze February campaign metrics', completed: false, category: 'analysis', proofs: [], notes: '' },
    { id: 4, text: 'Design and send monthly newsletter', completed: true, category: 'email', proofs: [
      { id: 102, name: 'newsletter-feb-2023.pdf', url: '#', type: 'application/pdf', size: 1245000, uploadDate: '2023-02-28T14:20:00Z' }
    ], notes: 'Achieved 24% open rate and 3.1% click-through rate' },
    { id: 5, text: 'Optimize website meta descriptions', completed: true, category: 'seo', proofs: [
      { id: 103, name: 'meta-descriptions-updated.pdf', url: '#', type: 'application/pdf', size: 124000, uploadDate: '2023-03-16T14:20:00Z' }
    ], notes: 'Updated all product pages with keyword-rich descriptions' },
    { id: 6, text: 'Reach out to potential podcast partners', completed: false, category: 'partnership', proofs: [], notes: '' },
  ]);
  
  // Milestones state
  const [milestones, setMilestones] = useState([
    {
      id: 1,
      title: 'Reached 10,000 Email Subscribers',
      date: '2023-02-28',
      description: 'Achieved our Q1 goal of 10k subscribers through combined lead generation campaigns.',
      impact: 'Increased our potential marketing reach by 40% compared to last quarter.'
    },
    {
      id: 2,
      title: 'First Guest Post on Major Industry Blog',
      date: '2023-01-15',
      description: 'Published guest article on TechCrunch about marketing automation trends.',
      impact: 'Drove 2,500 new visitors to our website and generated 120 leads.'
    }
  ]);
  
  // Activity data for contribution graph
  const [activityData, setActivityData] = useState({});
  
  useEffect(() => {
    // Generate sample activity data
    const generateActivityData = () => {
      const data = {};
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 364);
      
      let currentDate = new Date(startDate);
      while (currentDate <= today) {
        const dateString = currentDate.toISOString().split('T')[0];
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const maxActivity = isWeekend ? 5 : 10;
        data[dateString] = Math.floor(Math.random() * maxActivity);
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setActivityData(data);
    };
    
    generateActivityData();
    // No dependencies needed here as this should only run once on mount
  }, []);

  // Task management functions
  const handleTaskToggle = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    
    // Update activity data for today when completing a task
    const today = new Date().toISOString().split('T')[0];
    setActivityData(prev => ({
      ...prev,
      [today]: (prev[today] || 0) + 1
    }));
  };
  
  const handleTaskAdd = (newTask) => {
    setTasks([...tasks, newTask]);
    
    // Update activity data for today when adding a task
    const today = new Date().toISOString().split('T')[0];
    setActivityData(prev => ({
      ...prev,
      [today]: (prev[today] || 0) + 1
    }));
  };
  
  const handleTaskDelete = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };
  
  const handleProofAttach = (taskId, proofs) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, proofs: [...(task.proofs || []), ...proofs] }
        : task
    ));
    
    // Update activity data for today when attaching proof
    const today = new Date().toISOString().split('T')[0];
    setActivityData(prev => ({
      ...prev,
      [today]: (prev[today] || 0) + 1
    }));
  };
  
  const handleAddNotes = (taskId, notes) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, notes } : task
    ));
  };
  
  // Add milestone
  const handleAddMilestone = (newMilestone) => {
    setMilestones([...milestones, newMilestone]);
    
    // Update activity data for today
    const today = new Date().toISOString().split('T')[0];
    setActivityData(prev => ({
      ...prev,
      [today]: (prev[today] || 0) + 1
    }));
  };
  
  // Calculate task completion stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Contribution graph at the top */}
        <ContributionGraph data={activityData} />
        
        {/* Stats cards */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="text-sm text-gray-500">Task Completion</div>
          <div className="flex items-end">
            <div className="text-2xl font-bold">{completionRate}%</div>
            <div className="text-sm text-gray-600 ml-2">({completedTasks}/{totalTasks})</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className="bg-blue-500 h-2.5 rounded-full" 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="space-y-6">
          <MarketingTaskList 
            tasks={tasks} 
            onTaskToggle={handleTaskToggle}
            onTaskAdd={handleTaskAdd}
            onTaskDelete={handleTaskDelete}
            onProofAttach={handleProofAttach}
            onAddNotes={handleAddNotes}
          />
          
          <MarketingMilestones 
            milestones={milestones}
            onAddMilestone={handleAddMilestone}
          />
        </div>
      </div>
      
      {/* AI Chat Button & Modal */}
      <AIChatButton onClick={() => setChatOpen(true)} />
      <AIChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default MarketingDashboard;