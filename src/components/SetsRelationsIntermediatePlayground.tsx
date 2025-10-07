import React, { useEffect, useMemo, useRef, useState } from 'react';

// A compact, white-themed interactive lab for Sets, Relations & Functions (Intermediate)
// Sections:
// 1) Venn Diagram Explorer
// 2) Relations (bipartite) playground
// 3) Function Machine + Graph
// 4) Graph Explorer + Symmetry (even/odd) checker

class ErrorCatcher extends React.Component<{ label: string; children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { label: string; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div className="text-xs text-red-600">{this.props.label} failed to load.</div>;
    }
    return this.props.children as React.ReactElement;
  }
}

export default function SetsRelationsIntermediatePlayground() {
  return (
    <div className="space-y-6">
      <Header title="🎮 Intermediate Visual Lab — Sets, Relations & Functions" subtitle="Play with Venns, relations, function machines and graphs." />

      <ErrorCatcher label="Venn Explorer">
        <VennExplorer />
      </ErrorCatcher>
      <ErrorCatcher label="Relations Visualizer">
        <RelationsPlayground />
      </ErrorCatcher>
      <ErrorCatcher label="Function Machine">
        <FunctionMachine />
      </ErrorCatcher>
      <ErrorCatcher label="Function Galaxy">
        <FunctionGalaxy />
      </ErrorCatcher>
      <ErrorCatcher label="Isometric Surface">
        <IsometricSurface />
      </ErrorCatcher>
    </div>
  );
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
    </div>
  );
}

