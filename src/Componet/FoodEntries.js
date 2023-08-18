import React, { useState, useEffect } from "react";
import { Chart, ArcElement } from "chart.js";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import { useAuth } from "../Componet/Auth";
import * as RiIcons from "react-icons/ri";
import "../Styles/FoodEntries.css";

Chart.register(ArcElement);

const FoodEntries = ({ foodEntries, setFoodEntries }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState("");
  const [pageMode, setPageMode] = useState("view");
  const [oldGraph, setOldGraph] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [existingDiaryId, setExistingDiaryId] = useState(null);
  const [fetchedData, setFetchedData] = useState([]);

  const [totalCalories, setTotalCalories] = useState(0);

  // Function to calculate total consumed calories
  const calculateTotalCalories = () => {
    let total = 0;
    foodEntries.forEach((entry) => {
      total += parseInt(entry.calories);
    });
    setTotalCalories(total);
  };

  useEffect(() => {
    calculateTotalCalories();
  }, [foodEntries]);

  let calorieGoal;
  let user_id;
  if (user) {
    calorieGoal = user.goal.calorie_goal;
    user_id = user.user_id;
  } else {
    calorieGoal = 2000;
    user_id = 0;
  }

  let remainingCalories = Math.max(0, calorieGoal - totalCalories);
  const calorieChartData = {
    labels: ["Consumed Calories", "Remaining Calories"],
    datasets: [
      {
        data: [totalCalories, remainingCalories],
        backgroundColor: ["rgba(255, 99, 132, 0.6)", "rgba(75, 192, 192, 0.6)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(75, 192, 192, 1)"],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  useEffect(() => {
    setSelectedDate(formattedDate);
  }, []);

  useEffect(() => {
    setSuccessMessage("");
  }, [foodEntries]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  useEffect(() => {
    setSuccessMessage("");
    if (selectedDate) {
      axios
        .get(`/api/food_diary/${selectedDate}`)
        .then((response) => {
          if (response.data.length > 0) {
            setExistingDiaryId(response.data[0].diary_id); // Set the existing diary_id
            setFoodEntries(response.data);
            setFetchedData(response.data);
          } else {
            setExistingDiaryId(null); // No existing diary found
            setFoodEntries([]); // Clear fetched food entries
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          console.log(error.response.data);
          if (error.response.data === "No recorded meals on that date.") {
            setSuccessMessage("No meals recorded on this date.");
            setExistingDiaryId(null); // No existing diary found
            setFoodEntries([]); // Clear fetched food entries
          }
        });
    }
  }, [selectedDate]);

  useEffect(() => {
    let temp = 0;
    foodEntries.forEach((entry) => {
      temp += parseInt(entry.calories);
    });

    let oldRemainingCalories = Math.max(0, calorieGoal - temp);

    setOldGraph({
      labels: ["Consumed Calories", "Remaining Calories"],
      datasets: [
        {
          data: [temp, oldRemainingCalories],
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(75, 192, 192, 0.6)",
          ],
          borderColor: ["rgba(255, 99, 132, 1)", "rgba(75, 192, 192, 1)"],
          borderWidth: 1,
          hoverOffset: 4,
        },
      ],
    });

    setTotalCalories(temp);
  }, [foodEntries]);

  function getFormattedDateForSQL() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const formattedDate = getFormattedDateForSQL();

  const createFoodDiary = async (user_id, date) => {
    try {
      const response = await axios.post(`/api/food_diary`, {
        user_id,
        date,
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to create food diary");
    }
  };

  const addFoodEntries = async (foodEntries) => {
    try {
      const response = await axios.post(`/api/food_entries`, foodEntries);
      return response.data;
    } catch (error) {
      throw new Error("Failed to add food entries");
    }
  };

  const deleteFoodDiary = async (diary_id) => {
    try {
      const response = await axios.delete(`/api/food_diary/${diary_id}`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to delete food entry");
    }
  };

  const deleteFoodEntry = async (food_entry_id) => {
    try {
      const response = await axios.delete(`/api/food_entries/${food_entry_id}`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to delete food entry");
    }
  };

  const handleDeleteFoodEntry = (foodEntryId) => {
    deleteFoodEntry(foodEntryId)
      .then(() => {
        // Refresh the fetched food entries after deletion
        // You can make a fresh API request or filter the existing data
        setFoodEntries((prevFood) =>
          prevFood.filter((entry) => entry.food_entry_id !== foodEntryId)
        );
        console.log("Food entry deleted successfully");
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  };

  const handleDeleteFoodDiary = () => {
    if (existingDiaryId) {
      deleteFoodDiary(existingDiaryId)
        .then(() => {
          // Handle successful deletion of food diary
          console.log("Food diary deleted successfully");
          // Reset relevant state or perform other updates
          setFoodEntries([]);
          // setOldCalories(0);
          setOldGraph([]);
          setSuccessMessage("Food diary deleted successfully");
          setExistingDiaryId(null);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        });
    }
  };

  const handleAddFood = () => {
    if (selectedDate) {
      if (existingDiaryId) {
        // Filter out the fetched food entries from fetchedData
        const existingFoodEntryIds = fetchedData.map(
          (entry) => entry.food_entry_id
        );
        const newFoodEntries = foodEntries.filter(
          (entry) => !existingFoodEntryIds.includes(entry.food_entry_id)
        );

        if (newFoodEntries.length > 0) {
          const updatedFoodEntries = newFoodEntries.map((entry) => {
            return {
              ...entry,
              diary_id: existingDiaryId,
            };
          });

          addFoodEntries(updatedFoodEntries)
            .then((addedFoodEntries) => {
              setSuccessMessage("Meals added successfully!");
              console.log("New food entries added:", addedFoodEntries);
            })
            .catch((error) => {
              console.error("Error:", error.message);
            });
        } else {
          setSuccessMessage("No new meals to add.");
        }
      } else {
        // Create a new food diary first
        createFoodDiary(user.user_id, selectedDate)
          .then((createdDiary) => {
            // Use the created diary_id for new food entries
            const updatedFoodEntries = foodEntries.map((entry) => {
              return {
                ...entry,
                diary_id: createdDiary.diary_id,
              };
            });

            addFoodEntries(updatedFoodEntries)
              .then((addedFoodEntries) => {
                setSuccessMessage("Meals added successfully!");
                console.log("New food entries added:", addedFoodEntries);
              })
              .catch((error) => {
                console.error("Error:", error.message);
              });
          })
          .catch((error) => {
            console.error("Error creating food diary:", error.message);
          });
      }
    } else {
      setSuccessMessage("Please select a date to add meals.");
    }
  };

  const togglePageMode = () => {
    setExistingDiaryId(null);
    setSuccessMessage("");
    setPageMode((prevMode) => (prevMode === "add" ? "view" : "add"));
  };

  const handleRemoveFood = (foodEntryId) => {
    setFoodEntries((prevFood) =>
      prevFood.filter((entry) => entry.food_entry_id !== foodEntryId)
    );
  };

  return (
    <div className="food-entries-container">
      <div className="food-entries">
        <h3>Food Entries:</h3>
        {/* <button onClick={togglePageMode} className="addWorkoutButton">
          {pageMode === "add" ? "Add Food Journal" : "View Past Meals"}
        </button> */}
        {/* {pageMode === "view" ? ( */}
        <div style={{ display: "flex" }}>
          <input type="date" value={selectedDate} onChange={handleDateChange} />
        </div>
        {/* ) : null} */}

        {/* {pageMode === "add" ? (
          <>
            <h4>Breakfast:</h4>
            <ul>
              {foodEntries
                .filter((entry) => entry.category === "breakfast")
                .map((entry, index) => (
                  <li key={index}>
                    <strong>{entry.food_name}</strong> - {entry.calories}{" "}
                    calories
                    <div className="additional-info">
                      <span>Protein: {entry.protein}g</span>
                      <span>Fat: {entry.fat}g</span>
                      <span>Carbohydrate: {entry.carbohydrate}g</span>
                      <span>Fiber: {entry.fiber}g</span>
                    </div>
                    <RiIcons.RiDeleteBin6Line
                      className="bin"
                      onClick={() => {
                        handleRemoveFood(entry.food_entry_id);
                      }}
                    />
                  </li>
                ))}
            </ul>
            <h4>Lunch:</h4>
            <ul>
              {foodEntries
                .filter((entry) => entry.category === "lunch")
                .map((entry, index) => (
                  <li key={index}>
                    <strong>{entry.food_name}</strong> - {entry.calories}{" "}
                    calories
                    <div className="additional-info">
                      <span>Protein: {entry.protein}g</span>
                      <span>Fat: {entry.fat}g</span>
                      <span>Carbohydrate: {entry.carbohydrate}g</span>
                      <span>Fiber: {entry.fiber}g</span>
                    </div>
                    <RiIcons.RiDeleteBin6Line
                      className="bin"
                      onClick={() => {
                        handleRemoveFood(entry.food_entry_id);
                      }}
                    />
                  </li>
                ))}
            </ul>
            <h4>Dinner:</h4>
            <ul>
              {foodEntries
                .filter((entry) => entry.category === "dinner")
                .map((entry, index) => (
                  <li key={index}>
                    <strong>{entry.food_name}</strong> - {entry.calories}{" "}
                    calories
                    <div className="additional-info">
                      <span>Protein: {entry.protein}g</span>
                      <span>Fat: {entry.fat}g</span>
                      <span>Carbohydrate: {entry.carbohydrate}g</span>
                      <span>Fiber: {entry.fiber}g</span>
                    </div>
                    <RiIcons.RiDeleteBin6Line
                      className="bin"
                      onClick={() => {
                        handleRemoveFood(entry.food_entry_id);
                      }}
                    />
                  </li>
                ))}
            </ul>
            <h4>Snack:</h4>
            <ul>
              {foodEntries
                .filter((entry) => entry.category === "snack")
                .map((entry, index) => (
                  <li key={index}>
                    <strong>{entry.food_name}</strong> - {entry.calories}{" "}
                    calories
                    <div className="additional-info">
                      <span>Protein: {entry.protein}g</span>
                      <span>Fat: {entry.fat}g</span>
                      <span>Carbohydrate: {entry.carbohydrate}g</span>
                      <span>Fiber: {entry.fiber}g</span>
                    </div>
                    <RiIcons.RiDeleteBin6Line
                      className="bin"
                      onClick={() => {
                        handleRemoveFood(entry.food_entry_id);
                      }}
                    />
                  </li>
                ))}
            </ul>
            <p
              style={{
                color: totalCalories > calorieGoal ? "red" : "black",
              }}
            >
              Consumed {totalCalories} / {calorieGoal} Goal
            </p>
            <div className="pie-chart-container">
              <Pie data={calorieChartData} />
            </div>
            {successMessage && (
              <div className="successMessageFood">{successMessage}</div>
            )}
          </>
        ) : ( */}
        {/* <> */}
        {successMessage[0] === "N" ? (
          <div className="failureMessageFood">{successMessage}</div>
        ) : (
          <div className="successMessageFood">{successMessage}</div>
        )}
        <h4>Breakfast:</h4>
        {foodEntries.length > 0 ? (
          <ul>
            {foodEntries
              .filter((entry) => entry.category === "breakfast")
              .map((entry, index) => (
                <li key={index}>
                  <strong>{entry.food_name}</strong> - {entry.calories} calories
                  <div className="additional-info">
                    <span>Protein: {entry.protein}g</span>
                    <span>Fat: {entry.fat}g</span>
                    <span>Carbohydrate: {entry.carbohydrate}g</span>
                    <span>Fiber: {entry.fiber}g</span>
                  </div>
                  <RiIcons.RiDeleteBin6Line
                    className="bin"
                    onClick={() => {
                      handleDeleteFoodEntry(entry.food_entry_id);
                    }}
                  />
                </li>
              ))}
          </ul>
        ) : null}

        <h4>Lunch:</h4>
        {foodEntries.length > 0 ? (
          <ul>
            {foodEntries
              .filter((entry) => entry.category === "lunch")
              .map((entry, index) => (
                <li key={index}>
                  <strong>{entry.food_name}</strong> - {entry.calories} calories
                  <div className="additional-info">
                    <span>Protein: {entry.protein}g</span>
                    <span>Fat: {entry.fat}g</span>
                    <span>Carbohydrate: {entry.carbohydrate}g</span>
                    <span>Fiber: {entry.fiber}g</span>
                  </div>
                  <RiIcons.RiDeleteBin6Line
                    className="bin"
                    onClick={() => {
                      handleDeleteFoodEntry(entry.food_entry_id);
                    }}
                  />
                </li>
              ))}
          </ul>
        ) : null}
        <h4>Dinner:</h4>
        {foodEntries.length > 0 ? (
          <ul>
            {foodEntries
              .filter((entry) => entry.category === "dinner")
              .map((entry, index) => (
                <li key={index}>
                  <strong>{entry.food_name}</strong> - {entry.calories} calories
                  <div className="additional-info">
                    <span>Protein: {entry.protein}g</span>
                    <span>Fat: {entry.fat}g</span>
                    <span>Carbohydrate: {entry.carbohydrate}g</span>
                    <span>Fiber: {entry.fiber}g</span>
                  </div>
                  <RiIcons.RiDeleteBin6Line
                    className="bin"
                    onClick={() => {
                      handleDeleteFoodEntry(entry.food_entry_id);
                    }}
                  />
                </li>
              ))}
          </ul>
        ) : null}
        <h4>Snack:</h4>
        {foodEntries.length > 0 ? (
          <ul>
            {foodEntries
              .filter((entry) => entry.category === "snack")
              .map((entry, index) => (
                <li key={index}>
                  <strong>{entry.food_name}</strong> - {entry.calories} calories
                  <div className="additional-info">
                    <span>Protein: {entry.protein}g</span>
                    <span>Fat: {entry.fat}g</span>
                    <span>Carbohydrate: {entry.carbohydrate}g</span>
                    <span>Fiber: {entry.fiber}g</span>
                  </div>
                  <RiIcons.RiDeleteBin6Line
                    className="bin"
                    onClick={() => {
                      handleDeleteFoodEntry(entry.food_entry_id);
                    }}
                  />
                </li>
              ))}
          </ul>
        ) : null}
        {foodEntries.length > 0 ? (
          <>
            <p
              style={{
                color: totalCalories > calorieGoal ? "red" : "black",
              }}
            >
              Consumed {totalCalories.toFixed(0)} / {calorieGoal} Goal
            </p>

            <div className="pie-chart-container">
              <Pie data={oldGraph} />
            </div>
          </>
        ) : null}
        {foodEntries.length > 0 && existingDiaryId ? (
          <button className="delete_food" onClick={handleDeleteFoodDiary}>
            Delete Food Diary
          </button>
        ) : null}
        {/* </> */}
        {/* )} */}
      </div>
      {foodEntries.length > 0 ? (
        <button
          className="submit-food-entries"
          onClick={handleAddFood}
          style={{ marginTop: 15 }}
        >
          Submit
        </button>
      ) : null}
    </div>
  );
};

export default FoodEntries;
