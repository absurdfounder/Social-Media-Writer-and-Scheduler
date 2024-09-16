import React, { useState, useEffect } from 'react';

const questions = [
  { id: 'name', question: "What is the name of your product/service?", type: "short", limit: 50 },
  { id: 'description', question: "In one sentence, how would you describe [NAME]?", type: "long", limit: 150 },
  { id: 'website', question: "What is the website URL for [NAME]?", type: "short", limit: 100 },
  { id: 'adjacent', question: "List 3-5 adjacent website URLs that could indirectly bring traffic to [NAME]'s website (e.g., relevant subreddits, forums, or complementary services)", type: "long", limit: 250 },
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
  const [displayMode, setDisplayMode] = useState('card'); // 'card' or 'list'

  useEffect(() => {
    const savedAnswers = localStorage.getItem('productQuestionnaire');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  const handleAnswer = (answer, questionId = null) => {
    const id = questionId || questions[currentQuestion].id;
    setAnswers(prev => ({ ...prev, [id]: answer }));
  };

  const handleSaveAndNext = () => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: answers[questions[currentQuestion].id] || '' };
    localStorage.setItem('productQuestionnaire', JSON.stringify(newAnswers));
    setSaved(true);
    setTimeout(() => setSaved(false), 1000);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
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

  const renderCardView = () => (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-500 ease-out transform hover:scale-105">
      <div className="p-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Question {currentQuestion + 1} of {questions.length}
        </h3>
        <p className="text-lg text-gray-600 mb-4">{replaceContext(questions[currentQuestion].question)}</p>
        {getInputComponent(questions[currentQuestion].type, questions[currentQuestion].limit, questions[currentQuestion].id)}
      </div>
      <div className="px-8 py-4 bg-gray-50 flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition duration-200 ease-in-out"
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
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Question {index + 1}: {replaceContext(q.question)}
          </h3>
          {getInputComponent(q.type, q.limit, q.id)}
        </div>
      ))}
      <div className="px-8 py-4 bg-gray-50 flex justify-end">
        <button
          onClick={() => {
            localStorage.setItem('productQuestionnaire', JSON.stringify(answers));
            setSaved(true);
            setTimeout(() => setSaved(false), 1000);
          }}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 ease-in-out flex items-center"
        >
          Save All
          {saved && (
            <svg className="w-5 h-5 ml-2 text-green-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl text-center mb-4 text-blue-800">Tell our AI about your offerings</h2>
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setDisplayMode('card')}
            className={`px-4 py-2 mr-2 rounded-lg ${displayMode === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Card View
          </button>
          <button
            onClick={() => setDisplayMode('list')}
            className={`px-4 py-2 rounded-lg ${displayMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            List View
          </button>
        </div>
        {displayMode === 'card' && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
      {displayMode === 'card' ? renderCardView() : renderListView()}
    </div>
  );
};

export default ProductQuestionnaire;