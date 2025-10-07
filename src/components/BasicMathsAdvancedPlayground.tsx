import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Html, Line, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, Calculator, Activity } from 'lucide-react';

// Using drei's built-in <Line /> for robustness

// 3D Dimensional Analysis Visualizer
function DimensionalCube({ dimensions, color }: { dimensions: [number, number, number], color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7) * 0.1;
    }
  });

  // Scale dimensions for better visualization
  const scaledDims: [number, number, number] = [
    Math.max(0.5, Math.abs(dimensions[0]) * 0.8),
    Math.max(0.5, Math.abs(dimensions[1]) * 0.8), 
    Math.max(0.5, Math.abs(dimensions[2]) * 0.8)
  ];

  return (
    <group>
      {/* Main box */}
      <Box ref={meshRef} args={scaledDims} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} transparent opacity={0.85} />
      </Box>
      
      {/* Wireframe for better visibility */}
      <Box args={scaledDims} position={[0, 0, 0]}>
        <meshBasicMaterial color="#333333" wireframe transparent opacity={0.3} />
      </Box>
      
      {/* Dimension labels */}
      <Html position={[0, scaledDims[1]/2 + 0.8, 0]} center>
        <div className="text-gray-800 text-sm font-semibold bg-white bg-opacity-90 px-3 py-1 rounded-lg border shadow-sm">
          M={dimensions[0]} | L={dimensions[1]} | T={dimensions[2]}
        </div>
      </Html>
      
      {/* Axis labels for reference */}
      <Html position={[scaledDims[0]/2 + 0.5, 0, 0]} center>
        <div className="text-red-600 text-xs font-bold">M</div>
      </Html>
      <Html position={[0, scaledDims[1]/2 + 0.3, 0]} center>
        <div className="text-green-600 text-xs font-bold">L</div>
      </Html>
      <Html position={[0, 0, scaledDims[2]/2 + 0.5]} center>
        <div className="text-blue-600 text-xs font-bold">T</div>
      </Html>
    </group>
  );
}

// 3D Vector Visualizer
function Vector3D({ vector, color, label }: { vector: [number, number, number], color: string, label: string }) {
  const points = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(vector[0], vector[1], vector[2])
  ], [vector]);

  return (
    <group>
      <Line points={points} color={color} lineWidth={3} />
      <Sphere args={[0.1]} position={vector}>
        <meshStandardMaterial color={color} />
      </Sphere>
      <Html position={[vector[0], vector[1] + 0.3, vector[2]]} center>
        <div className="text-white text-xs bg-black bg-opacity-70 px-2 py-1 rounded">
          {label}: ({vector[0].toFixed(1)}, {vector[1].toFixed(1)}, {vector[2].toFixed(1)})
        </div>
      </Html>
    </group>
  );
}

