"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Select from "react-select";

export default function ProductList() {
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterName, setFilterName] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterCategories, setFilterCategories] = useState([]);

  // Category options
  const [categories, setCategories] = useState([]);

  const [selectedProducts, setSelectedProducts] = useState([]);

  const [hasSearched, setHasSearched] = useState(false); // ⭐ NEW STATE

  const itemsPerPage = 100;
  const [currentPage, setCurrentPage] = useState(1);

  // ⭐ FETCH CATEGORIES
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/ProductCategory`, {
          category_id: "",
        });

        if (Array.isArray(res.data?.data)) {
          setCategories(
            res.data.data.map((c) => ({
              value: c.id,
              label: c.title,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, [API_BASE_URL]);

  // ⭐ APPLY FILTER WITH MULTIPLE CATEGORY IDs
  const applyFilter = async () => {
    setLoading(true);
    setHasSearched(true); // ⭐ User performed a search

    try {
      const userId = localStorage.getItem("UserID");
      const token = localStorage.getItem("curtishCleanAuthToken");

      const selectedCategoryIds = filterCategories.map((c) => c.value);

      const response = await axios.post(
        `${API_BASE_URL}/allProducts`,
        {
          clinic_id: userId,
          type: 2,
          name: filterName,
          brand: filterBrand,
          category: selectedCategoryIds,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProducts(response.data.data || []);
      setCurrentPage(1);
      setSelectedProducts([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Select single product
  const toggleSelect = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAllSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedProducts.includes(p.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const idsToRemove = paginatedProducts.map((p) => p.id);
      setSelectedProducts((prev) =>
        prev.filter((id) => !idsToRemove.includes(id))
      );
    } else {
      const idsToAdd = paginatedProducts.map((p) => p.id);
      setSelectedProducts((prev) =>
        Array.from(new Set([...prev, ...idsToAdd]))
      );
    }
  };

  // ⭐ ADD SELECTED PRODUCTS
  const handleAddProducts = async () => {
  if (selectedProducts.length === 0) {
    toast.error("Please select products.");
    return;
  }

  try {
    const token = localStorage.getItem("curtishCleanAuthToken");
    const userId = localStorage.getItem("UserID");

    await axios.post(
      `${API_BASE_URL}/addSelectedProducts`,
      {
        clinic_id: userId,
        product_ids: selectedProducts,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Products added successfully!");

    // ⭐ RESET EVERYTHING TO DEFAULT
    setSelectedProducts([]);
    setProducts([]);
    setHasSearched(false);
    setCurrentPage(1);

    // ⭐ ALSO CLEAR FILTERS HERE
    setFilterName("");
    setFilterBrand("");
    setFilterCategories([]);

  } catch (error) {
    console.error(error);
    toast.error("Failed to add products");
  }
};


  return (
    <div>
      {/* FILTERS */}
      <div className="card p-4 mb-3">
        <h5 className="mb-3">Filter Products</h5>

        <div className="row g-3">
          <div className="col-md-4">
            <input
              type="text"
              placeholder="Name"
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

          {/* ⭐ MULTIPLE CATEGORY SELECT */}
          <div className="col-md-4">
            <Select
              isMulti
              options={categories}
              value={filterCategories}
              onChange={setFilterCategories}
              placeholder="Select categories"
            />
          </div>

          <div className="col-md-12 text-end">
            <button className="btn btn-primary px-4" onClick={applyFilter}>
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-responsive">
        <table className="table table-nowrap">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Product</th>
              <th>Size</th>
              <th>Type</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-3">
                  Loading...
                </td>
              </tr>
            ) : paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-3">
                  {!hasSearched
                    ? "Search and add any product."
                    : "No products found."}
                </td>
              </tr>
            ) : (
              paginatedProducts.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(row.id)}
                      onChange={() => toggleSelect(row.id)}
                    />
                  </td>

                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={
                          row.images?.length
                            ? row.images[0].image_url
                            : `${API_BASE_URL}/uploads/products/no-image.png`
                        }
                        width="50"
                        height="50"
                        className="rounded"
                        alt=""
                      />

                      <Link
                        href={`/clinic/product/show/${row.id}`}
                        target="_blank"
                        className="fw-bold text-primary"
                        style={{ textDecoration: "none", cursor: "pointer" }}
                      >
                        {row.title}
                      </Link>
                    </div>
                  </td>

                  <td>{row.weight || row.dosage || "N/A"}</td>
                  <td>{row.type || "N/A"}</td>

                  <td>
                    {row.service_categories?.map((cat) => (
                      <span
                        key={cat.id}
                        className="badge bg-light text-dark me-1"
                      >
                        {cat.title}
                      </span>
                    ))}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        row.status ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {row.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {products.length > itemsPerPage && (
        <div className="d-flex justify-content-between mt-3">
          <span>
            Page {currentPage} of {totalPages}
          </span>

          <div>
            <button
              className="btn btn-outline-primary me-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Prev
            </button>

            <button
              className="btn btn-outline-primary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* FLOATING ADD BUTTON */}
      {selectedProducts.length > 0 && (
        <button
          className="btn btn-success shadow-lg"
          style={{
            position: "fixed",
            bottom: "25px",
            right: "25px",
            padding: "14px 28px",
            fontSize: "16px",
            fontWeight: "600",
            borderRadius: "40px",
            zIndex: 9999,
          }}
          onClick={handleAddProducts}
        >
          Add Product ({selectedProducts.length})
        </button>
      )}
    </div>
  );
}
