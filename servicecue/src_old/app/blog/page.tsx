export const metadata = {
  title: "Blog",
};

export default function BlogPage() {
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
        <h1 className="text-center fw-medium"></h1>
        
      </div>
    </div>
  </div>
</section>
<section className="blog">
	<div className="container">				
		<div className="row">
			<div className="col-12 col-lg-8 res-margin">
				<article className="row blog-post">
					<div className="col-12">
						<header>
							<h3>
								<a href="/treatment-planning" style={{textDecoration:"none !important"}}>Treatment Planning — The Secret to Consistent Client Results </a>
							</h3>
							<div className="info">
								<span>Adminm,</span>
								<span>November 11, 2025</span>
							</div>
						</header>
						<img src="images/blog-lg-1.jpg" className="img-responsive img-rounded" alt="Image" />
						<p className="mt-4">
							Why Treatment Planning Is the Key to Predictable Results in Your Skin Clinic 
                        </p><p>
                              When a client walks into your clinic, they’re not just buying a single treatment, they’re investing in a transformation. Whether it’s clearer skin, reduced pigmentation, or softening fine lines, every result starts with one thing: 
						</p>
						<div className="post-footer clearfix">
							<ul className="post-meta">
								<li className="post-read-more">
									<a href="/treatment-planning" style={{textDecoration:"none !important"}} className="btn btn-default">Read More</a>
								</li>
								
							</ul>
						</div>
					</div>
				</article>
				<article className="row blog-post">
					<div className="col-12">
						<header>
							<h3>
								<a href="/why-client-care-must-come-first" style={{textDecoration:"none !important"}}>Why Client Care Must Come First — If You Want Retention That Lasts</a>
							</h3>
							<div className="info">
								<span>Admin,</span>
								<span> November 11, 2025</span>
							</div>
						</header>
						<img src="images/blog-lg-2.jpg" className="img-responsive img-rounded" alt="Image" />
						<p className="mt-4">
							The Hard Truth About Retention 
							</p><p>
							Every clinic wants loyal clients the ones who rebook before leaving, follow their plans, and rave about their results. But loyalty isn’t built through promotions, flash sales, or “10% off next time” offers.  
						</p>
						<div className="post-footer clearfix">
							<ul className="post-meta">
								<li className="post-read-more">
									<a href="/why-client-care-must-come-first" style={{textDecoration:"none !important"}} className="btn btn-default">Read More</a>
								</li>
								
							</ul>
						</div>
					</div>
				</article>
				
				
				
			</div>
			<div className="sidebar-wrapper col-12 col-lg-4">
				<div className="row sidebar">
					<div className="col-12">
						<header>
							<h4>Recent Posts</h4>
						</header>
						<div className="recent-post">
							<div className="recent-post-image" data-count="1">
								<a href="/treatment-planning" style={{textDecoration:"none !important"}}>
									<img src="images/blog-lg-1.jpg" alt="" />
								</a>
							</div>
							<div className="recent-post-info">
								<h6>
									<a href="/treatment-planning" style={{textDecoration:"none !important"}}>Treatment Planning — The Secret to Consistent Client Results</a>
								</h6>
								<p>November 11, 2025</p>
							</div>
						</div>
						<div className="recent-post">
							<div className="recent-post-image" data-count="2">
								<a href="/why-client-care-must-come-first" style={{textDecoration:"none !important"}}>
									<img src="images/blog-lg-2.jpg" alt="" />
								</a>
							</div>
							<div className="recent-post-info">
								<h6>
									<a href="/why-client-care-must-come-first" style={{textDecoration:"none !important"}}>Why Client Care Must Come First — If You Want Retention That Lasts </a>
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
