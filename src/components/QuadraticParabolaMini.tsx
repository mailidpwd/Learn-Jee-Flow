import { useMemo, useState } from 'react';

export function QuadraticParabolaMini() {
  const width = 320;
  const height = 220;
  const pad = 24;
  const xMin = -6, xMax = 6;
  const yMin = -6, yMax = 6;
  const sx = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (width - 2 * pad);
  const sy = (y: number) => height - (pad + ((y - yMin) / (yMax - yMin)) * (height - 2 * pad));

  // Interactive coefficients (start with y = x^2 + x - 2)
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [c, setC] = useState(-2);

  const D = b * b - 4 * a * c; // discriminant
  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;
  const hasFiniteVertex = Number.isFinite(vertexX) && Number.isFinite(vertexY);
  const roots = D >= 0 && a !== 0 ? [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)] : [];

  const pathD = useMemo(() => {
    const pts: string[] = [];
    for (let x = xMin; x <= xMax; x += 0.15) {
      const y = a * x * x + b * x + c;
      const X = sx(x);
      const Y = sy(y);
      pts.push(`${pts.length ? 'L' : 'M'}${X.toFixed(2)},${Y.toFixed(2)}`);
    }
    return pts.join(' ');
  }, [a, b, c]);

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-muted-foreground">y = ax² + bx + c</span>
        <label>a</label>
        <input type="range" min={-2} max={2} step={0.1} value={a} onChange={e => setA(parseFloat(e.target.value))} className="w-28" />
        <span className="w-10 text-center">{a.toFixed(1)}</span>
        <label>b</label>
        <input type="range" min={-5} max={5} step={0.1} value={b} onChange={e => setB(parseFloat(e.target.value))} className="w-28" />
        <span className="w-10 text-center">{b.toFixed(1)}</span>
        <label>c</label>
        <input type="range" min={-5} max={5} step={0.1} value={c} onChange={e => setC(parseFloat(e.target.value))} className="w-28" />
        <span className="w-10 text-center">{c.toFixed(1)}</span>
      </div>
      <div className="w-full flex justify-center">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="rounded-md bg-white/70 shadow-sm">
          {/* Axes */}
          <line x1={sx(xMin)} y1={sy(0)} x2={sx(xMax)} y2={sy(0)} stroke="#0f172a" strokeWidth={1} />
          <line x1={sx(0)} y1={sy(yMin)} x2={sx(0)} y2={sy(yMax)} stroke="#0f172a" strokeWidth={1} />

          {/* Parabola */}
          <path d={pathD} fill="none" stroke="#16a34a" strokeWidth={2} />

          {/* Vertex */}
          {hasFiniteVertex && (
            <>
              <circle cx={sx(vertexX)} cy={sy(vertexY)} r={4} fill="#f59e0b" />
              <text x={sx(vertexX) + 6} y={sy(vertexY) - 6} fontSize={10} fill="#f59e0b">vertex</text>
            </>
          )}

          {/* Roots (only if real) */}
          {roots.length === 2 ? (
            <g>
              <circle cx={sx(roots[0])} cy={sy(0)} r={4} fill="#dc2626" />
              <circle cx={sx(roots[1])} cy={sy(0)} r={4} fill="#dc2626" />
            </g>
          ) : (
            <text x={sx(xMin) + 6} y={sy(0) - 8} fontSize={10} fill="#dc2626">No real roots (D{'<'}0)</text>
          )}

          {/* Labels */}
          <text x={sx(xMax) - 10} y={sy(0) - 6} fontSize={10} fill="#0f172a">x</text>
          <text x={sx(0) + 6} y={sy(yMax) + 12} fontSize={10} fill="#0f172a">y</text>
        </svg>
      </div>
      <div className="text-xs text-muted-foreground text-center">D = b² − 4ac = {D.toFixed(2)}{roots.length === 2 ? ` , roots ≈ ${roots[0].toFixed(2)}, ${roots[1].toFixed(2)}` : ''}</div>
    </div>
  );
}
