import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
iconUrl: require('leaflet/dist/images/marker-icon.png'),
shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});


const IMAGE_WIDTH = 34748;
const IMAGE_HEIGHT = 34748;


const MAX_NATIVE_Z = 0; 
const MIN_TILE_Z = -8; 

const simple_crs = L.extend({}, L.CRS.Simple, {
   scale: function (zoom) {
      return Math.pow(2, zoom);
   },
    projection: L.Projection.LonLat
});


const mapBounds = [[0, 0], [-IMAGE_HEIGHT, IMAGE_WIDTH]];

function MapView() {
//    const tileUrl = "http://127.0.0.1:5000/tiles/{z}/{y}/{x}.png";
    const tileUrl = "https://astralens-hackathon.onrender.com/tiles/{z}/{y}/{x}.png";

    const initialCenter = [-(IMAGE_HEIGHT / 2), IMAGE_WIDTH / 2];
    
    const initialZoom = MIN_TILE_Z + 1; 

    return (
        <MapContainer
            crs={simple_crs}
            center={initialCenter}
            zoom={initialZoom}
            minZoom={MIN_TILE_Z}             
            maxZoom={MAX_NATIVE_Z + 1}       
            
            bounds={mapBounds}
            maxBounds={mapBounds}
            maxBoundsViscosity={1.0}
            style={{ height: "100vh", width: "100%", backgroundColor: '#000000' }}
        >
        <TileLayer
                url={tileUrl}
                tms={true}                    // Y-axis flip
                noWrap={true}                 // No map repetition
                bounds={mapBounds}
                tileSize={256}
                maxNativeZoom={MAX_NATIVE_Z}
                minZoom={MIN_TILE_Z}
                attribution='&copy; DreamArchitets' 
            />
        </MapContainer>
    );
}

export default MapView;