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
  const [hasActivePlan, setHasActivePlan] = useState(false);

  // Fetch subscription plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("curtishCleanAuthToken");

      const response = await axios.get(`${API_BASE_URL}/my-subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedPlans = response.data?.data?.plans || [];

      // ONE-TIME OFFER PLAN
      const sp = fetchedPlans.find((p) => p.interval === "one_time");

      // NORMAL PLANS
      const np = fetchedPlans.filter((p) => p.interval !== "one_time");

      setSpecialPlan(sp || null);
      setNormalPlans(np);

      // TRUE if any plan is subscribed (including one_time or recurring)
      const active = np.some((plan) => plan.subscribed); // only check NORMAL PLANS
      setHasActivePlan(active);
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

  // Subscribe or Buy One-Time Plan
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
        toast.error("Failed to create checkout session.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Something went wrong!");
    } finally {
      setProcessingPlanId(null);
    }
  };

  // Change plan
  const handleChangePlan = async (plan) => {
    const result = await Swal.fire({
      title: `Change to ${plan.title}?`,
      text: "Your subscription will be updated.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#BD2146",
    });

    if (!result.isConfirmed) return;

    try {
      setProcessingPlanId(plan.id);
      const token = localStorage.getItem("curtishCleanAuthToken");

      const response = await axios.post(
        `${API_BASE_URL}/change-plan`,
        { priceId: plan.stripe_price_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.status) {
        toast.success("Subscription plan updated successfully!");
        fetchPlans();
      } else {
        toast.error("Failed to change plan.");
      }
    } catch (error) {
      console.error("Change plan error:", error);
      toast.error("Something went wrong.");
    } finally {
      setProcessingPlanId(null);
    }
  };

  // Cancel plan
  const handleCancelSubscription = async () => {
    const result = await Swal.fire({
      title: "Cancel your subscription?",
      text: "You will lose premium features.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "Keep it",
      confirmButtonColor: "#BD2146",
    });

    if (!result.isConfirmed) return;

    try {
      setProcessingPlanId("cancel");
      const token = localStorage.getItem("curtishCleanAuthToken");

      const response = await axios.post(
        `${API_BASE_URL}/cancel-subscription`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.status) {
        toast.success("Subscription cancellation scheduled.");
        fetchPlans();
      } else {
        toast.error("Failed to cancel subscription.");
      }
    } catch (error) {
      console.error("Cancel subscription error:", error);
      toast.error("Something went wrong.");
    } finally {
      setProcessingPlanId(null);
    }
  };

  // RENDER BUTTON
  const renderButton = (plan) => {
    // ⭐ ONE-TIME PLAN
    if (plan.interval === "one_time") {
      if (plan.subscribed) {
        return (
          <div className="text-center">
            <p className="text-success fw-bold mb-1">Purchased</p>
            <small>Ends: {new Date(plan.ends_at).toLocaleDateString()}</small>
          </div>
        );
      }

      return (
        <button
          className="offer-buynow btn"
          onClick={() => handleSubscribe(plan)}
          disabled={processingPlanId === plan.id}
        >
          {processingPlanId === plan.id ? "Redirecting..." : "Buy Now"}
        </button>
      );
    }

    // ⭐ NORMAL SUBSCRIPTION PLANS BELOW:

    if (!hasActivePlan) {
      return (
        <button
          className="btn w-100 btn-lg btn-outline-theme"
          onClick={() => handleSubscribe(plan)}
          disabled={processingPlanId === plan.id}
        >
          {processingPlanId === plan.id ? "Redirecting..." : "Subscribe"}
        </button>
      );
    }

    if (plan.subscribed) {
      if (plan.ends_at) {
        return (
          <div className="text-center">
            <p className="text-danger fw-bold mb-1">Cancelled</p>
            <small>Ends: {new Date(plan.ends_at).toLocaleDateString()}</small>
          </div>
        );
      }
      return (
        <button
          className="btn w-100 btn-lg btn-outline-danger"
          onClick={handleCancelSubscription}
          disabled={processingPlanId === "cancel"}
        >
          {processingPlanId === "cancel" ? "Processing..." : "Cancel Subscription"}
        </button>
      );
    }

    return (
      <button
        className="btn w-100 btn-lg btn-outline-theme"
        onClick={() => handleChangePlan(plan)}
        disabled={processingPlanId === plan.id}
      >
        {processingPlanId === plan.id ? "Processing..." : "Upgrade"}
      </button>
    );
  };

  return (
    <div className="container-fluid position-relative z-1">
      <div className="row justify-content-center">
        <div className="col- col-sm-12 col-md-12 mx-auto">
          <h2 className="text-center mb-4">Pricing Plan</h2>

          {/* ⭐ SPECIAL ONE-TIME PLAN — HIDE IF USER HAS ACTIVE NORMAL SUBSCRIPTION */}
          {!hasActivePlan && specialPlan && (
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
                        {specialPlan.currency} {specialPlan.amount} / One Time
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

          {/* NORMAL PLANS */}
          <div className="row">
            {normalPlans.map((plan) => (
              <div key={plan.id} className="col-lg-4 col-md-6 mb-4">
                <div
                  className={`card p-4 shadow-sm rounded-4 ${
                    plan.subscribed ? "border-danger border-2" : ""
                  }`}
                >
                  <h4 className="text-center mb-2">{plan.title}</h4>
                  <img src={plan.image} width="100" className="mx-auto mb-3" />
                  <h3 className="text-center mb-3">
                    {plan.currency} {plan.amount} / {plan.interval}
                  </h3>

                  {renderButton(plan)}

                  <div
                    dangerouslySetInnerHTML={{ __html: plan.content }}
                    className="mt-3"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
