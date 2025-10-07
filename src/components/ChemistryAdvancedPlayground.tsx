import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

const ChemistryAdvancedPlayground: React.FC = () => {
  const [activeLab, setActiveLab] = useState('laws-combination');
  const [selectedElement, setSelectedElement] = useState('H');
  const [reactionType, setReactionType] = useState('conservation');
  const [moleValue, setMoleValue] = useState(1);
  const [concentration, setConcentration] = useState(1);
  const [gasPressure, setGasPressure] = useState(1);
  const [gasVolume, setGasVolume] = useState(22.4);
  const [gasTemp, setGasTemp] = useState(273);

  const labs = [
    { id: 'laws-combination', name: 'Laws of Combination', icon: '⚖️' },
    { id: 'mole-concept', name: 'Mole Concept', icon: '📊' },
    { id: 'stoichiometry', name: 'Stoichiometry', icon: '⚔️' },
    { id: 'concentration', name: 'Concentration', icon: '🧪' },
    { id: 'gas-laws', name: 'Gas Laws', icon: '🌌' },
    { id: 'thermodynamics', name: 'Thermodynamics', icon: '🔥' },
    { id: 'equilibrium', name: 'Equilibrium', icon: '⚖️' },
    { id: 'kinetics', name: 'Kinetics', icon: '⚡' },
    { id: 'electrochemistry', name: 'Electrochemistry', icon: '🔋' }
  ];

  return (
    <div className="chemistry-advanced-playground">
      <style>{`
        .chemistry-advanced-playground {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
          min-height: 100vh;
          padding: 20px;
          color: #1e293b;
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

        .subtitle {
          color: #64748b;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .lab-navigation {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-bottom: 30px;
        }

        .lab-btn {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 12px 20px;
          color: #475569;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
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
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .playground-content {
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .control-group {
          background: #f8fafc;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .control-group h3 {
          color: #1e293b;
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 15px;
        }

        .control-group label {
          display: block;
          color: #475569;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .control-group select,
        .control-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          color: #1e293b;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .control-group select:focus,
        .control-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .visualization-container {
          height: 500px;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }

        .info-panel {
          margin-top: 30px;
          background: #f8fafc;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .info-panel h3 {
          color: #1e293b;
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .formula-box {
          background: white;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 12px;
          border-left: 4px solid #3b82f6;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .formula-box strong {
          color: #1e293b;
          font-weight: 700;
        }

        .molecule {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          margin: 4px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .reaction-arrow {
          font-size: 1.5rem;
          color: #64748b;
          margin: 0 10px;
        }

        .particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: float 3s ease-in-out infinite;
        }

        .particle:nth-child(1) { background: #3b82f6; animation-delay: 0s; }
        .particle:nth-child(2) { background: #8b5cf6; animation-delay: 0.5s; }
        .particle:nth-child(3) { background: #ec4899; animation-delay: 1s; }
        .particle:nth-child(4) { background: #f59e0b; animation-delay: 1.5s; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .gas-container {
          position: relative;
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, #1e293b, #334155);
          border-radius: 12px;
          overflow: hidden;
        }

        .concentration-bar {
          height: 20px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
          margin: 10px 0;
          position: relative;
          overflow: hidden;
        }

        .concentration-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>

      <div className="playground-header">
        <h1>🧪 Advanced Chemistry Laboratory</h1>
        <p className="subtitle">Interactive 3D/2D Visualizations for JEE Advanced Concepts</p>
      </div>

      <div className="lab-navigation">
        {labs.map((lab) => (
          <button
            key={lab.id}
            className={`lab-btn ${activeLab === lab.id ? 'active' : ''}`}
            onClick={() => setActiveLab(lab.id)}
          >
            <span>{lab.icon}</span>
            <span>{lab.name}</span>
          </button>
        ))}
      </div>

      <div className="playground-content">
        {activeLab === 'laws-combination' && <LawsCombinationLab />}
        {activeLab === 'mole-concept' && <MoleConceptLab moleValue={moleValue} setMoleValue={setMoleValue} />}
        {activeLab === 'stoichiometry' && <StoichiometryLabEnhanced selectedElement={selectedElement} setSelectedElement={setSelectedElement} />}
        {activeLab === 'concentration' && <ConcentrationLab concentration={concentration} setConcentration={setConcentration} />}
        {activeLab === 'gas-laws' && <GasLawsLab gasPressure={gasPressure} setGasPressure={setGasPressure} gasVolume={gasVolume} setGasVolume={setGasVolume} gasTemp={gasTemp} setGasTemp={setGasTemp} />}
        {activeLab === 'thermodynamics' && <ThermodynamicsLab />}
        {activeLab === 'equilibrium' && <EquilibriumLab />}
        {activeLab === 'kinetics' && <KineticsLab />}
        {activeLab === 'electrochemistry' && <ElectrochemistryLab />}
      </div>
    </div>
  );
};

// Laws of Chemical Combination Lab
const LawsCombinationLab: React.FC = () => {
  const [selectedLaw, setSelectedLaw] = useState('conservation');
  const [massInput, setMassInput] = useState(80);

  const laws = {
    conservation: {
      name: 'Law of Conservation of Mass',
      equation: 'CH4 + 2O2 → CO2 + 2H2O',
      before: { CH4: 16, O2: 64 },
      after: { CO2: 44, H2O: 36 },
      description: 'Mass before = Mass after (80g = 80g)',
      formula: 'Σm_reactants = Σm_products'
    },
    definite: {
      name: 'Law of Definite Proportions',
      equation: 'H2O',
      composition: { H: 11.1, O: 88.9 },
      description: 'H2O always has 11.1% H, 88.9% O',
      formula: '% element = (mass of element / total mass) × 100'
    },
    multiple: {
      name: 'Law of Multiple Proportions',
      equation: 'CO vs CO2',
      ratios: { CO: '12g C : 16g O', CO2: '12g C : 32g O' },
      description: 'Oxygen ratio = 1:2 (simple whole numbers)',
      formula: 'Mass ratio = simple whole numbers'
    },
    reciprocal: {
      name: 'Law of Reciprocal Proportions',
      equation: 'H+O, H+S, O+S',
      ratios: { HO: '1:8', HS: '1:16', SO: '1:1' },
      description: 'If A combines with B & C, then B and C combine in same ratio',
      formula: 'Ratio A:B = Ratio A:C'
    },
    gaylussac: {
      name: 'Gay-Lussac\'s Law of Gaseous Volumes',
      equation: '2H2 + O2 → 2H2O',
      ratios: { H2: 2, O2: 1, H2O: 2 },
      description: 'Volumes of reacting gases = simple ratios at same T,P',
      formula: 'V₁:V₂:V₃ = simple whole numbers'
    },
    avogadro: {
      name: 'Avogadro\'s Law',
      equation: 'V ∝ n (at constant T,P)',
      description: 'Equal volumes of gases contain equal number of molecules',
      formula: 'V₁/n₁ = V₂/n₂'
    }
  };

  const currentLaw = laws[selectedLaw as keyof typeof laws];

  return (
    <>
      <div className="controls-panel">
        <div className="control-group">
          <h3>⚖️ Chemical Laws</h3>
          <label>Select Law:</label>
          <select value={selectedLaw} onChange={(e) => setSelectedLaw(e.target.value)}>
            <option value="conservation">Conservation of Mass</option>
            <option value="definite">Definite Proportions</option>
            <option value="multiple">Multiple Proportions</option>
            <option value="reciprocal">Reciprocal Proportions</option>
            <option value="gaylussac">Gay-Lussac's Law</option>
            <option value="avogadro">Avogadro's Law</option>
          </select>
        </div>
        <div className="control-group">
          <h3>📊 Mass Input</h3>
          <label>Total Mass: {massInput}g</label>
          <input 
            type="range" 
            min="20" 
            max="200" 
            step="10"
            value={massInput}
            onChange={(e) => setMassInput(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          <LawsVisualization law={selectedLaw} data={currentLaw} massInput={massInput} />
          <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      <div className="info-panel">
        <h3>📚 {currentLaw.name}</h3>
        <div className="formula-box">
          <strong>Equation:</strong> {currentLaw.equation}
        </div>
        <div className="formula-box">
          <strong>Formula:</strong> {currentLaw.formula}
        </div>
        <div className="formula-box">
          <strong>Description:</strong> {currentLaw.description}
        </div>
        <div className="formula-box">
          <strong>JEE Advanced Application:</strong> Used in stoichiometry, gas law problems, and molecular formula calculations
        </div>
      </div>
    </>
  );
};

// Laws Visualization Component
const LawsVisualization: React.FC<{ law: string; data: any; massInput: number }> = ({ law, data, massInput }) => {
  if (law === 'conservation') {
    // Calculate proportional masses based on input
    const totalOriginalMass = 80; // 16 + 64
    const scale = massInput / totalOriginalMass;
    const ch4Mass = Math.round(16 * scale);
    const o2Mass = Math.round(64 * scale);
    const co2Mass = Math.round(44 * scale);
    const h2oMass = Math.round(36 * scale);
    
    return (
      <group>
        {/* Reactants - CH₄ (1 molecule) */}
        <mesh position={[-2.5, 0, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        <Text position={[-2.5, -1.2, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          CH4
        </Text>
        <Text position={[-2.5, -1.5, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          ({ch4Mass}g)
        </Text>
        
        {/* Reactants - 2O₂ (2 molecules) */}
        <mesh position={[-1.5, 0.3, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        <mesh position={[-1.5, -0.3, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        <Text position={[-1.5, -1.2, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          2O2
        </Text>
        <Text position={[-1.5, -1.5, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          ({o2Mass}g)
        </Text>

        {/* Arrow */}
        <Text position={[0, 0, 0]} fontSize={0.5} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          →
        </Text>

        {/* Products - CO₂ (1 molecule) */}
        <mesh position={[1.5, 0.3, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#ec4899" />
        </mesh>
        <Text position={[1.5, -1.2, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          CO2
        </Text>
        <Text position={[1.5, -1.5, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          ({co2Mass}g)
        </Text>
        
        {/* Products - 2H₂O (2 molecules) */}
        <mesh position={[2.5, 0.3, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        <mesh position={[2.5, -0.3, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        <Text position={[2.5, -1.2, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          2H2O
        </Text>
        <Text position={[2.5, -1.5, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          ({h2oMass}g)
        </Text>

        <Text position={[0, -2.5, 0]} fontSize={0.4} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Total: {ch4Mass + o2Mass}g = {co2Mass + h2oMass}g ✓
        </Text>
      </group>
    );
  }

  if (law === 'definite') {
    // Calculate proportional masses based on input
    const hMass = Math.round(massInput * 0.111);
    const oMass = Math.round(massInput * 0.889);
    const sphereSize = Math.min(2, Math.max(0.5, massInput / 100));
    
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[sphereSize, 32, 32]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.7} />
        </mesh>
        <Text position={[0, 0, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          H2O
        </Text>
        <Text position={[0, -2.5, 0]} fontSize={0.4} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          H: {hMass}g ({((hMass/massInput)*100).toFixed(1)}%), O: {oMass}g ({((oMass/massInput)*100).toFixed(1)}%)
        </Text>
      </group>
    );
  }

  if (law === 'multiple') {
    // Calculate proportional masses based on input
    const coMass = Math.round(massInput * 0.5); // 50% of total mass
    const co2Mass = Math.round(massInput * 0.5); // 50% of total mass
    const coCMass = Math.round(coMass * 12/28); // C in CO
    const coOMass = Math.round(coMass * 16/28); // O in CO
    const co2CMass = Math.round(co2Mass * 12/44); // C in CO2
    const co2OMass = Math.round(co2Mass * 32/44); // O in CO2
    const boxSize = Math.min(1.5, Math.max(0.5, massInput / 100));
    
    return (
      <group>
        <mesh position={[-1.5, 0, 0]}>
          <boxGeometry args={[boxSize, boxSize, boxSize]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        <Text position={[-1.5, -1.5, 0]} fontSize={0.3} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          CO (1:1)
        </Text>
        <Text position={[-1.5, -1.8, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          C: {coCMass}g, O: {coOMass}g
        </Text>
        
        <mesh position={[1.5, 0, 0]}>
          <boxGeometry args={[boxSize, boxSize, boxSize]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        <Text position={[1.5, -1.5, 0]} fontSize={0.3} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          CO2 (1:2)
        </Text>
        <Text position={[1.5, -1.8, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          C: {co2CMass}g, O: {co2OMass}g
        </Text>
        
        <Text position={[0, -2.5, 0]} fontSize={0.4} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          O Ratio: {coOMass}:{co2OMass} = 1:2
        </Text>
      </group>
    );
  }

  if (law === 'reciprocal') {
    // Calculate proportional masses based on input
    const totalMass = massInput;
    const hOMass = Math.round(totalMass * 0.5);
    const hSMass = Math.round(totalMass * 0.5);
    const oSMass = Math.round(totalMass * 0.5);
    
    const hOMassH = Math.round(hOMass * 1/9); // 1:8 ratio
    const hOMassO = Math.round(hOMass * 8/9);
    const hSMassH = Math.round(hSMass * 1/17); // 1:16 ratio
    const hSMassS = Math.round(hSMass * 16/17);
    const oSMassO = Math.round(oSMass * 1/2); // 1:1 ratio
    const oSMassS = Math.round(oSMass * 1/2);
    
    const boxSize = Math.min(1, Math.max(0.5, massInput / 150));
    
    return (
      <group>
        {/* H + O */}
        <mesh position={[-2, 0, 0]}>
          <boxGeometry args={[boxSize, boxSize, boxSize]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        <Text position={[-2, -1.2, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          H+O
        </Text>
        <Text position={[-2, -1.5, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          H: {hOMassH}g, O: {hOMassO}g
        </Text>
        
        {/* H + S */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[boxSize, boxSize, boxSize]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          H+S
        </Text>
        <Text position={[0, -1.5, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          H: {hSMassH}g, S: {hSMassS}g
        </Text>
        
        {/* O + S */}
        <mesh position={[2, 0, 0]}>
          <boxGeometry args={[boxSize, boxSize, boxSize]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        <Text position={[2, -1.2, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          O+S
        </Text>
        <Text position={[2, -1.5, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          O: {oSMassO}g, S: {oSMassS}g
        </Text>
        
        <Text position={[0, -2.5, 0]} fontSize={0.4} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Reciprocal Proportions (Total: {totalMass}g)
        </Text>
      </group>
    );
  }

  if (law === 'gaylussac') {
    // Calculate proportional volumes based on input (treating mass as volume for demonstration)
    const totalVolume = massInput; // Using mass as volume for demonstration
    const h2Volume = Math.round(totalVolume * 2/5); // 2 parts out of 5
    const o2Volume = Math.round(totalVolume * 1/5); // 1 part out of 5
    const h2oVolume = Math.round(totalVolume * 2/5); // 2 parts out of 5
    
    const boxSize = Math.min(1, Math.max(0.5, massInput / 150));
    
    return (
      <group>
        {/* 2H2 */}
        <mesh position={[-2, 0.3, 0]}>
          <boxGeometry args={[boxSize, boxSize, boxSize]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        <mesh position={[-2, -0.3, 0]}>
          <boxGeometry args={[boxSize, boxSize, boxSize]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        <Text position={[-2, -1.2, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          2H2
        </Text>
        <Text position={[-2, -1.5, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Vol: {h2Volume}L
        </Text>
        
        {/* O2 */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[boxSize, boxSize, boxSize]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          O2
        </Text>
        <Text position={[0, -1.5, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Vol: {o2Volume}L
        </Text>
        
        {/* Arrow */}
        <Text position={[1, 0, 0]} fontSize={0.4} color="#ef4444" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          →
        </Text>
        
        {/* 2H2O */}
        <mesh position={[2.5, 0.3, 0]}>
          <boxGeometry args={[boxSize, boxSize, boxSize]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        <mesh position={[2.5, -0.3, 0]}>
          <boxGeometry args={[boxSize, boxSize, boxSize]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        <Text position={[2.5, -1.2, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          2H2O
        </Text>
        <Text position={[2.5, -1.5, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Vol: {h2oVolume}L
        </Text>
        
        <Text position={[0, -2.5, 0]} fontSize={0.4} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Volume Ratio: {h2Volume}:{o2Volume}:{h2oVolume} = 2:1:2
        </Text>
      </group>
    );
  }

  if (law === 'avogadro') {
    // Calculate proportional volumes and molecules based on input
    const volume = massInput; // Using mass as volume for demonstration
    const molecules = Math.round(volume * 6.022e23 / 22.4); // Avogadro's number calculation
    const sphereSize = Math.min(1.5, Math.max(0.5, massInput / 100));
    
    return (
      <group>
        {/* Equal volumes of different gases */}
        <mesh position={[-1.5, 0, 0]}>
          <sphereGeometry args={[sphereSize, 32, 32]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.7} />
        </mesh>
        <Text position={[-1.5, -1.5, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Gas A
        </Text>
        <Text position={[-1.5, -1.8, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Vol: {volume}L
        </Text>
        
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[sphereSize, 32, 32]} />
          <meshStandardMaterial color="#8b5cf6" transparent opacity={0.7} />
        </mesh>
        <Text position={[0, -1.5, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Gas B
        </Text>
        <Text position={[0, -1.8, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Vol: {volume}L
        </Text>
        
        <mesh position={[1.5, 0, 0]}>
          <sphereGeometry args={[sphereSize, 32, 32]} />
          <meshStandardMaterial color="#10b981" transparent opacity={0.7} />
        </mesh>
        <Text position={[1.5, -1.5, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Gas C
        </Text>
        <Text position={[1.5, -1.8, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Vol: {volume}L
        </Text>
        
        <Text position={[0, -2.5, 0]} fontSize={0.4} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Equal Volumes = Equal Molecules ({molecules.toExponential(1)} molecules each)
        </Text>
      </group>
    );
  }

  return (
    <group>
      <Text position={[0, 0, 0]} fontSize={0.4} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Select a Law to Visualize
      </Text>
    </group>
  );
};

// Mole Concept Visualization
const MoleConceptVisualization: React.FC<{ moleValue: number; element: any; temperature: number; pressure: number }> = ({ moleValue, element, temperature, pressure }) => {
  const particleCount = Math.min(50, Math.floor(moleValue * 10));
  const volume = (moleValue * 0.0821 * temperature) / pressure;
  const containerSize = Math.max(1, Math.min(3, volume / 10));

  return (
    <group>
      {/* Container */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[containerSize, containerSize, containerSize]} />
        <meshStandardMaterial 
          color={element.color} 
          transparent 
          opacity={0.1}
          wireframe={true}
        />
      </mesh>

      {/* Particles */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i * Math.PI * 2) / particleCount;
        const radius = containerSize * 0.3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (Math.random() - 0.5) * containerSize * 0.8;
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={element.color} />
          </mesh>
        );
      })}

      <Text position={[0, containerSize/2 + 0.5, 0]} fontSize={0.3} color="#1e293b">
        {element.name} - {moleValue.toFixed(1)} mol
      </Text>
      <Text position={[0, containerSize/2 + 0.8, 0]} fontSize={0.2} color="#64748b">
        Volume: {volume.toFixed(2)} L
      </Text>
    </group>
  );
};

// Mole Concept Lab
const MoleConceptLab: React.FC<{ moleValue: number; setMoleValue: (value: number) => void }> = ({ moleValue, setMoleValue }) => {
  const [selectedElement, setSelectedElement] = useState('H2');
  const [temperature, setTemperature] = useState(273);
  const [pressure, setPressure] = useState(1);

  const elements = {
    H2: { name: 'Hydrogen', molarMass: 2, color: '#3b82f6' },
    O2: { name: 'Oxygen', molarMass: 32, color: '#ef4444' },
    N2: { name: 'Nitrogen', molarMass: 28, color: '#8b5cf6' },
    CO2: { name: 'Carbon Dioxide', molarMass: 44, color: '#10b981' },
    CH4: { name: 'Methane', molarMass: 16, color: '#f59e0b' }
  };

  const currentElement = elements[selectedElement as keyof typeof elements];
  const particles = moleValue * 6.022e23;
  const volume = (moleValue * 0.0821 * temperature) / pressure;
  const mass = moleValue * currentElement.molarMass;

  return (
    <>
      <div className="controls-panel">
        <div className="control-group">
          <h3>📊 Mole Value</h3>
          <label>Moles: {moleValue}</label>
          <input 
            type="range" 
            min="0.1" 
            max="10" 
            step="0.1"
            value={moleValue}
            onChange={(e) => setMoleValue(parseFloat(e.target.value))}
          />
        </div>
        <div className="control-group">
          <h3>🧪 Element</h3>
          <label>Choose Element:</label>
          <select value={selectedElement} onChange={(e) => setSelectedElement(e.target.value)}>
            {Object.entries(elements).map(([key, data]) => (
              <option key={key} value={key}>{data.name} ({key})</option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <h3>🌡️ Temperature</h3>
          <label>Temperature: {temperature} K</label>
          <input 
            type="range" 
            min="200" 
            max="500" 
            step="10"
            value={temperature}
            onChange={(e) => setTemperature(parseInt(e.target.value))}
          />
        </div>
        <div className="control-group">
          <h3>📏 Pressure</h3>
          <label>Pressure: {pressure} atm</label>
          <input 
            type="range" 
            min="0.5" 
            max="5" 
            step="0.1"
            value={pressure}
            onChange={(e) => setPressure(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          <MoleConceptVisualization 
            moleValue={moleValue} 
            element={currentElement} 
            temperature={temperature}
            pressure={pressure}
          />
          <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      <div className="info-panel">
        <h3>📚 Advanced Mole Concept</h3>
        <div className="formula-box">
          <strong>n = mass/molar mass = particles/N_A = PV/RT</strong>
        </div>
        <div className="formula-box">
          <strong>Mass: {mass.toFixed(2)} g</strong>
        </div>
        <div className="formula-box">
          <strong>Particles: {(particles / 1e23).toFixed(2)} × 10²³</strong>
        </div>
        <div className="formula-box">
          <strong>Volume: {volume.toFixed(2)} L (at {temperature}K, {pressure}atm)</strong>
        </div>
        <div className="formula-box">
          <strong>Molar Mass: {currentElement.molarMass} g/mol</strong>
        </div>
      </div>
    </>
  );
};


// Concentration Lab
const ConcentrationLab: React.FC<{ concentration: number; setConcentration: (value: number) => void }> = ({ concentration, setConcentration }) => {
  return (
    <>
      <div className="controls-panel">
        <div className="control-group">
          <h3>🧪 Concentration</h3>
          <label>Molarity: {concentration} M</label>
          <input 
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1"
            value={concentration}
            onChange={(e) => setConcentration(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="visualization-container">
        <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#1e293b' }}>
            Solution Concentration
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '200px', height: '200px', background: `linear-gradient(to top, #3b82f6 ${concentration * 20}%, #e2e8f0 ${concentration * 20}%)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {concentration} M
              </div>
              <p style={{ marginTop: '10px', color: '#64748b' }}>Solution</p>
            </div>
          </div>
        </div>
      </div>

      <div className="info-panel">
        <h3>📚 Concentration Terms</h3>
        <div className="formula-box">
          <strong>Molarity (M):</strong> moles of solute per liter of solution
        </div>
        <div className="formula-box">
          <strong>Molality (m):</strong> moles of solute per kilogram of solvent
        </div>
        <div className="formula-box">
          <strong>Mole Fraction:</strong> moles of component / total moles
        </div>
      </div>
    </>
  );
};

// Gas Laws Lab
const GasLawsLab: React.FC<{ gasPressure: number; setGasPressure: (value: number) => void; gasVolume: number; setGasVolume: (value: number) => void; gasTemp: number; setGasTemp: (value: number) => void }> = ({ gasPressure, setGasPressure, gasVolume, setGasVolume, gasTemp, setGasTemp }) => {
  const moles = (gasPressure * gasVolume) / (0.0821 * gasTemp);

  return (
    <>
      <div className="controls-panel">
        <div className="control-group">
          <h3>🌌 Gas Pressure</h3>
          <label>Pressure: {gasPressure} atm</label>
          <input 
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1"
            value={gasPressure}
            onChange={(e) => setGasPressure(parseFloat(e.target.value))}
          />
        </div>
        <div className="control-group">
          <h3>📏 Volume</h3>
          <label>Volume: {gasVolume} L</label>
          <input 
            type="range" 
            min="1" 
            max="50" 
            step="1"
            value={gasVolume}
            onChange={(e) => setGasVolume(parseFloat(e.target.value))}
          />
        </div>
        <div className="control-group">
          <h3>🌡️ Temperature</h3>
          <label>Temperature: {gasTemp} K</label>
          <input 
            type="range" 
            min="200" 
            max="500" 
            step="10"
            value={gasTemp}
            onChange={(e) => setGasTemp(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="visualization-container">
        <div className="gas-container">
          {Array.from({ length: Math.floor(gasPressure * 10) }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 90}%`,
                top: `${Math.random() * 90}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h4 style={{ color: '#1e293b', marginBottom: '10px' }}>Ideal Gas Law: PV = nRT</h4>
          <p style={{ color: '#64748b' }}>Moles: {moles.toFixed(3)} mol</p>
        </div>
      </div>

      <div className="info-panel">
        <h3>📚 Gas Laws</h3>
        <div className="formula-box">
          <strong>Ideal Gas Law:</strong> PV = nRT
        </div>
        <div className="formula-box">
          <strong>Boyle's Law:</strong> P₁V₁ = P₂V₂ (constant T)
        </div>
        <div className="formula-box">
          <strong>Charles's Law:</strong> V₁/T₁ = V₂/T₂ (constant P)
        </div>
      </div>
    </>
  );
};

// Equivalent Concept Lab
const EquivalentConceptLab: React.FC = () => {
  return (
    <>
      <div className="visualization-container">
        <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#1e293b' }}>
            Equivalent Mass Calculator
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ textAlign: 'center', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#3b82f6', marginBottom: '10px' }}>Acid</h4>
              <p style={{ color: '#64748b' }}>E = M/n</p>
              <p style={{ color: '#64748b' }}>n = H⁺ released</p>
            </div>
            
            <div style={{ textAlign: 'center', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#8b5cf6', marginBottom: '10px' }}>Base</h4>
              <p style={{ color: '#64748b' }}>E = M/n</p>
              <p style={{ color: '#64748b' }}>n = OH⁻ released</p>
            </div>
            
            <div style={{ textAlign: 'center', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#ec4899', marginBottom: '10px' }}>Redox</h4>
              <p style={{ color: '#64748b' }}>E = M/n</p>
              <p style={{ color: '#64748b' }}>n = e⁻ exchanged</p>
            </div>
          </div>
        </div>
      </div>

      <div className="info-panel">
        <h3>📚 Equivalent Concept</h3>
        <div className="formula-box">
          <strong>Equivalent Mass:</strong> E = Molar mass / n
        </div>
        <div className="formula-box">
          <strong>For Acids:</strong> n = number of H⁺ ions released
        </div>
        <div className="formula-box">
          <strong>For Bases:</strong> n = number of OH⁻ ions released
        </div>
        <div className="formula-box">
          <strong>For Redox:</strong> n = number of electrons exchanged
        </div>
      </div>
    </>
  );
};

// Enhanced Stoichiometry Lab
const StoichiometryLabEnhanced: React.FC<{ selectedElement: string; setSelectedElement: (element: string) => void }> = ({ selectedElement, setSelectedElement }) => {
  const [reactantA, setReactantA] = useState(2);
  const [reactantB, setReactantB] = useState(1);
  const [product, setProduct] = useState(2);

  const reactions = {
    H: { 
      equation: '2H2 + O2 → 2H2O', 
      ratio: '2:1:2',
      reactants: ['H2', 'O2'],
      products: ['H2O'],
      colors: ['#3b82f6', '#ef4444', '#10b981']
    },
    C: { 
      equation: 'C + O2 → CO2', 
      ratio: '1:1:1',
      reactants: ['C', 'O2'],
      products: ['CO2'],
      colors: ['#1f2937', '#ef4444', '#10b981']
    },
    N: { 
      equation: 'N2 + 3H2 → 2NH3', 
      ratio: '1:3:2',
      reactants: ['N2', 'H2'],
      products: ['NH3'],
      colors: ['#8b5cf6', '#3b82f6', '#10b981']
    },
    Fe: {
      equation: '4Fe + 3O2 → 2Fe2O3',
      ratio: '4:3:2',
      reactants: ['Fe', 'O2'],
      products: ['Fe2O3'],
      colors: ['#f59e0b', '#ef4444', '#ef4444']
    },
    Al: {
      equation: '4Al + 3O2 → 2Al2O3',
      ratio: '4:3:2',
      reactants: ['Al', 'O2'],
      products: ['Al2O3'],
      colors: ['#6b7280', '#ef4444', '#6b7280']
    },
    S: {
      equation: 'S + O2 → SO2',
      ratio: '1:1:1',
      reactants: ['S', 'O2'],
      products: ['SO2'],
      colors: ['#fbbf24', '#ef4444', '#10b981']
    }
  };

  const currentReaction = reactions[selectedElement as keyof typeof reactions];

  return (
    <>
      <div className="controls-panel">
        <div className="control-group">
          <h3>⚔️ Reaction Selection</h3>
          <label>Choose Element:</label>
          <select value={selectedElement} onChange={(e) => setSelectedElement(e.target.value)}>
            <option value="H">Hydrogen (2H2 + O2 → 2H2O)</option>
            <option value="C">Carbon (C + O2 → CO2)</option>
            <option value="N">Nitrogen (N2 + 3H2 → 2NH3)</option>
            <option value="Fe">Iron (4Fe + 3O2 → 2Fe2O3)</option>
            <option value="Al">Aluminum (4Al + 3O2 → 2Al2O3)</option>
            <option value="S">Sulfur (S + O2 → SO2)</option>
          </select>
        </div>
        <div className="control-group">
          <h3>🧮 Stoichiometric Coefficients</h3>
          <label>Reactant A: {reactantA}</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            step="1"
            value={reactantA}
            onChange={(e) => setReactantA(parseInt(e.target.value))}
          />
          <label>Reactant B: {reactantB}</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            step="1"
            value={reactantB}
            onChange={(e) => setReactantB(parseInt(e.target.value))}
          />
          <label>Product: {product}</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            step="1"
            value={product}
            onChange={(e) => setProduct(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          <StoichiometryVisualization 
            reaction={currentReaction} 
            coefficients={{ reactantA, reactantB, product }}
          />
          <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      <div className="info-panel">
        <h3>📚 Advanced Stoichiometry</h3>
        <div className="formula-box">
          <strong>Balanced Equation:</strong> {currentReaction.equation}
        </div>
        <div className="formula-box">
          <strong>Mole Ratio:</strong> {currentReaction.ratio}
        </div>
        <div className="formula-box">
          <strong>Limiting Reagent:</strong> The reactant that runs out first
        </div>
        <div className="formula-box">
          <strong>JEE Advanced Tip:</strong> Always check for limiting reagent in multi-step reactions
        </div>
      </div>
    </>
  );
};

// Stoichiometry Visualization
const StoichiometryVisualization: React.FC<{ reaction: any; coefficients: any }> = ({ reaction, coefficients }) => {
  return (
    <group>
      {/* Reactants */}
      <mesh position={[-2, 0, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={reaction.colors[0]} />
      </mesh>
      <Text position={[-2, -1.2, 0]} fontSize={0.2} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        {reaction.reactants[0]} ({coefficients.reactantA})
      </Text>
      
      <mesh position={[-0.5, 0, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={reaction.colors[1]} />
      </mesh>
      <Text position={[-0.5, -1.2, 0]} fontSize={0.2} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        {reaction.reactants[1]} ({coefficients.reactantB})
      </Text>

      {/* Arrow */}
      <Text position={[0.2, 0, 0]} fontSize={0.4} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        →
      </Text>

      {/* Products */}
      <mesh position={[1.5, 0, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={reaction.colors[2]} />
      </mesh>
      <Text position={[1.5, -1.2, 0]} fontSize={0.2} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        {reaction.products[0]} ({coefficients.product})
      </Text>

      <Text position={[0, -2.5, 0]} fontSize={0.3} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Ratio: {coefficients.reactantA}:{coefficients.reactantB}:{coefficients.product}
      </Text>
    </group>
  );
};

// Thermodynamics Visualization
const ThermodynamicsVisualization: React.FC<{ temperature: number; pressure: number }> = ({ temperature, pressure }) => {
  const enthalpy = temperature * 2.5;
  const entropy = Math.log(temperature);
  const gibbsFreeEnergy = enthalpy - temperature * entropy;
  
  // Temperature affects particle speed and energy
  const particleSpeed = temperature / 300;
  const energyLevel = Math.min(temperature / 500, 1);
  
  return (
    <group>
      {/* Energy Level Visualization */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial 
          color={new THREE.Color().setHSL(energyLevel * 0.3, 1, 0.5)} 
          emissive={new THREE.Color().setHSL(energyLevel * 0.3, 1, 0.2)}
        />
      </mesh>
      <Text position={[0, 1.5, 0]} fontSize={0.35} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Energy Level: {energyLevel.toFixed(2)}
      </Text>
      
      {/* Thermodynamic Values - Positioned above particles */}
      <Text position={[-2.5, 0.5, 0]} fontSize={0.3} color="#ef4444" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        H: {enthalpy.toFixed(1)} J/mol
      </Text>
      <Text position={[0, 0.5, 0]} fontSize={0.3} color="#3b82f6" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        S: {entropy.toFixed(2)} J/K·mol
      </Text>
      <Text position={[2.5, 0.5, 0]} fontSize={0.3} color="#10b981" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        G: {gibbsFreeEnergy.toFixed(1)} J/mol
      </Text>
      
      {/* Molecular Motion Visualization - Moved down */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 1.5 + Math.sin(Date.now() * 0.001 + i) * 0.2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(Date.now() * particleSpeed * 0.001 + i) * 0.3 - 0.5;
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial 
              color={new THREE.Color().setHSL(0.6, 1, 0.7)} 
              emissive={new THREE.Color().setHSL(0.6, 1, 0.3)}
            />
          </mesh>
        );
      })}
      
      {/* Pressure Visualization - Moved down and made more visible */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[1.2, 1.2, pressure * 0.6, 32]} />
        <meshStandardMaterial 
          color={new THREE.Color().setHSL(0.1, 1, 0.6)} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      <Text position={[0, -3, 0]} fontSize={0.35} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Pressure: {pressure.toFixed(1)} atm
      </Text>
      
      {/* Additional visual elements for better clarity */}
      <Text position={[0, -3.5, 0]} fontSize={0.25} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Temperature: {temperature} K
      </Text>
    </group>
  );
};

// New Advanced Labs
const ThermodynamicsLab: React.FC = () => {
  const [temperature, setTemperature] = useState(298);
  const [pressure, setPressure] = useState(1);

  return (
    <>
      <div className="controls-panel">
        <div className="control-group">
          <h3>🔥 Temperature</h3>
          <label>Temperature: {temperature} K</label>
          <input 
            type="range" 
            min="200" 
            max="500" 
            step="10"
            value={temperature}
            onChange={(e) => setTemperature(parseInt(e.target.value))}
          />
        </div>
        <div className="control-group">
          <h3>📏 Pressure</h3>
          <label>Pressure: {pressure} atm</label>
          <input 
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1"
            value={pressure}
            onChange={(e) => setPressure(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          <ThermodynamicsVisualization temperature={temperature} pressure={pressure} />
          <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      <div className="info-panel">
        <h3>📚 Thermodynamics</h3>
        <div className="formula-box">
          <strong>First Law:</strong> ΔU = Q - W
        </div>
        <div className="formula-box">
          <strong>Second Law:</strong> ΔS ≥ Q/T
        </div>
        <div className="formula-box">
          <strong>Gibbs Free Energy:</strong> ΔG = ΔH - TΔS
        </div>
      </div>
    </>
  );
};

// Equilibrium Visualization
const EquilibriumVisualization: React.FC<{ concentration: number; temperature: number }> = ({ concentration, temperature }) => {
  const kc = concentration;
  const forwardRate = kc * 0.5;
  const reverseRate = kc * 0.5;
  
  // Temperature affects reaction rates
  const tempFactor = temperature / 298;
  
  return (
    <group>
      {/* Reactants A + B */}
      <mesh position={[-2, 0, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <Text position={[-2, -1.2, 0]} fontSize={0.3} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        A + B
      </Text>
      
      <mesh position={[-1, 0, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>
      
      {/* Equilibrium Arrow */}
      <Text position={[0, 0, 0]} fontSize={0.5} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        ⇌
      </Text>
      
      {/* Products C + D */}
      <mesh position={[1, 0, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      <Text position={[1, -1.2, 0]} fontSize={0.3} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        C + D
      </Text>
      
      <mesh position={[2, 0, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      
      {/* Equilibrium Constant Display */}
      <Text position={[0, -2, 0]} fontSize={0.4} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Kc = {kc.toFixed(2)}
      </Text>
      
      {/* Dynamic Particle Movement */}
      {Array.from({ length: 15 }).map((_, i) => {
        const time = Date.now() * 0.001;
        const angle = (i / 15) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle + time * tempFactor) * radius;
        const z = Math.sin(angle + time * tempFactor) * radius;
        const y = Math.sin(time * 2 + i) * 0.3;
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? '#3b82f6' : '#10b981'} 
              emissive={i % 2 === 0 ? '#1e40af' : '#059669'}
            />
          </mesh>
        );
      })}
      
      {/* Rate Information */}
      <Text position={[-3, 1, 0]} fontSize={0.25} color="#3b82f6" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Forward: {forwardRate.toFixed(2)}
      </Text>
      <Text position={[3, 1, 0]} fontSize={0.25} color="#10b981" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Reverse: {reverseRate.toFixed(2)}
      </Text>
    </group>
  );
};

const EquilibriumLab: React.FC = () => {
  const [concentration, setConcentration] = useState(0.5);
  const [temperature, setTemperature] = useState(298);

  return (
    <>
      <div className="controls-panel">
        <div className="control-group">
          <h3>⚖️ Concentration</h3>
          <label>Concentration: {concentration} M</label>
          <input 
            type="range" 
            min="0.1" 
            max="2" 
            step="0.1"
            value={concentration}
            onChange={(e) => setConcentration(parseFloat(e.target.value))}
          />
        </div>
        <div className="control-group">
          <h3>🌡️ Temperature</h3>
          <label>Temperature: {temperature} K</label>
          <input 
            type="range" 
            min="250" 
            max="400" 
            step="10"
            value={temperature}
            onChange={(e) => setTemperature(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          <EquilibriumVisualization concentration={concentration} temperature={temperature} />
          <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      <div className="info-panel">
        <h3>📚 Chemical Equilibrium</h3>
        <div className="formula-box">
          <strong>Equilibrium Constant:</strong> Kc = [C][D]/[A][B]
        </div>
        <div className="formula-box">
          <strong>Le Chatelier's Principle:</strong> System responds to stress
        </div>
        <div className="formula-box">
          <strong>Temperature Effect:</strong> K changes with temperature
        </div>
      </div>
    </>
  );
};

// Kinetics Visualization
const KineticsVisualization: React.FC<{ concentration: number; temperature: number }> = ({ concentration, temperature }) => {
  const rateConstant = concentration * temperature / 1000;
  const activationEnergy = temperature * 0.1;
  
  // Temperature affects collision frequency and energy
  const collisionFrequency = temperature / 298;
  const energyLevel = Math.min(temperature / 500, 1);
  
  return (
    <group>
      {/* Activation Energy Barrier */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 0.2, 0.5]} />
        <meshStandardMaterial color="#ef4444" transparent opacity={0.8} />
      </mesh>
      <Text position={[0, 2, 0]} fontSize={0.3} color="#ef4444" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Ea = {activationEnergy.toFixed(1)} kJ/mol
      </Text>
      
      {/* Reactant Molecules */}
      {Array.from({ length: Math.floor(concentration * 10) }).map((_, i) => {
        const time = Date.now() * 0.001;
        const angle = (i / Math.floor(concentration * 10)) * Math.PI * 2;
        const radius = 2;
        const x = Math.cos(angle + time * collisionFrequency) * radius;
        const z = Math.sin(angle + time * collisionFrequency) * radius;
        const y = Math.sin(time * 3 + i) * 0.2;
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial 
              color={new THREE.Color().setHSL(0.6, 1, 0.7)} 
              emissive={new THREE.Color().setHSL(0.6, 1, 0.3)}
            />
          </mesh>
        );
      })}
      
      {/* Product Molecules */}
      {Array.from({ length: Math.floor(rateConstant * 20) }).map((_, i) => {
        const time = Date.now() * 0.001;
        const angle = (i / Math.floor(rateConstant * 20)) * Math.PI * 2;
        const radius = 1.5;
        const x = Math.cos(angle + time * 2) * radius;
        const z = Math.sin(angle + time * 2) * radius;
        const y = Math.sin(time * 4 + i) * 0.3;
        
        return (
          <mesh key={i} position={[x, y - 1, z]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial 
              color={new THREE.Color().setHSL(0.3, 1, 0.7)} 
              emissive={new THREE.Color().setHSL(0.3, 1, 0.3)}
            />
          </mesh>
        );
      })}
      
      {/* Rate Constant Display */}
      <Text position={[0, -2, 0]} fontSize={0.4} color="#3b82f6" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        k = {rateConstant.toFixed(3)} s⁻¹
      </Text>
      
      {/* Energy Level Indicator */}
      <mesh position={[2.5, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, energyLevel * 2, 8]} />
        <meshStandardMaterial 
          color={new THREE.Color().setHSL(energyLevel * 0.3, 1, 0.5)} 
          emissive={new THREE.Color().setHSL(energyLevel * 0.3, 1, 0.2)}
        />
      </mesh>
      <Text position={[2.5, -1, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Energy: {(energyLevel * 100).toFixed(0)}%
      </Text>
    </group>
  );
};

const KineticsLab: React.FC = () => {
  const [concentration, setConcentration] = useState(1);
  const [temperature, setTemperature] = useState(298);

  return (
    <>
      <div className="controls-panel">
        <div className="control-group">
          <h3>⚡ Concentration</h3>
          <label>Concentration: {concentration} M</label>
          <input 
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1"
            value={concentration}
            onChange={(e) => setConcentration(parseFloat(e.target.value))}
          />
        </div>
        <div className="control-group">
          <h3>🌡️ Temperature</h3>
          <label>Temperature: {temperature} K</label>
          <input 
            type="range" 
            min="250" 
            max="400" 
            step="10"
            value={temperature}
            onChange={(e) => setTemperature(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          <KineticsVisualization concentration={concentration} temperature={temperature} />
          <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      <div className="info-panel">
        <h3>📚 Chemical Kinetics</h3>
        <div className="formula-box">
          <strong>Rate Law:</strong> Rate = k[A]^m[B]^n
        </div>
        <div className="formula-box">
          <strong>Arrhenius Equation:</strong> k = Ae^(-Ea/RT)
        </div>
        <div className="formula-box">
          <strong>Half-life:</strong> t₁/₂ = ln(2)/k
        </div>
      </div>
    </>
  );
};

// Electrochemistry Visualization
const ElectrochemistryVisualization: React.FC<{ voltage: number; current: number }> = ({ voltage, current }) => {
  const power = voltage * current;
  const resistance = voltage / current;
  
  // Visual intensity based on power
  const intensity = Math.min(power / 5, 1);
  const bulbIntensity = Math.min(voltage / 3, 1);
  
  return (
    <group>
      {/* Battery - Left Side */}
      <group position={[-3, 0, 0]}>
        {/* Battery Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 1.2, 0.4]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        
        {/* Battery Terminals */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 8]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 8]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        
        {/* Battery Label */}
        <Text position={[0, -1.5, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Battery
        </Text>
        <Text position={[0, -1.8, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          {voltage}V
        </Text>
      </group>
      
      {/* Wire from Battery to Switch */}
      <mesh position={[-1.5, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      
      {/* Switch */}
      <group position={[-1, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.3, 0.1, 0.2]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
        <Text position={[0, -0.8, 0]} fontSize={0.2} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Switch
        </Text>
      </group>
      
      {/* Wire from Switch to Bulb */}
      <mesh position={[0.5, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      
      {/* Light Bulb - Center */}
      <group position={[1.5, 0, 0]}>
        {/* Bulb Glass */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.8}
            emissive={new THREE.Color().setHSL(0.1, 1, bulbIntensity * 0.3)}
          />
        </mesh>
        
        {/* Bulb Filament */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial 
            color="#fbbf24" 
            emissive={new THREE.Color().setHSL(0.1, 1, bulbIntensity * 0.5)}
          />
        </mesh>
        
        {/* Bulb Base */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.2, 8]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
        
        {/* Bulb Label */}
        <Text position={[0, -1, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Bulb
        </Text>
        <Text position={[0, -1.3, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          {current}A
        </Text>
      </group>
      
      {/* Wire from Bulb to Resistor */}
      <mesh position={[2.5, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      
      {/* Resistor - Right Side */}
      <group position={[3.5, 0, 0]}>
        {/* Resistor Body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        
        {/* Resistor Bands */}
        <mesh position={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.1, 8]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.1, 8]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        
        {/* Resistor Label */}
        <Text position={[0, -1, 0]} fontSize={0.25} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          Resistor
        </Text>
        <Text position={[0, -1.3, 0]} fontSize={0.2} color="#64748b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
          {resistance.toFixed(1)}Ω
        </Text>
      </group>
      
      {/* Return Wire */}
      <mesh position={[0, -0.8, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 6.5, 8]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      
      {/* Electrical Field Particles */}
      {Array.from({ length: 15 }).map((_, i) => {
        const time = Date.now() * 0.001;
        const angle = (i / 15) * Math.PI * 2;
        const radius = 4;
        const x = Math.cos(angle + time * intensity) * radius;
        const z = Math.sin(angle + time * intensity) * radius;
        const y = Math.sin(time * 2 + i) * 0.3;
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial 
              color={new THREE.Color().setHSL(0.6, 1, intensity)} 
              emissive={new THREE.Color().setHSL(0.6, 1, intensity * 0.3)}
            />
          </mesh>
        );
      })}
      
      {/* Circuit Information Display */}
      <Text position={[0, -2.5, 0]} fontSize={0.35} color="#3b82f6" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Power: {power.toFixed(2)} W
      </Text>
      
      <Text position={[0, -2.8, 0]} fontSize={0.35} color="#ef4444" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Resistance: {resistance.toFixed(2)} Ω
      </Text>
      
      {/* Circuit Diagram Labels */}
      <Text position={[-3, 1.5, 0]} fontSize={0.2} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Voltage Source
      </Text>
      
      <Text position={[1.5, 1.5, 0]} fontSize={0.2} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Load (Bulb)
      </Text>
      
      <Text position={[3.5, 1.5, 0]} fontSize={0.2} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0} outlineColor="transparent">
        Resistor
      </Text>
    </group>
  );
};

const ElectrochemistryLab: React.FC = () => {
  const [voltage, setVoltage] = useState(1.5);
  const [current, setCurrent] = useState(0.5);

  return (
    <>
      <div className="controls-panel">
        <div className="control-group">
          <h3>🔋 Voltage</h3>
          <label>Voltage: {voltage} V</label>
          <input 
            type="range" 
            min="0.5" 
            max="5" 
            step="0.1"
            value={voltage}
            onChange={(e) => setVoltage(parseFloat(e.target.value))}
          />
        </div>
        <div className="control-group">
          <h3>⚡ Current</h3>
          <label>Current: {current} A</label>
          <input 
            type="range" 
            min="0.1" 
            max="2" 
            step="0.1"
            value={current}
            onChange={(e) => setCurrent(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="visualization-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          <ElectrochemistryVisualization voltage={voltage} current={current} />
          <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      <div className="info-panel">
        <h3>📚 Electrochemistry</h3>
        <div className="formula-box">
          <strong>Nernst Equation:</strong> E = E° - (RT/nF)lnQ
        </div>
        <div className="formula-box">
          <strong>Faraday's Law:</strong> Q = nF
        </div>
        <div className="formula-box">
          <strong>Power:</strong> P = VI
        </div>
      </div>
    </>
  );
};

export default ChemistryAdvancedPlayground;
