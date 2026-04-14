import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../Componet/Auth";
import { SemiCircleProgress } from "react-semicircle-progressbar";
import "../Styles/GoalProgress.css";

const goalPresets = [
  { label: "Lose Weight", value: "Lose Weight", emoji: "🔥" },
  { label: "Gain Muscle", value: "Gain Muscle", emoji: "💪" },
  { label: "Maintain Weight", value: "Maintain Weight", emoji: "⚖️" },
];

function GoalProgress({ userweight }) {
  const { user, setUser } = useAuth();
  const [goal, setGoal] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [calorieGoals, setCalorieGoals] = useState(2000);

  useEffect(() => {
    if (user?.goal) {
      setGoal(user.goal.goal || "");
      setCalorieGoals(user.goal.calorie_goal || 2000);
      setGoalWeight(user.goal.goal_weight || "");
      setShowForm(false);
    } else {
      setGoal("");
      setCalorieGoals(2000);
      setGoalWeight("");
      setShowForm(true);
    }
  }, [user]);

  const handleGoalSubmission = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("/api/goals", {
        user_id: user.user_id,
        goal,
        calorieGoals,
        goalWeight,
      });

      const updatedUser = {
        ...user,
        goal: {
          goal: response.data.goal,
          goal_weight: response.data.goal_weight,
          calorie_goal: response.data.calorie_goals,
          user_id: user.user_id,
        },
      };

      setUser(updatedUser);
      setGoal(response.data.goal);
      setCalorieGoals(response.data.calorie_goals);
      setGoalWeight(response.data.goal_weight);
      setShowForm(false);
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  const handleGoalChange = () => {
    setShowForm(true);
  };

  const analyzeTrend = () => {
    if (!goal) return "Please set a fitness goal.";

    if (!userweight?.length) {
      return "No weight measurements yet. Add a few to start tracking progress.";
    }

    if (userweight.length < 3) {
      return "Not enough weight measurements for trend analysis.";
    }

    const lastThreeWeights = userweight
      .slice(-3)
      .map((measurement) => parseInt(measurement.weight, 10));

    const isIncreasingTrend =
      lastThreeWeights[0] < lastThreeWeights[1] &&
      lastThreeWeights[1] < lastThreeWeights[2];

    const isDecreasingTrend =
      lastThreeWeights[0] > lastThreeWeights[1] &&
      lastThreeWeights[1] > lastThreeWeights[2];

    if (goal === "Lose Weight") {
      if (isIncreasingTrend) {
        return "Your weight is increasing while your goal is weight loss. Consider lowering calories or increasing activity.";
      }
      if (isDecreasingTrend) {
        return "You are trending in the right direction for weight loss.";
      }
    }

    if (goal === "Gain Muscle") {
      if (isDecreasingTrend) {
        return "Your weight is decreasing while your goal is muscle gain. You may need more calories or recovery.";
      }
      if (isIncreasingTrend) {
        return "You are trending in the right direction for muscle gain.";
      }
    }

    if (goal === "Maintain Weight") {
      return "Your recent trend is being tracked. Aim for consistency around your target weight.";
    }

    return "Your recent weight trend is fluctuating and may need more time to evaluate.";
  };

  const getGoalDisplay = () => {
    const match = goalPresets.find((preset) => preset.value === goal);
    return match ? `${match.emoji} ${match.label}` : "Set Your Goal";
  };

  const getProgressColor = () => {
    if (goal === "Lose Weight") return "#22c55e";
    if (goal === "Gain Muscle") return "#3b82f6";
    return "#d4c08a";
  };

  const getProgressPercentage = () => {
    if (!userweight?.length || userweight.length < 2 || !goalWeight) return 0;

    const currentWeight = Number(
      userweight[userweight.length - 1]?.weight || 0,
    );
    const startingWeight = Number(userweight[0]?.weight || 0);
    const targetWeight = Number(goalWeight);

    if (!startingWeight || !targetWeight || startingWeight === targetWeight) {
      return 0;
    }

    let percentage = 0;

    if (startingWeight > targetWeight) {
      percentage =
        ((startingWeight - currentWeight) / (startingWeight - targetWeight)) *
        100;
    } else {
      percentage =
        ((currentWeight - startingWeight) / (targetWeight - startingWeight)) *
        100;
    }

    if (!Number.isFinite(percentage)) return 0;
    return Math.max(0, Math.min(100, percentage));
  };

  const progressPercentage = getProgressPercentage();
  const currentWeight = user?.weight || 0;

  return (
    <div className="goal-progress">
      {showForm ? (
        <div className="goal-card">
          <div className="goal-header">
            <h3>Set Your Goal</h3>
          </div>

          <form className="goal-form" onSubmit={handleGoalSubmission}>
            <div className="goal-options">
              {goalPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`goal-option ${goal === preset.value ? "active" : ""}`}
                  onClick={() => setGoal(preset.value)}
                >
                  <span className="goal-option-emoji">{preset.emoji}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            <div className="goal-field">
              <label htmlFor="calorieGoals">Daily Calorie Goal</label>
              <input
                id="calorieGoals"
                type="number"
                value={calorieGoals}
                onChange={(e) => setCalorieGoals(e.target.value)}
                required
              />
            </div>

            <div className="goal-field">
              <label htmlFor="goalWeight">Target Weight</label>
              <input
                id="goalWeight"
                type="number"
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
                required
              />
            </div>

            <button className="goal-submit" type="submit">
              Save Goal
            </button>
          </form>
        </div>
      ) : (
        <div className="goal-card">
          <div className="goal-header">
            <h3>{getGoalDisplay()}</h3>
            <button
              type="button"
              className="goal-edit-button"
              onClick={handleGoalChange}
            >
              Edit
            </button>
          </div>

          <div className="goal-body">
            <p className="trend-text">{analyzeTrend()}</p>

            <div className="weight-info">
              <div className="weight-stat">
                <span className="weight-label">Current</span>
                <span className="weight-value">{currentWeight} lbs</span>
              </div>

              <div className="weight-stat">
                <span className="weight-label">Target</span>
                <span className="weight-value">{goalWeight || "--"} lbs</span>
              </div>
            </div>

            <div className="progress-section large">
              <SemiCircleProgress
                percentage={progressPercentage}
                size={{
                  width: 220,
                  height: 220,
                }}
                strokeWidth={8}
                strokeColor={getProgressColor()}
                hasBackground={true}
                bgStrokeColor="rgba(255,255,255,0.15)"
                showPercentValue={false}
              />
              <div className="progress-center">
                <span className="progress-big">
                  {Math.round(progressPercentage)}%
                </span>
                <span className="progress-label">Goal Progress</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoalProgress;
