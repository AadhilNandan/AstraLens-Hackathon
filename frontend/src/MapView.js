import React, { useCallback, useContext, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContext } from './App';
if (L && L.Icon && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconUrl: 'data:image/svg+xml;base64,...', 
        shadowUrl: 'data:image/svg+xml;base64,...', 
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });
}

const IMAGE_WIDTH = 34748;
const IMAGE_HEIGHT = 34748;
const MAX_NATIVE_Z = 0; 
const MIN_TILE_Z = -8; 
const PIXEL_TO_KM_FACTOR = 0.1; // 100 meters = 0.1 km per pixel


const simple_crs = L.extend({}, L.CRS.Simple, {
    scale: function (zoom) {
        return Math.pow(2, zoom);
    },
    projection: L.Projection.LonLat
});

const mapBounds = [[0, 0], [-IMAGE_HEIGHT, IMAGE_WIDTH]];


function FeatureInteraction() {
    const { points, addPoint, clearPoints, setDistance, setLabeledFeatures } = useContext(MapContext);
    const map = useMap();

    const handleMapClick = useCallback((e) => {
        const { latlng } = e;

        if (points.length === 2) {
            clearPoints(); 
        }
        addPoint(latlng);
    }, [points.length, addPoint, clearPoints]);

    useEffect(() => {
        if (points.length === 2) {
            const p1 = map.project(points[0].latlng, MAX_NATIVE_Z);
            const p2 = map.project(points[1].latlng, MAX_NATIVE_Z);

            const distancePx = p1.distanceTo(p2); 
            const distanceKm = (distancePx * PIXEL_TO_KM_FACTOR).toFixed(2);
            
            setDistance(distanceKm);

            setLabeledFeatures(prev => [
                ...prev,
                {
                    id: Date.now(),
                    name: `Measurement ${prev.length + 1}`,
                    points: points.map(p => ({ lat: p.latlng.lat.toFixed(2), lng: p.latlng.lng.toFixed(2) })),
                    distance: distanceKm,
                }
            ]);

        } else if (points.length === 1) {
            setDistance('Placing B...');
        } else {
            setDistance('Click two points to measure.');
        }
    }, [points.length, map, setDistance, setLabeledFeatures, points]);


    useMapEvents({
        click: handleMapClick,
    });

    return (
        <>
            {points.map((p, index) => (
                <CircleMarker
                    key={p.id}
                    center={p.latlng}
                    radius={5}
                    color={index === 0 ? "#FFC107" : "#00FFFF"}
                    fillOpacity={1}
                >
                    <Popup>
                        Point {index === 0 ? 'A' : 'B'}: <br />
                        X: {p.latlng.lng.toFixed(2)}, Y: {p.latlng.lat.toFixed(2)}
                    </Popup>
                </CircleMarker>
            ))}
        </>
    );
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

function MapView() {
    const tileUrl = "https://astralens-hackathon.onrender.com/tiles/{z}/{y}/{x}.png";
    //const tileUrl = "http://127.0.0.1:5000/tiles/{z}/{y}/{x}.png";
    const initialCenter = [-(IMAGE_HEIGHT / 2), IMAGE_WIDTH / 2];
    const initialZoom = MIN_TILE_Z + 1; 

    return (
        <div className="flex-grow relative bg-black h-full">
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
                    tms={true} 
                    noWrap={true} 
                    bounds={mapBounds}
                    tileSize={256}
                    maxNativeZoom={MAX_NATIVE_Z}
                    minZoom={MIN_TILE_Z}
                    attribution='&copy; DreamArchitets' 
                />
                
                <FeatureInteraction />
                <MapResizer/>
                
            </MapContainer>
        </div>
    );
}

export default MapView;