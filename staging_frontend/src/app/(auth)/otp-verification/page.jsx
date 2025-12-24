"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { handleSuccessResponse, handleErrorResponse } from "@utility/handleApiResponse";
import MainConfig from "@/mainconfig";

export default function OtpVerification() {
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const router = useRouter();
  const [userEmail, setUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);

  // Get email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("forgotEmail");
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const handleChange = (e, index) => {
    const { value } = e.target;
    if (!/^\d*$/.test(value)) return; // Allow only digits

    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    // Auto-focus next
    if (value && index < 3) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

const handleSubmit = async (event) => {
  event.preventDefault();
  const fullOtp = otpDigits.join("");
  if (fullOtp.length < 4) {
    toast.error("Please enter the complete OTP.");
    return;
  }

  setIsLoading(true);
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/verifyOtp`, {
      otp: fullOtp,
      email: userEmail,
    });

    // Log the full response to debug
    console.log('Response:', response.data);

    // Check if status is true first
    if (response.data.status) {
      console.log('Status is true');
      router.push("/reset-password");

      // Now check the verifiedStatus
      if (response.data.verifiedStatus) {
        console.log('Verified status is true');
        // If verifiedStatus is true, navigate to /success
       // router.push("/success");
        router.push("/reset-password");
      } else {
        console.log('Verified status is false or missing');
        // If verifiedStatus is false or missing, navigate to /reset-password
        router.push("/reset-password");
      }
    } else {
      console.log('Status is false');
      // If status is false, show error and handle accordingly
      toast.error("OTP verification failed. Please try again.");
    }
    
  } catch (error) {
    handleErrorResponse(error);
  } finally {
    setIsLoading(false);
  }
};


  const handleResendOTP = async () => {
    if (!userEmail) {
      toast.error("Email not found. Please try again.");
      return;
    }

    setIsResending(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/sendOtp`, {
        email: userEmail,
        category: "register",
      });
      handleSuccessResponse(response.data);
    } catch (error) {
      handleErrorResponse(error);
    } finally {
      setIsResending(false);
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
                            <h5 className="mb-1 fs-20 fw-bold">2 Step Verification</h5>
                            <p className="text-center mb-4 lh-50">
                              Please enter the 4-digit OTP you received at{" "}
                              <span className="theme-cl">{userEmail || "your email"}</span>
                            </p>
                          </div>

                          {/* OTP Inputs */}
                          <div className="d-flex align-items-center justify-content-center mb-3" style={{ gap: "10px" }}>
                            {otpDigits.map((digit, index) => (
                              <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                className="border rounded text-center fs-26 fw-bold me-3"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  fontSize: "20px",
                                  border: "1px solid #ced4da",
                                  borderRadius: "4px",
                                }}
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                              />
                            ))}
                          </div>

                          <div className="form-group mb-3">
                            <button type="submit" className="btn btn-lg bg-theme-clr text-white w-100" disabled={isLoading}>
                              {isLoading ? "Processing..." : "Submit"}
                            </button>
                          </div>

                          <div className="text-center mb-3">
                            <span className="text-muted">Didn’t receive code? </span>
                            <a onClick={handleResendOTP} className="hover-a text-primary" style={{ cursor: "pointer" }}>
                              {isResending ? "Resending..." : "Resend Code"}
                            </a>
                          </div>

                          <div className="text-center">
                            <h6 className="fw-normal fs-14 text-dark mb-0">
                              Return to <Link href="/login" className="hover-a">login</Link>
                            </h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>

                  <p className="fs-14 text-dark text-center mt-4">
                    Copyright &copy; {new Date().getFullYear()} - ServiceCue.
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
