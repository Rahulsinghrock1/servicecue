"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import MainConfig from "@/mainconfig";
import Link from "next/link";
export default function StaffDetails() {
  const { id } = useParams();
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [staff, setStaff] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [assignedClients, setAssignedClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const source = axios.CancelToken.source();

    async function fetchStaffAndData() {
      try {
        setLoading(true);

        // Fetch staff details
        const staffRes = await axios.get(`${API_BASE_URL}/staff/details/${id}`, {
          cancelToken: source.token,
        });

        const staffData = staffRes.data.user;
        setStaff(staffData);

        // Fetch certificates
        const certRes = await axios.post(
          `${API_BASE_URL}/staff/certificates`,
          { staff_id: staffData.id },
          { cancelToken: source.token }
        );

        const certData = certRes.data.data;
        setCertificates(Array.isArray(certData) ? certData : []);

        // Fetch assigned clients separately using your API
        const assignedClientsRes = await axios.post(
          `${API_BASE_URL}/assignedclientslist`,
          { staff_id: staffData.id },
          { cancelToken: source.token }
        );

        const assignedClientsData = assignedClientsRes.data.assignedClients || [];
        setAssignedClients(assignedClientsData);

        setError(null);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Fetch error:", err);
          setError("Failed to fetch staff details or related data.");
          setStaff(null);
          setCertificates([]);
          setAssignedClients([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStaffAndData();

    return () => {
      source.cancel("Component unmounted");
    };
  }, [id, API_BASE_URL]);

  if (loading) return <p>Loading staff details...</p>;
  if (error) return <p>{error}</p>;
  if (!staff) return <p>No staff found.</p>;

  // Destructure staff details with fallbacks
  const {
    full_name,
    designation,
    licenseNo,
    employeeCode,
    mobile,
    email,
    address,
    dob,
    bloodGroup,
    expertise,
    gender,
    about,
    avatar,
  } = staff;

  return (
    <div className="content">
      {/* Profile Card */}
      <div className="card">
        <div className="card-body d-flex align-items-center justify-content-between flex-wrap row-gap-3">
          <div className="d-flex align-items-center flex-sm-nowrap flex-wrap row-gap-3">
            <div className="me-3 doctor-profile-img">
              <img
                src={avatar || "/assets/img/doctors/doctor-11.jpg"}
                className="rounded"
                alt={full_name}
              />
            </div>
            <div className="flex-fill">
              <div className="d-flex align-items-center mb-1">
                <h5 className="mb-0 fw-semibold">{full_name}</h5>
              </div>
              <span className="d-block mb-1 fs-13">{designation}</span>
              <span className="badge badge-soft-success mb-3 fw-medium">
                <i className="ti ti-point-filled me-1 text-success"></i>Active
              </span>
              <div className="d-flex align-items-center">
                <p className="mb-0 fs-16">
                  <a href={`tel:${mobile}`}>
                    <i className="ti ti-phone me-1"></i>
                    {mobile}
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div>
            <div className="mb-1">

              <Link
                className="w-100 btn btn-primary"
                href={`/clinic/staff/edit/${id}`}
              >
                <i className="ti ti-pencil me-1"></i>Edit
              </Link>

            </div>
            {/*    <div>
              <a href="#" className="w-100 text-white bg-theme-clr btn ">
                <i className="ti ti-trash me-1"></i>Delete
              </a>
            </div>*/}
          </div>
        </div>
      </div>

      {/* Assigned Clients Table */}
      <div className="card">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            Assigned Clients
            <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
              Total Clients: {assignedClients.length}
            </span>
          </h5>
          <div className="table-responsive">
            <table className="table table-nowrap datatable">
              <thead className="thead-light">
                <tr>
                  <th>Patient</th>
                  <th>Assigned Date</th>
                  <th>Phone</th>
                  {/*<th>Treatment Plan</th>*/}
                  <th>Notes</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {assignedClients.length > 0 ? (
                  assignedClients.map(({ id, created_at, notes, client }) => {
                    // if client is null, use default fallback object
                    const safeClient = client || {
                      full_name: "Unknown Client",
                      avatar: "/assets/img/users/user-39.jpg",
                      designation: "N/A",
                    };

                    return (
                      <tr key={id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <a href="#" className="avatar me-2">
                              <img
                                src={safeClient.avatar}
                                alt={safeClient.full_name}
                                className="rounded-circle"
                              />
                            </a>
                            <div>
                              <h6 className="mb-1 fs-14 fw-semibold">
                                <a href="#">{safeClient.full_name}</a>
                              </h6>
                              <span className="fs-13 d-block">
                                {safeClient.designation}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <h6 className="mb-1 fs-14 fw-medium">
                            {new Date(created_at).toLocaleDateString()}
                          </h6>
                          <span className="fs-13 d-block">
                            {new Date(created_at).toLocaleTimeString()}
                          </span>
                        </td>

                        <td>{safeClient.mobile || "-"}</td>
          

                        <td>{notes || "-"}</td>

                        <td>
                          <span className="text-success">Active</span>
                        </td>

                        <td></td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No assigned clients.
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bio & Certificates Section */}
      <div className="row">
        <div className="col-lg-8">
          {/* Bio */}
          <div className="card">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Bio</h5>
              <p>{about || "No bio available."}</p>
            </div>
          </div>

          {/* Certificates */}
          <div className="card">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Certificates</h5>

              {certificates.length > 0 ? (
                certificates.map((cert, i) => (
                  <div key={i} className="card mt-2 mb-0 shadow-none border">
                    <div className="p-2">
                      <div className="row align-items-center">
                        <div className="col-auto">
                          <img
                            src={cert.image_url}
                            className="avatar-sm rounded"
                            alt={`Certificate ${cert.id}`}
                          />
                        </div>
                        <div className="col ps-0">
                          <h6 className="mb-0">Certificate #{cert.id}</h6>
                          <small className="text-muted">
                            {new Date(cert.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="col-auto">
                          <a
                            href={cert.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No certificates found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Staff Info Sidebar */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Staff Information</h5>

              {[
                { icon: "ti-badge", label: "Designation", value: designation },
                { icon: "ti-clipboard-list", label: "License No", value: licenseNo },
                { icon: "ti-id", label: "Employee Code", value: employeeCode },
                { icon: "ti-phone", label: "Phone", value: mobile },
                { icon: "ti-mail", label: "Email", value: email },
                { icon: "ti-map-pin", label: "Address", value: address },
                { icon: "ti-calendar-event", label: "DOB", value: dob },
                { icon: "ti-users", label: "Gender", value: gender },
              ].map((item, i) => (
                <div key={i} className="mb-3 d-flex align-items-center">
                  <div className="icon-shape bg-light rounded-circle me-3">
                    <i className={`ti ${item.icon} fs-5`}></i>
                  </div>
                  <div>
                    <h6 className="mb-0">{item.value || "N/A"}</h6>
                    <small className="text-muted">{item.label}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