// --- 1) Venn Diagram Explorer ---
function VennExplorer() {
  const [aInput, setAInput] = useState<string>('1,2,3,4');
  const [bInput, setBInput] = useState<string>('3,4,5,6');
  const [mode, setMode] = useState<'none' | 'union' | 'intersection' | 'a-b' | 'b-a'>('none');

  const setA = useMemo(() => parseCSV(aInput), [aInput]);
  const setB = useMemo(() => parseCSV(bInput), [bInput]);

  const union = useMemo(() => Array.from(new Set([...setA, ...setB])), [setA, setB]);
  const intersection = useMemo(() => setA.filter(x => setB.includes(x)), [setA, setB]);
  const onlyA = useMemo(() => setA.filter(x => !setB.includes(x)), [setA, setB]);
  const onlyB = useMemo(() => setB.filter(x => !setA.includes(x)), [setA, setB]);

  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-blue-50 p-4 shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">🎨 Venn Diagram Explorer</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-gray-600 font-medium">Set A (comma-separated)</label>
            <input className="mt-1 w-56 rounded-md border border-blue-200 px-2 py-1 text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500" value={aInput} onChange={e => setAInput(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium">Set B (comma-separated)</label>
            <input className="mt-1 w-56 rounded-md border border-green-200 px-2 py-1 text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500" value={bInput} onChange={e => setBInput(e.target.value)} />
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className="text-gray-600 font-medium">Highlight:</span>
            {(['none','union','intersection','a-b','b-a'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} className={`rounded-full border px-3 py-1 transition-all duration-200 ${mode===m?'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg transform scale-105':'bg-white/60 text-gray-700 border-gray-300 hover:bg-white/80 hover:shadow-md backdrop-blur-sm'}`}>{labelForMode(m)}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <VennSVG mode={mode} aValues={setA} bValues={setB} />
      </div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <InfoCard title="🔵 Only in A (A − B)" values={onlyA} color="blue" />
        <InfoCard title="💫 Overlap (A ∩ B)" values={intersection} color="purple" />
        <InfoCard title="🟢 Only in B (B − A)" values={onlyB} color="green" />
      </div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <InfoCard title="📊 A" values={setA} color="slate" />
        <InfoCard title="📊 B" values={setB} color="slate" />
        <InfoCard title="🌟 A ∪ B" values={union} color="indigo" />
      </div>
    </div>
  );
}

function VennSVG({ mode, aValues, bValues }: { mode: 'none'|'union'|'intersection'|'a-b'|'b-a'; aValues: (string|number)[]; bValues: (string|number)[] }) {
  const width = 400, height = 240;
  const cx1 = 160, cy = 120, cx2 = 240, r = 70;
  const aSet = new Set(aValues.map(String));
  const bSet = new Set(bValues.map(String));
  const overlap = [...aSet].filter(x => bSet.has(x));
  const onlyA = [...aSet].filter(x => !bSet.has(x));
  const onlyB = [...bSet].filter(x => !aSet.has(x));

  // Dynamic colors based on mode - fix the logic
  const getFillA = () => {
    if (mode === 'union' || mode === 'a-b') return '#3b82f6';
    if (mode === 'intersection') return '#93c5fd';
    return '#93c5fd'; // Default light blue for 'none' and other modes
  };

  const getFillB = () => {
    if (mode === 'union' || mode === 'b-a') return '#22c55e';
    if (mode === 'intersection') return '#bbf7d0';
    return '#bbf7d0'; // Default light green for 'none' and other modes
  };

  const getFillOverlap = () => {
    if (mode === 'union' || mode === 'intersection') return '#a78bfa';
    return '#ddd6fe'; // Default light purple for 'none' and other modes
  };

  const getOpacityA = () => {
    if (mode === 'none') return 0.3; // Light opacity for 'none'
    if (mode === 'union' || mode === 'a-b') return 0.6;
    if (mode === 'intersection') return 0.3;
    return 0.3;
  };

  const getOpacityB = () => {
    if (mode === 'none') return 0.3; // Light opacity for 'none'
    if (mode === 'union' || mode === 'b-a') return 0.6;
    if (mode === 'intersection') return 0.3;
    return 0.3;
  };

  const getOpacityOverlap = () => {
    if (mode === 'none') return 0.3; // Light opacity for 'none'
    if (mode === 'union' || mode === 'intersection') return 0.6;
    return 0.3;
  };

  // Calculate intersection area for proper overlap
  const intersectionCenterX = (cx1 + cx2) / 2;
  const intersectionWidth = Math.max(20, Math.min(60, overlap.length * 8 + 20));

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="bg-white rounded-lg shadow-sm">
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Circle A */}
      <circle 
        cx={cx1} 
        cy={cy} 
        r={r} 
        fill={getFillA()} 
        opacity={getOpacityA()} 
        stroke="#3b82f6" 
        strokeWidth={3}
        className="transition-all duration-300"
      />
      
      {/* Circle B */}
      <circle 
        cx={cx2} 
        cy={cy} 
        r={r} 
        fill={getFillB()} 
        opacity={getOpacityB()} 
        stroke="#22c55e" 
        strokeWidth={3}
        className="transition-all duration-300"
      />

      {/* Intersection area - properly calculated */}
      <ellipse 
        cx={intersectionCenterX} 
        cy={cy} 
        rx={intersectionWidth} 
        ry={r * 0.8} 
        fill={getFillOverlap()} 
        opacity={getOpacityOverlap()}
        className="transition-all duration-300"
      />

      {/* Labels */}
      <text x={cx1} y={cy+r+20} fontSize={14} textAnchor="middle" fill="#1f2937" fontWeight="bold">A</text>
      <text x={cx2} y={cy+r+20} fontSize={14} textAnchor="middle" fill="#1f2937" fontWeight="bold">B</text>

      {/* Values with better positioning */}
      <g fontSize={12} fill="#0f172a" fontWeight="500">
        {/* Only A elements - positioned in left part of circle A */}
        {onlyA.map((v, i) => {
          const cols = Math.ceil(Math.sqrt(onlyA.length));
          const row = Math.floor(i / cols);
          const col = i % cols;
          const x = cx1 - 40 + (col * 20); // Move further left
          const y = cy - 20 + (row * 20);
          return (
            <text key={`a${i}`} x={x} y={y} className="transition-all duration-200">
              {String(v)}
            </text>
          );
        })}
        
        {/* Overlap elements - positioned in center intersection */}
        {overlap.map((v, i) => {
          const cols = Math.ceil(Math.sqrt(overlap.length));
          const row = Math.floor(i / cols);
          const col = i % cols;
          const x = intersectionCenterX - 10 + (col * 20);
          const y = cy - 10 + (row * 20);
          return (
            <text key={`o${i}`} x={x} y={y} className="transition-all duration-200">
              {String(v)}
            </text>
          );
        })}
        
        {/* Only B elements - positioned in right part of circle B */}
        {onlyB.map((v, i) => {
          const cols = Math.ceil(Math.sqrt(onlyB.length));
          const row = Math.floor(i / cols);
          const col = i % cols;
          const x = cx2 + 20 + (col * 20); // Move further right
          const y = cy - 20 + (row * 20);
          return (
            <text key={`b${i}`} x={x} y={y} className="transition-all duration-200">
              {String(v)}
            </text>
          );
        })}
      </g>
    </svg>
  );
}

function InfoCard({ title, values, color = 'gray' }: { title: string; values: (string|number)[]; color?: 'blue' | 'purple' | 'green' | 'slate' | 'indigo' | 'gray' }) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
    green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    slate: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200',
    indigo: 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200',
    gray: 'bg-white border-gray-200'
  };
  
  const textColorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    slate: 'text-slate-600',
    indigo: 'text-indigo-600',
    gray: 'text-gray-900'
  };
  
  const valueColorClasses = {
    blue: 'text-blue-800',
    purple: 'text-purple-800',
    green: 'text-green-800',
    slate: 'text-slate-800',
    indigo: 'text-indigo-800',
    gray: 'text-gray-600'
  };

  return (
    <div className={`rounded-lg border p-3 shadow-sm ${colorClasses[color]}`}>
      <div className={`text-xs font-medium mb-1 ${textColorClasses[color]}`}>{title}</div>
      <div className={`text-xs font-mono ${valueColorClasses[color]}`}>{`{ ${values.join(', ')} }`}</div>
    </div>
  );
}

