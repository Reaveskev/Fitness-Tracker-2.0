import React from "react";
import * as AiIcons from "react-icons/ai";
import * as VscIcons from "react-icons/vsc";
import * as GiIcons from "react-icons/gi";
import * as MdIcons from "react-icons/md";

export const SidebarData = [
  {
    title: "Home",
    path: "/home",
    icon: <AiIcons.AiFillHome />,
    className: "nav-text",
  },
  {
    title: "Workout Journal",
    path: "/journal",
    icon: <GiIcons.GiWeightLiftingUp />,
    className: "nav-text",
  },
  {
    title: "Food Journal",
    path: "/food",
    icon: <MdIcons.MdFoodBank />,
    className: "nav-text",
  },
  {
    title: "Sign out",
    path: "/",
    icon: <VscIcons.VscSignOut />,
    className: "nav-text",
  },
];
