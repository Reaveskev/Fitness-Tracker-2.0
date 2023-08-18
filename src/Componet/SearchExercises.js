import React, { useState } from "react";
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

  // Generate options for the select input
  const bodyPartOptions = uniqueBodyParts.map((bodyPart) => (
    <option key={bodyPart} value={bodyPart}>
      {capitalizeWords(bodyPart)}
    </option>
  ));

  const targetOptions = uniqueTargets.map((target) => (
    <option key={target} value={target}>
      {capitalizeWords(target)}
    </option>
  ));

  const [searchResults, setSearchResults] = useState(exerciseList);

  const filterExercises = (exercises, selectedOption) => {
    return exercises.filter((exercise) => {
      // Check if the selected option is "all" or if it matches the exercise's bodyPart or target
      const matchSelectedOption =
        selectedOption === "all" ||
        exercise.bodyPart === selectedOption ||
        exercise.target === selectedOption;

      return matchSelectedOption;
    });
  };

  const handleDragStart = (event, exercise) => {
    event.dataTransfer.setData("text/plain", JSON.stringify(exercise));
  };

  // Search function to search exercises based on the search term
  const searchExercises = (exercises, searchTerm) => {
    return exercises.filter((exercise) => {
      const matchSearchTerm =
        searchTerm === "" ||
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.bodyPart.toLowerCase().includes(searchTerm.toLowerCase());

      return matchSearchTerm;
    });
  };

  const handleFilterChange = (event) => {
    const { value } = event.target;
    setSelectedOption(value);

    // Filter the exercises based on the selected option
    const filteredExercises = filterExercises(exerciseList, value);

    // Apply additional search filter if searchTerm is present
    if (searchTerm !== "") {
      const searchedExercises = searchExercises(filteredExercises, searchTerm);
      setSearchResults(searchedExercises);
    } else {
      setSearchResults(filteredExercises);
    }
  };

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchTerm(value);

    // Filter the exercises based on the search term
    const filteredExercises = filterExercises(exerciseList, selectedOption);

    // Apply additional search filter if searchTerm is present
    if (value !== "") {
      const searchedExercises = searchExercises(filteredExercises, value);
      setSearchResults(searchedExercises);
    } else {
      setSearchResults(filteredExercises);
    }
  };

  function capitalizeWords(str) {
    // Split the string into an array of words
    const words = str.split(" ");

    // Capitalize the first letter of each word
    const capitalizedWords = words.map((word) => {
      const firstLetter = word.charAt(0).toUpperCase();
      const restOfWord = word.slice(1);
      return firstLetter + restOfWord;
    });

    // Join the capitalized words back into a string
    const capitalizedString = capitalizedWords.join(" ");

    return capitalizedString;
  }

  return (
    <div className="search_exercise_container">
      <div className="search_container">
        <div>
          <span
            style={{
              paddingRight: 5,
            }}
            span
          >
            Filter
          </span>
          <select
            className="search_bar_input"
            value={selectedOption}
            onChange={handleFilterChange}
          >
            <option value="all">All</option>
            {bodyPartOptions}
            {targetOptions}
          </select>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search for exercises..."
            value={searchTerm}
            onChange={handleSearch}
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
        ) : (
          <>
            {searchResults.length > 0 ? (
              searchResults.map((exercise) => (
                <div
                  className="search_result_card"
                  key={exercise.id}
                  draggable="true" // Add this attribute to make it draggable
                  onDragStart={(event) => handleDragStart(event, exercise)}
                  onClick={() => handleAddToWorkout(exercise)}
                >
                  <div className="result_container">
                    <LazyLoadImage
                      className="search-img"
                      src={exercise.gifUrl}
                      alt="gif"
                      effect="blur"
                    />
                    <div className="search_result_card_inner_div">
                      <p className="exercise-p">
                        {capitalizeWords(exercise.name)}
                      </p>
                      <p style={{ margin: 0 }}>
                        Target: {capitalizeWords(exercise.target)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center" }}>Search for your workout!</p>
            )}
          </>
        )}
      </div>
      <div className="search_result_container_mobile">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {searchResults.length > 0 ? (
              searchResults.map((exercise) => (
                <div
                  className="search_result_card"
                  key={exercise.id}
                  draggable="true" // Add this attribute to make it draggable
                  onDragStart={(event) => handleDragStart(event, exercise)}
                  onClick={() => handleAddToWorkout(exercise)}
                >
                  <div className="result_container">
                    <img
                      className="search-img"
                      src={exercise.gifUrl}
                      alt="gif"
                    />
                    <div className="search_result_card_inner_div">
                      <p className="exercise-p">
                        {capitalizeWords(exercise.name)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center" }}>Search for your workout!</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SearchExercises;
