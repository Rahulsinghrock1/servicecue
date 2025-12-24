'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function TermsConditionsPage() {
  const [curtishCleanAuthToken, setAuthToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('curtishCleanAuthToken');
    setAuthToken(token);
  }, []);

  return (
    <div>
      {/* HEADER */}
      <div className="inner-bg-header">
        <header id="top-page" className="header">
          <div id="mainNav" className="main-menu-area animated">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-12 col-lg-3 d-flex justify-content-between align-items-center">
                  <div className="logo">
                    <Link href="/">
                      <Image
                        src="/images/logo-white.png"
                        alt="ServiceCue"
                        width={160}
                        height={50}
                        priority
                      />
                    </Link>
                    <Link href="/">
                      <Image
                        src="/images/sc-logo.png"
                        alt="ServiceCue"
                        width={160}
                        height={50}
                        priority
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* PAGE TITLE */}
      <section className="banner image-bg">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-md-12">
              <div className="page-title-top">
                <h1>Terms &amp; Conditions of Use</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="inner-legal-page py-5">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="details-info">

                <h2>Service Cue – Terms &amp; Conditions of Use</h2>
                <p>
                  <strong>Service Cue Pty Ltd (ABN 77 685 468 384)</strong><br />
                  Address: Coolum Beach, QLD Australia<br />
                  Email: <a href="mailto:support@servicecue.com">support@servicecue.com</a><br />
                  Last Updated: October 2025
                </p>

                <h3>1. Introduction / Acceptance</h3>
                <p>
                  1.1 These Terms govern your access to and use of the Service Cue website and mobile application (“the Service”).<br />
                  1.2 By accessing or using the Service, you agree to these Terms. If you do not agree, you must not use the Service.<br />
                  1.3 We may update these Terms at any time. Revised versions will be posted in the Service or sent via email. Continued use after updates constitutes acceptance.
                </p>

                <h3>2. Eligibility & Registration</h3>
                <p>
                  2.1 You must be at least 18 years old (or have parental/guardian consent).<br />
                  2.2 You agree to provide accurate, current, and complete information and to keep it updated.<br />
                  2.3 You are responsible for safeguarding your login credentials and must notify us immediately of any unauthorised use.
                </p>

                <h3>3. Access & Use Rights</h3>
                <p>
                  3.1 We grant you a limited, non-exclusive, non-transferable, revocable licence to use the Service.<br />
                  3.2 You must not:
                </p>
                <ul>
                  <li>use the Service unlawfully or for any unauthorised purpose;</li>
                  <li>interfere with, disrupt, or overload the Service;</li>
                  <li>copy, reverse-engineer, or attempt to extract source code;</li>
                  <li>upload harmful or infringing content; or</li>
                  <li>violate intellectual-property or privacy rights.</li>
                </ul>

                <h3>4. Intellectual Property</h3>
                <p>
                  4.1 All content, designs, software, and data in the Service are owned or licensed by Service Cue Pty Ltd.<br />
                  4.2 You may not reproduce, modify, distribute, or commercially exploit any part of the Service without written consent.<br />
                  4.3 By submitting or uploading content, you grant us a non-exclusive, royalty-free licence to use that content solely to operate and improve the Service in accordance with our Privacy Policy.
                </p>

                <h4>4.4 Trademarks</h4>
                <p>
                  “Service Cue” and the Service Cue logo are registered trademarks of Service Cue Pty Ltd (ABN 77 685 468 384) in Australia. All other marks remain the property of their respective owners. You may not use, copy, or reproduce any Service Cue trademarks or trade dress without prior written permission.
                </p>

                <h4>4.5 Proprietary Technology – Patent Pending</h4>
                <p>
                  Certain features and processes within the Service Cue platform are protected as proprietary technology and are the subject of a provisional patent application filed with IP Australia on 5 August 2025. All related intellectual property remains the exclusive property of Service Cue Pty Ltd. You are not granted any licence or right to copy, replicate, or reverse-engineer any part of the Service Cue system, algorithms, or workflows.
                </p>

                <h3>5. Fees, Payments, Cancellations & Refunds</h3>
                <h4>5.1 Subscription Plans</h4>
                <p>
                  Service Cue operates on a subscription basis. Pricing and plan features are displayed at the time of purchase and may vary by plan type (Solo, Team, Enterprise, or other). All fees are stated in Australian dollars (AUD) and are exclusive of applicable taxes unless stated otherwise.
                </p>

                <h4>5.2 Payment Processing</h4>
                <p>
                  Payments are processed securely through Stripe or another PCI-DSS-compliant gateway. Service Cue Pty Ltd does not store full credit-card details. By subscribing, you authorise recurring payments in accordance with your selected plan.
                </p>

                <h4>5.3 Renewal & Billing Cycle</h4>
                <p>
                  Subscriptions automatically renew at the end of each billing cycle unless cancelled in accordance with clause 5.4. You will be notified prior to renewal where required by law.
                </p>

                <h4>5.4 Cancellation Policy</h4>
                <p>
                  You may cancel your subscription at any time through your account settings or by contacting <a href="mailto:support@servicecue.com">support@servicecue.com</a>.
                  Cancellations require a minimum of 30 days’ written notice before the end of your current billing cycle.
                </p>
                <ul>
                  <li>Your account remains active and usable during the notice period.</li>
                  <li>The final month’s fee remains payable.</li>
                  <li>No partial refunds or pro-rata credits are issued for unused time.</li>
                </ul>

                <p>
                  After the 30-day period expires, your access will be terminated and no further payments will be taken.
                </p>

                <h4>5.5 Refunds & Consumer Guarantees</h4>
                <p>
                  Refunds are provided only where required under the Australian Consumer Law (ACL). Nothing in these Terms limits your statutory consumer rights.
                </p>

                <h3>6. Consumer Guarantees & Disclaimers</h3>
                <p>
                  6.1 You retain the non-excludable consumer guarantees under the ACL.<br />
                  6.2 Except as required by law, the Service is provided “as is” and we make no warranties of uninterrupted or error-free operation.
                </p>

                <h3>7. Limitation of Liability</h3>
                <p>
                  7.1 To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential loss arising from your use or inability to use the Service.<br />
                  7.2 Our total liability for any claim is limited to the total fees you paid in the 12 months preceding the claim.<br />
                  7.3 We do not exclude liability where it cannot lawfully be excluded.
                </p>

                <h3>8. Termination & Suspension</h3>
                <p>
                  8.1 We may suspend or terminate your account at any time with or without notice.<br />
                  8.2 You may cancel your subscription through the in-app process.<br />
                  8.3 On termination, your right to access the Service ceases immediately, but provisions regarding IP, confidentiality, and liability survive.
                </p>

                <h3>9. Maintenance & Updates</h3>
                <p>
                  9.1 We may modify or discontinue any part of the Service at any time.<br />
                  9.2 Updates or enhancements may install automatically.
                </p>

                <h3>10. Security & Data Protection</h3>
                <p>
                  10.1 We use AWS default security configurations, database-level encryption for sensitive identifiers, JWT tokens for stateless sessions, and multi-factor authentication (email verification initially).<br />
                  10.2 While we take reasonable measures, no system is completely secure.<br />
                  10.3 If a data breach occurs, we will notify affected users and the OAIC under the Notifiable Data Breaches Scheme.
                </p>

                <h4>10A. Breach Response & Notification Protocol</h4>
                <p>
                  In the event of a known or suspected data breach affecting personal information, Service Cue Pty Ltd shall: (a) initiate an internal investigation within 72 hours; (b) engage qualified forensic and cybersecurity professionals; (c) determine scope and affected users; (d) notify affected users and the OAIC; (e) advise users on mitigation steps; and (f) maintain detailed logs and review security measures.
                </p>

                <h4>10B. Privilege & Confidential Investigations</h4>
                <p>
                  All internal investigations, forensic analyses, and legal advice undertaken in response to any incident or breach are confidential, privileged, and not subject to disclosure except where required by law.
                </p>

                <h3>11. AI & Data Disclaimer</h3>
                <p>
                  11.1 The Service incorporates artificial-intelligence (AI) features that assist in analysing treatment data and photos.<br />
                  11.2 AI outputs are informational only and must be verified by qualified professionals. Service Cue Pty Ltd accepts no liability for outcomes based on AI-generated insights.
                </p>

                <h4>11A. Indemnification</h4>
                <p>
                  You agree to indemnify, defend, and hold harmless Service Cue Pty Ltd, its officers, employees, and agents from any claim, loss, or liability arising from (a) your or your clients’ use or misuse of the Service; (b) any clinical or treatment outcome; or (c) your breach of these Terms or applicable law.
                </p>

                <h3>12. Third-Party Integrations</h3>
                <p>
                  12.1 The Service may connect with third-party systems (e.g. booking platforms, CRMs, payment processors, analytics providers).<br />
                  12.2 Clinics must obtain client consent before sharing personal data through integrations.<br />
                  12.3 We are not responsible for third-party privacy or security practices.
                </p>

                <h3>13. Governing Law & Jurisdiction</h3>
                <p>
                  13.1 These Terms are governed by the laws of Queensland, Australia.<br />
                  13.2 You submit to the non-exclusive jurisdiction of Queensland courts.
                </p>

                <h3>14. Clinical & Professional Advice Disclaimer</h3>
                <p>
                  The Service is a digital support tool to assist clinics, therapists, and clients in tracking treatment plans and product prescriptions. Service Cue Pty Ltd does not provide medical, dermatological, cosmetic, or therapeutic advice, diagnosis, or treatment. Clinics remain responsible for accuracy and appropriateness of information entered.
                </p>

                <h3>15. Notices</h3>
                <p>
                  15.1 Notices to you may be provided via email, in-app notification, or posting within the Service.<br />
                  15.2 Notices to us should be sent to <a href="mailto:support@servicecue.com">support@servicecue.com</a> unless another method is specified.
                </p>

                <h3>16. Use by Minors</h3>
                <p>
                  16.1 The Service is not intended for persons under 18 without parental consent.<br />
                  16.2 Clinics must ensure data handling complies with the Privacy Act 1988 (Cth).<br />
                  16.3 Service Cue Pty Ltd relies on clinics to manage parental consent and compliance obligations.
                </p>

                <h3>17. Representative Claims / Class Actions</h3>
                <p>
                  To the maximum extent permitted by law, you and we agree that disputes shall be brought only in an individual capacity and not as a class, representative, or collective action.
                </p>

                <h3>18. Audit & Compliance Rights</h3>
                <p>
                  Service Cue Pty Ltd may, on reasonable notice, audit or inspect your use of the Service and integrations to ensure compliance with data and security obligations.
                </p>

                <h3>19. Miscellaneous</h3>
                <p>
                  19.1 Severability – If any clause is invalid, the remainder remains effective.<br />
                  19.2 Assignment – You may not assign rights without our consent.<br />
                  19.3 Entire Agreement – These Terms and the Privacy Policy form the entire agreement between you and Service Cue Pty Ltd.
                </p>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="py-5 footer-widgets">
          <div className="container">
            <div className="row d-flex">
              <div className="col-12 col-md-6 col-lg-12">
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
                  Copyright © 2025{' '}
                  <Link href="/" className="text-decoration-none">
                    ServiceCue
                  </Link>
                  . All Rights Reserved. Design by{' '}
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
