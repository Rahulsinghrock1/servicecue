"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import { useUser } from "@context/UserContext";
import { useRouter } from 'next/navigation';

const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false }
);
let ClassicEditor;
if (typeof window !== "undefined") {
  ClassicEditor = require("@ckeditor/ckeditor5-build-classic");
}

export default function ClinicProfileForm() {
  const router = useRouter();
  const { user } = useUser();
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  const [savingStatus, setSavingStatus] = useState("idle");
  const [editingService, setEditingService] = useState(null);
  const [preInstruction, setPreInstruction] = useState("");
  const [postInstruction, setPostInstruction] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [treatmentsByCategory, setTreatmentsByCategory] = useState({});
  const [newTreatmentsByCategory, setNewTreatmentsByCategory] = useState({});

  const normalizeId = (v) => (v === undefined || v === null ? "" : String(v));

  const extractPrecPost = (obj) => ({
    precare:
      obj?.precare ??
      obj?.pre_care ??
      obj?.preCare ??
      obj?.pre_instruction ??
      obj?.pre_instruction_text ??
      "",
    postcare:
      obj?.postcare ??
      obj?.post_care ??
      obj?.postCare ??
      obj?.post_instruction ??
      obj?.post_instruction_text ??
      "",
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/Category`, {});
      const fetchedCategories = response.data?.data || [];
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0) {
        const firstCatId = fetchedCategories[0].id ?? fetchedCategories[0]._id;
        if (firstCatId !== undefined) fetchSubCategories(firstCatId);
      }
    } catch (error) {
      console.error("fetchCategories error:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryIdRaw) => {
    const catId = categoryIdRaw ?? "";
    if (!catId && catId !== 0) return;

    const catKey = normalizeId(catId);
    try {
      const servicesRes = await axios.post(`${API_BASE_URL}/CategoryServices`, { category_id: catId });
      const userId = localStorage.getItem("UserID");
      const services = servicesRes?.data?.data || [];

      const instructionsPromises = services.map((service) => {
        const serviceId = service?.id ?? service?._id ?? service?.service_id ?? service?.serviceId;
        return axios.post(`${API_BASE_URL}/ClinicServiceInstructions`, {
          clinic_id: userId,
          service_id: serviceId,
        });
      });

      const instructionsRes = await Promise.all(instructionsPromises);

      const instructionsMap = {};
      instructionsRes.forEach((res) => {
        const instructions = res?.data?.data || [];
        instructions.forEach((ins) => {
          const sid =
            ins?.service_id ??
            ins?.subcategory_id ??
            ins?.serviceId ??
            ins?.subcategoryId ??
            ins?.id ??
            null;
          if (sid !== null && sid !== undefined) instructionsMap[normalizeId(sid)] = ins;
        });
      });

      const mergedServices = services.map((s) => {
        const sId = s?.id ?? s?._id ?? s?.service_id ?? s?.serviceId;
        const key = normalizeId(sId);
        const instr = instructionsMap[key] ?? null;
        const svcPrecPost = extractPrecPost(s);
        const insPrecPost = extractPrecPost(instr || {});

        return {
          ...s,
          id: sId,
          precare: insPrecPost.precare || svcPrecPost.precare || "",
          postcare: insPrecPost.postcare || svcPrecPost.postcare || "",
        };
      });

      setSubCategories((prev) => ({ ...prev, [catKey]: mergedServices }));
    } catch (e) {
      console.error("fetchSubCategories error for category", categoryIdRaw, e);
      toast.error("Failed to fetch category services");
    }
  };

  const fetchSavedServices = async () => {
    if (!user?.id && !user?._id) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/GetClinicServices`, {
        clinic_id: user?.id ?? user?._id,
      });
      const saved = (response?.data?.data || []).map((s) => ({
        category_id: normalizeId(s.category_id ?? s.categoryId ?? s.category),
        subcategory_id: normalizeId(
          s.subcategory_id ?? s.subcategoryId ?? s.subcategory ?? s.sub_id ?? s.subId
        ),
        clinic_id: normalizeId(s.clinic_id ?? s.clinicId ?? s.clinic ?? user?.id ?? user?._id),
      }));
      setSelectedServices(saved);
    } catch (error) {
      console.error("fetchSavedServices error:", error);
      toast.error("Failed to fetch saved services");
    }
  };

  const handleDeleteTreatment = async (categoryId, treatmentId) => {
    try {
      await axios.post(`${API_BASE_URL}/DeleteClinicTreatment`, { treatment_id: treatmentId });
      toast.success("Treatment deleted");
      await fetchSubCategories(categoryId);
    } catch (error) {
      console.error("handleDeleteTreatment error:", error);
      toast.error("Failed to delete treatment");
    }
  };

  const handleCheckboxChange = (categoryIdRaw, subcategoryIdRaw, checked) => {
    const categoryId = normalizeId(categoryIdRaw);
    const subcategoryId = normalizeId(subcategoryIdRaw);
    const clinicId = normalizeId(user?.id ?? user?._id);

    if (checked) {
      setSelectedServices((prev) => {
        const exists = prev.some(
          (s) =>
            String(s.category_id) === categoryId && String(s.subcategory_id) === subcategoryId
        );
        if (exists) return prev;
        return [...prev, { category_id: categoryId, subcategory_id: subcategoryId, clinic_id: clinicId }];
      });
    } else {
      setSelectedServices((prev) =>
        prev.filter(
          (s) =>
            !(
              String(s.category_id) === categoryId &&
              String(s.subcategory_id) === subcategoryId &&
              String(s.clinic_id) === clinicId
            )
        )
      );
    }
  };

