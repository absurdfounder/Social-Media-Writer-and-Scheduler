import React, { useState, useEffect } from 'react';

const questions = [
  { id: 'name', question: "What is the name of your product/service?", type: "short", limit: 50 },
  { id: 'description', question: "In one sentence, how would you describe [NAME]?", type: "long", limit: 150 },
  { id: 'website', question: "What is the website URL for [NAME]?", type: "short", limit: 100 },
  { id: 'adjacent', question: "List 3-5 adjacent website URLs that could indirectly bring traffic to [NAME]'s website", type: "long", limit: 250 },
  { id: 'audience', question: "Who is the target audience for [NAME]?", type: "short", limit: 100 },
  { id: 'problems', question: "What specific problems does [NAME] solve?", type: "long", limit: 200 },
  { id: 'features', question: "What are the main features of [NAME]?", type: "long", limit: 200 },
  { id: 'skills', question: "Does [NAME] require any special skills to use?", type: "short", limit: 100 },
  { id: 'unique', question: "What makes [NAME] unique in the market?", type: "long", limit: 200 },
  { id: 'integrations', question: "What platforms or technologies does [NAME] integrate with?", type: "short", limit: 150 },
  { id: 'scalability', question: "How scalable is [NAME]?", type: "short", limit: 100 },
  { id: 'results', question: "What types of outputs or results can users expect from [NAME]?", type: "long", limit: 200 },
  { id: 'industries', question: "Are there any specific industries or sectors [NAME] caters to?", type: "short", limit: 150 },
  { id: 'benefits', question: "What are the key benefits of using [NAME]?", type: "long", limit: 200 },
  { id: 'security', question: "How does [NAME] ensure security and reliability?", type: "long", limit: 200 },
  { id: 'support', question: "What kind of support or resources do you offer to [NAME]'s users?", type: "long", limit: 200 },
  { id: 'tiers', question: "Are there different tiers or versions of [NAME] available?", type: "short", limit: 150 },
];

