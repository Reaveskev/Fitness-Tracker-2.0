import React, { useEffect, useMemo, useState } from "react";
import * as GrIcons from "react-icons/gr";
import "../Styles/FoodSearch.css";
import { useAuth } from "../Componet/Auth";

const ITEMS_PER_PAGE = 5;
const FALLBACK_IMAGE = "/No_Image_Available.jpg";

function FoodSearch({ foodEntries, setFoodEntries }) {
  const { setCalories } = useAuth();

  const [foodInfo, setFoodInfo] = useState([]);
  const [selectedFoodIndex, setSelectedFoodIndex] = useState(null);
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [customFood, setCustomFood] = useState({
    food_name: "",
    calories: "",
    protein: "",
    fat: "",
    carbohydrate: "",
    fiber: "",
  });

  useEffect(() => {
    const total = foodEntries.reduce(
      (sum, entry) => sum + Number(entry.calories || 0),
      0,
    );
    setCalories(total);
  }, [foodEntries, setCalories]);

  const totalPages = Math.ceil(foodInfo.length / ITEMS_PER_PAGE);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = currentPage * ITEMS_PER_PAGE;
    return foodInfo.slice(start, end);
  }, [foodInfo, currentPage]);

  const resetSearchStatus = () => {
    setSearchError("");
  };

  const handleCustomFoodChange = (event) => {
    const { name, value } = event.target;
    setCustomFood((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchNutrients = async () => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setFoodInfo([]);
      setHasSearched(true);
      setSearchError("Enter a food name to search.");
      return;
    }

    try {
      setIsSearching(true);
      resetSearchStatus();

      const response = await fetch(
        `https://api.edamam.com/api/food-database/v2/parser?app_id=e43ce7b1&app_key=f9d3cbc6b369e0245620668b656a233e&ingr=${encodeURIComponent(trimmedQuery)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch food data.");
      }

      const data = await response.json();
      setFoodInfo(data.hints || []);
      setSelectedFoodIndex(null);
      setCurrentPage(1);
      setHasSearched(true);

      if (!data.hints?.length) {
        setSearchError("No food information available at this time.");
      }
    } catch (error) {
      console.error("Error fetching food data:", error);
      setFoodInfo([]);
      setHasSearched(true);
      setSearchError("Unable to search foods right now.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchNutrients();
  };

  const handleFoodSelection = (index) => {
    setSelectedFoodIndex(index);
  };

  const addSelectedFoodToEntries = (category) => {
    if (selectedFoodIndex === null) return;

    const selectedFood = paginatedResults[selectedFoodIndex];
    if (!selectedFood) return;

    const food = selectedFood.food;

    const newEntry = {
      food_name: food.label,
      calories: Number(food.nutrients.ENERC_KCAL?.toFixed(0) ?? 0),
      protein: Number(food.nutrients.PROCNT?.toFixed(0) ?? 0),
      fat: Number(food.nutrients.FAT?.toFixed(0) ?? 0),
      carbohydrate: Number(food.nutrients.CHOCDF?.toFixed(0) ?? 0),
      fiber: Number(food.nutrients.FIBTG?.toFixed(0) ?? 0),
      category,
    };

    setFoodEntries((prevEntries) => [...prevEntries, newEntry]);
    setSelectedFoodIndex(null);
  };

  const addCustomFoodEntry = (category) => {
    if (!customFood.food_name.trim() || customFood.calories === "") return;

    const newEntry = {
      food_name: customFood.food_name.trim(),
      calories: Number(customFood.calories || 0),
      protein: Number(customFood.protein || 0),
      fat: Number(customFood.fat || 0),
      carbohydrate: Number(customFood.carbohydrate || 0),
      fiber: Number(customFood.fiber || 0),
      category,
    };

    setFoodEntries((prevEntries) => [...prevEntries, newEntry]);

    setCustomFood({
      food_name: "",
      calories: "",
      protein: "",
      fat: "",
      carbohydrate: "",
      fiber: "",
    });
    setShowCustomFoodModal(false);
  };

  const renderMealButtons = () => {
    return (
      <div className="meal-grid">
        <button
          type="button"
          className="meal-btn"
          onClick={() => addSelectedFoodToEntries("breakfast")}
        >
          Breakfast
        </button>
        <button
          type="button"
          className="meal-btn"
          onClick={() => addSelectedFoodToEntries("lunch")}
        >
          Lunch
        </button>
        <button
          type="button"
          className="meal-btn"
          onClick={() => addSelectedFoodToEntries("dinner")}
        >
          Dinner
        </button>
        <button
          type="button"
          className="meal-btn"
          onClick={() => addSelectedFoodToEntries("snack")}
        >
          Snack
        </button>
      </div>
    );
  };

  return (
    <div className="food-search-panel">
      <div className="food-panel-header">
        <h2>Food Search</h2>
        <p>Search for foods and add them directly to a meal.</p>
      </div>

      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          type="text"
          placeholder="Search foods..."
          aria-label="Search foods"
        />
        <button type="submit" disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="search-results-panel">
        {isSearching ? (
          <p className="food-message">Searching...</p>
        ) : paginatedResults.length > 0 ? (
          <>
            <div className="search-results">
              {paginatedResults.map((result, index) => {
                const food = result.food;
                const isSelected = selectedFoodIndex === index;

                return (
                  <button
                    type="button"
                    key={`${food.label}-${index}`}
                    className={`search-result ${isSelected ? "selected" : ""}`}
                    onClick={() => handleFoodSelection(index)}
                  >
                    <img
                      alt={food.label}
                      src={food.image || FALLBACK_IMAGE}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                    <div className="search-result-content">
                      <span className="food-result-title">{food.label}</span>
                      <span>
                        Calories: {food.nutrients.ENERC_KCAL?.toFixed(0) ?? 0}
                      </span>
                      <span>
                        Protein: {food.nutrients.PROCNT?.toFixed(0) ?? 0}g
                      </span>
                      <span>Fat: {food.nutrients.FAT?.toFixed(0) ?? 0}g</span>
                      <span>
                        Carbs: {food.nutrients.CHOCDF?.toFixed(0) ?? 0}g
                      </span>
                      <span>
                        Fiber: {food.nutrients.FIBTG?.toFixed(0) ?? 0}g
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {renderMealButtons()}
          </>
        ) : hasSearched ? (
          <p className="food-message">{searchError || "No results found."}</p>
        ) : (
          <p className="food-message">
            Search for a food to see calories and macros.
          </p>
        )}

        {hasSearched && totalPages > 0 ? (
          <div className="paginationRow">
            <button
              type="button"
              className="pageArrow"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <GrIcons.GrFormPrevious />
            </button>

            <div className="pageNumbersWrap">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNum) => (
                  <button
                    type="button"
                    key={pageNum}
                    className={`pageNumberBtn ${
                      currentPage === pageNum ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              className="pageArrow"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <GrIcons.GrFormNext />
            </button>
          </div>
        ) : null}

        <button
          type="button"
          className="manualFoodBtn"
          onClick={() => setShowCustomFoodModal(true)}
        >
          Food not there? Add it manually.
        </button>
      </div>

      {showCustomFoodModal ? (
        <div className="add-food-popup-container">
          <div className="add-food-form">
            <div className="modalHeader">
              <h3>Add Custom Food</h3>
              <button
                type="button"
                className="modalCloseBtn"
                onClick={() => setShowCustomFoodModal(false)}
              >
                Close
              </button>
            </div>

            <div className="customFoodGrid">
              <div className="food-input">
                <label htmlFor="food_name">Food Name</label>
                <input
                  id="food_name"
                  name="food_name"
                  type="text"
                  value={customFood.food_name}
                  onChange={handleCustomFoodChange}
                />
              </div>

              <div className="food-input">
                <label htmlFor="calories">Calories</label>
                <input
                  id="calories"
                  name="calories"
                  type="number"
                  value={customFood.calories}
                  onChange={handleCustomFoodChange}
                />
              </div>

              <div className="food-input">
                <label htmlFor="protein">Protein</label>
                <input
                  id="protein"
                  name="protein"
                  type="number"
                  value={customFood.protein}
                  onChange={handleCustomFoodChange}
                />
              </div>

              <div className="food-input">
                <label htmlFor="fat">Fat</label>
                <input
                  id="fat"
                  name="fat"
                  type="number"
                  value={customFood.fat}
                  onChange={handleCustomFoodChange}
                />
              </div>

              <div className="food-input">
                <label htmlFor="carbohydrate">Carbohydrates</label>
                <input
                  id="carbohydrate"
                  name="carbohydrate"
                  type="number"
                  value={customFood.carbohydrate}
                  onChange={handleCustomFoodChange}
                />
              </div>

              <div className="food-input">
                <label htmlFor="fiber">Fiber</label>
                <input
                  id="fiber"
                  name="fiber"
                  type="number"
                  value={customFood.fiber}
                  onChange={handleCustomFoodChange}
                />
              </div>
            </div>

            <div className="customMealButtons">
              <button
                type="button"
                className="meal-btn"
                onClick={() => addCustomFoodEntry("breakfast")}
              >
                Add to Breakfast
              </button>
              <button
                type="button"
                className="meal-btn"
                onClick={() => addCustomFoodEntry("lunch")}
              >
                Add to Lunch
              </button>
              <button
                type="button"
                className="meal-btn"
                onClick={() => addCustomFoodEntry("dinner")}
              >
                Add to Dinner
              </button>
              <button
                type="button"
                className="meal-btn"
                onClick={() => addCustomFoodEntry("snack")}
              >
                Add to Snack
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default FoodSearch;
