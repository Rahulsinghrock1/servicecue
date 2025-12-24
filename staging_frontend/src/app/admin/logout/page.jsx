"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";
import MainConfig from "@/mainconfig";

const AdminLogout = () => {
  const router = useRouter();
  const API_BASE_URL = MainConfig.API_BASE_URL;

  useEffect(() => {
    const logoutUser = async () => {
      try {
        // Get the token from localStorage
        const curtishCleanAuthToken = localStorage.getItem("curtishCleanAuthToken");

        // Check if token exists
        if (!curtishCleanAuthToken) {
          console.log("No token found, already logged out");
          toast.error("Session expired. Please log in again.");
          router.push("/login");
          return;
        }

        console.log("Logging out with token:", curtishCleanAuthToken);

        // Call the logout API to invalidate the token (optional, depending on your backend)
        const response = await axios.post(`${API_BASE_URL}/auth/logout`, null, {
          headers: {
            Authorization: `Bearer ${curtishCleanAuthToken}`,
          },
        });

        // Handle success response from the API
        console.log("Logout successful:", response);

        // Remove the token from localStorage
        localStorage.removeItem("curtishCleanAuthToken");

        // Show success toast
        toast.success("Logged out successfully!");

        // Redirect to login page after logout
        router.push("/login");
      } catch (error) {
        console.error("Logout failed:", error);
        toast.error("An error occurred during logout.");
        router.push("/login"); // Always redirect to login on failure
      }
    };

    logoutUser();
  }, [router, API_BASE_URL]);

  return <div>Logging out...</div>; // Simple loading state
};

export default AdminLogout;
