"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import MainConfig from "@/mainconfig"; 
import { toast } from "react-hot-toast";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';

export default function SiteList() {
    const API_BASE_URL = MainConfig.API_BASE_URL;
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    // ✅ Fetch users
    const fetchCategories = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/Users`, {
                user_role_id: 1  
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
  const createdAtFormatted = row.createdAt
    ? new Date(row.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  Swal.fire({
    title: `<strong>${row.full_name}</strong>`,
    html: `
      <p><b>Email:</b> ${row.email || "N/A"}</p>
      <p><b>Mobile:</b> ${row.country_code || ""} ${row.mobile || "N/A"}</p>
      <p><b>Gender:</b> ${row.gender || "N/A"}</p>
      <p><b>DOB:</b> ${row.dob || "N/A"}</p>
      <p><b>Created At:</b> ${createdAtFormatted}</p>
    `,
    imageUrl: row.avatar || "https://via.placeholder.com/150",
    imageWidth: 120,
    imageHeight: 120,
    imageAlt: "User Avatar",
    confirmButtonText: "Close"
  });
};

    // ✅ Toggle Active/Inactive
const handleToggleStatus = async (row) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/Users/${row.id}/toggle-status`);
        toast.success(response.data.message);

        // UI update karo (local state update)
        setSites(sites.map((u) => 
            u.id === row.id ? { ...u, status: !u.status } : u
        ));
    } catch (error) {
        toast.error("Failed to update status");
    }
};

    // ✅ Delete User
const handleDelete = async (row) => {
    Swal.fire({
        title: "Are you sure?",
        text: `You want to delete ${row.full_name}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE_URL}/Users/${row.id}`);
                toast.success("User deleted successfully!");
                // Remove from UI
                setSites(sites.filter((u) => u.id !== row.id));
            } catch (error) {
                toast.error("Failed to delete user");
            }
        }
    });
};

    // ✅ DataTable Columns
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
                    <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleView(row)}
                    >
                        <FaEye />
                    </button>
                   <button
    className={`btn btn-sm ${row.status ? "btn-warning" : "btn-success"}`}
    onClick={() => handleToggleStatus(row)}
>
    {row.status ? "Deactivate" : "Activate"}
</button>
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(row)}
                    >
                        <FaTrash />
                    </button>
                </div>
            ),
        },
    ];

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
                            <h4 className="card-title">User List</h4>
                        </div>
                        <div className="card-body">
                            <DataTable
                                columns={columns}
                                data={sites}
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
