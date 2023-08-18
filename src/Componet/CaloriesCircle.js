import React, { useEffect } from "react";
import { useAuth } from "../Componet/Auth";

const CaloriesCircle = ({ caloriesAte }) => {
  const { user } = useAuth();

  let calorieGoal = 2000;
  useEffect(() => {
    if (user.goal && user.goal.calorie_goal) {
      calorieGoal = user.goal.calorie_goal;
    }
  }, [user]);

  const percentage = (caloriesAte / calorieGoal) * 100;

  const circumference = 2 * Math.PI * 90;

  return (
    <div style={{ backgroundColor: "rgb(240, 240, 240)", borderRadius: 50 }}>
      <svg width="200" height="200" className="calories-circle">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="10"
        />
        {/* Filled circle */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="#007bff"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={
            caloriesAte >= calorieGoal
              ? 0 // Fill the circle completely if caloriesAte >= calorie goal
              : (circumference * (100 - percentage)) / 100
          }
        />
        <text
          x="100"
          y="100"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="18"
          color={caloriesAte > calorieGoal ? "red" : "black"}
        >
          {caloriesAte}/{calorieGoal} Calories
        </text>
      </svg>
    </div>
  );
};

export default CaloriesCircle;
