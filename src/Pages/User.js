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

  const [mode, setMode] = useState("view");
  const [image_url, setImage_url] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [uservalues, setValues] = useState({
    username: "",
    name: "",
    sex: "",
    birth_date: "",
    password: "",
    confirm_password: "",
    weight: "",
  });

  const resetMessages = () => {
    setPasswordError(false);
    setSuccessMessage("");
  };

  const resetForm = () => {
    setValues({
      username: "",
      name: "",
      sex: "",
      birth_date: "",
      password: "",
      confirm_password: "",
      weight: "",
    });
  };

  const switchMode = (nextMode) => {
    resetMessages();
    resetForm();
    setMode(nextMode);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    resetMessages();
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const addNewWeight = async () => {
    try {
      const response = await axios.post("/api/body_measurement", {
        user_id: user.user_id,
        weight: Number(uservalues.weight),
      });

      const newWeight = Number(response.data.weight);
      const updatedUser = { ...user, weight: newWeight };
      setUser(updatedUser);
      setSuccessMessage("Weight updated successfully.");
      resetForm();
    } catch (error) {
      console.error("Error adding new weight:", error);
    }
  };

  const updateUserInfo = async () => {
    try {
      const payload = {
        username: uservalues.username || user.username,
        name: uservalues.name || user.name,
        sex: uservalues.sex || user.sex,
        birth_date: uservalues.birth_date || user.birth_date,
        image_url: image_url || user.image_url,
      };

      const response = await axios.patch(`/api/users/${user.user_id}`, payload);
      setUser(response.data);
      setSuccessMessage("Profile updated successfully.");
      resetForm();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const updatePassword = async () => {
    if (uservalues.password !== uservalues.confirm_password) {
      setPasswordError(true);
      return;
    }

    try {
      await axios.patch(`/api/user/password`, {
        user_id: user.user_id,
        password: uservalues.password,
      });

      setSuccessMessage("Password updated successfully.");
      resetForm();
      setPasswordError(false);
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  const calculateAge = (birthdate) => {
    const birthDateObj = new Date(birthdate);
    const currentDate = new Date();

    let ageInMillis = currentDate - birthDateObj;
    const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25;
    let ageInYears = ageInMillis / millisecondsInYear;

    return Math.floor(ageInYears);
  };

  const renderProfileView = () => {
    return (
      <div className="userCard">
        <div className="userTop">
          <img
            className="userImg"
            src={user.image_url || "/default_image.png"}
            alt="user profile"
          />

          <div className="userIdentity">
            <h3 className="userName">{user.name || user.username}</h3>
            <p className="userSubtext">@{user.username}</p>

            <div className="userStats">
              <div className="userStat">
                <span className="userStatLabel">Weight</span>
                <span className="userStatValue">{user.weight} lbs</span>
              </div>

              <div className="userStat">
                <span className="userStatLabel">Age</span>
                <span className="userStatValue">
                  {calculateAge(user.birth_date.slice(0, 10))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="userActions">
          <button
            type="button"
            className="userActionBtn"
            onClick={() => switchMode("edit")}
          >
            <BiIcons.BiEditAlt />
            <span>Edit Info</span>
          </button>

          <button
            type="button"
            className="userActionBtn"
            onClick={() => switchMode("weight")}
          >
            <FaIcons.FaWeight />
            <span>Add Weight</span>
          </button>

          <button
            type="button"
            className="userActionBtn"
            onClick={() => switchMode("password")}
          >
            <RiIcons.RiLockPasswordFill />
            <span>Password</span>
          </button>
        </div>
      </div>
    );
  };

  const renderEditForm = () => {
    return (
      <form className="userPanel" onSubmit={handleSubmit}>
        <div className="userPanelHeader">
          <h3>Edit Profile</h3>
          <button
            type="button"
            className="panelCloseBtn"
            onClick={() => switchMode("view")}
          >
            Close
          </button>
        </div>

        {successMessage ? (
          <span className="userSuccess">{successMessage}</span>
        ) : null}

        <div className="userField">
          <label>Name</label>
          <input
            onChange={handleChange}
            value={uservalues.name}
            type="text"
            placeholder={user.name || "Name"}
            name="name"
          />
        </div>

        <div className="userField">
          <label>Username</label>
          <input
            onChange={handleChange}
            value={uservalues.username}
            type="text"
            placeholder={user.username || "Username"}
            name="username"
          />
        </div>

        <div className="userField">
          <label>Sex</label>
          <input
            onChange={handleChange}
            value={uservalues.sex}
            type="text"
            placeholder={user.sex || "Sex"}
            name="sex"
          />
        </div>

        <div className="userField">
          <label>Birth Date</label>
          <input
            onChange={handleChange}
            value={uservalues.birth_date}
            type="date"
            name="birth_date"
          />
        </div>

        <div className="userField">
          <label>Profile Image</label>
          <DropboxApp image_url={image_url} setImage_url={setImage_url} />
        </div>

        <button
          type="button"
          className="userPrimaryBtn"
          onClick={updateUserInfo}
        >
          Save Changes
        </button>
      </form>
    );
  };

  const renderPasswordForm = () => {
    return (
      <form className="userPanel" onSubmit={handleSubmit}>
        <div className="userPanelHeader">
          <h3>Change Password</h3>
          <button
            type="button"
            className="panelCloseBtn"
            onClick={() => switchMode("view")}
          >
            Close
          </button>
        </div>

        {successMessage ? (
          <span className="userSuccess">{successMessage}</span>
        ) : null}

        {passwordError ? (
          <span className="userError">Passwords do not match.</span>
        ) : null}

        <div className="userField">
          <label>New Password</label>
          <input
            onChange={handleChange}
            value={uservalues.password}
            type="password"
            placeholder="Password"
            name="password"
            required
          />
        </div>

        <div className="userField">
          <label>Confirm Password</label>
          <input
            onChange={handleChange}
            value={uservalues.confirm_password}
            type="password"
            placeholder="Confirm Password"
            name="confirm_password"
            required
          />
        </div>

        <button
          type="button"
          className="userPrimaryBtn"
          onClick={updatePassword}
        >
          Update Password
        </button>
      </form>
    );
  };

  const renderWeightForm = () => {
    return (
      <form className="userPanel" onSubmit={handleSubmit}>
        <div className="userPanelHeader">
          <h3>Log New Weight</h3>
          <button
            type="button"
            className="panelCloseBtn"
            onClick={() => switchMode("view")}
          >
            Close
          </button>
        </div>

        {successMessage ? (
          <span className="userSuccess">{successMessage}</span>
        ) : null}

        <div className="userField">
          <label>Weight</label>
          <input
            onChange={handleChange}
            value={uservalues.weight}
            type="number"
            placeholder="Weight"
            name="weight"
            required
          />
        </div>

        <button type="button" className="userPrimaryBtn" onClick={addNewWeight}>
          Save Weight
        </button>
      </form>
    );
  };

  return (
    <div className="user">
      {mode === "view" && renderProfileView()}
      {mode === "edit" && renderEditForm()}
      {mode === "password" && renderPasswordForm()}
      {mode === "weight" && renderWeightForm()}
    </div>
  );
}

export default User;
