import React, { useEffect, useMemo, useState, useRef } from "react";
import { fmt, matteAccent, matteBorder } from "./utils";

// --- START: Update the audio object ---
const shortBeep = new Audio('/short.mp3');
const longBeep = new Audio('/long.mp3');
// --- END ---

export default function WorkoutPlayer({ workout, onBack }) {
  // ------- SAFE INPUTS -------
  const rawSteps = Array.isArray(workout?.steps) ? workout.steps : [];
  const steps = useMemo(
    () =>
      rawSteps.map((s) => ({
        label: s?.label || "Step",
        sec: Math.max(1, Number(s?.sec ?? 1)), // force number & >=1
      })),
    [rawSteps]
  );
  const cycles = Number.isFinite(workout?.cycles) ? Math.max(1, workout.cycles) : 1;
  const restSec = Number.isFinite(workout?.rest) ? Math.max(0, workout.rest) : 0;
  const hasSteps = steps.length > 0;

  // ------- STATE -------
  const [phase, setPhase] = useState("work"); // "work" | "rest"
  const [running, setRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);

  // ZMIENIONY: Używamy ref, aby uniknąć zbędnego renderowania
  const lastPlayedSecondRef = useRef(null);

  // Keep stepIdx in range if steps change
  useEffect(() => {
    if (stepIdx >= steps.length) setStepIdx(0);
  }, [steps.length, stepIdx]);

  const step = steps[stepIdx] ?? { label: "Step", sec: 1 };
  const totalPhaseMs =
    phase === "work" ? step.sec * 1000 : restSec * 1000;

  const [remainingMs, setRemainingMs] = useState(totalPhaseMs);

  useEffect(() => {
  if (!running) {
    setRemainingMs((ms) => Math.min(ms, totalPhaseMs));
  }
}, [totalPhaseMs, running]);

  const pctRemain = totalPhaseMs > 0 ? Math.max(0, Math.min(100, (remainingMs / totalPhaseMs) * 100)) : 0;
  const accent = useMemo(() => matteAccent(pctRemain), [pctRemain]);
  const border = useMemo(() => matteBorder(pctRemain), [pctRemain]);

  const displayLabel =
    phase === "rest"
      ? remainingMs <= 4000
        ? "Prepare"
        : "Rest"
      : step.label || "Work";

  // ------- TIMER LOOP (return next duration immediately on transitions) -------
  useEffect(() => {
    if (!running || !hasSteps) return;
    let last = performance.now();
    let raf;

    const tick = (t) => {
      const dt = t - last;
      last = t;

      setRemainingMs((ms) => {
        const next = ms - dt;
        const nextSec = Math.ceil(next / 1000);

        // --- START: POPRAWIONA LOGIKA DŹWIĘKOWA ---
        // Sprawdź, czy timer jest w ostatniej sekundzie i czy dźwięk dla tej sekundy jeszcze nie zagrał
        if (nextSec !== lastPlayedSecondRef.current) {
          if (nextSec === 3 || nextSec === 2) {
            shortBeep.currentTime = 0;
            shortBeep.play().catch(e => console.error("Error playing sound:", e));
            lastPlayedSecondRef.current = nextSec; // Zapisz, że dźwięk dla tej sekundy już zagrał
          } else if (nextSec === 1) {
            longBeep.currentTime = 0;
            longBeep.play().catch(e => console.error("Error playing sound:", e));
            lastPlayedSecondRef.current = nextSec;
          }
        }
        // --- KONIEC: POPRAWIONEJ LOGIKI DŹWIĘKOWEJ ---

        if (next > 0) return next;

        // Transition
        if (phase === "work") {
          // Next step within this set?
          if (stepIdx < steps.length - 1) {
            const newIdx = stepIdx + 1;
            const newDur = steps[newIdx].sec * 1000;
            setStepIdx(newIdx);
            lastPlayedSecondRef.current = null; // Resetuj po zmianie fazy
            // phase stays "work"
            return newDur; // <<< return next step duration immediately
          }

          // Last step in set
          if (currentSet < cycles && restSec > 0) {
            setPhase("rest");
            lastPlayedSecondRef.current = null;
            return restSec * 1000; // <<< go to rest immediately
          }

          // No rest or last set → next set or finish
          if (currentSet < cycles) {
            const nextSet = currentSet + 1;
            setCurrentSet(nextSet);
            setStepIdx(0);
            setPhase("work");
            lastPlayedSecondRef.current = null;
            return steps[0].sec * 1000; // <<< start next set immediately
          }

          // Finished all
          setRunning(false);
          setDone(true);
          lastPlayedSecondRef.current = null;
          return 0;
        } else {
          // REST finished → next set start or finish
          if (currentSet < cycles) {
            const nextSet = currentSet + 1;
            setCurrentSet(nextSet);
            setStepIdx(0);
            setPhase("work");
            lastPlayedSecondRef.current = null;
            return steps[0].sec * 1000; // <<< start set 0 immediately
          }
          setRunning(false);
          lastPlayedSecondRef.current = null;
          return 0;
        }
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, phase, stepIdx, currentSet, steps, cycles, restSec, hasSteps]);

  // controls
  const toggle = () => setRunning((r) => !r);
  const reset = () => {
    setRunning(false);
    setPhase("work");
    setCurrentSet(1);
    setStepIdx(0);
    setDone(false);
    setRemainingMs(steps[0]?.sec * 1000 || 1000);
    lastPlayedSecondRef.current = null; // Zresetuj referencję przy resecie
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 px-5 py-7">
      <div className="max-w-xl mx-auto">
        {/* Top controls outside card */}
        <div className="flex items-center justify-between mb-6">
          <button
            className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700"
            onClick={onBack}
          >
            ← Back
          </button>
          <div className="text-center flex-1">
            <div className="text-xs uppercase tracking-wider opacity-60">Workout</div>
            <div className="text-xl font-semibold -mt-0.5">
              {workout?.name ?? "Unnamed"}
            </div>
          </div>
          <button
            className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700"
            onClick={reset}
          >
            Reset
          </button>
        </div>

        {/* Card (auto height, big gaps) */}
        <div
          className="bg-slate-900/80 rounded-3xl shadow-xl border mx-auto w-full p-8 sm:p-10 cursor-pointer select-none flex flex-col space-y-8"
          style={{ borderColor: border }}
          onClick={toggle}
          title="Tap to start/pause"
        >
          <div className="text-sm opacity-70 flex items-center justify-between">
            <span>Set {currentSet}/{cycles}</span>
            <span>Rest: {restSec}s</span>
          </div>

          <div
            className="text-5xl sm:text-6xl font-extrabold text-center tracking-tight"
            style={{ color: accent }}
          >
            {hasSteps ? displayLabel : "Add steps in editor"}
          </div>

          <div
            className="text-center text-8xl sm:text-9xl font-mono font-black leading-none"
            style={{ color: accent}}
          >
            {done ? "Done" : fmt(remainingMs)}
          </div>

          <div className="text-center text-sm opacity-60">
            Tap the card to {running ? "pause" : "start"}
          </div>
        </div>

        {!hasSteps && (
          <p className="text-center text-xs opacity-60 mt-4">
            No steps defined for this workout. Go back and add at least one step.
          </p>
        )}
      </div>
    </div>
  );
}