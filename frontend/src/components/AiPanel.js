// AiPanel.js
import React, { useState, useRef, useContext, useEffect } from 'react';
import { MapContext } from '../App'; // adjust path if needed

export default function AiPanel() {
  const { isAiPanelOpen, toggleAiPanel, chatHistory, isAiLoading, askAi } = useContext(MapContext);
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleSend = () => {
    if (userInput.trim() && !isAiLoading) {
      askAi(userInput);
      setUserInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isAiPanelOpen) toggleAiPanel();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isAiPanelOpen, toggleAiPanel]);

  return (
    <div className={`absolute top-0 right-0 h-full bg-gray-900 border-l border-gray-700 shadow-2xl z-[1001] w-full max-w-md transition-transform duration-300 ease-in-out flex flex-col ${isAiPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <h3 className="text-lg font-bold text-white">Astra AI Assistant</h3>
        <button onClick={toggleAiPanel} className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-sm p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {isAiLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-sm p-3 rounded-lg bg-gray-700 text-gray-400">
                <p className="text-sm animate-pulse">Astra is thinking...</p>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <footer className="p-4 border-t border-gray-700 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a feature..."
            className="flex-grow bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAiLoading}
          />
          <button onClick={handleSend} disabled={isAiLoading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50">
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}
