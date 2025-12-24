"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";
import MainConfig from "@/mainconfig";

const AdminLogout = () => {
  const router = useRouter();
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const [showModal, setShowModal] = useState(true); // Show modal by default

  const handleConfirmLogout = async () => {
    try {
      const token = localStorage.getItem("curtishCleanAuthToken");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        router.push("/login");
        return;
      }

      // Optional: call API to invalidate session
      await axios.post(`${API_BASE_URL}/auth/logout`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.removeItem("curtishCleanAuthToken");
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("An error occurred during logout.");
      router.push("/login");
    }
  };

  const handleCancel = () => {
    // Go back to previous page or home
    router.back();
  };

  return (
    <div>
      {/* Logout Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
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
                    <i className="ti ti-logout fs-24"></i>
                  </span>
                </div>

                <h5 className="fw-bold mb-1 position-relative z-1">
                  Log Out Confirmation
                </h5>
                <p className="mb-3 position-relative z-1">
                  Are you sure you want to log out?
                </p>

                <div className="d-flex justify-content-center">
                  <button
                    type="button"
                    className="btn btn-light position-relative z-1 me-3"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger position-relative z-1"
                    onClick={handleConfirmLogout}
                  >
                    Yes, Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fallback for accessibility */}
      {!showModal && <div>Redirecting...</div>}
    </div>
  );
};

export default AdminLogout;
