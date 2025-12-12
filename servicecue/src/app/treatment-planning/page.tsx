export const metadata = {
  title: "Treatment Planning — Service Cue",
};

export default function TreatmentPlanningPage() {
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
              <h1 className="text-center fw-medium pricing-media">
                Treatment Planning — The Secret to Consistent Client Results
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG SECTION */}
      <section className="blog">
        <div className="container">
          <div className="row">

            {/* LEFT CONTENT */}
            <div className="col-12 col-lg-8 res-margin">
              <article className="row blog-post">
                <div className="col-12">

                  <h3>
                    <a href="/treatment-planning">
                      Treatment Planning — The Secret to Consistent Client Results
                    </a>
                  </h3>

                  <div className="info mb-3">
                    <span>Admin, </span>
                    <span>November 11, 2025</span>
                  </div>

                  <img
                    src="/images/blog-lg-1.jpg"
                    className="img-responsive img-rounded mb-3"
                    alt="Treatment Planning"
                  />

                  <p>
                    <b>
                      Why Treatment Planning Is the Key to Predictable Results in Your Skin Clinic
                    </b>
                  </p>

                  <p>
                    When a client walks into your clinic, they're not just buying a
                    single treatment — they’re investing in a transformation. Whether
                    it's clearer skin, reduced pigmentation, or softening fine lines,
                    every result starts with one thing: a plan.
                  </p>

                  <p>
                    But here’s the truth — most clinics don’t have a clear, structured way
                    to show clients how they’ll reach those results. Without a roadmap,
                    clients lose motivation. Treatment planning fixes that.
                  </p>

                  <p><b>Structure Creates Confidence</b></p>

                  <p>
                    A treatment plan is like your clinic’s GPS — it keeps clients aligned,
                    confident, and consistent. It reduces guesswork and builds trust.
                  </p>

                  <p><b>Digital vs. Paper Plans</b></p>

                  <p>
                    Paper plans get lost. Digital treatment plans (like Service Cue)
                    are accessible 24/7 — showing routines, goals, milestones, and results.
                  </p>

                  <p><b>Tracking Results Improves Retention</b></p>

                  <p>
                    The #1 reason clients stop treatments isn’t dissatisfaction — it's
                    disconnection. Before-and-after photos and progress tracking change everything.
                  </p>

                  <p><b>Accountability = Better Outcomes</b></p>

                  <p>
                    Treatment planning keeps clients accountable between visits with reminders,
                    aftercare, and product usage alerts.
                  </p>

                  <p><b>Why Treatment Planning Is Good Business</b></p>

                  <p>
                    Structured digital planning gives you measurable data, not assumptions.
                  </p>

                  <ul>
                    <li>Treatment plan completion rates</li>
                    <li>Product compliance</li>
                    <li>Client retention</li>
                    <li>Staff performance</li>
                  </ul>

                  <p><b>Clients Want Clarity — Give It to Them</b></p>

                  <p>
                    A clear digital plan shows clients you understand them — and builds loyalty.
                  </p>

                  <p><b>How to Get Started with Digital Treatment Planning</b></p>

                  <p>
                    A system like Service Cue connects the whole journey — planning, tracking,
                    aftercare, reminders — all in one place.
                  </p>

                  <ul>
                    <li>Create and send treatment plans</li>
                    <li>Upload before-after photos</li>
                    <li>Set product reminders</li>
                    <li>Track compliance</li>
                    <li>Keep clients engaged</li>
                  </ul>

                  <p>
                    Treatment planning is the foundation of a results-driven clinic.
                    It builds consistency, trust, and retention.
                  </p>

                  <p><b>Ready to get started?</b></p>

                  <p>
                    <a href="https://servicecue.com.au/register" target="_blank">
                      👉 Book a free Service Cue demo
                    </a>
                  </p>

                </div>
              </article>

              <hr />
            </div>

            {/* SIDEBAR */}
            <div className="sidebar-wrapper col-12 col-lg-4">
              <div className="row sidebar">
                <div className="col-12">

                  <header>
                    <h4>Recent Posts</h4>
                  </header>

                  <div className="recent-post">
                    <div className="recent-post-image" data-count="2">
                      <a href="/why-client-care-must-come-first">
                        <img src="/images/blog-lg-2.jpg" alt="Client Care" />
                      </a>
                    </div>

                    <div className="recent-post-info">
                      <h6>
                        <a href="/why-client-care-must-come-first">
                          Why Client Care Must Come First — For Retention That Lasts
                        </a>
                      </h6>
                      <p>November 11, 2025</p>
                    </div>
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
