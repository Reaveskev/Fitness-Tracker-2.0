import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import * as IoIcons from "react-icons/io";
import * as RiIcons from "react-icons/ri";
import * as BsIcons from "react-icons/bs";
import * as HiIcons from "react-icons/hi";
import * as BiIcons from "react-icons/bi";
import * as GiIcons from "react-icons/gi";
import axios from "axios";
import { useAuth } from "./Auth";
import "../Styles/WorkoutJournal.css";

function WorkoutJournal({ setWorkoutList, workoutList, exerciseList }) {
  const [setIds, setSetIds] = useState([]);
  const [expandedWorkouts, setExpandedWorkouts] = useState(
    new Array(workoutList.length).fill(false)
  );
  const [fetchedWorkouts, setFetchedWorkouts] = useState([]);
  const [transformedData, setTransformedData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const { user } = useAuth();
  const [pageMode, setPageMode] = useState("add");
  const [successMessage, setSuccessMessage] = useState("");

  const togglePageMode = () => {
    setSuccessMessage("");
    setPageMode((prevMode) => (prevMode === "add" ? "view" : "add"));
    setFetchedWorkouts([]);
    setWorkoutList([]);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  let user_id;
  if (user) {
    user_id = user.user_id;
  } else {
    user_id = 0;
  }

  const fetchWorkoutsForDate = (date, user_id) => {
    const apiUrl = `/api/past_workouts/${date}/${user_id}`;

    axios
      .get(apiUrl)
      .then((response) => {
        let temp = convertDataToDesiredFormat(response.data, exerciseList);
        setFetchedWorkouts(response.data);
        setTransformedData(temp);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        if (error.response.data === "No recorded workout on that date.") {
          setSuccessMessage("No recorded workout on that date.");
        }
      });
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

  const handleWeightChange = (event, exerciseIndex, setIndex) => {
    const { value } = event.target;
    setWorkoutList((prevList) => {
      const newList = [...prevList];
      newList[exerciseIndex].sets[setIndex].weight = value;
      return newList;
    });
  };

  const handleRepsChange = (event, exerciseIndex, setIndex) => {
    let { value } = event.target;
    value = value.replace(/[^0-9]/g, "");
    setWorkoutList((prevList) => {
      const newList = [...prevList];
      newList[exerciseIndex].sets[setIndex].reps = value;
      return newList;
    });
  };

  //Add Set
  const handleAddSet = (exerciseIndex) => {
    // Make a copy of the workoutList to avoid directly modifying the state
    const updatedWorkoutList = [...workoutList];

    // Check if the 'sets' array is defined for the selected exercise
    if (!updatedWorkoutList[exerciseIndex].sets) {
      // If 'sets' is undefined, initialize it with an empty array
      updatedWorkoutList[exerciseIndex].sets = [];
    }

    // Generate a unique ID for the new set
    const setId = uuidv4();

    // Add the new set to the 'sets' array of the selected exercise
    updatedWorkoutList[exerciseIndex].sets.push({
      id: setId,
      weight: "",
      reps: "",
    });

    // Update the state with the new workoutList
    setWorkoutList(updatedWorkoutList);
    // Store the unique ID in the setIds state
    setSetIds((prevSetIds) => [...prevSetIds, setId]);
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    setWorkoutList((prevList) => {
      const newList = [...prevList];
      newList[exerciseIndex].sets.splice(setIndex, 1);
      return newList;
    });
  };

  //handle expanding div
  const handleToggleExpand = (exerciseIndex) => {
    setExpandedWorkouts((prevExpandedWorkouts) => {
      const newExpandedWorkouts = [...prevExpandedWorkouts];

      // If the exerciseIndex is not yet present in the expandedWorkouts array,
      // initialize it to true, otherwise toggle its value
      if (typeof newExpandedWorkouts[exerciseIndex] === "undefined") {
        newExpandedWorkouts[exerciseIndex] = true;
      } else {
        newExpandedWorkouts[exerciseIndex] =
          !newExpandedWorkouts[exerciseIndex];
      }

      return newExpandedWorkouts;
    });
  };

  //Delete Workout
  const handleDeleteWorkout = (exerciseIndex) => {
    setWorkoutList((prevList) => {
      const newList = [...prevList];
      newList.splice(exerciseIndex, 1);
      return newList;
    });
    // Optional: Collapse the expanded workout if it is deleted
    setExpandedWorkouts((prevExpandedWorkouts) => {
      const newExpandedWorkouts = [...prevExpandedWorkouts];
      newExpandedWorkouts[exerciseIndex] = false;
      return newExpandedWorkouts;
    });
  };

  //////////////
  function getFormattedDateForSQL() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const formattedDate = getFormattedDateForSQL();

  const createWorkout = async (user_id, date) => {
    try {
      const response = await axios.post("/api/workouts", {
        user_id,
        date,
      });

      return response.data.workout_id;
    } catch (error) {
      throw new Error("Failed to create workout");
    }
  };

  const addWorkoutEntries = async (workoutList) => {
    try {
      const response = await axios.post("/api/workouts_entry", workoutList);

      return response.data;
    } catch (error) {
      throw new Error("Failed to add workout entries");
    }
  };

  const createWorkoutEntry = async (user_id, date) => {
    try {
      const workout_id = await createWorkout(user_id, date);
      return workout_id;
    } catch (error) {
      throw new Error("Failed to create workout entry");
    }
  };

  const handleAddToJournal = async () => {
    try {
      const workoutEntryId = await createWorkoutEntry(user_id, formattedDate);

      for (const workout of workoutList) {
        // Ensure there are sets even for workouts without sets
        if (!workout.sets || workout.sets.length === 0) {
          workout.sets = [{ reps: "0", weight: "0" }];
        }

        const workoutEntries = workout.sets.map((set) => ({
          workout_id: workoutEntryId,
          exercise_id: workout.id,
          set_count: 1,
          rep_count: parseInt(set.reps),
          weight: parseInt(set.weight),
          weight_unit: parseInt(set.weight) == 0 ? "Bodyweight" : "lbs",
        }));

        const addedWorkoutEntries = await addWorkoutEntries(workoutEntries);

        setSuccessMessage("Workout added successfully!");
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  function convertDataToDesiredFormat(retrievedData, workoutArray) {
    const transformedData = [];

    retrievedData.forEach((entry) => {
      const matchingWorkout = workoutArray.find(
        (workout) => parseInt(workout.id) === parseInt(entry.exercise_id)
      );

      if (matchingWorkout) {
        const set = {
          id: entry.entry_id,
          weight: entry.weight,
          reps: entry.rep_count,
        };

        const existingWorkout = transformedData.find(
          (workout) => parseInt(workout.id) === parseInt(matchingWorkout.id)
        );

        if (existingWorkout) {
          existingWorkout.sets.push(set);
          // Sort the sets in ascending order based on the id
          existingWorkout.sets.sort((a, b) => a.id - b.id);
        } else {
          transformedData.push({
            ...matchingWorkout,
            sets: [set],
          });
        }
      }
    });

    return transformedData;
  }

  ///TEST

  const [editedSet, setEditedSet] = useState({
    exerciseIndex: null,
    setIndex: null,
  });

  const handleEditWeightChange = (event, exerciseIndex, setIndex) => {
    const { value } = event.target;
    const updatedEditedSets = [...editedSets];
    updatedEditedSets[exerciseIndex][setIndex].weight = value;
    setEditedSets(updatedEditedSets);
  };

  const handleEditRepsChange = (event, exerciseIndex, setIndex) => {
    let { value } = event.target;
    value = value.replace(/[^0-9]/g, "");

    const updatedEditedSets = [...editedSets];
    updatedEditedSets[exerciseIndex][setIndex].reps = value;
    setEditedSets(updatedEditedSets);
  };
  const [editedSets, setEditedSets] = useState([]);

  useEffect(() => {
    if (transformedData) {
      const initialEditedSets = transformedData.map((exercise) =>
        exercise.sets.map((set) => ({
          id: set.id, // Make sure to include these properties
          exercise_id: exercise.id,
          weight: set.weight,
          reps: set.reps,
        }))
      );
      setEditedSets(initialEditedSets);
    }
  }, [transformedData]);

  const updateEditedSet = (exerciseIndex, setIndex, updatedSet) => {
    const updatedEditedSets = [...editedSets];
    updatedEditedSets[exerciseIndex][setIndex] = updatedSet;
    setEditedSets(updatedEditedSets);
  };

  const enableEdit = (exerciseIndex, setIndex) => {
    setEditedSet({ exerciseIndex, setIndex });
  };

  const saveChanges = async (exerciseIndex, setIndex) => {
    try {
      const editedSet = editedSets[exerciseIndex][setIndex];

      // Prepare the data for the patch request
      const workoutEntry = {
        entry_id: editedSet.id,
        exercise_id: editedSet.exercise_id,
        rep_count: parseInt(editedSet.reps),
        weight: parseFloat(editedSet.weight),
        weight_unit: parseInt(editedSet.weight) == 0 ? "Bodyweight" : "lbs",
      };

      // Send the patch request to update the workout entry for the specific set
      const response = await axios.patch(
        `/api/workout_entry/${editedSet.id}`,
        workoutEntry
      );
      console.log("Changes saved successfully!");

      // Update the local state with the edited set data
      const updatedEditedSets = [...editedSets];
      updatedEditedSets[exerciseIndex][setIndex] = response.data; // Use the actual property name that holds the updated entry data
      setEditedSets(updatedEditedSets);

      // Clear the editedSet state to exit edit mode
      setEditedSet({ exerciseIndex: null, setIndex: null });
      fetchWorkoutsForDate(selectedDate, user_id);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const cancelEdit = () => {
    // Reset editedSet state
    setEditedSet({ exerciseIndex: null, setIndex: null });
  };

  return (
    <div className="workout_journal_container">
      <div className="button_div">
        <button onClick={togglePageMode} className="addWorkoutButton">
          {pageMode === "add" ? "Add New Workout" : "View Past Workouts"}
        </button>
        {pageMode === "view" ? (
          <div style={{ display: "flex" }}>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
            />
            <button
              onClick={() => {
                setSuccessMessage("");
                fetchWorkoutsForDate(selectedDate, user_id);
              }}
              className="addWorkoutButton"
            >
              Past Workout
            </button>
          </div>
        ) : (
          <button onClick={handleAddToJournal} className="addWorkoutButton">
            Add to Journal
          </button>
        )}
      </div>

      <div className="button_div_mobile">
        <button onClick={togglePageMode} className="addWorkoutButton">
          {pageMode === "add" ? "New Workout" : "Past Workouts"}
        </button>
        {pageMode === "view" ? (
          <div style={{ display: "flex" }}>
            <input
              className="date_input"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
            />
            <button
              onClick={() => {
                setSuccessMessage("");
                fetchWorkoutsForDate(selectedDate, user_id);
              }}
              style={{ width: 45 }}
              className="addWorkoutButton"
            >
              Find
            </button>
          </div>
        ) : (
          <button onClick={handleAddToJournal} className="addWorkoutButton">
            Add to Journal
          </button>
        )}
      </div>

      <div
        className="workout_journal_div"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const data = event.dataTransfer.getData("text/plain");
          const draggedExercise = JSON.parse(data);
          // Add the dropped exercise to the workoutList
          setWorkoutList((prevList) => [...prevList, draggedExercise]);
        }}
      >
        {pageMode === "add" ? (
          <>
            {workoutList &&
              workoutList.map((exercise, exerciseIndex) => {
                return (
                  <div key={exerciseIndex}>
                    <div
                      className="workoutlist_div"
                      onClick={() => handleToggleExpand(exerciseIndex)}
                    >
                      <div className="workout-div">
                        <img
                          src={exercise.gifUrl}
                          alt="gif"
                          className="workoutlist_img"
                        />
                        <p>{capitalizeWords(exercise.name)}</p>
                      </div>
                      <div>
                        <div>
                          {expandedWorkouts[exerciseIndex] ? (
                            <>
                              <IoIcons.IoMdArrowDropup className="icon" />

                              <RiIcons.RiDeleteBin6Line
                                className="icon"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeleteWorkout(exerciseIndex);
                                }}
                              />
                            </>
                          ) : (
                            <>
                              <IoIcons.IoMdArrowDropdown className="icon" />

                              <RiIcons.RiDeleteBin6Line
                                className="icon"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeleteWorkout(exerciseIndex);
                                }}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {expandedWorkouts[exerciseIndex] && (
                      <div
                        className="expanded_workoutlist_div"
                        style={{
                          display: expandedWorkouts[exerciseIndex]
                            ? "flex"
                            : "none",
                        }}
                      >
                        <div className="add_set_container">
                          <BsIcons.BsPlusCircle
                            className="add_icon"
                            onClick={() => handleAddSet(exerciseIndex)}
                          />
                          Add Set
                        </div>
                        <div className="workout_journal_header">
                          <label style={{ width: "10%", paddingLeft: 5 }}>
                            Set
                          </label>
                          <label style={{ width: "10%", paddingLeft: 28 }}>
                            Lbs
                          </label>
                          <label className="reps_label">Reps</label>
                        </div>
                        {exercise.sets &&
                          exercise.sets.map((set, setIndex) => {
                            return (
                              <div key={set.id} className="set_div">
                                <p
                                  style={{
                                    width: "10%",
                                    paddingLeft: 5,
                                    textAlign: "center",
                                  }}
                                >
                                  Set {setIndex + 1}
                                </p>
                                <input
                                  type="number"
                                  placeholder="Weight"
                                  value={set.weight}
                                  onChange={(event) =>
                                    handleWeightChange(
                                      event,
                                      exerciseIndex,
                                      setIndex
                                    )
                                  }
                                  onBlur={(event) =>
                                    handleWeightChange(
                                      event,
                                      exerciseIndex,
                                      setIndex
                                    )
                                  }
                                  className="weight_reps_input"
                                />
                                <input
                                  type="number"
                                  placeholder="Reps"
                                  value={set.reps}
                                  onChange={(event) =>
                                    handleRepsChange(
                                      event,
                                      exerciseIndex,
                                      setIndex
                                    )
                                  } // Add this onChange handler
                                  onBlur={(event) =>
                                    handleRepsChange(
                                      event,
                                      exerciseIndex,
                                      setIndex
                                    )
                                  }
                                  className="weight_reps_input"
                                />
                                <span className="remove_span">
                                  <HiIcons.HiOutlineBackspace
                                    style={{
                                      padding: "0 5",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      handleRemoveSet(exerciseIndex, setIndex)
                                    }
                                  />
                                  Remove Set
                                </span>
                                <span className="remove_span_mobile">
                                  <HiIcons.HiOutlineBackspace
                                    style={{
                                      padding: "0 5",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      handleRemoveSet(exerciseIndex, setIndex)
                                    }
                                  />
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
            {successMessage && (
              <div className="successMessageWorkout">{successMessage}</div>
            )}
          </>
        ) : (
          <>
            {successMessage && (
              <div className="failureMessageWorkout">{successMessage}</div>
            )}
            {transformedData &&
              transformedData.map((exercise, exerciseIndex) => {
                if (!exercise.sets) return null;
                return (
                  <div key={exerciseIndex}>
                    <div
                      className="workoutlist_div"
                      onClick={() => handleToggleExpand(exerciseIndex)}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={exercise.gifUrl}
                          alt="gif"
                          className="workoutlist_img"
                        />
                        <p>{capitalizeWords(exercise.name)}</p>
                      </div>
                      <div>
                        <div>
                          {expandedWorkouts[exerciseIndex] ? (
                            <IoIcons.IoMdArrowDropup className="icon" />
                          ) : (
                            <IoIcons.IoMdArrowDropdown className="icon" />
                          )}
                        </div>
                      </div>
                    </div>
                    {expandedWorkouts[exerciseIndex] && (
                      <div
                        className="expanded_workoutlist_div"
                        style={{
                          display: expandedWorkouts[exerciseIndex]
                            ? "flex"
                            : "none",
                        }}
                      >
                        <div className="workout_journal_header">
                          <label style={{ width: "10%", paddingLeft: 5 }}>
                            Set
                          </label>
                          <label style={{ width: "10%", paddingLeft: 28 }}>
                            Lbs
                          </label>
                          <label className="reps_label">Reps</label>
                        </div>
                        {exercise.sets &&
                          exercise.sets.map((set, setIndex) => (
                            <div key={setIndex} className="set_div">
                              {editedSet.exerciseIndex === exerciseIndex &&
                              editedSet.setIndex === setIndex ? (
                                <>
                                  <p
                                    style={{
                                      width: "10%",
                                      paddingLeft: 5,
                                      textAlign: "center",
                                    }}
                                  >
                                    Set {setIndex + 1}
                                  </p>
                                  <input
                                    type="number"
                                    placeholder="Weight"
                                    value={
                                      editedSets[exerciseIndex][setIndex]
                                        ?.weight || ""
                                    }
                                    onChange={(event) =>
                                      handleEditWeightChange(
                                        event,
                                        exerciseIndex,
                                        setIndex
                                      )
                                    }
                                    style={{ width: "10%" }}
                                  />
                                  <input
                                    type="number"
                                    placeholder="Reps"
                                    value={
                                      editedSets[exerciseIndex][setIndex]
                                        ?.reps || ""
                                    }
                                    onChange={(event) =>
                                      handleEditRepsChange(
                                        event,
                                        exerciseIndex,
                                        setIndex
                                      )
                                    }
                                    style={{ width: "10%" }}
                                  />
                                  {/* Add save and cancel buttons */}
                                  <BiIcons.BiSave
                                    style={{ paddingRight: 10 }}
                                    onClick={() =>
                                      saveChanges(exerciseIndex, setIndex)
                                    }
                                  />

                                  <GiIcons.GiCancel onClick={cancelEdit} />
                                </>
                              ) : (
                                <>
                                  <p
                                    style={{
                                      width: "10%",
                                      paddingLeft: 5,
                                      textAlign: "center",
                                    }}
                                  >
                                    Set {setIndex + 1}
                                  </p>
                                  <span style={{ width: "10%" }}>
                                    {set.weight}
                                  </span>
                                  <span style={{ width: "10%" }}>
                                    {set.reps}
                                  </span>
                                  {/* Add an edit icon or button */}
                                  <HiIcons.HiPencil
                                    style={{
                                      padding: "0 5",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      enableEdit(exerciseIndex, setIndex)
                                    }
                                  />
                                </>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </>
        )}
      </div>
    </div>
  );
}

export default WorkoutJournal;
