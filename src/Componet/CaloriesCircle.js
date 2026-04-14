import React from "react";
import { useAuth } from "../Componet/Auth";
import "../Styles/CaloriesCircle.css";

const CaloriesCircle = ({ caloriesAte }) => {
  const { user } = useAuth();

  const calorieGoal =
    user?.goal && user.goal.calorie_goal ? user.goal.calorie_goal : 2000;

  const percentage = Math.min((caloriesAte / calorieGoal) * 100, 100);
  const circumference = 2 * Math.PI * 70;

  return (
    <div className="calorie-card">
      <svg width="180" height="180" className="calories-circle">
        <circle
          cx="90"
          cy="90"
          r="70"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
        />
        <circle
          cx="90"
          cy="90"
          r="70"
          fill="none"
          stroke="#d4c08a"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * percentage) / 100}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
        />
        <text x="90" y="82" textAnchor="middle" className="calorie-number">
          {caloriesAte}
        </text>
        <text x="90" y="108" textAnchor="middle" className="calorie-label">
          / {calorieGoal}
        </text>
      </svg>
      <p className="calorie-caption">Daily Calories</p>
    </div>
  );
};

export default CaloriesCircle;
