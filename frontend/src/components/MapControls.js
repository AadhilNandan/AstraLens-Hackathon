import React, { useState, useContext, useEffect } from 'react';
import { MapContext } from '../App'; 
import './styles/MapControls.css';

function MapControls({ onFeatureSearch }) {
  const { allFeatures, searchId, setSearchId } = useContext(MapContext);
  
  const [inputValue, setInputValue] = useState(searchId);

  useEffect(() => {
    console.log(`[MapControls.js] The shared searchId changed to: "${searchId}". Updating the input field.`);
    setInputValue(searchId);
  }, [searchId]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  const handleSearch = () => {
    if (setSearchId) {
        setSearchId(inputValue);
    }

    if (!inputValue) {
      console.error("Please enter a Feature ID.");
      return;
    }

    const foundFeature = allFeatures.find(
      (feature) => String(feature.id).toLowerCase() === String(inputValue).toLowerCase()
    );

    if (foundFeature) {
      onFeatureSearch(foundFeature);
    } else {
      alert(`Feature with ID "${inputValue}" not found.`);
    }
  };
  
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="map-controls">
      <div className="feature-search-container"
      title="Search the lunar feature database by ID (e.g., 8 H-1) to quickly locate and highlight a specific feature on the map.">
        <label htmlFor="feature-id-search">Feature ID Search</label>
        <div className="search-bar">
          <input
            type="text"
            id="feature-id-search"
            placeholder="e.g., 8 H-1"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-black/50 border border-cyan-600 rounded-md p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm h-9"
            title="Enter Feature ID"
          />
          <button 
            onClick={handleSearch} 
            className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold px-4 py-2 rounded-md transition-colors text-sm flex items-center justify-center h-9 ml-2"
            title="Execute Feature Search"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapControls;