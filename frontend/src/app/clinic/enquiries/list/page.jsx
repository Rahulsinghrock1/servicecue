"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import { TiThMenu } from "react-icons/ti";
import Link from "next/link";

export default function EnquiryList() {
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [planLimit, setPlanLimit] = useState(Infinity);
  const [planMessage, setPlanMessage] = useState("");

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const handleDelete = (row) => setSelectedRow(row);

  const handleConfirmDelete = async () => {
    if (!selectedRow) return;
    try {
      await axios.delete(`${API_BASE_URL}/Clinic/enquiries/delete/${selectedRow.id}`);
      toast.success("Deleted successfully!");
      setEnquiries((prev) => prev.filter((u) => u.id !== selectedRow.id));
      setSelectedRow(null);
    } catch (error) {
      toast.error("Failed to delete enquiry");
      console.error(error);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const userId = localStorage.getItem("UserID");
      const response = await axios.post(`${API_BASE_URL}/Clinic/enquiries`, {
        clinic_id: userId,
      });

      // Expected response:
      // { status: true, data: [...], limit: 5, planmessage: "Upgrade plan" }

      setEnquiries(response.data.data || []);
      setPlanLimit(
        response.data.limit === 0
          ? 0
          : response.data.limit || Infinity
      );
      setPlanMessage(response.data.planmessage || "");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignedClients = (id) => {
    const enquiry = enquiries.find((e) => e.id === id);
    setSelectedEnquiry(enquiry);
  };

  const filtered = enquiries.filter((e) => {
    const searchLower = search.toLowerCase();
    return (
      e.name?.toLowerCase().includes(searchLower) ||
      e.phone?.toLowerCase().includes(searchLower) ||
      e.email?.toLowerCase().includes(searchLower) ||
      e.service?.toLowerCase().includes(searchLower) ||
      e.message?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages =
    itemsPerPage === "all" ? 1 : Math.ceil(filtered.length / itemsPerPage);

  const paginated =
    itemsPerPage === "all"
      ? filtered
      : filtered.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filtered, currentPage, totalPages]);

  return (
    <div>
      <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
        <div className="flex-grow-1">
          <h4 className="fw-bold mb-0">Enquiries</h4>
        </div>
      </div>

      {/* Plan notice */}
      {planMessage && (
        <div className="alert alert-danger mb-3">
          <strong>Notice:</strong> {planMessage}
        </div>
      )}

      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search enquiries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select w-auto"
          value={itemsPerPage}
          onChange={(e) =>
            setItemsPerPage(
              e.target.value === "all" ? "all" : parseInt(e.target.value, 10)
            )
          }
        >
          <option value={5}>5 rows</option>
          <option value={10}>10 rows</option>
          <option value={25}>25 rows</option>
          <option value={50}>50 rows</option> 
          <option value="all">All</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Client</th>
              <th>Enquiry Date</th>
              <th>Service</th>
              <th>Assigned Professional/Staff</th>
              <th>Status</th>
              <th className="text-end"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-3">
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-3">
                  No enquiries found.
                </td>
              </tr>
            ) : (
              paginated.map((row, index) => {
                const isDisabled =
                  planLimit !== Infinity && index >= planLimit;

                return (
                  <tr
                    key={row.id}
                    className={isDisabled ? "table-bg text-muted" : ""}
                    style={{
                      pointerEvents: isDisabled ? "none" : "auto",
                      opacity: isDisabled ? 0.5 : 1,
                    }}
                  >
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={`/web/assets/img/no-image.jpg`}
                          alt={row.name}
                          className="rounded-circle"
                          width="40"
                          height="40"
                        />
                        <div>
                          <strong>{row.name}</strong>
                          <div className="text-muted small">
                            {isDisabled ? "Hidden (Upgrade Plan)" : row.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{new Date(row.createdAt).toLocaleString()}</td>
                    <td>{row.service}</td>
                    <td>
                      {row.clientId ? (
                        <Link
                          className="btn btn-outline-dark"
                          href={`/clinic/client/edit/${row.clientId}`}
                        >
                          Update Client And Assign Staff
                        </Link>
                      ) : (
                        <Link
                          className={`btn btn-outline-dark ${
                            isDisabled ? "disabled" : ""
                          }`}
                          href={`/clinic/client/create?name=${encodeURIComponent(
                            row.name
                          )}&email=${encodeURIComponent(
                            row.email
                          )}&phone=${encodeURIComponent(
                            row.phone
                          )}&enquiries=${encodeURIComponent(row.id)}`}
                        >
                          Convert to Client
                        </Link>
                      )}
                    </td>
                    <td>
                      <span className="fs-16 badge badge-soft-info rounded text-success fw-medium">
                        {row.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {!isDisabled && (
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-light"
                            onClick={() => toggleDropdown(row.id)}
                          >
                            <TiThMenu />
                          </button>
                          {dropdownOpen === row.id && (
                            <ul
                              className="dropdown-menu show"
                              style={{ right: 0, left: "auto" }}
                            >
                              <li>
                                <a
                                  href="javascript:void(0);"
                                  className="dropdown-item"
                                  data-bs-toggle="offcanvas"
                                  data-bs-target="#assigned_patient"
                                  onClick={() => handleOpenAssignedClients(row.id)}
                                >
                                  View Details
                                </a>
                              </li>
                              <li>
                                <a
                                  href="javascript:void(0);"
                                  className="dropdown-item text-danger"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_user"
                                  onClick={() => handleDelete(row)}
                                >
                                  Delete
                                </a>
                              </li>
                            </ul>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div>
          <button
            className="btn btn-sm btn-outline-primary me-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
