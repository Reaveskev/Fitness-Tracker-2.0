import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { useAuth } from "../Componet/Auth";
import "../Styles/FoodGraph.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FoodGraph = ({ setCaloriesAte }) => {
  const [actualIntakeDataset, setActualIntakeDataset] = useState([]);
  const { user } = useAuth();

  let totalCalories;

  if (user.goal && user.goal.calorie_goal !== undefined) {
    totalCalories = user.goal.calorie_goal;
  } else {
    totalCalories = 2000;
  }

  function getFormattedDateForSQL() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const formattedDate = getFormattedDateForSQL();

  function calculateBalancedDietMacros(totalCalories) {
    const proteinPercentage = 0.15;
    const fatPercentage = 0.3;
    const carbPercentage = 0.55;

    const proteinCalories = totalCalories * proteinPercentage;
    const fatCalories = totalCalories * fatPercentage;
    const carbCalories = totalCalories * carbPercentage;

    const proteinGrams = proteinCalories / 4; // 1 gram of protein = 4 calories
    const fatGrams = fatCalories / 9; // 1 gram of fat = 9 calories
    const carbGrams = carbCalories / 4; // 1 gram of carbohydrate = 4 calories

    return {
      proteinGrams,
      fatGrams,
      carbGrams,
    };
  }

  function calculateMuscleGainMacros(totalCalories) {
    const proteinPercentage = 0.3;
    const fatPercentage = 0.25;
    const carbPercentage = 0.45;

    const proteinCalories = totalCalories * proteinPercentage;
    const fatCalories = totalCalories * fatPercentage;
    const carbCalories = totalCalories * carbPercentage;

    const proteinGrams = proteinCalories / 4; // 1 gram of protein = 4 calories
    const fatGrams = fatCalories / 9; // 1 gram of fat = 9 calories
    const carbGrams = carbCalories / 4; // 1 gram of carbohydrate = 4 calories

    return {
      proteinGrams,
      fatGrams,
      carbGrams,
    };
  }

  function calculateWeightLossMacros(totalCalories) {
    const proteinPercentage = 0.35;
    const fatPercentage = 0.25;
    const carbPercentage = 0.4;

    const proteinCalories = totalCalories * proteinPercentage;
    const fatCalories = totalCalories * fatPercentage;
    const carbCalories = totalCalories * carbPercentage;

    const proteinGrams = proteinCalories / 4; // 1 gram of protein = 4 calories
    const fatGrams = fatCalories / 9; // 1 gram of fat = 9 calories
    const carbGrams = carbCalories / 4; // 1 gram of carbohydrate = 4 calories

    return {
      proteinGrams,
      fatGrams,
      carbGrams,
    };
  }

  let proteinGoal, carbohydrateGoal, fatGoal;
  if (user.goal) {
    if (user.goal.goal === "Lose Weight") {
      const weightLossMacros = calculateWeightLossMacros(totalCalories);
      proteinGoal = weightLossMacros.proteinGrams.toFixed(0);
      fatGoal = weightLossMacros.fatGrams.toFixed(0);
      carbohydrateGoal = weightLossMacros.carbGrams.toFixed(0);
    } else if (user.goal.goal === "Gain Muscle") {
      const muscleGainMacros = calculateMuscleGainMacros(totalCalories);
      proteinGoal = muscleGainMacros.proteinGrams.toFixed(0);
      fatGoal = muscleGainMacros.fatGrams.toFixed(0);
      carbohydrateGoal = muscleGainMacros.carbGrams.toFixed(0);
    } else {
      const balancedDietMacros = calculateBalancedDietMacros(totalCalories);
      proteinGoal = balancedDietMacros.proteinGrams.toFixed(0);
      fatGoal = balancedDietMacros.fatGrams.toFixed(0);
      carbohydrateGoal = balancedDietMacros.carbGrams.toFixed(0);
    }
  }
  const goalDataset = [
    parseInt(proteinGoal),
    parseInt(carbohydrateGoal),
    parseInt(fatGoal),
  ];

  useEffect(() => {
    const fetchFoodsForDate = () => {
      fetch(`/api/food_diary/${formattedDate}`)
        .then((response) => response.json())
        .then((data) => {
          let protein = 0;
          let carbohydrate = 0;
          let fat = 0;
          let temp_calories = 0;
          data.forEach((entry) => {
            protein += parseInt(entry.protein);
            carbohydrate += parseInt(entry.carbohydrate);
            fat += parseInt(entry.fat);
            temp_calories += parseInt(entry.calories);
          });
          setCaloriesAte(temp_calories);
          setActualIntakeDataset([protein, carbohydrate, fat]);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };
    if (formattedDate) {
      fetchFoodsForDate();
    }
  }, [formattedDate]);

  const data = {
    labels: ["Protein", "Carbohydrate", "Fat"],
    datasets: [
      {
        label: "Actual Intake",
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(255, 99, 132, 0.8)",
        hoverBorderColor: "rgba(255, 99, 132, 1)",
        data: actualIntakeDataset,
      },
      {
        label: "Goal",
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(75, 192, 192, 0.8)",
        hoverBorderColor: "rgba(75, 192, 192, 1)",
        data: goalDataset,
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: "Macro Tracker",
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true, // Set to true to start the scale at 0
        max: (() => {
          const goalMax = Math.max(...goalDataset);
          const actualIntakeMax = Math.max(...actualIntakeDataset);
          return Math.max(goalMax, actualIntakeMax) + 25;
        })(),
      },
    },
  };

  return (
    <div className="graph">
      {actualIntakeDataset.length > 0 ? (
        <Bar options={options} data={data} />
      ) : (
        <Bar
          options={options}
          data={{
            labels: ["Protein", "Carbohydrate", "Fat"],
            datasets: [
              {
                label: "Actual Intake",
                backgroundColor: "rgba(255, 99, 132, 0.6)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
                hoverBackgroundColor: "rgba(255, 99, 132, 0.8)",
                hoverBorderColor: "rgba(255, 99, 132, 1)",
                data: [0, 0, 0], // Empty data to show an empty graph
              },
              {
                label: "Goal",
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
                hoverBackgroundColor: "rgba(75, 192, 192, 0.8)",
                hoverBorderColor: "rgba(75, 192, 192, 1)",
                data: goalDataset, // Use the original goal dataset
              },
            ],
          }}
        />
      )}
    </div>
  );
};

export default FoodGraph;
