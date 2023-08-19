const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const pg = require("pg");
const path = require("path");
const bcrypt = require("bcrypt");
const axios = require("axios");
const saltRounds = 10;
const multer = require("multer");
const Dropbox = require("dropbox").Dropbox;

// Goes through .env files and sets port and database.
dotenv.config();
const app = express();

app.use(cors());

app.use(express.static(path.join(__dirname, "build")));

// Destructuring
const { DATABASE_URL, NODE_ENV, PORT } = process.env;

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

app.use(express.json());

//Setting default to public
app.use(express.static("public"));

//////////////////////////////
////////Hash Password/////////
//////////////////////////////
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
}

//////////////////////////////
///////////USERS//////////////
//////////////////////////////

// User login
app.post("/api/users/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await findUserByUsername(username);

    if (user) {
      const isMatch = await isPasswordValid(password, user.password); // Compare passwords directly
      if (isMatch) {
        res.json(user);
      } else {
        res.status(401).send({ error: "Authentication failed" });
      }
    } else {
      res.status(401).send({ error: "Authentication failed" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Function to find a user by username in the "database"
async function findUserByUsername(username) {
  try {
    const userQuery = "SELECT * FROM users WHERE username = $1";
    const userData = await pool.query(userQuery, [username]);
    const user = userData.rows[0];

    if (user) {
      const user_id = user.user_id;

      // Get the latest weight from body_measurements for the user_id
      const weightQuery =
        "SELECT weight FROM body_measurements WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 1";
      const weightData = await pool.query(weightQuery, [user_id]);
      const latestWeight = weightData.rows[0].weight;

      // Add the latest weight to the user object
      user.weight = latestWeight;

      const goalQuery =
        "SELECT * FROM goals WHERE user_id = $1 ORDER BY goal_id DESC LIMIT 1";
      const goalData = await pool.query(goalQuery, [user_id]);
      const goal = goalData.rows[0];

      // Add the goal information to the user object
      user.goal = goal;
    }

    return user;
  } catch (error) {
    throw new Error("Error fetching user");
  }
}

// Function to check if the given password matches the stored hashed password
async function isPasswordValid(password, hashedPassword) {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
}

//Add new user.
app.post("/api/users/create", async (req, res) => {
  const { username, name, weight, sex, birth_date, password } = req.body;

  try {
    // Check if the username already exists in the database
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(409).send({ error: "Username already exists" });
    }

    const hashedPassword = await hashPassword(password); // Hash the provided password

    const userQuery =
      "INSERT INTO users(username, name, sex, birth_date, password) VALUES($1, $2, $3, $4, $5) RETURNING *;";
    const userValues = [username, name, sex, birth_date, hashedPassword];

    const userResult = await pool.query(userQuery, userValues);
    const user = userResult.rows[0];
    const user_id = user.user_id; // Get the user_id returned from the database

    const weightQuery =
      "INSERT INTO body_measurements(user_id, weight) VALUES($1, $2);";
    const weightValues = [user_id, weight];

    await pool.query(weightQuery, weightValues);

    res.status(200).json(user);
    console.log("New user added!");
  } catch (error) {
    console.error("Error adding new user:", error);
    res.status(500).send("Internal Server Error");
  }

  async function findUserByUsername(username) {
    try {
      const userQuery = "SELECT * FROM users WHERE username = $1";
      const userData = await pool.query(userQuery, [username]);
      const user = userData.rows[0];
      return user;
    } catch (error) {
      throw new Error("Error fetching user");
    }
  }
});

// Deletes user by user_id.
app.delete("/api/users/:id", async (req, res) => {
  const user_id = req.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING *",
      [user_id]
    );

    if (result.rows.length === 0) {
      res.status(404).send("User does not exist");
    } else {
      res.send(result.rows[0]);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Updates a user by user_id.
app.patch("/api/users/:id", async (req, res) => {
  const id = req.params.id;

  const { username, name, sex, birth_date, password, image_url } = req.body;

  if (password) {
    try {
      const hashedPassword = await hashPassword(password); // Hash the provided password

      pool
        .query(
          `UPDATE users SET username = COALESCE($1, username), name = COALESCE($2, name), sex = COALESCE($3, sex), birth_date = COALESCE($4, birth_date), password = COALESCE($5, password), image_url = COALESCE($6, image_url) WHERE user_id = $7 RETURNING *`,
          [username, name, sex, birth_date, hashedPassword, image_url, id]
        )
        .then((result) => {
          if (result.rows.length === 0) {
            res.sendStatus(404);
          } else {
            res.send(result.rows[0]);
          }
        });
    } catch (error) {
      console.error("Error hashing password:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    // If no password no hashing
    pool
      .query(
        `UPDATE users SET username = COALESCE($1, username), name = COALESCE($2, name), sex = COALESCE($3, sex), birth_date = COALESCE($4, birth_date), image_url = COALESCE($5, image_url) WHERE user_id = $6 RETURNING *`,
        [username, name, sex, birth_date, image_url, id]
      )
      .then((result) => {
        if (result.rows.length === 0) {
          res.sendStatus(404);
        } else {
          res.send(result.rows[0]);
        }
      });
  }
});

app.patch("/api/user/password", (req, res) => {
  const { password, user_id } = req.body;

  const hashedPassword = hashPassword(password); // Hash the provided password
  pool
    .query(
      "UPDATE users SET password = COALESCE($1, password) WHERE user_id = $2 ",
      [hashedPassword, user_id] // Pass the array of values here
    )
    .then((result) => {
      if (result.rows.length === 0) {
        res.sendStatus(404);
      } else {
        res.send(result.rows[0]);
      }
    })
    .catch((error) => {
      console.error("Error adding body measurement:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.post("/api/body_measurement", (req, res) => {
  const { user_id, weight } = req.body;
  pool
    .query(
      "INSERT INTO body_measurements(user_id, weight) VALUES($1, $2) RETURNING *",
      [user_id, weight] // Pass the array of values here
    )
    .then((result) => {
      if (result.rows.length === 0) {
        res.sendStatus(404);
      } else {
        res.send(result.rows[0]);
      }
    })
    .catch((error) => {
      console.error("Error adding body measurement:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/api/body_measurement/:id", (req, res) => {
  const user_id = req.params.id;
  pool
    .query("SELECT * from body_measurements WHERE user_id = $1", [user_id])
    .then((result) => {
      if (result.rows.length === 0) {
        res.sendStatus(404);
      } else {
        res.send(result.rows);
      }
    })
    .catch((error) => {
      console.error("Error retrieving body measurements:", error);
      res.status(500).send("Internal Server Error");
    });
});

///////////////////////////
///////////Goals///////////
///////////////////////////
app.post("/api/goals", (req, res) => {
  const { user_id, goal, calorieGoals, goalWeight } = req.body;
  pool
    .query(
      "INSERT INTO goals(user_id, goal, calorie_goal, goal_weight) VALUES($1, $2, $3, $4) RETURNING *",
      [user_id, goal, calorieGoals, goalWeight]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        res.sendStatus(404);
      } else {
        res.send(result.rows[0]);
      }
    })
    .catch((error) => {
      console.error("Error adding goal:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/api/goals/:id", async (req, res) => {
  user_id = req.params.id;
  try {
    const query =
      "SELECT * FROM goals WHERE user_id = $1 ORDER BY goal_id DESC LIMIT 1";
    const result = await pool.query(query, [user_id]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).send("Internal Server Error");
  }
});

///////////////////////////////
///////////WORKOUTS////////////
///////////////////////////////

//Add new workout.
app.post("/api/workouts", (req, res) => {
  const { user_id, date } = req.body;

  pool
    .query("INSERT INTO workout(user_id, date) VALUES($1, $2) RETURNING *;", [
      user_id,
      date,
    ])
    .then((data) => {
      res.status(200).json(data.rows[0]); // Use json() to send the response as JSON
      console.log("New workout added!");
    })
    .catch((error) => {
      console.error("Error adding new workout:", error);
      res.status(500).send("Internal Server Error");
    });
});

// Find workouts by date
app.get("/api/past_workouts/:date/:user_id", (req, res) => {
  const { date, user_id } = req.params; // Use req.query to access query parameters

  pool
    .query(
      "SELECT * FROM Workout_Entries WHERE workout_id IN (SELECT workout_id FROM Workout WHERE date = $1 AND user_id = $2)",
      [date, user_id]
    )
    .then((data) => {
      const workout = data.rows;
      if (workout && workout.length > 0) {
        res.send(workout);
      } else {
        res.status(400).send("No recorded workout on that date.");
      }
    })
    .catch((error) => {
      console.error("Error fetching workout entries:", error);
      res.status(500).send("Internal Server Error");
    });
});

// Find workouts by date
app.get("/api/count_past_workouts/", (req, res) => {
  const { user_id } = req.query;

  // Get the current date
  const currentDate = new Date();

  // Calculate the date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(currentDate.getDate() - 30);

  pool
    .query(
      "SELECT COUNT(*) AS workout_count FROM Workout WHERE date BETWEEN $1 AND $2 AND user_id = $3",
      [thirtyDaysAgo, currentDate, user_id]
    )
    .then((data) => {
      const workoutCount = data.rows[0].workout_count;
      res.send({ workoutCount });
    })
    .catch((error) => {
      console.error("Error fetching workout entries:", error);
      res.status(500).send("Internal Server Error");
    });
});

// Deletes workout at by id.
app.delete("/api/workouts/:id", (req, res) => {
  const id = req.params.id;
  pool
    .query(`DELETE FROM workout WHERE workout_id = $1 RETURNING *`, [id])
    .then((data) => {
      if (data.rows.length === 0) {
        res.sendStatus(404);
      } else {
        res.send(data.rows[0]);
      }
    });
});

app.patch("/api/workout_entry/:entry_id", (req, res) => {
  const { entry_id } = req.params;
  const { exercise_id, set_count, rep_count, weight, weight_unit } = req.body;

  pool
    .query(
      "UPDATE workout_entries SET exercise_id = $1, set_count = $2, rep_count = $3, weight = $4, weight_unit = $5 WHERE entry_id = $6 RETURNING *;",
      [exercise_id, set_count, rep_count, weight, weight_unit, entry_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        res.sendStatus(404);
      } else {
        res.status(200).json(result.rows[0]);
      }
    })
    .catch((error) => {
      console.error("Error updating workout entry:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.post("/api/workouts_entry", (req, res) => {
  const workoutEntries = req.body; // Assuming the request body is an array of workout entries

  // Check if the request body is an array
  if (!Array.isArray(workoutEntries)) {
    res
      .status(400)
      .send({ error: "Invalid request format. Expected an array." });
    return;
  }

  // Prepare an array to store the promises for inserting workout entries
  const insertionPromises = [];

  // Loop through each workout entry in the array
  for (const entry of workoutEntries) {
    const {
      workout_id,
      exercise_id,
      set_count,
      rep_count,
      weight,
      weight_unit,
    } = entry;

    // Create a promise for each workout entry insertion
    const insertionPromise = pool.query(
      "INSERT INTO workout_entries(workout_id, exercise_id, set_count, rep_count, weight, weight_unit) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;",
      [workout_id, exercise_id, set_count, rep_count, weight, weight_unit]
    );

    // Add the promise to the array
    insertionPromises.push(insertionPromise);
  }

  // Execute all the insertion promises using Promise.all
  Promise.all(insertionPromises)
    .then((results) => {
      const insertedWorkoutEntries = results.map((result) => result.rows[0]);
      res.status(200).json(insertedWorkoutEntries);
      console.log("New workout entries added!");
    })
    .catch((error) => {
      console.error("Error adding new workout entries:", error);
      res.status(500).send("Internal Server Error");
    });
});

///////////////////////////////
///////////Food Diary//////////
///////////////////////////////

//Add new food_diary.
app.post("/api/food_diary", (req, res) => {
  const { user_id, date } = req.body;

  pool
    .query(
      "INSERT INTO food_diary(user_id, date) VALUES($1, $2) RETURNING *;",
      [user_id, date]
    )
    .then((data) => {
      res.status(200).json(data.rows[0]); // Use json() to send the response as JSON
      console.log("New food diary added!");
    })
    .catch((error) => {
      console.error("Error adding new workout:", error);
      res.status(500).send("Internal Server Error");
    });
});

// Find food by date
app.get("/api/food_diary/:id/:user", (req, res) => {
  const date = req.params.id;
  const user_id = req.params.user;
  pool
    .query(
      "SELECT * FROM food_entries WHERE diary_id IN (SELECT diary_id FROM food_diary WHERE date = $1 AND user_id = $2)",
      [date, user_id]
    )
    .then((data) => {
      const food_diary = data.rows;
      if (food_diary && food_diary.length > 0) {
        res.send(food_diary);
      } else {
        res.status(400).send("No recorded meals on that date.");
      }
    })
    .catch((error) => {
      console.error("Error fetching workout entries:", error);
      res.status(500).send("Internal Server Error");
    });
});

// Deletes food_diary by id.
app.delete("/api/food_diary/:id", (req, res) => {
  const id = req.params.id;
  pool
    .query(`DELETE FROM food_diary WHERE diary_id = $1 RETURNING *`, [id])
    .then((data) => {
      if (data.rows.length === 0) {
        res.sendStatus(404);
      } else {
        res.send(data.rows[0]);
      }
    });
});

// Deletes fodd_entry by id.
app.delete("/api/food_entries/:id", (req, res) => {
  const id = req.params.id;
  pool
    .query(`DELETE FROM food_entries WHERE food_entry_id = $1 RETURNING *`, [
      id,
    ])
    .then((data) => {
      if (data.rows.length === 0) {
        res.sendStatus(404);
      } else {
        res.send(data.rows[0]);
      }
    });
});

app.post("/api/food_entries", (req, res) => {
  const food_entries = req.body;

  // Check if the request body is an array
  if (!Array.isArray(food_entries)) {
    res
      .status(400)
      .send({ error: "Invalid request format. Expected an array." });
    return;
  }

  // Prepare an array to store the promises for inserting workout entries
  const insertionPromises = [];

  // Loop through each workout entry in the array
  for (const entry of food_entries) {
    const {
      diary_id,
      category,
      food_name,
      calories,
      protein,
      fat,
      carbohydrate,
      fiber,
    } = entry;

    // Create a promise for each workout entry insertion
    const insertionPromise = pool.query(
      "INSERT INTO food_entries( diary_id, category, food_name, calories, protein, fat, carbohydrate, fiber) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;",
      [
        diary_id,
        category,
        food_name,
        calories,
        protein,
        fat,
        carbohydrate,
        fiber,
      ]
    );

    // Add the promise to the array
    insertionPromises.push(insertionPromise);
  }

  // Execute all the insertion promises using Promise.all
  Promise.all(insertionPromises)
    .then((results) => {
      const insertedFoodEntries = results.map((result) => result.rows[0]);
      res.status(200).json(insertedFoodEntries);
      console.log("New food entries added!");
    })
    .catch((error) => {
      console.error("Error adding new food entries:", error);
      res.status(500).send("Internal Server Error");
    });
});

///////////////////
/////EXERCISES/////
///////////////////

app.get("/api/exercises/", async (req, res) => {
  try {
    // Make a GET request to the external API
    const externalApiUrl = "https://exercisedb.p.rapidapi.com/exercises";
    const headers = {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
    };

    const response = await axios.get(externalApiUrl, { headers });

    // Process the response as needed
    console.log(response);
    const exercises = response.data;

    // Return the data to the client
    res.json(exercises);
  } catch (error) {
    // Handle any errors that occur during the request
    console.error("Error fetching exercises:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching exercises" });
  }
});

//////////////
////QUOTES////
//////////////

app.get("/api/quotes", (req, res) => {
  pool.query("SELECT * FROM quotes").then((data) => {
    res.send(data.rows);
  });
});

//////////////
////DROPBOX///
//////////////
// Set up multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/api/dropbox/upload", upload.single("file"), async (req, res) => {
  try {
    const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });

    const file = req.file;

    const filename = file.originalname;
    const fileBuffer = file.buffer;

    const response = await dbx.filesUpload({
      path: `/${filename}`,
      contents: fileBuffer,
      mode: "overwrite",
    });

    try {
      const sharedLink = await dbx.sharingCreateSharedLinkWithSettings({
        path: response.result.path_display,
      });

      res.json({ url: sharedLink.result.url });
    } catch (sharedLinkError) {
      console.error("Error creating shared link:", sharedLinkError);
      res.status(500).json({
        error:
          sharedLinkError.message ||
          "An error occurred while creating the shared link",
      });
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      res.status(401).json({ error: "Invalid Dropbox access token" });
    } else {
      console.error("Error during file upload:", error);
      res.status(500).json({ error: error.message || "An error occurred" });
    }
  }
});

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Adds console log to show that the port is running.
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
