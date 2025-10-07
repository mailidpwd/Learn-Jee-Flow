import React, { useEffect, useRef } from 'react';

export default function ComplexNumbersInteractive() {
  const argandCanvasRef = useRef<HTMLCanvasElement>(null);
  const quadCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Utility
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    // ARGAND PLANE
    const argandCanvas = argandCanvasRef.current;
    if (!argandCanvas) return;

    const argandUI = {
      zText: document.getElementById('zText'),
      modText: document.getElementById('modText'),
      conjText: document.getElementById('conjText')
    };
    const aRange = document.getElementById('aRange') as HTMLInputElement;
    const bRange = document.getElementById('bRange') as HTMLInputElement;
    const resetBtn = document.getElementById('resetArg');
    const ctx = argandCanvas.getContext('2d');
    if (!ctx) return;

    let W: number, H: number, cx: number, cy: number, scale: number;
    let z = { a: 2, b: 1 };
    let dragging = false;

    function resize() {
      W = argandCanvas.clientWidth;
      H = argandCanvas.clientHeight;
      argandCanvas.width = W * devicePixelRatio;
      argandCanvas.height = H * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      cx = W / 2;
      cy = H / 2;
      scale = Math.min(W, H) / 14;
      draw();
    }

    function toScreen(x: number, y: number) {
      return { x: cx + x * scale, y: cy - y * scale };
    }
    function toPlane(sx: number, sy: number) {
      return { a: (sx - cx) / scale, b: (cy - sy) / scale };
    }

    function drawGrid() {
      ctx.clearRect(0, 0, W, H);
      // white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      // grid lines
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      // vertical lines
      for (let i = -7; i <= 7; i++) {
        const s = toScreen(i, 0);
        ctx.beginPath();
        ctx.moveTo(s.x, 0);
        ctx.lineTo(s.x, H);
        ctx.stroke();
      }
      for (let j = -7; j <= 7; j++) {
        const s = toScreen(0, j);
        ctx.beginPath();
        ctx.moveTo(0, s.y);
        ctx.lineTo(W, s.y);
        ctx.stroke();
      }
      // central axes bolder
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(W, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, H);
      ctx.stroke();
    }

    function draw() {
      drawGrid();
      // point z
      const s = toScreen(z.a, z.b);
      // radius circle
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(cx, cy, Math.hypot(s.x - cx, s.y - cy), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // line from origin
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      // conjugate point
      const sc = toScreen(z.a, -z.b);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(sc.x, sc.y, 8, 0, Math.PI * 2);
      ctx.fill();
      // z point
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
      ctx.fill();
      // labels
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 12px system-ui';
      ctx.fillText('z', s.x + 12, s.y - 6);
      ctx.fillStyle = '#059669';
      ctx.fillText('conjugate', sc.x + 12, sc.y - 6);
      // update UI
      if (argandUI.zText) argandUI.zText.textContent = z.a.toFixed(2) + ' + ' + z.b.toFixed(2) + 'i';
      if (argandUI.modText) argandUI.modText.textContent = Math.hypot(z.a, z.b).toFixed(3);
      if (argandUI.conjText) argandUI.conjText.textContent = z.a.toFixed(2) + ' - ' + Math.abs(z.b).toFixed(2) + 'i';
    }

    function setFromRanges() {
      z.a = parseFloat(aRange.value);
      z.b = parseFloat(bRange.value);
      draw();
    }

    if (aRange) aRange.addEventListener('input', () => { setFromRanges(); });
    if (bRange) bRange.addEventListener('input', () => { setFromRanges(); });
    if (resetBtn) resetBtn.addEventListener('click', () => { z = { a: 2, b: 1 }; aRange.value = '2'; bRange.value = '1'; draw(); });

    argandCanvas.addEventListener('pointerdown', (e) => {
      dragging = true;
      argandCanvas.setPointerCapture(e.pointerId);
      const rect = argandCanvas.getBoundingClientRect();
      const p = toPlane(e.clientX - rect.left, e.clientY - rect.top);
      z.a = clamp(p.a, -7, 7);
      z.b = clamp(p.b, -7, 7);
      aRange.value = z.a.toString();
      bRange.value = z.b.toString();
      draw();
    });

    argandCanvas.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const rect = argandCanvas.getBoundingClientRect();
      const p = toPlane(e.clientX - rect.left, e.clientY - rect.top);
      z.a = clamp(p.a, -7, 7);
      z.b = clamp(p.b, -7, 7);
      aRange.value = z.a.toString();
      bRange.value = z.b.toString();
      draw();
    });

    argandCanvas.addEventListener('pointerup', (e) => {
      dragging = false;
      argandCanvas.releasePointerCapture(e.pointerId);
    });

    window.addEventListener('resize', resize);
    resize();

    // QUADRATIC
    const quadCanvas = quadCanvasRef.current;
    if (!quadCanvas) return;

    const aQ = document.getElementById('aQ') as HTMLInputElement;
    const bQ = document.getElementById('bQ') as HTMLInputElement;
    const cQ = document.getElementById('cQ') as HTMLInputElement;
    const aval = document.getElementById('aval');
    const bval = document.getElementById('bval');
    const cval = document.getElementById('cval');
    const quadCtx = quadCanvas.getContext('2d');
    if (!quadCtx) return;

    let quadW: number, quadH: number, quadCx: number, quadCy: number, quadScale: number;

    function quadResize() {
      quadW = quadCanvas.clientWidth;
      quadH = quadCanvas.clientHeight;
      quadCanvas.width = quadW * devicePixelRatio;
      quadCanvas.height = quadH * devicePixelRatio;
      quadCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      quadCx = quadW / 2;
      quadCy = quadH / 2;
      quadScale = Math.min(quadW, quadH) / 24;
      quadDraw();
    }

    function worldToScreen(x: number, y: number) {
      return { x: quadCx + x * quadScale, y: quadCy - y * quadScale };
    }

    function quadDrawGrid() {
      quadCtx.clearRect(0, 0, quadW, quadH);
      // white background
      quadCtx.fillStyle = '#ffffff';
      quadCtx.fillRect(0, 0, quadW, quadH);
      // grid lines
      quadCtx.strokeStyle = '#e2e8f0';
      quadCtx.lineWidth = 1;
      for (let i = -12; i <= 12; i++) {
        const s = worldToScreen(i, 0);
        quadCtx.beginPath();
        quadCtx.moveTo(s.x, 0);
        quadCtx.lineTo(s.x, quadH);
        quadCtx.stroke();
      }
      for (let j = -8; j <= 8; j++) {
        const s = worldToScreen(0, j);
        quadCtx.beginPath();
        quadCtx.moveTo(0, s.y);
        quadCtx.lineTo(quadW, s.y);
        quadCtx.stroke();
      }
      // central axes bolder
      quadCtx.strokeStyle = '#3b82f6';
      quadCtx.lineWidth = 2;
      quadCtx.beginPath();
      quadCtx.moveTo(0, quadCy);
      quadCtx.lineTo(quadW, quadCy);
      quadCtx.moveTo(quadCx, 0);
      quadCtx.lineTo(quadCx, quadH);
      quadCtx.stroke();
    }

    function computeRoots(a: number, b: number, c: number) {
      const D = b * b - 4 * a * c;
      if (D >= 0) {
        const r1 = (-b + Math.sqrt(D)) / (2 * a);
        const r2 = (-b - Math.sqrt(D)) / (2 * a);
        return { D, r1, r2 };
      } else {
        const real = -b / (2 * a);
        const imag = Math.sqrt(-D) / (2 * a);
        return { D, r1: real + ' + ' + imag + 'i', r2: real + ' - ' + imag + 'i' };
      }
    }

    function quadDraw() {
      quadDrawGrid();
      const a = parseFloat(aQ.value);
      const b = parseFloat(bQ.value);
      const c = parseFloat(cQ.value);
      if (aval) aval.textContent = a.toString();
      if (bval) bval.textContent = b.toString();
      if (cval) cval.textContent = c.toString();

      // draw parabola
      quadCtx.strokeStyle = '#8b5cf6';
      quadCtx.lineWidth = 3;
      quadCtx.beginPath();
      for (let sx = -12; sx <= 12; sx += 0.1) {
        const x = sx;
        const y = a * x * x + b * x + c;
        const p = worldToScreen(x, y);
        if (sx == -12) quadCtx.moveTo(p.x, p.y);
        else quadCtx.lineTo(p.x, p.y);
      }
      quadCtx.stroke();

      // compute vertex and discriminant
      const D = b * b - 4 * a * c;
      const vx = -b / (2 * a);
      const vy = a * vx * vx + b * vx + c;
      const sv = worldToScreen(vx, vy);

      // draw vertex
      quadCtx.fillStyle = '#f59e0b';
      quadCtx.beginPath();
      quadCtx.arc(sv.x, sv.y, 8, 0, Math.PI * 2);
      quadCtx.fill();
      quadCtx.fillStyle = '#92400e';
      quadCtx.font = 'bold 12px system-ui';
      quadCtx.fillText('vertex', sv.x + 12, sv.y + 4);

      // axis of symmetry
      quadCtx.strokeStyle = '#ef4444';
      quadCtx.lineWidth = 2;
      quadCtx.setLineDash([3, 3]);
      quadCtx.beginPath();
      const lineTop = worldToScreen(vx, 12);
      const lineDown = worldToScreen(vx, -12);
      quadCtx.moveTo(lineTop.x, lineTop.y);
      quadCtx.lineTo(lineDown.x, lineDown.y);
      quadCtx.stroke();
      quadCtx.setLineDash([]);

      // roots
      const roots = computeRoots(a, b, c);
      if (roots.D >= 0) {
        const r1 = roots.r1 as number;
        const r2 = roots.r2 as number;
        const p1 = worldToScreen(r1, 0);
        const p2 = worldToScreen(r2, 0);
        quadCtx.fillStyle = '#10b981';
        quadCtx.beginPath();
        quadCtx.arc(p1.x, p1.y, 8, 0, Math.PI * 2);
        quadCtx.fill();
        quadCtx.beginPath();
        quadCtx.arc(p2.x, p2.y, 8, 0, Math.PI * 2);
        quadCtx.fill();
        quadCtx.fillStyle = '#059669';
        quadCtx.font = 'bold 12px system-ui';
        quadCtx.fillText('root1', p1.x + 10, p1.y + 4);
        quadCtx.fillText('root2', p2.x + 10, p2.y + 4);
      } else {
        // show complex roots on a mini-argand inside
        quadCtx.fillStyle = '#f8fafc';
        quadCtx.fillRect(quadW - 140, 10, 120, 80);
        quadCtx.strokeStyle = '#3b82f6';
        quadCtx.lineWidth = 2;
        quadCtx.strokeRect(quadW - 140, 10, 120, 80);
        quadCtx.fillStyle = '#1e40af';
        quadCtx.font = 'bold 12px system-ui';
        quadCtx.fillText('Complex Roots (mini Argand)', quadW - 132, 28);

        // draw small plane
        const ox = quadW - 80;
        const oy = 60;
        const scale2 = 12;
        quadCtx.strokeStyle = '#3b82f6';
        quadCtx.lineWidth = 1;
        quadCtx.beginPath();
        quadCtx.moveTo(ox - 20, oy);
        quadCtx.lineTo(ox + 20, oy);
        quadCtx.moveTo(ox, oy - 18);
        quadCtx.lineTo(ox, oy + 18);
        quadCtx.stroke();

        // compute complex roots
        const real = -b / (2 * a);
        const imag = Math.sqrt(-D) / (2 * a);

        // draw points
        quadCtx.fillStyle = '#8b5cf6';
        quadCtx.beginPath();
        quadCtx.arc(ox + real * scale2, oy - imag * scale2, 6, 0, Math.PI * 2);
        quadCtx.fill();
        quadCtx.beginPath();
        quadCtx.arc(ox + real * scale2, oy + imag * scale2, 6, 0, Math.PI * 2);
        quadCtx.fill();
        quadCtx.fillStyle = '#7c3aed';
        quadCtx.font = 'bold 11px system-ui';
        quadCtx.fillText(real.toFixed(2) + ' ± ' + imag.toFixed(2) + 'i', quadW - 132, 70);
      }

      // show discriminant value
      quadCtx.fillStyle = '#1e40af';
      quadCtx.font = 'bold 13px system-ui';
      quadCtx.fillText('Discriminant D = ' + D.toFixed(3), 10, 20);
    }

    if (aQ) aQ.addEventListener('input', () => { quadDraw(); });
    if (bQ) bQ.addEventListener('input', () => { quadDraw(); });
    if (cQ) cQ.addEventListener('input', () => { quadDraw(); });
    const resetQuadBtn = document.getElementById('resetQuad');
    if (resetQuadBtn) resetQuadBtn.addEventListener('click', () => { aQ.value = '1'; bQ.value = '0'; cQ.value = '0'; quadDraw(); });

    window.addEventListener('resize', quadResize);
    quadResize();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', quadResize);
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6 bg-white text-gray-800 rounded-xl border border-gray-200">
      <style jsx>{`
        :root {
          --bg: #ffffff;
          --card: #f8fafc;
          --accent: #3b82f6;
          --muted: #64748b;
          --glass: rgba(255, 255, 255, 0.8);
        }
        
        .interactive-card {
          background: #ffffff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }
        
        .scene {
          height: 400px;
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          background: linear-gradient(180deg, #f8fafc, #ffffff);
          border: 1px solid #e2e8f0;
        }
        
        .controls-box {
          background: #f8fafc;
          padding: 16px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          margin-top: 12px;
          font-size: 13px;
        }
        
        .small {
          font-size: 12px;
          color: var(--muted);
        }
        
        .controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .row-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        input[type="range"] {
          width: 160px;
        }
        
        button {
          background: var(--accent);
          border: none;
          color: white;
          padding: 6px 10px;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .note {
          font-size: 12px;
          color: #64748b;
        }
        
        .cursor-instructions {
          position: fixed;
          left: 18px;
          bottom: 18px;
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
          padding: 12px;
          border-radius: 12px;
          color: #1e40af;
          border: 1px solid rgba(59, 130, 246, 0.2);
          font-size: 13px;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.1);
        }
        
        .hint {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
        }
        
        .kbd {
          background: #f1f5f9;
          padding: 6px 8px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 12px;
          color: #475569;
        }
        
        @media (max-width: 980px) {
          .grid-cols-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="flex gap-3 items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 mb-1">Complex Numbers & Quadratic Equations — Interactive Theory</h1>
          <p className="text-sm text-gray-600">Play with the visuals. Drag points. Move sliders. Cursor tips guide you step-by-step.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Argand plane card */}
        <section className="interactive-card">
          <strong className="text-blue-600">Argand Plane — Complex Numbers</strong>
          <div className="scene" id="argandScene">
            <canvas ref={argandCanvasRef} id="argand" className="w-full h-full block"></canvas>
          </div>
          
          {/* Control box outside the graph */}
          <div className="controls-box">
            <div className="small mb-2">Current Values:</div>
            <div className="small">Point z = <span id="zText">0 + 0i</span></div>
            <div className="small">Modulus |z| = <span id="modText">0</span></div>
            <div className="small">Conjugate = <span id="conjText">0 - 0i</span></div>
            <div style={{ height: '12px' }}></div>
            <div className="controls">
              <div className="row-controls">
                <label className="small">a (real)</label>
                <input id="aRange" type="range" min="-6" max="6" step="0.1" defaultValue="2" />
              </div>
              <div className="row-controls">
                <label className="small">b (imag)</label>
                <input id="bRange" type="range" min="-6" max="6" step="0.1" defaultValue="1" />
              </div>
              <div className="row-controls">
                <button id="resetArg">Reset</button>
                <div style={{ flex: 1 }}></div>
              </div>
            </div>
          </div>
          <p className="note">Try: drag the point or move sliders. Watch the conjugate reflect across the horizontal axis. See modulus as radius.</p>
        </section>

        {/* Quadratic card */}
        <section className="interactive-card">
          <strong className="text-blue-600">Quadratic Graph — Parabola & Roots</strong>
          <div className="scene" id="quadScene">
            <canvas ref={quadCanvasRef} id="quad" className="w-full h-full block"></canvas>
          </div>
          
          {/* Control box outside the graph */}
          <div className="controls-box">
            <div className="small mb-2">Current Equation:</div>
            <div className="small">y = ax² + bx + c</div>
            <div className="small">a = <span id="aval">1</span> &nbsp; b = <span id="bval">0</span> &nbsp; c = <span id="cval">0</span></div>
            <div style={{ height: '12px' }}></div>
            <div className="controls">
              <div className="row-controls">
                <label className="small">a</label>
                <input id="aQ" type="range" min="-3" max="3" step="0.1" defaultValue="1" />
              </div>
              <div className="row-controls">
                <label className="small">b</label>
                <input id="bQ" type="range" min="-6" max="6" step="0.1" defaultValue="0" />
              </div>
              <div className="row-controls">
                <label className="small">c</label>
                <input id="cQ" type="range" min="-6" max="6" step="0.1" defaultValue="0" />
              </div>
              <div className="row-controls">
                <button id="resetQuad">Reset</button>
              </div>
            </div>
          </div>
          <p className="note">Try: change a, b, c. See vertex, discriminant and roots update. When discriminant is negative, roots are shown as complex pairs.</p>
        </section>
      </div>

      <div className="interactive-card">
        <strong className="text-blue-600">Interactive Story Steps (Cursor-style)</strong>
        <ol className="text-gray-600 text-sm space-y-2 mt-3">
          <li><b>Move your cursor</b> to the Argand Plane. Click and drag the blue point. <span className="text-blue-500">(See z, modulus, conjugate change)</span>.</li>
          <li><b>Hover</b> over the modulus number to highlight radius on the plane. <span className="text-blue-500">(Radius = distance from origin)</span>.</li>
          <li>Switch to Quadratic card. <b>Slide</b> the 'a' slider smaller to flatten the parabola. <span className="text-blue-500">(a controls the curvature)</span>.</li>
          <li>Increase |b| to shift the vertex horizontally. Increase c to move the parabola up/down. Observe vertex coordinates shown visually.</li>
          <li>Watch Discriminant status: if <em>D&gt;0</em> two real intersection points appear; if <em>D=0</em> touch; if <em>D&lt;0</em> no real intersections and complex roots are displayed.</li>
          <li>Try this combined idea: set quadratic with D&lt;0. Then in Argand plane locate the two complex roots as points. They are conjugates. This links both parts visually.</li>
        </ol>
        <p className="note mt-3">These are live. Cursor actions are the lesson. Use keyboard Tab to move focus to sliders if on mobile.</p>
      </div>

      <footer className="text-gray-500 text-xs text-center mt-2">Made to be interactive. Use cursor tips. Concepts map visually to memory.</footer>
    </div>
  );
}
