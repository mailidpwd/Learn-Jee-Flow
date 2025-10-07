import React, { useState, useEffect, useRef } from 'react';

const TrigonometryPlayground: React.FC = () => {
  const circleRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<HTMLCanvasElement>(null);
  const [theta, setTheta] = useState(0); // radians
  const [showSin, setShowSin] = useState(true);
  const [showCos, setShowCos] = useState(true);
  const [windowDeg, setWindowDeg] = useState(360);
  const [isDragging, setIsDragging] = useState(false);

  // Helper functions
  const deg = (r: number) => (r * 180 / Math.PI);
  const rad = (d: number) => (d * Math.PI / 180);

  // Draw unit circle
  const drawCircle = () => {
    const canvas = circleRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = 120;

    // Clear canvas
    ctx.clearRect(0, 0, W, H);

    // Draw axes
    ctx.strokeStyle = '#e6edf3';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 150, cy);
    ctx.lineTo(cx + 150, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 150);
    ctx.lineTo(cx, cy + 150);
    ctx.stroke();

    // Draw main circle
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Calculate point position
    const x = cx + R * Math.cos(theta);
    const y = cy - R * Math.sin(theta);

    // Draw projection lines
    ctx.strokeStyle = 'rgba(30,58,138,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, cy);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // Draw axes labels
    ctx.fillStyle = '#333';
    ctx.font = '12px system-ui';
    ctx.fillText('(1,0)', cx + R + 4, cy + 3);
    ctx.fillText('(-1,0)', cx - R - 30, cy + 3);
    ctx.fillText('(0,1)', cx - 10, cy - R - 6);
    ctx.fillText('(0,-1)', cx - 15, cy + R + 15);

    // Draw main point
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw projection points
    ctx.fillStyle = '#0ea5a4';
    ctx.beginPath();
    ctx.arc(x, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx, y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw angle arc
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 35, 0, -theta, theta > 0);
    ctx.stroke();
  };

  // Draw graph
  const drawGraph = () => {
    const canvas = graphRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const samples = 720;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw axes
    ctx.strokeStyle = '#e6edf3';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Helper functions
    const xOfDeg = (d: number) => (d / windowDeg) * canvas.width;
    const yOfVal = (v: number) => canvas.height / 2 - v * (canvas.height / 2 - 10);

    // Draw sin curve
    if (showSin) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const degI = (i / samples) * windowDeg;
        const val = Math.sin(rad(degI));
        const x = xOfDeg(degI);
        const y = yOfVal(val);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw cos curve
    if (showCos) {
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const degI = (i / samples) * windowDeg;
        const val = Math.cos(rad(degI));
        const x = xOfDeg(degI);
        const y = yOfVal(val);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw current theta marker
    const curDeg = (deg(theta) % 360 + 360) % 360;
    const curX = xOfDeg(curDeg % windowDeg);
    ctx.strokeStyle = 'rgba(16,185,129,0.9)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(curX, 0);
    ctx.lineTo(curX, canvas.height);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#111';
    ctx.font = 'bold 14px system-ui';
    ctx.fillText(`θ = ${curDeg.toFixed(1)}°`, curX + 6, 18);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 14px system-ui';
    ctx.fillText(`sin θ = ${Math.sin(theta).toFixed(3)}`, curX + 6, 38);
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 14px system-ui';
    ctx.fillText(`cos θ = ${Math.cos(theta).toFixed(3)}`, curX + 6, 58);
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = circleRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const R = 120;
    const dx = mx - cx;
    const dy = cy - my;
    const dist = Math.hypot(dx, dy);

    if (Math.abs(dist - R) < 15) {
      setIsDragging(true);
      updateFromMouse(mx, my);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const canvas = circleRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      updateFromMouse(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = circleRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    updateFromMouse(e.clientX - rect.left, e.clientY - rect.top);
  };

  const updateFromMouse = (mx: number, my: number) => {
    const canvas = circleRef.current;
    if (!canvas) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const dx = mx - cx;
    const dy = cy - my;
    let newTheta = Math.atan2(dy, dx);
    if (newTheta < 0) newTheta += 2 * Math.PI;
    setTheta(newTheta);
  };

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setTheta(prev => (prev - Math.PI / 36 + 2 * Math.PI) % (2 * Math.PI));
      }
      if (e.key === 'ArrowRight') {
        setTheta(prev => (prev + Math.PI / 36) % (2 * Math.PI));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Redraw when theta or settings change
  useEffect(() => {
    drawCircle();
    drawGraph();
  }, [theta, showSin, showCos, windowDeg]);

  // Calculate current values
  const sinVal = Math.sin(theta);
  const cosVal = Math.cos(theta);
  const tanVal = Math.abs(cosVal) < 1e-6 ? '∞' : (sinVal / cosVal).toFixed(3);

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
        🎮 Interactive Trigonometry Playground
      </h3>
      <p className="text-center text-gray-600 mb-8">
        <strong>Play with the unit circle and see graphs update live!</strong>
      </p>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Unit Circle Panel */}
        <div className="bg-white p-4 rounded-lg shadow-lg flex-1">
          <h4 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
            🎯 Unit Circle — Drag the Point
          </h4>
          
          <div className="flex justify-center mb-3">
            <canvas
              ref={circleRef}
              width={350}
              height={350}
              className="border border-gray-200 rounded-lg bg-gray-50 cursor-pointer max-w-full"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onClick={handleClick}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-sm text-gray-600">
              Angle: <strong>{deg(theta).toFixed(1)}°</strong> / <strong>{theta.toFixed(3)}</strong> rad
            </span>
            <div className="flex-1"></div>
            <button
              onClick={() => setTheta(0)}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-xs text-gray-600">cos θ</div>
              <div className="text-sm font-bold text-blue-600">{cosVal.toFixed(3)}</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <div className="text-xs text-gray-600">sin θ</div>
              <div className="text-sm font-bold text-red-600">{sinVal.toFixed(3)}</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-xs text-gray-600">tan θ</div>
              <div className="text-sm font-bold text-green-600">{tanVal}</div>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <div>• Drag the blue dot around the circle</div>
            <div>• Use Left/Right arrows to rotate by 5°</div>
            <div>• Click anywhere on the circle to jump to that point</div>
          </div>
        </div>

        {/* Graph Panel */}
        <div className="bg-white p-4 rounded-lg shadow-lg flex-1">
          <h4 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
            📈 Graphs — Live Trace
          </h4>
          
          <div className="flex justify-center mb-3">
            <canvas
              ref={graphRef}
              width={500}
              height={200}
              className="border border-gray-200 rounded-lg bg-gray-50 max-w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showSin}
                onChange={(e) => setShowSin(e.target.checked)}
                className="w-4 h-4 text-red-500"
              />
              <span className="text-red-600 font-medium">sin θ</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showCos}
                onChange={(e) => setShowCos(e.target.checked)}
                className="w-4 h-4 text-blue-500"
              />
              <span className="text-blue-600 font-medium">cos θ</span>
            </label>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">θ window:</span>
              <select
                value={windowDeg}
                onChange={(e) => setWindowDeg(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={360}>0–360°</option>
                <option value={720}>0–720°</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1 mb-4">
            <div>• Graph updates as you move the dot on unit circle</div>
            <div>• See phase shift between sin and cos curves</div>
            <div>• Toggle functions on/off to compare</div>
          </div>

          {/* Educational Content Below Graph */}
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-50 to-red-50 p-3 rounded-lg border border-gray-200">
              <h5 className="font-semibold text-gray-800 mb-2 text-sm">🎯 Key Observations:</h5>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• <strong>sin θ</strong> starts at 0, peaks at 90°, returns to 0 at 180°</div>
                <div>• <strong>cos θ</strong> starts at 1, drops to 0 at 90°, reaches -1 at 180°</div>
                <div>• Both functions repeat every 360° (periodic nature)</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-purple-50 p-3 rounded-lg border border-gray-200">
              <h5 className="font-semibold text-gray-800 mb-2 text-sm">📐 Special Angles:</h5>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div><strong>0°:</strong> sin=0, cos=1</div>
                <div><strong>90°:</strong> sin=1, cos=0</div>
                <div><strong>180°:</strong> sin=0, cos=-1</div>
                <div><strong>270°:</strong> sin=-1, cos=0</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-gray-200">
              <h5 className="font-semibold text-gray-800 mb-2 text-sm">🔍 Beginner Tips:</h5>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Move the dot to see how coordinates change</div>
                <div>• Notice sin and cos are always between -1 and 1</div>
                <div>• Watch the phase difference: cos leads sin by 90°</div>
                <div>• Try different quadrants to see sign changes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-semibold text-blue-800 mb-2">🎓 Learning Tips:</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Watch how sin θ and cos θ values change as you move around the circle</li>
          <li>• Notice the phase difference between sin and cos curves</li>
          <li>• See how tan θ becomes infinite at 90° and 270°</li>
          <li>• Observe the periodic nature of trigonometric functions</li>
        </ul>
      </div>
    </div>
  );
};

export default TrigonometryPlayground;
