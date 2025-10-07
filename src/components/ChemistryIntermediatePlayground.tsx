import React, { useState, useEffect, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  element?: string;
}

interface Atom {
  id: number;
  element: string;
  x: number;
  y: number;
  color: string;
}

interface MoleData {
  mass: number;
  moles: number;
  particles: number;
  volume: number;
}

const ChemistryIntermediatePlayground: React.FC = () => {
  // Navigation state
  const [activePlayground, setActivePlayground] = useState('states');
  
  // States of Matter
  const [temperature, setTemperature] = useState(25);
  const [currentState, setCurrentState] = useState<'solid' | 'liquid' | 'gas'>('liquid');
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Molecule Builder
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [selectedAtom, setSelectedAtom] = useState<string>('H');
  const [draggedAtom, setDraggedAtom] = useState<number | null>(null);
  const atomIdRef = useRef(0);
  
  // Mole Bridge
  const [moleInput, setMoleInput] = useState({ value: 0, unit: 'mass' });
  const [molarMass, setMolarMass] = useState(18); // Default H2O
  const [moleData, setMoleData] = useState<MoleData>({
    mass: 0, moles: 0, particles: 0, volume: 0
  });
  
  // Chemical Laws
  const [lawDemo, setLawDemo] = useState('conservation');
  const [reactantMasses, setReactantMasses] = useState({ a: 10, b: 5 });
  
  // Limiting Reagent
  const [limitingInputs, setLimitingInputs] = useState({ r1: 0, r2: 0 });
  const [limitingResult, setLimitingResult] = useState('');
  
  // Stoichiometry
  const [stoichReaction, setStoichReaction] = useState('combustion');
  const [stoichInput, setStoichInput] = useState(0);
  const [stoichResults, setStoichResults] = useState<Record<string, number>>({});

  // Percentage Composition
  const [formula, setFormula] = useState('H2O');
  const [composition, setComposition] = useState<Record<string, number>>({});

  // Initialize particles for states of matter
  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 24; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 280 + 10,
        y: Math.random() * 180 + 10,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
      });
    }
    setParticles(newParticles);
  }, []);

  // Animate particles based on temperature
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => {
        let { x, y, vx, vy } = p;
        
        // Temperature affects velocity - more dramatic scaling
        const tempFactor = Math.max(0.1, Math.pow(temperature / 25, 1.5));
        
        if (temperature < 0) {
          // Solid - minimal movement
          vx *= 0.95;
          vy *= 0.95;
          x += vx * 0.05 * tempFactor;
          y += vy * 0.05 * tempFactor;
        } else if (temperature < 100) {
          // Liquid - moderate movement
          vx += (Math.random() - 0.5) * 0.5 * tempFactor;
          vy += (Math.random() - 0.5) * 0.5 * tempFactor;
          x += vx * 0.8 * tempFactor;
          y += vy * 0.8 * tempFactor;
        } else {
          // Gas - high movement
          vx += (Math.random() - 0.5) * 1.2 * tempFactor;
          vy += (Math.random() - 0.5) * 1.2 * tempFactor;
          x += vx * 1.5 * tempFactor;
          y += vy * 1.5 * tempFactor;
        }
        
        // Boundary collision
        if (x <= 0 || x >= 290) vx *= -0.9;
        if (y <= 0 || y >= 190) vy *= -0.9;
        
        x = Math.max(0, Math.min(290, x));
        y = Math.max(0, Math.min(190, y));
        
        // Velocity damping - less damping for higher temperatures
        const damping = temperature < 0 ? 0.95 : temperature < 100 ? 0.98 : 0.99;
        vx *= damping;
        vy *= damping;
        
        return { ...p, x, y, vx, vy };
      }));
    }, 30); // Faster update for smoother animation

    return () => clearInterval(interval);
  }, [temperature]);

  // Update current state based on temperature
  useEffect(() => {
    if (temperature < 0) setCurrentState('solid');
    else if (temperature < 100) setCurrentState('liquid');
    else setCurrentState('gas');
  }, [temperature]);

  // Atom colors and properties
  const atomColors = {
    H: '#ff6b6b', // Red
    O: '#4ecdc4', // Turquoise  
    C: '#45b7d1', // Blue
    N: '#6c5ce7', // Purple
    Cl: '#a8e6cf', // Green
    Na: '#ffd93d', // Yellow
    S: '#ff9f43', // Orange
    P: '#a55eea', // Violet
    F: '#26de81', // Light Green
    Br: '#fd79a8', // Pink
  };

  // Common molecules for intermediate students
  const commonMolecules = [
    { name: 'Water', formula: 'H2O', atoms: ['H', 'H', 'O'], description: 'Essential for life' },
    { name: 'Carbon Dioxide', formula: 'CO2', atoms: ['C', 'O', 'O'], description: 'Greenhouse gas' },
    { name: 'Methane', formula: 'CH4', atoms: ['C', 'H', 'H', 'H', 'H'], description: 'Natural gas' },
    { name: 'Ammonia', formula: 'NH3', atoms: ['N', 'H', 'H', 'H'], description: 'Cleaning agent' },
    { name: 'Hydrogen Chloride', formula: 'HCl', atoms: ['H', 'Cl'], description: 'Strong acid' },
    { name: 'Sodium Chloride', formula: 'NaCl', atoms: ['Na', 'Cl'], description: 'Table salt' },
    { name: 'Sulfuric Acid', formula: 'H2SO4', atoms: ['H', 'H', 'S', 'O', 'O', 'O', 'O'], description: 'Industrial acid' },
    { name: 'Phosphoric Acid', formula: 'H3PO4', atoms: ['H', 'H', 'H', 'P', 'O', 'O', 'O', 'O'], description: 'Food additive' }
  ];

  // Add atom to molecule builder
  const addAtom = (element: string, x = 150, y = 100) => {
    const newAtom: Atom = {
      id: atomIdRef.current++,
      element,
      x,
      y,
      color: atomColors[element as keyof typeof atomColors] || '#gray'
    };
    setAtoms(prev => [...prev, newAtom]);
  };

  // Build a common molecule
  const buildMolecule = (molecule: typeof commonMolecules[0]) => {
    setAtoms([]);
    const centerX = 150;
    const centerY = 100;
    const radius = 40;
    
    molecule.atoms.forEach((element, index) => {
      const angle = (index / molecule.atoms.length) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      addAtom(element, x, y);
    });
  };

  // Analyze current molecule
  const analyzeMolecule = () => {
    const elementCount: Record<string, number> = {};
    atoms.forEach(atom => {
      elementCount[atom.element] = (elementCount[atom.element] || 0) + 1;
    });
    
    let formula = '';
    Object.entries(elementCount).forEach(([element, count]) => {
      formula += element + (count > 1 ? count : '');
    });
    
    return { formula, elementCount };
  };

  // Handle atom drag
  const handleAtomDrag = (id: number, e: React.DragEvent) => {
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setAtoms(prev => prev.map(atom => 
      atom.id === id ? { ...atom, x: Math.max(0, Math.min(280, x)), y: Math.max(0, Math.min(180, y)) } : atom
    ));
  };

  // Calculate mole bridge
  useEffect(() => {
    const { value, unit } = moleInput;
    const avogadro = 6.022e23;
    
    let moles = 0;
    if (unit === 'mass') moles = value / molarMass;
    else if (unit === 'moles') moles = value;
    else if (unit === 'particles') moles = value / avogadro;
    else if (unit === 'volume') moles = value / 22.4;
    
    setMoleData({
      mass: moles * molarMass,
      moles,
      particles: moles * avogadro,
      volume: moles * 22.4
    });
  }, [moleInput, molarMass]);

  // Calculate limiting reagent
  const calculateLimitingReagent = () => {
    const { r1, r2 } = limitingInputs;
    if (r1 <= 0 || r2 <= 0) {
      setLimitingResult('Enter positive values for both reactants! 🤔');
      return;
    }
    
    // Example: 2A + B → products (2:1 ratio)
    const ratioA = 2; // Coefficient of A
    const ratioB = 1; // Coefficient of B
    
    // Calculate how much of each reactant is needed based on the other
    const neededA = r2 * (ratioA / ratioB); // Amount of A needed for given B
    const neededB = r1 * (ratioB / ratioA); // Amount of B needed for given A
    
    // Determine limiting reagent
    if (r1 < neededA) {
      const excessB = r2 - neededB;
      setLimitingResult(`🏁 A is limiting! Excess B: ${excessB.toFixed(2)} mol`);
    } else if (r2 < neededB) {
      const excessA = r1 - neededA;
      setLimitingResult(`🏁 B is limiting! Excess A: ${excessA.toFixed(2)} mol`);
    } else {
      setLimitingResult(`⚖️ Perfect stoichiometric ratio! No excess reactants.`);
    }
  };

  // Calculate percentage composition
  useEffect(() => {
    const atomicMasses: Record<string, number> = { 
      H: 1.008, O: 15.999, C: 12.011, N: 14.007, Cl: 35.453, Na: 22.990,
      S: 32.065, P: 30.974, F: 18.998, Br: 79.904, I: 126.904, K: 39.098,
      Ca: 40.078, Mg: 24.305, Al: 26.982, Si: 28.085, Fe: 55.845, Cu: 63.546,
      Zn: 65.38, Ag: 107.868, Au: 196.967, Pb: 207.2, Hg: 200.59, Sn: 118.710
    };
    
    // Enhanced parser for chemical formulas
    const parseFormula = (formula: string) => {
      const elements: Record<string, number> = {};
      
      // Handle parentheses and complex formulas
      let cleanFormula = formula.replace(/\s/g, '').toUpperCase();
      
      // Simple element parsing
      const matches = cleanFormula.match(/([A-Z][a-z]?)(\d*)/g) || [];
      
      matches.forEach(match => {
        const elementMatch = match.match(/[A-Z][a-z]?/);
        const countMatch = match.match(/\d+/);
        
        if (elementMatch) {
          const element = elementMatch[0];
          const count = countMatch ? parseInt(countMatch[0]) : 1;
          elements[element] = (elements[element] || 0) + count;
        }
      });
      
      return elements;
    };
    
    const elements = parseFormula(formula);
    let totalMass = 0;
    const elementMasses: Record<string, number> = {};
    
    Object.entries(elements).forEach(([element, count]) => {
      const atomicMass = atomicMasses[element] || 0;
      if (atomicMass === 0) {
        console.warn(`Unknown element: ${element}`);
        return;
      }
      const mass = atomicMass * count;
      elementMasses[element] = mass;
      totalMass += mass;
    });
    
    const percentages: Record<string, number> = {};
    Object.entries(elementMasses).forEach(([element, mass]) => {
      percentages[element] = totalMass > 0 ? (mass / totalMass) * 100 : 0;
    });
    
    setComposition(percentages);
  }, [formula]);

  const playgrounds = [
    { id: 'states', name: '🌡️ States of Matter', emoji: '🧊💧☁️' },
    { id: 'molecules', name: '⚛️ Molecule Builder', emoji: '🔬🧪' },
    { id: 'moles', name: '👑 Mole Bridge', emoji: '🌉📊' },
    { id: 'laws', name: '📜 Chemical Laws', emoji: '⚖️🔬' },
    { id: 'limiting', name: '🏁 Limiting Reagent', emoji: '⛔🏃‍♂️' },
    { id: 'composition', name: '📊 % Composition', emoji: '🥧📈' }
  ];

  return (
    <div className="chemistry-playground">
      <style>{`
        .chemistry-playground {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
          min-height: 100vh;
          padding: 20px;
          font-family: 'Inter', sans-serif;
          color: #1e293b;
        }

        .playground-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .playground-header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .subtitle {
          font-size: 1.2rem;
          color: #64748b;
          font-weight: 500;
        }

        .playground-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          justify-content: center;
          margin-bottom: 30px;
        }

        .nav-btn {
          padding: 16px 24px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          color: #475569;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .nav-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s;
        }

        .nav-btn:hover::before {
          left: 100%;
        }

        .nav-btn:hover {
          border-color: #3b82f6;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .nav-btn.active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-color: #3b82f6;
          color: white;
          transform: scale(1.05);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }

        .playground-content {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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

        .controls {
          margin-bottom: 30px;
        }

        .controls h3 {
          color: #1e293b;
          margin-bottom: 20px;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .temp-slider-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .temp-slider {
          width: 100%;
          height: 8px;
          border-radius: 10px;
          background: #e2e8f0;
          outline: none;
          -webkit-appearance: none;
          position: relative;
        }

        .temp-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          border: 3px solid white;
          transition: all 0.2s ease;
        }

        .temp-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
        }

        .temp-display {
          text-align: center;
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e293b;
        }

        .state-solid { color: #3b82f6; }
        .state-liquid { color: #8b5cf6; }
        .state-gas { color: #ec4899; }

        .particle-container {
          position: relative;
          width: 300px;
          height: 200px;
          margin: 20px auto;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          border-radius: 20px;
          border: 2px solid #e2e8f0;
          overflow: hidden;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ecdc4;
          box-shadow: 0 0 10px rgba(78,205,196,0.5);
        }

        .particle-solid {
          background: #3b82f6;
          animation: vibrate 0.5s ease-in-out infinite alternate;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
        }

        .particle-liquid {
          background: #8b5cf6;
          animation: flow 2s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
        }

        .particle-gas {
          background: #ec4899;
          animation: zoom 0.8s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(236, 72, 153, 0.6);
        }

        @keyframes vibrate {
          0% { transform: translateX(-2px); }
          100% { transform: translateX(2px); }
        }

        @keyframes flow {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(10px) translateY(5px); }
        }

        @keyframes zoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .state-info {
          margin-top: 20px;
        }

        .state-card {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          padding: 24px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .state-card h4 {
          color: #1e293b;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .atom-palette {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 30px;
          justify-content: center;
          align-items: center;
        }

        .atom-btn {
          width: 56px;
          height: 56px;
          border: 3px solid white;
          border-radius: 50%;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .atom-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        }

        .clear-btn {
          background: #f1f5f9;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          color: #64748b;
          padding: 12px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .clear-btn:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
          color: #475569;
        }

        .molecule-canvas {
          position: relative;
          width: 400px;
          height: 250px;
          margin: 20px auto;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 20px;
          border: 2px solid #e2e8f0;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .atom-3d {
          position: absolute;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: move;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: 3px solid white;
        }

        .atom-3d:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0,0,0,0.25);
        }

        .atom-symbol {
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .atom-glow {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: inherit;
          opacity: 0.3;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.1; }
        }

        .molecule-info {
          text-align: center;
          margin-top: 20px;
        }

        .molecule-info h4 {
          color: #4ecdc4;
          margin-bottom: 10px;
        }

        .tip {
          color: #ffd700;
          font-style: italic;
        }

        .mole-inputs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          color: #374151;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-group input, .input-group select {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          color: #1e293b;
          font-size: 1rem;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .input-group input:focus, .input-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .input-group input::placeholder {
          color: #9ca3af;
        }

        .mole-bridge {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 30px 0;
          padding: 24px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .bridge-section {
          text-align: center;
          padding: 20px;
          border-radius: 16px;
          background: white;
          min-width: 120px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .bridge-section.active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          transform: scale(1.05);
          border-color: #3b82f6;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }

        .bridge-section h4 {
          margin-bottom: 10px;
          font-size: 1rem;
          font-weight: 600;
        }

        .bridge-value {
          font-size: 1.2rem;
          font-weight: bold;
        }

        .bridge-arrow {
          font-size: 2rem;
          color: #3b82f6;
          font-weight: bold;
        }

        .mole-explanation {
          text-align: center;
          margin-top: 20px;
        }

        .mole-explanation p {
          margin-bottom: 10px;
          font-size: 1.1rem;
        }

        .reaction-setup {
          text-align: center;
          margin-bottom: 30px;
        }

        .reaction-equation {
          font-size: 1.8rem;
          font-weight: bold;
          color: #3b82f6;
          margin: 24px 0;
          text-align: center;
          padding: 16px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .reactant-inputs {
          display: flex;
          gap: 40px;
          justify-content: center;
          margin: 30px 0;
          align-items: flex-end;
        }

        .reactant {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }

        .reactant label {
          color: #374151;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .reactant input {
          padding: 16px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          color: #1e293b;
          font-size: 1.1rem;
          text-align: center;
          font-weight: 600;
          width: 140px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .reactant input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .reactant input:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .calculate-btn {
          padding: 16px 32px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
          border-radius: 16px;
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: 30px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        .calculate-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .calculate-btn:hover::before {
          left: 100%;
        }

        .calculate-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
        }

        .race-track {
          margin: 30px 0;
        }

        .track {
          height: 40px;
          background: #f1f5f9;
          border-radius: 20px;
          margin: 15px 0;
          position: relative;
          overflow: hidden;
          border: 2px solid #e2e8f0;
        }

        .runner {
          height: 100%;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          transition: width 0.5s ease;
          font-size: 1.1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .runner-a {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }

        .runner-b {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .result-display {
          text-align: center;
          margin: 20px 0;
          padding: 20px;
          background: rgba(255,255,255,0.1);
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .result-display h4 {
          color: #4ecdc4;
          margin-bottom: 15px;
        }

        .concept-tip {
          text-align: center;
          margin-top: 20px;
          padding: 20px;
          background: rgba(255,215,0,0.1);
          border-radius: 15px;
          border: 1px solid rgba(255,215,0,0.3);
        }

        .concept-tip p {
          margin-bottom: 10px;
          color: #ffd700;
        }

        .formula-input {
          text-align: center;
          margin-bottom: 30px;
        }

        .formula-input h3 {
          color: #4ecdc4;
          margin-bottom: 20px;
        }

        .composition-pie {
          margin: 30px 0;
        }

        .composition-pie h4 {
          color: #4ecdc4;
          text-align: center;
          margin-bottom: 20px;
        }

        .composition-bars {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .composition-bar {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .element-label {
          min-width: 50px;
          font-weight: bold;
          color: #4ecdc4;
        }

        .percentage-bar {
          flex: 1;
          height: 30px;
          background: rgba(255,255,255,0.2);
          border-radius: 15px;
          overflow: hidden;
          position: relative;
        }

        .percentage-fill {
          height: 100%;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          transition: width 0.5s ease;
        }

        .composition-data {
          margin: 30px 0;
        }

        .composition-data h4 {
          color: #4ecdc4;
          margin-bottom: 20px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(255,255,255,0.1);
          border-radius: 15px;
          overflow: hidden;
        }

        .data-table th, .data-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }

        .data-table th {
          background: rgba(255,255,255,0.2);
          color: #4ecdc4;
          font-weight: bold;
        }

        .mini-bar {
          width: 100px;
          height: 10px;
          background: rgba(255,255,255,0.2);
          border-radius: 5px;
          overflow: hidden;
        }

        .mini-fill {
          height: 100%;
          border-radius: 5px;
          transition: width 0.5s ease;
        }

        .real-world {
          text-align: center;
          margin-top: 20px;
          padding: 20px;
          background: rgba(255,255,255,0.1);
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .real-world p {
          color: #ffd700;
          font-style: italic;
        }

        /* Molecule Builder Enhancements */
        .molecule-templates {
          margin-bottom: 30px;
        }

        .molecule-templates h3 {
          color: #1e293b;
          margin-bottom: 20px;
          text-align: center;
          font-weight: 700;
          font-size: 1.3rem;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .template-btn {
          padding: 16px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .template-btn:hover {
          background: #f8fafc;
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .template-formula {
          font-size: 1.5rem;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 8px;
        }

        .template-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 5px;
          color: #1e293b;
        }

        .template-desc {
          font-size: 0.9rem;
          color: #64748b;
        }

        .molecule-analysis {
          margin-top: 20px;
          text-align: center;
        }

        .molecule-analysis h4 {
          color: #1e293b;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .analysis-results {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          padding: 24px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          margin-bottom: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .element-breakdown {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-top: 10px;
        }

        .element-count {
          background: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.9rem;
          border: 1px solid #e2e8f0;
          color: #1e293b;
          font-weight: 600;
        }

        /* Chemical Laws Styles */
        .laws-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .laws-header h3 {
          color: #1e293b;
          font-size: 2rem;
          margin-bottom: 10px;
          font-weight: 800;
        }

        .laws-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .law-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .law-card h4 {
          color: #1e293b;
          margin-bottom: 15px;
          font-size: 1.3rem;
          font-weight: 700;
        }

        .law-demo {
          background: #f8fafc;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 15px;
          border: 1px solid #e2e8f0;
        }

        .reactants {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .molecule {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: bold;
          color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .mass-calculation {
          text-align: center;
        }

        .mass-calculation p {
          margin: 5px 0;
        }

        .result {
          color: #10b981;
          font-weight: bold;
        }

        .law-explanation {
          color: #64748b;
          line-height: 1.6;
        }

        .compound-examples {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .compound {
          text-align: center;
        }

        .formula {
          font-size: 1.5rem;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 5px;
        }

        .ratio {
          color: #8b5cf6;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .multiple-examples {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .compound-pair {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
        }

        .atomic-principles {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .principle {
          background: #f8fafc;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.9rem;
          border: 1px solid #e2e8f0;
          color: #1e293b;
        }

        .laws-interactive {
          background: white;
          padding: 32px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .laws-interactive h4 {
          color: #1e293b;
          margin-bottom: 20px;
          text-align: center;
          font-weight: 700;
        }

        .demo-controls {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }

        .demo-btn {
          padding: 12px 24px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .demo-btn:hover {
          background: #f8fafc;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .demo-visualization {
          background: #f8fafc;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .reaction-balance {
          display: flex;
          align-items: center;
          gap: 20px;
          justify-content: center;
        }

        .side {
          text-align: center;
          flex: 1;
        }

        .side h5 {
          color: #1e293b;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .molecules {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
          margin-bottom: 10px;
        }

        .mass {
          color: #8b5cf6;
          font-weight: bold;
        }

        .arrow {
          font-size: 2rem;
          color: #3b82f6;
          font-weight: bold;
        }

        .proportion-examples {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .example h5 {
          color: #1e293b;
          margin-bottom: 10px;
          text-align: center;
          font-weight: 700;
        }

        .ratio-bar {
          display: flex;
          height: 30px;
          border-radius: 15px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .h-portion, .c-portion, .o-portion {
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .h-portion {
          background: #3b82f6;
        }

        .c-portion {
          background: #8b5cf6;
        }

        .o-portion {
          background: #ec4899;
        }

        .multiple-examples {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .compounds {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 10px;
        }

        .compound {
          background: white;
          padding: 12px 18px;
          border-radius: 10px;
          font-weight: bold;
          border: 1px solid #e2e8f0;
          color: #1e293b;
        }

        .ratio {
          text-align: center;
          color: #8b5cf6;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .playground-nav {
            flex-direction: column;
            align-items: center;
          }
          
          .nav-btn {
            width: 100%;
            max-width: 300px;
          }
          
          .mole-bridge {
            flex-direction: column;
            gap: 15px;
          }
          
          .bridge-arrow {
            transform: rotate(90deg);
          }
          
          .reactant-inputs {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>

      <div className="playground-header">
        <h1>🧪 Chapter 1: Chemistry Playground</h1>
        <p className="subtitle">Visual concepts that stick forever! 🚀</p>
      </div>

      {/* Navigation */}
      <div className="playground-nav">
        {playgrounds.map(pg => (
          <button
            key={pg.id}
            className={`nav-btn ${activePlayground === pg.id ? 'active' : ''}`}
            onClick={() => setActivePlayground(pg.id)}
          >
            <span className="emoji">{pg.emoji}</span>
            <span className="name">{pg.name}</span>
          </button>
        ))}
      </div>

      {/* States of Matter */}
      {activePlayground === 'states' && (
        <div className="playground-content states-playground">
          <div className="controls">
            <h3>🌡️ Temperature Controller</h3>
            <div className="temp-slider-container">
              <input
                type="range"
                min={-50}
                max={200}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="temp-slider"
              />
              <div className="temp-display">
                {temperature}°C | State: <span className={`state-${currentState}`}>{currentState.toUpperCase()}</span>
              </div>
            </div>
          </div>
          
          <div className="particle-container">
            {particles.map(particle => (
              <div
                key={particle.id}
                className={`particle particle-${currentState}`}
                style={{
                  left: particle.x,
                  top: particle.y,
                  animationDelay: `${particle.id * 0.1}s`
                }}
              />
            ))}
          </div>
          
          <div className="state-info">
            <div className="state-card">
              <h4>Current State Behavior:</h4>
              {currentState === 'solid' && <p>🧊 Particles vibrate in fixed positions - rigid structure!</p>}
              {currentState === 'liquid' && <p>💧 Particles slide past each other - takes container shape!</p>}
              {currentState === 'gas' && <p>☁️ Particles zoom everywhere - fills all available space!</p>}
            </div>
          </div>
        </div>
      )}

      {/* Molecule Builder */}
      {activePlayground === 'molecules' && (
        <div className="playground-content molecule-playground">
          <div className="molecule-templates">
            <h3>🧪 Common Molecules</h3>
            <div className="template-grid">
              {commonMolecules.map((molecule, index) => (
                <button
                  key={index}
                  className="template-btn"
                  onClick={() => buildMolecule(molecule)}
                >
                  <div className="template-formula">{molecule.formula}</div>
                  <div className="template-name">{molecule.name}</div>
                  <div className="template-desc">{molecule.description}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="atom-palette">
            <h3>🧰 Atom Toolkit</h3>
            {Object.entries(atomColors).map(([element, color]) => (
              <button
                key={element}
                className="atom-btn"
                style={{ backgroundColor: color }}
                onClick={() => addAtom(element)}
              >
                {element}
              </button>
            ))}
            <button className="clear-btn" onClick={() => setAtoms([])}>🗑️ Clear</button>
          </div>
          
          <div className="molecule-canvas">
            {atoms.map(atom => (
              <div
                key={atom.id}
                className="atom-3d"
                style={{
                  left: atom.x,
                  top: atom.y,
                  backgroundColor: atom.color,
                  transform: `translate(-50%, -50%) rotateY(${atom.id * 45}deg)`
                }}
                draggable
                onDragEnd={(e) => handleAtomDrag(atom.id, e)}
              >
                <span className="atom-symbol">{atom.element}</span>
                <div className="atom-glow"></div>
              </div>
            ))}
          </div>
          
          <div className="molecule-analysis">
            <h4>🔬 Molecule Analysis:</h4>
            {atoms.length > 0 ? (
              <div className="analysis-results">
                <p><strong>Formula:</strong> {analyzeMolecule().formula}</p>
                <p><strong>Atoms:</strong> {atoms.length}</p>
                <div className="element-breakdown">
                  {Object.entries(analyzeMolecule().elementCount).map(([element, count]) => (
                    <span key={element} className="element-count">
                      {element}: {count}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p>Add atoms to see analysis!</p>
            )}
            <p className="tip">💡 Drag atoms to arrange them properly! Try building H₂O, CO₂, or CH₄!</p>
          </div>
        </div>
      )}

      {/* Mole Bridge */}
      {activePlayground === 'moles' && (
        <div className="playground-content mole-playground">
          <div className="mole-inputs">
            <h3>👑 The Mole Bridge</h3>
            <div className="input-group">
              <label>Given Value:</label>
              <input
                type="number"
                value={moleInput.value}
                onChange={(e) => setMoleInput(prev => ({ ...prev, value: Number(e.target.value) }))}
                placeholder="Enter amount"
              />
            </div>
            <div className="input-group">
              <label>Unit:</label>
              <select
                value={moleInput.unit}
                onChange={(e) => setMoleInput(prev => ({ ...prev, unit: e.target.value }))}
              >
                <option value="mass">Mass (g)</option>
                <option value="moles">Moles (mol)</option>
                <option value="particles">Particles (#)</option>
                <option value="volume">Volume at STP (L)</option>
              </select>
            </div>
            <div className="input-group">
              <label>Molar Mass (g/mol):</label>
              <input
                type="number"
                value={molarMass}
                onChange={(e) => setMolarMass(Number(e.target.value))}
                placeholder="18 for H2O"
              />
            </div>
          </div>
          
          <div className="mole-bridge">
            <div className="bridge-section">
              <h4>📏 Mass</h4>
              <div className="bridge-value">{moleData.mass.toFixed(2)} g</div>
            </div>
            <div className="bridge-arrow">→</div>
            <div className="bridge-section active">
              <h4>👑 Moles</h4>
              <div className="bridge-value">{moleData.moles.toFixed(4)} mol</div>
            </div>
            <div className="bridge-arrow">→</div>
            <div className="bridge-section">
              <h4>🔢 Particles</h4>
              <div className="bridge-value">{moleData.particles.toExponential(2)}</div>
            </div>
            <div className="bridge-arrow">→</div>
            <div className="bridge-section">
              <h4>📦 Volume</h4>
              <div className="bridge-value">{moleData.volume.toFixed(2)} L</div>
            </div>
          </div>
          
          <div className="mole-explanation">
            <p>💡 The mole is the universal translator between the atomic world and lab measurements!</p>
            <p>🔗 1 mole = 6.022 × 10²³ particles = 22.4 L gas at STP</p>
          </div>
        </div>
      )}

      {/* Limiting Reagent */}
      {activePlayground === 'limiting' && (
        <div className="playground-content limiting-playground">
          <div className="reaction-setup">
            <h3>🏁 Limiting Reagent Race</h3>
            <div className="reaction-equation">2A + B → Products</div>
            <div className="reactant-inputs">
              <div className="reactant">
                <label>Reactant A (mol):</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={limitingInputs.r1}
                  onChange={(e) => setLimitingInputs(prev => ({ ...prev, r1: Number(e.target.value) }))}
                />
              </div>
              <div className="reactant">
                <label>Reactant B (mol):</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={limitingInputs.r2}
                  onChange={(e) => setLimitingInputs(prev => ({ ...prev, r2: Number(e.target.value) }))}
                />
              </div>
            </div>
            <button className="calculate-btn" onClick={calculateLimitingReagent}>
              🏃‍♂️ Start the Race!
            </button>
          </div>
          
          <div className="race-track">
            <div className="track track-a">
              <div 
                className="runner runner-a"
                style={{ 
                  width: `${Math.min(100, (limitingInputs.r1 / Math.max(limitingInputs.r1, limitingInputs.r2 * 2)) * 100)}%`
                }}
              >
                A
              </div>
            </div>
            <div className="track track-b">
              <div 
                className="runner runner-b"
                style={{ 
                  width: `${Math.min(100, (limitingInputs.r2 * 2 / Math.max(limitingInputs.r1, limitingInputs.r2 * 2)) * 100)}%`
                }}
              >
                B
              </div>
            </div>
          </div>
          
          <div className="result-display">
            <h4>🏆 Race Result:</h4>
            <p>{limitingResult || 'Enter reactant amounts to see who wins!'}</p>
          </div>
          
          <div className="concept-tip">
            <p>💡 Like making sandwiches: 10 slices bread + 3 pieces cheese = only 3 sandwiches!</p>
            <p>The cheese runs out first (limiting), bread is excess! 🥪</p>
          </div>
        </div>
      )}

      {/* Chemical Laws */}
      {activePlayground === 'laws' && (
        <div className="playground-content laws-playground">
          <div className="laws-header">
            <h3>📜 Chemical Laws Explorer</h3>
            <p>Discover the fundamental laws that govern chemical reactions!</p>
          </div>
          
          <div className="laws-grid">
            <div className="law-card">
              <h4>⚖️ Law of Conservation of Mass</h4>
              <div className="law-demo">
                <div className="reactants">
                  <div className="molecule">H₂</div>
                  <span>+</span>
                  <div className="molecule">O₂</div>
                  <span>→</span>
                  <div className="molecule">H₂O</div>
                </div>
                <div className="mass-calculation">
                  <p>Mass before: 2g + 16g = 18g</p>
                  <p>Mass after: 18g</p>
                  <p className="result">✅ Mass conserved!</p>
                </div>
              </div>
              <p className="law-explanation">
                Matter cannot be created or destroyed in chemical reactions. 
                The total mass of reactants equals the total mass of products.
              </p>
            </div>
            
            <div className="law-card">
              <h4>🔢 Law of Definite Proportions</h4>
              <div className="law-demo">
                <div className="compound-examples">
                  <div className="compound">
                    <div className="formula">H₂O</div>
                    <div className="ratio">Always 2:1 H:O ratio</div>
                  </div>
                  <div className="compound">
                    <div className="formula">CO₂</div>
                    <div className="ratio">Always 1:2 C:O ratio</div>
                  </div>
                </div>
              </div>
              <p className="law-explanation">
                A compound always contains the same elements in the same 
                proportion by mass, regardless of how it's prepared.
              </p>
            </div>
            
            <div className="law-card">
              <h4>🔗 Law of Multiple Proportions</h4>
              <div className="law-demo">
                <div className="multiple-examples">
                  <div className="compound-pair">
                    <div className="formula">CO</div>
                    <div className="formula">CO₂</div>
                    <div className="ratio">1:1 vs 1:2 ratio</div>
                  </div>
                  <div className="compound-pair">
                    <div className="formula">NO</div>
                    <div className="formula">NO₂</div>
                    <div className="ratio">1:1 vs 1:2 ratio</div>
                  </div>
                </div>
              </div>
              <p className="law-explanation">
                When two elements form more than one compound, 
                the masses of one element combine with a fixed mass 
                of the other in ratios of small whole numbers.
              </p>
            </div>
            
            <div className="law-card">
              <h4>⚛️ Dalton's Atomic Theory</h4>
              <div className="law-demo">
                <div className="atomic-principles">
                  <div className="principle">1. All matter is made of atoms</div>
                  <div className="principle">2. Atoms are indivisible</div>
                  <div className="principle">3. Atoms of same element are identical</div>
                  <div className="principle">4. Compounds form in fixed ratios</div>
                </div>
              </div>
              <p className="law-explanation">
                The foundation of modern chemistry! All matter consists 
                of tiny, indivisible particles called atoms.
              </p>
            </div>
          </div>
          
          <div className="laws-interactive">
            <h4>🧪 Interactive Law Demonstration</h4>
            <div className="demo-controls">
              <button 
                className="demo-btn"
                onClick={() => setLawDemo('conservation')}
              >
                Conservation of Mass
              </button>
              <button 
                className="demo-btn"
                onClick={() => setLawDemo('definite')}
              >
                Definite Proportions
              </button>
              <button 
                className="demo-btn"
                onClick={() => setLawDemo('multiple')}
              >
                Multiple Proportions
              </button>
            </div>
            
            <div className="demo-visualization">
              {lawDemo === 'conservation' && (
                <div className="conservation-demo">
                  <div className="reaction-balance">
                    <div className="side reactants">
                      <h5>Reactants</h5>
                      <div className="molecules">
                        <div className="molecule">2H₂</div>
                        <span>+</span>
                        <div className="molecule">O₂</div>
                      </div>
                      <div className="mass">Total: 4g + 32g = 36g</div>
                    </div>
                    <div className="arrow">→</div>
                    <div className="side products">
                      <h5>Products</h5>
                      <div className="molecules">
                        <div className="molecule">2H₂O</div>
                      </div>
                      <div className="mass">Total: 36g</div>
                    </div>
                  </div>
                </div>
              )}
              
              {lawDemo === 'definite' && (
                <div className="definite-demo">
                  <div className="proportion-examples">
                    <div className="example">
                      <h5>Water (H₂O)</h5>
                      <div className="ratio-bar">
                        <div className="h-portion" style={{width: '11.1%'}}>H: 11.1%</div>
                        <div className="o-portion" style={{width: '88.9%'}}>O: 88.9%</div>
                      </div>
                    </div>
                    <div className="example">
                      <h5>Carbon Dioxide (CO₂)</h5>
                      <div className="ratio-bar">
                        <div className="c-portion" style={{width: '27.3%'}}>C: 27.3%</div>
                        <div className="o-portion" style={{width: '72.7%'}}>O: 72.7%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {lawDemo === 'multiple' && (
                <div className="multiple-demo">
                  <div className="multiple-examples">
                    <div className="example">
                      <h5>Carbon Oxides</h5>
                      <div className="compounds">
                        <div className="compound">CO: 1C:1O</div>
                        <div className="compound">CO₂: 1C:2O</div>
                      </div>
                      <div className="ratio">Ratio: 1:2 (simple whole numbers)</div>
                    </div>
                    <div className="example">
                      <h5>Nitrogen Oxides</h5>
                      <div className="compounds">
                        <div className="compound">NO: 1N:1O</div>
                        <div className="compound">NO₂: 1N:2O</div>
                      </div>
                      <div className="ratio">Ratio: 1:2 (simple whole numbers)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Percentage Composition */}
      {activePlayground === 'composition' && (
        <div className="playground-content composition-playground">
          <div className="formula-input">
            <h3>📊 Percentage Composition Analyzer</h3>
            <div className="input-group">
              <label>Chemical Formula:</label>
              <input
                type="text"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g., H2O, CO2, NaCl"
              />
            </div>
          </div>
          
          <div className="composition-pie">
            <h4>🥧 Composition of {formula}</h4>
            <div className="composition-bars">
              {Object.entries(composition).map(([element, percentage]) => (
                <div key={element} className="composition-bar">
                  <div className="element-label">{element}</div>
                  <div className="percentage-bar">
                    <div
                      className="percentage-fill"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: atomColors[element as keyof typeof atomColors] || '#gray'
                      }}
                    >
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="composition-data">
            <h4>📈 Data Table:</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Percentage</th>
                  <th>Visual</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(composition).map(([element, percentage]) => (
                  <tr key={element}>
                    <td>{element}</td>
                    <td>{percentage.toFixed(2)}%</td>
                    <td>
                      <div className="mini-bar">
                        <div
                          className="mini-fill"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: atomColors[element as keyof typeof atomColors] || '#gray'
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="real-world">
            <p>🍎 Real world: Food labels use this! "20% protein" = 20g protein per 100g food!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChemistryIntermediatePlayground;
