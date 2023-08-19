import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./Auth";

export const RequireAuth = ({ children }) => {
  const { user, setUser } = useAuth();

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};

//If login is not authorized Navigate them back to login page, not allowing them to go to any of the other pages.
