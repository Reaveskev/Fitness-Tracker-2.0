import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Sidebar from "./Componet/Sidebar";
import Home from "./Pages/Home";
import Motivational from "./Pages/Motivational";
import Workouts from "./Pages/Workouts";
import User from "./Pages/User";
import { AuthProvider } from "./Componet/Auth";
import Login from "./Pages/Login";
import { RequireAuth } from "./Componet/RequireAuth";
import FoodDiary from "./Pages/FoodDiary";
import "./Styles/Global.css";

function AppContent() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/";

  return (
    <div className="main">
      {!hideSidebar && <Sidebar />}
      <Routes>
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/journal"
          element={
            <RequireAuth>
              <Workouts />
            </RequireAuth>
          }
        />
        <Route
          path="/food"
          element={
            <RequireAuth>
              <FoodDiary />
            </RequireAuth>
          }
        />
        <Route
          path="/quotes"
          element={
            <RequireAuth>
              <Motivational />
            </RequireAuth>
          }
        />
        <Route
          path="/user"
          element={
            <RequireAuth>
              <User />
            </RequireAuth>
          }
        />
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
