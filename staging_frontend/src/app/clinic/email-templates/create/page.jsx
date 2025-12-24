"use client";

import { useState } from "react";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddEmailTemplate() {
    const API_BASE_URL = MainConfig.API_BASE_URL;
    const router = useRouter();

    const [form, setForm] = useState({ name: "", subject: "", body: "" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/email-templates`, form);
            toast.success("Template created");
            router.push("/admin/email-templates/list");
        } catch (err) {
            toast.error("Failed to create template");
        }
    };

    return (
        <div className="page-inner">
            <div className="row">
                <div className="col-12 col-md-6 col-lg-6 col-xl-6">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="card-title">Add Email Template</h4>
                            <Link href="/admin/email-templates/list" className="btn btn-primary">
                                Templates <i className="fa fa-list ms-1"></i>
                            </Link>
                        </div>
                        <div className="card-body">
                            <div className="row justify-content-left">
                                <div className="col-12">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">Template Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                placeholder="Enter template name"
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Subject</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="subject"
                                                value={form.subject}
                                                onChange={handleChange}
                                                placeholder="Enter email subject"
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Email Body (HTML supported)</label>
                                            <textarea
                                                className="form-control"
                                                name="body"
                                                value={form.body}
                                                onChange={handleChange}
                                                rows={8}
                                                placeholder="Enter email content"
                                                required
                                            />
                                        </div>

                                        <div className="text-end">
                                            <button type="submit" className="btn btn-success">
                                                Save Template
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>    
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
