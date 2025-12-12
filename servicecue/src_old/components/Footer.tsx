"use client";
import Image from "next/image";
import React, { useState } from "react";

const Result = () => (
  <p
    className="success-message"
    style={{ color: "#1ab69d", marginTop: "20px", marginBottom: "0" }}
  >
    Thanks for your query. We will contact you soon.
  </p>
);

export default function Footer() {

   const [result, setResult] = useState(false);
    const [loading, setLoading] = useState(false);

    const sendNewsletter = async (e:any) => {
      e.preventDefault();
      setLoading(true);
      setResult(false);

      const formData = new FormData(e.target);
      const data = {       
        email: formData.get("email"),
      };

      try {
        const res = await fetch(
          `https://servicecue.com.au/api/send-newsletter`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );

        const resultData = await res.json();

        if (resultData.status) {
          e.target.reset();
          setResult(true);
        } else {
          alert("Failed to send message. Please try again.");
        }
      } catch (err) {
        console.error("Error submitting form:", err);
        alert("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }

      setTimeout(() => setResult(false), 5000);
    };



    const sendContactUsEnquiry = async (e:any) => {
      e.preventDefault();
      setLoading(true);
      setResult(false);

      const formData = new FormData(e.target);
      const data = {       
        email: formData.get("email"),
        name: formData.get("name"),
        subject: formData.get("subject"),
        message: formData.get("message"),
      };

      try {
        const res = await fetch(
          `https://servicecue.com.au/api/contact-us-form`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );

        const resultData = await res.json();

        if (resultData.status) {
          e.target.reset();
          setResult(true);
        } else {
          alert("Failed to send message. Please try again.");
        }
      } catch (err) {
        console.error("Error submitting form:", err);
        alert("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }

      setTimeout(() => setResult(false), 5000);
    };

    
    
  return (
    <>
     <section id="subscribe" className="parallax" data-image="assets/images/subscribe.jpg">
        <div className="overlay"></div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-6">
              <div className="section-title text-center white">
                <h3 className="text-white">Subscribe To Our Newsletter</h3>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-6">
              <form id="subscribe-form"  onSubmit={sendNewsletter} autoComplete="off">
                <div className="input-group mb-3">
                  <input type="email" name="email" className="form-control field-subscribe" placeholder="Enter Your Email Address" />
                </div>
                <button type="submit" className="btn w-100">Subscribe</button>
              </form>
              <h3 id="subscribe-result" className="text-center text-white"> Thanks for subscribing! </h3>
              <div className="empty-30"></div>
              <p className="text-center mb-0"> We don’t share your personal information with anyone or company.
                Check out our <a href="#"><strong>Privacy Policy</strong></a> for more information. </p>
            </div>
            {result && (
              <div className="form-group">
                <Result />
              </div>
            )}
          </div>
        </div>
      </section>


      <section id="contact">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-6">
              <div className="section-title text-center">
                <h3>Get In Touch</h3>
                <p>Interested in using Service Cue in your business or partnering with us as a product brand or software booking partner? Please contact us. </p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="contact-info col-12 col-lg-4 res-margin">
              <h5> <span className="icon icon-basic-geolocalize-05"></span> Office Location </h5>
              <p> Sunshine Coast, QLD, Australia </p>
              <h5> <span className="icon icon-basic-smartphone"></span> Phone Number </h5>
              <p><a href="tel:+61450690270" style={{textDecoration:"none !important"}}>+61 450 690 270</a></p>
              <h5> <span className="icon icon-basic-mail"></span> Email Address </h5>
              <p> <a href="mailto:info@servicecue.com" style={{textDecoration:"none !important"}}>info@servicecue.com</a> </p>
            </div>
            <div className="col-12 col-lg-8">
              <form id="contact-form" onSubmit={sendContactUsEnquiry} autoComplete="off">
                <div className="row">
                  <div className="col-12 col-lg-6">
                    <div className="form-group mt-2 mb-3">
                      <input type="text" name="name" className="form-control field-name" placeholder="Name" />
                    </div>
                  </div>
                  <div className="col-12 col-lg-6">
                    <div className="form-group mt-2 mb-3">
                      <input type="email" name="email" className="form-control field-email" placeholder="Email" />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 col-lg-12">
                    <div className="form-group mt-2 mb-3">
                      <input type="text" name="subject" className="form-control field-subject" placeholder="Subject" />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 col-lg-12">
                    <div className="form-group mt-2 mb-3">
                      <textarea name="message" rows={4} className="form-control field-message" placeholder="Message"></textarea>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 col-lg-12 mt-2 mb-3">
                    <button type="submit" id="contact-submit" name="send" className="btn">Send Message</button>
                  </div>
                </div>
              </form>
               {result && (
                  <div className="form-group">
                    <Result />
                  </div>
                )}
             
            </div>
          </div>
        </div>
      </section>
    <footer>
      <div className="footer-widgets">
        <div className="container">
          <div className="row d-flex">
            <div className="col-12 col-md-6 col-lg-12">
              <div className="widget text-center">
                <p className="footer-logo" style={{ textAlign: "center" }}> <img src="images/logo-white.png" width="300px" alt="ServiceCue" /> </p>
                <div className="mb-5 mt-4 d-block button-store" style={{textDecoration:"none !important"}}> 
                  <a href="#" className="custom-btn d-inline-flex align-items-center m-2 m-sm-0 mb-sm-3" style={{textDecoration:"none !important"}}><i className="fab fa-google-play"></i>
                  <p>Available on<span>Google Play</span></p>
                  </a> <a href="#" className="custom-btn d-inline-flex align-items-center m-2 m-sm-0" style={{textDecoration:"none !important"}}><i className="fab fa-apple"></i>
                  <p>Download on<span>App Store</span></p>
                  </a> </div>
                <div className="footer-social text-center"> 
                  <a href="https://www.facebook.com/people/Service-Cue/61578861320566/" title="Facebook" target="_blank"><i className="fab fa-facebook-f fa-fw"></i></a> 
                  <a href="https://www.instagram.com/servicecueapp/" title="Instagram" target="_blank"><i className="fab fa-instagram"></i></a> 
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <div className="footer-copyright">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <p className="copyright text-center"> Copyright © 2025 <a href="#" target="_blank" style={{textDecoration:"none !important"}}>ServiceCue</a>. All Rights Reserved. Design by <a href="https://supportsoft.com.au/" style={{textDecoration:"none !important"}} target="_blank">Supportsoft Technologies</a> </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
    <a href="#top-page" className="to-top">
    <div className="icon icon-arrows-up"></div>
    </a> 
    </>
  );
}
