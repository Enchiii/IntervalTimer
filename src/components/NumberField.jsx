import React from "react";

export default function NumberField({
  label,            // optional: etykieta nad polem
  value,            // number
  onChange,         // (next:number) => void
  min = 0,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  className = "",
  inputClassName = "",
  compact = false,  // mniejsze pole i przyciski
}) {
  const clamp = (n) => Math.max(min, Math.min(max, n));

  const set = (v) => {
    const n = Number(v);
    if (Number.isFinite(n)) onChange(clamp(n));
  };

  const bump = (delta) => {
    const base = Number.isFinite(value) ? value : 0;
    const next = clamp(base + delta);
    onChange(next);
  };

  const sizePad = compact ? "px-2 py-1.5" : "px-3 py-2";
  const btnPad  = compact ? "px-2 py-1.5" : "px-3 py-2";

  return (
    <label className={`block ${className}`}>
      {label && <div className="text-sm opacity-80 mb-1">{label}</div>}
      <div className="flex items-stretch rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
        <button
          type="button"
          aria-label="Decrement"
          className={`${btnPad} select-none bg-slate-800 hover:bg-slate-700 active:bg-slate-700/80 border-r border-slate-700`}
          onClick={() => bump(-step)}
        >
          {/* minus icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
            <rect x="5" y="11" width="14" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>

        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => set(e.target.value)}
          className={`${sizePad} w-full bg-transparent outline-none text-slate-100 text-base text-center ${inputClassName}`}
        />

        <button
          type="button"
          aria-label="Increment"
          className={`${btnPad} select-none bg-slate-800 hover:bg-slate-700 active:bg-slate-700/80 border-l border-slate-700`}
          onClick={() => bump(step)}
        >
          {/* plus icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
            <rect x="11" y="5" width="2" height="14" rx="1" fill="currentColor" />
            <rect x="5" y="11" width="14" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>
      </div>
    </label>
  );
}
