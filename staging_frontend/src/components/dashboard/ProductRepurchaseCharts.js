"use client";

import { useEffect, useState } from "react";
import React from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";

const ProductRepurchaseCharts = () => {
  const [repurchaseRate, setRepurchaseRate] = useState(0);
  const [repurchaseTrend, setRepurchaseTrend] = useState([]);
  const [missedOpportunity, setMissedOpportunity] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = MainConfig.API_BASE_URL;

  useEffect(() => {
    const fetchDashboardData = async () => {
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
        if (data) {
          // ✅ Repurchase Rate
          if (data.RepurchaseRate) {
            setRepurchaseRate(data.RepurchaseRate.overallRepurchaseRate || 0);

            const apiTrend = data.RepurchaseRate.monthlyRepurchaseTrend || [];
            const monthOrder = [
              "Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            ];

            const normalizedTrend = monthOrder.map((month) => {
              const found = apiTrend.find((m) => m.month === month);
              return { month, repurchaseCount: found ? found.repurchaseCount : 0 };
            });

            setRepurchaseTrend(normalizedTrend);
          }

          // ✅ Missed Opportunity Chart
          if (data.missedOpportunityChart) {
            const apiMissed = data.missedOpportunityChart || [];
            const monthOrder = [
              "Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            ];

            const normalizedMissed = monthOrder.map((month) => {
              const found = apiMissed.find((m) => m.month === month);
              return {
                month,
                expedited: found ? found.loss : 0,
                actual: found ? found.profit : 0,
              };
            });

            setMissedOpportunity(normalizedMissed);
          }

          // ✅ Leaderboard Data
          if (Array.isArray(data.leaderboardData)) {
            // Sort by RebookRate descending
            const sorted = [...data.leaderboardData].sort(
              (a, b) => b.rebookRate - a.rebookRate
            );
            setLeaderboard(sorted);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return null;

  // =============================
  // 📈 Repurchase Trend (Line Chart)
  // =============================
  const months = repurchaseTrend.map((m) => m.month);
  const repurchaseCounts = repurchaseTrend.map((m) => m.repurchaseCount);

  const trendOptions = {
    chart: { type: "line", toolbar: { show: false } },
    stroke: { curve: "smooth", width: 3 },
    xaxis: { categories: months, labels: { style: { colors: "#6B7280" } } },
    yaxis: {
      title: { text: "No. of Repurchases" },
      labels: { style: { colors: "#6B7280" } },
      min: 0,
    },
    grid: { borderColor: "#E5E7EB" },
    colors: ["#2563eb"],
    tooltip: { y: { formatter: (val) => `${val}` } },
  };
  const trendSeries = [{ name: "Repurchases", data: repurchaseCounts }];

  // =============================
  // 💹 Missed Opportunity (Area Chart)
  // =============================
  const missedMonths = missedOpportunity.map((m) => m.month);
  const actualData = missedOpportunity.map((m) => m.actual);
  const expeditedData = missedOpportunity.map((m) => m.expedited);

  const timingOptions = {
    chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: "smooth", width: 3 },
    markers: { size: 5 },
    dataLabels: { enabled: false },
    colors: ["#f59e0b", "#16a34a"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    grid: { borderColor: "#e7e7e7", strokeDashArray: 5 },
    xaxis: { categories: missedMonths, title: { text: "Month" } },
    yaxis: {
      title: { text: "Value ($)" },
      labels: { formatter: (val) => `$${val}` },
    },
    legend: { position: "top", horizontalAlign: "right" },
    tooltip: { y: { formatter: (val) => `$${val.toLocaleString()}` } },
  };
  const timingSeries = [
    { name: "Expected", data: expeditedData },
    { name: "Actual", data: actualData },
  ];

  // =============================
  // 🟢 Overall Repurchase Rate (Radial)
  // =============================
  const rateOptions = {
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
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    colors: ["#16a34a"],
  };
  const rateSeries = [repurchaseRate || 0];

  // =============================
  // 🏆 Leaderboard Chart (Horizontal Bar)
  // =============================
  const staffNames =
    leaderboard.length > 0
      ? leaderboard.map(
          (s, i) => `${i + 1}. ${s.staff_name || "Unknown"}`
        )
      : ["No Data"];
  const completionRate = leaderboard.map((s) => s.completionRate || 0);
  const rebookRate = leaderboard.map((s) => s.rebookRate || 0);

  const leaderboardOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      height: Math.max(300, leaderboard.length * 80),
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        barHeight: "50%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}%`,
      style: { fontSize: "13px", fontWeight: 600, colors: ["#000"] },
    },
    xaxis: {
      categories: staffNames,
      title: {
        text: "Performance (%)",
        style: { fontSize: "14px", fontWeight: 600, color: "#000" },
      },
      labels: {
        formatter: (val) => `${val}%`,
        style: { fontSize: "12px", colors: "#444" },
      },
      min: 0,
      max: 100,
    },
    yaxis: {
      title: {
        text: "Professionals",
        style: { fontSize: "14px", fontWeight: 600, color: "#000" },
      },
      labels: { style: { fontSize: "13px", colors: "#333" } },
    },
    colors: ["#3b82f6", "#10b981"],
    legend: {
      position: "top",
      horizontalAlign: "center",
      labels: { colors: "#333" },
    },
    title: {
      text: "🏆 Leaderboard Performance Overview",
      align: "left",
      style: { fontSize: "16px", fontWeight: "bold" },
    },
    tooltip: { y: { formatter: (val) => `${val}%` } },
    grid: { borderColor: "#f1f1f1", strokeDashArray: 4 },
  };
  const leaderboardSeries = [
    { name: "Completion Rate", data: completionRate },
    { name: "Rebook Rate", data: rebookRate },
  ];

  // =============================
  // 📊 Render UI
  // =============================
  return (
    <>
      <div className="row g-4">
        {/* 🟢 Overall Repurchase Rate */}
        <div className="col-md-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="text-secondary mb-3">Overall Repurchase Rate</h5>
              <Chart
                options={rateOptions}
                series={rateSeries}
                type="radialBar"
                height={280}
              />
            </div>
          </div>
        </div>

        {/* 📈 Repurchase Trend */}
        <div className="col-md-9">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="text-secondary mb-3">Repurchase Trend</h5>
              <Chart
                options={trendOptions}
                series={trendSeries}
                type="line"
                height={280}
              />
            </div>
          </div>
        </div>

        {/* 💹 Missed Opportunity */}
        <div className="col-md-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="text-secondary mb-3">💹 Missed Opportunity Value</h5>
              <Chart
                options={timingOptions}
                series={timingSeries}
                type="area"
                height={320}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 Leaderboard Chart */}
      <div className="row">
        <div className="col-md-12 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              {leaderboard.length > 0 ? (
                <Chart
                  options={leaderboardOptions}
                  series={leaderboardSeries}
                  type="bar"
                  height={Math.max(300, leaderboard.length * 80)}
                />
              ) : (
                <p className="text-center text-muted py-4">
                  No leaderboard data available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductRepurchaseCharts;
