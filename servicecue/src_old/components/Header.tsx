"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header id="top-page" className="header">
      <div id="mainNav" className="main-menu-area animated">
        <div className="container">
          <div className="row align-items-center">

            {/* LEFT SIDE */}
            <div className="col-12 col-lg-3 d-flex justify-content-between align-items-center">

              <div className="logo">

                <Link href="/" className="navbar-brand navbar-brand1">
                  <img
                    src="/images/logo-white.png"     // ✔ correct path                  
                    alt="ServiceCue"
                  />
                </Link>

                <Link href="/" className="navbar-brand navbar-brand2">
                  <img
                    src="/images/sc-logo.png"      
                    alt="ServiceCue"
                  />
                </Link>

              </div>

              {/* MOBILE MENU BUTTON */}
              <div
                className="menu-bar d-lg-none cursor-pointer"
                onClick={() => setOpen(true)}
              >
                <span></span><span></span><span></span>
              </div>
            </div>

            {/* RIGHT SIDE MENU */}
            <div
              className={`op-mobile-menu col-lg-9 p-0 d-lg-flex align-items-center justify-content-end ${
                open ? "active" : ""
              }`}
            >
              <div className="m-menu-header d-flex justify-content-between align-items-center d-lg-none">
                <Link href="/" className="logo">
                  <img
                    src="/images/sc-logo.png"          // ✔ correct path
                    width={151}
                    height={50}
                    alt="ServiceCue"
                  />
                </Link>

                <span className="close-button cursor-pointer" onClick={() => setOpen(false)}></span>
              </div>

              <ul className="nav-menu d-lg-flex flex-wrap list-unstyled justify-content-center">
                <li className="nav-item"><Link href="/" onClick={() => setOpen(false)} className="nav-link js-scroll-trigger"><span>Home</span></Link></li>
                <li className="nav-item"><Link href="/about" onClick={() => setOpen(false)} className="nav-link js-scroll-trigger"><span>About</span></Link></li>
                <li className="nav-item"><Link href="/pricing" onClick={() => setOpen(false)} className="nav-link js-scroll-trigger"><span>Pricing</span></Link></li>
                <li className="nav-item"><Link href="/faqs" onClick={() => setOpen(false)} className="nav-link js-scroll-trigger"><span>FAQs</span></Link></li>
                <li className="nav-item"><Link href="/blog" onClick={() => setOpen(false)} className="nav-link js-scroll-trigger"><span>Blog</span></Link></li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
