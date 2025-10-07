import { useMemo, useState } from 'react';

// Small interactive to visualize a 2x2 matrix as a plane transformation
// - Shows unit square mapped to a parallelogram
// - Columns of A are the images of basis vectors e1 and e2
// - Area scale = |det(A)|, sign via orientation arrow
export function MatrixTransformMini() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  const [d, setD] = useState(1);

  const det = a * d - b * c;

  // SVG helpers
  const width = 320;
  const height = 220;
  const pad = 24;
  const xMin = -4, xMax = 4;
  const yMin = -3, yMax = 3;
  const sx = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (width - 2 * pad);
  const sy = (y: number) => height - (pad + ((y - yMin) / (yMax - yMin)) * (height - 2 * pad));

  const e1 = { x: 1, y: 0 };
  const e2 = { x: 0, y: 1 };
  const Ae1 = { x: a * e1.x + b * e1.y, y: c * e1.x + d * e1.y };
  const Ae2 = { x: a * e2.x + b * e2.y, y: c * e2.x + d * e2.y };

  const poly = useMemo(() => {
    // unit square (0,0)->(1,0)->(1,1)->(0,1)
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 1, y: 0 };
    const p2 = { x: 1, y: 1 };
    const p3 = { x: 0, y: 1 };
    const T = (p: {x:number;y:number}) => ({ x: a * p.x + b * p.y, y: c * p.x + d * p.y });
    const q0 = T(p0), q1 = T(p1), q2 = T(p2), q3 = T(p3);
    return [q0, q1, q2, q3];
  }, [a, b, c, d]);

  const polyPoints = poly.map(p => `${sx(p.x)},${sy(p.y)}`).join(' ');

  const setPreset = (name: 'identity' | 'scale' | 'shear' | 'rotate') => {
    if (name === 'identity') { setA(1); setB(0); setC(0); setD(1); }
    if (name === 'scale')    { setA(1.5); setB(0); setC(0); setD(0.7); }
    if (name === 'shear')    { setA(1); setB(0.8); setC(0); setD(1); }
    if (name === 'rotate')   { const t = Math.PI/6; setA(Math.cos(t)); setB(-Math.sin(t)); setC(Math.sin(t)); setD(Math.cos(t)); }
  };

  const typeBadges = useMemo(() => {
    const tags: string[] = [];
    if (a === 0 && b === 0 && c === 0 && d === 0) tags.push('Zero');
    if (b === 0 && c === 0 && a !== 0 && d !== 0) tags.push('Diagonal');
    if (a === 1 && b === 0 && c === 0 && d === 1) tags.push('Identity');
    if (a === d && b === 0 && c === 0) tags.push('Scalar');
    if (a === d && b === 0 && c === 0 && a === 1) tags.push('Unit');
    return tags;
  }, [a, b, c, d]);

  return (
    <div className="w-full space-y-3">
      {/* Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2"><label>a</label><input type="range" min={-3} max={3} step={0.1} value={a} onChange={e => setA(parseFloat(e.target.value))} className="w-24" /><span className="w-10 text-center">{a.toFixed(1)}</span></div>
        <div className="flex items-center gap-2"><label>b</label><input type="range" min={-3} max={3} step={0.1} value={b} onChange={e => setB(parseFloat(e.target.value))} className="w-24" /><span className="w-10 text-center">{b.toFixed(1)}</span></div>
        <div className="flex items-center gap-2"><label>c</label><input type="range" min={-3} max={3} step={0.1} value={c} onChange={e => setC(parseFloat(e.target.value))} className="w-24" /><span className="w-10 text-center">{c.toFixed(1)}</span></div>
        <div className="flex items-center gap-2"><label>d</label><input type="range" min={-3} max={3} step={0.1} value={d} onChange={e => setD(parseFloat(e.target.value))} className="w-24" /><span className="w-10 text-center">{d.toFixed(1)}</span></div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <button onClick={() => setPreset('identity')} className="px-2 py-1 rounded-md border hover:bg-muted">Identity</button>
        <button onClick={() => setPreset('scale')} className="px-2 py-1 rounded-md border hover:bg-muted">Scale</button>
        <button onClick={() => setPreset('shear')} className="px-2 py-1 rounded-md border hover:bg-muted">Shear</button>
        <button onClick={() => setPreset('rotate')} className="px-2 py-1 rounded-md border hover:bg-muted">Rotate 30°</button>
        <div className="mx-2 h-5 w-px bg-border" />
        <div className="text-muted-foreground">det(A) = <span className={`font-semibold ${Math.abs(det) < 1e-6 ? 'text-destructive' : 'text-primary'}`}>{det.toFixed(2)}</span></div>
        {Math.abs(det) < 1e-6 && (
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] border border-red-300">Singular (no inverse)</span>
        )}
        {typeBadges.length > 0 && (
          <div className="flex gap-1">{typeBadges.map((t, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] border border-emerald-300">{t}</span>
          ))}</div>
        )}
      </div>

      {/* Canvas */}
      <div className="w-full flex justify-center">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="rounded-md bg-white/70 shadow-sm">
          {/* Grid */}
          <g opacity={0.25}>
            {Array.from({ length: 17 }, (_, i) => i - 8).map(x => (
              <line key={`gx${x}`} x1={sx(x)} y1={sy(yMin)} x2={sx(x)} y2={sy(yMax)} stroke="#0f172a" strokeWidth={0.5} />
            ))}
            {Array.from({ length: 13 }, (_, i) => i - 6).map(y => (
              <line key={`gy${y}`} x1={sx(xMin)} y1={sy(y)} x2={sx(xMax)} y2={sy(y)} stroke="#0f172a" strokeWidth={0.5} />
            ))}
          </g>

          {/* Axes */}
          <line x1={sx(xMin)} y1={sy(0)} x2={sx(xMax)} y2={sy(0)} stroke="#0f172a" strokeWidth={1} />
          <line x1={sx(0)} y1={sy(yMin)} x2={sx(0)} y2={sy(yMax)} stroke="#0f172a" strokeWidth={1} />

          {/* Unit square */}
          <polygon points={`${sx(0)},${sy(0)} ${sx(1)},${sy(0)} ${sx(1)},${sy(1)} ${sx(0)},${sy(1)}`} fill="rgba(59,130,246,0.15)" stroke="#3b82f6" />

          {/* Transformed square/parallelogram */}
          <polygon points={polyPoints} fill="rgba(16,185,129,0.18)" stroke="#10b981" className="transition-all duration-300" />

          {/* Basis vectors */}
          <g>
            <line x1={sx(0)} y1={sy(0)} x2={sx(e1.x)} y2={sy(e1.y)} stroke="#3b82f6" strokeWidth={2} />
            <line x1={sx(0)} y1={sy(0)} x2={sx(e2.x)} y2={sy(e2.y)} stroke="#3b82f6" strokeWidth={2} />
            <circle cx={sx(e1.x)} cy={sy(e1.y)} r={3} fill="#3b82f6" />
            <circle cx={sx(e2.x)} cy={sy(e2.y)} r={3} fill="#3b82f6" />
          </g>

          {/* Transformed basis vectors (columns of A) */}
          <g>
            <line x1={sx(0)} y1={sy(0)} x2={sx(Ae1.x)} y2={sy(Ae1.y)} stroke="#10b981" strokeWidth={2} />
            <line x1={sx(0)} y1={sy(0)} x2={sx(Ae2.x)} y2={sy(Ae2.y)} stroke="#10b981" strokeWidth={2} />
            <circle cx={sx(Ae1.x)} cy={sy(Ae1.y)} r={3} fill="#10b981" />
            <circle cx={sx(Ae2.x)} cy={sy(Ae2.y)} r={3} fill="#10b981" />
            <text x={sx(Ae1.x)+6} y={sy(Ae1.y)-6} fontSize={10} fill="#10b981">col1</text>
            <text x={sx(Ae2.x)+6} y={sy(Ae2.y)-6} fontSize={10} fill="#10b981">col2</text>
          </g>

          {/* Orientation arrow to show sign of det */}
          <g opacity={0.9}>
            <path d={`M ${sx(0)} ${sy(0)} L ${sx(Ae1.x)} ${sy(Ae1.y)} L ${sx(Ae2.x)} ${sy(Ae2.y)}`} fill="none" stroke={det >= 0 ? '#10b981' : '#ef4444'} strokeDasharray="4 4" />
            <text x={sx(xMax)-60} y={sy(yMax)+12} fontSize={10} fill={det >= 0 ? '#10b981' : '#ef4444'}>
              {det >= 0 ? 'orientation + (det>0)' : 'orientation − (det<0)'}
            </text>
          </g>
        </svg>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        Columns of A are the images of e1 and e2. Parallelogram area = |det(A)|.
      </div>
    </div>
  );
}

export default MatrixTransformMini;
