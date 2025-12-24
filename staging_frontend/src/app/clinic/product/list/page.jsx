"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import { TiThMenu } from "react-icons/ti";
import { useUser } from "@context/UserContext";

export default function SiteList() {
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const NEXT_PUBLIC_BASE_URL = MainConfig.NEXT_PUBLIC_BASE_URL;
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [statusValue, setStatusValue] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const dropdownRef = useRef(null);

  // ✅ Fetch Products
  useEffect(() => {
    fetchProducts();
  }, []);

const fetchProducts = async () => {
  try {
    const userId = localStorage.getItem("UserID");
    const token = localStorage.getItem("curtishCleanAuthToken");

    const response = await axios.post(
      `${API_BASE_URL}/getProducts`,
      { clinic_id: userId,type: 2 }, // ✅ Send clinic_id here
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setSites(response.data.data || []);
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch products");
  } finally {
    setLoading(false);
  }
};

  // ✅ Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Change status
  const handleChangeStatus = async () => {
    if (!selectedRow) return;
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/product/${selectedRow.id}/toggle-status`
      );

      toast.success(response.data.message);

      setSites(
        sites.map((p) =>
          p.id === selectedRow.id ? { ...p, status: !p.status } : p
        )
      );
    } catch (error) {
      console.error("Status Update Error:", error);
      toast.error("Failed to update status");
    }
  };

  // ✅ Delete Product
  const handleDelete = (row) => {
    setSelectedRow(row);
  };

  const handleConfirmDelete = async () => {
  if (!selectedRow) return;
  try {
    const token = localStorage.getItem("curtishCleanAuthToken");

    await axios.delete(`${API_BASE_URL}/products/${selectedRow.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success("Product deleted successfully!");
    setSites(sites.filter((p) => p.id !== selectedRow.id));
    setSelectedRow(null);
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete product");
  }
};

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  // ✅ Filter + Sort
  const filteredSites = sites
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q) ||
        p.service_categories?.some((c) =>
          c.title?.toLowerCase().includes(q)
        )
      );
    })
    .sort((a, b) => {
      if (sortBy === "recent")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "highest")
        return (b.images?.length || 0) - (a.images?.length || 0);
      if (sortBy === "lowest")
        return (a.images?.length || 0) - (b.images?.length || 0);
      return 0;
    });

  // ✅ Pagination
  const totalPages =
    itemsPerPage === "all"
      ? 1
      : Math.max(1, Math.ceil(filteredSites.length / itemsPerPage));

  const paginatedSites =
    itemsPerPage === "all"
      ? filteredSites
      : filteredSites.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        );



  return (
    <div >
      {/* Header */}
      <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
        <div className="flex-grow-1">
          <h4 className="fw-bold mb-0">
            Products {" "}
            <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
              Total Products  : {sites.length}
            </span>
          </h4>
        </div>
        <div className="text-end d-flex">
          <Link
            href="/clinic/product/create"
            className="btn btn-primary ms-2 fs-13 btn-md"
          >
            <FaPlus className="me-1" /> New Product
          </Link>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
        <div className="search-set mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="d-flex align-items-center gap-3 mb-3 pb-1">
          {/* Row Per Page */}
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
      </div>

      {/* Table */}
      <div className="table-responsive" ref={dropdownRef}>
        <table className="table table-nowrap datatable dataTable no-footer">
          <thead className="thead-light">
            <tr>
              <th>Product</th>
              <th>Size</th>
              <th>Product Type</th>
              <th>Category</th>
              <th>Status</th>
              <th className="text-end"></th>
            </tr>
          </thead>
          <tbody>
  {loading ? (
    <tr>
      <td colSpan="6" className="text-center py-3">Loading...</td>
    </tr>
  ) : paginatedSites.length === 0 ? (
    <tr>
      <td colSpan="6" className="text-center py-3">No product found.</td>
    </tr>
  ) : (
    paginatedSites.map((row) => (
      <tr key={row.id}>
        {/* Product + Image */}
        <td>
          <div className="d-flex align-items-center gap-2 cursor-pointer">
            <img
              src={
                row.images?.length > 0
                  ? row.images[0].image_url
                  : `${API_BASE_URL}/uploads/products/no-image.png`
              }
              alt={row.title}
              className="rounded"
              width="50"
              height="50"
            />
            <div>
              <strong>{row.title}</strong>
            </div>
          </div>
        </td>

        {/* Size */}
        <td>{row.weight || row.dosage || "N/A"}</td>

        {/* Type */}
        <td>{row.type || "N/A"}</td>

        {/* Category with Image */}
<td>
  {row.service_categories?.length > 0 ? (
    <div className="d-flex flex-wrap gap-2">
      {row.service_categories.map((cat) => (
        <div key={cat.id} className="d-flex align-items-center gap-1">
          <img
            src={
              cat.image?.startsWith("http")
                ? cat.image
                : `${API_BASE_URL}/${cat.image}`
            }
            alt={cat.title}
            width="30"
            height="30"
            className="rounded-circle"
          />
          <span className="small">{cat.title}</span>
        </div>
      ))}
    </div>
  ) : (
    "N/A"
  )}
</td>

        {/* Status */}
        <td>
          <span
            className={`badge badge-soft-${
              row.status ? "success border border-success" : "danger border border-danger"
            }`}
          >
            {row.status ? "Active" : "Deactive"}
          </span>
        </td>

        {/* Actions */}
        <td className="text-end">
          <div className="dropdown">
            <button
              className="btn btn-sm btn-light"
              onClick={() => toggleDropdown(row.id)}
            >
              <TiThMenu />
            </button>
            {dropdownOpen === row.id && (
              <ul className="dropdown-menu show" style={{ right: 0, left: "auto" }}>
              <li>
                                    <a
                              href="javascript:void(0);"
                              className="dropdown-item"
                              data-bs-toggle="modal"
                              data-bs-target="#edit_status"
                              onClick={() => {
                                setSelectedRow(row);
                                setStatusValue(
                                  row.status ? "Active" : "Deactive"
                                );
                              }}
                            >
                              Change Status
                            </a>
                          </li>

                <li>
                  <Link className="dropdown-item" href={`/clinic/product/edit/${row.id}`}>
                    Edit
                  </Link>
                </li>
                   <li>
                  <Link className="dropdown-item" href={`/clinic/product/show/${row.id}`}>
                    View Details
                  </Link>
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
        </td>
      </tr>
    ))
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

      {/* --- POPUPS --- */}
      {/* 1. Change Status */}
<div className="modal fade" id="edit_status">
  <div className="modal-dialog modal-dialog-centered modal-sm">
    <div className="modal-content">
      <div className="modal-body text-center position-relative">
        <img
          src="/web/assets/img/bg/generate-bg-01.png"
          alt=""
          className="img-fluid position-absolute top-0 start-0 z-0"
        />
        <img
          src="/web/assets/img/bg/generate-bg-02.png"
          alt=""
          className="img-fluid position-absolute bottom-0 end-0 z-0"
        />
        <div className="mb-3 position-relative z-1">
          <span className="avatar avatar-lg bg-primary text-white">
            <i className="ti ti-eye fs-24"></i>
          </span>
        </div>
        <h5 className="fw-bold mb-2 position-relative z-1">Change Status</h5>
        <div className="mb-4 position-relative">
         <select
                  className="form-select"
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                >
                  <option>Active</option>
                  <option>Deactive</option>
                </select>
        </div>
        <div className="d-flex justify-content-center">
          <a
            href="javascript:void(0);"
            className="btn btn-light position-relative z-1 me-3"
            data-bs-dismiss="modal"
          >
            Cancel
          </a>
          <a
            href="javascript:void(0);"
            className="btn btn-success position-relative z-1"
            data-bs-dismiss="modal"
             onClick={handleChangeStatus}
          >
            Change Status
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
 <div
        className="modal fade"
        id="delete_user"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-body text-center position-relative">
              <img
                src="/web/assets/img/bg/delete-modal-bg-01.png"
                alt=""
                className="img-fluid position-absolute top-0 start-0 z-0"
              />
              <img
                src="/web/assets/img/bg/delete-modal-bg-02.png"
                alt=""
                className="img-fluid position-absolute bottom-0 end-0 z-0"
              />

              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-lg bg-danger text-white">
                  <i className="ti ti-trash fs-24"></i>
                </span>
              </div>

              <h5 className="fw-bold mb-1 position-relative z-1">
                Delete Confirmation
              </h5>
              <p className="mb-3 position-relative z-1">
                Are you sure you want to delete?
              </p>

              <div className="d-flex justify-content-center">
                <button
                  type="button"
                  className="btn btn-light position-relative z-1 me-3"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger position-relative z-1"
                  data-bs-dismiss="modal"
                  onClick={handleConfirmDelete}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>

  );
}
