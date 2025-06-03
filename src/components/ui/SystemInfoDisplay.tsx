import React from 'react';
import type { StarData, PlanetData } from '../../types/galaxy';

interface SystemInfoDisplayProps {
  starData: StarData;
  onBackToGalaxy: () => void;
}

const SystemInfoDisplay: React.FC<SystemInfoDisplayProps> = ({ starData, onBackToGalaxy }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      padding: '15px',
      background: 'rgba(0, 0, 0, 0.75)',
      color: 'white',
      borderRadius: '8px',
      border: '1px solid #555',
      maxWidth: '300px',
      maxHeight: '80vh',
      overflowY: 'auto',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
    }}>
      <h2>{starData.name}</h2>
      <p><strong>ID:</strong> {starData.id}</p>
      <p><strong>Position:</strong> {starData.position.toArray().map(p => p.toFixed(2)).join(', ')}</p>
      <p><strong>Color:</strong> #{starData.color.getHexString()}</p>
      <p><strong>Size:</strong> {starData.size?.toFixed(2) || 'N/A'}</p>
      
      <h3>Planets ({starData.planets.length})</h3>
      {starData.planets.length > 0 ? (
        <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
          {starData.planets.map((planet: PlanetData) => (
            <li key={planet.id} style={{ marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid #444' }}>
              <strong>{planet.name}</strong> ({planet.type})
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '12px' }}>
                <li>Size: {planet.size.toFixed(2)}</li>
                <li>Orbit Radius: {planet.orbitRadius.toFixed(2)}</li>
                <li>Orbit Speed: {planet.orbitSpeed.toFixed(4)}</li>
                {planet.color && <li>Color: #{planet.color}</li>}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>No planets in this system.</p>
      )}

      <button 
        onClick={onBackToGalaxy}
        style={{
          marginTop: '15px',
          padding: '10px 15px',
          fontSize: '14px',
          color: 'white',
          background: '#337ab7',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        Back to Galaxy View
      </button>
    </div>
  );
};

export default SystemInfoDisplay;