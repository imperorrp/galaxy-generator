import React, { useState, useEffect } from 'react';

import type { AppConfig, ConfigurableGalaxyParams, ConfigurableNebulaParams } from '../../types/galaxy'; // Import AppConfig and related types

interface GalaxyConfigPanelProps {
  initialConfig: AppConfig; // Changed to AppConfig
  onConfigChange: (newConfig: AppConfig) => void; // Changed to AppConfig
  onResetConfig: () => void;
}

const GalaxyConfigPanel: React.FC<GalaxyConfigPanelProps> = ({ initialConfig, onConfigChange, onResetConfig }) => {
  const [currentConfig, setCurrentConfig] = useState<AppConfig>(initialConfig);
  const [showAdvancedGalaxy, setShowAdvancedGalaxy] = useState(false);
  const [showAdvancedNebula, setShowAdvancedNebula] = useState(false);

  useEffect(() => {
    setCurrentConfig(initialConfig);
  }, [initialConfig]);

  const handleGalaxyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setCurrentConfig(prevConfig => ({
      ...prevConfig,
      galaxy: {
        ...prevConfig.galaxy,
        [name]: type === 'number' ? parseFloat(value) : value,
      }
    }));
  };

  const handleNebulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setCurrentConfig(prevConfig => ({
      ...prevConfig,
      nebula: {
        ...prevConfig.nebula,
        [name]: type === 'number' ? parseFloat(value) : value,
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigChange(currentConfig);
  };

  const handleReset = () => {
    onResetConfig(); // This will trigger the parent to reset to default and pass down new initialConfig
  };

  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '15px', borderRadius: '8px', width: '300px', maxHeight: '90vh', overflowY: 'auto' }}>
      <h3>Galaxy Configuration</h3>
      <form onSubmit={handleSubmit}>
        {/* Basic Galaxy Params */}
        <h4>Basic Galaxy Settings</h4>
        <div>
          <label htmlFor="numStars">Number of Stars: </label>
          <input type="number" id="numStars" name="numStars" value={currentConfig.galaxy.numStars} onChange={handleGalaxyChange} step="100" />
        </div>
        <div>
          <label htmlFor="galaxyRadius">Galaxy Radius: </label>
          <input type="number" id="galaxyRadius" name="galaxyRadius" value={currentConfig.galaxy.galaxyRadius} onChange={handleGalaxyChange} step="50" />
        </div>
        <div>
          <label htmlFor="numArms">Number of Arms: </label>
          <input type="number" id="numArms" name="numArms" value={currentConfig.galaxy.numArms} onChange={handleGalaxyChange} min="1" max="8" step="1" />
        </div>
        <div>
          <label htmlFor="spiralTightness">Spiral Tightness: </label>
          <input type="number" id="spiralTightness" name="spiralTightness" value={currentConfig.galaxy.spiralTightness} onChange={handleGalaxyChange} min="0.1" max="2" step="0.1" />
        </div>
        <div>
          <label htmlFor="armWidth">Arm Width: </label>
          <input type="number" id="armWidth" name="armWidth" value={currentConfig.galaxy.armWidth} onChange={handleGalaxyChange} min="10" max="300" step="10" />
        </div>
        <div>
          <label htmlFor="bulgeSizeFactor">Bulge Size Factor: </label>
          <input type="number" id="bulgeSizeFactor" name="bulgeSizeFactor" value={currentConfig.galaxy.bulgeSizeFactor} onChange={handleGalaxyChange} min="0.05" max="0.5" step="0.01" />
        </div>
        <div>
          <label htmlFor="centralBarLengthFactor">Bar Length Factor: </label>
          <input type="number" id="centralBarLengthFactor" name="centralBarLengthFactor" value={currentConfig.galaxy.centralBarLengthFactor} onChange={handleGalaxyChange} min="0.05" max="0.5" step="0.01" />
        </div>
        <div>
          <label htmlFor="colorInHex">Core Color: </label>
          <input type="text" id="colorInHex" name="colorInHex" value={currentConfig.galaxy.colorInHex} onChange={handleGalaxyChange} />
        </div>
        <div>
          <label htmlFor="colorOutHex">Outer Color: </label>
          <input type="text" id="colorOutHex" name="colorOutHex" value={currentConfig.galaxy.colorOutHex} onChange={handleGalaxyChange} />
        </div>

        <button type="button" onClick={() => setShowAdvancedGalaxy(!showAdvancedGalaxy)} style={{ marginTop: '10px', marginBottom: '10px' }}>
          {showAdvancedGalaxy ? 'Hide' : 'Show'} Advanced Galaxy Settings
        </button>

        {showAdvancedGalaxy && (
          <>
            <h4>Advanced Galaxy Settings</h4>
            <div><label>Main Galaxy Star Fraction: <input type="number" name="mainGalaxyStarFraction" value={currentConfig.galaxy.mainGalaxyStarFraction} onChange={handleGalaxyChange} step="0.01" /></label></div>
            <div><label>Outer Disk Star Fraction: <input type="number" name="outerDiskStarFraction" value={currentConfig.galaxy.outerDiskStarFraction} onChange={handleGalaxyChange} step="0.001" /></label></div>
            <div><label>Halo Star Fraction: <input type="number" name="haloStarFraction" value={currentConfig.galaxy.haloStarFraction} onChange={handleGalaxyChange} step="0.01" /></label></div>
            <div><label>Globular Cluster Star Fraction: <input type="number" name="globularClusterStarFraction" value={currentConfig.galaxy.globularClusterStarFraction} onChange={handleGalaxyChange} step="0.001" /></label></div>
            <div><label>Num Globular Clusters: <input type="number" name="numGlobularClusters" value={currentConfig.galaxy.numGlobularClusters} onChange={handleGalaxyChange} step="1" /></label></div>
            <div><label>Globular Cluster Radius Min: <input type="number" name="globularClusterRadiusMin" value={currentConfig.galaxy.globularClusterRadiusMin} onChange={handleGalaxyChange} step="1" /></label></div>
            <div><label>Globular Cluster Radius Max: <input type="number" name="globularClusterRadiusMax" value={currentConfig.galaxy.globularClusterRadiusMax} onChange={handleGalaxyChange} step="1" /></label></div>
            <div><label>Globular Cluster Density Power: <input type="number" name="globularClusterDensityPower" value={currentConfig.galaxy.globularClusterDensityPower} onChange={handleGalaxyChange} step="0.1" /></label></div>
            <div><label>Globular Cluster Pos Radius Min Factor: <input type="number" name="globularClusterPositionRadiusMinFactor" value={currentConfig.galaxy.globularClusterPositionRadiusMinFactor} onChange={handleGalaxyChange} step="0.01" /></label></div>
            <div><label>Globular Cluster Pos Radius Max Factor: <input type="number" name="globularClusterPositionRadiusMaxFactor" value={currentConfig.galaxy.globularClusterPositionRadiusMaxFactor} onChange={handleGalaxyChange} step="0.01" /></label></div>
            <div><label>Halo Min Radius Factor: <input type="number" name="haloMinRadiusFactor" value={currentConfig.galaxy.haloMinRadiusFactor} onChange={handleGalaxyChange} step="0.01" /></label></div>
            <div><label>Halo Max Radius Factor: <input type="number" name="haloMaxRadiusFactor" value={currentConfig.galaxy.haloMaxRadiusFactor} onChange={handleGalaxyChange} step="0.01" /></label></div>
            <div><label>Halo Y Scale: <input type="number" name="haloYScale" value={currentConfig.galaxy.haloYScale} onChange={handleGalaxyChange} step="0.01" /></label></div>
            <div><label>Halo Density Power: <input type="number" name="haloDensityPower" value={currentConfig.galaxy.haloDensityPower} onChange={handleGalaxyChange} step="0.1" /></label></div>
            <div><label>Outer Disk Min Radius Factor: <input type="number" name="outerDiskMinRadiusFactor" value={currentConfig.galaxy.outerDiskMinRadiusFactor} onChange={handleGalaxyChange} step="0.01" /></label></div>
            <div><label>Outer Disk Max Radius Factor: <input type="number" name="outerDiskMaxRadiusFactor" value={currentConfig.galaxy.outerDiskMaxRadiusFactor} onChange={handleGalaxyChange} step="0.01" /></label></div>
            <div><label>Outer Disk Y Scale: <input type="number" name="outerDiskYScale" value={currentConfig.galaxy.outerDiskYScale} onChange={handleGalaxyChange} step="0.001" /></label></div>
            <div><label>Spiral Angle Factor: <input type="number" name="spiralAngleFactor" value={currentConfig.galaxy.spiralAngleFactor} onChange={handleGalaxyChange} step="1" /></label></div>
            <div><label>Arm Point Density Power: <input type="number" name="armPointDensityPower" value={currentConfig.galaxy.armPointDensityPower} onChange={handleGalaxyChange} step="0.1" /></label></div>
            <div><label>Disk Y Scale For Arms: <input type="number" name="diskYScaleForArms" value={currentConfig.galaxy.diskYScaleForArms} onChange={handleGalaxyChange} step="0.01" /></label></div>
            <div><label>Sub Arm Chance: <input type="number" name="subArmChance" value={currentConfig.galaxy.subArmChance} onChange={handleGalaxyChange} step="0.01" /></label></div>
            <div><label>Sub Arm Scatter Factor: <input type="number" name="subArmScatterFactor" value={currentConfig.galaxy.subArmScatterFactor} onChange={handleGalaxyChange} step="0.1" /></label></div>
            <div><label>Sub Arm Angle Offset Range (radians): <input type="number" name="subArmAngleOffsetRange" value={currentConfig.galaxy.subArmAngleOffsetRange} onChange={handleGalaxyChange} step="0.01" /></label></div>
            <div><label>Bulge Y Scale: <input type="number" name="bulgeYScale" value={currentConfig.galaxy.bulgeYScale} onChange={handleGalaxyChange} step="0.01" /></label></div>
            <div><label>Bulge Density Power: <input type="number" name="bulgeDensityPower" value={currentConfig.galaxy.bulgeDensityPower} onChange={handleGalaxyChange} step="0.1" /></label></div>
            <div><label>Central Bar Width Factor: <input type="number" name="centralBarWidthFactor" value={currentConfig.galaxy.centralBarWidthFactor} onChange={handleGalaxyChange} step="0.001" /></label></div>
            <div><label>Central Bar Y Scale: <input type="number" name="centralBarYScale" value={currentConfig.galaxy.centralBarYScale} onChange={handleGalaxyChange} step="0.01" /></label></div>
            <div><label>Disk Star Fraction: <input type="number" name="diskStarFraction" value={currentConfig.galaxy.diskStarFraction} onChange={handleGalaxyChange} step="0.01" /></label></div>
            <div><label>Disk Star Y Scale: <input type="number" name="diskStarYScale" value={currentConfig.galaxy.diskStarYScale} onChange={handleGalaxyChange} step="0.01" /></label></div>
          </>
        )}

        {/* Nebula Configuration Section */}
        <h4 style={{ marginTop: '20px' }}>Nebula Configuration</h4>
        {/* Basic Nebula Params */}
        <h5>Basic Nebula Settings</h5>
        <div>
          <label htmlFor="numNebulaeToGenerate">Number of Nebulae: </label>
          <input type="number" id="numNebulaeToGenerate" name="numNebulaeToGenerate" value={currentConfig.nebula.numNebulaeToGenerate} onChange={handleNebulaChange} step="10" />
        </div>
        <div>
          <label htmlFor="nebulaOpacityBase">Nebula Opacity Base: </label>
          <input type="number" id="nebulaOpacityBase" name="nebulaOpacityBase" value={currentConfig.nebula.nebulaOpacityBase} onChange={handleNebulaChange} step="0.01" min="0" max="1" />
        </div>
        <div>
          <label htmlFor="nebulaBaseScaleMinFactor">Nebula Base Scale Min Factor: </label>
          <input type="number" id="nebulaBaseScaleMinFactor" name="nebulaBaseScaleMinFactor" value={currentConfig.nebula.nebulaBaseScaleMinFactor} onChange={handleNebulaChange} step="0.001" />
        </div>

        <button type="button" onClick={() => setShowAdvancedNebula(!showAdvancedNebula)} style={{ marginTop: '10px', marginBottom: '10px' }}>
          {showAdvancedNebula ? 'Hide' : 'Show'} Advanced Nebula Settings
        </button>

        {showAdvancedNebula && (
          <>
            <h5>Advanced Nebula Settings</h5>
            <div><label>Galactic Plane Thickness Factor: <input type="number" name="galacticPlaneThicknessFactor" value={currentConfig.nebula.galacticPlaneThicknessFactor} onChange={handleNebulaChange} step="0.001" /></label></div>
            <div><label>Nebula Radial Dist Power: <input type="number" name="nebulaRadialDistPower" value={currentConfig.nebula.nebulaRadialDistPower} onChange={handleNebulaChange} step="0.1" /></label></div>
            <div><label>Nebula Max Radial Factor of Galaxy Radius Fraction: <input type="number" name="nebulaMaxRadialFactorOfGalaxyRadiusFraction" value={currentConfig.nebula.nebulaMaxRadialFactorOfGalaxyRadiusFraction} onChange={handleNebulaChange} step="0.01" /></label></div>
            <div><label>Nebula Y Deviation Bias Chance: <input type="number" name="nebulaYDeviationBiasChance" value={currentConfig.nebula.nebulaYDeviationBiasChance} onChange={handleNebulaChange} step="0.01" min="0" max="1" /></label></div>
            <div><label>Nebula Y Deviation Bias Multiplier Min: <input type="number" name="nebulaYDeviationBiasMultiplierMin" value={currentConfig.nebula.nebulaYDeviationBiasMultiplierMin} onChange={handleNebulaChange} step="0.1" /></label></div>
            <div><label>Nebula Y Deviation Bias Multiplier Random Add: <input type="number" name="nebulaYDeviationBiasMultiplierRandomAdd" value={currentConfig.nebula.nebulaYDeviationBiasMultiplierRandomAdd} onChange={handleNebulaChange} step="0.1" /></label></div>
            <div><label>Nebula Base Scale Random Factor: <input type="number" name="nebulaBaseScaleRandomFactor" value={currentConfig.nebula.nebulaBaseScaleRandomFactor} onChange={handleNebulaChange} step="0.001" /></label></div>
            <div><label>Nebula Aspect Ratio Variation Base: <input type="number" name="nebulaAspectRatioVariationBase" value={currentConfig.nebula.nebulaAspectRatioVariationBase} onChange={handleNebulaChange} step="0.01" /></label></div>
            <div><label>Nebula Aspect Ratio Variation Random: <input type="number" name="nebulaAspectRatioVariationRandom" value={currentConfig.nebula.nebulaAspectRatioVariationRandom} onChange={handleNebulaChange} step="0.01" /></label></div>
            <div><label>Nebula Rotation XY Plane Max Radians: <input type="number" name="nebulaRotationXYPlaneMaxRadians" value={currentConfig.nebula.nebulaRotationXYPlaneMaxRadians} onChange={handleNebulaChange} step="0.01" /></label></div>
            <div><label>Nebula Opacity Random Factor: <input type="number" name="nebulaOpacityRandomFactor" value={currentConfig.nebula.nebulaOpacityRandomFactor} onChange={handleNebulaChange} step="0.01" /></label></div>
            <div><label>Nebula Max Absolute Spin Speed: <input type="number" name="nebulaMaxAbsoluteSpinSpeed" value={currentConfig.nebula.nebulaMaxAbsoluteSpinSpeed} onChange={handleNebulaChange} step="0.0001" /></label></div>
          </>
        )}

        <button type="submit" style={{ marginTop: '10px', marginRight: '5px' }}>Apply Changes</button>
        <button type="button" onClick={handleReset} style={{ marginTop: '10px' }}>Reset to Defaults</button>
      </form>
    </div>
  );
};

export default GalaxyConfigPanel;