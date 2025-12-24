"use client";

import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";

const RetentionCharts = () => {
  const [retentionRate, setRetentionRate] = useState(0);
  const [retentionTrend, setRetentionTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = MainConfig.API_BASE_URL;

  useEffect(() => {
    const fetchRetentionData = async () => {
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

        if (data?.clientRetention) {
          setRetentionRate(data.clientRetention.overallRetentionRate || 0);
          setRetentionTrend(data.clientRetention.monthlyRetentionTrend || []);
        } else {
          setRetentionRate(0);
          setRetentionTrend([]);
        }
      } catch (error) {
        console.error("Error fetching client retention:", error);
        toast.error("Failed to load retention data");
      } finally {
        setLoading(false);
      }
    };

    fetchRetentionData();
  }, []);

  // Hide if loading or no trend data
  if (loading || retentionTrend.length === 0) {
    return null;
  }

  // Extract months and values dynamically
  const months = retentionTrend.map((m) => m.month);
  const values = retentionTrend.map((m) => m.retentionRate);

  // 🔹 Gauge Chart
  const gaugeOptions = {
    chart: { type: "radialBar" },
    plotOptions: {
      radialBar: {
        hollow: { size: "70%" },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "28px",
            fontWeight: 600,
            color: "#111",
            offsetY: 6,
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    colors: ["#bd2754"],
  };
  const gaugeSeries = [retentionRate || 0];

  // 🔹 Line Trend Chart
  const trendOptions = {
    chart: { type: "line", toolbar: { show: false } },
    stroke: { curve: "smooth", width: 3 },
    xaxis: {
      categories: months,
      labels: { style: { colors: "#6B7280" } },
    },
    yaxis: {
      labels: { formatter: (val) => `${val}%`, style: { colors: "#6B7280" } },
      min: 0,
      max: 100,
    },
    grid: { borderColor: "#E5E7EB" },
    colors: ["#bd2754"],
    tooltip: { y: { formatter: (val) => `${val}%` } },
  };

  const trendSeries = [
    {
      name: "Retention Rate",
      data: values,
    },
  ];

  return (
    <div className="row g-4">
      <div className="col-md-3">
        <div className="card shadow-sm border-0">
          <div className="card-body text-center">
            <h5 className="card-title mb-3 text-secondary">
              Overall Retention Rate
            </h5>
            <Chart
              options={gaugeOptions}
              series={gaugeSeries}
              type="radialBar"
              height={280}
            />
          </div>
        </div>
      </div>

      <div className="col-md-9">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h5 className="card-title mb-3 text-secondary">
              Retention Trend
            </h5>
            <Chart
              options={trendOptions}
              series={trendSeries}
              type="line"
              height={280}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetentionCharts;
