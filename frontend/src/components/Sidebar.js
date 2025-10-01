import React, { useContext } from 'react';
import { MapContext } from '../App'; 
import AstraLensLogo from './assets/logo.svg';
import './styles/Sidebar.css';

const LiveIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="6" fill="#00FF00"/>
    <circle cx="6" cy="6" r="3" fill="#0D4217"/>
  </svg>
);

function StatusMetric({ value, label, children }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2">
        {children}
        <p className="text-2xl font-semibold">{value}</p>
      </div>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

function LabeledFeatureItem({ feature, onClick }) {
  const lat = feature.coordinates ? feature.coordinates[0].toFixed(2) : 'N/A';
  const lon = feature.coordinates ? feature.coordinates[1].toFixed(2) : 'N/A';

  return (
    <li 
      className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-800 cursor-pointer"
      onClick={() => onClick(feature.id)} 
    >
      <div className="w-4 h-4 rounded-full border-2 border-gray-500 mt-1 flex-shrink-0"></div>
      <div>
        <h4 className="font-bold text-gray-200">{feature?.name || 'Unnamed Feature'}</h4>
        <p className="text-xs text-gray-400">Lat: {lat}, Lon: {lon}</p>
        <p className="text-sm text-gray-300 mt-1">
          {feature?.description || 'No description available.'}
        </p>
      </div>
    </li>
  );
}


function Sidebar({ isOpen, toggleSidebar, toggleSearch }) {
const { lunarData, allFeatures, selectFeatureForSearch, appMode, toggleMeasureMode, toggleAnalysisMode, isAiPanelOpen, toggleAiPanel } = useContext(MapContext);
  return (
    <>
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}

      <aside 
        className={`w-[350px] h-full bg-[#111111] text-gray-200 flex flex-col p-4 border-r border-gray-800 
                   fixed md:relative inset-y-0 left-0 z-40 
                   transition-transform duration-300 ease-in-out
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                   md:translate-x-0`}
      >
        
        <header className="mb-4 flex items-center gap-3">
          <img 
              src={AstraLensLogo} 
              alt="AstraLens Logo" 
              className="h-10 w-10"
          />
          <div>
              <h1 className="text-lg font-bold">Lunar Reconnaissance</h1>
              <h2 className="text-md text-gray-400">Mission Control</h2>
          </div>
        </header>

        <section className="flex justify-around items-center p-3 bg-gray-900 rounded-lg border border-gray-700 mb-4">
          <StatusMetric value={allFeatures?.length || 0} label="Features" />          <StatusMetric value="LIVE" label="Status">
            <LiveIcon />
          </StatusMetric>
        </section>

        <section className="mb-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Analysis Tools</h3>
          <div className="space-y-2 bg-gray-900 border border-gray-700 rounded-lg p-3">
          <button 
            onClick={toggleMeasureMode} 
            className={`w-full text-left p-2 rounded-md transition-colors ${appMode === 'measure' ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'}`}
          >
            Measure Distance
          </button> 
          <button 
            onClick={toggleSearch} 
            className="w-full text-left p-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Feature ID Search
          </button>           
          <button 
            onClick={toggleAnalysisMode} 
            className={`w-full text-left p-2 rounded-md transition-colors ${appMode === 'analysis' ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'}`}
          >
            Landing Site Suitability Analysis
          </button>
          <button 
            onClick={toggleAiPanel} 
            className={`w-full text-left p-2 rounded-md transition-colors ${isAiPanelOpen ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'}`}
          >
            Astra AI Assistant
          </button>
          </div>
        </section>

        <section className="flex flex-col flex-grow min-h-0">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Labeled Features</h3>
          <div className="flex-grow bg-gray-900 border border-gray-700 rounded-lg p-2 overflow-y-auto">
            {allFeatures.length > 0 ? (
              <ul className="space-y-2">
                {allFeatures.map(feature => (
                  <LabeledFeatureItem 
                    key={feature.id} 
                    feature={feature} 
                    onClick={selectFeatureForSearch} 
                  />
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 pt-8">
                <p>Loading features...</p>
              </div>
            )}
          </div>
        </section>

        <footer className="text-center pt-3 flex-shrink-0 flex justify-between text-xs text-gray-600">
          <p>2025 NASA Space Apps Challenge</p>
          <a href="#" className="hover:text-gray-400">Dream Architects</a>
        </footer>
      </aside>
    </>
  );
}

export default Sidebar;

