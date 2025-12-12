"use client";
import { useUser } from "@context/UserContext";
import Link from "next/link";
import MainConfig from "@/mainconfig";
import { FaHandPaper } from "react-icons/fa"; 

export default function AdminHeader() {
  const { user } = useUser();

  return (

  <header className="navbar-header">
      <div className="page-container topbar-menu">
        <div className="d-flex align-items-center gap-2">
          <a href="/admin" className="logo">
            <span className="logo-light">
              <span className="logo-lg">
                <img src="/assets/img/logo.png" alt="logo" />
              </span>
              <span className="logo-sm">
                <img src="/assets/img/favicon.png" alt="small logo" />
              </span>
            </span>
            <span className="logo-dark">
              <span className="logo-lg">
                <img src="/assets/img/logo-white.png" alt="dark logo" />
              </span>
            </span>
          </a>

          <a id="mobile_btn" className="mobile-btn" href="#sidebar">
            <i className="ti ti-menu-deep fs-24"></i>
          </a>

          <button className="sidenav-toggle-btn btn border-0 p-0 active" id="toggle_btn2">
            <i className="ti ti-arrow-right"></i>
          </button>
        </div>

        <div className="d-flex align-items-center">

     

          {/* Profile Dropdown */}
          <div className="dropdown profile-dropdown d-flex align-items-center justify-content-center">
            <a
              href="#"
              className="topbar-link dropdown-toggle top-avatar drop-arrow-none position-relative"
              data-bs-toggle="dropdown"
              data-bs-offset="0,22"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <img
                src={user?.avatar || '/assets/img/profiles/avatar-1.jpg'}
                width="32"
                className="rounded-circle d-flex"
                alt="user-image"
              />
              <span className="online text-success">
                <i className="ti ti-circle-filled d-flex bg-white rounded-circle border border-1 border-white"></i>
              </span>
            </a>

            <div className="dropdown-menu dropdown-menu-end top-drop dropdown-menu-md p-2">
              <div className="d-flex align-items-center bg-light rounded-3 p-2 mb-2">
                <img
                  src={user?.avatar || '/assets/img/profiles/avatar-1.jpg'}
                  className="rounded-circle"
                  width="42"
                  height="42"
                  alt=""
                />
                <div className="ms-2">
                  <p className="fw-medium text-dark mb-0">{user?.full_name || "Emilly Smith"}</p>
                  <span className="d-block fs-13">{user?.role || "Clinic"}</span>
                </div>
              </div>

              <Link href="/clinic/my-profile" className="dropdown-item">
                <i className="ti ti-user-circle me-1 align-middle"></i>
                <span className="align-middle">Edit Profile</span>
              </Link>
              <Link href="/clinic/change-password" className="dropdown-item">
                <i className="ti ti-key me-1 align-middle"></i>
                <span className="align-middle">Update Password</span>
              </Link>



              <div className="pt-2 mt-2 border-top">
                <Link href="/clinic/logout" className="dropdown-item text-danger">
                  <i className="ti ti-logout me-1 fs-17 align-middle"></i>
                  <span className="align-middle">Log Out</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
