import React from 'react';

import { useState } from 'react';

export function ComplexPlaneMini() {
  const width = 320;
  const height = 200;
  const pad = 20;
  const xMin = -6, xMax = 6;
  const yMin = -6, yMax = 6;
  const sx = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (width - 2 * pad);
  const sy = (y: number) => height - (pad + ((y - yMin) / (yMax - yMin)) * (height - 2 * pad));

  const [re, setRe] = useState(3);
  const [im, setIm] = useState(4);
  const mod = Math.hypot(re, im).toFixed(2);
  const arg = (Math.atan2(im, re) * 180 / Math.PI).toFixed(0);

  return (
    <div className="w-full space-y-3">
      <div className="flex gap-3 items-center text-xs">
        <label className="text-muted-foreground">Re</label>
        <input type="range" min={-5} max={5} step={1} value={re} onChange={e => setRe(parseInt(e.target.value))} className="w-40" />
        <span className="w-6 text-center">{re}</span>
        <label className="ml-3 text-muted-foreground">Im</label>
        <input type="range" min={-5} max={5} step={1} value={im} onChange={e => setIm(parseInt(e.target.value))} className="w-40" />
        <span className="w-6 text-center">{im}</span>
      </div>
      <div className="w-full flex justify-center">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="rounded-md bg-white/70 shadow-sm">
          {/* Axes */}
          <line x1={sx(xMin)} y1={sy(0)} x2={sx(xMax)} y2={sy(0)} stroke="#0f172a" strokeWidth={1} />
          <line x1={sx(0)} y1={sy(yMin)} x2={sx(0)} y2={sy(yMax)} stroke="#0f172a" strokeWidth={1} />
          {/* Ticks */}
          {[...Array(6)].map((_, i) => {
            const x = i + 1;
            return (
              <g key={`tx${x}`}>
                <line x1={sx(x)} y1={sy(0) - 3} x2={sx(x)} y2={sy(0) + 3} stroke="#0f172a" />
                <line x1={sx(-x)} y1={sy(0) - 3} x2={sx(-x)} y2={sy(0) + 3} stroke="#0f172a" />
              </g>
            );
          })}
          {[...Array(6)].map((_, i) => {
            const y = i + 1;
            return (
              <g key={`ty${y}`}>
                <line x1={sx(0) - 3} y1={sy(y)} x2={sx(0) + 3} y2={sy(y)} stroke="#0f172a" />
                <line x1={sx(0) - 3} y1={sy(-y)} x2={sx(0) + 3} y2={sy(-y)} stroke="#0f172a" />
              </g>
            );
          })}
          {/* Labels */}
          <text x={sx(xMax) - 10} y={sy(0) - 6} fontSize={10} fill="#0f172a">Re</text>
          <text x={sx(0) + 6} y={sy(yMax) + 12} fontSize={10} fill="#0f172a">Im</text>

          {/* Vector from origin */}
          <line x1={sx(0)} y1={sy(0)} x2={sx(re)} y2={sy(im)} stroke="#2563eb" strokeWidth={2} />

          {/* Point with pulse */}
          <circle cx={sx(re)} cy={sy(im)} r={5} fill="#2563eb" />
          <circle cx={sx(re)} cy={sy(im)} r={10} fill="#2563eb" className="animate-ping opacity-30" />

          {/* Modulus guideline */}
          <circle cx={sx(0)} cy={sy(0)} r={Math.hypot(sx(re) - sx(0), sy(im) - sy(0))} fill="none" stroke="#93c5fd" strokeDasharray="4 4" />

          {/* Label */}
          <text x={sx(re) + 8} y={sy(im) - 8} fontSize={11} fill="#0f172a">{re} + {im}i</text>
        </svg>
      </div>
      <div className="text-xs text-muted-foreground text-center">Length = |z| = {mod} , Angle ≈ {arg}°</div>
    </div>
  );
}
