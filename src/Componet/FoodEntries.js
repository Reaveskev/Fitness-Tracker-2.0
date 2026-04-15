import React, { useState, useEffect } from "react";
import { Chart, ArcElement } from "chart.js";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import { useAuth } from "../Componet/Auth";
import * as RiIcons from "react-icons/ri";
import "../Styles/FoodEntries.css";

Chart.register(ArcElement);

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

const FoodEntries = ({ foodEntries, setFoodEntries }) => {
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState("");
  const [existingDiaryId, setExistingDiaryId] = useState(null);
  const [fetchedData, setFetchedData] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [chartData, setChartData] = useState({});

  const calorieGoal = user?.goal?.calorie_goal || 2000;
  const user_id = user?.user_id || 0;

  // 📅 Set today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  // 🔢 Calculate calories
  useEffect(() => {
    const total = foodEntries.reduce(
      (sum, entry) => sum + Number(entry.calories || 0),
      0,
    );
    setTotalCalories(total);

    const remaining = Math.max(0, calorieGoal - total);

    setChartData({
      labels: ["Consumed", "Remaining"],
      datasets: [
        {
          data: [total, remaining],
          backgroundColor: ["#ef4444", "#22c55e"],
          borderWidth: 0,
        },
      ],
    });
  }, [foodEntries, calorieGoal]);

  // 📡 Fetch diary
  useEffect(() => {
    if (!selectedDate || !user) return;

    setMessage({ text: "", type: "" });

    axios
      .get(`/api/food_diary/${selectedDate}/${user.user_id}`)
      .then((res) => {
        if (res.data.length > 0) {
          setExistingDiaryId(res.data[0].diary_id);
          setFoodEntries(res.data);
          setFetchedData(res.data);
        } else {
          setExistingDiaryId(null);
          setFoodEntries([]);
          setMessage({ text: "No meals recorded.", type: "info" });
        }
      })
      .catch((error) => {
        if (error.response?.data === "No recorded meals on that date.") {
          setFoodEntries([]);
          setExistingDiaryId(null);
          setMessage({ text: "No meals recorded.", type: "info" });
        } else {
          setMessage({ text: "Error loading meals.", type: "error" });
        }
      });
  }, [selectedDate, user]);

  // 🗑 Delete entry
  const handleDeleteEntry = (id) => {
    axios
      .delete(`/api/food_entries/${id}`)
      .then(() => {
        setFoodEntries((prev) =>
          prev.filter((entry) => entry.food_entry_id !== id),
        );
      })
      .catch(() => console.error("Delete failed"));
  };

  // 🗑 Delete diary
  const handleDeleteDiary = () => {
    if (!existingDiaryId) return;

    axios
      .delete(`/api/food_diary/${existingDiaryId}`)
      .then(() => {
        setFoodEntries([]);
        setExistingDiaryId(null);
        setMessage({ text: "Diary deleted.", type: "success" });
      })
      .catch(() => console.error("Delete diary failed"));
  };

  // ➕ Submit entries
  const handleSubmit = async () => {
    if (!selectedDate) {
      setMessage({ text: "Select a date.", type: "error" });
      return;
    }

    try {
      let diaryId = existingDiaryId;

      if (!diaryId) {
        const res = await axios.post(`/api/food_diary`, {
          user_id,
          date: selectedDate,
        });
        diaryId = res.data.diary_id;
      }

      const existingIds = fetchedData.map((e) => e.food_entry_id);

      const newEntries = foodEntries
        .filter((e) => !existingIds.includes(e.food_entry_id))
        .map((e) => ({
          ...e,
          diary_id: diaryId,
        }));

      if (newEntries.length === 0) {
        setMessage({ text: "No new meals.", type: "info" });
        return;
      }

      await axios.post(`/api/food_entries`, newEntries);

      setMessage({ text: "Meals saved!", type: "success" });
    } catch (err) {
      setMessage({ text: "Save failed.", type: "error" });
    }
  };

  // 🍽 Render meal section
  const renderMeal = (type) => {
    const items = foodEntries.filter((e) => e.category === type);

    return (
      <div className="meal-section" key={type}>
        <h4>{type.charAt(0).toUpperCase() + type.slice(1)}</h4>

        {items.length === 0 ? (
          <p className="empty-meal">No items</p>
        ) : (
          <ul>
            {items.map((entry) => (
              <li key={entry.food_entry_id}>
                <div className="food-entry-main">
                  <span className="food-entry-name">{entry.food_name}</span>
                  <span className="food-entry-cal">{entry.calories} cal</span>
                </div>

                <div className="additional-info">
                  <span>Protein: {entry.protein}g</span>
                  <span>Fat: {entry.fat}g</span>
                  <span>Carbs: {entry.carbohydrate}g</span>
                  <span>Fiber: {entry.fiber}g</span>
                </div>

                <RiIcons.RiDeleteBin6Line
                  className="bin"
                  onClick={() => handleDeleteEntry(entry.food_entry_id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="food-entries-container">
      <div className="food-entries">
        <div className="entries-header">
          <h3>Food Diary</h3>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <div className="meals-grid">{MEAL_TYPES.map(renderMeal)}</div>

        {foodEntries.length > 0 && (
          <>
            <div className="calorie-summary">
              <span className={totalCalories > calorieGoal ? "over" : ""}>
                {totalCalories} / {calorieGoal} calories
              </span>
            </div>

            <div className="pie-chart-container">
              <Pie data={chartData} />
            </div>

            <div className="entries-actions">
              <button onClick={handleSubmit}>Save Meals</button>

              {existingDiaryId && (
                <button className="danger" onClick={handleDeleteDiary}>
                  Delete Diary
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FoodEntries;
