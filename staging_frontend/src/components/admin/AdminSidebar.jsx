"use client";
import Link from "next/link";
import { useUser } from "@context/UserContext";
import { useEffect, useState } from "react";
import axios from "axios";
import MainConfig from "@/mainconfig"; 
export default function AdminSidebar() {
  const [openMenu, setOpenMenu] = useState(null);
  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };
    const { user } = useUser();
    const API_BASE_URL = MainConfig.API_BASE_URL;
    const [pages, setPages] = useState([]);
    useEffect(() => {
        const fetchPages = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/Pages`); // ✅ GET API call
                setPages(res.data.data || []); // ✅ "data" array set karna hai
            } catch (error) {
                console.error("Error fetching pages:", error);
            }
        };
        fetchPages();
    }, []);

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

          <ul>
            <li>
              <ul>
                <li>
                    <Link href="/admin" className="nav-link">
                        <i className="ti ti-layout-dashboard"></i>
                        <span>Dashboard</span>
                    </Link>
                </li>
              </ul>
            </li>

            <li>
              <ul>
                <li>
                    <Link href="/admin/category/list" className="nav-link">
                       <i className="ti ti-category"></i>
                        <span>Category</span>
                    </Link>
                </li>
              </ul>
            </li>

            
            <li>
              <ul>
                <li>
                    <Link href="/admin/productcategory/list" className="nav-link">
                       <i className="ti ti-category"></i>
                        <span>Product Category</span>
                    </Link>
                </li>
              </ul>
            </li>

              <li>
              <ul>
                <li>
                    <Link href="/admin/services/list" className="nav-link">
                        <i className="ti ti-layout-dashboard"></i>
                        <span>Services</span>
                    </Link>
                </li>
              </ul>
            </li>



              <li>
              <ul>
                <li>
                    <Link href="/admin/product/list" className="nav-link">
               <i className="ti ti-shopping-cart"></i>

                        <span>Products</span>
                    </Link>
                </li>
              </ul>
            </li>


            <li>
              <ul>
                <li>
                    <Link href="/admin/users/list" className="nav-link">
                        <i className="ti ti-users"></i>
                        <span>Users</span>
                    </Link>
                </li>
              </ul>
            </li>

                 <li>
              <ul>
                <li>
                    <Link href="/admin/clinic/list" className="nav-link">
                        <i className="ti ti-users"></i>
                        <span>Clinic</span>
                    </Link>
                </li>
              </ul>
            </li>


                     





            <li>
              <ul>
                <li>

         <Link href="/admin/my-profile">
                       <i className="ti ti-user-edit"></i> <span>Edit Profile</span>
                    </Link>

                </li>
                <li>
                  <Link href="/admin/change-password" className="dropdown-item">
                       <i className="ti ti-restore"></i>
                    <span>Update Password</span>
                    </Link>

                </li>
<li>
                     <Link href="/admin/logout" className="text-danger">
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
