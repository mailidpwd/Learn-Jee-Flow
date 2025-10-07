import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text } from '@react-three/drei';

// README (top of file):
// Required packages: react, react-dom, @react-three/fiber, @react-three/drei, framer-motion, tailwindcss
// Mount: import AdvancedComplexPlayground from './AdvancedComplexPlayground'; render <AdvancedComplexPlayground /> in your app.

// NOTE: This is a single-file playground. It aims to be functional in Cursor-like previewers.

type Vec2 = { x: number; y: number };
type complexInput = { re: number; im: number };

function toFixed(n: number, d = 4) { return Number(n.toFixed(d)); }
function angleDeg(rad: number) { return toFixed((rad * 180) / Math.PI, 2); }
function cAbs(z: {re:number, im:number}) { return Math.hypot(z.re, z.im); }

/* ----------------- ARGAND CANVAS (SVG) ----------------- */
function ArgandCanvas({ x, y, setXY, showConj, snapUnit }: { x:number; y:number; setXY:(v:Vec2)=>void; showConj:boolean; snapUnit:boolean }){
  const width = 420, height = 420, scale = 60; const cx = width/2, cy = height/2;
  function toScreen(vx:number, vy:number){ return { sx: cx + vx*scale, sy: cy - vy*scale } }
  function pageToCoord(clientX:number, clientY:number){
    const svg = document.getElementById('argand-svg') as SVGSVGElement | null; if(!svg) return {vx:x, vy:y};
    const rect = svg.getBoundingClientRect(); const sx = clientX - rect.left; const sy = clientY - rect.top;
    const vx = (sx - cx)/scale; const vy = (cy - sy)/scale; if(snapUnit){ const r = Math.hypot(vx,vy); if(r>1e-6){ const nx = vx/r; const ny = vy/r; return {vx: toFixed(nx,4), vy: toFixed(ny,4)} } }
    return {vx: toFixed(vx,4), vy: toFixed(vy,4)};
  }
  function handlePointerDown(e:React.PointerEvent){ if(e.button!==0) return; const p = pageToCoord((e as any).clientX,(e as any).clientY); setXY({x:p.vx,y:p.vy}); }
  function handlePointerMove(e:React.PointerEvent){ if(((e as any).buttons & 1)!==1) return; const p = pageToCoord((e as any).clientX,(e as any).clientY); setXY({x:p.vx,y:p.vy}); }
  const z = toScreen(x,y), conj = toScreen(x,-y);
  const r = Math.hypot(x,y); const theta = Math.atan2(y,x);
  return (
    <svg id="argand-svg" width={width} height={height} className="rounded border bg-white" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} role="img" aria-label="Argand plane"> 
      <defs>
        <pattern id="grid" width={scale} height={scale} patternUnits="userSpaceOnUse"><path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#eee" strokeWidth={1}/></pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <line x1={0} y1={cy} x2={width} y2={cy} stroke="#333" strokeWidth={1.2} />
      <line x1={cx} y1={0} x2={cx} y2={height} stroke="#333" strokeWidth={1.2} />

      {/* axis ticks and labels at integer values */}
      <g fill="#475569" fontSize={10}>
        {Array.from({length:7},(_,k)=>k-3).filter(v=>v!==0).map(v=>{
          const xPos = cx + v*scale;
          return (
            <g key={`xtick-${v}`}>
              <line x1={xPos} y1={cy-4} x2={xPos} y2={cy+4} stroke="#64748b" />
              <text x={xPos-3} y={cy+14}>{v}</text>
            </g>
          );
        })}
        {Array.from({length:7},(_,k)=>k-3).filter(v=>v!==0).map(v=>{
          const yPos = cy - v*scale;
          return (
            <g key={`ytick-${v}`}>
              <line x1={cx-4} y1={yPos} x2={cx+4} y2={yPos} stroke="#64748b" />
              <text x={cx+6} y={yPos+3}>{v}i</text>
            </g>
          );
        })}
      </g>
      {/** origin markers */}
      <circle cx={cx} cy={cy} r={2} fill="#111" />
      {/* radius line */}
      <line x1={cx} y1={cy} x2={z.sx} y2={z.sy} stroke="#ef4444" strokeWidth={2} />
      <circle cx={z.sx} cy={z.sy} r={6} fill="#ef4444" stroke="#fff" />
      {showConj && (<><line x1={cx} y1={cy} x2={conj.sx} y2={conj.sy} stroke="#f59e0b" strokeDasharray="6 4" /><circle cx={conj.sx} cy={conj.sy} r={5} fill="#f59e0b" stroke="#fff" /></>)}
      <rect x={8} y={8} width={230} height={74} rx={8} fill="#ffffffcc" stroke="#ddd" />
      <text x={16} y={28} fontSize={12} fill="#111">{`z = ${toFixed(x,4)} + ${toFixed(y,4)}i`}</text>
      <text x={16} y={44} fontSize={12} fill="#333">{`|z| = ${toFixed(r,6)} , θ = ${toFixed(theta,6)} rad (${angleDeg(theta)}°)`}</text>
      <text x={16} y={60} fontSize={12} fill="#333">{`polar: ${toFixed(r,4)} e^{i${toFixed(theta,3)}}`}</text>
    </svg>
  )
}

