import React, { useEffect, useMemo, useState } from "react";
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
  const { user } = useAuth();

  const [expandedWorkouts, setExpandedWorkouts] = useState([]);
  const [transformedData, setTransformedData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [pageMode, setPageMode] = useState("add");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  const [editedSet, setEditedSet] = useState({
    exerciseIndex: null,
    setIndex: null,
  });
  const [editedSets, setEditedSets] = useState([]);

  const userId = user?.user_id ?? 0;

  useEffect(() => {
    setExpandedWorkouts((prev) =>
      workoutList.map((_, index) => prev[index] ?? false),
    );
  }, [workoutList]);

  useEffect(() => {
    if (!transformedData?.length) {
      setEditedSets([]);
      return;
    }

    const initialEditedSets = transformedData.map((exercise) =>
      exercise.sets.map((set) => ({
        id: set.id,
        exercise_id: exercise.id,
        weight: String(set.weight ?? ""),
        reps: String(set.reps ?? ""),
      })),
    );

    setEditedSets(initialEditedSets);
  }, [transformedData]);

  const resetStatus = () => {
    setStatusMessage("");
    setStatusType("");
  };

  const showStatus = (message, type = "success") => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const togglePageMode = () => {
    resetStatus();
    setPageMode((prevMode) => (prevMode === "add" ? "view" : "add"));
    setTransformedData([]);
    setWorkoutList([]);
    setExpandedWorkouts([]);
    setEditedSet({ exerciseIndex: null, setIndex: null });
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const capitalizeWords = (str = "") =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const getFormattedDateForSQL = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formattedDate = useMemo(() => getFormattedDateForSQL(), []);

  const convertDataToDesiredFormat = (retrievedData, workoutArray) => {
    const nextData = [];

    retrievedData.forEach((entry) => {
      const matchingWorkout = workoutArray.find(
        (workout) =>
          parseInt(workout.id, 10) === parseInt(entry.exercise_id, 10),
      );

      if (!matchingWorkout) return;

      const set = {
        id: entry.entry_id,
        weight: entry.weight,
        reps: entry.rep_count,
      };

      const existingWorkout = nextData.find(
        (workout) =>
          parseInt(workout.id, 10) === parseInt(matchingWorkout.id, 10),
      );

      if (existingWorkout) {
        existingWorkout.sets.push(set);
        existingWorkout.sets.sort((a, b) => a.id - b.id);
      } else {
        nextData.push({
          ...matchingWorkout,
          sets: [set],
        });
      }
    });

    return nextData;
  };

  const fetchWorkoutsForDate = async (date, currentUserId) => {
    try {
      resetStatus();
      const response = await axios.get(
        `/api/past_workouts/${date}/${currentUserId}`,
      );
      const formatted = convertDataToDesiredFormat(response.data, exerciseList);
      setTransformedData(formatted);
      setExpandedWorkouts(new Array(formatted.length).fill(false));
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.data === "No recorded workout on that date.") {
        showStatus("No recorded workout on that date.", "error");
      } else {
        showStatus("Unable to load that workout session.", "error");
      }
    }
  };

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

  const handleAddSet = (exerciseIndex) => {
    const updatedWorkoutList = [...workoutList];

    if (!updatedWorkoutList[exerciseIndex].sets) {
      updatedWorkoutList[exerciseIndex].sets = [];
    }

    updatedWorkoutList[exerciseIndex].sets.push({
      id: uuidv4(),
      weight: "",
      reps: "",
    });

    setWorkoutList(updatedWorkoutList);
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    setWorkoutList((prevList) => {
      const newList = [...prevList];
      newList[exerciseIndex].sets.splice(setIndex, 1);
      return newList;
    });
  };

  const handleToggleExpand = (exerciseIndex) => {
    setExpandedWorkouts((prevExpandedWorkouts) => {
      const newExpandedWorkouts = [...prevExpandedWorkouts];
      newExpandedWorkouts[exerciseIndex] = !newExpandedWorkouts[exerciseIndex];
      return newExpandedWorkouts;
    });
  };

  const handleDeleteWorkout = (exerciseIndex) => {
    setWorkoutList((prevList) => {
      const newList = [...prevList];
      newList.splice(exerciseIndex, 1);
      return newList;
    });

    setExpandedWorkouts((prevExpandedWorkouts) => {
      const newExpandedWorkouts = [...prevExpandedWorkouts];
      newExpandedWorkouts.splice(exerciseIndex, 1);
      return newExpandedWorkouts;
    });
  };

  const createWorkout = async (currentUserId, date) => {
    const response = await axios.post("/api/workouts", {
      user_id: currentUserId,
      date,
    });

    return response.data.workout_id;
  };

  const addWorkoutEntries = async (entries) => {
    const response = await axios.post("/api/workouts_entry", entries);
    return response.data;
  };

  const handleAddToJournal = async () => {
    try {
      resetStatus();

      if (!workoutList.length) {
        showStatus("Add at least one exercise before saving.", "error");
        return;
      }

      const workoutEntryId = await createWorkout(userId, formattedDate);

      for (const workout of workoutList) {
        const safeSets =
          !workout.sets || workout.sets.length === 0
            ? [{ reps: "0", weight: "0" }]
            : workout.sets;

        const workoutEntries = safeSets.map((set) => ({
          workout_id: workoutEntryId,
          exercise_id: workout.id,
          set_count: 1,
          rep_count: parseInt(set.reps || 0, 10),
          weight: parseInt(set.weight || 0, 10),
          weight_unit:
            parseInt(set.weight || 0, 10) === 0 ? "Bodyweight" : "lbs",
        }));

        await addWorkoutEntries(workoutEntries);
      }

      showStatus("Workout added successfully!", "success");
    } catch (error) {
      console.error("Error:", error.message);
      showStatus("Failed to save workout.", "error");
    }
  };

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

  const enableEdit = (exerciseIndex, setIndex) => {
    setEditedSet({ exerciseIndex, setIndex });
  };

  const saveChanges = async (exerciseIndex, setIndex) => {
    try {
      const currentEditedSet = editedSets[exerciseIndex][setIndex];

      const workoutEntry = {
        entry_id: currentEditedSet.id,
        exercise_id: currentEditedSet.exercise_id,
        rep_count: parseInt(currentEditedSet.reps || 0, 10),
        weight: parseFloat(currentEditedSet.weight || 0),
        weight_unit:
          parseInt(currentEditedSet.weight || 0, 10) === 0
            ? "Bodyweight"
            : "lbs",
      };

      await axios.patch(
        `/api/workout_entry/${currentEditedSet.id}`,
        workoutEntry,
      );

      setEditedSet({ exerciseIndex: null, setIndex: null });
      showStatus("Workout entry updated.", "success");
      fetchWorkoutsForDate(selectedDate, userId);
    } catch (error) {
      console.error("Error saving changes:", error);
      showStatus("Failed to update workout entry.", "error");
    }
  };

  const cancelEdit = () => {
    setEditedSet({ exerciseIndex: null, setIndex: null });
  };

  const renderAddMode = () => {
    return (
      <>
        {workoutList.map((exercise, exerciseIndex) => (
          <div key={`${exercise.id}-${exerciseIndex}`}>
            <div
              className="workoutlist_div"
              onClick={() => handleToggleExpand(exerciseIndex)}
            >
              <div className="workout-div">
                <img
                  src={exercise.gifUrl}
                  alt={exercise.name}
                  className="workoutlist_img"
                />
                <p className="exercise_name">
                  {capitalizeWords(exercise.name)}
                </p>
              </div>

              <div className="workout_row_actions">
                {expandedWorkouts[exerciseIndex] ? (
                  <IoIcons.IoMdArrowDropup className="icon" />
                ) : (
                  <IoIcons.IoMdArrowDropdown className="icon" />
                )}

                <RiIcons.RiDeleteBin6Line
                  className="icon"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteWorkout(exerciseIndex);
                  }}
                />
              </div>
            </div>

            {expandedWorkouts[exerciseIndex] && (
              <div className="expanded_workoutlist_div">
                <div
                  className="add_set_container"
                  onClick={() => handleAddSet(exerciseIndex)}
                >
                  <BsIcons.BsPlusCircle className="add_icon" />
                  <span>Add Set</span>
                </div>

                <div className="workout_journal_header">
                  <span className="set_label">Set</span>
                  <span>Lbs</span>
                  <span>Reps</span>
                  <span>Action</span>
                </div>

                {exercise.sets?.map((set, setIndex) => (
                  <div key={set.id} className="set_div">
                    <p className="set_label">Set {setIndex + 1}</p>

                    <input
                      type="number"
                      placeholder="Weight"
                      value={set.weight}
                      onChange={(event) =>
                        handleWeightChange(event, exerciseIndex, setIndex)
                      }
                      className="weight_reps_input"
                    />

                    <input
                      type="number"
                      placeholder="Reps"
                      value={set.reps}
                      onChange={(event) =>
                        handleRepsChange(event, exerciseIndex, setIndex)
                      }
                      className="weight_reps_input"
                    />

                    <div className="set_actions">
                      <button
                        type="button"
                        className="set_action_btn"
                        onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                      >
                        <HiIcons.HiOutlineBackspace />
                        <span className="remove_span">Remove Set</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {statusMessage ? (
          <div
            className={
              statusType === "error"
                ? "failureMessageWorkout"
                : "successMessageWorkout"
            }
          >
            {statusMessage}
          </div>
        ) : null}
      </>
    );
  };

  const renderViewMode = () => {
    return (
      <>
        {statusMessage ? (
          <div
            className={
              statusType === "error"
                ? "failureMessageWorkout"
                : "successMessageWorkout"
            }
          >
            {statusMessage}
          </div>
        ) : null}

        {transformedData.map((exercise, exerciseIndex) => {
          if (!exercise.sets) return null;

          return (
            <div key={`${exercise.id}-${exerciseIndex}`}>
              <div
                className="workoutlist_div"
                onClick={() => handleToggleExpand(exerciseIndex)}
              >
                <div className="workout-div">
                  <img
                    src={exercise.gifUrl}
                    alt={exercise.name}
                    className="workoutlist_img"
                  />
                  <p className="exercise_name">
                    {capitalizeWords(exercise.name)}
                  </p>
                </div>

                <div className="workout_row_actions">
                  {expandedWorkouts[exerciseIndex] ? (
                    <IoIcons.IoMdArrowDropup className="icon" />
                  ) : (
                    <IoIcons.IoMdArrowDropdown className="icon" />
                  )}
                </div>
              </div>

              {expandedWorkouts[exerciseIndex] && (
                <div className="expanded_workoutlist_div">
                  <div className="workout_journal_header">
                    <span className="set_label">Set</span>
                    <span>Lbs</span>
                    <span>Reps</span>
                    <span>Action</span>
                  </div>

                  {exercise.sets.map((set, setIndex) => (
                    <div key={set.id} className="set_div">
                      {editedSet.exerciseIndex === exerciseIndex &&
                      editedSet.setIndex === setIndex ? (
                        <>
                          <p className="set_label">Set {setIndex + 1}</p>

                          <input
                            type="number"
                            placeholder="Weight"
                            value={
                              editedSets[exerciseIndex][setIndex]?.weight || ""
                            }
                            onChange={(event) =>
                              handleEditWeightChange(
                                event,
                                exerciseIndex,
                                setIndex,
                              )
                            }
                            className="weight_reps_input"
                          />

                          <input
                            type="number"
                            placeholder="Reps"
                            value={
                              editedSets[exerciseIndex][setIndex]?.reps || ""
                            }
                            onChange={(event) =>
                              handleEditRepsChange(
                                event,
                                exerciseIndex,
                                setIndex,
                              )
                            }
                            className="weight_reps_input"
                          />

                          <div className="set_actions">
                            <button
                              type="button"
                              className="icon_btn"
                              onClick={() =>
                                saveChanges(exerciseIndex, setIndex)
                              }
                              aria-label="Save changes"
                            >
                              <BiIcons.BiSave />
                            </button>

                            <button
                              type="button"
                              className="icon_btn"
                              onClick={cancelEdit}
                              aria-label="Cancel edit"
                            >
                              <GiIcons.GiCancel />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="set_label">Set {setIndex + 1}</p>
                          <span className="set_value">{set.weight}</span>
                          <span className="set_value">{set.reps}</span>

                          <div className="set_actions">
                            <button
                              type="button"
                              className="icon_btn"
                              onClick={() =>
                                enableEdit(exerciseIndex, setIndex)
                              }
                              aria-label="Edit set"
                            >
                              <HiIcons.HiPencil />
                            </button>
                          </div>
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
    );
  };

  return (
    <div className="workout_journal_container">
      <div className="journalHeader">
        <h2>Workout Builder</h2>
        <p>Create a workout for today or review past sessions.</p>
      </div>

      <div className="button_div">
        <button onClick={togglePageMode} className="addWorkoutButton">
          {pageMode === "add" ? "View History" : "Build Workout"}
        </button>

        {pageMode === "view" ? (
          <div className="history_controls">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="date_input"
            />
            <button
              onClick={() => {
                resetStatus();
                fetchWorkoutsForDate(selectedDate, userId);
              }}
              className="addWorkoutButton"
            >
              Find Session
            </button>
          </div>
        ) : (
          <button onClick={handleAddToJournal} className="addWorkoutButton">
            Save Workout
          </button>
        )}
      </div>

      <div className="button_div_mobile">
        <button onClick={togglePageMode} className="addWorkoutButton">
          {pageMode === "add" ? "History" : "Build"}
        </button>

        {pageMode === "view" ? (
          <div className="history_controls">
            <input
              className="date_input"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
            />
            <button
              onClick={() => {
                resetStatus();
                fetchWorkoutsForDate(selectedDate, userId);
              }}
              className="addWorkoutButton"
            >
              Find
            </button>
          </div>
        ) : (
          <button onClick={handleAddToJournal} className="addWorkoutButton">
            Save
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
          setWorkoutList((prevList) => [...prevList, draggedExercise]);
        }}
      >
        {pageMode === "add" ? renderAddMode() : renderViewMode()}
      </div>
    </div>
  );
}

export default WorkoutJournal;
