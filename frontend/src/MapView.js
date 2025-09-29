import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fixes a known issue with marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// --- Image and Zoom Configuration ---
const IMAGE_WIDTH = 34748;
const IMAGE_HEIGHT = 34748;

// Z=0 is the max resolution (your full-res tiles)
const MAX_NATIVE_Z = 0; 
// UPDATED: Based on your file structure, the lowest generated zoom is -8.
const MIN_TILE_Z = -8; 

// 1. Define the Simple Coordinate Reference System (CRS)
const simple_crs = L.extend({}, L.CRS.Simple, {
    // Scale function: scale(zoom) = 2^zoom
    scale: function (zoom) {
        return Math.pow(2, zoom);
    },
    projection: L.Projection.LonLat
});

// 2. Define the Bounds in Simple CRS
// Y is POSITIVE at the bottom (0) and NEGATIVE at the top (-34748)
const mapBounds = [[0, 0], [-IMAGE_HEIGHT, IMAGE_WIDTH]];

function MapView() {
    // Tile server endpoint following the correct {z}/{y}/{x}.png path structure
    const tileUrl = "http://127.0.0.1:5000/tiles/{z}/{y}/{x}.png";

    // Center the map on the image
    const initialCenter = [-(IMAGE_HEIGHT / 2), IMAGE_WIDTH / 2];
    
    // Start zoomed out to clearly see the full image
    const initialZoom = MIN_TILE_Z + 1; 

    return (
        <MapContainer
            // --- Map Container Options ---
            crs={simple_crs}
            center={initialCenter}
            
            // The map's range is set by the bounds of the tile pyramid
            zoom={initialZoom}
            minZoom={MIN_TILE_Z}             
            maxZoom={MAX_NATIVE_Z + 1}       
            
            bounds={mapBounds}
            maxBounds={mapBounds}
            maxBoundsViscosity={1.0}
            // FIX: Set background color of the map container to black
            style={{ height: "100vh", width: "100%", backgroundColor: '#000000' }}
        >
            <TileLayer
                // --- Tile Layer Options ---
                url={tileUrl}
                tms={true}                    // Y-axis flip
                noWrap={true}                 // No map repetition
                bounds={mapBounds}
                tileSize={256}
                
                // CRITICAL FOR PYRAMID: Leaflet requests actual tiles for this range
                maxNativeZoom={MAX_NATIVE_Z}
                minZoom={MIN_TILE_Z}
                
                attribution='&copy; Custom Moon Map' 
            />
        </MapContainer>
    );
}

export default MapView;