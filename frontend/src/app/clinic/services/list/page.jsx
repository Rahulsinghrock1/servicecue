"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MainConfig from "@/mainconfig"; 
import { toast } from "react-hot-toast";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

export default function ServiceList() {
    const API_BASE_URL = MainConfig.API_BASE_URL;
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        category_id: "",
        name: "",
    });

    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, []);

    // ✅ Fetch services
    const fetchServices = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/services`);
            setServices(response.data.data || []);
        } catch (error) {
            toast.error("Failed to fetch services");
        } finally {
            setLoading(false);
        }
    };



    // ✅ Fetch categories for dropdown
    const fetchCategories = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/Category`, {});
            setCategories(response.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch categories");
        }
    };



    // ✅ Save (Add/Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await axios.put(`${API_BASE_URL}/services/${formData.id}`, formData);
                toast.success("Service updated successfully");
            } else {
                await axios.post(`${API_BASE_URL}/services`, formData);
                toast.success("Service added successfully");
            }
            setModalOpen(false);
            setFormData({ id: null, category_id: "", name: "" });
            fetchServices();
        } catch (error) {
            toast.error("Failed to save service");
        }
    };

    // ✅ Delete
    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will delete the service.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${API_BASE_URL}/services/${id}`);
                    toast.success("Service deleted");
                    fetchServices();
                } catch (error) {
                    toast.error("Failed to delete service");
                }
            }
        });
    };

    const columns = [
        { name: "#", selector: (row, i) => i + 1, width: "60px" },
        { name: "Category", selector: (row) => row.category?.title || "N/A" },
        { name: "Name", selector: (row) => row.name },
        { name: "Description", selector: (row) => row.description },
        {
            name: "Actions",
            cell: (row) => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-warning"
                        onClick={() => {
                            setFormData({ id: row.id, category_id: row.category_id, name: row.name });
                            setModalOpen(true);
                        }}
                    >
                        <FaEdit />
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row.id)}>
                        <FaTrash />
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
                                    setFormData({ id: null, category_id: "", name: "" });
                                    setModalOpen(true);
                                }}
                            >
                                Add Service <FaPlus />
                            </button>
                        </div>
                        <div className="card-body">
                            <DataTable
                                columns={columns}
                                data={services}
                                progressPending={loading}
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

            {/* ✅ Modal */}
            {modalOpen && (
               <div
  className="modal fade show d-block"
  tabIndex="-1"
  style={{ background: "rgba(0,0,0,0.5)" }}
>
  <div className="modal-dialog">
    <div className="modal-content">
      <form onSubmit={handleSubmit}>
        <div className="modal-header">
          <h5 className="modal-title">
            {formData.id ? "Edit Service" : "Add Service"}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setModalOpen(false)}
          />
        </div>
        <div className="modal-body">
          {/* ✅ Category */}
          <div className="mb-3">
            <label>Category</label>
            <select
              className="form-control"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Name */}
          <div className="mb-3">
            <label>Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          {/* ✅ Description */}
          <div className="mb-3">
            <label>Description</label>
            <textarea
              className="form-control"
              rows="1"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            ></textarea>
          </div>

                 <div className="mb-3">
            <label>Pre Care Instructions</label>
            <textarea
              className="form-control"
              rows="2"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            ></textarea>
          </div>
                     <div className="mb-3">
            <label>Post Care Instructions</label>
            <textarea
              className="form-control"
              rows="2"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            ></textarea>
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
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

            )}
        </div>
    );
}
