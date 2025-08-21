import React, { useState } from "react";
import WorkoutList from "./components/WorkoutList";
import WorkoutEditor from "./components/WorkoutEditor";
import WorkoutPlayer from "./components/WorkoutPlayer";


export default function App() {
const [screen, setScreen] = useState("list"); // list | editor | player
const [selectedWorkout, setSelectedWorkout] = useState(null);


return (
    <>
    {screen === "list" && (
        <WorkoutList
            onCreate={() => { setSelectedWorkout(null); setScreen("editor"); }}
            onPlay={(w) => { setSelectedWorkout(w); setScreen("player"); }}
            onEdit={(w) => { setSelectedWorkout(w); setScreen("editor"); }}
            onPau
        />)}
            {screen === "editor" && (<WorkoutEditor workout={selectedWorkout} onBack={() => setScreen("list")} />)}
            {screen === "player" && (<WorkoutPlayer workout={selectedWorkout} onBack={() => setScreen("list")} />)}
        </>
    );
}