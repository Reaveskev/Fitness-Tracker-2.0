import React, { useState, useEffect } from "react";
import { useAuth } from "../Componet/Auth";
import SearchExercises from "../Componet/SearchExercises";
import WorkoutJournal from "../Componet/WorkoutJournal";
import axios from "axios";
import "../Styles/SearchExercises.css";

function Workouts() {
  const auth = useAuth();
  const [workoutList, setWorkoutList] = useState([]);
  const [loading, setloading] = useState(true);
  const [exerciseList, setExerciseList] = useState([]);

  useEffect(() => {
    const fetchWorkoutList = async () => {
      try {
        const response = await axios.get("/api/exercises/");

        if (response) {
          setloading(false);
          setExerciseList(response.data);
        } else {
          console.log("Failed to fetch data from the API.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchWorkoutList();
  }, []);

  const handleAddToWorkout = (exercise) => {
    // Add the selected exercise to the workoutList
    setWorkoutList((prevList) => [...prevList, exercise]);
  };

  return (
    <div className="workoutPageContainer">
      <h1>Journal</h1>
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
