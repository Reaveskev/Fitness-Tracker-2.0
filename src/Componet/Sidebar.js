import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { SidebarData } from "./SidebarData";
import "../Styles/Sidebar.css";
import { IconContext } from "react-icons";
import logo from "./Picture/logo.png";
import { useAuth } from "./Auth";

function Sidebar() {
  const [sidebar, setSidebar] = useState(false);
  const auth = useAuth();
  const showSidebar = () => {
    setSidebar(!sidebar);
  };

  return (
    <>
      <IconContext.Provider value={{ color: "#fff" }}>
        <div className="sidebar">
          <div className="logoDiv">
            <img src={logo} className="logo"></img>
          </div>
          <Link to="#" className="menu-bars">
            <FaIcons.FaBars onClick={showSidebar} />
          </Link>
        </div>
        <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
          <ul className="van-menu-items" onClick={showSidebar}>
            <li className="navbar-toggle">
              <Link to="#" className="menu-bars">
                <AiIcons.AiOutlineClose />
              </Link>
            </li>
            {!auth.user && <nav to="/" className="Testinglogin"></nav>}
            {SidebarData.map((item, index) => {
              return (
                <li key={index} className={item.className}>
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default Sidebar;