function labelForMode(m: 'none'|'union'|'intersection'|'a-b'|'b-a') {
  if (m==='none') return 'None';
  if (m==='union') return 'A ∪ B';
  if (m==='intersection') return 'A ∩ B';
  if (m==='a-b') return 'A − B';
  return 'B − A';
}

function parseCSV(s: string): (string|number)[] {
  return s.split(',').map(t => t.trim()).filter(Boolean).map(v => {
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  });
}

// --- 2) Relations (bipartite) playground ---
function RelationsPlayground() {
  const [aInput, setAInput] = useState<string>('a,b,c');
  const [bInput, setBInput] = useState<string>('1,2');
  const [pairsInput, setPairsInput] = useState<string>('a-1,b-2,c-1');

  const A = useMemo(() => parseCSV(aInput).map(String), [aInput]);
  const B = useMemo(() => parseCSV(bInput).map(String), [bInput]);
  const pairs = useMemo(() => parsePairs(pairsInput), [pairsInput]);

  const analysis = useMemo(() => {
    const seen: Record<string, string> = {};
    const violations: string[] = [];
    let isFunction = true;
    
    // Check for function violations
    for (const [x, y] of pairs) {
      if (seen[x] !== undefined && seen[x] !== y) {
        violations.push(`${x} maps to both ${seen[x]} and ${y}`);
        isFunction = false;
      }
      seen[x] = y;
    }
    
    // Check if all elements in A are mapped
    const unmapped = A.filter(a => !Object.prototype.hasOwnProperty.call(seen, a));
    if (unmapped.length > 0) {
      violations.push(`Elements ${unmapped.join(', ')} are not mapped`);
      isFunction = false;
    }
    
    // detect multiple images for a single a
    const counts: Record<string, Set<string>> = {};
    for (const [x, y] of pairs) {
      if (!counts[x]) counts[x] = new Set<string>();
      counts[x].add(y);
    }
    const multiMap = Object.keys(counts).filter(k => counts[k].size > 1);

    return { isFunction, violations, mappedElements: Object.keys(seen), multiMap, unmapped };
  }, [pairs, A]);

  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-green-50 p-4 shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">🔗 Relations Visualizer</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600 font-medium">Set A</label>
            <input className="mt-1 w-full rounded-md border border-blue-200 px-2 py-1 text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500" value={aInput} onChange={e=>setAInput(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium">Set B</label>
            <input className="mt-1 w-full rounded-md border border-green-200 px-2 py-1 text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500" value={bInput} onChange={e=>setBInput(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium">Relation Pairs (a-1,b-2,...)</label>
            <input className="mt-1 w-full rounded-md border border-purple-200 px-2 py-1 text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-purple-500" value={pairsInput} onChange={e=>setPairsInput(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Simple analysis */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-700">Is function?</span> 
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${analysis.isFunction ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {analysis.isFunction ? 'Yes' : 'No'}
          </span>
        </div>
        
        {analysis.violations.length > 0 && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-sm font-semibold text-red-800 mb-2">Function Violations:</div>
            <div className="text-xs text-red-700 space-y-1">
              {analysis.violations.map((violation, i) => (
                <div key={i}>• {violation}</div>
              ))}
            </div>
          </div>
        )}

        {/* Bipartite graph */}
        <div className="mt-2">
          <BipartiteGraph A={A} B={B} pairs={pairs} multiMap={analysis.multiMap} unmapped={analysis.unmapped} />
        </div>
      </div>
    </div>
  );
}


function parsePairs(s: string): [string,string][] {
  if (!s.trim()) return [];
  return s.split(',').map(p => p.trim()).filter(Boolean).map(t => {
    const [l, r] = t.split('-');
    return [String(l).trim(), String(r).trim()];
  });
}

// Compact bipartite graph visualizer
function BipartiteGraph({ A, B, pairs, multiMap, unmapped }: { A: string[]; B: string[]; pairs: [string,string][]; multiMap: string[]; unmapped: string[] }) {
  const width = 560;
  const padX = 90;
  const rowH = 44;
  const rows = Math.max(A.length, B.length);
  const height = Math.max(160, rows * rowH + 40);
  const leftX = padX;
  const rightX = width - padX;

  const aPos: Record<string, { x: number; y: number }> = {};
  const bPos: Record<string, { x: number; y: number }> = {};
  A.forEach((a, i) => { aPos[a] = { x: leftX, y: 30 + i * rowH }; });
  B.forEach((b, i) => { bPos[b] = { x: rightX, y: 30 + i * rowH }; });

  // Build edge list with conflict coloring
  const edges = pairs.map(([a, b]) => {
    const from = aPos[a];
    const to = bPos[b];
    if (!from || !to) return null;
    const conflict = multiMap.includes(a);
    return { a, b, from, to, conflict };
  }).filter(Boolean) as Array<{ a: string; b: string; from: {x:number;y:number}; to:{x:number;y:number}; conflict: boolean }>;

  return (
    <svg width={width} height={height} className="bg-white rounded-lg border shadow-sm">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
        </marker>
        <marker id="arrow-red" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
        </marker>
      </defs>

      {/* headers - positioned with safe padding from top and aligned away from circles */}
      <text x={leftX - 40} y={26} textAnchor="start" fontSize={12} fill="#0f172a" fontWeight="600">Set A (Domain)</text>
      <text x={rightX + 40} y={26} textAnchor="end" fontSize={12} fill="#0f172a" fontWeight="600">Set B (Codomain)</text>

      {/* edges */}
      {edges.map((e, i) => (
        <line key={i} x1={e.from.x + 18} y1={e.from.y} x2={e.to.x - 18} y2={e.to.y}
          stroke={e.conflict ? '#ef4444' : '#6366f1'} strokeWidth={2}
          markerEnd={`url(#${e.conflict ? 'arrow-red' : 'arrow'})`} opacity={0.9} />
      ))}

      {/* A nodes */}
      {A.map((a, i) => {
        const pos = aPos[a];
        const isUnmapped = unmapped.includes(a);
        const isConflict = multiMap.includes(a);
        return (
          <g key={a}>
            <circle cx={pos.x} cy={pos.y} r={16} fill={isUnmapped ? '#fde68a' : (isConflict ? '#fecaca' : '#bfdbfe')} stroke="#1e3a8a" />
            <text x={pos.x} y={pos.y + 4} fontSize={12} textAnchor="middle" fill="#0f172a" fontWeight="600">{a}</text>
          </g>
        );
      })}

      {/* B nodes */}
      {B.map((b, i) => {
        const pos = bPos[b];
        return (
          <g key={b}>
            <circle cx={pos.x} cy={pos.y} r={16} fill="#dcfce7" stroke="#065f46" />
            <text x={pos.x} y={pos.y + 4} fontSize={12} textAnchor="middle" fill="#065f46" fontWeight="600">{b}</text>
          </g>
        );
      })}

      {/* legend */}
      <g transform={`translate(${width/2 - 110}, ${height - 24})`}>
        <rect x={0} y={-14} width={220} height={18} rx={8} fill="#f8fafc" stroke="#e5e7eb" />
        <circle cx={12} cy={-5} r={6} fill="#bfdbfe" stroke="#1e3a8a" />
        <text x={24} y={-2} fontSize={11} fill="#0f172a">A node</text>
        <circle cx={76} cy={-5} r={6} fill="#dcfce7" stroke="#065f46" />
        <text x={88} y={-2} fontSize={11} fill="#0f172a">B node</text>
        <line x1={140} y1={-5} x2={160} y2={-5} stroke="#6366f1" strokeWidth={2} markerEnd="url(#arrow)" />
        <text x={166} y={-2} fontSize={11} fill="#0f172a">map</text>
      </g>
    </svg>
  );
}

// --- 3) Function Machine ---
function FunctionMachine() {
  const [x, setX] = useState<number>(0);
  const y = 2 * x + 3;
  const width = 360, height = 160;
  const pad = 24;
  const sx = (x: number) => pad + ((x + 10) / 20) * (width - 2 * pad);
  const sy = (y: number) => height - (pad + ((y + 23) / 46) * (height - 2 * pad)); // y range roughly [-23, 23]

  const path = useMemo(() => {
    const pts: string[] = [];
    for (let xv = -10; xv <= 10; xv += 0.25) {
      const yv = 2 * xv + 3;
      const X = sx(xv), Y = sy(yv);
      pts.push(`${pts.length ? 'L' : 'M'}${X.toFixed(2)},${Y.toFixed(2)}`);
    }
    return pts.join(' ');
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-purple-50 p-4 shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">⚙️ Function Machine — f(x) = 2x + 3</h3>
        <div className="flex items-center gap-3 text-sm">
          <label className="text-gray-600 font-medium">x</label>
          <input type="range" min={-10} max={10} step={0.1} value={x} onChange={e => setX(parseFloat(e.target.value))} className="w-60 accent-purple-500" />
          <div className="px-3 py-1 bg-purple-50 rounded-full text-purple-800 font-medium">x = {x.toFixed(2)}</div>
          <div className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-800 font-medium">y = {y.toFixed(2)}</div>
        </div>
      </div>
      <div className="mt-3 flex justify-center">
        <svg width={width} height={height} className="bg-white border border-gray-200 rounded-md shadow-sm">
          <line x1={sx(-10)} y1={sy(0)} x2={sx(10)} y2={sy(0)} stroke="#94a3b8" />
          <line x1={sx(0)} y1={sy(-23)} x2={sx(0)} y2={sy(23)} stroke="#94a3b8" />
          {/* x-axis ticks */}
          {[-10,-5,0,5,10].map((xt) => (
            <g key={`xt-${xt}`}>
              <line x1={sx(xt)} y1={sy(0)-4} x2={sx(xt)} y2={sy(0)+4} stroke="#94a3b8" />
              <text x={sx(xt)} y={sy(0)+14} fontSize={10} textAnchor="middle" fill="#475569">{xt}</text>
            </g>
          ))}
          {/* y-axis ticks */}
          {[-20,-10,0,10,20].map((yt) => (
            <g key={`yt-${yt}`}>
              <line x1={sx(0)-4} y1={sy(yt)} x2={sx(0)+4} y2={sy(yt)} stroke="#94a3b8" />
              <text x={sx(0)-6} y={sy(yt)+3} fontSize={10} textAnchor="end" fill="#475569">{yt}</text>
            </g>
          ))}
          <path d={path} fill="none" stroke="#8b5cf6" strokeWidth={3} strokeLinecap="round" />
          <circle cx={sx(x)} cy={sy(y)} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
        </svg>
      </div>
    </div>
  );
}

// --- 4) Graph Explorer + Symmetry Checker ---
function GraphExplorer() {
  const [fn, setFn] = useState<string>('x');
  const width = 380, height = 220, pad = 28;
  const sx = (x: number) => pad + ((x + 10) / 20) * (width - 2 * pad);
  const sy = (y: number) => height - (pad + ((y + 10) / 20) * (height - 2 * pad));

  const f = (x: number) => {
    switch (fn) {
      case 'x': return x;
      case 'x2': return x * x / 5; // scaled to fit
      case 'abs': return Math.abs(x);
      case 'floor': return Math.floor(x);
      case 'inv': return Math.abs(x) < 0.001 ? 0 : 4 / x; // scale 1/x
      case 'exp': return Math.exp(x/4);
      case 'log': return x > 0 ? Math.log(x) * 2 : NaN;
      case 'x3-x': return x*x*x/10 - x; // symmetry demo
      default: return x;
    }
  };

  const path = useMemo(() => {
    const pts: string[] = [];
    for (let xv = -10; xv <= 10; xv += 0.1) {
      const yv = f(xv);
      if (!Number.isFinite(yv)) continue;
      const X = sx(xv), Y = sy(Math.max(-10, Math.min(10, yv)));
      pts.push(`${pts.length ? 'L' : 'M'}${X.toFixed(2)},${Y.toFixed(2)}`);
    }
    return pts.join(' ');
  }, [fn]);

  const symmetry = useMemo(() => {
    if (fn === 'x3-x') return 'Odd (symmetric about origin)';
    if (fn === 'x2') return 'Even (symmetric about y-axis)';
    if (fn === 'abs') return 'Even (symmetric about y-axis)';
    return 'No simple even/odd symmetry';
  }, [fn]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-900">Functions Graph Explorer</div>
        <select value={fn} onChange={e => setFn(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1 text-sm">
          <option value="x">y = x</option>
          <option value="x2">y = x²</option>
          <option value="abs">y = |x|</option>
          <option value="floor">y = ⌊x⌋</option>
          <option value="inv">y = 1/x</option>
          <option value="exp">y = e^{x}</option>
          <option value="log">y = log x</option>
          <option value="x3-x">y = x³ − x</option>
        </select>
      </div>
      <div className="mt-3 flex justify-center">
        <svg width={width} height={height} className="bg-white border border-gray-200 rounded-md">
          <line x1={sx(-10)} y1={sy(0)} x2={sx(10)} y2={sy(0)} stroke="#94a3b8" />
          <line x1={sx(0)} y1={sy(-10)} x2={sx(0)} y2={sy(10)} stroke="#94a3b8" />
          {/* x ticks */}
          {[-10,-5,0,5,10].map((xt) => (
            <g key={`gx-${xt}`}>
              <line x1={sx(xt)} y1={sy(0)-4} x2={sx(xt)} y2={sy(0)+4} stroke="#94a3b8" />
              <text x={sx(xt)} y={sy(0)+14} fontSize={10} textAnchor="middle" fill="#475569">{xt}</text>
            </g>
          ))}
          {/* y ticks */}
          {[-10,-5,0,5,10].map((yt) => (
            <g key={`gy-${yt}`}>
              <line x1={sx(0)-4} y1={sy(yt)} x2={sx(0)+4} y2={sy(yt)} stroke="#94a3b8" />
              <text x={sx(0)-6} y={sy(yt)+3} fontSize={10} textAnchor="end" fill="#475569">{yt}</text>
            </g>
          ))}
          <path d={path} fill="none" stroke="#0ea5e9" strokeWidth={2} />
        </svg>
      </div>
      <div className="mt-2 text-xs text-gray-700">Symmetry: {symmetry}</div>
    </div>
  );
}

// --- 5) Function Galaxy (animated neon function canvas) ---
function FunctionGalaxy() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fn, setFn] = useState<'sin'|'cos'|'quad'|'abs'|'inv'>('sin');
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    const W = canvas.width = canvas.clientWidth * devicePixelRatio;
    const H = canvas.height = 220 * devicePixelRatio;
    ctx.setTransform(1,0,0,1,0,0);

    const draw = () => {
      t += 0.02;
      ctx.clearRect(0,0,W,H);
      // dark background with gradient
      const g = ctx.createLinearGradient(0,0,W,0);
      g.addColorStop(0,'#0f172a');
      g.addColorStop(1,'#1e293b');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,W,H);

      // axes
      ctx.strokeStyle = 'rgba(148,163,184,0.5)';
      ctx.beginPath();
      ctx.moveTo(0,H/2); ctx.lineTo(W,H/2);
      ctx.moveTo(W/2,0); ctx.lineTo(W/2,H);
      ctx.stroke();

      // numeric ticks (world scale ~ 1 unit = 40 px)
      const scale = 40 * devicePixelRatio;
      const worldMinX = -W/2 / scale;
      const worldMaxX =  W/2 / scale;
      const worldMinY = -H/2 / scale;
      const worldMaxY =  H/2 / scale;
      ctx.fillStyle = 'rgba(148,163,184,0.9)';
      ctx.font = `${10 * devicePixelRatio}px system-ui`;

      // x ticks every 2 units
      for (let xw = Math.ceil(worldMinX/2)*2; xw <= worldMaxX; xw += 2) {
        const X = W/2 + xw * scale;
        ctx.strokeStyle = 'rgba(148,163,184,0.4)';
        ctx.beginPath(); ctx.moveTo(X, H/2 - 4); ctx.lineTo(X, H/2 + 4); ctx.stroke();
        ctx.fillText(String(xw), X - 6 * devicePixelRatio, H/2 + 14 * devicePixelRatio);
      }
      // y ticks every 1 unit
      for (let yw = Math.ceil(worldMinY); yw <= worldMaxY; yw += 1) {
        const Y = H/2 - yw * scale;
        ctx.strokeStyle = 'rgba(148,163,184,0.4)';
        ctx.beginPath(); ctx.moveTo(W/2 - 4, Y); ctx.lineTo(W/2 + 4, Y); ctx.stroke();
        ctx.fillText(String(yw), W/2 - 14 * devicePixelRatio, Y + 3 * devicePixelRatio);
      }

      // animate glow
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3 * devicePixelRatio;
      ctx.strokeStyle = '#22d3ee';
      ctx.beginPath();

      for (let x = -W/2; x <= W/2; x += 2) {
        const X = x + W/2;
        const xv = x / 40 / devicePixelRatio; // scale
        let yv = 0;
        if (fn === 'sin') yv = a * Math.sin(b * xv + t);
        if (fn === 'cos') yv = a * Math.cos(b * xv + t);
        if (fn === 'quad') yv = (a * xv * xv + b * xv) / 3;
        if (fn === 'abs') yv = a * Math.abs(xv);
        if (fn === 'inv') yv = xv !== 0 ? a / xv : 0;
        const Y = H/2 - yv * 40 * devicePixelRatio;
        if (x === -W/2) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      ctx.stroke();

      // stars
      ctx.shadowBlur = 0;
      for (let i = 0; i < 30; i++) {
        const sx = (i * 97 + t * 120) % W;
        const sy = (i * 53 + Math.sin(t + i) * 20 + H/2) % H;
        ctx.fillStyle = i % 2 ? '#a78bfa' : '#f472b6';
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [fn, a, b]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-900">Function Galaxy — Neon Animation</div>
        <div className="flex items-center gap-2 text-xs">
          <select value={fn} onChange={e=>setFn(e.target.value as any)} className="rounded-md border border-gray-300 px-2 py-1">
            <option value="sin">y = a·sin(bx)</option>
            <option value="cos">y = a·cos(bx)</option>
            <option value="quad">y = ax² + bx</option>
            <option value="abs">y = a|x|</option>
            <option value="inv">y = a/x</option>
          </select>
          <label>a</label>
          <input type="range" min={0.5} max={3} step={0.1} value={a} onChange={e=>setA(parseFloat(e.target.value))} />
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">{a.toFixed(2)}</span>
          <label>b</label>
          <input type="range" min={0.5} max={3} step={0.1} value={b} onChange={e=>setB(parseFloat(e.target.value))} />
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">{b.toFixed(2)}</span>
        </div>
      </div>
      <div className="mt-3">
        <canvas ref={canvasRef} className="w-full h-[220px] rounded-md" />
      </div>
    </div>
  );
}

// --- 6) Isometric surface (2.5D) ---
function IsometricSurface() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(1);
  const [c, setC] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const W = canvas.width = canvas.clientWidth * devicePixelRatio;
    const H = canvas.height = 260 * devicePixelRatio;

    const draw = () => {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0,0,W,H);
      // axes in iso
      const origin = { x: W/2, y: H/2 + 40 };
      const scale = 18 * devicePixelRatio;
      const iso = (x:number, y:number, z:number) => ({
        x: origin.x + (x - y) * scale,
        y: origin.y - (x + y) * scale * 0.5 - z * scale
      });
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      // grid
      for (let gx = -5; gx <= 5; gx++) {
        const p1 = iso(gx, -5, 0), p2 = iso(gx, 5, 0);
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      }
      for (let gy = -5; gy <= 5; gy++) {
        const p1 = iso(-5, gy, 0), p2 = iso(5, gy, 0);
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke();

      // tick numbers along edges
      ctx.fillStyle = '#475569';
      ctx.font = `${11 * devicePixelRatio}px system-ui`;
      for (let gx = -5; gx <= 5; gx++) {
        const pt = iso(gx, -5, 0);
        ctx.fillText(String(gx), pt.x - 3 * devicePixelRatio, pt.y + 14 * devicePixelRatio);
      }
      for (let gy = -5; gy <= 5; gy++) {
        const pt = iso(-5, gy, 0);
        ctx.fillText(String(gy), pt.x - 16 * devicePixelRatio, pt.y + 4 * devicePixelRatio);
      }

      // surface z = a x^2 + b y + c
      ctx.fillStyle = 'rgba(59,130,246,0.35)';
      for (let x = -5; x < 5; x += 0.5) {
        for (let y = -5; y < 5; y += 0.5) {
          const z = a * x * x + b * y + c;
          const p = iso(x, y, z / 6);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2 * devicePixelRatio, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // label
      ctx.fillStyle = '#0f172a';
      ctx.font = `${12 * devicePixelRatio}px system-ui`;
      ctx.fillText(`z = ${a.toFixed(1)}x² + ${b.toFixed(1)}y + ${c.toFixed(1)}`, 12, 20);
    };
    draw();
  }, [a,b,c]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-900">Isometric Surface — z = ax² + by + c</div>
        <div className="flex items-center gap-2 text-xs">
          <label>a</label>
          <input type="range" min={-1} max={2} step={0.1} value={a} onChange={e=>setA(parseFloat(e.target.value))} />
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">{a.toFixed(1)}</span>
          <label>b</label>
          <input type="range" min={-2} max={2} step={0.1} value={b} onChange={e=>setB(parseFloat(e.target.value))} />
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">{b.toFixed(1)}</span>
          <label>c</label>
          <input type="range" min={-2} max={2} step={0.1} value={c} onChange={e=>setC(parseFloat(e.target.value))} />
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">{c.toFixed(1)}</span>
        </div>
      </div>
      <div className="mt-3">
        <canvas ref={canvasRef} className="w-full h-[260px] rounded-md" />
      </div>
    </div>
  );
}


