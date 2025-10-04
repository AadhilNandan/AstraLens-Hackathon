import React, { useState, useRef, useContext, useEffect } from 'react';
import { MapContext } from '../App';

export default function AiPanel() {
  const { isAiPanelOpen, toggleAiPanel, chatHistory, cooldown, askAi, isAiLoading } = useContext(MapContext);
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleSend = () => {
    if (userInput.trim() && cooldown === 0) {
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
    <>
      {isAiPanelOpen && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-md z-[1000]" onClick={toggleAiPanel}></div>
      )}

      <div 
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          bg-black/20 backdrop-blur-md rounded-[20px] border-2 border-cyan-400 ai-panel-glow
          z-[1001] w-[95%] max-w-2xl h-[90%] max-h-[700px] 
          transition-all duration-300 ease-in-out flex flex-col
          ${isAiPanelOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
      >
        
        <header className="flex items-center justify-between px-6 py-4 border-b border-cyan-800 flex-shrink-0">
          <div className="flex items-center gap-4">
            <svg className="w-7 h-7 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H8v-2h3v2zm4 0h-3v-2h3v2zM9 10V8h6v2H9z"/>
            </svg>
            <h3 className="text-2xl font-extrabold text-white tracking-wide">Astra AI Assistant</h3>
            <span className="text-sm text-green-400 ml-2 drop-shadow-[0_0_6px_#22d3ee]">● Online</span>
          </div>
          <button 
            onClick={toggleAiPanel} 
            className="text-gray-400 hover:text-cyan-400 p-2 rounded-full transition-colors"
            title="Close AI Assistant" 
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-grow px-6 py-4 overflow-y-auto">
          <div className="space-y-8">
            {chatHistory.length === 0 && (
              <div className="flex justify-start items-start gap-3">
                <svg className="w-6 h-6 text-cyan-400 mt-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H8v-2h3v2zm4 0h-3v-2h3v2zM9 10V8h6v2H9z"/>
                </svg>
                <div className="max-w-lg p-4 rounded-2xl bg-cyan-900/80 border border-cyan-700/50 text-gray-200 shadow-lg relative">
                  <p className="font-semibold text-cyan-200 mb-1 text-base">Hello! I'm Astra, your lunar reconnaissance AI assistant.</p>
                  <p className="text-base">I can help you analyze landing sites, identify lunar features, and provide mission-critical data. How can I assist you today?</p>
                  {/* <p className="absolute bottom-1 right-2 text-xs text-cyan-100/70">10:02 PM</p> */}
                </div>
              </div>
            )}

            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}>
                {msg.role !== 'user' && (
                  <svg className="w-5 h-5 text-cyan-400 mt-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H8v-2h3v2zm4 0h-3v-2h3v2zM9 10V8h6v2H9z"/>
                  </svg>
                )}
                <div className={`
      ${msg.role === 'user'
        ? 'bg-[#2563eb] text-white rounded-[20px] px-6 py-4 max-w-xs shadow-lg flex flex-col items-end'
        : 'bg-[#22313a] text-white rounded-[20px] px-6 py-4 max-w-lg shadow-lg flex flex-col items-start'}
      relative
    `}>
      <span className="text-base leading-relaxed">{msg.text}</span>
    </div>
  </div>
))}
            {isAiLoading && ( 
              <div className="flex justify-start">
                <div className="bg-[#22313a] text-white rounded-[20px] px-6 py-4 max-w-xs shadow-lg">
      <span className="text-base animate-pulse">Astra is thinking...</span>
    </div>
  </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <footer className="px-8 py-6 border-t border-cyan-800 flex-shrink-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Astra about lunar features, landing sites, or mission data..."
              className="flex-grow bg-black/60 border-2 border-cyan-600 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner-dark text-base"
              disabled={cooldown > 0}
              title="Type your question here"
            />
            <button 
              onClick={handleSend} 
              disabled={cooldown > 0} 
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold w-16 h-14 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {cooldown > 0 ? (
                <span className="text-lg font-bold">{cooldown}s</span>
              ) : (
                <svg className="w-7 h-7 rotate-45 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <div className="text-xs text-cyan-100/70 mt-3">
            Astra uses real-time lunar reconnaissance data to provide accurate mission insights.
          </div>
        </footer>
      </div>
    </>
  );
}