/* ----------------- De Moivre 3D component ----------------- */
function DeMoivre3D({ r, theta, n, speed, playing }:{r:number; theta:number; n:number; speed:number; playing:boolean}){
  const group = useRef<any>();
  useFrame((_,dt)=>{ if(!group.current) return; if(playing) group.current.rotation.z += speed * dt * 60; });
  const safeR = Math.max(0.05, r);
  const points = useMemo(()=>{ const arr:number[]=[]; for(let k=0;k<n;k++){ const t = theta + (2*Math.PI*k)/n; arr.push(safeR*Math.cos(t), safeR*Math.sin(t), 0); } return arr; }, [safeR,theta,n]);
  const loopArray = useMemo(()=> new Float32Array([...points, ...points.slice(0,3)]), [points]);
  return (
    <group ref={group}>
      <mesh position={[0,0,0]}>
        <ringGeometry args={[safeR-0.002, safeR+0.002, 128]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.12} />
      </mesh>
      <Line points={points.reduce((arr, v, idx)=>{ if(idx%3===0) arr.push([points[idx],points[idx+1],points[idx+2]]); return arr; }, [] as number[][])} color="#ef4444" lineWidth={1} />
      {Array.from({length:points.length/3}).map((_,i)=> (
        <group key={i}>
          <mesh position={[points[i*3], points[i*3+1], 0]}>
            <sphereGeometry args={[0.03, 12, 8]} />
            <meshStandardMaterial color={i===0? '#f97316':'#10b981'} />
          </mesh>
          <Text
            position={[points[i*3], points[i*3+1], 0.02]}
            fontSize={0.12}
            color="#111827"
            anchorX="center"
            anchorY="middle"
          >
            {`${i+1}`}
          </Text>
        </group>
      ))}
    </group>
  )
}

/* ----------------- Roots Explorer ----------------- */
function nthRoots(w: {re:number, im:number}, n:number){
  const nn = Math.max(1, Math.round(Number.isFinite(n) ? n : 1));
  const r = Math.hypot(w.re, w.im);
  let theta = Math.atan2(w.im, w.re);
  if (theta < 0) theta += 2 * Math.PI;
  const roots: {re:number,im:number,index:number}[] = [];
  const rad = Math.pow(r, 1 / nn);
  for (let k = 0; k < nn; k++) {
    const ang = (theta + (2 * Math.PI * k)) / nn;
    roots.push({ re: rad * Math.cos(ang), im: rad * Math.sin(ang), index: k });
  }
  return roots;
}

/* 3D Roots-of-Unity / nth-roots viewer */
function Roots3D({ w, n }: { w:{re:number,im:number}; n:number }){
  const nn = Math.max(1, Math.round(Number.isFinite(n) ? n : 1));
  const mag = Math.hypot(w.re, w.im);
  const R = Math.pow(mag, 1 / nn);
  const pts = useMemo(() => nthRoots(w, nn), [w.re, w.im, nn]);
  const ringR = Math.max(0.2, Math.min(2, Number.isFinite(R) ? R : 1));
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3,3,5]} intensity={0.8} />
      <OrbitControls enablePan={false} />
      {/* unit ring at radius R */}
      <mesh rotation={[Math.PI/2,0,0]}>
        <ringGeometry args={[ringR-0.002, ringR+0.002, 128]} />
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.25} />
      </mesh>
      {/* polygon edges */}
      <Line points={(pts.length? [...pts, pts[0]] : [{re:0,im:0},{re:0.001,im:0}]).map((p:any)=>[p.re,p.im,0])} color="#ef4444" lineWidth={1} />
      {/* points and labels */}
      {pts.map((p, i) => (
        <group key={i}>
          <mesh position={[p.re, p.im, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color={i===0 ? '#f97316' : '#22c55e'} />
          </mesh>
          <Text position={[p.re*1.14, p.im*1.14, 0.02]} fontSize={0.18} color="#111827" anchorX="center" anchorY="middle">
            {`ζ${i}`}
          </Text>
        </group>
      ))}
    </Canvas>
  );
}

