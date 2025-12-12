"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MainConfig from "@/mainconfig";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function SubscriptionSuccess() {
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const router = useRouter();

  useEffect(() => {
    // ✅ Optionally verify the subscription from backend after Stripe redirect
    const verifySubscription = async () => {
      const session_id = new URLSearchParams(window.location.search).get("session_id");

      if (session_id) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/verify-subscription`,
            { session_id },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }
          );

          if (response.data?.status === true) {
            toast.success("Subscription confirmed successfully!");
          } else {
            toast.error(response.data?.message || "Subscription verification failed.");
          }
        } catch (error) {
          console.error("Verification error:", error);
          toast.error("Error verifying subscription.");
        }
      }
    };

    verifySubscription();
  }, [API_BASE_URL]);

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
                        Thank You for Subscribing!
                      </h1>
                      <p className="text-light fw-normal">
                        Your subscription has been successfully activated.
                      </p>
                    </div>
                    <div className="mt-4 mx-auto authen-overlay-img">
                      <img src="/web/assets/img/auth/cover-imgs-1.png" alt="Success" />
                    </div>
                  </div>
                </div>
                <img
                  src="/web/assets/img/auth/cover-imgs-2.png"
                  alt="cover-imgs-2"
                  className="img-fluid cover-img"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="col-lg-6 col-md-12 col-sm-12">
              <div className="row justify-content-center align-items-center overflow-auto flex-wrap vh-100 py-4">
                <div className="col-md-9 mx-auto">
                  <div className="d-flex flex-column justify-content-lg-center p-4 p-lg-0 pb-0 flex-fill">
                    <div className="mx-auto mb-4 text-center">
                      <img
                        src="/web/assets/img/logo.png"
                        width="220"
                        className="img-fluid"
                        alt="Logo"
                      />
                    </div>
                    <div className="card border-1 p-lg-3 shadow-md rounded-3 m-0">
                      <div className="card-body">
                        <div className="text-center mb-3">
                          <div className="mb-3 text-center">
                            <span>
                              <i className="ti ti-circle-check-filled fs-48 text-success"></i>
                            </span>
                          </div>
                          <h5 className="mb-1 fs-20 fw-bold">Subscription Successful</h5>
                          <p className="fs-14 text-center">
                            Thank you for your payment. Your plan is now active.
                          </p>
                        </div>
                        <div className="d-flex justify-content-center pb-3">
                          <Link
                            href="/login"
                            className="btn btn-lg bg-theme-clr text-white"
                          >
                            Go to Login
                            <i className="ti ti-chevron-right ms-2"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
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
