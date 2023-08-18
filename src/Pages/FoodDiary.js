import React, { useState } from "react";
import FoodEntries from "../Componet/FoodEntries";
import FoodSearch from "../Componet/FoodSearch";

function FoodDiary() {
  const [foodEntries, setFoodEntries] = useState([]);

  return (
    <div className="food-diary">
      <h2>Food Diary</h2>
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
