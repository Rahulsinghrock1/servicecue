"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { handleSuccessResponse, handleErrorResponse } from "@utility/handleApiResponse";
import MainConfig from "@/mainconfig";

export default function LoginPage() {
    const API_BASE_URL = MainConfig.API_BASE_URL;
    const BASE_URL = MainConfig.BASE_URL;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        user_type: 3,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

const handleSubmit = async (event) => {
  event.preventDefault();
  setIsLoading(true);

  try {
    const payload = {
      email: formData.email,
      password: formData.password,
      user_type: formData.user_type,
    };
    // 🔹 Step 1: Login API call
    const response = await axios.post(`${API_BASE_URL}/auth/login`, payload);
    handleSuccessResponse(response.data);
    const result = response.data.user;
    const activeSubscription = response.data.activeSubscription;
    const token = response.data.token;
    // Save token and user details
    localStorage.setItem("curtishCleanAuthToken", token);
    localStorage.setItem("UserID", result.id);
    // 🔹 Step 2: Redirect logic based on role and subscription
    if (result.user_role_id == 3) {
      // Admin
      router.push("/admin");
    } else if (result.user_role_id == 4) {
      // Clinic role
      if (activeSubscription && activeSubscription.user_id) {
        // ✅ User already has active plan
        router.push("/clinic");
      } else {
        // 🚫 No active plan
        router.push("/subscription");
      }
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
        {/* Left Side */}
        <div className="col-lg-6 p-0">
          <div className="login-backgrounds login-covers bg-theme-clr d-lg-flex align-items-center justify-content-center d-none flex-wrap p-4 position-relative h-100 z-0">
            <div className="authentication-card w-100">
              <div className="authen-overlay-item w-100">
                <div className="authen-head text-center">
                  <h1 className="text-white fs-32 fw-bold mb-2">
                    Seamless Client & Healthcare Staff Tracking Dashboard
                  </h1>
                  <p className="text-light fw-normal">
                    Experience efficient, secure, and user-friendly clinic management designed for clients and staff management.
                  </p>
                </div>
                <div className="mt-4 mx-auto authen-overlay-img">
                  <img src="web/assets/img/auth/cover-imgs-1.png" alt="Img" />
                </div>
              </div>
            </div>
            <img src="web/assets/img/auth/cover-imgs-2.png" alt="cover-imgs-2" className="img-fluid cover-img" />
          </div>
        </div>

        {/* Right Side */}
        <div className="col-lg-6 col-md-12 col-sm-12">
          <div className="row justify-content-center align-items-center overflow-auto flex-wrap vh-100 py-4">
            <div className="col-md-9 mx-auto">
              <form onSubmit={handleSubmit} className="d-flex justify-content-center align-items-center">
                <div className="d-flex flex-column justify-content-lg-center p-4 p-lg-0 pb-0 flex-fill">
                  <div className="mx-auto mb-4 text-center">
                    <img src="web/assets/img/logo.png" width="220" className="img-fluid" alt="Logo" />
                  </div>

                  <div className="card border-1 p-lg-3 shadow-md rounded-3 m-0">
                    <div className="card-body">
                      <div className="text-center mb-3">
                        <h5 className="mb-1 fs-20 fw-bold">Sign In</h5>
                        <p className="mb-0">Please enter below details to access your personalized dashboard</p>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Email Address</label>
                        <div className="input-group">
                          <span className="input-group-text border-end-0 bg-white">
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

                      <div className="mb-3">
                        <label className="form-label">Password</label>
                        <div className="position-relative">
                          <div className="pass-group input-group position-relative border rounded">
                            <span className="input-group-text bg-white border-0">
                              <i className="ti ti-lock text-dark fs-18"></i>
                            </span>
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              className="pass-input form-control ps-0 border-0"
                              placeholder="****************"
                              value={formData.password}
                              onChange={handleInputChange}
                              required
                            />
                            <span
                              className="input-group-text bg-white border-0"
                              onClick={handleTogglePasswordVisibility}
                              style={{ cursor: "pointer" }}
                            >
                              <i className={`ti toggle-password ${showPassword ? "ti-eye" : "ti-eye-off"} text-dark fs-18`}></i>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="form-check form-check-md mb-0">
                          <input className="form-check-input me-2" id="remember_me" type="checkbox" />
                          <label htmlFor="remember_me" className="form-check-label mt-0 text-dark">
                            Remember Me
                          </label>
                        </div>
                        <div className="text-end">
                          <Link href="/password-recovery" className="text-danger">
                            Forgot Password?
                          </Link>

                        </div>
                      </div>

                      <div className="mb-2">
                        <button type="submit" className="btn btn-lg bg-theme-clr text-white w-100" disabled={isLoading}>
                          {isLoading ? "Processing..." : "Login"}
                        </button>
                      </div>

                      <div className="text-center">
                        <h6 className="fw-normal fs-14 mt-4 text-dark mb-0">
                          Don’t have an account yet?  <Link href="/register" className="hover-a">Register</Link>
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
