import React, { useState, createContext, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [calories, setCalories] = useState(0);

  const login = (user) => {
    setUser(user);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, calories, setCalories }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

////////////////////////
//Uses Context hook to manage the users login and share it globally.
//Create Context is used to initialize context.
//Context Provider or .Provider is used to wrap the the componets that need the state context.
//User, Login, and Logout all have access to the AuthContext.
