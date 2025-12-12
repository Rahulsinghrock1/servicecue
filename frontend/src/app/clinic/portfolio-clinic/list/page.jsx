"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { useUser } from "@context/UserContext";
import axios from 'axios';


export default function ClinicProfileForm() {
  const { user } = useUser();
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [files, setFiles] = useState([]); // New files (not uploaded yet)
  const [savedImages, setSavedImages] = useState([]); 
  const [selectedRow, setSelectedRow] = useState(null);

  const clinicId = user?.id ? Number(user.id) : null; 

  // Dropzone
  const onDrop = (acceptedFiles) => {
    if (files.length + acceptedFiles.length > 20) {
      toast.error("You can upload a maximum of 20 images.");
      return;
    }

    const filteredFiles = acceptedFiles.filter((file) => {
      const isValidSize = file.size <= 1024 * 1024; // 1MB
      const isValidType = ["image/jpeg", "image/png"].includes(file.type);
      return isValidSize && isValidType;
    });

    const previewFiles = filteredFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );

    setFiles((prev) => [...prev, ...previewFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [] },
    maxSize: 1024 * 1024,
  });

  // Remove file from upload list
  const removeFile = (fileName) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  // Save Portfolio (Upload to backend)
  const handleSave = async () => {
    if (!clinicId) {
      toast.error("Clinic ID not found!");
      return;
    }

    if (files.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    const formData = new FormData();
    formData.append("clinic_id", clinicId);
    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await fetch(`${API_BASE_URL}/clinic-portfolio/save`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Portfolio saved successfully!");
        setFiles([]);
        fetchPortfolio(); // refresh gallery
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Something went wrong");
    }
  };

  // Fetch saved images
  const fetchPortfolio = async () => {
    if (!clinicId) return; // user load होने तक wait

    try {
      const res = await fetch(`${API_BASE_URL}/clinic-portfolio/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic_id: clinicId }),
      });

      const data = await res.json();
      if (res.ok) {
        setSavedImages(data.data || []);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };


const handleDelete = (row) => {
  setSelectedRow(row); // set selected row for modal
  // then open modal (already triggered with data-bs-toggle="modal")
};

const handleConfirmDelete = async () => {
  if (!selectedRow) {
    console.log("No selectedRow!");
    return;
  }
  console.log("Deleting ID:", selectedRow.id);
  try {
    await axios.delete(`${API_BASE_URL}/clinic-portfolio/${selectedRow.id}`);
    toast.success("Image has been deleted.");
    setSavedImages((prev) => prev.filter((img) => img.id !== selectedRow.id));
    setSelectedRow(null);
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Failed to delete user");
  }
};



  // Fetch gallery when clinicId available
  useEffect(() => {
    if (clinicId) {
      fetchPortfolio();
    }
  }, [clinicId]);

        const [openMenu, setOpenMenu] = useState(null);
  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <div className="page-inner">
      <div className="row">
        <div className="col-12">
          <h4 className="fw-bold mb-3">Manage Clinic</h4>
          <div className="card">
            <div className="card-body p-0">
              <div className="settings-wrapper d-flex">
                {/* Sidebar */}
                <div className="sidebars settings-sidebar" id="sidebar2">
                  <div
                    className="sticky-sidebar sidebar-inner"
                    data-simplebar=""
                  >
                    <div
                      id="sidebar-menu5"
                      className="sidebar-menu mt-0 p-0"
                    >
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

                {/* Portfolio Form */}
                <div className="card flex-fill mb-0 border-0 bg-light-500 shadow-none">
                  <div className="card-header border-bottom pb-1 px-0 mx-3">
                    <h4 className="pt-2 fw-bold">Portfolio/Gallery</h4>
                  </div>
                  <div className="card-body px-0 mx-3 break-hours-section">
                    {/* Dropzone */}
                    <div
                      {...getRootProps({
                        className:
                          "text-center m-4 dz-message needsclick dropzone",
                      })}
                    >
                      <input {...getInputProps()} />
                      <i className="ti ti-cloud-upload h1 text-muted"></i>
                      <h3>Drop files here or click to upload.</h3>
                      <small className="text-muted">
                        (Upload up to 20 images. Max file size 1 MB in png/jpg
                        format)
                      </small>
                    </div>

                    {/* Preview List (before upload) */}
                    <div className="mt-4">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="d-flex align-items-center border p-2 mb-2 rounded"
                        >
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="rounded me-3"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                          <div className="flex-grow-1">
                            <p className="mb-0 fw-semibold">{file.name}</p>
                            <small className="text-muted">
                              {(file.size / 1024).toFixed(1)} KB
                            </small>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={() => removeFile(file.name)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex align-items-center py-4 mb-4 border-bottom justify-content-end">
                      <button
                        className="btn btn-lg btn-primary"
                        onClick={handleSave}
                      >
                        Save Portfolio
                      </button>
                    </div>

          {/* Saved Gallery */}
<h5>Gallery Pictures</h5>
{savedImages.length > 0 ? (
  <div className="row mt-2 row-gap-3 mb-3">
    {savedImages.map((img) => (
      <div
        key={img.id}
        className="col-lg-3 col-xl-3 col-6 col-md-4 position-relative"
      >
        <a href={img.image_url} className="image-popup">
          <img
            src={img.image_url}
            alt="portfolio"
            className="rounded w-100 img-fluid"
          />
        </a>
        <div className="d-flex position-absolute top-0 right-0 z-2 p-2">
          <a
            href="javascript:void(0);"
            className="bg-danger text-light btn-icon btn-sm d-flex justify-content-center align-items-center rounded me-2"
            data-bs-toggle="modal"
            data-bs-target="#delete_user"
            onClick={() => handleDelete(img)}
          >
            <i className="ti ti-trash"></i>
          </a>
        </div>
      </div>
    ))}
  </div>
) : (
  <p>No gallery images available.</p> // You can replace this with any fallback text or empty state UI
)}

                  </div>
                </div>
                {/* End Portfolio Form */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="delete_user"
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
                  onClick={handleConfirmDelete}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
