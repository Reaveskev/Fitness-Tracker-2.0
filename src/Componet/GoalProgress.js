import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../Componet/Auth";
import { SemiCircleProgress } from "react-semicircle-progressbar";
import "../Styles/GoalProgress.css";

const goalPresets = [
  { label: "Lose Weight", value: "Lose Weight" },
  { label: "Gain Muscle", value: "Gain Muscle" },
  { label: "Maintain Weight", value: "Maintain Weight" },
];

function GoalProgress({ userweight }) {
  const { user, setUser } = useAuth();
  const [goal, setGoal] = useState(null);

  const [goalWeight, setGoalWeight] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [calorieGoals, setCalorieGoals] = useState(2000);

  const handleGoalSubmission = async (event) => {
    event.preventDefault();
    let user_id = user.user_id;

    try {
      const response = await axios.post("/api/goals", {
        user_id,
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
      // Handle error as needed
    }
    setShowForm(false);
  };

  useEffect(() => {
    if (user.goal) {
      setGoal(user.goal.goal);
      setCalorieGoals(user.goal.calorie_goal);
    } else {
      setGoal(0);
      setCalorieGoals(0);
      setGoalWeight(0);
      setShowForm(true);
    }
  }, []);

  const handleChange = (event) => {
    const { value } = event.target;
    setGoal(value);
  };

  const handleGoalChange = () => {
    setShowForm(true);
    setGoal(null);
  };

  const analyzeTrend = () => {
    if (userweight[0]) {
      if (userweight.length >= 3) {
        const lastThreeWeights = userweight
          .slice(-3) // Get the last three elements
          .map((measurement) => parseInt(measurement.weight)); // Extract weights as integers

        const isIncreasingTrend =
          lastThreeWeights[0] < lastThreeWeights[1] &&
          lastThreeWeights[1] < lastThreeWeights[2];
        const isDecreasingTrend =
          lastThreeWeights[0] > lastThreeWeights[1] &&
          lastThreeWeights[1] > lastThreeWeights[2];

        if (!goal) {
          return "Please set a fitness goal";
        }

        if (goal === "Lose Weight") {
          if (isIncreasingTrend) {
            return "Your weight is increasing, but your goal is to lose weight. Try lowering caloric intake or increasing exercise time.";
          }
        } else if (goal === "Gain Muscle") {
          if (isDecreasingTrend) {
            return "Your weight is decreasing, but your goal is to gain muscle. This could be due to lost of fat, no need to panic!";
          }
        }

        if (isIncreasingTrend) {
          return "Great job, you are on the right track. Your weight is increasing.";
        } else if (isDecreasingTrend) {
          return "Great job, you are on the right track. Your weight is decreasing.";
        } else {
          return "Your weight trend fluctuates and is inconsistent.";
        }
      } else {
        return "Not enough weight measurements for trend analysis.";
      }
    }
  };

  const initialWeight = userweight[userweight.length - 2]?.weight || 0;

  let progressPercentage;
  if (userweight[0] && userweight.length > 3) {
    if (initialWeight > goalWeight) {
      // For weight loss goal
      progressPercentage =
        ((initialWeight - userweight[userweight.length - 1].weight) /
          (initialWeight - goalWeight)) *
        100;
    } else {
      // For weight gain goal
      progressPercentage =
        ((userweight[userweight.length - 1].weight - initialWeight) /
          (goalWeight - initialWeight)) *
        100;
    }
  }

  return (
    <div className="goal-progress">
      {showForm ? (
        <>
          <p>Select your fitness goal:</p>
          <form onSubmit={handleGoalSubmission}>
            {goalPresets.map((preset) => (
              <label key={preset.value}>
                <input
                  type="radio"
                  value={preset.value}
                  checked={goal === preset.value}
                  onChange={handleChange}
                />
                {preset.label}
              </label>
            ))}
            <label style={{ alignSelf: "center" }}>Calorie Goals:</label>
            <input
              type="number"
              value={calorieGoals}
              onChange={(e) => setCalorieGoals(e.target.value)}
              required
            />
            <label style={{ alignSelf: "center" }}>Goal Weight:</label>
            <input
              type="number"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              required
            />
            <button type="submit">Set Goal</button>
          </form>
        </>
      ) : (
        <div className="goal">
          {goal ? <p>Goal: {goal}</p> : null}
          <p style={{ textAlign: "center" }}>
            Trend Analysis: {analyzeTrend()}
          </p>
          <p onClick={handleGoalChange} className="change-goal">
            Change Goal
          </p>
          <p> Current Weight:{user.weight}</p>
          {user.goal && user.goal.goal_weight ? (
            <>
              {userweight[0] ? (
                <div className="userweight-div">
                  {userweight.lenght > 3 ? (
                    <>
                      <SemiCircleProgress
                        percentage={progressPercentage}
                        size={{
                          width: 150,
                          height: 150,
                        }}
                        strokeWidth={6}
                        strokeColor="#007bff"
                        hasBackground={true}
                        bgStrokeColor="#E0E0E0"
                      />

                      {/* Display weight labels */}
                      <div className="user-label-div">
                        {userweight[userweight.length - 2] ? (
                          <span>
                            {userweight[userweight.length - 2].weight} lbs
                          </span>
                        ) : (
                          <span>{userweight[0].weight} lbs</span>
                        )}

                        <span>{goalWeight} lbs</span>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : (
            <p>Select a goal weight.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default GoalProgress;
