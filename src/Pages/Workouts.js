import React, { useState, useEffect } from "react";
import { useAuth } from "../Componet/Auth";
import SearchExercises from "../Componet/SearchExercises";
import WorkoutJournal from "../Componet/WorkoutJournal";
import axios from "axios";
import "../Styles/SearchExercises.css";

function Workouts() {
  const auth = useAuth();
  const [workoutList, setWorkoutList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exerciseList, setExerciseList] = useState([]);

  useEffect(() => {
    const fetchWorkoutList = async () => {
      try {
        const response = await axios.get("/api/exercises/");
        setExerciseList(response.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutList();
  }, []);

  const handleAddToWorkout = (exercise) => {
    setWorkoutList((prevList) => {
      const alreadyAdded = prevList.some((item) => item.id === exercise.id);
      if (alreadyAdded) return prevList;
      return [...prevList, { ...exercise, sets: [] }];
    });
  };

  return (
    <div className="workoutPageContainer page-shell">
      <div className="workoutPageHeader">
        <h1 className="dashboard-title">Workout Journal</h1>
        <p className="dashboard-subtitle">
          Search exercises, build today’s workout, and review past sessions.
        </p>
      </div>

      <div className="exerciseContainerdiv">
        <SearchExercises
          loading={loading}
          exerciseList={exerciseList}
          handleAddToWorkout={handleAddToWorkout}
        />
        <WorkoutJournal
          exerciseList={exerciseList}
          workoutList={workoutList}
          setWorkoutList={setWorkoutList}
        />
      </div>
    </div>
  );
}

export default Workouts;
