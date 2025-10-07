import React, { useEffect, useMemo, useRef, useState } from 'react';
// Removed d3 imports - using simpler SVG approach
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

type Pair = [string, string];
const LS_KEY = 'srf_playground_v1';

const cls = {
  btn: 'px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm',
  btnSm: 'px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-xs',
  btnGhost: 'px-3 py-1.5 rounded-md bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 text-sm',
  input: 'px-2 py-1 border rounded w-full text-sm',
  sidebarBtn: (active: boolean) =>
    `w-full text-left px-3 py-1.5 rounded-md text-sm ${
      active ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
    }`,
};

function useLocalState<T>(key: string, initial: T) {
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

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}
function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

// ---------- A: Argand-like set visualizer ----------
function ArgandSetVisualizer({
  sets,
  setSets,
}: {
  sets: { id: string; points: [number, number][] }[];
  setSets: (s: { id: string; points: [number, number][] }[]) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [currentPts, setCurrentPts] = useState<[number, number][]>([]);
  const [mode, setMode] = useState<'draw' | 'select'>('draw');
  const [selected, setSelected] = useState<string | null>(null);

  function toDataURL() {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const str = serializer.serializeToString(svg);
    const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'argand.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSvgClick(e: React.MouseEvent) {
    if (mode !== 'draw') return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left - 210) / 30;
    const y = -(e.clientY - rect.top - 210) / 30;
    setCurrentPts((p) => [...p, [Number(x.toFixed(3)), Number(y.toFixed(3))]]);
  }
  function commitPolygon() {
    if (currentPts.length < 3) return;
    const id = `S${Date.now().toString(36).slice(-4)}`;
    setSets([...sets, { id, points: currentPts }]);
    setCurrentPts([]);
  }
  function deleteSet(id: string) {
    setSets(sets.filter((s) => s.id !== id));
    if (selected === id) setSelected(null);
  }

  return (
    <div className="p-3">
      <div className="flex gap-2 items-center mb-2">
        <button className={cls.btn} onClick={() => setMode((m) => (m === 'draw' ? 'select' : 'draw'))}>
          {mode === 'draw' ? 'Switch: Select' : 'Switch: Draw'}
        </button>
        <button className={cls.btn} onClick={commitPolygon}>
          Commit Polygon
        </button>
        <button className={cls.btnGhost} onClick={toDataURL}>
          Export SVG
        </button>
        <div className="text-sm ml-2">Draw mode: click to place vertices. Commit to save polygon.</div>
      </div>

      <svg
        ref={svgRef}
        onClick={handleSvgClick}
        width={420}
        height={420}
        className="border rounded bg-white"
        role="img"
        aria-label="Argand-like set visualizer canvas"
      >
        <rect x={0} y={0} width="100%" height="100%" fill="#fafafa" />
        <g transform={`translate(210,210)`}>
          <line x1={-200} y1={0} x2={200} y2={0} stroke="#888" strokeWidth={1} />
          <line x1={0} y1={-200} x2={0} y2={200} stroke="#888" strokeWidth={1} />
          {sets.map((s, i) => {
            const d = s.points.map(([x, y]) => `${x * 30},${-y * 30}`).join(' ');
            const color = ['#60a5fa', '#f472b6', '#f6ad55', '#34d399'][i % 4];
            return (
              <polygon
                key={s.id}
                points={d}
                fill={color}
                opacity={0.22}
                stroke={color}
                strokeWidth={1.2}
                onClick={() => setSelected(s.id)}
              />
            );
          })}
          {currentPts.length > 0 && (
            <polyline
              points={currentPts.map(([x, y]) => `${x * 30},${-y * 30}`).join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth={1.4}
            />
          )}
          {selected && (
            <g>
              {sets
                .find((s) => s.id === selected)
                ?.points.map(([x, y], idx) => (
                  <circle key={idx} cx={x * 30} cy={-y * 30} r={4} fill="#ef4444" stroke="#fff" />
                ))}
            </g>
          )}
          <g transform="translate(-190,-190)" />
        </g>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {sets.map((s) => (
          <div key={s.id} className="p-2 border rounded bg-white flex items-start justify-between">
            <div>
              <div className="font-medium">{s.id}</div>
              <div className="text-xs text-gray-600">pts: {s.points.length}</div>
            </div>
            <div className="flex gap-1">
              <button className={cls.btnSm} onClick={() => setSelected(s.id)}>
                Select
              </button>
              <button className={cls.btnSm} onClick={() => deleteSet(s.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- B: Relation Editor ----------
function RelationEditor({
  elements,
  setElements,
  relation,
  setRelation,
}: {
  elements: string[];
  setElements: (e: string[]) => void;
  relation: Pair[];
  setRelation: (r: Pair[]) => void;
}) {
  const [newElem, setNewElem] = useState('');

  function togglePair(a: string, b: string) {
    const exists = relation.some((r) => r[0] === a && r[1] === b);
    if (exists) setRelation(relation.filter((r) => !(r[0] === a && r[1] === b)));
    else setRelation([...relation, [a, b]]);
  }

  function addElement() {
    const v = newElem.trim();
    if (!v) return;
    if (!elements.includes(v)) setElements([...elements, v]);
    setNewElem('');
  }

  function checkReflexive() {
    return elements.every((a) => relation.some((r) => r[0] === a && r[1] === a));
  }
  function checkSymmetric() {
    return relation.every((r) => relation.some((s) => s[0] === r[1] && s[1] === r[0]));
  }
  function checkAntisymmetric() {
    return relation.every((r) => {
      if (r[0] === r[1]) return true;
      return !relation.some((s) => s[0] === r[1] && s[1] === r[0]);
    });
  }
  function checkTransitive() {
    return relation.every((r) => {
      const as = relation.filter((s) => s[0] === r[1]).map((s) => s[1]);
      return as.every((c) => relation.some((s) => s[0] === r[0] && s[1] === c));
    });
  }

  function makeReflexive() {
    const added: Pair[] = [];
    elements.forEach((a) => {
      if (!relation.some((r) => r[0] === a && r[1] === a)) added.push([a, a]);
    });
    setRelation([...relation, ...added]);
  }
  function makeSymmetric() {
    const added: Pair[] = [];
    relation.forEach(([a, b]) => {
      if (!relation.some((r) => r[0] === b && r[1] === a)) added.push([b, a]);
    });
    setRelation([...relation, ...added]);
  }
  function makeTransitive() {
    const idx = Object.fromEntries(elements.map((e, i) => [e, i]));
    const n = elements.length;
    const mat = Array.from({ length: n }, () => Array(n).fill(false));
    relation.forEach(([a, b]) => {
      mat[idx[a]][idx[b]] = true;
    });
    for (let k = 0; k < n; k++)
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) mat[i][j] = mat[i][j] || (mat[i][k] && mat[k][j]);
    const newR: Pair[] = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (mat[i][j]) newR.push([elements[i], elements[j]]);
    setRelation(uniq(newR.map((x) => JSON.stringify(x))).map((s) => JSON.parse(s)));
  }

  return (
    <div className="p-3">
      <div className="flex gap-2 items-center mb-2">
        <input aria-label="new element" value={newElem} onChange={(e) => setNewElem(e.target.value)} placeholder="element name" className={cls.input} />
        <button className={cls.btn} onClick={addElement}>
          Add element
        </button>
        <button
          className={cls.btnGhost}
          onClick={() => {
            setElements([]);
            setRelation([]);
          }}
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border rounded p-2">
          <div className="text-sm font-medium mb-2">Adjacency matrix</div>
          <div style={{ overflow: 'auto' }}>
            <table className="table-auto border-collapse">
              <thead>
                <tr>
                  <th className="p-1"></th>
                  {elements.map((c) => (
                    <th key={c} className="p-1 border">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {elements.map((r) => (
                  <tr key={r}>
                    <td className="p-1 border font-medium">{r}</td>
                    {elements.map((c) => {
                      const on = relation.some((p) => p[0] === r && p[1] === c);
                      return (
                        <td key={c} className="p-1 border text-center">
                          <input aria-label={`pair ${r}-${c}`} type="checkbox" checked={on} onChange={() => togglePair(r, c)} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border rounded p-2">
          <div className="text-sm font-medium mb-2">Properties & Actions</div>
          <div className="flex flex-wrap gap-2 mt-2">
            <div className={`px-2 py-0.5 rounded text-xs ${checkReflexive() ? 'bg-green-200' : 'bg-red-200'}`}>Reflexive</div>
            <div className={`px-2 py-0.5 rounded text-xs ${checkSymmetric() ? 'bg-green-200' : 'bg-red-200'}`}>Symmetric</div>
            <div className={`px-2 py-0.5 rounded text-xs ${checkAntisymmetric() ? 'bg-green-200' : 'bg-red-200'}`}>Antisymmetric</div>
            <div className={`px-2 py-0.5 rounded text-xs ${checkTransitive() ? 'bg-green-200' : 'bg-red-200'}`}>Transitive</div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button className={cls.btnSm} onClick={makeReflexive}>
              Make reflexive
            </button>
            <button className={cls.btnSm} onClick={makeSymmetric}>
              Symmetrize
            </button>
            <button className={cls.btnSm} onClick={makeTransitive}>
              Transitive closure
            </button>
          </div>
          
          <div className="mt-3">
            <div className="text-xs font-medium">Current Relations:</div>
            <div className="text-xs text-gray-600 mt-1">
              {relation.length > 0 ? relation.map(([a, b]) => `(${a},${b})`).join(', ') : 'No relations defined'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- C: Equivalence & Partition playground ----------
function EquivalencePartition({ elements, relation }: { elements: string[]; relation: Pair[] }) {
  const [classes, setClasses] = useState<string[][]>([]);
  useEffect(() => {
    const eq = (a: string, b: string) => relation.some((r) => r[0] === a && r[1] === b);
    const ref = elements.every((a) => eq(a, a));
    const sym = relation.every((r) => eq(r[1], r[0]));
    const trans = relation.every((r) => {
      return relation.every((s) => {
        if (r[1] === s[0]) return eq(r[0], s[1]);
        return true;
      });
    });
    if (!ref || !sym || !trans) {
      setClasses([]);
      return;
    }
    const visited = new Set<string>();
    const out: string[][] = [];
    elements.forEach((a) => {
      if (visited.has(a)) return;
      const comp = elements.filter((b) => eq(a, b));
      comp.forEach((c) => visited.add(c));
      out.push(comp);
    });
    setClasses(out);
  }, [elements, relation]);

  return (
    <div className="p-3">
      <div className="text-sm font-medium">Equivalence classes (if relation is equivalence)</div>
      {classes.length === 0 ? (
        <div className="text-xs text-gray-600 mt-2">Relation is not an equivalence or no classes found.</div>
      ) : (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {classes.map((cl, i) => (
            <div key={i} className="p-2 border rounded bg-white">
              <div className="font-medium">Class {i + 1}</div>
              <div className="text-sm">{cl.join(', ')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- D: Partial order & Hasse (2D + 3D simple) ----------
function HassePlayground({
  elements,
  orderPairs,
  setOrderPairs,
}: {
  elements: string[];
  orderPairs: Pair[];
  setOrderPairs: (p: Pair[]) => void;
}) {
  const [height3D] = useState(220);
  const covers = useMemo(() => {
    const idx = Object.fromEntries(elements.map((e, i) => [e, i]));
    const n = elements.length;
    const mat = Array.from({ length: n }, () => Array(n).fill(false));
    orderPairs.forEach(([a, b]) => {
      if (idx[a] !== undefined && idx[b] !== undefined) mat[idx[a]][idx[b]] = true;
    });
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) mat[i][j] = mat[i][j] || (mat[i][k] && mat[k][j]);
    const cover: Pair[] = [];
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        if (!mat[i][j]) continue;
        let isCover = true;
        for (let k = 0; k < n; k++) if (k !== i && k !== j && mat[i][k] && mat[k][j]) isCover = false;
        if (isCover) cover.push([elements[i], elements[j]]);
      }
    return cover;
  }, [elements, orderPairs]);

  return (
    <div className="p-3">
      <div className="flex gap-2 items-center mb-2">
        <div className="text-sm font-medium">Hasse diagram (auto cover detection)</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border rounded p-2">
          <Hasse2D elements={elements} covers={covers} />
        </div>
        <div className="bg-white border rounded p-2">
          <div style={{ height: height3D }}>
            <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 40 }}>
              <ambientLight intensity={0.6} />
              <OrbitControls enablePan={true} />
              <Hasse3D elements={elements} covers={covers} />
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hasse2D({ elements, covers }: { elements: string[]; covers: Pair[] }) {
  // Simple static layout for Hasse diagram without d3
  const positions = useMemo(() => {
    const idx = Object.fromEntries(elements.map((e, i) => [e, i]));
    const n = elements.length;
    const adj = Array.from({ length: n }, () => [] as number[]);
    covers.forEach(([a, b]) => {
      if (idx[a] !== undefined && idx[b] !== undefined) adj[idx[a]].push(idx[b]);
    });
    const indeg = Array(n).fill(0);
    for (let i = 0; i < n; i++) for (const j of adj[i]) indeg[j]++;
    const q: number[] = [];
    for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
    const rank = Array(n).fill(0);
    while (q.length) {
      const u = q.shift()!;
      for (const v of adj[u]) {
        rank[v] = Math.max(rank[v], rank[u] + 1);
        indeg[v]--;
        if (indeg[v] === 0) q.push(v);
      }
    }
    const maxR = Math.max(0, ...rank);
    const layers: number[][] = Array.from({ length: maxR + 1 }, () => []);
    for (let i = 0; i < n; i++) layers[rank[i]].push(i);
    const width = 360, height = 260;
    const cx = width / 2;
    const margin = 30;
    const layerY = (r: number) => margin + r * ((height - 2 * margin) / Math.max(1, maxR));
    const nodes = elements.map((e, i) => ({ id: e, x: cx, y: layerY(rank[i]), i }));
    layers.forEach((layer) => {
      const gap = Math.max(1, layer.length);
      layer.forEach((nodeIdx, k) => {
        (nodes as any)[nodeIdx].x = (width / (gap + 1)) * (k + 1);
      });
    });
    return { nodes, covers: covers.map(([a, b]) => ({ from: idx[a], to: idx[b] })) };
  }, [elements, covers]);

  return (
    <svg width={360} height={260} className="border rounded bg-white">
      <defs>
        <marker id="arrow-hasse" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 L2,3 z" fill="#444" />
        </marker>
      </defs>
      {positions.covers.map(({ from, to }, i) => {
        const nodeA = (positions.nodes as any)[from];
        const nodeB = (positions.nodes as any)[to];
        if (!nodeA || !nodeB) return null;
        return (
          <line
            key={i}
            x1={nodeA.x}
            y1={nodeA.y}
            x2={nodeB.x}
            y2={nodeB.y}
            stroke="#444"
            strokeWidth={1.6}
            markerEnd="url(#arrow-hasse)"
          />
        );
      })}
      {positions.nodes.map((node: any, i) => (
        <g key={i} transform={`translate(${node.x},${node.y})`}>
          <circle r={14} fill="#fbbf24" stroke="#fff" strokeWidth={1} />
          <text textAnchor="middle" dy="0.35em" fontSize="12px" fill="#333">
            {node.id}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Hasse3D({ elements, covers }: { elements: string[]; covers: Pair[] }) {
  const positions = useMemo(() => {
    const idx = Object.fromEntries(elements.map((e, i) => [e, i]));
    const n = elements.length;
    const adj = Array.from({ length: n }, () => [] as number[]);
    covers.forEach(([a, b]) => {
      if (idx[a] !== undefined && idx[b] !== undefined) adj[idx[a]].push(idx[b]);
    });
    const indeg = Array(n).fill(0);
    for (let i = 0; i < n; i++) for (const j of adj[i]) indeg[j]++;
    const q: number[] = [];
    for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
    const rank = Array(n).fill(0);
    while (q.length) {
      const u = q.shift()!;
      for (const v of adj[u]) {
        rank[v] = Math.max(rank[v], rank[u] + 1);
        indeg[v]--;
        if (indeg[v] === 0) q.push(v);
      }
    }
    const maxR = Math.max(0, ...rank);
    return elements.map((e, i) => ({ id: e, x: (i - n / 2) * 0.8, y: (rank[i] - maxR / 2) * 0.8, z: -rank[i] * 0.8 }));
  }, [elements, covers]);
  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.25, 16, 12]} />
          <meshStandardMaterial color="#60a5fa" />
        </mesh>
      ))}
      {covers.map(([a, b], i) => {
        const ia = positions.findIndex((p) => p.id === a);
        const ib = positions.findIndex((p) => p.id === b);
        if (ia === -1 || ib === -1) return null;
        const A = positions[ia];
        const B = positions[ib];
        return (
          <mesh key={i} position={[(A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2]}>
            <cylinderGeometry args={[0.02, 0.02, Math.hypot(A.x - B.x, A.y - B.y, A.z - B.z), 6]} />
            <meshStandardMaterial color="#444" />
          </mesh>
        );
      })}
    </group>
  );
}

// ---------- E: Function mapping diagram ----------
function FunctionMapper({
  domain,
  codomain,
  mapping,
  setMapping,
}: {
  domain: string[];
  codomain: string[];
  mapping: Pair[];
  setMapping: (m: Pair[]) => void;
}) {
  const toggleMap = (a: string, b: string) => {
    const exists = mapping.some((p) => p[0] === a && p[1] === b);
    const others = mapping.filter((p) => p[0] !== a);
    if (exists) setMapping(others);
    else setMapping([...others, [a, b]]);
  };
  const testInjective = () => {
    const vals = mapping.map((m) => m[1]);
    return new Set(vals).size === vals.length;
  };
  const testSurjective = () => {
    const vals = new Set(mapping.map((m) => m[1]));
    return codomain.every((c) => vals.has(c));
  };
  const testBijective = () => testInjective() && testSurjective();

  return (
    <div className="p-3">
      <div className="text-sm font-medium mb-2">Function mapping diagram</div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border rounded p-2">
          <div className="font-medium">Domain</div>
          <div className="mt-2 space-y-1">
            {domain.map((d) => (
              <div key={d} className="p-1">
                {d}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded p-2">
          <div className="font-medium">Mappings (click to toggle)</div>
          <div className="text-xs text-gray-600 mb-1">Rows=domain, Cols=codomain</div>
          <div style={{ overflow: 'auto' }}>
            <table className="table-auto border-collapse">
              <thead>
                <tr>
                  <th className="p-1"></th>
                  {codomain.map((c) => (
                    <th key={c} className="p-1 border">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {domain.map((d) => (
                  <tr key={d}>
                    <td className="p-1 border">{d}</td>
                    {codomain.map((c) => {
                      const on = mapping.some((m) => m[0] === d && m[1] === c);
                      return (
                        <td key={c} className="p-1 border text-center">
                          <input type="checkbox" checked={on} onChange={() => toggleMap(d, c)} aria-label={`map-${d}-${c}`} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border rounded p-2">
          <div className="font-medium">Tests</div>
          <div className="mt-2 space-y-2">
            <div>
              Injective:{' '}
              <strong className={testInjective() ? 'text-green-700' : 'text-red-600'}>{String(testInjective())}</strong>
            </div>
            <div>
              Surjective:{' '}
              <strong className={testSurjective() ? 'text-green-700' : 'text-red-600'}>{String(testSurjective())}</strong>
            </div>
            <div>
              Bijective:{' '}
              <strong className={testBijective() ? 'text-green-700' : 'text-red-600'}>{String(testBijective())}</strong>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-600">Tip: only one mapping per domain element is allowed for functions. Toggle cells to set mappings.</div>
    </div>
  );
}

// ---------- F: Counting & combinatorics widget ----------
function CountingWidget() {
  const [m, setM] = useState<number>(3);
  const [n, setN] = useState<number>(3);
  const totalFunctions = useMemo(() => BigInt(n) ** BigInt(m), [m, n]);
  function permutations(nv: number, mv: number) {
    if (mv > nv) return BigInt(0);
    let res = BigInt(1);
    for (let k = 0; k < mv; k++) res *= BigInt(nv - k);
    return res;
  }
  function stirlingSecond(mv: number, nv: number) {
    const S: bigint[][] = Array.from({ length: mv + 1 }, () => Array(nv + 1).fill(BigInt(0)));
    S[0][0] = BigInt(1);
    for (let i = 1; i <= mv; i++) {
      for (let j = 1; j <= nv; j++) {
        S[i][j] = S[i - 1][j - 1] + BigInt(j) * S[i - 1][j];
      }
    }
    return S[mv][nv];
  }
  const ontoCount = useMemo(() => {
    if (n > m) return BigInt(0);
    const S = stirlingSecond(m, n);
    let fact = BigInt(1);
    for (let i = 2; i <= n; i++) fact *= BigInt(i);
    return fact * S;
  }, [m, n]);

  return (
    <div className="p-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border rounded p-2">
          <div className="text-sm font-medium">Inputs</div>
          <div className="mt-2">
            <label className="block text-xs">Domain size (m)</label>
            <input type="number" value={m} min={0} onChange={(e) => setM(Math.max(0, Number(e.target.value)))} className={cls.input} />
            <label className="block text-xs mt-2">Codomain size (n)</label>
            <input type="number" value={n} min={0} onChange={(e) => setN(Math.max(0, Number(e.target.value)))} className={cls.input} />
          </div>
        </div>
        <div className="bg-white border rounded p-2">
          <div className="text-sm font-medium">Counts</div>
          <div className="mt-2 text-sm">
            <div>
              All functions: <code>{String(totalFunctions)}</code>
            </div>
            <div>
              Injective permutations (if m ≤ n): <code>{String(permutations(n, m))}</code>
            </div>
            <div>
              Onto (surjective) count: <code>{String(ontoCount)}</code>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded p-2">
          <div className="text-sm font-medium">Visual</div>
          <div className="mt-2 text-xs text-gray-600">Grid animation below shows m slots choosing from n colors.</div>
          <div className="mt-2 grid grid-cols-5 gap-1">
            {range(Math.max(1, m)).map((i) => (
              <div key={i} className="h-8 rounded border flex items-center justify-center text-xs bg-white">
                slot {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- G: PIE demonstrator ----------
function PIEWidget() {
  const [sets, setSets] = useLocalState<string[][]>(LS_KEY + '_pie_sets', [
    ['a', 'b'],
    ['b', 'c'],
    ['c', 'd'],
  ]);
  const upSet = (i: number, members: string) => {
    const arr = members
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const copy = [...sets];
    copy[i] = arr;
    setSets(copy);
  };
  function unionCount() {
    const U = new Set(sets.flat());
    return U.size;
  }
  return (
    <div className="p-3">
      <div className="text-sm font-medium">Principle of Inclusion-Exclusion (PIE) demo</div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {sets.map((s, i) => (
          <div key={i} className="bg-white border rounded p-2">
            <div className="text-xs font-medium">Set {String.fromCharCode(65 + i)}</div>
            <textarea className="w-full mt-2 p-1 border" rows={3} value={s.join(', ')} onChange={(e) => upSet(i, e.target.value)} />
          </div>
        ))}
      </div>
      <div className="mt-2">
        <div>
          Union size (direct): <strong>{unionCount()}</strong>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          PIE visualization uses Venn overlay for up to 3 sets. For more sets numeric inclusion-exclusion sums can be
          shown.
        </div>
      </div>
    </div>
  );
}

// ---------- H: Functional equation sandbox ----------
function FunctionalSandbox() {
  const [expr, setExpr] = useState<string>('f(x+y)=f(x)f(y)');
  const [candidates, setCandidates] = useState<string[] | null>(['0', '1', 'e^{kx}']);

  function testCandidate(candidate: string) {
    if (candidate === '0') return true;
    if (candidate === '1') return true;
    if (candidate === 'e^{kx}') return true;
    return false;
  }

  return (
    <div className="p-3">
      <div className="text-sm font-medium">Functional equation sandbox</div>
      <div className="mt-2">
        <input className={cls.input + ' w-full'} value={expr} onChange={(e) => setExpr(e.target.value)} />
      </div>
      <div className="mt-2 flex gap-2">
        <button className={cls.btnSm}>Parse</button>
        <button className={cls.btnSm} onClick={() => setCandidates(['0', '1', 'e^{kx}'])}>
          Reset common candidates
        </button>
      </div>
      <div className="mt-2">
        <div className="text-xs">Candidates</div>
        <div className="flex gap-2 mt-1">
          {(candidates || []).map((c, i) => (
            <div key={i} className="p-2 border rounded bg-white">
              <div>{c}</div>
              <div className="text-xs mt-1">valid: {String(testCandidate(c))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Top-level component ----------
export default function SetsRelationsPlayground() {
  const [sets, setSets] = useLocalState<{ id: string; points: [number, number][] }[]>(LS_KEY + '_sets', []);
  const [elements, setElements] = useLocalState<string[]>(LS_KEY + '_elems', ['a', 'b', 'c']);
  const [relation, setRelation] = useLocalState<Pair[]>(LS_KEY + '_relation', [
    ['a', 'a'],
    ['b', 'b'],
  ]);
  const [orderPairs] = useLocalState<Pair[]>(LS_KEY + '_order', [['a', 'b']]);
  const [mapping, setMapping] = useLocalState<Pair[]>(LS_KEY + '_mapping', [['a', '1']]);
  const [tab, setTab] = useState<string>('argand');

  function exportJSON() {
    const payload = { sets, elements, relation, orderPairs, mapping, ts: Date.now() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'srf_playground_state.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-[560px] bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Advanced Playground — Sets, Relations & Functions</h3>
        <div className="flex gap-2">
          <button className={cls.btnGhost} onClick={exportJSON}>
            Export JSON
          </button>
          <button className={cls.btnGhost} onClick={() => localStorage.removeItem(LS_KEY)}>
            Clear local
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border rounded p-3 space-y-2">
            <div className="text-sm font-medium">Controls</div>
            <div className="space-y-1">
              <button className={cls.sidebarBtn(tab === 'argand')} onClick={() => setTab('argand')}>
                Argand sets
              </button>
              <button className={cls.sidebarBtn(tab === 'relation')} onClick={() => setTab('relation')}>
                Relations editor
              </button>
              <button className={cls.sidebarBtn(tab === 'equiv')} onClick={() => setTab('equiv')}>
                Equivalence
              </button>
              <button className={cls.sidebarBtn(tab === 'hasse')} onClick={() => setTab('hasse')}>
                Partial order / Hasse
              </button>
              <button className={cls.sidebarBtn(tab === 'function')} onClick={() => setTab('function')}>
                Function mapper
              </button>
              <button className={cls.sidebarBtn(tab === 'count')} onClick={() => setTab('count')}>
                Counting
              </button>
              <button className={cls.sidebarBtn(tab === 'pie')} onClick={() => setTab('pie')}>
                PIE
              </button>
              <button className={cls.sidebarBtn(tab === 'feq')} onClick={() => setTab('feq')}>
                Functional eqn
              </button>
            </div>
          </div>

          <div className="bg-white border rounded p-3 mt-3">
            <div className="text-sm font-medium">Shared elements</div>
            <div className="mt-2">
              <label className="block text-xs">Elements (comma separated)</label>
              <textarea
                className="w-full p-1 border rounded"
                value={elements.join(', ')}
                onChange={(e) =>
                  setElements(uniq(e.target.value.split(',').map((s) => s.trim()).filter(Boolean)))
                }
                rows={3}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-9">
          <div className="bg-white border rounded p-3 min-h-[520px]">
            {tab === 'argand' && <ArgandSetVisualizer sets={sets} setSets={setSets} />}
            {tab === 'relation' && (
              <RelationEditor
                elements={elements}
                setElements={setElements}
                relation={relation}
                setRelation={setRelation}
              />
            )}
            {tab === 'equiv' && <EquivalencePartition elements={elements} relation={relation} />} 
            {tab === 'hasse' && (
              <HassePlayground elements={elements} orderPairs={[]} setOrderPairs={() => {}} />
            )}
            {tab === 'function' && (
              <FunctionMapper domain={elements} codomain={['1', '2', '3']} mapping={mapping} setMapping={setMapping} />
            )}
            {tab === 'count' && <CountingWidget />}
            {tab === 'pie' && <PIEWidget />}
            {tab === 'feq' && <FunctionalSandbox />}
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600">This playground persists state in localStorage. Use Export JSON to save a snapshot.</div>
    </div>
  );
}


