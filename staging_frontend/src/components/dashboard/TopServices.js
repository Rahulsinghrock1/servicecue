"use client";

import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";

const TopServices = () => {
  const [topServices, setTopServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const API_BASE_URL = MainConfig.API_BASE_URL;

  useEffect(() => {
    const fetchTopServices = async () => {
      try {
        const token = localStorage.getItem("curtishCleanAuthToken");
        const clinic_id = localStorage.getItem("UserID");

        if (!token || !clinic_id) return;

        const res = await axios.post(
          `${API_BASE_URL}/dashboardData`,
          { clinic_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data?.data;
        if (data?.topServices?.length > 0) {
          setTopServices(data.topServices);
          const total = data.topServices.reduce((acc, s) => acc + s.count, 0);
          setTotalCount(total);
        } else {
          setTopServices([]);
        }
      } catch (error) {
        console.error("Error fetching top services:", error);
        toast.error("Failed to load top services");
      } finally {
        setLoading(false);
      }
    };

    fetchTopServices();
  }, []);

  const labels = topServices.map((s) => s.service_name);
  const series = topServices.map((s) => s.count);

  const options = {
    chart: { type: "donut" },
    labels: labels,
    legend: {
      position: "bottom",
      markers: { radius: 6 },
    },
    colors: ["#60a5fa", "#a855f7", "#6366f1", "#f97316", "#10b981"],
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "16px",
              color: "#6b7280",
              formatter: () => totalCount || 0,
            },
          },
        },
      },
    },
    dataLabels: { enabled: true },
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body text-center">
        <h5 className="text-secondary mb-3">Top Services</h5>

        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : topServices.length === 0 ? (
          <p className="text-muted">No data found</p>
        ) : (
          <Chart options={options} series={series} type="donut" height={280} />
        )}
      </div>
    </div>
  );
};

export default TopServices;
