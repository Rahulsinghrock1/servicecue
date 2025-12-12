"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import MainConfig from "@/mainconfig";
import Select from "react-select";
import Link from "next/link";

export default function ProductList() {
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // filters
  const [filterName, setFilterName] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterClinics, setFilterClinics] = useState([]);

  // pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 100; // items per page

  const [loading, setLoading] = useState(false);

  // Load clinics once
  useEffect(() => {
    fetchClinics();
  }, []);

  // Load products on page or filter change
  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchClinics = async () => {
    try {
      const token = localStorage.getItem("curtishCleanAuthToken");

      const res = await axios.post(`${API_BASE_URL}/auth/Clinic`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (Array.isArray(res.data?.data)) {
        setCategories(
          res.data.data.map((c) => ({
            value: c.id,
            label: c.clinic_name
          }))
        );
      }
    } catch (err) {
      console.error("Clinic Fetch Error:", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("curtishCleanAuthToken");
      const clinicIds = filterClinics.map((c) => c.value);
    const res = await axios.post(
  `${API_BASE_URL}/allProducts`,
  {
    clinic_id: clinicIds.length > 0 ? clinicIds : undefined, // send array if multiple selected
    name: filterName,
    brand: filterBrand,
    type: 2,
    page,
    limit
  },
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);

      setProducts(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Product Load Error:", err);
    }
    setLoading(false);
  };

  // Handle filter apply button: reset page to 1 then fetch
  const applyFilter = () => {
    setPage(1);
    fetchProducts();
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div>
      {/* FILTER BOX */}
      <div className="card p-4 mb-4">
        <h5 className="mb-3">Filter Products</h5>

        <div className="row g-3">

          <div className="col-md-4">
            <input
              type="text"
              placeholder="Search name"
              className="form-control"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <input
              type="text"
              placeholder="Brand"
              className="form-control"
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <Select
              isMulti
              options={categories}
              value={filterClinics}
              onChange={setFilterClinics}
              placeholder="Filter by Clinic"
            />
          </div>

          <div className="col-md-12 text-end">
            <button className="btn btn-primary" onClick={applyFilter}>
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCT TABLE */}
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Brand</th>
              <th>Clinic</th>
              <th>Categories</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">Loading...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No Products Found</td>
              </tr>
            ) : (
              products.map((row) => (
                <tr key={row.id}>
                  <td>
                    <img
                      src={
                        row.images?.[0]?.image_url ||
                        "/uploads/products/no-image.png"
                      }
                      width="55"
                      height="55"
                      className="rounded"
                    />
                  </td>

                  <td>
                    <Link
                      href={`/admin/product/show/${row.id}`}
                      className="fw-bold text-primary"
                    >
                      {row.title}
                    </Link>
                  </td>

                  <td>{row.brand || "N/A"}</td>

                  <td>{row.clinic || "--"}</td>

                  <td>
                    {row.service_categories?.map((cat) => (
                      <span key={cat.id} className="badge bg-info text-dark me-1">
                        {cat.title}
                      </span>
                    ))}
                  </td>

                  <td>
                    <span className={`badge ${row.status ? "bg-success" : "bg-danger"}`}>
                      {row.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>Page {page} of {totalPages}</div>
        <div>
          <button
            className="btn btn-secondary me-2"
            onClick={handlePrev}
            disabled={page <= 1}
          >
            Prev
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleNext}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
