"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MainConfig from "@/mainconfig";
import Link from "next/link";
import { FaEdit, FaPlus } from "react-icons/fa";
import { toast } from "react-hot-toast";


export default function EmailTemplateList() {
    const API_BASE_URL = MainConfig.API_BASE_URL;
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authToken, setAuthToken] = useState(null);

    // Get token on client side
    useEffect(() => {
        const token = localStorage.getItem("curtishCleanAuthToken");
        if (token) {
            setAuthToken(token);
        } else {
            toast.error("Auth token not found!");
        }
    }, []);

    // Fetch templates when token is available
    useEffect(() => {
        if (!authToken) return;

        const fetchTemplates = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/email-templates`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
                setTemplates(res.data.data || []);
            } catch (err) {
                console.error("Error loading templates", err);
                toast.error("Failed to load templates");
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [authToken]);


    return (
        <div className="page-inner">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="card-title">Email Templates</h4>
                            {/* <Link href="/admin/email-templates/create" className="btn btn-success d-flex align-items-center gap-1"> */}
                            {/*     <FaPlus /> Add New */}
                            {/* </Link> */}
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <p>Loading...</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover">
                                        <thead className="thead-light">
                                            <tr>
                                                <th>Name</th>
                                                <th>Subject</th>
                                                <th style={{ width: "100px" }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {templates.map((tpl, index) => (
                                                <tr key={tpl.id}>
                                                    <td>{tpl.name}</td>
                                                    <td>{tpl.subject}</td>
                                                    <td>
                                                        <Link
                                                            href={`/admin/email-templates/${tpl.id}/edit`}
                                                            className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                                        >
                                                            <FaEdit /> Edit
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                            {templates.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="text-center">No templates found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
