"use client";

import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";

const TopClinics = () => {
  const [topClinics, setTopClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const API_BASE_URL = MainConfig.API_BASE_URL;

  useEffect(() => {
    const fetchTopClinics = async () => {
      try {
        const token = localStorage.getItem("curtishCleanAuthToken");
        const clinic_id = localStorage.getItem("UserID"); // if needed

        if (!token) return;

        const res = await axios.post(
          `${API_BASE_URL}/admindashboardData`,
          { clinic_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Correctly access topClinics inside data
        const data = res.data?.data?.topClinics;

        if (data?.length > 0) {
          setTopClinics(data);
          const total = data.reduce((acc, c) => acc + c.enquiry_count, 0);
          setTotalCount(total);
        } else {
          setTopClinics([]);
        }
      } catch (error) {
        console.error("Error fetching top clinics:", error);
        toast.error("Failed to load top clinics");
      } finally {
        setLoading(false);
      }
    };

    fetchTopClinics();
  }, []);

  const labels = topClinics.map((c) => c.clinic_name);
  const series = topClinics.map((c) => c.enquiry_count);

  const options = {
    chart: { type: "donut" },
    labels: labels,
    legend: { position: "bottom", markers: { radius: 6 } },
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
        <h5 className="text-secondary mb-3">Top Clinics</h5>

        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : topClinics.length === 0 ? (
          <p className="text-muted">No data found</p>
        ) : (
          <Chart options={options} series={series} type="donut" height={280} />
        )}
      </div>
    </div>
  );
};

export default TopClinics;
