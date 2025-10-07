import { useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';

function Panel({ title, children }: { title: string; children: any }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 ring-1 ring-slate-100">
      <div className="font-semibold mb-2 text-slate-900">{title}</div>
      {children}
    </div>
  );
}

function Arrow3D({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }){
  const points = useMemo(() => [start, end], [start, end]);
  const dir = useMemo(() => {
    const dx = end[0]-start[0], dy=end[1]-start[1], dz=end[2]-start[2];
    const len = Math.hypot(dx,dy,dz) || 0.0001;
    return { dx: dx/len, dy: dy/len, dz: dz/len, len };
  }, [start, end]);
  const tip = useMemo(() => {
    const tx = end[0] - 0.15*dir.dx; const ty = end[1] - 0.15*dir.dy; const tz = end[2] - 0.15*dir.dz;
    return [tx,ty,tz] as [number,number,number];
  }, [end, dir]);
  return (
    <group>
      <Line points={points} color={color} lineWidth={2} />
      <mesh position={tip as any}>
        <coneGeometry args={[0.06, 0.15, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Vectors3DLab(){
  const [ax, setAx] = useState(2); const [ay, setAy] = useState(1); const [az, setAz] = useState(0.5);
  const [bx, setBx] = useState(-1); const [by, setBy] = useState(2); const [bz, setBz] = useState(1);

  const dot = ax*bx + ay*by + az*bz;
  const cross = useMemo(() => [
    ay*bz - az*by,
    az*bx - ax*bz,
    ax*by - ay*bx
  ] as [number,number,number], [ax,ay,az,bx,by,bz]);

  return (
    <Panel title="Vectors 3D — Dot & Cross (play with sliders)">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-72 bg-white rounded border">
          <Canvas camera={{ position: [3,3,6], fov: 55 }}>
            <color attach="background" args={["#f8fafc"]} />
            <ambientLight intensity={0.9} />
            <directionalLight position={[6,6,6]} intensity={0.9} />
            <gridHelper args={[20, 20, '#64748b', '#cbd5e1']} />
            <axesHelper args={[4]} />
            <Arrow3D start={[0,0,0]} end={[ax,ay,az]} color="#2563eb" />
            <Arrow3D start={[0,0,0]} end={[bx,by,bz]} color="#ef4444" />
            <Arrow3D start={[0,0,0]} end={cross} color="#10b981" />
            <Html position={[0,2.2,0]} center>
              <div className="text-xs bg-white/90 px-2 py-1 rounded shadow">
                <div>A · B = <b>{dot.toFixed(2)}</b></div>
                <div>|A × B| = <b>{Math.hypot(...cross).toFixed(2)}</b></div>
              </div>
            </Html>
            <OrbitControls enableDamping makeDefault />
          </Canvas>
        </div>
        <div className="text-sm">
          <div className="grid grid-cols-3 gap-3">
            <label>Aₓ <input type="range" min={-3} max={3} step={0.1} value={ax} onChange={e=>setAx(parseFloat(e.target.value))} /></label>
            <label>Aᵧ <input type="range" min={-3} max={3} step={0.1} value={ay} onChange={e=>setAy(parseFloat(e.target.value))} /></label>
            <label>A_z <input type="range" min={-3} max={3} step={0.1} value={az} onChange={e=>setAz(parseFloat(e.target.value))} /></label>
            <label>Bₓ <input type="range" min={-3} max={3} step={0.1} value={bx} onChange={e=>setBx(parseFloat(e.target.value))} /></label>
            <label>Bᵧ <input type="range" min={-3} max={3} step={0.1} value={by} onChange={e=>setBy(parseFloat(e.target.value))} /></label>
            <label>B_z <input type="range" min={-3} max={3} step={0.1} value={bz} onChange={e=>setBz(parseFloat(e.target.value))} /></label>
          </div>
          <div className="mt-2 text-xs text-slate-600">Green shows <b>A × B</b> (right‑hand rule). Blue and red are A and B. Try perpendicular vectors to make dot = 0.</div>
        </div>
      </div>
    </Panel>
  );
}

function SmallAngleLab(){
  const [theta, setTheta] = useState(0.2); // radians
  const width=280, height=160, scaleX=80;
  const f = (x:number)=>Math.cos(x);
  const g = (x:number)=>1 - (x*x)/2; // approx
  const OX = width/2, OY = height/2, scaleY = 60;
  const pathF = useMemo(()=>{
    let d=''; let first=true;
    for(let x=-1.2;x<=1.2;x+=0.02){
      const X = OX + x*scaleX; const Y = OY - f(x)*scaleY;
      d += (first?`M ${X} ${Y}`:` L ${X} ${Y}`); first=false;
    }
    return d;
  },[]);
  const pathG = useMemo(()=>{
    let d=''; let first=true;
    for(let x=-1.2;x<=1.2;x+=0.02){
      const X = OX + x*scaleX; const Y = OY - g(x)*scaleY;
      d += (first?`M ${X} ${Y}`:` L ${X} ${Y}`); first=false;
    }
    return d;
  },[]);
  return (
    <Panel title="Trig — Small Angle Approximation (cos θ ≈ 1 − θ²/2)">
      <div className="text-sm text-slate-600 mb-2">Drag θ and compare exact vs approximation near 0.</div>
      <input type="range" min={-0.8} max={0.8} step={0.01} value={theta} onChange={e=>setTheta(parseFloat(e.target.value))} />
      <svg width={width} height={height} className="mt-2 border rounded bg-white">
        {/* axes with numeric ticks */}
        <line x1={0} y1={OY} x2={width} y2={OY} stroke="#e5e7eb" />
        <line x1={OX} y1={0} x2={OX} y2={height} stroke="#e5e7eb" />
        {/* x ticks -1.0..1.0 */}
        {[-1,-0.5,0,0.5,1].map((v,i)=>{
          const X=OX + v*scaleX; return (
            <g key={`txs${i}`}>
              <line x1={X} y1={OY-3} x2={X} y2={OY+3} stroke="#cbd5e1" />
              <text x={X} y={OY+12} fontSize={9} textAnchor="middle" fill="#64748b">{v}</text>
              <line x1={X} y1={0} x2={X} y2={height} stroke="#f1f5f9" />
            </g>
          );
        })}
        {/* y ticks 0..1.0 */}
        {[0,0.5,1].map((v,i)=>{
          const Y = OY - v*scaleY; return (
            <g key={`tys${i}`}>
              <line x1={OX-3} y1={Y} x2={OX+3} y2={Y} stroke="#cbd5e1" />
              <text x={OX-8} y={Y+3} fontSize={9} textAnchor="end" fill="#64748b">{v}</text>
              <line x1={0} y1={Y} x2={width} y2={Y} stroke="#f1f5f9" />
            </g>
          );
        })}
        <path d={pathF} fill="none" stroke="#2563eb" strokeWidth={2} />
        <path d={pathG} fill="none" stroke="#10b981" strokeDasharray="4 3" />
        {/* marker point */}
        <circle cx={OX + theta*scaleX} cy={OY - f(theta)*scaleY} r={4} fill="#ef4444" />
      </svg>
      <div className="mt-2 text-xs text-slate-700">θ = {theta.toFixed(2)} rad | cos θ = {Math.cos(theta).toFixed(4)} | approx = {(1 - (theta*theta)/2).toFixed(4)}</div>
    </Panel>
  );
}

function BinomialLab(){
  const [x, setX] = useState(0.05); const [n, setN] = useState(5);
  const exact = useMemo(()=> Math.pow(1+x, n), [x,n]);
  const approx = useMemo(()=> 1 + n*x, [x,n]);
  return (
    <Panel title="Algebra — (1+x)ⁿ ≈ 1 + nx (for small x)">
      <div className="text-sm text-slate-600 mb-2">Slide x and n to compare exact vs first‑order approximation.</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label>x = {x.toFixed(3)} <input type="range" min={-0.2} max={0.2} step={0.005} value={x} onChange={e=>setX(parseFloat(e.target.value))} /></label>
        <label>n = {n} <input type="range" min={1} max={10} step={1} value={n} onChange={e=>setN(parseInt(e.target.value))} /></label>
      </div>
      <div className="mt-2 text-xs">Exact: <b>{exact.toFixed(4)}</b> | Approx: <b>{approx.toFixed(4)}</b></div>
    </Panel>
  );
}

function CoordinateLineLab(){
  const [x1,setX1]=useState(-2),[y1,setY1]=useState(1),[x2,setX2]=useState(3),[y2,setY2]=useState(2);
  const W=320,H=200,OX=W/2,OY=H/2,scale=25;
  const dx=x2-x1, dy=y2-y1; const m = dx!==0 ? dy/dx : Infinity; const c = (m!==Infinity)? (y1 - m*x1): undefined;
  const dist = Math.hypot(dx,dy);
  function toX(x:number){return OX + x*scale} function toY(y:number){return OY - y*scale}
  // Line across canvas: y = m x + c
  const line = ((): {x1:number;y1:number;x2:number;y2:number} => {
    if(m===Infinity){ return { x1: toX(x1), y1: 0, x2: toX(x1), y2: H }; }
    const xL = -W/(2*scale), xR = W/(2*scale);
    return { x1: toX(xL), y1: toY(m*xL + (c||0)), x2: toX(xR), y2: toY(m*xR + (c||0)) };
  })();
  return (
    <Panel title="Coordinate Geometry — Line by Two Points">
      <div className="text-sm text-slate-600 mb-2">Drag points; see slope m, distance and equation.</div>
      <svg width={W} height={H} className="border rounded bg-white">
        {/* axes + ticks with numbers */}
        <line x1={0} y1={OY} x2={W} y2={OY} stroke="#e5e7eb" />
        <line x1={OX} y1={0} x2={OX} y2={H} stroke="#e5e7eb" />
        {/* x ticks */}
        {Array.from({length: 11}).map((_,i)=>{
          const v = i-5; const X = OX + v*scale; return (
            <g key={`xt${i}`}>
              <line x1={X} y1={OY-3} x2={X} y2={OY+3} stroke="#cbd5e1" />
              {v!==0 && <text x={X} y={OY+12} fontSize={9} textAnchor="middle" fill="#64748b">{v}</text>}
              <line x1={X} y1={0} x2={X} y2={H} stroke="#f1f5f9" />
            </g>
          );
        })}
        {/* y ticks */}
        {Array.from({length: 9}).map((_,i)=>{
          const v = i-4; const Y = OY - v*scale; return (
            <g key={`yt${i}`}>
              <line x1={OX-3} y1={Y} x2={OX+3} y2={Y} stroke="#cbd5e1" />
              {v!==0 && <text x={OX-8} y={Y+3} fontSize={9} textAnchor="end" fill="#64748b">{v}</text>}
              <line x1={0} y1={Y} x2={W} y2={Y} stroke="#f1f5f9" />
            </g>
          );
        })}
        <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#2563eb" />
        {/* points */}
        <circle cx={toX(x1)} cy={toY(y1)} r={5} fill="#ef4444" />
        <circle cx={toX(x2)} cy={toY(y2)} r={5} fill="#10b981" />
      </svg>
      <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
        <div>
          <label>x₁ {x1.toFixed(1)}<input type="range" min={-5} max={5} step={0.1} value={x1} onChange={e=>setX1(parseFloat(e.target.value))} /></label>
          <label>y₁ {y1.toFixed(1)}<input type="range" min={-4} max={4} step={0.1} value={y1} onChange={e=>setY1(parseFloat(e.target.value))} /></label>
        </div>
        <div>
          <label>x₂ {x2.toFixed(1)}<input type="range" min={-5} max={5} step={0.1} value={x2} onChange={e=>setX2(parseFloat(e.target.value))} /></label>
          <label>y₂ {y2.toFixed(1)}<input type="range" min={-4} max={4} step={0.1} value={y2} onChange={e=>setY2(parseFloat(e.target.value))} /></label>
        </div>
      </div>
      <div className="mt-1 text-xs text-slate-700">m = {m===Infinity? '∞': m.toFixed(2)} {c!==undefined? `| y = ${m.toFixed(2)}x + ${c.toFixed(2)}` : '| x = '+x1.toFixed(2)} | d(P₁,P₂) = {dist.toFixed(2)}</div>
    </Panel>
  );
}

function IntegrationAreaLab(){
  const [a,setA]=useState(0),[b,setB]=useState(2),[n,setN]=useState(10);
  const W=320,H=200,OX=W/2,OY=H/2,scale=30; const f=(x:number)=>x*x/4 + 0.2*x + 0.2; // convex up
  const dx=(b-a)/n; const rects = Array.from({length:n},(_,i)=>{ const x=a+i*dx; const y=f(x); return {x,y,w:dx,h:y}; });
  function toX(x:number){return OX + x*scale} function toY(y:number){return OY - y*scale}
  const exact = useMemo(()=>{ // ∫(x^2/4 + 0.2x + 0.2) dx from a..b
    const F=(x:number)=> x*x*x/12 + 0.1*x*x + 0.2*x; return F(b)-F(a);
  },[a,b]);
  const approx = rects.reduce((s,r)=> s + r.h*dx, 0);
  return (
    <Panel title="Integration — Area Fill (definite integral)">
      <div className="text-sm text-slate-600 mb-2">Move limits; watch Riemann rectangles fill the area.</div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <label>a = {a.toFixed(2)}<input type="range" min={-2} max={1.5} step={0.05} value={a} onChange={e=>setA(parseFloat(e.target.value))} /></label>
        <label>b = {b.toFixed(2)}<input type="range" min={a+0.2} max={3} step={0.05} value={b} onChange={e=>setB(parseFloat(e.target.value))} /></label>
        <label>n = {n}<input type="range" min={2} max={40} step={1} value={n} onChange={e=>setN(parseInt(e.target.value))} /></label>
      </div>
      <svg width={W} height={H} className="mt-2 border rounded bg-white">
        {/* axes + ticks with numbers */}
        <line x1={0} y1={OY} x2={W} y2={OY} stroke="#e5e7eb" />
        <line x1={OX} y1={0} x2={OX} y2={H} stroke="#e5e7eb" />
        {/* x ticks */}
        {Array.from({length: 11}).map((_,i)=>{ const v=i-5; const X=OX + v*scale; return (
          <g key={`ix${i}`}>
            <line x1={X} y1={OY-3} x2={X} y2={OY+3} stroke="#cbd5e1" />
            {v!==0 && <text x={X} y={OY+12} fontSize={9} textAnchor="middle" fill="#64748b">{v}</text>}
            <line x1={X} y1={0} x2={X} y2={H} stroke="#f1f5f9" />
          </g>
        ); })}
        {/* y ticks */}
        {Array.from({length: 9}).map((_,i)=>{ const v=i-4; const Y=OY - v*scale; return (
          <g key={`iy${i}`}>
            <line x1={OX-3} y1={Y} x2={OX+3} y2={Y} stroke="#cbd5e1" />
            {v!==0 && <text x={OX-8} y={Y+3} fontSize={9} textAnchor="end" fill="#64748b">{v}</text>}
            <line x1={0} y1={Y} x2={W} y2={Y} stroke="#f1f5f9" />
          </g>
        ); })}
        {/* curve */}
        {Array.from({length:300}).map((_,i)=>{ const x=-3 + i*(6/300); const X=toX(x); const Y=toY(f(x)); const nx=-3 + (i+1)*(6/300); const NX=toX(nx); const NY=toY(f(nx)); return <line key={i} x1={X} y1={Y} x2={NX} y2={NY} stroke="#7c3aed" />; })}
        {/* rects */}
        {rects.map((r,i)=>{ const X=toX(r.x); const Y=toY(r.h); const Wd=r.w*scale; const Hd=r.h*scale; return <rect key={i} x={X} y={Y} width={Wd} height={Hd} fill="#06b6d4" opacity={0.25} stroke="#06b6d4" />; })}
      </svg>
      <div className="mt-1 text-xs text-slate-700">Approx area ≈ {approx.toFixed(3)} | Exact ≈ {exact.toFixed(3)}</div>
    </Panel>
  );
}

function DimensionalChecker(){
  const [expr,setExpr]=useState('F = m * a');
  // extremely light parser: supports m,a,v,t,L,M,T constants mapping
  // You can extend mapping below for quick wins
  const dims: Record<string,[number,number,number]> = { // [M,L,T]
    m:[1,0,0], a:[0,1,-2], v:[0,1,-1], t:[0,0,1], L:[0,1,0], M:[1,0,0], T:[0,0,1], F:[1,1,-2]
  };
  function add([m1,l1,t1]:[number,number,number],[m2,l2,t2]:[number,number,number]){ return [m1+m2,l1+l2,t1+t2] as [number,number,number]; }
  function sub(a:[number,number,number],b:[number,number,number]){ return add(a,[-b[0],-b[1],-b[2]] as any); }
  function mul([m1,l1,t1]:[number,number,number],[m2,l2,t2]:[number,number,number]){ return [m1+m2,l1+l2,t1+t2] as [number,number,number]; }
  function parseSide(side:string){
    // split by * and / only for demo
    const tokens = side.split(/([*/])/).map(s=>s.trim()).filter(Boolean);
    let cur:[number,number,number] = [0,0,0]; let op:'*'|'/'|'+'|'-'|'start'='start';
    for(const tk of tokens){
      if(tk==='*' || tk==='/'){ op = tk; continue; }
      const dim = dims[tk as keyof typeof dims] || [0,0,0];
      if(op==='start'){ cur = dim as any; }
      else if(op==='*'){ cur = mul(cur, dim as any); }
      else if(op==='/'){ cur = sub(cur, dim as any); }
    }
    return cur;
  }
  function check(){
    const [lhs,rhs] = expr.split('=');
    const L = parseSide(lhs||''); const R = parseSide(rhs||'');
    const ok = L[0]===R[0] && L[1]===R[1] && L[2]===R[2];
    return { L, R, ok };
  }
  const res = check();
  return (
    <Panel title="Dimensional Analysis — Quick Checker (alpha)">
      <div className="text-sm text-slate-600 mb-2">Type with symbols like F,m,a,v,t,L,M,T. Example: F = m * a, or v = L / t</div>
      <div className="grid md:grid-cols-2 gap-3 items-start">
        <div>
          <input className="border rounded px-2 py-1 w-full text-sm" value={expr} onChange={e=>setExpr(e.target.value)} />
          <div className="mt-2 text-xs">LHS [M,L,T] = [{res.L.join(', ')}] | RHS = [{res.R.join(', ')}] → {res.ok? <span className="text-green-600 font-semibold">Valid</span>: <span className="text-red-600 font-semibold">Mismatch</span>}</div>
        </div>
        {/* Mini bar chart for exponents */}
        <svg width={300} height={120} className="border rounded bg-white">
          <text x={10} y={14} fontSize={10} fill="#64748b">Exponents</text>
          {(['M','L','T'] as const).map((k, idx)=>{
            const l = res.L[idx]; const r = res.R[idx];
            const cx = 60 + idx*70; const base = 80; const unit = 12; // px per exponent
            const lH = Math.abs(l)*unit; const rH = Math.abs(r)*unit;
            return (
              <g key={k}>
                <line x1={cx} y1={20} x2={cx} y2={100} stroke="#e5e7eb" />
                {/* LHS above baseline, RHS below */}
                <rect x={cx-16} y={base - Math.max(0,lH)} width={14} height={lH} fill="#3b82f6" opacity={0.8} />
                <rect x={cx+2} y={base} width={14} height={rH} fill="#10b981" opacity={0.8} />
                <text x={cx-9} y={base - lH - 4} fontSize={9} fill="#1e40af">{l}</text>
                <text x={cx+5} y={base + rH + 12} fontSize={9} fill="#065f46">{r}</text>
                <text x={cx-3} y={112} fontSize={10} fill="#334155">{k}</text>
              </g>
            );
          })}
          <text x={185} y={14} fontSize={9} fill="#334155">blue=LHS, green=RHS</text>
        </svg>
      </div>
    </Panel>
  );
}

function UnitConversionSigFig(){
  const [val,setVal]=useState('2.50'); const [from,setFrom]=useState<'m'|'cm'|'mm'>('m'); const [to,setTo]=useState<'m'|'cm'|'mm'>('cm');
  function convert(v:number, from:string, to:string){ const m = from==='m'?1: from==='cm'?0.01:0.001; const target = to==='m'?1: to==='cm'?0.01:0.001; return v*m/target; }
  function sigFigs(s:string){ const x=s.trim(); if(!/^\d*\.?\d*$/.test(x)) return 0; if(x.includes('.')){ const stripped=x.replace(/^0+/,''); const just=stripped.replace(/^\./,'0.'); return just.replace(/\./,'').length; } const noLead=x.replace(/^0+/,''); const noTrail=noLead.replace(/0+$/,''); return noTrail.length||1; }
  const figs = sigFigs(val);
  const numeric = parseFloat(val || '0') || 0; const converted = convert(numeric, from, to);
  // round to sig figs
  const rounded = converted===0?0: Number(converted.toPrecision(Math.max(1,figs)));
  const maxBar = Math.max(Math.abs(numeric), Math.abs(converted)) || 1;
  const scale = 240 / maxBar; // px per unit relative to bigger value
  return (
    <Panel title="Units & Sig Figs — Convert + Round">
      <div className="grid md:grid-cols-2 gap-3 items-center">
        <div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <label>Value<input className="border rounded px-2 py-1 w-full" value={val} onChange={e=>setVal(e.target.value)} /></label>
            </div>
            <div>
              <label>From
                <select className="border rounded px-2 py-1 w-full" value={from} onChange={e=>setFrom(e.target.value as any)}>
                  <option value="m">m</option><option value="cm">cm</option><option value="mm">mm</option>
                </select>
              </label>
            </div>
            <div>
              <label>To
                <select className="border rounded px-2 py-1 w-full" value={to} onChange={e=>setTo(e.target.value as any)}>
                  <option value="m">m</option><option value="cm">cm</option><option value="mm">mm</option>
                </select>
              </label>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-700">Sig figs in input: {figs} → Converted: <b>{rounded}</b> {to}</div>
        </div>
        {/* Visual compare of magnitudes */}
        <svg width={300} height={110} className="border rounded bg-white">
          <text x={10} y={14} fontSize={10} fill="#64748b">Magnitude comparison</text>
          <g transform="translate(10,28)">
            <rect x={0} y={8} width={Math.max(0,numeric*scale)} height={18} fill="#6366f1" />
            <text x={Math.max(4,numeric*scale + 6)} y={22} fontSize={10} fill="#334155">{val} {from}</text>
            <rect x={0} y={52} width={Math.max(0,converted*scale)} height={18} fill="#10b981" />
            <text x={Math.max(4,converted*scale + 6)} y={66} fontSize={10} fill="#334155">{rounded} {to}</text>
          </g>
        </svg>
      </div>
    </Panel>
  );
}

export default function BasicMathsIntermediatePlayground(){
  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-semibold text-card-foreground">Playground — Hands‑on Visuals (Intermediate)</h3>
      <p className="text-muted-foreground text-sm">2D + 3D demos tied to the theory. Built for fast Gen‑Z intuition.</p>
      <div className="grid grid-cols-1 gap-6">
        <Vectors3DLab />
        <CoordinateLineLab />
        <IntegrationAreaLab />
        <DimensionalChecker />
        <UnitConversionSigFig />
        <SmallAngleLab />
        <BinomialLab />
      </div>
    </div>
  );
}


