import React, { useState, useEffect } from "react";
import { useAuth } from "../Componet/Auth";
import GoalProgress from "../Componet/GoalProgress";
import FoodGraph from "../Componet/FoodGraph";
import Last30 from "../Componet/Last30";
import CaloriesCircle from "../Componet/CaloriesCircle";
import WeightGraph from "../Componet/WeightGraph";
import User from "./User";
import Motivational from "./Motivational";

function Home() {
  const { user } = useAuth();
  const [caloriesAte, setCaloriesAte] = useState(0);
  const [userweight, SetUserWeight] = useState({});

  useEffect(() => {
    fetch(`/api/body_measurement/${user.user_id}`)
      .then((response) => response.json())
      .then((data) => {
        SetUserWeight(data);
      });
  }, [user]);

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1 className="dashboard-title">
          {user ? `Welcome, ${user.username}!` : "Welcome, User!"}
        </h1>
      </div>

      <div className="dashboard-row">
        <div className="widget user-widget">
          <User />
        </div>

        <div
          style={{ flexDirection: "column" }}
          className="widget last30-widget"
        >
          <Last30 />
          <CaloriesCircle caloriesAte={caloriesAte} />
        </div>

        <div className="widget motivational-widget">
          <Motivational />
        </div>
      </div>

      <div className="dashboard-row">
        <div className="widget goal-widget">
          <GoalProgress userweight={userweight} />
        </div>

        <div className="widget food-widget">
          <FoodGraph setCaloriesAte={setCaloriesAte} />
        </div>

        <div className="widget weight-widget">
          <WeightGraph userweight={userweight} />
        </div>
      </div>
    </div>
  );
}

export default Home;
