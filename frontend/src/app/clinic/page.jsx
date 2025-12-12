"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import { TiThMenu } from "react-icons/ti";
import Link from "next/link";
import dynamic from "next/dynamic";
const RetentionCharts = dynamic(() => import("@/components/dashboard/RetentionCharts"), { ssr: false });
const ProductRepurchaseCharts = dynamic(() => import("@/components/dashboard/ProductRepurchaseCharts"), { ssr: false });
const EnquiriesStatistics = dynamic(() => import("@/components/dashboard/EnquiriesStatistics"), { ssr: false });
const TopServices = dynamic(() => import("@/components/dashboard/TopServices"), { ssr: false });
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const tokenRef = useRef(null);
  const clinicIdRef = useRef(null);
  const router = useRouter();

  // ---- Dashboard KPI States ----
  const [counts, setCounts] = useState({
    totalEnquiries: 0,
    totalClients: 0,
    totalProduct: 0,
    totalStaff: 0,
    retentionRate: 0,
  });

  // ---- Enquiry + Product States ----
  const [enquiries, setEnquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Enquiry list UI states
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null); // selected for delete
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [topStaff, setTopStaff] = useState([]);

  const [showcards, setShowCards] = useState(true);

  const dropdownRef = useRef(null);

  // Load token & clinic id once
  useEffect(() => {
    tokenRef.current = localStorage.getItem("curtishCleanAuthToken");
    clinicIdRef.current = localStorage.getItem("UserID");
  }, []);


  useEffect(() => {

    const curtishCleanAuthToken = localStorage.getItem("curtishCleanAuthToken");
    console.log(curtishCleanAuthToken, 'curtishCleanAuthToken');

    if (curtishCleanAuthToken) {
      const fetchUserProfile = async (token) => {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/profileDetails`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const activeSubscription = response?.data?.activeSubscription;

          console.log(activeSubscription, 'activeSubscription');
          if (activeSubscription.planDetails.title == "Solo Plan") {
            setShowCards(false);
          }

        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserProfile(curtishCleanAuthToken);
    }

  }, [router, API_BASE_URL]);


  // -------------------------
  // Fetching functions
  // -------------------------
  const fetchDashboardData = async () => {
    try {
      const token = tokenRef.current;
      const clinic_id = clinicIdRef.current;
      if (!token || !clinic_id) return;

      const res = await axios.post(
        `${API_BASE_URL}/dashboardData`,
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
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  // Fetch enquiries (we'll fetch all and paginate client-side)
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
      setEnquiries(data);
      // also reflect count in KPIs if dashboards didn't give it
      setCounts((prev) => ({ ...prev, totalEnquiries: data.length }));
    } catch (error) {
      console.error("Failed to fetch enquiries", error);
      //toast.error("Failed to fetch enquiries");
    }
  };

  const fetchProducts = async () => {
    try {
      const token = tokenRef.current;
      const clinic_id = clinicIdRef.current;
      if (!clinic_id) return;

      const response = await axios.post(
        `${API_BASE_URL}/getProducts`,
        { clinic_id, limit: 5, type: 2 },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      const data = response.data?.data || [];
      setProducts(data);
      setCounts((prev) => ({ ...prev, totalProduct: data.length }));
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
  // KPI simple animation (from 0 to fetched)
  // -------------------------




  // -------------------------
  // Enquiry list actions
  // -------------------------
  const toggleDropdown = (id, e) => {
    // stop the click from bubbling to document handlers if event passed
    if (e && e.stopPropagation) e.stopPropagation();
    setDropdownOpen((prev) => (prev === id ? null : id));
  };

  const handleDelete = (row, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setSelectedRow(row);
    // modal is opened via data-bs-* attributes on the button in markup
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
      //toast.error("Failed to delete enquiry");
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
      setSites(sites.filter((p) => p.id !== selectedRow.id));
      setSelectedRow(null);
    } catch (error) {
      console.error(error);
      //toast.error("Failed to delete product");
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
        // if click is inside any dropdown, don't close
        if (ev?.target?.closest && ev.target.closest(".dropdown")) return;
      } catch (err) {
        // defensive
      }
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
      (e.name || "").toString().toLowerCase().includes(searchLower) ||
      (e.phone || "").toString().toLowerCase().includes(searchLower) ||
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

                      <Link href="/clinic/staff/list" className="text-decoration-none text-dark">
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
                      <Link href="/clinic/client/list" className="text-decoration-none text-dark">
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
                      <Link href="/clinic/enquiries/list" className="text-decoration-none text-dark">
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
                      <Link href="/clinic/product/list" className="text-decoration-none text-dark">
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
                <h5 className="fw-bold mb-0">Enquiries Statistics</h5>
              </div>
              <div className="card-body">
                <div className="col-md-12">

                  <EnquiriesStatistics />
                </div>

              </div>

            </div>
          </div>

          <div className="col-4 d-flex">
            <div className="card shadow-sm flex-fill w-100">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">Top Services</h5>
              </div>
              <div className="card-body">

                <div className="col-md-12">
                  <TopServices />
                </div>
              </div>

            </div>
          </div>
        </div>



        <div className="row">
          <div className="col-12 d-flex">
            <div className="card shadow-sm flex-fill w-100">
              <div className="card-header d-flex align-items-center justify-content-between">



                <h5 className="fw-bold mb-0">Recent Enquiries</h5>
              </div>

              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead className="thead-light">
                      <tr>
                        <th>Client</th>
                        <th>Enquiry Date</th>
                        <th>Service</th>
                        <th>Action</th>
                        <th>Status</th>
                        <th className="text-end"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="text-center py-3">Loading...</td>
                        </tr>
                      ) : paginated.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-3">No enquiries found.</td>
                        </tr>
                      ) : (
                        paginated.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <img src={`/web/assets/img/no-image.jpg`} alt={row.name} className="rounded-circle" width="40" height="40" />
                                <div>
                                  <strong>{row.name}</strong>
                                  <div className="text-muted small">{row.phone}</div>
                                </div>
                              </div>
                            </td>

                            <td>{row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}</td>
                            <td>{row.service || "-"}</td>

                            <td>
                              {row.clientId ? (
                                <Link className="btn btn-outline-dark btn-sm" href={`/clinic/client/edit/${row.clientId}`}>Update Client</Link>
                              ) : (
                                <Link
                                  className="btn btn-outline-dark btn-sm"
                                  href={`/clinic/client/create?name=${encodeURIComponent(row.name || "")}&email=${encodeURIComponent(row.email || "")}&phone=${encodeURIComponent(row.phone || "")}&enquiries=${encodeURIComponent(row.id)}`}
                                >
                                  Convert to Client
                                </Link>
                              )}
                            </td>

                            <td>
                              <span className="badge badge-soft-info text-success fw-medium">{row.status || "N/A"}</span>
                            </td>

                            <td className="text-end position-relative">
                              <div className="dropdown" onClick={(ev) => ev.stopPropagation()}>
                                <button type="button" className="btn btn-sm btn-light" onClick={(e) => toggleDropdown(row.id, e)} aria-expanded={dropdownOpen === row.id}>
                                  <TiThMenu />
                                </button>

                                {dropdownOpen === row.id && (
                                  <ul
                                    className="dropdown-menu show shadow-sm"
                                    style={{ position: "absolute", right: 0, top: "100%", zIndex: 1000, minWidth: "160px" }}
                                    onClick={(ev) => ev.stopPropagation()}
                                  >
                                    <li>
                                      <button
                                        type="button"
                                        className="dropdown-item"
                                        data-bs-toggle="offcanvas"
                                        data-bs-target="#assigned_patient"
                                        onClick={(e) => handleOpenAssignedClients(row.id, e)}
                                      >
                                        View Details
                                      </button>
                                    </li>

                                  </ul>
                                )}
                              </div>
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


        <div className="row">
          {/* Client Retentions Chart */}
          <div className="col-12 d-flex">
            <div className="card shadow-sm flex-fill w-100">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">Client Retentions</h5>
              </div>
              <div className="card-body">
                <RetentionCharts retentionRate={counts.retentionRate} />
              </div>
            </div>
          </div>
        </div>

        {/* Product Repurchase Analysis Chart */}
        <div className="row mt-4">
          <div className="col-12 d-flex">
            <div className="card shadow-sm flex-fill w-100">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">Product Repurchase Analysis</h5>
              </div>
              <div className="card-body">
                <ProductRepurchaseCharts data={repurchaseData} />
              </div>
            </div>
          </div>
        </div>


        {/* Enquiries */}

        {showcards &&
          <div className="row">
            <div className="col-12 d-flex">
              <div className="card shadow-sm flex-fill w-100">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <h5 className="fw-bold mb-0">Most Active Staff</h5>

                </div>

                <div className="card-body">
                  <div className="row row-gap-3">
                    {topStaff.map((staff, index) => (
                      <div className="col-md-4" key={index}>
                        <div className="border shadow-sm p-3 rounded-2">
                          <div className="d-flex border-bottom pb-3 align-items-center mb-3">
                            <Link
                              href={`/clinic/staff/show/${staff.staff_id}`}
                              className="avatar me-2 flex-shrink-0 position-relative"
                            >
                              <img
                                src={
                                  staff.staff?.avatar
                                    ? `${staff.staff.avatar}`
                                    : "/web/assets/img/doctors/default-avatar.jpg"
                                }
                                alt={staff.staff?.full_name || "Staff"}
                                className="rounded-circle"
                                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                              />
                            </Link>
                            <div>
                              <h6 className="fs-14 mb-1 text-truncate">
                                <Link
                                  href={`/clinic/staff/show/${staff.staff_id}`}
                                  className="fw-semibold"
                                >
                                  {staff.staff?.full_name || "Unknown Staff"}
                                </Link>
                              </h6>
                              <p className="mb-0 fs-13">{staff.staff?.designation || "Staff"}</p>
                            </div>
                          </div>

                          <div className="d-flex justify-content-between">
                            <div>
                              <p className="mb-0">
                                <span className="text-dark fs-20 fw-semibold">
                                  {staff.total_clients}
                                </span>{" "}
                                Clients
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        {/* Recent Products */}


        <div className="row">
          <div className="col-12 d-flex">
            <div className="card shadow-sm flex-fill w-100">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-3 border-bottom pb-2">Recent Products</h5>
              </div>
              <div className="table-responsive" ref={dropdownRef}>
                <table className="table table-nowrap datatable dataTable no-footer">
                  <thead className="thead-light">
                    <tr>
                      <th>Product</th>
                      <th>Size</th>
                      <th>Product Type</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th className="text-end"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-3">
                          Loading...
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-3">
                          No product found.
                        </td>
                      </tr>
                    ) : (
                      products.map((row) => (
                        <tr key={row.id}>
                          {/* Product + Image */}
                          <td>
                            <div className="d-flex align-items-center gap-2 cursor-pointer">
                              <img
                                src={
                                  row.images?.length > 0
                                    ? row.images[0].image_url
                                    : `${API_BASE_URL}/uploads/products/no-image.png`
                                }
                                alt={row.title}
                                className="rounded"
                                width="50"
                                height="50"
                              />
                              <div>
                                <strong>{row.title}</strong>
                              </div>
                            </div>
                          </td>

                          {/* Size */}
                          <td>{row.weight || row.dosage || "N/A"}</td>

                          {/* Type */}
                          <td>{row.type || "N/A"}</td>

                          {/* Category with Image */}
                          <td>
                            {row.service_categories?.length > 0 ? (
                              <div className="d-flex flex-wrap gap-2">
                                {row.service_categories.map((cat) => (
                                  <div key={cat.id} className="d-flex align-items-center gap-1">
                                    <img
                                      src={
                                        cat.image?.startsWith("http")
                                          ? cat.image
                                          : `${API_BASE_URL}/${cat.image}`
                                      }
                                      alt={cat.title}
                                      width="30"
                                      height="30"
                                      className="rounded-circle"
                                    />
                                    <span className="small">{cat.title}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </td>

                          {/* Status */}
                          <td>
                            <span
                              className={`badge ${row.status
                                ? "badge-soft-success border border-success"
                                : "badge-soft-danger border border-danger"
                                }`}
                            >
                              {row.status ? "Active" : "Deactive"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="text-end">
                            <div className="dropdown">
                              <button
                                className="btn btn-sm btn-light"
                                onClick={() => toggleDropdown(row.id)}
                              >
                                <TiThMenu />
                              </button>

                              {dropdownOpen === row.id && (
                                <ul
                                  className="dropdown-menu show"
                                  style={{ right: 0, left: "auto" }}
                                >


                                  <li>
                                    <Link
                                      className="dropdown-item"
                                      href={`/clinic/product/edit/${row.id}`}
                                    >
                                      Edit
                                    </Link>
                                  </li>

                                  <li>
                                    <Link
                                      className="dropdown-item"
                                      href={`/clinic/product/show/${row.id}`}
                                    >
                                      View Details
                                    </Link>
                                  </li>

                                </ul>
                              )}
                            </div>
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

      {/* Delete Modal */}
      <div className="modal fade" id="delete_user" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-body text-center position-relative">
              <h5 className="fw-bold mb-1">Delete Confirmation</h5>
              <p className="mb-3">Are you sure you want to delete?</p>
              <div className="d-flex justify-content-center">
                <button type="button" className="btn btn-light me-3" data-bs-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={handleConfirmDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div
        className="modal fade"
        id="delete_product"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-body text-center position-relative">
              <img
                src="/web/assets/img/bg/delete-modal-bg-01.png"
                alt=""
                className="img-fluid position-absolute top-0 start-0 z-0"
              />
              <img
                src="/web/assets/img/bg/delete-modal-bg-02.png"
                alt=""
                className="img-fluid position-absolute bottom-0 end-0 z-0"
              />

              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-lg bg-danger text-white">
                  <i className="ti ti-trash fs-24"></i>
                </span>
              </div>

              <h5 className="fw-bold mb-1 position-relative z-1">
                Delete Confirmation
              </h5>
              <p className="mb-3 position-relative z-1">
                Are you sure you want to delete?
              </p>

              <div className="d-flex justify-content-center">
                <button
                  type="button"
                  className="btn btn-light position-relative z-1 me-3"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger position-relative z-1"
                  data-bs-dismiss="modal"
                  onClick={handleProductConfirmDelete}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Details Offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="assigned_patient"
      >
        <div className="offcanvas-header d-block pb-0 px-0">
          <div className="border-bottom d-flex align-items-center justify-content-between pb-3 px-3">
            <h5 className="offcanvas-title fs-18 fw-bold">
              Enquiry Details
              <span className="badge badge-soft-primary border pt-1 px-2 border-primary fw-medium ms-2">
                #EQ{selectedEnquiry?.id || "000"}
              </span>
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
            ></button>
          </div>
        </div>

        <div className="offcanvas-body">
          {selectedEnquiry ? (
            <div className="">
              {/* Client Header Info */}
              <div className="bg-light p-3 mb-3 border rounded-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <a href="javascript:void(0);" className="avatar me-2">
                    <img
                      src="/web/assets/img/no-image.jpg"
                      alt={selectedEnquiry.name}
                      className="rounded-circle"
                      width="50"
                      height="50"
                    />
                  </a>
                  <div>
                    <h6 className="mb-1 fs-14 fw-semibold">
                      {selectedEnquiry.name}
                    </h6>
                    <span className="fs-13 d-block">{selectedEnquiry.phone}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <a
                    href="javascript:void(0);"
                    className="btn btn-outline-white bg-white fs-20 d-inline-flex border rounded-2 p-1 me-1"
                  >
                    <i className="ti ti-phone-calling"></i>
                  </a>
                </div>
              </div>

              {/* Enquiry Details */}
              <div className="mb-3">
                <p className="text-dark mb-2 fw-semibold d-flex align-items-center justify-content-between">
                  Email
                  <span className="text-body fw-normal">{selectedEnquiry.email}</span>
                </p>
                <p className="text-dark mb-2 fw-semibold d-flex align-items-center justify-content-between">
                  Enquiry Date
                  <span className="text-body fw-normal">
                    {new Date(selectedEnquiry.createdAt).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </p>
                <p className="text-dark mb-2 fw-semibold d-flex align-items-center justify-content-between">
                  Service
                  <span className="text-body fw-normal">{selectedEnquiry.service}</span>
                </p>
              </div>

              {/* Message */}
              <div className="mb-3">
                <h6 className="fw-bold">Message</h6>
                <p className="text-muted">
                  {selectedEnquiry.message || "No message provided."}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted">No enquiry selected.</p>
          )}
        </div>
      </div>
    </div>
  );
}
