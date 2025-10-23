import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';

interface ComplexNumber {
  real: number;
  imaginary: number;
}

const ComplexNumbersPlayground: React.FC = () => {
  const [complexNumber, setComplexNumber] = useState<ComplexNumber>({ real: 3, imaginary: 4 });
  const [operation, setOperation] = useState<'add' | 'multiply' | 'conjugate'>('add');
  const [secondNumber, setSecondNumber] = useState<ComplexNumber>({ real: 1, imaginary: 2 });
  const [result, setResult] = useState<ComplexNumber>({ real: 0, imaginary: 0 });
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Calculate result based on operation
  useEffect(() => {
    let newResult: ComplexNumber;
    switch (operation) {
      case 'add':
        newResult = {
          real: complexNumber.real + secondNumber.real,
          imaginary: complexNumber.imaginary + secondNumber.imaginary
        };
        break;
      case 'multiply':
        newResult = {
          real: complexNumber.real * secondNumber.real - complexNumber.imaginary * secondNumber.imaginary,
          imaginary: complexNumber.real * secondNumber.imaginary + complexNumber.imaginary * secondNumber.real
        };
        break;
      case 'conjugate':
        newResult = {
          real: complexNumber.real,
          imaginary: -complexNumber.imaginary
        };
        break;
      default:
        newResult = { real: 0, imaginary: 0 };
    }
    setResult(newResult);
  }, [complexNumber, secondNumber, operation]);

  // Draw complex plane
  const drawComplexPlane = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 30;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw grid
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 0.5;
    for (let i = -10; i <= 10; i++) {
      const x = centerX + i * scale;
      const y = centerY + i * scale;
      
      if (x >= 0 && x <= width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      if (y >= 0 && y <= height) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Draw main complex number
    const x1 = centerX + complexNumber.real * scale;
    const y1 = centerY - complexNumber.imaginary * scale;
    
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(x1, y1, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`${complexNumber.real.toFixed(1)} + ${complexNumber.imaginary.toFixed(1)}i`, x1 + 15, y1 - 15);

    // Draw second number for operations
    if (operation !== 'conjugate') {
      const x2 = centerX + secondNumber.real * scale;
      const y2 = centerY - secondNumber.imaginary * scale;
      
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x2, y2, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`${secondNumber.real.toFixed(1)} + ${secondNumber.imaginary.toFixed(1)}i`, x2 + 15, y2 + 20);
    }

    // Draw conjugate
    if (operation === 'conjugate') {
      const xConj = centerX + complexNumber.real * scale;
      const yConj = centerY - (-complexNumber.imaginary) * scale;
      
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(xConj, yConj, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`${complexNumber.real.toFixed(1)} - ${complexNumber.imaginary.toFixed(1)}i`, xConj + 15, yConj + 20);
    }

    // Draw result
    const xResult = centerX + result.real * scale;
    const yResult = centerY - result.imaginary * scale;
    
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(xResult, yResult, 10, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Result: ${result.real.toFixed(1)} + ${result.imaginary.toFixed(1)}i`, xResult + 20, yResult - 25);

    // Draw vectors
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    if (operation !== 'conjugate') {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + secondNumber.real * scale, centerY - secondNumber.imaginary * scale);
      ctx.stroke();
    }

    // Draw result vector
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 4;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(xResult, yResult);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw magnitude circle
    const magnitude = Math.sqrt(complexNumber.real ** 2 + complexNumber.imaginary ** 2);
    if (magnitude > 0) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, magnitude * scale, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Imaginary Axis (i)', 10, 20);
    ctx.fillText('Real Axis', centerX - 50, height - 10);
  };

  useEffect(() => {
    drawComplexPlane();
  }, [complexNumber, secondNumber, operation, result]);

  const animateOperation = () => {
    setIsAnimating(true);
    setAnimationStep(0);
    
    const animate = () => {
      setAnimationStep(prev => {
        if (prev >= 100) {
          setIsAnimating(false);
          return 0;
        }
        return prev + 2;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  const formatComplexNumber = (num: ComplexNumber) => {
    const realStr = num.real === 0 ? '' : num.real.toString();
    const imagStr = num.imaginary === 0 ? '' : 
      num.imaginary === 1 ? 'i' : 
      num.imaginary === -1 ? '-i' : 
      `${num.imaginary}i`;
    
    if (!realStr && !imagStr) return '0';
    if (!realStr) return imagStr;
    if (!imagStr) return realStr;
    
    const sign = num.imaginary >= 0 ? ' + ' : ' - ';
    return `${realStr}${sign}${Math.abs(num.imaginary)}i`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎮 Complex Numbers Interactive Playground
          </CardTitle>
          <p className="text-center text-gray-600">
            Play with complex numbers and see them come to life! Perfect for GenZ learners 🚀
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls Panel */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">🎛️ Control Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={operation} onValueChange={(value) => setOperation(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="add">➕ Add</TabsTrigger>
                <TabsTrigger value="multiply">✖️ Multiply</TabsTrigger>
                <TabsTrigger value="conjugate">🔄 Conjugate</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔵 First Complex Number: {formatComplexNumber(complexNumber)}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Real Part</label>
                    <Slider
                      value={[complexNumber.real]}
                      onValueChange={([value]) => setComplexNumber(prev => ({ ...prev, real: value }))}
                      min={-5}
                      max={5}
                      step={0.1}
                      className="w-full"
                    />
                    <Input
                      type="number"
                      value={complexNumber.real}
                      onChange={(e) => setComplexNumber(prev => ({ ...prev, real: parseFloat(e.target.value) || 0 }))}
                      step="0.1"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Imaginary Part</label>
                    <Slider
                      value={[complexNumber.imaginary]}
                      onValueChange={([value]) => setComplexNumber(prev => ({ ...prev, imaginary: value }))}
                      min={-5}
                      max={5}
                      step={0.1}
                      className="w-full"
                    />
                    <Input
                      type="number"
                      value={complexNumber.imaginary}
                      onChange={(e) => setComplexNumber(prev => ({ ...prev, imaginary: parseFloat(e.target.value) || 0 }))}
                      step="0.1"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {operation !== 'conjugate' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔴 Second Complex Number: {formatComplexNumber(secondNumber)}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Real Part</label>
                      <Slider
                        value={[secondNumber.real]}
                        onValueChange={([value]) => setSecondNumber(prev => ({ ...prev, real: value }))}
                        min={-5}
                        max={5}
                        step={0.1}
                        className="w-full"
                      />
                      <Input
                        type="number"
                        value={secondNumber.real}
                        onChange={(e) => setSecondNumber(prev => ({ ...prev, real: parseFloat(e.target.value) || 0 }))}
                        step="0.1"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Imaginary Part</label>
                      <Slider
                        value={[secondNumber.imaginary]}
                        onValueChange={([value]) => setSecondNumber(prev => ({ ...prev, imaginary: value }))}
                        min={-5}
                        max={5}
                        step={0.1}
                        className="w-full"
                      />
                      <Input
                        type="number"
                        value={secondNumber.imaginary}
                        onChange={(e) => setSecondNumber(prev => ({ ...prev, imaginary: parseFloat(e.target.value) || 0 }))}
                        step="0.1"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <Button 
                onClick={animateOperation}
                disabled={isAnimating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                {isAnimating ? '🎬 Animating...' : '🎬 Animate Operation'}
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setComplexNumber({ real: 0, imaginary: 0 })}
                  className="text-xs"
                >
                  Reset First
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSecondNumber({ real: 0, imaginary: 0 })}
                  className="text-xs"
                >
                  Reset Second
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualization Panel */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">📊 Complex Plane Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="border-2 border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50"
              />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <div className="font-semibold text-blue-800">🔵 First Number</div>
                  <div className="text-blue-600">{formatComplexNumber(complexNumber)}</div>
                  <div className="text-xs text-blue-500">
                    Magnitude: {Math.sqrt(complexNumber.real ** 2 + complexNumber.imaginary ** 2).toFixed(2)}
                  </div>
                </div>
                
                {operation !== 'conjugate' && (
                  <div className="bg-red-100 p-3 rounded-lg">
                    <div className="font-semibold text-red-800">🔴 Second Number</div>
                    <div className="text-red-600">{formatComplexNumber(secondNumber)}</div>
                    <div className="text-xs text-red-500">
                      Magnitude: {Math.sqrt(secondNumber.real ** 2 + secondNumber.imaginary ** 2).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-200">
                <div className="font-bold text-purple-800 text-lg">🎯 Result</div>
                <div className="text-purple-600 text-xl font-mono">
                  {formatComplexNumber(result)}
                </div>
                <div className="text-sm text-purple-500 mt-1">
                  Magnitude: {Math.sqrt(result.real ** 2 + result.imaginary ** 2).toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Learning Tips */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-orange-800">💡 Pro Tips for GenZ Learners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Badge className="bg-blue-500">🎮 Interactive Learning</Badge>
              <p className="text-sm text-gray-700">
                Drag the sliders to see how complex numbers move in real-time! 
                It's like playing a video game but you're learning math.
              </p>
            </div>
            <div className="space-y-2">
              <Badge className="bg-green-500">📱 Visual Memory</Badge>
              <p className="text-sm text-gray-700">
                The complex plane is like a 2D map. Think of it as coordinates 
                where real numbers go left-right and imaginary go up-down!
              </p>
            </div>
            <div className="space-y-2">
              <Badge className="bg-purple-500">⚡ Quick Math</Badge>
              <p className="text-sm text-gray-700">
                Addition = vector addition (like adding forces in physics). 
                Multiplication = rotation + scaling. Mind blown! 🤯
              </p>
            </div>
            <div className="space-y-2">
              <Badge className="bg-pink-500">🎯 Real World</Badge>
              <p className="text-sm text-gray-700">
                Complex numbers are everywhere: electrical engineering, 
                quantum physics, signal processing, and even graphics!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplexNumbersPlayground;
