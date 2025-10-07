import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const IntegrationBasicsPlayground: React.FC = () => {
  const [activeTab, setActiveTab] = useState('formulas');
  const [functionType, setFunctionType] = useState('linear');
  const [bounds, setBounds] = useState({ a: 0, b: 2 });
  const [showStrips, setShowStrips] = useState(true);
  const [animationPlaying, setAnimationPlaying] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>();

  // Simple function definitions for beginners
  const functions = {
    linear: { 
      f: (x: number) => x, 
      F: (x: number) => x * x / 2, 
      name: 'f(x) = x', 
      Fname: 'F(x) = x²/2',
      emoji: '📈',
      story: 'A straight line going up!'
    },
    quadratic: { 
      f: (x: number) => x * x, 
      F: (x: number) => x * x * x / 3, 
      name: 'f(x) = x²', 
      Fname: 'F(x) = x³/3',
      emoji: '📊',
      story: 'A curved line that goes up faster!'
    },
    constant: { 
      f: (x: number) => 2, 
      F: (x: number) => 2 * x, 
      name: 'f(x) = 2', 
      Fname: 'F(x) = 2x',
      emoji: '➖',
      story: 'A flat line at height 2!'
    }
  };

  const currentFunc = functions[functionType as keyof typeof functions];

  // Calculate area and strips for animation
  const calculations = useMemo(() => {
    const { a, b } = bounds;
    const nStrips = 8; // Keep it simple for beginners
    const dx = (b - a) / nStrips;
    let area = 0;
    const strips = [];

    for (let i = 0; i < nStrips; i++) {
      const x = a + i * dx;
      const height = currentFunc.f(x);
      const stripArea = height * dx;
      area += stripArea;
      
      strips.push({
        x: x,
        width: dx,
        height: height,
        area: stripArea,
        index: i
      });
    }

    const exactArea = currentFunc.F(b) - currentFunc.F(a);

    return { area, exactArea, strips };
  }, [bounds, currentFunc]);

  // Animation effect for strips
  useEffect(() => {
    if (animationPlaying && animationStep < calculations.strips.length) {
      const timer = setTimeout(() => {
        setAnimationStep(prev => {
          const next = prev + 1;
          if (next >= calculations.strips.length) {
            setAnimationPlaying(false);
            return calculations.strips.length;
          }
          return next;
        });
      }, 400); // Slower animation - 400ms per slice
      
      return () => clearTimeout(timer);
    }
  }, [animationPlaying, animationStep, calculations.strips.length]);

  // Render Area Under Curve Animation
  const renderAreaUnderCurve = () => {
    const width = 600;
    const height = 400;
    const padding = 50;
    const { a, b } = bounds;
    
    const scaleX = (width - 2 * padding) / (b - a);
    const maxY = Math.max(...calculations.strips.map(s => Math.abs(s.height))) * 1.2;
    const scaleY = (height - 2 * padding) / (2 * maxY);

    const transformX = (x: number) => (x - a) * scaleX + padding;
    const transformY = (y: number) => height - (y + maxY) * scaleY - padding;

    // Generate curve points
    const curvePoints = [];
    for (let x = a; x <= b; x += 0.01) {
      curvePoints.push({ x, y: currentFunc.f(x) });
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Graph Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {currentFunc.emoji} {currentFunc.name}
          </h3>
          <p className="text-sm text-gray-600">{currentFunc.story}</p>
        </div>

        {/* Graph */}
        <div className="p-4">
          <svg ref={svgRef} width={width} height={height} className="border border-gray-300 rounded bg-gray-50">
            {/* Define clipping path to keep everything within graph bounds */}
            <defs>
              <clipPath id="graphClip">
                <rect x={padding} y={padding} width={width - 2 * padding} height={height - 2 * padding} />
              </clipPath>
            </defs>
            {/* Grid lines */}
            {Array.from({ length: 7 }, (_, i) => (
              <g key={i}>
                <line
                  x1={padding}
                  y1={i * (height - 2 * padding) / 6 + padding}
                  x2={width - padding}
                  y2={i * (height - 2 * padding) / 6 + padding}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
                <line
                  x1={i * (width - 2 * padding) / 6 + padding}
                  y1={padding}
                  x2={i * (width - 2 * padding) / 6 + padding}
                  y2={height - padding}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              </g>
            ))}

            {/* X-axis */}
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="#374151"
              strokeWidth={2}
            />

            {/* Function curve */}
            <path
              d={`M ${curvePoints.map(p => `${transformX(p.x)},${transformY(p.y)}`).join(' L ')}`}
              stroke="#3b82f6"
              strokeWidth={3}
              fill="none"
            />

            {/* Animated strips */}
            {showStrips && calculations.strips.map((strip, index) => {
              const isAnimated = index < animationStep;
              const opacity = isAnimated ? 0.8 : 0.2;
              const color = '#10b981';
              
              // Calculate strip position and size with proper boundaries
              const stripX = transformX(strip.x);
              const stripWidth = strip.width * scaleX;
              const stripHeight = Math.abs(strip.height) * scaleY;
              
              // For positive heights, bars go from x-axis up to the curve
              // For negative heights, bars go from x-axis down
              const stripY = strip.height >= 0 
                ? transformY(0) - stripHeight // Start from x-axis, go up
                : transformY(0); // Start from x-axis, go down
              
              // Ensure strips stay within graph boundaries
              const minX = padding;
              const maxX = width - padding;
              const clampedX = Math.max(minX, Math.min(stripX, maxX - stripWidth));
              const clampedWidth = Math.min(stripWidth, maxX - clampedX);
              
              // Ensure height doesn't exceed graph area
              const maxHeight = height - 2 * padding;
              const clampedHeight = Math.min(stripHeight, maxHeight);
              
              return (
                <g key={index} clipPath="url(#graphClip)">
                  <rect
                    x={clampedX}
                    y={stripY}
                    width={clampedWidth}
                    height={clampedHeight}
                    fill={color}
                    fillOpacity={opacity}
                    stroke={color}
                    strokeWidth={1}
                    className="transition-all duration-500 ease-out"
                  />
                  {isAnimated && clampedHeight > 15 && (
                    <text
                      x={clampedX + clampedWidth / 2}
                      y={stripY + clampedHeight / 2}
                      textAnchor="middle"
                      className="text-xs fill-white font-bold"
                    >
                      {strip.area.toFixed(1)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Area under curve */}
            <path
              d={`M ${transformX(a)},${transformY(0)} L ${curvePoints.map(p => `${transformX(p.x)},${transformY(p.y)}`).join(' L ')} L ${transformX(b)},${transformY(0)} Z`}
              fill="#3b82f6"
              fillOpacity={0.2}
              stroke="none"
              clipPath="url(#graphClip)"
            />

            {/* Labels */}
            <text x={transformX(a)} y={height - 15} textAnchor="middle" className="text-sm fill-red-600 font-bold">
              a = {a}
            </text>
            <text x={transformX(b)} y={height - 15} textAnchor="middle" className="text-sm fill-blue-600 font-bold">
              b = {b}
            </text>
            
            <text x={width - 20} y={height - 5} textAnchor="middle" className="text-sm fill-gray-500">x</text>
            <text x={20} y={20} textAnchor="middle" className="text-sm fill-gray-500">y</text>
          </svg>
        </div>

        {/* Results */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Approximate (Slices)</div>
              <div className="text-xl font-mono text-blue-600 font-bold">{calculations.area.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Exact (Formula)</div>
              <div className="text-xl font-mono text-green-600 font-bold">{calculations.exactArea.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Basic Formulas
  const renderBasicFormulas = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg border-2 border-purple-200">
          <h3 className="text-2xl font-bold text-center mb-4">📚 Basic Integration Formulas</h3>
          <div className="text-center mb-4">
            <div className="text-lg text-purple-700">
              These are the most important formulas to remember!
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border-2 border-blue-200 text-center">
              <div className="text-3xl mb-2">📈</div>
              <h4 className="font-bold text-blue-600 mb-2">Power Rule</h4>
              <div className="text-lg font-mono bg-blue-50 p-2 rounded">
                ∫x^n dx = x^(n+1)/(n+1) + C
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Add 1 to power, divide by new power!
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border-2 border-green-200 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-bold text-green-600 mb-2">Exponential</h4>
              <div className="text-lg font-mono bg-green-50 p-2 rounded">
                ∫e^x dx = e^x + C
              </div>
              <p className="text-sm text-gray-600 mt-2">
                e^x stays the same!
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border-2 border-red-200 text-center">
              <div className="text-3xl mb-2">🌊</div>
              <h4 className="font-bold text-red-600 mb-2">Trigonometric</h4>
              <div className="text-lg font-mono bg-red-50 p-2 rounded">
                ∫sin x dx = -cos x + C
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Sine becomes negative cosine!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-lg border-2 border-yellow-200">
          <h3 className="text-2xl font-bold text-center mb-4">➕ The Magic +C</h3>
          <div className="text-center mb-4">
            <div className="text-lg text-yellow-700">
              Why do we always add +C? Let's find out!
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-2 border-yellow-300">
            <div className="text-center">
              <div className="text-4xl mb-4">🎈</div>
              <h4 className="text-xl font-bold text-yellow-800 mb-2">The +C Bubble</h4>
              <p className="text-lg text-gray-700 mb-4">
                When we differentiate, constants disappear! So when we integrate back, 
                we don't know what constant was there before.
              </p>
              <div className="bg-yellow-50 p-3 rounded border">
                <div className="text-lg font-mono">
                  d/dx(x² + 5) = 2x
                </div>
                <div className="text-lg font-mono mt-2">
                  ∫2x dx = x² + C (could be +5, +10, or any number!)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-100 to-blue-100 p-6 rounded-lg border-2 border-cyan-200">
          <h3 className="text-2xl font-bold text-center mb-4">⚖️ Properties of Integrals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border-2 border-cyan-300">
              <h4 className="font-bold text-cyan-600 mb-2">➕ Linearity</h4>
              <div className="text-lg font-mono bg-cyan-50 p-2 rounded mb-2">
                ∫(f + g) dx = ∫f dx + ∫g dx
              </div>
              <p className="text-sm text-gray-600">
                You can integrate each part separately, then add them together!
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
              <h4 className="font-bold text-blue-600 mb-2">🔢 Constants</h4>
              <div className="text-lg font-mono bg-blue-50 p-2 rounded mb-2">
                ∫k·f dx = k·∫f dx
              </div>
              <p className="text-sm text-gray-600">
                You can pull constants out of the integral!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Controls
  const renderControls = () => {
    return (
      <div className="space-y-6">
        {/* Function Selection */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg border-2 border-blue-200">
          <h3 className="text-xl font-bold mb-4 text-center">🎯 Choose Your Function</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(functions).map(([key, func]) => (
              <Button
                key={key}
                onClick={() => setFunctionType(key)}
                className={`p-4 text-lg ${functionType === key ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'} border-2 border-blue-300`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{func.emoji}</div>
                  <div className="font-bold">{func.name}</div>
                  <div className="text-sm opacity-75">{func.story}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Integration Bounds */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg border-2 border-green-200">
          <h3 className="text-xl font-bold mb-4 text-center">📏 Set Your Limits</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600 mb-2">From a =</div>
              <Slider
                value={[bounds.a]}
                onValueChange={([value]) => setBounds(prev => ({ ...prev, a: value }))}
                min={0}
                max={2}
                step={0.1}
                className="mb-2"
              />
              <div className="text-xl font-bold text-red-600 bg-white px-4 py-2 rounded border-2 border-red-300">
                {bounds.a.toFixed(1)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 mb-2">To b =</div>
              <Slider
                value={[bounds.b]}
                onValueChange={([value]) => setBounds(prev => ({ ...prev, b: value }))}
                min={1}
                max={3}
                step={0.1}
                className="mb-2"
              />
              <div className="text-xl font-bold text-blue-600 bg-white px-4 py-2 rounded border-2 border-blue-300">
                {bounds.b.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Animation Controls */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-200">
          <h3 className="text-xl font-bold mb-4 text-center">🎬 Animation Controls</h3>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => setShowStrips(!showStrips)}
              className={`px-6 py-3 text-lg ${showStrips ? 'bg-green-500 text-white' : 'bg-white text-green-500'} border-2 border-green-300`}
            >
              {showStrips ? '✅ Hide Slices' : '🍰 Show Slices'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Simple Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-2">
          🍰 Integration Basics
        </h1>
        <p className="text-blue-600">
          Learn integration by adding cake slices together!
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Controls */}
        <div className="space-y-4">
          {/* Function Selection */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">Choose Function</h3>
            <div className="space-y-2">
              {Object.entries(functions).map(([key, func]) => (
                <button
                  key={key}
                  onClick={() => setFunctionType(key)}
                  className={`w-full p-2 text-sm rounded border ${
                    functionType === key 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{func.emoji}</span>
                    <span className="font-medium">{func.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Limits */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">Set Limits</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">From a =</label>
                <Slider
                  value={[bounds.a]}
                  onValueChange={([value]) => setBounds(prev => ({ ...prev, a: value }))}
                  min={0}
                  max={2}
                  step={0.1}
                  className="mt-1"
                />
                <div className="text-sm font-mono text-gray-800 mt-1">
                  {bounds.a.toFixed(1)}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">To b =</label>
                <Slider
                  value={[bounds.b]}
                  onValueChange={([value]) => setBounds(prev => ({ ...prev, b: value }))}
                  min={1}
                  max={3}
                  step={0.1}
                  className="mt-1"
                />
                <div className="text-sm font-mono text-gray-800 mt-1">
                  {bounds.b.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Animation Controls */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">Animation</h3>
            <div className="space-y-2">
              <button
                onClick={() => setAnimationPlaying(!animationPlaying)}
                className={`w-full p-2 text-sm rounded border ${
                  animationPlaying 
                    ? 'bg-red-500 text-white border-red-500' 
                    : 'bg-green-500 text-white border-green-500'
                }`}
              >
                {animationPlaying ? "⏸️ Pause" : "▶️ Play"}
              </button>
              <button
                onClick={() => {
                  setAnimationStep(0);
                  setAnimationPlaying(false);
                }}
                className="w-full p-2 text-sm rounded border bg-gray-500 text-white border-gray-500"
              >
                🔄 Reset
              </button>
              <button
                onClick={() => setShowStrips(!showStrips)}
                className={`w-full p-2 text-sm rounded border ${
                  showStrips 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-gray-300 text-gray-700 border-gray-300'
                }`}
              >
                {showStrips ? "✅ Hide Slices" : "🍰 Show Slices"}
              </button>
            </div>
          </div>
        </div>

        {/* Center Column - Main Graph */}
        <div className="lg:col-span-2">
          {renderAreaUnderCurve()}
        </div>
      </div>

      {/* Simple Help Section */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-2">💡 How to Use</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <p className="font-medium mb-1">🍰 Watch the Animation:</p>
            <p>Click Play to see green slices fill up the area under the curve</p>
          </div>
          <div>
            <p className="font-medium mb-1">🎛️ Change Settings:</p>
            <p>Choose different functions and adjust the limits to see how the area changes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationBasicsPlayground;