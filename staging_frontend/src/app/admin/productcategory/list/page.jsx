"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function SiteList() {
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState({
    title: "",
    description: "",
    image: null,
  });
  const [isEdit, setIsEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ProductCategory`, {});
      setSites(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Open Add Modal
  const handleAdd = () => {
    setIsEdit(false);
    setModalData({ title: "", description: "", image: null });
    setShowModal(true);
  };

  // ✅ Open Edit Modal
  const handleEdit = (row) => {
    setIsEdit(true);
    setEditId(row.id);
    setModalData({
      title: row.title,
      description: row.description,
      image: null,
    });
    setShowModal(true);
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/productCategory/${id}`);
          toast.success("Product Category deleted successfully");
          fetchCategories();
        } catch (error) {
          console.error(error);
          toast.error("Failed to delete category");
        }
      }
    });
  };

  // ✅ Save Add/Edit with File Upload
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", modalData.title);
      formData.append("description", modalData.description);
      if (modalData.image) {
        formData.append("image", modalData.image);
      }

      if (isEdit) {
        await axios.post(`${API_BASE_URL}/productCategory/update/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product Category updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/productCategory/create`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product Category added successfully");
      }

      fetchCategories();
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save category");
    }
  };

  // ✅ DataTable Columns
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Title",
      selector: (row) => row.title || "N/A",
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description || "N/A",
      sortable: true,
    },
    {
      name: "Image",
      cell: (row) => (
        <img
          src={row.image}
          alt={row.title}
          style={{
            width: "60px",
            height: "60px",
            objectFit: "cover",
            borderRadius: "6px",
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
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-warning"
            onClick={() => handleEdit(row)}
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(row.id)}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

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
              <h4 className="card-title">Product Categories</h4>
              <button className="btn btn-primary" onClick={handleAdd}>
                Add Product Category
              </button>
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

      {/* ✅ Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSave}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {isEdit ? "Edit" : "Add"} Product Category
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={modalData.title}
                      onChange={(e) =>
                        setModalData({ ...modalData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={modalData.description}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* ✅ Direct Image Upload */}
                  <div className="mb-3">
                    <label className="form-label">Upload Image</label>

                    {isEdit && !modalData.image && (
                      <div className="mb-2">
                        <img
                          src={sites.find((s) => s.id === editId)?.image}
                          alt="Preview"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      </div>
                    )}

                    {modalData.image &&
                      typeof modalData.image !== "string" && (
                        <div className="mb-2">
                          <img
                            src={URL.createObjectURL(modalData.image)}
                            alt="New Preview"
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                              borderRadius: "6px",
                            }}
                          />
                        </div>
                      )}

                    <input
                      type="file"
                      className="form-control"
                      accept="image"
                      onChange={(e) =>
                        e.target.files[0] &&
                        setModalData({
                          ...modalData,
                          image: e.target.files[0],
                        })
                      }
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
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
