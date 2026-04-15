import React, { useState } from "react";
import FoodEntries from "../Componet/FoodEntries";
import FoodSearch from "../Componet/FoodSearch";
import "../Styles/FoodSearch.css";

function FoodDiary() {
  const [foodEntries, setFoodEntries] = useState([]);

  return (
    <div className="foodDiaryPage page-shell">
      <div className="foodDiaryHeader">
        <h1 className="dashboard-title">Food Diary</h1>
        <p className="dashboard-subtitle">
          Search foods, add meals, and track your daily nutrition.
        </p>
      </div>

      <div className="food-diary-container">
        <FoodSearch foodEntries={foodEntries} setFoodEntries={setFoodEntries} />
        <FoodEntries
          foodEntries={foodEntries}
          setFoodEntries={setFoodEntries}
        />
      </div>
    </div>
  );
}

export default FoodDiary;
