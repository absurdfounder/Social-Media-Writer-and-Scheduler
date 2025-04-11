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
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

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
    if (count < 3) return 'bg-slate-200';
    if (count < 6) return 'bg-slate-300';
    if (count < 9) return 'bg-slate-400';
    return 'bg-green-600';
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
            <div className="w-3 h-3 rounded-sm bg-slate-200" />
            <div className="w-3 h-3 rounded-sm bg-slate-300" />
            <div className="w-3 h-3 rounded-sm bg-slate-400" />
            <div className="w-3 h-3 rounded-sm bg-green-600" />
          </div>
          <span>More</span>
        </div>
      </div>
      
      {/* Added quote section */}
      <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-md">
        <p className="text-sm text-gray-700 italic">{randomQuote.quote}</p>
        <p className="text-xs text-gray-500 mt-1 text-right">— {randomQuote.author}</p>
      </div>
    </div>
  );
};

// Component for Marketing Milestones
const MarketingMilestones = ({ milestones, onAddMilestone, currentProfile }) => {
  const [showForm, setShowForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    impact: ''
  });
  
  const auth = getAuth();
  const db = getFirestore();
  
  const handleSubmit = async () => {
    if (newMilestone.title.trim() && newMilestone.description.trim()) {
      try {
        const milestoneToAdd = {
          ...newMilestone,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          profileId: currentProfile?.id,
          userId: auth.currentUser?.uid
        };
        
        // Save to Firestore
        if (auth.currentUser && currentProfile) {
          const milestonesRef = collection(db, 'marketing_milestones');
          await addDoc(milestonesRef, milestoneToAdd);
          
          toast.success('Milestone saved successfully!');
        }
        
        onAddMilestone(milestoneToAdd);
        setNewMilestone({
          title: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          impact: ''
        });
        setShowForm(false);
      } catch (error) {
        console.error('Error saving milestone:', error);
        toast.error('Failed to save milestone');
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Marketing Milestones</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-slate-600 text-sm flex items-center"
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
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                placeholder="Milestone title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                value={newMilestone.date}
                onChange={(e) => setNewMilestone({...newMilestone, date: e.target.value})}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Describe your milestone"
              rows="2"
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
            <textarea
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
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
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-slate-600"
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
                <div className="absolute left-2 top-1.5 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
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
const MarketingTaskList = ({ tasks, onTaskToggle, onTaskAdd, onTaskDelete, onProofAttach, onAddNotes, currentProfile }) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('content');
  const fileInputRef = useRef(null);
  const [expandedTask, setExpandedTask] = useState(null);
  const [noteText, setNoteText] = useState('');
  
  const auth = getAuth();
  const db = getFirestore();
  
  const handleAddTask = async () => {
    if (newTaskText.trim()) {
      try {
        const newTask = {
          id: Date.now().toString(),
          text: newTaskText,
          completed: false,
          category: selectedCategory,
          proofs: [],
          notes: '',
          userId: auth.currentUser?.uid,
          profileId: currentProfile?.id,
          createdAt: new Date().toISOString()
        };
        
        // Add to UI first for immediate feedback
        onTaskAdd(newTask);
        setNewTaskText('');
        
        // Then save to Firebase if user is logged in
        if (auth.currentUser && currentProfile) {
          // Get reference to the tasks document for this user and profile
          const tasksDocRef = doc(db, 'marketing_tasks', `${currentProfile.id}_${auth.currentUser.uid}`);
          
          // Get current tasks or create new array
          const tasksDoc = await getDoc(tasksDocRef);
          let currentTasks = [];
          
          if (tasksDoc.exists()) {
            currentTasks = tasksDoc.data().tasks || [];
            await updateDoc(tasksDocRef, { 
              tasks: [...currentTasks, newTask],
              updatedAt: new Date().toISOString()
            });
          } else {
            await setDoc(tasksDocRef, {
              tasks: [newTask],
              profileId: currentProfile.id,
              userId: auth.currentUser.uid,
              createdAt: new Date().toISOString()
            });
          }
          
          // Update contribution data for today
          const today = new Date().toISOString().split('T')[0];
          const contributionRef = doc(db, 'marketing_contributions', `${currentProfile.id}_${auth.currentUser.uid}`);
          const contributionDoc = await getDoc(contributionRef);
          
          if (contributionDoc.exists()) {
            const contributionData = contributionDoc.data().data || {};
            contributionData[today] = (contributionData[today] || 0) + 1;
            await updateDoc(contributionRef, { data: contributionData });
          } else {
            await setDoc(contributionRef, {
              data: { [today]: 1 },
              userId: auth.currentUser.uid,
              profileId: currentProfile.id,
              createdAt: new Date().toISOString()
            });
          }
          
          toast.success('Task saved successfully!');
        }
      } catch (error) {
        console.error('Error adding task:', error);
        toast.error('Failed to save task to database');
      }
    }
  };
  
  const handleProofClick = (taskId) => {
    fileInputRef.current.taskId = taskId;
    fileInputRef.current.click();
  };
  
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const taskId = fileInputRef.current.taskId;
    
    if (files.length > 0 && taskId) {
      try {
        const proofs = files.map(file => ({
          id: Date.now() + Math.random(),
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString()
        }));
        
        // Update task in Firebase
        if (auth.currentUser && currentProfile) {
          // Find the task document
          const taskQuery = collection(db, 'marketing_tasks');
          const taskSnapshot = await getDoc(doc(db, 'marketing_tasks', taskId));
          
          if (taskSnapshot.exists()) {
            const taskData = taskSnapshot.data();
            const updatedProofs = [...(taskData.proofs || []), ...proofs];
            
            await updateDoc(doc(db, 'marketing_tasks', taskId), {
              proofs: updatedProofs
            });
            
            // Update contribution data for today
            const today = new Date().toISOString().split('T')[0];
            const contributionRef = doc(db, 'marketing_contributions', `${currentProfile.id}_${auth.currentUser.uid}`);
            
            const contributionDoc = await getDoc(contributionRef);
            if (contributionDoc.exists()) {
              const contributionData = contributionDoc.data().data || {};
              contributionData[today] = (contributionData[today] || 0) + 1;
              
              await updateDoc(contributionRef, { data: contributionData });
            } else {
              await setDoc(contributionRef, {
                data: { [today]: 1 },
                userId: auth.currentUser.uid,
                profileId: currentProfile.id
              });
            }
          }
        }
        
        onProofAttach(taskId, proofs);
        toast.success('Proof attached successfully!');
      } catch (error) {
        console.error('Error attaching proof:', error);
        toast.error('Failed to attach proof');
      }
    }
  };
  
  const handleAddNotes = async (taskId) => {
    if (noteText.trim()) {
      try {
        // Update task in Firebase
        if (auth.currentUser && currentProfile) {
          // Find the task document
          const taskSnapshot = await getDoc(doc(db, 'marketing_tasks', taskId));
          
          if (taskSnapshot.exists()) {
            await updateDoc(doc(db, 'marketing_tasks', taskId), {
              notes: noteText
            });
            
            toast.success('Notes added successfully!');
          }
        }
        
        onAddNotes(taskId, noteText);
        setNoteText('');
      } catch (error) {
        console.error('Error adding notes:', error);
        toast.error('Failed to add notes');
      }
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
            className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="Add a new marketing task..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <button
            onClick={handleAddTask}
            className="bg-green-600 text-white p-2 rounded-r-md hover:bg-slate-600"
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
                  ? 'bg-green-600 text-white'
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
                          task.completed ? 'bg-green-600 border-slate-500' : 'border-gray-300'
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
                          className="ml-2 text-slate-500 hover:text-slate-700"
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
                                    className="text-slate-500 hover:underline truncate"
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
                                className="flex-1 p-2 text-sm border rounded-l focus:outline-none focus:ring-1 focus:ring-slate-500"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddNotes(task.id)}
                              />
                              <button
                                onClick={() => handleAddNotes(task.id)}
                                className="bg-green-600 text-white p-2 rounded-r hover:bg-slate-600"
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

// Main Marketing Dashboard Component
const MarketingDashboard = ({ currentProfile }) => {
  // State for AI chat
  const [chatOpen, setChatOpen] = useState(false);
  
  // Firebase references
  const auth = getAuth();
  const db = getFirestore();
  
  // State for data
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [activityData, setActivityData] = useState({});
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef({});
  
  // Load data when profile changes
  useEffect(() => {
    // Only load data if we haven't loaded them for this profile yet
    if (currentProfile && auth.currentUser && !hasLoadedRef.current[currentProfile.id]) {
      loadData();
      hasLoadedRef.current[currentProfile.id] = true;
    } else if (!currentProfile) {
      // Set default sample data if no profile selected
      setTasks([
        { id: '1', text: 'Create blog post about customer success story', completed: true, category: 'content', proofs: [
          { id: '101', name: 'blog-post-screenshot.png', url: '#', type: 'image/png', size: 245000, uploadDate: '2023-03-15T10:30:00Z' }
        ], notes: 'Published on the company blog and shared to social media channels' },
        { id: '2', text: 'Schedule social media posts for the week', completed: false, category: 'social', proofs: [], notes: '' },
        { id: '3', text: 'Analyze February campaign metrics', completed: false, category: 'analysis', proofs: [], notes: '' }
      ]);
      
      setMilestones([
        {
          id: '1',
          title: 'Reached 10,000 Email Subscribers',
          date: '2023-02-28',
          description: 'Achieved our Q1 goal of 10k subscribers through combined lead generation campaigns.',
          impact: 'Increased our potential marketing reach by 40% compared to last quarter.'
        }
      ]);
      
      setActivityData({
        "2023-03-15": 5,
        "2023-03-16": 3,
        "2023-03-17": 7
      });
      
      setIsLoading(false);
    }
  }, [currentProfile, auth.currentUser]);
  
  // Function to load all data
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // Load tasks
      const tasksDocRef = doc(db, 'marketing_tasks', `${currentProfile.id}_${auth.currentUser.uid}`);
      const tasksDoc = await getDoc(tasksDocRef);
      
      if (tasksDoc.exists()) {
        console.log('Loaded tasks:', tasksDoc.data().tasks);
        setTasks(tasksDoc.data().tasks || []);
      } else {
        console.log('No tasks found, setting empty array');
        setTasks([]);
      }
      
      // Load milestones
      const milestonesDocRef = doc(db, 'marketing_milestones', `${currentProfile.id}_${auth.currentUser.uid}`);
      const milestonesDoc = await getDoc(milestonesDocRef);
      
      if (milestonesDoc.exists()) {
        console.log('Loaded milestones:', milestonesDoc.data().milestones);
        setMilestones(milestonesDoc.data().milestones || []);
      } else {
        console.log('No milestones found, setting empty array');
        setMilestones([]);
      }
      
      // Load contribution data
      const contributionRef = doc(db, 'marketing_contributions', `${currentProfile.id}_${auth.currentUser.uid}`);
      const contributionDoc = await getDoc(contributionRef);
      
      if (contributionDoc.exists()) {
        console.log('Loaded contribution data:', contributionDoc.data().data);
        setActivityData(contributionDoc.data().data || {});
      } else {
        console.log('No contribution data found, setting empty object');
        setActivityData({});
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data from database');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simple direct task management functions
// Task management functions with Firebase integration
const handleTaskToggle = async (taskId) => {
  try {
    // Update locally first for immediate UI response
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    
    if (auth.currentUser && currentProfile) {
      // Update in Firebase
      const tasksDocRef = doc(db, 'marketing_tasks', `${currentProfile.id}_${auth.currentUser.uid}`);
      await updateDoc(tasksDocRef, { 
        tasks: updatedTasks,
        updatedAt: new Date().toISOString()
      });
      
      // Update contribution data for today
      const today = new Date().toISOString().split('T')[0];
      const contributionRef = doc(db, 'marketing_contributions', `${currentProfile.id}_${auth.currentUser.uid}`);
      const contributionDoc = await getDoc(contributionRef);
      
      if (contributionDoc.exists()) {
        const contributionData = contributionDoc.data().data || {};
        contributionData[today] = (contributionData[today] || 0) + 1;
        await updateDoc(contributionRef, { data: contributionData });
      } else {
        await setDoc(contributionRef, {
          data: { [today]: 1 },
          userId: auth.currentUser.uid,
          profileId: currentProfile.id,
          createdAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Error toggling task:', error);
    toast.error('Failed to update task status');
  }
};
  
  const handleTaskAdd = (newTask) => {
    console.log('Adding new task:', newTask);
    setTasks(prevTasks => [...prevTasks, newTask]);
  };
  
  const handleTaskDelete = async (taskId) => {
    try {
      // Update locally first
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      if (auth.currentUser && currentProfile) {
        // Update in Firebase
        const tasksDocRef = doc(db, 'marketing_tasks', `${currentProfile.id}_${auth.currentUser.uid}`);
        await updateDoc(tasksDocRef, { 
          tasks: updatedTasks,
          updatedAt: new Date().toISOString()
        });
        
        toast.success('Task deleted');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task from database');
    }
  };
  
  const handleProofAttach = (taskId, proofs) => {
    console.log('Attaching proof to task:', taskId, proofs);
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, proofs: [...(task.proofs || []), ...proofs] }
        : task
    ));
  };
  
  const handleAddNotes = (taskId, notes) => {
    console.log('Adding notes to task:', taskId, notes);
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, notes } : task
    ));
  };
  
  // Add milestone
  const handleAddMilestone = (newMilestone) => {
    console.log('Adding new milestone:', newMilestone);
    setMilestones([...milestones, newMilestone]);
  };
  
  // Calculate task completion stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
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
          className="flex items-center justify-center bg-green-600 hover:bg-slate-600 text-white rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-105"
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
                      ? 'bg-green-600 text-white rounded-br-none' 
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
                className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
              <button
                onClick={handleSendMessage}
                className="bg-green-600 text-white p-2 rounded-r-md hover:bg-slate-600"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl text-center mb-4 text-slate-800">
          Marketing Dashboard {currentProfile ? `for Profile: ${currentProfile.name}` : ''}
        </h2>
        
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
              className="bg-green-600 h-2.5 rounded-full" 
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
            currentProfile={currentProfile}
          />
          
          <MarketingMilestones 
            milestones={milestones}
            onAddMilestone={handleAddMilestone}
            currentProfile={currentProfile}
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