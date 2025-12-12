"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import MainConfig from "@/mainconfig";
import Select from "react-select";
import Link from "next/link";

const loadGoogleMapsScript = (API_KEY) =>
  new Promise((resolve) => {
    if (window.google && window.google.maps) return resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });

const ClientCreate = () => {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id; // for edit
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [loading, setLoading] = useState(false);

  // form state
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    dob: "",
    gender: "",
    bio: "",
    address: "",
    country: "",
    city: "",
    state: "",
    postcode: "",
    avatarUrl: "",
    assignedStaff: [],
  });

  // staff dropdown state
  const [staffOptions, setStaffOptions] = useState([]);

  // profile image
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  // Google Maps
  const addressInputRef = useRef(null);

  useEffect(() => {
    const initGoogleAutocomplete = async () => {
      await loadGoogleMapsScript("AIzaSyCpMZZOUwcKCvu16msa3cmrR8EhbqHwFoc");
      if (!addressInputRef.current) return;

      const autocomplete = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: ["in", "us", "au"] },
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.address_components) return;

        const components = place.address_components;
        let city = "",
          state = "",
          country = "",
          postcode = "";

        components.forEach((c) => {
          if (c.types.includes("locality")) city = c.long_name;
          if (c.types.includes("administrative_area_level_1")) state = c.long_name;
          if (c.types.includes("country")) country = c.long_name;
          if (c.types.includes("postal_code")) postcode = c.long_name;
        });

        setFormData((prev) => ({
          ...prev,
          address: place.formatted_address,
          city,
          state,
          country,
          postcode,
        }));
      });
    };

    initGoogleAutocomplete();
  }, []);

  // fetch staff
  const fetchStaffs = async () => {
    try {
      const userId = localStorage.getItem("UserID");
      const response = await axios.post(`${API_BASE_URL}/staffList`, {
        user_role_id: 2,
        clinic_id: userId,
      });
      const staffData = response.data.data || [];
      const options = staffData.map((s) => ({
        value: s.id,
        label: `${s.full_name}`,
      }));
      setStaffOptions(options);

      if (rawId) fetchClient(rawId, options);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch staff");
    }
  };

  // fetch client
  const fetchClient = async (id, staffOpts) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/client/details/${id}`);
      const client = res.data?.data ?? res.data;

      const assignedStaffArray =
        client.assignedStaff && typeof client.assignedStaff === "string"
          ? client.assignedStaff.split(",").map((sid) => parseInt(sid, 10))
          : Array.isArray(client.assignedStaff)
          ? client.assignedStaff
          : [];

      setFormData({
        full_name: client.full_name ?? "",
        phone: client.phone ?? "",
        email: client.email ?? "",
        dob: client.dob ?? "",
        gender: client.gender ?? "",
        bio: client.bio ?? "",
        address: client.address ?? "",
        country: client.country ?? "",
        city: client.city ?? "",
        state: client.state ?? "",
        postcode: client.postcode ?? "",
        avatarUrl: client.avatar ?? "",
        assignedStaff: assignedStaffArray,
      });

      setProfilePreview(client.avatar ?? null);

      // pre-select staff dropdown
      const preSelected = staffOpts.filter((s) =>
        assignedStaffArray.includes(s.value)
      );
      setFormData((prev) => ({
        ...prev,
        assignedStaff: preSelected.map((s) => s.value),
      }));
    } catch (error) {
      console.error("❌ Failed to fetch client:", error);
      toast.error("Failed to load client data");
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  // staff multi-select change
  const handleStaffChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      assignedStaff: selected.map((s) => s.value),
    }));
  };

  // input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value || "" }));
  };

  // profile image change
  const handleProfileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    } else {
      setProfileImage(null);
      setProfilePreview(formData.avatarUrl || null);
    }
  };

  // submit form
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "avatarUrl") return;
        const val = formData[key];
        if (Array.isArray(val)) {
          payload.append(key, val.join(","));
        } else {
          payload.append(key, val ?? "");
        }
      });

      if (profileImage) payload.append("avatar", profileImage);

      if (rawId) payload.append("id", rawId);
      const userId = localStorage.getItem("UserID");
      payload.append("clinic_id", userId);

      const SAVE_URL = `${API_BASE_URL}/add-client`;
      const res = await axios.post(SAVE_URL, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data?.message ?? "Client saved successfully");
      router.push("/clinic/client/list");
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to save client — see console";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 ">
        <div className="flex-grow-1">
          <h4 className="fw-bold mb-0">
            {rawId ? "Edit Client" : "Add Client"}
          </h4>
        </div>
        <div className="text-end d-flex">
          <Link
            href="/clinic/client/list"
            className="btn btn-primary ms-2 fs-13 btn-md"
          >
            <i className="ti ti-users me-1"></i>All Clients
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="card mb-0">
        <div className="card-body">
          {/* Profile Image */}
          <div className="col-lg-12">
            <div className="mb-3 d-flex align-items-center">
              <label className="form-label">Profile Image</label>
              <div className="drag-upload-btn avatar avatar-xxl rounded-circle bg-light text-muted position-relative overflow-hidden z-1 mb-2 ms-4 p-0">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile"
                    className="w-100 h-100 object-fit-cover"
                  />
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
              <label className="form-label">
                Full Name <span className="text-danger ms-1">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                placeholder="Enter Full Name"
                className="form-control"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>

            <div className="col-lg-6 mb-3">
              <label className="form-label">
                Phone Number <span className="text-danger ms-1">*</span>
              </label>
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
              <label className="form-label">
                Email Address <span className="text-danger ms-1">*</span>
              </label>
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
              <label className="form-label">
                DOB 
              </label>
              <input
                type="date"
                name="dob"
                className="form-control"
                value={formData.dob}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="col-lg-6 mb-3">
              <label className="form-label">
                Gender
              </label>
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

          {/* Address */}
          <div className="py-2 mb-3 feild-head">
            <h6 className="mb-0 fs-13">Address Information</h6>
          </div>
          <div className="row">
            <div className="col-lg-12 mb-3">
              <label className="form-label">Address</label>
              <input
                ref={addressInputRef}
                name="address"
                placeholder="Search Address..."
                value={formData.address}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-lg-6 mb-3">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                placeholder="City"
                className="form-control"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

             <div className="col-lg-6 mb-3">
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                placeholder="State"
                className="form-control"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

             <div className="col-lg-6 mb-3">
              <label className="form-label">Postcode</label>
              <input
                type="text"
                name="postcode"
                placeholder="Postcode"
                className="form-control"
                value={formData.postcode}
                onChange={handleChange}
              />
            </div>

             <div className="col-lg-6 mb-3">
              <label className="form-label">Country</label>
              <input
                type="text"
                name="country"
                placeholder="Country"
                className="form-control"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Bio */}


          {/* Assign Staff */}
          <div className="col-lg-12 mb-3">
            <label className="form-label">Assign Staff</label>
            <Select
              isMulti
              options={staffOptions}
              value={staffOptions.filter((s) =>
                formData.assignedStaff.includes(s.value)
              )}
              onChange={handleStaffChange}
            />
          </div>

          {/* Submit */}
          <div className="d-flex mt-3">
            <button
              type="button"
              className="btn btn-primary"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Saving..." : rawId ? "Update Client" : "Add Client"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCreate;
