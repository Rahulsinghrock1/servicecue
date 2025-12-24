"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLoadScript } from "@react-google-maps/api";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

const libraries = ["places"];

// ✅ Wrapper ensures Maps API loads before form renders
export default function ClinicProfileFormWrapper() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyCpMZZOUwcKCvu16msa3cmrR8EhbqHwFoc",
    libraries,
  });

  if (loadError) return <p>Error loading Google Maps API</p>;
  if (!isLoaded) return <p>Loading Google Maps...</p>;

  return <ClinicProfileForm />;
}

// ✅ Main Form
function ClinicProfileForm() {
  const router = useRouter();
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const [formData, setFormData] = useState({
    clinicLogo: null,
    clinic_name: "",
    business_name: "",
    abn: "",
    ownerName: "",
    email: "",
    website: "",
    google_review: "",
    business_phone: "",
    alternate_contact_number: "",
    address: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    about: "",
    experience: "",
    specialists: "",
    lat: "",
    lon: "",
  });

  // ✅ Handle Address Selection (with Geocoding)
  const handleSelectAddress = async (description) => {
    setFormData((prev) => ({ ...prev, address: description }));
    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      const components = results[0].address_components;

      const getComp = (types) => {
        const comp = components.find((c) => types.every((t) => c.types.includes(t)));
        return comp ? comp.long_name : "";
      };

      const street_number = getComp(["street_number"]);
      const route = getComp(["route"]);
      const locality = getComp(["locality"]) || getComp(["sublocality", "political"]);
      const adminArea1 = getComp(["administrative_area_level_1"]);
      const postal_code = getComp(["postal_code"]);
      const country = getComp(["country"]);
      const fullAddress = [street_number, route].filter(Boolean).join(" ");

      setFormData((prev) => ({
        ...prev,
        address: fullAddress || description,
        city: locality,
        state: adminArea1,
        postal_code: postal_code,
        country: country,
        lat: lat,
        lon: lng,
      }));
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  // ✅ Load Clinic Data
  useEffect(() => {
    const token = localStorage.getItem("curtishCleanAuthToken");
    axios
      .get(`${API_BASE_URL}/auth/profileDetails`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data.user);
        setFormData({
          clinicLogo: res.data.user.clinicLogo || null,
          clinic_name: res.data.user.clinic_name || "",
          business_name: res.data.user.business_name || "",
          abn: res.data.user.abn || "",
          ownerName: res.data.user.ownerName || "",
          email: res.data.user.email || "",
          website: res.data.user.website || "",
          google_review: res.data.user.google_review || "",
          business_phone: res.data.user.business_phone || "",
          alternate_contact_number: res.data.user.alternate_contact_number || "",
          address: res.data.user.address || "",
          address_line2: res.data.user.address_line2 || "",
          city: res.data.user.city || "",
          state: res.data.user.state || "",
          postal_code: res.data.user.postcode || "",
          country: res.data.user.country || "",
          about: res.data.user.about || "",
          experience: res.data.user.experience || "",
          specialists: res.data.user.specialists || "",
          lat: res.data.user.lat || "",
          lon: res.data.user.lon || "",
        });
      })
      .catch(() => toast.error("Failed to load profile"));
  }, [API_BASE_URL]);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "clinicLogo") {
      setFormData({ ...formData, clinicLogo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("curtishCleanAuthToken");
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) data.append(key, formData[key]);
      });
      await axios.post(`${API_BASE_URL}/updateProfile`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Basic Information updated successfully");
      router.push("/clinic/services-clinic/list");
    } catch (error) {
      toast.error("Update failed");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="page-inner">
      <div className="row">
        <div className="col-12">
          <div className="mb-3">
            <h4 className="fw-bold mb-0">Manage Clinic</h4>
          </div>

          <div className="card">
            <div className="card-body p-0">
              <div className="settings-wrapper d-flex">
                {/* Sidebar */}
                <div className="sidebars settings-sidebar" id="sidebar2">
                  <div className="sticky-sidebar sidebar-inner" data-simplebar="">
                    <div id="sidebar-menu5" className="sidebar-menu mt-0 p-0">
                      <ul>
                        <li>
                          <ul>
                            <li className={openMenu === "manageClinic" ? "active" : ""}>
                              <a
                                href="#"
                                className="style-sidebar"
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleMenu("manageClinic");
                                }}
                              >
                                <i className="ti ti-medical-cross"></i>
                                <span>Manage Clinic</span>
                                <span
                                  className={`menu-arrow ${
                                    openMenu === "manageClinic" ? "rotated" : ""
                                  }`}
                                ></span>
                              </a>
                              <ul
                                className="submenu-list"
                                style={{
                                  display: openMenu === "manageClinic" ? "none" : "block",
                                }}
                              >
                                <li className="submenu">
                                  <Link href="/clinic/basic-Information/list">
                                    <span className="sub-item">Basic Information</span>
                                  </Link>
                                </li>
                                <li className="submenu">
                                  <Link href="/clinic/services-clinic/list">
                                    <span className="sub-item">Services & Specializations</span>
                                  </Link>
                                </li>
                                <li className="submenu">
                                  <Link href="/clinic/operational-details/list">
                                    <span className="sub-item">Operational Details</span>
                                  </Link>
                                </li>
                                <li className="submenu">
                                  <Link href="/clinic/portfolio-clinic/list">
                                    <span className="sub-item">Portfolio/Gallery</span>
                                  </Link>
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* ✅ Main Form Section */}
                <div className="card flex-fill mb-0 border-0 bg-light-500 shadow-none">
                  <div className="card-header border-bottom pb-1 px-0 mx-3">
                    <h4 className="pt-2 fw-bold">Basic Information</h4>
                  </div>
                  <div className="card-body px-0 mx-3">
                    <form onSubmit={handleSubmit}>
                      <input type="hidden" name="lat" value={formData.lat} />
                      <input type="hidden" name="lon" value={formData.lon} />
                      <div className="row border-bottom mb-3">
                        <div className="col-lg-12">
                          <div className="row align-items-center mb-3">
                            <div className="col-lg-2">
                              <label className="form-label mb-0">
                                Clinic Logo<span className="text-danger ms-1">*</span>
                              </label>
                            </div>
                            <div className="col-lg-10">
                              <div className="profile-container">
                                <img
                                  src={
                                    formData.clinicLogo instanceof File
                                      ? URL.createObjectURL(formData.clinicLogo)
                                      : formData.clinicLogo || "/assets/img/clinic.jpg"
                                  }
                                  alt="Profile"
                                />
                                <div className="overlay-btn">
                                  <a
                                    href="javascript:void(0);"
                                    className="text-white"
                                    onClick={() =>
                                      document.getElementById("profileUpload").click()
                                    }
                                  >
                                    <i className="ti ti-photo fs-10"></i>
                                  </a>
                                </div>
                                <input
                                  type="file"
                                  id="profileUpload"
                                  name="clinicLogo"
                                  accept="image/*"
                                  style={{ display: "none" }}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Basic Info Fields */}
                        <div className="col-lg-12">
                          <div className="row align-items-center mb-3">
                            <div className="col-lg-6 mb-3">
                              <label className="form-label mb-2">
                                Clinic Name<span className="text-danger ms-1">*</span>
                              </label>
                              <input
                                type="text"
                                name="clinic_name"
                                value={formData.clinic_name}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter Clinic Name"
                                required
                              />
                            </div>
                            <div className="col-lg-6 mb-3">
                              <label className="form-label mb-2">Legal Business Name</label>
                              <input
                                type="text"
                                name="business_name"
                                value={formData.business_name}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter Legal Business Name"
                              />
                            </div>
                            <div className="col-lg-6 mb-3">
                              <label className="form-label mb-2">
                                Business Registration Number / ABN
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <input
                                type="text"
                                name="abn"
                                value={formData.abn}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter ABN"
                                required
                              />
                            </div>
                            <div className="col-lg-6 mb-3">
                              <label className="form-label mb-2">
                                Owner / Primary Contact Person Name
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <input
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter Owner Name"
                                required
                              />
                            </div>

