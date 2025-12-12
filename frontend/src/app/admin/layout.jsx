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

    // 🚀 1️⃣ Instant fail if no token
    if (!token) {
      toast.error("Unauthenticated User! Please login.");
      router.replace("/login");
      return;
    }

    // 🚀 2️⃣ API check for valid-token users
    const verifyUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/profileDetails`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = response?.data?.user;
       
console.log(user);

        // 🚫 Role restriction
        if (!user || (user.user_role_id !== 3 && user.user_role_id !== 4)) {
            console.log(user.user_role_id);
            
          toast.error("You cannot access this page.");
          router.replace("/");
          return;
        }


        if (user.user_role_id === 4) {
            console.log(user.user_role_id);
            
          toast.error("You cannot access this page.");
          router.replace("/");
          return;
        }


        // 👍 Save user
        setUser(user);

        setLoading(false);

      } catch (error) {
        console.error("Error verifying user:", error);
        toast.error("Session expired. Please login again.");
        router.replace("/login");
      }
    };

    verifyUser();
  }, [router, API_BASE_URL, setUser]);

  // 🌀 3️⃣ Fullscreen Center Loader
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
