import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

type PathPoint = { t: number; x: number; y: number; vx: number; vy: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function Arrow2D({ x1, y1, x2, y2, color = '#22c55e' }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len === 0) return null as unknown as JSX.Element;
  const ux = dx / len;
  const uy = dy / len;
  const head = 8;
  const hx = x2 - head * (ux + 0.3 * uy);
  const hy = y2 - head * (uy - 0.3 * ux);
  const hx2 = x2 - head * (ux - 0.3 * uy);
  const hy2 = y2 - head * (uy + 0.3 * ux);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx},${hy} ${hx2},${hy2}`} fill={color} />
    </g>
  );
}

function UCMotion({ radius, speed, playing, showVel, showAcc }: { radius: number; speed: number; playing: boolean; showVel: boolean; showAcc: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  const arrow = useMemo(() => new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0x10b981), []);
  const vArrow = useMemo(() => new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0x2563eb), []);
  const thetaRef = useRef(0);
  useFrame((_, dt) => {
    if (!playing) return;
    const r = Math.max(0.1, radius);
    const v = Math.max(0, speed);
    const omega = r > 0 ? v / r : 0;
    thetaRef.current += omega * dt;
    const x = r * Math.cos(thetaRef.current);
    const y = r * Math.sin(thetaRef.current);
    if (ref.current) {
      ref.current.position.set(x, y, 0);
    }
    // centripetal acceleration vector points to center
    const ax = -v * v * Math.cos(thetaRef.current) / r;
    const ay = -v * v * Math.sin(thetaRef.current) / r;
    const len = Math.hypot(ax, ay);
    const dir = new THREE.Vector3(ax, ay, 0).normalize();
    arrow.setDirection(dir);
    arrow.setLength(Math.min(2, len));
    arrow.position.set(x, y, 0);
    // velocity arrow tangent
    const vx = -v * Math.sin(thetaRef.current);
    const vy =  v * Math.cos(thetaRef.current);
    const vDir = new THREE.Vector3(vx, vy, 0).normalize();
    vArrow.setDirection(vDir);
    vArrow.setLength(Math.min(2, Math.hypot(vx, vy)));
    vArrow.position.set(x, y, 0);
  });
  return (
    <group>
      {/* orbit circle */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.max(0.01, radius - 0.01), radius + 0.01, 64]} />
        <meshBasicMaterial color="#94a3b8" side={2} />
      </mesh>
      {/* mover */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.08, 24, 24]} />
        <meshStandardMaterial color="#f43f5e" />
      </mesh>
      {/* centripetal acceleration arrow */}
      {showAcc && <primitive object={arrow} />}
      {showVel && <primitive object={vArrow} />}
    </group>
  );
}

export default function KinematicsIntermediatePlayground() {
  // Projectile controls (intermediate: finer step + drag toggle)
  const [u, setU] = useState<number>(30);
  const [angle, setAngle] = useState<number>(45);
  const [g, setG] = useState<number>(9.8);
  const [dragK, setDragK] = useState<number>(0); // simple linear drag coefficient
  const [scale, setScale] = useState<number>(8);
  const [autoFit, setAutoFit] = useState<boolean>(true);
  const [dt, setDt] = useState<number>(0.016);
  const [playing, setPlaying] = useState<boolean>(false);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [trail, setTrail] = useState<boolean>(true);
  const [time, setTime] = useState<number>(0);
  const [path, setPath] = useState<PathPoint[]>([]);
  const rafRef = useRef<number | null>(null);

  // Derived params
  const rad = useMemo(() => (angle * Math.PI) / 180, [angle]);
  const ux0 = useMemo(() => u * Math.cos(rad), [u, rad]);
  const uy0 = useMemo(() => u * Math.sin(rad), [u, rad]);

  useEffect(() => {
    resetSim();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [u, angle, g, dragK, scale]);

  function resetSim(): void {
    setTime(0);
    setPath([]);
    setPlaying(false);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function stepSim(t: number, last: PathPoint | null): void {
    // Semi-implicit Euler integration with optional linear drag
    let vx = last ? last.vx : ux0;
    let vy = last ? last.vy : uy0;
    const ax = -dragK * vx;
    const ay = -g - dragK * vy;
    vx += ax * dt;
    vy += ay * dt;
    const x = (last ? last.x : 0) + vx * dt;
    const y = (last ? last.y : 0) + vy * dt;

    const point: PathPoint = { t: Number(t.toFixed(3)), x, y, vx, vy };
    setTime(point.t);
    setPath(prev => [...prev, point]);
    if (y <= 0 && t > 0.02) {
      setPlaying(false);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    const nextT = Number((t + dt).toFixed(4));
    rafRef.current = requestAnimationFrame(() => stepSim(nextT, point));
  }

  function playFromZero(): void {
    resetSim();
    setPlaying(true);
    rafRef.current = requestAnimationFrame(() => stepSim(0, null));
  }

  function playPause(): void {
    if (playing) {
      setPlaying(false);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    } else {
      setPlaying(true);
      const last = path[path.length - 1] || null;
      rafRef.current = requestAnimationFrame(() => stepSim(Number(time.toFixed(4)), last));
    }
  }

  useEffect(() => () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); }, []);

  // Metrics (estimated without drag)
  const flightNoDrag = useMemo(() => (2 * uy0) / g, [uy0, g]);
  const rangeNoDrag = useMemo(() => ux0 * flightNoDrag, [ux0, flightNoDrag]);
  const heightNoDrag = useMemo(() => (uy0 * uy0) / (2 * g), [uy0, g]);

  // auto-fit scale to keep path in view
  useEffect(() => {
    if (!autoFit) return;
    const marginX = 40; const marginY = 40;
    const targetW = CANVAS_W - marginX; const targetH = CANVAS_H - marginY;
    const targetScaleX = targetW / Math.max(1, rangeNoDrag + 2);
    const targetScaleY = targetH / Math.max(1, heightNoDrag + 2);
    const s = Math.max(4, Math.min(20, Math.floor(Math.min(targetScaleX, targetScaleY))));
    setScale(s);
  }, [autoFit, rangeNoDrag, heightNoDrag]);

  // 1D motion dataset for xt/vt/at quick glance using chosen u and g as reference
  const data1d = useMemo(() => {
    return Array.from({ length: 121 }, (_, i) => {
      const t = i * 0.05;
      const v = uy0 - g * t;
      const s = uy0 * t - 0.5 * g * t * t;
      const a = -g;
      return { t: Number(t.toFixed(2)), v: Number(v.toFixed(2)), s: Number(s.toFixed(2)), a: Number(a.toFixed(2)) };
    });
  }, [uy0, g]);

  // Range vs angle dataset (no drag)
  const rangeVsTheta = useMemo(() => {
    return Array.from({ length: 91 }, (_, i) => {
      const th = i; // degrees
      const r = (u * u * Math.sin((2 * th * Math.PI) / 180)) / g;
      return { theta: th, R: Number(r.toFixed(2)) };
    });
  }, [u, g]);

  const CANVAS_W = 720;
  const CANVAS_H = 420;
  const GROUND_Y = CANVAS_H - 24;

  function toPx(x: number, y: number): { px: number; py: number } {
    const px = 24 + x * scale;
    const py = Math.max(0, GROUND_Y - y * scale);
    return { px, py };
  }

  // UCM controls
  const [radius, setRadius] = useState<number>(1.5);
  const [speed, setSpeed] = useState<number>(2);
  const [ucmPlaying, setUcmPlaying] = useState<boolean>(true);
  const [showUcmV, setShowUcmV] = useState<boolean>(true);
  const [showUcmA, setShowUcmA] = useState<boolean>(true);

  // Relative velocity (vector diagram)
  const [vAx, setVAx] = useState<number>(5);
  const [vAy, setVAy] = useState<number>(0);
  const [vBx, setVBx] = useState<number>(-2);
  const [vBy, setVBy] = useState<number>(3);

  const vRx = vAx - vBx;
  const vRy = vAy - vBy;
  const vRmag = Math.hypot(vRx, vRy);
  const vRang = Math.atan2(vRy, vRx);

  // Boat–River / Plane–Wind Navigator
  const [riverU, setRiverU] = useState<number>(3); // m/s downstream (+y)
  const [boatU, setBoatU] = useState<number>(6); // m/s in still water
  const [heading, setHeading] = useState<number>(0); // degrees measured from +x across river
  const [width, setWidth] = useState<number>(120); // meters
  const headingRad = (heading * Math.PI) / 180;
  const groundVx = boatU * Math.cos(headingRad); // across
  const groundVy = boatU * Math.sin(headingRad) + riverU; // downstream
  const timeToCross = groundVx > 0 ? width / groundVx : Infinity;
  const drift = timeToCross === Infinity ? Infinity : groundVy * timeToCross;
  const noDriftHeading = boatU > Math.abs(riverU) ? (Math.asin(-riverU / boatU) * 180) / Math.PI : NaN; // aim upstream

  // Piecewise acceleration editor
  type Seg = { a: number; d: number };
  const [u0Piece, setU0Piece] = useState<number>(0);
  const [segments, setSegments] = useState<Seg[]>([
    { a: 2, d: 2 },
    { a: -1, d: 3 }
  ]);
  const totalT = segments.reduce((acc, s) => acc + s.d, 0);
  const pieceData = useMemo(() => {
    const data: { t: number; v: number; s: number; a: number }[] = [];
    let t = 0;
    let v = u0Piece;
    let s = 0;
    const localDt = 0.05;
    for (const seg of segments) {
      const steps = Math.max(1, Math.round(seg.d / localDt));
      for (let i = 0; i < steps; i++) {
        v += seg.a * localDt;
        s += v * localDt; // semi-implicit so area under v
        t += localDt;
        data.push({ t: Number(t.toFixed(2)), v: Number(v.toFixed(2)), s: Number(s.toFixed(2)), a: Number(seg.a.toFixed(2)) });
      }
    }
    return data;
  }, [segments, u0Piece]);

  return (
    <div className="space-y-6">
      {/* Layout: big two-column on desktop */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Left: Projectile Lab (SVG) */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold">Projectile Lab (with optional drag)</h3>
          <div className="mt-2 text-xs text-gray-600">Toggle vectors, play/pause, and compare with no-drag closed forms (range, time, height).</div>

          <div className="mt-3 flex flex-wrap gap-3 items-center">
            <label className="flex items-center gap-2" aria-label="Initial speed slider">
              <span className="text-sm">u</span>
              <input type="range" min={0} max={80} value={u} onChange={e => setU(Number(e.target.value))} />
              <span className="text-xs w-12 text-right">{u} m/s</span>
            </label>
            <label className="flex items-center gap-2" aria-label="Angle slider">
              <span className="text-sm">θ</span>
              <input type="range" min={0} max={90} value={angle} onChange={e => setAngle(Number(e.target.value))} />
              <span className="text-xs w-12 text-right">{angle}°</span>
            </label>
            <label className="flex items-center gap-2" aria-label="Gravity slider">
              <span className="text-sm">g</span>
              <input type="range" min={1} max={20} step={0.1} value={g} onChange={e => setG(Number(e.target.value))} />
              <span className="text-xs w-12 text-right">{g.toFixed(1)}</span>
            </label>
            <label className="flex items-center gap-2" aria-label="Drag slider">
              <span className="text-sm">drag</span>
              <input type="range" min={0} max={0.2} step={0.005} value={dragK} onChange={e => setDragK(Number(e.target.value))} />
              <span className="text-xs w-10 text-right">{dragK.toFixed(3)}</span>
            </label>
            <label className="flex items-center gap-2" aria-label="Scale slider">
              <span className="text-sm">scale</span>
              <input type="range" min={4} max={20} value={scale} onChange={e => setScale(Number(e.target.value))} />
              <span className="text-xs w-10 text-right">{scale}</span>
            </label>
            <div className="ml-auto flex gap-2">
              <button onClick={playPause} className="px-3 py-1 rounded bg-indigo-600 text-white">{playing ? 'Pause' : 'Play'}</button>
              <button onClick={playFromZero} className="px-3 py-1 rounded bg-emerald-600 text-white">Restart</button>
              <button onClick={resetSim} className="px-3 py-1 rounded bg-rose-500 text-white">Reset</button>
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={trail} onChange={e => setTrail(e.target.checked)} />Trail</label>
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={showVectors} onChange={e => setShowVectors(e.target.checked)} />Vectors</label>
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={autoFit} onChange={e => setAutoFit(e.target.checked)} />Auto‑fit</label>
            </div>
          </div>

          <div className="mt-3 bg-slate-50 rounded p-2">
            <svg role="img" aria-label="Projectile simulation" width="100%" height={CANVAS_H} viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} className="border rounded bg-white">
              {/* ground and grid */}
              <line x1={0} y1={GROUND_Y} x2={CANVAS_W} y2={GROUND_Y} stroke="#cbd5e1" />
              {Array.from({ length: 23 }, (_, i) => (
                <g key={i}>
                  <line x1={24 + i * 28} y1={GROUND_Y} x2={24 + i * 28} y2={GROUND_Y + 6} stroke="#cbd5e1" />
                  <text x={24 + i * 28} y={GROUND_Y + 20} fontSize={12} textAnchor="middle">{(i * (10 / scale)).toFixed(0)}</text>
                </g>
              ))}

              {/* trail */}
              {trail && path.map((p, idx) => {
                const { px, py } = toPx(p.x, Math.max(0, p.y));
                return <circle key={idx} cx={px} cy={py} r={1.6} fill="#0ea5e9" />;
              })}

              {/* projectile marker and vectors */}
              {(() => {
                const last = path[path.length - 1] || { x: 0, y: 0, vx: ux0, vy: uy0 };
                const raw = toPx(last.x, Math.max(0, last.y));
                const px = Math.max(0, Math.min(CANVAS_W, raw.px));
                const py = Math.max(0, Math.min(CANVAS_H, raw.py));
                return (
                  <g>
                    {showVectors && (
                      <>
                        <Arrow2D x1={px} y1={py} x2={px + last.vx * 5} y2={py - last.vy * 5} color="#f59e0b" />
                        <line x1={px} y1={py} x2={px + last.vx * 5} y2={py} stroke="#0ea5e9" strokeWidth={2} />
                        <line x1={px} y1={py} x2={px} y2={py - last.vy * 5} stroke="#ef4444" strokeWidth={2} />
                      </>
                    )}
                    <circle cx={px} cy={py} r={8} fill="#ef4444" stroke="#334155" />
                    <text x={px + 12} y={py - 10} fontSize={12}>z</text>
                    {/* off-screen indicator */}
                    {(raw.px !== px || raw.py !== py) && (
                      <text x={px - 4} y={py - 12} fontSize={12} fill="#334155">→ off‑view</text>
                    )}
                  </g>
                );
              })()}
            </svg>
          </div>

          <div className="mt-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-white border rounded p-2 text-base">t ≈ {flightNoDrag.toFixed(2)} s</div>
            <div className="bg-white border rounded p-2 text-base">R ≈ {rangeNoDrag.toFixed(2)} m</div>
            <div className="bg-white border rounded p-2 text-base">H ≈ {heightNoDrag.toFixed(2)} m</div>
            <div className="bg-white border rounded p-2 text-base">drag k = {dragK.toFixed(3)}</div>
          </div>
        </div>

        {/* Right: 3D UCM */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold">Uniform Circular Motion — 3D</h3>
          <div className="mt-2 text-xs text-gray-600">See centripetal acceleration pointing towards center in real time.</div>

          <div className="mt-3 h-72 rounded border">
            <Canvas camera={{ position: [0, 0, 5], fov: 55 }}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[5, 5, 5]} intensity={0.8} />
              {/* subtle grid on XY plane */}
              <gridHelper args={[6, 12, '#cbd5e1', '#e5e7eb']} rotation={[Math.PI / 2, 0, 0]} />
              <UCMotion radius={clamp(radius, 0.5, 3)} speed={clamp(speed, 0, 6)} playing={ucmPlaying} showVel={showUcmV} showAcc={showUcmA} />
              <OrbitControls enableDamping makeDefault />
            </Canvas>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2" aria-label="Radius slider">
              <span className="text-sm">r</span>
              <input type="range" min={0.5} max={3} step={0.1} value={radius} onChange={e => setRadius(Number(e.target.value))} />
              <span className="text-xs w-10 text-right">{radius.toFixed(1)} m</span>
            </label>
            <label className="flex items-center gap-2" aria-label="Speed slider">
              <span className="text-sm">v</span>
              <input type="range" min={0} max={6} step={0.1} value={speed} onChange={e => setSpeed(Number(e.target.value))} />
              <span className="text-xs w-10 text-right">{speed.toFixed(1)} m/s</span>
            </label>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-700">
            <button className="px-2 py-1 bg-indigo-600 text-white rounded" onClick={()=>setUcmPlaying(p=>!p)}>{ucmPlaying ? 'Pause' : 'Play'}</button>
            <label className="flex items-center gap-1"><input type="checkbox" checked={showUcmV} onChange={e=>setShowUcmV(e.target.checked)} />show v</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={showUcmA} onChange={e=>setShowUcmA(e.target.checked)} />show a</label>
            <span>ω = v/r = {(speed / Math.max(0.5, radius)).toFixed(2)} rad/s</span>
            <span>a_c = v²/r = {(speed*speed/Math.max(0.5, radius)).toFixed(2)} m/s²</span>
            <span>T = 2πr/v = {speed>0 ? (2*Math.PI*radius/speed).toFixed(2) : '∞'} s</span>
          </div>
        </div>
      </div>

      {/* Relative velocity + Graphs */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold">Relative Velocity — Vector View</h3>
          <div className="mt-2 text-xs text-gray-600">Blue = A, Red = B, Green = A − B</div>

          <div className="mt-3 flex flex-wrap gap-3 items-center">
            <label className="flex items-center gap-2"><span className="text-sm">Aₓ</span><input aria-label="A x" type="range" min={-8} max={8} value={vAx} onChange={e => setVAx(Number(e.target.value))} /><span className="w-10 text-xs text-right">{vAx}</span></label>
            <label className="flex items-center gap-2"><span className="text-sm">A_y</span><input aria-label="A y" type="range" min={-8} max={8} value={vAy} onChange={e => setVAy(Number(e.target.value))} /><span className="w-10 text-xs text-right">{vAy}</span></label>
            <label className="flex items-center gap-2"><span className="text-sm">Bₓ</span><input aria-label="B x" type="range" min={-8} max={8} value={vBx} onChange={e => setVBx(Number(e.target.value))} /><span className="w-10 text-xs text-right">{vBx}</span></label>
            <label className="flex items-center gap-2"><span className="text-sm">B_y</span><input aria-label="B y" type="range" min={-8} max={8} value={vBy} onChange={e => setVBy(Number(e.target.value))} /><span className="w-10 text-xs text-right">{vBy}</span></label>
          </div>

          <div className="mt-3 bg-slate-50 rounded p-2">
            <svg role="img" aria-label="Relative velocity" width="100%" height={300} viewBox="0 0 640 300" className="border rounded bg-white">
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L6,3 z" fill="#334155" />
                </marker>
              </defs>
              {/* axes */}
              <line x1={320} y1={10} x2={320} y2={290} stroke="#cbd5e1" />
              <line x1={10} y1={150} x2={630} y2={150} stroke="#cbd5e1" />
              {/* numeric grid */}
              {Array.from({ length: 11 }, (_, i)=> i-5).map((n)=> (
                <g key={n}>
                  <line x1={320 + n*40} y1={20} x2={320 + n*40} y2={280} stroke="#f1f5f9" />
                  <line x1={40} y1={150 - n*40} x2={600} y2={150 - n*40} stroke="#f1f5f9" />
                  <text x={320 + n*40} y={295} fontSize={12} textAnchor="middle" fill="#475569">{n*2}</text>
                  <text x={15} y={154 - n*40} fontSize={12} textAnchor="end" fill="#475569">{n*2}</text>
                </g>
              ))}
              {/* vectors from origin */}
              <line x1={320} y1={150} x2={320 + vAx * 20} y2={150 - vAy * 20} stroke="#0ea5e9" strokeWidth={3} markerEnd="url(#arrow)" />
              <line x1={320} y1={150} x2={320 + vBx * 20} y2={150 - vBy * 20} stroke="#ef4444" strokeWidth={3} markerEnd="url(#arrow)" />
              <line x1={320} y1={150} x2={320 + vRx * 20} y2={150 - vRy * 20} stroke="#10b981" strokeWidth={3} markerEnd="url(#arrow)" />
              <text x={330 + vRx * 20} y={144 - vRy * 20} fontSize={12} fill="#065f46">A−B</text>
              <text x={330 + vAx * 20} y={144 - vAy * 20} fontSize={12} fill="#0c4a6e">A</text>
              <text x={330 + vBx * 20} y={144 - vBy * 20} fontSize={12} fill="#7f1d1d">B</text>
            </svg>
          </div>
          <div className="mt-2 text-xs text-gray-700">|A − B| = {vRmag.toFixed(2)}, angle = {(vRang * 180 / Math.PI).toFixed(1)}°</div>
        </div>

        {/* Graphs of s/v/a vs t */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold">x–t, v–t, a–t graphs (projectile vertical)</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data1d} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis tick={{ fontSize: 12 }} dataKey="t" label={{ value: 't (s)', position: 'insideBottomRight', offset: -5 }} />
                <YAxis tick={{ fontSize: 12 }} yAxisId="left" label={{ value: 's (m)', angle: -90, position: 'insideLeft' }} />
                <YAxis tick={{ fontSize: 12 }} yAxisId="right" orientation="right" label={{ value: 'v/a', angle: -90, position: 'insideRight' }} />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="s" stroke="#3b82f6" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="v" stroke="#22c55e" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="a" stroke="#ef4444" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-xs text-gray-600">Area under v–t gives displacement; slope of v–t is acceleration.</div>
        </div>
      </div>

      {/* Range vs Angle visual + Boat-River */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold">Range vs Angle (no drag)</h3>
          <div className="text-xs text-gray-600 mt-1">For current u and g. Notice symmetry for complementary angles.</div>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rangeVsTheta} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="RFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="theta" label={{ value: 'θ (deg)', position: 'insideBottomRight', offset: -5 }} />
                <YAxis label={{ value: 'R (m)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Area type="monotone" dataKey="R" stroke="#2563eb" fill="url(#RFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-xs text-gray-700">Max range at θ ≈ 45°. With drag, optimum is lower — experiment in the lab.</div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold">Boat–River / Plane–Wind Navigator</h3>
          <div className="mt-2 text-xs text-gray-600">Adjust heading to remove drift. Banks are vertical; crossing along +x.</div>
          <div className="mt-3 flex flex-wrap gap-3 items-center">
            <label className="flex items-center gap-2">u_boat<input type="range" min={1} max={15} value={boatU} onChange={e=>setBoatU(Number(e.target.value))}/><span className="w-10 text-xs text-right">{boatU} m/s</span></label>
            <label className="flex items-center gap-2">u_river<input type="range" min={-8} max={8} value={riverU} onChange={e=>setRiverU(Number(e.target.value))}/><span className="w-10 text-xs text-right">{riverU} m/s</span></label>
            <label className="flex items-center gap-2">heading<input type="range" min={-80} max={80} value={heading} onChange={e=>setHeading(Number(e.target.value))}/><span className="w-10 text-xs text-right">{heading}°</span></label>
            <label className="flex items-center gap-2">width<input type="range" min={40} max={240} value={width} onChange={e=>setWidth(Number(e.target.value))}/><span className="w-10 text-xs text-right">{width} m</span></label>
          </div>
          <div className="mt-3 bg-slate-50 rounded p-2">
            <svg role="img" aria-label="Boat river" width="100%" height={220} viewBox="0 0 640 220" className="border rounded bg-white">
              <rect x={0} y={0} width={640} height={220} fill="#e0f2fe" />
              {/* banks */}
              <rect x={0} y={0} width={20} height={220} fill="#94a3b8" />
              <rect x={620} y={0} width={20} height={220} fill="#94a3b8" />
              {/* path */}
              <line x1={20} y1={110} x2={620} y2={110} stroke="#bae6fd" />
              {/* vectors at start */}
              <line x1={60} y1={110} x2={60 + boatU*Math.cos(headingRad)*10} y2={110 - boatU*Math.sin(headingRad)*10} stroke="#0ea5e9" strokeWidth={3} />
              <line x1={60} y1={110} x2={60} y2={110 + -riverU*10} stroke="#ef4444" strokeWidth={3} />
              <line x1={60} y1={110} x2={60 + groundVx*10} y2={110 - groundVy*10} stroke="#10b981" strokeWidth={3} />
              {/* predicted hit point */}
              {isFinite(timeToCross) && (
                <circle cx={clamp(20 + width * (600/width), 20, 620)} cy={110 - clamp(drift*(600/width), -300, 300)} r={4} fill="#ef4444" />
              )}
              <text x={80} y={30} fontSize={12} fill="#0c4a6e">Aim (blue), River (red), Ground (green)</text>
            </svg>
          </div>
          <div className="mt-2 text-xs text-gray-700">Time ≈ {isFinite(timeToCross) ? timeToCross.toFixed(2) : '—'} s, drift ≈ {isFinite(drift) ? drift.toFixed(1) : '—'} m, required heading for zero drift {isNaN(noDriftHeading) ? 'not possible' : `${noDriftHeading.toFixed(1)}°`}</div>
        </div>
      </div>

      {/* Piecewise a(t) editor */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-semibold">Piecewise Acceleration Editor — Build your own a(t)</h3>
        <div className="mt-2 text-xs text-gray-600">Create segments, then see v(t) and s(t) generated by integration. Great for braking/accel scenarios.</div>
        <div className="mt-3 flex flex-wrap gap-3 items-center">
          <label className="flex items-center gap-2">u₀<input type="range" min={-10} max={10} value={u0Piece} onChange={e=>setU0Piece(Number(e.target.value))} /><span className="w-10 text-xs text-right">{u0Piece}</span></label>
          <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={()=>setSegments(s=>[...s, { a: 0, d: 2 }])}>+ segment</button>
        </div>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {segments.map((seg, i)=> (
            <div key={i} className="border rounded p-2">
              <div className="text-xs font-medium">Segment {i+1}</div>
              <label className="flex items-center gap-2 mt-1"><span className="text-sm">a</span><input type="range" min={-6} max={6} step={0.1} value={seg.a} onChange={e=>{
                const val = Number(e.target.value); setSegments(prev=>prev.map((s,idx)=> idx===i?{...s,a:val}:s));
              }} /><span className="w-10 text-xs text-right">{seg.a.toFixed(1)}</span></label>
              <label className="flex items-center gap-2 mt-1"><span className="text-sm">Δt</span><input type="range" min={0.5} max={6} step={0.1} value={seg.d} onChange={e=>{
                const val = Number(e.target.value); setSegments(prev=>prev.map((s,idx)=> idx===i?{...s,d:val}:s));
              }} /><span className="w-10 text-xs text-right">{seg.d.toFixed(1)} s</span></label>
              <button className="mt-2 text-xs text-rose-600" onClick={()=> setSegments(prev=>prev.filter((_,idx)=>idx!==i))}>remove</button>
            </div>
          ))}
        </div>
        <div className="mt-4 grid lg:grid-cols-2 gap-4">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pieceData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t" label={{ value: 't (s)', position: 'insideBottomRight', offset: -5 }} />
                <YAxis label={{ value: 'v (m/s)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke="#22c55e" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pieceData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t" label={{ value: 't (s)', position: 'insideBottomRight', offset: -5 }} />
                <YAxis label={{ value: 's (m)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="s" stroke="#3b82f6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-700">Total time ≈ {totalT.toFixed(1)} s</div>
      </div>
    </div>
  );
}


