import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./Componet/Sidebar";
import Home from "./Pages/Home";
import Motivational from "./Pages/Motivational";
import Workouts from "./Pages/Workouts";
import User from "./Pages/User";
import { AuthProvider } from "./Componet/Auth";
import Login from "./Pages/Login";
import { RequireAuth } from "./Componet/RequireAuth";
import FoodDiary from "./Pages/FoodDiary";

function App() {
  return (
    <div className="main">
      <AuthProvider>
        <Router>
          <Sidebar />
          <Routes>
            <Route
              path="/home"
              exact
              element={
                <RequireAuth>
                  <Home />{" "}
                </RequireAuth>
              }
            />
            <Route
              path="/journal"
              exact
              element={
                <RequireAuth>
                  <Workouts />{" "}
                </RequireAuth>
              }
            />
            <Route
              path="/food"
              exact
              element={
                <RequireAuth>
                  <FoodDiary />{" "}
                </RequireAuth>
              }
            />

            <Route
              path="/quotes"
              exact
              element={
                <RequireAuth>
                  <Motivational />{" "}
                </RequireAuth>
              }
            />
            <Route
              path="/user"
              exact
              element={
                <RequireAuth>
                  <User />{" "}
                </RequireAuth>
              }
            />

            <Route path="/" exact element={<Login />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