const ProductQuestionnaire = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saved, setSaved] = useState(false);
  const [displayMode, setDisplayMode] = useState('card');
  const [profiles, setProfiles] = useState([]);
  const [currentProfileId, setCurrentProfileId] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [newProfileName, setNewProfileName] = useState('');

  useEffect(() => {
    // Load profiles and current profile from localStorage
    const savedProfiles = localStorage.getItem('profiles');
    let currentId = localStorage.getItem('currentProfileId');
    
    let parsedProfiles = [];
    if (savedProfiles) {
      parsedProfiles = JSON.parse(savedProfiles);
    }

    // Create default profile if no profiles exist
    if (parsedProfiles.length === 0) {
      const defaultProfile = {
        id: Date.now().toString(),
        name: 'Default Profile',
        answers: {}
      };
      parsedProfiles = [defaultProfile];
      localStorage.setItem('profiles', JSON.stringify(parsedProfiles));
      localStorage.setItem('currentProfileId', defaultProfile.id);
      currentId = defaultProfile.id;
    }

    setProfiles(parsedProfiles);
    
    // Set current profile
    if (currentId && parsedProfiles.find(p => p.id === currentId)) {
      setCurrentProfileId(currentId);
      const profile = parsedProfiles.find(p => p.id === currentId);
      setAnswers(profile.answers || {});
    } else {
      setCurrentProfileId(parsedProfiles[0].id);
      setAnswers(parsedProfiles[0].answers || {});
    }
  }, []);

  const handleAnswer = (answer, questionId = null) => {
    const id = questionId || questions[currentQuestion].id;
    const newAnswers = { ...answers, [id]: answer };
    setAnswers(newAnswers);

    if (currentProfileId) {
      const updatedProfiles = profiles.map(profile => 
        profile.id === currentProfileId 
          ? { ...profile, answers: newAnswers }
          : profile
      );
      setProfiles(updatedProfiles);
      localStorage.setItem('profiles', JSON.stringify(updatedProfiles));
    }
  };

  const handleSaveAndNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1000);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      const newProfile = {
        id: Date.now().toString(),
        name: newProfileName,
        answers: {}
      };
      
      const newProfiles = [...profiles, newProfile];
      setProfiles(newProfiles);
      setCurrentProfileId(newProfile.id);
      setAnswers({});
      localStorage.setItem('profiles', JSON.stringify(newProfiles));
      localStorage.setItem('currentProfileId', newProfile.id);
      setNewProfileName('');
      setIsProfileModalOpen(false);
    }
  };

  const handleSwitchProfile = (profileId) => {
    setCurrentProfileId(profileId);
    const profile = profiles.find(p => p.id === profileId);
    setAnswers(profile.answers || {});
    localStorage.setItem('currentProfileId', profileId);
    setCurrentQuestion(0);
    setIsProfileModalOpen(false);
  };

  const handleDeleteProfile = (profileId) => {
    let updatedProfiles = profiles.filter(p => p.id !== profileId);
    
    // If deleting last profile, create a new default profile
    if (updatedProfiles.length === 0) {
      const defaultProfile = {
        id: Date.now().toString(),
        name: 'Default Profile',
        answers: {}
      };
      updatedProfiles = [defaultProfile];
      handleSwitchProfile(defaultProfile.id);
    } else if (currentProfileId === profileId) {
      handleSwitchProfile(updatedProfiles[0].id);
    }
    
    setProfiles(updatedProfiles);
    localStorage.setItem('profiles', JSON.stringify(updatedProfiles));
    setIsProfileModalOpen(false);
  };

  const handleEditProfile = () => {
    if (editingProfile && newProfileName.trim()) {
      const updatedProfiles = profiles.map(profile =>
        profile.id === editingProfile.id
          ? { ...profile, name: newProfileName }
          : profile
      );
      setProfiles(updatedProfiles);
      localStorage.setItem('profiles', JSON.stringify(updatedProfiles));
      setEditingProfile(null);
      setNewProfileName('');
    }
  };

  const replaceContext = (question) => {
    return question.replace(/\[NAME\]/g, answers.name || 'your product/service');
  };

  const getInputComponent = (type, limit, questionId) => {
    const value = answers[questionId] || '';
    const handleChange = (e) => {
      const newValue = e.target.value.slice(0, limit);
      handleAnswer(newValue, questionId);
    };

    if (type === "long") {
      return (
        <div className="relative">
          <textarea
            value={value}
            onChange={handleChange}
            placeholder="Enter your answer here"
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
            rows={4}
          />
          <div className="absolute bottom-2 right-2 text-sm text-gray-500">
            {value.length}/{limit}
          </div>
        </div>
      );
    }
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Enter your answer here"
          className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
        />
        <div className="absolute bottom-2 right-2 text-sm text-gray-500">
          {value.length}/{limit}
        </div>
      </div>
    );
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const currentProfile = profiles.find(p => p.id === currentProfileId);

  const ProfileModal = () => {
    if (!isProfileModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pb-20 text-center">
          {/* Overlay */}
          <div 
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={() => setIsProfileModalOpen(false)}
          ></div>

          {/* Modal */}
          <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Profile Management
              </h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile List */}
            <div className="space-y-2 mb-6">
              {profiles.map(profile => (
                <div key={profile.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="font-medium">{profile.name}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleSwitchProfile(profile.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                    >
                      Select
                    </button>
                    <button
                      onClick={() => {
                        setEditingProfile(profile);
                        setNewProfileName(profile.name);
                      }}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200"
                    >
                      Edit
                    </button>
                    {profiles.length > 1 && (
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Create/Edit Profile Form */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-2">
                {editingProfile ? 'Edit Profile' : 'Create New Profile'}
              </h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Enter profile name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={editingProfile ? handleEditProfile : handleCreateProfile}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                >
                  {editingProfile ? 'Save' : 'Create'}
                </button>
                {editingProfile && (
                  <button
                    onClick={() => {
                      setEditingProfile(null);
                      setNewProfileName('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCardView = () => (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-500 ease-out transform hover:scale-105">
      <div className="p-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-500">
          Question {currentQuestion + 1} of {questions.length}
        </h3>
        <p className="text-lg text-gray-500 mb-4">{replaceContext(questions[currentQuestion].question)}</p>
        {getInputComponent(questions[currentQuestion].type, questions[currentQuestion].limit, questions[currentQuestion].id)}
      </div>
      <div className="px-8 py-4 bg-gray-50 flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-2 bg-gray-200 text-gray-500 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition duration-200 ease-in-out"
        >
          Previous
        </button>
        <button
          onClick={handleSaveAndNext}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 ease-in-out flex items-center"
        >
          {currentQuestion === questions.length - 1 ? 'Finish' : 'Save & Next'}
          {saved && (
            <svg className="w-5 h-5 ml-2 text-green-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
      {questions.map((q, index) => (
        <div key={q.id} className="p-6 border-b border-gray-200 last:border-b-0">
          <h3 className="text-lg font-semibold mb-2 text-gray-500">
            Question {index + 1}: {replaceContext(q.question)}
          </h3>
          {getInputComponent(q.type, q.limit, q.id)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl text-center mb-4 text-blue-800">Tell our personal journey AI about your offerings</h2>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2 p-2 px-6 bg-gray-50 border rounded-md">
            <span className="text-blue-600">{currentProfile?.name}</span>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Manage Profiles
          </button>
        </div>
        <ProfileModal />
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setDisplayMode('card')}
            className={`px-4 py-2 mr-2 rounded-lg ${displayMode === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} transition duration-200`}
          >
            Card View
          </button>
          <button
            onClick={() => setDisplayMode('list')}
            className={`px-4 py-2 rounded-lg ${displayMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} transition duration-200`}
          >
            List View
          </button>
        </div>
        {displayMode === 'card' && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
      {displayMode === 'card' ? renderCardView() : renderListView()}
    </div>
  );
};

export default ProductQuestionnaire;