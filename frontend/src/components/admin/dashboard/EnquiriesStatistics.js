"use client";

import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";

const UsersStatisticsChart = () => {
  const [usersStats, setUsersStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = MainConfig.API_BASE_URL;

  useEffect(() => {
    const fetchUsersStats = async () => {
      try {
        const token = localStorage.getItem("curtishCleanAuthToken");
        const clinic_id = localStorage.getItem("UserID");
        if (!token || !clinic_id) return;

        const res = await axios.post(
          `${API_BASE_URL}/admindashboardData`,
          { clinic_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data?.data;

        if (data?.usersStats?.length > 0) {
          setUsersStats(data.usersStats);
        } else {
          setUsersStats([]);
        }
      } catch (error) {
        console.error("Error fetching users stats:", error);
        toast.error("Failed to load users statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchUsersStats();
  }, []);

  if (loading || usersStats.length === 0) {
    return null;
  }

  // Prepare chart data
  const months = usersStats.map((m) => m.month);

  const adminData = usersStats.map(
    (m) => m.roles.find((r) => r.roleName === "Admin")?.count || 0
  );
  const staffData = usersStats.map(
    (m) => m.roles.find((r) => r.roleName === "Staff")?.count || 0
  );
  const clientData = usersStats.map(
    (m) => m.roles.find((r) => r.roleName === "Client")?.count || 0
  );

  const options = {
    chart: {
      type: "bar",
      stacked: false,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 2,
        columnWidth: "75%",
      },
    },
    dataLabels: { enabled: false },
    xaxis: { categories: months },
    yaxis: { title: { text: "Users Count" } },
    colors: ["#f87171", "#60a5fa", "#34d399"], // Admin, Staff, Client
    legend: { position: "top" },
    grid: { borderColor: "#f1f1f1" },
  };

  const series = [
    { name: "Clinic", data: adminData },
    { name: "Staff", data: staffData },
    { name: "Client", data: clientData },
  ];

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <Chart options={options} series={series} type="bar" height={350} />
      </div>
    </div>
  );
};

export default UsersStatisticsChart;
