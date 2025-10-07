import { useEffect, useMemo, useRef, useState } from 'react';

// Lightweight beginner playground: pure React + SVG/HTML (no heavy libs)
// Labs: Units & Dimensions, Sig Figs, Quadratic, Unit Circle, Derivative, Integral

export default function BasicMathsPlayground() {
  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-semibold text-card-foreground">Playground — Learn by Doing</h3>
      <p className="text-muted-foreground text-sm">Drag, slide and explore. Concepts from the theory are made tangible here.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardVectors />
        <CardUnits />
        <CardSigFigs />
        <CardQuadratic />
        <CardUnitCircle />
        <CardDerivative />
        <CardIntegral />
        <CardProbability />
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: any }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 ring-1 ring-slate-100">
      <div className="font-semibold mb-2 text-slate-900">{title}</div>
      {children}
    </div>
  );
}

// Reusable axes with numeric ticks for beginner-friendly visuals
function SvgAxes({ W, H, scale, maxX, maxY }: { W:number; H:number; scale:number; maxX:number; maxY:number }){
  const OX = W/2, OY = H/2;
  const ticksX = Array.from({length: maxX*2+1}, (_,i)=> i-maxX);
  const ticksY = Array.from({length: maxY*2+1}, (_,i)=> i-maxY);
  return (
    <g>
      <line x1={0} y1={OY} x2={W} y2={OY} stroke="#e5e7eb" />
      <line x1={OX} y1={0} x2={OX} y2={H} stroke="#e5e7eb" />
      {ticksX.map(v=> (
        <g key={`tx${v}`}>
          <line x1={OX + v*scale} y1={OY-3} x2={OX + v*scale} y2={OY+3} stroke="#cbd5e1" />
          {v!==0 && <text x={OX + v*scale} y={OY+14} fontSize={10} textAnchor="middle" fill="#64748b">{v}</text>}
        </g>
      ))}
      {ticksY.map(v=> (
        <g key={`ty${v}`}>
          <line x1={OX-3} y1={OY - v*scale} x2={OX+3} y2={OY - v*scale} stroke="#cbd5e1" />
          {v!==0 && <text x={OX-10} y={OY - v*scale + 3} fontSize={10} textAnchor="end" fill="#64748b">{v}</text>}
        </g>
      ))}
    </g>
  );
}

function CardUnits() {
  const [l, setL] = useState(1);
  const [t, setT] = useState(-1);
  const [m, setM] = useState(0);
  const label = useMemo(() => `M^${m} L^${l} T^${t}`, [m, l, t]);
  function classify(m:number,l:number,t:number){
    if(m===0&&l===1&&t===-1) return 'Velocity';
    if(m===0&&l===1&&t===-2) return 'Acceleration';
    if(m===1&&l===1&&t===-2) return 'Force';
    if(m===0&&l===0&&t===0) return 'Dimensionless';
    return 'Custom';
  }
  return (
    <Panel title="Units & Dimensions">
      <div className="text-sm text-slate-600 mb-2">Adjust exponents to match common quantities.</div>
      <div className="flex items-center gap-3 text-sm">
        <span>M</span>
        <input type="range" min={-2} max={2} step={1} value={m} onChange={e=>setM(parseInt(e.target.value))} />
        <span>L</span>
        <input type="range" min={-2} max={2} step={1} value={l} onChange={e=>setL(parseInt(e.target.value))} />
        <span>T</span>
        <input type="range" min={-3} max={2} step={1} value={t} onChange={e=>setT(parseInt(e.target.value))} />
      </div>
      <div className="mt-3 text-slate-800">Dimension: <span className="font-mono font-semibold">[{label}]</span> <span className="ml-2 text-xs text-slate-600">{classify(m,l,t)}</span></div>
      <div className="mt-2 text-xs text-slate-600">Try velocity [M^0 L^1 T^-1], acceleration [M^0 L^1 T^-2], force [M^1 L^1 T^-2].</div>

      {/* Mini bar graph for exponents */}
      <svg width={320} height={170} className="mt-3 border rounded bg-white">
        <line x1={40} y1={85} x2={300} y2={85} stroke="#e5e7eb" />
        {[-3,-2,-1,0,1,2,3].map((v)=>{
          const y = 85 - v*20;
          return (
            <g key={v}>
              <line x1={38} y1={y} x2={300} y2={y} stroke="#f1f5f9" />
              <text x={30} y={y+3} fontSize={10} textAnchor="end" fill="#64748b">{v}</text>
            </g>
          );
        })}
        {(['M','L','T'] as const).map((k,idx)=>{
          const val = k==='M'?m: k==='L'?l: t;
          const x = 70 + idx*80;
          const y0 = 85; const y = 85 - Math.max(-3, Math.min(3, val))*20;
          const h = Math.abs((val)*20);
          return (
            <g key={k}>
              <rect x={x-12} y={Math.min(y0,y)} width={24} height={h} fill={k==='M'? '#60a5fa' : k==='L'? '#34d399':'#f59e0b'} opacity={0.85} />
              <line x1={x} y1={y0-60} x2={x} y2={y0+60} stroke="#cbd5e1" />
              <text x={x} y={150} fontSize={12} textAnchor="middle" fill="#334155">{k}</text>
              <text x={x} y={y-6*Math.sign(val||1)} fontSize={10} textAnchor="middle" fill="#475569">{val}</text>
            </g>
          );
        })}
      </svg>
    </Panel>
  );
}

