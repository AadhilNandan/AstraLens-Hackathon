import React, { useCallback, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, CircleMarker, Popup, useMap, Marker, GeoJSON, Polyline, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContext } from './App'; 
import MapControls from './components/MapControls'; 
import AiPanel from './components/AiPanel';
import topologyData from './components/assets/topology_zones.geojson'; 

const customIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <circle cx="16" cy="16" r="14" fill="#00FFFF" stroke="#111111" stroke-width="2"/>
  <circle cx="16" cy="16" r="6" fill="#111111"/>
  <circle cx="16" cy="16" r="3" fill="#FFFFFF"/>
</svg>
`;
const iconUrl = `data:image/svg+xml;utf8,${encodeURIComponent(customIconSvg)}`;

const customMarkerIcon = new L.Icon({
  iconUrl: iconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  shadowUrl: null,
});

if (L && L.Icon && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconUrl: iconUrl,
        shadowUrl: null,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
}

const IMAGE_WIDTH = 34748;
const IMAGE_HEIGHT = 34748;
const MAX_NATIVE_Z = 0; 
const MIN_TILE_Z = -8; 
const PIXEL_TO_KM_FACTOR = 0.1; 

const simple_crs = L.extend({}, L.CRS.Simple, {
    scale: function (zoom) {
        return Math.pow(2, zoom);
    },
});

const mapBounds = [[0, 0], [-IMAGE_HEIGHT, IMAGE_WIDTH]]; 



function FeatureInteraction() {
    const { points, addPoint, setDistance, appMode, toggleMeasureMode } = useContext(MapContext);
    const map = useMap();

    const handleMapClick = useCallback((e) => {
        if (appMode === 'measure') {
            const { latlng } = e;
            addPoint(latlng);
        }
    }, [appMode, addPoint]);

    useEffect(() => {
        if (appMode === 'measure' && points.length === 2) {
            const p1 = map.project(points[0].latlng, MAX_NATIVE_Z);
            const p2 = map.project(points[1].latlng, MAX_NATIVE_Z);
            const distanceKm = (p1.distanceTo(p2) * PIXEL_TO_KM_FACTOR).toFixed(2);
            setDistance(distanceKm);
        } else if (points.length < 2) {
            setDistance('0.00');
        }
    }, [points, map, appMode]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && appMode === 'measure') {
                toggleMeasureMode();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [appMode, toggleMeasureMode]);

    useMapEvents({ click: handleMapClick });

    if (appMode !== 'measure') return null;

    return (
        <>
            {points.map((p, index) => (
                <CircleMarker key={p.id} center={p.latlng} radius={5} color={index === 0 ? "#FFC107" : "#00FFFF"} fillOpacity={1}>
                    <Popup>Point {index === 0 ? 'A' : 'B'}</Popup>
                </CircleMarker>
            ))}
            {points.length === 2 && (
                <Polyline positions={points.map(p => p.latlng)} color="#00FFFF" weight={3} />
            )}
        </>
    );
}


function MapResizer() {
  const { isAiPanelOpen } = useContext(MapContext); 
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize(); 
    }, 310); 
    return () => {
      clearTimeout(timer);
    };
  }, [isAiPanelOpen, map]); 
    
    useEffect(() => {
        const initialTimer = setTimeout(() => {
            map.invalidateSize();
        }, 50); 
        return () => {
            clearTimeout(initialTimer);
        };
    }, []); 

  return null;
}

function SearchFlyTo({ feature }) {
    const map = useMap();
    const TARGET_ZOOM = MIN_TILE_Z + 5; 

    useEffect(() => {
        if (feature && feature.coordinates) {
            map.flyTo(feature.coordinates, TARGET_ZOOM); 
        }
    }, [feature, map]);

    return null;
}


function DistanceDisplay() {
    const { distanceKm, points, appMode } = useContext(MapContext);

    if (appMode !== 'measure' || points.length === 0) {
        return null;
    }
    
    return (
        <div className="leaflet-top leaflet-center bg-black/60 backdrop-blur-sm text-cyan-400 p-2 rounded-xl shadow-lg border border-cyan-800" style={{ marginTop: '10px' }}>
            <p className="text-xl font-bold">{distanceKm} km</p>
        </div>
    )
}


function AreaSelector() {
    const { appMode, setAnalysisResult, toggleAnalysisMode } = useContext(MapContext);
    const map = useMap();
    const [startPos, setStartPos] = useState(null);
    const [endPos, setEndPos] = useState(null);

    const runAnalysis = (bounds) => {
        const [sw, ne] = [bounds.getSouthWest(), bounds.getNorthEast()];
        const grid = [];
        const gridSize = 15; 

        let totalSlope = 0;
        let safeCount = 0;

        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const lat = sw.lat + (ne.lat - sw.lat) * (i / gridSize);
                const lng = sw.lng + (ne.lng - sw.lng) * (j / gridSize);
                const slope = Math.random() * 25; 
                totalSlope += slope;
                if (slope < 8) safeCount++;
                
                const cellBounds = [
                    [lat, lng],
                    [lat + (ne.lat - sw.lat) / gridSize, lng + (ne.lng - sw.lng) / gridSize]
                ];

                grid.push({ id: `${i}-${j}`, bounds: cellBounds, slope });
            }
        }

        const avgSlope = (totalSlope / (gridSize * gridSize)).toFixed(1);
        const safeArea = Math.round((safeCount / (gridSize * gridSize)) * 100);
        let suitability = 'D';
        if (safeArea > 85 && avgSlope < 5) suitability = 'A+';
        else if (safeArea > 70 && avgSlope < 8) suitability = 'A';
        else if (safeArea > 50 && avgSlope < 12) suitability = 'B';
        else if (safeArea > 30) suitability = 'C';

        setAnalysisResult({ grid, stats: { avgSlope, safeArea, suitability } });
    };

    useMapEvents({
        mousedown(e) {
            if (appMode === 'analysis') {
                map.dragging.disable();
                setStartPos(e.latlng);
                setEndPos(e.latlng);
                setAnalysisResult(null); 
            }
        },
        mousemove(e) {
            if (appMode === 'analysis' && startPos) {
                setEndPos(e.latlng);
            }
        },
        mouseup(e) {
            map.dragging.enable();
            if (appMode === 'analysis' && startPos && endPos) {
                const bounds = L.latLngBounds(startPos, endPos);
                runAnalysis(bounds);
                toggleAnalysisMode(); 
            }
            setStartPos(null);
            setEndPos(null);
        },
    });

    if (!startPos || !endPos) return null;

    return <Rectangle bounds={L.latLngBounds(startPos, endPos)} pathOptions={{ color: '#00FFFF', weight: 2, fill: true, fillOpacity: 0.1 }} />;
}

function AnalysisOverlay() {
    const { analysisResult } = useContext(MapContext);
    if (!analysisResult?.grid) return null;

    const getColor = (slope) => {
        if (slope < 8) return '#28a745'; 
        if (slope < 15) return '#ffc107'; 
        return '#dc3545'; 
    };

    return (
        <>
            {analysisResult.grid.map(cell => (
                <Rectangle
                    key={cell.id}
                    bounds={cell.bounds}
                    pathOptions={{
                        color: getColor(cell.slope),
                        fillColor: getColor(cell.slope),
                        weight: 1,
                        opacity: 0.6,
                        fillOpacity: 0.4,
                    }}
                />
            ))}
        </>
    );
}

function AnalysisScorecard() {
    const { analysisResult } = useContext(MapContext);
    if (!analysisResult?.stats) return null;

    const { avgSlope, safeArea, suitability } = analysisResult.stats;

    const suitabilityColor = suitability.startsWith('A') ? 'text-green-400' : 
                             suitability.startsWith('B') ? 'text-yellow-400' : 
                             suitability.startsWith('C') ? 'text-orange-400' : 'text-red-400';

    return (
        <div
            className="leaflet-top leaflet-center bg-black/60 backdrop-blur-sm text-white p-4 rounded-xl shadow-2xl border border-cyan-700"
            style={{
                marginTop: '30px',
                maxWidth: '340px',
                minWidth: '260px',
                width: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                position: 'absolute',
                zIndex: 1000,
            }}
        >
            <h3 className="text-lg font-extrabold text-cyan-400 border-b border-cyan-800 pb-2 mb-3 text-center">
                Landing Site Analysis
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="border-r border-gray-700/50">
                    <p className="text-2xl font-bold text-gray-200">{avgSlope}°</p>
                    <p className="text-xs text-cyan-400 mt-1">Avg Slope</p>
                </div>
                <div className="border-r border-gray-700/50">
                    <p className="text-2xl font-bold text-gray-200">{safeArea}%</p>
                    <p className="text-xs text-cyan-400 mt-1">Safe Area</p>
                </div>
                <div>
                    <p className={`text-2xl font-extrabold ${suitabilityColor}`}>{suitability}</p>
                    <p className="text-xs text-cyan-400 mt-1">Suitability</p>
                </div>
            </div>
        </div>
    );
}



function MapView({ isSearchVisible }) {
    const tileUrl = "https://astralens-hackathon.onrender.com/tiles/{z}/{y}/{x}.png";
    const initialCenter = [-(IMAGE_HEIGHT / 2), IMAGE_WIDTH / 2];
    const initialZoom = MIN_TILE_Z + 1; 

    const [searchedFeature, setSearchedFeature] = useState(null);
    const { setLabeledFeatures, clearPoints, setDistance } = useContext(MapContext); 
    const [showTopology, setShowTopology] = useState(false);

    const handleClearAllLabels = useCallback(() => {
        clearPoints();
        setLabeledFeatures([]);
        setSearchedFeature(null);
        setDistance('Click two points to measure.');
    }, [clearPoints, setLabeledFeatures, setDistance]);

    const convertedTopologyData = useMemo(() => {
        if (!topologyData || !Array.isArray(topologyData.features)) {
            return { type: "FeatureCollection", features: [] };
        }
        const dataCopy = JSON.parse(JSON.stringify(topologyData));
        
        const convertCoords = ([lon, lat]) => {
            const mapY = -(((lat + 90) / 180) * IMAGE_HEIGHT); 
            const mapX = ((lon + 180) / 360) * IMAGE_WIDTH;
            
            return [mapY, mapX];
        };
        
        const recurseCoords = (coords) => {
            if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
                return coords.map(recurseCoords); // MultiPolygon
            } else if (Array.isArray(coords[0]) && !Array.isArray(coords[0][0])) {
                return coords.map(convertCoords); // Polygon ring
            }
            return coords;
        };

        dataCopy.features.forEach(feature => {
            if (feature.geometry && feature.geometry.coordinates) {
                feature.geometry.coordinates = recurseCoords(feature.geometry.coordinates);
            }
        });
        return dataCopy;
    }, []);


    const handleFeatureSearch = (feature) => {
        const [rawLat, rawLon] = feature.coordinates;
        
        const lat = Math.min(90, Math.max(-90, rawLat)); 
        const lon = Math.min(180, Math.max(-180, rawLon));
        
        const mapY = -(((lat + 90) / 180) * IMAGE_HEIGHT); 
        const mapX = ((lon + 180) / 360) * IMAGE_WIDTH;
        
        const transformedCoords = [mapY, mapX]; 

        const featureForMap = { 
            ...feature, 
            coordinates: transformedCoords,
        };
        setSearchedFeature(featureForMap);
        
        setLabeledFeatures(prev => [ 
            ...prev, 
            { 
                id: feature.id, 
                name: feature.name, 
                coordinates: transformedCoords 
            }
        ]);
    };

    const styleGeoJSON = (feature) => {
        return {
            fillColor: feature.properties.risk_level === 'High' ? '#ff4d4d' : '#4dff4d',
            weight: 2,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.5
        };
    };

    const onEachFeature = (feature, layer) => {
        if (feature.properties && feature.properties.description) {
            layer.bindPopup(feature.properties.description);
        }
    };


    return (
        <div className="flex-grow relative bg-black h-full font-sans overflow-hidden">
            <AiPanel />
            {isSearchVisible && (
                <div 
                    style={{ position: 'absolute', top: '90px', left: '10px', zIndex: 1000 }}
                    className="bg-gray-800 bg-opacity-90 p-4 rounded-xl shadow-2xl space-y-3 text-white max-w-xs"
                >
                    <MapControls onFeatureSearch={handleFeatureSearch} />
                    

                    <button 
                        onClick={handleClearAllLabels} 
                        className="w-full p-2 rounded-lg font-bold transition-colors duration-200 shadow-md"
                        style={{ backgroundColor: '#dc3545', color: 'white' }}
                    >
                        Clear All Labels
                    </button>

                    {showTopology && (
                        <div className="pt-3 text-sm space-y-2 border-t border-gray-700 mt-3">
                            <h4 className="font-semibold text-lg">Risk Zones Legend</h4>
                            <div className="flex items-center space-x-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff4d4d' }}></span> 
                                <span>High Risk (Potential Instability)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4dff4d' }}></span> 
                                <span>Low Risk (Stable Geology)</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <MapContainer
                crs={simple_crs}
                center={initialCenter}
                zoom={initialZoom}
                minZoom={MIN_TILE_Z} 
                maxZoom={MAX_NATIVE_Z + 1} 
                bounds={mapBounds}
                maxBounds={mapBounds}
                maxBoundsViscosity={1.0}
                className="w-full h-full"
                style={{ backgroundColor: '#000000' }}
            >
                <TileLayer
                    url={tileUrl}
                    tms={false} 
                    noWrap={true} 
                    bounds={mapBounds}
                    tileSize={256}
                    maxNativeZoom={MAX_NATIVE_Z}
                    minZoom={MIN_TILE_Z}
                    attribution='&copy; DreamArchitets' 
                />
                
                <FeatureInteraction />
                <MapResizer/>
                <SearchFlyTo feature={searchedFeature} />
                <DistanceDisplay />
                <AreaSelector />
                <AnalysisOverlay />
                <AnalysisScorecard />
                
                {searchedFeature && (
                    <Marker position={searchedFeature.coordinates} icon={customMarkerIcon}>
                        <Popup minWidth={250}>
                            <div className="feature-popup p-2 bg-white rounded text-gray-800">
                                <h3 className="text-lg font-bold mb-1">{searchedFeature.name}</h3>
                                <img src={searchedFeature.imageUrl} alt={searchedFeature.name} style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '5px' }} className="mb-2" />
                                <p className="text-sm">{searchedFeature.description}</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {showTopology && (
                    <GeoJSON 
                        data={convertedTopologyData} 
                        style={styleGeoJSON}
                        onEachFeature={onEachFeature}
                    />
                )}
            </MapContainer>
        </div>
    );
}

export default MapView;