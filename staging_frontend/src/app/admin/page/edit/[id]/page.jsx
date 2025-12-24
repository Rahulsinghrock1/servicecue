"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import MainConfig from "@/mainconfig";
import { toast } from "react-hot-toast";
import { handleSuccessResponse, handleErrorResponse } from "@utility/handleApiResponse";
import Link from "next/link";
import DatePicker from "react-multi-date-picker";


export default function SiteEdit() {
    const router = useRouter();
    const [previewImage, setPreviewImage] = useState(null);
    const { id } = useParams();
    const API_BASE_URL = MainConfig.API_BASE_URL;
    const [siteData, setSiteData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [zones, setZones] = useState([]);
    

    const [curtishCleanAuthToken, setCurtishCleanAuthToken] = useState(null);

    useEffect(() => {
        // Safely get token from localStorage (client-side only)
        setCurtishCleanAuthToken(localStorage.getItem("curtishCleanAuthToken"));
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/category-list`);
                setCategories(Array.isArray(response.data.data) ? response.data.data : []);
            } catch (error) {
                handleErrorResponse(error);
                toast.error("Failed to fetch categories");
                setCategories([]);
            }
        };

        const fetchZones = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/zone-list`);
                setZones(Array.isArray(response.data.data) ? response.data.data : []);
            } catch (error) {
                handleErrorResponse(error);
                toast.error("Failed to fetch zones");
                setZones([]);
            }
        };

        fetchCategories();
        fetchZones();
    }, [API_BASE_URL]);

    useEffect(() => {
        if (id && curtishCleanAuthToken) { // Ensure token is available
            fetchSiteDetail();
        }
    }, [id, curtishCleanAuthToken]);

    const fetchSiteDetail = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/site-detail/${id}`, {
                headers: {
                    Authorization: `Bearer ${curtishCleanAuthToken}`,
                },
            });
            setSiteData(response.data.data);
            setPreviewImage(response.data.data.image_full_path);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load site details!");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSiteData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleServiceStartDateChange = (date) => {
        setSiteData((prevData) => ({
            ...prevData,
            service_start_date: date , // Save as yyyy-MM-dd
        }));
    };

    const handleContactChange = (e, index) => {
        const { name, value } = e.target;
        const updatedContacts = [...siteData.contacts];
        updatedContacts[index][name] = value;
        setSiteData((prev) => ({
            ...prev,
            contacts: updatedContacts,
        }));
    };

    const addContact = () => {
        setSiteData((prev) => ({
            ...prev,
            contacts: [
                ...prev.contacts,
                {
                    name: "",
                    email: "",
                    designation: "",
                    phone: "",
                    phone_code: "",
                    alternate_phone: "",
                    alternate_phone_code: "",
                },
            ],
        }));
    };

    const removeContact = (index) => {
        const updatedContacts = siteData.contacts.filter((_, i) => i !== index);
        setSiteData((prev) => ({
            ...prev,
            contacts: updatedContacts,
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
            setSiteData((prev) => ({
                ...prev,
                imageFile: file,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("strata_plan_number", siteData.strata_plan_number);
            formData.append("abn", siteData.abn);
            formData.append("description", siteData.description);
            formData.append("category_id", siteData.category_id);
            formData.append("zone_id", siteData.zone_id);
            formData.append("address", siteData.address);
            formData.append("latitude", siteData.latitude);
            formData.append("longitude", siteData.longitude);
            formData.append("service_start_date", siteData.service_start_date);
            formData.append("status", siteData.status);

            if (siteData.imageFile) {
                formData.append("image", siteData.imageFile);
            }

            siteData.contacts.forEach((contact, index) => {
                formData.append(`contacts[${index}][name]`, contact.name);
                formData.append(`contacts[${index}][email]`, contact.email);
                formData.append(`contacts[${index}][designation]`, contact.designation);
                formData.append(`contacts[${index}][phone]`, contact.phone);
                formData.append(`contacts[${index}][alternate_phone]`, contact.alternate_phone);
            });

            const response = await axios.put(`${API_BASE_URL}/site-update/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${curtishCleanAuthToken}`,
                },
            });

            handleSuccessResponse(response.data);
            router.push("/admin/site/list");
        } catch (error) {
            handleErrorResponse(error);
            toast.error(error.message || "Failed to update site.");
        } finally {
            setLoading(false);
        }
    };

    if (!siteData) {
        return <p>Loading...</p>;
    }

    return (
        <div className="page-inner">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="card-title">Update Site</h4>
                            <Link href="/admin/site/list" className="btn btn-primary">
                                Sites <i className="fa fa-list"></i>
                            </Link>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                

                                <div className="row mb-2">
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="name">Strata Plan Number</label>
                                            <input type="text" className="form-control" id="strata_plan_number" name="strata_plan_number" value={siteData.strata_plan_number} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="category_id">Category</label>
                                            <select className="form-control form-select" id="category_id" name="category_id" value={siteData.category_id} onChange={handleInputChange} required>
                                                <option value="">Select Category</option>
                                                {categories.length > 0 ? (
                                                    categories.map((category) => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.name}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="">No categories available</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="zone_id">Zone</label>
                                            <select className="form-control form-select" id="zone_id" name="zone_id" value={siteData.zone_id} onChange={handleInputChange} required>
                                                <option value="">Select Zone</option>
                                                {zones.length > 0 ? (
                                                    zones.map((zone) => (
                                                        <option key={zone.id} value={zone.id}>
                                                            {zone.name}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="">No zones available</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="name">ABN Number</label>
                                            <input type="text" className="form-control" id="abn" name="abn" value={siteData.abn} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="address">Address</label>
                                            <input type="text" className="form-control" id="address" name="address" value={siteData.address} onChange={handleInputChange} required />
                                            <input type="hidden" className="form-control" id="latitude" name="latitude" value={siteData.latitude} onChange={handleInputChange} />
                                            <input type="hidden" className="form-control" id="longitude" name="longitude" value={siteData.longitude} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="service_start_date">Service Start Date</label>
                                            <DatePicker
                                                id="service_start_date"
                                                selected={siteData.service_start_date}
                                                value={siteData.service_start_date}
                                                onChange={handleServiceStartDateChange}
                                                className="form-control"
                                                dateFormat="yyyy-MM-dd"
                                                placeholderText="Select a date"
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="status">Status</label>
                                            <select className="form-control form-select" id="status" name="status" value={siteData.status} onChange={handleInputChange} required>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="align-items-center d-flex justify-content-between">
                                            <div className="">
                                                <div className="form-group mb-0">
                                                    <label htmlFor="image">Site Image</label>
                                                    <input type="file" className="form-control" id="image" name="image" onChange={handleImageUpload} />
                                                </div>
                                            </div>

                                            <div className="">{previewImage && <img src={previewImage} alt="Preview" className="img-fluid rounded" style={{ maxHeight: "50px", objectFit: "cover", marginTop:"25px" }} />}</div>
                                        </div>
                                    </div>
                               
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="description">Description</label>
                                            <textarea className="form-control" id="description" name="description" value={siteData.description} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    
                                </div>

                                {/* Contacts Section */}
                                <div className="contacts-section">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h4 className="m-0">Site Contacts</h4>
                                        <button type="button" className="btn btn-primary" onClick={addContact}>
                                            Add Contact &nbsp;<i className="fa fa-plus"></i>
                                        </button>
                                    </div>
                                    <hr />

                                    {siteData.contacts.map((contact, index) => (
                                        <div key={index} className="contact-row mb-3 p-3 bg-light rounded d-flex align-items-center">
                                            <div className="row w-100">
                                                {/* Contact Name */}
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label htmlFor={`contacts[${index}].name`}>Name</label>
                                                        <input type="text" className="form-control" id={`contacts[${index}].name`} name="name" value={contact.name} onChange={(e) => handleContactChange(e, index)} required />
                                                    </div>
                                                </div>

                                                {/* Email */}
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label htmlFor={`contacts[${index}].email`}>Email</label>
                                                        <input type="email" className="form-control" id={`contacts[${index}].email`} name="email" value={contact.email} onChange={(e) => handleContactChange(e, index)} required />
                                                    </div>
                                                </div>

                                                {/* Designation */}
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label htmlFor={`contacts[${index}].designation`}>Designation</label>
                                                        <input type="text" className="form-control" id={`contacts[${index}].designation`} name="designation" value={contact.designation || ''} onChange={(e) => handleContactChange(e, index)} required />
                                                    </div>
                                                </div>

                                                {/* Phone */}
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label htmlFor={`contacts[${index}].phone`}>Phone</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id={`contacts[${index}].phone`}
                                                            name="phone"
                                                            value={contact.phone || ''}
                                                            onChange={(e) => handleContactChange(e, index)}
                                                            placeholder="+6100000000"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Alternate Phone */}
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label htmlFor={`contacts[${index}].alternate_phone`}>Alternate Phone</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id={`contacts[${index}].alternate_phone`}
                                                            name="alternate_phone"
                                                            value={contact.alternate_phone || ''}
                                                            onChange={(e) => handleContactChange(e, index)}
                                                            placeholder="+6100000000"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Remove Contact Button */}
                                                <div className="col-md-2 d-flex align-items-center">
                                                    <div className="form-group">
                                                        <button type="button" className="btn btn-danger mt-4" onClick={() => removeContact(index)} title="Remove Contact">
                                                            <i className="fas fa-trash-alt"></i> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Submit Button */}
                                <div className="mt-3">
                                    <button type="submit" className="btn btn-dark" disabled={loading}>
                                        {loading ? "Updating..." : "Update Site"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
