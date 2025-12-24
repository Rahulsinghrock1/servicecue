"use client";

import { useEffect, useState } from "react";
import React from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";

const ProductRepurchaseCharts = () => {
  const [subscriptionStats, setSubscriptionStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = MainConfig.API_BASE_URL;

  useEffect(() => {
    const fetchDashboardData = async () => {
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
        if (data && Array.isArray(data.subscriptionStats)) {
          setSubscriptionStats(data.subscriptionStats);
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
  // 💳 Subscription Stats (Plan Wise)
  // =============================
  const months = subscriptionStats.map((m) => m.month);

  const getPlanData = (planName) =>
    subscriptionStats.map((m) => {
      const plan = m.plans.find((p) => p.planName === planName);
      return plan ? plan.count : 0;
    });

  const soloData = getPlanData("Solo Plan");
  const silverData = getPlanData("Silver Plan");
  const goldData = getPlanData("Gold Plan");

  const planPrices = {
    "Solo Plan":
      subscriptionStats[0]?.plans.find((p) => p.planName === "Solo Plan")
        ?.planPrice || 0,
    "Silver Plan":
      subscriptionStats[0]?.plans.find((p) => p.planName === "Silver Plan")
        ?.planPrice || 0,
    "Gold Plan":
      subscriptionStats[0]?.plans.find((p) => p.planName === "Gold Plan")
        ?.planPrice || 0,
  };

  // ✅ Keep all plans (even if count = 0)
  const planSeries = [
    { name: "Solo Plan", data: soloData },
    { name: "Silver Plan", data: silverData },
    { name: "Gold Plan", data: goldData },
  ];

  // ✅ Chart Configuration
  const planOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: { curve: "smooth", width: 3 },
    markers: { size: 4 },
    dataLabels: { enabled: false },
    colors: ["#22c55e", "#3b82f6", "#f59e0b"], // green, blue, gold
    grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
    xaxis: {
      categories: months,
      title: { text: "Month" },
      labels: { style: { colors: "#6b7280" } },
    },
    yaxis: {
      title: { text: "Subscriptions (Count)" },
      labels: { style: { colors: "#6b7280" } },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (val, opts) {
          const planName =
            opts.seriesIndex === 0
              ? "Solo Plan"
              : opts.seriesIndex === 1
              ? "Silver Plan"
              : "Gold Plan";
          const price = planPrices[planName];
          if (val > 0) {
            const total = val * price;
            return `${val} ($${total})`;
          } else {
            return `${val}`;
          }
        },
      },
    },
    legend: { position: "top", horizontalAlign: "center" },
  };

  // =============================
  // 📊 Render UI
  // =============================
  return (
    <>
      <div className="row g-4">
        <div className="col-md-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="mb-3 fw-semibold">Subscription Sales by Plan</h5>
              <Chart
                options={planOptions}
                series={planSeries}
                type="line"
                height={350}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductRepurchaseCharts;
