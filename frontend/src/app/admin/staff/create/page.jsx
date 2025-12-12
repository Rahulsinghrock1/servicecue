"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import MainConfig from "@/mainconfig";
import Select from "react-select";
import { useDropzone } from "react-dropzone";
import { useLoadScript } from "@react-google-maps/api";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import useOnclickOutside from "react-cool-onclickoutside";

const libraries = ["places"];

const SiteCreate = () => {

    const bloodGroupOptions = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];


  const router = useRouter();
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const [loading, setLoading] = useState(false);

  // ✅ safe defaults
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dob: "",
    gender: "",
    designation: [],
    licenseNo: "",
    employeeCode: "",
    bloodGroup: "",
    bio: "",
    address: "",
    country: "",
    city: "",
    state: "",
    postcode: "",
    expertise: [],
    languages: [],
    experience: "",
  });

  const [files, setFiles] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  // handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value || "" }));
  };

  // react-select handler
  const handleSelectChange = (name, selectedOptions = []) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOptions.map((opt) => opt.value),
    }));
  };

  // dropzone
  const onDrop = (acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  };

  const removeFile = (fileName) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 1024 * 1024, // 1 MB
  });

  // ✅ Google Maps Loader
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCpMZZOUwcKCvu16msa3cmrR8EhbqHwFoc", // apna API key
    libraries,
  });

  // Google address autocomplete
  const {
    ready,
    value = "", // ✅ safe default
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: ["in"] } },
    debounce: 300,
  });

  const ref = useOnclickOutside(() => {
    clearSuggestions();
  });

  const handleSelect = ({ description }) => async () => {
    setValue(description, false);
    setFormData((prev) => ({ ...prev, address: description }));
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      console.log("📍 Coordinates:", { lat, lng });

      const components = results[0].address_components || [];
      let city = "";
      let state = "";
      let country = "";
      let postcode = "";

      components.forEach((c) => {
        if (c.types.includes("locality")) city = c.long_name;
        if (c.types.includes("administrative_area_level_1")) state = c.long_name;
        if (c.types.includes("country")) country = c.long_name;
        if (c.types.includes("postal_code")) postcode = c.long_name;
      });

      setFormData((prev) => ({
        ...prev,
        city,
        state,
        country,
        postcode,
      }));
    } catch (err) {
      console.error("Geocode error:", err);
    }
  };

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li
          key={place_id}
          onClick={handleSelect(suggestion)}
          className="p-2 cursor-pointer hover:bg-light"
        >
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

  // submit form
  const handleSubmit = async () => {
  try {
    setLoading(true);
    const payload = new FormData();

    Object.keys(formData).forEach((key) => {
      if (Array.isArray(formData[key])) {
        // Join arrays as comma-separated string
        payload.append(key, formData[key].join(","));
      } else {
        payload.append(key, formData[key] || "");
      }
    });

    if (profileImage) {
      payload.append("avatar", profileImage);
    }

    files.forEach((file) => {
      payload.append("certificates[]", file);
    });

    await axios.post(`${API_BASE_URL}/add-staff`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("Doctor/Staff added successfully!");
    router.push("/admin/staff/list");
  } catch (error) {
    toast.error("Failed to add Doctor/Staff");
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  // options
  const designationOptions = [
    { value: "Skin Specialist", label: "Skin Specialist" },
    { value: "Therapist", label: "Therapist" },
    { value: "Aesthetician", label: "Aesthetician" },
    { value: "Orthopedic Surgeon", label: "Orthopedic Surgeon" },
    { value: "Pediatrics", label: "Pediatrics" },
  ];

  const expertiseOptions = [
    { value: "Acne Treatment", label: "Acne Treatment" },
    { value: "Laser Hair Removal", label: "Laser Hair Removal" },
    { value: "Chemical Peels", label: "Chemical Peels" },
    { value: "Anti-aging", label: "Anti-aging" },
    { value: "Facials", label: "Facials" },
  ];

  const languageOptions = [
    { value: "English", label: "English" },
    { value: "French", label: "French" },
    { value: "Russian", label: "Russian" },
    { value: "Arabic", label: "Arabic" },
    { value: "Hindi", label: "Hindi" },
  ];

  // ✅ agar google maps load nahi hua hai
  if (!isLoaded) return <p>Loading Google Maps...</p>;

  return (
    <div className="content">
      <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
        <div className="flex-grow-1">
          <h4 className="fw-bold mb-0"> Add Doctor/Staff </h4>
        </div>
      </div>

      <div className="card mb-0">
        <div className="card-body">
          {/* Profile Image */}
          <div className="col-lg-12">
            <div className="mb-3 d-flex align-items-center">
              <label className="form-label">Profile Image</label>
              <div className="drag-upload-btn avatar avatar-xxl rounded-circle bg-light text-muted position-relative overflow-hidden z-1 mb-2 ms-4 p-0">
                {profileImage ? (
                  <img
                    src={URL.createObjectURL(profileImage)}
                    alt="Profile"
                    className="w-100 h-100 object-fit-cover"
                  />
                ) : (
                  <i className="ti ti-user-plus fs-16"></i>
                )}
                <input
                  type="file"
                  className="form-control image-sign position-absolute top-0 start-0 w-100 h-100 opacity-0"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="row">
            <div className="col-lg-6 mb-3">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter First Name"
                className="form-control"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="col-lg-6 mb-3">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter Last Name"
                className="form-control"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div className="col-lg-6 mb-3">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                name="phone"
                placeholder="Enter Phone Number"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="col-lg-6 mb-3">
              <label className="form-label">Email Address *</label>
              <input
                type="text"
                name="email"
                placeholder="Enter Email Address"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

                     <div className="col-lg-6 mb-3">
              <label className="form-label">DOB *</label>
              <input
                type="date"
                name="dob"
                placeholder="Enter Email Address"
                className="form-control"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>

              <div className="col-lg-6 mb-3">
  <label className="form-label">Gender *</label>
  <select
    className="form-control"
    name="gender"
    value={formData.gender}
    onChange={handleChange}
  >
    <option value="">Select Gender</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
</div>


          </div>

          {/* Address with Google Autocomplete */}
          <div className="mb-3" ref={ref}>
            <label className="form-label">Address</label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={!ready}
              placeholder="Search address..."
              className="form-control"
            />
            {status === "OK" && (
              <ul className="border rounded bg-white shadow mt-1 list-unstyled">
                {renderSuggestions()}
              </ul>
            )}
          </div>

          {/* Auto-filled location fields */}
          <div className="row">
            <div className="col-lg-6 mb-3">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                placeholder="Enter City"
                className="form-control"
                value={formData.city}
                readOnly
              />
            </div>
            <div className="col-lg-6 mb-3">
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                placeholder="Enter State"
                className="form-control"
                value={formData.state}
                readOnly
              />
            </div>
            <div className="col-lg-6 mb-3">
              <label className="form-label">Country</label>
              <input
                type="text"
                name="country"
                placeholder="Enter Country"
                className="form-control"
                value={formData.country}
                readOnly
              />
            </div>
            <div className="col-lg-6 mb-3">
              <label className="form-label">Postcode</label>
              <input
                type="text"
                name="postal_code"
                placeholder="Enter Postcode"
                className="form-control"
                value={formData.postcode}
                readOnly
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="row mt-3">
            <div className="col-lg-6 mb-3">
              <label className="form-label">Designation *</label>
              <Select
                isMulti
                options={designationOptions}
                onChange={(selected) => handleSelectChange("designation", selected)}
              />
            </div>

                        <div className="col-lg-6 mb-3">
              <label className="form-label">Medical License Number *</label>
              <input
                type="text"
                name="licenseNo"
                placeholder="Enter Medical License Number"
                className="form-control"
                value={formData.licenseNo}
              />
            </div>
            <div className="col-lg-6 mb-3">
  <label className="form-label">Blood Group</label>
  <Select
    options={bloodGroupOptions}
    value={bloodGroupOptions.find(opt => opt.value === formData.bloodGroup)}
    onChange={(selected) => 
      setFormData(prev => ({ ...prev, bloodGroup: selected?.value || '' }))
    }
  />
</div>

                            <div className="col-lg-6 mb-3">
              <label className="form-label">Employee Code *</label>
              <input
                type="text"
                name="employeeCode"
                placeholder="Enter Employee Code"
                className="form-control"
                value={formData.employeeCode}
                
              />
            </div>
<div className="col-lg-12 mb-3">
  <label className="form-label">Bio</label>
  <textarea
    className="form-control"
    name="bio"
    rows="4"
    placeholder="About Doctor/Staff"
    value={formData.bio}
    onChange={handleChange}
  ></textarea>
</div>


            <div className="col-lg-6 mb-3">
              <label className="form-label">Expertise</label>
              <Select
                isMulti
                options={expertiseOptions}
                onChange={(selected) => handleSelectChange("expertise", selected)}
              />
            </div>

            <div className="col-lg-6 mb-3">
              <label className="form-label">Languages</label>
              <Select
                isMulti
                options={languageOptions}
                onChange={(selected) => handleSelectChange("languages", selected)}
              />
            </div>

            <div className="col-lg-6 mb-3">
              <label className="form-label">Years of Experience</label>
              <input
                type="number"
                name="experience"
                placeholder="Enter Experience"
                className="form-control"
                value={formData.experience}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Dropzone */}
          <div className="mb-3">
            <label className="form-label">Certificates</label>
            <div
              {...getRootProps()}
              className={`dropzone p-4 border rounded ${
                isDragActive ? "bg-light" : ""
              }`}
              style={{ textAlign: "center", cursor: "pointer" }}
            >
              <input {...getInputProps()} />
              <p className="text-muted">
                Drag & drop files here, or click to select (max 1MB,
                png/jpg/docx/pdf)
              </p>
            </div>
            <div className="mt-3">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="d-flex align-items-center justify-content-between border p-2 rounded mb-2"
                >
                  <span>
                    {file.name} - {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeFile(file.name)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteCreate;
