"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainConfig from "@/mainconfig";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useUser } from "@context/UserContext";
import TimePicker from "react-time-picker";
import 'react-time-picker/dist/TimePicker.css';
import { toast } from "react-hot-toast";
import { useRouter } from 'next/navigation';

export default function ClinicProfileForm() {
  const router = useRouter();
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const { user } = useUser();
  const clinicId = user?.id ? Number(user.id) : null;

  const daysList = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [workingDays, setWorkingDays] = useState([]);
  const [breaks, setBreaks] = useState([]);

  // ✅ Fetch clinic operational details on mount
  useEffect(() => {
    if (!clinicId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/clinic-operational-details/get`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clinic_id: clinicId }),
          }
        );

        if (res.ok) {
          const result = await res.json();

          // Separate workingDays and breaks from API response
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

          // Fallback defaults agar API me empty ho
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
        }
      } catch (error) {
        toast.error("Fetch Error:", error);
      }
    };

    fetchData();
  }, [clinicId]);

  // Toggle day active/inactive
  const toggleDay = (index) => {
    const updated = [...workingDays];
    updated[index].active = !updated[index].active;
    setWorkingDays(updated);
  };

  // Update working time
  const updateDayTime = (index, key, value) => {
    const updated = [...workingDays];
    updated[index][key] = value;
    setWorkingDays(updated);
  };

  // Add break row
  const addBreak = () => {
    setBreaks([...breaks, { name: "", from: "12:00", to: "13:00" }]);
  };

  // Update break
  const updateBreak = (index, key, value) => {
    const updated = [...breaks];
    updated[index][key] = value;
    setBreaks(updated);
  };

  // Remove break
  const removeBreak = (index) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This break will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setBreaks(breaks.filter((_, i) => i !== index));
        Swal.fire("Deleted!", "Break has been removed.", "success");
      }
    });
  };

  // ✅ Save handler
  const handleSave = async () => {


      try {
        const res = await fetch(`${API_BASE_URL}/clinic-operational-details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinic_id: clinicId,
            workingDays,
            breaks,
          }),
        });

        if (res.ok) {
          toast.success("Operational details updated successfully.");
          router.push("/clinic/portfolio-clinic/list");
        } else {
           toast.error("Something went wrong while saving.");
        }
      } catch (error) {
        toast.error("Network issue while saving.");
      }
 
  };

  // ✅ Delete handler
  const handleDelete = async () => {
    const confirmDelete = await Swal.fire({
      title: "Delete All?",
      text: "Do you want to delete all clinic operational details?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (confirmDelete.isConfirmed) {
      try {
        const res = await fetch(
          `${API_BASE_URL}/clinic-operational-details/${clinicId}`,
          { method: "DELETE" }
        );

        if (res.ok) {
          setWorkingDays(
            daysList.map((day) => ({
              day,
              active: true,
              from: "09:00",
              to: "17:00",
            }))
          );
          setBreaks([]);
          Swal.fire("Deleted!", "All operational details deleted.", "success");
        } else {
          Swal.fire("Error", "Something went wrong while deleting.", "error");
        }
      } catch (error) {
        console.error("Delete Error:", error);
        Swal.fire("Error", "Network issue while deleting.", "error");
      }
    }
  };

      const [openMenu, setOpenMenu] = useState(null);
  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

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
              <li>
              <ul>
         <li className={openMenu === "manageClinic" ? "active" : ""}>
        <a className="style-sidebar"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            toggleMenu("manageClinic");
          }}
        >
          <i className="ti ti-medical-cross"></i>
          <span>Manage Clinic</span>
          <span
            className={`menu-arrow ${
              openMenu === "manageClinic" ? "rotated" : ""
            }`}
          ></span>
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

                {/* Form Card */}
                <div className="card flex-fill mb-0 border-0 bg-light-500 shadow-none">
                  <div className="card-header border-bottom pb-1 px-0 mx-3 d-flex justify-content-between align-items-center">
                    <h4 className="pt-2 fw-bold">
                      Operational Details (Working Hours)
                    </h4>
           
                  </div>
                  <div className="card-body px-0 mx-3 break-hours-section">
                    {/* Working Days */}
                    <h5 className="fw-bold mb-3">Working Days</h5>
                    {workingDays.map((day, i) => (
                      <div key={i} className="row align-items-center mb-3">
                        <div className="col-lg-6">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input me-1"
                              type="checkbox"
                              checked={day.active}
                              onChange={() => toggleDay(i)}
                            />
                            <label className="fw-normal">{day.day}</label>
                          </div>
                        </div>
                        <div className="col-lg-6 d-flex align-items-center">



                          <input
                            type="time"
                            value={day.from}
                            onChange={(e) =>
                              updateDayTime(i, "from", e.target.value)
                            }
                            className="form-control me-2"
                            disabled={!day.active}
                          />
                          <span className="me-2">to</span>
                          <input
                            type="time"
                            value={day.to}
                            onChange={(e) =>
                              updateDayTime(i, "to", e.target.value)
                            }
                            className="form-control"
                            disabled={!day.active}
                          />
                        </div>
                      </div>
                    ))}

<div className=" pb-3 mb-3 border-bottom"></div>
                    {/* Break Hours */}
                    <div className="mt-4">
                      <div className="d-flex justify-content-between mb-3">
                        <h5 className="fw-bold">Break Hours</h5>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={addBreak}
                        >
                          + Add New
                        </button>
                      </div>
                      {breaks.map((b, i) => (
                        <div key={i} className="row align-items-center mb-2">
                          <div className="col-lg-3">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Break Name"
                              value={b.name}
                              onChange={(e) =>
                                updateBreak(i, "name", e.target.value)
                              }
                            />
                          </div>
                          <div className="col-lg-8 d-flex align-items-center">
                            <input
                              type="time"
                              value={b.from}
                              onChange={(e) =>
                                updateBreak(i, "from", e.target.value)
                              }
                              className="form-control me-2"
                            />
                            <span className="me-2">to</span>
                            <input
                              type="time"
                              value={b.to}
                              onChange={(e) =>
                                updateBreak(i, "to", e.target.value)
                              }
                              className="form-control me-2"
                            />
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeBreak(i)}
                            >
                              <i className="ti ti-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Save Button */}
                    <div className="d-flex justify-content-end mt-4">
                      <button
                        className="btn btn-lg btn-primary"
                        onClick={handleSave}
                      >
                        Save Changes
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
