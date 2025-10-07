import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

type Vec2 = { x: number; y: number };

function toFixed(n: number, d = 3) {
  return Number(n.toFixed(d));
}

function polarFromCartesian(x: number, y: number) {
  const r = Math.hypot(x, y);
  let theta = Math.atan2(y, x);
  if (theta < 0) theta += Math.PI * 2;
  return { r, theta };
}

function ArgandCanvas({ x, y, setXY, showConjugate, circle }: { x: number; y: number; setXY: (v: Vec2) => void; showConjugate: boolean; circle?: { cx: number; cy: number; r: number } }) {
  const width = 420;
  const height = 420;
  const scale = 40;
  const cx = width / 2;
  const cy = height / 2;

  function toScreen(vx: number, vy: number) {
    return { sx: cx + vx * scale, sy: cy - vy * scale };
  }

  function pageToCoord(clientX: number, clientY: number) {
    const svg = document.getElementById('argand-svg');
    if (!svg) return { vx: x, vy: y };
    const rect = svg.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    const vx = (sx - cx) / scale;
    const vy = (cy - sy) / scale;
    return { vx: Number(vx.toFixed(3)), vy: Number(vy.toFixed(3)) };
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    const p = pageToCoord(e.clientX, e.clientY);
    setXY({ x: p.vx, y: p.vy });
  }

  function handlePointerMove(e: React.PointerEvent) {
    if ((e.buttons & 1) !== 1) return;
    const p = pageToCoord(e.clientX, e.clientY);
    setXY({ x: p.vx, y: p.vy });
  }

  const zScreen = toScreen(x, y);
  const conj = toScreen(x, -y);

  return (
    <svg id="argand-svg" width={width} height={height} className="rounded border bg-white" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}>
      <defs>
        <pattern id="smallGrid" width={scale} height={scale} patternUnits="userSpaceOnUse">
          <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#eee" strokeWidth={1} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#smallGrid)" />
      <line x1={0} y1={cy} x2={width} y2={cy} stroke="#444" strokeWidth={1.2} />
      <line x1={cx} y1={0} x2={cx} y2={height} stroke="#444" strokeWidth={1.2} />
      <text x={width - 28} y={cy - 6} fontSize={12} fill="#444">Re</text>
      <text x={cx + 6} y={12} fontSize={12} fill="#444">Im</text>
      {circle && (
        <circle cx={cx + circle.cx * scale} cy={cy - circle.cy * scale} r={circle.r * scale} stroke="#2b6cb0" strokeWidth={1.5} fill="none" opacity={0.6} />
      )}
      <line x1={cx} y1={cy} x2={zScreen.sx} y2={zScreen.sy} stroke="#ef4444" strokeWidth={2} />
      <circle cx={zScreen.sx} cy={zScreen.sy} r={6} fill="#ef4444" stroke="#fff" style={{ cursor: 'grab' }} />
      {showConjugate && (
        <>
          <line x1={cx} y1={cy} x2={conj.sx} y2={conj.sy} stroke="#f59e0b" strokeDasharray="6 4" />
          <circle cx={conj.sx} cy={conj.sy} r={5} fill="#f59e0b" stroke="#fff" />
        </>
      )}
      <rect x={8} y={8} width={190} height={56} rx={6} fill="#ffffffcc" stroke="#ddd" />
      <text x={16} y={28} fontSize={12} fill="#111">z = {x} + {y}i</text>
      <text x={16} y={46} fontSize={12} fill="#333">|z| = {toFixed(Math.hypot(x, y), 4)}  θ = {toFixed(Math.atan2(y, x), 4)} rad</text>
    </svg>
  );
}

