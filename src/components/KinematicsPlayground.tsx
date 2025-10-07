import React, { useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type PathPoint = { t: number; x: number; y: number; vx: number; vy: number };

// Kinematics Playground — projectile + 1D motion visuals (Gen‑Z friendly)
export default function KinematicsPlayground() {
  // Projectile controls
  const [u, setU] = useState<number>(20);
  const [angle, setAngle] = useState<number>(45);
  const [g, setG] = useState<number>(9.8);
  const [dt, setDt] = useState<number>(0.02);
  const [scale, setScale] = useState<number>(6);
  const [trail, setTrail] = useState<boolean>(true);
  const [playing, setPlaying] = useState<boolean>(false);
  const [showVectors, setShowVectors] = useState<boolean>(true);

  // 1D Motion controls
  const [u1d, setU1d] = useState<number>(0);
  const [a1d, setA1d] = useState<number>(2);

  // Simulation state
  const [time, setTime] = useState<number>(0);
  const [path, setPath] = useState<PathPoint[]>([]);
  const rafRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Derived projectile params
  const rad = (angle * Math.PI) / 180;
  const ux = u * Math.cos(rad);
  const uy = u * Math.sin(rad);
  const flightTime = (2 * uy) / g;
  const range = ux * flightTime;
  const maxHeight = (uy * uy) / (2 * g);

  useEffect(() => {
    resetSim();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [u, angle, g, scale]);

  function resetSim(): void {
    setTime(0);
    setPath([]);
    setPlaying(false);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function stepSim(t: number): void {
    setTime(t);
    const x = ux * t;
    const y = uy * t - 0.5 * g * t * t;
    setPath(prev => {
      const next: PathPoint[] = [...prev, { t: parseFloat(t.toFixed(3)), x, y, vx: ux, vy: uy - g * t }];
      return next;
    });
    if (y <= 0 && t > 0) {
      setPlaying(false);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    rafRef.current = requestAnimationFrame(() => stepSim(Number((t + dt).toFixed(4))));
  }

  function playPause(): void {
    if (playing) {
      setPlaying(false);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    } else {
      setPlaying(true);
      rafRef.current = requestAnimationFrame(() => stepSim(Number(time.toFixed(4))));
    }
  }

  // Data for 1D motion plots
  const data1d = Array.from({ length: 101 }, (_, i) => {
    const t = i * 0.1;
    const v = u1d + a1d * t;
    const s = u1d * t + 0.5 * a1d * t * t;
    return { t: Number(t.toFixed(2)), v: Number(v.toFixed(2)), s: Number(s.toFixed(2)) };
  });

  // Canvas sizing (doubled height)
  const CANVAS_W = 700;
  const CANVAS_H = 450; // taller than original but not too large
  const GROUND_Y = CANVAS_H - 20;

  // World meters → SVG px
  function toPx(x: number, y: number): { px: number; py: number } {
    const px = x * scale + 20;
    const py = Math.max(0, GROUND_Y - y * scale);
    return { px, py };
  }

  function Arrow({ x1, y1, x2, y2, color = 'orange' }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) return null as unknown as JSX.Element;
    const ux_ = dx / len;
    const uy_ = dy / len;
    const head = 8;
    const hx = x2 - head * (ux_ + 0.3 * uy_);
    const hy = y2 - head * (uy_ - 0.3 * ux_);
    const hx2 = x2 - head * (ux_ - 0.3 * uy_);
    const hy2 = y2 - head * (uy_ + 0.3 * ux_);
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <polygon points={`${x2},${y2} ${hx},${hy} ${hx2},${hy2}`} fill={color} />
      </g>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">Kinematics Playground — Interactive Visuals</h2>
      <p className="text-sm text-gray-600 mb-4">Play with controls. Visualize projectile motion and 1D motion. Built for fast beginner learning.</p>

      <div className="flex flex-col gap-4">
        {/* Left: Simulator */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-medium">Projectile Simulator</h3>

          <div className="flex flex-col gap-2 mt-3">
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm">Initial speed u (m/s)</span>
              <input type="range" min={0} max={60} value={u} onChange={e => setU(Number(e.target.value))} />
              <span className="w-12 text-right">{u} m/s</span>
            </label>

            <label className="flex items-center justify-between gap-4">
              <span className="text-sm">Angle θ (deg)</span>
              <input type="range" min={0} max={90} value={angle} onChange={e => setAngle(Number(e.target.value))} />
              <span className="w-12 text-right">{angle}°</span>
            </label>

            <label className="flex items-center justify-between gap-4">
              <span className="text-sm">Gravity g (m/s²)</span>
              <input type="range" min={1} max={20} value={g} onChange={e => setG(Number(e.target.value))} />
              <span className="w-12 text-right">{g.toFixed(1)}</span>
            </label>

            <label className="flex items-center justify-between gap-4">
              <span className="text-sm">Scale (px per meter)</span>
              <input type="range" min={2} max={20} value={scale} onChange={e => setScale(Number(e.target.value))} />
              <span className="w-12 text-right">{scale}</span>
            </label>

            <div className="flex gap-2 mt-2">
              <button onClick={playPause} className="px-3 py-1 bg-indigo-600 text-white rounded">{playing ? 'Pause' : 'Play'}</button>
              <button onClick={() => { resetSim(); setPlaying(true); rafRef.current = requestAnimationFrame(() => stepSim(0)); }} className="px-3 py-1 bg-green-600 text-white rounded">Play from 0</button>
              <button onClick={resetSim} className="px-3 py-1 bg-red-500 text-white rounded">Reset</button>
              <label className="ml-auto flex items-center gap-2"><input type="checkbox" checked={trail} onChange={e => setTrail(e.target.checked)} />Trail</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={showVectors} onChange={e => setShowVectors(e.target.checked)} />Vectors</label>
            </div>

            <div className="mt-2 text-xs text-gray-700 grid grid-cols-2 gap-2">
              <div>Time: {time.toFixed(2)} s</div>
              <div>Range ≈ {range.toFixed(2)} m</div>
              <div>Flight ≈ {flightTime.toFixed(2)} s</div>
              <div>Max height ≈ {maxHeight.toFixed(2)} m</div>
            </div>
          </div>

          <div className="mt-4 bg-gray-100 rounded p-2">
            <svg ref={svgRef} width="100%" height={CANVAS_H} viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} className="border rounded bg-white">
              {/* ground line */}
              <line x1={0} y1={GROUND_Y} x2={CANVAS_W} y2={GROUND_Y} stroke="#999" strokeWidth={1} />

              {/* axes ticks showing meters */}
              {Array.from({ length: 21 }, (_, i) => (
                <g key={i}>
                  <line x1={20 + i * 30} y1={GROUND_Y} x2={20 + i * 30} y2={GROUND_Y + 5} stroke="#bbb" />
                  <text x={20 + i * 30} y={GROUND_Y + 18} fontSize="9" textAnchor="middle">{(i * (10 / scale)).toFixed(0)}</text>
                </g>
              ))}

              {/* trail path */}
              {trail && path.map((p, idx) => {
                const { px, py } = toPx(p.x, Math.max(0, p.y));
                return <circle key={idx} cx={px} cy={py} r={1.5} fill="#1f6feb" />;
              })}

              {/* projectile */}
              {(() => {
                const last = path[path.length - 1] || { x: 0, y: 0, vx: ux, vy: uy };
                const { px, py } = toPx(last.x, Math.max(0, last.y));
                return (
                  <g>
                    {showVectors && (
                      <>
                        <Arrow x1={px} y1={py} x2={px + last.vx * 5} y2={py - last.vy * 5} color="#ff8c00" />
                        <line x1={px} y1={py} x2={px + last.vx * 5} y2={py} stroke="#0aa" strokeWidth={2} />
                        <line x1={px} y1={py} x2={px} y2={py - last.vy * 5} stroke="#a00" strokeWidth={2} />
                      </>
                    )}

                    <circle cx={px} cy={py} r={8} fill="#ef4444" stroke="#333" />
                    <text x={px + 12} y={py - 10} fontSize={12}>Projectile</text>
                  </g>
                );
              })()}

            </svg>
          </div>

          {/* Quick presets under graph */}
          <div className="mt-6">
            <h4 className="font-medium mb-2">Quick Interactive Exercises (Beginner)</h4>
            <div className="grid sm:grid-cols-2 gap-2">
              <button onClick={() => { setU(20); setAngle(45); setG(9.8); resetSim(); setPlaying(true); rafRef.current = requestAnimationFrame(() => stepSim(0)); }} className="p-2 bg-indigo-50 rounded">45° Throw 20 m/s</button>
              <button onClick={() => { setU(30); setAngle(30); setG(9.8); resetSim(); setPlaying(true); rafRef.current = requestAnimationFrame(() => stepSim(0)); }} className="p-2 bg-indigo-50 rounded">30° Throw 30 m/s</button>
              <button onClick={() => { setU(10); setAngle(80); setG(9.8); resetSim(); setPlaying(true); rafRef.current = requestAnimationFrame(() => stepSim(0)); }} className="p-2 bg-indigo-50 rounded">High angle slow speed</button>
              <button onClick={() => { setU(40); setAngle(10); setG(9.8); resetSim(); setPlaying(true); rafRef.current = requestAnimationFrame(() => stepSim(0)); }} className="p-2 bg-indigo-50 rounded">Low angle fast speed</button>
            </div>
            <p className="mt-2 text-xs text-gray-600">Use these to test intuition. Play, pause, change scale and vectors. Try to predict range before playing.</p>
          </div>
        </div>

        {/* 1D motion & plots */}
      </div>

      <div className="bg-white rounded-lg p-4 shadow mt-6">
          <h3 className="font-medium">1D Motion Visualizer</h3>
          <div className="mt-3 flex flex-col gap-2">
            <label className="flex items-center justify-between">
              <span>Initial velocity u (m/s)</span>
              <input type="range" min={-20} max={20} value={u1d} onChange={e => setU1d(Number(e.target.value))} />
              <span className="w-12 text-right">{u1d}</span>
            </label>
            <label className="flex items-center justify-between">
              <span>Acceleration a (m/s²)</span>
              <input type="range" min={-10} max={10} value={a1d} onChange={e => setA1d(Number(e.target.value))} />
              <span className="w-12 text-right">{a1d}</span>
            </label>

            <div className="mt-2 text-sm text-gray-700">Equation: s(t) = u t + ½ a t². v(t) = u + a t</div>

            <div className="mt-3 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data1d} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" label={{ value: 't (s)', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis yAxisId="left" label={{ value: 's (m)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'v (m/s)', angle: -90, position: 'insideRight' }} />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="s" stroke="#8884d8" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="v" stroke="#82ca9d" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">At t=2s: v={(u1d + a1d*2).toFixed(2)} m/s</div>
              <div className="bg-gray-50 p-2 rounded">s={(u1d*2 + 0.5*a1d*4).toFixed(2)} m</div>
            </div>

            <div className="mt-3 text-sm">
              <strong>Tips for beginners:</strong>
              <ul className="list-disc ml-5 mt-1 text-xs text-gray-700">
                <li>Use the projectile simulator to link formulas to the animation.</li>
                <li>Change gravity to see how the curve flattens or sharpens.</li>
                <li>Toggle vectors to understand velocity components in real time.</li>
              </ul>
            </div>
          </div>
        </div>

    </div>
  );
}


