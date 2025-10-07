import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

const AtomicStructureIntermediatePlayground: React.FC = () => {
  const [activeLab, setActiveLab] = useState('bohr-model');
  const [selectedElement, setSelectedElement] = useState('H');
  const [quantumNumbers, setQuantumNumbers] = useState({ n: 1, l: 0, ml: 0, ms: 0.5 });
  const [spectrumSeries, setSpectrumSeries] = useState('balmer');
  const [orbitalType, setOrbitalType] = useState('s');
  const [electronConfig, setElectronConfig] = useState('1s¹');

  const elements = {
    H: { name: 'Hydrogen', atomicNumber: 1, mass: 1.008, config: '1s¹' },
    He: { name: 'Helium', atomicNumber: 2, mass: 4.003, config: '1s²' },
    Li: { name: 'Lithium', atomicNumber: 3, mass: 6.941, config: '1s² 2s¹' },
    C: { name: 'Carbon', atomicNumber: 6, mass: 12.011, config: '1s² 2s² 2p²' },
    N: { name: 'Nitrogen', atomicNumber: 7, mass: 14.007, config: '1s² 2s² 2p³' },
    O: { name: 'Oxygen', atomicNumber: 8, mass: 15.999, config: '1s² 2s² 2p⁴' },
    Fe: { name: 'Iron', atomicNumber: 26, mass: 55.845, config: '[Ar] 3d⁶ 4s²' },
    Cr: { name: 'Chromium', atomicNumber: 24, mass: 51.996, config: '[Ar] 3d⁵ 4s¹' },
    Cu: { name: 'Copper', atomicNumber: 29, mass: 63.546, config: '[Ar] 3d¹⁰ 4s¹' }
  };

  const spectrumData = {
    lyman: { name: 'Lyman Series', n1: 1, color: '#8B5CF6', region: 'UV' },
    balmer: { name: 'Balmer Series', n1: 2, color: '#3B82F6', region: 'Visible' },
    paschen: { name: 'Paschen Series', n1: 3, color: '#EF4444', region: 'IR' },
    brackett: { name: 'Brackett Series', n1: 4, color: '#F59E0B', region: 'IR' }
  };

  return (
    <div className="atomic-structure-playground">
      <style>{`
        .atomic-structure-playground {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
          min-height: 100vh;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .playground-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .playground-header h1 {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .playground-header p {
          color: #64748b;
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .lab-navigation {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-bottom: 30px;
        }

        .lab-btn {
          padding: 12px 24px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          color: #475569;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .lab-btn:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
          transform: translateY(-2px);
        }

        .lab-btn.active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border-color: transparent;
        }

        .playground-content {
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #f1f5f9;
          position: relative;
          overflow: hidden;
        }

        .playground-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
        }

        .controls-panel {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .control-group {
          background: #f8fafc;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .control-group h3 {
          color: #1e293b;
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .control-group label {
          display: block;
          color: #475569;
          font-weight: 600;
          margin-bottom: 4px;
          font-size: 0.8rem;
        }

        .control-group select,
        .control-group input {
          width: 100%;
          padding: 8px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #1e293b;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .control-group select:focus,
        .control-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .control-group p {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 4px;
        }

        .visualization-container {
          height: 500px;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          position: relative;
          overflow: hidden;
        }

        .info-panel {
          background: #f8fafc;
          padding: 20px;
          border-radius: 16px;
          margin-top: 20px;
          border: 1px solid #e2e8f0;
        }

        .info-panel h3 {
          color: #1e293b;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 15px;
        }

        .formula-box {
          background: white;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin: 10px 0;
          font-family: 'Courier New', monospace;
          font-size: 1.1rem;
          color: #1e293b;
        }

        .spectrum-line {
          height: 4px;
          margin: 8px 0;
          border-radius: 2px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .spectrum-line:hover {
          transform: scaleY(2);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }

        .orbital-shape {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin: 10px;
          display: inline-block;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .orbital-shape:hover {
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }

        .orbital-s { background: radial-gradient(circle, #3b82f6, #1d4ed8); }
        .orbital-p { background: linear-gradient(45deg, #8b5cf6, #a855f7); }
        .orbital-d { background: linear-gradient(45deg, #ec4899, #f43f5e); }
        .orbital-f { background: linear-gradient(45deg, #f59e0b, #d97706); }

        @media (max-width: 768px) {
          .lab-navigation {
            flex-direction: column;
            align-items: center;
          }
          
          .controls-panel {
            grid-template-columns: 1fr;
          }
          
          .visualization-container {
            height: 400px;
          }
        }
      `}</style>

      <div className="playground-header">
        <h1>🧪 Atomic Structure Laboratory</h1>
        <p>Interactive 3D/2D visualizations to master atomic structure concepts for JEE</p>
      </div>

      <div className="lab-navigation">
        <button 
          className={`lab-btn ${activeLab === 'bohr-model' ? 'active' : ''}`}
          onClick={() => setActiveLab('bohr-model')}
        >
          ⚛️ Bohr Model
        </button>
        <button 
          className={`lab-btn ${activeLab === 'quantum-numbers' ? 'active' : ''}`}
          onClick={() => setActiveLab('quantum-numbers')}
        >
          🔢 Quantum Numbers
        </button>
        <button 
          className={`lab-btn ${activeLab === 'atomic-spectra' ? 'active' : ''}`}
          onClick={() => setActiveLab('atomic-spectra')}
        >
          🌈 Atomic Spectra
        </button>
        <button 
          className={`lab-btn ${activeLab === 'orbital-shapes' ? 'active' : ''}`}
          onClick={() => setActiveLab('orbital-shapes')}
        >
          🌸 Orbital Shapes
        </button>
        <button 
          className={`lab-btn ${activeLab === 'electron-config' ? 'active' : ''}`}
          onClick={() => setActiveLab('electron-config')}
        >
          🔑 Electron Config
        </button>
      </div>

      <div className="playground-content">
        {activeLab === 'bohr-model' && <BohrModelLab selectedElement={selectedElement} setSelectedElement={setSelectedElement} />}
        {activeLab === 'quantum-numbers' && <QuantumNumbersLab quantumNumbers={quantumNumbers} setQuantumNumbers={setQuantumNumbers} />}
        {activeLab === 'atomic-spectra' && <AtomicSpectraLab spectrumSeries={spectrumSeries} setSpectrumSeries={setSpectrumSeries} />}
        {activeLab === 'orbital-shapes' && <OrbitalShapesLab orbitalType={orbitalType} setOrbitalType={setOrbitalType} />}
        {activeLab === 'electron-config' && <ElectronConfigLab electronConfig={electronConfig} setElectronConfig={setElectronConfig} />}
      </div>
    </div>
  );
};