function CardVectors() {
  const [ax, setAx] = useState(2);
  const [ay, setAy] = useState(1);
  const [bx, setBx] = useState(1);
  const [by, setBy] = useState(-2);

  const A = { x: ax, y: ay };
  const B = { x: bx, y: by };
  const S = { x: ax + bx, y: ay + by };

  function length(v: {x:number;y:number}) { return Math.hypot(v.x, v.y); }
  function dot(a:{x:number;y:number}, b:{x:number;y:number}) { return a.x*b.x + a.y*b.y; }
  function crossMag(a:{x:number;y:number}, b:{x:number;y:number}) { return a.x*b.y - a.y*b.x; }

  const W = 280, H = 180; const OX = W/2, OY = H/2; const scale = 20; // 1 unit = 20px

  function vector(el:{x:number;y:number}, color:string, id:string, label:string){
    const ex = OX + el.x*scale; const ey = OY - el.y*scale;
    return (
      <g>
        <defs>
          <marker id={id} markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill={color} />
          </marker>
        </defs>
        <line x1={OX} y1={OY} x2={ex} y2={ey} stroke={color} strokeWidth={3} markerEnd={`url(#${id})`} />
        <circle cx={ex} cy={ey} r={4} fill={color} />
        <text x={ex + 6} y={ey - 6} fontSize={11} fill={color}>{label}</text>
      </g>
    );
  }

  return (
    <Panel title="Vectors — Add, Dot, Cross (area)">
      <div className="text-sm text-slate-600 mb-2">Adjust components of A (blue) and B (red). Coordinates use units (−5…5). Sum A+B is green.</div>
      <svg width={W} height={H} className="border rounded bg-white">
        <SvgAxes W={W} H={H} scale={scale} maxX={5} maxY={4} />
        {vector(A, '#2563eb', 'arrowA', 'A')}
        {vector(B, '#dc2626', 'arrowB', 'B')}
        {vector(S, '#059669', 'arrowS', 'A+B')}
        <text x={10} y={16} fill="#334155" fontSize={11}>A=({A.x.toFixed(1)},{A.y.toFixed(1)})  B=({B.x.toFixed(1)},{B.y.toFixed(1)})</text>
        <text x={10} y={32} fill="#334155" fontSize={11}>|A|={length(A).toFixed(2)}  |B|={length(B).toFixed(2)}</text>
        <text x={10} y={48} fill="#334155" fontSize={11}>A·B={dot(A,B).toFixed(2)}  |A×B|={Math.abs(crossMag(A,B)).toFixed(2)}</text>
      </svg>
      <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
        <div>
          <label className="block">A.x: {ax.toFixed(1)}</label>
          <input type="range" min={-5} max={5} step={0.5} value={ax} onChange={e=>setAx(parseFloat(e.target.value))} className="w-full" />
          <label className="block">A.y: {ay.toFixed(1)}</label>
          <input type="range" min={-4} max={4} step={0.5} value={ay} onChange={e=>setAy(parseFloat(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block">B.x: {bx.toFixed(1)}</label>
          <input type="range" min={-5} max={5} step={0.5} value={bx} onChange={e=>setBx(parseFloat(e.target.value))} className="w-full" />
          <label className="block">B.y: {by.toFixed(1)}</label>
          <input type="range" min={-4} max={4} step={0.5} value={by} onChange={e=>setBy(parseFloat(e.target.value))} className="w-full" />
        </div>
      </div>
      <div className="mt-1 text-xs text-slate-600">Tip: A·B &gt; 0 → similar direction; A·B &lt; 0 → opposite; |A×B| equals parallelogram area.</div>
    </Panel>
  );
}

function CardSigFigs() {
  const [value, setValue] = useState('4.50');
  function countSigFigs(s: string): number {
    const x = s.trim();
    if (!/^\d*\.?\d*$/.test(x)) return 0;
    if (x.includes('.')) {
      const stripped = x.replace(/^0+/, '');
      const just = stripped.replace(/^\./, '0.');
      return just.replace(/\./, '').length;
    }
    // integer: strip trailing zeros
    const noLead = x.replace(/^0+/, '');
    const noTrail = noLead.replace(/0+$/, '');
    return noTrail.length || 1;
  }
  const figs = useMemo(() => countSigFigs(value), [value]);
  return (
    <Panel title="Significant Figures">
      <div className="text-sm text-slate-600 mb-2">Enter a measured value.</div>
      <input className="border rounded px-2 py-1 text-sm" value={value} onChange={e=>setValue(e.target.value)} />
      <div className="mt-2 text-slate-800">Significant figures: <span className="font-semibold">{figs}</span></div>
      <div className="mt-1 text-xs text-slate-600">e.g., 4.50 → 3 sig figs (trailing zero after decimal counts).</div>
    </Panel>
  );
}

function CardQuadratic() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-5);
  const [c, setC] = useState(6);
  const disc = useMemo(() => b*b - 4*a*c, [a,b,c]);
  const roots = useMemo(() => {
    if (disc < 0 || a === 0) return null;
    const r1 = (-b + Math.sqrt(disc)) / (2*a);
    const r2 = (-b - Math.sqrt(disc)) / (2*a);
    return [r1, r2];
  }, [a,b,c,disc]);

  const width = 280, height = 160, scale = 20;
  function f(x:number){ return a*x*x + b*x + c; }
  const path = useMemo(()=>{
    let d = '';
    let first = true;
    for (let sx=-5; sx<=5; sx+=0.1){
      const x=sx, y=f(x);
      const X = width/2 + x*scale;
      const Y = height/2 - y*scale;
      d += (first?`M ${X} ${Y}`:` L ${X} ${Y}`);
      first = false;
    }
    return d;
  },[a,b,c]);

  return (
    <Panel title="Algebra — Quadratic Sandbox">
      <div className="text-sm text-slate-600 mb-2">Adjust coefficients and observe roots and curve.</div>
      <div className="flex gap-3 items-center text-sm">
        <label>a<input type="range" min={-3} max={3} step={0.1} value={a} onChange={e=>setA(parseFloat(e.target.value))} /></label>
        <label>b<input type="range" min={-6} max={6} step={0.1} value={b} onChange={e=>setB(parseFloat(e.target.value))} /></label>
        <label>c<input type="range" min={-6} max={6} step={0.1} value={c} onChange={e=>setC(parseFloat(e.target.value))} /></label>
      </div>
      <svg width={width} height={height} className="mt-2 border rounded bg-white">
        <SvgAxes W={width} H={height} scale={scale} maxX={5} maxY={3} />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth={2} />
        {roots && roots.map((r, i)=>{
          const X = width/2 + r*scale;
          const Y = height/2;
          return <circle key={i} cx={X} cy={Y} r={4} fill="#10b981" />
        })}
      </svg>
      <div className="mt-2 text-xs text-slate-700">Discriminant: {disc.toFixed(2)} {roots? `| Roots: ${roots[0].toFixed(2)}, ${roots[1].toFixed(2)}`: '| No real roots'}</div>
    </Panel>
  );
}

function CardProbability() {
  const [trials, setTrials] = useState(1000);
  const [heads, setHeads] = useState(0);
  const tails = trials - heads;

  useEffect(() => {
    let h = 0; for (let i=0;i<trials;i++){ if (Math.random() < 0.5) h++; }
    setHeads(h);
  }, [trials]);

  const W = 280, H = 140;
  const hPct = heads / trials;
  const tPct = tails / trials;

  return (
    <Panel title="Probability — Coin Toss Simulator">
      <div className="text-sm text-slate-600 mb-2">Increase trials and see frequencies approach 50-50.</div>
      <label className="text-sm">Trials: {trials}</label>
      <input type="range" min={10} max={10000} step={10} value={trials} onChange={e=>setTrials(parseInt(e.target.value))} className="w-full" />
      <svg width={W} height={H} className="mt-2 border rounded bg-white">
        <rect x={0} y={0} width={W} height={H} fill="#fff" />
        <line x1={0} y1={H-20} x2={W} y2={H-20} stroke="#e5e7eb" />
        <rect x={40} y={H-20 - hPct*(H-40)} width={80} height={hPct*(H-40)} fill="#2563eb" />
        <rect x={160} y={H-20 - tPct*(H-40)} width={80} height={tPct*(H-40)} fill="#10b981" />
        <text x={80} y={H-4} textAnchor="middle" fontSize={11} fill="#334155">Heads {Math.round(hPct*100)}%</text>
        <text x={200} y={H-4} textAnchor="middle" fontSize={11} fill="#334155">Tails {Math.round(tPct*100)}%</text>
      </svg>
      <div className="mt-2 text-xs text-slate-700">Heads: {heads} | Tails: {tails} | Heads%: {(hPct*100).toFixed(2)}</div>
    </Panel>
  );
}

function CardUnitCircle() {
  const [theta, setTheta] = useState(Math.PI/6);
  const cx = 90, cy = 90, r = 60;
  const x = cx + r*Math.cos(theta);
  const y = cy - r*Math.sin(theta);
  return (
    <Panel title="Trigonometry — Unit Circle">
      <div className="text-sm text-slate-600 mb-2">Slide angle and see sine/cosine projections.</div>
      <input type="range" min={0} max={Math.PI*2} step={0.01} value={theta} onChange={e=>setTheta(parseFloat(e.target.value))} />
      <svg width={180} height={180} className="mt-2 border rounded bg-white">
        <circle cx={cx} cy={cy} r={r} fill="#f8fafc" stroke="#e5e7eb" />
        <line x1={cx-r-5} x2={cx+r+5} y1={cy} y2={cy} stroke="#e5e7eb" />
        <line y1={cy-r-5} y2={cy+r+5} x1={cx} x2={cx} stroke="#e5e7eb" />
        <line x1={cx} y1={cy} x2={x} y2={y} stroke="#6366f1" strokeWidth={2} />
        {/* cosine (x-projection) */}
        <line x1={cx} y1={cy} x2={x} y2={cy} stroke="#06b6d4" />
        {/* sine (y-projection) */}
        <line x1={x} y1={cy} x2={x} y2={y} stroke="#10b981" />
        <circle cx={x} cy={y} r={4} fill="#ef4444" />
        <text x={cx+r-12} y={cy-6} fontSize={10} fill="#64748b">0°</text>
        <text x={cx-6} y={cy-r+12} fontSize={10} fill="#64748b">90°</text>
        <text x={cx-r+4} y={cy-6} fontSize={10} fill="#64748b">180°</text>
        <text x={cx-8} y={cy+r-6} fontSize={10} fill="#64748b">270°</text>
      </svg>
      <div className="mt-2 text-xs text-slate-700">sin θ = {Math.sin(theta).toFixed(3)}, cos θ = {Math.cos(theta).toFixed(3)}</div>
    </Panel>
  );
}

function CardDerivative() {
  const [x0, setX0] = useState(1);
  function f(x:number){ return x*x; }
  function df(x:number){ return 2*x; }
  const width=280, height=160, scale=20;
  const y0 = f(x0);
  const X0 = width/2 + x0*scale, Y0 = height/2 - y0*scale;
  const slope = df(x0);
  const lineX1 = -7, lineX2 = 7;
  const Y1 = height/2 - (f(x0) + slope*(lineX1 - x0))*scale;
  const Y2 = height/2 - (f(x0) + slope*(lineX2 - x0))*scale;
  const path = useMemo(()=>{
    let d='';
    for(let sx=-7;sx<=7;sx+=0.2){
      const x=sx, y=f(x);
      const X=width/2 + x*scale; const Y=height/2 - y*scale;
      d += (sx===-7?`M ${X} ${Y}`:` L ${X} ${Y}`);
    }
    return d;
  },[]);
  return (
    <Panel title="Differentiation — Tangent & Slope">
      <div className="text-sm text-slate-600 mb-2">Drag x to move the tangent point on y=x^2.</div>
      <input type="range" min={-3} max={3} step={0.1} value={x0} onChange={e=>setX0(parseFloat(e.target.value))} />
      <svg width={width} height={height} className="mt-2 border rounded bg-white">
        <SvgAxes W={width} H={height} scale={scale} maxX={5} maxY={3} />
        <path d={path} fill="none" stroke="#7c3aed" strokeWidth={2} />
        <line x1={width/2 + lineX1*scale} y1={Y1} x2={width/2 + lineX2*scale} y2={Y2} stroke="#10b981" />
        <circle cx={X0} cy={Y0} r={4} fill="#ef4444" />
      </svg>
      <div className="mt-2 text-xs text-slate-700">At x = {x0.toFixed(2)}: slope = {slope.toFixed(2)}</div>
    </Panel>
  );
}

function CardIntegral() {
  const [n, setN] = useState(8);
  const width=320, height=200, scale=30; // larger canvas to make triangle bigger
  function f(x:number){ return x; }
  const a=0, b=2;
  const exact = (b*b/2 - a*a/2);
  const rects = useMemo(()=>{
    const dx = (b-a)/n; const list: {x:number,y:number,w:number,h:number}[] = [];
    for(let i=0;i<n;i++){
      const x=a+i*dx; const y=f(x);
      list.push({x, y, w:dx, h:y});
    }
    return list;
  },[n]);
  return (
    <Panel title="Integration — Area Under Curve">
      <div className="text-sm text-slate-600 mb-2">Left Riemann sum for y = x on [0,2].</div>
      <input type="range" min={2} max={30} step={1} value={n} onChange={e=>setN(parseInt(e.target.value))} />
      <svg width={width} height={height} className="mt-2 border rounded bg-white">
        <SvgAxes W={width} H={height} scale={scale} maxX={5} maxY={3} />
        {/* y=x */}
        <line x1={width/2 + 0*scale} y1={height/2 - 0*scale} x2={width/2 + 2*scale} y2={height/2 - 2*scale} stroke="#ef4444" />
        {/* rectangles */}
        {rects.map((r, i)=>{
          const X = width/2 + r.x*scale;
          const Y = height/2 - r.h*scale;
          const W = r.w*scale; const H = r.h*scale;
          return <rect key={i} x={X} y={Y} width={W} height={H} fill="#06b6d4" opacity={0.2} stroke="#06b6d4" />
        })}
      </svg>
      <div className="mt-2 text-xs text-slate-700">Exact area = {exact.toFixed(2)} | n = {n}</div>
    </Panel>
  );
}


