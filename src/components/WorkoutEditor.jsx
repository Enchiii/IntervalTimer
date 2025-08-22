import React, { useState } from "react";
import { loadWorkouts, saveWorkouts } from "./utils";
import NumberField from "./NumberField";

export default function WorkoutEditor({ workout, onBack }) {
  // initial state (edit existing or new)
  const [name, setName] = useState(workout?.name || "New Workout");
  const [cycles, setCycles] = useState(
    Number.isFinite(workout?.cycles) ? Math.max(1, workout.cycles) : 3
  );
  const [rest, setRest] = useState(
    Number.isFinite(workout?.rest) ? Math.max(0, workout.rest) : 20
  );
  const [steps, setSteps] = useState(
    Array.isArray(workout?.steps) && workout.steps.length
      ? workout.steps.map((s) => ({
          label: s?.label || "Work",
          sec: Math.max(1, Number(s?.sec ?? 30)),
        }))
      : [
          { label: "Work", sec: 30 },
        ]
  );

  // step helpers
  const addStep = () =>
    setSteps((prev) => [...prev, { label: "Step", sec: 10 }]);

  const removeStep = (i) =>
    setSteps((prev) => prev.filter((_, idx) => idx !== i));

  const updateStep = (i, patch) =>
    setSteps((prev) =>
      prev.map((s, idx) =>
        idx === i ? { ...s, ...patch, sec: Math.max(1, Number((patch.sec ?? s.sec))) } : s
      )
    );

  const moveStep = (i, dir) =>
    setSteps((prev) => {
      const arr = [...prev];
      const ni = i + dir;
      if (ni < 0 || ni >= arr.length) return prev;
      [arr[i], arr[ni]] = [arr[ni], arr[i]];
      return arr;
    });

  // save workout to cookies
  const save = () => {
    const normalized = {
      name: name?.trim() || "Workout",
      cycles: Math.max(1, Number(cycles || 1)),
      rest: Math.max(0, Number(rest || 0)),
      steps: steps.map((s) => ({
        label: (s.label || "Step").trim(),
        sec: Math.max(1, Number(s.sec || 1)),
      })),
    };

    const all = loadWorkouts();
    let updated;

    // replace by reference (same name) if editing; otherwise append
    if (workout) {
      updated = all.map((w) =>
        w.name === workout.name ? normalized : w
      );
      // if original name not found (renamed), attempt replace by deep compare of steps/params
      if (!updated.some((w) => w.name === normalized.name)) {
        updated = all
          .filter((w) => w.name !== workout.name)
          .concat([normalized]);
      }
    } else {
      // avoid duplicate names (append number)
      let base = normalized.name;
      let nameTry = base;
      let n = 2;
      while (all.some((w) => w.name === nameTry)) {
        nameTry = `${base} (${n++})`;
      }
      normalized.name = nameTry;
      updated = [...all, normalized];
    }

    saveWorkouts(updated);
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 px-4 py-6">
      <div className="max-w-xl mx-auto">
        {/* top bar */}
        <div className="flex items-center justify-between mb-5">
          <button
            className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700"
            onClick={onBack}
          >
            ← Back
          </button>
          <div className="text-center flex-1">
            <div className="text-xs uppercase tracking-wider opacity-60">
              Editor
            </div>
            <div className="text-lg font-semibold -mt-1">
              {workout ? "Edit workout" : "New workout"}
            </div>
          </div>
          <div className="w-[84px]" /> {/* spacer for symmetry */}
        </div>

        {/* card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl p-5 sm:p-6">
              {/* name */}
              <label className="block mb-4">
                  <div className="text-sm opacity-80 mb-1">Workout name</div>
                  <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-800 rounded-xl px-3 py-2 outline-none border border-slate-700"
                      placeholder="e.g. Push Day A"
                  />
              </label>

              {/* cycles/rest */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <NumberField
                      label="Sets"
                      value={cycles}
                      onChange={(n) => setCycles(Math.max(1, n))}
                      min={1}
                      step={1}
                  />
                  <NumberField
                      label="Rest between sets (s)"
                      value={rest}
                      onChange={(n) => setRest(Math.max(0, n))}
                      min={0}
                      step={5}
                  />
              </div>

              {/* steps */}
              <div className="mb-3 flex items-center justify-between">
                  <div className="font-semibold">Steps</div>
                  <button
                      className="px-3 py-2 rounded-xl bg-orange-200/80 text-slate-900 font-medium"
                      onClick={addStep}
                  >
                      + Step
                  </button>
              </div>

              <div className="space-y-2">
                  {steps.map((s, i) => (
                      <div
                          key={i}
                          className="bg-slate-800 rounded-2xl p-3 border border-slate-700"
                      >
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <input
                                  value={s.label}
                                  onChange={(e) => updateStep(i, {label: e.target.value})}
                                  className="w-full sm:flex-1 bg-slate-700 rounded-xl px-3 py-2 outline-none"
                                  placeholder="Label (e.g. Work / Lower / Iso)"
                              />

                              <div className="w-full flex items-center gap-2 sm:w-auto sm:ml-auto">
                                  {/* czas */}
                                  <div className="flex-1 sm:flex-none sm:w-28">
                                      <NumberField
                                          value={s.sec}
                                          onChange={(n) => updateStep(i, {sec: n})}
                                          min={1}
                                          step={1}
                                          compact
                                      />
                                  </div>

                                  <div className="flex gap-1 ml-auto">
                                      <button
                                          className="p-2 rounded-xl bg-slate-600 hover:bg-slate-500"
                                          onClick={() => moveStep(i, -1)}
                                          title="Move up"
                                      >
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                               fill="currentColor" className="w-4 h-4">
                                              <path d="M12 4l-7 8h14z"/>
                                          </svg>
                                      </button>
                                      <button
                                          className="p-2 rounded-xl bg-slate-600 hover:bg-slate-500"
                                          onClick={() => moveStep(i, 1)}
                                          title="Move down"
                                      >
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                               fill="currentColor" className="w-4 h-4">
                                              <path d="M12 20l7-8H5z"/>
                                          </svg>
                                      </button>
                                      <button
                                          className="p-2 rounded-xl bg-rose-300/80 text-slate-900"
                                          onClick={() => removeStep(i)}
                                          title="Delete"
                                      >
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                               fill="currentColor" className="w-4 h-4">
                                              <path d="M6 6h12v2H6zm2 3h8l-1 11H9z"/>
                                          </svg>
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>


              {/* footer actions */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                      className="py-3 rounded-xl bg-gradient-to-r from-zinc-200 to-slate-200 text-slate-900 font-semibold"
                      onClick={save}
                  >
                      Save
                  </button>
                  <button
                      className="py-3 rounded-xl bg-slate-700 text-white font-semibold"
                      onClick={onBack}
                  >
                      Cancel
                  </button>
              </div>
          </div>

      </div>
    </div>
  );
}
