import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const CalculusBasicsPlayground: React.FC = () => {
  const [activeTab, setActiveTab] = useState('derivatives');
  const [limitX, setLimitX] = useState(2);
  const [derivativeX, setDerivativeX] = useState(1);
  const [integralA, setIntegralA] = useState(0);
  const [integralB, setIntegralB] = useState(2);

  // Derivative visualization - Simple and clear
  const derivativeData = useMemo(() => {
    const points = [];
    const tangentPoints = [];
    const x = derivativeX;
    const y = x * x * x; // f(x) = x³
    const slope = 3 * x * x; // f'(x) = 3x²
    
    // Generate function points for x³ - keep within visible range
    for (let i = -1; i <= 3; i += 0.1) {
      const yVal = i * i * i;
      if (yVal >= -8 && yVal <= 27) { // Keep within reasonable bounds
        points.push({ x: i, y: yVal });
      }
    }
    
    // Generate tangent line points - shorter line
    for (let i = x - 0.8; i <= x + 0.8; i += 0.1) {
      const yVal = y + slope * (i - x);
      if (yVal >= -8 && yVal <= 27) {
        tangentPoints.push({ x: i, y: yVal });
      }
    }
    
    return { points, tangentPoints, x, y, slope };
  }, [derivativeX]);

  // Limit visualization - Simple
  const limitData = useMemo(() => {
    const points = [];
    const targetX = limitX;
    const targetY = targetX * targetX + 2 * targetX; // f(x) = x² + 2x
    
    // Generate function points - keep within visible range
    for (let x = -1; x <= 4; x += 0.1) {
      const yVal = x * x + 2 * x;
      if (yVal >= -1 && yVal <= 24) { // Keep within reasonable bounds
        points.push({ x, y: yVal });
      }
    }
    
    return { points, targetX, targetY };
  }, [limitX]);

  // Integral visualization - Simple
  const integralData = useMemo(() => {
    const points = [];
    const a = integralA;
    const b = integralB;
    
    // Generate function points (f(x) = x) - keep within visible range
    for (let x = -1; x <= 3; x += 0.1) {
      const yVal = x;
      if (yVal >= -1 && yVal <= 3) { // Keep within reasonable bounds
        points.push({ x, y: yVal });
      }
    }
    
    const area = (b * b - a * a) / 2; // ∫x dx from a to b = (b² - a²)/2
    
    return { points, a, b, area };
  }, [integralA, integralB]);

  const renderLimitVisualization = () => {
    const { points, targetX, targetY } = limitData;
    const width = 500;
    const height = 350;
    const padding = 60;
    const scaleX = (width - 2 * padding) / 5; // For x from -1 to 4
    const scaleY = (height - 2 * padding) / 25; // For y from -1 to 24

    const transformX = (x: number) => (x + 1) * scaleX + padding;
    const transformY = (y: number) => height - (y + 1) * scaleY - padding;

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Approaching x =</span>
          <Slider
            value={[limitX]}
            onValueChange={([value]) => setLimitX(value)}
            min={0}
            max={3}
            step={0.1}
            className="w-40"
          />
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{limitX.toFixed(1)}</span>
        </div>
        
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <svg width={width} height={height} className="border rounded bg-gray-50">
            {/* Grid lines */}
            {Array.from({ length: 11 }, (_, i) => (
              <g key={i}>
                <line
                  x1={padding}
                  y1={i * (height - 2 * padding) / 10 + padding}
                  x2={width - padding}
                  y2={i * (height - 2 * padding) / 10 + padding}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
                <line
                  x1={i * (width - 2 * padding) / 10 + padding}
                  y1={padding}
                  x2={i * (width - 2 * padding) / 10 + padding}
                  y2={height - padding}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              </g>
            ))}
            
            {/* Function curve */}
            <path
              d={`M ${points.map(p => `${transformX(p.x)},${transformY(p.y)}`).join(' L ')}`}
              stroke="#3b82f6"
              strokeWidth={3}
              fill="none"
            />
            
            {/* Target point */}
            <circle
              cx={transformX(targetX)}
              cy={transformY(targetY)}
              r={6}
              fill="#10b981"
              stroke="#059669"
              strokeWidth={3}
            />
            
            {/* Labels */}
            <text x={transformX(targetX)} y={transformY(targetY) - 15} textAnchor="middle" className="text-sm fill-gray-700 font-medium">
              ({targetX.toFixed(1)}, {targetY.toFixed(1)})
            </text>
            
            {/* Axis labels */}
            <text x={width - 20} y={height - 10} textAnchor="middle" className="text-xs fill-gray-500">x</text>
            <text x={20} y={20} textAnchor="middle" className="text-xs fill-gray-500">y</text>
          </svg>
        </div>
        
        <div className="text-sm space-y-2 bg-blue-50 p-3 rounded">
          <p><strong>Function:</strong> f(x) = x² + 2x</p>
          <p><strong>Limit:</strong> lim<sub>x→{targetX.toFixed(1)}</sub> (x² + 2x) = {targetY.toFixed(1)}</p>
          <p><strong>Green dot:</strong> The point we're approaching</p>
        </div>
      </div>
    );
  };

  const renderDerivativeVisualization = () => {
    const { points, tangentPoints, x, y, slope } = derivativeData;
    const width = 500;
    const height = 350;
    const padding = 60;
    const scaleX = (width - 2 * padding) / 4; // For x from -1 to 3
    const scaleY = (height - 2 * padding) / 35; // For y from -8 to 27

    const transformX = (x: number) => (x + 1) * scaleX + padding;
    const transformY = (y: number) => height - (y + 8) * scaleY - padding;

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">At x =</span>
          <Slider
            value={[derivativeX]}
            onValueChange={([value]) => setDerivativeX(value)}
            min={0}
            max={2}
            step={0.1}
            className="w-40"
          />
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{derivativeX.toFixed(1)}</span>
        </div>
        
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <svg width={width} height={height} className="border rounded bg-gray-50">
            {/* Grid lines */}
            {Array.from({ length: 11 }, (_, i) => (
              <g key={i}>
                <line
                  x1={padding}
                  y1={i * (height - 2 * padding) / 10 + padding}
                  x2={width - padding}
                  y2={i * (height - 2 * padding) / 10 + padding}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
                <line
                  x1={i * (width - 2 * padding) / 10 + padding}
                  y1={padding}
                  x2={i * (width - 2 * padding) / 10 + padding}
                  y2={height - padding}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              </g>
            ))}
            
            {/* Function curve */}
            <path
              d={`M ${points.map(p => `${transformX(p.x)},${transformY(p.y)}`).join(' L ')}`}
              stroke="#3b82f6"
              strokeWidth={3}
              fill="none"
            />
            
            {/* Tangent line */}
            <path
              d={`M ${tangentPoints.map(p => `${transformX(p.x)},${transformY(p.y)}`).join(' L ')}`}
              stroke="#ef4444"
              strokeWidth={3}
              fill="none"
              strokeDasharray="8,4"
            />
            
            {/* Point of tangency */}
            <circle
              cx={transformX(x)}
              cy={transformY(y)}
              r={6}
              fill="#10b981"
              stroke="#059669"
              strokeWidth={3}
            />
            
            {/* Labels */}
            <text x={transformX(x)} y={transformY(y) - 15} textAnchor="middle" className="text-sm fill-gray-700 font-medium">
              ({x.toFixed(1)}, {y.toFixed(1)})
            </text>
            
            {/* Axis labels */}
            <text x={width - 20} y={height - 10} textAnchor="middle" className="text-xs fill-gray-500">x</text>
            <text x={20} y={20} textAnchor="middle" className="text-xs fill-gray-500">y</text>
          </svg>
        </div>
        
        <div className="text-sm space-y-2 bg-blue-50 p-3 rounded">
          <p><strong>Function:</strong> f(x) = x³</p>
          <p><strong>Derivative:</strong> f'(x) = 3x²</p>
          <p><strong>At x = {x.toFixed(1)}:</strong> f'({x.toFixed(1)}) = {slope.toFixed(1)}</p>
          <p><strong>Red dashed line:</strong> Tangent line</p>
        </div>
      </div>
    );
  };

  const renderIntegralVisualization = () => {
    const { points, a, b, area } = integralData;
    const width = 500;
    const height = 350;
    const padding = 60;
    const scaleX = (width - 2 * padding) / 4; // For x from -1 to 3
    const scaleY = (height - 2 * padding) / 4; // For y from -1 to 3

    const transformX = (x: number) => (x + 1) * scaleX + padding;
    const transformY = (y: number) => height - (y + 1) * scaleY - padding;

    // Generate area points
    const areaPoints = [];
    for (let x = a; x <= b; x += 0.1) {
      areaPoints.push({ x, y: x });
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">From a =</span>
          <Slider
            value={[integralA]}
            onValueChange={([value]) => setIntegralA(value)}
            min={0}
            max={2}
            step={0.1}
            className="w-32"
          />
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{integralA.toFixed(1)}</span>
          
          <span className="text-sm font-medium">To b =</span>
          <Slider
            value={[integralB]}
            onValueChange={([value]) => setIntegralB(value)}
            min={0}
            max={3}
            step={0.1}
            className="w-32"
          />
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{integralB.toFixed(1)}</span>
        </div>
        
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <svg width={width} height={height} className="border rounded bg-gray-50">
            {/* Grid lines */}
            {Array.from({ length: 11 }, (_, i) => (
              <g key={i}>
                <line
                  x1={padding}
                  y1={i * (height - 2 * padding) / 10 + padding}
                  x2={width - padding}
                  y2={i * (height - 2 * padding) / 10 + padding}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
                <line
                  x1={i * (width - 2 * padding) / 10 + padding}
                  y1={padding}
                  x2={i * (width - 2 * padding) / 10 + padding}
                  y2={height - padding}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              </g>
            ))}
            
            {/* Function curve */}
            <path
              d={`M ${points.map(p => `${transformX(p.x)},${transformY(p.y)}`).join(' L ')}`}
              stroke="#3b82f6"
              strokeWidth={3}
              fill="none"
            />
            
            {/* Area under curve */}
            <path
              d={`M ${transformX(a)},${transformY(0)} L ${areaPoints.map(p => `${transformX(p.x)},${transformY(p.y)}`).join(' L ')} L ${transformX(b)},${transformY(0)} Z`}
              fill="#10b981"
              fillOpacity={0.4}
              stroke="#059669"
              strokeWidth={2}
            />
            
            {/* Vertical lines at bounds */}
            <line
              x1={transformX(a)}
              y1={transformY(0)}
              x2={transformX(a)}
              y2={transformY(a)}
              stroke="#ef4444"
              strokeWidth={3}
            />
            <line
              x1={transformX(b)}
              y1={transformY(0)}
              x2={transformX(b)}
              y2={transformY(b)}
              stroke="#ef4444"
              strokeWidth={3}
            />
            
            {/* Labels */}
            <text x={transformX(a)} y={height - 15} textAnchor="middle" className="text-sm fill-gray-700 font-medium">
              a = {a.toFixed(1)}
            </text>
            <text x={transformX(b)} y={height - 15} textAnchor="middle" className="text-sm fill-gray-700 font-medium">
              b = {b.toFixed(1)}
            </text>
            
            {/* Axis labels */}
            <text x={width - 20} y={height - 10} textAnchor="middle" className="text-xs fill-gray-500">x</text>
            <text x={20} y={20} textAnchor="middle" className="text-xs fill-gray-500">y</text>
          </svg>
        </div>
        
        <div className="text-sm space-y-2 bg-blue-50 p-3 rounded">
          <p><strong>Function:</strong> f(x) = x</p>
          <p><strong>Integral:</strong> ∫x dx = x²/2</p>
          <p><strong>Area:</strong> ∫<sub>{a.toFixed(1)}</sub><sup>{b.toFixed(1)}</sup> x dx = {area.toFixed(2)}</p>
          <p><strong>Green area:</strong> Area under the curve</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">
          🎯 Interactive Calculus Playground
        </CardTitle>
        <p className="text-sm text-gray-600 text-center">
          Visualize limits, derivatives, and integrals with interactive graphs
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="limits">Limits</TabsTrigger>
            <TabsTrigger value="derivatives">Derivatives</TabsTrigger>
            <TabsTrigger value="integrals">Integrals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="limits" className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">🔍 Limits Visualization</h3>
              <p className="text-sm text-gray-600 mb-4">
                See how functions approach specific values as x gets closer to a target point
              </p>
            </div>
            {renderLimitVisualization()}
          </TabsContent>
          
          <TabsContent value="derivatives" className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">📈 Derivatives Visualization</h3>
              <p className="text-sm text-gray-600 mb-4">
                Understand derivatives as the slope of tangent lines at any point
              </p>
            </div>
            {renderDerivativeVisualization()}
          </TabsContent>
          
          <TabsContent value="integrals" className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">📊 Integrals Visualization</h3>
              <p className="text-sm text-gray-600 mb-4">
                Visualize integrals as the area under the curve between two points
              </p>
            </div>
            {renderIntegralVisualization()}
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 How to Use This Playground:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Limits:</strong> Move the slider to see how the function approaches different x-values</li>
            <li>• <strong>Derivatives:</strong> Adjust the x-value to see how the tangent line changes</li>
            <li>• <strong>Integrals:</strong> Change the bounds (a and b) to see how the area changes</li>
            <li>• Watch the real-time calculations and visual feedback!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculusBasicsPlayground;
