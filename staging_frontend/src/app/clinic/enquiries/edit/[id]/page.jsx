"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import MainConfig from "@/mainconfig";
import Select from "react-select";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { useLoadScript } from "@react-google-maps/api";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import useOnclickOutside from "react-cool-onclickoutside";
const libraries = ["places"];
import Swal from "sweetalert2";

const SiteCreate = () => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null); // ✅ For modals

  const router = useRouter();
  const params = useParams();
  const rawId = params?.id; // may be undefined initially
  const API_BASE_URL = MainConfig.API_BASE_URL;
const [savedImages, setSavedImages] = useState([]);

  // fallback to extract id from URL if useParams didn't provide it
  const getIdFromPath = () => {
    try {
      if (typeof window === "undefined") return null;
      const parts = window.location.pathname.split("/").filter(Boolean);
      // try last segment
      return parts.length ? parts[parts.length - 1] : null;
    } catch (e) {
      return null;
    }
  };

  const staffId = rawId ?? getIdFromPath();

  const [loading, setLoading] = useState(false);
  const [expertiseOptions, setExpertiseOptions] = useState([]);

  // form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dob: "",
    gender: "",
    designation: [], // array of values
    licenseNo: "",
    employeeCode: "",
    bloodGroup: "",
    bio: "",
    address: "",
    country: "",
    city: "",
    state: "",
    postcode: "",
    expertise: [], // array of ids/values
    languages: [],
    experience: "",
    // optional: backend might return avatar url
    avatarUrl: "",
  });

  // files
  const [files, setFiles] = useState([]); // certificates
  const [profileImage, setProfileImage] = useState(null); // new File chosen
  const [profilePreview, setProfilePreview] = useState(null); // preview url (either existing or new)

  // options
  const designationOptions = [
    { value: "Skin Specialist", label: "Skin Specialist" },
    { value: "Therapist", label: "Therapist" },
    { value: "Aesthetician", label: "Aesthetician" },
    { value: "Orthopedic Surgeon", label: "Orthopedic Surgeon" },
    { value: "Pediatrics", label: "Pediatrics" },
  ];


  const languageOptions = [
    { value: "English", label: "English" },
    { value: "French", label: "French" },
    { value: "Russian", label: "Russian" },
    { value: "Arabic", label: "Arabic" },
    { value: "Hindi", label: "Hindi" },
  ];

  // dropzone
  const onDrop = (acceptedFiles) => {
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

  // Google maps
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCpMZZOUwcKCvu16msa3cmrR8EhbqHwFoc",
    libraries,
  });

  // places autocomplete
  const {
    ready,
    value = "",
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

  const handleSelectAddress = ({ description }) => async () => {
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
          onClick={handleSelectAddress(suggestion)}
          className="p-2 cursor-pointer hover:bg-light"
        >
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

  // basic input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value || "" }));
  };

  // select change for multi selects
  const handleSelectChange = (name, selectedOptions = []) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOptions.map((opt) => opt.value),
    }));
  };

  // fetch expertise options
  useEffect(() => {
    const fetchExpertise = async () => {
      try {
        const payload = { category_id: "" };
        const res = await axios.post(`${API_BASE_URL}/CategoryServices`, payload);
        if (Array.isArray(res.data?.data)) {
          const options = res.data.data.map((srv) => ({
            value: srv.id,
            label: srv.name,
          }));
          setExpertiseOptions(options);
        } else {
          setExpertiseOptions([]);
        }
      } catch (error) {
        console.error("❌ Error fetching expertise options:", error);
      }
    };
    fetchExpertise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL]);

  // fetch staff details on mount or when staffId changes
  useEffect(() => {
    let cancelToken;
    let isMounted = true;

    const fetchStaffDetails = async (sId) => {
      if (!sId) {
        console.warn("fetchStaffDetails: no staffId available yet.");
        return;
      }

      setLoading(true);

      try {
        cancelToken = axios.CancelToken.source();
        const res = await axios.get(`${API_BASE_URL}/staff/details/${sId}`, {
          cancelToken: cancelToken.token,
        });

        if (!isMounted) return;
        const data = res.data?.user ?? res.data ?? {};

        setFormData((prev) => ({
          ...prev,
          firstName: data.first_name ?? data.firstName ?? data.firstname ?? prev.firstName,
          lastName: data.last_name ?? data.lastName ?? data.lastname ?? prev.lastName,
          phone: data.mobile ?? prev.mobile,
          email: data.email ?? prev.email,
          dob: data.dob ?? data.date_of_birth ?? prev.dob,
          gender: data.gender ?? prev.gender,
          designation: Array.isArray(data.designation)
            ? data.designation
            : typeof data.designation === "string" && data.designation.length
            ? data.designation.split(",")
            : data.designation_ids ?? prev.designation,
          licenseNo: data.license_no ?? data.licenseNo ?? prev.licenseNo,
          employeeCode: data.employee_code ?? data.employeeCode ?? prev.employeeCode,
          bloodGroup: data.blood_group ?? data.bloodGroup ?? prev.bloodGroup,
          bio: data.about ?? prev.about,
          address: data.address ?? prev.address,
          country: data.country ?? prev.country,
          city: data.city ?? prev.city,
          state: data.state ?? prev.state,
          postcode: data.postcode ?? data.postal_code ?? prev.postcode,
          expertise: Array.isArray(data.expertise)
            ? data.expertise.map((e) => (typeof e === "object" ? e.id ?? e.value : e))
            : typeof data.expertise === "string" && data.expertise.length
            ? data.expertise.split(",").map((s) => s.trim())
            : prev.expertise,
          languages: Array.isArray(data.languages)
            ? data.languages
            : typeof data.languages === "string" && data.languages.length
            ? data.languages.split(",")
            : prev.languages,
          experience: data.experience ?? prev.experience,
          avatarUrl: data.avatar ?? data.avatar_url ?? data.profile_image ?? prev.avatarUrl,
        }));

        // show preview if server returned an avatar path
        const avatarUrl = data.avatar ?? data.avatar_url ?? data.profile_image;
        if (avatarUrl) {
          setProfilePreview(avatarUrl);
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request cancelled", err.message);
        } else {
          console.error("Failed to fetch staff details:", err);
          toast.error("Unable to fetch staff details. See console for error.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // call fetchStaffDetails if staffId present
    fetchStaffDetails(staffId);

    return () => {
      isMounted = false;
      if (cancelToken) cancelToken.cancel("Component unmounted - cancelling request");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId]);

  // handle profile image change
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

  // submit update
const handleSubmit = async () => {
  if (!staffId && !isAddMode) {
    toast.error("Staff ID missing — cannot update");
    return;
  }

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

    payload.append("user_role_id", 2);
    payload.append("id", staffId);

        if (profileImage instanceof File) {
        payload.append("avatar", profileImage);
        }

    files.forEach((file) => {
      payload.append("certificates", file);
    });

    const SAVE_URL = `${API_BASE_URL}/add-staff`;

    const res = await axios.post(SAVE_URL, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.data?.status === false) {
      toast.error(res.data.message || "Something went wrong");
      return;
    }

    toast.success(res.data.message || "Staff saved successfully");
  } catch (error) {
    console.error("❌ Failed to save staff:", error);

    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to save staff";

    toast.error(message);
  } finally {
    setLoading(false);
  }
};



const fetchPortfolio = async () => {
    if (!staffId) return; // user load होने तक wait

    try {
      const res = await fetch(`${API_BASE_URL}/staff/certificates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_id: staffId }),
      });

      const data = await res.json();
      if (res.ok) {
        setSavedImages(data.data || []);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    if (staffId) {
      fetchPortfolio();
    }
  }, [staffId]);

  const handleDelete = (row) => {
  setSelectedRow(row); // set selected row for modal
  // then open modal (already triggered with data-bs-toggle="modal")
};

const handleConfirmDelete = async () => {
  if (!selectedRow) return;
  try {
    await axios.delete(`${API_BASE_URL}/staff-certificates/${selectedRow.id}`);
    setSavedImages((prev) => prev.filter((img) => img.id !== selectedRow.id));
    toast.success("Your image has been deleted.");
   // Swal.fire("Deleted!", "Your image has been deleted.", "success");
  } catch (error) {
    console.error("Delete error:", error);
  }
};


  // helper: selected options for react-select (multiselect)
  const selectedDesignationOptions = designationOptions.filter((opt) =>
    formData.designation?.includes(opt.value)
  );

  const selectedExpertiseOptions = expertiseOptions.filter((opt) =>
    formData.expertise?.map(String).includes(String(opt.value))
  );

  const selectedLanguages = languageOptions.filter((opt) =>
    formData.languages?.includes(opt.value)
  );

  // if maps not loaded show small loader but keep UI interactive
  // (we don't block fetch on google maps)
  if (!isLoaded) {
    // show still the form skeleton but with a small notice
    // NOTE: we still render full component below; here we just optionally show a short loader
    // (Do not return early because we want useEffect to run)
    console.log("Google maps not yet loaded (isLoaded=false) — form remains usable.");
  }

  return (
    <div>
      <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 ">
        <div className="flex-grow-1">
          <h4 className="fw-bold mb-0"> Edit Staff </h4>
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
              <input type="date" name="dob" className="form-control" value={formData.dob} onChange={handleChange} />
            </div>

            <div className="col-lg-6 mb-3">
              <label className="form-label">Gender *</label>
              <select className="form-control" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-lg-6 mb-3">
              <label className="form-label">Designation *</label>
              <Select isMulti options={designationOptions} value={selectedDesignationOptions} onChange={(selected) => handleSelectChange("designation", selected)} />
            </div>

            <div className="col-lg-6 mb-3">
              <label className="form-label">Professional License Number *</label>
              <input type="text" name="licenseNo" placeholder="Enter License Number" className="form-control" value={formData.licenseNo} onChange={handleChange} />
            </div>

            <div className="col-lg-6 mb-3">
              <label className="form-label">Employee Code *</label>
              <input type="text" name="employeeCode" placeholder="Enter Employee Code" className="form-control" value={formData.employeeCode} onChange={handleChange} />
            </div>


            <div className="col-lg-12 mb-3">
              <label className="form-label">Bio</label>
              <textarea className="form-control" name="bio" rows="4" placeholder="About Doctor/Staff" value={formData.bio} onChange={handleChange}></textarea>
            </div>
          </div>

          <div className="py-2 mb-3 feild-head">
            <h4 className="fw-medium mb-0">Address Information</h4>
          </div>

          {/* Address with Google Autocomplete */}
          <div className="mb-3" ref={ref}>
            <label className="form-label">Address</label>
            <input value={value} onChange={(e) => { setValue(e.target.value); setFormData((prev) => ({ ...prev, address: e.target.value })); }} disabled={!ready} placeholder="Search address..." className="form-control" />
            {status === "OK" && <ul className="border rounded bg-white shadow mt-1 list-unstyled">{renderSuggestions()}</ul>}
          </div>

          {/* Auto-filled location fields */}
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
              <input type="text" name="postal_code" className="form-control" value={formData.postcode} readOnly />
            </div>
          </div>

          <div className="row mt-3">
            <div className="py-2 mb-3 feild-head">
              <h4 className="fw-medium mb-0">Professional Information</h4>
            </div>

            <div className="col-lg-4 mb-3">
              <label className="form-label">Expertise</label>
              <Select isMulti options={expertiseOptions} value={selectedExpertiseOptions} onChange={(selected) => setFormData((prev) => ({ ...prev, expertise: selected ? selected.map((s) => s.value) : [] }))} />
            </div>

            <div className="col-lg-4 mb-3">
              <label className="form-label">Languages</label>
              <Select isMulti options={languageOptions} value={selectedLanguages} onChange={(selected) => handleSelectChange("languages", selected)} />
            </div>

            <div className="col-lg-4 mb-3">
              <label className="form-label">Years of Experience</label>
              <input type="number" name="experience" placeholder="Enter Experience" className="form-control" value={formData.experience} onChange={handleChange} />
            </div>
          </div>

          {/* Dropzone */}
          <div className="mb-3">
            <label className="form-label">Certificates</label>
                    <div className="row mt-2 row-gap-3 mb-3">
                      {savedImages.map((img) => (
                        <div
                          key={img.id}
                          className="col-lg-2 col-xl-2 col-6 col-md-4 position-relative"
                        >
                          <a href={img.image_url} className="image-popup">
                            <img
                              src={img.image_url}
                              alt="portfolio"
                              className="rounded w-100 img-fluid"
                            />
                          </a>
                          <div className="d-flex position-absolute top-0 right-0 z-2 p-2">

                             <a href="javascript:void(0);" className="bg-danger text-light btn-icon btn-sm d-flex justify-content-center align-items-center rounded me-2" data-bs-toggle="modal" data-bs-target="#delete_user" onClick={() => handleDelete(img)}>
                          <i className="ti ti-trash"></i>
                          </a>
                          </div>
                        </div>
                      ))}
                    </div>
            <div {...getRootProps()} className={`dropzone p-4  rounded ${isDragActive ? "bg-light" : ""}`} style={{ textAlign: "center", cursor: "pointer" }}>
              <input {...getInputProps()} />
              <i className="ti ti-cloud-upload h1 text-muted"></i>
              <h3>Drop files here or click to upload.</h3>
              <p className="text-muted">Drag & drop files here, or click to select (max 1MB, png/jpg/docx/pdf)</p>
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
};

export default SiteCreate;
