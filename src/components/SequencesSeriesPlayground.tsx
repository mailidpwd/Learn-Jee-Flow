import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const SequencesSeriesPlayground: React.FC = () => {
  const [apFirstTerm, setApFirstTerm] = useState(2);
  const [apCommonDiff, setApCommonDiff] = useState(3);
  const [apTerms, setApTerms] = useState(8);
  
  const [gpFirstTerm, setGpFirstTerm] = useState(2);
  const [gpCommonRatio, setGpCommonRatio] = useState(2);
  const [gpTerms, setGpTerms] = useState(6);
  
  const [naturalN, setNaturalN] = useState(10);
  const [mode, setMode] = useState<'ap' | 'gp' | 'special'>('ap');

  // Calculate AP sequence
  const apSequence = useMemo(() => {
    const sequence = [];
    for (let i = 0; i < apTerms; i++) {
      sequence.push(apFirstTerm + i * apCommonDiff);
    }
    return sequence;
  }, [apFirstTerm, apCommonDiff, apTerms]);

  // Calculate GP sequence
  const gpSequence = useMemo(() => {
    const sequence = [];
    for (let i = 0; i < gpTerms; i++) {
      sequence.push(gpFirstTerm * Math.pow(gpCommonRatio, i));
    }
    return sequence;
  }, [gpFirstTerm, gpCommonRatio, gpTerms]);

  // Calculate AP sum
  const apSum = useMemo(() => {
    return (apTerms / 2) * (2 * apFirstTerm + (apTerms - 1) * apCommonDiff);
  }, [apFirstTerm, apCommonDiff, apTerms]);

  // Calculate GP sum
  const gpSum = useMemo(() => {
    if (gpCommonRatio === 1) return gpFirstTerm * gpTerms;
    return (gpFirstTerm * (Math.pow(gpCommonRatio, gpTerms) - 1)) / (gpCommonRatio - 1);
  }, [gpFirstTerm, gpCommonRatio, gpTerms]);

  // Calculate special series
  const naturalSum = useMemo(() => {
    return (naturalN * (naturalN + 1)) / 2;
  }, [naturalN]);

  const squaresSum = useMemo(() => {
    return (naturalN * (naturalN + 1) * (2 * naturalN + 1)) / 6;
  }, [naturalN]);

  const cubesSum = useMemo(() => {
    return Math.pow((naturalN * (naturalN + 1)) / 2, 2);
  }, [naturalN]);

  return (
    <Card className="w-full max-w-6xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          🎮 Sequences & Series Interactive Playground
        </CardTitle>
        <p className="text-center text-muted-foreground">
          Visualize and explore different types of sequences and series
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={mode} onValueChange={(value) => setMode(value as 'ap' | 'gp' | 'special')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ap">Arithmetic Progression</TabsTrigger>
            <TabsTrigger value="gp">Geometric Progression</TabsTrigger>
            <TabsTrigger value="special">Special Series</TabsTrigger>
          </TabsList>

          <TabsContent value="ap" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AP Controls</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ap-first">First Term (a): {apFirstTerm}</Label>
                    <Slider
                      id="ap-first"
                      min={1}
                      max={20}
                      step={1}
                      value={[apFirstTerm]}
                      onValueChange={(value) => setApFirstTerm(value[0])}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ap-diff">Common Difference (d): {apCommonDiff}</Label>
                    <Slider
                      id="ap-diff"
                      min={-10}
                      max={10}
                      step={1}
                      value={[apCommonDiff]}
                      onValueChange={(value) => setApCommonDiff(value[0])}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ap-terms">Number of Terms: {apTerms}</Label>
                    <Slider
                      id="ap-terms"
                      min={3}
                      max={15}
                      step={1}
                      value={[apTerms]}
                      onValueChange={(value) => setApTerms(value[0])}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AP Visualization</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium mb-2">Sequence: {apSequence.join(', ')}</div>
                  <div className="text-sm text-blue-600 mb-2">
                    Sum of {apTerms} terms: {apSum.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Formula: Sₙ = n/2[2a + (n-1)d] = {apTerms}/2[2×{apFirstTerm} + ({apTerms}-1)×{apCommonDiff}]
                  </div>
                </div>

                {/* Visual representation */}
                <div className="flex flex-wrap gap-2">
                  {apSequence.map((term, index) => (
                    <div
                      key={index}
                      className="bg-blue-100 border-2 border-blue-300 rounded-lg p-2 text-center min-w-[60px] transition-all duration-300 hover:scale-105"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animation: 'fadeInUp 0.5s ease-out forwards'
                      }}
                    >
                      <div className="text-sm font-bold">{term}</div>
                      <div className="text-xs text-gray-500">a{index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gp" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">GP Controls</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="gp-first">First Term (a): {gpFirstTerm}</Label>
                    <Slider
                      id="gp-first"
                      min={1}
                      max={10}
                      step={1}
                      value={[gpFirstTerm]}
                      onValueChange={(value) => setGpFirstTerm(value[0])}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gp-ratio">Common Ratio (r): {gpCommonRatio}</Label>
                    <Slider
                      id="gp-ratio"
                      min={0.5}
                      max={3}
                      step={0.1}
                      value={[gpCommonRatio]}
                      onValueChange={(value) => setGpCommonRatio(value[0])}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gp-terms">Number of Terms: {gpTerms}</Label>
                    <Slider
                      id="gp-terms"
                      min={3}
                      max={10}
                      step={1}
                      value={[gpTerms]}
                      onValueChange={(value) => setGpTerms(value[0])}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">GP Visualization</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium mb-2">
                    Sequence: {gpSequence.map(term => term.toFixed(2)).join(', ')}
                  </div>
                  <div className="text-sm text-green-600 mb-2">
                    Sum of {gpTerms} terms: {gpSum.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Formula: Sₙ = a(rⁿ - 1)/(r - 1) = {gpFirstTerm}({gpCommonRatio}^{gpTerms} - 1)/({gpCommonRatio} - 1)
                  </div>
                </div>

                {/* Visual representation with exponential growth */}
                <div className="flex flex-wrap gap-2">
                  {gpSequence.map((term, index) => (
                    <div
                      key={index}
                      className="bg-green-100 border-2 border-green-300 rounded-lg p-2 text-center min-w-[60px] transition-all duration-300 hover:scale-105"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animation: 'fadeInUp 0.5s ease-out forwards',
                        transform: `scale(${Math.min(1 + (term / Math.max(...gpSequence)) * 0.5, 1.5)})`
                      }}
                    >
                      <div className="text-sm font-bold">{term.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">a{index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="special" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Special Series Controls</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="natural-n">n (number of terms): {naturalN}</Label>
                    <Slider
                      id="natural-n"
                      min={1}
                      max={20}
                      step={1}
                      value={[naturalN]}
                      onValueChange={(value) => setNaturalN(value[0])}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Special Series Results</h3>
                <div className="space-y-3">
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="text-sm font-medium text-purple-800">
                      1 + 2 + 3 + ... + {naturalN} = {naturalSum}
                    </div>
                    <div className="text-xs text-purple-600">
                      Formula: n(n+1)/2 = {naturalN}({naturalN}+1)/2
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="text-sm font-medium text-orange-800">
                      1² + 2² + 3² + ... + {naturalN}² = {squaresSum}
                    </div>
                    <div className="text-xs text-orange-600">
                      Formula: n(n+1)(2n+1)/6
                    </div>
                  </div>
                  
                  <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                    <div className="text-sm font-medium text-pink-800">
                      1³ + 2³ + 3³ + ... + {naturalN}³ = {cubesSum}
                    </div>
                    <div className="text-xs text-pink-600">
                      Formula: [n(n+1)/2]² = [{naturalSum}]²
                    </div>
                  </div>
                </div>

                {/* Visual representation of natural numbers */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Visual: 1 + 2 + 3 + ... + {naturalN}</h4>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: naturalN }, (_, i) => i + 1).map((num) => (
                      <div
                        key={num}
                        className="bg-purple-100 border border-purple-300 rounded px-2 py-1 text-xs font-medium transition-all duration-300 hover:scale-110"
                        style={{
                          animationDelay: `${num * 0.05}s`,
                          animation: 'fadeInUp 0.3s ease-out forwards'
                        }}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
          <h4 className="font-semibold text-lg mb-2">💡 Learning Tips</h4>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• <strong>AP:</strong> Each term increases by the same amount (common difference)</li>
            <li>• <strong>GP:</strong> Each term is multiplied by the same number (common ratio)</li>
            <li>• <strong>Special Series:</strong> These formulas save time in calculations!</li>
            <li>• Try different values to see how sequences change and grow</li>
          </ul>
        </div>
      </CardContent>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Card>
  );
};

export default SequencesSeriesPlayground;
