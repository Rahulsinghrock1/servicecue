"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { FaEye, FaKey } from "react-icons/fa";

export default function SiteList() {
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subFilter, setSubFilter] = useState("all"); // Filter for subscription status

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Fetch users
  const fetchUsers = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/Users`, {
        user_role_id: 4, // Clinic users
      });
      setSites(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // ✅ View User Details (Popup)
  const handleView = (row) => {
    Swal.fire({
      title: `<strong>${row.full_name}</strong>`,
      html: `
        <p><b>Email:</b> ${row.email || "N/A"}</p>
        <p><b>Mobile:</b> ${row.country_code || ""} ${row.mobile || "N/A"}</p>
        <p><b>Gender:</b> ${row.gender || "N/A"}</p>
        <p><b>DOB:</b> ${row.dob || "N/A"}</p>
        <p><b>Created At:</b> ${
          row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"
        }</p>
        <p><b>Subscription End:</b> ${
          row.subscription?.ends_at
            ? new Date(row.subscription.ends_at).toLocaleDateString()
            : "N/A"
        }</p>
      `,
      imageUrl: row.avatar || "https://via.placeholder.com/150",
      imageWidth: 120,
      imageHeight: 120,
      imageAlt: "User Avatar",
      confirmButtonText: "Close",
    });
  };

  // ✅ Delete User
  const handleDelete = async (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${row.full_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/Users/${row.id}`);
          toast.success("User deleted successfully!");
          setSites(sites.filter((u) => u.id !== row.id));
        } catch (error) {
          toast.error("Failed to delete user");
        }
      }
    });
  };

  // ✅ Change Password
  const handleChangePassword = async (row) => {
  const { value: formValues } = await Swal.fire({
    title: `Change Password for ${row.full_name}`,
    html: `
      <input type="password" id="newPass" class="swal2-input" placeholder="New Password" />
      <input type="password" id="confirmPass" class="swal2-input" placeholder="Confirm Password" />
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Update",
    cancelButtonText: "Cancel",
    preConfirm: () => {
      const newPass = document.getElementById("newPass").value.trim();
      const confirmPass = document.getElementById("confirmPass").value.trim();
      if (!newPass || !confirmPass) {
        Swal.showValidationMessage("Both fields are required");
        return false;
      }
      if (newPass !== confirmPass) {
        Swal.showValidationMessage("Passwords do not match!");
        return false;
      }
      return { newPass };
    },
  });

  if (formValues) {
    try {
      const response = await axios.post(`${API_BASE_URL}/clinicchangePassword`, {
        id: row.id,
        password: formValues.newPass,
        email: row.email,
      });

      toast.success(response.data.message || "Password updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  }
};

  // ✅ Columns (with single Subscription Details + Change Password)
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Name",
      selector: (row) => row.full_name || "N/A",
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email || "N/A",
      sortable: true,
    },
    {
      name: "Mobile",
      selector: (row) => row.mobile || "N/A",
      sortable: true,
    },
    {
      name: "Image",
      cell: (row) => (
        <img
          src={
            row.avatar
              ? row.avatar
              : `${process.env.NEXT_PUBLIC_APP_URL}/uploads/users/no-profile.jpg`
          }
          alt={row.full_name}
          style={{
            width: "40px",
            height: "40px",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      ),
    },
    {
      name: "Subscription Details",
      cell: (row) => {
        const sub = row.subscription;

        if (!sub) {
          return <span className="text-muted">No Subscription</span>;
        }

        const now = new Date();
        const endDate = sub.ends_at ? new Date(sub.ends_at) : null;

        let status = "No Subscription";
        let color = "secondary";

        if (sub.stripe_status === "active" && (!endDate || endDate > now)) {
          status = "Active";
          color = "success";
        } else if (sub.stripe_status === "canceled") {
          status = "Canceled";
          color = "warning";
        } else {
          status = "Expired";
          color = "danger";
        }

        return (
          <div>
            <div>
              <b>Status:</b>{" "}
              <span className={`badge bg-${color}`}>{status}</span>
            </div>
            <div>
              <b>Ends:</b>{" "}
              {endDate
                ? endDate.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"}
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      name: "Created At",
      selector: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Link
            href={`/admin/clinic/show/${row.id}`}
            className="btn btn-sm btn-success"
          >
            <FaEye /> View
          </Link>
          <Link
            href={`/admin/clinic/staff/${row.id}`}
            className="btn btn-sm btn-info"
          >
            <FaEye /> Staff
          </Link>
          <button
            className="btn btn-sm btn-warning"
            onClick={() => handleChangePassword(row)}
          >
            <FaKey /> Password
          </button>
        </div>
      ),
    },
  ];

  // ✅ Filtered data by subscription status
  const filteredSites = sites.filter((u) => {
    const sub = u.subscription;
    const now = new Date();
    const endDate = sub?.ends_at ? new Date(sub.ends_at) : null;

    if (subFilter === "all") return true;

    const isActive =
      sub?.stripe_status === "active" &&
      (!endDate || endDate > now);

    const isCanceled = sub?.stripe_status === "canceled";
    const isExpired =
      !isActive && !isCanceled && endDate && endDate < now;

    if (subFilter === "active") return isActive;
    if (subFilter === "expired") return isExpired;
    if (subFilter === "canceled") return isCanceled;

    return true;
  });

  // ✅ Custom Loader
  const CustomLoader = () => (
    <div className="py-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2">Loading data, please wait...</p>
    </div>
  );

  return (
    <div className="page-inner">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title">Clinic List</h4>

              {/* 🔽 Subscription Filter Dropdown */}
              <div>
                <select
                  className="form-select"
                  style={{ width: "200px" }}
                  value={subFilter}
                  onChange={(e) => setSubFilter(e.target.value)}
                >
                  <option value="all">All Subscriptions</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
            </div>

            <div className="card-body">
              <DataTable
                columns={columns}
                data={filteredSites}
                progressPending={loading}
                progressComponent={<CustomLoader />}
                pagination
                highlightOnHover
                responsive
                striped
                noHeader
                className="border"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
