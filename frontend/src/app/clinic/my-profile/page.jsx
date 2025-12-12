"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@context/UserContext";
import {
  handleSuccessResponse,
  handleErrorResponse,
} from "@utility/handleApiResponse";
import MainConfig from "@/mainconfig";

export default function MyProfile() {
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const router = useRouter();
  const { setUser } = useUser();

  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    mobile: "",
    country_code: "",
    gender: "",
    dob: "",
    avatar: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch Profile Details
  useEffect(() => {
    const token = localStorage.getItem("curtishCleanAuthToken");
    if (!token) return;

    axios
      .get(`${API_BASE_URL}/auth/profileDetails`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const user = res.data?.user || {};

        const imageUrl = user?.avatar
          ? user.avatar.startsWith("http")
            ? user.avatar
            : `${API_BASE_URL}/${user.avatar.replace(/^\/+/, "")}`
          : null;

        setProfileData({
          full_name: user.full_name || "",
          email: user.email || "",
          mobile: user.mobile || "",
          country_code: user.country_code || "",
          gender: user.gender || "",
          dob: user.dob || "",
          avatar: null, // only for uploading new file
        });

        setPreviewImage(imageUrl);
        setUser({ ...user, avatar: imageUrl });
      })
      .catch(() => toast.error("Failed to load profile"));
  }, [API_BASE_URL, setUser]);

  // ✅ Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Image change handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData((prev) => ({
        ...prev,
        avatar: file,
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("full_name", profileData.full_name);
      formData.append("email", profileData.email);
      formData.append("mobile", profileData.mobile);
      formData.append("country_code", profileData.country_code);
      formData.append("gender", profileData.gender);
      formData.append("dob", profileData.dob);

      if (profileData.avatar) {
        formData.append("avatar", profileData.avatar);
      }

      const token = localStorage.getItem("curtishCleanAuthToken");

      const response = await axios.post(
        `${API_BASE_URL}/auth/editProfile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data?.data || {};

      const imageUrl = updatedUser?.avatar
        ? updatedUser.avatar.startsWith("http")
          ? updatedUser.avatar
          : `${API_BASE_URL}/${updatedUser.avatar.replace(/^\/+/, "")}`
        : null;

      setPreviewImage(imageUrl);
      setUser({ ...updatedUser, avatar: imageUrl });

      handleSuccessResponse(response.data);
      setTimeout(() => {
  window.location.reload();
}, 1);
    } catch (error) {
      handleErrorResponse(error);
      toast.error(error.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-inner">
      <div className="row">
        <div className="col-12">
          <div className="mb-3">
            <h4 className="fw-bold mb-0">Profile</h4>
          </div>

          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="row border-bottom mb-3">
                  {/* Avatar */}
                  <div className="col-lg-12 mb-4">
                    <div className="row align-items-center">
                      <div className="col-lg-2">
                        <label className="form-label mb-0">
                          Profile Image<span className="text-danger ms-1">*</span>
                        </label>
                      </div>
                      <div className="col-lg-10">
                        <div
                          className="position-relative d-inline-block"
                          style={{ width: "90px", height: "90px" }}
                        >
                          <img
                            src={previewImage || "/web/assets/img/no-image.jpg"}
                            alt="Profile"
                            className="rounded-circle border"
                            style={{
                              width: "90px",
                              height: "90px",
                              objectFit: "cover",
                            }}
                          />

                          <div
                            onClick={() =>
                              document.getElementById("avatarUpload").click()
                            }
                            className="position-absolute top-50 start-50 translate-middle"
                            style={{
                              background: "#ffffffaa",
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              border: "1px solid #ddd",
                            }}
                          >
                            <i className="ti ti-camera fs-6 text-dark"></i>
                          </div>

                          <input
                            type="file"
                            id="avatarUpload"
                            name="avatar"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="col-lg-6">
                    <div className="row align-items-center mb-3">
                      <div className="col-lg-4">
                        <label className="form-label mb-0">
                          Full Name<span className="text-danger ms-1">*</span>
                        </label>
                      </div>
                      <div className="col-lg-8">
                        <input
                          type="text"
                          name="full_name"
                          className="form-control"
                          placeholder="Enter Full Name"
                          value={profileData.full_name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-lg-6">
                    <div className="row align-items-center mb-3">
                      <div className="col-lg-4">
                        <label className="form-label mb-0">Email</label>
                      </div>
                      <div className="col-lg-8">
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          placeholder="Enter Email Address"
                          value={profileData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="col-lg-6">
                    <div className="row align-items-center mb-3">
                      <div className="col-lg-4">
                        <label className="form-label mb-0">
                          Contact Number
                        </label>
                      </div>
                      <div className="col-lg-8">
                        <input
                          type="text"
                          name="mobile"
                          className="form-control"
                          placeholder="Enter Contact Number"
                          value={profileData.mobile}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="col-lg-6">
                    <div className="row align-items-center mb-3">
                      <div className="col-lg-4">
                        <label className="form-label mb-0">Gender</label>
                      </div>
                      <div className="col-lg-8">
                        <select
                          name="gender"
                          className="form-control"
                          value={profileData.gender}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="d-flex align-items-center justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-lg bg-theme-clr text-white"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
