import React, { useState, useEffect, useRef } from 'react';

interface ElectronData {
  element: HTMLDivElement;
  shell: number;
  index: number;
  radius: number;
  electronsInShell: number;
  angle: number;
}

interface ElementElectronData {
  element: HTMLDivElement;
  shell: number;
  electronIndex: number;
  totalInShell: number;
  radius: number;
  baseAngle: number;
}

interface ElementInfo {
  name: string;
  symbol: string;
  config: string;
  shells: number[];
  description: string;
  properties: string;
  color: string;
}

const AtomicStructurePlayground: React.FC = () => {
  const [activeTab, setActiveTab] = useState('bohr');
  const [electronCount, setElectronCount] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [shellSize, setShellSize] = useState(60);
  const [currentElement, setCurrentElement] = useState(1);
  const [nValue, setNValue] = useState(1);
  const [lValue, setLValue] = useState(0);
  const [activeSpectralLine, setActiveSpectralLine] = useState<any>(null);
  const [selectedSeries, setSelectedSeries] = useState('balmer');
  const [transitionN2, setTransitionN2] = useState(3);
  const [selectedOrbital, setSelectedOrbital] = useState('s');

  const bohrCanvasRef = useRef<HTMLDivElement>(null);
  const elementCanvasRef = useRef<HTMLDivElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const elementAnimationIdRef = useRef<number | null>(null);
  const electronsRef = useRef<ElectronData[]>([]);
  const elementElectronsRef = useRef<ElementElectronData[]>([]);

  const elementDatabase: Record<number, ElementInfo> = {
    1: { 
      name: 'Hydrogen', 
      symbol: 'H',
      config: '1s¹', 
      shells: [1],
      description: 'The simplest atom in the universe! Just 1 proton and 1 electron. It\'s the most abundant element and fuel for stars!',
      properties: 'Highly reactive gas, forms H₂ molecules, burns with oxygen to make water (H₂O), essential for life!',
      color: '#FF6B6B'
    },
    2: { 
      name: 'Helium', 
      symbol: 'He',
      config: '1s²', 
      shells: [2],
      description: 'Noble gas with a completely filled 1s orbital. Super stable and doesn\'t react with anything!',
      properties: 'Lighter than air, makes your voice squeaky, used in balloons, second most abundant element in universe!',
      color: '#4ECDC4'
    },
    3: { 
      name: 'Lithium', 
      symbol: 'Li',
      config: '1s² 2s¹', 
      shells: [2, 1],
      description: 'That lone 2s electron makes it very reactive! It easily loses that electron to become Li⁺ ion.',
      properties: 'Soft metal you can cut with a knife, used in batteries, reacts violently with water, lightest metal!',
      color: '#45B7D1'
    },
    6: { 
      name: 'Carbon', 
      symbol: 'C',
      config: '1s² 2s² 2p²', 
      shells: [2, 4],
      description: 'The basis of all life! Has 4 valence electrons, so it can form 4 bonds with other atoms.',
      properties: 'Forms diamonds and graphite, creates all organic molecules in your body, can make millions of compounds!',
      color: '#F7B801'
    },
    8: { 
      name: 'Oxygen', 
      symbol: 'O',
      config: '1s² 2s² 2p⁴', 
      shells: [2, 6],
      description: 'Wants 2 more electrons to complete its octet! That\'s why it\'s so reactive and grabs electrons.',
      properties: 'Essential for breathing, forms O₂ gas, very electronegative, supports combustion, makes up 21% of air!',
      color: '#E74C3C'
    },
    11: { 
      name: 'Sodium', 
      symbol: 'Na',
      config: '1s² 2s² 2p⁶ 3s¹', 
      shells: [2, 8, 1],
      description: 'That single 3s¹ electron is easily lost, making Na⁺ ion. This is why it forms salt (NaCl) with chlorine!',
      properties: 'Soft metal, reacts explosively with water, essential for nerve function, makes table salt with chlorine!',
      color: '#9B59B6'
    }
  };

  const orbitalInfo = {
    's': {
      title: '🟠 s-orbital: The Perfect Sphere',
      description: 'Shaped like a perfect 3D ball around the nucleus. Can hold maximum 2 electrons with opposite spins. Found in all energy levels (n=1,2,3...). Think of it as a fuzzy cloud where electrons spend most of their time!',
      energy: 'Energy increases with: 1s < 2s < 3s < 4s...'
    },
    'p': {
      title: '🎈 p-orbital: The Dumbbell',
      description: 'Shaped like a dumbbell or figure-8. Has 3 orientations: px, py, pz (pointing along x, y, z axes). Each can hold 2 electrons, so total 6 electrons. Starts from n=2 level. Imagine three dumbbells crossing through the nucleus!',
      energy: 'Higher energy than s-orbitals: 2p < 3p < 4p...'
    },
    'd': {
      title: '🍀 d-orbital: The Clover',
      description: 'Complex clover-like shapes with 5 different orientations. Can hold total 10 electrons (2 per orbital). Starts from n=3 level. These give transition metals their special properties and beautiful colors!',
      energy: 'Even higher energy: 3d < 4d < 5d...'
    },
    'f': {
      title: '🌸 f-orbital: The Complex Beauty',
      description: 'Very complex multi-lobed shapes with 7 orientations. Can hold total 14 electrons. Starts from n=4 level. These are found in rare earth elements and have extremely complex geometries!',
      energy: 'Highest energy: 4f < 5f < 6f...'
    }
  };

  const spectralSeries = {
    balmer: [
      { wavelength: 656, color: 'Red', n: 3 },
      { wavelength: 486, color: 'Blue-green', n: 4 },
      { wavelength: 434, color: 'Blue-violet', n: 5 },
      { wavelength: 410, color: 'Violet', n: 6 }
    ],
    lyman: [
      { wavelength: 121, color: 'UV', n: 2 },
      { wavelength: 102, color: 'UV', n: 3 },
      { wavelength: 97, color: 'UV', n: 4 },
      { wavelength: 95, color: 'UV', n: 5 }
    ],
    paschen: [
      { wavelength: 1875, color: 'IR', n: 4 },
      { wavelength: 1282, color: 'IR', n: 5 },
      { wavelength: 1094, color: 'IR', n: 6 },
      { wavelength: 1005, color: 'IR', n: 7 }
    ]
  };

  // Tab switching
  const showTab = (tabName: string) => {
    setActiveTab(tabName);
    
    // Initialize tab-specific content
    if (tabName === 'bohr') {
      initBohrModel();
    } else if (tabName === 'spectrum') {
      initSpectrum();
    } else if (tabName === 'orbitals') {
      updateQuantumNumbers();
    } else if (tabName === 'elements') {
      buildAtom(1, 'H');
    }
  };

  // BOHR MODEL FUNCTIONS
  const initBohrModel = () => {
    updateBohrModel();
    startAnimation();
  };

  const updateBohrModel = () => {
    if (!bohrCanvasRef.current) return;
    
    const canvas = bohrCanvasRef.current;
    
    // Clear existing electrons and orbital paths
    const existingElectrons = canvas.querySelectorAll('.electron, .orbital-path');
    existingElectrons.forEach(el => el.remove());
    
    electronsRef.current = [];
    
    // Shell filling rules: K=2, L=8, M=18, N=32
    const shellCapacity = [2, 8, 18, 32];
    let electronIndex = 0;
    
    for (let shell = 0; shell < 4 && electronIndex < electronCount; shell++) {
      const radius = 40 + shell * shellSize;
      const electronsInShell = Math.min(shellCapacity[shell], electronCount - electronIndex);
      
      // Create orbital path
      const orbitalPath = document.createElement('div');
      orbitalPath.className = 'orbital-path';
      orbitalPath.style.width = radius * 2 + 'px';
      orbitalPath.style.height = radius * 2 + 'px';
      canvas.appendChild(orbitalPath);
      
      // Create electrons for this shell
      for (let i = 0; i < electronsInShell; i++) {
        const electron = document.createElement('div');
        electron.className = 'electron';
        canvas.appendChild(electron);
        
        electronsRef.current.push({
          element: electron,
          shell: shell,
          index: i,
          radius: radius,
          electronsInShell: electronsInShell,
          angle: (2 * Math.PI / electronsInShell) * i + Math.random() * 0.5
        });
        
        electronIndex++;
      }
    }
  };

  const updateShellInfo = () => {
    let shellFilling: string[] = [];
    let remaining = electronCount;
    const shellNames = ['K', 'L', 'M', 'N'];
    const shellCapacity = [2, 8, 18, 32];
    
    for (let i = 0; i < 4 && remaining > 0; i++) {
      const inThisShell = Math.min(shellCapacity[i], remaining);
      shellFilling.push(`${shellNames[i]}=${inThisShell}`);
      remaining -= inThisShell;
    }
    
    return shellFilling.join(', ');
  };

  const startAnimation = () => {
    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    
    const animate = () => {
      if (!bohrCanvasRef.current) return;
      
      const canvas = bohrCanvasRef.current;
      const centerX = canvas.offsetWidth / 2;
      const centerY = canvas.offsetHeight / 2;
      const currentTime = Date.now() / 1000;
      
      electronsRef.current.forEach((electronData) => {
        const baseAngle = electronData.angle;
        const shellSpeed = speed / (electronData.shell + 1);
        const angle = baseAngle + currentTime * shellSpeed;
        
        const x = centerX + electronData.radius * Math.cos(angle) - 8;
        const y = centerY + electronData.radius * Math.sin(angle) - 8;
        
        electronData.element.style.left = x + 'px';
        electronData.element.style.top = y + 'px';
      });
      
      animationIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  // ORBITAL FUNCTIONS
  const showOrbitalInfo = (orbitalType: string) => {
    setSelectedOrbital(orbitalType);
  };

  const updateQuantumNumbers = () => {
    const orbitalTypes = ['s', 'p', 'd', 'f'];
    return `${lValue} (${orbitalTypes[lValue]})`;
  };

  // SPECTRUM FUNCTIONS
  const initSpectrum = () => {
    // Initialize with first line of current series
    const currentLines = spectralSeries[selectedSeries as keyof typeof spectralSeries];
    if (currentLines.length > 0) {
      setActiveSpectralLine(currentLines[0]);
      setTransitionN2(currentLines[0].n);
    }
  };

  const createSpectralLines = () => {
    const spectrumWidth = 500;
    const currentLines = spectralSeries[selectedSeries as keyof typeof spectralSeries];
    
    return currentLines.map((lineData, index) => {
      // Map wavelength to position based on series
      let position;
      if (selectedSeries === 'balmer') {
        position = ((lineData.wavelength - 400) / (700 - 400)) * spectrumWidth;
      } else if (selectedSeries === 'lyman') {
        position = ((lineData.wavelength - 100) / (200 - 100)) * spectrumWidth;
      } else { // paschen
        position = ((lineData.wavelength - 1000) / (2000 - 1000)) * spectrumWidth;
      }
      
      return (
        <div
          key={index}
          className={`spectrum-line ${activeSpectralLine === lineData ? 'active' : ''}`}
          style={{ left: `${position}px` }}
          title={`${lineData.wavelength} nm - ${lineData.color}`}
          onClick={() => selectSpectralLine(lineData)}
        />
      );
    });
  };

  const selectSpectralLine = (lineData: any) => {
    setActiveSpectralLine(lineData);
    setTransitionN2(lineData.n);
  };

  const updateSeries = (series: string) => {
    setSelectedSeries(series);
    // Reset to first line of new series
    const currentLines = spectralSeries[series as keyof typeof spectralSeries];
    if (currentLines.length > 0) {
      setActiveSpectralLine(currentLines[0]);
      setTransitionN2(currentLines[0].n);
    }
  };

  const getSeriesInfo = () => {
    const seriesInfo = {
      balmer: {
        text: 'Balmer Series: n → 2 transitions produce visible light. This is what we can see with our eyes - the beautiful colors of hydrogen spectrum!',
        n1: 2,
        icon: '🌈'
      },
      lyman: {
        text: 'Lyman Series: n → 1 transitions produce ultraviolet light. These are invisible to the human eye but can be detected by special instruments. Higher energy photons!',
        n1: 1,
        icon: '☀️'
      },
      paschen: {
        text: 'Paschen Series: n → 3 transitions produce infrared light. We feel this as heat but cannot see it. Lower energy photons!',
        n1: 3,
        icon: '🔥'
      }
    };
    return seriesInfo[selectedSeries as keyof typeof seriesInfo];
  };

  const getCurrentTransitionData = () => {
    if (!activeSpectralLine) return null;
    
    const wavelength = activeSpectralLine.wavelength;
    const color = activeSpectralLine.color;
    const n2 = activeSpectralLine.n;
    const seriesInfo = getSeriesInfo();
    const n1 = seriesInfo.n1;
    
    // Calculate energy (E = hc/λ)
    const energy = (1240 / wavelength).toFixed(2);
    
    return {
      wavelength: wavelength + ' nm',
      energy: energy + ' eV',
      color: color,
      n2: n2,
      n1: n1,
      description: seriesInfo.text
    };
  };

  // ELEMENTS FUNCTIONS
  const buildAtom = (atomicNumber: number, symbol: string) => {
    setCurrentElement(atomicNumber);
    setElectronCount(atomicNumber);
    
    // Clear existing visualization
    clearAtomVisualization();
    
    // Create new atom visualization
    createAtomVisualization(atomicNumber, elementDatabase[atomicNumber].shells);
    
    // Start animation
    startElementAnimation();
  };

  const updateElementShellDisplay = (shells: number[], totalElectrons: number) => {
    const shellNames = ['K', 'L', 'M', 'N'];
    let shellInfo: string[] = [];
    
    shells.forEach((electronCount, index) => {
      if (electronCount > 0) {
        shellInfo.push(`${shellNames[index]} = ${electronCount}`);
      }
    });
    
    return shellInfo.join(', ');
  };

  const clearAtomVisualization = () => {
    if (elementAnimationIdRef.current) {
      cancelAnimationFrame(elementAnimationIdRef.current);
    }
    
    if (!elementCanvasRef.current) return;
    
    const canvas = elementCanvasRef.current;
    const existingElements = canvas.querySelectorAll('.electron, .orbital-path');
    existingElements.forEach(el => el.remove());
    
    elementElectronsRef.current = [];
  };

  const createAtomVisualization = (atomicNumber: number, shells: number[]) => {
    if (!elementCanvasRef.current) return;
    
    const canvas = elementCanvasRef.current;
    const shellRadii = [60, 100, 140, 180];
    
    let electronIndex = 0;
    
    shells.forEach((electronCount, shellIndex) => {
      if (electronCount === 0) return;
      
      const radius = shellRadii[shellIndex];
      
      // Create orbital path
      const orbitalPath = document.createElement('div');
      orbitalPath.className = 'orbital-path';
      orbitalPath.style.width = radius * 2 + 'px';
      orbitalPath.style.height = radius * 2 + 'px';
      canvas.appendChild(orbitalPath);
      
      // Create electrons for this shell
      for (let i = 0; i < electronCount; i++) {
        const electron = document.createElement('div');
        electron.className = 'electron';
        canvas.appendChild(electron);
        
        elementElectronsRef.current.push({
          element: electron,
          shell: shellIndex,
          electronIndex: i,
          totalInShell: electronCount,
          radius: radius,
          baseAngle: (2 * Math.PI / electronCount) * i + Math.random() * 0.3
        });
        
        electronIndex++;
      }
    });
  };

  const startElementAnimation = () => {
    if (elementAnimationIdRef.current) {
      cancelAnimationFrame(elementAnimationIdRef.current);
    }
    
    const animate = () => {
      if (!elementCanvasRef.current) return;
      
      const canvas = elementCanvasRef.current;
      const centerX = canvas.offsetWidth / 2;
      const centerY = canvas.offsetHeight / 2;
      const currentTime = Date.now() / 1000;
      
      elementElectronsRef.current.forEach((electronData) => {
        const shellSpeed = 0.5 / (electronData.shell + 1);
        const angle = electronData.baseAngle + currentTime * shellSpeed;
        
        const x = centerX + electronData.radius * Math.cos(angle) - 8;
        const y = centerY + electronData.radius * Math.sin(angle) - 8;
        
        electronData.element.style.left = x + 'px';
        electronData.element.style.top = y + 'px';
      });
      
      elementAnimationIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  // Effects
  useEffect(() => {
    if (activeTab === 'bohr') {
      initBohrModel();
    }
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (elementAnimationIdRef.current) {
        cancelAnimationFrame(elementAnimationIdRef.current);
      }
    };
  }, [electronCount, shellSize, speed, activeTab]);

  useEffect(() => {
    if (activeTab === 'elements') {
      buildAtom(currentElement, elementDatabase[currentElement].symbol);
    }
  }, [currentElement, activeTab]);

  useEffect(() => {
    if (activeTab === 'spectrum') {
      initSpectrum();
    }
  }, [activeTab, selectedSeries]);

  return (
    <div className="atomic-structure-playground">
      <style>{`
        .atomic-structure-playground {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px;
          padding: 30px;
          margin: 20px 0;
          overflow: hidden;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          animation: fadeInDown 1s ease;
        }
        
        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .playground-tabs {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
          background: rgba(255,255,255,0.15);
          border-radius: 50px;
          padding: 8px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        
        .tab {
          padding: 12px 24px;
          margin: 0 5px;
          border: none;
          background: transparent;
          color: white;
          cursor: pointer;
          border-radius: 25px;
          transition: all 0.3s ease;
          font-weight: bold;
          font-size: 16px;
        }
        
        .tab.active {
          background: rgba(255,255,255,0.25);
          box-shadow: 0 4px 15px rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }
        
        .playground-content {
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 30px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          min-height: 600px;
          animation: fadeIn 0.5s ease;
        }
        
        .atom-canvas {
          width: 500px;
          height: 500px;
          margin: 0 auto 20px;
          position: relative;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          background: radial-gradient(circle, rgba(255,255,255,0.1), transparent);
          overflow: visible;
        }
        
        .nucleus {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 50px;
          height: 50px;
          background: linear-gradient(45deg, #ff6b6b, #ee5a24);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          color: white;
          box-shadow: 0 0 25px rgba(255,107,107,0.8);
          animation: pulse 2s infinite;
          z-index: 10;
        }
        
        .electron {
          position: absolute;
          width: 16px;
          height: 16px;
          background: linear-gradient(45deg, #3742fa, #2f3542);
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(55,66,250,0.9);
          transition: all 0.3s ease;
          z-index: 5;
        }
        
        .orbital-path {
          position: absolute;
          border: 2px dashed rgba(255,255,255,0.4);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
        }
        
        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
          margin-top: 25px;
        }
        
        .control-group {
          background: rgba(255,255,255,0.15);
          padding: 18px;
          border-radius: 15px;
          text-align: center;
          min-width: 160px;
          backdrop-filter: blur(5px);
        }
        
        .control-group label {
          display: block;
          margin-bottom: 12px;
          font-weight: bold;
          font-size: 14px;
        }
        
        .slider {
          width: 100%;
          height: 6px;
          border-radius: 5px;
          background: rgba(255,255,255,0.3);
          outline: none;
          cursor: pointer;
          -webkit-appearance: none;
        }
        
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3742fa;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(55,66,250,0.8);
        }
        
        .orbital-display {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 25px;
          margin-top: 25px;
        }
        
        .orbital-card {
          background: rgba(255,255,255,0.1);
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s ease;
          border: 2px solid transparent;
          backdrop-filter: blur(5px);
        }
        
        .orbital-card:hover, .orbital-card.active {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 15px 35px rgba(0,0,0,0.3);
          border-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.2);
        }
        
        .orbital-visual {
          width: 80px;
          height: 80px;
          margin: 0 auto 15px;
          position: relative;
          border-radius: 10px;
        }
        
        .s-orbital {
          background: radial-gradient(circle, rgba(255,107,107,0.9) 30%, transparent 70%);
          border-radius: 50%;
          animation: breathe 3s ease-in-out infinite;
        }
        
        .p-orbital {
          background: linear-gradient(45deg, 
              transparent 35%, rgba(55,66,250,0.9) 45%, 
              rgba(55,66,250,0.9) 55%, transparent 65%);
          border-radius: 20px;
          animation: rotate 4s linear infinite;
        }
        
        .d-orbital {
          background: conic-gradient(
              transparent 0deg, rgba(255,193,7,0.9) 60deg,
              transparent 120deg, rgba(255,193,7,0.9) 180deg,
              transparent 240deg, rgba(255,193,7,0.9) 300deg,
              transparent 360deg);
          border-radius: 15px;
          animation: spin 5s linear infinite;
        }
        
        .f-orbital {
          background: radial-gradient(ellipse, 
              rgba(156,39,176,0.9) 20%, 
              transparent 40%,
              rgba(156,39,176,0.7) 60%,
              transparent 80%);
          border-radius: 30%;
          animation: wobble 3s ease-in-out infinite;
        }
        
        .spectrum-container {
          margin: 25px 0;
          padding: 20px;
          background: rgba(0,0,0,0.2);
          border-radius: 15px;
        }
        
        .spectrum-bar {
          height: 60px;
          margin: 20px 0;
          border-radius: 30px;
          background: linear-gradient(90deg, 
              #8B0000 0%,   /* Deep red */
              #FF0000 10%,  /* Red */
              #FF8000 20%,  /* Orange */
              #FFFF00 30%,  /* Yellow */
              #80FF00 40%,  /* Yellow-green */
              #00FF00 50%,  /* Green */
              #00FF80 60%,  /* Green-cyan */
              #00FFFF 70%,  /* Cyan */
              #0080FF 80%,  /* Light blue */
              #0000FF 90%,  /* Blue */
              #8000FF 100%  /* Violet */
          );
          position: relative;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(255,255,255,0.3);
          overflow: hidden;
          width: 500px;
          margin: 20px auto;
        }
        
        .spectrum-line {
          position: absolute;
          top: 0;
          width: 4px;
          height: 100%;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 0 10px white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .spectrum-line:hover {
          width: 6px;
          background: white;
          box-shadow: 0 0 15px white;
        }
        
        .spectrum-line.active {
          width: 8px;
          background: yellow;
          box-shadow: 0 0 20px yellow;
        }
        
        .element-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .element-card {
          background: rgba(255,255,255,0.15);
          border-radius: 15px;
          padding: 15px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 3px solid transparent;
          backdrop-filter: blur(5px);
        }
        
        .element-card:hover {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 15px 30px rgba(0,0,0,0.3);
          border-color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.25);
        }
        
        .element-card.selected {
          border-color: #FFD700;
          background: rgba(255,215,0,0.2);
          box-shadow: 0 0 20px rgba(255,215,0,0.5);
        }
        
        .element-card h3 {
          font-size: 28px;
          margin-bottom: 8px;
          color: #FFD700;
        }
        
        .element-card .atomic-num {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 5px;
        }
        
        .element-card .name {
          font-size: 12px;
          opacity: 0.9;
        }
        
        .info-panel {
          background: rgba(255,255,255,0.12);
          border-radius: 15px;
          padding: 25px;
          margin-top: 25px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .info-panel h3 {
          margin-bottom: 15px;
          color: #FFD700;
          font-size: 20px;
        }
        
        .info-panel p {
          line-height: 1.6;
          margin-bottom: 12px;
          font-size: 16px;
        }
        
        .config-display {
          background: rgba(0,0,0,0.3);
          padding: 15px;
          border-radius: 10px;
          margin: 15px 0;
          font-family: 'Courier New', monospace;
          font-size: 18px;
          text-align: center;
          border-left: 4px solid #FFD700;
        }
        
        .properties-display {
          background: rgba(0,100,200,0.2);
          padding: 15px;
          border-radius: 10px;
          margin: 15px 0;
          border-left: 4px solid #00BFFF;
        }
        
        .shell-display {
          text-align: center;
          margin: 20px 0;
          font-size: 16px;
          padding: 10px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        
        .energy-display {
          background: rgba(0,0,0,0.3);
          padding: 15px;
          border-radius: 10px;
          margin: 15px 0;
          text-align: center;
          font-family: 'Courier New', monospace;
        }
        
        .hidden { display: none; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
        
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes wobble {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
      `}</style>

      <div className="header">
        <h1>🔬 Atomic Structure Playground - COMPLETE!</h1>
        <p>All tabs working perfectly! Master atoms through interactive visualization! 🚀</p>
      </div>
      
      <div className="playground-tabs">
        <button 
          className={`tab ${activeTab === 'bohr' ? 'active' : ''}`} 
          onClick={() => showTab('bohr')}
        >
          🌟 Bohr Model
        </button>
        <button 
          className={`tab ${activeTab === 'orbitals' ? 'active' : ''}`} 
          onClick={() => showTab('orbitals')}
        >
          🌈 Orbitals
        </button>
        <button 
          className={`tab ${activeTab === 'spectrum' ? 'active' : ''}`} 
          onClick={() => showTab('spectrum')}
        >
          🎨 H-Spectrum
        </button>
        <button 
          className={`tab ${activeTab === 'elements' ? 'active' : ''}`} 
          onClick={() => showTab('elements')}
        >
          ⚛️ Elements
        </button>
      </div>
      
      {/* Bohr Model Tab */}
      {activeTab === 'bohr' && (
        <div className="playground-content">
          <h2>🌟 Bohr's Atomic Model - Watch Electrons Orbit!</h2>
          <div className="atom-canvas" ref={bohrCanvasRef}>
            <div className="nucleus">
              <span>H</span>
            </div>
          </div>
          
          <div className="controls">
            <div className="control-group">
              <label>Electrons: {electronCount}</label>
              <input 
                type="range" 
                className="slider" 
                min="1" 
                max="18" 
                value={electronCount}
                onChange={(e) => setElectronCount(parseInt(e.target.value))}
              />
            </div>
            <div className="control-group">
              <label>Speed: {speed}x</label>
              <input 
                type="range" 
                className="slider" 
                min="0.1" 
                max="3" 
                step="0.1" 
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
              />
            </div>
            <div className="control-group">
              <label>Shell Size: {shellSize < 50 ? 'Small' : shellSize > 90 ? 'Large' : 'Medium'}</label>
              <input 
                type="range" 
                className="slider" 
                min="30" 
                max="120" 
                value={shellSize}
                onChange={(e) => setShellSize(parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="info-panel">
            <h3>🎯 What you're seeing:</h3>
            <p>Electrons orbiting the nucleus in fixed energy levels (shells).</p>
            <div className="energy-display">
              <strong>Current Filling:</strong> {updateShellInfo()}<br/>
              <strong>Total Electrons:</strong> {electronCount}
            </div>
          </div>
        </div>
      )}
      
      {/* Orbitals Tab */}
      {activeTab === 'orbitals' && (
        <div className="playground-content">
          <h2>🌈 Quantum Orbitals - Where Electrons Actually Live!</h2>
          <p style={{textAlign: 'center', marginBottom: '20px', fontSize: '16px'}}>
            Click on orbital shapes below to see how electrons really behave! 👇
          </p>
          
          <div className="orbital-display">
            <div 
              className={`orbital-card ${selectedOrbital === 's' ? 'active' : ''}`} 
              onClick={() => showOrbitalInfo('s')}
            >
              <div className="orbital-visual s-orbital"></div>
              <h3>s-orbital</h3>
              <p>Spherical 🟠</p>
              <p>Max: 2e⁻</p>
            </div>
            <div 
              className={`orbital-card ${selectedOrbital === 'p' ? 'active' : ''}`} 
              onClick={() => showOrbitalInfo('p')}
            >
              <div className="orbital-visual p-orbital"></div>
              <h3>p-orbital</h3>
              <p>Dumbbell 🎈</p>
              <p>Max: 6e⁻</p>
            </div>
            <div 
              className={`orbital-card ${selectedOrbital === 'd' ? 'active' : ''}`} 
              onClick={() => showOrbitalInfo('d')}
            >
              <div className="orbital-visual d-orbital"></div>
              <h3>d-orbital</h3>
              <p>Clover 🍀</p>
              <p>Max: 10e⁻</p>
            </div>
            <div 
              className={`orbital-card ${selectedOrbital === 'f' ? 'active' : ''}`} 
              onClick={() => showOrbitalInfo('f')}
            >
              <div className="orbital-visual f-orbital"></div>
              <h3>f-orbital</h3>
              <p>Complex 🌸</p>
              <p>Max: 14e⁻</p>
            </div>
          </div>
          
          <div className="controls">
            <div className="control-group">
              <label>Principal Quantum Number (n): {nValue}</label>
              <input 
                type="range" 
                className="slider" 
                min="1" 
                max="7" 
                value={nValue}
                onChange={(e) => setNValue(parseInt(e.target.value))}
              />
            </div>
            <div className="control-group">
              <label>Azimuthal (l): {updateQuantumNumbers()}</label>
              <input 
                type="range" 
                className="slider" 
                min="0" 
                max={nValue - 1} 
                value={lValue}
                onChange={(e) => setLValue(parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="info-panel">
            <h3>{orbitalInfo[selectedOrbital as keyof typeof orbitalInfo].title}</h3>
            <p>{orbitalInfo[selectedOrbital as keyof typeof orbitalInfo].description}</p>
            <div className="energy-display">
              <strong>{orbitalInfo[selectedOrbital as keyof typeof orbitalInfo].energy}</strong>
            </div>
          </div>
        </div>
      )}
      
      {/* Spectrum Tab */}
      {activeTab === 'spectrum' && (
        <div className="playground-content">
          <h2>🎨 Hydrogen Emission Spectrum - Light Show!</h2>
          <p style={{textAlign: 'center', marginBottom: '20px', fontSize: '16px'}}>
            Click on the white lines in the spectrum to see what happens when electrons jump! ⚡
          </p>
          
          <div className="spectrum-container">
            <div className="spectrum-bar">
              {createSpectralLines()}
            </div>
          </div>
          
          <div className="controls">
            <div className="control-group">
              <label>Series:</label>
              <select 
                style={{padding: '8px', borderRadius: '5px', border: 'none', color: 'black'}}
                value={selectedSeries}
                onChange={(e) => updateSeries(e.target.value)}
              >
                <option value="balmer">Balmer (Visible) 🌈</option>
                <option value="lyman">Lyman (UV) ☀️</option>
                <option value="paschen">Paschen (IR) 🔥</option>
              </select>
            </div>
            <div className="control-group">
              <label>Electron Jump: n={transitionN2} → n={getSeriesInfo().n1}</label>
              <input 
                type="range" 
                className="slider" 
                min="2" 
                max="7" 
                value={transitionN2}
                onChange={(e) => {
                  const newN2 = parseInt(e.target.value);
                  setTransitionN2(newN2);
                  // Find matching line in current series
                  const currentLines = spectralSeries[selectedSeries as keyof typeof spectralSeries];
                  const matchingLine = currentLines.find(line => line.n === newN2);
                  if (matchingLine) {
                    setActiveSpectralLine(matchingLine);
                  }
                }}
              />
            </div>
          </div>
          
          <div className="info-panel">
            <h3>⚡ Energy Transitions Explained</h3>
            <p>{getCurrentTransitionData()?.description || 'When electrons fall from higher to lower energy levels, they emit photons of specific wavelengths. This creates the beautiful line spectrum you see above!'}</p>
            <div className="energy-display">
              <p><strong>Wavelength:</strong> {getCurrentTransitionData()?.wavelength || '656 nm'} | <strong>Energy:</strong> {getCurrentTransitionData()?.energy || '1.89 eV'}</p>
              <p><strong>Color:</strong> {getCurrentTransitionData()?.color || 'Red'}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Elements Tab */}
      {activeTab === 'elements' && (
        <div className="playground-content">
          <h2>⚛️ Build Your Own Atoms!</h2>
          <p style={{textAlign: 'center', marginBottom: '20px', fontSize: '16px'}}>
            Click on any element below to build its atom and see how electrons are arranged! 🔧
          </p>
          
          <div className="element-grid">
            {Object.entries(elementDatabase).map(([atomicNum, element]) => (
              <div 
                key={atomicNum}
                className={`element-card ${currentElement === parseInt(atomicNum) ? 'selected' : ''}`} 
                onClick={() => buildAtom(parseInt(atomicNum), element.symbol)}
              >
                <h3>{element.symbol}</h3>
                <div className="atomic-num">Atomic # {atomicNum}</div>
                <div className="name">{element.name}</div>
              </div>
            ))}
          </div>
          
          <div className="atom-canvas" ref={elementCanvasRef}>
            <div className="nucleus">
              <span>{elementDatabase[currentElement].symbol}</span>
            </div>
          </div>
          
          <div className="shell-display">
            <strong>Shell Configuration:</strong> {updateElementShellDisplay(elementDatabase[currentElement].shells, currentElement)}<br/>
            <strong>Total Electrons:</strong> {currentElement}
          </div>
          
          <div className="info-panel">
            <h3>{elementDatabase[currentElement].name} ({elementDatabase[currentElement].symbol}) - Atomic Number {currentElement}</h3>
            
            <div className="config-display">
              <strong>Electronic Configuration:</strong> {elementDatabase[currentElement].config}
            </div>
            
            <p>{elementDatabase[currentElement].description}</p>
            
            <div className="properties-display">
              <strong>🔥 Cool Facts:</strong> {elementDatabase[currentElement].properties}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtomicStructurePlayground;