import React, { useState, createContext, useCallback, useEffect, use } from 'react';
import MapView from './MapView';
import Sidebar from './components/Sidebar';
import './App.css';

export const MapContext = createContext();

function App() {
  const [points, setPoints] = useState([]);
  const [distanceKm, setDistance] = useState('Click two points to measure.');
  const [labeledFeatures, setLabeledFeatures] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [lunarData, setLunarData] = useState(null);
  const [allFeatures, setAllFeatures] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [appMode, setAppMode] = useState('normal');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
 

  useEffect(() => {
    // Fetch the comprehensive list for the sidebar and search
    fetch('/features_all.json')
      .then(response => response.json())
      .then(data => setAllFeatures(data))
      .catch(error => console.error("Failed to load allFeatures.json:", error));

    // Fetch the curated database for the AI
    fetch('/lunar_database.json')
      .then(response => response.json())
      .then(data => setLunarData(data))
      .catch(error => console.error("Failed to load lunar_database.json:", error));
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const toggleMeasureMode = () => {
    setAppMode(prevMode => {
      const newMode = prevMode === 'measure' ? 'normal' : 'measure';
      if (newMode === 'measure' || prevMode === 'measure') {
        clearPoints();
      }
      return newMode;
    });
  };

  const toggleAnalysisMode = () => {
    setAppMode(prevMode => {
      const newMode = prevMode === 'analysis' ? 'normal' : 'analysis';
      if (newMode === 'analysis' ) {
        setAnalysisResult(null);
      }
      return newMode;
    });
  };

//--- AI Assistant Logic ---
const askAi = async (userQuestion) => {
  if (!lunarData) {
    setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, the lunar database is not loaded yet." }]);
    return;
  }

  setIsAiLoading(true);
  const updatedChatHistory = [...chatHistory, { role: 'user', text: userQuestion }];
  setChatHistory(updatedChatHistory);

  // The URL of your backend endpoint on Render
  const yourServerUrl = 'https://astralens-hackathon.onrender.com/ask-ai';
  

  try {
    const response = await fetch(yourServerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Send the question and knowledge base to your server
      body: JSON.stringify({ 
        user_question: userQuestion,
        knowledge_base: lunarData,
      })
    });

    if (!response.ok) {
      // This will catch errors from your server or the Google API
      throw new Error(`Server request failed with status ${response.status}`);
    }

    const result = await response.json();
    const aiResponse = result.answer || "Sorry, I couldn't process that request.";
    
    setChatHistory(prev => [...prev, { role: 'model', text: aiResponse }]);

  } catch (error) {
    console.error("Error asking AI:", error);
    setChatHistory(prev => [...prev, { role: 'model', text: "An error occurred while contacting the AI. Please try again." }]);
  } finally {
    setIsAiLoading(false);
  }
};
    const toggleAiPanel = () => {
    setIsAiPanelOpen(prev => !prev);
  };

  const selectFeatureForSearch = (id) => {
    console.log(`[App.js] A feature was clicked! Setting searchId to: "${id}"`);
    
    setSearchId(String(id)); 
    setIsSearchVisible(true); 
  };

  const addPoint = useCallback((latlng) => {
    setPoints(prevPoints => {
      if (prevPoints.length >= 2) {
        return [{ id: Date.now(), latlng }];
      }
      return [...prevPoints, { id: Date.now(), latlng }];
    });
  }, []);

  const clearPoints = useCallback(() => {
    setPoints([]);
    setDistance('0.00');
  }, []);

  const contextValue = {
    points,
    addPoint,
    clearPoints,
    distanceKm,
    setDistance,
    labeledFeatures,
    setLabeledFeatures,
    lunarData,
    allFeatures,
    searchId, 
    setSearchId, 
    selectFeatureForSearch,
    appMode,
    toggleMeasureMode,
    analysisResult,
    setAnalysisResult,
    toggleAnalysisMode,
    isAiPanelOpen,
    toggleAiPanel,
    chatHistory,
    isAiLoading,
    askAi, 
  };

  return (
      <MapContext.Provider value={contextValue}>
      <div className={`flex h-screen w-screen bg-black ${appMode === 'measure' || appMode === 'analysis' ? 'cursor-crosshair' : ''}`}>          
        <Sidebar 
            isOpen={isSidebarOpen} 
            toggleSidebar={toggleSidebar}
            toggleSearch={() => setIsSearchVisible(prev => !prev)} 
          />
          
          <main className="flex-grow h-full relative">
            <div className="absolute top-4 left-4 md:hidden z-[1001]">
              <button onClick={toggleSidebar} className="p-2 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            <MapView isSearchVisible={isSearchVisible} />
          </main>
        </div>
      </MapContext.Provider>
    );
}

export default App;