function DeMoivre3D({ r, theta, n, speed, playing }: { r: number; theta: number; n: number; speed: number; playing: boolean }) {
  const ref = useRef<any>();
  useFrame((_, dt) => {
    if (!ref.current) return;
    if (playing) ref.current.rotation.z += speed * dt * 60;
  });

  const points = useMemo(() => {
    const arr: number[] = [];
    for (let k = 0; k < n; k++) {
      const t = theta + (2 * Math.PI * k) / n;
      arr.push(r * Math.cos(t), r * Math.sin(t), 0);
    }
    // close the loop by repeating first point
    arr.push(r * Math.cos(theta), r * Math.sin(theta), 0);
    return arr;
  }, [r, theta, n]);

  // first vertex (angle theta)
  const vx = r * Math.cos(theta);
  const vy = r * Math.sin(theta);
  const rayLen = Math.max(0.05, r);
  const rayRot = Math.atan2(vy, vx);

  return (
    <group ref={ref} rotation={[0, 0, 0]}>
      {/* base circle */}
      <mesh>
        <circleGeometry args={[Math.max(0.05, r), 64]} />
        <meshBasicMaterial color="#60a5fa" wireframe={false} opacity={0.18} transparent />
      </mesh>

      {/* origin */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.05, 16, 12]} />
        <meshStandardMaterial color={'#ef4444'} />
      </mesh>

      {/* orange ray indicating current angle θ */}
      <mesh position={[vx / 2, vy / 2, 0]} rotation={[0, 0, rayRot]}>
        <boxGeometry args={[rayLen, 0.02, 0.02]} />
        <meshStandardMaterial color={'#f97316'} />
      </mesh>

      {/* vertices only (avoid line geometry runtime issues on some setups) */}
      {Array.from({ length: (points.length / 3) - 1 }).map((_, i) => (
        <mesh key={i} position={[points[i * 3], points[i * 3 + 1], points[i * 3 + 2]]}>
          <sphereGeometry args={[0.045, 16, 12]} />
          <meshStandardMaterial color={i === 0 ? '#f97316' : '#10b981'} />
        </mesh>
      ))}
    </group>
  );
}

export default function ComplexNumbersIntermediatePlayground() {
  const [x, setX] = useState(1.2);
  const [y, setY] = useState(0.8);
  const [showConjugate, setShowConjugate] = useState(true);
  const { r, theta } = useMemo(() => polarFromCartesian(x, y), [x, y]);
  const [nPower, setNPower] = useState(6);
  const [playing, setPlaying] = useState(false);

  function setXY(v: Vec2) {
    setX(v.x);
    setY(v.y);
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-soft">
      <h4 className="text-card-foreground font-semibold mb-3">🎮 Interactive Complex Numbers Playground</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-3 border">
          <ArgandCanvas x={x} y={y} setXY={setXY} showConjugate={showConjugate} circle={{ cx: 0, cy: 0, r: 1.2 }} />
          <div className="mt-2 text-sm text-muted-foreground">Drag the red point to change z. Grid units = 1.</div>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded border">
            <label className="block text-xs text-muted-foreground">Real part (x)</label>
            <input className="w-full" type="range" min={-4} max={4} step={0.01} value={x} onChange={(e) => setX(Number(e.target.value))} />
            <div className="text-sm">x = {toFixed(x, 3)}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded border">
            <label className="block text-xs text-muted-foreground">Imag part (y)</label>
            <input className="w-full" type="range" min={-4} max={4} step={0.01} value={y} onChange={(e) => setY(Number(e.target.value))} />
            <div className="text-sm">y = {toFixed(y, 3)}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded border flex items-center justify-between">
            <label className="text-sm">Show conjugate</label>
            <input type="checkbox" checked={showConjugate} onChange={(e) => setShowConjugate(e.target.checked)} />
          </div>
          <div className="p-3 bg-gray-50 rounded border">
            <label className="block text-xs text-muted-foreground">Polar form (auto)</label>
            <div className="text-sm">r = {toFixed(r, 4)}</div>
            <div className="text-sm">θ = {toFixed(theta, 4)} rad</div>
          </div>
          <div className="p-3 bg-gray-50 rounded border">
            <label className="block text-xs text-muted-foreground">De Moivre polygon (n points)</label>
            <input className="w-full" type="range" min={3} max={12} step={1} value={nPower} onChange={(e) => setNPower(Number(e.target.value))} />
            <div className="text-sm">n = {nPower}</div>
            <button onClick={() => setPlaying((p) => !p)} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">{playing ? 'Pause' : 'Play'}</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-3 mt-4">
        <div style={{ height: 360 }} className="rounded overflow-hidden">
          <Canvas camera={{ position: [0, 2, 3], fov: 55 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <OrbitControls enablePan={true} />
            <DeMoivre3D r={Math.max(0.18, r)} theta={theta} n={nPower} speed={0.02} playing={playing} />
            <gridHelper args={[6, 12, '#888', '#aaa']} position={[0, -0.01, 0]} />
          </Canvas>
        </div>
        <div className="mt-3 text-sm text-muted-foreground">3D view: Points lie on the blue circle of radius r = |z|. The orange ray shows the angle θ. Use the Play button to rotate all points (De Moivre).</div>
      </div>
    </div>
  );
}


