"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import MainConfig from "@/mainconfig";
import Select from "react-select";
import Link from "next/link";

const GOOGLE_API_KEY = "AIzaSyCpMZZOUwcKCvu16msa3cmrR8EhbqHwFoc"; // Replace with your key

const ClientCreate = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [loading, setLoading] = useState(false);

  const full_name = searchParams.get("name") || "";
  const email = searchParams.get("email") || "";
  const phone = searchParams.get("phone") || "";
  const enquiriesID = searchParams.get("enquiries") || "";

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
    visible_to_staff: false,
  });

  const [staffOptions, setStaffOptions] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  // Google Maps autocomplete
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const addressInputRef = useRef(null);

  // ✅ Prefill form data from URL params
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      full_name: full_name || prev.full_name,
      email: email || prev.email,
      phone: phone || prev.phone,
    }));
  }, [full_name, email, phone]);

  // Load Google Maps JS dynamically
  useEffect(() => {
    if (window.google) {
      setGoogleLoaded(true);
      setAutocompleteService(new window.google.maps.places.AutocompleteService());
      setGeocoder(new window.google.maps.Geocoder());
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      setGoogleLoaded(true);
      setAutocompleteService(new window.google.maps.places.AutocompleteService());
      setGeocoder(new window.google.maps.Geocoder());
    };
    script.onerror = () => {
      toast.error("Failed to load Google Maps API");
    };
    document.head.appendChild(script);
  }, []);

  // Fetch staff list
  const fetchStaffs = async () => {
    try {
      const userId = localStorage.getItem("UserID");
      const response = await axios.post(`${API_BASE_URL}/staffList`, {
        user_role_id: 2,
        clinic_id: userId,
      });
      const staffData = response.data.data || [];
      setStaffOptions(
        staffData.map((s) => ({
          value: s.id,
          label: `${s.full_name}`,
        }))
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch staff");
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const handleStaffChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      assignedStaff: selected.map((s) => s.value),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value || "" }));
  };

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

  // Address search handler
  const handleAddressChange = (e) => {
    const input = e.target.value;
    setFormData((prev) => ({ ...prev, address: input }));

    if (!input || !autocompleteService) {
      setSuggestions([]);
      return;
    }

    autocompleteService.getPlacePredictions(
      { input, componentRestrictions: { country: ["in", "us", "au"] } },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSuggestions(predictions || []);
        } else {
          setSuggestions([]);
        }
      }
    );
  };

 const handleCheckboxChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      visible_to_staff: e.target.checked,
    }));
  };

  const handleSelectAddress = (description) => {
    setFormData((prev) => ({ ...prev, address: description }));
    setSuggestions([]);

    if (!geocoder) return;

    geocoder.geocode({ address: description }, (results, status) => {
      if (status === "OK" && results[0]) {
        const components = results[0].address_components || [];
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
          city,
          state,
          country,
          postcode,
        }));
      }
    });
  };

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

      if (profileImage) {
        payload.append("avatar", profileImage);
      }

      const userId = localStorage.getItem("UserID");
      payload.append("clinic_id", userId);
      payload.append("enquiriesID", enquiriesID);

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
          <h4 className="fw-bold mb-0">Add Client</h4>
        </div>
        <div className="text-end d-flex">
          <Link href="/clinic/client/list" className="btn btn-primary ms-2 fs-13 btn-md">
            <i className="ti ti-users me-1"></i>All Clients
          </Link>
        </div>
      </div>

      <div className="card mb-0">
        <div className="card-body">
          {/* Profile Image */}
          <div className="col-lg-12 mb-3 d-flex align-items-center">
            <label className="form-label">Profile Image</label>
            <div className="drag-upload-btn avatar avatar-xxl rounded-circle bg-light text-muted position-relative overflow-hidden z-1 mb-2 ms-4 p-0">
              {profilePreview ? (
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

          {/* Basic Info */}
          <div className="row">
            <div className="col-lg-6 mb-3">
              <label className="form-label">
                Full Name <span className="text-danger ms-1">*</span>
              </label>
              <input
                type="text"
                name="full_name"
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
                type="phone"
                name="phone"
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
            <h4 className="fw-medium mb-0">Address Information</h4>
          </div>

          <div className="mb-3 position-relative">
            <label className="form-label">Address</label>
            <input
              ref={addressInputRef}
              type="text"
              className="form-control"
              value={formData.address}
              onChange={handleAddressChange}
              placeholder={googleLoaded ? "Search address..." : "Loading Google Maps..."}
              disabled={!googleLoaded}
            />
            {suggestions.length > 0 && (
              <ul className="list-group position-absolute z-10 w-100">
                {suggestions.map((s) => (
                  <li
                    key={s.place_id}
                    className="list-group-item cursor-pointer"
                    onClick={() => handleSelectAddress(s.description)}
                  >
                    {s.description}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* City / State / Country / Postcode */}
          <div className="row">
            <div className="col-lg-6 mb-3">
              <label className="form-label">City</label>
              <input type="text" name="city" className="form-control" value={formData.city} readOnly />
            </div>
            <div className="col-lg-6 mb-3">
              <label className="form-label">State</label>
              <input type="text" name="state" className="form-control" value={formData.state} readOnly />
            </div>
            <div className="col-lg-6 mb-3">
              <label className="form-label">Country</label>
              <input type="text" name="country" className="form-control" value={formData.country} readOnly />
            </div>
            <div className="col-lg-6 mb-3">
              <label className="form-label">Postcode</label>
              <input
                type="text"
                name="postcode"
                className="form-control"
                value={formData.postcode}
                readOnly
              />
            </div>
          </div>

          {/* Visible to Staff */}
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="visibleToStaff"
              checked={formData.visible_to_staff}
              onChange={handleCheckboxChange}
            />
            <label className="form-check-label" htmlFor="visibleToStaff">
              Visible to Staff
            </label>
          </div>

          {/* Assign Staff */}
          <div className="py-2 mb-3 feild-head">
            <h4 className="fw-medium mb-0">Assign Staff</h4>
          </div>
          <div className="mb-3">
            <label className="form-label">Select Staff</label>
            <Select
              isMulti
              options={staffOptions}
              onChange={handleStaffChange}
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </div>

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

export default ClientCreate;
