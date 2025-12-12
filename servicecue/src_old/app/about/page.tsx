export const metadata = {
  title: "About Us",
};

export default function AboutPage() {
  return (
    <>
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
              <h1 className="text-center fw-medium">Meet our founder</h1>

            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-5 res-margin"> <img src="images/SHAMARA_126.jpg" className="rounded-3" alt="" /> </div>
            <div className="col-12 col-lg-7">

              <div className="section-title pb-2 text-center text-lg-start">
              </div>
              <p> I’m not a software developer — I’m a beauty therapist of 16 years who got tired of the same challenges every clinic faces: </p>
              <ul className="overview-list">
                <li>
                  <p><i className="fa-li fas fa-check"></i>Clients losing their aftercare instruction</p>
                </li>
                <li>
                  <p><i className="fa-li fas fa-check"></i>7pm texts asking, “Is my skin supposed to look like this?” when it’s completely normal</p>
                </li>
                <li>
                  <p><i className="fa-li fas fa-check"></i>Pre/post-treatment advice for safety, compliance and the best possible results </p>
                </li>
                <li>
                  <p><i className="fa-li fas fa-check"></i>Clients forgetting which products to use and when </p>
                </li>
                <li>
                  <p><i className="fa-li fas fa-check"></i>“I’ll book soon…” —and then they don’t</p>
                </li>
              </ul>
              <p>Not because they don’t care — but because life gets busy. </p>
              <p>Behind every missed booking and forgotten routine, we’re the ones picking up the pieces, doing extra admin, emotional labour, and constant follow-ups just to keep clients on track. </p>
              <p><b>That’s why I built Service Cue™. </b></p>
              <p>To give clinics structure and clients support.
                To create a system that keeps people connected between visits, without losing the personal touch that makes our industry special. </p>
              <p>Because when clients feel supported, they stay compliant. When they stay consistent, they see results. And when they see results, everyone wins.</p>
              <p>My passion has always been exceptional client care and I truly believe our platform will support business owners and industry professionals to do just that.  </p>
              <p><b>— Shamara Jarrett</b></p>
              <p>Founder, Service Cue™ </p>
            </div>
          </div>


        </div>

      </section>
    </>
  );
}
