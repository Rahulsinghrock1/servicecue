"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import dynamic from "next/dynamic";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";

const Dropzone = dynamic(() => import("react-dropzone"), { ssr: false });
const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false }
);

let ClassicEditor;
if (typeof window !== "undefined") {
  ClassicEditor = require("@ckeditor/ckeditor5-build-classic");
}

export default function AddProductForm() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [dosageOptions, setDosageOptions] = useState([]);
  const [durationsOptions, setDurationsOptions] = useState([]);
  const [intakeOptions, setIntakeOptions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [selectedDosage, setSelectedDosage] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [frequencyOptions, setFrequencyOptions] = useState([]);
  const [treatmentPhaseOptions, setTreatmentPhaseOptions] = useState([]);
  const [whenToStartOptions, setWhenToStartOptions] = useState([]);
  const [whenToStopOptions, setWhenToStopOptions] = useState([]);
  const [whenToResumeOptions, setWhenToResumeOptions] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    type: "",
    size: "",
    sizeUnit: "",
    description: "",
    highlights: "",
    usage: "",
    ingredients: "",
    dosage: "",
    treatmentPhase: "",
    whenToStart: "",
    whenToStop: "",
    duration: "",
    whenToResume: "",
    frequency: "",
    intakeMode: "",
  });

  const [timings, setTimings] = useState([""]);

  // Fetch Product Category
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/ProductCategory`, { category_id: "" });
        if (Array.isArray(res.data?.data)) {
          setCategories(res.data.data.map((c) => ({ value: c.id, label: c.title })));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [API_BASE_URL]);

  // Fetch Product Options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/ProductType`, {});
        setProductTypes(res.data?.ProductType.map((item) => ({ value: item.title, label: item.title, unit: item.size })));
        setFrequencyOptions(res.data?.frequency.map((f) => ({ value: f.label, label: f.label })));
        setDurationsOptions(res.data?.durations.map((d) => ({ value: d.label, label: d.label })));
        setIntakeOptions(res.data?.intakeModeOptions.map((i) => ({ value: i.label, label: i.label })));
        setTreatmentPhaseOptions(res.data?.TreatmentPhase.map((t) => ({ value: t.title, label: t.title })));
        setWhenToStartOptions(res.data?.WhenToStart.map((t) => ({ value: t.title, label: t.title })));
        setWhenToStopOptions(res.data?.WhenToStop.map((t) => ({ value: t.title, label: t.title })));
        setWhenToResumeOptions(res.data?.WhenToResume.map((t) => ({ value: t.title, label: t.title })));
      } catch (err) {
        console.error("Error fetching product types:", err);
      }
    };
    fetchOptions();
  }, [API_BASE_URL]);

  // Fetch Dosages
  useEffect(() => {
    const fetchDosages = async () => {
      if (!selectedProductType) {
        setDosageOptions([]);
        return;
      }
      try {
        const res = await axios.post(`${API_BASE_URL}/ProductDose`, { product_type_id: selectedProductType.value });
        if (Array.isArray(res.data?.data)) {
          setDosageOptions(res.data.data.map((d) => ({ value: d.title, label: d.title })));
        }
      } catch (err) {
        console.error("Error fetching dosage options:", err);
      }
    };
    fetchDosages();
  }, [selectedProductType]);

  // Fetch Product Details for Edit
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;
      try {
        const token = localStorage.getItem("curtishCleanAuthToken");
        const res = await axios.post(
          `${API_BASE_URL}/ProductsDetails`,
          { id: productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data?.data;
        if (!data) return;

        setFormData((prev) => ({
          ...prev,
          title: data.title || "",
          brand: data.brand || "",
          type: data.type || "",
          size: data.size || "",
          sizeUnit: data.sizeUnit || "",
          description: data.description || "",
          highlights: data.highlights || "",
          usage: data.usage || "",
          ingredients: data.ingredients || "",
          dosage: data.dosage || "",
          treatmentPhase: data.when_to_use || "",
          whenToStart: data.when_to_start || "",
          whenToStop: data.when_to_stop || "",
          duration: data.duration || "",
          whenToResume: data.time_option || "",
          frequency: data.frequency || "",
          intakeMode: data.intake_mode || "",
        }));

        setSelectedCategories((data.service_categories || []).map((c) => ({ value: c.id, label: c.title })));

        const typeObj = productTypes.find((pt) => pt.value === data.type) || null;
        setSelectedProductType(typeObj);
        setSelectedDosage(dosageOptions.find((d) => d.value === data.dosage) || null);
        setTimings(data.timings || []);

        setExistingImages(
          (data.images || []).map((img) => ({
            url: img.image_url,
            id: img.id,
            isExisting: true,
          }))
        );
      } catch (err) {
        console.error("Error fetching product details:", err);
      }
    };
    fetchProductDetails();
  }, [productId, productTypes, dosageOptions]);

  // Handle Input
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleRichTextChange = (field, data) => setFormData({ ...formData, [field]: data });

  // Handle Images
  const handleDrop = (acceptedFiles) => {
    setProductImages([
      ...productImages,
      ...acceptedFiles.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) })),
    ]);
  };
  const removeNewImage = (i) => setProductImages(productImages.filter((_, index) => i !== index));
  const removeExistingImage = (id) => setExistingImages(existingImages.filter((img) => img.id !== id));

  const getUnitLabel = () => selectedProductType?.unit || "";

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([k, v]) => formPayload.append(k, v));
      formPayload.set("type", selectedProductType?.value || "");
      formPayload.set("dosage", selectedDosage?.value || "");
      formPayload.append("categories", JSON.stringify(selectedCategories.map((c) => c.value)));
      productImages.forEach((file) => !file.isExisting && formPayload.append("images", file));
      formPayload.append("existingImages", JSON.stringify(existingImages.map((img) => img.url)));
      formPayload.append("timings", JSON.stringify(timings.filter((t) => t)));
      if (productId) formPayload.append("id", productId);
      const userId = localStorage.getItem("UserID");
      formPayload.append("clinic_id", userId);

      const token = localStorage.getItem("Token");
      const res = await axios.post(`${API_BASE_URL}/add-product`, formPayload, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      if (res.data.status) {
        toast.success(productId ? "Product updated!" : "Product added!");
        router.push("/clinic/product/list");
      } else toast.error(res.data.message || "Failed");
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  // Delete Image
  const handleDelete = (row) => setSelectedRow(row);
  const handleConfirmDelete = async () => {
    if (!selectedRow) return;
    try {
      const token = localStorage.getItem("Token");
      const res = await axios.delete(`${API_BASE_URL}/deleteProductImage/${selectedRow.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status) {
        toast.success("Image deleted!");
        removeExistingImage(selectedRow.id);
        setSelectedRow(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete product image");
    }
  };

  const infoText = { fontSize: "10px" };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Product Information */}
        <div className="card mb-4">
          <div className="card-body">
            <h4 className="fw-medium mb-3">{productId ? "Edit Product" : "Add Product"}</h4>
            <div className="row">
              {/* Product Name */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Product Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter Product Name"
                  required
                />
              </div>

              {/* Categories */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Product Category <span className="text-danger">*</span>
                </label>
                <Select
                  isMulti
                  options={categories}
                  value={selectedCategories}
                  onChange={setSelectedCategories}
                  placeholder="Select Categories"
                  required
                />
              </div>

              {/* Brand */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Brand Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Enter Brand Name"
                />
              </div>

              {/* Product Type */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Product Type <span className="text-danger">*</span>
                </label>
              <Select
  options={productTypes}
  value={selectedProductType}
  onChange={(selected) => {
    setSelectedProductType(selected);
    setFormData((prev) => ({
      ...prev,
      type: selected?.value || "",
      size: "", // ✅ reset size
      sizeUnit: selected?.unit || "",
      dosage: "" // ✅ reset dosage value in formData too
    }));
    setSelectedDosage(null); // ✅ reset dosage selection
  }}
  placeholder="Select Product Type"
  isClearable
  required
/>
              </div>

              {/* Size */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Product Size <span className="text-danger">*</span>{" "}
                  {selectedProductType ? `(${getUnitLabel()})` : ""}
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    required
                  />
                  <span className="input-group-text">{getUnitLabel() || "ml"}</span>
                </div>
              </div>

              {/* Dosage */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Dosage <span className="text-danger">*</span></label>
                <Select
                  options={dosageOptions}
                  value={selectedDosage}
                  onChange={setSelectedDosage}
                  placeholder="Select Dosage"
                  isClearable
                  required
                />
              </div>

              {/* CKEditor fields */}
              {["description", "highlights", "usage", "ingredients"].map((field) => (
                <div className="col-md-6 mb-3" key={field}>
                  <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  {CKEditor && ClassicEditor ? (
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData[field]}
                      onChange={(event, editor) => handleRichTextChange(field, editor.getData())}
                    />
                  ) : (
                    <p>Loading editor...</p>
                  )}
                </div>
              ))}

              {/* Images */}
              <div className="col-md-12 mb-3">
                <label className="form-label">Product Images</label>
                <Dropzone onDrop={handleDrop} multiple>
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className="dropzone p-4 text-center" style={{ border: "2px dashed #ddd", borderRadius: "8px", cursor: "pointer" }}>
                      <input {...getInputProps()} />
                      <i className="ti ti-cloud-upload h1 text-muted"></i>
                      <h3>Drop files here or click to upload.</h3>
                      <small className="text-muted">(Max 5 MB)</small>
                    </div>
                  )}
                </Dropzone>

                {/* New Images */}
                {productImages.map((file, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between border rounded p-2 mb-2">
                    <img src={file.preview} alt={file.name} style={{ width: 50, height: 50, objectFit: "cover", marginRight: 10 }} />
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-truncate">{file.name}</div>
                      <small className="text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</small>
                    </div>
                    <button type="button" className="btn btn-link text-danger fs-5" onClick={() => removeNewImage(idx)}>✕</button>
                  </div>
                ))}

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="row mt-3">
                    {existingImages.map((img) => (
                      <div className="col-md-3 mb-2" key={img.id}>
                        <div className="position-relative">
                          <img src={img.url} className="img-fluid rounded" alt="preview" />
                          <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" data-bs-toggle="modal" data-bs-target="#delete_user" onClick={() => handleDelete(img)}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Section */}
        <div className="card mb-4">
          <div className="card-body">
            <h4 className="fw-medium mb-3">Product Prescription</h4>
            <div className="row">
              {/* Treatment Phase */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Treatment Phase </label>
                <h6 style={infoText}>Select when this product is intended to be used in your client’s treatment journey.</h6>
                  <Select
        options={treatmentPhaseOptions}
        value={treatmentPhaseOptions.find((opt) => opt.value === formData.treatmentPhase) || null}
        onChange={(opt) => setFormData({ ...formData, treatmentPhase: opt?.value || "" })}
        isClearable
      />

              </div>

              {/* When to Start */}
              <div className="col-md-6 mb-3">
                <label className="form-label">When to Start</label>
                <h6 style={infoText}>Select when your client should start using this product.</h6>
            <Select
        options={whenToStartOptions}
        value={whenToStartOptions.find((opt) => opt.value === formData.whenToStart) || null}
        onChange={(opt) => setFormData({ ...formData, whenToStart: opt?.value || "" })}
        isClearable
      />
              </div>

              {/* When to Stop */}
              <div className="col-md-6 mb-3">
                <label className="form-label">When to Stop</label>
                <h6 style={infoText}>Select when your client should stop using this product to avoid irritation or sensitivity.</h6>
                <Select
        options={whenToStopOptions}
        value={whenToStopOptions.find((opt) => opt.value === formData.whenToStop) || null}
        onChange={(opt) => setFormData({ ...formData, whenToStop: opt?.value || "" })}
        isClearable
      />
              </div>

              {/* When to Resume */}
              <div className="col-md-6 mb-3">
                <label className="form-label">When to Resume</label>
                <h6 style={infoText}>Select when your client can safely restart this product after their treatment.</h6>
               <Select
        options={whenToResumeOptions}
        value={whenToResumeOptions.find((opt) => opt.value === formData.whenToResume) || null}
        onChange={(opt) => setFormData({ ...formData, whenToResume: opt?.value || "" })}
        isClearable
      />
              </div>

              {/* Frequency */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Frequency</label>
                <h6 style={infoText}>Select how frequently your client should use this product.</h6>
                <Select
                  options={frequencyOptions}
                  value={frequencyOptions.find((f) => f.value === formData.frequency) || null}
                  onChange={(opt) => setFormData({ ...formData, frequency: opt?.value || "" })}
                  isClearable
                />
              </div>

              {/* Duration */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Duration</label>
                <h6 style={infoText}>Select how long this product should be used before your client’s next review.</h6>
                <Select
                  options={durationsOptions}
                  value={durationsOptions.find((d) => d.value === formData.duration) || null}
                  onChange={(opt) => setFormData({ ...formData, duration: opt?.value || "" })}
                  isClearable
                />
              </div>

              {/* Mode of Intake */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Mode of Intake</label>
                <h6 style={infoText}>Select where this product fits in your client’s routine order.</h6>
                <Select
                  options={intakeOptions}
                  value={intakeOptions.find((i) => i.value === formData.intakeMode) || null}
                  onChange={(opt) => setFormData({ ...formData, intakeMode: opt?.value || "" })}
                  isClearable
                />
              </div>
            </div>

            <div className="d-flex justify-content-end pt-4">
              <button type="submit" className="btn btn-primary">Publish Product</button>
            </div>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <div className="modal fade" id="delete_user" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-body text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-lg bg-danger text-white">
                  <i className="ti ti-trash fs-24"></i>
                </span>
              </div>
              <h5 className="fw-bold mb-1 position-relative z-1">Delete Confirmation</h5>
              <p className="mb-3 position-relative z-1">Are you sure you want to delete?</p>
              <div className="d-flex justify-content-center">
                <button type="button" className="btn btn-light me-3" data-bs-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={handleConfirmDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
