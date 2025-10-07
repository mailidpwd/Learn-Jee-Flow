// SetsRelationsPlaygroundV2.jsx
// Drop into src/, run after installing dependencies below.
// Plain JS React (no TypeScript) for easier drop-in.

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import * as martinez from "martinez-polygon-clipping";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";

/*
Dependencies (npm):
react react-dom d3 three @react-three/fiber @react-three/drei martinez-polygon-clipping framer-motion tailwindcss
*/

const LS = "srf_v2_state";

function useLocal(key, init) {
  const [s, setS] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? init; } catch { return init; }
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(s)), [key, s]);
  return [s, setS];
}

/* ---------- Utility helpers ---------- */
const uid = (p='x') => p + Math.random().toString(36).slice(2,9);
const toScreen = (x,y,scale=40) => [210 + x*scale, 210 - y*scale];

/* ---------- Argand Set Visualizer with polygon boolean (martinez) ---------- */
function ArgandPlay({ state, setState }) {
  const svgRef = useRef(null);
  const [drawPts, setDrawPts] = useState([]);
  const [mode, setMode] = useState("draw"); // draw | edit | boolean
  const [selA, setSelA] = useState(null);
  const [op, setOp] = useState("union");

  function onSvgClick(e) {
    if (mode !== "draw") return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const x = Number(((sx - 210)/40).toFixed(3)), y = Number(((210 - sy)/40).toFixed(3));
    setDrawPts([...drawPts, [x,y]]);
  }
  function commitPolygon() {
    if (drawPts.length < 3) return;
    const poly = { id: uid('P'), pts: drawPts.map(p => p) };
    setState({...state, polygons: [...state.polygons, poly]});
    setDrawPts([]);
  }
  function applyBoolean() {
    if(!selA || !state.polygons.find(p=>p.id===selA) || state.polygons.length < 2) return;
    const A = [ state.polygons.find(p=>p.id===selA).pts.map(pt=>[pt[0],pt[1]]) ];
    const B = [ state.polygons.find(p=>p.id!==selA).pts.map(pt=>[pt[0],pt[1]]) ];
    let res = [];
    try {
      if(op === "union") res = martinez.union(A, B);
      if(op === "intersect") res = martinez.intersection(A, B);
      if(op === "diff") res = martinez.diff(A, B);
      if(op === "xor") res = martinez.xor(A, B);
    } catch (e) { res = []; }
    const polys = (res || []).map((poly) => ({ id: uid('R'), pts: poly[0].map(p=>[p[0], p[1]]) }));
    setState({...state, resultPolygons: polys});
  }

  return (
    <div className="p-3">
      <div className="flex gap-2 mb-2 items-center">
        <button className="btn" onClick={()=>setMode(mode==='draw'?'edit':'draw')}>{mode==='draw'?'Switch: Edit':'Switch: Draw'}</button>
        <button className="btn" onClick={commitPolygon}>Commit</button>
        <select className="input" value={op} onChange={(e)=>setOp(e.target.value)}>
          <option value="union">Union</option>
          <option value="intersect">Intersection</option>
          <option value="diff">A \\ B</option>
          <option value="xor">Symmetric diff</option>
        </select>
        <button className="btn" onClick={applyBoolean}>Apply Boolean (A vs B)</button>
        <div className="text-xs text-gray-600">Draw polygons. Commit adds to palette. Pick A then use second as B.</div>
      </div>

      <svg ref={svgRef} width={420} height={420} className="border rounded bg-white" onClick={onSvgClick} role="img" aria-label="Argand canvas">
        <rect width="100%" height="100%" fill="#fafafa" />
        <g transform="translate(0,0)">
          <line x1={0} y1={210} x2={420} y2={210} stroke="#ddd"/>
          <line x1={210} y1={0} x2={210} y2={420} stroke="#ddd"/>
        </g>

        <g transform="translate(0,0)">
          {state.polygons.map((poly, i) => {
            const d = poly.pts.map(p=> toScreen(p[0], p[1]).join(",")).join(" ");
            const color = ['#60a5fa','#f472b6','#f6ad55','#34d399'][i%4];
            return <polygon key={poly.id} points={d} fill={color} opacity={0.22} stroke={color} strokeWidth={1.4} onClick={() => setSelA(poly.id)} />;
          })}
          {state.resultPolygons.map(r => {
            const d = r.pts.map(p=> toScreen(p[0], p[1]).join(",")).join(" ");
            return <polygon key={r.id} points={d} fill="#7c3aed" opacity={0.28} stroke="#7c3aed" strokeDasharray="4 3" />;
          })}
          {drawPts.length>0 && <polyline points={drawPts.map(p=>toScreen(p[0],p[1]).join(",")).join(" ")} fill="none" stroke="#ef4444" strokeWidth="1.6" />}
          {drawPts.map((p, i)=> <circle key={i} cx={toScreen(p[0],p[1])[0]} cy={toScreen(p[0],p[1])[1]} r={4} fill="#ef4444" />)}
        </g>
      </svg>
    </div>
  );
}

