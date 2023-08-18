import React, { useState } from "react";
import { useAuth } from "../Componet/Auth";
import axios from "axios";
import * as BiIcons from "react-icons/bi";
import * as FaIcons from "react-icons/fa";
import * as RiIcons from "react-icons/ri";
import DropboxApp from "../Componet/DropBox";
import "../Styles/User.css";

function User() {
  const { user, setUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [update, setUpdate] = useState(false);
  const [password, setPassword] = useState(false);
  const [weight, setWeight] = useState(false);
  const [image_url, setImage_url] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [uservalues, SetValues] = useState({
    username: "",
    name: "",
    sex: "",
    birth_date: "",
    password: "",
    confirm_password: "",
    weight: 0,
  });

  const handleUserNameInputChange = (event) => {
    SetValues({ ...uservalues, username: event.target.value });
  };

  const handleNameInputChange = (event) => {
    SetValues({ ...uservalues, name: event.target.value });
  };

  const handleWeightInputChange = (event) => {
    SetValues({ ...uservalues, weight: Number(event.target.value) });
  };

  const handleSexInputChange = (event) => {
    SetValues({ ...uservalues, sex: event.target.value });
  };

  const handleBirthDateInputChange = (event) => {
    SetValues({ ...uservalues, birth_date: event.target.value });
  };

  const handlePasswordInputChange = (event) => {
    SetValues({ ...uservalues, password: event.target.value });
  };

  const handleConfirmPasswordInputChange = (event) => {
    SetValues({ ...uservalues, confirm_password: event.target.value });
  };

  const handleSubmit = (event) => {
    //prevent referesh
    event.preventDefault();
    SetValues({
      username: "",
      name: "",
      sex: "",
      birth_date: "",
      password: "",
      confirm_password: "",
      weight: "",
    });
  };

  const addNewWeight = () => {
    axios
      .post("/api/body_measurement", {
        user_id: user.user_id,
        weight: uservalues.weight,
      })
      .then((response) => {
        const newWeight = Number(response.data.weight); // Convert to number
        const updatedUser = { ...user, weight: newWeight };
        setUser(updatedUser);
      })
      .catch((error) => {
        // Handle any errors that might occur during the POST request
        console.error("Error adding new weight:", error);
      });
  };

  const updateUserInfo = () => {
    if (image_url === "") {
      // If there's a new image_url, update it in the user state
      setImage_url(user.image_url);
    }

    // Update uservalues with default values if they're empty
    uservalues.name = uservalues.name || users.name;
    uservalues.sex = uservalues.sex || users.sex;
    uservalues.birth_date = uservalues.birth_date || users.birth_date;
    uservalues.username = uservalues.username || users.username;

    // Make a PATCH request to update user information on the server
    axios
      .patch(`/api/users/${user.user_id}`, {
        username: uservalues.username,
        name: uservalues.name,
        sex: uservalues.sex,
        birth_date: uservalues.birth_date,
        image_url: image_url,
      })
      .then((response) => setUser(response.data));
  };
  const updatePassword = () => {
    if (uservalues.password === uservalues.confirm_password) {
      axios.patch(`/api/user/password`, {
        user_id: user.user_id,
        password: uservalues.password,
      });
      // .then((response) => console.log(response.data));
    } else {
      setPasswordError(true);
    }
  };

  function calculateAge(birthdate) {
    const birthDateObj = new Date(birthdate);
    const currentDate = new Date();

    // Get the difference in milliseconds between the current date and birthdate
    let ageInMillis = currentDate - birthDateObj;

    // Convert milliseconds to years
    const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25;
    let ageInYears = ageInMillis / millisecondsInYear;

    // Round down to get the integer age
    ageInYears = Math.floor(ageInYears);

    return ageInYears;
  }

  return (
    <div className="user">
      <div className="user-div">
        {!weight && !password && !update ? (
          <div className="userAlign">
            <img
              className="userImg"
              src={user.image_url || "/default_image.png"}
              alt="user image"
            />
            <div className="userUltraAlign">
              <div className="userUltraAlign">
                <span style={{ fontWeight: "bold" }}>{user.name}</span>
                <div className="userInfoDiv">
                  <span className="weightSpan">
                    Weight <strong>{user.weight} </strong>
                  </span>
                  <span className="ageSpan">
                    Age
                    <strong>{calculateAge(user.birth_date.slice(0, 9))}</strong>
                  </span>
                </div>
              </div>
              <div className="iconDiv">
                <div className="ageSpan">
                  <BiIcons.BiEditAlt
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setUpdate(true);
                    }}
                  />
                  <span className="iconText"> Edit Information</span>
                </div>
                <div className="weightIconDiv">
                  <FaIcons.FaWeight
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setWeight(true);
                    }}
                  />
                  <span className="iconText"> Add new Weight </span>
                </div>
                <div className="ageSpan">
                  <RiIcons.RiLockPasswordFill
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setPassword(true);
                    }}
                  />
                  <span className="iconText"> Change Password </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {update && (
          <form className="userDiv" onSubmit={handleSubmit}>
            <div className="userInfo">
              <span className="exitSpan" onClick={() => setUpdate(false)}>
                X
              </span>
              <h3>Update Information</h3>
              <label className="userLabels">Name:</label>
              <input
                onChange={handleNameInputChange}
                value={uservalues.name}
                className="name-span"
                type="text"
                placeholder="Name"
                name="name"
              />
              <label className="userLabels">Username:</label>
              <input
                onChange={handleUserNameInputChange}
                value={uservalues.username}
                className="username-span"
                type="text"
                placeholder="Username"
                name="username"
              />
              <label className="userLabels">Sex: </label>
              <input
                onChange={handleSexInputChange}
                value={uservalues.sex}
                className="sex-span"
                type="text"
                placeholder="Sex"
                name="sex"
              />
              <label className="userLabels">Birth Date:</label>
              <input
                onChange={handleBirthDateInputChange}
                value={uservalues.birth_date}
                className="birthdate-span"
                type="date"
                placeholder="Birth Date"
                name="birthdate"
              />
              <DropboxApp image_url={image_url} setImage_url={setImage_url} />
              <button
                onClick={() => updateUserInfo()}
                className="addWorkoutButton"
                type="submit"
              >
                Update User
              </button>
            </div>
          </form>
        )}

        {password && (
          <form className="userDiv" onSubmit={handleSubmit}>
            <div className="userInfo">
              <span className="exitSpan" onClick={() => setPassword(false)}>
                X
              </span>
              <h3>Update Password</h3>
              {passwordError ? <span>Passowrds do not match!</span> : null}
              <label className="userLabels">Password:</label>
              <input
                onChange={handlePasswordInputChange}
                value={uservalues.password}
                className="password-span"
                type="password"
                placeholder="Password"
                name="password"
                required
              />
              <label className="userLabels">Confirm Password: </label>
              <input
                onChange={handleConfirmPasswordInputChange}
                value={uservalues.confirm_password}
                className="password-span2"
                type="password"
                placeholder="Confirm Password"
                name="password2"
                required
              />
              <button
                onClick={() => updatePassword()}
                className="addWorkoutButton"
                type="submit"
              >
                Change Password
              </button>
            </div>
          </form>
        )}

        {weight && (
          <form className="userDiv" onSubmit={handleSubmit}>
            <div className="userInfo">
              <span className="exitSpan" onClick={() => setWeight(false)}>
                X
              </span>
              <h3>New Weight!</h3>
              <label className="userLabels">Weight:</label>
              <input
                onChange={handleWeightInputChange}
                value={uservalues.weight}
                className="weight-span"
                type="number"
                placeholder="Weight"
                name="weight"
                required
              />

              <button
                onClick={() => addNewWeight()}
                className="addWorkoutButton"
                type="submit"
              >
                Add new weight
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default User;
