import React, { useState, useEffect } from 'react';

const ChemistryPlayground: React.FC = () => {
  const [activeSection, setActiveSection] = useState('atoms');
  const [elementSelect, setElementSelect] = useState('6');
  const [massInput, setMassInput] = useState('');
  const [molarMassInput, setMolarMassInput] = useState('');
  const [results, setResults] = useState<any>(null);
  const [soluteValue, setSoluteValue] = useState(50);

  const showSection = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const getElectronConfiguration = (atomicNumber: number) => {
    // Proper electron configuration based on atomic orbitals
    const configs = {
      1: { electrons: [1, 0, 0], element: 'Hydrogen', totalElectrons: 1 },
      2: { electrons: [2, 0, 0], element: 'Helium', totalElectrons: 2 },
      6: { electrons: [2, 4, 0], element: 'Carbon', totalElectrons: 6 },
      8: { electrons: [2, 6, 0], element: 'Oxygen', totalElectrons: 8 },
      11: { electrons: [2, 8, 1], element: 'Sodium', totalElectrons: 11 }
    };
    return configs[atomicNumber as keyof typeof configs] || { electrons: [1, 0, 0], element: 'Unknown', totalElectrons: 1 };
  };

  const changeAtom = () => {
    // This will trigger re-render with new electron configuration
  };

  const animateState = (state: string) => {
    // State animation logic would go here
  };

  const calculateMoles = () => {
    const mass = parseFloat(massInput);
    const molarMass = parseFloat(molarMassInput);
    
    if (mass && molarMass) {
      const moles = mass / molarMass;
      const particles = moles * 6.022e23;
      
      const funFacts = [
        "That's more particles than stars in the observable universe! 🌟",
        "If each particle was a grain of sand, you'd have enough to fill multiple Earths! 🌍",
        "Chemistry is basically counting at an epic scale! 🤯",
        "Avogadro's number is chemistry's way of saying 'a LOT!' 📊"
      ];
      
      setResults({
        moles: moles.toExponential(3),
        particles: particles.toExponential(3),
        funFact: funFacts[Math.floor(Math.random() * funFacts.length)]
      });
    }
  };

  const animateReaction = () => {
    // Reaction animation logic would go here
  };

  const updateSolution = (value: number) => {
    setSoluteValue(value);
  };

  return (
    <div className="chemistry-playground">
      <style jsx>{`
        .chemistry-playground {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px;
          padding: 30px;
          margin: 20px 0;
          overflow: hidden;
        }

        .playground-header {
          text-align: center;
          margin-bottom: 40px;
          animation: fadeInUp 1s ease;
        }

        .playground-header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .playground-nav {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 30px;
        }

        .nav-btn {
          padding: 12px 24px;
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 25px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          font-weight: 600;
        }

        .nav-btn:hover, .nav-btn.active {
          background: rgba(255,255,255,0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }

        .playground-section {
          display: none;
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
          animation: slideIn 0.5s ease;
        }

        .playground-section.active {
          display: block;
        }

        .section-title {
          font-size: 1.8rem;
          margin-bottom: 20px;
          text-align: center;
        }

        /* Atom Simulator */
        .atom-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
          position: relative;
          margin: 20px 0;
        }

        .nucleus {
          width: 50px;
          height: 50px;
          background: radial-gradient(circle, #ff6b6b, #ee5a24);
          border-radius: 50%;
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          box-shadow: 0 0 30px rgba(255, 107, 107, 0.6);
          animation: glow 2s ease-in-out infinite alternate;
        }

        .electron-orbit {
          position: absolute;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          animation: rotate 4s linear infinite;
        }

        .orbit-1 { width: 100px; height: 100px; animation-duration: 2s; }
        .orbit-2 { width: 150px; height: 150px; animation-duration: 3s; }
        .orbit-3 { width: 200px; height: 200px; animation-duration: 4s; }

        .electron {
          width: 10px;
          height: 10px;
          background: #74b9ff;
          border-radius: 50%;
          position: absolute;
          top: -5px;
          left: calc(50% - 5px);
          box-shadow: 0 0 15px rgba(116, 185, 255, 0.8);
          transform-origin: 50% calc(50px + 100%);
          z-index: 10;
        }

        .orbit-label {
          position: absolute;
          background: rgba(255,255,255,0.9);
          color: #333;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          border: 2px solid #74b9ff;
        }

        /* States of Matter */
        .states-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }

        .state-box {
          background: rgba(255,255,255,0.1);
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .state-box:hover {
          transform: scale(1.05);
        }

        .particles-container {
          width: 150px;
          height: 150px;
          margin: 20px auto;
          position: relative;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          overflow: hidden;
          background: rgba(255,255,255,0.05);
        }

        .particle {
          width: 8px;
          height: 8px;
          background: #ffeaa7;
          border-radius: 50%;
          position: absolute;
          box-shadow: 0 0 8px rgba(255, 234, 167, 0.6);
        }

        /* Solid state - particles vibrate in fixed positions */
        .particle-solid {
          animation: vibrate 1s ease-in-out infinite;
        }

        /* Liquid state - particles move slowly and smoothly */
        .particle-liquid {
          animation: float 3s ease-in-out infinite;
        }

        /* Gas state - particles move fast and randomly */
        .particle-gas {
          animation: zoom 0.8s linear infinite;
        }

        @keyframes vibrate {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(1px, 1px); }
          50% { transform: translate(-1px, 0); }
          75% { transform: translate(0, -1px); }
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(8px, -5px); }
          66% { transform: translate(-5px, 8px); }
        }

        @keyframes zoom {
          0% { transform: translate(0, 0); }
          25% { transform: translate(25px, -15px); }
          50% { transform: translate(-15px, 20px); }
          75% { transform: translate(10px, -10px); }
          100% { transform: translate(0, 0); }
        }

        /* Mole Calculator */
        .calculator-container {
          background: rgba(255,255,255,0.1);
          border-radius: 15px;
          padding: 30px;
          max-width: 500px;
          margin: 0 auto;
        }

        .calc-input {
          width: 100%;
          padding: 15px;
          margin: 10px 0;
          border: none;
          border-radius: 8px;
          background: rgba(255,255,255,0.9);
          color: #333;
          font-size: 16px;
        }

        .calc-btn {
          background: linear-gradient(45deg, #00cec9, #6c5ce7);
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          color: white;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
          margin: 10px 0;
          transition: transform 0.3s ease;
        }

        .calc-btn:hover {
          transform: translateY(-2px);
        }

        .result-box {
          background: rgba(0,255,0,0.1);
          border: 2px solid #00b894;
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
          text-align: center;
          font-size: 1.1rem;
        }

        /* Chemical Reaction Animator */
        .reaction-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin: 30px 0;
          flex-wrap: wrap;
        }

        .molecule {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.1);
          padding: 15px;
          border-radius: 10px;
          animation: bounce 2s ease-in-out infinite;
        }

        .atom-sphere {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }

        .hydrogen { background: #ff7675; }
        .oxygen { background: #74b9ff; }
        .carbon { background: #2d3436; }

        .plus-sign, .arrow {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0 10px;
        }

        .arrow {
          color: #00b894;
          animation: pulse 1.5s ease-in-out infinite;
        }

        /* Concentration Mixer */
        .mixer-container {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          margin: 30px 0;
          flex-wrap: wrap;
        }

        .beaker {
          width: 80px;
          height: 120px;
          border: 3px solid #ddd;
          border-radius: 0 0 15px 15px;
          position: relative;
          background: linear-gradient(to top, var(--solution-color, #74b9ff) var(--fill-level, 0%), transparent var(--fill-level, 0%));
          margin: 20px;
        }

        .beaker-label {
          position: absolute;
          bottom: -30px;
          width: 100%;
          text-align: center;
          font-size: 0.8rem;
        }

        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes glow {
          from { box-shadow: 0 0 20px rgba(255, 107, 107, 0.6); }
          to { box-shadow: 0 0 40px rgba(255, 107, 107, 1); }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .playground-header h1 { font-size: 2rem; }
          .atom-container { height: 250px; }
          .orbit-1 { width: 80px; height: 80px; }
          .orbit-2 { width: 120px; height: 120px; }
          .orbit-3 { width: 160px; height: 160px; }
        }
      `}</style>

      <div className="playground-header">
        <h1>🧪 Chemistry Playground</h1>
        <p>Play with concepts, learn forever! 💫</p>
      </div>

      <nav className="playground-nav">
        <button 
          className={`nav-btn ${activeSection === 'atoms' ? 'active' : ''}`} 
          onClick={() => showSection('atoms')}
        >
          ⚛️ Atoms
        </button>
        <button 
          className={`nav-btn ${activeSection === 'states' ? 'active' : ''}`} 
          onClick={() => showSection('states')}
        >
          🌡️ States
        </button>
        <button 
          className={`nav-btn ${activeSection === 'moles' ? 'active' : ''}`} 
          onClick={() => showSection('moles')}
        >
          🔢 Moles
        </button>
        <button 
          className={`nav-btn ${activeSection === 'reactions' ? 'active' : ''}`} 
          onClick={() => showSection('reactions')}
        >
          🔥 Reactions
        </button>
        <button 
          className={`nav-btn ${activeSection === 'solutions' ? 'active' : ''}`} 
          onClick={() => showSection('solutions')}
        >
          💧 Solutions
        </button>
      </nav>

      {/* Atoms Section */}
      <div className={`playground-section ${activeSection === 'atoms' ? 'active' : ''}`}>
        <h2 className="section-title">⚛️ Build Your Atom!</h2>
        <p style={{textAlign: 'center', marginBottom: '20px'}}>
          Drag elements to see different atoms. Each orbit can hold different numbers of electrons! 🚀
        </p>
        
        <div className="atom-container" key={`atom-${elementSelect}`}>
          <div className="nucleus">{elementSelect}</div>
          {(() => {
            const config = getElectronConfiguration(parseInt(elementSelect));
            return (
              <>
                {config.electrons[0] > 0 && (
                  <div className="electron-orbit orbit-1" key="orbit-1">
                    {Array.from({length: config.electrons[0]}, (_, i) => {
                      const angle = (360 / config.electrons[0]) * i;
                      return (
                        <div 
                          key={`electron-1-${i}`} 
                          className="electron" 
                          style={{
                            transform: `rotate(${angle}deg)`,
                            transformOrigin: '50% 55px'
                          }}
                        />
                      );
                    })}
                    <div className="orbit-label" style={{top: '-25px', left: '50%', transform: 'translateX(-50%)'}}>
                      {config.electrons[0]}
                    </div>
                  </div>
                )}
                {config.electrons[1] > 0 && (
                  <div className="electron-orbit orbit-2" key="orbit-2">
                    {Array.from({length: config.electrons[1]}, (_, i) => {
                      const angle = (360 / config.electrons[1]) * i;
                      return (
                        <div 
                          key={`electron-2-${i}`} 
                          className="electron" 
                          style={{
                            transform: `rotate(${angle}deg)`,
                            transformOrigin: '50% 80px'
                          }}
                        />
                      );
                    })}
                    <div className="orbit-label" style={{top: '-25px', left: '50%', transform: 'translateX(-50%)'}}>
                      {config.electrons[1]}
                    </div>
                  </div>
                )}
                {config.electrons[2] > 0 && (
                  <div className="electron-orbit orbit-3" key="orbit-3">
                    {Array.from({length: config.electrons[2]}, (_, i) => {
                      const angle = (360 / config.electrons[2]) * i;
                      return (
                        <div 
                          key={`electron-3-${i}`} 
                          className="electron" 
                          style={{
                            transform: `rotate(${angle}deg)`,
                            transformOrigin: '50% 105px'
                          }}
                        />
                      );
                    })}
                    <div className="orbit-label" style={{top: '-25px', left: '50%', transform: 'translateX(-50%)'}}>
                      {config.electrons[2]}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        <div style={{textAlign: 'center'}}>
          <label>Choose Element: </label>
          <select 
            value={elementSelect} 
            onChange={(e) => {
              setElementSelect(e.target.value);
              changeAtom();
            }}
            style={{padding: '8px', borderRadius: '5px', marginLeft: '10px', background: 'white', color: '#333'}}
          >
            <option value="1">Hydrogen (1)</option>
            <option value="2">Helium (2)</option>
            <option value="6">Carbon (6)</option>
            <option value="8">Oxygen (8)</option>
            <option value="11">Sodium (11)</option>
          </select>
          
          {(() => {
            const config = getElectronConfiguration(parseInt(elementSelect));
            return (
              <div style={{marginTop: '15px', fontSize: '14px', color: 'rgba(255,255,255,0.9)'}}>
                <div><strong>{config.element}</strong> - Atomic Number: {elementSelect}</div>
                <div>Total Electrons: {config.totalElectrons}</div>
                <div>Electron Configuration: {config.electrons.filter(e => e > 0).join(', ')}</div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* States of Matter Section */}
      <div className={`playground-section ${activeSection === 'states' ? 'active' : ''}`}>
        <h2 className="section-title">🌡️ States of Matter Simulator</h2>
        <p style={{textAlign: 'center', marginBottom: '20px'}}>
          Click on each state to see how particles move! Temperature controls everything! 🔥❄️
        </p>
        
        <div className="states-container">
          <div className="state-box" onClick={() => animateState('solid')}>
            <h3>❄️ Solid</h3>
            <div className="particles-container">
              {Array.from({length: 16}, (_, i) => (
                <div 
                  key={i} 
                  className="particle particle-solid" 
                  style={{
                    left: `${20 + (i % 4) * 30}px`,
                    top: `${20 + Math.floor(i / 4) * 30}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
            <p>Particles vibrate in fixed positions</p>
          </div>
          
          <div className="state-box" onClick={() => animateState('liquid')}>
            <h3>💧 Liquid</h3>
            <div className="particles-container">
              {Array.from({length: 12}, (_, i) => (
                <div 
                  key={i} 
                  className="particle particle-liquid" 
                  style={{
                    left: `${20 + (i % 3) * 40}px`,
                    top: `${30 + Math.floor(i / 3) * 25}px`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            <p>Particles move freely but stay together</p>
          </div>
          
          <div className="state-box" onClick={() => animateState('gas')}>
            <h3>💨 Gas</h3>
            <div className="particles-container">
              {Array.from({length: 8}, (_, i) => (
                <div 
                  key={i} 
                  className="particle particle-gas" 
                  style={{
                    left: `${15 + Math.random() * 120}px`,
                    top: `${15 + Math.random() * 120}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`
                  }}
                />
              ))}
            </div>
            <p>Particles zoom around everywhere!</p>
          </div>
        </div>
      </div>

      {/* Mole Calculator Section */}
      <div className={`playground-section ${activeSection === 'moles' ? 'active' : ''}`}>
        <h2 className="section-title">🔢 Mole Master Calculator</h2>
        <p style={{textAlign: 'center', marginBottom: '20px'}}>
          The ultimate chemistry currency converter! 💰✨
        </p>
        
        <div className="calculator-container">
          <h3 style={{textAlign: 'center', marginBottom: '20px'}}>Mass ↔ Moles ↔ Particles</h3>
          
          <input 
            type="number" 
            className="calc-input" 
            placeholder="Enter mass (grams)"
            value={massInput}
            onChange={(e) => setMassInput(e.target.value)}
          />
          <input 
            type="number" 
            className="calc-input" 
            placeholder="Enter molar mass (g/mol)"
            value={molarMassInput}
            onChange={(e) => setMolarMassInput(e.target.value)}
          />
          
          <button className="calc-btn" onClick={calculateMoles}>
            🚀 Calculate Everything!
          </button>
          
          {results && (
            <div className="result-box">
              <div>🔬 <strong>Moles:</strong> {results.moles} mol</div>
              <div>⚛️ <strong>Particles:</strong> {results.particles} atoms/molecules</div>
              <div>💡 <em>{results.funFact}</em></div>
            </div>
          )}
        </div>
      </div>

      {/* Chemical Reactions Section */}
      <div className={`playground-section ${activeSection === 'reactions' ? 'active' : ''}`}>
        <h2 className="section-title">🔥 Reaction Theater</h2>
        <p style={{textAlign: 'center', marginBottom: '20px'}}>
          Watch molecules dance and transform! Chemistry is basically molecular choreography! 💃🕺
        </p>
        
        <div className="reaction-container">
          <div className="molecule">
            <div className="atom-sphere hydrogen">H</div>
            <div className="atom-sphere hydrogen">H</div>
          </div>
          <span className="plus-sign">+</span>
          <div className="molecule">
            <div className="atom-sphere hydrogen">H</div>
            <div className="atom-sphere hydrogen">H</div>
          </div>
          <span className="plus-sign">+</span>
          <div className="molecule">
            <div className="atom-sphere oxygen">O</div>
            <div className="atom-sphere oxygen">O</div>
          </div>
          <span className="arrow">→</span>
          <div className="molecule">
            <div className="atom-sphere hydrogen">H</div>
            <div className="atom-sphere oxygen">O</div>
            <div className="atom-sphere hydrogen">H</div>
          </div>
          <span className="plus-sign">+</span>
          <div className="molecule">
            <div className="atom-sphere hydrogen">H</div>
            <div className="atom-sphere oxygen">O</div>
            <div className="atom-sphere hydrogen">H</div>
          </div>
        </div>

        <div style={{textAlign: 'center', marginTop: '30px'}}>
          <button className="calc-btn" onClick={animateReaction} style={{width: 'auto', padding: '10px 30px'}}>
            ⚡ Watch Reaction Again!
          </button>
          <p style={{marginTop: '15px'}}>2H₂ + O₂ → 2H₂O (Water formation - the ultimate chemistry flex! 💧)</p>
        </div>
      </div>

      {/* Solutions Section */}
      <div className={`playground-section ${activeSection === 'solutions' ? 'active' : ''}`}>
        <h2 className="section-title">💧 Solution Mixer Lab</h2>
        <p style={{textAlign: 'center', marginBottom: '20px'}}>
          Mix and match to create different concentrations! It's like being a chemistry bartender! 🍹
        </p>
        
        <div style={{textAlign: 'center', margin: '20px 0'}}>
          <label>Solute Amount: </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={soluteValue} 
            onChange={(e) => updateSolution(parseInt(e.target.value))}
            style={{margin: '0 10px'}}
          />
          <span>{soluteValue}g</span>
        </div>

        <div className="mixer-container">
          <div 
            className="beaker" 
            style={{
              '--solution-color': '#74b9ff',
              '--fill-level': `${30 + soluteValue * 0.4}%`
            } as React.CSSProperties}
          >
            <div className="beaker-label">Dilute Solution</div>
          </div>
          <div 
            className="beaker" 
            style={{
              '--solution-color': '#0984e3',
              '--fill-level': `${40 + soluteValue * 0.5}%`
            } as React.CSSProperties}
          >
            <div className="beaker-label">Concentrated Solution</div>
          </div>
          <div 
            className="beaker" 
            style={{
              '--solution-color': '#2d3436',
              '--fill-level': `${50 + soluteValue * 0.4}%`
            } as React.CSSProperties}
          >
            <div className="beaker-label">Saturated Solution</div>
          </div>
        </div>

        <div style={{textAlign: 'center', marginTop: '30px', fontSize: '1.1rem'}}>
          <div>Concentration: <strong>{soluteValue}%</strong></div>
          <p style={{marginTop: '10px', opacity: 0.8}}>More solute = darker color = higher concentration! 🎨</p>
        </div>
      </div>
    </div>
  );
};

export default ChemistryPlayground;
