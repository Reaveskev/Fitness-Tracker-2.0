import React, { useState, useEffect } from "react";
import * as GrIcons from "react-icons/gr";
import { useAuth } from "../Componet/Auth";
import "../Styles/FoodSearch.css";

const FoodSearch = ({ foodEntries, setFoodEntries }) => {
  const { setCalories } = useAuth();
  const [foodInfo, setFoodInfo] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [addFood, setAddFood] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [addCalories, setAddCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carb, setCarb] = useState("");
  const [fiber, setFiber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Function to calculate total calories
  const calculateTotalCalories = () => {
    const total = foodEntries.reduce(
      (sum, entry) => sum + Number(entry.calories),
      0
    );
    setCalories(total);
  };

  useEffect(() => {
    calculateTotalCalories();
  }, [foodEntries]);

  const fetchNutrients = async () => {
    try {
      const response = await fetch(
        `https://api.edamam.com/api/food-database/v2/parser?app_id=e43ce7b1&app_key=f9d3cbc6b369e0245620668b656a233e&ingr=${searchQuery}`
      );

      if (response.ok) {
        const data = await response.json();
        setFoodInfo(data.hints);
        setCurrentPage(1);
        setHasSearched(true);
      } else {
        console.log("Failed to fetch data from the API.");
        setHasSearched(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasSearched(true);
    }
  };

  const fetchImage = async () => {
    const accessKey = "48wl6afH6wry3qPgirPBZxfH4zZKpPvFX0uNMeXbtVo"; // Replace with your actual API access key

    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos/?query=${searchQuery}&client_id=${accessKey}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.total > 0) {
          const imageUrl = data.results[0].urls.regular;
          setImageURL(imageUrl);
        } else {
          console.log("No images found for the given search query.");
        }
      } else {
        console.log("Failed to fetch data from the API.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleFoodSelection = (food) => {
    setSelectedFood(food);
  };

  const addSelectedFoodToEntries = (section) => {
    if (selectedFood) {
      const newEntry = {
        food_name: selectedFood.food.label,
        calories: selectedFood.food.nutrients.ENERC_KCAL?.toFixed(0) ?? 0,
        protein: selectedFood.food.nutrients.PROCNT?.toFixed(0) ?? 0,
        fat: selectedFood.food.nutrients.FAT?.toFixed(0) ?? 0,
        carbohydrate: selectedFood.food.nutrients.CHOCDF?.toFixed(0) ?? 0,
        fiber: selectedFood.food.nutrients.FIBTG?.toFixed(0) ?? 0,
        category: section,
      };
      setFoodEntries((prevEntries) => [...prevEntries, newEntry]);

      setSelectedFood(null); // Reset selectedFood after adding it to entries
    }
  };

  // Function to add a new food entry
  const addFoodEntry = (section) => {
    if (foodName && addCalories) {
      const newEntry = {
        foodName,
        calories: parseInt(addCalories),
        section, // Add the section information to the entry
      };

      setFoodEntries((prevEntries) => [...prevEntries, newEntry]);

      // Clear input fields after adding the entry
      setFoodName("");
      setAddCalories("");
    }
  };

  // Handle the form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    addFoodEntry();
    setFoodName("");
    setAddCalories("");
    setProtein("");
    setFat("");
    setCarb("");
    setFiber("");
  };

  const getPageNumbers = () => {
    const totalPages = Math.ceil(foodInfo.length / itemsPerPage);
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  return (
    <div className="search-bar">
      <div className="food-search-container">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          type="text"
          placeholder="Type in food name"
        ></input>
        <button
          onClick={() => {
            fetchImage();
            fetchNutrients();
          }}
        >
          Search
        </button>
        <div className="search-results">
          {foodInfo.length > 0 ? (
            <>
              {foodInfo
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((foods, index) => {
                  let food = foods.food;

                  const {
                    label,
                    image,
                    nutrients: { ENERC_KCAL, PROCNT, FAT, CHOCDF, FIBTG },
                  } = food;

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        handleFoodSelection(foods);
                      }}
                      className="search-result"
                      style={{
                        backgroundColor:
                          selectedFood === foods ? "#b7b7b7" : "#f0f0f0",
                      }}
                    >
                      <img
                        alt={label}
                        src={
                          image || imageURL || "//public/No_Image_Available.jpg"
                        }
                      ></img>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{label}</span>
                        <span>Calories: {ENERC_KCAL?.toFixed(0) ?? 0}</span>
                        <span>Protein: {PROCNT?.toFixed(0) ?? 0}g</span>
                        <span>Fat: {FAT?.toFixed(0) ?? 0}g</span>
                        <span>Carbohydrate: {CHOCDF?.toFixed(0) ?? 0}g</span>
                        <span>Fiber: {FIBTG?.toFixed(0) ?? 0}g</span>
                      </div>
                    </div>
                  );
                })}
              <div className="meal">
                <button onClick={() => addSelectedFoodToEntries("breakfast")}>
                  Add to Breakfast
                </button>
                <button onClick={() => addSelectedFoodToEntries("lunch")}>
                  Add to Lunch
                </button>
                <button onClick={() => addSelectedFoodToEntries("dinner")}>
                  Add to Dinner
                </button>
                <button onClick={() => addSelectedFoodToEntries("snack")}>
                  Add to Snack
                </button>
              </div>
              <div className="meal_mobile">
                <button onClick={() => addSelectedFoodToEntries("breakfast")}>
                  Breakfast
                </button>
                <button onClick={() => addSelectedFoodToEntries("lunch")}>
                  Lunch
                </button>
                <button onClick={() => addSelectedFoodToEntries("dinner")}>
                  Dinner
                </button>
                <button onClick={() => addSelectedFoodToEntries("snack")}>
                  Snack
                </button>
              </div>
            </>
          ) : hasSearched ? (
            <p>No food information available at this time.</p>
          ) : null}

          {hasSearched ? (
            <>
              <div className="hasSearchedDiv">
                {getPageNumbers().length !== 0 ? (
                  <GrIcons.GrFormPrevious
                    size={24}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
                    }
                    disabled={currentPage === 1}
                  />
                ) : null}
                {getPageNumbers().map((pageNum) => (
                  <span
                    className="pageNumbers"
                    style={{
                      border: currentPage === pageNum ? "2px solid red" : null,
                    }}
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={currentPage === pageNum}
                  >
                    {pageNum}
                  </span>
                ))}
                {getPageNumbers().length !== 0 ? (
                  <GrIcons.GrFormNext
                    size={24}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setCurrentPage((prevPage) =>
                        Math.min(prevPage + 1, getPageNumbers().length)
                      )
                    }
                    disabled={currentPage === getPageNumbers().length}
                  />
                ) : null}
              </div>
              <span className="addFoodSpan" onClick={() => setAddFood(true)}>
                Food not there? Add it manually.
              </span>
            </>
          ) : null}
        </div>
      </div>

      {addFood ? (
        <div className="add-food-popup-container">
          <div className="add-food-form">
            <div>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => setAddFood(false)}
              >
                X
              </span>
            </div>
            <form className="formAlignment" onSubmit={handleSubmit}>
              <div className="food-input">
                <label>Food Name:</label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  required
                />
              </div>
              <div className="food-input">
                <label>Calories:</label>
                <input
                  type="number"
                  value={addCalories}
                  onChange={(e) => setAddCalories(e.target.value)}
                  required
                />
              </div>
              <div className="food-input">
                <label>Protein:</label>
                <input
                  type="text"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  required
                />
              </div>
              <div className="food-input">
                <label>Fat:</label>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  required
                />
              </div>
              <div className="food-input">
                <label>Carbohydrates:</label>
                <input
                  type="text"
                  value={carb}
                  onChange={(e) => setCarb(e.target.value)}
                  required
                />
              </div>
              <div className="food-input">
                <label>Fiber:</label>
                <input
                  type="number"
                  value={fiber}
                  onChange={(e) => setFiber(e.target.value)}
                  required
                />
              </div>
            </form>
            <button
              style={{ marginLeft: 0 }}
              type="submit"
              onClick={() => setAddFood(false)}
            >
              Add Food Entry
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default FoodSearch;