/* ----------------- Division Tutor (algebraic steps) ----------------- */
function DivisionTutor({a,b}:{a:complexInput,b:complexInput}){
  const numRe = a.re*b.re - a.im*b.im; const numIm = a.re*b.im + a.im*b.re; const den = b.re*b.re + b.im*b.im || 1e-12; const res = {re: numRe/den, im: numIm/den};
  return (
    <div className="p-3 bg-gray-50 rounded">
      <div className="text-sm">Compute (a/b) by multiplying numerator and denominator by conj(b).</div>
      <div className="mt-2 text-xs font-mono">(a+ib)(c-id) = ({toFixed(numRe,6)}) + i({toFixed(numIm,6)})</div>
      <div className="mt-1 text-xs font-mono">Denominator = c^2 + d^2 = {toFixed(den,6)}</div>
      <div className="mt-2 font-semibold">Result: {toFixed(res.re,6)} {res.im>=0? '+':'-'} {toFixed(Math.abs(res.im),6)}i</div>
    </div>
  )
}

/* ----------------- Locus Builder (SVG) ----------------- */
function LocusBuilder({type, params}:{type:string, params:any}){
  // supports circle, line (ax+by+c=0 via complex), perp-bisector, arg-constant
  const width=480, height=420, scale=60, cx=width/2, cy=height/2;
  function toScreen(vx:number, vy:number){ return { sx: cx + vx*scale, sy: cy - vy*scale } }
  const elems:JSX.Element[] = [];
  if(type==='circle'){
    const {x0,y0,r} = params; const s = toScreen(x0,y0); elems.push(<circle key="c" cx={s.sx} cy={s.sy} r={r*scale} stroke="#2b6cb0" strokeWidth={2} fill="none" />);
  } else if(type==='perp-bisector'){
    const {x1,y1,x2,y2} = params; const midx=(x1+x2)/2, midy=(y1+y2)/2; const dx=x2-x1, dy=y2-y1; // normal vector dx,dy -> perpendicular slope -dx/dy
    // draw a long line through midpoint with direction perpendicular
    const ux = -dy, uy = dx; const norm = Math.hypot(ux,uy)||1; const uxn=ux/norm, uyn=uy/norm; const p1 = toScreen(midx - uxn*10, midy - uyn*10); const p2=toScreen(midx + uxn*10, midy + uyn*10);
    elems.push(<line key="pb" x1={p1.sx} y1={p1.sy} x2={p2.sx} y2={p2.sy} stroke="#f59e0b" strokeWidth={2} />);
    elems.push(<circle key="pt1" cx={toScreen(x1,y1).sx} cy={toScreen(x1,y1).sy} r={4} fill="#ef4444" />);
    elems.push(<circle key="pt2" cx={toScreen(x2,y2).sx} cy={toScreen(x2,y2).sy} r={4} fill="#ef4444" />);
  } else if(type==='arg-const'){
    const {z1,z2,theta} = params; // draw arc: compute circle through points that subtends angle theta
    // For simplicity, draw locus as arc approximation by sampling points satisfying arg((z-z1)/(z-z2)) = theta
    const samples: {sx:number,sy:number}[] = [];
    for(let X=-6; X<=6; X+=0.08){
      for(let Y=-6; Y<=6; Y+=0.16){
        const v1 = {x:X-z1.x, y:Y-z1.y}; const v2 = {x:X-z2.x, y:Y-z2.y};
        const ang = Math.atan2(v1.y, v1.x) - Math.atan2(v2.y, v2.x);
        let diff = Math.abs(((ang+Math.PI)%(2*Math.PI))-Math.PI);
        if(Math.abs(diff - theta) < 0.03){ samples.push(toScreen(X,Y)); break; }
      }
    }
    elems.push(...samples.map((p,i)=>(<rect key={i} x={p.sx} y={p.sy} width={1} height={1} fill="#10b981" />)));
  }
  return (
    <svg width={480} height={420} className="rounded border bg-white">
      <rect width="100%" height="100%" fill="#fff" />
      <line x1={0} y1={210} x2={480} y2={210} stroke="#ccc" />
      <line x1={240} y1={0} x2={240} y2={420} stroke="#ccc" />
      {elems}
    </svg>
  )
}

