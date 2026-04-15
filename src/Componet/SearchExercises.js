import React, { useMemo, useState } from "react";
import * as BsIcons from "react-icons/bs";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "../Styles/SearchExercises.css";

function SearchExercises({ exerciseList, handleAddToWorkout, loading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState("all");

  const uniqueBodyParts = [
    ...new Set(exerciseList.map((exercise) => exercise.bodyPart)),
  ];
  const uniqueTargets = [
    ...new Set(exerciseList.map((exercise) => exercise.target)),
  ];

  const capitalizeWords = (str) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const searchResults = useMemo(() => {
    return exerciseList.filter((exercise) => {
      const matchesFilter =
        selectedOption === "all" ||
        exercise.bodyPart === selectedOption ||
        exercise.target === selectedOption;

      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        exercise.name.toLowerCase().includes(query) ||
        exercise.target.toLowerCase().includes(query) ||
        exercise.bodyPart.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [exerciseList, selectedOption, searchTerm]);

  const handleDragStart = (event, exercise) => {
    event.dataTransfer.setData("text/plain", JSON.stringify(exercise));
  };

  return (
    <div className="search_exercise_container">
      <div className="searchPanelHeader">
        <h2>Exercise Library</h2>
        <p>Click or drag an exercise into your journal.</p>
      </div>

      <div className="search_container">
        <select
          className="search_bar_input"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option value="all">All</option>
          {uniqueBodyParts.map((bodyPart) => (
            <option key={bodyPart} value={bodyPart}>
              {capitalizeWords(bodyPart)}
            </option>
          ))}
          {uniqueTargets.map((target) => (
            <option key={target} value={target}>
              {capitalizeWords(target)}
            </option>
          ))}
        </select>

        <div className="searchInputWrap">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search_bar_input"
          />
          <BsIcons.BsSearch />
        </div>
      </div>

      <div className="search_result_container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : searchResults.length > 0 ? (
          searchResults.map((exercise) => (
            <div
              className="search_result_card"
              key={exercise.id}
              draggable="true"
              onDragStart={(event) => handleDragStart(event, exercise)}
              onClick={() => handleAddToWorkout(exercise)}
            >
              <div className="result_container">
                <LazyLoadImage
                  className="search-img"
                  src={exercise.gifUrl}
                  alt={exercise.name}
                  effect="blur"
                />
                <div className="search_result_card_inner_div">
                  <p className="exercise-p">{capitalizeWords(exercise.name)}</p>
                  <p className="exercise-meta">
                    {capitalizeWords(exercise.bodyPart)} •{" "}
                    {capitalizeWords(exercise.target)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="searchEmptyState">No exercises match your search.</p>
        )}
      </div>
    </div>
  );
}

export default SearchExercises;
