"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { handleSuccessResponse, handleErrorResponse } from "@utility/handleApiResponse";
import MainConfig from "@/mainconfig";

const API_BASE_URL = MainConfig.API_BASE_URL;

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  // password visibility state
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const togglePassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("curtishCleanAuthToken");

      const response = await axios.post(
        `${API_BASE_URL}/auth/changePassword`,
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      handleSuccessResponse(response.data);

      // Reset form
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      handleErrorResponse(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-inner">
      <div className="row">
        <div className="col-12">
          <div className="mb-3">
            <h4 className="fw-bold mb-0">Change Password</h4>
          </div>
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Old Password */}
                  <div className="form-group mb-3 col-md-4 position-relative">
                    <label htmlFor="oldPassword">Current Password</label>
                    <input
                      type={showPassword.oldPassword ? "text" : "password"}
                      id="oldPassword"
                      name="oldPassword"
                      className="form-control pe-5"
                      placeholder="****************"
                      value={formData.oldPassword}
                      onChange={handleChange}
                      required
                    />
                    <span
                      className="position-absolute top-50 end-0 translate-middle-y me-3"
                      style={{ cursor: "pointer",margin: "12px" }}
                      onClick={() => togglePassword("oldPassword")}
                    >
                      <i
                        className={`bi ${
                          showPassword.oldPassword ? "ti ti-eye" : "ti ti-eye-off"
                        }`}
                      ></i>
                    </span>
                  </div>

                  {/* New Password */}
                  <div className="form-group mb-3 col-md-4 position-relative">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type={showPassword.newPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      className="form-control pe-5"
                      placeholder="****************"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                    />
                    <span
                      className="position-absolute top-50 end-0 translate-middle-y me-3"
                      style={{ cursor: "pointer",margin: "12px" }}
                      onClick={() => togglePassword("newPassword")}
                    >
                      <i
                        className={`bi ${
                          showPassword.newPassword ? "ti ti-eye" : "ti ti-eye-off"
                        }`}
                      ></i>
                    </span>
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group mb-3 col-md-4 position-relative">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type={showPassword.confirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-control pe-5"
                      placeholder="****************"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <span
                      className="position-absolute top-50 end-0 translate-middle-y me-3"
                     style={{ cursor: "pointer",margin: "12px" }}
                      onClick={() => togglePassword("confirmPassword")}
                    >
                      <i
                        className={`bi ${
                          showPassword.confirmPassword
                            ? "ti ti-eye"
                            : "ti ti-eye-off"
                        }`}
                      ></i>
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="form-group text-end">
                  <button
                    type="submit"
                    className="btn text-white btn-lg bg-theme-clr"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Password"}
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
