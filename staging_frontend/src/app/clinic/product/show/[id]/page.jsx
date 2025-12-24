"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import MainConfig from "@/mainconfig";

export default function ProductDetails() {
  const { id } = useParams();
  const API_BASE_URL = MainConfig.API_BASE_URL;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("curtishCleanAuthToken");

        const response = await axios.post(
          `${API_BASE_URL}/ProductsDetails`,
          { id: id }, // send productId in body
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProduct(response.data.data); // ✅ only data object
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load product details.");
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, API_BASE_URL]);


  function formatTime(timeStr) {
  if (!timeStr) return "N/A";
  const [hour, minute] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(hour), parseInt(minute));
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}


  if (loading) return <p>Loading product details...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>No product found.</p>;

  return (
    <div className="">
      <div className="row">
        <div className="col-lg-12 mx-auto">
          <div className="card border-0 rounded-0">
            <div className="card-body">
              {/* Header */}
              <div className="d-flex align-items-center border-bottom pb-3 mb-4 justify-content-between flex-wrap row-gap-3">
                <div className="d-flex align-items-center flex-sm-nowrap flex-wrap row-gap-3">
                  <div className="flex-fill">
                    <div className="d-flex align-items-center mb-1">
                      <h4 className="fw-bold mb-1">{product.title}</h4>
                    </div>
                    <h6 className="fs-13 mb-1">
                      {product.size && product.size_unit ? `${product.size} ${product.size_unit}` : "N/A"}


                    </h6>
                  </div>
                </div>
                <div>
                  <div className="mb-1">

                  <Link className="w-100 btn btn-primary" href={`/clinic/product/edit/${product.id}`}>
                    Edit Product
                  </Link>

                  </div>
                  <div>
                  </div>
                </div>
              </div>

              <div className="row">
                {/* Carousel */}
                <div className="theiaStickySidebar col-lg-6">
  <div
    id="carouselExampleControls"
    className="carousel slide"
    data-bs-ride="carousel"
    data-bs-interval="3000"  // ✅ Auto slide every 3 sec
  >
    <div
      className="mt-1 mb-3 rounded-3 border carousel-inner"
      role="listbox"
    >
      {product.images && product.images.length > 0 ? (
        product.images.map((img, idx) => (
          <div
            key={img.id}
            className={`carousel-item ${idx === 0 ? "active" : ""}`}
          >
            <img
              className="d-block rounded-3 img-fluid"
              src={img.image_url}
              alt={img.alt_text || `product-img-${idx}`}
            />
          </div>
        ))
      ) : (
        <div className="carousel-item active">
          <img
            className="d-block rounded-3 img-fluid"
            src="/assets/img/no-image.png"
            alt="no-image"
          />
        </div>
      )}
    </div>

    {/* Controls */}
    <a
      className="carousel-control-prev"
      href="#carouselExampleControls"
      role="button"
      data-bs-slide="prev"
    >
      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
      <span className="visually-hidden">Previous</span>
    </a>
    <a
      className="carousel-control-next"
      href="#carouselExampleControls"
      role="button"
      data-bs-slide="next"
    >
      <span className="carousel-control-next-icon" aria-hidden="true"></span>
      <span className="visually-hidden">Next</span>
    </a>
  </div>
</div>

                {/* Product Details */}
                <div className="col-lg-6">
                  <div className="row mb-4 row-gap-3">
                    <div className="col-md-6">
                      <div className="border shadow-sm p-3 rounded-2">
                        <p className="mb-1 fs-13">Category</p>
                        <h6 className="fs-14 mb-0 text-truncate">
                          {product.service_categories
                            ?.map((cat) => cat.title)
                            .join(", ") || "N/A"}
                        </h6>
                      </div>
                    </div>

                    {product.treatments?.length > 0 && (
  <div className="col-md-6">
    <div className="border shadow-sm p-3 rounded-2">
      <p className="mb-1 fs-13">Treatments</p>
      <h6 className="fs-14 mb-0 text-truncate">
        {product.treatments.map((treat) => treat.name).join(", ")}
      </h6>
    </div>
  </div>
)}


                    <div className="col-md-6">
                      <div className="border shadow-sm p-3 rounded-2">
                        <p className="mb-1 fs-13">Brand</p>
                        <h6 className="fs-14 mb-0 text-truncate">
                          {product.brand || "N/A"}
                        </h6>
                      </div>
                    </div>
                  </div>

     <div className="col-md-12">
  <div>
    <h5>Product Outsource Link</h5>

    {product.outsource_link ? (
      <a
        href={product.outsource_link}
        target="_blank"
        rel="noopener noreferrer"
        className="fs-14 text-primary text-truncate d-inline-block"
        style={{ maxWidth: "100%" }}
      >
        {product.outsource_link}
      </a>
    ) : (
      <h6 className="fs-14 mb-0">N/A</h6>
    )}
  </div>
</div>



                  <h5>Product Description</h5>
                  <div className="m-2"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />

                  <h5>Product Highlights</h5>
                  <div className="m-2"
                    dangerouslySetInnerHTML={{ __html: product.highlights }}
                  />

                  <h5>Usage Instructions</h5>

                    <div className="m-2"
                    dangerouslySetInnerHTML={{ __html: product.usage }}
                  />

                  <h5>Ingredients or Key Components</h5>

                    <div className="m-2"
                    dangerouslySetInnerHTML={{ __html: product.ingredients }}
                  />


                  <hr />

<h5>Product Prescription</h5>

<p className="text-dark mb-2 fw-medium d-flex align-items-center justify-content-between">
  Dosage
  <span className="text-body fw-normal">{product.dosage}</span>
</p>

<p className="text-dark mb-2 fw-medium d-flex align-items-center justify-content-between">
  When to use
  <span className="text-body fw-normal">{product.when_to_use}</span>
</p>

<p className="text-dark mb-2 fw-medium d-flex align-items-center justify-content-between">
  When to start using
  <span className="text-body fw-normal">{product.when_to_start}</span>
</p>

<p className="text-dark mb-2 fw-medium d-flex align-items-center justify-content-between">
  When to stop using
  <span className="text-body fw-normal">{product.when_to_stop}</span>
</p>

<p className="text-dark mb-2 fw-medium d-flex align-items-center justify-content-between">
  Duration
  <span className="text-body fw-normal">{product.duration}</span>
</p>

<p className="text-dark mb-2 fw-medium d-flex align-items-center justify-content-between">
  Frequency
  <span className="text-body fw-normal">{product.frequency}</span>
</p>

<p className="text-dark mb-2 fw-medium d-flex align-items-center justify-content-between">
  Mode of Application/Intake
  <span className="text-body fw-normal">{product.intake_mode}</span>
</p>

<p className="text-dark mb-2 fw-medium d-flex align-items-center justify-content-between">
  Timing
  <span className="text-body fw-normal">
    {product.timings?.length > 0
      ? product.timings.map((time, idx) => (
          <span key={idx}>
            {formatTime(time)}
            {idx < product.timings.length - 1 && ', '}
          </span>
        ))
      : 'Not Available'}
  </span>
</p>




                </div>
              </div>

              {/* Treatments */}
      
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
