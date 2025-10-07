import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

// Shared State Context
interface KinematicsState {
  // Basic Definitions
  motionType: 'linear' | 'circular' | 'oscillatory';
  setMotionType: (type: 'linear' | 'circular' | 'oscillatory') => void;
  
  // 1D Motion
  initialVel: number;
  setInitialVel: (vel: number) => void;
  acceleration: number;
  setAcceleration: (acc: number) => void;
  
  // 2D Motion
  vx: number;
  setVx: (vx: number) => void;
  vy: number;
  setVy: (vy: number) => void;
  
  // Projectile Motion
  projectileAngle: number;
  setProjectileAngle: (angle: number) => void;
  projectileSpeed: number;
  setProjectileSpeed: (speed: number) => void;
  
  // 3D Motion
  threeDMotionType: 'helix' | 'lissajous' | 'spiral';
  setThreeDMotionType: (type: 'helix' | 'lissajous' | 'spiral') => void;
  helixRadius: number;
  setHelixRadius: (radius: number) => void;
  helixPitch: number;
  setHelixPitch: (pitch: number) => void;
  
  // Relative Motion
  frameVelocity: number;
  setFrameVelocity: (vel: number) => void;
  objectVelocity: number;
  setObjectVelocity: (vel: number) => void;
  
  // Graphs
  graphType: 'position' | 'velocity' | 'acceleration';
  setGraphType: (type: 'position' | 'velocity' | 'acceleration') => void;
  graphMotionType: 'uniform' | 'accelerated' | 'oscillatory';
  setGraphMotionType: (type: 'uniform' | 'accelerated' | 'oscillatory') => void;
  
  // Advanced
  accelerationType: 'linear' | 'quadratic' | 'exponential' | 'sinusoidal';
  setAccelerationType: (type: 'linear' | 'quadratic' | 'exponential' | 'sinusoidal') => void;
  
  // Circular Motion
  circularRadius: number;
  setCircularRadius: (radius: number) => void;
  angularAcc: number;
  setAngularAcc: (acc: number) => void;
  showVectors: boolean;
  setShowVectors: (show: boolean) => void;
  
  // Constraints
  systemType: 'pulley' | 'rolling';
  setSystemType: (type: 'pulley' | 'rolling') => void;
  constraintParameter: number;
  setConstraintParameter: (param: number) => void;
  
  // Common controls
  time: number;
  setTime: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const KinematicsContext = createContext<KinematicsState | null>(null);

const useKinematics = () => {
  const context = useContext(KinematicsContext);
  if (!context) throw new Error('useKinematics must be used within KinematicsProvider');
  return context;
};

// Control Panel Components
const DefinitionsPanel = () => {
  const { motionType, setMotionType, time, isPlaying, setIsPlaying, setTime } = useKinematics();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center border-b border-gray-600 pb-2">Basic Kinematic Quantities</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-2">Motion Type:</label>
          <select 
            value={motionType} 
            onChange={(e) => setMotionType(e.target.value as any)}
            className="w-full p-2 bg-gray-800 rounded border border-gray-600"
          >
            <option value="linear">Linear Motion</option>
            <option value="circular">Circular Motion</option>
            <option value="oscillatory">Oscillatory Motion</option>
          </select>
        </div>
        
        <div className="bg-gray-800 p-3 rounded space-y-2">
          <p><span className="text-yellow-400 font-semibold">Position r⃗:</span> Live values</p>
          <p><span className="text-cyan-400 font-semibold">Velocity v⃗:</span> Live values</p>
          <p><span className="text-pink-400 font-semibold">Acceleration a⃗:</span> Live values</p>
          <p>Time: <span className="text-green-300 font-semibold">{time.toFixed(2)} s</span></p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="flex-1 py-3 bg-blue-600 rounded hover:bg-blue-700 font-semibold"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button 
            onClick={() => {setTime(0); setIsPlaying(false);}} 
            className="flex-1 py-3 bg-red-600 rounded hover:bg-red-700 font-semibold"
          >
            🔄 Reset
          </button>
        </div>
        
        <div className="bg-gray-800 p-3 rounded">
          <p className="text-xs text-gray-300">
            <strong>Concept:</strong> Fundamental vectors that describe any motion in space. 
            v⃗ = dr⃗/dt, a⃗ = dv⃗/dt
          </p>
        </div>
      </div>
    </div>
  );
};

const OneDPanel = () => {
  const { initialVel, setInitialVel, acceleration, setAcceleration, time, isPlaying, setIsPlaying, setTime } = useKinematics();

  const position = initialVel * time + 0.5 * acceleration * time * time;
  const velocity = initialVel + acceleration * time;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center border-b border-gray-600 pb-2">1D Kinematic Equations</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-1">Initial Velocity: {initialVel} m/s</label>
          <input 
            type="range" 
            min="-10" 
            max="15" 
            value={initialVel} 
            onChange={(e) => setInitialVel(Number(e.target.value))} 
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Acceleration: {acceleration} m/s²</label>
          <input 
            type="range" 
            min="-5" 
            max="8" 
            step="0.5" 
            value={acceleration} 
            onChange={(e) => setAcceleration(Number(e.target.value))} 
            className="w-full"
          />
        </div>
        
        <div className="bg-gray-800 p-3 rounded space-y-1">
          <p className="text-yellow-300 font-semibold">x = x₀ + v₀t + ½at²</p>
          <p>Position: <span className="text-green-300 font-semibold">{position.toFixed(2)} m</span></p>
          <p>Velocity: <span className="text-blue-300 font-semibold">{velocity.toFixed(2)} m/s</span></p>
          <p>Time: <span className="text-pink-300 font-semibold">{time.toFixed(2)} s</span></p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="flex-1 py-3 bg-blue-600 rounded hover:bg-blue-700 font-semibold"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button 
            onClick={() => {setTime(0); setIsPlaying(false);}} 
            className="flex-1 py-3 bg-red-600 rounded hover:bg-red-700 font-semibold"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
};

