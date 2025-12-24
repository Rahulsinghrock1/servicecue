"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import { useUser } from "@context/UserContext";

export default function ClinicProfileForm() {
  const { user } = useUser();
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  const [savingStatus, setSavingStatus] = useState("idle"); // idle | saving | saved | error

  // ✅ fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/Category`, {});
      const fetchedCategories = response.data.data || [];
      setCategories(fetchedCategories);

      if (fetchedCategories.length > 0) {
        fetchSubCategories(fetchedCategories[0].id || fetchedCategories[0]._id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // ✅ fetch subcategories
  const fetchSubCategories = async (categoryId) => {
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

  // ✅ fetch already saved services
  const fetchSavedServices = async () => {
    if (!user?.id && !user?._id) return; // wait until user is available

    try {
      const response = await axios.post(`${API_BASE_URL}/GetClinicServices`, {
        clinic_id: user?.id || user?._id, // ✅ fallback for both
      });
      setSelectedServices(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch saved services");
    }
  };

  // ✅ checkbox toggle
  const handleCheckboxChange = (categoryId, subcategoryId, checked) => {
    if (checked) {
      setSelectedServices((prev) => [
        ...prev,
        {
          category_id: Number(categoryId),
          subcategory_id: Number(subcategoryId),
          clinic_id: String(user?.id || user?._id),
        },
      ]);
    } else {
      setSelectedServices((prev) =>
        prev.filter(
          (s) =>
            !(
              Number(s.category_id) === Number(categoryId) &&
              Number(s.subcategory_id) === Number(subcategoryId) &&
              String(s.clinic_id) === String(user?.id || user?._id)
            )
        )
      );
    }
  };

  // ✅ save services
  const handleSave = async () => {
    setSavingStatus("saving");
    try {
      await axios.post(`${API_BASE_URL}/SaveClinicServices`, {
        services: selectedServices,
      });
      setSavingStatus("saved");
      toast.success("Services saved successfully!");

      // 🔄 Reset back to "idle" after 2 seconds
      setTimeout(() => {
        setSavingStatus("idle");
      }, 2000);
    } catch (error) {
      console.error(error);
      setSavingStatus("error");
      toast.error("Failed to save services");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (user?.id || user?._id) {
      fetchSavedServices();
    }
  }, [user]);

  return (
    <div className="page-inner">
      <div className="row">
        <div className="col-12">
          <div className="mb-3">
            <h4 className="fw-bold mb-0">Manage Clinic</h4>
          </div>
          <div className="card">
            <div className="card-body p-0">
              <div className="settings-wrapper d-flex">
                {/* Sidebar */}
                <div className="sidebars settings-sidebar" id="sidebar2">
                  <div className="sticky-sidebar sidebar-inner" data-simplebar="">
                    <div id="sidebar-menu5" className="sidebar-menu mt-0 p-0">
                      <ul>
                        <li className="submenu">
                          <a href="#" className="active">
                            <i className="ti ti-medical-cross"></i>
                            <span>Manage Clinic</span>
                            <span className="menu-arrow"></span>
                          </a>
                          <ul>
                            <li>
                              <Link href="/admin/basic-Information/list">
                                <span className="sub-item">Basic Information</span>
                              </Link>
                            </li>
                            <li>
                              <Link href="/admin/faq/list">
                                <span className="sub-item">Services & Specializations</span>
                              </Link>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Form Card */}
                <div className="card flex-fill mb-0 border-0 bg-light-500 shadow-none">
                  <div className="card-header border-bottom pb-1 px-0 mx-3">
                    <h4 className="pt-2 fw-bold">Services & Specializations</h4>
                  </div>
                  <div className="card-body px-0 mx-3">
                    <div className="row border-bottom mb-3">
                      {loading ? (
                        <div className="text-center py-5">Loading categories...</div>
                      ) : (
                        <div className="accordion accordion-bordered" id="BorderedaccordionExample">
                          {categories.map((category, index) => {
                            const categoryId = category.id || category._id;
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
                                  data-bs-parent="#BorderedaccordionExample"
                                >
                                  <div className="accordion-body">
                                    {subCategories[categoryId] &&
                                    subCategories[categoryId].length > 0 ? (
                                      subCategories[categoryId].map((sub) => {
                                        const subId = sub.id || sub._id;

                                        const isChecked = selectedServices.some(
                                          (s) =>
                                            Number(s.category_id) === Number(categoryId) &&
                                            Number(s.subcategory_id) === Number(subId) &&
                                            String(s.clinic_id) === String(user?.id || user?._id)
                                        );

                                        return (
                                          <div className="form-check mb-3 form-check-inline" key={subId}>
                                            <input
                                              type="checkbox"
                                              className="form-check-input"
                                              id={`srvc-${categoryId}-${subId}`}
                                              value={sub.name}
                                              checked={isChecked}
                                              onChange={(e) =>
                                                handleCheckboxChange(categoryId, subId, e.target.checked)
                                              }
                                            />
                                            <label
                                              className="ms-2 form-check-label"
                                              htmlFor={`srvc-${categoryId}-${subId}`}
                                            >
                                              {sub.name}
                                            </label>
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <p>No services available</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Save / Cancel */}
                    <div className="d-flex align-items-center justify-content-end">
                      <a href="javascript:void(0);" className="btn btn-lg btn-light me-3">
                        Cancel
                      </a>
                      <button onClick={handleSave} className="btn btn-lg btn-primary">
                        {savingStatus === "saving"
                          ? "Saving..."
                          : savingStatus === "saved"
                          ? "Saved"
                          : savingStatus === "error"
                          ? "Retry Save"
                          : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
                {/* End Form Card */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
