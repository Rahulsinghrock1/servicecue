"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import MainConfig from "@/mainconfig";
import Link from "next/link";
import TipTapEditor from "@components/admin/TipTapEditor";

export default function EditEmailTemplate() {
    const { id } = useParams();
    const router = useRouter();
    const API_BASE_URL = MainConfig.API_BASE_URL;

    const [authToken, setAuthToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        name: "",
        subject: "",
        body: ""
    });

    const editorRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("curtishCleanAuthToken");
        setAuthToken(token);
    }, []);

    useEffect(() => {
        if (!authToken || !id) return;

        const fetchTemplate = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/email-templates/${id}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });

                const { name, subject, body } = res.data.data || {};
                setForm({ name, subject, body });
            } catch (err) {
                toast.error("Failed to load template");
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [authToken, id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const bodyContent = editorRef.current?.getHTML();


        try {
            await axios.put(`${API_BASE_URL}/email-templates/${id}`, {
                subject: form.subject,
                body: bodyContent,
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            toast.success("Template updated");
            router.push("/admin/email-templates/list");
        } catch (err) {
            toast.error("Failed to update template");
        }
    };

    return (
        <div className="page-inner">
            <div className="row">
                <div className="col-12 col-md-8 col-lg-8">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="card-title">Edit Email Template</h4>
                            <Link href="/admin/email-templates/list" className="btn btn-primary">
                                <i className="fa fa-arrow-left mr-1"></i> Back
                            </Link>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <p>Loading...</p>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            value={form.name}
                                            disabled
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            className="form-control"
                                            value={form.subject}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Body (HTML)</label>
                                        <TipTapEditor ref={editorRef} initialContent={form.body} />
                                    </div>
                                    <button type="submit" className="btn btn-success">
                                        <i className="fa fa-save mr-1"></i> Update
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
