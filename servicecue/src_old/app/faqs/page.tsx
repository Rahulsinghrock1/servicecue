export const metadata = {
  title: "FAQ",
};

export default function FaqPage() {
  return (
    <>
      {/* PAGE BANNER */}
      <section
        className="page-title valign parallax"
        data-image="/assets/images/banner-bg.jpg"
        style={{
          backgroundPosition: "50% 0px",
          backgroundImage: 'url("/assets/images/banner-bg.jpg")',
        }}
      >
        <div className="container">
          <div className="row">
            <div className="col-12 text-left">
              <h1 className="text-center fw-medium">
                Have questions? Great — let us help you
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="support">
        <div className="container">

          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-6">
              <div className="section-title text-center">
                <h3>Frequently Asked Questions</h3>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12 col-lg-10 offset-lg-1">

              <div id="accordion" className="accordion" role="tablist">

                {/* FAQ ITEM 1 */}
                <div className="accordion-item">
                  <div className="accordion-header" id="heading-1">
                    <h5>
                      <a
                        className="accordion-button"
                        href="#collapse-1"
                        role="button"
                        aria-expanded="true"
                        data-bs-toggle="collapse"
                        aria-controls="collapse-1"
                        style={{textDecoration:"none !important"}}
                      >
                        Is the Client App really free?
                      </a>
                    </h5>
                  </div>
                  <div
                    id="collapse-1"
                    className="accordion-collapse collapse show"
                    aria-labelledby="heading-1"
                    data-bs-parent="#accordion"
                  >
                    <div className="accordion-body">
                      <p>Yes — always.</p>
                    </div>
                  </div>
                </div>

                {/* FAQ ITEM 2 */}
                <div className="accordion-item">
                  <div className="accordion-header" id="heading-2">
                    <h5>
                      <a
                        className="accordion-button collapsed"
                        href="#collapse-2"
                        role="button"
                        aria-expanded="false"
                        data-bs-toggle="collapse"
                        aria-controls="collapse-2"
                        style={{textDecoration:"none !important"}}
                      >
                        How are subscriptions charged?
                      </a>
                    </h5>
                  </div>
                  <div
                    id="collapse-2"
                    className="accordion-collapse collapse"
                    aria-labelledby="heading-2"
                    data-bs-parent="#accordion"
                  >
                    <div className="accordion-body">
                      <p>Subscriptions are charged monthly. Cancel anytime.</p>
                    </div>
                  </div>
                </div>

                {/* FAQ ITEM 3 */}
                <div className="accordion-item">
                  <div className="accordion-header" id="heading-5">
                    <h5>
                      <a
                        className="accordion-button collapsed"
                        href="#collapse-5"
                        role="button"
                        aria-expanded="false"
                        data-bs-toggle="collapse"
                        aria-controls="collapse-5"
                        style={{textDecoration:"none !important"}}
                      >
                        How do I sign up?
                      </a>
                    </h5>
                  </div>
                  <div
                    id="collapse-5"
                    className="accordion-collapse collapse"
                    aria-labelledby="heading-5"
                    data-bs-parent="#accordion"
                  >
                    <div className="accordion-body">
                      <p>
                        Go to{" "}
                        <a
                          href="https://servicecue.com.au/register"
                          target="_blank"
                          style={{textDecoration:"none !important"}}
                        >
                          https://servicecue.com.au/register
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ ITEM 4 */}
                <div className="accordion-item">
                  <div className="accordion-header" id="heading-6">
                    <h5>
                      <a
                        className="accordion-button collapsed"
                        href="#collapse-6"
                        role="button"
                        aria-expanded="false"
                        data-bs-toggle="collapse"
                        aria-controls="collapse-6"
                        style={{textDecoration:"none !important"}}
                      >
                        Do I have to get anything ready?
                      </a>
                    </h5>
                  </div>
                  <div
                    id="collapse-6"
                    className="accordion-collapse collapse"
                    aria-labelledby="heading-6"
                    data-bs-parent="#accordion"
                  >
                    <div className="accordion-body">
                      <p>
                        Yes, we want your clinic to shine on the platform.
                        Please see the onboarding checklist here.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ ITEM 5 */}
                <div className="accordion-item">
                  <div className="accordion-header" id="heading-7">
                    <h5>
                      <a
                        className="accordion-button collapsed"
                        href="#collapse-7"
                        role="button"
                        aria-expanded="false"
                        data-bs-toggle="collapse"
                        aria-controls="collapse-7"
                        style={{textDecoration:"none !important"}}
                      >
                        What is the cost?
                      </a>
                    </h5>
                  </div>
                  <div
                    id="collapse-7"
                    className="accordion-collapse collapse"
                    aria-labelledby="heading-7"
                    data-bs-parent="#accordion"
                  >
                    <div className="accordion-body">
                      <p>
                        We have 3 subscription levels:
                        <br />- Solo operators: $39/month  
                        <br />- Medium clinics (up to 5 staff): $99/month  
                        <br />- Large clinics: $249/month
                      </p>
                    </div>
                  </div>
                </div>

                {/* TRIMMED FOR LENGTH → The rest is same pattern */}

                {/* CTA BUTTONS */}
                <div className="empty-30"></div>

                <div className="row">
                  <div className="text-center">
                    <a href="https://links.servicecue.com/widget/booking/qubwm8AJ5MfgZ6D037Vr" style={{textDecoration:"none !important"}} className="btn">BOOK A LIVE DEMO</a> <a href="https://servicecue.com.au/register" style={{textDecoration:"none !important"}} className="btn">IM READY, SIGN ME UP</a>
                </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
