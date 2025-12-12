"use client";

import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";

const EnquiriesStatistics = () => {
  const [enquiryStats, setEnquiryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEnquiries, setTotalEnquiries] = useState(0);
  const [pendingEnquiries, setPendingEnquiries] = useState(0);
  const [moveToClientsEnquiries, setMoveToClientsEnquiries] = useState(0);

  const API_BASE_URL = MainConfig.API_BASE_URL;

  useEffect(() => {
    const fetchEnquiryStats = async () => {
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

        if (data?.enquiryStats?.length > 0) {
          setEnquiryStats(data.enquiryStats);

          // ✅ Map summary cards correctly
          setTotalEnquiries(data.totalEnquiries || 0);
          setPendingEnquiries(data.pendingEnquiries || 0);
          setMoveToClientsEnquiries(data.activeEnquiries || 0); // moved to clients
        } else {
          setEnquiryStats([]);
          setTotalEnquiries(0);
          setPendingEnquiries(0);
          setMoveToClientsEnquiries(0);
        }
      } catch (error) {
        console.error("Error fetching enquiry stats:", error);
        toast.error("Failed to load enquiry statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiryStats();
  }, []);

  // Hide chart if no data
  if (loading || enquiryStats.length === 0) {
    return null;
  }

  // Chart data
  const categories = enquiryStats.map((s) => s.month);
  const pendingData = enquiryStats.map((s) => s.pending);
  const moveToClientsData = enquiryStats.map((s) => s.active); // moved to clients

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        columnWidth: "45%",
      },
    },
    dataLabels: { enabled: false },
    xaxis: { categories },
    yaxis: { title: { text: "Appointments" } },
    colors: ["#10b981", "#065f46"], // pending, move-to-clients
    legend: { position: "top" },
    grid: { borderColor: "#f1f1f1" },
  };

  const series = [
    { name: "Pending Enquiries", data: pendingData },
    { name: "Move to Clients", data: moveToClientsData },
  ];

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        {/* Summary Cards */}
        <div className="row mb-3">
          <div className="col-4">
            <div className="bg-light border p-2 text-center rounded-2">
              <div className="text-danger small">● All Enquiries</div>
              <h5 className="fw-bold mb-0">{totalEnquiries}</h5>
            </div>
          </div>
          <div className="col-4">
            <div className="bg-light border p-2 text-center rounded-2">
              <div className="text-success small">● Pending Enquiries</div>
              <h5 className="fw-bold mb-0">{pendingEnquiries}</h5>
            </div>
          </div>
          <div className="col-4">
            <div className="bg-light border p-2 text-center rounded-2">
              <div className="text-primary small">● Move to Clients</div>
              <h5 className="fw-bold mb-0">{moveToClientsEnquiries}</h5>
            </div>
          </div>
        </div>

        {/* Chart */}
        <Chart options={options} series={series} type="bar" height={300} />
      </div>
    </div>
  );
};

export default EnquiriesStatistics;
