import React from 'react';
import { DEFAULT_LOD_LEVELS } from '../../config/galaxyConfig';

interface LodControlsProps {
  isLodManual: boolean;
  manualLodLevel: number;
  currentAutoLodLevel: number; // To display the current auto-detected LOD
  onToggleLodMode: (isManual: boolean) => void;
  onSetManualLodLevel: (level: number) => void;
  lodLevels?: Array<{ value: number; label: string }>; // Optional: for custom labels
  isOptimizedModeActive: boolean; // Renamed from isHighSpeedActive, now mandatory
  onToggleOptimizedMode: () => void; // New prop for toggling optimized mode
  performanceMetrics: { frameTime: number; angularSpeed: number; }; // Updated signature, mandatory
}

const LodControls: React.FC<LodControlsProps> = ({
  isLodManual,
  manualLodLevel,
  currentAutoLodLevel,
  onToggleLodMode,
  onSetManualLodLevel,
  lodLevels = DEFAULT_LOD_LEVELS,
  isOptimizedModeActive,
  onToggleOptimizedMode,
  performanceMetrics,
}) => {
  const handleLodModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggleLodMode(event.target.checked);
  };

  const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSetManualLodLevel(parseInt(event.target.value, 10));
  };

  const handleOptimizedModeChange = () => {
    onToggleOptimizedMode();
  };

  const currentDisplayLod = isLodManual ? manualLodLevel : currentAutoLodLevel;
  const currentLodLabel = lodLevels.find(l => l.value === currentDisplayLod)?.label || `LOD ${currentDisplayLod}`;

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '15px',
      borderRadius: '8px',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label htmlFor="lodModeToggle" style={{ cursor: 'pointer', userSelect: 'none' }}>
          Manual LOD Mode:
        </label>
        <input
          type="checkbox"
          id="lodModeToggle"
          checked={isLodManual}
          onChange={handleLodModeChange}
          style={{ cursor: 'pointer' }}
        />
      </div>

      <div>
        <span>Current LOD: {currentLodLabel} ({isLodManual ? 'Manual' : 'Auto'})</span>
      </div>

      {isLodManual && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label htmlFor="lodLevelSelect">Select LOD Level:</label>
          <select
            id="lodLevelSelect"
            value={manualLodLevel}
            onChange={handleLevelChange}
            disabled={!isLodManual}
            style={{
              padding: '5px',
              borderRadius: '4px',
              border: '1px solid #555',
              backgroundColor: '#333',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {lodLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* New Optimized Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label htmlFor="optimizedModeToggle" style={{ cursor: 'pointer', userSelect: 'none' }}>
          Optimized Mode:
        </label>
        <input
          type="checkbox"
          id="optimizedModeToggle"
          checked={isOptimizedModeActive}
          onChange={handleOptimizedModeChange}
          style={{ cursor: 'pointer' }}
        />
      </div>
      
      {performanceMetrics && (
        <div style={{ borderTop: '1px solid #555', paddingTop: '10px', marginTop: '5px' }}>
          <div style={{ fontSize: '0.9em', color: '#ccc' }}>Performance:</div>
          <div>FPS: {(performanceMetrics.frameTime > 0 ? (1 / performanceMetrics.frameTime) : 0).toFixed(1)}</div>
          <div>Ang. Speed: {performanceMetrics.angularSpeed.toFixed(3)} rad/s</div>
          {/* Removed HSM Enter Threshold and Proximity to HSM */}
        </div>
      )}
    </div>
  );
};

export default LodControls;