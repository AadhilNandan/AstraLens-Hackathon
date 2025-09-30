import React, { useState, createContext, useCallback } from 'react';
import MapView from './MapView';
import Sidebar from './components/Sidebar';
import './App.css';

export const MapContext = createContext();

function App() {
  const [points, setPoints] = useState([]);
  const [distanceKm, setDistance] = useState('Click two points to measure.');
  const [labeledFeatures, setLabeledFeatures] = useState([]);

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
    setDistance('Click two points to measure.');
  }, []);



  const contextValue = {
    points,
    addPoint,
    clearPoints,
    distanceKm,
    setDistance,
    labeledFeatures,
    setLabeledFeatures,
  };

  return (
      <MapContext.Provider value={contextValue}>
        <div className="flex h-screen w-screen bg-black">
          <Sidebar />
          
          <main className="flex-grow h-full">
            <MapView />
          </main>
        </div>
      </MapContext.Provider>
    );
}

export default App;
