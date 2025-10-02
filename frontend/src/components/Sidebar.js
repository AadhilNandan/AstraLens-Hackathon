import React, { useContext } from 'react';
import { MapContext } from '../App'; 
import AstraLensLogo from './assets/logo.svg';
import './styles/Sidebar.css';

const LiveIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="6" fill="#00FF00" className="shadow-live-glow"/>
    <circle cx="6" cy="6" r="3" fill="#0D4217"/>
  </svg>
);

function StatusMetric({ value, label, children }) {
  return (
    <div className="text-center">
      <div className="flex items-baseline justify-center gap-1">
        <p className="text-3xl font-bold text-cyan-300">{value}</p>
        {children}
      </div>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

const ToolIcon = ({ name, className }) => {
    switch (name) {
        case 'Measure Distance':
            return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15m15 0a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" /></svg>;
        case 'Feature ID Search':
            return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
        case 'Landing Site Suitability Analysis':
            return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'Astra AI Assistant':
            return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H8v-2h3v2zm4 0h-3v-2h3v2zM9 10V8h6v2H9z"/></svg>;
        default:
            return null;
    }
}

function LabeledFeatureItem({ feature, onClick }) {
  const lat = feature.coordinates ? feature.coordinates[0].toFixed(2) : 'N/A';
  const lon = feature.coordinates ? feature.coordinates[1].toFixed(2) : 'N/A';

  return (
    <li 
      className="flex items-start gap-3 p-3 rounded-xl bg-gray-900 border border-cyan-800 hover:bg-gray-800 cursor-pointer transition-all duration-150 shadow-inner-dark"
      onClick={() => onClick(feature.id)} 
    >
      <div className="w-4 h-4 rounded-full border-2 border-cyan-500 mt-1 flex-shrink-0 bg-gray-900 shadow-feature-glow"></div>
      <div>
        <h4 className="font-bold text-white text-base">{feature?.name || 'Unnamed Feature'}</h4>
        <p className="text-xs text-cyan-400">{`Lat: ${lat}, Lon: ${lon}`}</p>
        <p className="text-sm text-gray-300 mt-1 line-clamp-2">
          {feature?.description || 'No description available.'}
        </p>
      </div>
    </li>
  );
}

function Sidebar({ isOpen, toggleSidebar, toggleSearch }) {
const { lunarData, allFeatures, selectFeatureForSearch, appMode, toggleMeasureMode, toggleAnalysisMode, isAiPanelOpen, toggleAiPanel } = useContext(MapContext);

const coverageValue = '100%';

  return (
    <>
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/70 z-30" 
          onClick={toggleSidebar}
        ></div>
      )}

      <aside 
        className={`w-[350px] h-full bg-[#111111] text-gray-200 flex flex-col p-4 border-r border-cyan-800 
                   fixed md:relative inset-y-0 left-0 z-40 
                   transition-transform duration-300 ease-in-out
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                   md:translate-x-0`}
      >
        
        <header className="mb-4 flex items-center gap-2">
          <img 
              src={AstraLensLogo} 
              alt="AstraLens Logo" 
              className="h-6 w-6 filter drop-shadow-lg shadow-cyan-400"
          />
          <div>
              <h1 className="text-lg font-bold text-white">Lunar Reconnaissance</h1>
              <h2 className="text-xs text-gray-400">Mission Control</h2>
          </div>
        </header>

        <section className="flex justify-between items-center p-3 bg-gray-900 rounded-xl border border-cyan-800 mb-4 shadow-md shadow-cyan-900/50">
          <StatusMetric value={allFeatures?.length || 0} label="Features" />
          <StatusMetric value={coverageValue} label="Coverage" /> 
          <StatusMetric 
            value={
                <span className="flex items-center gap-1 text-green-400">
                    <LiveIcon />
                    LIVE
                </span>
            } 
            label="Status"
          />
        </section>

        <div className="h-[1px] bg-cyan-700/50 my-2"></div>

        <section className="mb-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Analysis Tools</h3>
          <div className="space-y-1">
          
          <button 
            onClick={toggleMeasureMode} 
            className={`w-full text-left p-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-3
                      ${appMode === 'measure' 
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
                        : 'hover:bg-gray-800'}`}
            title="Calculate the distance between two selected points on the lunar surface."
          >
                <ToolIcon name="Measure Distance" className="w-5 h-5" />
            Measure Distance
          </button> 
          
          <button 
            onClick={toggleSearch} 
            className="w-full text-left p-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-3 hover:bg-gray-800"
            title="Opens the search panel to locate features by their unique ID."
          >
                <ToolIcon name="Feature ID Search" className="w-5 h-5" />
            Feature ID Search
          </button>           
          
          <button 
            onClick={toggleAnalysisMode} 
            className={`w-full text-left p-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-3
                      ${appMode === 'analysis' 
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
                        : 'hover:bg-gray-800'}`}
            title="Toggle the specialized analysis mode for evaluating potential landing zones."
          >
                <ToolIcon name="Landing Site Suitability Analysis" className="w-5 h-5" />
            Landing Site Suitability Analysis
          </button>
          
          <button 
            onClick={toggleAiPanel} 
            className={`w-full text-left p-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-3
                      ${isAiPanelOpen 
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
                        : 'hover:bg-gray-800'}`}
            title="Open the Astra AI Assistant panel for advanced queries and conversational data analysis."
          >
                <ToolIcon name="Astra AI Assistant" className="w-5 h-5" />
            Astra AI Assistant
          </button>
          </div>
        </section>
        <div className="h-[1px] bg-cyan-700/50 my-2"></div>


        <section className="flex flex-col flex-grow min-h-0">
          <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Labeled Features</h3>
          <div className="flex-grow bg-[#111111] border border-cyan-800 rounded-xl p-2 overflow-y-auto shadow-inner-lg">
            {allFeatures.length > 0 ? (
              <ul className="space-y-1">
                {allFeatures.map(feature => (
                  <LabeledFeatureItem 
                    key={feature.id} 
                    feature={feature} 
                    onClick={selectFeatureForSearch} 
                  />
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 pt-4">
                <p>Loading features...</p>
              </div>
            )}
          </div>
        </section>

        <footer className="text-center pt-3 flex-shrink-0 flex justify-between text-xs border-t border-gray-800 mt-3">
          <p className="text-gray-500">2025 NASA Space Apps Challenge</p>
          <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Dream Architects</a>
        </footer>
      </aside>
    </>
  );
}

export default Sidebar;

