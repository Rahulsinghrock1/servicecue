import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Service Cue",
};

export default function HomePage() {
  return (
    <>
      <section id="home" className="banner video-bg bottom-oval">
        <div className="container">

          <div className="row">
            <div className="col-md-12">
              <div></div>
            </div>
          </div>

          <div className="row align-items-center">
            <div className="col-12 col-lg-8 offset-lg-2">

              <div className="banner-text text-center">
                <h3
                  className="wow fadeInUp text-white pb-3"
                  data-wow-offset="10"
                  data-wow-duration="1s"
                  data-wow-delay="0s"
                >
                  3 Connected Platforms, 1 Monthly Subscription
                </h3>

                <div
                  className="button-store wow fadeInUp"
                  data-wow-offset="10"
                  data-wow-duration="1s"
                  data-wow-delay="0.6s"
                >
                  <Link
                    href="https://links.servicecue.com/widget/booking/qubwm8AJ5MfgZ6D037Vr"
                    className="custom-btn m-2 m-sm-0 me-sm-3"
                    style={{textDecoration:"none !important"}}
                  >
                    <p className="text-center fs-6" style={{textDecoration:"none !important"}}>Book a live Demo</p>
                  </Link>

                  <Link
                    href="/pricing"
                    className="custom-btn m-2 m-sm-0 me-sm-3"
                    style={{textDecoration:"none !important"}}
                  >
                    <p className="text-center fs-6" style={{textDecoration:"none !important"}}>Pricing</p>
                  </Link>

                  <Link
                    href="https://servicecue.com.au/register"
                    className="custom-btn m-2 m-sm-0"
                    style={{textDecoration:"none !important"}}
                  >
                    <p className="text-center fs-6" style={{textDecoration:"none !important"}}>Sign up Now</p>
                  </Link>
                </div>
              </div>

              <div className="empty-30"></div>

            </div>
          </div>
        </div>

        {/* Banner Image */}
        <div
          className="banner-image-center w-100 wow fadeInUp"
          data-wow-offset="10"
          data-wow-duration="1s"
          data-wow-delay="0.3s"
        >
          <img
            src="/images/banner-img.png"
            alt="Banner Image"
            // width={1600}
            // height={900}
            className=""
          />
        </div>
      </section>
      <section>
        <div className="container-fluid pt-5">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-6">
              <div className="section-title text-center pb-3">
                <h3>Trusted by clinics focused on real results.</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="our-scrolling-ticker bg-section">
          <div className="scrolling-ticker-box">
            <div className="scrolling-content">
              <span><img className="" src="images/icon-sparkle.svg" alt="" /> “I can’t believe no one has created this”</span>
              <span><img src="images/icon-sparkle.svg" alt="" /> “I can’t wait to have this in my clinic” </span>
              <span><img src="images/icon-sparkle.svg" alt="" /> “I am going to tell all my friends in the industry”</span>
              <span><img src="images/icon-sparkle.svg" alt="" /> “This is going to save me hours of admin” </span>
              <span><img src="images/icon-sparkle.svg" alt="" /> “I can't wait to for my clients to see this” </span>
            </div>
            <div className="scrolling-content">
              <span><img src="images/icon-sparkle.svg" alt="" /> “I can’t believe no one has created this”</span>
              <span><img src="images/icon-sparkle.svg" alt="" /> “I can’t wait to have this in my clinic” </span>
              <span><img src="images/icon-sparkle.svg" alt="" /> “I am going to tell all my friends in the industry”</span>
              <span><img src="images/icon-sparkle.svg" alt="" /> “This is going to save me hours of admin” </span>
              <span><img src="images/icon-sparkle.svg" alt="" /> “I can't wait to for my clients to see this” </span>
            </div>
          </div>
        </div>


      </section>

      <section id="company" className="bg-grey">

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-6">
              <div className="section-title text-center">
                <h3>The Three Connected Platforms</h3>
                <p className="lead fw-medium">in One Subscription</p>
              </div>
            </div>
          </div>
          <div className="row align-items-center gx-xl-5">
            <div className="col-lg-6 aos-init aos-animate" data-aos="fade-up">
              <div className="image mb-40"> <img className="rounded" src="images/destop-mockup.png" data-src="images/destop-mockup.png" alt="Image" /> </div>
            </div>
            <div className="col-lg-6 aos-init aos-animate" data-aos="fade-up">
              <div className="content-title mt-3 mb-40">
                <div className="section-title pb-4 ">
                  <h3> Business Dashboard (Built for Owners & Managers)</h3>
                  <p className="lead fw-medium"> <b>Your control centre for growth. </b></p>
                </div>
                <div className="content-text">
                  <ul className="overview-list">
                    <li>
                      <p><i className="fa-li fas fa-square"></i>Live insights: rebookings, retention, retail </p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-square"></i>Client compliance and progress visibility </p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-square"></i>Staff goals & performance tracking </p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-square"></i>Marketing photo library  </p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-square"></i>View and allocate new client enquiries </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="row align-items-center gx-xl-5">
            <div className="col-lg-6 aos-init aos-animate" data-aos="fade-up">
              <div className="content-title mt-3 mb-40">
                <div className="section-title pb-4 ">
                  <h3> Professional App (For Staff & Therapists)</h3>
                  <p className="lead fw-medium"> <b>Your treatment-room co-pilot. </b></p>
                </div>
                <div className="content-text">
                  <ul className="overview-list">
                    <li>
                      <p><i className="fa-li fas fa-square"></i>Create/update digital treatment plans in seconds  </p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-square"></i>Capture before/after photos and share on socials  </p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-square"></i>Prescribe products with clear “how/when/what to pause”  </p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-square"></i>Send post-care and automate reminders  </p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-square"></i>2 way comments section to stay connected to clients </p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-square"></i>Intelligent predictions of when clients are due to reorder their products  </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-6 aos-init aos-animate" data-aos="fade-up">
              <div className="image mb-40"> <img className="rounded" src="images/ProfessionalApp.jpg" data-src="images/ProfessionalApp.jpg" alt="Image" /> </div>
            </div>
          </div>
          <div className="row align-items-center gx-xl-5">
            <div className="col-lg-6 aos-init aos-animate" data-aos="fade-up">
              <div className="image mb-40"> <img className="rounded" src="images/ClientApp.jpg" data-src="images/ClientApp.jpg" alt="Image" /> </div>
            </div>
            <div className="col-lg-6 aos-init aos-animate" data-aos="fade-up">
              <div className="content-title mt-3 mb-40">
                <div className="section-title pb-4 ">
                  <h3> Client App (Clients — Always Free</h3>
                  <p className="lead fw-medium"> <b>Your client’s plan, in their pocket.  </b></p>
                </div>
                <div className="content-text">
                  <ul className="overview-list">
                    <li>
                      <p><i className="fa-li fas fa-square"></i>See treatment plans, routines, and timelines </p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-square"></i>Track photo progress and celebrate milestones </p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-square"></i>Clear pre and post service care – never lost or forgotten </p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-square"></i>Get smart nudges (use, pause, repurchase, check-in)  </p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-square"></i>Message the clinic securely between visits </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-6">
              <p className="mt-3 text-center "> <a href="https://links.servicecue.com/widget/booking/qubwm8AJ5MfgZ6D037Vr" className="btn">Book a live Demo</a> </p>
            </div>
          </div>
        </div>
      </section>

      <section id="overview" style={{ background: "#f9d9e0" }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12 col-lg-6 res-margin">
              <div className="pb-3 section-title text-center text-lg-start">
                <h3>Why Service Cue</h3>
              </div>
              <h5>From Our Founder </h5>
              <p className="mb-1">I’m not a software developer - I’m a beauty therapist of 16 years who got tired of clients losing aftercare, forgetting routines, and therapists spending hours chasing follow-ups. </p>
              <p className="mb-1"><b>Service Cue™ </b>was built to change that, giving clients the guidance they need between visits, and giving clinics back their time without losing the personal touch. </p>
              <p className="mb-1">Because when clients feel supported, they stay consistent. When they stay consistent, they see results</p>
              <p className="mt-3 text-center text-lg-start"> <a href="about.html" className="btn">Read Shamara’s Full Story</a> </p>
            </div>
            <div className="col-12 col-lg-5 offset-lg-1 text-sm-center"> <img src="images/SHAMARA_126.jpg" alt="" /> </div>
          </div>
        </div>
      </section>

      <section>
        <div className=" container">
          <div className="row">
            <div className="col-12 text-center">
              <div className="section-title text-center">
                <h3>How It Works </h3>
              </div>
              <div className="row">
                <div className="col-lg-3">
                  <div className="price-table p-3 content">
                    <div className="icon icon-basic-case"></div>
                    <h6 className="font-weight-bold mb-2 mt-0">Register you business</h6>
                    <p>Set up your clinic, Add team members, photos, services, and products</p>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="price-table content">
                    <div className="icon icon-basic-download"></div>
                    <h6 className="font-weight-bold mb-2 mt-0">Download the Pro App</h6>
                    <p>Map treatments, prescribe routines, set goals all in the treatment room, with your clients and patients</p>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="price-table p-3 content">
                    <div className="icon icon-basic-cloud"></div>
                    <h6 className="font-weight-bold mb-2 mt-0">Client App</h6>
                    <p>Clients download the app before they leave, sign in and have their therapist guiding them 24/7 - all in their pocket. (free)</p>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="price-table p-3 content">
                    <div className="icon icon-basic-gear"></div>
                    <h6 className="font-weight-bold mb-2 mt-0">Automate & track </h6>
                    <p>Service Cue take care of everything. Reminders, repurchase links, progress, Product reorders. Intelligent. Automated. Engaged.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section id="counters" className="parallax" data-image="/assets/images/counters.jpg">
        <div className="overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-12 col-lg-12">
              <div className="text-center" >
                <a href="https://links.servicecue.com/widget/booking/qubwm8AJ5MfgZ6D037Vr" className="btn">BOOK A LIVE DEMO</a> <a href="https://servicecue.com.au/register" className="btn">IM READY, SIGN ME UP</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="overview" className="bg-grey">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12 col-lg-6 order-lg-last res-margin">
              <div className="section-title text-center text-lg-start">
                <h3>Features That Drive Results</h3>
              </div>
              <ul className="overview-list">
                <li>
                  <p><i className="fa-li fas fa-check"></i>Digital treatment plans with client access </p>
                </li>
                <li>
                  <p><i className="fa-li fas fa-check"></i>Product prescriptions with automated reminders </p>
                </li>
                <li>
                  <p><i className="fa-li fas fa-check"></i>Pre/post-treatment advice for safety, compliance and the best possible results </p>
                </li>
                <li>
                  <p><i className="fa-li fas fa-check"></i>Before/after photos, progress timelines, and social sharing </p>
                </li>
                <li>
                  <p><i className="fa-li fas fa-check"></i>Secure messaging and audit trails  </p>
                </li>
                <li>
                  <p><i className="fa-li fas fa-check"></i>Staff goals, performance, and client compliance tracking  </p>
                </li>
                <li>
                  <p><i className="fa-li fas fa-check"></i>Security & privacy built-in (role-based access, encrypted data) </p>
                </li>
              </ul>
            </div>
            <div className="col-12 col-lg-6 order-lg-first text-sm-center"> <img src="images/daily-schedule.png" alt="" /> </div>
          </div>
        </div>
      </section>

      <section id="screenshots" className="bg-grey">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-6">
              <div className="section-title text-center">
                <h3>Take a Closer Look</h3>
                <p className="lead fw-medium">Service Cue is built to be as powerful as it is easy to use.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="owl-carousel owl-theme screenshot-slider zoom-screenshot">
                <div className="item"> <a href="images/screenshots/screenshot-1.jpg"> <img src="images/screenshots/screenshot-1.jpg" alt="" /> </a> </div>
                <div className="item"> <a href="images/screenshots/screenshot-2.jpg"> <img src="images/screenshots/screenshot-2.jpg" alt="" /> </a> </div>
                <div className="item"> <a href="images/screenshots/screenshot-3.jpg"> <img src="images/screenshots/screenshot-3.jpg" alt="" /> </a> </div>
                <div className="item"> <a href="images/screenshots/screenshot-4.jpg"> <img src="images/screenshots/screenshot-4.jpg" alt="" /> </a> </div>
                <div className="item"> <a href="images/screenshots/screenshot-5.jpg"> <img src="images/screenshots/screenshot-5.jpg" alt="" /> </a> </div>
                <div className="item"> <a href="images/screenshots/screenshot-6.jpg"> <img src="images/screenshots/screenshot-6.jpg" alt="" /> </a> </div>
                <div className="item"> <a href="images/screenshots/screenshot-7.jpg"> <img src="images/screenshots/screenshot-7.jpg" alt="" /> </a> </div>
                <div className="item"> <a href="images/screenshots/screenshot-8.jpg"> <img src="images/screenshots/screenshot-8.jpg" alt="" /> </a> </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="pricing" className="bg-grey">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-6">
              <div className="section-title text-center">
                <h4 className="fr-cliant">Client App — For your clients. Free forever </h4>
                <h3>Pricing Plans</h3>
                <p>Take a look of our affordable pricing plans.</p>
              </div>
            </div>
          </div>
          <div className="row align-items-center pricing-plans">
            <div className="col-12 col-lg-4 res-margin">
              <div className="price-table">
                <div className="icon icon-software-layers2"></div>
                <h3 className="plan-type">Solo Plan</h3>
                <h2 className="mb-1 plan-price">$39/AUD</h2>
                <p className=" fw-medium text-success mb-1">Perfect for: Solo operators, mobile therapists, freelancers.</p>
                <p className="text-start mb-1"><b>Features Included:</b></p>
                <ul className="overview-list overview-list-gs">
                  <li>
                    <p><i className="fa-li fas fa-check"></i>1 staff member</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Up to 50 clients</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Up to 50 product/service listings</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>View & manage up to 50 enquiries per month</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Free client app and client access</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Digital treatment plans, product prescriptions & photo uploads</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Progress tracking, reminders & client comment function</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Advanced insights & analytics</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Simple solo operators performance dashboard</p>
                  </li>
                </ul>
                <p>Simple, powerful tools built for solo operators without the overwhelm.</p>
                <a className="btn" href="https://servicecue.com.au/register">Subscribe</a> </div>
            </div>
            <div className="col-12 col-lg-4 res-margin">
              <div className="price-table plan-popular mb-4 mb-sm-5 mb-lg-0 ">
                <div className="icon icon-basic-heart"></div>
                <h3 className="plan-type">Silver Plan</h3>
                <h2 className="plan-price mb-1">$99/AUD</h2>
                <div className="gs-padding12">
                  <p className=" fw-medium text-success mb-1">Perfect for: Small to medium sized clinics with a handful of staff.</p>
                  <p className="text-start mb-1"><b>Features Included:</b></p>
                  <ul className="overview-list overview-list-gs">
                    <li>
                      <p><i className="fa-li fas fa-check"></i>Up to 5 staff members</p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-check"></i>Up to 200 clients</p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-check"></i>Up to 100 product/service listings</p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-check"></i>View & manage up to 500 enquiries per month</p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-check"></i>Free client app and client access</p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-check"></i>Digital treatment plans, product prescriptions & photo uploads</p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-check"></i>Progress tracking, reminders & client comment function</p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-check"></i>Advanced insights & analytics</p>
                    </li>
                    <li>
                      <p><i className="fa-li fas fa-check"></i>Staff performance dashboards</p>
                    </li>
                  </ul>
                </div>
                <p>Designed for growing clinics — everything you need to streamline client care and scale without the big price tag.</p>
                <a className="btn" href="https://servicecue.com.au/register">Subscribe</a>
                <div className="card-ribbon"> <span>Popular</span> </div>
              </div>
            </div>
            <div className="col-12 col-lg-4">
              <div className="price-table">
                <div className="icon icon-weather-sun"></div>
                <h3 className="plan-type">Gold Plan</h3>
                <h2 className="mb-1 plan-price">$249/AUD</h2>
                <p className=" fw-medium text-success mb-1">Perfect for: Large, busy, high volume clinics.</p>
                <p className="text-start mb-1"><b>Features Included:</b></p>
                <ul className="overview-list overview-list-gs">
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Unlimited staff members</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Unlimited clients</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Unlimited products & services</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Unlimited enquiries</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Free client app and client access</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Digital treatment plans, product prescriptions & photo uploads</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Progress tracking, reminders & client comment function</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Advanced insights & analytics</p>
                  </li>
                  <li>
                    <p><i className="fa-li fas fa-check"></i>Staff performance dashboards</p>
                  </li>
                </ul>
                <p>Built for high-volume clinics that need unrestricted access and advanced tools.</p>
                <a className="btn" href="https://servicecue.com.au/register">Subscribe</a> </div>
            </div>
          </div>
          <div className="row">
            <div
              className="col-12 col-lg-8 offset-lg-2 mobile-phone wow fadeInUp"
              data-wow-offset="10"
              data-wow-duration="1s"
              data-wow-delay="0.9s"
              style={{
                visibility: "visible",
                animationDuration: "1s",
                animationDelay: "0.9s",
                animationName: "fadeInUp",
              }}
            >
              <img src="/images/mobile-phone.png" alt="" />
            </div>
          </div>
        </div>
      </section>
      <section id="support">
        <div className="container-fluid pt-5 pb-5" style={{ background: "#fff2f5" }}>
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8">
              <div className="section-title text-center">
                <h3></h3>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12 testimonial-carousel">
              <div className="block-text row">
                <div className="carousel-text testimonial-slider col-12 col-lg-8 offset-lg-2">
                  <div>
                    <div className="single-box">
                      <p><i className="fas fa-quote-left"></i> We finally stopped chasing aftercare — our rebookings are up and the team feels calmer. <i className="fas fa-quote-right"></i></p>
                    </div>
                  </div>
                  <div>
                    <div className="single-box">
                      <p><i className="fas fa-quote-left"></i> Clients actually follow the plan now — and we can show progress, not just promise it.<i className="fas fa-quote-right"></i></p>
                    </div>
                  </div>

                </div>
              </div>
              <div className="block-media row">
                <div className="carousel-images testimonial-nav col-12 col-lg-8 offset-lg-2">
                  <div>
                    <div className="client-info">
                      <h3>Clinic Owner</h3> </div>
                  </div>
                  <div>
                    <div className="client-info">
                      <h3>Senior Therapist</h3> </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="clients" className="section-box bg-grey">
        <div className="container">
          <div className="row">
            <div className="clients-slider owl-carousel owl-theme" data-dots="true">
              <div className="client">
                <a href="#"><img src="images/company-1.png" alt="Client 1" /></a>
              </div>
              <div className="client">
                <a href="#"><img src="images/company-2.png" alt="Client 2" /></a>
              </div>
              <div className="client">
                <a href="#"><img src="images/company-3.png" alt="Client 3" /></a>
              </div>
              <div className="client">
                <a href="#"><img src="images/company-4.png" alt="Client 4" /></a>
              </div>
              <div className="client">
                <a href="#"><img src="images/company-5.png" alt="Client 5" /></a>
              </div>
              <div className="client">
                <a href="#"><img src="images/company-6.png" alt="Client 6" /></a>
              </div>
              <div className="client">
                <a href="#"><img src="images/company-7.png" alt="Client 7" /></a>
              </div>
              <div className="client">
                <a href="#"><img src="images/company-8.png" alt="Client 8" /></a>
              </div>
            </div>
          </div>
        </div>
      </section>
     
    </>
  );
}
