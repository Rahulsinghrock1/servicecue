"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const didRun = useRef(false); // ⛔ Prevent double execution
  const API_BASE_URL = MainConfig.API_BASE_URL;

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const token = localStorage.getItem("curtishCleanAuthToken");

    const publicRoutes = ["/", "/login", "/book-a-demo", "/success"];

    // 🔸 If no token & route is not public → redirect to login
    if (!token) {
      if (!publicRoutes.includes(pathname)) {
        router.replace("/login");
        setLoading(false);
        return;
      }
      setLoading(false);
      return;
    }

    // 🔸 User is logged in → get profile details
    axios
      .get(`${API_BASE_URL}/auth/profileDetails`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const user = res.data?.user;
        const userRoleId = user?.user_role_id;
        const activeSubscription = res.data?.activeSubscription;

        if (!userRoleId) {
          router.replace("/login");
          return;
        }

        // -------------------------
        // 🧭 ROLE-BASED REDIRECTS
        // -------------------------

        // Admin (3) cannot open clinic routes
        if (userRoleId === 3 && pathname.startsWith("/clinic")) {
          router.replace("/admin");
          return;
        }

        // Clinic user (4) cannot open admin routes
        if (userRoleId === 4 && pathname.startsWith("/admin")) {
          router.replace("/clinic");
          return;
        }

        // Clinic user must have active subscription
        if (userRoleId === 4 && !activeSubscription) {
          if (!pathname.startsWith("/subscription")) {
            router.replace("/subscription");
            return;
          }
        }
      })
      .catch(() => {
        toast.error("Session expired, please login again");
        localStorage.clear();
        router.replace("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return null;
  return children;
}
