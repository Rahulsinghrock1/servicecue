"use client";
import Link from "next/link";
import { useUser } from "@context/UserContext";
import { useEffect, useState } from "react";
import axios from "axios";
import MainConfig from "@/mainconfig";

export default function AdminSidebar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const { user } = useUser();
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const [pages, setPages] = useState([]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/Pages`);
        setPages(res.data.data || []);
      } catch (error) {
        console.error("Error fetching pages:", error);
      }
    };
    fetchPages();
  }, [API_BASE_URL]);

  return (
    <div className="sidebar" id="sidebar">
      {/* Sidebar Logo */}
      <div className="sidebar-logo">
        <div>
          <Link href="/admin" className="logo logo-normal">
            <img src="/web/assets/img/logo.png" alt="Logo" />
          </Link>
          <Link href="/admin" className="logo-small">
            <img src="/web/assets/img/favicon.png" alt="Logo" />
          </Link>
          <Link href="/admin" className="dark-logo">
            <img src="/web/assets/img/logo-white.png" alt="Logo" />
          </Link>
        </div>
      </div>
      {/* Sidebar Content */}
      <div className="sidebar-inner" data-simplebar="">
        <div id="sidebar-menu" className="sidebar-menu">
          {/* Clinic Info */}
          <div className="sidebar-top shadow-sm p-2 rounded-1 mb-3 dropend">
            <a href="#">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <span className="avatar rounded-circle flex-shrink-0 p-2">
                    <img
                      src={user?.avatar || "/assets/img/profiles/avatar-1.jpg"}
                      alt="User Avatar"
                    />
                  </span>
                  <div className="ms-2">
                    <h6 className="fs-14 fw-semibold mb-0">
                      {user?.full_name || "unknown"}
                    </h6>
                    <p className="fs-13 mb-0">{user?.country || "unknown"}</p>
                  </div>
                </div>
              </div>
            </a>
          </div>
          {/* Navigation */}
          <ul>
            {/* Main Menu */}
            <li className="menu-title">
              <span>Main Menu</span>
            </li>
            <li>
              <ul>
                <li>
                  <Link href="/clinic" className="nav-link">
                    <i className="ti ti-layout-dashboard"></i>
                    <span>Dashboard</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Manage Clinic */}
            <li>
              <ul>
                <li className={openMenu === "manageClinic" ? "active" : ""}>
                  <button
                    type="button"
                    onClick={() => toggleMenu("manageClinic")}
                    className="menu-toggle-btn"
                    aria-expanded={openMenu === "manageClinic"}
                    aria-controls="manageClinic-menu"
                  >
                    <i className="ti ti-medical-cross"></i>
                    <span>Manage Clinic</span>
                    <span
                      className={`menu-arrow ${
                        openMenu === "manageClinic" ? "rotated" : ""
                      }`}
                    ></span>
                  </button>

                  {hydrated && openMenu === "manageClinic" && (
                    <ul className="submenu-list" id="manageClinic-menu">
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
                  )}
                </li>
              </ul>
            </li>

            {/* Doctors/Staffs */}
            <li>
              <ul>
                <li className={openMenu === "doctorsStaffs" ? "active" : ""}>
                  <button
                    type="button"
                    onClick={() => toggleMenu("doctorsStaffs")}
                    className="menu-toggle-btn"
                    aria-expanded={openMenu === "doctorsStaffs"}
                    aria-controls="doctorsStaffs-menu"
                  >
                    <i className="ti ti-user-plus"></i>
                    <span>Staffs</span>
                    <span
                      className={`menu-arrow ${
                        openMenu === "doctorsStaffs" ? "rotated" : ""
                      }`}
                    ></span>
                  </button>

                  {hydrated && openMenu === "doctorsStaffs" && (
                    <ul className="submenu-list" id="doctorsStaffs-menu">
                      <li className="submenu">
                        <Link href="/clinic/staff/list">
                          <span className="sub-item">All Staffs</span>
                        </Link>
                      </li>

                      <li className="submenu">
                        <Link href="/clinic/staff/create">
                          <span className="sub-item">Add Staff</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </li>

            {/* All Clients */}
            <li>
              <ul>
                <li className={openMenu === "clients" ? "active" : ""}>
                  <button
                    type="button"
                    onClick={() => toggleMenu("clients")}
                    className="menu-toggle-btn"
                    aria-expanded={openMenu === "clients"}
                    aria-controls="clients-menu"
                  >
                    <i className="ti ti-user-plus"></i>
                    <span>All Clients</span>
                    <span
                      className={`menu-arrow ${
                        openMenu === "clients" ? "rotated" : ""
                      }`}
                    ></span>
                  </button>

                  {hydrated && openMenu === "clients" && (
                    <ul className="submenu-list" id="clients-menu">
                      <li className="submenu">
                        <Link href="/clinic/client/list">
                          <span className="sub-item">All Client</span>
                        </Link>
                      </li>

                      <li className="submenu">
                        <Link href="/clinic/client/create">
                          <span className="sub-item">Add Client</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </li>

            {/* Enquiries */}
            <li>
              <ul>
                <li>
                  <Link href="/clinic/enquiries/list" className="nav-link">
                    <i className="ti ti-messages"></i>
                    <span>Enquiries</span>
                  </Link>
                </li>
              </ul>
            </li>


            {/* All Clients */}
            <li>
              <ul>
                <li className={openMenu === "product" ? "active" : ""}>
                  <button
                    type="button"
                    onClick={() => toggleMenu("product")}
                    className="menu-toggle-btn"
                    aria-expanded={openMenu === "product"}
                    aria-controls="clients-menu"
                  >
                    <i className="ti ti-shopping-cart"></i>

                    <span>All Product</span>
                    <span
                      className={`menu-arrow ${
                        openMenu === "product" ? "rotated" : ""
                      }`}
                    ></span>
                  </button>

                  {hydrated && openMenu === "product" && (
                    <ul className="submenu-list" id="clients-menu">
                      <li className="submenu">
                        <Link href="/clinic/product/list">
                          <span className="sub-item">All Products</span>
                        </Link>
                      </li>

                         <li className="submenu">
                        <Link href="/clinic/product/exiting">
                          <span className="sub-item">Exiting Products</span>
                        </Link>
                      </li>

                      <li className="submenu">
                        <Link href="/clinic/product/create">
                          <span className="sub-item">Add Product</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </li>

            <li>
              <ul>

                    <li>
                  <Link href="/clinic/subscription/list">
                    <i className="ti ti-user-edit"></i> <span>My Subscription</span>
                  </Link>
                </li>
               
                <li>
                  <Link href="/clinic/my-profile">
                    <i className="ti ti-user-edit"></i> <span>Edit Profile</span>
                  </Link>
                </li>
             
                <li>
                  <Link href="/clinic/change-password" className="dropdown-item">
                    <i className="ti ti-restore"></i>
                    <span>Update Password</span>
                  </Link>
                </li>
                <li>
                  <Link href="/clinic/logout" className="text-danger">
                    <i className="ti ti-logout"></i>
                    <span>Log Out</span>
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="sidebar-footer border-top mt-3">
          <div className="trial-item mt-0 p-3 text-center">
            <div className="trial-item-icon rounded-4 mb-3 p-2 text-center shadow-sm d-inline-flex">
              <img src="/web/assets/img/favicon.png" width="40" alt="img" />
            </div>
            <div>
              <h6 className="fs-14 fw-semibold mb-1">ServiceCue</h6>
              <p className="fs-13 mb-0">2025 © Service Cue, All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