<div className="col-lg-6 mb-3">
  <label className="form-label mb-2">Website URL</label>
  <input
    type="url"
    name="website"
    value={formData.website}
    onChange={(e) => {
      let value = e.target.value.trim();

      // ✅ Agar user ne kuch likha aur https/http missing hai
      if (value && !/^https?:\/\//i.test(value)) {
        value = `https://${value}`;
      }

      handleChange({
        target: { name: "website", value },
      });
    }}
    className="form-control"
    placeholder="https://www.example.com"
    pattern="https?://.+"
    title="Please enter a valid URL starting with http:// or https://"
  />
</div>
<div className="col-lg-6 mb-3">
  <label className="form-label mb-2">Google Review Link</label>
  <input
    type="url"
    name="google_review"
    value={formData.google_review}
    onChange={(e) => {
      let value = e.target.value.trim();

      // ✅ Agar user ne kuch likha aur https/http missing hai
      if (value && !/^https?:\/\//i.test(value)) {
        value = `https://${value}`;
      }

      handleChange({
        target: { name: "google_review", value },
      });
    }}
    className="form-control"
    placeholder="https://www.example.com"
    pattern="https?://.+"
    title="Please enter a valid URL starting with http:// or https://"
  />
</div>
                            <div className="col-lg-6 mb-3">
                              <label className="form-label mb-2">
                                Contact Number (Primary Business Phone)
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <input
                                type="number"
                                name="business_phone"
                                value={formData.business_phone}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter Phone Number"
                                required
                              />
                            </div>
                            <div className="col-lg-6 mb-3">
                              <label className="form-label mb-2">Alternate Contact Number</label>
                              <input
                                type="number"
                                name="alternate_contact_number"
                                value={formData.alternate_contact_number}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter Alternate Phone"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ✅ Address Section (Updated) */}
                      <div className="row border-bottom mb-3">
                        <div className="mb-3">
                          <h5 className="fw-bold mb-0">Address Information</h5>
                        </div>
                        <div className="col-lg-6 mb-3">
                          <AddressAutocomplete
                            addressValue={formData.address}
                            onChange={(val) =>
                              setFormData((prev) => ({ ...prev, address: val }))
                            }
                            onSelect={handleSelectAddress}
                            required
                          />
                        </div>
                        <div className="col-lg-6 mb-3">
                          <label className="form-label mb-2">City / Suburb</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Enter City / Suburb"
                            required
                          />
                        </div>
                        <div className="col-lg-6 mb-3">
                          <label className="form-label mb-2">State / Region</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Enter State / Region"
                            required
                          />
                        </div>
                        <div className="col-lg-6 mb-3">
                          <label className="form-label mb-2">Postal Code</label>
                          <input
                            type="text"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Enter Postal Code"
                          />
                        </div>
                      </div>

                      {/* ✅ Other Info */}
                      <div className="row border-bottom mb-3">
                        <div className="mb-3">
                          <h5 className="fw-bold mb-0">Other Information</h5>
                        </div>
                        <div className="col-lg-12 mb-3">
                          <label className="form-label mb-2">About Clinic</label>
                          <textarea
                            name="about"
                            value={formData.about}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="About Clinic"
                            rows={4}
                            required
                          ></textarea>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="d-flex justify-content-end">
                        <button type="submit" className="btn btn-lg btn-primary">
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                {/* End Form */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Address Autocomplete (stable version)
function AddressAutocomplete({ addressValue, onChange, onSelect }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 300 });

  useEffect(() => {
    setValue(addressValue, false);
  }, [addressValue, setValue]);

  const handleSelect = (desc) => () => {
    setValue(desc, false);
    clearSuggestions();
    onSelect(desc);
  };

  return (
    <div>
      <label className="form-label">Address</label>
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        disabled={!ready}
        placeholder="Search location..."
        className="form-control"
      />
      {status === "OK" && (
        <ul className="border mt-1 rounded shadow bg-white">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={handleSelect(description)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
