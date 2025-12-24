"use client";
import React from "react";
import { Mail, Users, Package, UserCheck } from "lucide-react";

const CountCards = ({ counts }) => {
  const gradients = [
    "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
    "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)",
  ];

  const icons = [Mail, Users, Package, UserCheck];

  const items = [
    { label: "Total Enquiries", value: counts.totalEnquiries },
    { label: "Total Clients", value: counts.totalClients },
    { label: "Total Products", value: counts.totalProduct },
    { label: "Total Staff", value: counts.totalStaff },
  ];

  return (
    <div className="row g-4 mb-4">
  {items.map((item, index) => {
    const Icon = icons[index];
    return (
      <div className="col-xl-3 col-md-6" key={index}>
  <div className="position-relative border card rounded-2 shadow-sm">
    {/* Background image */}
    <img
      src={`/web/assets/img/bg/bg-0${index + 1}.svg`}
      alt="img"
      className="position-absolute start-0 top-0"
    />

    <div className="card-body">
      <div className="d-flex align-items-center mb-2 justify-content-between">
        {/* Circular Icon */}
        <span
          className={`avatar bg-${item.color || "primary"} rounded-circle`}
        >
          <Icon className="fs-24" color="#fff" strokeWidth={1.5} />
        </span>

        <div className="d-flex align-items-center justify-content-between">
          <div>
            <p className="mb-1">{item.label}</p>
            <h3 className="fw-bold mb-0">
              {item.link ? (
                <a
                  href={item.link}
                  className="text-decoration-none text-dark"
                >
                  {item.value.toLocaleString()}
                </a>
              ) : (
                item.value.toLocaleString()
              )}
            </h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    );
  })}
</div>

  );
};

export default CountCards;
