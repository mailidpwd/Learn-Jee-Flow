import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Calculator, Triangle, Zap, Target } from 'lucide-react';

interface Term {
  coefficient: number;
  aPower: number;
  bPower: number;
  display: string;
}

export function BinomialTheoremPlayground() {
  // State for different modes
  const [mode, setMode] = useState<'expansion' | 'pascal' | 'properties' | 'middle'>('expansion');
  const [n, setN] = useState(4);
  const [a, setA] = useState('a');
  const [b, setB] = useState('b');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [highlightedTerm, setHighlightedTerm] = useState<number>(-1);

  // Generate Pascal's Triangle
  const pascalTriangle = useMemo(() => {
    const triangle: number[][] = [];
    for (let i = 0; i <= Math.min(n, 8); i++) {
      const row: number[] = [];
      for (let j = 0; j <= i; j++) {
        if (j === 0 || j === i) {
          row.push(1);
        } else {
          row.push(triangle[i - 1][j - 1] + triangle[i - 1][j]);
        }
      }
      triangle.push(row);
    }
    return triangle;
  }, [n]);

  // Generate expansion terms
  const expansionTerms = useMemo(() => {
    const terms: Term[] = [];
    for (let k = 0; k <= n; k++) {
      const coefficient = pascalTriangle[n]?.[k] || 0;
      const aPower = n - k;
      const bPower = k;
      
      let display = '';
      if (coefficient === 1) {
        if (aPower === 0 && bPower === 0) display = '1';
        else if (aPower === 0) display = `${b}^${bPower}`;
        else if (bPower === 0) display = `${a}^${aPower}`;
        else display = `${a}^${aPower}${b}^${bPower}`;
      } else {
        if (aPower === 0 && bPower === 0) display = `${coefficient}`;
        else if (aPower === 0) display = `${coefficient}${b}^${bPower}`;
        else if (bPower === 0) display = `${coefficient}${a}^${aPower}`;
        else display = `${coefficient}${a}^${aPower}${b}^${bPower}`;
      }

      terms.push({
        coefficient,
        aPower,
        bPower,
        display
      });
    }
    return terms;
  }, [n, a, b, pascalTriangle]);

  // Calculate properties
  const sumOfCoefficients = useMemo(() => {
    return Math.pow(2, n);
  }, [n]);

  const alternateSum = useMemo(() => {
    return 0; // Always 0 for (1-1)^n
  }, []);

  const middleTerms = useMemo(() => {
    if (n % 2 === 0) {
      // Even n: 1 middle term
      const middleIndex = n / 2;
      return [expansionTerms[middleIndex]];
    } else {
      // Odd n: 2 middle terms
      const middleIndex1 = Math.floor(n / 2);
      const middleIndex2 = Math.ceil(n / 2);
      return [expansionTerms[middleIndex1], expansionTerms[middleIndex2]];
    }
  }, [expansionTerms, n]);

  // Animation functions
  const animateExpansion = () => {
    setIsAnimating(true);
    setShowCalculation(true);
    
    // Highlight terms one by one
    for (let i = 0; i <= n; i++) {
      setTimeout(() => {
        setHighlightedTerm(i);
      }, i * 500);
    }
    
    setTimeout(() => {
      setIsAnimating(false);
      setHighlightedTerm(-1);
    }, (n + 1) * 500 + 1000);
  };

  const animatePascal = () => {
    setIsAnimating(true);
    setShowCalculation(true);
    setTimeout(() => setIsAnimating(false), 3000);
  };

  const animateProperties = () => {
    setIsAnimating(true);
    setShowCalculation(true);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  const animateMiddle = () => {
    setIsAnimating(true);
    setShowCalculation(true);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  const runAnimation = () => {
    switch (mode) {
      case 'expansion':
        animateExpansion();
        break;
      case 'pascal':
        animatePascal();
        break;
      case 'properties':
        animateProperties();
        break;
      case 'middle':
        animateMiddle();
        break;
    }
  };

  const resetAll = () => {
    setHighlightedTerm(-1);
    setShowCalculation(false);
    setIsAnimating(false);
  };

  const getFormula = () => {
    switch (mode) {
      case 'expansion':
        return `(${a}+${b})^${n} = ${expansionTerms.map(term => term.display).join(' + ')}`;
      case 'pascal':
        return `Row ${n}: ${pascalTriangle[n]?.join(', ') || ''}`;
      case 'properties':
        return `Sum of coefficients = 2^${n} = ${sumOfCoefficients}`;
      case 'middle':
        return `Middle term(s): ${middleTerms.map(term => term.display).join(', ')}`;
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
            Interactive Binomial Theorem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={mode === 'expansion' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('expansion')}
            >
              <Zap className="h-4 w-4 mr-1" />
              Expansion
            </Button>
            <Button
              variant={mode === 'pascal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('pascal')}
            >
              <Triangle className="h-4 w-4 mr-1" />
              Pascal's Triangle
            </Button>
            <Button
              variant={mode === 'properties' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('properties')}
            >
              <Target className="h-4 w-4 mr-1" />
              Properties
            </Button>
            <Button
              variant={mode === 'middle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('middle')}
            >
              <Target className="h-4 w-4 mr-1" />
              Middle Terms
            </Button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">n =</label>
              <input
                type="range"
                min="0"
                max="8"
                value={n}
                onChange={(e) => setN(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="w-6 text-center">{n}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">a =</label>
              <input
                type="text"
                value={a}
                onChange={(e) => setA(e.target.value)}
                className="w-12 px-2 py-1 border rounded text-sm"
                maxLength={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">b =</label>
              <input
                type="text"
                value={b}
                onChange={(e) => setB(e.target.value)}
                className="w-12 px-2 py-1 border rounded text-sm"
                maxLength={2}
              />
            </div>

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
            <Triangle className="h-5 w-5" />
            Visual Representation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Expansion Mode */}
            {mode === 'expansion' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-4">
                    ({a} + {b})<sup>{n}</sup>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {expansionTerms.map((term, index) => (
                      <Badge
                        key={index}
                        variant={highlightedTerm === index ? "default" : "secondary"}
                        className={`text-lg px-3 py-2 transition-all duration-500 ${
                          highlightedTerm === index ? 'animate-pulse bg-primary' : ''
                        }`}
                      >
                        {term.display}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pascal's Triangle Mode */}
            {mode === 'pascal' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-xl font-bold mb-4">Pascal's Triangle</div>
                  <div className="flex justify-center">
                    <div className="space-y-2">
                      {pascalTriangle.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-1">
                          {row.map((num, colIndex) => (
                            <div
                              key={colIndex}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                                rowIndex === n ? 'bg-primary text-white animate-pulse' : 'bg-gray-200'
                              }`}
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    Row {n}: {pascalTriangle[n]?.join(', ') || ''}
                  </div>
                </div>
              </div>
            )}

            {/* Properties Mode */}
            {mode === 'properties' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Sum of Coefficients</h4>
                    <div className="text-2xl font-bold text-primary">
                      2<sup>{n}</sup> = {sumOfCoefficients}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Put a=1, b=1 in ({a}+{b})<sup>{n}</sup>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Alternate Sum</h4>
                    <div className="text-2xl font-bold text-primary">
                      {alternateSum}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Put a=1, b=-1 in ({a}+{b})<sup>{n}</sup>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Middle Terms Mode */}
            {mode === 'middle' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-xl font-bold mb-4">
                    Middle Term{n % 2 === 0 ? '' : 's'} (n = {n})
                  </div>
                  <div className="flex justify-center gap-4">
                    {middleTerms.map((term, index) => (
                      <Badge
                        key={index}
                        variant="default"
                        className="text-lg px-4 py-2 animate-pulse"
                      >
                        {term.display}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-4">
                    {n % 2 === 0 
                      ? `Even n: 1 middle term (${n/2 + 1}-th term)`
                      : `Odd n: 2 middle terms (${Math.floor(n/2) + 1}-th and ${Math.ceil(n/2) + 1}-th terms)`
                    }
                  </div>
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
              <Calculator className="h-5 w-5" />
              Live Calculation
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