// Bohr Model Component
const BohrModelLab: React.FC<{ selectedElement: string; setSelectedElement: (element: string) => void }> = ({ selectedElement, setSelectedElement }) => {
  const elements = {
    H: { name: 'Hydrogen', atomicNumber: 1, shells: [1] },
    He: { name: 'Helium', atomicNumber: 2, shells: [2] },
    Li: { name: 'Lithium', atomicNumber: 3, shells: [2, 1] },
    C: { name: 'Carbon', atomicNumber: 6, shells: [2, 4] },
    N: { name: 'Nitrogen', atomicNumber: 7, shells: [2, 5] },
    O: { name: 'Oxygen', atomicNumber: 8, shells: [2, 6] }
  };

  return (
    <>
      <div className="controls-panel">
        <div className="control-group">
          <h3>🎯 Element Selection</h3>
          <label>Choose Element:</label>
          <select value={selectedElement} onChange={(e) => setSelectedElement(e.target.value)}>
            {Object.entries(elements).map(([symbol, data]) => (
              <option key={symbol} value={symbol}>{symbol} - {data.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          <BohrAtomVisualization element={selectedElement} />
          <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      <div className="info-panel">
        <h3>📚 Bohr Model Information</h3>
        <div className="formula-box">
          <strong>Radius of nth orbit:</strong> rₙ = 0.529 × n² Å
        </div>
        <div className="formula-box">
          <strong>Energy of nth orbit:</strong> Eₙ = -13.6/n² eV
        </div>
        <div className="formula-box">
          <strong>Angular momentum:</strong> mvr = nh/2π
        </div>
      </div>
    </>
  );
};

// Bohr Atom 3D Visualization
const BohrAtomVisualization: React.FC<{ element: string }> = ({ element }) => {
  const elements = {
    H: { shells: [1], colors: ['#3b82f6'] },
    He: { shells: [2], colors: ['#8b5cf6'] },
    Li: { shells: [2, 1], colors: ['#8b5cf6', '#3b82f6'] },
    C: { shells: [2, 4], colors: ['#8b5cf6', '#3b82f6'] },
    N: { shells: [2, 5], colors: ['#8b5cf6', '#3b82f6'] },
    O: { shells: [2, 6], colors: ['#8b5cf6', '#3b82f6'] }
  };

  const data = elements[element as keyof typeof elements] || elements.H;

  return (
    <group>
      {/* Nucleus */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.2} color="#1e293b">
        Nucleus
      </Text>

      {/* Electron Shells */}
      {data.shells.map((electrons, shellIndex) => {
        const radius = (shellIndex + 1) * 1.5;
        const angleStep = (2 * Math.PI) / electrons;
        
        return (
          <group key={shellIndex}>
            {/* Shell Orbit */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[radius, 0.05, 8, 100]} />
              <meshStandardMaterial color={data.colors[shellIndex]} transparent opacity={0.3} />
            </mesh>
            
            {/* Electrons */}
            {Array.from({ length: electrons }).map((_, electronIndex) => {
              const angle = electronIndex * angleStep;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              
              return (
                <mesh key={electronIndex} position={[x, 0, z]}>
                  <sphereGeometry args={[0.1, 16, 16]} />
                  <meshStandardMaterial color={data.colors[shellIndex]} />
                </mesh>
              );
            })}
            
            <Text position={[radius + 0.5, 0, 0]} fontSize={0.15} color="#64748b">
              n = {shellIndex + 1}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

// Quantum Numbers Lab
const QuantumNumbersLab: React.FC<{ quantumNumbers: any; setQuantumNumbers: (qn: any) => void }> = ({ quantumNumbers, setQuantumNumbers }) => {
  return (
    <>
      <div className="controls-panel">
        <div className="control-group">
          <h3>🔢 Principal Quantum Number (n)</h3>
          <label>Shell Number: {quantumNumbers.n}</label>
          <input 
            type="range" 
            min="1" 
            max="4" 
            value={quantumNumbers.n}
            onChange={(e) => setQuantumNumbers({...quantumNumbers, n: parseInt(e.target.value)})}
          />
          <p>Determines energy level and shell size</p>
        </div>
        
        <div className="control-group">
          <h3>🌊 Azimuthal Quantum Number (l)</h3>
          <label>Subshell Type: {['s', 'p', 'd', 'f'][quantumNumbers.l]}</label>
          <input 
            type="range" 
            min="0" 
            max={quantumNumbers.n - 1} 
            value={quantumNumbers.l}
            onChange={(e) => setQuantumNumbers({...quantumNumbers, l: parseInt(e.target.value)})}
          />
          <p>0=s, 1=p, 2=d, 3=f</p>
        </div>
        
        <div className="control-group">
          <h3>🧭 Magnetic Quantum Number (mₗ)</h3>
          <label>Orientation: {quantumNumbers.ml}</label>
          <input 
            type="range" 
            min={-quantumNumbers.l} 
            max={quantumNumbers.l} 
            value={quantumNumbers.ml}
            onChange={(e) => setQuantumNumbers({...quantumNumbers, ml: parseInt(e.target.value)})}
          />
          <p>Range: -l to +l</p>
        </div>
        
        <div className="control-group">
          <h3>🔄 Spin Quantum Number (mₛ)</h3>
          <label>Spin: {quantumNumbers.ms > 0 ? '+½' : '-½'}</label>
          <input 
            type="range" 
            min="-0.5" 
            max="0.5" 
            step="1"
            value={quantumNumbers.ms}
            onChange={(e) => setQuantumNumbers({...quantumNumbers, ms: parseFloat(e.target.value)})}
          />
          <p>+½ or -½</p>
        </div>
      </div>

      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          <QuantumNumbersVisualization quantumNumbers={quantumNumbers} />
          <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      <div className="info-panel">
        <h3>📚 Quantum Numbers Summary</h3>
        <div className="formula-box">
          <strong>Electron Address:</strong> n={quantumNumbers.n}, l={quantumNumbers.l}, mₗ={quantumNumbers.ml}, mₛ={quantumNumbers.ms > 0 ? '+½' : '-½'}
        </div>
        <div className="formula-box">
          <strong>Orbital Type:</strong> {quantumNumbers.n}{['s', 'p', 'd', 'f'][quantumNumbers.l]}
        </div>
        <div className="formula-box">
          <strong>Max Electrons in Shell:</strong> 2n² = {2 * quantumNumbers.n * quantumNumbers.n}
        </div>
      </div>
    </>
  );
};

// Quantum Numbers 3D Visualization
const QuantumNumbersVisualization: React.FC<{ quantumNumbers: any }> = ({ quantumNumbers }) => {
  const orbitalColors = {
    0: '#3b82f6',  // s - blue
    1: '#8b5cf6',  // p - purple
    2: '#ec4899',  // d - pink
    3: '#f59e0b'   // f - orange
  };

  const renderOrbitalShape = () => {
    const l = quantumNumbers.l;
    const n = quantumNumbers.n;
    const ml = quantumNumbers.ml;
    const color = orbitalColors[l as keyof typeof orbitalColors] || '#3b82f6';
    const radius = n * 1.2;

    switch (l) {
      case 0: // s orbital - sphere
        return (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshStandardMaterial 
              color={color} 
              transparent 
              opacity={0.3}
            />
          </mesh>
        );
      
      case 1: // p orbital - dumbbell
        const pPositions = [
          [radius, 0, 0],    // px
          [0, radius, 0],    // py
          [0, 0, radius]     // pz
        ];
        return (
          <group>
            {pPositions.map((pos, index) => {
              if (index === 0 || (ml === 0 && index === 0) || (ml === 1 && index === 1) || (ml === -1 && index === 2)) {
                return (
                  <group key={index}>
                    <mesh position={pos}>
                      <sphereGeometry args={[radius * 0.6, 16, 16]} />
                      <meshStandardMaterial 
                        color={color} 
                        transparent 
                        opacity={0.4}
                      />
                    </mesh>
                    <mesh position={[-pos[0], -pos[1], -pos[2]]}>
                      <sphereGeometry args={[radius * 0.6, 16, 16]} />
                      <meshStandardMaterial 
                        color={color} 
                        transparent 
                        opacity={0.4}
                      />
                    </mesh>
                  </group>
                );
              }
              return null;
            })}
          </group>
        );
      
      case 2: // d orbital - cloverleaf
        const dPositions = [
          [radius * 0.8, radius * 0.8, 0],    // dxy
          [-radius * 0.8, radius * 0.8, 0],   // dxy
          [radius * 0.8, -radius * 0.8, 0],   // dxy
          [-radius * 0.8, -radius * 0.8, 0]   // dxy
        ];
        return (
          <group>
            {dPositions.map((pos, index) => (
              <mesh key={index} position={pos}>
                <sphereGeometry args={[radius * 0.4, 12, 12]} />
                <meshStandardMaterial 
                  color={color} 
                  transparent 
                  opacity={0.4}
                />
              </mesh>
            ))}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[radius * 0.3, 12, 12]} />
              <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={0.2}
              />
            </mesh>
          </group>
        );
      
      case 3: // f orbital - complex
        return (
          <group>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[radius, 32, 32]} />
              <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={0.1}
                wireframe={true}
              />
            </mesh>
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * Math.PI * 2) / 8;
              const x = Math.cos(angle) * radius * 0.8;
              const z = Math.sin(angle) * radius * 0.8;
              return (
                <mesh key={i} position={[x, 0, z]}>
                  <sphereGeometry args={[radius * 0.2, 8, 8]} />
                  <meshStandardMaterial 
                    color={color} 
                    transparent 
                    opacity={0.6}
                  />
                </mesh>
              );
            })}
          </group>
        );
      
      default:
        return (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshStandardMaterial 
              color={color} 
              transparent 
              opacity={0.3}
            />
          </mesh>
        );
    }
  };

  return (
    <group>
      {/* Nucleus */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>

      {/* Orbital Shape */}
      {renderOrbitalShape()}

      {/* Electron representation */}
      <mesh position={[quantumNumbers.n * 1.2, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>

      {/* Labels */}
      <Text position={[0, -quantumNumbers.n * 1.2 - 0.8, 0]} fontSize={0.25} color="#1e293b">
        {quantumNumbers.n}{['s', 'p', 'd', 'f'][quantumNumbers.l]} Orbital
      </Text>
      <Text position={[0, -quantumNumbers.n * 1.2 - 1.1, 0]} fontSize={0.2} color="#64748b">
        n={quantumNumbers.n}, l={quantumNumbers.l}, mₗ={quantumNumbers.ml}, mₛ={quantumNumbers.ms > 0 ? '+½' : '-½'}
      </Text>
    </group>
  );
};

// Atomic Spectra Lab
const AtomicSpectraLab: React.FC<{ spectrumSeries: string; setSpectrumSeries: (series: string) => void }> = ({ spectrumSeries, setSpectrumSeries }) => {
  const spectrumData = {
    lyman: { 
      name: 'Lyman Series', 
      n1: 1, 
      color: '#8B5CF6', 
      region: 'UV', 
      lines: [
        { n2: 2, wavelength: 121.6, energy: 10.2, color: '#8B5CF6' },
        { n2: 3, wavelength: 102.6, energy: 12.1, color: '#A855F7' },
        { n2: 4, wavelength: 97.3, energy: 12.8, color: '#C084FC' },
        { n2: 5, wavelength: 95.0, energy: 13.1, color: '#DDD6FE' }
      ]
    },
    balmer: { 
      name: 'Balmer Series', 
      n1: 2, 
      color: '#3B82F6', 
      region: 'Visible', 
      lines: [
        { n2: 3, wavelength: 656.3, energy: 1.89, color: '#FF0000' },
        { n2: 4, wavelength: 486.1, energy: 2.55, color: '#00FF00' },
        { n2: 5, wavelength: 434.0, energy: 2.86, color: '#0000FF' },
        { n2: 6, wavelength: 410.2, energy: 3.02, color: '#800080' }
      ]
    },
    paschen: { 
      name: 'Paschen Series', 
      n1: 3, 
      color: '#EF4444', 
      region: 'IR', 
      lines: [
        { n2: 4, wavelength: 1875.1, energy: 0.66, color: '#FF6B6B' },
        { n2: 5, wavelength: 1281.8, energy: 0.97, color: '#FF8E8E' },
        { n2: 6, wavelength: 1093.8, energy: 1.13, color: '#FFB1B1' },
        { n2: 7, wavelength: 1004.9, energy: 1.24, color: '#FFD4D4' }
      ]
    },
    brackett: { 
      name: 'Brackett Series', 
      n1: 4, 
      color: '#F59E0B', 
      region: 'IR', 
      lines: [
        { n2: 5, wavelength: 4051.3, energy: 0.31, color: '#FFA500' },
        { n2: 6, wavelength: 2625.1, energy: 0.47, color: '#FFB84D' },
        { n2: 7, wavelength: 2165.5, energy: 0.57, color: '#FFCC80' },
        { n2: 8, wavelength: 1944.6, energy: 0.64, color: '#FFE0B3' }
      ]
    }
  };

  const currentSeries = spectrumData[spectrumSeries as keyof typeof spectrumData];

  return (
    <>
      <div className="controls-panel">
        <div className="control-group">
          <h3>🌈 Spectrum Series</h3>
          <label>Choose Series:</label>
          <select value={spectrumSeries} onChange={(e) => setSpectrumSeries(e.target.value)}>
            {Object.entries(spectrumData).map(([key, data]) => (
              <option key={key} value={key}>{data.name} ({data.region})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="visualization-container">
        <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e293b' }}>
            {currentSeries.name} - {currentSeries.region} Region
          </h3>
          
          {/* Spectrum Diagram */}
          <div style={{ 
            background: 'linear-gradient(90deg, #000 0%, #1a1a1a 50%, #000 100%)', 
            padding: '20px', 
            borderRadius: '12px',
            marginBottom: '20px',
            position: 'relative',
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px', 
              alignItems: 'center',
              width: '100%'
            }}>
              {currentSeries.lines.map((line, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  width: '100%',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '60px',
                    fontSize: '12px',
                    color: '#fff',
                    textAlign: 'right'
                  }}>
                    n={line.n2}
                  </div>
                  <div
                    className="spectrum-line"
                    style={{
                      width: `${Math.min(80, (line.wavelength / 1000) * 100)}%`,
                      height: '4px',
                      backgroundColor: line.color,
                      borderRadius: '2px',
                      boxShadow: `0 0 10px ${line.color}`,
                      position: 'relative'
                    }}
                    title={`n=${currentSeries.n1} → n=${line.n2}: λ = ${line.wavelength} nm, E = ${line.energy} eV`}
                  >
                    <span style={{ 
                      position: 'absolute', 
                      right: '-80px', 
                      top: '-8px', 
                      fontSize: '11px',
                      color: '#fff',
                      fontWeight: '600'
                    }}>
                      {line.wavelength} nm
                    </span>
                    <span style={{ 
                      position: 'absolute', 
                      right: '-80px', 
                      top: '8px', 
                      fontSize: '10px',
                      color: '#ccc'
                    }}>
                      {line.energy} eV
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Energy Level Diagram */}
          <div style={{ 
            background: '#f8fafc', 
            padding: '15px', 
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1e293b', textAlign: 'center' }}>
              Energy Level Transitions
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '10px' }}>
              {currentSeries.lines.map((line, index) => (
                <div key={index} style={{
                  background: 'white',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  minWidth: '100px'
                }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    n={currentSeries.n1} → n={line.n2}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                    {line.wavelength} nm
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="info-panel">
        <h3>📚 Hydrogen Spectrum Formula</h3>
        <div className="formula-box">
          <strong>Rydberg Formula:</strong> 1/λ = R_H(1/n₁² - 1/n₂²)
        </div>
        <div className="formula-box">
          <strong>Rydberg Constant:</strong> R_H = 1.097 × 10⁷ m⁻¹
        </div>
        <div className="formula-box">
          <strong>Energy Transition:</strong> ΔE = 13.6(1/n₁² - 1/n₂²) eV
        </div>
        <div className="formula-box">
          <strong>Series Limit:</strong> n₂ → ∞ gives shortest wavelength
        </div>
      </div>
    </>
  );
};

// Orbital Shapes Lab
const OrbitalShapesLab: React.FC<{ orbitalType: string; setOrbitalType: (type: string) => void }> = ({ orbitalType, setOrbitalType }) => {
  const orbitalTypes = ['s', 'p', 'd', 'f'];

  return (
    <>
      <div className="controls-panel">
        <div className="control-group">
          <h3>🌸 Orbital Shapes</h3>
          <label>Choose Orbital Type:</label>
          <select value={orbitalType} onChange={(e) => setOrbitalType(e.target.value)}>
            {orbitalTypes.map(type => (
              <option key={type} value={type}>{type.toUpperCase()} Orbital</option>
            ))}
          </select>
        </div>
      </div>

      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          <OrbitalShapeVisualization type={orbitalType} />
          <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      <div className="info-panel">
        <h3>📚 Orbital Properties</h3>
        <div className="formula-box">
          <strong>s Orbital:</strong> Spherical, 1 orbital, l=0
        </div>
        <div className="formula-box">
          <strong>p Orbital:</strong> Dumbbell, 3 orbitals, l=1
        </div>
        <div className="formula-box">
          <strong>d Orbital:</strong> Cloverleaf, 5 orbitals, l=2
        </div>
        <div className="formula-box">
          <strong>f Orbital:</strong> Complex, 7 orbitals, l=3
        </div>
      </div>
    </>
  );
};

// Orbital Shape 3D Visualization
const OrbitalShapeVisualization: React.FC<{ type: string }> = ({ type }) => {
  const orbitalData = {
    s: { color: '#3b82f6', description: 'Spherical' },
    p: { color: '#8b5cf6', description: 'Dumbbell' },
    d: { color: '#ec4899', description: 'Cloverleaf' },
    f: { color: '#f59e0b', description: 'Complex' }
  };

  const data = orbitalData[type as keyof typeof orbitalData] || orbitalData.s;

  const renderOrbitalShape = () => {
    switch (type) {
      case 's':
        return (
          <mesh>
            <sphereGeometry args={[2, 32, 32]} />
            <meshStandardMaterial 
              color={data.color} 
              transparent 
              opacity={0.4}
            />
          </mesh>
        );
      case 'p':
        return (
          <group>
            {/* Px orbital - dumbbell along x-axis */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
              <sphereGeometry args={[1.5, 16, 16]} />
              <meshStandardMaterial 
                color={data.color} 
                transparent 
                opacity={0.3}
              />
            </mesh>
            <mesh position={[3, 0, 0]} rotation={[0, 0, 0]}>
              <sphereGeometry args={[1.5, 16, 16]} />
              <meshStandardMaterial 
                color={data.color} 
                transparent 
                opacity={0.3}
              />
            </mesh>
            <mesh position={[-3, 0, 0]} rotation={[0, 0, 0]}>
              <sphereGeometry args={[1.5, 16, 16]} />
              <meshStandardMaterial 
                color={data.color} 
                transparent 
                opacity={0.3}
              />
            </mesh>
          </group>
        );
      case 'd':
        return (
          <group>
            {/* Dxy orbital - cloverleaf shape */}
            <mesh position={[2, 2, 0]} rotation={[0, 0, 0]}>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshStandardMaterial 
                color={data.color} 
                transparent 
                opacity={0.3}
              />
            </mesh>
            <mesh position={[-2, 2, 0]} rotation={[0, 0, 0]}>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshStandardMaterial 
                color={data.color} 
                transparent 
                opacity={0.3}
              />
            </mesh>
            <mesh position={[2, -2, 0]} rotation={[0, 0, 0]}>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshStandardMaterial 
                color={data.color} 
                transparent 
                opacity={0.3}
              />
            </mesh>
            <mesh position={[-2, -2, 0]} rotation={[0, 0, 0]}>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshStandardMaterial 
                color={data.color} 
                transparent 
                opacity={0.3}
              />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
              <sphereGeometry args={[0.8, 16, 16]} />
              <meshStandardMaterial 
                color={data.color} 
                transparent 
                opacity={0.2}
              />
            </mesh>
          </group>
        );
      case 'f':
        return (
          <group>
            {/* F orbital - complex shape */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
              <sphereGeometry args={[2, 32, 32]} />
              <meshStandardMaterial 
                color={data.color} 
                transparent 
                opacity={0.2}
                wireframe={true}
              />
            </mesh>
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * Math.PI * 2) / 8;
              const radius = 2.5;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              return (
                <mesh key={i} position={[x, 0, z]} rotation={[0, 0, 0]}>
                  <sphereGeometry args={[0.6, 12, 12]} />
                  <meshStandardMaterial 
                    color={data.color} 
                    transparent 
                    opacity={0.4}
                  />
                </mesh>
              );
            })}
          </group>
        );
      default:
        return (
          <mesh>
            <sphereGeometry args={[2, 32, 32]} />
            <meshStandardMaterial 
              color={data.color} 
              transparent 
              opacity={0.3}
            />
          </mesh>
        );
    }
  };

  return (
    <group>
      {renderOrbitalShape()}
      <Text position={[0, -3, 0]} fontSize={0.5} color="#1e293b">
        {type.toUpperCase()} Orbital - {data.description}
      </Text>
    </group>
  );
};

// Electron Configuration Lab
const ElectronConfigLab: React.FC<{ electronConfig: string; setElectronConfig: (config: string) => void }> = ({ electronConfig, setElectronConfig }) => {
  const [selectedElement, setSelectedElement] = useState('H');
  const [showExceptions, setShowExceptions] = useState(false);
  const [customConfig, setCustomConfig] = useState('');

  const elements = {
    H: { name: 'Hydrogen', atomicNumber: 1, config: '1s¹', exceptions: false },
    He: { name: 'Helium', atomicNumber: 2, config: '1s²', exceptions: false },
    Li: { name: 'Lithium', atomicNumber: 3, config: '1s² 2s¹', exceptions: false },
    C: { name: 'Carbon', atomicNumber: 6, config: '1s² 2s² 2p²', exceptions: false },
    N: { name: 'Nitrogen', atomicNumber: 7, config: '1s² 2s² 2p³', exceptions: false },
    O: { name: 'Oxygen', atomicNumber: 8, config: '1s² 2s² 2p⁴', exceptions: false },
    Fe: { name: 'Iron', atomicNumber: 26, config: '[Ar] 3d⁶ 4s²', exceptions: false },
    Cr: { name: 'Chromium', atomicNumber: 24, config: '[Ar] 3d⁵ 4s¹', exceptions: true },
    Cu: { name: 'Copper', atomicNumber: 29, config: '[Ar] 3d¹⁰ 4s¹', exceptions: true },
    Mo: { name: 'Molybdenum', atomicNumber: 42, config: '[Kr] 4d⁵ 5s¹', exceptions: true },
    Ag: { name: 'Silver', atomicNumber: 47, config: '[Kr] 4d¹⁰ 5s¹', exceptions: true }
  };

  const currentElement = elements[selectedElement as keyof typeof elements];

  const parseConfiguration = (config: string) => {
    if (!config) return [];
    return config.split(' ').map(orbital => {
      const match = orbital.match(/(\d+)([spdf])(\d+)/);
      if (match) {
        const [, n, l, electrons] = match;
        return { n: parseInt(n), l, electrons: parseInt(electrons), full: orbital };
      }
      return { n: 0, l: '', electrons: 0, full: orbital };
    }).filter(orbital => orbital.n > 0);
  };

  const configData = parseConfiguration(electronConfig || currentElement.config);

  return (
    <>
      <div className="controls-panel">
        <div className="control-group">
          <h3>🔑 Element Selection</h3>
          <label>Choose Element:</label>
          <select value={selectedElement} onChange={(e) => {
            setSelectedElement(e.target.value);
            setElectronConfig(elements[e.target.value as keyof typeof elements].config);
          }}>
            {Object.entries(elements).map(([symbol, data]) => (
              <option key={symbol} value={symbol}>
                {symbol} - {data.name} (Z={data.atomicNumber})
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <h3>⚙️ Custom Configuration</h3>
          <label>Enter Custom Config:</label>
          <input 
            type="text" 
            value={customConfig}
            onChange={(e) => setCustomConfig(e.target.value)}
            placeholder="e.g., 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                setElectronConfig(customConfig);
              }
            }}
          />
        </div>
        
        <div className="control-group">
          <h3>🎯 Show Exceptions</h3>
          <label>
            <input 
              type="checkbox" 
              checked={showExceptions}
              onChange={(e) => setShowExceptions(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Highlight Exception Elements
          </label>
        </div>
        
        <div className="control-group">
          <h3>🧮 Analysis</h3>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            <div>Total Electrons: {configData.reduce((sum, orbital) => sum + orbital.electrons, 0)}</div>
            <div>Valence: {configData.filter(o => o.n === Math.max(...configData.map(o => o.n))).reduce((sum, orbital) => sum + orbital.electrons, 0)}</div>
          </div>
        </div>
      </div>

      <div className="visualization-container">
        <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e293b' }}>
            {currentElement.name} (Z={currentElement.atomicNumber}) - {electronConfig || currentElement.config}
          </h3>
          
          {/* Orbital Energy Diagram */}
          <div style={{ 
            background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', 
            padding: '20px', 
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#1e293b', textAlign: 'center' }}>
              Orbital Energy Level Diagram
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {configData.length > 0 ? configData.map((orbital, index) => {
                const isException = showExceptions && currentElement.exceptions;
                const orbitalColor = orbital.l === 's' ? '#3b82f6' : 
                                  orbital.l === 'p' ? '#8b5cf6' : 
                                  orbital.l === 'd' ? '#ec4899' : '#f59e0b';
                
                return (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: isException ? '2px solid #ef4444' : '1px solid #e2e8f0',
                    boxShadow: isException ? '0 0 10px rgba(239, 68, 68, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{
                      width: '80px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      {orbital.full}
                    </div>
                    
                    <div style={{
                      flex: 1,
                      height: '20px',
                      background: `linear-gradient(90deg, ${orbitalColor} 0%, ${orbitalColor} ${(orbital.electrons / 2) * 100}%, #e2e8f0 ${(orbital.electrons / 2) * 100}%, #e2e8f0 100%)`,
                      borderRadius: '10px',
                      margin: '0 15px',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        right: '-30px',
                        top: '-2px',
                        fontSize: '12px',
                        color: '#64748b'
                      }}>
                        {orbital.electrons}/2
                      </div>
                    </div>
                    
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b',
                      minWidth: '100px'
                    }}>
                      {orbital.l === 's' ? 'Spherical' : 
                       orbital.l === 'p' ? 'Dumbbell' : 
                       orbital.l === 'd' ? 'Cloverleaf' : 'Complex'}
                    </div>
                  </div>
                );
              }) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#64748b',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>
                    No Valid Configuration
                  </h4>
                  <p style={{ margin: '0' }}>
                    Please enter a valid electron configuration or select an element
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3D Orbital Visualization */}
          {configData.length > 0 && (
            <div style={{ 
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', 
              padding: '20px', 
              borderRadius: '12px',
              marginBottom: '20px',
              height: '300px'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#1e293b', textAlign: 'center' }}>
                3D Orbital Visualization
              </h4>
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} />
                <ElectronConfigVisualization configData={configData} />
                <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
              </Canvas>
            </div>
          )}

          {/* Exception Information */}
          {currentElement.exceptions && (
            <div style={{
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              padding: '15px',
              borderRadius: '12px',
              border: '1px solid #fecaca',
              marginBottom: '15px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>
                ⚠️ Exception Configuration
              </h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#991b1b' }}>
                This element shows an exception due to extra stability of half-filled or fully-filled orbitals.
                The actual configuration differs from the expected Aufbau order.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="info-panel">
        <h3>📚 Advanced Configuration Rules</h3>
        <div className="formula-box">
          <strong>Aufbau Principle:</strong> Fill orbitals in order of increasing energy (n+l rule)
        </div>
        <div className="formula-box">
          <strong>Pauli Exclusion:</strong> Maximum 2 electrons per orbital with opposite spins
        </div>
        <div className="formula-box">
          <strong>Hund's Rule:</strong> Electrons occupy degenerate orbitals singly before pairing
        </div>
        <div className="formula-box">
          <strong>Exceptions:</strong> Cr, Cu, Mo, Ag show half/full-filled stability
        </div>
        <div className="formula-box">
          <strong>Valence Electrons:</strong> Electrons in the outermost shell determine chemical properties
        </div>
      </div>
    </>
  );
};

// Electron Configuration 3D Visualization
const ElectronConfigVisualization: React.FC<{ configData: any[] }> = ({ configData }) => {
  const orbitalColors = {
    s: '#3b82f6',  // blue
    p: '#8b5cf6',  // purple
    d: '#ec4899',  // pink
    f: '#f59e0b'   // orange
  };

  return (
    <group>
      {/* Nucleus */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>

      {/* Orbital Shells */}
      {configData.map((orbital, index) => {
        const color = orbitalColors[orbital.l as keyof typeof orbitalColors] || '#3b82f6';
        const radius = orbital.n * 1.5;
        const opacity = 0.1 + (orbital.electrons / 2) * 0.3;

        return (
          <group key={index}>
            {/* Orbital shell */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[radius, 32, 32]} />
              <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={opacity}
                wireframe={orbital.l !== 's'}
              />
            </mesh>

            {/* Electrons */}
            {Array.from({ length: orbital.electrons }).map((_, electronIndex) => {
              const angle = (electronIndex * Math.PI * 2) / orbital.electrons;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              return (
                <mesh key={electronIndex} position={[x, 0, z]}>
                  <sphereGeometry args={[0.1, 16, 16]} />
                  <meshStandardMaterial color={color} />
                </mesh>
              );
            })}

            {/* Shell label */}
            <Text position={[radius + 0.5, 0, 0]} fontSize={0.2} color="#1e293b">
              {orbital.full}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

export default AtomicStructureIntermediatePlayground;