// Complex Number Plane
function ComplexPlane({ z, showPolar }: { z: { real: number, imag: number }, showPolar: boolean }) {
  const magnitude = Math.sqrt(z.real * z.real + z.imag * z.imag);
  const angle = Math.atan2(z.imag, z.real);
  
  return (
    <group>
      {/* Axes */}
      <Line points={[[-3, 0, 0], [3, 0, 0]]} color="#666" />
      <Line points={[[0, -3, 0], [0, 3, 0]]} color="#666" />
      
      {/* Complex number point */}
      <Sphere args={[0.1]} position={[z.real, z.imag, 0]}>
        <meshStandardMaterial color="#ff6b6b" />
      </Sphere>
      
      {/* Vector from origin */}
      <Line points={[[0, 0, 0], [z.real, z.imag, 0]]} color="#4ecdc4" lineWidth={2} />
      
      {showPolar && (
        <>
          {/* Magnitude arc */}
          <Html position={[z.real/2, z.imag/2, 0]} center>
            <div className="text-white text-xs bg-black bg-opacity-70 px-2 py-1 rounded">
              |z| = {magnitude.toFixed(2)}
            </div>
          </Html>
          
          {/* Angle arc */}
          <Html position={[1, 0.5, 0]} center>
            <div className="text-white text-xs bg-black bg-opacity-70 px-2 py-1 rounded">
              θ = {(angle * 180 / Math.PI).toFixed(1)}°
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

// Exponential Decay Visualizer
function ExponentialCurve({ lambda, t, showPoints }: { lambda: number, t: number, showPoints: boolean }) {
  const points = useMemo(() => {
    const pts = [];
    for (let x = 0; x <= 5; x += 0.1) {
      const y = Math.exp(-lambda * x);
      pts.push(new THREE.Vector3(x - 2.5, y - 0.5, 0));
    }
    return pts;
  }, [lambda]);

  const currentPoint = useMemo(() => {
    const y = Math.exp(-lambda * t);
    return [t - 2.5, y - 0.5, 0] as [number, number, number];
  }, [lambda, t]);

  return (
    <group>
      <Line points={points} color="#45b7d1" lineWidth={2} />
      {showPoints && (
        <Sphere args={[0.05]} position={currentPoint}>
          <meshStandardMaterial color="#ff6b6b" />
        </Sphere>
      )}
      <Html position={[currentPoint[0], currentPoint[1] + 0.3, 0]} center>
        <div className="text-white text-xs bg-black bg-opacity-70 px-2 py-1 rounded">
          N(t) = e^(-{lambda}t) = {Math.exp(-lambda * t).toFixed(3)}
        </div>
      </Html>
    </group>
  );
}

// Main Playground Component
// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full bg-white rounded-2xl p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">The interactive lab encountered an error.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function BasicMathsAdvancedPlayground() {
  const [activeTab, setActiveTab] = useState('dimensions');
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expStyle, setExpStyle] = useState<'blocks'>('blocks');

  // Initialize component
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Dimensional Analysis State
  const [selectedQuantity, setSelectedQuantity] = useState('force');
  const [customDimensions, setCustomDimensions] = useState([2, 1, 1]);

  // Error Analysis State
  const [measurement, setMeasurement] = useState({ value: 2.05, error: 0.01, power: 3 });
  const [errorResult, setErrorResult] = useState(0);

  // Vector State
  const [vectorA, setVectorA] = useState([2, 1, 0]);
  const [vectorB, setVectorB] = useState([1, 2, 1]);
  const [vectorOp, setVectorOp] = useState('add');

  // Complex Numbers State
  const [complexZ, setComplexZ] = useState({ real: 1, imag: 1 });
  const [showPolar, setShowPolar] = useState(false);

  // Exponential State
  const [lambda, setLambda] = useState(0.5);
  const [showDecayPoints, setShowDecayPoints] = useState(true);

  // Trigonometry State
  const [angle, setAngle] = useState(Math.PI / 4);
  const [trigFunction, setTrigFunction] = useState('sin');

  // Integration State
  const [integralFunction, setIntegralFunction] = useState('x^2');
  const [integralBounds, setIntegralBounds] = useState([0, 2]);

  // Animation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        // Speed depends on lambda (faster decay -> faster timeline)
        const baseDt = 0.1; // seconds per tick at lambda = 0.5
        const dt = baseDt * (lambda / 0.5);
        const zeroEps = 0.001;
        const zeroTime = Math.log(1 / zeroEps) / Math.max(0.0001, lambda);
        setTime(prev => {
          const next = prev + dt;
          if (next >= zeroTime) {
            setIsPlaying(false);
            return zeroTime;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, lambda]);

  // Calculate error propagation
  useEffect(() => {
    const relativeError = (measurement.error / measurement.value);
    const totalError = measurement.power * relativeError * 100;
    setErrorResult(totalError);
  }, [measurement]);

  const quantities = {
    force: { 
      dim: [1, 1, -2], 
      color: '#ff6b6b', 
      label: 'Force = MLT⁻²',
      explanation: 'Force = Mass × Acceleration. Since acceleration = distance/time², force = M × L × T⁻²',
      examples: 'Newtons (N), pounds-force (lbf)',
      realWorld: 'Pushing a car, weight of objects, magnetic forces'
    },
    energy: { 
      dim: [1, 2, -2], 
      color: '#4ecdc4', 
      label: 'Energy = ML²T⁻²',
      explanation: 'Energy = Force × Distance. Since force = MLT⁻², energy = MLT⁻² × L = ML²T⁻²',
      examples: 'Joules (J), calories (cal), BTU',
      realWorld: 'Battery capacity, food calories, kinetic energy of moving objects'
    },
    pressure: { 
      dim: [1, -1, -2], 
      color: '#45b7d1', 
      label: 'Pressure = ML⁻¹T⁻²',
      explanation: 'Pressure = Force/Area. Since force = MLT⁻² and area = L², pressure = MLT⁻²/L² = ML⁻¹T⁻²',
      examples: 'Pascals (Pa), PSI, atmospheres (atm)',
      realWorld: 'Tire pressure, blood pressure, atmospheric pressure'
    },
    power: { 
      dim: [1, 2, -3], 
      color: '#96ceb4', 
      label: 'Power = ML²T⁻³',
      explanation: 'Power = Energy/Time. Since energy = ML²T⁻², power = ML²T⁻²/T = ML²T⁻³',
      examples: 'Watts (W), horsepower (hp), BTU/hour',
      realWorld: 'Light bulb wattage, car engine power, electrical consumption'
    }
  };

  const tabs = [
    { id: 'dimensions', label: '🔬 Dimensions', icon: Calculator },
    { id: 'errors', label: '⚠️ Error Analysis', icon: Activity },
    { id: 'vectors', label: '🎯 Vector Playground', icon: Zap },
    { id: 'trigonometry', label: '⭕ Trigonometry Circle', icon: RotateCcw },
    { id: 'complex', label: '🌀 Complex Plane', icon: RotateCcw },
    { id: 'exponential', label: '📈 Exponentials', icon: Activity },
    { id: 'calculus', label: '∫ Calculus Viz', icon: Calculator }
  ];

  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-6 shadow-xl border border-gray-200">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Interactive Lab...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-6 shadow-xl border border-gray-200">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          🚀 Advanced Basic Maths Playground
        </h2>
        <p className="text-gray-600">Interactive 3D visualizations for mastering physics mathematics</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Global Controls - only for Exponentials */}
      {activeTab === 'exponential' && (
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => {
              if (!isPlaying) setTime(0); // always start from zero
              setIsPlaying(!isPlaying);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Play'} Animation
          </button>
          <button
            onClick={() => {
              setTime(0);
              setIsPlaying(false);
              setLambda(0.5);
              setShowDecayPoints(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <div className="text-sm text-gray-500">
            Time: {time.toFixed(1)}s
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* 3D Visualization Panel */}
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
            <div className="h-96 bg-gradient-to-br from-white to-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <Canvas 
                camera={{ position: [0, 0, 8], fov: 60 }}
                onCreated={({ gl }) => {
                  gl.setClearColor('#f8fafc', 1);
                }}
                style={{ background: '#f8fafc' }}
              >
                {/* Keep projection flat for block view */}
                <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={60} />
                <ambientLight intensity={0.8} />
                <pointLight position={[0, 0, 10]} />
                <OrbitControls 
                  enablePan={false} 
                  enableZoom={true} 
                  enableRotate={false}
                  minDistance={1.2}
                  maxDistance={30}
                />

                {activeTab === 'dimensions' && (
                  <DimensionalCube
                    dimensions={customDimensions as [number, number, number]}
                    color={quantities[selectedQuantity as keyof typeof quantities].color}
                  />
                )}

                {activeTab === 'vectors' && (
                  <group>
                    {/* Grid */}
                    {Array.from({length: 21}, (_, i) => i - 10).map(i => (
                      <group key={i}>
                        <Line 
                          points={[[i, -10, 0], [i, 10, 0]]} 
                          color={i === 0 ? "#000000" : "#e5e7eb"} 
                          lineWidth={i === 0 ? 2 : 1}
                        />
                        <Line 
                          points={[[-10, i, 0], [10, i, 0]]} 
                          color={i === 0 ? "#000000" : "#e5e7eb"} 
                          lineWidth={i === 0 ? 2 : 1}
                        />
                      </group>
                    ))}
                    
                    {/* Vector A */}
                    <Line points={[[0, 0, 0], [vectorA[0], vectorA[1], 0]]} color="#4ecdc4" lineWidth={3} />
                    <Sphere args={[0.15]} position={[vectorA[0], vectorA[1], 0]}>
                      <meshStandardMaterial color="#4ecdc4" />
                    </Sphere>
                    <Html position={[vectorA[0]/2, vectorA[1]/2 + 0.5, 0]} center>
                      <div className="text-cyan-600 text-sm font-bold bg-white bg-opacity-90 px-2 py-1 rounded border border-cyan-200">
                        A⃗
                      </div>
                    </Html>
                    
                    {/* Vector B */}
                    <Line points={[[0, 0, 0], [vectorB[0], vectorB[1], 0]]} color="#ef4444" lineWidth={3} />
                    <Sphere args={[0.15]} position={[vectorB[0], vectorB[1], 0]}>
                      <meshStandardMaterial color="#ef4444" />
                    </Sphere>
                    <Html position={[vectorB[0]/2, vectorB[1]/2 + 0.5, 0]} center>
                      <div className="text-red-600 text-sm font-bold bg-white bg-opacity-90 px-2 py-1 rounded border border-red-200">
                        B⃗
                      </div>
                    </Html>
                    
                    {/* Result Vector */}
                    {(vectorOp === 'add' || vectorOp === 'subtract') && (
                      <>
                        <Line 
                          points={[[0, 0, 0], [
                            vectorA[0] + (vectorOp === 'add' ? vectorB[0] : -vectorB[0]), 
                            vectorA[1] + (vectorOp === 'add' ? vectorB[1] : -vectorB[1]), 
                            0
                          ]]} 
                          color="#45b7d1" 
                          lineWidth={4} 
                        />
                        <Sphere args={[0.2]} position={[
                          vectorA[0] + (vectorOp === 'add' ? vectorB[0] : -vectorB[0]), 
                          vectorA[1] + (vectorOp === 'add' ? vectorB[1] : -vectorB[1]), 
                          0
                        ]}>
                          <meshStandardMaterial color="#45b7d1" />
                        </Sphere>
                      </>
                    )}
                  </group>
                )}

                {activeTab === 'trigonometry' && (
                  <group>
                    {/* Unit Circle */}
                    <Line 
                      points={Array.from({length: 65}, (_, i) => {
                        const t = (i / 64) * Math.PI * 2;
                        return new THREE.Vector3(Math.cos(t) * 3, Math.sin(t) * 3, 0);
                      })}
                      color="#000000"
                      lineWidth={2}
                    />
                    
                    {/* Axes */}
                    <Line points={[[-4, 0, 0], [4, 0, 0]]} color="#000000" lineWidth={2} />
                    <Line points={[[0, -4, 0], [0, 4, 0]]} color="#000000" lineWidth={2} />
                    
                    {/* Angle line */}
                    <Line 
                      points={[[0, 0, 0], [Math.cos(angle) * 3, Math.sin(angle) * 3, 0]]} 
                      color="#ff6b6b" 
                      lineWidth={3} 
                    />
                    
                    {/* Point on circle */}
                    <Sphere args={[0.1]} position={[Math.cos(angle) * 3, Math.sin(angle) * 3, 0]}>
                      <meshStandardMaterial color="#ff6b6b" />
                    </Sphere>
                    
                    {/* Sin/Cos lines */}
                    <Line points={[[Math.cos(angle) * 3, 0, 0], [Math.cos(angle) * 3, Math.sin(angle) * 3, 0]]} color="#4ecdc4" lineWidth={2} />
                    <Line points={[[0, Math.sin(angle) * 3, 0], [Math.cos(angle) * 3, Math.sin(angle) * 3, 0]]} color="#45b7d1" lineWidth={2} />
                    
                    {/* Labels */}
                    <Html position={[Math.cos(angle) * 3 + 0.3, Math.sin(angle) * 3 + 0.3, 0]} center>
                      <div className="text-gray-800 text-xs bg-white bg-opacity-90 px-2 py-1 rounded border border-gray-200">
                        ({Math.cos(angle).toFixed(3)}, {Math.sin(angle).toFixed(3)})
                      </div>
                    </Html>
                  </group>
                )}

                {activeTab === 'complex' && (
                  <ComplexPlane z={complexZ} showPolar={showPolar} />
                )}

                {activeTab === 'exponential' && (
                  <group>
                    {/* No background/grid/axes for blocks-only view */}

                    {/* Blocks mode only - bigger blocks, centered */}
                    <group position={[-4.5, -3.6, 0]}
                           scale={[1.1, 1.1, 1]}
                    >
                      {Array.from({ length: 10 }).map((_, row) => (
                        <group key={row} position={[0, row * 0.8, 0]}>
                          {Array.from({ length: 10 }).map((_, col) => {
                              const index = row * 10 + col;
                              const threshold = index / 100;
                              const alive = Math.exp(-lambda * Math.max(0, time)) > threshold;
                              return (
                                <Box key={col} args={[0.75, 0.75, 0.75]} position={[col * 0.95, 0, 0]}>
                                  <meshStandardMaterial color={alive ? '#22c55e' : '#e5e7eb'} opacity={alive ? 1 : 0.25} transparent />
                                </Box>
                              );
                            })}
                          </group>
                        ))}
                        <Html position={[4.2, 8.2, 0]} center>
                          <div className="text-sm font-semibold text-gray-700 bg-white/90 px-2 py-1 rounded border border-gray-200">
                            {Math.round(Math.exp(-lambda * Math.max(0, time)) * 100)} / 100 left
                          </div>
                        </Html>
                      </group>

                    {showDecayPoints && expStyle === 'graph' && (
                      <>
                        <Sphere args={[0.08]} position={[time - 5, Math.exp(-lambda * time) * 2 - 2, 0]}>
                          <meshStandardMaterial color="#dc2626" />
                        </Sphere>
                        <Html position={[time - 5 + 0.3, Math.exp(-lambda * time) * 2 - 2 + 0.2, 0]} center>
                          <div className="text-red-600 text-xs font-bold bg-white bg-opacity-95 px-2 py-1 rounded border border-red-200">
                            {Math.exp(-lambda * time).toFixed(3)}
                          </div>
                        </Html>
                      </>
                    )}
                  </group>
                )}

                {activeTab === 'calculus' && (
                  <group>
                    {/* Axes with clear labels */}
                    <Line points={[[-5, 0, 0], [5, 0, 0]]} color="#000000" lineWidth={3} />
                    <Line points={[[0, -1, 0], [0, 3, 0]]} color="#000000" lineWidth={3} />
                    
                    {/* Function curve - make it thick and colorful */}
                    <Line 
                      points={Array.from({length: 200}, (_, i) => {
                        const x = (i - 100) / 20;
                        const y = x * x / 4;
                        return new THREE.Vector3(x, y, 0);
                      })}
                      color="#2563eb"
                      lineWidth={5}
                    />
                    
                    {/* Integration area - make it very obvious */}
                    {Array.from({length: 50}, (_, i) => {
                      const x = integralBounds[0] + (i / 49) * (integralBounds[1] - integralBounds[0]);
                      const y = x * x / 4;
                      return (
                        <Line 
                          key={i}
                          points={[[x, 0, 0], [x, y, 0]]} 
                          color="#10b981" 
                          lineWidth={4}
                        />
                      );
                    })}
                    
                    {/* Integration bounds - make them very prominent */}
                    <Line points={[[integralBounds[0], -0.5, 0], [integralBounds[0], 2.5, 0]]} color="#dc2626" lineWidth={5} />
                    <Line points={[[integralBounds[1], -0.5, 0], [integralBounds[1], 2.5, 0]]} color="#dc2626" lineWidth={5} />
                    
                    {/* Minimal labels */}
                    <Html position={[integralBounds[0], -0.6, 0]} center>
                      <div className="text-red-600 text-sm font-bold bg-white bg-opacity-90 px-2 py-1 rounded border border-red-200">
                        {integralBounds[0]}
                      </div>
                    </Html>
                    <Html position={[integralBounds[1], -0.6, 0]} center>
                      <div className="text-red-600 text-sm font-bold bg-white bg-opacity-90 px-2 py-1 rounded border border-red-200">
                        {integralBounds[1]}
                      </div>
                    </Html>
                  </group>
                )}
              </Canvas>
            </div>
            {activeTab === 'exponential' && (
              <div className="mt-3 text-center text-sm text-gray-600">
                <div>Use your mouse wheel or trackpad to <span className="font-semibold">scroll in/out</span> and see the blocks bigger or smaller.</div>
                <div className="mt-1">Click <span className="font-semibold">Play Animation</span> to start from 0 → end. When it finishes, click <span className="font-semibold">Reset</span> to replay.</div>
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="bg-white rounded-xl p-4 space-y-4 shadow-lg border border-gray-200">
            {activeTab === 'dimensions' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-600">🔬 Dimensional Analysis</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Choose a Physical Quantity:</label>
                  <select
                    value={selectedQuantity}
                    onChange={(e) => {
                      setSelectedQuantity(e.target.value);
                      // Update custom dimensions to match the selected quantity
                      const quantity = quantities[e.target.value as keyof typeof quantities];
                      setCustomDimensions(quantity.dim.map(Math.abs)); // Use absolute values for box dimensions
                    }}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-800"
                  >
                    {Object.entries(quantities).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Current quantity explanation */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-2">{quantities[selectedQuantity as keyof typeof quantities].label}</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>How it works:</strong> {quantities[selectedQuantity as keyof typeof quantities].explanation}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Units:</strong> {quantities[selectedQuantity as keyof typeof quantities].examples}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Real world:</strong> {quantities[selectedQuantity as keyof typeof quantities].realWorld}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Adjust Dimensions (M, L, T):</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-600 mb-1">M</span>
                      <input
                        type="number"
                        step="0.1"
                        min={0}
                        value={customDimensions[0]}
                        onChange={(e) => {
                          const next = [...customDimensions];
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          next[0] = val;
                          setCustomDimensions(next);
                        }}
                        className="p-2 bg-white border border-gray-300 rounded text-gray-800 text-center"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-600 mb-1">L</span>
                      <input
                        type="number"
                        step="0.1"
                        min={0}
                        value={customDimensions[1]}
                        onChange={(e) => {
                          const next = [...customDimensions];
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          next[1] = val;
                          setCustomDimensions(next);
                        }}
                        className="p-2 bg-white border border-gray-300 rounded text-gray-800 text-center"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-600 mb-1">T</span>
                      <input
                        type="number"
                        step="0.1"
                        min={0}
                        value={customDimensions[2]}
                        onChange={(e) => {
                          const next = [...customDimensions];
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          next[2] = val;
                          setCustomDimensions(next);
                        }}
                        className="p-2 bg-white border border-gray-300 rounded text-gray-800 text-center"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => setCustomDimensions((quantities[selectedQuantity as keyof typeof quantities].dim as number[]).map(Math.abs) as [number, number, number])}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Reset to {quantities[selectedQuantity as keyof typeof quantities].label}
                    </button>
                    <span className="text-xs text-gray-500">These control the box size along each axis.</span>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>📊 What you're seeing:</strong> The rotating 3D box represents the dimensional "shape" of {selectedQuantity}. 
                    The box size shows how Mass (M), Length (L), and Time (T) combine to create this physical quantity.
                  </p>
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    <strong>🔍 Try this:</strong> Switch between Force and Energy. Notice how Energy's box is different 
                    because energy involves distance squared (L²), while Force only involves distance once (L).
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'errors' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-orange-400">⚠️ Error Propagation</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Measurement Value:</label>
                  <input
                    type="number"
                    value={measurement.value}
                    onChange={(e) => setMeasurement({...measurement, value: parseFloat(e.target.value) || 0})}
                    className="w-full p-2 bg-slate-700 rounded-lg text-white"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Error (±):</label>
                  <input
                    type="number"
                    value={measurement.error}
                    onChange={(e) => setMeasurement({...measurement, error: parseFloat(e.target.value) || 0})}
                    className="w-full p-2 bg-slate-700 rounded-lg text-white"
                    step="0.001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Power (for x^n):</label>
                  <input
                    type="number"
                    value={measurement.power}
                    onChange={(e) => setMeasurement({...measurement, power: parseInt(e.target.value) || 1})}
                    className="w-full p-2 bg-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-lg">
                  <h4 className="font-bold text-white mb-2">📊 Result:</h4>
                  <p className="text-white text-lg">
                    Percentage Error: <span className="font-mono">{errorResult.toFixed(2)}%</span>
                  </p>
                  <p className="text-sm text-orange-100 mt-2">
                    For power operations: Δz/z = n(Δx/x)
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'vectors' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-600">🎯 Vector Playground</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-cyan-600 mb-3">Vector A⃗</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-sm">X:</span>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="0.1"
                        value={vectorA[0]}
                        onChange={(e) => {
                          const newVector = [...vectorA];
                          newVector[0] = parseFloat(e.target.value);
                          setVectorA(newVector);
                        }}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm text-cyan-600 font-mono">{vectorA[0].toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-sm text-gray-700">Y:</span>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="0.1"
                        value={vectorA[1]}
                        onChange={(e) => {
                          const newVector = [...vectorA];
                          newVector[1] = parseFloat(e.target.value);
                          setVectorA(newVector);
                        }}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm text-cyan-600 font-mono">{vectorA[1].toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-red-600 mb-3">Vector B⃗</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-sm">X:</span>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="0.1"
                        value={vectorB[0]}
                        onChange={(e) => {
                          const newVector = [...vectorB];
                          newVector[0] = parseFloat(e.target.value);
                          setVectorB(newVector);
                        }}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm text-red-600 font-mono">{vectorB[0].toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-sm text-gray-700">Y:</span>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="0.1"
                        value={vectorB[1]}
                        onChange={(e) => {
                          const newVector = [...vectorB];
                          newVector[1] = parseFloat(e.target.value);
                          setVectorB(newVector);
                        }}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm text-red-600 font-mono">{vectorB[1].toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setVectorOp('add')}
                    className={`p-3 rounded-lg font-medium ${vectorOp === 'add' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                  >
                    A + B
                  </button>
                  <button
                    onClick={() => setVectorOp('subtract')}
                    className={`p-3 rounded-lg font-medium ${vectorOp === 'subtract' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                  >
                    A - B
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setVectorOp('dot')}
                    className={`p-3 rounded-lg font-medium ${vectorOp === 'dot' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                  >
                    A · B
                  </button>
                  <button
                    onClick={() => setVectorOp('cross')}
                    className={`p-3 rounded-lg font-medium ${vectorOp === 'cross' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                  >
                    A × B
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <span className="text-cyan-600">|A| = </span>
                      <span className="text-gray-800 font-mono font-bold">{Math.sqrt(vectorA[0]*vectorA[0] + vectorA[1]*vectorA[1]).toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-red-600">|B| = </span>
                      <span className="text-gray-800 font-mono font-bold">{Math.sqrt(vectorB[0]*vectorB[0] + vectorB[1]*vectorB[1]).toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-green-600">Result: </span>
                      <span className="text-gray-800 font-mono font-bold">
                        {vectorOp === 'dot' 
                          ? (vectorA[0]*vectorB[0] + vectorA[1]*vectorB[1]).toFixed(2)
                          : vectorOp === 'cross'
                          ? `${(vectorA[0]*vectorB[1] - vectorA[1]*vectorB[0]).toFixed(2)} k̂`
                          : `${(vectorA[0] + (vectorOp === 'add' ? vectorB[0] : -vectorB[0])).toFixed(1)}, ${(vectorA[1] + (vectorOp === 'add' ? vectorB[1] : -vectorB[1])).toFixed(1)}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trigonometry' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-orange-400">⭕ Trigonometry Circle</h3>
                
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-400 mb-3">Angle Control</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-sm">Angle:</span>
                      <input
                        type="range"
                        min="0"
                        max={Math.PI * 2}
                        step="0.01"
                        value={angle}
                        onChange={(e) => setAngle(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <span className="w-16 text-sm text-orange-400">{(angle * 180 / Math.PI).toFixed(0)}°</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[0, 30, 45, 60, 90].map(deg => (
                    <button
                      key={deg}
                      onClick={() => setAngle(deg * Math.PI / 180)}
                      className={`p-2 rounded-lg text-sm font-medium ${
                        Math.abs(angle - deg * Math.PI / 180) < 0.01 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>

                <div className="bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-400 mb-3">Trigonometric Values</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-cyan-400">sin θ =</span>
                      <span className="text-white font-mono">{Math.sin(angle).toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-400">cos θ =</span>
                      <span className="text-white font-mono">{Math.cos(angle).toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">tan θ =</span>
                      <span className="text-white font-mono">
                        {Math.abs(Math.cos(angle)) < 0.001 ? '∞' : (Math.tan(angle)).toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="smallAngle"
                    checked={angle < Math.PI / 6}
                    onChange={(e) => e.target.checked && setAngle(Math.PI / 12)}
                    className="rounded"
                  />
                  <label htmlFor="smallAngle" className="text-sm">Small Angle Approximation</label>
                </div>

                {angle < Math.PI / 6 && (
                  <div className="bg-yellow-900 bg-opacity-50 p-3 rounded-lg">
                    <h4 className="font-medium text-yellow-400 mb-2">📐 Small Angle Approximation:</h4>
                    <div className="text-sm space-y-1">
                      <p>sin θ ≈ θ = {angle.toFixed(3)} (actual: {Math.sin(angle).toFixed(3)})</p>
                      <p>cos θ ≈ 1 = 1.000 (actual: {Math.cos(angle).toFixed(3)})</p>
                      <p>tan θ ≈ θ = {angle.toFixed(3)} (actual: {Math.tan(angle).toFixed(3)})</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'complex' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-400">🌀 Complex Numbers Plane</h3>
                
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-400 mb-3">Complex Number</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-sm">Real:</span>
                      <input
                        type="range"
                        min="-5"
                        max="5"
                        step="0.1"
                        value={complexZ.real}
                        onChange={(e) => setComplexZ({...complexZ, real: parseFloat(e.target.value)})}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm text-cyan-400">{complexZ.real.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-sm">Imaginary:</span>
                      <input
                        type="range"
                        min="-5"
                        max="5"
                        step="0.1"
                        value={complexZ.imag}
                        onChange={(e) => setComplexZ({...complexZ, imag: parseFloat(e.target.value)})}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm text-cyan-400">{complexZ.imag.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-cyan-400">Rectangular: </span>
                      <span className="text-white font-mono">{complexZ.real.toFixed(1)} + {complexZ.imag.toFixed(1)}i</span>
                    </div>
                    <div>
                      <span className="text-cyan-400">Polar: </span>
                      <span className="text-white font-mono">
                        {Math.sqrt(complexZ.real*complexZ.real + complexZ.imag*complexZ.imag).toFixed(2)}∠{(Math.atan2(complexZ.imag, complexZ.real) * 180 / Math.PI).toFixed(1)}°
                      </span>
                    </div>
                    <div>
                      <span className="text-cyan-400">Exponential: </span>
                      <span className="text-white font-mono">
                        {Math.sqrt(complexZ.real*complexZ.real + complexZ.imag*complexZ.imag).toFixed(2)}e^({(Math.atan2(complexZ.imag, complexZ.real)).toFixed(3)}i)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowPolar(!showPolar)}
                    className={`p-3 rounded-lg font-medium ${showPolar ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                  >
                    Euler's Formula Demo
                  </button>
                  <button
                    onClick={() => {
                      const newZ = {
                        real: complexZ.real * complexZ.real - complexZ.imag * complexZ.imag,
                        imag: 2 * complexZ.real * complexZ.imag
                      };
                      setComplexZ(newZ);
                    }}
                    className="p-3 rounded-lg font-medium bg-slate-700 text-slate-300 hover:bg-slate-600"
                  >
                    Multiply Demo
                  </button>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-center text-sm">
                    <span className="text-purple-400">Magnitude: </span>
                    <span className="text-white font-mono text-lg">{Math.sqrt(complexZ.real*complexZ.real + complexZ.imag*complexZ.imag).toFixed(1)}</span>
                    <span className="mx-4 text-purple-400">Argument: </span>
                    <span className="text-white font-mono text-lg">{(Math.atan2(complexZ.imag, complexZ.real) * 180 / Math.PI).toFixed(1)}°</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'exponential' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-600">📉 Exponential Decay - Things That Fade Away</h3>
                
                {/* Simple explanation */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-2">🎯 What is Exponential Decay?</h4>
                  <p className="text-sm text-gray-700">
                    Things that decrease over time at a rate proportional to their current amount. 
                    Like a hot cup of coffee cooling down - the hotter it is, the faster it cools!
                  </p>
                </div>

                {/* Visualization style selector */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Visualization Style</label>
                  <div className="grid grid-cols-1">
                    <button
                      onClick={() => setExpStyle('blocks')}
                      className={`p-2 rounded-lg border ${'bg-green-100 border-green-300 text-green-800'}`}
                    >Blocks (default)</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">How Fast Does It Decay?</label>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={lambda}
                      onChange={(e) => setLambda(parseFloat(e.target.value))}
                      className="w-full mb-2"
                    />
                    <div className="text-center text-sm text-gray-600">
                      Decay Rate: {lambda} (Higher = Faster Decay)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showDecayPoints"
                    checked={showDecayPoints}
                    onChange={(e) => setShowDecayPoints(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="showDecayPoints" className="text-sm text-gray-700">Show Current Value</label>
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2">📊 Current Status:</h4>
                  <div className="bg-white p-3 rounded border border-green-300">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {(() => { const v = Math.exp(-lambda * time); return (v <= 0.001 ? 0 : v).toFixed(3); })()} of original amount left
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        After {time.toFixed(1)} seconds
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <h4 className="font-bold text-yellow-800 mb-2">⏰ Half-Life:</h4>
                  <div className="text-center text-lg font-bold text-yellow-600">
                    {(Math.log(2)/lambda).toFixed(1)} seconds
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    Time for half the amount to decay
                  </div>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-2">🌍 Real Examples:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>Radioactive atoms:</strong> Decay over time</li>
                    <li>• <strong>Hot coffee:</strong> Cools down to room temperature</li>
                    <li>• <strong>Battery charge:</strong> Drains when not in use</li>
                    <li>• <strong>Medicine in body:</strong> Gets metabolized</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'calculus' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-600">∫ Calculus Made Easy!</h3>
                
                {/* Simple explanation */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-2">🎯 Integration = Area under curve</h4>
                  <p className="text-sm text-gray-700">
                    Red lines = start/end points • Green area = what you're calculating
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Function:</label>
                  <select
                    value={integralFunction}
                    onChange={(e) => setIntegralFunction(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-800"
                  >
                    <option value="x^2">f(x) = x²</option>
                    <option value="sin(x)">f(x) = sin(x)</option>
                    <option value="exp(-x)">f(x) = e^(-x)</option>
                    <option value="1/x">f(x) = 1/x</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Bounds:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Start:</label>
                      <input
                        type="number"
                        value={integralBounds[0]}
                        onChange={(e) => setIntegralBounds([parseFloat(e.target.value) || 0, integralBounds[1]])}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-800 text-center"
                        placeholder="Start"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">End:</label>
                      <input
                        type="number"
                        value={integralBounds[1]}
                        onChange={(e) => setIntegralBounds([integralBounds[0], parseFloat(e.target.value) || 0])}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-800 text-center"
                        placeholder="End"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2">Result:</h4>
                  <div className="bg-white p-3 rounded border border-green-300 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      Area = {integralBounds[1] > integralBounds[0] ? 
                        (integralFunction === 'x^2' ? 
                          ((integralBounds[1]**3 - integralBounds[0]**3) / 3).toFixed(2) :
                          integralFunction === 'sin(x)' ?
                          (Math.cos(integralBounds[0]) - Math.cos(integralBounds[1])).toFixed(2) :
                          integralFunction === 'exp(-x)' ?
                          (Math.exp(-integralBounds[0]) - Math.exp(-integralBounds[1])).toFixed(2) :
                          (Math.log(Math.abs(integralBounds[1])) - Math.log(Math.abs(integralBounds[0]))).toFixed(2)
                        ) : 'Invalid bounds'}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      ∫{integralBounds[0]} to {integralBounds[1]} {integralFunction === 'x^2' ? 'x²' : 
                       integralFunction === 'sin(x)' ? 'sin(x)' :
                       integralFunction === 'exp(-x)' ? 'e^(-x)' : '1/x'} dx
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <h4 className="font-bold text-yellow-800 mb-2">Examples:</h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Work = ∫Force × distance</li>
                    <li>• Distance = ∫speed × time</li>
                    <li>• Electric field strength</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Gen-Z Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gradient-to-r from-blue-50 via-purple-50 to-cyan-50 p-6 rounded-xl border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">🔥 Gen-Z Learning Hacks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-yellow-600 mb-2">🎮 Gamify It</h4>
            <p className="text-gray-700">Play with the sliders and watch math come alive in 3D!</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-green-600 mb-2">📱 Visual Learning</h4>
            <p className="text-gray-700">Every formula has a shape - see the patterns!</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-blue-600 mb-2">🚀 Interactive</h4>
            <p className="text-gray-700">Don't just read - interact and remember forever!</p>
          </div>
        </div>
      </motion.div>
      </div>
    </ErrorBoundary>
  );
}
