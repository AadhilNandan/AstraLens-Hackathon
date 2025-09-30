import React, { useContext } from 'react';
import { MapContext } from '../App'; 
import AstraLensLogo from './assets/logo.svg';

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

function ToolButton({ children }) {
  return (
    <button className="w-full text-left p-3 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 transition-colors">
      {children}
    </button>
  );
}

function Sidebar() {
  const { labeledFeatures, clearPoints } = useContext(MapContext);

  return (
    <aside className="w-[350px] h-full bg-[#111111] text-gray-200 flex flex-col p-4 border-r border-gray-800">
      
      <header className="mb-6 flex items-center gap-3">
        <img 
            src={AstraLensLogo} 
            alt="AstraLens Logo" 
            className="h-32 w-32"
        />
        <div>
            <h1 className="text-xl font-bold">Lunar Reconnaissance</h1>
            <h2 className="text-lg text-gray-400">Mission Control</h2>
        </div>
      </header>

      <section className="flex justify-around items-center p-4 bg-gray-900 rounded-lg border border-gray-700 mb-6">
        <StatusMetric value={labeledFeatures.length} label="Features" />
        <StatusMetric value="100%" label="Coverage" />
        <StatusMetric value="LIVE" label="Status">
          <LiveIcon />
        </StatusMetric>
      </section>

      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Analysis Tools</h3>
        <div className="space-y-2">
          <ToolButton>Measure Distance</ToolButton>
          <ToolButton>Feature ID Search</ToolButton>
          <ToolButton>Overlay Topology</ToolButton>
          <button 
            onClick={clearPoints}
            className="w-full text-left p-3 text-red-400 bg-gray-800 border border-gray-700 rounded-md hover:bg-red-900/50 transition-colors">
            Clear All Labels
          </button>
        </div>
      </section>

      <section className="flex flex-col flex-grow min-h-0">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Labeled Features</h3>
        <div className="flex-grow bg-gray-900 border border-gray-700 rounded-lg p-3 overflow-y-auto">
          {labeledFeatures.length > 0 ? (
            <ul className="space-y-4">
              {labeledFeatures.map(feature => (
                <li key={feature.id} className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-green-500 mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-bold">{feature.name}</h4>
                    <p className="text-xs text-gray-400">Distance: {feature.distance} km</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Analysis data and description will appear here.
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500 pt-8">
              <p>No features labeled yet.</p>
              <p className="text-xs mt-1">Click on the map to start measuring.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="text-center pt-4 flex-shrink-0">
        <p className="text-xs text-gray-600">2025 NASA Space Apps Challenge</p>
      </footer>
    </aside>
  );
}

export default Sidebar;