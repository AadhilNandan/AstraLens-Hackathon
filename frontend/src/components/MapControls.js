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
      alert("Please enter a Feature ID.");
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
      <div className="feature-search-container">
        <label htmlFor="feature-id-search">Feature ID Search</label>
        <div className="search-bar">
          <input
            type="text"
            id="feature-id-search"
            placeholder="e.g., TYC-001"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>
    </div>
  );
};

export default MapControls;