import React, { useMemo, useRef, useState } from 'react';

type Point = { x: number; y: number };

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function CoordinateGeometryLab() {
  // Viewport controls (dynamic zoom via span and grid step)
  const [span, setSpan] = useState<number>(10); // world half-range (±span)
  const [gridStep, setGridStep] = useState<number>(1); // grid spacing
  const xmin = -span;
  const xmax = span;
  const ymin = -span;
  const ymax = span;

  const width = 520;
  const height = 360;
  const padding = 40;

  const [activeDrag, setActiveDrag] = useState<null | 'A' | 'B' | 'C'>(null);
  const [history, setHistory] = useState<Array<any>>([]);

  const pushHistory = () => {
    setHistory(h => [...h, { A: { ...A }, B: { ...B }, C: { ...C }, m, n, r, span, gridStep, conic }]);
  };

  // Draggable points A, B for line tools
  const defaultA: Point = { x: -4, y: 2 };
  const defaultB: Point = { x: 5, y: 6 };
  const [A, setA] = useState<Point>(defaultA);
  const [B, setB] = useState<Point>(defaultB);

  // Section ratio m:n
  const [m, setM] = useState<number>(1);
  const [n, setN] = useState<number>(2);

  // Circle center and radius
  const defaultC: Point = { x: 1, y: -2 };
  const [C, setC] = useState<Point>(defaultC);
  const [r, setR] = useState<number>(4);

  // Conic selector
  const [conic, setConic] = useState<'parabola' | 'ellipse' | 'hyperbola'>('parabola');
  // Gen‑Z simple modes and advanced toggle
  const [mode, setMode] = useState<'quadrant' | 'line' | 'circle' | 'conic'>('quadrant');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Coordinate transforms
  const sx = (x: number) => padding + ((x - xmin) / (xmax - xmin)) * (width - 2 * padding);
  const sy = (y: number) => height - (padding + ((y - ymin) / (ymax - ymin)) * (height - 2 * padding));

  const invSx = (px: number) => xmin + ((px - padding) / (width - 2 * padding)) * (xmax - xmin);
  const invSy = (py: number) => ymin + ((height - py - padding) / (height - 2 * padding)) * (ymax - ymin);

  // Derived values
  const distanceAB = useMemo(() => Math.hypot(B.x - A.x, B.y - A.y), [A, B]);
  const midpointAB = useMemo<Point>(() => ({ x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }), [A, B]);
  const slope = useMemo(() => (B.x !== A.x ? (B.y - A.y) / (B.x - A.x) : Infinity), [A, B]);
  const lineInterceptC = useMemo(() => (slope === Infinity ? 0 : A.y - (slope as number) * A.x), [A, slope]);

  const sectionPoint = useMemo<Point>(() => {
    const denom = m + n;
    const x = (m * B.x + n * A.x) / denom;
    const y = (m * B.y + n * A.y) / denom;
    return { x, y };
  }, [A, B, m, n]);

  // Drag handlers
  const onMouseDown = (which: 'A' | 'B' | 'C') => (e: React.MouseEvent) => {
    e.preventDefault();
    pushHistory();
    setActiveDrag(which);
  };
  const onMouseUp = () => setActiveDrag(null);
  const onMouseMove = (e: React.MouseEvent) => {
    if (!activeDrag || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = invSx(clamp(e.clientX - rect.left, padding, width - padding));
    const y = invSy(clamp(e.clientY - rect.top, padding, height - padding));
    const p = { x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) };
    if (activeDrag === 'A') setA(p);
    if (activeDrag === 'B') setB(p);
    if (activeDrag === 'C') setC(p);
  };

  // Quadrant highlighting for the currently dragged point (A/B/C preference)
  const quadPoint = activeDrag === 'B' ? B : activeDrag === 'C' ? C : A;
  const quad = quadPoint.x >= 0 && quadPoint.y >= 0
    ? 'Q1'
    : quadPoint.x < 0 && quadPoint.y >= 0
    ? 'Q2'
    : quadPoint.x < 0 && quadPoint.y < 0
    ? 'Q3'
    : 'Q4';

  // Helper drawing for conics
  const renderConicPath = () => {
    const samples = 200;
    const pts: string[] = [];
    if (conic === 'parabola') {
      const a = 0.5; // y^2 = 4ax => x = y^2/(4a)
      for (let i = -samples / 2; i <= samples / 2; i++) {
        const y = (i / (samples / 2)) * 6; // y range
        const x = (y * y) / (4 * a);
        pts.push(`${sx(x)},${sy(y)}`);
      }
    } else if (conic === 'ellipse') {
      const a = 5, b = 3;
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * 2 * Math.PI;
        const x = a * Math.cos(t);
        const y = b * Math.sin(t);
        pts.push(`${sx(x)},${sy(y)}`);
      }
    } else if (conic === 'hyperbola') {
      const a = 3, b = 2; // x^2/a^2 - y^2/b^2 = 1
      for (let i = -samples / 2; i <= samples / 2; i++) {
        const t = i / (samples / 2);
        const x = a * Math.cosh(t);
        const y = b * Math.sinh(t);
        pts.push(`${sx(x)},${sy(y)}`);
      }
    }
    return pts.join(' L ');
  };

  const applyPreset = (name: 'vertical' | 'horizontal' | 'circle-origin') => {
    pushHistory();
    if (name === 'vertical') {
      const x = 2;
      setA({ x, y: -5 });
      setB({ x, y: 6 });
    } else if (name === 'horizontal') {
      const y = 3;
      setA({ x: -6, y });
      setB({ x: 6, y });
    } else if (name === 'circle-origin') {
      const cx = 3, cy = 4;
      setC({ x: cx, y: cy });
      setR(Math.hypot(cx, cy));
    }
  };

  const handleUndo = () => {
    setHistory(h => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setA(prev.A); setB(prev.B); setC(prev.C);
      setM(prev.m); setN(prev.n); setR(prev.r);
      setSpan(prev.span); setGridStep(prev.gridStep); setConic(prev.conic);
      return h.slice(0, -1);
    });
  };

  const handleReset = () => {
    pushHistory();
    setA(defaultA); setB(defaultB); setC(defaultC);
    setM(1); setN(2); setR(4); setSpan(10); setGridStep(1); setConic('parabola');
  };

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-xl font-bold text-center">📍 Coordinate Geometry Visual Lab</h3>

      {/* Simple mode switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button onClick={() => setMode('quadrant')} className={`px-3 py-2 rounded-full text-sm border ${mode==='quadrant'?'bg-black text-white border-black':'bg-white text-gray-700 border-gray-300'}`} title="Drag the dot. Learn the 4 zones quickly.">🔲 Quadrants</button>
        <button onClick={() => setMode('line')} className={`px-3 py-2 rounded-full text-sm border ${mode==='line'?'bg-black text-white border-black':'bg-white text-gray-700 border-gray-300'}`} title="Move A & B. See distance and slope live.">📏 Line</button>
        <button onClick={() => setMode('circle')} className={`px-3 py-2 rounded-full text-sm border ${mode==='circle'?'bg-black text-white border-black':'bg-white text-gray-700 border-gray-300'}`} title="Drag center, slide radius. Equation updates.">⭕ Circle</button>
        <button onClick={() => setMode('conic')} className={`px-3 py-2 rounded-full text-sm border ${mode==='conic'?'bg-black text-white border-black':'bg-white text-gray-700 border-gray-300'}`} title="Pick a shape. Watch it draw.">✨ Conics</button>
      </div>
      <p className="text-center text-sm text-muted-foreground -mt-2">Tap a mode. Play for 5 seconds. Brain locks the concept. 🔒🧠</p>

      {/* 1. Quadrant Explorer & Grid with draggable generic point A */}
      <div className="border rounded-xl p-4 shadow-sm bg-white">
        <h4 className="font-semibold mb-1">{mode==='quadrant'?'Quadrant Explorer':mode==='line'?'Line Playground':mode==='circle'?'Circle Playground':'Conic Studio'}</h4>
        <p className="text-sm text-muted-foreground mb-3">{mode==='quadrant'?'Drag the dot. See Q1 / Q2 / Q3 / Q4 light up.':mode==='line'?'Move A & B. The green bar shows distance. The formula reacts.':mode==='circle'?'Drag center C. Slide radius. Equation updates instantly.':'Pick a conic from the dropdown. Enjoy the vibe.'}</p>

        {/* Controls row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="bg-gray-50 p-3 rounded border" title="Change zoom and grid spacing">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold">Axes & Grid</div>
              <button className="text-[11px] underline" onClick={()=>setShowAdvanced(!showAdvanced)} aria-label="Toggle advanced controls">{showAdvanced?'Hide':'Show'} advanced</button>
            </div>
            {showAdvanced && (<>
              <label className="text-xs">Zoom (±span):</label>
              <input aria-label="Zoom span" type="range" min={5} max={15} step={1} value={span} onChange={e => setSpan(parseInt(e.target.value))} />
              <div className="text-xs">View: −{span} … +{span}</div>
              <label className="text-xs">Grid step:</label>
              <input aria-label="Grid step" type="range" min={1} max={5} step={1} value={gridStep} onChange={e => setGridStep(parseInt(e.target.value))} />
              <div className="text-xs">Step: {gridStep}</div>
            </>)}
          </div>
          <div className="bg-gray-50 p-3 rounded border" title="Live coordinates and direct input">
            <div className="text-xs font-semibold mb-1">Live Coordinates</div>
            <div className="text-xs mb-1">Active: {activeDrag ?? '—'} ({quadPoint.x.toFixed(2)}, {quadPoint.y.toFixed(2)})</div>
            <div className="grid grid-cols-3 gap-2 items-center">
              <label className="text-xs">A(x,y)</label>
              <input aria-label="A x" title="Type x for A" className="border rounded px-2 py-1 text-xs" type="number" step={0.5} value={A.x} onChange={e => setA({ ...A, x: clamp(parseFloat(e.target.value), xmin, xmax) })} />
              <input aria-label="A y" title="Type y for A" className="border rounded px-2 py-1 text-xs" type="number" step={0.5} value={A.y} onChange={e => setA({ ...A, y: clamp(parseFloat(e.target.value), ymin, ymax) })} />
              <label className="text-xs">B(x,y)</label>
              <input aria-label="B x" title="Type x for B" className="border rounded px-2 py-1 text-xs" type="number" step={0.5} value={B.x} onChange={e => setB({ ...B, x: clamp(parseFloat(e.target.value), xmin, xmax) })} />
              <input aria-label="B y" title="Type y for B" className="border rounded px-2 py-1 text-xs" type="number" step={0.5} value={B.y} onChange={e => setB({ ...B, y: clamp(parseFloat(e.target.value), ymin, ymax) })} />
              <label className="text-xs">C(h,k)</label>
              <input aria-label="C x" title="Type h for center" className="border rounded px-2 py-1 text-xs" type="number" step={0.5} value={C.x} onChange={e => setC({ ...C, x: clamp(parseFloat(e.target.value), xmin, xmax) })} />
              <input aria-label="C y" title="Type k for center" className="border rounded px-2 py-1 text-xs" type="number" step={0.5} value={C.y} onChange={e => setC({ ...C, y: clamp(parseFloat(e.target.value), ymin, ymax) })} />
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded border" title="Presets and undo/reset">
            <div className="text-xs font-semibold mb-1">Actions</div>
            <div className="flex flex-wrap gap-2">
              <button aria-label="Undo" className="px-2 py-1 text-xs rounded bg-gray-600 text-white" onClick={handleUndo} title="Undo last change">Undo</button>
              <button aria-label="Reset" className="px-2 py-1 text-xs rounded bg-red-600 text-white" onClick={handleReset} title="Reset to defaults">Reset</button>
              <button aria-label="Preset vertical line" className="px-2 py-1 text-xs rounded bg-blue-600 text-white" onClick={() => applyPreset('vertical')} title="Set A and B to make a vertical line">Vertical line</button>
              <button aria-label="Preset horizontal line" className="px-2 py-1 text-xs rounded bg-blue-600 text-white" onClick={() => applyPreset('horizontal')} title="Set A and B to make a horizontal line">Horizontal line</button>
              <button aria-label="Preset circle through origin" className="px-2 py-1 text-xs rounded bg-amber-600 text-white" onClick={() => applyPreset('circle-origin')} title="Choose center so circle passes through origin">Circle through origin</button>
            </div>
          </div>
        </div>

        <svg
          ref={svgRef}
          width={width}
          height={height}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          className="border rounded bg-gray-50"
        >
          {/* Quadrants */}
          <rect x={padding} y={padding} width={(width - 2 * padding) / 2} height={(height - 2 * padding) / 2} fill={quad === 'Q2' ? '#fde68a' : '#f3f4f6'} />
          <rect x={padding + (width - 2 * padding) / 2} y={padding} width={(width - 2 * padding) / 2} height={(height - 2 * padding) / 2} fill={quad === 'Q1' ? '#fde68a' : '#f3f4f6'} />
          <rect x={padding} y={padding + (height - 2 * padding) / 2} width={(width - 2 * padding) / 2} height={(height - 2 * padding) / 2} fill={quad === 'Q3' ? '#fde68a' : '#f3f4f6'} />
          <rect x={padding + (width - 2 * padding) / 2} y={padding + (height - 2 * padding) / 2} width={(width - 2 * padding) / 2} height={(height - 2 * padding) / 2} fill={quad === 'Q4' ? '#fde68a' : '#f3f4f6'} />

          {/* Grid with step and numeric ticks */}
          {Array.from({ length: Math.floor((xmax - xmin) / gridStep) + 1 }).map((_, i) => {
            const gx = xmin + i * gridStep;
            return (
              <g key={`vx-${i}`}>
                <line x1={sx(gx)} y1={sy(ymin)} x2={sx(gx)} y2={sy(ymax)} stroke="#e5e7eb" strokeWidth={1} />
                <text x={sx(gx) + 2} y={sy(0) - 4} className="text-[10px] fill-gray-500">{gx}</text>
              </g>
            );
          })}
          {Array.from({ length: Math.floor((ymax - ymin) / gridStep) + 1 }).map((_, i) => {
            const gy = ymin + i * gridStep;
            return (
              <g key={`hz-${i}`}>
                <line x1={sx(xmin)} y1={sy(gy)} x2={sx(xmax)} y2={sy(gy)} stroke="#e5e7eb" strokeWidth={1} />
                <text x={sx(0) + 4} y={sy(gy) - 2} className="text-[10px] fill-gray-500">{gy}</text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={sx(xmin)} y1={sy(0)} x2={sx(xmax)} y2={sy(0)} stroke="#111827" strokeWidth={2} />
          <line x1={sx(0)} y1={sy(ymin)} x2={sx(0)} y2={sy(ymax)} stroke="#111827" strokeWidth={2} />

          {/* Line AB */}
          {(mode!=='circle' && mode!=='conic') && (
            <line x1={sx(A.x)} y1={sy(A.y)} x2={sx(B.x)} y2={sy(B.y)} stroke="#059669" strokeWidth={3} />
          )}

          {/* Points A, B, Midpoint, Section point */}
          {mode!=='conic' && (
            <>
              <circle cx={sx(A.x)} cy={sy(A.y)} r={10} fill="#1d4ed8" onMouseDown={onMouseDown('A')}>
                <title>Drag A; updates distance, midpoint, slope and line</title>
              </circle>
              <text x={sx(A.x) + 8} y={sy(A.y) - 8} className="text-xs fill-gray-700">A({A.x.toFixed(1)},{A.y.toFixed(1)})</text>
            </>
          )}
          {(mode==='line' || mode==='quadrant') && (
            <>
              <circle cx={sx(B.x)} cy={sy(B.y)} r={10} fill="#b91c1c" onMouseDown={onMouseDown('B')}>
                <title>Drag B; updates distance, midpoint, slope and line</title>
              </circle>
              <text x={sx(B.x) + 8} y={sy(B.y) - 8} className="text-xs fill-gray-700">B({B.x.toFixed(1)},{B.y.toFixed(1)})</text>
            </>
          )}

          {/* Midpoint */}
          {mode==='line' && (
            <>
              <circle cx={sx(midpointAB.x)} cy={sy(midpointAB.y)} r={6} fill="#10b981" />
              <text x={sx(midpointAB.x) + 6} y={sy(midpointAB.y) + 14} className="text-xs fill-gray-700">M</text>
            </>
          )}

          {/* Section point */}
          {mode==='line' && (
            <>
              <circle cx={sx(sectionPoint.x)} cy={sy(sectionPoint.y)} r={6} fill="#8b5cf6" />
              <text x={sx(sectionPoint.x) + 6} y={sy(sectionPoint.y) - 6} className="text-xs fill-gray-700">P</text>
            </>
          )}

          {/* Circle */}
          {mode==='circle' && (
            <>
              <circle cx={sx(C.x)} cy={sy(C.y)} r={((r) / (xmax - xmin)) * (width - 2 * padding)} fill="none" stroke="#b45309" strokeWidth={3} />
              <circle cx={sx(C.x)} cy={sy(C.y)} r={10} fill="#b45309" onMouseDown={onMouseDown('C')}>
                <title>Drag center C; circle equation updates</title>
              </circle>
              <text x={sx(C.x) + 8} y={sy(C.y) - 8} className="text-xs fill-gray-700">C({C.x.toFixed(1)},{C.y.toFixed(1)})</text>
            </>
          )}

          {/* Conic */}
          {mode==='conic' && (
            <path d={`M ${renderConicPath()}`} fill="none" stroke="#6d28d9" strokeWidth={3} />
          )}
        </svg>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
          {mode==='line' && (
          <div className="bg-gray-50 p-3 rounded border" title="Distance and midpoint computed from A & B">
            <div className="font-semibold mb-1">Distance & Midpoint</div>
            <div>AB = {distanceAB.toFixed(2)}</div>
            <div>M = ({midpointAB.x.toFixed(2)}, {midpointAB.y.toFixed(2)})</div>
          </div>)}
          {(mode==='line' || mode==='quadrant') && (
          <div className="bg-gray-50 p-3 rounded border" title="Slope and line equation in y = mx + c (or x = k if vertical)">
            <div className="font-semibold mb-1">Slope & Line</div>
            <div>m = {slope === Infinity ? '∞' : slope.toFixed(2)}</div>
            <div>{slope === Infinity ? 'x = ' + A.x.toFixed(2) : `y = ${slope.toFixed(2)}x + ${lineInterceptC.toFixed(2)}`}</div>
          </div>)}
          {mode==='line' && (
          <div className="bg-gray-50 p-3 rounded border" title="Section point P dividing AB in ratio m:n">
            <div className="font-semibold mb-1">Section Formula</div>
            <div className="flex items-center gap-2">
              <label className="text-xs">m</label>
              <input type="range" min={1} max={5} step={1} value={m} onChange={e => setM(parseInt(e.target.value))} />
              <span className="text-xs w-6 text-center">{m}</span>
              <label className="text-xs">n</label>
              <input type="range" min={1} max={5} step={1} value={n} onChange={e => setN(parseInt(e.target.value))} />
              <span className="text-xs w-6 text-center">{n}</span>
            </div>
            <div>P = ({sectionPoint.x.toFixed(2)}, {sectionPoint.y.toFixed(2)}) for ratio {m}:{n}</div>
          </div>)}
          {mode==='circle' && (
          <div className="bg-gray-50 p-3 rounded border" title="Circle equation from center (h,k) and radius r">
            <div className="font-semibold mb-1">Circle</div>
            <div className="flex items-center gap-2">
              <label className="text-xs">r</label>
              <input type="range" min={1} max={8} step={0.5} value={r} onChange={e => setR(parseFloat(e.target.value))} />
              <span className="text-xs w-10 text-center">{r.toFixed(1)}</span>
            </div>
            <div>(x - {C.x.toFixed(2)})² + (y - {C.y.toFixed(2)})² = {r.toFixed(2)}²</div>
          </div>)}
          {mode==='conic' && (
          <div className="bg-gray-50 p-3 rounded border">
            <div className="font-semibold mb-1">Conic Identifier</div>
            <select className="border rounded px-2 py-1 text-sm" value={conic} onChange={e => setConic(e.target.value as any)}>
              <option value="parabola">Parabola</option>
              <option value="ellipse">Ellipse</option>
              <option value="hyperbola">Hyperbola</option>
            </select>
            <div className="text-xs text-muted-foreground mt-1">Shape updates on the canvas above.</div>
          </div>)}
        </div>
      </div>
    </div>
  );
}


