import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

// Complete periodic table data for all 118 elements with accurate electron configurations
const PERIODIC_TABLE: { [key: number]: { symbol: string; name: string; mass: number; config: number[] } } = {
  1: { symbol: 'H', name: 'Hydrogen', mass: 1.008, config: [1] },
  2: { symbol: 'He', name: 'Helium', mass: 4.003, config: [2] },
  3: { symbol: 'Li', name: 'Lithium', mass: 6.941, config: [2, 1] },
  4: { symbol: 'Be', name: 'Beryllium', mass: 9.012, config: [2, 2] },
  5: { symbol: 'B', name: 'Boron', mass: 10.81, config: [2, 3] },
  6: { symbol: 'C', name: 'Carbon', mass: 12.01, config: [2, 4] },
  7: { symbol: 'N', name: 'Nitrogen', mass: 14.01, config: [2, 5] },
  8: { symbol: 'O', name: 'Oxygen', mass: 16.00, config: [2, 6] },
  9: { symbol: 'F', name: 'Fluorine', mass: 19.00, config: [2, 7] },
  10: { symbol: 'Ne', name: 'Neon', mass: 20.18, config: [2, 8] },
  11: { symbol: 'Na', name: 'Sodium', mass: 22.99, config: [2, 8, 1] },
  12: { symbol: 'Mg', name: 'Magnesium', mass: 24.31, config: [2, 8, 2] },
  13: { symbol: 'Al', name: 'Aluminum', mass: 26.98, config: [2, 8, 3] },
  14: { symbol: 'Si', name: 'Silicon', mass: 28.09, config: [2, 8, 4] },
  15: { symbol: 'P', name: 'Phosphorus', mass: 30.97, config: [2, 8, 5] },
  16: { symbol: 'S', name: 'Sulfur', mass: 32.07, config: [2, 8, 6] },
  17: { symbol: 'Cl', name: 'Chlorine', mass: 35.45, config: [2, 8, 7] },
  18: { symbol: 'Ar', name: 'Argon', mass: 39.95, config: [2, 8, 8] },
  19: { symbol: 'K', name: 'Potassium', mass: 39.10, config: [2, 8, 8, 1] },
  20: { symbol: 'Ca', name: 'Calcium', mass: 40.08, config: [2, 8, 8, 2] },
  21: { symbol: 'Sc', name: 'Scandium', mass: 44.96, config: [2, 8, 9, 2] },
  22: { symbol: 'Ti', name: 'Titanium', mass: 47.87, config: [2, 8, 10, 2] },
  23: { symbol: 'V', name: 'Vanadium', mass: 50.94, config: [2, 8, 11, 2] },
  24: { symbol: 'Cr', name: 'Chromium', mass: 52.00, config: [2, 8, 13, 1] },
  25: { symbol: 'Mn', name: 'Manganese', mass: 54.94, config: [2, 8, 13, 2] },
  26: { symbol: 'Fe', name: 'Iron', mass: 55.85, config: [2, 8, 14, 2] },
  27: { symbol: 'Co', name: 'Cobalt', mass: 58.93, config: [2, 8, 15, 2] },
  28: { symbol: 'Ni', name: 'Nickel', mass: 58.69, config: [2, 8, 16, 2] },
  29: { symbol: 'Cu', name: 'Copper', mass: 63.55, config: [2, 8, 18, 1] },
  30: { symbol: 'Zn', name: 'Zinc', mass: 65.38, config: [2, 8, 18, 2] },
  31: { symbol: 'Ga', name: 'Gallium', mass: 69.72, config: [2, 8, 18, 3] },
  32: { symbol: 'Ge', name: 'Germanium', mass: 72.63, config: [2, 8, 18, 4] },
  33: { symbol: 'As', name: 'Arsenic', mass: 74.92, config: [2, 8, 18, 5] },
  34: { symbol: 'Se', name: 'Selenium', mass: 78.96, config: [2, 8, 18, 6] },
  35: { symbol: 'Br', name: 'Bromine', mass: 79.90, config: [2, 8, 18, 7] },
  36: { symbol: 'Kr', name: 'Krypton', mass: 83.80, config: [2, 8, 18, 8] },
  37: { symbol: 'Rb', name: 'Rubidium', mass: 85.47, config: [2, 8, 18, 8, 1] },
  38: { symbol: 'Sr', name: 'Strontium', mass: 87.62, config: [2, 8, 18, 8, 2] },
  39: { symbol: 'Y', name: 'Yttrium', mass: 88.91, config: [2, 8, 18, 9, 2] },
  40: { symbol: 'Zr', name: 'Zirconium', mass: 91.22, config: [2, 8, 18, 10, 2] },
  41: { symbol: 'Nb', name: 'Niobium', mass: 92.91, config: [2, 8, 18, 12, 1] },
  42: { symbol: 'Mo', name: 'Molybdenum', mass: 95.96, config: [2, 8, 18, 13, 1] },
  43: { symbol: 'Tc', name: 'Technetium', mass: 98, config: [2, 8, 18, 13, 2] },
  44: { symbol: 'Ru', name: 'Ruthenium', mass: 101.07, config: [2, 8, 18, 15, 1] },
  45: { symbol: 'Rh', name: 'Rhodium', mass: 102.91, config: [2, 8, 18, 16, 1] },
  46: { symbol: 'Pd', name: 'Palladium', mass: 106.42, config: [2, 8, 18, 18] },
  47: { symbol: 'Ag', name: 'Silver', mass: 107.87, config: [2, 8, 18, 18, 1] },
  48: { symbol: 'Cd', name: 'Cadmium', mass: 112.41, config: [2, 8, 18, 18, 2] },
  49: { symbol: 'In', name: 'Indium', mass: 114.82, config: [2, 8, 18, 18, 3] },
  50: { symbol: 'Sn', name: 'Tin', mass: 118.71, config: [2, 8, 18, 18, 4] },
  51: { symbol: 'Sb', name: 'Antimony', mass: 121.76, config: [2, 8, 18, 18, 5] },
  52: { symbol: 'Te', name: 'Tellurium', mass: 127.60, config: [2, 8, 18, 18, 6] },
  53: { symbol: 'I', name: 'Iodine', mass: 126.90, config: [2, 8, 18, 18, 7] },
  54: { symbol: 'Xe', name: 'Xenon', mass: 131.29, config: [2, 8, 18, 18, 8] },
  55: { symbol: 'Cs', name: 'Cesium', mass: 132.91, config: [2, 8, 18, 18, 8, 1] },
  56: { symbol: 'Ba', name: 'Barium', mass: 137.33, config: [2, 8, 18, 18, 8, 2] },
  57: { symbol: 'La', name: 'Lanthanum', mass: 138.91, config: [2, 8, 18, 18, 9, 2] },
  58: { symbol: 'Ce', name: 'Cerium', mass: 140.12, config: [2, 8, 18, 19, 9, 2] },
  59: { symbol: 'Pr', name: 'Praseodymium', mass: 140.91, config: [2, 8, 18, 21, 8, 2] },
  60: { symbol: 'Nd', name: 'Neodymium', mass: 144.24, config: [2, 8, 18, 22, 8, 2] },
  61: { symbol: 'Pm', name: 'Promethium', mass: 145, config: [2, 8, 18, 23, 8, 2] },
  62: { symbol: 'Sm', name: 'Samarium', mass: 150.36, config: [2, 8, 18, 24, 8, 2] },
  63: { symbol: 'Eu', name: 'Europium', mass: 151.96, config: [2, 8, 18, 25, 8, 2] },
  64: { symbol: 'Gd', name: 'Gadolinium', mass: 157.25, config: [2, 8, 18, 25, 9, 2] },
  65: { symbol: 'Tb', name: 'Terbium', mass: 158.93, config: [2, 8, 18, 27, 8, 2] },
  66: { symbol: 'Dy', name: 'Dysprosium', mass: 162.50, config: [2, 8, 18, 28, 8, 2] },
  67: { symbol: 'Ho', name: 'Holmium', mass: 164.93, config: [2, 8, 18, 29, 8, 2] },
  68: { symbol: 'Er', name: 'Erbium', mass: 167.26, config: [2, 8, 18, 30, 8, 2] },
  69: { symbol: 'Tm', name: 'Thulium', mass: 168.93, config: [2, 8, 18, 31, 8, 2] },
  70: { symbol: 'Yb', name: 'Ytterbium', mass: 173.05, config: [2, 8, 18, 32, 8, 2] },
  71: { symbol: 'Lu', name: 'Lutetium', mass: 174.97, config: [2, 8, 18, 32, 9, 2] },
  72: { symbol: 'Hf', name: 'Hafnium', mass: 178.49, config: [2, 8, 18, 32, 10, 2] },
  73: { symbol: 'Ta', name: 'Tantalum', mass: 180.95, config: [2, 8, 18, 32, 11, 2] },
  74: { symbol: 'W', name: 'Tungsten', mass: 183.84, config: [2, 8, 18, 32, 12, 2] },
  75: { symbol: 'Re', name: 'Rhenium', mass: 186.21, config: [2, 8, 18, 32, 13, 2] },
  76: { symbol: 'Os', name: 'Osmium', mass: 190.23, config: [2, 8, 18, 32, 14, 2] },
  77: { symbol: 'Ir', name: 'Iridium', mass: 192.22, config: [2, 8, 18, 32, 15, 2] },
  78: { symbol: 'Pt', name: 'Platinum', mass: 195.08, config: [2, 8, 18, 32, 17, 1] },
  79: { symbol: 'Au', name: 'Gold', mass: 196.97, config: [2, 8, 18, 32, 18, 1] },
  80: { symbol: 'Hg', name: 'Mercury', mass: 200.59, config: [2, 8, 18, 32, 18, 2] },
  81: { symbol: 'Tl', name: 'Thallium', mass: 204.38, config: [2, 8, 18, 32, 18, 3] },
  82: { symbol: 'Pb', name: 'Lead', mass: 207.2, config: [2, 8, 18, 32, 18, 4] },
  83: { symbol: 'Bi', name: 'Bismuth', mass: 208.98, config: [2, 8, 18, 32, 18, 5] },
  84: { symbol: 'Po', name: 'Polonium', mass: 209, config: [2, 8, 18, 32, 18, 6] },
  85: { symbol: 'At', name: 'Astatine', mass: 210, config: [2, 8, 18, 32, 18, 7] },
  86: { symbol: 'Rn', name: 'Radon', mass: 222, config: [2, 8, 18, 32, 18, 8] },
  87: { symbol: 'Fr', name: 'Francium', mass: 223, config: [2, 8, 18, 32, 18, 8, 1] },
  88: { symbol: 'Ra', name: 'Radium', mass: 226, config: [2, 8, 18, 32, 18, 8, 2] },
  89: { symbol: 'Ac', name: 'Actinium', mass: 227, config: [2, 8, 18, 32, 18, 9, 2] },
  90: { symbol: 'Th', name: 'Thorium', mass: 232.04, config: [2, 8, 18, 32, 18, 10, 2] },
  91: { symbol: 'Pa', name: 'Protactinium', mass: 231.04, config: [2, 8, 18, 32, 20, 9, 2] },
  92: { symbol: 'U', name: 'Uranium', mass: 238.03, config: [2, 8, 18, 32, 21, 9, 2] },
  93: { symbol: 'Np', name: 'Neptunium', mass: 237, config: [2, 8, 18, 32, 22, 9, 2] },
  94: { symbol: 'Pu', name: 'Plutonium', mass: 244, config: [2, 8, 18, 32, 24, 8, 2] },
  95: { symbol: 'Am', name: 'Americium', mass: 243, config: [2, 8, 18, 32, 25, 8, 2] },
  96: { symbol: 'Cm', name: 'Curium', mass: 247, config: [2, 8, 18, 32, 25, 9, 2] },
  97: { symbol: 'Bk', name: 'Berkelium', mass: 247, config: [2, 8, 18, 32, 27, 8, 2] },
  98: { symbol: 'Cf', name: 'Californium', mass: 251, config: [2, 8, 18, 32, 28, 8, 2] },
  99: { symbol: 'Es', name: 'Einsteinium', mass: 252, config: [2, 8, 18, 32, 29, 8, 2] },
  100: { symbol: 'Fm', name: 'Fermium', mass: 257, config: [2, 8, 18, 32, 30, 8, 2] },
  101: { symbol: 'Md', name: 'Mendelevium', mass: 258, config: [2, 8, 18, 32, 31, 8, 2] },
  102: { symbol: 'No', name: 'Nobelium', mass: 259, config: [2, 8, 18, 32, 32, 8, 2] },
  103: { symbol: 'Lr', name: 'Lawrencium', mass: 262, config: [2, 8, 18, 32, 32, 8, 3] },
  104: { symbol: 'Rf', name: 'Rutherfordium', mass: 261, config: [2, 8, 18, 32, 32, 10, 2] },
  105: { symbol: 'Db', name: 'Dubnium', mass: 262, config: [2, 8, 18, 32, 32, 11, 2] },
  106: { symbol: 'Sg', name: 'Seaborgium', mass: 266, config: [2, 8, 18, 32, 32, 12, 2] },
  107: { symbol: 'Bh', name: 'Bohrium', mass: 264, config: [2, 8, 18, 32, 32, 13, 2] },
  108: { symbol: 'Hs', name: 'Hassium', mass: 267, config: [2, 8, 18, 32, 32, 14, 2] },
  109: { symbol: 'Mt', name: 'Meitnerium', mass: 268, config: [2, 8, 18, 32, 32, 15, 2] },
  110: { symbol: 'Ds', name: 'Darmstadtium', mass: 271, config: [2, 8, 18, 32, 32, 16, 2] },
  111: { symbol: 'Rg', name: 'Roentgenium', mass: 272, config: [2, 8, 18, 32, 32, 17, 2] },
  112: { symbol: 'Cn', name: 'Copernicium', mass: 285, config: [2, 8, 18, 32, 32, 18, 2] },
  113: { symbol: 'Nh', name: 'Nihonium', mass: 284, config: [2, 8, 18, 32, 32, 18, 3] },
  114: { symbol: 'Fl', name: 'Flerovium', mass: 289, config: [2, 8, 18, 32, 32, 18, 4] },
  115: { symbol: 'Mc', name: 'Moscovium', mass: 288, config: [2, 8, 18, 32, 32, 18, 5] },
  116: { symbol: 'Lv', name: 'Livermorium', mass: 293, config: [2, 8, 18, 32, 32, 18, 6] },
  117: { symbol: 'Ts', name: 'Tennessine', mass: 294, config: [2, 8, 18, 32, 32, 18, 7] },
  118: { symbol: 'Og', name: 'Oganesson', mass: 294, config: [2, 8, 18, 32, 32, 18, 8] }
};

