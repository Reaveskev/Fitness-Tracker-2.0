import React, { useState } from "react";
import Johnny from "../Componet/Picture/Johnny.JPG";
import axios from "axios";
import { useAuth } from "../Componet/Auth";
import { useNavigate } from "react-router-dom";
import "../Styles/Login.css";
import logo from "../Componet/Picture/logo.png";

function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = (event) => {
    localStorage.clear();
    event.preventDefault(event);

    axios
      .post("/api/users/login", {
        username: uservalues.username,
        password: uservalues.password,
      })
      .then(function (response) {
        if (response.status === 200) {
          auth.login(response.data);

          navigate("/home");
          clearUser();
        } else {
          setErrorMessage(true);
          clearUser();
        }
      })
      .catch(function (error) {
        setErrorMessage(true);
        clearUser();
        console.log(error);
      });
  };

  // This sets a variable for each input.
  const [uservalues, SetValues] = useState({
    username: "",
    name: "",
    weight: "",
    sex: "",
    birthdate: "",
    password: "",
  });

  //This is a handler to allow each input to be updated.
  const handleUserNameInputChange = (event) => {
    SetValues({ ...uservalues, username: event.target.value });
  };

  const handleNameInputChange = (event) => {
    SetValues({ ...uservalues, name: event.target.value });
  };

  const handleWeightInputChange = (event) => {
    SetValues({ ...uservalues, weight: event.target.value });
  };

  const handleSexInputChange = (event) => {
    SetValues({ ...uservalues, sex: event.target.value });
  };

  const handleBirthdateInputChange = (event) => {
    SetValues({ ...uservalues, birthdate: event.target.value });
  };

  const handlePasswordInputChange = (event) => {
    SetValues({ ...uservalues, password: event.target.value });
  };

  // const currentDate = new Date();

  const clearUser = () => {
    SetValues({
      username: "",
      name: "",
      weight: "",
      sex: "",
      birthdate: "",
      password: "",
    });
  };

  const addUser = (event) => {
    event.preventDefault(event);

    axios
      .post("/api/users/create", {
        username: uservalues.username,
        name: uservalues.name,
        weight: uservalues.weight,
        sex: uservalues.sex,
        birth_date: uservalues.birthdate,
        password: uservalues.password,
      })
      .then(function (response) {
        if (response.status === 200) {
          auth.login(response.data);
          navigate("/home");
          clearUser();
        } else if (response.status === 409) {
          setErrorMessage(true);
          clearUser();
        }
      })
      .catch(function (error) {
        setErrorMessage(true);
        clearUser();
        console.log(error);
      });
  };

  ////////////
  return (
    <div className="login-container">
      {/* Hero picture */}
      <img className={`hero-image hide-on-mobile`} src={Johnny} />
      {/* If user doesnt click on create user show login */}
      {!showCreate ? (
        <>
          <div className="login-form">
            <img src={logo} alt="Fitness Tracker logo" className="auth-logo" />
            <p className="auth-subtitle">
              Track workouts, meals, and progress in one place.
            </p>
            <h2>Sign in here!</h2>
            {/* if username and password combination is inccorect show error message */}
            {errorMessage && (
              <p className="errorMessage"> Incorrect username or password.</p>
            )}
            <div className="login-div">
              <form onSubmit={handleLogin} className="login-div">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={uservalues.username}
                  onChange={handleUserNameInputChange}
                  className={errorMessage ? "input-error" : ""}
                  placeholder="Username"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={uservalues.password}
                  onChange={handlePasswordInputChange}
                  className={errorMessage ? "input-error" : ""}
                  required
                />
                <button type="submit">Log in</button>
              </form>
              <span
                onClick={() => {
                  setShowCreate(true);
                  SetValues({ ...uservalues, password: "", username: "" });
                  setErrorMessage(false);
                }}
                className="auth-switch"
              >
                Create Account
              </span>
            </div>
          </div>
        </>
      ) : (
        // Create user form
        <>
          <div className="form-container">
            <img src={logo} alt="Fitness Tracker logo" className="auth-logo" />
            <h2>Create an Account</h2>
            <p className="auth-helper">
              *All fields are required inorder to proceed.
            </p>
            {/* if username already exist */}
            {errorMessage && (
              <p className="errorMessage"> Username already exist.</p>
            )}
            <form className="login-div" onSubmit={addUser}>
              <div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={uservalues.username}
                  onChange={handleUserNameInputChange}
                  placeholder="Username"
                  className={errorMessage ? "input-error" : ""}
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={uservalues.name}
                  onChange={handleNameInputChange}
                  placeholder="Name"
                  className={errorMessage ? "input-error" : ""}
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  id="weigth"
                  name="weight"
                  value={uservalues.weight}
                  onChange={handleWeightInputChange}
                  className={errorMessage ? "input-error" : ""}
                  placeholder="Weight"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  id="sex"
                  name="sex"
                  value={uservalues.sex}
                  onChange={handleSexInputChange}
                  className={errorMessage ? "input-error" : ""}
                  placeholder="Sex"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="birthdate" className="form-label">
                  Birth Date
                </label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  value={uservalues.birthdate}
                  onChange={handleBirthdateInputChange}
                  className={errorMessage ? "input-error" : ""}
                  placeholder="birthdate"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={uservalues.password}
                  onChange={handlePasswordInputChange}
                  className={errorMessage ? "input-error" : ""}
                  placeholder="Password"
                  required
                />
              </div>
              <button type="submit">Create Account</button>
              <span
                className="auth-switch"
                onClick={() => {
                  setShowCreate(false);
                  SetValues({ ...uservalues, password: "", username: "" });
                  setErrorMessage(false);
                }}
                type="submit"
              >
                Login?
              </span>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default Login;
