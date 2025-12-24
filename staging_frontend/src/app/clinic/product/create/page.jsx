"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import dynamic from "next/dynamic";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Dynamically import Dropzone (avoids SSR issues)
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
  const API_BASE_URL = MainConfig.API_BASE_URL;

  // --- States ---
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [dosageOptions, setDosageOptions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [selectedDosage, setSelectedDosage] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [timings, setTimings] = useState([""]);

  const [durationsOptions, setDurationsOptions] = useState([]);
  const [intakeOptions, setIntakeOptions] = useState([]);
  const [frequencyOptions, setFrequencyOptions] = useState([]);
  const [treatmentPhaseOptions, setTreatmentPhaseOptions] = useState([]);
  const [whenToStartOptions, setWhenToStartOptions] = useState([]);
  const [whenToStopOptions, setWhenToStopOptions] = useState([]);
  const [whenToResumeOptions, setWhenToResumeOptions] = useState([]);

  const [selectedFrequencyStatus, setSelectedFrequencyStatus] = useState(null);
  const [selectedTimeOption, setSelectedTimeOption] = useState("");

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
    whenToResume: "",
    duration: "",
    frequency: "",
    intakeMode: "",
    outsource_link: "",
  });

  // ------------------- Fetch Categories -------------------
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

  // ------------------- Fetch Product Types + Prescription Options -------------------
  useEffect(() => {
    const fetchProductTypesData = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/ProductType`, {});
        const productTypesData = res.data?.ProductType || [];
        const durationsData = res.data?.durations || [];
        const intakeData = res.data?.intakeModeOptions || [];
        const frequencyData = res.data?.frequency || [];
        const treatmentPhaseData = res.data?.TreatmentPhase || [];
        const startData = res.data?.WhenToStart || [];
        const stopData = res.data?.WhenToStop || [];
        const resumeData = res.data?.WhenToResume || [];

        setProductTypes(
          productTypesData.map((item) => ({
            value: item.title,
            label: item.title,
            unit: item.size,
          }))
        );

        setFrequencyOptions(
          frequencyData.map((item) => ({
            value: item.label,
            label: item.label,
            status: item.status, // status for AM/PM/BOTH
          }))
        );

        setDurationsOptions(
          durationsData.map((d) => ({
            value: d.label,
            label: d.label,
          }))
        );

        setIntakeOptions(
          intakeData.map((i) => ({
            value: i.label,
            label: i.label,
          }))
        );

        setTreatmentPhaseOptions(
          treatmentPhaseData.map((t) => ({
            value: t.title,
            label: t.title,
          }))
        );

        setWhenToStartOptions(
          startData.map((t) => ({
            value: t.title,
            label: t.title,
          }))
        );

        setWhenToStopOptions(
          stopData.map((t) => ({
            value: t.title,
            label: t.title,
          }))
        );

        setWhenToResumeOptions(
          resumeData.map((t) => ({
            value: t.title,
            label: t.title,
          }))
        );
      } catch (err) {
        console.error("Error fetching product types:", err);
      }
    };

    fetchProductTypesData();
  }, [API_BASE_URL]);

  // ------------------- Fetch Dosage Options -------------------
  useEffect(() => {
    const fetchDosages = async () => {
      try {
        if (!selectedProductType) {
          setDosageOptions([]);
          return;
        }
        const res = await axios.post(`${API_BASE_URL}/ProductDose`, {
          product_type_id: selectedProductType.value,
        });
        if (Array.isArray(res.data?.data)) {
          setDosageOptions(
            res.data.data.map((d) => ({
              value: d.title,
              label: d.title,
            }))
          );
        } else {
          setDosageOptions([]);
        }
      } catch (err) {
        console.error("Error fetching dosage options:", err);
      }
    };
    fetchDosages();
  }, [API_BASE_URL, selectedProductType]);

  // ------------------- Input Handlers -------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRichTextChange = (fieldName, data) => {
    setFormData({ ...formData, [fieldName]: data });
  };

  const handleDrop = (acceptedFiles) => {
    setProductImages([
      ...productImages,
      ...acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      ),
    ]);
  };

  const removeImage = (index) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const getUnitLabel = () => selectedProductType?.unit || "";

  // ------------------- Submit -------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const invalidFiles = productImages.filter((file) => {
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      const maxSize = 5 * 1024 * 1024;
      return !validTypes.includes(file.type) || file.size > maxSize;
    });
    if (invalidFiles.length > 0) {
      toast.error("Some files were rejected (check type/size).");
      return;
    }

    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value);
      });

      formPayload.set("type", selectedProductType?.value || "");
      formPayload.set("dosage", selectedDosage?.value || "");

      if (String(selectedFrequencyStatus) === "1") {
        formPayload.set("timeOption", selectedTimeOption);
      }

      formPayload.append(
        "categories",
        JSON.stringify(selectedCategories.map((c) => c.value))
      );

      productImages.forEach((file) => {
        formPayload.append("images", file);
      });

      formPayload.append("timings", JSON.stringify(timings.filter((t) => t)));
      const userId = localStorage.getItem("UserID");
      formPayload.append("clinic_id", userId);

      const response = await axios.post(`${API_BASE_URL}/add-product`, formPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === false) {
        toast.error(response.data.message || "Failed to add product");
      } else {
        toast.success("Product added successfully!");
        router.push("/clinic/product/list");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An unexpected error occurred.");
      console.error("❌ Error submitting product:", error);
    }
  };

  const infoText = {
  fontSize: "12px",
  color: "black",
};

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* --- Product Information --- */}
        <div className="card mb-4">
          <div className="card-body">
            <h4 className="fw-medium mb-3">Product Information</h4>
            <div className="row">
              {/* Product Name */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Product Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} placeholder="Enter Product Name" required />
              </div>

              {/* Category */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Product Category <span className="text-danger">*</span></label>
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
                <input type="text" className="form-control" name="brand" value={formData.brand} onChange={handleChange} placeholder="Enter Brand Name" />
              </div>

              {/* Product Type */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Product Type <span className="text-danger">*</span></label>
                <Select
                  options={productTypes}
                  value={selectedProductType}
                  onChange={(selected) => {
                    setSelectedProductType(selected);
                    setFormData({
                      ...formData,
                      type: selected?.value || "",
                      sizeUnit: selected?.unit || "",
                    });
                    setSelectedDosage(null);
                  }}
                  placeholder="Select Product Type"
                  isClearable
                  required
                />
              </div>

              {/* Product Size */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Product Size <span className="text-danger">*</span> {selectedProductType ? `(${getUnitLabel()})` : ""}
                </label>
                <div className="input-group">
                  <input type="number" className="form-control" name="size" value={formData.size} onChange={handleChange} required placeholder="Enter Product Size" />
                  <span className="input-group-text">{getUnitLabel() || "ml"}</span>
                </div>
              </div>

        
              <div className="col-md-6 mb-3">
                <label className="form-label">Dosage <span className="text-danger">*</span></label>
                <Select options={dosageOptions} value={selectedDosage} onChange={setSelectedDosage} placeholder="Select Dosage" isClearable required />
              </div>

                  <div className="col-md-6 mb-3">
                <label className="form-label">
                  Product Outsource Link 
                </label>
                <div className="input-group">
                  <input type="text" className="form-control" name="outsource_link" value={formData.outsource_link} onChange={handleChange} placeholder="Enter Outsource Link"  />
                </div>
              </div> 

              {/* CKEditor fields */}
              {["description", "highlights", "usage", "ingredients"].map((field) => (
                <div className="col-md-6 mb-3" key={field}>
                  <label className="form-label">Product {field.charAt(0).toUpperCase() + field.slice(1)}</label>
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
                <label className="form-label">Product Images <span className="text-danger">*</span></label>
                <Dropzone onDrop={handleDrop} multiple>
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className="dropzone p-4 text-center" style={{ cursor: "pointer", borderRadius: "8px", border: "2px dashed #ddd" }}>
                      <input {...getInputProps()} />
                      <i className="ti ti-cloud-upload h1 text-muted"></i>
                      <h3>Drop files here or click to upload.</h3>
                      <small className="text-muted">(Upload images. Max file size 5 MB)</small>
                    </div>
                  )}
                </Dropzone>
                <div className="mt-3">
                  {productImages.map((file, idx) => (
                    <div key={idx} className="d-flex align-items-center justify-content-between border rounded p-2 mb-2" style={{ background: "#f9f9f9" }}>
                      <img src={file.preview} alt={`preview-${idx}`} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px", marginRight: "10px" }} />
                      <div className="flex-grow-1">
                        <div className="fw-semibold text-truncate">{file.name}</div>
                        <small className="text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</small>
                      </div>
                      <button type="button" className="btn btn-link text-danger fs-5" onClick={() => removeImage(idx)} title="Remove" style={{ textDecoration: "none" }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* --- Product Prescription --- */}
        <div className="card mb-4">
          <div className="card-body">
            <h4 className="fw-medium mb-3">Product Prescription</h4>
            <div className="row">

              {/* 🆕 Treatment Phase */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Treatment Phase</label>
                <h6 style={infoText}>Select when this product is intended to be used in your client’s treatment journey.</h6>
                <Select
                  options={treatmentPhaseOptions}
                  value={treatmentPhaseOptions.find((t) => t.value === formData.treatmentPhase) || null}
                  onChange={(opt) => setFormData({ ...formData, treatmentPhase: opt?.value || "" })}
                  isClearable
                />
              </div>

              {/* 🆕 When to Start */}
              <div className="col-md-6 mb-3">
                <label className="form-label">When to Start</label>
                     <h6 style={infoText}>Select when your client should start using this product.</h6>
                <Select
                  options={whenToStartOptions}
                  value={whenToStartOptions.find((t) => t.value === formData.whenToStart) || null}
                  onChange={(opt) => setFormData({ ...formData, whenToStart: opt?.value || "" })}
                  isClearable
                />
              </div>

              {/* 🆕 When to Stop */}
              <div className="col-md-6 mb-3">
                <label className="form-label">When to Stop</label>
                     <h6 style={infoText}>Select when your client should stop using this product to avoid irritation or sensitivity.</h6>
                <Select
                  options={whenToStopOptions}
                  value={whenToStopOptions.find((t) => t.value === formData.whenToStop) || null}
                  onChange={(opt) => setFormData({ ...formData, whenToStop: opt?.value || "" })}
                  isClearable
                />
              </div>

              {/* 🆕 When to Resume */}
              <div className="col-md-6 mb-3">
                <label className="form-label">When to Resume</label>
                     <h6 style={infoText}>Select when your client can safely restart this product after their treatment.</h6>
                <Select
                  options={whenToResumeOptions}
                  value={whenToResumeOptions.find((t) => t.value === formData.whenToResume) || null}
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
                  onChange={(opt) => {
                    setFormData({ ...formData, frequency: opt?.value || "" });
                    setSelectedFrequencyStatus(opt?.status || null);
                    if (opt?.status !== 1) setSelectedTimeOption("");
                  }}
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
    </div>
  );
}
