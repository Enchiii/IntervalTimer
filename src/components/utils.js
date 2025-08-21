import Cookies from "js-cookie";


export function saveWorkouts(workouts) {
Cookies.set("workouts", JSON.stringify(workouts), { expires: 30 });
}


export function loadWorkouts() {
try {
const raw = Cookies.get("workouts");
if (raw) return JSON.parse(raw);
} catch (e) {
console.error("Cookie parse error:", e);
}
return [];
}


export const fmt = (ms) => {
const total = Math.max(0, Math.ceil(ms / 1000));
const m = Math.floor(total / 60);
const s = total % 60;
return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};


// Matte accent from remaining pct. 0%→red(0deg), 100%→yellow(60deg)
export const matteHueFromPct = (pct) => Math.max(0, Math.min(60, (pct / 100) * 60));
export const matteAccent = (pct) => `hsl(${matteHueFromPct(pct)}, 70%, 55%)`;
export const matteBorder = (pct) => `hsl(${matteHueFromPct(pct)}, 60%, 40%)`;

