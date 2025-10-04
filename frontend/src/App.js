import React, { useState, createContext, useCallback, useEffect} from 'react';
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
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    fetch('/features_all.json')
      .then(response => response.json())
      .then(data => setAllFeatures(data))
      .catch(error => console.error("Failed to load allFeatures.json:", error));

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

  const askAi = async (userQuestion) => {
    if (!lunarData) {
        setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, the lunar database is not loaded yet." }]);
        return;
    }
    if (isAiLoading || cooldown > 0) return;
    setIsAiLoading(true);
    const updatedChatHistory = [...chatHistory, { role: 'user', text: userQuestion }];
    setChatHistory(updatedChatHistory);
    const yourServerUrl = 'https://astralens-hackathon.onrender.com/ask-ai';
    try {
        const response = await fetch(yourServerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_question: userQuestion,
            })
        });
        if (!response.ok) {
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
        let secondsLeft = 5;
        setCooldown(secondsLeft);
        const timer = setInterval(() => {
            secondsLeft--;
            setCooldown(secondsLeft);
            if (secondsLeft <= 0) {
                clearInterval(timer);
            }
        }, 1000);
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
    points, addPoint, clearPoints, distanceKm, setDistance, labeledFeatures, setLabeledFeatures,
    lunarData, allFeatures, searchId, setSearchId, selectFeatureForSearch, appMode,
    toggleMeasureMode, analysisResult, setAnalysisResult, toggleAnalysisMode, isAiPanelOpen,
    toggleAiPanel, chatHistory, isAiLoading, cooldown, askAi,
  };

  return (
    <MapContext.Provider value={contextValue}>
      <div className={`flex h-screen w-screen bg-black ${appMode === 'measure' || appMode === 'analysis' ? 'cursor-crosshair' : ''}`}>
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          toggleSearch={() => setIsSearchVisible(prev => !prev)}
        />

        <main className={`flex-grow h-full relative ${isSidebarOpen ? 'z-0' : 'z-10'}`}>
          {/* Hamburger Menu: Moved to the top-right corner */}
          <div className={`absolute top-4 right-4 md:hidden z-[1001] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button
              onClick={toggleSidebar}
              className="p-2 bg-gray-900 bg-opacity-75 rounded-md text-white backdrop-blur-sm shadow-lg"
            >
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

