import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function parseSet(input: string): string[] {
  return Array.from(new Set(input
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  ));
}

function setUnion(a: string[], b: string[]) {
  return Array.from(new Set([...a, ...b]));
}
function setIntersection(a: string[], b: string[]) {
  const bs = new Set(b);
  return a.filter(x => bs.has(x));
}
function setDifference(a: string[], b: string[]) {
  const bs = new Set(b);
  return a.filter(x => !bs.has(x));
}

export function SetsRelationsFunctionsPlayground() {
  // Shared A, B sets
  const [aInput, setAInput] = useState('1,2,3');
  const [bInput, setBInput] = useState('3,4');
  const A = useMemo(() => parseSet(aInput), [aInput]);
  const B = useMemo(() => parseSet(bInput), [bInput]);

  // Venn highlight mode
  const [mode, setMode] = useState<'none' | 'union' | 'intersection' | 'a-b' | 'b-a'>('none');

  // Relation grid
  const [relation, setRelation] = useState<Array<[string,string]>>([]);
  const togglePair = (x: string, y: string) => {
    const key = JSON.stringify([x,y]);
    const has = relation.some(p => JSON.stringify(p) === key);
    setRelation(prev => has ? prev.filter(p => JSON.stringify(p) !== key) : [...prev, [x,y]]);
  };

  // Function mapping (one image per a in A)
  const [mapping, setMapping] = useState<Record<string, string | ''>>({});
  const isFunction = useMemo(() => A.every(a => mapping[a] && mapping[a] !== ''), [A, mapping]);
  const range = useMemo(() => Array.from(new Set(A.map(a => mapping[a]).filter(Boolean) as string[])), [A, mapping]);

  const U = useMemo(() => setUnion(A, B), [A, B]);
  const Ustr = (arr: string[]) => `{ ${arr.join(', ')} }`;

  const presetBeginner = () => {
    setAInput('1,2,3');
    setBInput('3,4');
    setMode('intersection');
    setRelation([]);
    setMapping({});
  };
  const presetRelationExample = () => {
    setAInput('1,2');
    setBInput('x,y');
    setMode('none');
    setRelation([]);
    setMapping({});
  };
  const resetAll = () => {
    setAInput('');
    setBInput('');
    setMode('none');
    setRelation([]);
    setMapping({});
  };

  return (
    <div className="space-y-6">
      {/* Sets & Venn Diagram */}
      <Card className="border-0 shadow-soft bg-white/70">
        <CardHeader>
          <CardTitle className="text-card-foreground">Interactive: Sets and Venn Diagram</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Set A (comma-separated)</label>
              <Input value={aInput} onChange={e => setAInput(e.target.value)} placeholder="e.g. 1,2,3" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Set B (comma-separated)</label>
              <Input value={bInput} onChange={e => setBInput(e.target.value)} placeholder="e.g. 3,4" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center text-sm">
            <span className="text-muted-foreground">Highlight:</span>
            {(['none','union','intersection','a-b','b-a'] as const).map(m => (
              <Button key={m} size="sm" variant={mode === m ? 'default' : 'outline'} onClick={() => setMode(m)}>
                {m === 'none' && 'None'}
                {m === 'union' && 'A ∪ B'}
                {m === 'intersection' && 'A ∩ B'}
                {m === 'a-b' && 'A − B'}
                {m === 'b-a' && 'B − A'}
              </Button>
            ))}
            <div className="mx-2 h-5 w-px bg-border" />
            <Button size="sm" variant="outline" onClick={presetBeginner}>Beginner preset</Button>
            <Button size="sm" variant="outline" onClick={presetRelationExample}>Relation example</Button>
            <Button size="sm" variant="ghost" onClick={resetAll}>Reset</Button>
          </div>

          {/* Simple Venn graphic (SVG for accurate intersections) */}
          <div className="relative mx-auto mt-2 h-44 w-80">
            <svg viewBox="0 0 200 140" className="absolute inset-0 h-full w-full select-none">
              <defs>
                <clipPath id="clipA">
                  <circle cx="80" cy="70" r="50" />
                </clipPath>
                <clipPath id="clipB">
                  <circle cx="120" cy="70" r="50" />
                </clipPath>
                <mask id="maskAminusB">
                  <rect width="100%" height="100%" fill="black" />
                  <circle cx="80" cy="70" r="50" fill="white" />
                  <circle cx="120" cy="70" r="50" fill="black" />
                </mask>
                <mask id="maskBminusA">
                  <rect width="100%" height="100%" fill="black" />
                  <circle cx="120" cy="70" r="50" fill="white" />
                  <circle cx="80" cy="70" r="50" fill="black" />
                </mask>
              </defs>

              {mode === 'union' && (
                <g>
                  <circle cx="80" cy="70" r="50" fill="rgba(59,130,246,0.15)" />
                  <circle cx="120" cy="70" r="50" fill="rgba(16,185,129,0.15)" />
                </g>
              )}

              {mode === 'intersection' && (
                <g clipPath="url(#clipA)">
                  <circle cx="120" cy="70" r="50" fill="rgba(76,110,245,0.25)" />
                </g>
              )}

              {mode === 'a-b' && (
                <rect width="200" height="140" fill="rgba(59,130,246,0.2)" mask="url(#maskAminusB)" />
              )}

              {mode === 'b-a' && (
                <rect width="200" height="140" fill="rgba(16,185,129,0.2)" mask="url(#maskBminusA)" />
              )}

              <circle cx="80" cy="70" r="50" fill="none" stroke="rgba(59,130,246,0.6)" strokeWidth="2" />
              <circle cx="120" cy="70" r="50" fill="none" stroke="rgba(16,185,129,0.6)" strokeWidth="2" />

              <text x="80" y="124" textAnchor="middle" fontSize="14" fill="currentColor">A</text>
              <text x="120" y="124" textAnchor="middle" fontSize="14" fill="currentColor">B</text>
            </svg>
          </div>

          {/* Region lists for beginners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded-md bg-muted/40">
              <div className="font-medium text-card-foreground mb-1">Only in A (A − B)</div>
              <div className="flex flex-wrap gap-1">{setDifference(A,B).map((x,i) => <Badge key={i} variant="secondary">{x}</Badge>)}</div>
            </div>
            <div className="p-3 rounded-md bg-muted/40">
              <div className="font-medium text-card-foreground mb-1">Overlap (A ∩ B)</div>
              <div className="flex flex-wrap gap-1">{setIntersection(A,B).map((x,i) => <Badge key={i} variant="secondary">{x}</Badge>)}</div>
            </div>
            <div className="p-3 rounded-md bg-muted/40">
              <div className="font-medium text-card-foreground mb-1">Only in B (B − A)</div>
              <div className="flex flex-wrap gap-1">{setDifference(B,A).map((x,i) => <Badge key={i} variant="secondary">{x}</Badge>)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-3 rounded-md bg-muted/40">
              <div className="font-medium text-card-foreground mb-1">A</div>
              <div className="text-muted-foreground">{Ustr(A)}</div>
            </div>
            <div className="p-3 rounded-md bg-muted/40">
              <div className="font-medium text-card-foreground mb-1">B</div>
              <div className="text-muted-foreground">{Ustr(B)}</div>
            </div>
            <div className="p-3 rounded-md bg-muted/40">
              <div className="font-medium text-card-foreground mb-1">A ∪ B</div>
              <div className="text-muted-foreground">{Ustr(setUnion(A,B))}</div>
            </div>
            <div className="p-3 rounded-md bg-muted/40 col-span-2 md:col-span-1">
              <div className="font-medium text-card-foreground mb-1">Universal U (A ∪ B)</div>
              <div className="text-muted-foreground">{Ustr(U)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export default SetsRelationsFunctionsPlayground;
