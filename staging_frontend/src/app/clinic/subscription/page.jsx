"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import Image from "next/image";

export default function SubscriptionPlansPage() {
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);

  // ✅ Fetch plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

  // ✅ Fetch subscription plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/get-plans-list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("curtishCleanAuthToken")}` },
      });

      if (response.data?.data?.plan_list) {
        setPlans(response.data.data.plan_list);
      } else {
        toast.error("No plans found.");
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Subscribe to a plan (Stripe Checkout)
  const handleSubscribe = async (plan) => {
    Swal.fire({
      title: `Subscribe to ${plan.title}?`,
      text: "You will be redirected to the checkout page.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Proceed",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#BD2146",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setSubscribingPlanId(plan.id);
              const token = localStorage.getItem("curtishCleanAuthToken");
          const response = await axios.post(
            `${API_BASE_URL}/subscribe-user`,
            { priceId: plan.stripe_price_id },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.data?.status === true && response.data?.data?.url) {
            toast.success("Redirecting to payment...");
            window.location.href = response.data.data.url;
          } else {
            toast.error(response.data?.message || "Failed to create checkout session.");
          }
        } catch (error) {
          console.error("Subscription error:", error);
          toast.error("Something went wrong while subscribing.");
        } finally {
          setSubscribingPlanId(null);
        }
      }
    });
  };

  return (
    <div className="container-fluid position-relative z-1">
      <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100 bg-white">
        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12">
            <div className="row justify-content-center align-items-center overflow-auto flex-wrap vh-100 py-4">
              <div className="col-md-9 mx-auto">
                <div className="d-flex justify-content-center align-items-center flex-column flex-fill p-4 p-lg-0 pb-0">
                  
                  {/* Logo */}
                  <div className="mx-auto mb-4 text-center">
                    <img
                      src="/web/assets/img/logo.png"
                      width="220"
                      className="img-fluid"
                      alt="Logo"
                    />
                  </div>

                  {/* Section Title */}
                  <div className="container">
                    <div className="row justify-content-center">
                      <div className="col-12 col-md-10 col-lg-6">
                        <div className="mb-5 section-title text-center">
                          <h3>Pricing Plans</h3>
                          <p>Take a look at our affordable pricing plans.</p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="row">
                      {loading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary" role="status"></div>
                        </div>
                      ) : plans.length > 0 ? (
                        plans.map((plan) => (
                          <div key={plan.id} className="col-lg-4 col-md-6 d-flex mb-4">
                            <div className="card border-0 p-0 shadow-sm rounded-4 w-100">
                              <div className="p-0 flex-fill price-table card-body">
                                <div className="p-4">
                                        <div className="mb-2 icon theme-clr">
          <i className="ti ti-building"></i>
        </div>

                                  <h4 className="mb-1 plan-type text-center">{plan.title}</h4>
                                  <h2 className="mb-3 text-center">
                                    ${plan.amount}/{plan.currency}
                                  </h2>

                                  <button
                                    className="btn w-100 btn-lg btn-outline-theme"
                                    onClick={() => handleSubscribe(plan)}
                                    disabled={subscribingPlanId === plan.id}
                                  >
                                    {subscribingPlanId === plan.id
                                      ? "Redirecting..."
                                      : "Subscribe"}
                                  </button>

                                   <div className="mt-4 text-start lh-sm"
    dangerouslySetInnerHTML={{
      __html: plan.content,
    }}
  />
</div>
                               
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted py-5">
                          <p>No plans available at the moment.</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <p className="fs-14 text-dark text-center mt-4">
                      Copyright &copy; 2025 - ServiceCue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
