"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import MainConfig from "@/mainconfig";

export default function StaffDetails() {
  const { id } = useParams();
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [staff, setStaff] = useState(null);
  const [treatmentsDetails, settreatmentsDetails] = useState(null);
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("curtishCleanAuthToken");

  // Fetch staff details
  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/client/details/3`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStaff(response.data || {});
      } catch (err) {
        console.error("Error fetching staff details:", err);

      } finally {
        setLoading(false);
      }
    };

    if (id && token) fetchStaffDetails();
  }, [id, API_BASE_URL, token]);

  // Fetch treatment details
  useEffect(() => {
    const fetchTreatmentDetails = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/auth/Client/clientTreatmentDetails/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        settreatmentsDetails(response.data?.data || {});
      } catch (err) {
        console.error("Error fetching treatments details:", err);

      } finally {
        setLoading(false);
      }
    };

    if (id && token) fetchTreatmentDetails();
  }, [id, API_BASE_URL, token]);

  // Fetch treatment plans
  useEffect(() => {
    const fetchTreatmentPlans = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/past-treatment-planList`,
          { client_id: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTreatmentPlans(response.data?.data || []);
      } catch (err) {
        console.error("Error fetching treatment plans:", err);
   
      } finally {
        setLoading(false);
      }
    };

    if (id && token) fetchTreatmentPlans();
  }, [id, API_BASE_URL, token]);




  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-danger">{error}</div>;

  const stats = treatmentsDetails?.treatment_stats || {};
  const goals = stats?.goals || [];
  const products = stats?.products || [];
  const concerns = stats?.concerns || [];
  const beforeImages = stats?.before_images || [];
  const progress_history = treatmentsDetails?.progress_history || [];



  return (
    <div className="py-4">
      {/* ================= Staff Header Section ================= */}
      <div className="card mb-4">
        <div className="row align-items-end">
          <div className="col-xl-9 col-lg-8">
            <div className="d-sm-flex align-items-center position-relative z-0 overflow-hidden p-3">
              <a
                href="#"
                className="avatar avatar-xxxl patient-avatar me-2 flex-shrink-0"
              >
                <img
                  src={staff?.avatar || "/assets/img/users/user-02.jpg"}
                  alt="staff"
                  className="rounded"
                />
              </a>
              <div>
                <h5 className="mb-1 fw-bold">{staff?.full_name || "N/A"}</h5>
                <small>{staff?.gender || "N/A"}</small>
                <p className="mb-3">{staff?.address || "No address"}</p>
                <div className="d-flex align-items-center flex-wrap">
                  <p className="mb-0 d-inline-flex align-items-center">
                    <i className="ti ti-phone me-2 text-dark"></i>
                    <span className="text-dark ms-1">{staff?.mobile || "-"}</span>
                  </p>
                  <span className="mx-2 text-light">|</span>
                  <p className="mb-0 d-inline-flex align-items-center">
                    <i className="ti ti-mail me-2 text-dark"></i>
                    <span className="text-dark ms-1">{staff?.email || "-"}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-4">
            <div className="p-3 text-lg-end">
              <div className="mb-4">
                <a
                  href="#"
                  className="btn btn-outline-white shadow-sm rounded-circle d-inline-flex align-items-center p-2 fs-14 me-2"
                >
                  <i className="ti ti-phone"></i>
                </a>
                <a
                  href="#"
                  className="btn btn-outline-white shadow-sm rounded-circle d-inline-flex align-items-center p-2 fs-14 me-2"
                >
                  <i className="ti ti-mail"></i>
                </a>
              </div>
      
            </div>
          </div>
        </div>
      </div>

      {/* ================= Client Status & Progress ================= */}
      <div className="row">
        <div className="col-xl-7">
          {/* Client Status */}
     {/*     <div className="card shadow-sm mb-4">
            <div className="card-header">
              <h6 className="fw-medium mb-0">
                <i className="ti ti-book me-1"></i>Client Status
              </h6>
            </div>
            <div className="card-body pb-0">
              <div className="mb-4 row text-center">
                {[
                  {
                    value: `${stats?.totaltreatments || 0}/${treatmentPlans.length}`,
                    label: "Treatment Plans",
                    percent:
                      treatmentPlans.length > 0
                        ? Math.round(
                            (stats?.totaltreatments / treatmentPlans.length) * 100
                          )
                        : 0,
                  },
                  {
                    value: `${stats?.totalproduct || 0}/${products.length}`,
                    label: "Product Plans",
                    percent:
                      products.length > 0
                        ? Math.round(
                            (stats?.totalproduct / products.length) * 100
                          )
                        : 0,
                  },
                  {
                    value: `${goals.filter((g) => g.status).length}/${goals.length}`,
                    label: "Goals",
                    percent:
                      goals.length > 0
                        ? Math.round(
                            (goals.filter((g) => g.status).length / goals.length) * 100
                          )
                        : 0,
                  },
                ].map((item, index) => (
                  <div className="col-4" key={index}>
                    <div className="completed-status single-chart">
                      <svg
                        viewBox="0 0 36 36"
                        className="circular-chart blue"
                        style={{ width: "100px", height: "100px" }}
                      >
                        <path
                          className="circle-bg"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#eee"
                          strokeWidth="2"
                        />
                        <path
                          className="circle"
                          strokeDasharray={`${item.percent}, 100`}
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#007bff"
                          strokeWidth="2"
                        />
                        <text
                          x="18"
                          y="20.35"
                          className="data-value"
                          textAnchor="middle"
                          fontSize="8"
                        >
                          {item.value}
                        </text>
                      </svg>
                      <p className="lh-1 mt-2">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>*/}

          {/* Client Concerns */}
          <div className="card shadow-sm">
            <div className="card-header">
              <h6 className="fw-medium mb-0">
                <i className="ti ti-user-star me-1"></i>Client Concerns
              </h6>
            </div>
            <div className="card-body pb-3">
              {concerns.length > 0 ? (
                <p>{concerns.join(", ")}</p>
              ) : (
                <p>No concerns added</p>
              )}
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="col-xl-5">
          <div className="card shadow-sm flex-fill w-100">
            <div className="card-header">
              <h6 className="fw-medium mb-0">
                <i className="ti ti-graph me-1"></i>Progress
              </h6>
            </div>

            <div className="card-body p-0">
              <div className="pt-4 pb-2 px-4">
                {/* Before Photos */}
                <h5>Before Photos</h5>
                <div className="row mt-3 row-gap-3 mb-3">
                  {beforeImages.length > 0 ? (
                    beforeImages.map((img, idx) => (
                      <div className="col-md-4 col-4" key={idx}>
                        <a href={img.image_url} className="image-popup">
                          <img
                            src={img.image_url}
                            alt={img.key || `before-${idx}`}
                            className="rounded-3 img-fluid"
                          />
                        </a>
                      </div>
                    ))
                  ) : (
                    <p>No before images available</p>
                  )}
                </div>

                {/* Progress History */}
                {progress_history.length > 0 &&
                  progress_history.map((progress, pIdx) => (
                    <div key={pIdx} className="mb-4">
                      <h5 className="mt-3">{progress.difference_from_first_entry}</h5>
                      <div className="row mt-2 row-gap-3">
                        {progress.images?.map((img, idx) => (
                          <div className="col-md-4 col-4" key={idx}>
                            <a href={img.image_url} className="image-popup">
                              <img
                                src={img.image_url}
                                alt={`progress-${pIdx}-${idx}`}
                                className="rounded-3 img-fluid"
                              />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Tabs Section ================= */}
      <div className="card mt-4">
        <div className="card-body">
          <ul className="nav nav-tabs nav-bordered mb-3">
            <li className="nav-item">
              <a
                href="#treatment-plans"
                data-bs-toggle="tab"
                className="nav-link active bg-transparent"
              >
                <span>Treatment Plans</span>
              </a>
            </li>
            <li className="nav-item">
              <a
                href="#product-plans"
                data-bs-toggle="tab"
                className="nav-link bg-transparent"
              >
                <span>Product Plans</span>
              </a>
            </li>
            <li className="nav-item">
              <a
                href="#goals"
                data-bs-toggle="tab"
                className="nav-link bg-transparent"
              >
                <span>Goals</span>
              </a>
            </li>

          </ul>

          <div className="tab-content">
            {/* Treatment Plans */}
            <div className="tab-pane show active" id="treatment-plans">
              {treatmentPlans.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-nowrap">
                    <thead>
                      <tr>
                        <th>Treatments</th>
                        <th>Treatment Date</th>
                        <th>Clinic Name</th>
                        <th>Clinic Email</th>
                       <th>Status</th>

                      </tr>
                    </thead>
                    <tbody>
                      {treatmentPlans.map((t, idx) => (
                        <tr key={idx}>
                          <td className="fw-medium">{t.treatmentName}</td>
                          <td>{t.treatmentDate}</td>
                          
                          <td>{t.clinic?.name || "-"}</td>
                          <td>{t.clinic?.email || "-"}</td>
                          <td>
                            <span
                              className={`fs-16 badge rounded fw-medium ${
                                t.status === "Completed"
                                  ? "badge-soft-info text-success"
                                  : "badge-soft-warning text-warning"
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No treatment plans available</p>
              )}
            </div>

            {/* Product Plans */}
            <div className="tab-pane" id="product-plans">
              {products.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-nowrap">
                    <thead>
                      <tr>
                        <th>Products</th>
                        <th>Start Date</th>
                        <th>Mode</th>
                        <th>Dosage</th>
                        <th>Duration</th>
                        <th>Timing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, idx) => (
                        <tr key={idx}>
                          <td className="text-wrap fw-medium">
                            <a
                              href="#"
                              className="d-flex align-items-center fw-semibold"
                              data-bs-toggle="offcanvas"
                              data-bs-target="#product-info"
                            >
                              <span className="avatar avatar-md me-2">
                                <img
                                  src={
                                    p.image ||
                                    "http://localhost:5000/api/uploads/products/no-image.jpg"
                                  }
                                  alt={p.title}
                                  className="rounded"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                  }}
                                />
                              </span>
                              {p.title || "N/A"}
                            </a>
                          </td>
                          <td>{p.start_time ? new Date(p.start_time).toLocaleDateString() : "-"}</td>
                          <td>{p.intake_mode || "-"}</td>
                          <td>{p.dosage || "-"}</td>
                          <td>{p.duration || "-"}</td>
                          <td>
                            {p.time_option
                              ? p.time_option.split(",").map((time, i) => (
                                  <span key={i}>{time.trim()} </span>
                                ))
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No products available</p>
              )}
            </div>

            {/* Goals */}
            <div className="tab-pane" id="goals">
              {goals.length > 0 ? (
                <div className="row">
                  <div className="col-md-4">
                    {beforeImages[0]?.image_url ? (
                      <img
                        src={beforeImages[0].image_url}
                        className="mb-3 img-fluid rounded-3"
                        alt="Goal Image"
                      />
                    ) : (
                      <img
                        src="http://localhost:5000/api/uploads/goals/no-image.jpg"
                        className="mb-3 img-fluid rounded-3"
                        alt="No Image"
                      />
                    )}
                  </div>
                  <div className="col-md-8">
                    <div className="table-responsive">
                      <table className="table table-nowrap">
                        <thead>
                          <tr>
                            <th className="no-sort">Goal</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {goals.map((g, idx) => (
                            <tr key={idx}>
                              <td className="text-wrap fw-medium">{g.name || "N/A"}</td>
                              <td>
                                {Number(g.status) === 1 ? (
                                  <span className="fs-16 badge badge-soft-info rounded text-success fw-medium">
                                    Completed
                                  </span>
                                ) : (
                                  <span className="fs-16 badge badge-soft-warning rounded text-warning fw-medium">
                                    Pending
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <p>No goals added</p>
              )}
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