/* ---------- Relation Editor with adjacency matrix + force graph ---------- */
function RelationPlay({ elements, setElements, relation, setRelation }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width=420, height=260;
    svg.attr("width", width).attr("height", height);
    const nodes = elements.map(e=>({id:e}));
    const links = relation.map(([a,b])=> ({source:a, target:b}));

    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d=>d.id).distance(90))
      .force("charge", d3.forceManyBody().strength(-180))
      .force("center", d3.forceCenter(width/2, height/2))
      .stop();

    for (let i=0;i<120;i++) sim.tick();

    const link = svg.append("g").selectAll("line").data(links).enter().append("line").attr("stroke","#888").attr("stroke-width",1.4);
    const node = svg.append("g").selectAll("g").data(nodes).enter().append("g").attr("transform", d=>`translate(${d.x},${d.y})`);
    node.append("circle").attr("r",16).attr("fill","#60a5fa");
    node.append("text").text(d=>d.id).attr("text-anchor","middle").attr("dy","0.36em").attr("fill","#042c5c");

    link.attr("x1",d=>d.source.x).attr("y1",d=>d.source.y).attr("x2",d=>d.target.x).attr("y2",d=>d.target.y);
  }, [elements, relation]);

  function togglePair(a,b) {
    const exists = relation.some(r=>r[0]===a && r[1]===b);
    if(exists) setRelation(relation.filter(r=>!(r[0]===a && r[1]===b)));
    else setRelation([...relation, [a,b]]);
  }
  function addElement(name) {
    if(!name) return;
    if(elements.includes(name.trim())) return;
    setElements([...elements, name.trim()]);
  }

  const reflex = elements.every(a => relation.some(r=>r[0]===a && r[1]===a));
  const symmetric = relation.every(r=> relation.some(s=> s[0]===r[1] && s[1]===r[0]));
  const transitive = relation.every(r=> {
    return relation.filter(s=>s[0]===r[1]).every(s2=> relation.some(t=> t[0]===r[0] && t[1]===s2[1]));
  });

  return (
    <div className="p-3">
      <div className="flex gap-2 mb-2">
        <input placeholder="new element" className="input" id="ne"/>
        <button className="btn" onClick={()=>{ const v=document.getElementById('ne').value; addElement(v); document.getElementById('ne').value='';}}>Add element</button>
        <div className="text-xs text-gray-600">Click matrix to toggle relation pairs. Graph shows current pairs.</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-2 border rounded">
          <div className="text-sm font-medium mb-1">Adjacency Matrix</div>
          <div style={{overflow:'auto'}}>
            <table className="table-auto border-collapse">
              <thead>
                <tr><th></th>{elements.map(e=> <th key={e} className="p-1 border">{e}</th>)}</tr>
              </thead>
              <tbody>
                {elements.map(r=> <tr key={r}><td className="p-1 border font-medium">{r}</td>{elements.map(c=>{
                  const on = relation.some(p=>p[0]===r && p[1]===c);
                  return <td key={c} className="p-1 border text-center"><input type="checkbox" checked={on} onChange={()=>togglePair(r,c)}/></td>;
                })}</tr>)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-2 border rounded">
          <div className="text-sm font-medium mb-1">Graph</div>
          <svg ref={svgRef} className="border rounded" width={420} height={260}/>
          <div className="flex gap-2 mt-2">
            <div className={`badge ${reflex?'bg-green-200':'bg-red-200'}`}>Reflexive</div>
            <div className={`badge ${symmetric?'bg-green-200':'bg-red-200'}`}>Symmetric</div>
            <div className={`badge ${transitive?'bg-green-200':'bg-red-200'}`}>Transitive</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 2D Hasse ---------- */
function Hasse2D({ elements, order }) {
  const svgRef = useRef(null);
  useEffect(() => {
    const svg = d3.select(svgRef.current); svg.selectAll("*").remove();
    const w=420,h=260;
    svg.attr("width",w).attr("height",h);
    if(elements.length===0) return;
    const idx = Object.fromEntries(elements.map((e,i)=>[e,i]));
    const n = elements.length;
    const adj = Array.from({length:n},()=>[]);
    order.forEach(([a,b])=>{ if(idx[a]!==undefined && idx[b]!==undefined) adj[idx[a]].push(idx[b]); });
    const indeg=Array(n).fill(0); adj.forEach(list=>list.forEach(v=>indeg[v]++));
    const q = []; indeg.forEach((d,i)=>{ if(d===0) q.push(i); });
    const rank=Array(n).fill(0);
    while(q.length){ const u=q.shift(); adj[u].forEach(v=>{ rank[v]=Math.max(rank[v], rank[u]+1); indeg[v]--; if(indeg[v]===0) q.push(v); }); }
    const maxR = Math.max(0,...rank);
    const layers = Array.from({length:maxR+1},()=>[]);
    for(let i=0;i<n;i++) layers[rank[i]].push(i);
    const nodes = elements.map((id,i)=>({id, r:rank[i], x:0, y:0}));
    layers.forEach((layer,li)=>{ const gap = layer.length; layer.forEach((nodeIdx, k)=>{ nodes[nodeIdx].x = (w/(gap+1))*(k+1); nodes[nodeIdx].y = 30 + li*( (h-60)/Math.max(1,maxR) ); }); });
    const g = svg.append("g");
    order.forEach(([a,b])=>{ const A=nodes[idx[a]], B=nodes[idx[b]]; g.append("line").attr("x1",A.x).attr("y1",A.y).attr("x2",B.x).attr("y2",B.y).attr("stroke","#444").attr("stroke-width",1.2); });
    const ng = svg.append("g").selectAll("g").data(nodes).enter().append("g").attr("transform",d=>`translate(${d.x},${d.y})`);
    ng.append("circle").attr("r",14).attr("fill","#f59e0b");
    ng.append("text").text(d=>d.id).attr("text-anchor","middle").attr("dy","0.35em");
  },[elements,order]);
  return <svg ref={svgRef} className="border rounded bg-white" width={420} height={260}></svg>;
}

/* ---------- 3D Hasse ---------- */
function Hasse3D({ elements, order }) {
  const group = useRef();
  useFrame((state, dt)=>{ if(group.current) group.current.rotation.y += dt*0.2; });
  const idx = Object.fromEntries(elements.map((e,i)=>[e,i]));
  const n = elements.length;
  const ranks = {};
  order.forEach(([a,b])=> { ranks[b] = Math.max(ranks[b]||0, (ranks[a]||0)+1); });
  const maxR = Math.max(0, ...Object.values(ranks).map(v=>v||0));
  const pos = elements.map((e,i)=>{
    const r = ranks[e]||0;
    const theta = (i/n) * Math.PI*2;
    return { x: Math.cos(theta)*1.3, y: (r - maxR/2)*0.8, z: Math.sin(theta)*1.3, id: e };
  });
  return (
    <group ref={group}>
      {pos.map((p,i)=>(
        <mesh key={i} position={[p.x,p.y,p.z]}>
          <sphereGeometry args={[0.12, 12, 8]} />
          <meshStandardMaterial color="#0ea5a4" />
        </mesh>
      ))}
      {order.map((pair,i)=>{
        const a=pos[idx[pair[0]]], b=pos[idx[pair[1]]];
        if(!a||!b) return null;
        const mx=(a.x+b.x)/2, my=(a.y+b.y)/2, mz=(a.z+b.z)/2;
        return <mesh key={i} position={[mx,my,mz]}>
          <cylinderGeometry args={[0.02,0.02, Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z), 6]} />
          <meshStandardMaterial color="#444" />
        </mesh>;
      })}
    </group>
  );
}

/* ---------- Function mapper ---------- */
function FunctionMapper({ domain, codomain, mapping, setMapping }) {
  function toggle(a,b){
    const exists = mapping.some(m=>m[0]===a && m[1]===b);
    if(exists) setMapping(mapping.filter(m=>!(m[0]===a && m[1]===b)));
    else setMapping([ ...mapping.filter(m=>m[0]!==a), [a,b] ]);
  }
  const injective = (()=>{ const vals = mapping.map(m=>m[1]); return new Set(vals).size === vals.length; })();
  const surjective = (()=> codomain.every(c=> mapping.some(m=>m[1]===c)))();
  return (
    <div className="p-3 grid grid-cols-3 gap-2">
      <div className="bg-white border p-2 rounded">
        <div className="font-medium">Domain</div>
        {domain.map(d=> <div key={d} className="p-1">{d}</div>)}
      </div>
      <div className="bg-white border p-2 rounded">
        <div className="font-medium">Map (toggle)</div>
        <table className="table-auto border-collapse">
          <thead><tr><th></th>{codomain.map(c=> <th key={c} className="p-1 border">{c}</th>)}</tr></thead>
          <tbody>
            {domain.map(d=> <tr key={d}><td className="p-1 border">{d}</td>{codomain.map(c=> {
              const on = mapping.some(m=>m[0]===d && m[1]===c);
              return <td key={c} className="p-1 border text-center"><input type="checkbox" checked={on} onChange={()=>toggle(d,c)} /></td>;
            })}</tr>)}
          </tbody>
        </table>
      </div>
      <div className="bg-white border p-2 rounded">
        <div className="font-medium">Tests</div>
        <div className="mt-2">Injective: <span className={injective?"text-green-700":"text-red-600"}>{String(injective)}</span></div>
        <div>Surjective: <span className={surjective?"text-green-700":"text-red-600"}>{String(surjective)}</span></div>
        <div>Bijective: <span className={(injective && surjective)?"text-green-700":"text-red-600"}>{String(injective && surjective)}</span></div>
      </div>
    </div>
  );
}

/* ---------- Counting visualization ---------- */
function CountingPlay() {
  const [m,setM] = useState(3);
  const [n,setN] = useState(3);
  const total = useMemo(()=> BigInt(n)**BigInt(m),[m,n]);
  const perms = useMemo(()=>{ if(m>n) return BigInt(0); let res=BigInt(1); for(let k=0;k<m;k++) res*=BigInt(n-k); return res; },[m,n]);
  return (
    <div className="p-3 grid grid-cols-3 gap-2">
      <div className="bg-white border p-2 rounded">
        <div>m (domain)</div>
        <input type="number" value={m} min={0} onChange={(e)=>setM(Math.max(0,Number(e.target.value)))} className="input"/>
        <div className="mt-2">n (codomain)</div>
        <input type="number" value={n} min={0} onChange={(e)=>setN(Math.max(0,Number(e.target.value)))} className="input"/>
      </div>
      <div className="bg-white border p-2 rounded">
        <div className="font-medium">Counts</div>
        <div className="mt-2">All functions: <code>{String(total)}</code></div>
        <div>Injective permutations: <code>{String(perms)}</code></div>
      </div>
      <div className="bg-white border p-2 rounded">
        <div className="font-medium">Visual</div>
        <div className="grid grid-cols-5 gap-1 mt-2">
          {Array.from({length: m||1}).map((_,i)=> <motion.div key={i} animate={{ scale: [1,1.04,1] }} transition={{ duration: 1, repeat: Infinity, delay: i*0.08 }} className="h-8 rounded border flex items-center justify-center text-xs bg-white">slot {i+1}</motion.div>)}
        </div>
      </div>
    </div>
  );
}

/* ---------- PIE visual ---------- */
function PIEPlay() {
  const [A,setA] = useState(["a","b"]);
  const [B,setB] = useState(["b","c"]);
  const [C,setC] = useState(["c","d"]);
  const unionSize = new Set([...A,...B,...C]).size;
  return (
    <div className="p-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border p-2 rounded">
          <div className="font-medium">Sets</div>
          <div className="mt-2"><label className="text-xs">A</label><input className="input" value={A.join(", ")} onChange={e=>setA(e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}/></div>
          <div className="mt-2"><label className="text-xs">B</label><input className="input" value={B.join(", ")} onChange={e=>setB(e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}/></div>
          <div className="mt-2"><label className="text-xs">C</label><input className="input" value={C.join(", ")} onChange={e=>setC(e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}/></div>
        </div>
        <div className="bg-white border p-2 rounded">
          <div className="font-medium">Venn & counts</div>
          <div className="mt-2">Union size (direct): <strong>{unionSize}</strong></div>
          <div className="mt-2 text-xs text-gray-600">PIE steps would show pairwise and triple intersections. Visual Venn shown below for 3 sets.</div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <svg width={420} height={220}>
          <g transform="translate(80,40)">
            <circle cx={100} cy={80} r={60} fill="#fca5a5" opacity={0.35}/>
            <circle cx={160} cy={80} r={60} fill="#a78bfa" opacity={0.35}/>
            <circle cx={130} cy={40} r={60} fill="#60a5fa" opacity={0.35}/>
            <text x={60} y={170} className="text-xs">A</text>
            <text x={180} y={170} className="text-xs">B</text>
            <text x={130} y={-2} className="text-xs">C</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

/* ---------- Functional Equation sandbox ---------- */
function FEQPlay() {
  const [expr, setExpr] = useState("f(x+y)=f(x)f(y)");
  const candidates = ["0","1","e^{kx}"];
  return (
    <div className="p-3">
      <div className="mb-2"><input className="input w-full" value={expr} onChange={(e)=>setExpr(e.target.value)} /></div>
      <div className="grid grid-cols-3 gap-2">
        {candidates.map((c,i)=> <div key={i} className="bg-white border p-2 rounded">{c}<div className="text-xs mt-1">Quick test: {String(true)}</div></div>)}
      </div>
      <div className="mt-3 text-xs text-gray-600">Numeric test harness available for candidate functions. Extend to add symbolic hints.</div>
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function SetsRelationsPlaygroundV2() {
  const [state,setState] = useLocal(LS, { polygons: [], resultPolygons: [] });
  const [elements,setElements] = useLocal(LS+"_elems", ["a","b","c"]);
  const [relation,setRelation] = useLocal(LS+"_rel", [["a","a"],["b","b"]]);
  const [order] = useLocal(LS+"_order", [["a","b"]]);
  const [mapping,setMapping] = useLocal(LS+"_map", [["a","1"]]);
  const [tab,setTab] = useState("argand");

  function exportJSON(){
    const p = { state, elements, relation, order, mapping, ts:Date.now() };
    const blob = new Blob([JSON.stringify(p,null,2)],{type:"application/json"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download="srf_v2.json"; a.click();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Advanced Playground V2 — Sets, Relations & Functions</h1>
          <div className="flex gap-2">
            <button className="btn" onClick={exportJSON}>Export JSON</button>
            <button className="btn" onClick={()=>localStorage.clear()}>Reset</button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <div className="bg-white border rounded p-3 space-y-2">
              <div className="font-medium">Demos</div>
              <div className="flex flex-col gap-1">
                {[
                  ["Argand sets","argand"],["Relations editor","relation"],["Equivalence","equiv"],
                  ["Partial order / Hasse","hasse"],["Function mapper","function"],["Counting","count"],
                  ["PIE","pie"],["Functional eqn","feq"]
                ].map(([label,key])=> (
                  <button key={key} className={`text-left btn ${tab===key?'btn-active':''}`} onClick={()=>setTab(key)}>{label}</button>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded p-3 mt-3">
              <div className="font-medium">Shared elements</div>
              <textarea rows={3} className="w-full p-1 border mt-2" value={elements.join(", ")} onChange={(e)=>setElements( Array.from(new Set(e.target.value.split(",").map(s=>s.trim()).filter(Boolean))) ) } />
            </div>
          </div>

          <div className="col-span-9">
            <div className="bg-white border rounded p-3 min-h-[640px]">
              {tab==="argand" && <ArgandPlay state={state} setState={setState} />}
              {tab==="relation" && <RelationPlay elements={elements} setElements={setElements} relation={relation} setRelation={setRelation} />}
              {tab==="equiv" && <div className="p-3">Equivalence view: shows classes if relation is equivalence. (Use Relations editor to build relation.)</div>}
              {tab==="hasse" && (
                <div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border p-2 rounded"><Hasse2D elements={elements} order={order} /></div>
                    <div className="bg-white border p-2 rounded" style={{height:260}}>
                      <Canvas camera={{ position: [0,0,6], fov:50 }}>
                        <ambientLight intensity={0.7} />
                        <OrbitControls />
                        <Hasse3D elements={elements} order={order} />
                      </Canvas>
                    </div>
                  </div>
                </div>
              )}
              {tab==="function" && <FunctionMapper domain={elements} codomain={["1","2","3"]} mapping={mapping} setMapping={setMapping} />}
              {tab==="count" && <CountingPlay />}
              {tab==="pie" && <PIEPlay />}
              {tab==="feq" && <FEQPlay />}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-600">This playground is designed for exploration. Drag, click, toggle. State persists in localStorage.</div>
      </div>
    </div>
  );
}


