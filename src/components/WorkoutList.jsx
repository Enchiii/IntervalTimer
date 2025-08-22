import React, { useEffect, useState } from "react";
import { loadWorkouts, saveWorkouts } from "./utils";

export default function WorkoutList({ onCreate, onPlay, onEdit }) {
  const [workouts, setWorkouts] = useState([]);
  useEffect(() => setWorkouts(loadWorkouts()), []);

  const remove = (idx) => {
    const updated = workouts.filter((_, i) => i !== idx);
    setWorkouts(updated);
    saveWorkouts(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 px-4 py-6">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-wide">Workouts</h1>
        </div>

        <div className="space-y-3">
          {workouts.map((w, i) => (
            <div
              key={i}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center gap-3"
            >
              {/* Left: title + meta */}
              <div className="flex-1">
                <div className="font-semibold text-lg">{w.name}</div>
                <div className="text-xs opacity-70">
                  {w.cycles} sets · rest {w.rest}s · {w.steps.length} steps
                </div>
              </div>

              {/* Right (or bottom on mobile): actions */}
              <div className="w-full sm:w-auto grid grid-cols-3 gap-2 sm:grid-cols-none sm:flex sm:gap-2">
                <button
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-emerald-200/80 hover:bg-emerald-200 text-slate-900 font-medium"
                  onClick={() => onPlay(w)}
                >
                  ▶ Start
                </button>

                <button
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-orange-200/80 hover:bg-orange-200 text-slate-900 font-medium"
                  onClick={() => onEdit(w)}
                >
                  ✎ Edit
                </button>

                <button
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-rose-300/80 hover:bg-rose-300 text-slate-900 font-medium flex items-center justify-center"
                  onClick={() => remove(i)}
                  title="Delete workout"
                >
                  {/* Trash icon + label on mobile */}
                  <svg xmlns="http://www.w3.org/2000/svg"
                                       viewBox="0 0 24 24"
                                       fill="currentColor"
                                       className="w-4 h-4">
                                      <path d="M6 6h12v2H6zm2 3h8l-1 11H9z"/>
                                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          className="w-full mt-5 py-3 rounded-2xl bg-gradient-to-r from-zinc-200 to-slate-200 text-slate-900 font-semibold shadow-lg"
          onClick={onCreate}
        >
          + Add new workout
        </button>
      </div>
    </div>
  );
}
