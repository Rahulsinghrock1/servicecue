"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { handleSuccessResponse, handleErrorResponse } from "@utility/handleApiResponse";
import MainConfig from "@/mainconfig";

export default function PasswordRecovery() {
    const API_BASE_URL = MainConfig.API_BASE_URL;
    const BASE_URL = MainConfig.BASE_URL;
    const router = useRouter();
    const [userEmail, setUserEmail] = useState(null);
    const [userOTP, setUserOTP] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const storedEmail = localStorage.getItem("forgotEmail");
        if (storedEmail) {
            setUserEmail(storedEmail);
        }
        const storedOTP = localStorage.getItem("forgotOTP");
        if (storedOTP) {
            setUserOTP(storedOTP);
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleToggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
        setIsLoading(false);
        toast.error("Passwords do not match.");
        return;
    }

    try {
        const payLoad = {
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            email: userEmail,   // localStorage se liya hua email
        };

        // ✅ Call forgotPassword API
        const response = await axios.post(`${API_BASE_URL}/forgotPassword`, payLoad);

        handleSuccessResponse(response.data);
        localStorage.removeItem("forgotEmail");
        localStorage.removeItem("forgotOTP");
        router.push("/login");
    } 
    catch (error) {
        handleErrorResponse(error);
    } 
    finally {
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
                      <form onSubmit={handleSubmit}>
                        <div className="d-flex flex-column justify-content-lg-center p-4 p-lg-0 pb-0 flex-fill">
                  <div className="mx-auto mb-4 text-center">
                    <img src="web/assets/img/logo.png" width="220" className="img-fluid" alt="Logo" />
                  </div>
                  <div className="card border-1 p-lg-3 shadow-md rounded-3 m-0">
                    <div className="card-body">
                                      <div className="text-center mb-3">
                            <h5 className="mb-1 fs-20 fw-bold">Reset New Password</h5>
                                <p className="text-center mb-1 lh-50">Set the new password that you can remember.</p>
                            <p className="text-center text-info mb-4 lh-50">{userEmail || "Email not found"}</p>
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
                                    className="form-control"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password*"
                                    required
                                    />
                                    <span
                                    className="input-group-text"
                                    onClick={handleTogglePasswordVisibility}
                                    style={{ cursor: "pointer" }}
                                    >
                                    <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                    </span>
                                    </div>
                                    </div>
                                    </div>


                                    <div className="mb-3">
                                    <label className="form-label">Confirm New Password*</label>
                                    <div className="position-relative">
                                    <div className="pass-group input-group position-relative border rounded">
                                    <span className="input-group-text bg-white border-0">
                                    <i className="ti ti-lock text-dark fs-18"></i>
                                    </span>
                                          <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        className="form-control"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Confirm new password*"
                                        required
                                    />
                                    <span
                                        className="input-group-text"
                                        onClick={handleToggleConfirmPasswordVisibility}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <i className={`fa ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                    </span>
                                    </div>
                                    </div>
                                    </div>


                            <div className="form-group mb-3">
                                <button type="submit" className="btn btn-lg bg-theme-clr text-white w-100" disabled={isLoading}>
                                    {isLoading ? (<span>Processing..</span>) : (<span>Submit</span>)}
                                </button>
                            </div>
                            <div className="text-center">
                            <h6 className="fw-normal fs-14 text-dark mb-0">Return to
                            <Link href="/login" className="hover-a">login</Link>
                            </h6>
                            </div>
                            </div>
                            </div>
                            </div>
                        </form>
              <p className="fs-14 text-dark text-center mt-4">
                Copyright  &copy; {new Date().getFullYear()} - ServiceCue.
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
