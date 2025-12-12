"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

export default function SubscriptionPlansPage() {
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [specialPlan, setSpecialPlan] = useState(null);
  const [normalPlans, setNormalPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState(null);

  // Fetch Plans (OLD LOGIC)
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("curtishCleanAuthToken");

      const response = await axios.get(`${API_BASE_URL}/get-plans-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedPlans = response.data?.data?.plan_list || [];

      // ONE-TIME PLAN
      const sp = fetchedPlans.find((p) => p.interval === "one_time");

      // NORMAL PLANS
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

  // Subscribe (same as OLD)
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

  // BUTTON UI
  const renderButton = (plan) => {
    const isOneTime = plan.interval === "one_time";

    return (
      <button
        className="btn w-100 btn-lg btn-outline-theme offer-buynow btn"
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
      <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100 bg-white">
        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12">
            <div className="row justify-content-center align-items-center overflow-auto flex-wrap vh-100 py-4">
              <div className="col-md-9 mx-auto">
                <div className="d-flex justify-content-center align-items-center flex-column flex-fill p-4 p-lg-0 pb-0">

                  {/* LOGO */}
                  <div className="mx-auto mb-4 text-center">
                    <img
                      src="/web/assets/img/logo.png"
                      width="220"
                      className="img-fluid"
                      alt="Logo"
                    />
                  </div>

                  <h3 className="text-center mb-4">Pricing Plans</h3>

                  {/* ⭐ SPECIAL ONE-TIME PLAN */}
                  {specialPlan && (
                    <div className="card card-bg-info p-4 mb-4 shadow rounded-4 border border-danger">
                      <div className="row">
                        <div className="title-offer">
                          <span className="badge mb-2">Special Offer</span>
                        </div>

                        <div className="d-flex offter-git-ion">
                          <div className="offer-giftinfo">
                            <div className="gift-icon">
                              <img src={specialPlan.image} width="100" className="mx-auto mb-3" />
                            </div>
                          </div>

                          <div className="plan-info-details">
                            <h4>{specialPlan.title}</h4>

                            <div className="plan-price-tag">
                              <h3>
                                <span className="price-icon-doller">$</span>{" "}
                                {specialPlan.amount} / One Time
                              </h3>
                            </div>

                            {renderButton(specialPlan)}

                            <div
                              dangerouslySetInnerHTML={{ __html: specialPlan.content }}
                              className="mt-3"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ⭐ NORMAL PLANS */}
                  <div className="row">
                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                      </div>
                    ) : normalPlans.length > 0 ? (
                      normalPlans.map((plan) => (
                        <div key={plan.id} className="col-lg-4 col-md-6 d-flex mb-4">
                        <div className="p-0 flex-fill price-table card-body">
                          <div className="card border-0 p-0 shadow-sm rounded-4 w-100">
                            <div className="p-4">
                              <h4 className="text-center mb-2">{plan.title}</h4>
                              <img src={plan.image} width="100" className="mx-auto mb-3" />

                              <h3 className="text-center mb-3">
                                ${plan.amount} / {plan.interval}
                              </h3>

                              {renderButton(plan)}

                              <div
                                dangerouslySetInnerHTML={{ __html: plan.content }}
                                className="mt-3"
                              />
                            </div>
                          </div>
                        </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted">No plans available.</p>
                    )}
                  </div>

                  <p className="fs-14 text-dark text-center mt-4">
                    © 2025 - ServiceCue
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
