"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

export default function FaqList() {
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // For Add/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({ question: "", answer: "" });

  useEffect(() => {
    fetchFaqs();
  }, []);

  // ✅ Fetch FAQs
  const fetchFaqs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/faqs`);
      setFaqs(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch FAQs");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Save FAQ (Add/Edit)
  const handleSave = async () => {
    try {
      if (!formData.question || !formData.answer) {
        toast.error("Both Question and Answer are required");
        return;
      }

      if (editingFaq) {
        // Update API
        await axios.put(`${API_BASE_URL}/faqs/${editingFaq.id}`, formData);
        toast.success("FAQ updated successfully");
      } else {
        // Add API
        await axios.post(`${API_BASE_URL}/faqs`, formData);
        toast.success("FAQ added successfully");
      }

      setShowModal(false);
      setFormData({ question: "", answer: "" });
      setEditingFaq(null);
      fetchFaqs();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save FAQ");
    }
  };

  // ✅ Delete FAQ
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this FAQ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/faqs/${id}`);
          toast.success("FAQ deleted successfully");
          fetchFaqs();
        } catch (error) {
          console.error(error);
          toast.error("Failed to delete FAQ");
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
      name: "Question",
      selector: (row) => row.question || "N/A",
      sortable: true,
    },
    {
      name: "Answer",
      selector: (row) => row.answer || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-warning"
            onClick={() => {
              setEditingFaq(row);
              setFormData({ question: row.question, answer: row.answer });
              setShowModal(true);
            }}
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

  return (
    <div className="page-inner">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title">FAQs</h4>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowModal(true);
                  setEditingFaq(null);
                  setFormData({ question: "", answer: "" });
                }}
              >
                Add FAQ <FaPlus />
              </button>
            </div>
            <div className="card-body">
              <DataTable
                columns={columns}
                data={faqs}
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

      {/* ✅ Modal for Add/Edit */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingFaq ? "Edit FAQ" : "Add FAQ"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Question</label>
                  <input
                    type="text"
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Answer</label>
                  <textarea
                    name="answer"
                    value={formData.answer}
                    onChange={handleChange}
                    className="form-control"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
