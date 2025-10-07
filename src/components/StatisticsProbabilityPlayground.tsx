import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function StatisticsProbabilityPlayground() {
  const [activeMode, setActiveMode] = useState<'mean-median-mode' | 'histogram' | 'probability-scale' | 'dice-coins' | 'bag-balls' | 'cards'>('mean-median-mode');
  const [studentMarks, setStudentMarks] = useState([10, 20, 30, 40, 50]);
  const [probabilityValue, setProbabilityValue] = useState(0.5);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [coinResults, setCoinResults] = useState<string[]>([]);
  const [bagBalls, setBagBalls] = useState({ red: 3, blue: 2 });
  const [selectedBall, setSelectedBall] = useState<string | null>(null);
  const [withReplacement, setWithReplacement] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isPickingBall, setIsPickingBall] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const sorted = [...studentMarks].sort((a, b) => a - b);
    const mean = studentMarks.reduce((sum, mark) => sum + mark, 0) / studentMarks.length;
    const median = sorted.length % 2 === 0 
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    
    const frequency: { [key: number]: number } = {};
    studentMarks.forEach(mark => {
      frequency[mark] = (frequency[mark] || 0) + 1;
    });
    const mode = Object.keys(frequency).reduce((a, b) => frequency[parseInt(a)] > frequency[parseInt(b)] ? a : b);

    return { mean, median, mode: parseInt(mode) };
  }, [studentMarks]);

  const rollDice = () => {
    setIsRolling(true);
    setDiceResult(null);
    
    // Simulate rolling animation
    setTimeout(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      setDiceResult(result);
      setIsRolling(false);
    }, 1000);
  };

  const flipCoins = () => {
    setIsFlipping(true);
    setCoinResults([]);
    
    // Simulate flipping animation
    setTimeout(() => {
      const results = ['H', 'T'].map(() => Math.random() < 0.5 ? 'H' : 'T');
      setCoinResults(results);
      setIsFlipping(false);
    }, 1500);
  };

  const pickBall = () => {
    setIsPickingBall(true);
    setSelectedBall(null);
    
    // Simulate picking animation
    setTimeout(() => {
      const total = bagBalls.red + bagBalls.blue;
      const random = Math.random();
      const redProbability = bagBalls.red / total;
      
      if (random < redProbability) {
        setSelectedBall('red');
        if (!withReplacement) {
          setBagBalls(prev => ({ ...prev, red: prev.red - 1 }));
        }
      } else {
        setSelectedBall('blue');
        if (!withReplacement) {
          setBagBalls(prev => ({ ...prev, blue: prev.blue - 1 }));
        }
      }
      setIsPickingBall(false);
    }, 1000);
  };

  const resetBag = () => {
    setBagBalls({ red: 3, blue: 2 });
    setSelectedBall(null);
  };

  const updateMark = (index: number, value: number) => {
    const newMarks = [...studentMarks];
    newMarks[index] = Math.max(0, Math.min(100, value));
    setStudentMarks(newMarks);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-blue-600 mb-2">🎨 Interactive Visual Playground</h3>
        <p className="text-gray-600">Drag, click, and play to understand Statistics & Probability forever!</p>
      </div>

      {/* Mode Selection */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[
          { id: 'mean-median-mode', label: '📊 Mean/Median/Mode', icon: '📈' },
          { id: 'histogram', label: '📊 Histogram', icon: '🏗️' },
          { id: 'probability-scale', label: '🎯 Probability Scale', icon: '📏' },
          { id: 'dice-coins', label: '🎲 Dice & Coins', icon: '🎮' },
          { id: 'bag-balls', label: '🎒 Bag & Balls', icon: '⚽' },
          { id: 'cards', label: '🃏 Cards', icon: '♠️' }
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeMode === mode.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-blue-50'
            }`}
          >
            {mode.icon} {mode.label}
          </button>
        ))}
      </div>

      {/* Mean, Median, Mode Visual */}
      {activeMode === 'mean-median-mode' && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-600">📊 Mean, Median, Mode Visual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">Drag the bars to change student marks and watch statistics update!</p>
            </div>
            
            {/* Interactive Bar Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-end justify-center space-x-2 h-64">
                {studentMarks.map((mark, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs mb-1 font-medium">{mark}</div>
                    <div 
                      className="bg-blue-500 w-12 rounded-t transition-all duration-300 hover:bg-blue-600 cursor-pointer"
                      style={{ height: `${(mark / 50) * 200}px` }}
                      onClick={() => {
                        const newValue = prompt(`Enter new mark for Student ${index + 1}:`, mark.toString());
                        if (newValue !== null) {
                          updateMark(index, parseInt(newValue) || mark);
                        }
                      }}
                    />
                    <div className="text-xs mt-1">S{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics Display */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-green-100 rounded-lg">
                <div className="text-lg font-bold text-green-600">📊 Mean</div>
                <div className="text-2xl font-bold">{stats.mean.toFixed(1)}</div>
                <div className="text-xs text-gray-600">Average</div>
              </div>
              <div className="text-center p-3 bg-purple-100 rounded-lg">
                <div className="text-lg font-bold text-purple-600">📍 Median</div>
                <div className="text-2xl font-bold">{stats.median}</div>
                <div className="text-xs text-gray-600">Middle Value</div>
              </div>
              <div className="text-center p-3 bg-orange-100 rounded-lg">
                <div className="text-lg font-bold text-orange-600">🎯 Mode</div>
                <div className="text-2xl font-bold">{stats.mode}</div>
                <div className="text-xs text-gray-600">Most Frequent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Probability Scale */}
      {activeMode === 'probability-scale' && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-600">🎯 Probability Scale (0 to 1)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">Drag the slider to see probability values and their meanings!</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="relative">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>0 (Impossible)</span>
                  <span>0.5 (50-50)</span>
                  <span>1 (Certain)</span>
                </div>
                <Slider
                  value={[probabilityValue]}
                  onValueChange={(value) => setProbabilityValue(value[0])}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
                <div className="text-center mt-4">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {probabilityValue.toFixed(2)}
                  </div>
                  <div className="text-lg font-medium">
                    {probabilityValue === 0 && "🚫 Impossible Event"}
                    {probabilityValue > 0 && probabilityValue < 0.5 && "📉 Unlikely"}
                    {probabilityValue === 0.5 && "🎲 50-50 Chance"}
                    {probabilityValue > 0.5 && probabilityValue < 1 && "📈 Likely"}
                    {probabilityValue === 1 && "✅ Certain Event"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dice & Coins Simulation */}
      {activeMode === 'dice-coins' && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-600">🎲 Dice & Coins Simulation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dice Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">🎲 Single Die Roll</h4>
              <div className="text-center space-y-3">
                <div className="text-6xl transition-all duration-500">
                  {isRolling ? (
                    <div className="animate-spin">🎲</div>
                  ) : diceResult ? (
                    <div className="text-8xl font-bold text-blue-600">
                      {diceResult}
                    </div>
                  ) : (
                    <div>🎲</div>
                  )}
                </div>
                <Button 
                  onClick={rollDice} 
                  disabled={isRolling}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRolling ? 'Rolling...' : 'Roll Die'}
                </Button>
                {diceResult && !isRolling && (
                  <div className="text-xl font-bold text-green-600">
                    Result: {diceResult}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  Sample Space: {1,2,3,4,5,6} → P(any number) = 1/6
                </div>
              </div>
            </div>

            {/* Coins Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">🪙 Two Coins</h4>
              <div className="text-center space-y-3">
                <div className="flex justify-center space-x-4 text-4xl">
                  <div className="transition-all duration-500">
                    {isFlipping ? (
                      <div className="animate-bounce">🪙</div>
                    ) : coinResults[0] ? (
                      <div className="text-6xl font-bold text-yellow-600">
                        {coinResults[0] === 'H' ? 'H' : 'T'}
                      </div>
                    ) : (
                      <div>🪙</div>
                    )}
                  </div>
                  <div className="transition-all duration-500">
                    {isFlipping ? (
                      <div className="animate-bounce">🪙</div>
                    ) : coinResults[1] ? (
                      <div className="text-6xl font-bold text-yellow-600">
                        {coinResults[1] === 'H' ? 'H' : 'T'}
                      </div>
                    ) : (
                      <div>🪙</div>
                    )}
                  </div>
                </div>
                <Button 
                  onClick={flipCoins} 
                  disabled={isFlipping}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {isFlipping ? 'Flipping...' : 'Flip Both Coins'}
                </Button>
                {coinResults.length > 0 && !isFlipping && (
                  <div className="text-lg font-bold text-green-600">
                    Results: {coinResults.join(' ')}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  Sample Space: HH, HT, TH, TT → P(at least one H) = 3/4
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bag and Balls Game */}
      {activeMode === 'bag-balls' && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-600">🎒 Bag and Balls Game</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">Pick balls from the bag and see probability in action!</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              {/* Bag Visualization */}
              <div className="text-center mb-4">
                <div className="text-6xl mb-2 transition-all duration-500">
                  {isPickingBall ? (
                    <div className="animate-pulse">🎒</div>
                  ) : (
                    <div>🎒</div>
                  )}
                </div>
                <div className="text-lg font-medium">
                  Red Balls: {bagBalls.red} | Blue Balls: {bagBalls.blue}
                </div>
                <div className="text-sm text-gray-600">
                  Total: {bagBalls.red + bagBalls.blue}
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4 mb-4">
                <Button 
                  onClick={pickBall} 
                  disabled={isPickingBall}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isPickingBall ? 'Picking...' : 'Pick a Ball'}
                </Button>
                <Button onClick={resetBag} variant="outline">
                  Reset Bag
                </Button>
              </div>

              {/* Replacement Toggle */}
              <div className="text-center mb-4">
                <label className="flex items-center justify-center space-x-2">
                  <input
                    type="checkbox"
                    checked={withReplacement}
                    onChange={(e) => setWithReplacement(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">With Replacement</span>
                </label>
              </div>

              {/* Result */}
              {selectedBall && !isPickingBall && (
                <div className="text-center p-4 bg-blue-100 rounded-lg animate-fadeIn">
                  <div className="text-6xl mb-2 animate-bounce">
                    {selectedBall === 'red' ? '🔴' : '🔵'}
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    Picked: {selectedBall} ball
                  </div>
                  <div className="text-sm text-gray-600">
                    P({selectedBall}) = {selectedBall === 'red' ? bagBalls.red : bagBalls.blue} / {bagBalls.red + bagBalls.blue}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histogram Animation */}
      {activeMode === 'histogram' && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-600">📊 3D Histogram Blocks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">Watch histogram blocks rise like Minecraft towers!</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-end justify-center space-x-6 h-80">
                {[
                  { interval: '10-20', frequency: 40, color: 'bg-blue-500', shadow: 'shadow-blue-500/50' },
                  { interval: '20-30', frequency: 50, color: 'bg-green-500', shadow: 'shadow-green-500/50' },
                  { interval: '30-40', frequency: 30, color: 'bg-purple-500', shadow: 'shadow-purple-500/50' },
                  { interval: '40-50', frequency: 20, color: 'bg-orange-500', shadow: 'shadow-orange-500/50' }
                ].map((block, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs mb-2 font-medium">{block.interval}</div>
                    <div 
                      className={`${block.color} ${block.shadow} w-16 rounded-t-lg transition-all duration-1000 hover:shadow-xl hover:scale-105 transform-gpu`}
                      style={{ 
                        height: `${block.frequency * 4}px`,
                        transform: 'perspective(1000px) rotateX(20deg)',
                        boxShadow: `0 0 20px ${block.shadow.split('/')[0].split('-')[1] === 'blue' ? 'rgba(59, 130, 246, 0.5)' : 
                          block.shadow.split('/')[0].split('-')[1] === 'green' ? 'rgba(34, 197, 94, 0.5)' :
                          block.shadow.split('/')[0].split('-')[1] === 'purple' ? 'rgba(168, 85, 247, 0.5)' :
                          'rgba(249, 115, 22, 0.5)'}`
                      }}
                    />
                    <div className="text-sm font-bold mt-2">{block.frequency}</div>
                    {index === 1 && (
                      <div className="text-xs text-green-600 font-bold mt-1">⭐ Modal Class</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Cards Probability */}
      {activeMode === 'cards' && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-600">🃏 Virtual Deck of Cards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">Draw cards and see probability calculations!</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">🃏</div>
                <div className="space-y-2">
                  <div className="text-lg font-medium">Standard Deck: 52 Cards</div>
                  <div className="text-sm text-gray-600">
                    Red Cards: 26 (Hearts + Diamonds) → P(Red) = 26/52 = 1/2
                  </div>
                  <div className="text-sm text-gray-600">
                    Black Cards: 26 (Spades + Clubs) → P(Black) = 26/52 = 1/2
                  </div>
                  <div className="text-sm text-gray-600">
                    Face Cards: 12 (J, Q, K of each suit) → P(Face) = 12/52 = 3/13
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
