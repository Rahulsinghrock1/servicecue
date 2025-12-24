"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import { TiThMenu } from "react-icons/ti";
import Link from "next/link";
import dynamic from "next/dynamic";

const ProductRepurchaseCharts = dynamic(
  () => import("@/components/admin/dashboard/SubscriptionPurchaseCharts"),
  { ssr: false }
);
const EnquiriesStatistics = dynamic(
  () => import("@/components/admin/dashboard/EnquiriesStatistics"),
  { ssr: false }
);
const TopServices = dynamic(() => import("@/components/admin/dashboard/TopServices"), { ssr: false });

export default function Dashboard() {
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const tokenRef = useRef(null);
  const clinicIdRef = useRef(null);

  // ---- Dashboard KPI States ----
  const [counts, setCounts] = useState({
    totalEnquiries: 0,
    totalClients: 0,
    totalProduct: 0,
    totalStaff: 0,
    retentionRate: 0,
  });

  // ---- Enquiry + Product States ----
  const [enquiries, setEnquiries] = useState([]); // used by "Recent Clinic" table
  const [products, setProducts] = useState([]);   // used by "Recent User" table
  const [loading, setLoading] = useState(true);

  // Enquiry list UI states
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null); // selected for delete
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [topStaff, setTopStaff] = useState([]);

  const dropdownRef = useRef(null);

  // Load token & clinic id once
  useEffect(() => {
    tokenRef.current = localStorage.getItem("curtishCleanAuthToken");
    clinicIdRef.current = localStorage.getItem("UserID");
  }, []);

  // -------------------------
  // Fetching functions
  // -------------------------
  const fetchDashboardData = async () => {
    try {
      const token = tokenRef.current;
      const clinic_id = clinicIdRef.current;
      if (!token || !clinic_id) return;

      const res = await axios.post(
        `${API_BASE_URL}/admindashboardData`,
        { clinic_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data?.data || {};
      setCounts({
        totalStaff: data.totalStaff || 0,
        totalClients: data.totalClients || 0,
        retentionRate: data.retentionRate || 84,
        totalEnquiries: data.totalEnquiries || 0,
        totalProduct: data.totalProducts || 0,
      });

      setTopStaff(data.uniqueTopStaff || []);
      // dashboard endpoint also provides latest lists — prefer these if available
      if (data.latestClinics) setEnquiries(data.latestClinics || []);
      if (data.latestUsers) setProducts(data.latestUsers || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  // fetchEnquiries - hits Clinic/enquiries endpoint (keeps original behavior)
  const fetchEnquiries = async () => {
    try {
      const token = tokenRef.current;
      const clinic_id = clinicIdRef.current;
      if (!clinic_id) return;

      const response = await axios.post(
        `${API_BASE_URL}/Clinic/enquiries`,
        { clinic_id },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      const data = response.data?.data || [];
      // If backend returns actual enquiries list, use it; otherwise keep whatever admindashboardData provided
      if (Array.isArray(data) && data.length) setEnquiries(data);
      // also reflect count in KPIs if dashboards didn't give it
      setCounts((prev) => ({ ...prev, totalEnquiries: prev.totalEnquiries || data.length }));
    } catch (error) {
      console.error("Failed to fetch enquiries", error);
      // don't toast aggressively to avoid spamming on every refresh
    }
  };

  // fetchProducts - hits getProducts endpoint (keeps original behavior)
  const fetchProducts = async () => {
    try {
      const token = tokenRef.current;
      const clinic_id = clinicIdRef.current;
      if (!clinic_id) return;

      const response = await axios.post(
        `${API_BASE_URL}/getProducts`,
        { clinic_id, limit: 5 },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      const data = response.data?.data || [];
      if (Array.isArray(data) && data.length) setProducts(data);
      setCounts((prev) => ({ ...prev, totalProduct: prev.totalProduct || data.length }));
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  // Initial load
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDashboardData(), fetchEnquiries(), fetchProducts()])
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // Enquiry list actions
  // -------------------------
  const toggleDropdown = (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setDropdownOpen((prev) => (prev === id ? null : id));
  };

  const handleDelete = (row, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setSelectedRow(row);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRow) return;
    try {
      const token = tokenRef.current;
      await axios.delete(
        `${API_BASE_URL}/Clinic/enquiries/delete/${selectedRow.id}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      toast.success("Deleted successfully!");
      setEnquiries((prev) => prev.filter((u) => u.id !== selectedRow.id));
      setSelectedRow(null);
    } catch (error) {
      toast.error("Failed to delete enquiry");
      console.error(error);
    }
  };

  const handleProductConfirmDelete = async () => {
    if (!selectedRow) return;
    try {
      const token = localStorage.getItem("curtishCleanAuthToken");
      await axios.delete(`${API_BASE_URL}/products/${selectedRow.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Product deleted successfully!");
      setProducts((prev) => prev.filter((p) => p.id !== selectedRow.id));
      setSelectedRow(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    }
  };

  const handleOpenAssignedClients = (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const enquiry = enquiries.find((e2) => e2.id === id);
    setSelectedEnquiry(enquiry);
  };

  // Click outside dropdown closes it — but only when clicking outside a .dropdown element
  useEffect(() => {
    const onDocClick = (ev) => {
      try {
        if (ev?.target?.closest && ev.target.closest(".dropdown")) return;
      } catch (err) {}
      setDropdownOpen(null);
    };

    const onEsc = (ev) => {
      if (ev.key === "Escape") {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // -------------------------
  // Filtering & Pagination
  // -------------------------
  const filtered = enquiries.filter((e) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      (e.name || e.full_name || "").toString().toLowerCase().includes(searchLower) ||
      (e.mobile || e.phone || "").toString().toLowerCase().includes(searchLower) ||
      (e.email || "").toString().toLowerCase().includes(searchLower) ||
      (e.service || "").toString().toLowerCase().includes(searchLower) ||
      (e.message || "").toString().toLowerCase().includes(searchLower)
    );
  });

  const totalPages = itemsPerPage === "all" ? 1 : Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = itemsPerPage === "all" ? filtered : filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filtered.length, itemsPerPage, totalPages, currentPage]);

  // -------------------------
  // Repurchase sample data (unchanged)
  // -------------------------
  const repurchaseData = {
    overallRate: 78,
    monthlyTrend: [
      { month: "Jan", predicted: 120, actual: 110 },
      { month: "Feb", predicted: 140, actual: 125 },
      { month: "Mar", predicted: 150, actual: 145 },
      { month: "Apr", predicted: 160, actual: 155 },
    ],
    categories: [
      { label: "On-time", value: 65 },
      { label: "Early", value: 15 },
      { label: "Late", value: 20 },
    ],
    productRates: [
      { name: "Vitamin Serum", rate: 82 },
      { name: "Hydra Moist", rate: 75 },
      { name: "Sunscreen 50ml", rate: 88 },
    ],
  };

  return (
    <div className="page-inner">
      <div>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <h4 className="fw-bold mb-0">Dashboard</h4>
        </div>

        <div className="row">
          {/* Total Staff */}
          <div className="col-xl-3 col-md-6 mb-4">
            <div
              className="position-relative border card rounded-2 shadow-sm overflow-hidden"
              style={{ transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <img
                src="/web/assets/img/bg/bg-01.svg"
                alt="background"
                className="position-absolute start-0 top-0"
                style={{ zIndex: 0, opacity: 0.3, pointerEvents: "none" }}
              />
              <div className="card-body position-relative z-1">
                <div className="d-flex align-items-center mb-2 justify-content-between">
                  <span
                    className="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <i className="fas fa-user-tie fs-24 text-white" />
                  </span>
                  <div>
                    <p className="mb-1 fw-medium text-secondary">Total Staff</p>
                    <h3 className="fw-bold mb-0 text-dark">
                      <Link href="#" className="text-decoration-none text-dark">
                        {counts.totalStaff?.toLocaleString() || 0}
                      </Link>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Clients */}
          <div className="col-xl-3 col-md-6 mb-4">
            <div
              className="position-relative border card rounded-2 shadow-sm overflow-hidden"
              style={{ transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <img
                src="/web/assets/img/bg/bg-02.svg"
                alt="background"
                className="position-absolute start-0 top-0"
                style={{ zIndex: 0, opacity: 0.3, pointerEvents: "none" }}
              />
              <div className="card-body position-relative z-1">
                <div className="d-flex align-items-center mb-2 justify-content-between">
                  <span
                    className="avatar bg-success rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <i className="fas fa-user fs-24 text-white" />
                  </span>
                  <div>
                    <p className="mb-1 fw-medium text-secondary">Total Clients</p>
                    <h3 className="fw-bold mb-0 text-dark">
                      <Link href="#" className="text-decoration-none text-dark">
                        {counts.totalClients?.toLocaleString() || 0}
                      </Link>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Enquiries */}
          <div className="col-xl-3 col-md-6 mb-4">
            <div
              className="position-relative border card rounded-2 shadow-sm overflow-hidden"
              style={{ transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <img
                src="/web/assets/img/bg/bg-03.svg"
                alt="background"
                className="position-absolute start-0 top-0"
                style={{ zIndex: 0, opacity: 0.3, pointerEvents: "none" }}
              />
              <div className="card-body position-relative z-1">
                <div className="d-flex align-items-center mb-2 justify-content-between">
                  <span
                    className="avatar bg-warning rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <i className="fas fa-envelope-open-text fs-24 text-white" />
                  </span>
                  <div>
                    <p className="mb-1 fw-medium text-secondary">Total Enquiries</p>
                    <h3 className="fw-bold mb-0 text-dark">
                      <Link href="#" className="text-decoration-none text-dark">
                        {counts.totalEnquiries?.toLocaleString() || 0}
                      </Link>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Products */}
          <div className="col-xl-3 col-md-6 mb-4">
            <div
              className="position-relative border card rounded-2 shadow-sm overflow-hidden"
              style={{ transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <img
                src="/web/assets/img/bg/bg-04.svg"
                alt="background"
                className="position-absolute start-0 top-0"
                style={{ zIndex: 0, opacity: 0.3, pointerEvents: "none" }}
              />
              <div className="card-body position-relative z-1">
                <div className="d-flex align-items-center mb-2 justify-content-between">
                  <span
                    className="avatar bg-danger rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <i className="fas fa-box fs-24 text-white" />
                  </span>
                  <div>
                    <p className="mb-1 fw-medium text-secondary">Total Products</p>
                    <h3 className="fw-bold mb-0 text-dark">
                      <Link href="#" className="text-decoration-none text-dark">
                        {counts.totalProduct?.toLocaleString() || 0}
                      </Link>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-8 d-flex">
            <div className="card shadow-sm flex-fill w-100">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">Users Statistics</h5>
              </div>
              <div className="card-body">
                <div className="col-md-12">
                  <EnquiriesStatistics data={[]} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-4 d-flex">
            <div className="card shadow-sm flex-fill w-100">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">Top Clinic</h5>
              </div>
              <div className="card-body">
                <div className="col-md-12">
                  <TopServices data={[]} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Clinic table (uses enquiries state) */}
        <div className="row">
          <div className="col-12 d-flex">
            <div className="card shadow-sm flex-fill w-100">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">Recent Clinics</h5>
                 <Link href="/admin/clinic/list" className="btn btn-primary">
                       
                        <span>All Clinic</span>
                    </Link>
              </div>

              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead className="thead-light">
                      <tr>
                        <th>Full Name</th>
                        <th>Clinic Name</th>
                        <th>Email</th>
                        <th>Mobile Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="text-center py-3">Loading...</td>
                        </tr>
                      ) : paginated.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-3">No Clinic found.</td>
                        </tr>
                      ) : (
                        paginated.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <img src={`/web/assets/img/no-image.jpg`} alt={row.full_name} className="rounded-circle" width="40" height="40" />
                                <div>
                                  <strong>{row.full_name}</strong>
    
                                </div>
                              </div>
                            </td>

                 
  <td>
                             {row.clinic_name || "N/A"}
                            </td>

                            <td>
                             {row.email || "N/A"}
                            </td>


                            <td>
                            {row.mobile || "N/A"}
                            </td>

       
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Repurchase Analysis Chart */}
        <div className="row mt-4">
          <div className="col-12 d-flex">
            <div className="card shadow-sm flex-fill w-100">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">Clinic According to plan</h5>
              </div>
              <div className="card-body">
                <ProductRepurchaseCharts data={repurchaseData} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent User table (uses products state in your original layout) */}
        <div className="row">
          <div className="col-12 d-flex">
            <div className="card shadow-sm flex-fill w-100">

            <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">Recent Users</h5>
                 <Link href="/admin/users/list" className="btn btn-primary">
                        <span>All Users</span>
                    </Link>
              </div>

              <div className="table-responsive" ref={dropdownRef}>
                <table className="table table-nowrap datatable dataTable no-footer">
                  <thead className="thead-light">
                    <tr>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Mobile Number</th>
                      <th className="text-end"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-3">Loading...</td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-3">No User found.</td>
                      </tr>
                    ) : (
                      products.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2 cursor-pointer">
                              <img
                                src={
                                  row.avatar?.length > 0
                                    ? row.avatar
                                    : `${API_BASE_URL}/uploads/products/no-image.png`
                                }
                                alt={row.full_name || ""}
                                className="rounded"
                                width="50"
                                height="50"
                              />
                              <div>
                                <strong>{row.full_name}</strong>
                              </div>
                            </div>
                          </td>
                          <td>{row.email  || "N/A"}</td>
                          <td>{row.mobile || "N/A"}</td>
        
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
