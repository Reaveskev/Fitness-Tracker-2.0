import React, { useState, useEffect } from "react";
import { useAuth } from "../Componet/Auth";
import axios from "axios";
import "../Styles/Last30.css";

const Last30 = () => {
  const { user } = useAuth();
  const [recorded, setRecorded] = useState("");

  let user_id;
  if (user) {
    user_id = user.user_id;
  } else {
    user_id = 0;
  }

  useEffect(() => {
    const fetchLastWorkouts = () => {
      axios
        .get(`/api/count_past_workouts/`, {
          params: {
            user_id,
          },
        })
        .then((response) => {
          setRecorded(response.data.workoutCount);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };
    if (user_id) {
      fetchLastWorkouts();
    }
  }, []);

  return (
    <div className="last30-container">
      <div className="last30-title">Workouts past 30 Days</div>
      {recorded ? <span className="last30-count">{recorded}</span> : null}
    </div>
  );
};

export default Last30;
