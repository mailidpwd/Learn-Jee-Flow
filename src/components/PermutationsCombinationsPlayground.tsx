import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Users, Trophy, Calculator } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  color: string;
}

export function PermutationsCombinationsPlayground() {
  // State for different modes
  const [mode, setMode] = useState<'factorial' | 'permutation' | 'combination' | 'circular'>('factorial');
  const [n, setN] = useState(4);
  const [r, setR] = useState(2);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [arrangement, setArrangement] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);

  // Generate people with colors
  const people: Person[] = useMemo(() => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'];
    return Array.from({ length: n }, (_, i) => ({
      id: `person-${i}`,
      name: String.fromCharCode(65 + i), // A, B, C, D...
      color: colors[i % colors.length]
    }));
  }, [n]);

  // Calculations
  const factorial = useMemo(() => {
    let result = 1;
    for (let i = 1; i <= n; i++) {
      result *= i;
    }
    return result;
  }, [n]);

  const permutation = useMemo(() => {
    if (r > n) return 0;
    let result = 1;
    for (let i = n; i > n - r; i--) {
      result *= i;
    }
    return result;
  }, [n, r]);

  const combination = useMemo(() => {
    if (r > n) return 0;
    let result = 1;
    for (let i = 0; i < r; i++) {
      result = result * (n - i) / (i + 1);
    }
    return Math.round(result);
  }, [n, r]);

  const circular = useMemo(() => {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 1; i < n; i++) {
      result *= i;
    }
    return result;
  }, [n]);

  // Animation for factorial
  const animateFactorial = () => {
    setIsAnimating(true);
    setShowCalculation(true);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  // Animation for permutation
  const animatePermutation = () => {
    setIsAnimating(true);
    setShowCalculation(true);
    const arrangements: string[][] = [];
    
    // Generate some example arrangements
    const generateArrangements = (arr: string[], remaining: string[]) => {
      if (arr.length === r) {
        arrangements.push([...arr]);
        return;
      }
      for (let i = 0; i < remaining.length; i++) {
        const newArr = [...arr, remaining[i]];
        const newRemaining = remaining.filter((_, idx) => idx !== i);
        generateArrangements(newArr, newRemaining);
        if (arrangements.length >= 6) break; // Limit for display
      }
    };

    generateArrangements([], people.map(p => p.name));
    setArrangement(arrangements[0] || []);
    setTimeout(() => setIsAnimating(false), 3000);
  };

  // Animation for combination
  const animateCombination = () => {
    setIsAnimating(true);
    setShowCalculation(true);
    const combinations: string[][] = [];
    
    const generateCombinations = (arr: string[], start: number) => {
      if (arr.length === r) {
        combinations.push([...arr]);
        return;
      }
      for (let i = start; i < people.length; i++) {
        arr.push(people[i].name);
        generateCombinations(arr, i + 1);
        arr.pop();
        if (combinations.length >= 6) break; // Limit for display
      }
    };

    generateCombinations([], 0);
    setSelectedPeople(combinations[0] || []);
    setTimeout(() => setIsAnimating(false), 3000);
  };

  // Animation for circular
  const animateCircular = () => {
    setIsAnimating(true);
    setShowCalculation(true);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  const runAnimation = () => {
    switch (mode) {
      case 'factorial':
        animateFactorial();
        break;
      case 'permutation':
        animatePermutation();
        break;
      case 'combination':
        animateCombination();
        break;
      case 'circular':
        animateCircular();
        break;
    }
  };

  const resetAll = () => {
    setSelectedPeople([]);
    setArrangement([]);
    setShowCalculation(false);
    setIsAnimating(false);
  };

  const getFormula = () => {
    switch (mode) {
      case 'factorial':
        return `${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(' × ')} = ${factorial}`;
      case 'permutation':
        return `P(${n},${r}) = ${n}!/(${n}-${r})! = ${permutation}`;
      case 'combination':
        return `C(${n},${r}) = ${n}!/(${r}!(${n}-${r})!) = ${combination}`;
      case 'circular':
        return `(${n}-1)! = ${circular}`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Interactive Permutations & Combinations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={mode === 'factorial' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('factorial')}
            >
              Factorial
            </Button>
            <Button
              variant={mode === 'permutation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('permutation')}
            >
              Permutation
            </Button>
            <Button
              variant={mode === 'combination' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('combination')}
            >
              Combination
            </Button>
            <Button
              variant={mode === 'circular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('circular')}
            >
              Circular
            </Button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">n =</label>
              <input
                type="range"
                min="2"
                max="8"
                value={n}
                onChange={(e) => setN(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="w-6 text-center">{n}</span>
            </div>
            
            {(mode === 'permutation' || mode === 'combination') && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">r =</label>
                <input
                  type="range"
                  min="1"
                  max={n}
                  value={r}
                  onChange={(e) => setR(parseInt(e.target.value))}
                  className="w-20"
                />
                <span className="w-6 text-center">{r}</span>
              </div>
            )}

            <Button onClick={runAnimation} disabled={isAnimating} size="sm">
              <Play className="h-4 w-4 mr-1" />
              {isAnimating ? 'Animating...' : 'Animate'}
            </Button>
            
            <Button onClick={resetAll} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visual Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Visual Representation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* People Display */}
            <div className="flex flex-wrap gap-2">
              {people.map((person) => (
                <div
                  key={person.id}
                  className={`w-12 h-12 rounded-full ${person.color} flex items-center justify-center text-white font-bold text-lg transition-all duration-500 ${
                    isAnimating ? 'animate-pulse' : ''
                  } ${
                    mode === 'combination' && selectedPeople.includes(person.name) ? 'ring-4 ring-green-400' :
                    mode === 'permutation' && arrangement.includes(person.name) ? 'ring-4 ring-blue-400' :
                    mode === 'circular' ? 'animate-spin' : ''
                  }`}
                >
                  {person.name}
                </div>
              ))}
            </div>

            {/* Mode-specific Display */}
            {mode === 'factorial' && (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {Array.from({ length: n }, (_, i) => n - i).join(' × ')}
                </div>
                <Badge variant="secondary" className="text-lg">
                  = {factorial}
                </Badge>
              </div>
            )}

            {mode === 'permutation' && arrangement.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Sample arrangement:</div>
                <div className="flex gap-1">
                  {arrangement.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {name}
                      </div>
                      {idx < arrangement.length - 1 && <span className="text-lg">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === 'combination' && selectedPeople.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Selected team:</div>
                <div className="flex gap-2">
                  {selectedPeople.map((name) => (
                    <div key={name} className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === 'circular' && (
              <div className="text-center">
                <div className="text-lg text-muted-foreground mb-2">Circular arrangement</div>
                <div className="relative w-32 h-32 mx-auto">
                  {people.slice(0, Math.min(n, 6)).map((person, idx) => {
                    const angle = (idx * 360) / Math.min(n, 6);
                    const x = 64 + 50 * Math.cos((angle * Math.PI) / 180);
                    const y = 64 + 50 * Math.sin((angle * Math.PI) / 180);
                    return (
                      <div
                        key={person.id}
                        className={`absolute w-8 h-8 rounded-full ${person.color} flex items-center justify-center text-white font-bold text-sm transition-all duration-1000 ${
                          isAnimating ? 'animate-spin' : ''
                        }`}
                        style={{
                          left: x - 16,
                          top: y - 16,
                          transform: isAnimating ? `rotate(${angle}deg)` : 'none'
                        }}
                      >
                        {person.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calculation Display */}
      {showCalculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Calculation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-xl font-mono bg-gray-100 p-4 rounded-lg">
                {getFormula()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
