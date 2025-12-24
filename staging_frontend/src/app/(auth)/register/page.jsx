"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  handleSuccessResponse,
  handleErrorResponse,
} from "@utility/handleApiResponse";
import MainConfig from "@/mainconfig";

export default function RegisterPage() {
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    clinicName: "",
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
    bookingSystem: "",
    user_type: 4,
    terms_accepted: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password and Confirm Password do not match!");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        clinic_name: formData.clinicName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        mobile: formData.contactNumber,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        user_type: formData.user_type,
        booking_system: formData.bookingSystem,
        terms_accepted: formData.terms_accepted,
      };

      const response = await axios.post(
        `${API_BASE_URL}/auth/clinicRegister`,
        payload
      );

      handleSuccessResponse(response.data);
      const result = response.data.user;

      localStorage.setItem("curtishCleanAuthToken", response.data.token);
      localStorage.setItem("UserID", result.id);

      if (result.user_role_id === 3) {
        router.push("/admin");
      } else if (result.user_role_id === 4) {
        router.push("/subscription");
      } else {
        router.push("/login");
      }
    } catch (error) {
      handleErrorResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-wrapper auth-bg position-relative overflow-hidden">
      <div className="container-fluid position-relative z-1">
        <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100 bg-white">
          <div className="row">
            {/* Left Section */}
            <div className="col-lg-6 p-0">
              <div className="login-backgrounds login-covers bg-theme-clr d-lg-flex align-items-center justify-content-center d-none flex-wrap p-4 position-relative h-100 z-0">
                <div className="authentication-card w-100">
                  <div className="authen-overlay-item w-100 text-center">
                    <h1 className="text-white fs-32 fw-bold mb-2">
                      Seamless Client & Healthcare Staff Tracking Dashboard
                    </h1>
                    <p className="text-light fw-normal">
                      Experience efficient, secure, and user-friendly clinic
                      management designed for clients and staff management.
                    </p>
                    <div className="mt-4 mx-auto authen-overlay-img">
                      <img
                        src="web/assets/img/auth/cover-imgs-1.png"
                        alt="Auth Cover"
                      />
                    </div>
                  </div>
                </div>
                <img
                  src="web/assets/img/auth/cover-imgs-2.png"
                  alt="cover"
                  className="img-fluid cover-img"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="col-lg-6 col-md-12 col-sm-12">
              <div className="row justify-content-center align-items-center overflow-auto flex-wrap vh-100 py-4">
                <div className="col-md-9 mx-auto">
                  <form
                    onSubmit={handleSubmit}
                    className="d-flex justify-content-center align-items-center"
                  >
                    <div className="d-flex flex-column justify-content-lg-center p-4 p-lg-0 pb-0 flex-fill">
                      <div className="mx-auto mb-4 text-center">
                        <img
                          src="web/assets/img/logo.png"
                          width="220"
                          className="img-fluid"
                          alt="Logo"
                        />
                      </div>

                      <div className="card border-1 p-lg-3 shadow-md rounded-3 m-0">
                        <div className="card-body">
                          <div className="text-center mb-3">
                            <h5 className="mb-1 fs-20 fw-bold">
                              Register Your Clinic
                            </h5>
                            <p className="mb-0">
                              Please enter your details to create an account
                            </p>
                          </div>

                          {/* Clinic Name */}
                          <div className="mb-3">
                            <label className="form-label">Clinic Name</label>
                            <div className="input-group">
                              <span className="input-group-text bg-white">
                                <i className="ti ti-briefcase fs-18 text-dark"></i>
                              </span>
                              <input
                                type="text"
                                name="clinicName"
                                value={formData.clinicName}
                                onChange={handleInputChange}
                                className="form-control border-start-0 ps-0"
                                placeholder="Enter Clinic Name"
                                required
                              />
                            </div>
                          </div>

                          {/* First & Last Name */}
                          <div className="row">
                            <div className="col-lg-6">
                              <div className="mb-3">
                                <label className="form-label">First Name</label>
                                <div className="input-group">
                                  <span className="input-group-text bg-white">
                                    <i className="ti ti-user fs-18 text-dark"></i>
                                  </span>
                                  <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Enter First Name"
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="col-lg-6">
                              <div className="mb-3">
                                <label className="form-label">Last Name</label>
                                <div className="input-group">
                                  <span className="input-group-text bg-white">
                                    <i className="ti ti-user fs-18 text-dark"></i>
                                  </span>
                                  <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Enter Last Name"
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Email */}
                            <div className="col-lg-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  Email Address
                                </label>
                                <div className="input-group">
                                  <span className="input-group-text bg-white">
                                    <i className="ti ti-mail fs-18 text-dark"></i>
                                  </span>
                                  <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Enter Email Address"
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Contact Number */}
                            <div className="col-lg-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  Contact Number
                                </label>
                                <div className="input-group">
                                  <span className="input-group-text bg-white">
                                    <i className="ti ti-phone fs-18 text-dark"></i>
                                  </span>
                                  <input
                                    type="tel"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleInputChange}
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Enter Contact Number"
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Password */}
                            <div className="col-lg-6">
                              <div className="mb-3">
                                <label className="form-label">Password</label>
                                <div className="input-group border rounded">
                                  <span className="input-group-text bg-white border-0">
                                    <i className="ti ti-lock text-dark fs-18"></i>
                                  </span>
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="form-control border-0 ps-0"
                                    placeholder="****************"
                                    required
                                  />
                                  <span
                                    className="input-group-text bg-white border-0"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i
                                      className={`ti ${
                                        showPassword ? "ti-eye-off" : "ti-eye"
                                      } text-dark fs-18`}
                                    ></i>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="col-lg-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  Confirm Password
                                </label>
                                <div className="input-group border rounded">
                                  <span className="input-group-text bg-white border-0">
                                    <i className="ti ti-lock text-dark fs-18"></i>
                                  </span>
                                  <input
                                    type={
                                      showConfirmPassword ? "text" : "password"
                                    }
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="form-control border-0 ps-0"
                                    placeholder="****************"
                                    required
                                  />
                                  <span
                                    className="input-group-text bg-white border-0"
                                    onClick={() =>
                                      setShowConfirmPassword(
                                        !showConfirmPassword
                                      )
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i
                                      className={`ti ${
                                        showConfirmPassword
                                          ? "ti-eye-off"
                                          : "ti-eye"
                                      } text-dark fs-18`}
                                    ></i>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Booking System */}
                          <div className="col-lg-12 mb-3">
                            <label className="form-label">
                              Booking and POS System currently using{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <select
                              name="bookingSystem"
                              value={formData.bookingSystem}
                              onChange={handleInputChange}
                              className="form-control"
                              required
                            >
                              <option value="">Select</option>
                              <option value="Timely">Timely</option>
                              <option value="Zenoti">Zenoti</option>
                              <option value="Fresha">Fresha</option>
                              <option value="Phorest">Phorest</option>
                              <option value="Beauti Software">
                                Beauti Software
                              </option>
                              <option value="Kitoomba">Kitoomba</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          {/* Terms */}
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="form-check form-check-md mb-0">
                              <input
                                className="form-check-input me-2"
                                id="terms"
                                name="terms_accepted"
                                type="checkbox"
                                checked={formData.terms_accepted}
                                onChange={handleInputChange}
                                required
                              />
                              <label
                                htmlFor="terms"
                                className="form-check-label mt-0 text-dark"
                              >
                                I agree to the{" "}
                                <Link
                                  href="terms-and-conditions"
                                  target="_blank"
                                  className="text-decoration-underline text-primary"
                                >
                                  Terms of Service
                                </Link>{" "}
                                &{" "}
                                <Link
                                  href="privacy-policy"
                                  target="_blank"
                                  className="text-decoration-underline text-primary"
                                >
                                  Privacy Policy
                                </Link>
                              </label>
                            </div>
                          </div>

                          {/* Submit Button */}
                          <div className="mb-2">
                            <button
                              type="submit"
                              className="btn btn-lg bg-theme-clr text-white w-100"
                              disabled={isLoading}
                            >
                              {isLoading ? "Processing..." : "Register"}
                            </button>
                          </div>

                          {/* Already have account */}
                          <div className="text-center">
                            <h6 className="fw-normal fs-14 mt-4 text-dark mb-0">
                              Already have an account?{" "}
                              <Link href="/login" className="hover-a">
                                Login
                              </Link>
                            </h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>

                  <p className="fs-14 text-dark text-center mt-4">
                    &copy; {new Date().getFullYear()} - ServiceCue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
}
