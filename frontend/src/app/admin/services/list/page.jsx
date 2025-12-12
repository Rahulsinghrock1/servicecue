"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { toast } from "react-hot-toast";
import MainConfig from "@/mainconfig";
import Select from "react-select";
import dynamic from "next/dynamic";

const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false }
);
let ClassicEditor;
if (typeof window !== "undefined") {
  ClassicEditor = require("@ckeditor/ckeditor5-build-classic");
}

const API_BASE_URL = MainConfig.API_BASE_URL;

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    category_id: "",
    name: "",
    description: "",
    precare: "",
    postcare: "",
  });

  // ✅ Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/Category`, {});
      setCategories(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories");
    }
  };

  // ✅ Fetch Services
  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Services`);
      setServices(res.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch services");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Handle Category Change
  const handleCategoryChange = (selected) => {
    setFormData({ ...formData, category_id: selected ? selected.value : "" });
  };

  // ✅ Save Service
  const handleSave = async () => {
    try {
      if (formData.id) {
        await axios.put(`${API_BASE_URL}/Services/${formData.id}`, formData);
        toast.success("Service updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/Services`, formData);
        toast.success("Service added successfully");
      }
      setModalOpen(false);
      setFormData({
        id: null,
        category_id: "",
        name: "",
        description: "",
        precare: "",
        postcare: "",
      });
      fetchServices();
    } catch (error) {
      toast.error("Failed to save service");
    }
  };

  // ✅ Delete Service
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/Services/${id}`);
      toast.success("Service deleted successfully");
      fetchServices();
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  const truncate = (text, maxLength = 50) => {
    if (!text) return "-";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // ✅ DataTable Columns
  const columns = [
    { name: "#", selector: (row, i) => i + 1, width: "60px" },
    { name: "Category", selector: (row) => row.category?.title || "N/A" },
    { name: "Name", selector: (row) => row.name },
    { name: "Description", selector: (row) => truncate(row.description, 50) },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-warning"
            onClick={() => {
              setFormData({
                id: row.id,
                category_id: row.category_id,
                name: row.name,
                description: row.description || "",
                precare: row.precare || "",
                postcare: row.postcare || "",
              });
              setModalOpen(true);
            }}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-inner">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title">Services</h4>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setFormData({
                    id: null,
                    category_id: "",
                    name: "",
                    description: "",
                    precare: "",
                    postcare: "",
                  });
                  setModalOpen(true);
                }}
              >
                Add Service
              </button>
            </div>

            <div className="card-body">
              <DataTable columns={columns} data={services} pagination />

              {/* ✅ Modal */}
              {modalOpen && (
                <div className="modal fade show d-block" tabIndex="-1">
                  <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">
                          {formData.id ? "Edit Service" : "Add Service"}
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setModalOpen(false)}
                        ></button>
                      </div>
                      <div className="modal-body">
                        {/* Category */}
                        <div className="mb-3">
                          <label className="form-label">Category</label>
                          <Select
                            value={
                              categories.find(
                                (cat) => cat.id === formData.category_id
                              )
                                ? {
                                    value: formData.category_id,
                                    label: categories.find(
                                      (cat) => cat.id === formData.category_id
                                    )?.title,
                                  }
                                : null
                            }
                            options={categories.map((cat) => ({
                              value: cat.id,
                              label: cat.title,
                            }))}
                            onChange={handleCategoryChange}
                            placeholder="Select Category"
                          />
                        </div>

                        {/* Name */}
                        <div className="mb-3">
                          <label className="form-label">Service Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                          />
                        </div>

                        {/* Description */}
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            name="description"
                            rows="2"
                            value={formData.description}
                            onChange={handleChange}
                          ></textarea>
                        </div>

                        {/* Pre Care with CKEditor */}
                        <div className="mb-3">
                          <label className="form-label">Pre Care</label>
                          <CKEditor
                            editor={ClassicEditor}
                            data={formData.precare}
                            onChange={(event, editor) => {
                              const data = editor.getData();
                              setFormData((prev) => ({
                                ...prev,
                                precare: data,
                              }));
                            }}
                          />
                        </div>

                        {/* Post Care with CKEditor */}
                        <div className="mb-3">
                          <label className="form-label">Post Care</label>
                          <CKEditor
                            editor={ClassicEditor}
                            data={formData.postcare}
                            onChange={(event, editor) => {
                              const data = editor.getData();
                              setFormData((prev) => ({
                                ...prev,
                                postcare: data,
                              }));
                            }}
                          />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleSave}
                        >
                          {formData.id ? "Update" : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
