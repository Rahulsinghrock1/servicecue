"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import MainConfig from "@/mainconfig";
import Select from "react-select";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { useLoadScript } from "@react-google-maps/api";
import useOnclickOutside from "react-cool-onclickoutside";

// NOTE: Address autocomplete moved into its own child so hooks run only after maps loaded.
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

const libraries = ["places"];

const AddressAutocomplete = ({ onAddressSelect, initialAddress = "" }) => {
  // This component is only mounted once Google Maps script is loaded.
  const {
    ready,
    value = "",
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: ["in", "au", "us"] } },
    debounce: 300,
  });

  const ref = useOnclickOutside(() => clearSuggestions());

  useEffect(() => {
    // populate initial
    if (initialAddress) setValue(initialAddress, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAddress]);

  const handleSelectAddress = (suggestion) => async () => {
    const description = suggestion.description;
    setValue(description, false);
    clearSuggestions();
    onAddressSelect(description); // bubble up

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
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

      onAddressSelect(description, { city, state, country, postcode, lat, lng });
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
          onClick={handleSelectAddress(suggestion)}
          className="p-2 cursor-pointer hover:bg-light"
        >
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

  return (
    <div className="mb-3" ref={ref}>
      <label className="form-label">Address</label>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        placeholder="Search address..."
        className="form-control"
      />
      {status === "OK" && <ul className="border rounded bg-white shadow mt-1 list-unstyled">{renderSuggestions()}</ul>}
    </div>
  );
};

const StaffCreate = ({ params: maybeParams }) => {
  const router = useRouter();
  // If your page passes params as prop, prefer that; otherwise we fall back to client path extraction.
  const rawIdFromParams = maybeParams?.id ?? null;

  const API_BASE_URL = MainConfig.API_BASE_URL;

  const getIdFromPath = () => {
    try {
      if (typeof window === "undefined") return null;
      const parts = window.location.pathname.split("/").filter(Boolean);
      return parts.length ? parts[parts.length - 1] : null;
    } catch (e) {
      return null;
    }
  };

  // Resolve staffId from whichever source is available (params prop, URL path)
  const [resolvedStaffId, setResolvedStaffId] = useState(rawIdFromParams ?? null);
  useEffect(() => {
    if (!resolvedStaffId) {
      const id = getIdFromPath();
      if (id) setResolvedStaffId(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const staffId = resolvedStaffId;

  const [loading, setLoading] = useState(false);
  const [expertiseOptions, setExpertiseOptions] = useState([]);

  // form state
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    dob: "",
    gender: "",
    designation: [], // array of values
    licenseNo: "",
    employeeCode: "",
    bloodGroup: "",
    about: "",
    address: "",
    country: "",
    city: "",
    state: "",
    postcode: "",
    expertise: [], // array of ids/values
    languages: [],
    experience: "",
    avatarUrl: "",
  });

  // files
  const [files, setFiles] = useState([]); // certificates
  const [profileImage, setProfileImage] = useState(null); // new File chosen
  const [profilePreview, setProfilePreview] = useState(null); // preview url

  // options
  const designationOptions = useMemo(
    () => [
      { value: "Skin Specialist", label: "Skin Specialist" },
      { value: "Therapist", label: "Therapist" },
      { value: "Aesthetician", label: "Aesthetician" },
      { value: "Orthopedic Surgeon", label: "Orthopedic Surgeon" },
      { value: "Pediatrics", label: "Pediatrics" },
    ],
    []
  );

  const languageOptions = useMemo(
    () => [
      { value: "English", label: "English" },
      { value: "French", label: "French" },
      { value: "Russian", label: "Russian" },
      { value: "Arabic", label: "Arabic" },
      { value: "Hindi", label: "Hindi" },
    ],
    []
  );

  // dropzone
  const onDrop = (acceptedFiles, fileRejections) => {
    if (fileRejections?.length) {
      toast.error("Some files were rejected (check type/size).");
    }
    setFiles((prev) => {
      const prevNames = prev.map((p) => p.name);
      const newFiles = acceptedFiles.filter((f) => !prevNames.includes(f.name));
      return [...prev, ...newFiles];
    });
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

  // Google maps - load script early but do NOT call places hooks until script ready
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "AIzaSyCpMZZOUwcKCvu16msa3cmrR8EhbqHwFoc",
    libraries,
  });

  // fetch expertise options
  useEffect(() => {
    let mounted = true;
    const fetchExpertise = async () => {
      try {
        const payload = { category_id: "" };
        const res = await axios.post(`${API_BASE_URL}/CategoryServices`, payload);
        if (mounted) {
          if (Array.isArray(res.data?.data)) {
            const options = res.data.data.map((srv) => ({
              value: srv.id,
              label: srv.name,
            }));
            setExpertiseOptions(options);
          } else {
            setExpertiseOptions([]);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching expertise options:", error);
      }
    };
    fetchExpertise();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL]);

  // handle profile image change
  useEffect(() => {
    // initialize preview from avatarUrl if present
    if (formData.avatarUrl && !profilePreview && !profileImage) {
      setProfilePreview(formData.avatarUrl);
    }
    // cleanup on unmount
    return () => {
      if (profilePreview && profilePreview.startsWith("blob:")) {
        URL.revokeObjectURL(profilePreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      if (profilePreview && profilePreview.startsWith("blob:")) {
        // revoke previous blob URL
        URL.revokeObjectURL(profilePreview);
      }
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    } else {
      setProfileImage(null);
      setProfilePreview(formData.avatarUrl || null);
    }
  };

  // basic input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value ?? "" }));
  };

  // select change for multi selects
  const handleSelectChange = (name, selectedOptions = []) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOptions.map((opt) => opt.value),
    }));
  };

  const isEditMode = Boolean(staffId);

  // submit update
  const handleSubmit = async () => {
    // if editing, staffId should exist
    if (isEditMode && !staffId) {
      toast.error("Staff ID missing — cannot update");
      return;
    }

    try {
      setLoading(true);

      const payload = new FormData();

      // append form fields
      Object.keys(formData).forEach((key) => {
        if (key === "avatarUrl") return; // skip avatarUrl string
        const val = formData[key];
        if (Array.isArray(val)) {
          payload.append(key, val.join(",")); // backend expects comma separated
        } else {
          payload.append(key, val ?? "");
        }
      });

      // force role ID = 2 (as before)
      payload.append("user_role_id", 2);

      // avatar file if new
      if (profileImage) {
        payload.append("avatar", profileImage);
      }

      // certificates/files (use "certificates")
      files.forEach((file) => {
        payload.append("certificates", file);
      });

      const userId = localStorage.getItem("UserID");
      payload.append("created_by", userId);

      const SAVE_URL = `${API_BASE_URL}/add-staff`;

      const res = await axios.post(SAVE_URL, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("⬇️ staff response:", res?.data);
      toast.success(res.data?.message ?? "Staff saved successfully");
      // Optionally redirect to staff list
       router.push("/clinic/staff/list");
    } catch (error) {
  console.error("❌ Failed to save staff:", error);

  const message =error?.response?.data?.message || "Failed to save staff — see console";

  toast.error(message);
} finally {
      setLoading(false);
    }
  };

  // selected options helpers for react-select (multiselect)
  const selectedDesignationOptions = designationOptions.filter((opt) =>
    formData.designation?.includes(opt.value)
  );

  const selectedExpertiseOptions = expertiseOptions.filter((opt) =>
    formData.expertise?.map(String).includes(String(opt.value))
  );

  const selectedLanguages = languageOptions.filter((opt) => formData.languages?.includes(opt.value));

  // Address select handler (passed down to AddressAutocomplete)
  const onAddressSelect = (description, components = {}) => {
    setFormData((prev) => ({
      ...prev,
      address: description,
      city: components.city ?? prev.city,
      state: components.state ?? prev.state,
      country: components.country ?? prev.country,
      postcode: components.postcode ?? prev.postcode,
    }));
  };

  // if maps not loaded we keep UI usable and render AddressAutocomplete only when isLoaded
  if (loadError) {
    console.warn("Google Maps failed to load:", loadError);
  } else if (!isLoaded) {
    console.log("Google maps not yet loaded (isLoaded=false) — address autocomplete will mount when ready.");
  }

  return (
    <div>
      <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 ">
        <div className="flex-grow-1">
          <h4 className="fw-bold mb-0"> Add Staff </h4>
        </div>
        <div className="text-end d-flex">
          <Link href="/clinic/staff/list" className="btn btn-primary ms-2 fs-13 btn-md">
            <i className="ti ti-users me-1"></i>All Staffs
          </Link>
        </div>
      </div>

      <div className="card mb-0">
        <div className="card-body">
          <div className="py-2 mb-3 feild-head d-flex justify-content-between align-items-center">
            <h4 className="fw-medium mb-0">Basic Information</h4>
          </div>

          {/* Profile Image */}
          <div className="col-lg-12">
            <div className="mb-3 d-flex align-items-center">
              <label className="form-label">Profile Image</label>
              <div className="drag-upload-btn avatar avatar-xxl rounded-circle bg-light text-muted position-relative overflow-hidden z-1 mb-2 ms-4 p-0">
                {profilePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePreview} alt="Profile" className="w-100 h-100 object-fit-cover" />
                ) : (
                  <i className="ti ti-user-plus fs-16"></i>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="form-control image-sign position-absolute top-0 start-0 w-100 h-100 opacity-0"
                  onChange={handleProfileChange}
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="row">
            <div className="col-lg-6 mb-3">
              <label className="form-label">Full Name <span className="text-danger">*</span></label>
       <input
  type="text"
  name="full_name"
  placeholder="Enter Full Name"
  className="form-control"
  value={formData.full_name}
  onChange={handleChange}
  required
/>

            </div>



            <div className="col-lg-6 mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="number"
                name="phone"
                placeholder="Enter Phone Number"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="col-lg-6 mb-3">
              <label className="form-label">Email Address <span className="text-danger">*</span></label>
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
  <label className="form-label">DOB </label>
  <input 
    type="date" 
    name="dob" 
    className="form-control" 
    value={formData.dob} 
    onChange={handleChange}
    max={new Date().toISOString().split("T")[0]} // Sets the max date to today
  />
</div>

            <div className="col-lg-6 mb-3">
              <label className="form-label">Gender</label>
              <select className="form-control" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-lg-6 mb-3">
              <label className="form-label">Designation </label>
              <Select
                instanceId="designation-select"
                isMulti
                options={designationOptions}
                value={selectedDesignationOptions}
                onChange={(selected) => handleSelectChange("designation", selected)}
              />
            </div>



            <div className="col-lg-12 mb-3">
              <label className="form-label">Bio</label>
              <textarea
                className="form-control"
                name="about"
                rows="4"
                placeholder="About Staff"
                value={formData.about}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

       


          <div className="row mt-3">
            <div className="py-2 mb-3 feild-head">
              <h4 className="fw-medium mb-0">Professional Information</h4>
            </div>

            <div className="col-lg-4 mb-3">
              <label className="form-label">Expertise</label>
              <Select
                instanceId="expertise-select"
                isMulti
                options={expertiseOptions}
                value={selectedExpertiseOptions}
                onChange={(selected) => setFormData((prev) => ({ ...prev, expertise: selected ? selected.map((s) => s.value) : [] }))}
              />
            </div>

            <div className="col-lg-4 mb-3">
              <label className="form-label">Languages</label>
              <Select
                instanceId="languages-select"
                isMulti
                options={languageOptions}
                value={selectedLanguages}
                onChange={(selected) => handleSelectChange("languages", selected)}
              />
            </div>

            <div className="col-lg-4 mb-3">
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
              className={`dropzone p-4  rounded ${isDragActive ? "bg-light" : ""}`}
              style={{ textAlign: "center", cursor: "pointer" }}
            >
              <input {...getInputProps()} />
              <i className="ti ti-cloud-upload h1 text-muted"></i>
              <h3>Drop files here or click to upload.</h3>
              <p className="text-muted">Drag & drop files here, or click to select (max 1MB, png/jpg/docx/pdf/webp)</p>
            </div>
            <div className="mt-3">
              {files.map((file) => (
                <div key={file.name} className="d-flex align-items-center justify-content-between border p-2 rounded mb-2">
                  <span>
                    {file.name} - {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeFile(file.name)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="d-flex justify-content-end">
            <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffCreate;
