"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import MainConfig from "@/mainconfig"; 
import { toast } from "react-hot-toast";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { handleSuccessResponse, handleErrorResponse } from "@utility/handleApiResponse";
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';



export default function SiteList() {
    const API_BASE_URL = MainConfig.API_BASE_URL;
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        try {
            const accessToken = localStorage.getItem("curtishCleanAuthToken");
            const response = await axios.get(`${API_BASE_URL}/site-list`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setSites(response.data.data || []); 
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch sites");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action will permanently delete the site!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const accessToken = localStorage.getItem("curtishCleanAuthToken");
                const response =  await axios.delete(`${API_BASE_URL}/site-delete/${id}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                handleSuccessResponse(response.data);
                setSites((prevSites) => prevSites.filter(site => site.id !== id));
            } catch (error) {
                handleErrorResponse(error);
            }
        }
    };


    const columns = [
        {
            name: "#",
            selector: (row, index) => index + 1,
            width: "60px",
        },
        {
            name: "Strata Plan Number",
            selector: (row) => (
                <Link href={`/admin/site/show/${row.id}`} className="text-primary text-decoration-underline">
                    {row.strata_plan_number}
                </Link>
            ),
            sortable: true,
        },
        {
            name: "Category",
            selector: (row) => row.category?.name || "N/A",
            sortable: true,
        },
        {
            name: "Zone",
            selector: (row) => row.zone?.name || "N/A",
            sortable: true,
        },
        {
            name: "Address",
            selector: (row) => row.address,
        },
        {
            name: "Status",
            cell: (row) => (
                <span className={`fw-bold ${row.status === "active" ? "text-success" : "text-danger"}`}>
                    {row.status}
                </span>
            ),
            sortable: true,
        },
        {
            name: "Actions",
            cell: (row) => (
                <>
                    <Link href={`/admin/site/edit/${row.id}`} className="text-info me-2">
                        <FaEdit />
                    </Link>
                    <span className="text-danger" onClick={() => handleDelete(row.id)}>
                        <FaTrash />
                    </span>
                </>
            ),
        },
        {
            name: "Quote",
            cell: (row) => (
                <>
                    {row.quotes === null ? (
                        <Link href={`/admin/site/${row.id}/quote/add`} className="btn btn-primary btn-sm">
                            <FaPlus className="me-1" /> Add Quote
                        </Link>
                    ) : (
                        <Link href={`/admin/site/${row.id}/quote/edit/${row.quotes.id}`} className="btn btn-warning btn-sm">
                            <FaEdit className="me-1" /> Edit Quote
                        </Link>
                    )}
                </>
            ),
        },

    ];

    return (
        <div className="page-inner">
             <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="card-title">Sites</h4>
                             <Link href="/admin/site/create" className="btn btn-primary">
                                Create Site <i className="fa fa-plus"></i>
                            </Link>
                        </div>
                        <div className="card-body">

                            <DataTable
                                columns={columns}
                                data={sites}
                                progressPending={loading}
                                pagination
                                highlightOnHover
                                responsive
                                striped
                                persistTableHead
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
