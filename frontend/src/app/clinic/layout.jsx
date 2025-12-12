"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@context/UserContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import MainConfig from "@/mainconfig";

export default function Page({ children }) {
  const { setUser } = useUser();
  const router = useRouter();
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("curtishCleanAuthToken");

    // 🚀 Instant redirect (no delay) if no token found
    if (!token) {
      toast.error("Unauthenticated! Please login.");
      router.replace("/login");
      return;
    }

    const verifyUser = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/auth/profileDetails`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const user = response?.data?.user;
        const activeSubscription = response?.data?.activeSubscription;

        if (!user) {
          toast.error("User not found.");
          router.replace("/login");
          return;
        }

        // Admin restriction
        if (user.user_role_id === 3) {
          toast.error("Admins must login via admin portal.");
          router.replace("/admin/login");
          return;
        }

        // Subscription check
        if (!activeSubscription) {
          toast.error("Subscription required.");
          router.replace("/subscription");
          return;
        }

        // Only allow user role 4
        if (user.user_role_id !== 4) {
          toast.error("Access denied.");
          router.replace("/login");
          return;
        }

        setUser(user);
        setLoading(false);

      } catch (error) {
        toast.error("Session expired.");
        router.replace("/login");
      }
    };

    verifyUser();
  }, [router, API_BASE_URL, setUser]);

  if (loading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
        }}
      >
        <div className="loader"></div>
      </div>
    );
  }

  return <>{children}</>;
}
