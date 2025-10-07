import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

type Pair = [string, string];

function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState] as const;
}

function tokenize(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}

function classNames(...c: Array<string | false | undefined>) {
  return c.filter(Boolean).join(' ');
}

/* ---------------------------------- Sets ---------------------------------- */
function SetsLab() {
  const [aRaw, setARaw] = useLocalStorage('srfstudio_sets_A', '1,2,3,4');
  const [bRaw, setBRaw] = useLocalStorage('srfstudio_sets_B', '3,4,5,6');
  const [showC, setShowC] = useLocalStorage('srfstudio_sets_useC', false as boolean);
  const [cRaw, setCRaw] = useLocalStorage('srfstudio_sets_C', '4,6,7');
  const A = useMemo(() => tokenize(aRaw), [aRaw]);
  const B = useMemo(() => tokenize(bRaw), [bRaw]);
  const C = useMemo(() => tokenize(cRaw), [cRaw]);

  const inAOnly = A.filter((x) => !B.includes(x) && (!showC || !C.includes(x)));
  const inBOnly = B.filter((x) => !A.includes(x) && (!showC || !C.includes(x)));
  const inCOnly = C.filter((x) => !A.includes(x) && !B.includes(x));
  const inAB = A.filter((x) => B.includes(x) && (!showC || !C.includes(x)));
  const inAC = showC ? A.filter((x) => C.includes(x) && !B.includes(x)) : [];
  const inBC = showC ? B.filter((x) => C.includes(x) && !A.includes(x)) : [];
  const inABC = showC ? A.filter((x) => B.includes(x) && C.includes(x)) : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white/70 backdrop-blur border rounded-lg p-3">
          <div className="text-sm font-semibold mb-1">Set A</div>
          <input
            value={aRaw}
            onChange={(e) => setARaw(e.target.value)}
            className="w-full rounded border px-2 py-1"
            placeholder="a, b, c"
          />
        </div>
        <div className="bg-white/70 backdrop-blur border rounded-lg p-3">
          <div className="text-sm font-semibold mb-1">Set B</div>
          <input
            value={bRaw}
            onChange={(e) => setBRaw(e.target.value)}
            className="w-full rounded border px-2 py-1"
            placeholder="d, e, f"
          />
        </div>
        <div className="bg-white/70 backdrop-blur border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Set C</div>
            <label className="text-xs flex items-center gap-2">
              <input type="checkbox" checked={!!showC} onChange={(e) => setShowC(e.target.checked)} /> Use 3 sets
            </label>
          </div>
          <input
            value={cRaw}
            onChange={(e) => setCRaw(e.target.value)}
            className="w-full rounded border px-2 py-1 mt-1 disabled:opacity-50"
            placeholder="g, h"
            disabled={!showC}
          />
        </div>
      </div>

      <div className="flex items-center justify-center">
        <svg width={560} height={320} className="max-w-full">
          <defs>
            <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#00000033" />
            </filter>
          </defs>
          <rect x={0} y={0} width="100%" height="100%" fill="#f8fafc" rx={12} />
          {/* labels */}
          <text x={180} y={26} className="fill-gray-700 text-sm">A</text>
          <text x={320} y={26} className="fill-gray-700 text-sm">B</text>
          {showC && <text x={250} y={14} className="fill-gray-700 text-sm">C</text>}

          {/* circles */}
          <g filter="url(#soft)">
            <circle cx={200} cy={160} r={90} fill="#60a5fa55" stroke="#3b82f6" />
            <circle cx={340} cy={160} r={90} fill="#f472b655" stroke="#ec4899" />
            {showC && <circle cx={270} cy={110} r={90} fill="#34d39955" stroke="#10b981" />}
          </g>

          {/* token helpers */}
          {inAOnly.map((t, i) => (
            <text key={`ao-${t}-${i}`} x={170 + (i % 3) * 20} y={160 + Math.floor(i / 3) * 16} className="text-xs fill-gray-800">
              {t}
            </text>
          ))}
          {inBOnly.map((t, i) => (
            <text key={`bo-${t}-${i}`} x={330 + (i % 3) * 20} y={160 + Math.floor(i / 3) * 16} className="text-xs fill-gray-800">
              {t}
            </text>
          ))}
          {inAB.map((t, i) => (
            <text key={`ab-${t}-${i}`} x={255 + (i % 3) * 18} y={170 + Math.floor(i / 3) * 15} className="text-xs fill-gray-900">
              {t}
            </text>
          ))}
          {showC &&
            inCOnly.map((t, i) => (
              <text key={`co-${t}-${i}`} x={250 + (i % 3) * 18} y={100 + Math.floor(i / 3) * 15} className="text-xs fill-gray-900">
                {t}
              </text>
            ))}
          {showC &&
            inAC.map((t, i) => (
              <text key={`ac-${t}-${i}`} x={215 + (i % 3) * 18} y={130 + Math.floor(i / 3) * 15} className="text-xs fill-gray-900">
                {t}
              </text>
            ))}
          {showC &&
            inBC.map((t, i) => (
              <text key={`bc-${t}-${i}`} x={300 + (i % 3) * 18} y={130 + Math.floor(i / 3) * 15} className="text-xs fill-gray-900">
                {t}
              </text>
            ))}
          {showC &&
            inABC.map((t, i) => (
              <text key={`abc-${t}-${i}`} x={270 + (i % 3) * 14} y={150 + Math.floor(i / 3) * 14} className="text-xs fill-gray-900">
                {t}
              </text>
            ))}
        </svg>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="bg-white/70 backdrop-blur border rounded p-2">
          <div className="font-semibold">Counts</div>
          <div>|A| = {A.length}</div>
          <div>|B| = {B.length}</div>
          {showC && <div>|C| = {C.length}</div>}
        </div>
        <div className="bg-white/70 backdrop-blur border rounded p-2">
          <div className="font-semibold">Union</div>
          <div>{Array.from(new Set([...A, ...B, ...(showC ? C : [])])).join(', ') || '-'}</div>
        </div>
        <div className="bg-white/70 backdrop-blur border rounded p-2">
          <div className="font-semibold">Intersection</div>
          <div>
            {showC
              ? A.filter((x) => B.includes(x) && C.includes(x)).join(', ') || '-'
              : A.filter((x) => B.includes(x)).join(', ') || '-'}
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur border rounded p-2">
          <div className="font-semibold">A 
            <span className="mx-1">\</span> B</div>
          <div>{A.filter((x) => !B.includes(x)).join(', ') || '-'}</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Relations -------------------------------- */
function RelationsLab() {
  const [leftRaw, setLeftRaw] = useLocalStorage('srfstudio_rel_left', '1,2,3');
  const [rightRaw, setRightRaw] = useLocalStorage('srfstudio_rel_right', 'a,b,c');
  const [pairs, setPairs] = useLocalStorage<Pair[]>('srfstudio_rel_pairs', [
    ['1', 'a'],
  ]);

  const L = useMemo(() => tokenize(leftRaw), [leftRaw]);
  const R = useMemo(() => tokenize(rightRaw), [rightRaw]);

  function togglePair(a: string, b: string) {
    const exists = pairs.some((p) => p[0] === a && p[1] === b);
    if (exists) setPairs(pairs.filter((p) => !(p[0] === a && p[1] === b)));
    else setPairs([...pairs, [a, b]]);
  }

  const isReflexive = L.every((x) => pairs.some((p) => p[0] === x && p[1] === x));
  const isSymmetric = pairs.every((p) => pairs.some((q) => q[0] === p[1] && q[1] === p[0]));
  const isAntisymmetric = pairs.every((p) => p[0] === p[1] || !pairs.some((q) => q[0] === p[1] && q[1] === p[0]));
  const isTransitive = pairs.every((p) => {
    const mids = pairs.filter((q) => q[0] === p[1]).map((q) => q[1]);
    return mids.every((m) => pairs.some((r) => r[0] === p[0] && r[1] === m));
  });

  const isFunction = L.every((x) => pairs.filter((p) => p[0] === x).length <= 1);
  const isInjective = isFunction && new Set(pairs.map((p) => p[1])).size === pairs.length;
  const isSurjective = isFunction && R.every((y) => pairs.some((p) => p[1] === y));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white/70 backdrop-blur border rounded-lg p-3">
          <div className="text-sm font-semibold mb-1">Domain (Set A)</div>
          <input value={leftRaw} onChange={(e) => setLeftRaw(e.target.value)} className="w-full rounded border px-2 py-1" />
        </div>
        <div className="bg-white/70 backdrop-blur border rounded-lg p-3">
          <div className="text-sm font-semibold mb-1">Codomain (Set B)</div>
          <input value={rightRaw} onChange={(e) => setRightRaw(e.target.value)} className="w-full rounded border px-2 py-1" />
        </div>
        <div className="bg-white/70 backdrop-blur border rounded-lg p-3">
          <div className="text-sm font-semibold mb-2">Add/remove pairs</div>
          <div className="text-xs text-gray-600">Click boxes to toggle relation pairs.</div>
        </div>
      </div>

      {/* Matrix toggle */}
      <div className="overflow-x-auto bg-white/70 backdrop-blur border rounded-lg p-3">
        <table className="table-auto border-collapse">
          <thead>
            <tr>
              <th className="p-1 border" />
              {R.map((c) => (
                <th key={c} className="p-1 border text-xs">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {L.map((r) => (
              <tr key={r}>
                <td className="p-1 border font-medium text-xs">{r}</td>
                {R.map((c) => {
                  const on = pairs.some((p) => p[0] === r && p[1] === c);
                  return (
                    <td key={c} className="p-1 border text-center">
                      <input type="checkbox" checked={on} onChange={() => togglePair(r, c)} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bipartite view */}
      <div className="bg-white/70 backdrop-blur border rounded-lg p-3">
        <div className="text-sm font-semibold mb-2">Bipartite graph</div>
        <div className="relative mx-auto" style={{ width: 520, height: 220 }}>
          {/* Labels */}
          <div className="absolute left-4 top-1 text-xs font-semibold">Set A (Domain)</div>
          <div className="absolute right-4 top-1 text-xs font-semibold">Set B (Codomain)</div>
          {/* Left nodes */}
          {L.map((x, i) => (
            <motion.div
              key={`L-${x}`}
              className="absolute w-8 h-8 rounded-full bg-blue-100 border border-blue-400 flex items-center justify-center text-xs"
              style={{ left: 40, top: 30 + i * 32 }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {x}
            </motion.div>
          ))}
          {/* Right nodes */}
          {R.map((y, i) => (
            <motion.div
              key={`R-${y}`}
              className="absolute w-8 h-8 rounded-full bg-violet-100 border border-violet-400 flex items-center justify-center text-xs"
              style={{ right: 40, top: 30 + i * 32 }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {y}
            </motion.div>
          ))}
          {/* Edges */}
          <svg className="absolute inset-0" width={520} height={220}>
            {pairs.map(([a, b], idx) => {
              const ai = L.indexOf(a);
              const bi = R.indexOf(b);
              if (ai < 0 || bi < 0) return null;
              const x1 = 40 + 16;
              const y1 = 30 + ai * 32 + 16;
              const x2 = 520 - 40 - 16;
              const y2 = 30 + bi * 32 + 16;
              return (
                <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748b" strokeWidth={1.6} />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Properties */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className={classNames('px-2 py-1 rounded border', isReflexive ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400')}>Reflexive</span>
        <span className={classNames('px-2 py-1 rounded border', isSymmetric ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400')}>Symmetric</span>
        <span className={classNames('px-2 py-1 rounded border', isAntisymmetric ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400')}>Antisymmetric</span>
        <span className={classNames('px-2 py-1 rounded border', isTransitive ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400')}>Transitive</span>
        <span className={classNames('px-2 py-1 rounded border', isFunction ? 'bg-blue-100 border-blue-400' : 'bg-gray-100 border-gray-300')}>Function</span>
        <span className={classNames('px-2 py-1 rounded border', isInjective ? 'bg-blue-100 border-blue-400' : 'bg-gray-100 border-gray-300')}>Injective</span>
        <span className={classNames('px-2 py-1 rounded border', isSurjective ? 'bg-blue-100 border-blue-400' : 'bg-gray-100 border-gray-300')}>Surjective</span>
        <span className={classNames('px-2 py-1 rounded border', isInjective && isSurjective ? 'bg-emerald-100 border-emerald-400' : 'bg-gray-100 border-gray-300')}>Bijective</span>
      </div>
    </div>
  );
}

/* ------------------------------- Functions -------------------------------- */
function FunctionsLab() {
  const [domainRaw, setDomainRaw] = useLocalStorage('srfstudio_fun_dom', '1,2,3');
  const [codomainRaw, setCodomainRaw] = useLocalStorage('srfstudio_fun_cod', 'a,b,c');
  const [map, setMap] = useLocalStorage<Pair[]>('srfstudio_fun_map', [['1', 'a']]);
  const D = useMemo(() => tokenize(domainRaw), [domainRaw]);
  const C = useMemo(() => tokenize(codomainRaw), [codomainRaw]);
  const [dragFrom, setDragFrom] = useState<string | null>(null);
  const [show3D, setShow3D] = useState(true);
  const [layout3D, setLayout3D] = useState<'ring' | 'line' | 'grid'>('ring');
  const [selected, setSelected] = useState<{ kind: 'domain' | 'codomain'; id: string } | null>(null);

  function toggle(a: string, b: string) {
    const exists = map.some((m) => m[0] === a && m[1] === b);
    if (exists) setMap(map.filter((m) => !(m[0] === a && m[1] === b)));
    else setMap([...map.filter((m) => m[0] !== a), [a, b]]);
  }

  const injective = new Set(map.map((m) => m[1])).size === map.length;
  const surjective = C.every((y) => map.some((m) => m[1] === y));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white/70 backdrop-blur border rounded p-3">
          <div className="text-sm font-semibold mb-1">Domain</div>
          <input value={domainRaw} onChange={(e) => setDomainRaw(e.target.value)} className="w-full rounded border px-2 py-1" />
        </div>
        <div className="bg-white/70 backdrop-blur border rounded p-3">
          <div className="text-sm font-semibold mb-1">Codomain</div>
          <input value={codomainRaw} onChange={(e) => setCodomainRaw(e.target.value)} className="w-full rounded border px-2 py-1" />
        </div>
        <div className="bg-white/70 backdrop-blur border rounded p-3">
          <div className="text-sm font-semibold">Tests</div>
          <div className="text-xs mt-1">Injective: <span className={injective ? 'text-emerald-700' : 'text-rose-700'}>{String(injective)}</span></div>
          <div className="text-xs">Surjective: <span className={surjective ? 'text-emerald-700' : 'text-rose-700'}>{String(surjective)}</span></div>
          <div className="text-xs">Bijective: <span className={injective && surjective ? 'text-emerald-700' : 'text-rose-700'}>{String(injective && surjective)}</span></div>
          <div className="text-xs mt-2 flex items-center gap-2"><input type="checkbox" checked={show3D} onChange={(e)=>setShow3D(e.target.checked)} /> Show 3D</div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <button className="px-2 py-1 rounded border" onClick={()=>setMap([])}>Clear</button>
            <button className="px-2 py-1 rounded border" onClick={()=>{
              // set simple bijection if sizes equal
              if (D.length && C.length) {
                const mm: Pair[] = [];
                for (let i=0;i<Math.min(D.length,C.length);i++) mm.push([D[i], C[i]]);
                setMap(mm);
              }
            }}>Auto map</button>
            <button className="px-2 py-1 rounded border" onClick={()=>{
              if (!D.length || !C.length) return;
              const mm: Pair[] = D.map((d)=>[d, C[Math.floor(Math.random()*C.length)]] as Pair);
              setMap(mm);
            }}>Random</button>
            <button className="px-2 py-1 rounded border" onClick={()=>{
              if (!D.length || !C.length) return;
              setMap(D.map((d)=>[d, C[0]] as Pair));
            }}>Constant</button>
            <button className="px-2 py-1 rounded border" onClick={()=>{
              if (!D.length || !C.length) return;
              const mm: Pair[] = [];
              const copy = [...D];
              // ensure each codomain has at least one preimage when possible
              for (let i=0;i<C.length && copy.length;i++) mm.push([copy.shift() as string, C[i]]);
              for (const d of copy) mm.push([d, C[Math.floor(Math.random()*C.length)]]);
              setMap(mm);
            }}>Surjection fill</button>
          </div>
          <div className="text-xs mt-2 flex items-center gap-2">
            Layout:
            <select className="border rounded px-1 py-0.5" value={layout3D} onChange={(e)=>setLayout3D(e.target.value as any)}>
              <option value="ring">Ring</option>
              <option value="line">Lines</option>
              <option value="grid">Grid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive 2D bipartite mapping (drag from Domain to Codomain) */}
      <div className="bg-white/70 backdrop-blur border rounded p-3">
        <div className="text-sm font-semibold mb-2">Interactive mapper (drag from Domain to Codomain)</div>
        <div className="relative mx-auto" style={{ width: 560, height: 220 }}>
          {/* Labels */}
          <div className="absolute left-4 top-1 text-xs font-semibold">Domain</div>
          <div className="absolute right-4 top-1 text-xs font-semibold">Codomain</div>
          {/* Left nodes */}
          {D.map((x, i) => (
            <div
              key={`d-${x}`}
              className={"absolute w-8 h-8 rounded-full flex items-center justify-center text-xs cursor-pointer " + (dragFrom===x? 'bg-blue-300 border border-blue-500':'bg-blue-100 border border-blue-400')}
              style={{ left: 40, top: 30 + i * 32 }}
              onMouseDown={()=>setDragFrom(x)}
              onMouseUp={()=>setDragFrom(null)}
            >
              {x}
            </div>
          ))}
          {/* Right nodes */}
          {C.map((y, i) => (
            <div
              key={`c-${y}`}
              className="absolute w-8 h-8 rounded-full bg-violet-100 border border-violet-400 flex items-center justify-center text-xs cursor-pointer"
              style={{ right: 40, top: 30 + i * 32 }}
              onMouseUp={()=>{ if(dragFrom){ setMap([...map.filter(m=>m[0]!==dragFrom), [dragFrom, y]]); setDragFrom(null);} }}
            >
              {y}
            </div>
          ))}
          {/* Existing edges */}
          <svg className="absolute inset-0 pointer-events-none" width={560} height={220}>
            {map.map(([a,b], idx)=>{
              const ai = D.indexOf(a);
              const bi = C.indexOf(b);
              if (ai<0 || bi<0) return null;
              const x1 = 40 + 16; const y1 = 30 + ai*32 + 16;
              const x2 = 560 - 40 - 16; const y2 = 30 + bi*32 + 16;
              return <path key={idx} d={`M ${x1} ${y1} C ${(x1+x2)/2} ${y1}, ${(x1+x2)/2} ${y2}, ${x2} ${y2}`} stroke="#64748b" strokeWidth={1.6} fill="none"/>;
            })}
          </svg>
        </div>
      </div>

      {/* Matrix toggle for precise editing */}
      <div className="overflow-x-auto bg-white/70 backdrop-blur border rounded p-3">
        <table className="table-auto border-collapse">
          <thead>
            <tr>
              <th className="p-1 border" />
              {C.map((c) => (
                <th key={c} className="p-1 border text-xs">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {D.map((d) => (
              <tr key={d}>
                <td className="p-1 border text-xs font-medium">{d}</td>
                {C.map((c) => {
                  const on = map.some((m) => m[0] === d && m[1] === c);
                  return (
                    <td key={c} className="p-1 border text-center">
                      <input type="checkbox" checked={on} onChange={() => toggle(d, c)} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3D visualization of mapping */}
      {show3D && (
        <div className="bg-white/70 backdrop-blur border rounded p-3">
          <div className="text-sm font-semibold mb-1">3D Mapping View</div>
          <div className="text-xs text-gray-600 mb-2">Blue = Domain (numbers). Purple = Codomain (labels). Bars show how many inputs map to a codomain. Click a node to highlight connections.</div>
          <div style={{ height: 280 }} className="rounded overflow-hidden">
            <Canvas camera={{ position: [0, 0, 6], fov: 55 }}>
              <ambientLight intensity={0.8} />
              <OrbitControls />
              <Mapping3D domain={D} codomain={C} mapping={map} layout={layout3D} onSelect={setSelected} selected={selected} />
            </Canvas>
          </div>
          {selected && (
            <div className="mt-2 text-xs">
              {selected.kind === 'domain' ? (
                <div>Selected input <span className="font-semibold">{selected.id}</span> ↦ {map.find(m=>m[0]===selected.id)?.[1] ?? '—'}</div>
              ) : (
                <div>Selected output <span className="font-semibold">{selected.id}</span> has preimage {'{'}{map.filter(m=>m[1]===selected.id).map(m=>m[0]).join(', ') || '∅'}{'}'}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Mapping3D({ domain, codomain, mapping, layout, onSelect, selected }: { domain: string[]; codomain: string[]; mapping: Pair[]; layout: 'ring'|'line'|'grid'; onSelect: (s: {kind:'domain'|'codomain'; id: string})=>void; selected: {kind:'domain'|'codomain'; id: string} | null; }) {
  const group = useRef<any>(null);
  useFrame((_, dt) => { if (group.current) group.current.rotation.y += dt * 0.15; });
  const ring = (n: number, radius: number, y: number) => Array.from({ length: Math.max(1, n) }, (_, i) => {
    const t = (i / Math.max(1, n)) * Math.PI * 2;
    return { x: Math.cos(t) * radius, y, z: Math.sin(t) * radius };
  });
  const line = (n: number, x: number) => Array.from({ length: Math.max(1, n) }, (_, i) => ({ x, y: -1 + (2 * i) / Math.max(1, n - 1 || 1), z: 0 }));
  const grid = (n: number, x: number) => Array.from({ length: Math.max(1, n) }, (_, i) => ({ x, y: -0.6 + 0.6 * (i % 4), z: -0.9 + 0.6 * Math.floor(i / 4) }));

  const Dpos = layout === 'ring' ? ring(domain.length, 1.6, -0.8) : layout === 'line' ? line(domain.length, -1.8) : grid(domain.length, -1.4);
  const Cpos = layout === 'ring' ? ring(codomain.length, 1.6, 0.8) : layout === 'line' ? line(codomain.length, 1.8) : grid(codomain.length, 1.4);
  const didx = Object.fromEntries(domain.map((d, i) => [d, i] as const));
  const cidx = Object.fromEntries(codomain.map((c, i) => [c, i] as const));
  const counts = codomain.map((c)=> mapping.filter(m=>m[1]===c).length);
  return (
    <group ref={group}>
      {Dpos.map((p, i) => (
        <group key={`d-${i}`} position={[p.x, p.y, p.z]} onPointerDown={(e)=>{ e.stopPropagation(); onSelect({kind:'domain', id: domain[i]}); }}>
          <mesh scale={selected?.kind==='domain' && selected.id===domain[i] ? 1.25 : 1}>
            <sphereGeometry args={[0.12, 16, 12]} />
            <meshStandardMaterial color="#60a5fa" />
          </mesh>
          <Html center distanceFactor={10} position={[0, 0.28, 0]}>
            <div className="px-1.5 py-0.5 rounded bg-white/90 text-[10px] border text-blue-700 font-semibold">{domain[i]}</div>
          </Html>
        </group>
      ))}
      {Cpos.map((p, i) => (
        <group key={`c-${i}`} position={[p.x, p.y, p.z]} onPointerDown={(e)=>{ e.stopPropagation(); onSelect({kind:'codomain', id: codomain[i]}); }}>
          <mesh scale={selected?.kind==='codomain' && selected.id===codomain[i] ? 1.25 : 1}>
            <sphereGeometry args={[0.12, 16, 12]} />
            <meshStandardMaterial color="#a78bfa" />
          </mesh>
          <Html center distanceFactor={10} position={[0, 0.28, 0]}>
            <div className="px-1.5 py-0.5 rounded bg-white/90 text-[10px] border text-violet-700 font-semibold">{codomain[i]}</div>
          </Html>
        </group>
      ))}
      {mapping.map(([a,b], i)=>{
        const A = Dpos[didx[a]]; const B = Cpos[cidx[b]];
        if (!A || !B) return null;
        const start = new THREE.Vector3(A.x, A.y, A.z);
        const end = new THREE.Vector3(B.x, B.y, B.z);
        const dir = new THREE.Vector3().subVectors(end, start).normalize();
        const L = start.distanceTo(end);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const arrowPos = new THREE.Vector3().copy(end).addScaledVector(dir, -0.18);
        const isSelected = selected && ((selected.kind==='domain' && selected.id===a) || (selected.kind==='codomain' && selected.id===b));
        return (
          <group key={i}>
            <mesh position={[mid.x, mid.y, mid.z]} quaternion={q}>
              <cylinderGeometry args={[0.02, 0.02, L, 8]} />
              <meshStandardMaterial color={isSelected? '#22c55e' : '#64748b'} />
            </mesh>
            <mesh position={[arrowPos.x, arrowPos.y, arrowPos.z]} quaternion={q}>
              <coneGeometry args={[0.06, 0.18, 12]} />
              <meshStandardMaterial color={isSelected? '#22c55e' : '#64748b'} />
            </mesh>
          </group>
        );
      })}
      {Cpos.map((p, i)=>{
        const h = Math.max(0.001, counts[i]) * 0.25;
        return (
          <group key={`bar-${i}`} position={[p.x + 0.28, 0, p.z]}>
            <mesh position={[0, h/2, 0]}>
              <boxGeometry args={[0.12, h, 0.12]} />
              <meshStandardMaterial color="#a78bfa" />
            </mesh>
            <Html center distanceFactor={12} position={[0, h + 0.2, 0]}>
              <div className="px-1 rounded bg-white/90 text-[10px] border text-violet-700">{counts[i]}</div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

/* --------------------------------- Counting ------------------------------- */
function CountingLab() {
  const [m, setM] = useLocalStorage<number>('srfstudio_cnt_m', 3);
  const [n, setN] = useLocalStorage<number>('srfstudio_cnt_n', 3);
  const [sample, setSample] = useState<number[]>([]);
  const [show3D, setShow3D] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showBars, setShowBars] = useState(true);
  const all = useMemo(() => (BigInt(n) ** BigInt(m)).toString(), [m, n]);
  const injective = useMemo(() => {
    if (m > n) return '0';
    let res = 1n;
    for (let k = 0; k < m; k++) res *= BigInt(n - k);
    return res.toString();
  }, [m, n]);
  const surjective = useMemo(() => {
    // n! * S(m,n) via DP for Stirling numbers of the second kind
    const S: bigint[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0n));
    S[0][0] = 1n;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= Math.min(i, n); j++) {
        S[i][j] = S[i - 1][j - 1] + BigInt(j) * S[i - 1][j];
      }
    }
    const fact = (x: number) => { let r = 1n; for (let i=2;i<=x;i++) r *= BigInt(i); return r; };
    return (fact(n) * S[m][n]).toString();
  }, [m, n]);

  const pieTerms = useMemo(() => {
    // Inclusion-Exclusion for onto: sum_{k=0..n} (-1)^k C(n,k) (n-k)^m
    const choose = (N: number, K: number): bigint => {
      if (K < 0 || K > N) return 0n;
      let res = 1n;
      for (let i = 1; i <= K; i++) {
        res = (res * BigInt(N - (K - i))) / BigInt(i);
      }
      return res;
    };
    const pow = (a: number, b: number): bigint => {
      let r = 1n; for (let i=0;i<b;i++) r *= BigInt(a); return r;
    };
    const terms = [] as { k: number; comb: bigint; p: bigint; term: bigint; sign: 1n | -1n }[];
    for (let k = 0; k <= n; k++) {
      const comb = choose(n, k);
      const p = pow(n - k, m);
      const sign = (k % 2 === 0) ? 1n : -1n;
      const term = sign * comb * p;
      terms.push({ k, comb, p, term, sign });
    }
    return terms;
  }, [m, n]);

  useEffect(() => {
    // build a random sample mapping for visualization
    const s: number[] = Array.from({ length: m }, () => Math.floor(Math.random() * Math.max(1, n)));
    setSample(s);
  }, [m, n]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
      <div className="bg-white/70 backdrop-blur border rounded p-3">
        <div className="text-sm font-semibold mb-1">Parameters</div>
        <label className="block text-xs">m (domain size)</label>
        <input type="number" min={0} value={m} onChange={(e) => setM(Math.max(0, Number(e.target.value)))} className="w-full rounded border px-2 py-1" />
        <label className="block mt-2 text-xs">n (codomain size)</label>
        <input type="number" min={0} value={n} onChange={(e) => setN(Math.max(0, Number(e.target.value)))} className="w-full rounded border px-2 py-1" />
        <div className="text-xs mt-2 flex items-center gap-2"><input type="checkbox" checked={show3D} onChange={(e)=>setShow3D(e.target.checked)} /> Show 3D</div>
        <div className="text-xs mt-1 flex items-center gap-2"><input type="checkbox" checked={showLabels} onChange={(e)=>setShowLabels(e.target.checked)} /> Labels</div>
        <div className="text-xs mt-1 flex items-center gap-2"><input type="checkbox" checked={showBars} onChange={(e)=>setShowBars(e.target.checked)} /> Bars</div>
        <div className="mt-2 flex gap-2">
          <button className="px-2 py-1 rounded border" onClick={()=>{
            const s: number[] = Array.from({ length: m }, () => Math.floor(Math.random() * Math.max(1, n)));
            setSample(s);
          }}>Simulate mapping</button>
          <button className="px-2 py-1 rounded border" onClick={()=>setSample(Array.from({length:m}, (_,i)=>i % Math.max(1,n)))}>Cycle</button>
        </div>
      </div>
      <div className="bg-white/70 backdrop-blur border rounded p-3">
        <div className="text-sm font-semibold mb-1">Counts</div>
        <div className="text-xs">All functions: <code>{all}</code></div>
        <div className="text-xs">Injective (permutations): <code>{injective}</code></div>
        <div className="text-xs">Surjective (onto): <code>{surjective}</code></div>
        <div className="text-xs mt-2">
          <div className="font-semibold mb-1">PIE (onto derivation)</div>
          <div className="space-y-0.5 max-h-28 overflow-auto pr-1">
            {pieTerms.map((t)=> (
              <div key={t.k}>{t.sign===1n?'+':'-'} C({n},{t.k}) · ({n - t.k})^{m} = {String(t.term)}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white/70 backdrop-blur border rounded p-3">
        <div className="text-sm font-semibold mb-1">Animated slots</div>
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: Math.max(1, m) }).map((_, i) => (
            <motion.div key={i} className="h-9 rounded border flex items-center justify-center text-xs bg-white"
              animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}>
              slot {i + 1}
            </motion.div>
          ))}
        </div>
      </div>
      {show3D && (
        <div className="md:col-span-3 bg-white/70 backdrop-blur border rounded p-3">
          <div className="text-sm font-semibold mb-2">3D Sampling View</div>
          <div style={{ height: 300 }} className="rounded overflow-hidden">
            <Canvas camera={{ position: [0, 0, 6], fov: 55 }}>
              <ambientLight intensity={0.9} />
              <OrbitControls />
              <Counting3D m={m} n={n} sample={sample} labels={showLabels} bars={showBars} />
            </Canvas>
          </div>
        </div>
      )}
    </div>
  );
}

function Counting3D({ m, n, sample, labels, bars }: { m: number; n: number; sample: number[]; labels: boolean; bars: boolean }) {
  const group = useRef<any>(null);
  useFrame((_, dt) => { if (group.current) group.current.rotation.y += dt * 0.2; });
  const ring = (count: number, r: number, y: number) => Array.from({ length: Math.max(1, count) }, (_, i) => {
    const t = (i / Math.max(1, count)) * Math.PI * 2;
    return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
  });
  const slots = ring(m, 1.7, -0.6);
  const targets = ring(n, 1.7, 0.8);
  const counts = Array.from({ length: Math.max(1, n) }, (_, i) => sample.filter((c) => (c % Math.max(1, n)) === i).length);
  return (
    <group ref={group}>
      {slots.map((p, i) => (
        <mesh key={`s-${i}`} position={[p.x, p.y, p.z]}>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <meshStandardMaterial color="#60a5fa" />
          {labels && (
            <Html center distanceFactor={10} position={[0, 0.28, 0]}>
              <div className="px-1.5 py-0.5 rounded bg-white/90 text-[10px] border text-blue-700 font-semibold">{i + 1}</div>
            </Html>
          )}
        </mesh>
      ))}
      {targets.map((p, i) => (
        <mesh key={`t-${i}`} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.14, 16, 12]} />
          <meshStandardMaterial color="#a78bfa" />
          {labels && (
            <Html center distanceFactor={10} position={[0, 0.28, 0]}>
              <div className="px-1.5 py-0.5 rounded bg-white/90 text-[10px] border text-violet-700 font-semibold">{i + 1}</div>
            </Html>
          )}
        </mesh>
      ))}
      {sample.map((c, i) => {
        const A = slots[i];
        const B = targets[c % Math.max(1, n)];
        if (!A || !B) return null;
        const dx = B.x - A.x, dy = B.y - A.y, dz = B.z - A.z;
        const L = Math.hypot(dx, dy, dz);
        const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, mz = (A.z + B.z) / 2;
        return (
          <mesh key={`e-${i}`} position={[mx, my, mz]}>
            <cylinderGeometry args={[0.02, 0.02, L, 8]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
        );
      })}
      {bars && targets.map((p, i)=>{
        const h = Math.max(0.001, counts[i]) * 0.25;
        return (
          <group key={`bar-${i}`} position={[p.x + 0.28, 0, p.z]}>
            <mesh position={[0, h/2, 0]}>
              <boxGeometry args={[0.12, h, 0.12]} />
              <meshStandardMaterial color="#a78bfa" />
            </mesh>
            {labels && (
              <Html center distanceFactor={12} position={[0, h + 0.2, 0]}>
                <div className="px-1 rounded bg-white/90 text-[10px] border text-violet-700">{counts[i]}</div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

/* ---------------------------------- Hasse --------------------------------- */
function HasseLab() {
  const [elementsRaw, setElementsRaw] = useLocalStorage('srfstudio_hs_elems', 'a,b,c,d');
  const [orderRaw, setOrderRaw] = useLocalStorage('srfstudio_hs_order', 'a<b, b<c, a<d');
  const elements = useMemo(() => tokenize(elementsRaw), [elementsRaw]);
  const orderPairs = useMemo<Pair[]>(() => {
    return orderRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const [l, r] = s.split('<').map((t) => t.trim());
        return [l, r] as Pair;
      });
  }, [orderRaw]);

  // Build ranks via simple DAG longest path layering
  const idx = Object.fromEntries(elements.map((e, i) => [e, i] as const));
  const n = elements.length;
  const adj: number[][] = Array.from({ length: n }, () => []);
  orderPairs.forEach(([a, b]) => {
    if (idx[a] !== undefined && idx[b] !== undefined) adj[idx[a]].push(idx[b]);
  });
  const indeg = Array(n).fill(0);
  adj.forEach((list) => list.forEach((v) => indeg[v]++));
  const q: number[] = [];
  indeg.forEach((d, i) => d === 0 && q.push(i));
  const rank = Array(n).fill(0);
  while (q.length) {
    const u = q.shift()!;
    adj[u].forEach((v) => {
      rank[v] = Math.max(rank[v], rank[u] + 1);
      if (--indeg[v] === 0) q.push(v);
    });
  }
  const maxR = Math.max(0, ...rank);
  const layers: number[][] = Array.from({ length: maxR + 1 }, () => []);
  for (let i = 0; i < n; i++) layers[rank[i]].push(i);

  const nodes = elements.map((id, i) => ({ id, r: rank[i], x: 0, y: 0 }));
  const w = 540, h = 280;
  layers.forEach((layer, li) => {
    const gap = Math.max(1, layer.length);
    layer.forEach((nodeIdx, k) => {
      nodes[nodeIdx].x = (w / (gap + 1)) * (k + 1);
      nodes[nodeIdx].y = 30 + li * ((h - 60) / Math.max(1, maxR));
    });
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white/70 backdrop-blur border rounded p-3">
          <div className="text-sm font-semibold mb-1">Elements</div>
          <input value={elementsRaw} onChange={(e) => setElementsRaw(e.target.value)} className="w-full rounded border px-2 py-1" />
          <div className="text-xs text-gray-600 mt-1">Comma-separated. Example: a,b,c,d</div>
        </div>
        <div className="bg-white/70 backdrop-blur border rounded p-3">
          <div className="text-sm font-semibold mb-1">Order pairs (a&lt;b)</div>
          <input value={orderRaw} onChange={(e) => setOrderRaw(e.target.value)} className="w-full rounded border px-2 py-1" />
          <div className="text-xs text-gray-600 mt-1">Comma-separated. Example: a&lt;b, b&lt;c, a&lt;d</div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <svg width={w} height={h} className="max-w-full bg-white/70 backdrop-blur border rounded">
          {orderPairs.map(([a, b], i) => {
            const A = nodes[idx[a]];
            const B = nodes[idx[b]];
            if (!A || !B) return null;
            return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#334155" strokeWidth={1.2} />;
          })}
          {nodes.map((n, i) => (
            <g key={i} transform={`translate(${n.x},${n.y})`}>
              <circle r={14} fill="#fde68a" stroke="#f59e0b" />
              <text textAnchor="middle" dy="0.35em" className="fill-gray-800 text-xs">
                {n.id}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

/* ---------------------------------- Main ---------------------------------- */
type TabKey = 'sets' | 'relations' | 'functions' | 'counting' | 'hasse';

export default function SRFStudio() {
  const [tab, setTab] = useLocalStorage<TabKey>('srfstudio_tab', 'sets');

  function resetAll() {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('srfstudio_'));
    keys.forEach((k) => localStorage.removeItem(k));
    location.reload();
  }

  const TabButton = ({ k, label, emoji }: { k: TabKey; label: string; emoji: string }) => (
    <button
      className={classNames(
        'text-left w-full px-3 py-2 rounded border transition',
        tab === k ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow' : 'bg-white/70 backdrop-blur border hover:bg-white'
      )}
      onClick={() => setTab(k)}
    >
      <span className="mr-2">{emoji}</span>
      {label}
    </button>
  );

  return (
    <div className="min-h-[680px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-card-foreground">
          <span className="bg-gradient-to-r from-sky-600 to-fuchsia-600 bg-clip-text text-transparent">SRF Studio</span>
          <span className="ml-2 text-sm text-muted-foreground">(Sets · Relations · Functions)</span>
        </h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50" onClick={resetAll}>Reset</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <div className="space-y-2">
            <TabButton k="sets" label="Sets Lab" emoji="🟣" />
            <TabButton k="relations" label="Relations Lab" emoji="🧬" />
            <TabButton k="functions" label="Functions Lab" emoji="🛠️" />
            <TabButton k="counting" label="Counting & PIE" emoji="🔢" />
            <TabButton k="hasse" label="Hasse Diagram" emoji="🕸️" />
          </div>
        </div>

        <div className="col-span-9">
          <div className="bg-gradient-to-b from-white to-slate-50 border rounded-lg p-4 min-h-[560px]">
            {tab === 'sets' && <SetsLab />}
            {tab === 'relations' && <RelationsLab />}
            {tab === 'functions' && <FunctionsLab />}
            {tab === 'counting' && <CountingLab />}
            {tab === 'hasse' && <HasseLab />}
          </div>
        </div>
      </div>
    </div>
  );
}


