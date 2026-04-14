import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "../Styles/WeightGraph.css";
import { useAuth } from "../Componet/Auth";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Title,
  Tooltip,
);

const WeightGraph = ({ userweight }) => {
  const { user } = useAuth();

  // const options = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   plugins: {
  //     legend: {
  //       position: "top",
  //     },
  //     title: {
  //       display: true,
  //       text: `${user.username}'s Weight change`,
  //     },
  //   },
  //   y: {
  //     min:
  //       Math.min(
  //         ...Array.from(userweight).map((element) => parseInt(element.weight)),
  //       ) - 25,
  //     max:
  //       Math.max(
  //         ...Array.from(userweight).map((element) => parseInt(element.weight)),
  //       ) + 25,
  //   },
  // };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#f9fafb",
        },
      },
      title: {
        display: true,
        text: `${user.username}'s Weight change`,
        color: "#f9fafb",
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#cbd5e1",
        },
        grid: {
          color: "rgba(255,255,255,0.08)",
        },
      },
      y: {
        ticks: {
          color: "#cbd5e1",
        },
        grid: {
          color: "rgba(255,255,255,0.08)",
        },
        min:
          Math.min(
            ...Array.from(userweight).map((element) =>
              parseInt(element.weight),
            ),
          ) - 25,
        max:
          Math.max(
            ...Array.from(userweight).map((element) =>
              parseInt(element.weight),
            ),
          ) + 25,
      },
    },
  };

  const data = {
    labels: Array.from(userweight).map((element) =>
      element.recorded_at.slice(0, 10),
    ),
    datasets: [
      {
        label: user.username,
        data: Array.from(userweight).map((element) => parseInt(element.weight)),
        borderColor: "#d4c08a",
        backgroundColor: "rgba(212, 192, 138, 0.2)",
      },
    ],
  };

  return (
    <div className="graph">
      <Line data={data} options={options} />
    </div>
  );
};

export default WeightGraph;