// Atomic Structure Advanced Playground
const AtomicStructureAdvancedPlayground: React.FC = () => {
  const [activeLab, setActiveLab] = useState('bohr-model');
  const [atomicNumber, setAtomicNumber] = useState(1);
  const [customZ, setCustomZ] = useState('1');
  const [selectedShell, setSelectedShell] = useState(1);
  const [quantumNumbers, setQuantumNumbers] = useState({ n: 1, l: 0, ml: 0, ms: 0.5 });
  const [orbitalType, setOrbitalType] = useState('s');
  const [animationSpeed, setAnimationSpeed] = useState(1);

  const labs = [
    { id: 'bohr-model', name: 'Bohr Model', icon: '⚛️', description: 'Interactive atomic model with energy levels' },
    { id: 'quantum-numbers', name: 'Quantum Numbers', icon: '🔢', description: '4D address system for electrons' },
    { id: 'orbital-shapes', name: 'Orbital Shapes', icon: '🌐', description: '3D probability clouds visualization' },
    { id: 'electron-config', name: 'Electron Config', icon: '⚡', description: 'Advanced orbital diagrams with spin' },
    { id: 'atomic-spectra', name: 'Atomic Spectra', icon: '🌈', description: 'Emission and absorption spectra' },
    { id: 'uncertainty', name: 'Uncertainty Principle', icon: '🎯', description: 'Position-momentum uncertainty' },
    { id: 'wave-function', name: 'Wave Function', icon: '🌊', description: 'Schrödinger equation solutions' },
    { id: 'periodic-trends', name: 'Periodic Trends', icon: '📊', description: 'Ionization energy, atomic radius trends' },
    { id: 'de-broglie', name: 'de Broglie Waves', icon: '🌊', description: 'Matter-wave duality' },
    { id: 'zeeman-effect', name: 'Zeeman Effect', icon: '🧲', description: 'Magnetic field splitting' },
    { id: 'stark-effect', name: 'Stark Effect', icon: '⚡', description: 'Electric field splitting' },
    { id: 'hydrogen-spectrum', name: 'H-Spectrum', icon: '🔬', description: 'Lyman, Balmer, Paschen series' }
  ];

  return (
    <div className="atomic-structure-playground">
      {/* Header */}
      <div className="header">
        <h1>Advanced Atomic Structure Laboratory</h1>
        <p>Interactive 3D/2D Visualizations for JEE Advanced Concepts</p>
      </div>

      {/* Navigation Bar */}
      <div className="nav-bar">
        {labs.map(lab => (
          <button
            key={lab.id}
            className={`nav-btn ${activeLab === lab.id ? 'active' : ''}`}
            onClick={() => setActiveLab(lab.id)}
            title={lab.description}
          >
            <span className="nav-icon">{lab.icon}</span>
            <span className="nav-name">{lab.name}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area - Split Layout */}
      <div className="main-content">
        {/* Left Panel - Controls (20-30%) */}
        <div className="left-panel">
          <div className="controls-container">
            {activeLab === 'bohr-model' && (
              <>
                <div className="control-group">
                  <h3>⚛️ Element Selection</h3>
                  <div className="custom-z-input">
                    <input
                      type="number"
                      min="1"
                      max="118"
                      value={customZ}
                      onChange={(e) => setCustomZ(e.target.value)}
                      placeholder="Enter Z (1-118)"
                    />
                    <button 
                      onClick={() => {
                        const num = parseInt(customZ);
                        if (!isNaN(num) && num >= 1 && num <= 118) {
                          setAtomicNumber(num);
                          // Reset selected shell if needed
                          const element = PERIODIC_TABLE[num];
                          if (element && selectedShell > element.config.length) {
                            setSelectedShell(1);
                          }
                        }
                      }}
                    >
                      Apply
                    </button>
                  </div>
                  {PERIODIC_TABLE[atomicNumber] && (
                    <div className="element-preview">
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {PERIODIC_TABLE[atomicNumber].symbol}
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        {PERIODIC_TABLE[atomicNumber].name}
                      </div>
                      <div style={{ fontSize: '12px', marginTop: '5px' }}>
                        Atomic Number: {atomicNumber}
                      </div>
                      <div style={{ fontSize: '12px' }}>
                        Mass: {PERIODIC_TABLE[atomicNumber].mass.toFixed(2)} u
                      </div>
                      <div style={{ fontSize: '12px', marginTop: '5px', color: '#667eea' }}>
                        Config: {PERIODIC_TABLE[atomicNumber].config.join('-')}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="control-group">
                  <h3>🔋 Energy Levels</h3>
                  <div className="energy-levels">
                    {PERIODIC_TABLE[atomicNumber] && PERIODIC_TABLE[atomicNumber].config.map((electrons, index) => {
                      const n = index + 1;
                      const energy = -13.6 * (atomicNumber * atomicNumber) / (n * n);
                      return (
                        <button
                          key={n}
                          className={`energy-level-btn ${selectedShell === n ? 'active' : ''}`}
                          onClick={() => setSelectedShell(n)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>n = {n}</span>
                            <span style={{ fontSize: '12px', color: '#718096' }}>
                              {electrons} e⁻
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '4px' }}>
                            E = {energy.toFixed(2)} eV
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="control-group">
                  <h3>🎮 Animation Speed</h3>
                  <div className="speed-control">
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    />
                    <span className="speed-value">{animationSpeed}x</span>
                  </div>
                </div>
              </>
            )}

            {activeLab === 'quantum-numbers' && (
              <>
                <div className="control-group">
                  <h3>🔢 Principal Quantum Number (n)</h3>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={quantumNumbers.n}
                    onChange={(e) => setQuantumNumbers({...quantumNumbers, n: parseInt(e.target.value)})}
                  />
                  <span className="value-display">n = {quantumNumbers.n}</span>
                </div>
                <div className="control-group">
                  <h3>🌐 Azimuthal Quantum Number (l)</h3>
                  <input
                    type="range"
                    min="0"
                    max={quantumNumbers.n - 1}
                    value={quantumNumbers.l}
                    onChange={(e) => setQuantumNumbers({...quantumNumbers, l: parseInt(e.target.value)})}
                  />
                  <span className="value-display">l = {quantumNumbers.l} ({['s', 'p', 'd', 'f', 'g', 'h', 'i'][quantumNumbers.l] || '?'})</span>
                </div>
                <div className="control-group">
                  <h3>🧲 Magnetic Quantum Number (mₗ)</h3>
                  <input
                    type="range"
                    min={-quantumNumbers.l}
                    max={quantumNumbers.l}
                    value={quantumNumbers.ml}
                    onChange={(e) => setQuantumNumbers({...quantumNumbers, ml: parseInt(e.target.value)})}
                  />
                  <span className="value-display">mₗ = {quantumNumbers.ml}</span>
                </div>
                <div className="control-group">
                  <h3>🔄 Spin Quantum Number (mₛ)</h3>
                  <div className="spin-controls">
                    <button
                      className={`spin-btn ${quantumNumbers.ms === -0.5 ? 'active' : ''}`}
                      onClick={() => setQuantumNumbers({...quantumNumbers, ms: -0.5})}
                    >
                      -½
                    </button>
                    <button
                      className={`spin-btn ${quantumNumbers.ms === 0.5 ? 'active' : ''}`}
                      onClick={() => setQuantumNumbers({...quantumNumbers, ms: 0.5})}
                    >
                      +½
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeLab === 'orbital-shapes' && (
              <>
                <div className="control-group">
                  <h3>🎯 Orbital Type</h3>
                  <div className="orbital-buttons">
                    {['s', 'p', 'd', 'f'].map(type => (
                      <button
                        key={type}
                        className={`orbital-btn ${orbitalType === type ? 'active' : ''}`}
                        onClick={() => setOrbitalType(type)}
                      >
                        {type.toUpperCase()}-orbital
                      </button>
                    ))}
                  </div>
                </div>
                <div className="control-group">
                  <h3>🎮 Animation Speed</h3>
                  <div className="speed-control">
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    />
                    <span className="speed-value">{animationSpeed}x</span>
                  </div>
                </div>
                <div className="control-group">
                  <h3>🔍 View Options</h3>
                  <div className="view-options">
                    <label>
                      <input type="checkbox" defaultChecked />
                      Show Probability Density
                    </label>
                    <label>
                      <input type="checkbox" defaultChecked />
                      Show Phase Colors
                    </label>
                    <label>
                      <input type="checkbox" />
                      Show Cross Sections
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeLab === 'electron-config' && (
              <>
                <div className="control-group">
                  <h3>🎮 Animation Speed</h3>
                  <div className="speed-control">
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    />
                    <span className="speed-value">{animationSpeed}x</span>
                  </div>
                </div>
                <div className="control-group">
                  <h3>🔍 Display Options</h3>
                  <div className="view-options">
                    <label>
                      <input type="checkbox" defaultChecked />
                      Show Orbital Filling
                    </label>
                    <label>
                      <input type="checkbox" defaultChecked />
                      Show Electron Spins
                    </label>
                    <label>
                      <input type="checkbox" />
                      Show Energy Levels
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeLab === 'atomic-spectra' && (
              <>
                <div className="control-group">
                  <h3>🌈 Spectrum Type</h3>
                  <div className="spectrum-buttons">
                    <button className="spectrum-btn active">Emission</button>
                    <button className="spectrum-btn">Absorption</button>
                    <button className="spectrum-btn">Both</button>
                  </div>
                </div>
                <div className="control-group">
                  <h3>🎮 Animation Speed</h3>
                  <div className="speed-control">
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    />
                    <span className="speed-value">{animationSpeed}x</span>
                  </div>
                </div>
              </>
            )}

            {activeLab === 'uncertainty' && (
              <>
                <div className="control-group">
                  <h3>📏 Position Uncertainty (Δx)</h3>
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={1}
                    onChange={(e) => {}}
                  />
                  <span className="value-display">Δx = 1.0 nm</span>
                </div>
                <div className="control-group">
                  <h3>⚡ Momentum Uncertainty (Δp)</h3>
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={1}
                    onChange={(e) => {}}
                  />
                  <span className="value-display">Δp = 1.0 × 10⁻²⁵ kg⋅m/s</span>
                </div>
                <div className="control-group">
                  <h3>🎮 Animation Speed</h3>
                  <div className="speed-control">
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    />
                    <span className="speed-value">{animationSpeed}x</span>
                  </div>
                </div>
              </>
            )}

            {activeLab === 'wave-function' && (
              <>
                <div className="control-group">
                  <h3>🌊 Wave Function Type</h3>
                  <div className="wave-buttons">
                    <button className="wave-btn active">Radial</button>
                    <button className="wave-btn">Angular</button>
                    <button className="wave-btn">Complete</button>
                  </div>
                </div>
                <div className="control-group">
                  <h3>🎮 Animation Speed</h3>
                  <div className="speed-control">
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    />
                    <span className="speed-value">{animationSpeed}x</span>
                  </div>
                </div>
              </>
            )}

            {activeLab === 'periodic-trends' && (
              <>
                <div className="control-group">
                  <h3>📊 Trend Type</h3>
                  <div className="trend-buttons">
                    <button className="trend-btn active">Ionization Energy</button>
                    <button className="trend-btn">Atomic Radius</button>
                    <button className="trend-btn">Electronegativity</button>
                    <button className="trend-btn">Electron Affinity</button>
                  </div>
                </div>
                <div className="control-group">
                  <h3>🎮 Animation Speed</h3>
                  <div className="speed-control">
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    />
                    <span className="speed-value">{animationSpeed}x</span>
                  </div>
                </div>
              </>
            )}

            {activeLab === 'photoelectric' && (
              <>
                <div className="control-group">
                  <h3>💡 Light Frequency</h3>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.1"
                    value={5}
                    onChange={(e) => {}}
                  />
                  <span className="value-display">ν = 5.0 × 10¹⁴ Hz</span>
                </div>
                <div className="control-group">
                  <h3>⚡ Light Intensity</h3>
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={5}
                    onChange={(e) => {}}
                  />
                  <span className="value-display">I = 5.0 W/m²</span>
                </div>
                <div className="control-group">
                  <h3>🎮 Animation Speed</h3>
                  <div className="speed-control">
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    />
                    <span className="speed-value">{animationSpeed}x</span>
                  </div>
                </div>
              </>
            )}

            {/* Default controls for labs without specific controls */}
            {!['bohr-model', 'quantum-numbers', 'orbital-shapes', 'electron-config', 'atomic-spectra', 'uncertainty', 'wave-function', 'periodic-trends', 'photoelectric'].includes(activeLab) && (
              <>
                <div className="control-group">
                  <h3>🎮 Animation Speed</h3>
                  <div className="speed-control">
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    />
                    <span className="speed-value">{animationSpeed}x</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Panel - 3D Visualization (70-80%) */}
        <div className="right-panel">
          <div className="visualization-container">
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} />
              
              {activeLab === 'bohr-model' && PERIODIC_TABLE[atomicNumber] && (
                <BohrModelVisualization 
                  key={atomicNumber}
                  atomicNumber={atomicNumber}
                  element={PERIODIC_TABLE[atomicNumber]}
                  selectedShell={selectedShell}
                  speed={animationSpeed}
                />
              )}
              {activeLab === 'quantum-numbers' && <QuantumNumbersVisualization quantumNumbers={quantumNumbers} setQuantumNumbers={setQuantumNumbers} />}
              {activeLab === 'orbital-shapes' && <OrbitalShapesVisualization orbitalType={orbitalType} setOrbitalType={setOrbitalType} />}
              {activeLab === 'electron-config' && PERIODIC_TABLE[atomicNumber] && <ElectronConfigVisualization key={atomicNumber} element={PERIODIC_TABLE[atomicNumber].symbol} />}
              {activeLab === 'atomic-spectra' && PERIODIC_TABLE[atomicNumber] && <AtomicSpectraVisualization key={atomicNumber} element={PERIODIC_TABLE[atomicNumber].symbol} />}
              {activeLab === 'uncertainty' && <UncertaintyVisualization />}
              {activeLab === 'wave-function' && PERIODIC_TABLE[atomicNumber] && <WaveFunctionVisualization element={PERIODIC_TABLE[atomicNumber].symbol} />}
              {activeLab === 'periodic-trends' && <PeriodicTrendsVisualization />}
              {activeLab === 'de-broglie' && PERIODIC_TABLE[atomicNumber] && <DeBroglieVisualization element={PERIODIC_TABLE[atomicNumber].symbol} />}
              {activeLab === 'zeeman-effect' && PERIODIC_TABLE[atomicNumber] && <ZeemanEffectVisualization element={PERIODIC_TABLE[atomicNumber].symbol} />}
              {activeLab === 'stark-effect' && PERIODIC_TABLE[atomicNumber] && <StarkEffectVisualization element={PERIODIC_TABLE[atomicNumber].symbol} />}
              {activeLab === 'hydrogen-spectrum' && <HydrogenSpectrumVisualization />}
              
              <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
            </Canvas>
          </div>
        </div>
      </div>

      <style>{`
        .atomic-structure-playground {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', sans-serif;
        }

        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }

        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 10px 0;
          background: linear-gradient(45deg, #ffffff, #e0e7ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin: 0;
        }

        .nav-bar {
          display: flex;
          background: white;
          padding: 0 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow-x: auto;
          gap: 5px;
        }

        .nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px 20px;
          border: none;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 120px;
          border-radius: 8px 8px 0 0;
          position: relative;
        }

        .nav-btn:hover {
          background: #f8fafc;
          transform: translateY(-2px);
        }

        .nav-btn.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .nav-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .nav-icon {
          font-size: 24px;
          margin-bottom: 5px;
        }

        .nav-name {
          font-size: 12px;
          font-weight: 600;
        }

        .main-content {
          display: grid;
          grid-template-columns: 25% 75%;
          min-height: calc(100vh - 200px);
          gap: 0;
        }

        .left-panel {
          background: white;
          border-right: 1px solid #e2e8f0;
          padding: 20px;
          overflow-y: auto;
        }

        .controls-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .right-panel {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }

        .control-group {
          margin-bottom: 0;
        }

        .control-group h3 {
          color: #2d3748;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-group select {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          margin-bottom: 15px;
          transition: border-color 0.3s ease;
        }

        .control-group select:focus {
          outline: none;
          border-color: #667eea;
        }

        .custom-z-input {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .custom-z-input input {
          flex: 1;
          padding: 10px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .custom-z-input input:focus {
          outline: none;
          border-color: #667eea;
        }

        .custom-z-input button {
          padding: 10px 20px;
          border: 2px solid #667eea;
          border-radius: 8px;
          background: #667eea;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .custom-z-input button:hover:not(:disabled) {
          background: #5a67d8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .custom-z-input button:disabled {
          background: #a0aec0;
          border-color: #a0aec0;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .element-preview {
          background: #f0f4ff;
          border: 1px solid #667eea;
          border-radius: 8px;
          padding: 12px;
          font-size: 14px;
          color: #2d3748;
          text-align: center;
        }

        .speed-control {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .speed-control input[type="range"] {
          flex: 1;
          height: 6px;
          border-radius: 3px;
          background: #e2e8f0;
          outline: none;
          -webkit-appearance: none;
        }

        .speed-control input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
        }

        .speed-value {
          font-weight: 600;
          color: #667eea;
          min-width: 30px;
        }

        .visualization-container {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: relative;
        }

        .formula-box {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 15px;
          margin: 10px 0;
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }

        .energy-levels {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .energy-level-btn {
          padding: 12px 15px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .energy-level-btn:hover {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .energy-level-btn.active {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .value-display {
          font-weight: 600;
          color: #667eea;
          font-size: 14px;
          min-width: 100px;
          text-align: center;
        }

        .spin-controls {
          display: flex;
          gap: 10px;
        }

        .spin-btn {
          padding: 8px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 600;
        }

        .spin-btn:hover {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .spin-btn.active {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .orbital-buttons, .spectrum-buttons, .wave-buttons, .trend-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .orbital-btn, .spectrum-btn, .wave-btn, .trend-btn {
          padding: 8px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 12px;
          font-weight: 600;
        }

        .orbital-btn:hover, .spectrum-btn:hover, .wave-btn:hover, .trend-btn:hover {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .orbital-btn.active, .spectrum-btn.active, .wave-btn.active, .trend-btn.active {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .view-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .view-options label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          cursor: pointer;
        }

        .view-options input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #667eea;
        }

        @media (max-width: 768px) {
          .main-content {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
          }
          
          .left-panel {
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
            padding: 15px;
          }
          
          .controls-container {
            flex-direction: row;
            overflow-x: auto;
            gap: 15px;
          }
          
          .control-group {
            min-width: 200px;
            flex-shrink: 0;
          }
          
          .nav-bar {
            padding: 0 10px;
          }
          
          .nav-btn {
            min-width: 100px;
            padding: 12px 15px;
          }
          
          .nav-name {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

// Enhanced Bohr Model Visualization with accurate electron configurations
const BohrModelVisualization: React.FC<{ 
  atomicNumber: number; 
  element: any; 
  selectedShell: number; 
  speed: number 
}> = ({ atomicNumber, element, selectedShell, speed }) => {
  const groupRef = useRef<THREE.Group>(null);
  const electronRefs = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    if (groupRef.current) {
      // Rotate the entire atom very slowly
      groupRef.current.rotation.y += 0.001 * speed;
    }
    
    // Rotate electrons in their orbits at different speeds
    electronRefs.current.forEach((ref, shellIndex) => {
      if (ref) {
        // Each shell rotates at a different speed
        ref.rotation.y += (0.005 + shellIndex * 0.001) * speed;
      }
    });
  });

  // Shell colors for better visualization
  const shellColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a29bfe'];
  
  return (
    <>
      {/* Rotating Atom Group */}
      <group ref={groupRef}>
        {/* Nucleus */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial 
            color="#ff6b6b" 
            emissive="#ff4757" 
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        {/* Nucleus labels */}
        <Text 
          position={[0, 0, 0.7]} 
          fontSize={0.3} 
          color="white" 
          anchorX="center" 
          anchorY="middle"
        >
          {element.symbol}
        </Text>
        
        <Text 
          position={[0, -0.3, 0.7]} 
          fontSize={0.15} 
          color="white" 
          anchorX="center" 
          anchorY="middle"
        >
          Z={atomicNumber}
        </Text>

        {/* Electron Shells and Electrons */}
        {element.config.map((electronsInShell: number, shellIndex: number) => {
          const shellNumber = shellIndex + 1;
          const radius = 1.5 + shellIndex * 1.2;
          const isSelected = shellNumber === selectedShell;
          
          return (
            <group key={shellIndex}>
              {/* Shell Ring - Always visible for all shells */}
              <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[radius - 0.05, radius + 0.05, 64]} />
                <meshStandardMaterial 
                  color={shellColors[shellIndex % shellColors.length]}
                  transparent 
                  opacity={0.7}
                  emissive={shellColors[shellIndex % shellColors.length]}
                  emissiveIntensity={0.2}
                />
              </mesh>
              
              {/* Electrons in this shell */}
              <group ref={(el) => { if (el) electronRefs.current[shellIndex] = el; }}>
                {Array.from({ length: electronsInShell }, (_, electronIndex) => {
                  const angle = (electronIndex / electronsInShell) * Math.PI * 2;
                  const x = Math.cos(angle) * radius;
                  const z = Math.sin(angle) * radius;
                  
                  return (
                    <mesh key={electronIndex} position={[x, 0, z]}>
                      <sphereGeometry args={[0.12, 16, 16]} />
                      <meshStandardMaterial 
                        color={shellColors[shellIndex % shellColors.length]}
                        emissive={shellColors[shellIndex % shellColors.length]}
                        emissiveIntensity={0.6}
                        metalness={0.5}
                        roughness={0.2}
                      />
                    </mesh>
                  );
                })}
              </group>
              
              {/* Shell Label - Always visible for all shells */}
              <Text 
                position={[radius + 0.5, 0, 0]} 
                fontSize={0.2} 
                color="white" 
                anchorX="center" 
                anchorY="middle"
              >
                n={shellNumber}
              </Text>
            </group>
          );
        })}
      </group>
      
      {/* Fixed Information Display - Outside rotating group */}
      <group position={[0, -4, 0]}>
        <Text 
          position={[0, 0, 0]} 
          fontSize={0.35} 
          color="white" 
          anchorX="center" 
          anchorY="middle"
        >
          {element.name} ({element.symbol})
        </Text>
        
        <Text 
          position={[0, -0.5, 0]} 
          fontSize={0.25} 
          color="white" 
          anchorX="center" 
          anchorY="middle"
        >
          Shell {selectedShell}: {element.config[selectedShell - 1]} electrons
        </Text>
        
        <Text 
          position={[0, -1, 0]} 
          fontSize={0.2} 
          color="#a0aec0" 
          anchorX="center" 
          anchorY="middle"
        >
          Total: {atomicNumber} electrons
        </Text>
        
        <Text 
          position={[0, -1.4, 0]} 
          fontSize={0.18} 
          color="#a0aec0" 
          anchorX="center" 
          anchorY="middle"
        >
          Energy: {(-13.6 * atomicNumber * atomicNumber / (selectedShell * selectedShell)).toFixed(2)} eV
        </Text>
      </group>
    </>
  );
};

// Quantum Numbers Visualization
const QuantumNumbersVisualization: React.FC<{ quantumNumbers: any; setQuantumNumbers: any }> = ({ quantumNumbers, setQuantumNumbers }) => {
  const { n, l, ml, ms } = quantumNumbers;
  const groupRef = useRef<THREE.Group>(null);
  const [time, setTime] = useState(0);

  useFrame(() => {
    setTime(prev => prev + 0.01);
    // Removed rotation for Quantum Numbers visualization
  });

  // Create orbital shapes based on quantum numbers
  const getOrbitalShape = () => {
    if (l === 0) {
      // s-orbital - sphere
      return (
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial color="#4ecdc4" transparent opacity={0.6} />
        </mesh>
      );
    } else if (l === 1) {
      // p-orbital - dumbbell shape
      return (
        <group>
          <mesh position={[1, 0, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#ff6b6b" transparent opacity={0.6} />
          </mesh>
          <mesh position={[-1, 0, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#ff6b6b" transparent opacity={0.6} />
          </mesh>
        </group>
      );
    } else if (l === 2) {
      // d-orbital - cloverleaf shape
      return (
        <group>
          <mesh position={[1.2, 0, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#ffa726" transparent opacity={0.6} />
          </mesh>
          <mesh position={[-1.2, 0, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#ffa726" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0, 0, 1.2]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#ffa726" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0, 0, -1.2]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#ffa726" transparent opacity={0.6} />
          </mesh>
        </group>
      );
    }
    return (
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#4ecdc4" transparent opacity={0.6} />
      </mesh>
    );
  };

  return (
    <group ref={groupRef}>
      {/* Central nucleus */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      <Text position={[0, 0, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        n={n}
      </Text>

      {/* Orbital shape based on l - Now static and responsive */}
      <group position={[0, 0, 0]}>
        {getOrbitalShape()}
      </group>

      {/* Azimuthal quantum number indicator */}
      <mesh position={[2.5, 0, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#4ecdc4" />
      </mesh>
      <Text position={[2.5, -0.8, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        l={l}
      </Text>
      <Text position={[2.5, -1.2, 0]} fontSize={0.15} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        {['s', 'p', 'd', 'f', 'g', 'h', 'i'][l] || '?'}
      </Text>

      {/* Magnetic quantum number indicator */}
      <mesh position={[-2.5, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 8]} />
        <meshStandardMaterial color="#feca57" />
      </mesh>
      <Text position={[-2.5, -0.8, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        mₗ={ml}
      </Text>

      {/* Spin quantum number indicator */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={ms > 0 ? "#ff9ff3" : "#54a0ff"} />
      </mesh>
      <Text position={[0, 3, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        mₛ={ms > 0 ? '+½' : '-½'}
      </Text>

      {/* Energy level rings - Now responsive to n */}
      {Array.from({ length: n }, (_, i) => {
        const radius = (i + 1) * 1.8;
        return (
          <mesh key={i} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius, radius + 0.05, 64]} />
            <meshStandardMaterial 
              color={i + 1 === n ? "#4ecdc4" : "#a0aec0"} 
              transparent 
              opacity={i + 1 === n ? 0.8 : 0.3}
            />
          </mesh>
        );
      })}

      {/* Connection Lines */}
      <mesh position={[1.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 2.5, 8]} />
        <meshStandardMaterial color="#a0aec0" />
      </mesh>
      <mesh position={[0, 1.25, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2.5, 8]} />
        <meshStandardMaterial color="#a0aec0" />
      </mesh>

      {/* Quantum number summary */}
      <Text position={[0, -3, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        n={n}, l={l}, mₗ={ml}, mₛ={ms > 0 ? '+½' : '-½'}
      </Text>
    </group>
  );
};

// Orbital Shapes Visualization
const OrbitalShapesVisualization: React.FC<{ orbitalType: string; setOrbitalType: any }> = ({ orbitalType, setOrbitalType }) => {
  const orbitalRef = useRef<THREE.Group>(null);
  const [time, setTime] = useState(0);

  useFrame(() => {
    setTime(prev => prev + 0.01);
    if (orbitalRef.current) {
      orbitalRef.current.rotation.y += 0.005;
    }
  });

  const renderOrbital = () => {
    switch (orbitalType) {
      case 's':
        return (
          <mesh>
            <sphereGeometry args={[2, 32, 32]} />
            <meshStandardMaterial color="#4ecdc4" transparent opacity={0.6} />
          </mesh>
        );
      case 'p':
        return (
          <group>
            <mesh position={[2, 0, 0]}>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshStandardMaterial color="#ff6b6b" transparent opacity={0.6} />
            </mesh>
            <mesh position={[-2, 0, 0]}>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshStandardMaterial color="#ff6b6b" transparent opacity={0.6} />
            </mesh>
            {/* Connection between lobes */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
              <meshStandardMaterial color="#ff6b6b" transparent opacity={0.4} />
            </mesh>
          </group>
        );
      case 'd':
        return (
          <group>
            {/* d-orbital cloverleaf pattern */}
            <mesh position={[1.8, 0, 0]}>
              <sphereGeometry args={[0.8, 16, 16]} />
              <meshStandardMaterial color="#feca57" transparent opacity={0.6} />
            </mesh>
            <mesh position={[-1.8, 0, 0]}>
              <sphereGeometry args={[0.8, 16, 16]} />
              <meshStandardMaterial color="#feca57" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, 0, 1.8]}>
              <sphereGeometry args={[0.8, 16, 16]} />
              <meshStandardMaterial color="#feca57" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, 0, -1.8]}>
              <sphereGeometry args={[0.8, 16, 16]} />
              <meshStandardMaterial color="#feca57" transparent opacity={0.6} />
            </mesh>
            {/* Central node */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#feca57" transparent opacity={0.4} />
            </mesh>
          </group>
        );
      case 'f':
        return (
          <group>
            {/* f-orbital complex pattern */}
            <mesh position={[2, 0, 0]}>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial color="#ab47bc" transparent opacity={0.6} />
            </mesh>
            <mesh position={[-2, 0, 0]}>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial color="#ab47bc" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial color="#ab47bc" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, -2, 0]}>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial color="#ab47bc" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, 0, 2]}>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial color="#ab47bc" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, 0, -2]}>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial color="#ab47bc" transparent opacity={0.6} />
            </mesh>
            <mesh position={[1.4, 1.4, 0]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial color="#ab47bc" transparent opacity={0.6} />
            </mesh>
            <mesh position={[-1.4, -1.4, 0]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial color="#ab47bc" transparent opacity={0.6} />
            </mesh>
          </group>
        );
      default:
        return (
          <mesh>
            <sphereGeometry args={[2, 32, 32]} />
            <meshStandardMaterial color="#4ecdc4" transparent opacity={0.6} />
          </mesh>
        );
    }
  };

  return (
    <group ref={orbitalRef}>
      {renderOrbital()}
      <Text position={[0, -3, 0]} fontSize={0.5} color="#2d3748" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        {orbitalType.toUpperCase()} Orbital
      </Text>
    </group>
  );
};

// Advanced Electron Configuration Visualization
const ElectronConfigVisualization: React.FC<{ element: string }> = ({ element }) => {
  const config = getElectronConfig(element);
  const atomicNumber = getAtomicNumber(element);
  const groupRef = useRef<THREE.Group>(null);
  const [time, setTime] = useState(0);

  useFrame(() => {
    setTime(prev => prev + 0.01);
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  // Advanced orbital visualization with proper quantum mechanics
  const renderAdvancedOrbitals = () => {
    const orbitalData = [
      { n: 1, l: 0, type: 's', electrons: Math.min(2, atomicNumber), radius: 1.5, color: '#ff6b6b' },
      { n: 2, l: 0, type: 's', electrons: Math.min(2, Math.max(0, atomicNumber - 2)), radius: 2.5, color: '#4ecdc4' },
      { n: 2, l: 1, type: 'p', electrons: Math.min(6, Math.max(0, atomicNumber - 4)), radius: 2.5, color: '#45b7d1' },
      { n: 3, l: 0, type: 's', electrons: Math.min(2, Math.max(0, atomicNumber - 10)), radius: 3.5, color: '#96ceb4' },
      { n: 3, l: 1, type: 'p', electrons: Math.min(6, Math.max(0, atomicNumber - 12)), radius: 3.5, color: '#feca57' },
      { n: 3, l: 2, type: 'd', electrons: Math.min(10, Math.max(0, atomicNumber - 18)), radius: 3.5, color: '#ff9ff3' }
    ];

    return orbitalData.map((orbital, index) => {
      if (orbital.electrons === 0) return null;
      
      return (
        <group key={`${orbital.n}${orbital.type}`}>
          {/* Orbital Shape */}
          {orbital.type === 's' && (
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[orbital.radius, 32, 32]} />
              <meshStandardMaterial 
                color={orbital.color}
                transparent 
                opacity={0.3}
                emissive={orbital.color}
                emissiveIntensity={0.2}
              />
            </mesh>
          )}
          
          {orbital.type === 'p' && (
            <>
              {/* px orbital */}
              <mesh position={[orbital.radius, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <sphereGeometry args={[orbital.radius * 0.6, 16, 16]} />
                <meshStandardMaterial 
                  color={orbital.color}
                  transparent 
                  opacity={0.4}
                  emissive={orbital.color}
                  emissiveIntensity={0.3}
                />
              </mesh>
              {/* py orbital */}
              <mesh position={[0, orbital.radius, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <sphereGeometry args={[orbital.radius * 0.6, 16, 16]} />
                <meshStandardMaterial 
                  color={orbital.color}
                  transparent 
                  opacity={0.4}
                  emissive={orbital.color}
                  emissiveIntensity={0.3}
                />
              </mesh>
              {/* pz orbital */}
              <mesh position={[0, 0, orbital.radius]}>
                <sphereGeometry args={[orbital.radius * 0.6, 16, 16]} />
                <meshStandardMaterial 
                  color={orbital.color}
                  transparent 
                  opacity={0.4}
                  emissive={orbital.color}
                  emissiveIntensity={0.3}
                />
              </mesh>
            </>
          )}
          
          {orbital.type === 'd' && (
            <>
              {/* dxy orbital */}
              <mesh position={[orbital.radius * 0.7, orbital.radius * 0.7, 0]} rotation={[0, 0, Math.PI / 4]}>
                <sphereGeometry args={[orbital.radius * 0.4, 16, 16]} />
                <meshStandardMaterial 
                  color={orbital.color}
                  transparent 
                  opacity={0.3}
                  emissive={orbital.color}
                  emissiveIntensity={0.2}
                />
              </mesh>
              {/* dxz orbital */}
              <mesh position={[orbital.radius * 0.7, 0, orbital.radius * 0.7]} rotation={[0, Math.PI / 4, 0]}>
                <sphereGeometry args={[orbital.radius * 0.4, 16, 16]} />
                <meshStandardMaterial 
                  color={orbital.color}
                  transparent 
                  opacity={0.3}
                  emissive={orbital.color}
                  emissiveIntensity={0.2}
                />
              </mesh>
              {/* dyz orbital */}
              <mesh position={[0, orbital.radius * 0.7, orbital.radius * 0.7]} rotation={[Math.PI / 4, 0, 0]}>
                <sphereGeometry args={[orbital.radius * 0.4, 16, 16]} />
                <meshStandardMaterial 
                  color={orbital.color}
                  transparent 
                  opacity={0.3}
                  emissive={orbital.color}
                  emissiveIntensity={0.2}
                />
              </mesh>
            </>
          )}

          {/* Electrons with Spin */}
          {Array.from({ length: orbital.electrons }, (_, i) => {
            const angle = (i / orbital.electrons) * Math.PI * 2 + time * 0.5;
            const x = Math.cos(angle) * orbital.radius;
            const z = Math.sin(angle) * orbital.radius;
            const spin = i % 2 === 0 ? 1 : -1; // Up/down spin
            
            return (
              <group key={i} position={[x, 0, z]}>
                <mesh>
                  <sphereGeometry args={[0.12, 16, 16]} />
                  <meshStandardMaterial 
                    color={orbital.color}
                    emissive={orbital.color}
                    emissiveIntensity={0.8}
                    metalness={0.5}
                    roughness={0.1}
                  />
                </mesh>
                {/* Spin Arrow */}
                <mesh position={[0, spin * 0.2, 0]} rotation={[0, 0, spin * Math.PI / 2]}>
                  <coneGeometry args={[0.05, 0.2, 8]} />
                  <meshStandardMaterial color={spin > 0 ? '#00ff00' : '#ff0000'} />
                </mesh>
              </group>
            );
          })}
          
          {/* Orbital Label */}
          <Text position={[orbital.radius + 0.8, 0, 0]} fontSize={0.18} color="white" anchorX="center" anchorY="middle">
            {orbital.n}{orbital.type}{orbital.electrons}
          </Text>
        </group>
      );
    });
  };
  
  return (
    <group ref={groupRef}>
      {/* Nucleus */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#ff6b6b" emissive="#ff4757" emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, 0, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        {element}
      </Text>
      <Text position={[0, -0.6, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Z={atomicNumber}
      </Text>

      {/* Electron shells */}
      {[1, 2, 3, 4].map(n => {
        const radius = n * 1.5;
        const maxElectrons = 2 * n * n;
        const electronsInShell = Math.min(atomicNumber - (n - 1) * 2, maxElectrons);
        
        if (electronsInShell <= 0) return null;

        return (
          <mesh key={n} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius, radius + 0.05, 64]} />
            <meshStandardMaterial 
              color={n === 1 ? "#ff6b6b" : n === 2 ? "#4ecdc4" : n === 3 ? "#feca57" : "#ab47bc"} 
              transparent 
              opacity={0.6}
            />
          </mesh>
        );
      })}

      {/* Electrons */}
      {renderAdvancedOrbitals()}

      {/* Element Info */}
      <Text position={[0, -5, 0]} fontSize={0.4} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        {element} (Z={atomicNumber})
      </Text>
      <Text position={[0, -5.5, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Total: {atomicNumber} e⁻
      </Text>
      
      {config.map((shell, shellIndex) => (
        <group key={shellIndex} position={[shellIndex * 3, 0, 0]}>
          <mesh>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#4ecdc4" transparent opacity={0.2} />
          </mesh>
          <Text position={[0, 0, 0]} fontSize={0.3} color="#2d3748" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
            {shellIndex + 1}
          </Text>
          <Text position={[0, -1.5, 0]} fontSize={0.2} color="#2d3748" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
            {shell.electrons} e⁻
          </Text>
        </group>
      ))}
    </group>
  );
};

// Advanced Atomic Spectra Visualization with Real Data
const AtomicSpectraVisualization: React.FC<{ element: string }> = ({ element }) => {
  const spectrumRef = useRef<THREE.Group>(null);
  const atomicNumber = getAtomicNumber(element);
  const [time, setTime] = useState(0);
  const [selectedTransition, setSelectedTransition] = useState(0);
  const [spectrumType, setSpectrumType] = useState<'emission' | 'absorption'>('emission');

  useFrame(() => {
    setTime(prev => prev + 0.01);
    if (spectrumRef.current) {
      spectrumRef.current.rotation.y += 0.002;
    }
  });

  // Real spectral data with actual wavelengths and intensities
  const getRealSpectralData = (element: string) => {
    const spectralData: { [key: string]: { 
      emission: Array<{wavelength: number, intensity: number, transition: string, color: string}>,
      absorption: Array<{wavelength: number, intensity: number, transition: string, color: string}>
    }} = {
      'H': {
        emission: [
          { wavelength: 656.3, intensity: 1.0, transition: '3→2', color: '#ff0000' }, // Hα
          { wavelength: 486.1, intensity: 0.8, transition: '4→2', color: '#00ff00' }, // Hβ
          { wavelength: 434.0, intensity: 0.6, transition: '5→2', color: '#0080ff' }, // Hγ
          { wavelength: 410.2, intensity: 0.4, transition: '6→2', color: '#8000ff' }, // Hδ
          { wavelength: 397.0, intensity: 0.3, transition: '7→2', color: '#ff00ff' }, // Hε
          { wavelength: 121.6, intensity: 0.9, transition: '2→1', color: '#ffffff' }, // Lyman α (UV)
          { wavelength: 102.6, intensity: 0.7, transition: '3→1', color: '#ffffff' }, // Lyman β (UV)
        ],
        absorption: [
          { wavelength: 656.3, intensity: 0.8, transition: '2→3', color: '#ff0000' },
          { wavelength: 486.1, intensity: 0.6, transition: '2→4', color: '#00ff00' },
          { wavelength: 434.0, intensity: 0.4, transition: '2→5', color: '#0080ff' },
        ]
      },
      'He': {
        emission: [
          { wavelength: 587.6, intensity: 1.0, transition: '3d→2p', color: '#ffff00' }, // D3 line
          { wavelength: 447.1, intensity: 0.8, transition: '4d→2p', color: '#00ffff' },
          { wavelength: 402.6, intensity: 0.6, transition: '5d→2p', color: '#ff00ff' },
          { wavelength: 388.9, intensity: 0.4, transition: '6d→2p', color: '#ff8000' },
          { wavelength: 1083.0, intensity: 0.9, transition: '2p→2s', color: '#ff0000' }, // IR
        ],
        absorption: [
          { wavelength: 587.6, intensity: 0.7, transition: '2p→3d', color: '#ffff00' },
          { wavelength: 447.1, intensity: 0.5, transition: '2p→4d', color: '#00ffff' },
        ]
      },
      'Li': {
        emission: [
          { wavelength: 670.8, intensity: 1.0, transition: '2p→2s', color: '#ff0000' }, // D1 line
          { wavelength: 610.4, intensity: 0.8, transition: '3p→2s', color: '#ff8000' },
          { wavelength: 460.3, intensity: 0.6, transition: '4p→2s', color: '#00ff00' },
          { wavelength: 413.3, intensity: 0.4, transition: '5p→2s', color: '#0080ff' },
        ],
        absorption: [
          { wavelength: 670.8, intensity: 0.8, transition: '2s→2p', color: '#ff0000' },
          { wavelength: 610.4, intensity: 0.6, transition: '2s→3p', color: '#ff8000' },
        ]
      },
      'Na': {
        emission: [
          { wavelength: 589.0, intensity: 1.0, transition: '3p→3s', color: '#ffff00' }, // D1 line
          { wavelength: 589.6, intensity: 1.0, transition: '3p→3s', color: '#ffff00' }, // D2 line
          { wavelength: 330.3, intensity: 0.8, transition: '4p→3s', color: '#ff0000' },
          { wavelength: 285.3, intensity: 0.6, transition: '5p→3s', color: '#ff8000' },
        ],
        absorption: [
          { wavelength: 589.0, intensity: 0.9, transition: '3s→3p', color: '#ffff00' },
          { wavelength: 589.6, intensity: 0.9, transition: '3s→3p', color: '#ffff00' },
        ]
      }
    };
    
    return spectralData[element] || spectralData['H'];
  };

  const spectralData = getRealSpectralData(element);
  const currentSpectrum = spectralData[spectrumType];

  return (
    <group ref={spectrumRef}>
      {/* Central Atom */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#ff6b6b" emissive="#ff4757" emissiveIntensity={0.5} />
      </mesh>
      
      <Text position={[0, 0, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        {element}
      </Text>
      <Text position={[0, -0.8, 0]} fontSize={0.15} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Z={atomicNumber}
      </Text>

      {/* Energy Level Rings */}
      {[1, 2, 3, 4, 5].map((level, i) => (
        <mesh key={level} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[level * 0.8, level * 0.8 + 0.05, 64]} />
          <meshStandardMaterial 
            color={level === selectedTransition + 2 ? "#ffff00" : "#4ecdc4"}
            transparent 
            opacity={level === selectedTransition + 2 ? 0.8 : 0.3}
            emissive={level === selectedTransition + 2 ? "#ffff00" : "#4ecdc4"}
            emissiveIntensity={level === selectedTransition + 2 ? 0.5 : 0.1}
          />
        </mesh>
      ))}

      {/* Advanced Spectral Lines with Real Data */}
      {currentSpectrum.map((line, i) => {
        const angle = (i / currentSpectrum.length) * Math.PI * 2 + time * 0.05;
        const radius = 4 + i * 0.4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const height = line.intensity * 1.5;
        const isSelected = i === selectedTransition;
        
        return (
          <group key={i}>
            {/* Spectral Line Bar */}
            <mesh position={[x, 0, z]} rotation={[0, angle, 0]}>
              <cylinderGeometry args={[0.15, 0.15, height, 8]} />
              <meshStandardMaterial 
                color={line.color} 
                emissive={line.color} 
                emissiveIntensity={isSelected ? 0.8 : 0.4}
                metalness={0.5}
                roughness={0.1}
              />
            </mesh>
            
            {/* Wavelength Label */}
            <Text position={[x, height/2 + 0.3, z]} fontSize={0.12} color="white" anchorX="center" anchorY="middle">
              {line.wavelength}nm
            </Text>
            
            {/* Transition Label */}
            <Text position={[x, -height/2 - 0.3, z]} fontSize={0.1} color="#a0aec0" anchorX="center" anchorY="middle">
              {line.transition}
            </Text>
            
            {/* Intensity Indicator */}
            <mesh position={[x + 0.3, 0, z]}>
              <sphereGeometry args={[line.intensity * 0.1, 8, 8]} />
              <meshStandardMaterial 
                color={line.color} 
                emissive={line.color} 
                emissiveIntensity={0.6}
              />
            </mesh>
          </group>
        );
      })}

      {/* Advanced Information Display */}
      <group position={[0, -5, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.35} color="white" anchorX="center" anchorY="middle">
          {element} {spectrumType === 'emission' ? 'Emission' : 'Absorption'} Spectrum
        </Text>
        
        <Text position={[0, -0.5, 0]} fontSize={0.2} color="#4ecdc4" anchorX="center" anchorY="middle">
          Z={atomicNumber} | {currentSpectrum.length} spectral lines
        </Text>
        
        {currentSpectrum[selectedTransition] && (
          <Text position={[0, -1, 0]} fontSize={0.18} color="#a0aec0" anchorX="center" anchorY="middle">
            Selected: {currentSpectrum[selectedTransition].wavelength}nm ({currentSpectrum[selectedTransition].transition})
          </Text>
        )}
        
        <Text position={[0, -1.5, 0]} fontSize={0.15} color="#a0aec0" anchorX="center" anchorY="middle">
          {spectrumType === 'emission' ? 'Electrons falling to lower energy levels' : 'Electrons absorbing photons'}
        </Text>
      </group>
    </group>
  );
};

// Advanced Uncertainty Principle with Dynamic Wave Packet Visualization
const UncertaintyVisualization: React.FC = () => {
  const wavePacketRef = useRef<THREE.Group>(null);
  const [time, setTime] = useState(0);
  const [positionUncertainty, setPositionUncertainty] = useState(1.0);
  const [momentumUncertainty, setMomentumUncertainty] = useState(1.0);
  const [wavePacketWidth, setWavePacketWidth] = useState(2.0);

  useFrame(() => {
    setTime(prev => prev + 0.02);
    if (wavePacketRef.current) {
      wavePacketRef.current.rotation.y += 0.001;
    }
  });

  // Calculate Heisenberg uncertainty: Δx * Δp ≥ ℏ/2
  const hbar = 1.055e-34; // Reduced Planck constant
  const uncertaintyProduct = positionUncertainty * momentumUncertainty;
  const minimumUncertainty = hbar / 2;
  const uncertaintyRatio = uncertaintyProduct / minimumUncertainty;

  // Generate wave packet points
  const generateWavePacket = () => {
    const points = [];
    const numPoints = 100;
    const sigma = positionUncertainty * 0.5; // Standard deviation
    
    for (let i = 0; i < numPoints; i++) {
      const x = (i - numPoints / 2) * 0.1;
      const amplitude = Math.exp(-(x * x) / (2 * sigma * sigma));
      const phase = time * 2 + x * momentumUncertainty * 0.1;
      const y = amplitude * Math.cos(phase);
      points.push(new THREE.Vector3(x, y, 0));
    }
    return points;
  };

  const wavePacketPoints = generateWavePacket();

  return (
    <group ref={wavePacketRef}>
      {/* Position Uncertainty Visualization */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[positionUncertainty * 0.8, 32, 32]} />
        <meshStandardMaterial 
          color="#ff6b6b" 
          transparent 
          opacity={0.3}
          emissive="#ff4757"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Momentum Uncertainty Visualization */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[momentumUncertainty * 0.6, 32, 32]} />
        <meshStandardMaterial 
          color="#4ecdc4" 
          transparent 
          opacity={0.4}
          emissive="#26d0ce"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Dynamic Wave Packet */}
      <group position={[0, 0, 0]}>
        {wavePacketPoints.map((point, i) => (
          <mesh key={i} position={[point.x, point.y, point.z]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial 
              color={point.y > 0 ? "#00ff00" : "#ff0000"}
              emissive={point.y > 0 ? "#00ff00" : "#ff0000"}
              emissiveIntensity={Math.abs(point.y) * 0.5}
            />
          </mesh>
        ))}
        
        {/* Wave Packet Envelope */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[positionUncertainty * 0.5, positionUncertainty * 0.5, 0.1, 32]} />
          <meshStandardMaterial 
            color="#ffff00" 
            transparent 
            opacity={0.2}
            emissive="#ffff00"
            emissiveIntensity={0.1}
          />
        </mesh>
      </group>

      {/* Uncertainty Product Indicator */}
      <group position={[0, 2, 0]}>
        <mesh>
          <boxGeometry args={[uncertaintyRatio * 0.5, 0.2, 0.2]} />
          <meshStandardMaterial 
            color={uncertaintyRatio >= 1 ? "#00ff00" : "#ff0000"}
            emissive={uncertaintyRatio >= 1 ? "#00ff00" : "#ff0000"}
            emissiveIntensity={0.5}
          />
        </mesh>
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="white" anchorX="center" anchorY="middle">
          Δx·Δp = {uncertaintyRatio.toFixed(2)} × ℏ/2
        </Text>
      </group>

      {/* Advanced Information Display */}
      <group position={[0, -4, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.35} color="white" anchorX="center" anchorY="middle">
          Heisenberg Uncertainty Principle
        </Text>
        
        <Text position={[0, -0.5, 0]} fontSize={0.2} color="#4ecdc4" anchorX="center" anchorY="middle">
          Δx = {positionUncertainty.toFixed(1)} nm | Δp = {momentumUncertainty.toFixed(1)} × 10⁻²⁵ kg⋅m/s
        </Text>
        
        <Text position={[0, -1, 0]} fontSize={0.18} color="#a0aec0" anchorX="center" anchorY="middle">
          Δx · Δp ≥ ℏ/2 (Fundamental quantum limit)
        </Text>
        
        <Text position={[0, -1.4, 0]} fontSize={0.15} color={uncertaintyRatio >= 1 ? "#00ff00" : "#ff0000"} anchorX="center" anchorY="middle">
          {uncertaintyRatio >= 1 ? "✓ Satisfies uncertainty principle" : "⚠ Violates uncertainty principle"}
        </Text>
        
        <Text position={[0, -1.8, 0]} fontSize={0.12} color="#a0aec0" anchorX="center" anchorY="middle">
          Green dots: positive amplitude | Red dots: negative amplitude
        </Text>
      </group>
    </group>
  );
};

// Advanced Wave Function Visualization with 3D Probability Clouds
const WaveFunctionVisualization: React.FC<{ element: string }> = ({ element }) => {
  const waveRef = useRef<THREE.Group>(null);
  const atomicNumber = getAtomicNumber(element);
  const [time, setTime] = useState(0);
  const [waveType, setWaveType] = useState<'radial' | 'angular' | 'complete'>('radial');

  useFrame(() => {
    setTime(prev => prev + 0.01);
    if (waveRef.current) {
      waveRef.current.rotation.y += 0.002;
    }
  });

  // Generate 3D probability cloud based on quantum numbers
  const generateProbabilityCloud = () => {
    const points: Array<{x: number, y: number, z: number, intensity: number, phase: number}> = [];
    const numPoints = 200;
    
    for (let i = 0; i < numPoints; i++) {
      const phi = (i / numPoints) * Math.PI * 2;
      const theta = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * 3;
      
      // Convert spherical to cartesian
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);
      
      // Calculate probability density based on wave type
      let intensity = 0;
      let phase = 0;
      
      if (waveType === 'radial') {
        // Radial wave function: R(r) = e^(-r/a₀) * r^n
        const a0 = 0.529; // Bohr radius
        intensity = Math.exp(-r / a0) * Math.pow(r, atomicNumber - 1);
        phase = Math.sin(r * atomicNumber + time * 2);
      } else if (waveType === 'angular') {
        // Angular wave function: Y(θ,φ) spherical harmonics
        intensity = Math.abs(Math.sin(theta * atomicNumber) * Math.cos(phi * atomicNumber));
        phase = Math.sin(theta * atomicNumber + phi * atomicNumber + time * 3);
      } else {
        // Complete wave function: ψ(r,θ,φ) = R(r) * Y(θ,φ)
        const a0 = 0.529;
        const radial = Math.exp(-r / a0) * Math.pow(r, atomicNumber - 1);
        const angular = Math.abs(Math.sin(theta * atomicNumber) * Math.cos(phi * atomicNumber));
        intensity = radial * angular;
        phase = Math.sin(r * atomicNumber + theta * atomicNumber + phi * atomicNumber + time * 2);
      }
      
      // Normalize intensity
      intensity = Math.min(intensity * 0.5, 1);
      
      points.push({ x, y, z, intensity, phase });
    }
    
    return points;
  };

  const probabilityCloud = generateProbabilityCloud();

  return (
    <group ref={waveRef}>
      {/* Central nucleus */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#ff6b6b" emissive="#ff4757" emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, 0, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        {element}
      </Text>

      {/* 3D Probability Cloud */}
      {probabilityCloud.map((point, i) => {
        const size = 0.02 + point.intensity * 0.08;
        const color = point.phase > 0 ? "#4ecdc4" : "#ff6b6b";
        const emissiveColor = point.phase > 0 ? "#26d0ce" : "#ff4757";
        
        return (
          <mesh key={i} position={[point.x, point.y, point.z]}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshStandardMaterial 
              color={color}
              emissive={emissiveColor}
              emissiveIntensity={point.intensity * 0.6}
              transparent
              opacity={0.7 + point.intensity * 0.3}
            />
          </mesh>
        );
      })}

      {/* Wave Function Type Indicator */}
      <group position={[0, 3, 0]}>
        <mesh>
          <boxGeometry args={[1, 0.3, 0.3]} />
          <meshStandardMaterial 
            color={waveType === 'radial' ? "#ff6b6b" : waveType === 'angular' ? "#4ecdc4" : "#feca57"}
            emissive={waveType === 'radial' ? "#ff4757" : waveType === 'angular' ? "#26d0ce" : "#ff9f43"}
            emissiveIntensity={0.5}
          />
        </mesh>
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="white" anchorX="center" anchorY="middle">
          {waveType.charAt(0).toUpperCase() + waveType.slice(1)} Wave Function
        </Text>
      </group>

      {/* Advanced Information Display */}
      <group position={[0, -5, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.35} color="white" anchorX="center" anchorY="middle">
          {element} - Quantum Wave Function
        </Text>
        
        <Text position={[0, -0.5, 0]} fontSize={0.2} color="#4ecdc4" anchorX="center" anchorY="middle">
          Z = {atomicNumber} | ψ(r,θ,φ) = R(r) × Y(θ,φ)
        </Text>
        
        <Text position={[0, -1, 0]} fontSize={0.18} color="#a0aec0" anchorX="center" anchorY="middle">
          {waveType === 'radial' ? 'R(r): Radial probability distribution' : 
           waveType === 'angular' ? 'Y(θ,φ): Angular probability distribution' : 
           'Complete wave function: ψ(r,θ,φ)'}
        </Text>
        
        <Text position={[0, -1.4, 0]} fontSize={0.15} color="#a0aec0" anchorX="center" anchorY="middle">
          Blue dots: positive phase | Red dots: negative phase
        </Text>
        
        <Text position={[0, -1.8, 0]} fontSize={0.12} color="#a0aec0" anchorX="center" anchorY="middle">
          Size ∝ probability density | |ψ|² = probability of finding electron
        </Text>
      </group>
    </group>
  );
};

// Advanced Periodic Trends Visualization with Real Data
const PeriodicTrendsVisualization: React.FC = () => {
  const trendsRef = useRef<THREE.Group>(null);
  const [time, setTime] = useState(0);
  const [trendType, setTrendType] = useState<'ionization' | 'radius' | 'electronegativity' | 'electron-affinity'>('ionization');
  const [selectedElement, setSelectedElement] = useState(0);

  useFrame(() => {
    setTime(prev => prev + 0.01);
    if (trendsRef.current) {
      trendsRef.current.rotation.y += 0.001;
    }
  });

  // Comprehensive element data with real periodic trends
  const elements = [
    { symbol: 'H', z: 1, name: 'Hydrogen', radius: 0.53, ionization: 13.6, electronegativity: 2.2, electronAffinity: 0.75, color: '#ff6b6b' },
    { symbol: 'He', z: 2, name: 'Helium', radius: 0.31, ionization: 24.6, electronegativity: 0, electronAffinity: 0, color: '#4ecdc4' },
    { symbol: 'Li', z: 3, name: 'Lithium', radius: 1.67, ionization: 5.4, electronegativity: 0.98, electronAffinity: 0.62, color: '#45b7d1' },
    { symbol: 'Be', z: 4, name: 'Beryllium', radius: 1.12, ionization: 9.3, electronegativity: 1.57, electronAffinity: 0, color: '#96ceb4' },
    { symbol: 'B', z: 5, name: 'Boron', radius: 0.87, ionization: 8.3, electronegativity: 2.04, electronAffinity: 0.28, color: '#feca57' },
    { symbol: 'C', z: 6, name: 'Carbon', radius: 0.67, ionization: 11.3, electronegativity: 2.55, electronAffinity: 1.26, color: '#ff9ff3' },
    { symbol: 'N', z: 7, name: 'Nitrogen', radius: 0.56, ionization: 14.5, electronegativity: 3.04, electronAffinity: 0, color: '#a8e6cf' },
    { symbol: 'O', z: 8, name: 'Oxygen', radius: 0.48, ionization: 13.6, electronegativity: 3.44, electronAffinity: 1.46, color: '#ffd93d' },
    { symbol: 'F', z: 9, name: 'Fluorine', radius: 0.42, ionization: 17.4, electronegativity: 3.98, electronAffinity: 3.40, color: '#6c5ce7' },
    { symbol: 'Ne', z: 10, name: 'Neon', radius: 0.38, ionization: 21.6, electronegativity: 0, electronAffinity: 0, color: '#fd79a8' },
    { symbol: 'Na', z: 11, name: 'Sodium', radius: 1.90, ionization: 5.1, electronegativity: 0.93, electronAffinity: 0.55, color: '#fdcb6e' },
    { symbol: 'Mg', z: 12, name: 'Magnesium', radius: 1.45, ionization: 7.6, electronegativity: 1.31, electronAffinity: 0, color: '#e17055' },
    { symbol: 'Al', z: 13, name: 'Aluminum', radius: 1.18, ionization: 6.0, electronegativity: 1.61, electronAffinity: 0.44, color: '#74b9ff' },
    { symbol: 'Si', z: 14, name: 'Silicon', radius: 1.11, ionization: 8.2, electronegativity: 1.90, electronAffinity: 1.39, color: '#a29bfe' },
    { symbol: 'P', z: 15, name: 'Phosphorus', radius: 0.98, ionization: 10.5, electronegativity: 2.19, electronAffinity: 0.75, color: '#fd79a8' },
    { symbol: 'S', z: 16, name: 'Sulfur', radius: 0.88, ionization: 10.4, electronegativity: 2.58, electronAffinity: 2.08, color: '#fdcb6e' },
    { symbol: 'Cl', z: 17, name: 'Chlorine', radius: 0.79, ionization: 13.0, electronegativity: 3.16, electronAffinity: 3.61, color: '#6c5ce7' },
    { symbol: 'Ar', z: 18, name: 'Argon', radius: 0.71, ionization: 15.8, electronegativity: 0, electronAffinity: 0, color: '#fd79a8' }
  ];

  // Get trend value for current trend type
  const getTrendValue = (element: any) => {
    switch (trendType) {
      case 'ionization': return element.ionization;
      case 'radius': return element.radius;
      case 'electronegativity': return element.electronegativity;
      case 'electron-affinity': return element.electronAffinity;
      default: return element.ionization;
    }
  };

  // Normalize trend values for visualization
  const maxValue = Math.max(...elements.map(getTrendValue));
  const minValue = Math.min(...elements.map(getTrendValue));

  return (
    <group ref={trendsRef}>
      {/* Advanced Periodic Table with Interactive Trends */}
      {elements.map((element, i) => {
        const x = (i % 6) * 2.5 - 6.25;
        const z = Math.floor(i / 6) * 2.5 - 2.5;
        const trendValue = getTrendValue(element);
        const normalizedValue = (trendValue - minValue) / (maxValue - minValue);
        
        // Dynamic visualization based on trend type
        let height = 0;
        let size = 0.3;
        let color = element.color;
        
        switch (trendType) {
          case 'ionization':
            height = normalizedValue * 2;
            size = 0.2 + normalizedValue * 0.3;
            color = `hsl(${120 + normalizedValue * 120}, 70%, 60%)`; // Green to red
            break;
          case 'radius':
            height = 0.5;
            size = 0.1 + normalizedValue * 0.4;
            color = `hsl(${240 - normalizedValue * 120}, 70%, 60%)`; // Blue to red
            break;
          case 'electronegativity':
            height = normalizedValue * 1.5;
            size = 0.2 + normalizedValue * 0.2;
            color = `hsl(${60 + normalizedValue * 180}, 80%, 60%)`; // Yellow to purple
            break;
          case 'electron-affinity':
            height = normalizedValue * 1.8;
            size = 0.15 + normalizedValue * 0.25;
            color = `hsl(${180 + normalizedValue * 120}, 70%, 60%)`; // Cyan to orange
            break;
        }
        
        const isSelected = i === selectedElement;
        const pulseScale = isSelected ? 1 + Math.sin(time * 5) * 0.1 : 1;
        
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Element Bar */}
            <mesh position={[0, height/2, 0]} scale={[1, 1, pulseScale]}>
              <cylinderGeometry args={[0.15, 0.15, height, 8]} />
              <meshStandardMaterial 
                color={color}
                emissive={color}
                emissiveIntensity={0.3}
                metalness={0.5}
                roughness={0.2}
              />
            </mesh>
            
            {/* Element Sphere */}
            <mesh position={[0, height + 0.3, 0]} scale={[size, size, size]}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshStandardMaterial 
                color={element.color}
                emissive={element.color}
                emissiveIntensity={0.5}
                metalness={0.8}
                roughness={0.1}
              />
            </mesh>
            
            {/* Element Labels */}
            <Text position={[0, height + 0.8, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">
              {element.symbol}
            </Text>
            <Text position={[0, height + 0.5, 0]} fontSize={0.12} color="#a0aec0" anchorX="center" anchorY="middle">
              {element.z}
            </Text>
            
            {/* Trend Value Display */}
            <Text position={[0, -0.3, 0]} fontSize={0.1} color="white" anchorX="center" anchorY="middle">
              {trendValue.toFixed(1)}
            </Text>
            
            {/* Selection Indicator */}
            {isSelected && (
              <mesh position={[0, height + 0.3, 0]}>
                <ringGeometry args={[size + 0.1, size + 0.15, 16]} />
                <meshStandardMaterial 
                  color="#ffff00" 
                  emissive="#ffff00"
                  emissiveIntensity={0.8}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Trend Type Indicator */}
      <group position={[0, 4, 0]}>
        <mesh>
          <boxGeometry args={[2, 0.4, 0.4]} />
          <meshStandardMaterial 
            color={trendType === 'ionization' ? "#ff6b6b" : 
                   trendType === 'radius' ? "#4ecdc4" : 
                   trendType === 'electronegativity' ? "#feca57" : "#ff9ff3"}
            emissive={trendType === 'ionization' ? "#ff4757" : 
                     trendType === 'radius' ? "#26d0ce" : 
                     trendType === 'electronegativity' ? "#ff9f43" : "#ff6b6b"}
            emissiveIntensity={0.5}
          />
        </mesh>
        <Text position={[0, 0.6, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">
          {trendType.charAt(0).toUpperCase() + trendType.slice(1).replace('-', ' ')} Trend
        </Text>
      </group>

      {/* Advanced Information Display */}
      <group position={[0, -6, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">
          Periodic Trends Analysis
        </Text>
        
        <Text position={[0, -0.6, 0]} fontSize={0.25} color="#4ecdc4" anchorX="center" anchorY="middle">
          {elements[selectedElement]?.name} ({elements[selectedElement]?.symbol}) - Z = {elements[selectedElement]?.z}
        </Text>
        
        <Text position={[0, -1.1, 0]} fontSize={0.2} color="#a0aec0" anchorX="center" anchorY="middle">
          {trendType}: {getTrendValue(elements[selectedElement])?.toFixed(2)} 
          {trendType === 'ionization' ? ' eV' : 
           trendType === 'radius' ? ' Å' : 
           trendType === 'electronegativity' ? ' (Pauling)' : ' eV'}
        </Text>
        
        <Text position={[0, -1.6, 0]} fontSize={0.15} color="#a0aec0" anchorX="center" anchorY="middle">
          {trendType === 'ionization' ? 'Energy required to remove outermost electron' :
           trendType === 'radius' ? 'Size of atom (atomic radius)' :
           trendType === 'electronegativity' ? 'Ability to attract electrons in bonds' :
           'Energy released when electron is added'}
        </Text>
        
        <Text position={[0, -2.1, 0]} fontSize={0.12} color="#a0aec0" anchorX="center" anchorY="middle">
          Click elements to explore | Height/Size ∝ trend value | Color indicates magnitude
        </Text>
      </group>
    </group>
  );
};

// Photoelectric Effect Visualization
const PhotoelectricVisualization: React.FC = () => {
  const photonRef = useRef<THREE.Group>(null);
  const electronRef = useRef<THREE.Group>(null);
  const [time, setTime] = useState(0);
  const [photonFrequency, setPhotonFrequency] = useState(5.0);
  const [photonIntensity, setPhotonIntensity] = useState(5.0);

  useFrame(() => {
    setTime(prev => prev + 0.01);
    
    if (photonRef.current) {
      photonRef.current.position.x += 0.1 * photonIntensity * 0.2;
      if (photonRef.current.position.x > 5) {
        photonRef.current.position.x = -5;
      }
    }
    
    if (electronRef.current) {
      // Electron ejection based on frequency threshold
      if (photonFrequency > 3.0) { // Threshold frequency
        electronRef.current.position.y += 0.05 * photonFrequency * 0.1;
        if (electronRef.current.position.y > 3) {
          electronRef.current.position.y = -2;
        }
      }
    }
  });

  return (
    <group>
      {/* Metal Surface */}
      <mesh position={[0, -2, 0]}>
        <boxGeometry args={[4, 0.2, 2]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
      
      {/* Photon - Now with frequency-based color and intensity */}
      <group ref={photonRef} position={[-5, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.1 + photonIntensity * 0.02, 8, 8]} />
          <meshStandardMaterial 
            color={new THREE.Color().setHSL(photonFrequency / 10, 1, 0.5)} 
            emissive={new THREE.Color().setHSL(photonFrequency / 10, 1, 0.3)}
            emissiveIntensity={photonIntensity * 0.1}
          />
        </mesh>
        {/* Photon trail */}
        <mesh position={[-0.5, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshStandardMaterial 
            color={new THREE.Color().setHSL(photonFrequency / 10, 1, 0.5)} 
            transparent 
            opacity={0.6}
          />
        </mesh>
      </group>
      
      {/* Ejected Electron - Now with kinetic energy based on frequency */}
      <group ref={electronRef} position={[0, -2, 0]}>
        <mesh>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial 
            color="#4ecdc4" 
            emissive="#26d0ce" 
            emissiveIntensity={photonFrequency > 3.0 ? 0.5 : 0.1}
          />
        </mesh>
        {/* Electron trail */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 1, 8]} />
          <meshStandardMaterial color="#4ecdc4" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Frequency and Intensity Display */}
      <Text position={[0, 3, 0]} fontSize={0.4} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Photoelectric Effect
      </Text>
      <Text position={[0, 2.5, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        ν = {photonFrequency.toFixed(1)} × 10¹⁴ Hz
      </Text>
      <Text position={[0, 2, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        I = {photonIntensity.toFixed(1)} W/m²
      </Text>
      <Text position={[0, 1.5, 0]} fontSize={0.25} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        {photonFrequency > 3.0 ? 'Electron Ejected!' : 'Below Threshold'}
      </Text>
    </group>
  );
};

// de Broglie Waves Visualization
const DeBroglieVisualization: React.FC<{ element: string }> = ({ element }) => {
  const waveRef = useRef<THREE.Group>(null);
  const atomicNumber = getAtomicNumber(element);
  const [time, setTime] = useState(0);

  useFrame(() => {
    setTime(prev => prev + 0.01);
    if (waveRef.current) {
      waveRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={waveRef}>
      {/* Matter Wave */}
      {Array.from({ length: 50 }, (_, i) => {
        const x = (i / 50) * 6 - 3;
        const y = Math.sin(x * 3 + time * 2) * 0.5;
        const z = Math.cos(x * 3 + time * 2) * 0.5;
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#4ecdc4" emissive="#26d0ce" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
      
      <Text position={[0, -3, 0]} fontSize={0.4} color="#2d3748" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        λ = h/mv ({element})
      </Text>
    </group>
  );
};

// Zeeman Effect Visualization
const ZeemanEffectVisualization: React.FC<{ element: string }> = ({ element }) => {
  const spectrumRef = useRef<THREE.Group>(null);
  const atomicNumber = getAtomicNumber(element);

  useFrame((state) => {
    if (spectrumRef.current) {
      spectrumRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={spectrumRef}>
      {/* Magnetic Field Lines */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 2;
        const z = Math.sin(angle) * 2;
        
        return (
          <mesh key={i} position={[x, 0, z]}>
            <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
            <meshStandardMaterial color="#ff6b6b" emissive="#ff4757" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
      
      {/* Spectral Lines */}
      {Array.from({ length: 3 }, (_, i) => {
        const y = i * 0.5 - 0.5;
        return (
          <mesh key={i} position={[0, y, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
            <meshStandardMaterial color="#4ecdc4" emissive="#26d0ce" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
      
      <Text position={[0, -3, 0]} fontSize={0.4} color="#2d3748" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Zeeman Effect ({element})
      </Text>
    </group>
  );
};

// Stark Effect Visualization
const StarkEffectVisualization: React.FC<{ element: string }> = ({ element }) => {
  const fieldRef = useRef<THREE.Group>(null);
  const atomicNumber = getAtomicNumber(element);

  useFrame((state) => {
    if (fieldRef.current) {
      fieldRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group ref={fieldRef}>
      {/* Electric Field Lines */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * 2.5;
        const z = Math.sin(angle) * 2.5;
        
        return (
          <mesh key={i} position={[x, 0, z]}>
            <cylinderGeometry args={[0.03, 0.03, 2, 8]} />
            <meshStandardMaterial color="#feca57" emissive="#ff9f43" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
      
      {/* Central Atom */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#4ecdc4" emissive="#26d0ce" emissiveIntensity={0.5} />
      </mesh>
      
      <Text position={[0, -3, 0]} fontSize={0.4} color="#2d3748" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Stark Effect ({element})
      </Text>
    </group>
  );
};

// Hydrogen Spectrum Visualization
const HydrogenSpectrumVisualization: React.FC = () => {
  const spectrumRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (spectrumRef.current) {
      spectrumRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={spectrumRef}>
      {/* Lyman Series (UV) */}
      {Array.from({ length: 3 }, (_, i) => {
        const x = i * 0.8 - 0.8;
        return (
          <mesh key={`lyman-${i}`} position={[x, 1.5, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
            <meshStandardMaterial color="#8e44ad" emissive="#8e44ad" emissiveIntensity={0.5} />
          </mesh>
        );
      })}
      
      {/* Balmer Series (Visible) */}
      {Array.from({ length: 4 }, (_, i) => {
        const x = i * 0.6 - 0.9;
        const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00'];
        return (
          <mesh key={`balmer-${i}`} position={[x, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 2, 8]} />
            <meshStandardMaterial color={colors[i]} emissive={colors[i]} emissiveIntensity={0.5} />
          </mesh>
        );
      })}
      
      {/* Paschen Series (IR) */}
      {Array.from({ length: 3 }, (_, i) => {
        const x = i * 0.7 - 0.7;
        return (
          <mesh key={`paschen-${i}`} position={[x, -1.5, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 2, 8]} />
            <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
      
      <Text position={[0, -3, 0]} fontSize={0.4} color="#2d3748" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Hydrogen Spectrum
      </Text>
    </group>
  );
};

// Orbital Filling Visualization
const OrbitalFillingVisualization: React.FC<{ element: string }> = ({ element }) => {
  const orbitalRef = useRef<THREE.Group>(null);
  const atomicNumber = getAtomicNumber(element);

  useFrame((state) => {
    if (orbitalRef.current) {
      orbitalRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={orbitalRef}>
      {/* Orbital Shells */}
      {Array.from({ length: 4 }, (_, n) => {
        const radius = (n + 1) * 1.5;
        const electrons = Math.min(atomicNumber - n * 2, 2 * (n + 1) * (n + 1));
        
        return (
          <group key={n}>
            <mesh position={[0, 0, 0]}>
              <ringGeometry args={[radius, radius + 0.1, 32]} />
              <meshStandardMaterial color="#4ecdc4" transparent opacity={0.3} />
            </mesh>
            
            {Array.from({ length: Math.min(electrons, 8) }, (_, i) => {
              const angle = (i / Math.max(electrons, 1)) * Math.PI * 2;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              
              return (
                <mesh key={i} position={[x, 0, z]}>
                  <sphereGeometry args={[0.1, 8, 8]} />
                  <meshStandardMaterial color="#ff6b6b" emissive="#ff4757" emissiveIntensity={0.5} />
                </mesh>
              );
            })}
          </group>
        );
      })}
      
      <Text position={[0, -4, 0]} fontSize={0.4} color="#2d3748" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Orbital Filling ({element})
      </Text>
    </group>
  );
};

// Nuclear Model Visualization
const NuclearModelVisualization: React.FC = () => {
  const alphaRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (alphaRef.current) {
      alphaRef.current.position.x += 0.1;
      if (alphaRef.current.position.x > 5) {
        alphaRef.current.position.x = -5;
      }
    }
  });

  return (
    <group>
      {/* Gold Nucleus */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffb347" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Alpha Particles */}
      <group ref={alphaRef} position={[-5, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#4ecdc4" emissive="#26d0ce" emissiveIntensity={0.5} />
        </mesh>
      </group>
      
      {/* Scattered Alpha */}
      <mesh position={[2, 1, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ff6b6b" emissive="#ff4757" emissiveIntensity={0.5} />
      </mesh>
      
      <Text position={[0, -3, 0]} fontSize={0.4} color="#2d3748" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Rutherford Scattering
      </Text>
    </group>
  );
};

// Molecular Orbitals Visualization
const MolecularOrbitalsVisualization: React.FC = () => {
  const orbitalRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (orbitalRef.current) {
      orbitalRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={orbitalRef}>
      {/* Bonding Orbital */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial color="#4ecdc4" transparent opacity={0.3} />
      </mesh>
      
      {/* Antibonding Orbital */}
      <mesh position={[0, -1, 0]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshStandardMaterial color="#ff6b6b" transparent opacity={0.3} />
      </mesh>
      
      {/* Atomic Nuclei */}
      <mesh position={[-1, 0, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>
      <mesh position={[1, 0, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>
      
      <Text position={[0, -3, 0]} fontSize={0.4} color="#2d3748" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Molecular Orbitals
      </Text>
    </group>
  );
};

// Info Panels
const BohrModelInfo: React.FC<{ element: string; energyLevel: number; setEnergyLevel: any }> = ({ element, energyLevel, setEnergyLevel }) => (
  <div>
    <h3>⚛️ Bohr Model Lab</h3>
    <div className="formula-box">
      <strong>Energy Formula:</strong> Eₙ = -13.6Z²/n² eV
    </div>
    <div className="formula-box">
      <strong>Radius Formula:</strong> rₙ = n²h²/4π²meZe²
    </div>
    <div className="energy-levels">
      <h4>Energy Levels:</h4>
      {[1, 2, 3, 4].map(n => (
        <button
          key={n}
          className={`energy-level-btn ${energyLevel === n ? 'active' : ''}`}
          onClick={() => setEnergyLevel(n)}
        >
          n = {n} (E = {-13.6 * getAtomicNumber(element) * getAtomicNumber(element) / (n * n)} eV)
        </button>
      ))}
    </div>
  </div>
);

const QuantumNumbersInfo: React.FC<{ quantumNumbers: any }> = ({ quantumNumbers }) => (
  <div>
    <h3>🔢 Quantum Numbers Lab</h3>
    <div className="formula-box">
      <strong>Principal (n):</strong> Energy level, size
    </div>
    <div className="formula-box">
      <strong>Azimuthal (l):</strong> Shape (s=0, p=1, d=2, f=3)
    </div>
    <div className="formula-box">
      <strong>Magnetic (mₗ):</strong> Orientation (-l to +l)
    </div>
    <div className="formula-box">
      <strong>Spin (mₛ):</strong> +½ or -½
    </div>
  </div>
);

const OrbitalShapesInfo: React.FC<{ orbitalType: string }> = ({ orbitalType }) => (
  <div>
    <h3>🌐 Orbital Shapes Lab</h3>
    <div className="formula-box">
      <strong>s orbital:</strong> Spherical, no nodes
    </div>
    <div className="formula-box">
      <strong>p orbital:</strong> Dumbbell, 1 node
    </div>
    <div className="formula-box">
      <strong>d orbital:</strong> Clover, 2 nodes
    </div>
    <div className="formula-box">
      <strong>f orbital:</strong> Complex, 3 nodes
    </div>
  </div>
);

const ElectronConfigInfo: React.FC<{ element: string }> = ({ element }) => (
  <div>
    <h3>⚡ Electron Configuration Lab</h3>
    <div className="formula-box">
      <strong>Element:</strong> {element}
    </div>
    <div className="formula-box">
      <strong>Configuration:</strong> {getElectronConfigString(element)}
    </div>
    <div className="formula-box">
      <strong>Valence Electrons:</strong> {getValenceElectrons(element)}
    </div>
  </div>
);

const AtomicSpectraInfo: React.FC<{ element: string }> = ({ element }) => (
  <div>
    <h3>🌈 Atomic Spectra Lab</h3>
    <div className="formula-box">
      <strong>Rydberg Formula:</strong> 1/λ = RZ²(1/n₁² - 1/n₂²)
    </div>
    <div className="formula-box">
      <strong>Lyman Series:</strong> n₁ = 1 (UV)
    </div>
    <div className="formula-box">
      <strong>Balmer Series:</strong> n₁ = 2 (Visible)
    </div>
    <div className="formula-box">
      <strong>Paschen Series:</strong> n₁ = 3 (IR)
    </div>
  </div>
);

const UncertaintyInfo: React.FC = () => (
  <div>
    <h3>🎯 Uncertainty Principle Lab</h3>
    <div className="formula-box">
      <strong>Heisenberg's Principle:</strong> Δx · Δp ≥ h/4π
    </div>
    <div className="formula-box">
      <strong>Meaning:</strong> Can't know position and momentum exactly
    </div>
    <div className="formula-box">
      <strong>Implication:</strong> No definite electron orbits
    </div>
  </div>
);

const WaveFunctionInfo: React.FC<{ element: string }> = ({ element }) => (
  <div>
    <h3>🌊 Wave Function Lab</h3>
    <div className="formula-box">
      <strong>Schrödinger Equation:</strong> Ĥψ = Eψ
    </div>
    <div className="formula-box">
      <strong>Wave Function:</strong> ψ(x,y,z,t)
    </div>
    <div className="formula-box">
      <strong>Probability Density:</strong> |ψ|²
    </div>
    <div className="formula-box">
      <strong>Element:</strong> {element}
    </div>
  </div>
);

const PeriodicTrendsInfo: React.FC = () => (
  <div>
    <h3>📊 Periodic Trends Lab</h3>
    <div className="formula-box">
      <strong>Atomic Radius:</strong> Increases down group, decreases across period
    </div>
    <div className="formula-box">
      <strong>Ionization Energy:</strong> Decreases down group, increases across period
    </div>
    <div className="formula-box">
      <strong>Electronegativity:</strong> Decreases down group, increases across period
    </div>
    <div className="formula-box">
      <strong>Electron Affinity:</strong> Generally increases across period
    </div>
  </div>
);

const PhotoelectricInfo: React.FC = () => (
  <div>
    <h3>💡 Photoelectric Effect Lab</h3>
    <div className="formula-box">
      <strong>Einstein's Equation:</strong> KE = hν - φ
    </div>
    <div className="formula-box">
      <strong>Threshold Frequency:</strong> ν₀ = φ/h
    </div>
    <div className="formula-box">
      <strong>Work Function:</strong> φ (material dependent)
    </div>
    <div className="formula-box">
      <strong>Photon Energy:</strong> E = hν
    </div>
  </div>
);

const DeBroglieInfo: React.FC<{ element: string }> = ({ element }) => (
  <div>
    <h3>🌊 de Broglie Waves Lab</h3>
    <div className="formula-box">
      <strong>de Broglie Wavelength:</strong> λ = h/mv
    </div>
    <div className="formula-box">
      <strong>For Electrons:</strong> λ = 12.27/√V Å
    </div>
    <div className="formula-box">
      <strong>Matter-Wave Duality:</strong> All particles have wave nature
    </div>
    <div className="formula-box">
      <strong>Element:</strong> {element}
    </div>
  </div>
);

const ZeemanEffectInfo: React.FC<{ element: string }> = ({ element }) => (
  <div>
    <h3>🧲 Zeeman Effect Lab</h3>
    <div className="formula-box">
      <strong>Magnetic Field:</strong> Splits energy levels
    </div>
    <div className="formula-box">
      <strong>Energy Shift:</strong> ΔE = μB · B
    </div>
    <div className="formula-box">
      <strong>Magnetic Moment:</strong> μB = eℏ/2me
    </div>
    <div className="formula-box">
      <strong>Element:</strong> {element}
    </div>
  </div>
);

const StarkEffectInfo: React.FC<{ element: string }> = ({ element }) => (
  <div>
    <h3>⚡ Stark Effect Lab</h3>
    <div className="formula-box">
      <strong>Electric Field:</strong> Splits energy levels
    </div>
    <div className="formula-box">
      <strong>Energy Shift:</strong> ΔE = -p · E
    </div>
    <div className="formula-box">
      <strong>Dipole Moment:</strong> p = q · d
    </div>
    <div className="formula-box">
      <strong>Element:</strong> {element}
    </div>
  </div>
);

const HydrogenSpectrumInfo: React.FC = () => (
  <div>
    <h3>🔬 Hydrogen Spectrum Lab</h3>
    <div className="formula-box">
      <strong>Rydberg Formula:</strong> 1/λ = R(1/n₁² - 1/n₂²)
    </div>
    <div className="formula-box">
      <strong>Lyman Series:</strong> n₁ = 1 (UV region)
    </div>
    <div className="formula-box">
      <strong>Balmer Series:</strong> n₁ = 2 (Visible region)
    </div>
    <div className="formula-box">
      <strong>Paschen Series:</strong> n₁ = 3 (IR region)
    </div>
  </div>
);

const OrbitalFillingInfo: React.FC<{ element: string }> = ({ element }) => (
  <div>
    <h3>🎯 Orbital Filling Lab</h3>
    <div className="formula-box">
      <strong>Aufbau Principle:</strong> Fill lowest energy orbitals first
    </div>
    <div className="formula-box">
      <strong>Pauli Exclusion:</strong> Max 2 electrons per orbital
    </div>
    <div className="formula-box">
      <strong>Hund's Rule:</strong> Fill degenerate orbitals singly first
    </div>
    <div className="formula-box">
      <strong>Element:</strong> {element}
    </div>
  </div>
);

const NuclearModelInfo: React.FC = () => (
  <div>
    <h3>🔬 Nuclear Model Lab</h3>
    <div className="formula-box">
      <strong>Rutherford Scattering:</strong> α-particles on gold foil
    </div>
    <div className="formula-box">
      <strong>Nuclear Size:</strong> ~10⁻¹⁵ m (femtometer)
    </div>
    <div className="formula-box">
      <strong>Atomic Size:</strong> ~10⁻¹⁰ m (angstrom)
    </div>
    <div className="formula-box">
      <strong>Empty Space:</strong> 99.97% of atom is empty
    </div>
  </div>
);

const MolecularOrbitalsInfo: React.FC = () => (
  <div>
    <h3>🔗 Molecular Orbitals Lab</h3>
    <div className="formula-box">
      <strong>Bonding Orbital:</strong> Lower energy, constructive interference
    </div>
    <div className="formula-box">
      <strong>Antibonding Orbital:</strong> Higher energy, destructive interference
    </div>
    <div className="formula-box">
      <strong>Bond Order:</strong> (Bonding - Antibonding)/2
    </div>
    <div className="formula-box">
      <strong>Molecular Orbitals:</strong> Linear combination of atomic orbitals
    </div>
  </div>
);

// Helper Functions
const getAtomicNumber = (element: string): number => {
  // First check if it's a direct atomic number (for custom Z input)
  const zNumber = parseInt(element);
  if (!isNaN(zNumber) && zNumber >= 1 && zNumber <= 118) {
    return zNumber;
  }
  
  // Then check element symbols
  const atomicNumbers: { [key: string]: number } = {
    'H': 1, 'He': 2, 'Li': 3, 'Be': 4, 'B': 5, 'C': 6, 'N': 7, 'O': 8, 'F': 9, 'Ne': 10,
    'Na': 11, 'Mg': 12, 'Al': 13, 'Si': 14, 'P': 15, 'S': 16, 'Cl': 17, 'Ar': 18,
    'K': 19, 'Ca': 20, 'Sc': 21, 'Ti': 22, 'V': 23, 'Cr': 24, 'Mn': 25, 'Fe': 26, 'Co': 27, 'Ni': 28, 'Cu': 29, 'Zn': 30,
    'Ga': 31, 'Ge': 32, 'As': 33, 'Se': 34, 'Br': 35, 'Kr': 36,
    'Rb': 37, 'Sr': 38, 'Y': 39, 'Zr': 40, 'Nb': 41, 'Mo': 42, 'Tc': 43, 'Ru': 44, 'Rh': 45, 'Pd': 46, 'Ag': 47, 'Cd': 48,
    'In': 49, 'Sn': 50, 'Sb': 51, 'Te': 52, 'I': 53, 'Xe': 54,
    'Cs': 55, 'Ba': 56, 'La': 57, 'Ce': 58, 'Pr': 59, 'Nd': 60, 'Pm': 61, 'Sm': 62, 'Eu': 63, 'Gd': 64, 'Tb': 65, 'Dy': 66, 'Ho': 67, 'Er': 68, 'Tm': 69, 'Yb': 70, 'Lu': 71,
    'Hf': 72, 'Ta': 73, 'W': 74, 'Re': 75, 'Os': 76, 'Ir': 77, 'Pt': 78, 'Au': 79, 'Hg': 80,
    'Tl': 81, 'Pb': 82, 'Bi': 83, 'Po': 84, 'At': 85, 'Rn': 86,
    'Fr': 87, 'Ra': 88, 'Ac': 89, 'Th': 90, 'Pa': 91, 'U': 92, 'Np': 93, 'Pu': 94, 'Am': 95, 'Cm': 96, 'Bk': 97, 'Cf': 98, 'Es': 99, 'Fm': 100, 'Md': 101, 'No': 102, 'Lr': 103,
    'Rf': 104, 'Db': 105, 'Sg': 106, 'Bh': 107, 'Hs': 108, 'Mt': 109, 'Ds': 110, 'Rg': 111, 'Cn': 112, 'Nh': 113, 'Fl': 114, 'Mc': 115, 'Lv': 116, 'Ts': 117, 'Og': 118
  };
  return atomicNumbers[element] || 1;
};

const getElementNameByZ = (z: number): string => {
  const elements: { [key: number]: string } = {
    1: 'H', 2: 'He', 3: 'Li', 4: 'Be', 5: 'B', 6: 'C', 7: 'N', 8: 'O', 9: 'F', 10: 'Ne',
    11: 'Na', 12: 'Mg', 13: 'Al', 14: 'Si', 15: 'P', 16: 'S', 17: 'Cl', 18: 'Ar',
    19: 'K', 20: 'Ca', 21: 'Sc', 22: 'Ti', 23: 'V', 24: 'Cr', 25: 'Mn', 26: 'Fe', 27: 'Co', 28: 'Ni', 29: 'Cu', 30: 'Zn',
    31: 'Ga', 32: 'Ge', 33: 'As', 34: 'Se', 35: 'Br', 36: 'Kr',
    37: 'Rb', 38: 'Sr', 39: 'Y', 40: 'Zr', 41: 'Nb', 42: 'Mo', 43: 'Tc', 44: 'Ru', 45: 'Rh', 46: 'Pd', 47: 'Ag', 48: 'Cd',
    49: 'In', 50: 'Sn', 51: 'Sb', 52: 'Te', 53: 'I', 54: 'Xe',
    55: 'Cs', 56: 'Ba', 57: 'La', 58: 'Ce', 59: 'Pr', 60: 'Nd', 61: 'Pm', 62: 'Sm', 63: 'Eu', 64: 'Gd', 65: 'Tb', 66: 'Dy', 67: 'Ho', 68: 'Er', 69: 'Tm', 70: 'Yb', 71: 'Lu',
    72: 'Hf', 73: 'Ta', 74: 'W', 75: 'Re', 76: 'Os', 77: 'Ir', 78: 'Pt', 79: 'Au', 80: 'Hg',
    81: 'Tl', 82: 'Pb', 83: 'Bi', 84: 'Po', 85: 'At', 86: 'Rn',
    87: 'Fr', 88: 'Ra', 89: 'Ac', 90: 'Th', 91: 'Pa', 92: 'U', 93: 'Np', 94: 'Pu', 95: 'Am', 96: 'Cm', 97: 'Bk', 98: 'Cf', 99: 'Es', 100: 'Fm', 101: 'Md', 102: 'No', 103: 'Lr',
    104: 'Rf', 105: 'Db', 106: 'Sg', 107: 'Bh', 108: 'Hs', 109: 'Mt', 110: 'Ds', 111: 'Rg', 112: 'Cn', 113: 'Nh', 114: 'Fl', 115: 'Mc', 116: 'Lv', 117: 'Ts', 118: 'Og'
  };
  return elements[z] || `Element-${z}`;
};

const getElectronCount = (element: string, energyLevel: number): number => {
  const atomicNumber = getAtomicNumber(element);
  const maxElectrons = 2 * energyLevel * energyLevel;
  return Math.min(atomicNumber, maxElectrons);
};

const getElectronConfig = (element: string) => {
  const atomicNumber = getAtomicNumber(element);
  const shells = [];
  let remaining = atomicNumber;
  
  for (let n = 1; n <= 4 && remaining > 0; n++) {
    const maxInShell = 2 * n * n;
    const electrons = Math.min(remaining, maxInShell);
    shells.push({ n, electrons });
    remaining -= electrons;
  }
  
  return shells;
};

const getElectronConfigString = (element: string): string => {
  const configs: { [key: string]: string } = {
    'H': '1s¹',
    'He': '1s²',
    'Li': '1s² 2s¹',
    'C': '1s² 2s² 2p²',
    'N': '1s² 2s² 2p³',
    'O': '1s² 2s² 2p⁴',
    'F': '1s² 2s² 2p⁵',
    'Ne': '1s² 2s² 2p⁶'
  };
  return configs[element] || '1s¹';
};

const getValenceElectrons = (element: string): number => {
  const valence: { [key: string]: number } = {
    'H': 1, 'He': 2, 'Li': 1, 'C': 4, 'N': 5, 'O': 6, 'F': 7, 'Ne': 8
  };
  return valence[element] || 1;
};

export default AtomicStructureAdvancedPlayground;