const TwoDPanel = () => {
  const { vx, setVx, vy, setVy, time, isPlaying, setIsPlaying, setTime } = useKinematics();

  const resultantVel = Math.sqrt(vx * vx + vy * vy);
  const angle = Math.atan2(vy, vx) * 180 / Math.PI;
  const x = vx * time;
  const y = vy * time;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center border-b border-gray-600 pb-2">2D Vector Components</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-1">vₓ: {vx} m/s</label>
          <input 
            type="range" 
            min="-8" 
            max="8" 
            step="0.5" 
            value={vx} 
            onChange={(e) => setVx(Number(e.target.value))} 
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">vᵧ: {vy} m/s</label>
          <input 
            type="range" 
            min="-8" 
            max="8" 
            step="0.5" 
            value={vy} 
            onChange={(e) => setVy(Number(e.target.value))} 
            className="w-full"
          />
        </div>
        
        <div className="bg-gray-800 p-3 rounded space-y-1">
          <p><span className="text-red-400 font-semibold">vₓ:</span> {vx} m/s</p>
          <p><span className="text-green-400 font-semibold">vᵧ:</span> {vy} m/s</p>
          <p><span className="text-blue-400 font-semibold">|v⃗|:</span> {resultantVel.toFixed(2)} m/s</p>
          <p><span className="text-yellow-400 font-semibold">θ:</span> {angle.toFixed(1)}°</p>
          <p>Position: ({x.toFixed(1)}, {y.toFixed(1)})</p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="flex-1 py-3 bg-blue-600 rounded hover:bg-blue-700 font-semibold"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button 
            onClick={() => {setTime(0); setIsPlaying(false);}} 
            className="flex-1 py-3 bg-red-600 rounded hover:bg-red-700 font-semibold"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectilePanel = () => {
  const { projectileAngle, setProjectileAngle, projectileSpeed, setProjectileSpeed, time, isPlaying, setIsPlaying, setTime } = useKinematics();

  const vx = projectileSpeed * Math.cos(projectileAngle * Math.PI / 180);
  const vy = projectileSpeed * Math.sin(projectileAngle * Math.PI / 180);
  const range = (projectileSpeed * projectileSpeed * Math.sin(2 * projectileAngle * Math.PI / 180)) / 9.81;
  const maxHeight = (projectileSpeed * Math.sin(projectileAngle * Math.PI / 180)) ** 2 / (2 * 9.81);
  const flightTime = (2 * projectileSpeed * Math.sin(projectileAngle * Math.PI / 180)) / 9.81;
  const currentVy = vy - 9.81 * time;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center border-b border-gray-600 pb-2">Projectile Motion Analysis</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-1">Launch Angle: {projectileAngle}°</label>
          <input 
            type="range" 
            min="5" 
            max="85" 
            value={projectileAngle} 
            onChange={(e) => setProjectileAngle(Number(e.target.value))} 
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Initial Speed: {projectileSpeed} m/s</label>
          <input 
            type="range" 
            min="5" 
            max="40" 
            value={projectileSpeed} 
            onChange={(e) => setProjectileSpeed(Number(e.target.value))} 
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Gravity: 9.81 m/s²</label>
          <div className="bg-gray-700 p-2 rounded text-center text-sm">Fixed</div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded space-y-1">
          <p>Range: <span className="text-green-300 font-semibold">{range.toFixed(1)} m</span></p>
          <p>Max Height: <span className="text-blue-300 font-semibold">{maxHeight.toFixed(1)} m</span></p>
          <p>Flight Time: <span className="text-pink-300 font-semibold">{flightTime.toFixed(1)} s</span></p>
          <p><span className="text-green-400 font-semibold">vₓ:</span> {vx.toFixed(1)} m/s (constant)</p>
          <p><span className="text-red-400 font-semibold">vᵧ:</span> {currentVy.toFixed(1)} m/s (changes)</p>
          <p>Current Time: <span className="text-yellow-300 font-semibold">{time.toFixed(2)} s</span></p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="flex-1 py-3 bg-blue-600 rounded hover:bg-blue-700 font-semibold"
          >
            {isPlaying ? '⏸️ Pause' : '🚀 Launch'}
          </button>
          <button 
            onClick={() => {setTime(0); setIsPlaying(false);}} 
            className="flex-1 py-3 bg-red-600 rounded hover:bg-red-700 font-semibold"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
};

const ThreeDPanel = () => {
  const { threeDMotionType, setThreeDMotionType, helixRadius, setHelixRadius, helixPitch, setHelixPitch, time, isPlaying, setIsPlaying, setTime } = useKinematics();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center border-b border-gray-600 pb-2">3D Motion Analysis</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-2">Motion Type:</label>
          <select 
            value={threeDMotionType} 
            onChange={(e) => setThreeDMotionType(e.target.value as any)}
            className="w-full p-2 bg-gray-800 rounded border border-gray-600"
          >
            <option value="helix">Helical Motion</option>
            <option value="lissajous">Lissajous Curve</option>
            <option value="spiral">Spiral Motion</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Radius: {helixRadius} units</label>
          <input 
            type="range" 
            min="1" 
            max="6" 
            step="0.5" 
            value={helixRadius} 
            onChange={(e) => setHelixRadius(Number(e.target.value))} 
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Pitch/Speed: {helixPitch}</label>
          <input 
            type="range" 
            min="0.1" 
            max="2" 
            step="0.1" 
            value={helixPitch} 
            onChange={(e) => setHelixPitch(Number(e.target.value))} 
            className="w-full"
          />
        </div>
        
        <div className="bg-gray-800 p-3 rounded space-y-1">
          <p>Time: <span className="text-pink-300 font-semibold">{time.toFixed(2)} s</span></p>
          <p className="text-yellow-300 font-semibold">Parametric equations:</p>
          {threeDMotionType === 'helix' && (
            <div className="text-sm text-cyan-300">
              <p>x = {helixRadius}cos(t)</p>
              <p>y = {helixRadius}sin(t)</p>
              <p>z = {helixPitch}t</p>
            </div>
          )}
          {threeDMotionType === 'lissajous' && (
            <div className="text-sm text-cyan-300">
              <p>x = {helixRadius}cos(t)</p>
              <p>y = {(helixRadius * 0.7).toFixed(1)}sin(2t)</p>
              <p>z = sin(3t)</p>
            </div>
          )}
          {threeDMotionType === 'spiral' && (
            <div className="text-sm text-cyan-300">
              <p>x = {helixPitch}t·cos(t)</p>
              <p>y = {helixPitch}t·sin(t)</p>
              <p>z = {(helixPitch * 0.5).toFixed(1)}t</p>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="flex-1 py-3 bg-blue-600 rounded hover:bg-blue-700 font-semibold"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button 
            onClick={() => {setTime(0); setIsPlaying(false);}} 
            className="flex-1 py-3 bg-red-600 rounded hover:bg-red-700 font-semibold"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
};

const RelativePanel = () => {
  const { frameVelocity, setFrameVelocity, objectVelocity, setObjectVelocity, time, isPlaying, setIsPlaying, setTime } = useKinematics();

  const relativeVelocity = objectVelocity - frameVelocity;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center border-b border-gray-600 pb-2">Relative Motion Analysis</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-1">Frame Velocity: {frameVelocity} m/s</label>
          <input 
            type="range" 
            min="0" 
            max="12" 
            step="0.5" 
            value={frameVelocity} 
            onChange={(e) => setFrameVelocity(Number(e.target.value))} 
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Object Velocity (ground): {objectVelocity} m/s</label>
          <input 
            type="range" 
            min="0" 
            max="15" 
            step="0.5" 
            value={objectVelocity} 
            onChange={(e) => setObjectVelocity(Number(e.target.value))} 
            className="w-full"
          />
        </div>
        
        <div className="bg-gray-800 p-3 rounded space-y-1">
          <p><span className="text-red-400 font-semibold">v̅ₒ (ground):</span> {objectVelocity} m/s</p>
          <p><span className="text-blue-400 font-semibold">v̅ₓ (frame):</span> {frameVelocity} m/s</p>
          <p><span className="text-green-400 font-semibold">v̅ᵣₑₗ:</span> {relativeVelocity.toFixed(1)} m/s</p>
          <p className="text-yellow-300 font-semibold">v̅ₒ = v̅ᵣₑₗ + v̅ₓ</p>
          <p>Time: <span className="text-pink-300 font-semibold">{time.toFixed(2)} s</span></p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="flex-1 py-3 bg-blue-600 rounded hover:bg-blue-700 font-semibold"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button 
            onClick={() => {setTime(0); setIsPlaying(false);}} 
            className="flex-1 py-3 bg-red-600 rounded hover:bg-red-700 font-semibold"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
};

const GraphsPanel = () => {
  const { graphType, setGraphType, graphMotionType, setGraphMotionType, time, isPlaying, setIsPlaying, setTime } = useKinematics();

  const getValues = (t: number) => {
    switch (graphMotionType) {
      case 'uniform':
        return { position: 2 * t, velocity: 2, acceleration: 0 };
      case 'accelerated':
        return { position: 0.5 * t * t, velocity: t, acceleration: 1 };
      case 'oscillatory':
        return { 
          position: 3 * Math.sin(t), 
          velocity: 3 * Math.cos(t), 
          acceleration: -3 * Math.sin(t) 
        };
      default:
        return { position: 0, velocity: 0, acceleration: 0 };
    }
  };

  const currentValues = getValues(time);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center border-b border-gray-600 pb-2">Kinematic Graphs</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-2">Graph Type:</label>
          <select 
            value={graphType} 
            onChange={(e) => setGraphType(e.target.value as any)} 
            className="w-full p-2 bg-gray-800 rounded border border-gray-600"
          >
            <option value="position">Position vs Time</option>
            <option value="velocity">Velocity vs Time</option>
            <option value="acceleration">Acceleration vs Time</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2">Motion Type:</label>
          <select 
            value={graphMotionType} 
            onChange={(e) => setGraphMotionType(e.target.value as any)} 
            className="w-full p-2 bg-gray-800 rounded border border-gray-600"
          >
            <option value="uniform">Uniform Motion</option>
            <option value="accelerated">Uniformly Accelerated</option>
            <option value="oscillatory">Simple Harmonic</option>
          </select>
        </div>
        
        <div className="bg-gray-800 p-3 rounded space-y-1">
          <p>Time: <span className="text-pink-300 font-semibold">{time.toFixed(2)} s</span></p>
          <p>Position: <span className="text-green-300 font-semibold">{currentValues.position.toFixed(2)} m</span></p>
          <p>Velocity: <span className="text-blue-300 font-semibold">{currentValues.velocity.toFixed(2)} m/s</span></p>
          <p>Acceleration: <span className="text-yellow-300 font-semibold">{currentValues.acceleration.toFixed(2)} m/s²</span></p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="flex-1 py-3 bg-blue-600 rounded hover:bg-blue-700 font-semibold"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button 
            onClick={() => {setTime(0); setIsPlaying(false);}} 
            className="flex-1 py-3 bg-red-600 rounded hover:bg-red-700 font-semibold"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
};

const AdvancedPanel = () => {
  const { accelerationType, setAccelerationType, time, isPlaying, setIsPlaying, setTime } = useKinematics();

  const getAcceleration = (t: number): number => {
    switch (accelerationType) {
      case 'linear': return t;
      case 'quadratic': return t * t * 0.5;
      case 'exponential': return Math.exp(t * 0.3) - 1;
      case 'sinusoidal': return 2 * Math.sin(t);
      default: return 0;
    }
  };

  const currentAcc = getAcceleration(time);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center border-b border-gray-600 pb-2">Variable Acceleration</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-2">Acceleration Function:</label>
          <select 
            value={accelerationType} 
            onChange={(e) => setAccelerationType(e.target.value as any)} 
            className="w-full p-2 bg-gray-800 rounded border border-gray-600"
          >
            <option value="linear">a(t) = t</option>
            <option value="quadratic">a(t) = 0.5t²</option>
            <option value="exponential">a(t) = e^(0.3t) - 1</option>
            <option value="sinusoidal">a(t) = 2sin(t)</option>
          </select>
        </div>
        
        <div className="bg-gray-800 p-3 rounded space-y-1">
          <p>Time: <span className="text-pink-300 font-semibold">{time.toFixed(2)} s</span></p>
          <p>a(t): <span className="text-red-300 font-semibold">{currentAcc.toFixed(2)} m/s²</span></p>
          <p className="text-xs text-gray-400">v = ∫a(t)dt, x = ∫v(t)dt</p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="flex-1 py-3 bg-blue-600 rounded hover:bg-blue-700 font-semibold"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button 
            onClick={() => {setTime(0); setIsPlaying(false);}} 
            className="flex-1 py-3 bg-red-600 rounded hover:bg-red-700 font-semibold"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
};

const CircularPanel = () => {
  const { circularRadius, setCircularRadius, angularAcc, setAngularAcc, showVectors, setShowVectors } = useKinematics();
  const [omega, setOmega] = useState(1);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center border-b border-gray-600 pb-2">Circular Motion Analysis</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-1">Radius: {circularRadius} m</label>
          <input 
            type="range" 
            min="1" 
            max="8" 
            step="0.5" 
            value={circularRadius} 
            onChange={(e) => setCircularRadius(Number(e.target.value))} 
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Angular Acceleration: {angularAcc} rad/s²</label>
          <input 
            type="range" 
            min="-3" 
            max="3" 
            step="0.1" 
            value={angularAcc} 
            onChange={(e) => setAngularAcc(Number(e.target.value))} 
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Initial ω: {omega.toFixed(1)} rad/s</label>
          <input 
            type="range" 
            min="0.2" 
            max="4" 
            step="0.1" 
            value={omega} 
            onChange={(e) => setOmega(Number(e.target.value))} 
            className="w-full"
          />
        </div>
        
        <div className="bg-gray-800 p-3 rounded space-y-1">
          <p>ω: <span className="text-blue-300 font-semibold">{omega.toFixed(2)} rad/s</span></p>
          <p>v = ωr: <span className="text-green-300 font-semibold">{(omega * circularRadius).toFixed(2)} m/s</span></p>
          <p>aₒ = ω²r: <span className="text-red-300 font-semibold">{(omega * omega * circularRadius).toFixed(2)} m/s²</span></p>
          <p>aₜ = αr: <span className="text-orange-300 font-semibold">{(angularAcc * circularRadius).toFixed(2)} m/s²</span></p>
          <p>Period: <span className="text-pink-300 font-semibold">{omega > 0 ? (2 * Math.PI / omega).toFixed(2) : '∞'} s</span></p>
        </div>
        
        <button 
          onClick={() => setShowVectors(!showVectors)} 
          className="w-full py-3 bg-purple-600 rounded hover:bg-purple-700 font-semibold"
        >
          {showVectors ? '🚫 Hide Vectors' : '👁️ Show Vectors'}
        </button>
      </div>
    </div>
  );
};

const ConstraintsPanel = () => {
  const { systemType, setSystemType, constraintParameter, setConstraintParameter, time, isPlaying, setIsPlaying, setTime } = useKinematics();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center border-b border-gray-600 pb-2">Constrained Motion</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-2">System Type:</label>
          <select 
            value={systemType} 
            onChange={(e) => setSystemType(e.target.value as any)} 
            className="w-full p-2 bg-gray-800 rounded border border-gray-600"
          >
            <option value="pulley">Pulley System</option>
            <option value="rolling">Rolling Motion</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Speed Parameter: {constraintParameter}</label>
          <input 
            type="range" 
            min="0.5" 
            max="8" 
            step="0.5" 
            value={constraintParameter} 
            onChange={(e) => setConstraintParameter(Number(e.target.value))} 
            className="w-full"
          />
        </div>
        
        <div className="bg-gray-800 p-3 rounded space-y-1">
          <p>Time: <span className="text-pink-300 font-semibold">{time.toFixed(2)} s</span></p>
          {systemType === 'pulley' && (
            <>
              <p className="text-yellow-300 font-semibold">Constraint: L₁ + L₂ = constant</p>
              <p>v₁ = -v₂ (opposite directions)</p>
              <p>a₁ = -a₂ (opposite accelerations)</p>
            </>
          )}
          {systemType === 'rolling' && (
            <>
              <p className="text-yellow-300 font-semibold">Constraint: vₒₘ = ωR</p>
              <p>No-slip condition</p>
              <p>Contact point velocity = 0</p>
            </>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="flex-1 py-3 bg-blue-600 rounded hover:bg-blue-700 font-semibold"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button 
            onClick={() => {setTime(0); setIsPlaying(false);}} 
            className="flex-1 py-3 bg-red-600 rounded hover:bg-red-700 font-semibold"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
};

// 3D Lab Components (now connected to shared state)
const BasicDefinitionsLab = () => {
  const { motionType, time, isPlaying } = useKinematics();

  const getPosition = (t: number): THREE.Vector3 => {
    switch (motionType) {
      case 'linear':
        return new THREE.Vector3(t * 2, t * 1.5, 0);
      case 'circular':
        return new THREE.Vector3(3 * Math.cos(t), 3 * Math.sin(t), 0);
      case 'oscillatory':
        return new THREE.Vector3(4 * Math.sin(t), 2 * Math.cos(2 * t), Math.sin(t * 0.5));
      default:
        return new THREE.Vector3(0, 0, 0);
    }
  };

  const position = getPosition(time);

  return (
    <>
      {/* Coordinate System */}
      <Line points={[[-8, 0, 0], [8, 0, 0]]} color="#ff0000" />
      <Line points={[[0, -6, 0], [0, 6, 0]]} color="#00ff00" />
      <Line points={[[0, 0, -4], [0, 0, 4]]} color="#0000ff" />
      
      {/* Particle */}
      <mesh position={position}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>

      {/* Position Vector (from origin) */}
      <Line points={[[0, 0, 0], position.toArray()]} color="#ffff00" />
    </>
  );
};

const OneDimensionLab = () => {
  const { initialVel, acceleration, time, isPlaying } = useKinematics();

  const position = initialVel * time + 0.5 * acceleration * time * time;
  const velocity = initialVel + acceleration * time;

  return (
    <>
      {/* Reference Line */}
      <Line points={[[-5, -0.5, 0], [25, -0.5, 0]]} color="#666666" />
      
      {/* Moving Object */}
      <mesh position={[position, 0, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.2} />
      </mesh>

      {/* Velocity Vector */}
      <Line points={[[position, 1, 0], [position + velocity * 0.3, 1, 0]]} color="#00ff00" />

      {/* Acceleration Vector */}
      <Line points={[[position, 1.5, 0], [position + acceleration * 0.5, 1.5, 0]]} color="#ff0000" />
    </>
  );
};

const TwoDimensionLab = () => {
  const { vx, vy, time, isPlaying } = useKinematics();

  const x = vx * time;
  const y = vy * time;

  return (
    <>
      {/* Grid */}
      {Array.from({length: 11}, (_, i) => i - 5).map(i => (
        <React.Fragment key={i}>
          <Line points={[[-8, i * 2, 0], [8, i * 2, 0]]} color="#333" />
          <Line points={[[i * 2, -8, 0], [i * 2, 8, 0]]} color="#333" />
        </React.Fragment>
      ))}

      {/* Moving Object */}
      <mesh position={[x, y, 0]}>
        <sphereGeometry args={[0.4]} />
        <meshStandardMaterial color="#4ecdc4" emissive="#4ecdc4" emissiveIntensity={0.2} />
      </mesh>

      {/* Velocity Components */}
      <Line points={[[x, y, 0], [x + vx * 0.5, y, 0]]} color="#ff0000" />
      <Line points={[[x, y, 0], [x, y + vy * 0.5, 0]]} color="#00ff00" />
      <Line points={[[x, y, 0], [x + vx * 0.5, y + vy * 0.5, 0]]} color="#0000ff" />

      {/* Component Projections */}
      <Line points={[[x + vx * 0.5, y, 0], [x + vx * 0.5, y + vy * 0.5, 0]]} color="#ff0000" />
      <Line points={[[x, y + vy * 0.5, 0], [x + vx * 0.5, y + vy * 0.5, 0]]} color="#00ff00" />
    </>
  );
};

// Relative Motion 2D Vector Diagram
const RelativeMotionLab = () => {
  const { frameVelocity, objectVelocity, time } = useKinematics();

  const vFrame = frameVelocity; // blue along +y
  const vObjGround = objectVelocity; // red along +x
  const vRel = vObjGround - vFrame; // yellow resultant at 45-ish direction for demo (x,y)=(vRel, vFrame)

  const origin: [number, number, number] = [0, 0, 0];
  const tipRed: [number, number, number] = [Math.min(6, vObjGround), 0, 0];
  const tipBlue: [number, number, number] = [0, Math.min(6, vFrame), 0];
  const tipYellow: [number, number, number] = [Math.min(6, vRel), Math.min(6, vFrame), 0];

  const dotPos: [number, number, number] = [
    tipYellow[0] * Math.min(1, time / 10),
    tipYellow[1] * Math.min(1, time / 10),
    0
  ];

  return (
    <>
      {/* Axes */}
      <Line points={[[-7, 0, 0], [7, 0, 0]]} color="#e57373" />
      <Line points={[[0, -7, 0], [0, 7, 0]]} color="#81c784" />

      {/* Vectors */}
      <Line points={[origin, tipRed]} color="#ff1744" />
      <Line points={[origin, tipBlue]} color="#2962ff" />
      <Line points={[origin, tipYellow]} color="#ffd600" />

      {/* Moving dot along resultant */}
      <mesh position={dotPos}>
        <sphereGeometry args={[0.18]} />
        <meshStandardMaterial color="#bdbdbd" />
      </mesh>
    </>
  );
};

// Graphical Analysis - draw curves
const GraphicalAnalysisLab = () => {
  const { graphType, graphMotionType, time } = useKinematics();
  const maxT = 10;

  const valueAt = (t: number) => {
    switch (graphMotionType) {
      case 'uniform':
        return { position: 2 * t, velocity: 2, acceleration: 0 };
      case 'accelerated':
        return { position: 0.5 * t * t, velocity: t, acceleration: 1 };
      case 'oscillatory':
        return { position: 3 * Math.sin(t), velocity: 3 * Math.cos(t), acceleration: -3 * Math.sin(t) };
      default:
        return { position: 0, velocity: 0, acceleration: 0 };
    }
  };

  // Sample values to compute scaling
  const samples = Array.from({ length: 200 }, (_, i) => (i / 199) * maxT);
  const values = samples.map((t) => valueAt(t));
  const series = values.map((v) => v[graphType]);
  const minY = Math.min(...series);
  const maxY = Math.max(...series);
  const yRange = Math.max(1, maxY - minY);

  const toPoint = (t: number) => {
    const v = valueAt(t)[graphType];
    const x = (t / maxT) * 12 - 6; // map 0..10 -> -6..6
    const y = ((v - minY) / yRange) * 10 - 5; // map min..max -> -5..5
    return [x, y, 0] as [number, number, number];
  };

  const curvePoints = samples.map((t) => toPoint(t));
  const dotPoint = toPoint(Math.min(time, maxT));

  return (
    <>
      {/* Axes */}
      <Line points={[[-6.5, 0, 0], [6.5, 0, 0]]} color="#9e9e9e" />
      <Line points={[[0, -5.5, 0], [0, 5.5, 0]]} color="#9e9e9e" />

      {/* Curve */}
      <Line points={curvePoints} color="#1e88e5" />

      {/* Moving dot on curve */}
      <mesh position={dotPoint}>
        <sphereGeometry args={[0.12]} />
        <meshStandardMaterial color="#43a047" />
      </mesh>
    </>
  );
};

const ProjectileMotionLab = () => {
  const { projectileAngle, projectileSpeed, time, isPlaying } = useKinematics();

  const vx = projectileSpeed * Math.cos(projectileAngle * Math.PI / 180);
  const vy = projectileSpeed * Math.sin(projectileAngle * Math.PI / 180);
  const x = vx * time;
  const y = Math.max(0, vy * time - 0.5 * 9.81 * time * time);
  const currentVy = vy - 9.81 * time;

  // Generate theoretical trajectory
  const flightTime = (2 * projectileSpeed * Math.sin(projectileAngle * Math.PI / 180)) / 9.81;
  const trajectoryPoints = Array.from({length: 100}, (_, i) => {
    const t = (i / 99) * flightTime;
    const tx = vx * t;
    const ty = Math.max(0, vy * t - 0.5 * 9.81 * t * t);
    return [tx, ty, 0] as [number, number, number];
  });

  return (
    <>
      {/* Ground */}
      <mesh position={[25, -0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[60, 20]} />
        <meshStandardMaterial color="#90EE90" opacity={0.8} transparent />
      </mesh>

      {/* Projectile */}
      <mesh position={[x, y, 0]}>
        <sphereGeometry args={[0.4]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.3} />
      </mesh>

      {/* Theoretical Trajectory */}
      <Line points={trajectoryPoints} color="#666666" />

      {/* Velocity Components */}
      <Line points={[[x, y, 0], [x + vx * 0.3, y, 0]]} color="#00ff00" />
      <Line points={[[x, y, 0], [x, y + currentVy * 0.3, 0]]} color="#ff0000" />
    </>
  );
};

const ThreeDimensionLab = () => {
  const { threeDMotionType, helixRadius, helixPitch, time, isPlaying } = useKinematics();

  const getPosition = (t: number): THREE.Vector3 => {
    switch (threeDMotionType) {
      case 'helix':
        return new THREE.Vector3(helixRadius * Math.cos(t), helixRadius * Math.sin(t), helixPitch * t);
      case 'lissajous':
        return new THREE.Vector3(helixRadius * Math.cos(t), helixRadius * 0.7 * Math.sin(2*t), Math.sin(3*t));
      case 'spiral':
        const r = helixPitch * t;
        return new THREE.Vector3(r * Math.cos(t), r * Math.sin(t), helixPitch * 0.5 * t);
      default:
        return new THREE.Vector3(0, 0, 0);
    }
  };

  const position = getPosition(time);
  
  // Generate trajectory points
  const trajectoryPoints = Array.from({length: Math.min(200, time * 50)}, (_, i) => {
    const t = (i / 199) * time;
    return getPosition(t).toArray();
  });

  return (
    <>
      {/* 3D Coordinate System */}
      <Line points={[[-6, 0, 0], [6, 0, 0]]} color="#ff0000" />
      <Line points={[[0, -6, 0], [0, 6, 0]]} color="#00ff00" />
      <Line points={[[0, 0, -3], [0, 0, 8]]} color="#0000ff" />

      {/* Moving Particle */}
      <mesh position={position}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="#ff69b4" emissive="#ff69b4" emissiveIntensity={0.2} />
      </mesh>

      {/* 3D Trajectory */}
      {trajectoryPoints.length > 1 && (
        <Line points={trajectoryPoints} color="#ffa500" />
      )}

      {/* Projections onto coordinate planes */}
      <Line points={[[position.x, position.y, -3], position.toArray()]} color="#666666" />
      <Line points={[[position.x, -6, position.z], position.toArray()]} color="#666666" />
      <Line points={[[-6, position.y, position.z], position.toArray()]} color="#666666" />
    </>
  );
};

// Main Playground Component with State Provider
const KinematicsAdvancedPlayground: React.FC = () => {
  const [activeTab, setActiveTab] = useState('definitions');
  
  // Shared state
  const [motionType, setMotionType] = useState<'linear' | 'circular' | 'oscillatory'>('linear');
  const [initialVel, setInitialVel] = useState(5);
  const [acceleration, setAcceleration] = useState(2);
  const [vx, setVx] = useState(3);
  const [vy, setVy] = useState(4);
  const [projectileAngle, setProjectileAngle] = useState(45);
  const [projectileSpeed, setProjectileSpeed] = useState(20);
  const [threeDMotionType, setThreeDMotionType] = useState<'helix' | 'lissajous' | 'spiral'>('helix');
  const [helixRadius, setHelixRadius] = useState(3);
  const [helixPitch, setHelixPitch] = useState(0.5);
  const [frameVelocity, setFrameVelocity] = useState(3);
  const [objectVelocity, setObjectVelocity] = useState(5);
  const [graphType, setGraphType] = useState<'position' | 'velocity' | 'acceleration'>('position');
  const [graphMotionType, setGraphMotionType] = useState<'uniform' | 'accelerated' | 'oscillatory'>('uniform');
  const [accelerationType, setAccelerationType] = useState<'linear' | 'quadratic' | 'exponential' | 'sinusoidal'>('linear');
  const [circularRadius, setCircularRadius] = useState(3);
  const [angularAcc, setAngularAcc] = useState(0);
  const [showVectors, setShowVectors] = useState(true);
  const [systemType, setSystemType] = useState<'pulley' | 'rolling'>('pulley');
  const [constraintParameter, setConstraintParameter] = useState(2);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Time update
  useEffect(() => {
    if (!isPlaying) return;

    const within1DBounds = (t: number) => {
      const x = initialVel * t + 0.5 * acceleration * t * t; // line drawn roughly from -5 to 25
      return x > -5 && x < 24.5;
    };

    const within2DBounds = (t: number) => {
      const x = vx * t;
      const y = vy * t; // grid spans about [-8, 8]
      return Math.abs(x) < 7.5 && Math.abs(y) < 7.5;
    };

    const within3DBounds = (t: number) => {
      // Match limits used by ThreeDimensionLab axes
      const getPos = (tt: number) => {
        switch (threeDMotionType) {
          case 'helix':
            return {
              x: helixRadius * Math.cos(tt),
              y: helixRadius * Math.sin(tt),
              z: helixPitch * tt,
            };
          case 'lissajous':
            return {
              x: helixRadius * Math.cos(tt),
              y: helixRadius * 0.7 * Math.sin(2 * tt),
              z: Math.sin(3 * tt),
            };
          case 'spiral':
          default:
            const r = helixPitch * tt;
            return { x: r * Math.cos(tt), y: r * Math.sin(tt), z: helixPitch * 0.5 * tt };
        }
      };
      const p = getPos(t);
      return Math.abs(p.x) < 6 && Math.abs(p.y) < 6 && p.z > -3 && p.z < 8;
    };

    const interval = setInterval(() => {
      setTime(prev => {
        const next = prev + 0.05;

        if (activeTab === 'projectile') {
          const flightTime = (2 * projectileSpeed * Math.sin(projectileAngle * Math.PI / 180)) / 9.81;
          if (next >= flightTime) { setIsPlaying(false); return flightTime; }
          return next;
        }

        if (activeTab === '1d') {
          if (!within1DBounds(next)) { setIsPlaying(false); return prev; }
          return next;
        }

        if (activeTab === '2d') {
          if (!within2DBounds(next)) { setIsPlaying(false); return prev; }
          return next;
        }

        if (activeTab === '3d') {
          if (!within3DBounds(next)) { setIsPlaying(false); return prev; }
          return next;
        }

        if (activeTab === 'circular') {
          // Stop after ~10 seconds for readability
          if (next >= 10) { setIsPlaying(false); return 10; }
          return next;
        }

        if (activeTab === 'advanced') {
          if (next >= 8) { setIsPlaying(false); return 8; }
          return next;
        }

        if (activeTab === 'graphs' || activeTab === 'relative' || activeTab === 'constraints') {
          if (next >= 10) { setIsPlaying(false); return 10; }
          return next;
        }

        // Fallback safety cap
        if (next > 15) { setIsPlaying(false); return 15; }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, activeTab, initialVel, acceleration, vx, vy, projectileSpeed, projectileAngle, threeDMotionType, helixRadius, helixPitch]);

  const kinematicsState: KinematicsState = {
    motionType, setMotionType,
    initialVel, setInitialVel,
    acceleration, setAcceleration,
    vx, setVx,
    vy, setVy,
    projectileAngle, setProjectileAngle,
    projectileSpeed, setProjectileSpeed,
    threeDMotionType, setThreeDMotionType,
    helixRadius, setHelixRadius,
    helixPitch, setHelixPitch,
    frameVelocity, setFrameVelocity,
    objectVelocity, setObjectVelocity,
    graphType, setGraphType,
    graphMotionType, setGraphMotionType,
    accelerationType, setAccelerationType,
    circularRadius, setCircularRadius,
    angularAcc, setAngularAcc,
    showVectors, setShowVectors,
    systemType, setSystemType,
    constraintParameter, setConstraintParameter,
    time, setTime,
    isPlaying, setIsPlaying
  };

  const tabs = [
    { id: 'definitions', name: '1. Basic Definitions', component: BasicDefinitionsLab, panel: DefinitionsPanel },
    { id: '1d', name: '2. 1D Motion', component: OneDimensionLab, panel: OneDPanel },
    { id: '2d', name: '3. 2D Motion', component: TwoDimensionLab, panel: TwoDPanel },
    { id: 'projectile', name: '4. Projectile Motion', component: ProjectileMotionLab, panel: ProjectilePanel },
    { id: '3d', name: '5. 3D Motion', component: ThreeDimensionLab, panel: ThreeDPanel },
    { id: 'relative', name: '6. Relative Motion', component: RelativeMotionLab, panel: RelativePanel },
    { id: 'graphs', name: '7. Graphical Analysis', component: GraphicalAnalysisLab, panel: GraphsPanel },
    { id: 'advanced', name: '8. Advanced Problems', component: BasicDefinitionsLab, panel: AdvancedPanel }, // Placeholder
    { id: 'circular', name: '9. Circular Motion', component: BasicDefinitionsLab, panel: CircularPanel }, // Placeholder
    { id: 'constraints', name: '10. Constraints', component: BasicDefinitionsLab, panel: ConstraintsPanel }, // Placeholder
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component || BasicDefinitionsLab;
  const ActivePanel = activeTabData?.panel || DefinitionsPanel;

  return (
    <KinematicsContext.Provider value={kinematicsState}>
      <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
          <h2 className="text-2xl font-bold mb-2">Advanced Kinematics Laboratory</h2>
          <p className="opacity-90">Comprehensive analysis of motion in one, two, and three dimensions</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setTime(0);
                setIsPlaying(false);
              }}
              className={`flex-1 min-w-max px-3 py-3 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* 3D Canvas with Side Panel */}
        <div className="flex h-[500px]">
          {/* 3D Visualization */}
          <div className="flex-1 bg-gradient-to-b from-gray-100 to-gray-200">
            <Canvas camera={{ position: [10, 8, 10], fov: 60 }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 10, 5]} intensity={1.2} />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              <ActiveComponent />
            </Canvas>
          </div>
          
          {/* Right Side Control Panel */}
          <div className="w-80 bg-gray-900 text-white p-4 overflow-y-auto border-l-2 border-gray-700">
            <ActivePanel />
          </div>
        </div>

        {/* Theory Section */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeTab === 'definitions' && (
              <>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-bold text-sm mb-1">Position Vector r⃗(t)</h4>
                  <p className="text-xs">Specifies location in space relative to origin. In 3D: r⃗ = xî + yĵ + zk̂</p>
                </div>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-bold text-sm mb-1">Velocity Vector v⃗(t)</h4>
                  <p className="text-xs">Rate of change of position: v⃗ = dr⃗/dt. Direction = instantaneous motion direction</p>
                </div>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-bold text-sm mb-1">Acceleration Vector a⃗(t)</h4>
                  <p className="text-xs">Rate of change of velocity: a⃗ = dv⃗/dt = d²r⃗/dt². Indicates force direction</p>
                </div>
              </>
            )}

            {activeTab === '1d' && (
              <>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-bold text-sm mb-1">Kinematic Equations</h4>
                  <p className="text-xs">v = v₀ + at, x = x₀ + v₀t + ½at², v² = v₀² + 2a(x-x₀)</p>
                </div>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-bold text-sm mb-1">Constant Acceleration</h4>
                  <p className="text-xs">When acceleration is constant, motion follows predictable parabolic relationships</p>
                </div>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-bold text-sm mb-1">Applications</h4>
                  <p className="text-xs">Free fall, uniformly accelerated motion, braking distances</p>
                </div>
              </>
            )}

            {activeTab === '2d' && (
              <>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-bold text-sm mb-1">Vector Components</h4>
                  <p className="text-xs">Any 2D vector can be decomposed: v⃗ = vₓî + vᵧĵ, |v⃗| = √(vₓ² + vᵧ²)</p>
                </div>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-bold text-sm mb-1">Independent Motion</h4>
                  <p className="text-xs">x and y components evolve independently according to their own equations</p>
                </div>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-bold text-sm mb-1">Vector Addition</h4>
                  <p className="text-xs">Resultant velocity from vector sum of components. Used in relative motion problems</p>
                </div>
              </>
            )}

            {activeTab === 'projectile' && (
              <>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-bold text-sm mb-1">Parabolic Trajectory</h4>
                  <p className="text-xs">Path follows y = x tan θ - (gx²)/(2v₀²cos²θ). Maximum range at 45°</p>
                </div>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-bold text-sm mb-1">Component Analysis</h4>
                  <p className="text-xs">vₓ = v₀cosθ (constant), vᵧ = v₀sinθ - gt (changes due to gravity)</p>
                </div>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-bold text-sm mb-1">Key Parameters</h4>
                  <p className="text-xs">Range = v₀²sin(2θ)/g, Max height = v₀²sin²θ/(2g), Time = 2v₀sinθ/g</p>
                </div>
              </>
            )}

            {activeTab === '3d' && (
              <>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-bold text-sm mb-1">Parametric Equations</h4>
                  <p className="text-xs">3D motion described by x(t), y(t), z(t). Each component follows its own time evolution</p>
                </div>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-bold text-sm mb-1">Complex Trajectories</h4>
                  <p className="text-xs">Helical motion (circular + linear), Lissajous patterns, spiral paths</p>
                </div>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-bold text-sm mb-1">Applications</h4>
                  <p className="text-xs">Charged particle motion in magnetic fields, satellite orbits, molecular dynamics</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </KinematicsContext.Provider>
  );
};

export default KinematicsAdvancedPlayground;