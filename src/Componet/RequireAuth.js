import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./Auth";
import jwt from "jsonwebtoken";

export const RequireAuth = ({ children }) => {
  const { user, setUser } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const decodedToken = jwt.decode(token);

    // Check if the page was refreshed
    if (
      window.performance.navigation.type === 1 &&
      token &&
      decodedToken &&
      decodedToken.user
    ) {
      setUser(decodedToken.user);
    }
  }, []);

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};

//If login is not authorized Navigate them back to login page, not allowing them to go to any of the other pages.