/* ----------------- Polynomial roots visualizer using Durand-Kerner ----------------- */
function durandKerner(coeffs: {re:number,im:number}[], maxIter=200, tol=1e-8){
  const n = coeffs.length-1; if(n<=0) return [] as {re:number,im:number}[]; // coeffs[0] = a_n ... a_0
  // normalize to monic
  const a0 = coeffs[0]; const lead = a0.re !== 0 ? a0.re : 1; const monic = coeffs.map(c=>({re: c.re/lead, im: c.im/lead})); // assume real a0
  // initial guesses: roots of unity slightly perturbed
  let roots: {re:number, im:number}[] = []; for(let k=0;k<n;k++){ const ang = 2*Math.PI*k/n; roots.push({re: Math.cos(ang)+0.4, im: Math.sin(ang)}); }
  for(let iter=0; iter<maxIter; iter++){
    let maxUpdate = 0;
    for(let i=0;i<n;i++){
      // evaluate polynomial at root
      const zi = roots[i]; let p = {re: monic[0].re, im: monic[0].im}; // start with leading coeff
      for(let j=1;j<=n;j++){ const c = monic[j]; // p = p*zi + c
        const prod = {re: p.re*zi.re - p.im*zi.im, im: p.re*zi.im + p.im*zi.re}; p = {re: prod.re + c.re, im: prod.im + c.im}; }
      // compute denominator = product (zi - zj)
      let denom = {re:1, im:0}; for(let j=0;j<n;j++) if(j!==i){ const dx = {re: zi.re - roots[j].re, im: zi.im - roots[j].im}; const tmp = {re: denom.re*dx.re - denom.im*dx.im, im: denom.re*dx.im + denom.im*dx.re}; denom = tmp; }
      // delta = p/denom
      const denMag = denom.re*denom.re + denom.im*denom.im; if(denMag===0) continue; const delta = {re: (p.re*denom.re + p.im*denom.im)/denMag, im: (p.im*denom.re - p.re*denom.im)/denMag};
      roots[i] = {re: zi.re - delta.re, im: zi.im - delta.im}; maxUpdate = Math.max(maxUpdate, Math.hypot(delta.re, delta.im));
    }
    if(maxUpdate < tol) break;
  }
  return roots;
}

