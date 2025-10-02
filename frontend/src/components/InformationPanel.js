import React, { useContext, useMemo } from 'react';
import { MapContext } from '../App';
import './styles/InformationPanel.css'; // Keep the CSS import if you use custom CSS

// Helper function to render a detail row
const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-1 border-b border-cyan-900/50">
        <span className="text-gray-400 text-sm font-medium">{label}</span>
        <span className="text-white text-sm font-semibold">{value}</span>
    </div>
);

function InformationPanel({ featureId }) {
    const { allFeatures } = useContext(MapContext);

    // Find the currently selected feature data
    const selectedFeature = useMemo(() => {
        if (!featureId) return null;
        return allFeatures.find(f => f.id === featureId);
    }, [featureId, allFeatures]);

    if (!selectedFeature) {
        return (
            <div className="w-[300px] absolute right-0 top-1/2 -translate-y-1/2 mr-4 p-4 rounded-xl bg-black/60 backdrop-blur-sm border border-cyan-700/50 shadow-2xl text-white">
                <h3 className="text-lg font-bold text-cyan-400 mb-2 border-b border-cyan-800 pb-2">Feature Details</h3>
                <p className="text-gray-400 text-sm">Select a labeled feature or use the Search tool to view detailed information here.</p>
            </div>
        );
    }

    const { name, coordinates, description, imageUrl } = selectedFeature;
    const lat = coordinates ? coordinates[0].toFixed(2) : 'N/A';
    const lon = coordinates ? coordinates[1].toFixed(2) : 'N/A';
    const derivedDiameter = (description.match(/diameter of ([\d.]+)/) || [])[1] || 'N/A';
    const derivedType = description.split(',')[0] || 'N/A';


    return (
        <div className="w-[350px] absolute right-0 top-1/2 -translate-y-1/2 mr-4 p-6 rounded-xl bg-black/60 backdrop-blur-md border border-cyan-500 ai-panel-glow shadow-2xl text-white z-[1001]">
            
            <h3 className="text-2xl font-extrabold text-cyan-400 tracking-wide mb-3 border-b border-cyan-800 pb-2">
                {name}
            </h3>

            {imageUrl && (
                // Use a placeholder image if the URL is empty or invalid
                <img 
                    src={imageUrl || 'https://placehold.co/350x150/171717/00FFFF?text=No+Image+Available'} 
                    alt={`Image of ${name}`} 
                    className="w-full h-auto max-h-[150px] object-cover rounded-lg mb-4 border border-cyan-800" 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/350x150/171717/00FFFF?text=No+Image+Available'; }}
                />
            )}

            <div className="space-y-1 mb-4">
                <DetailRow label="Latitude" value={lat} />
                <DetailRow label="Longitude" value={lon} />
                <DetailRow label="Type" value={derivedType} />
                <DetailRow label="Diameter (km)" value={derivedDiameter} />
            </div>

            <h4 className="text-sm font-semibold text-cyan-300 mb-1">Description</h4>
            <p className="text-gray-300 text-xs leading-relaxed border-t border-cyan-800 pt-2">
                {description || "Detailed description not available in the database."}
            </p>
        </div>
    );
}

export default InformationPanel;
