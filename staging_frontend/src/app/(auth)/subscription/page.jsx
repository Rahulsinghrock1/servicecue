"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function SubscriptionPlansPage() {
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const router = useRouter();

  const [specialPlan, setSpecialPlan] = useState(null);
  const [normalPlans, setNormalPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🔐 CHECK LOGIN
  useEffect(() => {
    const token = localStorage.getItem("curtishCleanAuthToken");
    setIsLoggedIn(!!token);
  }, []);

  // 📦 FETCH PLANS
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("curtishCleanAuthToken");

      const response = await axios.get(`${API_BASE_URL}/get-plans-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedPlans = response.data?.data?.plan_list || [];

      const sp = fetchedPlans.find((p) => p.interval === "one_time");
      const np = fetchedPlans.filter((p) => p.interval !== "one_time");

      setSpecialPlan(sp || null);
      setNormalPlans(np);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // 🚪 LOGOUT
  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#BD2146",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("curtishCleanAuthToken");
        localStorage.removeItem("UserID");
        toast.success("Logged out successfully");
        router.push("/login");
      }
    });
  };

  // 💳 SUBSCRIBE
  const handleSubscribe = async (plan) => {
    const isOneTime = plan.interval === "one_time";

    const result = await Swal.fire({
      title: `${isOneTime ? "Buy" : "Subscribe"} ${plan.title}?`,
      text: "You will be redirected to the payment page.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Proceed",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#BD2146",
    });

    if (!result.isConfirmed) return;

    try {
      setProcessingPlanId(plan.id);
      const token = localStorage.getItem("curtishCleanAuthToken");

      const response = await axios.post(
        `${API_BASE_URL}/subscribe-user`,
        { priceId: plan.stripe_price_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.status && response.data?.data?.url) {
        toast.success("Redirecting...");
        window.location.href = response.data.data.url;
      } else {
        toast.error(response.data?.message || "Failed to create checkout session.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Something went wrong!");
    } finally {
      setProcessingPlanId(null);
    }
  };

  // 🔘 BUTTON
  const renderButton = (plan) => {
    const isOneTime = plan.interval === "one_time";

    return (
      <button
        className="btn w-100 btn-lg btn-outline-theme"
        onClick={() => handleSubscribe(plan)}
        disabled={processingPlanId === plan.id}
      >
        {processingPlanId === plan.id
          ? "Redirecting..."
          : isOneTime
          ? "Buy Now"
          : "Subscribe"}
      </button>
    );
  };

  return (
    <div className="container-fluid position-relative z-1">
      {/* 🔴 LOGOUT BUTTON */}
      {isLoggedIn && (
        <div className="position-absolute top-0 end-0 p-3 z-3">
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      <div className="vh-100 bg-white">
        <div className="row justify-content-center align-items-center vh-100 overflow-auto">
          <div className="col-md-9 mx-auto text-center">

            <img src="/web/assets/img/logo.png" width="220" className="mb-4" />

            <h3 className="mb-4">Pricing Plans</h3>

            {/* ⭐ ONE TIME PLAN */}
            {specialPlan && (
              <div className="card p-4 mb-4 border border-danger shadow rounded-4">
                <h4>{specialPlan.title}</h4>
                <h3>${specialPlan.amount} / One Time</h3>
                {renderButton(specialPlan)}
                <div
                  dangerouslySetInnerHTML={{ __html: specialPlan.content }}
                  className="mt-3"
                />
              </div>
            )}

            {/* ⭐ NORMAL PLANS */}
            <div className="row">
              {loading ? (
                <div className="spinner-border text-primary mx-auto" />
              ) : normalPlans.length > 0 ? (
                normalPlans.map((plan) => (
                  <div key={plan.id} className="col-md-4 mb-4">
                    <div className="card p-4 shadow rounded-4">
                      <h4>{plan.title}</h4>
                      <h3>${plan.amount} / {plan.interval}</h3>
                      {renderButton(plan)}
                      <div
                        dangerouslySetInnerHTML={{ __html: plan.content }}
                        className="mt-3"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p>No plans available.</p>
              )}
            </div>

            <p className="mt-4 fs-14">© 2025 - ServiceCue</p>

          </div>
        </div>
      </div>
    </div>
  );
}