/* ----------------- UI: Main Component ----------------- */
export default function AdvancedComplexPlayground(){
  // central state for Argand demo
  const [x, setX] = useState(1.0); const [y, setY] = useState(0.5); const [showConj, setShowConj] = useState(true); const [snapUnit, setSnapUnit] = useState(false);
  const [nPower, setNPower] = useState(6); const [playing, setPlaying] = useState(true); const [speed, setSpeed] = useState(0.02);
  const [rootW, setRootW] = useState<{re:number,im:number}>({re:1, im:0}); const [rootN, setRootN] = useState(5);
  const [polyText, setPolyText] = useState('1, -1, 0, 1'); // comma-separated coeffs highest to lowest (real only simple)
  const [locusType, setLocusType] = useState('circle'); const [notes, setNotes] = useState(()=> localStorage.getItem('acc_notes') || '');
  useEffect(()=>{ localStorage.setItem('acc_notes', notes); }, [notes]);

  // parse poly
  const polyCoeffs = useMemo(()=> polyText.split(',').map(s=>s.trim()).filter(Boolean).map(s=>({re: Number(s), im:0})), [polyText]);
  const polyRoots = useMemo(()=> durandKerner(polyCoeffs), [polyCoeffs]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4">
        {/* Left: Playground main column */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold">Argand Playground</h2>
            <div>
              <ArgandCanvas x={x} y={y} setXY={({x,y})=>{ setX(x); setY(y);} } showConj={showConj} snapUnit={snapUnit} />
              {/* controls card below the canvas */}
              <div className="mt-4 bg-slate-50 border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-sm text-gray-700">Adjust z</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Real part x</label>
                    <input type="range" min={-6} max={6} step={0.01} value={x} onChange={(e)=>setX(Number(e.target.value))} className="w-full accent-purple-600" />
                    <p className="text-xs mt-1">x = {toFixed(x,3)}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Imag part y</label>
                    <input type="range" min={-6} max={6} step={0.01} value={y} onChange={(e)=>setY(Number(e.target.value))} className="w-full accent-purple-600" />
                    <p className="text-xs mt-1">y = {toFixed(y,3)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <label className="flex items-center gap-1"><input type="checkbox" checked={showConj} onChange={(e)=>setShowConj(e.target.checked)} className="accent-purple-600"/> Show conjugate</label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={snapUnit} onChange={(e)=>setSnapUnit(e.target.checked)} className="accent-purple-600"/> Snap to unit</label>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">Drag or use sliders. Keyboard focus: click on slider and use arrows.</div>
            </div>
          </div>

          {/* De Moivre Visualizer (main column) removed as requested; sidebar instance remains */}

          <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Roots & Roots-of-Unity Explorer (3D)</h3>
              <div className="flex items-center gap-2 text-sm">
                <input className="w-20 border rounded px-1" value={rootW.re} onChange={(e)=>setRootW(s=>({...s, re: Number(e.target.value)}))} />
                <span className="opacity-70">+</span>
                <input className="w-20 border rounded px-1" value={rootW.im} onChange={(e)=>setRootW(s=>({...s, im: Number(e.target.value)}))} />
                <span className="opacity-70">i</span>
                <label className="ml-3">n</label>
                <input className="ml-1 w-24 border rounded px-1" type="number" min={1} max={32} value={Number.isFinite(rootN)? rootN : 1} onChange={(e)=>{
                  const v = parseInt(e.target.value,10);
                  setRootN(Number.isFinite(v)? v : 1);
                }} />
              </div>
              <div className="mt-3 h-[240px] rounded overflow-hidden">
                <Roots3D w={rootW} n={rootN} />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Division Tutor</h3>
              <div className="mt-2"><DivisionTutor a={{re:x,im:y}} b={{re:rootW.re, im:rootW.im}} /></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Locus & Geometry Suite</h3>
              <div className="mt-2 flex gap-2">
                <select value={locusType} onChange={(e)=>setLocusType(e.target.value)} className="p-1 border rounded">
                  <option value="circle">Circle</option>
                  <option value="perp-bisector">Perpendicular bisector</option>
                  <option value="arg-const">Constant argument locus</option>
                </select>
              </div>
              <div className="mt-3">
                {locusType === 'circle' && <LocusBuilder type="circle" params={{x0:0,y0:0,r:2}} />}
                {locusType === 'perp-bisector' && <LocusBuilder type="perp-bisector" params={{x1:-1,y1:0,x2:2,y2:1}} />}
                {locusType === 'arg-const' && <LocusBuilder type="arg-const" params={{z1:{x:-1,y:0},z2:{x:1,y:0},theta:Math.PI/6}} />}
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Polynomial Roots Visualizer</h3>
              <div className="mt-2"><input className="w-full p-2 border rounded" value={polyText} onChange={(e)=>setPolyText(e.target.value)} /><div className="mt-2 text-sm">Roots: {polyRoots.length? polyRoots.map((r,i)=> `${toFixed(r.re,4)}${r.im>=0?'+':''}${toFixed(r.im,4)}i`).join(', '): '—'}</div>
                <svg width={320} height={200} className="mt-3 border rounded bg-white"><g transform="translate(160,100)">{polyRoots.map((rt,i)=>(<g key={i}><circle cx={rt.re*30} cy={-rt.im*30} r={4} fill="#7c3aed" /><text x={rt.re*30+6} y={-rt.im*30+4} fontSize={10}>{'r'+(i+1)}</text></g>))}</g></svg>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Sidebar - show Presets and 3D visualizer side-by-side with Argand */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold">Presets</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button className="p-2 bg-gray-100 rounded" onClick={()=>{ setX(1); setY(0); setNPower(6); setRootW({re:1,im:0}); setRootN(3); }}>Unit Real</button>
              <button className="p-2 bg-gray-100 rounded" onClick={()=>{ setX(-0.5); setY(0.866); setRootN(3); }}>omega</button>
            </div>
          </div>

          {/* Sidebar 3D De Moivre View */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">De Moivre Visualizer (3D)</h3>
            <div className="h-[260px] rounded overflow-hidden">
              <Canvas camera={{position:[0,0,4], fov:60}}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[2,2,2]} intensity={0.8} />
                <OrbitControls />
                <DeMoivre3D r={Math.max(0.1, Math.hypot(x,y))} theta={Math.atan2(y,x)} n={nPower} speed={speed} playing={playing} />
              </Canvas>
            </div>
            <div className="mt-3">
              <label className="block text-xs text-gray-500">n (polygon vertices)</label>
              <input type="range" min={3} max={32} step={1} value={nPower} onChange={(e)=>setNPower(Number(e.target.value))} className="w-full" />
              <div className="text-xs mb-2">n = {nPower}</div>
              <label className="block text-xs text-gray-500">Animation speed</label>
              <input type="range" min={0} max={0.2} step={0.01} value={speed} onChange={(e)=>setSpeed(Number(e.target.value))} className="w-full" />
              <div className="flex gap-2 mt-2"><button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={()=>setPlaying(p=>!p)}>{playing? 'Pause':'Play'}</button></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}


