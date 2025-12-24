'use client';
import React, { useEffect, useState } from 'react';
import MainConfig from '@/mainconfig';
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const [curtishCleanAuthToken, setAuthToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('curtishCleanAuthToken');
    setAuthToken(token);
  }, []);

  return (
      <div className="">
              <header id="top-page" className="header">
        <div id="mainNav" className="main-menu-area animated">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-12 col-lg-3 d-flex justify-content-between align-items-center">
                <div className="logo">
                  <Link href="/" className="navbar-brand navbar-brand1">
                    <Image src="/website-assets/images/logo-white.png" alt="ServiceCue" width={306} height={72} priority/>
                  </Link>
                  <Link href="/" className="navbar-brand navbar-brand2">
                    <Image src="/website-assets/images/sc-logo.png" alt="ServiceCue" width={140} height={50}/>
                  </Link>
                </div>
              </div>
              {/* Add menu here if needed */}
            </div>
          </div>
        </div>
      </header>
            <section id="home" className="banner image-bg">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-12 col-lg-6">
              <div className="banner-image wow fadeInUp" data-wow-offset="10" data-wow-duration="1s" data-wow-delay="0.3s">
                <Image src="/website-assets/images/awesome-features-blur.png" alt="Awesome Features" width={636} height={585} className="bounce-effect img-fluid"/>
              </div>
            </div>
            <div className="col-12 col-lg-6 res-margin">
              <div className="banner-text">
                <h1 className="mb-2 wow ms-mt-1 fadeInUp" data-wow-offset="10" data-wow-duration="1s" data-wow-delay="0s">
                  Introducing Service Cue
                </h1>
                <p className="mb-3 text-white fs-3">
                  Smarter client care. Stronger results.
                </p>
                <p className="wow fadeInUp" data-wow-offset="10" data-wow-duration="1s" data-wow-delay="0.3s">Built for clinics, loved by clients — Service Cue helps you stay connected, consistent, and one step ahead.</p>
                <p>Want to be the first to experience Real Service?</p>
                <div className="button-store wow fadeInUp" data-wow-offset="10" data-wow-duration="1s" data-wow-delay="0.6s">
                  <Link href="/book-a-demo" className="custom-btn m-2 m-sm-0">
                    <p className="text-center fs-6">Waitlist</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="wave-effect wave-anim">
          <div className="waves-shape shape-one">
            <div className="wave wave-one"></div>
          </div>
          <div className="waves-shape shape-two">
            <div className="wave wave-two"></div>
          </div>
          <div className="waves-shape shape-three">
            <div className="wave wave-three"></div>
          </div>
        </div>
      </section>

      {/* Company Section */}
      <section id="company" className="bg-grey">
        <div className="pt-5 pb-0 container">
          <div className="row align-items-center gx-xl-5">
            <div className="col-lg-6" data-aos="fade-up">
              <div className="image mb-40">
                 <Image
                  src="/website-assets/images/about.jpg"
                  alt="Image"
                  width={624}
                  height={0}
                  style={{ height: "auto" }}
                  className="pb-4 img-fluid"
                />
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up">
              <div className="content-title mb-40">
                <div className="section-title pb-4">
                  <h3>
                    <span className="theme-cl">One Platform</span> to Manage
                    Skin Plans, Products, and Progress
                  </h3>
                  <p className="lead">
                    Service Cue helps professionals prescribe smarter, and
                    clients stay on track — all from one connected platform.
                  </p>
                  <p className="lead mt-2">
                    Whether you’re delivering the treatment or following the
                    plan, this is how better results happen.
                  </p>
                </div>
                <div className="content-text">
                  <ul className="overview-list fa-ul">
                    <li>
                      <p>
                        <i className="fa-li fas fa-square"></i>Clear, tailored
                        digital treatment plans — accessible to both client and
                        professional
                      </p>
                    </li>
                    <li>
                      <p>
                        <i className="fa-li fas fa-square"></i>Track visible
                        progress with before-and-after photos stored in one
                        place
                      </p>
                    </li>
                    <li>
                      <p>
                        <i className="fa-li fas fa-square"></i>Structured
                        skincare prescriptions — with reminders on what to use,
                        when and what to pause to prep for the next visit
                        <br />
                        <strong>and more.. </strong>
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="bg-grey">
        <div className="container">
          <div className="row align-items-center gx-xl-5">
            <div className="col-12 col-lg-6 order-lg-last text-sm-center">
              <Image
                src="/website-assets/images/about_1.jpg"
                alt="Image"
                width={624}
                height={0}
                style={{ height: "auto" }}
                className="pb-4 rounded-3"
              />
            </div>
            <div className="col-12 col-lg-6 res-margin">
              <div className="section-title text-center text-lg-start">
                <h3>
                  <span className="theme-cl">Track</span> From Anywhere
                </h3>
                <p className="lead">
                  Whether you&apos;re at home, in clinic, or on the go — Service Cue
                  keeps your skin journey connected, visible, and on track.
                </p>
                <p className="lead">
                  With real-time access to plans, prescriptions, and progress
                  updates, you’ll never miss a step again.
                </p>
              </div>
              <div className="overview-item">
                <div className="overview-box d-flex flex-wrap">
                  <div className="icon icon-basic-compass"></div>
                  <div className="content">
                    <h4 className="font-host font-weight-bold mb-2 mt-0">
                      Easy to Use
                    </h4>
                    <p>
                      Designed for simplicity — with an intuitive interface that
                      makes following your plan feel effortless for both clients
                      and professionals.
                    </p>
                  </div>
                </div>
                <div className="overview-box d-flex flex-wrap">
                  <div className="icon icon-basic-star"></div>
                  <div className="content">
                    <h4 className="font-host font-weight-bold mb-2 mt-0">
                      Verified Professionals
                    </h4>
                    <p>
                      Work with trusted skin, laser, and aesthetic providers.
                      Service Cue only connects clients with qualified,
                      registered professionals.
                    </p>
                  </div>
                </div>
                <div className="overview-box d-flex flex-wrap">
                  <div className="icon icon-basic-link"></div>
                  <div className="content">
                    <h4 className="font-host font-weight-bold mb-2 mt-0">
                      Stay Connected
                    </h4>
                    <p>
                      Secure messaging and treatment updates keep communication
                      flowing between appointments — so nothing slips through
                      the cracks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row ms-mt-3 align-items-center gx-xl-5">
            <div className="col-12 col-lg-6 text-sm-center">
              <Image
                src="/website-assets/images/about_2.jpg"
                alt="Image"
                width={624}
                height={0}
                style={{ height: "auto" }}
                className="pb-4 rounded-3 img-fluid"
              />
            </div>
            <div className="col-12 col-lg-6 res-margin">
              <div className="pb-3 section-title text-center text-lg-start">
                <h3>
                  Built For Your Daily
                  <span className="theme-cl"> Treatment Plan</span>
                </h3>
                <p className="lead">
                  Consistency creates confidence — and Service Cue makes it easy
                  to follow every step of your skin journey, with structure,
                  support, and real-time progress tracking.
                </p>
                <p className="lead">
                  From daily product routines to goal-based progress updates, we
                  help clients stay engaged — and give clinics full visibility
                  to personalise care, improve outcomes, and celebrate results.
                </p>
              </div>
              <h5>What You’ll Love:</h5>
              <ul className="overview-list fa-ul">
                <li>
                  <p>
                    <i className="fa-li fas fa-check"></i>Clear, structured
                    instructions for each product — what to use, when, and how
                  </p>
                </li>
                <li>
                  <p>
                    <i className="fa-li fas fa-check"></i> Automated reminders
                    that guide clients through their plan without overwhelm
                  </p>
                </li>
                <li>
                  <p>
                    <i className="fa-li fas fa-check"></i>Before-and-after photo
                    tracking linked to skin goals — so clients can see their
                    investment paying off
                  </p>
                </li>
                <li>
                  <p>
                    <i className="fa-li fas fa-check"></i>Real-time plan
                    visibility for professionals — with progress data to guide
                    reviews and adjustments
                  </p>
                </li>
                <li>
                  <p>
                    <i className="fa-li fas fa-check"></i>Dynamic prescriptions
                    that update as skin evolves
                  </p>
                  <p>
                    <i className="fa-li fas fa-check"></i>Pre- and
                    post-treatment alerts to ensure safety, compliance, and
                    better results
                  </p>
                </li>
              </ul>
              <h6>
                When clients see real progress — and professionals can prove it
                — everyone wins.
              </h6>
            </div>
          </div>
        </div>
      </section>

      {/* Sneak Peek Section */}
      <section className="mt-3">
        <div className="pt-2 container">
          <div className="row">
            <div className="col-12 text-center">
              <div className="section-title pb-5 text-center">
                <h3>
                  Here’s a <span className="theme-cl">sneak peek</span> inside
                  the platform
                </h3>
              </div>
              <div className="row">
                <div className="ms-v-stretch col-lg-3">
                  <div className="price-table content">
                    <div className="icon icon-basic-calendar"></div>
                    <h5 className="font-host font-weight-bold mb-3 mt-0">
                      Daily Treatment
                      <br />
                      Planner
                    </h5>
                    <p>
                      Know exactly what to use, when to pause, and how to follow
                      your plan
                    </p>
                  </div>
                </div>
                <div className="ms-v-stretch col-lg-3">
                  <div className="price-table content">
                    <div className="icon icon-basic-case"></div>
                    <h5 className="font-host font-weight-bold mb-3 mt-0">
                      Clinic-Connected
                      <br />
                      Product Store
                    </h5>
                    <p>
                      Purchase prescribed skincare directly from your provider
                    </p>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="price-table content">
                    <div className="icon icon-basic-settings"></div>
                    <h5 className="font-host font-weight-bold mb-3 mt-0">
                      Verified Clinics and
                      <br />
                      Services
                    </h5>
                    <p>
                      Explore specialists near you and stay connected to trusted
                      professionals
                    </p>
                  </div>
                </div>
                <div className="ms-v-stretch col-lg-3">
                  <div className="price-table content">
                    <div className="icon icon-basic-headset"></div>
                    <h5 className="font-host font-weight-bold mb-3 mt-0">
                      Secure Enquiries and
                      <br />
                      Post-Treatment Support
                    </h5>
                    <p>Message your clinic directly through the app</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>




        <footer>
        <div className="py-5 footer-widgets">
          <div className="container">
            <div className="row d-flex">
              <div className="ms-v-stretch col-12 col-md-6 col-lg-12">
                <div className="widget text-center">
                  <p className="footer-logo" align="center">
                    <Image
                      src="/website-assets/images/logo-white.png"
                      width={300}
                      height={80}
                      alt="ServiceCue"
                      priority
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-copyright">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <p className="copyright text-center">
                  Copyright © 2025{" "}
                  <Link href="/" className="text-decoration-none">
                    ServiceCue
                  </Link>
                  . All Rights Reserved. Design by{" "}
                  <a
                    href="https://supportsoft.com.au/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Supportsoft Technologies
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
  );
}