const handleSave = async () => {
  setSavingStatus("saving");

  try {
    const res = await axios.post(`${API_BASE_URL}/SaveClinicServices`, {
      services: selectedServices
    });

    // 🔴 If backend returns status = false → treat as error
    if (res.data?.status === false) {
      setSavingStatus("error");
      toast.error(res.data.message || "Failed to save services");
      return; // ⛔ STOP execution (don't push, don't show success)
    }

    // 🟢 Success
    setSavingStatus("saved");
    toast.success("Services saved successfully!");
    router.push("/clinic/operational-details/list");

    setTimeout(() => setSavingStatus("idle"), 2000);

  } catch (error) {
    console.error("handleSave error:", error);
    setSavingStatus("error");

    const msg =
      error.response?.data?.message || "Failed to save services";

    toast.error(msg);
  }
}

  const handleEditClick = (categoryIdRaw, sub, name) => {
    const subId = sub?.id ?? sub?._id ?? sub?.service_id ?? sub?.serviceId;
    setEditingService({
      categoryId: categoryIdRaw,
      subId,
      name,
      created_by: sub?.created_by ?? null,
    });
    setPreInstruction(sub?.precare ?? sub?.pre_care ?? sub?.pre_instruction ?? "");
    setPostInstruction(sub?.postcare ?? sub?.post_care ?? sub?.post_instruction ?? "");
  };

  const handleUpdateInstructions = async () => {
    if (!editingService) return;
    try {
      await axios.post(`${API_BASE_URL}/SaveClinicServiceInstructions`, {
        clinic_id: user?.id ?? user?._id,
        category_id: editingService.categoryId,
        subcategory_id: editingService.subId,
        pre_instruction: preInstruction,
        post_instruction: postInstruction,
        ...(editingService?.created_by === String(user?.id ?? user?._id) && {
          name: editingService.name,
        }),
      });
      toast.success("Instructions updated!");
      await fetchSubCategories(editingService.categoryId);
    } catch (error) {
      console.error("handleUpdateInstructions error:", error);
      toast.error("Failed to update instructions");
    }
  };

  const handleAddMoreTreatments = (categoryId) => {
    setNewTreatmentsByCategory((prev) => {
      const list = prev[normalizeId(categoryId)] || [];
      return {
        ...prev,
        [normalizeId(categoryId)]: [
          ...list,
          { name: "", pre_instruction: "", post_instruction: "", key: Date.now() },
        ],
      };
    });
  };

  const handleNewTreatmentChange = (categoryId, index, field, value) => {
    setNewTreatmentsByCategory((prev) => {
      const list = prev[normalizeId(categoryId)] || [];
      const updatedList = [...list];
      updatedList[index] = { ...updatedList[index], [field]: value };
      return { ...prev, [normalizeId(categoryId)]: updatedList };
    });
  };

  const handleSaveAllTreatments = async (categoryIdRaw) => {
    const catKey = normalizeId(categoryIdRaw);
    const newTreatments = newTreatmentsByCategory[catKey] || [];
    const validTreatments = newTreatments.filter((t) => t.name?.trim());

    if (!validTreatments.length) {
      toast.error("Please add at least one valid treatment name");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/AddClinicTreatment`, {
        clinic_id: user?.id ?? user?._id,
        category_id: categoryIdRaw,
        treatments: validTreatments,
      });
      await fetchSubCategories(categoryIdRaw);
      toast.success("All treatments saved successfully!");
      setNewTreatmentsByCategory((prev) => ({ ...prev, [catKey]: [] }));
    } catch (error) {
      console.error("handleSaveAllTreatments error:", error);
      toast.error("Failed to save treatments");
    }
  };

  const handleCancelNewTreatments = (categoryId) => {
    setNewTreatmentsByCategory((prev) => ({ ...prev, [normalizeId(categoryId)]: [] }));
  };

  const handleDeleteSingleNewTreatment = (categoryId, index) => {
    setNewTreatmentsByCategory((prev) => {
      const updated = [...(prev[normalizeId(categoryId)] || [])];
      updated.splice(index, 1);
      return { ...prev, [normalizeId(categoryId)]: updated };
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (user?.id || user?._id) fetchSavedServices();
  }, [user, categories]);

  const toggleMenu = (menuName) => setOpenMenu(openMenu === menuName ? null : menuName);

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
                <div className="sidebars settings-sidebar" id="sidebar2">
                  <div className="sticky-sidebar sidebar-inner" data-simplebar="">
                    <div id="sidebar-menu5" className="sidebar-menu mt-0 p-0">
                      <ul>
                        <li>
                          <ul>
                            <li className={openMenu === "manageClinic" ? "active" : ""}>
                              <a
                                className="style-sidebar"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleMenu("manageClinic");
                                }}
                              >
                                <i className="ti ti-medical-cross"></i>
                                <span>Manage Clinic</span>
                                <span className={`menu-arrow ${openMenu === "manageClinic" ? "rotated" : ""}`}></span>
                              </a>
                              <ul
                                className="submenu-list"
                                style={{
                                  display: openMenu === "manageClinic" ? "none" : "block",
                                }}
                              >
                                <li className="submenu">
                                  <Link href="/clinic/basic-Information/list">
                                    <span className="sub-item">Basic Information</span>
                                  </Link>
                                </li>
                                <li className="submenu">
                                  <Link href="/clinic/services-clinic/list">
                                    <span className="sub-item">Services & Specializations</span>
                                  </Link>
                                </li>
                                <li className="submenu">
                                  <Link href="/clinic/operational-details/list">
                                    <span className="sub-item">Operational Details</span>
                                  </Link>
                                </li>
                                <li className="submenu">
                                  <Link href="/clinic/portfolio-clinic/list">
                                    <span className="sub-item">Portfolio/Gallery</span>
                                  </Link>
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
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
                            const categoryId = category.id ?? category._id;
                            const catKey = normalizeId(categoryId);

                            return (
                              <div className="accordion-item" key={catKey}>
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
                                    {category.title}
                                  </button>
                                </h2>
                                <div
                                  id={`collapse-${index}`}
                                  className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                                >
                                  <div className="accordion-body">
                                    {/* Select All Checkbox */}
                                    <div className="form-check mb-3">
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`select-all-${catKey}`}
                                        checked={
                                          subCategories[catKey]?.every((sub) =>
                                            selectedServices.some(
                                              (s) =>
                                                String(s.category_id) === catKey &&
                                                String(s.subcategory_id) === normalizeId(
                                                  sub.id ?? sub._id ?? sub.service_id ?? sub.serviceId
                                                )
                                            )
                                          ) && subCategories[catKey]?.length > 0
                                        }
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          subCategories[catKey]?.forEach((sub) => {
                                            const subId = sub.id ?? sub._id ?? sub.service_id ?? sub.serviceId;
                                            handleCheckboxChange(categoryId, subId, checked);
                                          });
                                        }}
                                      />
                                      <label className="ms-2 form-check-label" htmlFor={`select-all-${catKey}`}>
                                        Select All
                                      </label>
                                    </div>

                                    {(subCategories[catKey] || []).map((sub) => {
                                      const subId = sub.id ?? sub._id ?? sub.service_id ?? sub.serviceId;
                                      const subKey = normalizeId(subId);
                                      const isChecked = selectedServices.some(
                                        (s) =>
                                          String(s.category_id) === catKey &&
                                          String(s.subcategory_id) === subKey
                                      );

                                      return (
                                        <div className="form-check mb-3 form-check-inline" key={subKey}>
                                          <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`srvc-${catKey}-${subKey}`}
                                            checked={isChecked}
                                            onChange={(e) =>
                                              handleCheckboxChange(categoryId, subId, e.target.checked)
                                            }
                                          />
                                          <label
                                            className="ms-2 form-check-label"
                                            htmlFor={`srvc-${catKey}-${subKey}`}
                                          >
                                            {sub.name ?? sub.title ?? sub.service_name ?? "-"}
                                          </label>
                                          <a
                                            href="#!"
                                            className="ms-2"
                                            data-bs-toggle="offcanvas"
                                            data-bs-target="#edit-instructions"
                                            onClick={() => handleEditClick(categoryId, sub, sub.name ?? sub.title)}
                                          >
                                            <i className="theme-clr ms-2 ti ti-pencil"></i>
                                          </a>
                                        </div>
                                      );
                                    })}

                                    {/* Treatments and New Treatments */}
                                    <div className="mt-4">
                                      {(treatmentsByCategory[catKey] || []).map((treat) => (
                                        <div key={treat.id} className="d-flex justify-content-between align-items-center mb-2">
                                          <div>
                                            <strong>{treat.name}</strong>
                                            <div style={{ fontSize: 12, color: "#666" }}>
                                              <em>Pre Care:</em> {treat.pre_instruction || "-"}
                                              <br />
                                              <em>Post Care:</em> {treat.post_instruction || "-"}
                                            </div>
                                          </div>
                                          <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteTreatment(categoryId, treat.id)}
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      ))}

                                      {(newTreatmentsByCategory[catKey] || []).map((nt, idx) => (
                                        <div key={nt.key} className="d-flex mb-2">
                                          <input
                                            type="text"
                                            className="form-control me-2"
                                            placeholder="Treatment Name"
                                            value={nt.name}
                                            onChange={(e) =>
                                              handleNewTreatmentChange(categoryId, idx, "name", e.target.value)
                                            }
                                          />
                                          <button
                                            className="btn btn-outline-danger"
                                            onClick={() => handleDeleteSingleNewTreatment(categoryId, idx)}
                                          >
                                            X
                                          </button>
                                        </div>
                                      ))}

                                      <div className="mt-2">
                                        <button
                                          className="btn btn-sm btn-outline-primary me-2"
                                          onClick={() => handleAddMoreTreatments(categoryId)}
                                        >
                                          Add More
                                        </button>
                                        {newTreatmentsByCategory[catKey]?.length > 0 && (
                                          <>
                                            <button
                                              className="btn btn-sm btn-success me-2"
                                              onClick={() => handleSaveAllTreatments(categoryId)}
                                            >
                                              Save All
                                            </button>
                                            <button
                                              className="btn btn-sm btn-secondary"
                                              onClick={() => handleCancelNewTreatments(categoryId)}
                                            >
                                              Cancel
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-end">
                      <button className="btn btn-primary" onClick={handleSave} disabled={savingStatus === "saving"}>
                        {savingStatus === "saving" ? "Saving..." : "Save Selected Services"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 

      {/* Offcanvas for Edit Instructions */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="edit-instructions"
        aria-labelledby="edit-instructions-label"
      >
        <div className="offcanvas-header">
          <h5 id="edit-instructions-label">Edit Instructions</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <label className="form-label">Pre Care Instructions</label>
          <CKEditor
            editor={ClassicEditor}
            data={preInstruction}
            onChange={(event, editor) => setPreInstruction(editor.getData())}
          />
          <label className="form-label mt-3">Post Care Instructions</label>
          <CKEditor
            editor={ClassicEditor}
            data={postInstruction}
            onChange={(event, editor) => setPostInstruction(editor.getData())}
          />
          <div className="mt-3 text-end">
            <button className="btn btn-primary" onClick={handleUpdateInstructions}>
              Save Instructions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
