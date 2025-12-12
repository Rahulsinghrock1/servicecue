"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
export default function BookADemoPage() {
  const API_BASE_URL = MainConfig.API_BASE_URL;
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    clinic: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  try {
    const response = await axios.post(`${API_BASE_URL}/book-demo`, {
      ...form,
      country_code: "61", // 🟢 Static country code
    });
    toast.success("Demo booked successfully!");
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      clinic: "",
    });

    // 🟢 Redirect after short delay
       setTimeout(() => {
      window.open(
        "https://calendly.com/shamara-servicecue/service-cue-meeting-1",
        "_blank"
      );
    }, 1000);
  } catch (err) {
    toast.error("error", err.response?.data?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="d-md-flex h-md-100 theme-bg justify-content-center align-items-center"
      style={{
        backgroundImage: "url(/website-assets/images/banner-bg.jpg)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="col-md-7 p-0 d-flex align-items-center justify-content-center">
        <div className="demo-logo">
          <Link href="/">
            <Image
              src="/website-assets/images/logo-white-v.png"
              alt="Logo"
              width={300}
              height={129}
            />
          </Link>
        </div>
      </div>

      <div className="col-md-5 d-flex align-items-center ms-form bg-white h-md-100">
        <div className="align-items-center justify-content-center w-100 px-4">
          <h2 className="mt-3">Waitlist</h2>
          <p className="mb-2 lh-sm">
            Join the waitlist to get early access, behind-the-scenes updates,
            and tools to support your clinic and clients.
          </p>
          <p className="fs-6 theme-cl mb-0">
            <i>
              No spam. Just real insights, helpful tools, and first access when
              we launch.
            </i>
          </p>

          <form className="py-4" onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-12 p-0 col-lg-6 mb-3">
                <input
                  type="text"
                  name="first_name"
                  className="form-control"
                  placeholder="First Name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 p-0 col-lg-6 mb-3">
                <input
                  type="text"
                  name="last_name"
                  className="form-control"
                  placeholder="Last Name"
                  value={form.last_name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12 p-0 col-lg-12 mb-3">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Email Address*"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 p-0 col-lg-12 mb-3">
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 p-0 col-lg-12 mb-3">
                <input
                  type="text"
                  name="clinic"
                  className="form-control"
                  placeholder="Clinic"
                  value={form.clinic}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12 p-0 col-lg-12 mt-2">
                <button
                  type="submit"
                  className="btn btn-lg w-100"
                  disabled={loading}
                >
                  {loading ? "Booking..." : "BOOK NOW"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
