"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";

export default function SiteWithQuotes() {
  const { id } = useParams();
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [activeTab, setActiveTab] = useState("detail");
  const [clinicDetail, setClinicDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]); // All categories
  const [assignedCategories, setAssignedCategories] = useState([]); // Categories assigned to clinic
  const [subCategories, setSubCategories] = useState({}); // Map: categoryId -> subcategories
  const [selectedServices, setSelectedServices] = useState([]);
  const [savedImages, setSavedImages] = useState([]);
  const [workingDays, setWorkingDays] = useState([]);
  const [breaks, setBreaks] = useState([]);

  const daysList = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch clinic details
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("curtishCleanAuthToken");
      if (!token) {
        toast.error("Authentication token missing. Please login again.");
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API_BASE_URL}/clinic/Details/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClinicDetail(res.data.user || null);
    } catch (err) {
      console.error("Failed to load site detail", err);
      toast.error("Failed to load clinic details");
      setClinicDetail(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/Category`, {});
      const fetchedCategories = response.data.data || [];
      setCategories(fetchedCategories);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories");
    }
  };

  // Fetch clinic portfolio images
  const fetchPortfolio = async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/clinic-portfolio/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic_id: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setSavedImages(data.data || []);
      } else {
        toast.error(data.error || "Failed to fetch portfolio images");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to fetch portfolio images");
    }
  };

  // Fetch working hours and breaks
  const fetchHours = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/clinic-operational-details/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic_id: id }),
      });

      if (res.ok) {
        const result = await res.json();
        const allData = result.data || [];

        const wd = allData
          .filter((item) => item.type === "workingDay")
          .map((d) => ({
            day: d.label,
            active: d.active,
            from: d.from,
            to: d.to,
          }));

        const br = allData
          .filter((item) => item.type === "break")
          .map((b) => ({
            name: b.label,
            from: b.from,
            to: b.to,
          }));

        setWorkingDays(
          wd.length > 0
            ? wd
            : daysList.map((day) => ({
                day,
                active: true,
                from: "09:00",
                to: "17:00",
              }))
        );

        setBreaks(br.length > 0 ? br : []);
      } else {
        toast.error("Failed to fetch working hours");
      }
    } catch (error) {
      console.error(error);
      toast.error("Fetch Error");
    }
  };

  // Fetch subcategories for a category
  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/CategoryServices`, {
        category_id: categoryId,
      });
      setSubCategories((prev) => ({
        ...prev,
        [categoryId]: response.data.data || [],
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch subcategories");
    }
  };

  // Fetch saved services for the clinic and assign categories + prefetch subcategories
  const fetchSavedServices = async () => {
    if (!id) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/GetClinicServices`, {
        clinic_id: id,
      });
      const services = response.data.data || [];
      setSelectedServices(services);

      // Get unique category IDs from saved services
      const uniqueCategoryIds = [
        ...new Set(services.map((s) => Number(s.category_id))),
      ];

      // Filter assigned categories
      const filteredCategories = categories.filter((cat) =>
        uniqueCategoryIds.includes(Number(cat.id || cat._id))
      );
      setAssignedCategories(filteredCategories);

      // Fetch all subcategories for these categories in parallel
      await Promise.all(
        uniqueCategoryIds.map((catId) => fetchSubCategories(catId))
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch saved services");
    }
  };

  // Checkbox handler
  const handleCheckboxChange = (categoryId, subcategoryId, checked) => {
    if (checked) {
      setSelectedServices((prev) => [
        ...prev,
        {
          category_id: Number(categoryId),
          subcategory_id: Number(subcategoryId),
          clinic_id: String(clinicDetail?.id || clinicDetail?._id),
        },
      ]);
    } else {
      setSelectedServices((prev) =>
        prev.filter(
          (s) =>
            !(
              Number(s.category_id) === Number(categoryId) &&
              Number(s.subcategory_id) === Number(subcategoryId) &&
              String(s.clinic_id) === String(clinicDetail?.id || clinicDetail?._id)
            )
        )
      );
    }
  };

  // Main useEffect: fetch data in sequence
  useEffect(() => {
    if (!id) return;

    const initialize = async () => {
      setLoading(true);
      await fetchCategories();
      await fetchData();
      await fetchSavedServices(); // depends on categories & clinicDetail
      fetchPortfolio();
      fetchHours();
      setLoading(false);
    };

    initialize();
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.5rem",
          fontWeight: "bold",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!clinicDetail) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.2rem",
          color: "red",
          fontWeight: "bold",
        }}
      >
        Clinic details not found.
      </div>
    );
  }



  return (

    <div className="page-inner">
  <div className="row">
    <div className="col-12">
      <div className="mb-3">
        <h4 className="fw-bold mb-0">Clinic Details</h4>
      </div>
      <div className="card">
        <div className="card-body p-3">
          <div className="settings-wrapper d-flex flex-column gap-4">

            {/* Basic Information Section */}
            <section className="bg-light p-3 rounded shadow-sm">
              <h5 className="fw-bold mb-3">Basic Information</h5>
<img
  src={clinicDetail.clinicLogo}
  alt="portfolio"
  style={{ width: "100px", height: "100px", objectFit: "cover" }}
/>
              <div className="row">
                {[
                  { label: "Clinic Name", value: clinicDetail.clinic_name },
                  { label: "Legal Business Name", value: clinicDetail.business_name },
                  { label: "Business Registration Number / ABN", value: clinicDetail.abn },
                  { label: "Owner / Primary Contact Person Name", value: clinicDetail.ownerName },
                  { label: "Email Address", value: clinicDetail.email },
                  { label: "Website URL", value: clinicDetail.website },
                  { label: "Contact Number (Primary Business Phone)", value: clinicDetail.business_phone },
                  { label: "Alternate Contact Number", value: clinicDetail.alternate_contact_number },
                ].map(({ label, value }) => (
                  <div className="col-lg-6 mb-3" key={label}>
                    <label className="form-label fw-semibold">{label}:</label>
                    <p className="mb-0">{value || "-"}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Address Information Section */}
            <section className="bg-light p-3 rounded shadow-sm">
              <h5 className="fw-bold mb-3">Address Information</h5>
              <div className="row">
                {[
                  { label: "Address Line 1", value: clinicDetail.address },
                  { label: "Address Line 2", value: clinicDetail.address_line2 },
                  { label: "City / Suburb", value: clinicDetail.city },
                  { label: "State / Region", value: clinicDetail.state },
                  { label: "Postal Code", value: clinicDetail.postal_code },
                  { label: "Country", value: clinicDetail.country },
                ].map(({ label, value }) => (
                  <div className="col-lg-6 mb-3" key={label}>
                    <label className="form-label fw-semibold">{label}:</label>
                    <p className="mb-0">{value || "-"}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Other Information Section */}
            <section className="bg-light p-3 rounded shadow-sm">
              <h5 className="fw-bold mb-3">Other Information</h5>
              <div className="row">
                {[
                  { label: "About Clinic", value: clinicDetail.about },
                  { label: "Experience", value: clinicDetail.experience },
                  { label: "Specialists", value: clinicDetail.specialists },
                ].map(({ label, value }) => (
                  <div className="col-lg-4 mb-3" key={label}>
                    <label className="form-label fw-semibold">{label}:</label>
                    <p className="mb-0">{value || "-"}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Services & Specializations Accordion */}
            <section>
              <h5 className="fw-bold mb-3">Services & Specializations</h5>
              <div className="accordion" id="servicesAccordion">
                {categories
                  .filter((category) => {
                    const categoryId = category.id || category._id;
                    return selectedServices.some(
                      (service) => Number(service.category_id) === Number(categoryId)
                    );
                  })
                  .map((category, index) => {
                    const categoryId = category.id || category._id;
                    const assignedSubCategories = selectedServices
                      .filter((service) => Number(service.category_id) === Number(categoryId))
                      .map((service) => service.subcategory_id);
                    const filteredSubCategories = (subCategories[categoryId] || []).filter((sub) =>
                      assignedSubCategories.includes(sub.id || sub._id)
                    );
                    return (
                      <div className="accordion-item" key={categoryId}>
                        <h2 className="accordion-header" id={`heading-${index}`}>
                          <button
                            className={`accordion-button ${index !== 0 ? "collapsed" : ""}`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse-${index}`}
                            aria-expanded={index === 0 ? "true" : "false"}
                            aria-controls={`collapse-${index}`}
                            onClick={() => fetchSubCategories(categoryId)}
                          >
                            <img
                              src={category.image || "assets/img/skinb.svg"}
                              width="30"
                              className="me-2"
                              alt="Icon"
                            />
                            {category.title}
                          </button>
                        </h2>
                        <div
                          id={`collapse-${index}`}
                          className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                          aria-labelledby={`heading-${index}`}
                          data-bs-parent="#servicesAccordion"
                        >
                          <div className="accordion-body">
                            {filteredSubCategories.length > 0 ? (
                              filteredSubCategories.map((sub) => {
                                const subId = sub.id || sub._id;
                                return (
                                  <div className="form-check form-check-inline" key={subId}>
                             
                                    <label
                                      className="form-check-label"
                                      htmlFor={`srvc-${categoryId}-${subId}`}
                                    >
                                    <i class="ti ti-check"></i>

{sub.name}
                                    </label>
                                  </div>
                                );
                              })
                            ) : (
                              <p>No assigned services in this category</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>

            {/* Portfolio/Gallery */}
            <section className="bg-light p-3 rounded shadow-sm">
              <h5 className="fw-bold mb-3">Portfolio/Gallery</h5>
              <div className="row g-3">
                {savedImages.length === 0 && <p>No images available.</p>}
                {savedImages.map((img) => (
                  <div
                    key={img.id || img._id}
                    className="col-lg-3 col-md-4 col-sm-6"
                  >
                    <a href={img.image_url} className="image-popup" target="_blank" rel="noopener noreferrer">
                      <img
                        src={img.image_url}
                        alt="portfolio"
                        className="img-fluid rounded"
                      />
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* Operational Details */}
           <section>
  <h5 className="fw-bold mb-4">Operational Details (Working Hours)</h5>
  <div className="row g-4">
    
    {/* Working Days & Hours */}
    <div className="col-md-6">
      <div className="card shadow-sm border rounded-3 h-100">
        <div className="card-header bg-light fw-semibold fs-6 border-bottom">
          Working Days & Hours
        </div>
        <div className="card-body p-0">
          <table className="table table-hover table-bordered align-middle mb-0">
            <thead className="table-light text-center">
              <tr>
                <th style={{width:"30%"}}>Day</th>
                <th style={{width:"20%"}}>Status</th>
                <th style={{width:"25%"}}>From</th>
                <th style={{width:"25%"}}>To</th>
              </tr>
            </thead>
            <tbody>
              {workingDays.map((day, i) => (
                <tr key={i}>
                  <td className="fw-medium">{day.day}</td>
                  <td className="text-center">
                    <span
                      className={`badge rounded-pill px-3 py-2 ${
                        day.active ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {day.active ? "Open" : "Close"}
                    </span>
                  </td>
                  <td className="text-center">{day.active ? day.from : "-"}</td>
                  <td className="text-center">{day.active ? day.to : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Breaks Hours */}
    <div className="col-md-6">
      <div className="card shadow-sm border rounded-3 h-100">
        <div className="card-header bg-light fw-semibold fs-6 border-bottom">
          Breaks Hours
        </div>
        <div className="card-body p-0">
          <table className="table table-hover table-bordered align-middle mb-0">
            <thead className="table-light text-center">
              <tr>
                <th style={{width:"40%"}}>Break Name</th>
                <th style={{width:"30%"}}>From</th>
                <th style={{width:"30%"}}>To</th>
              </tr>
            </thead>
            <tbody>
              {breaks.length > 0 ? (
                breaks.map((brk, i) => (
                  <tr key={i}>
                    <td className="fw-medium">{brk.name || "-"}</td>
                    <td className="text-center">{brk.from || "-"}</td>
                    <td className="text-center">{brk.to || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-muted py-3">
                    No breaks defined
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</section>


          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  );
}
