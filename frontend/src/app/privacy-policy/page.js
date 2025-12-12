'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPolicyPage() {
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
                <h1>Privacy Policy</h1>
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
                <h2>Service Cue – Privacy Policy</h2>
                <p>
                  <strong>Service Cue Pty Ltd (ABN 77 685 468 384)</strong><br />
                  Address: Coolum Beach, QLD Australia<br />
                  Email: <a href="mailto:support@servicecue.com">support@servicecue.com</a><br />
                  Last Updated: October 2025
                </p>

                <h3>1. Purpose and Scope</h3>
                <p>
                  This Privacy Policy explains how Service Cue Pty Ltd (“we”, “us”, “our”) collects, uses, stores, and protects personal information obtained through our website, mobile application, and related services (“the Service”).
                  We comply with the Privacy Act 1988 (Cth) and the 13 Australian Privacy Principles (APPs).
                </p>

                <h3>2. What We Collect</h3>
                <ul>
                  <li>Name, date of birth, and contact details (email, address, phone)</li>
                  <li>Clinic or business information (for professional users)</li>
                  <li>Payment information (securely processed via Stripe – we do not store card numbers)</li>
                  <li>Login credentials and preferences</li>
                  <li>Treatment plans, product prescriptions, and client photos entered by clinics</li>
                  <li>Device and usage data (IP address, browser type, operating system, analytics data)</li>
                  <li>Communications with us (support tickets or emails)</li>
                </ul>

                <h3>3. Sensitive and Health-Related Information</h3>
                <p>3.1 Clinics may record limited health-related information (such as skin photos, treatment history, reactions, and product usage).</p>
                <p>3.2 This information is entered by clinics or professionals and is stored securely using encryption at rest and in transit.</p>
                <p>3.3 Service Cue Pty Ltd is not a healthcare provider and does not create, verify, or modify clinical content.</p>
                <p>3.4 Clinics must obtain appropriate client consent before entering or sharing sensitive data through the Service.</p>

                <h3>4. How We Collect Information</h3>
                <ul>
                  <li>Directly from you when you register, subscribe, or contact us</li>
                  <li>Automatically through cookies, logs, and analytics tools</li>
                  <li>From third parties where authorised (e.g. integrated apps or payment providers)</li>
                </ul>

                <h3>5. Purpose of Use</h3>
                <ul>
                  <li>Provide and operate the Service</li>
                  <li>Verify identity and manage accounts</li>
                  <li>Process payments and subscriptions</li>
                  <li>Send transactional or support communications</li>
                  <li>Enable AI-driven progress tracking and analytics</li>
                  <li>Improve features and user experience</li>
                  <li>Comply with legal and regulatory obligations</li>
                </ul>
                <p>We will not use information for other purposes without consent unless required or permitted by law.</p>

                <h3>6. Artificial Intelligence (AI) Features</h3>
                <p>6.1 Our platform includes AI tools to assist clinics in analysing before-and-after photos and treatment outcomes.</p>
                <p>6.2 AI systems operate in secure AWS environments and do not train on identifiable data without explicit consent.</p>
                <p>6.3 AI outputs are informational only and must be verified by qualified professionals.</p>

                <h3>7. Third-Party Services and Integrations</h3>
                <p>7.1 We use trusted third parties for hosting (AWS), payments (Stripe), and analytics (Google Analytics, Meta Ads).</p>
                <p>7.2 These providers process data under their own privacy policies and security certifications.</p>
                <p>7.3 Clinics are responsible for obtaining client consent before connecting third-party platforms.</p>
                <p>7.4 We are not responsible for the data-handling practices of third-party services.</p>

                <h3>8. Cookies, Analytics & Re-Marketing</h3>
                <ul>
                  <li>Remember login status and preferences</li>
                  <li>Improve functionality and performance</li>
                  <li>Conduct statistical analysis (Google Analytics)</li>
                  <li>Deliver re-marketing ads (Google Ads, Meta Ads)</li>
                </ul>
                <p>Users can disable cookies in their browser settings but some features may be affected.</p>
                <p>Marketing emails comply with the Spam Act 2003 (Cth) and include an unsubscribe option.</p>

                <h3>9. Disclosure of Information</h3>
                <ul>
                  <li>Service providers supporting IT, hosting, analytics, and customer support</li>
                  <li>Payment processors (Stripe) to complete transactions</li>
                  <li>Legal and regulatory authorities where required by law</li>
                  <li>Successor entities in case of merger or sale (subject to confidentiality)</li>
                </ul>
                <p>We do not rent or sell personal information.</p>

                <h3>10. Cross-Border Transfers and GDPR Alignment</h3>
                <p>10.1 Data may be stored in AWS servers located outside Australia (e.g. USA, Singapore).</p>
                <p>10.2 We ensure appropriate safeguards (contractual and technical) for cross-border transfers.</p>
                <p>10.3 Where applicable, we endeavour to align with the EU General Data Protection Regulation (GDPR) principles of transparency, lawfulness, and data minimisation.</p>

                <h3>11. Data Security</h3>
                <ul>
                  <li>AWS default security configurations and monitoring</li>
                  <li>Database-level encryption of sensitive fields</li>
                  <li>JWT tokens for session management</li>
                  <li>Multi-factor authentication (email verification)</li>
                  <li>Firewalls and access controls for authorised staff only</li>
                </ul>
                <p>While we take reasonable measures, no system is fully secure.</p>
                <p>In case of a breach, we comply with the Notifiable Data Breaches Scheme, assessing within 30 days and notifying affected users and the OAIC if required.</p>

                <h3>11A. Security Audits & Testing</h3>
                <p>
                  We periodically conduct penetration testing, vulnerability scanning, and security audits to validate the effectiveness of our controls and maintain industry-standard protection.
                </p>

                <h3>12. Data Retention and Deletion</h3>
                <p>We retain data only as long as necessary for legal, contractual, or operational purposes.</p>
                <p>When no longer needed, data is securely deleted or de-identified.</p>
                <p>Users may request account deletion by contacting <a href="mailto:support@servicecue.com">support@servicecue.com</a>.</p>

                <h3>13. Access and Correction Rights</h3>
                <p>You may request access to your personal information or ask for corrections to inaccurate data. Requests are responded to within a reasonable time (typically 30 days).</p>
                <p>We may refuse requests where lawful exceptions apply and will provide written reasons.</p>

                <h3>14. Direct Marketing and Communication Preferences</h3>
                <p>We may send marketing communications where you have opted in or we reasonably believe you expect them based on our relationship.</p>
                <p>You may opt out at any time via unsubscribe links or by emailing support@servicecue.com with “UNSUBSCRIBE”.</p>

                <h3>15. Data Breach Management</h3>
                <ul>
                  <li>Assess the incident within 30 days</li>
                  <li>Notify affected individuals and the OAIC</li>
                  <li>Provide guidance on protective measures</li>
                  <li>Implement remediation and audit actions</li>
                </ul>

                <h3>15A. Legal Privilege in Breach Response</h3>
                <p>Any investigation reports or forensic materials prepared for legal or regulatory purposes are confidential and legally privileged to the extent permitted by law.</p>

                <h3>16. Use by Minors</h3>
                <p>The Service is not intended for use by persons under the age of 18 without parent/guardian consent and supervision.</p>
                <p>Clinics are responsible for managing minor data collection in compliance with applicable laws.</p>

                <h3>17. Links to External Websites</h3>
                <p>Our website may contain links to third-party sites. We are not responsible for their content or privacy practices.</p>

                <h3>18. Contact and Complaints</h3>
                <p>
                  For privacy enquiries or complaints, contact:<br />
                  <strong>Service Cue Pty Ltd</strong><br />
                  Email: <a href="mailto:support@servicecue.com">support@servicecue.com</a><br />
                  Address: Coolum Beach, QLD Australia
                </p>
                <p>We aim to resolve complaints within 30 days. If unsatisfied, you may contact the Office of the Australian Information Commissioner (OAIC) at <a href="https://www.oaic.gov.au">www.oaic.gov.au</a> or 1300 363 992.</p>

                <h3>19. Changes to This Policy</h3>
                <p>We may update this Policy periodically to reflect changes in our practices or legal obligations. Continued use after changes signifies acceptance.</p>

                <h3>20. Version History & Material Changes</h3>
                <p>Significant amendments to this Policy will be recorded in a version history and may require user re-consent where data usage materially changes.</p>

                <h3>21. Account Deletion Requests</h3>
                <p>Users may also request permanent account deletion by emailing admin@servicecue.com.au.
Upon receiving a valid request, the administrator will verify the account ownership and ensure that the account and associated personal data are permanently deleted from our systems within 24 hours (excluding weekends or public holidays).
A confirmation email will be sent once the deletion process is completed.</p>
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
