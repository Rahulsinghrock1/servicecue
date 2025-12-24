"use client";

import React from "react";
import { useEffect,useState  } from "react";
import { usePathname,useRouter  } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "@context/UserContext";
import Script from "next/script";
import Head from "next/head";
import axios from "axios";

// Static CSS imports (to prevent FOUC)
import "@webassets/assets/css/bootstrap.min.css";
import "@webassets/assets/plugins/tabler-icons/tabler-icons.min.css";
import "@webassets/assets/plugins/simplebar/simplebar.min.css";
import "@webassets/assets/plugins/fontawesome/css/fontawesome.min.css";
import "@webassets/assets/plugins/fontawesome/css/all.min.css";
import "@webassets/assets/css/style.css";
import "@webassets/assets/plugins/select2/css/select2.min.css";
import "@webassets/assets/plugins/daterangepicker/daterangepicker.css";

// Web layout components
import WebHeader from "@webcomponents/WebHeader";
import WebFooter from "@webcomponents/WebFooter";
import AdminHeader from "@admincomponents/AdminHeader";
import AdminSidebar from "@admincomponents/AdminSidebar";
import ClinicSidebar from "@admincomponents/ClinicSidebar";
import ClinicHeader from "@admincomponents/ClinicHeader";
import AdminFooter from "@admincomponents/AdminFooter";
import MainConfig from "@/mainconfig";
import AuthGuard from "@/components/AuthGuard";

const API_BASE_URL = MainConfig.API_BASE_URL;

const rootVariables = `
  :root {
    /* Layout */
    --sidenav-width: 276px;
    --sidenav-width-sm: 70px;
    --topbar-height: 55px;
    --box-shadow: 0px 0px 35px 0px rgba(104, 134, 177, 0.15);
    --box-shadow-sm: 0px 1px 1px 0px rgba(0, 0, 0, 0.05);
    --box-shadow-lg: 0 0 45px 0 rgba(108, 118, 136, 0.2);

    /* Base Colors */
    --white: #fff;
    --black: #000;
    --light: #F5F6F8;
    --dark: #0B0D0E;
    --gray-100: #CED1D7;
    --gray-200: #B6BBC4;
    --gray-300: #9DA4B0;
    --gray-400: #858D9C;
    --gray-500: #6C7688;
    --gray-600: #545F74;
    --gray-700: #3B4961;
    --gray-800: #23324D;
    --gray-900: #0A1B39;
    --gray-hover: #091833;

    /* Semantic Colors */
    --primary: #2E37A4;
    --secondary: #00D3C7;
    --success: #27AE60;
    --info: #2F80ED;
    --danger: #EF1E1E;
    --warning: #E2B93B;
    --indigo: #3538CD;
    --orange: #E04F16;
    --pink: #DD2590;
    --purple: #800080;
    --teal: #0E9384;
    --cyan: #00D3C7;

    /* Hover States */
    --primary-hover: #3C449C;
    --secondary-hover: #17C2B9;
    --success-hover: #37A465;
    --info-hover: #3D7FD7;
    --danger-hover: #D93030;
    --warning-hover: #CEAD47;
    --indigo-hover: #3C49BF;
    --orange-hover: #CF5A32;
    --pink-hover: #E4479B;
    --purple-hover: #7F177F;
    --teal-hover: #358E82;
    --cyan-hover: #39A4C3;
    --dark-hover: #080A0B;

    /* Transparent Variants */
    --primary-transparent: #ECEDF7;
    --secondary-transparent: #E8FBFA;
    --success-transparent: #F4FBF7;
    --info-transparent: #F4F9FE;
    --danger-transparent: #FEF4F4;
    --warning-transparent: #FEFBF5;
    --indigo-transparent: #EDEDFB;
    --orange-transparent: #FDF6F3;
    --pink-transparent: #FDF4F9;
    --purple-transparent: #F9F2F9;
    --teal-transparent: #E9F5F4;
    --cyan-transparent: #E9F8FB;
    --gray-transparent: #E7E8EB;
    --dark-transparent: #E7E8EB;
    --light-transparent: #FEFEFE;

    /* Extra Light Shades */
    --light-100: #FDFDFE;
    --light-200: #FCFDFD;
    --light-300: #FBFCFD;
    --light-400: #FBFBFC;
    --light-500: #FAFAFB;
    --light-600: #F9F9FB;
    --light-700: #F8F9FA;
    --light-800: #F7F8FA;
    --light-900: #F6F7F9;
    --light-hover: #F6F7F9;

    /* Text & Border */
    --heading-color: #0A1B39;
    --body-color: var(--gray-800);
    --border-color: #E7E8EB;

    /* RGB values */
    --primary-rgb: 46, 55, 164;
    --secondary-rgb: 0, 211, 199;
    --success-rgb: 39, 174, 96;
    --info-rgb: 47, 128, 237;
    --danger-rgb: 239, 30, 30;
    --warning-rgb: 253, 175, 34;
    --indigo-rgb: 53, 56, 205;
    --orange-rgb: 224, 79, 22;
    --pink-rgb: 221, 37, 144;
    --purple-rgb: 128, 0, 128;
    --teal-rgb: 14, 147, 132;
    --cyan-rgb: 0, 211, 199;
    --light-rgb: 245, 246, 248;
    --dark-rgb: 11, 13, 14;
    --white-rgb: 255, 255, 255;
    --body-color-rgb: 107, 114, 128;

    /* Topbar & Menu */
    --topbar-bg: #fff;
    --topbar-item-border: var(--border-color);
    --topbar-item-color: var(--gray-900);
    --topbar-item-hover-color: #BD2754;

    --menu-title-color: var(--gray-400);
    --menu-item-heading: var(--gray-900);
    --menu-item-color: var(--gray-500);
    --menu-item-border: var(--border-color);
    --menu-item-hover-color: var(--primary);
    --menu-item-active-color: var(--primary);

    --menu-active-color: var(--primary);
    --menu-active-bg: var(--primary-transparent);

    --menu-bg: var(--white);
    --menu-light-bg: var(--light);
  }

  :root[data-sidebar=sidebar2], :root[data-sidebar=sidebar2][data-theme=dark] {
  --menu-bg: #F5F6F8;
  --menu-item-color: #23324D;
  --menu-item-heading: #0A1B39;
  --menu-item-hover-color: var(--primary);
  --menu-item-hover-bg: rgba(var(--secondary-rgb), 0.1);
  --menu-item-active-color: var(--primary);
  --menu-item-active-bg: rgba(var(--secondary-rgb), 0.1);
  --menu-active-color: var(--primary);
  --menu-active-bg: var(--primary-transparent);
  --menu-title-color: #0A1B39;
  --menu-item-border: #E7E8EB;
  --menu-light-bg: #fff;
}

:root[data-sidebar=sidebar3] {
  --menu-bg: #0B0D0E;
  --menu-item-color: #fff;
  --menu-item-border: rgba(255, 255, 255, 0.1);
  --menu-item-hover-color: var(--primary);
  --menu-item-active-color: var(--primary);
  --submenu-active-color: #fff;
  --menu-item-active-bg: var(--primary);
  --menu-active-color: var(--primary);
  --submenu-active-color: var(--primary);
  --menu-item-heading: #fff;
}

:root[data-sidebar=sidebar4] {
  --menu-bg: var(--primary);
  --menu-item-color: #CBD5E1;
  --menu-item-hover-color: #E5E7EB;
  --menu-item-border: $body-color;
  --menu-item-active-color: #E5E7EB;
  --menu-item-active-bg: #fff;
  --menu-active-color: #fff;
  --submenu-active-color: #fff;
  --menu-subdrop-active: #0F172A;
  --menu-title-color: #fff;
  --menu-item-heading: #fff;
  --menu-light-bg: #fff;
}

:root[data-sidebar=sidebar5] {
  --menu-bg: var(--secondary);
  --menu-item-color: #6C7688;
  --menu-item-hover-color: var(--primary);
  --menu-item-border: rgba(255, 255, 255, 0.1);
  --menu-item-active-color: var(--primary);
  --menu-item-active-bg: #fff;
  --menu-active-color: #fff;
  --submenu-active-color: #fff;
  --menu-subdrop-active: #0F172A;
  --menu-title-color: #0F172A;
  --menu-item-heading: #0F172A;
  --menu-light-bg: #fff;
}

:root[data-sidebar=sidebar6] {
  --menu-bg: var(--info);
  --menu-item-color: #E5E7EB;
  --menu-item-hover-color: #fff;
  --menu-item-border: rgba(255, 255, 255, 0.1);
  --menu-item-active-color: #E5E7EB;
  --menu-item-active-bg: #fff;
  --menu-active-color: #fff;
  --submenu-active-color: #fff;
  --menu-subdrop-active: #0F172A;
  --menu-title-color: #fff;
  --menu-item-heading: #fff;
  --menu-light-bg: #fff;
}

:root[data-sidebar=sidebar7] {
  --menu-bg: var(--indigo);
  --menu-item-color: #E5E7EB;
  --menu-item-hover-color: #fff;
  --menu-item-border: rgba(255, 255, 255, 0.1);
  --menu-item-active-color: #E5E7EB;
  --menu-item-active-bg: #fff;
  --menu-active-color: #fff;
  --submenu-active-color: #fff;
  --menu-subdrop-active: #0F172A;
  --menu-title-color: #fff;
  --menu-item-heading: #fff;
  --menu-light-bg: #fff;
}

:root[data-sidebar=gradientsidebar1] {
  --menu-bg: linear-gradient(180deg, #7A7DF9 0%, #3538CD 100%);
  --menu-item-color: #E5E7EB;
  --menu-item-hover-color: #fff;
  --menu-item-active-color: #E5E7EB;
  --menu-item-active-bg: #fff;
  --menu-active-color: #fff;
  --submenu-active-color: #fff;
  --menu-subdrop-active: #0F172A;
  --menu-title-color: #fff;
  --menu-item-heading: #fff;
  --menu-item-border: rgba(255, 255, 255, 0.1);
  --menu-light-bg: #fff;
}

:root[data-sidebar=gradientsidebar2] {
  --menu-bg: linear-gradient(180deg, #4E59DB 0%, #0C1367 100%);
  --menu-item-color: #E5E7EB;
  --menu-item-hover-color: #fff;
  --menu-item-active-color: #E5E7EB;
  --menu-item-active-bg: #fff;
  --menu-active-color: #fff;
  --submenu-active-color: #fff;
  --menu-subdrop-active: #0F172A;
  --menu-title-color: #fff;
  --menu-item-heading: #fff;
  --menu-item-border: rgba(255, 255, 255, 0.1);
  --menu-light-bg: #fff;
}

:root[data-sidebar=gradientsidebar3] {
  --menu-bg: linear-gradient(90deg, #2EF4E9 0%, #01ADA3 100%);
  --menu-item-color: #E5E7EB;
  --menu-item-hover-color: #fff;
  --menu-item-active-color: #E5E7EB;
  --menu-item-active-bg: #fff;
  --menu-active-color: #fff;
  --submenu-active-color: #fff;
  --menu-subdrop-active: #0F172A;
  --menu-title-color: #fff;
  --menu-item-heading: #fff;
  --menu-item-border: rgba(255, 255, 255, 0.1);
  --menu-light-bg: #fff;
}

:root[data-sidebar=gradientsidebar4] {
  --menu-bg: linear-gradient(90deg, #484545 0%, #030303 100%);
  --menu-item-color: #E5E7EB;
  --menu-item-hover-color: #fff;
  --menu-item-active-color: #E5E7EB;
  --menu-item-active-bg: #fff;
  --menu-active-color: #fff;
  --submenu-active-color: #fff;
  --menu-subdrop-active: #0F172A;
  --menu-title-color: #fff;
  --menu-item-heading: #fff;
  --menu-item-border: rgba(255, 255, 255, 0.1);
  --menu-light-bg: #fff;
}

:root[data-sidebar=gradientsidebar5] {
  --menu-bg: linear-gradient(90deg, #B319B3 0%, #530953 100%);
  --menu-item-color: #E5E7EB;
  --menu-item-hover-color: #fff;
  --menu-item-active-color: #E5E7EB;
  --menu-item-active-bg: #fff;
  --menu-active-color: #fff;
  --submenu-active-color: #fff;
  --menu-subdrop-active: #0F172A;
  --menu-title-color: #fff;
  --menu-item-heading: #fff;
  --menu-item-border: rgba(255, 255, 255, 0.1);
  --menu-light-bg: #fff;
}

:root[data-sidebar=gradientsidebar6] {
  --menu-bg: linear-gradient(90deg, #F46730 0%, #B73704 100%);
  --menu-item-color: #E5E7EB;
  --menu-item-hover-color: #fff;
  --menu-item-active-color: #E5E7EB;
  --menu-item-active-bg: #fff;
  --menu-active-color: #fff;
  --submenu-active-color: #fff;
  --menu-subdrop-active: #0F172A;
  --menu-title-color: #fff;
  --menu-item-heading: #fff;
  --menu-item-border: rgba(255, 255, 255, 0.1);
  --menu-light-bg: #fff;
}

:root[data-sidebar=gradientsidebar7] {
  --menu-bg: linear-gradient(90deg, #64A5FD 0%, #004DB4 100%);
  --menu-item-color: #E5E7EB;
  --menu-item-hover-color: #fff;
  --menu-item-active-color: #E5E7EB;
  --menu-item-active-bg: #fff;
  --menu-active-color: #fff;
  --submenu-active-color: #fff;
  --menu-subdrop-active: #0F172A;
  --menu-title-color: #fff;
  --menu-item-heading: #fff;
  --menu-item-border: rgba(255, 255, 255, 0.1);
  --menu-light-bg: #fff;
}

:root[data-bs-theme=dark][data-topbar=white] {
  --topbar-bg: #03041A;
  --topbar-item-color: #dbe0e6;
  --topbar-item-hover-color: #bccee4;
  --topbar-item-border: #10122C;
  --topbar-btn-color: #fff;
}

:root[data-topbar=white] {
  --topbar-bg: var(--white);
  --topbar-item-color: var(--gray-700);
  --topbar-item-hover-color: var(--primary);
  --topbar-btn-color: var(--light);
}

:root[data-topbar=topbar1]:root[data-bs-theme=dark] {
  --topbar-bg: #F5F6F8;
  --topbar-item-color: #3B4961;
  --topbar-item-hover-color: var(--primary);
  --topbar-btn-color: var(--white);
  --topbar-item-border: #E7E8EB;
}

:root[data-topbar=topbar2] {
  --topbar-bg: #0B0D0E;
  --topbar-item-color: #dbe0e6;
  --topbar-item-hover-color: #bccee4;
  --topbar-item-border: #282b58;
  --topbar-btn-color: #06081F;
}

:root[data-topbar=topbar3] {
  --topbar-bg: var(--primary);
  --topbar-item-color: #fff;
  --topbar-item-hover-color: var(--light);
  --topbar-item-border: rgba(255, 255, 255, 0.1);
  --topbar-btn-color: #E7E8EB;
}

:root[data-topbar=topbar4] {
  --topbar-bg: var(--secondary);
  --topbar-item-color: #fff;
  --topbar-item-hover-color: var(--gray-900);
  --topbar-item-border: rgba(255, 255, 255, 0.6);
  --topbar-btn-color: #E7E8EB;
}

:root[data-topbar=topbar5] {
  --topbar-bg: var(--info);
  --topbar-item-color: #fff;
  --topbar-item-hover-color: var(--gray-900);
  --topbar-item-border: rgba(255, 255, 255, 0.1);
  --topbar-btn-color: #E7E8EB;
}

:root[data-topbar=topbar6] {
  --topbar-bg: var(--indigo);
  --topbar-item-color: #fff;
  --topbar-item-hover-color: var(--gray-900);
  --topbar-item-border: rgba(255, 255, 255, 0.1);
  --topbar-btn-color: #E7E8EB;
}

:root[data-topbar=gradienttopbar1] {
  --topbar-bg: linear-gradient(180deg, #7A7DF9 0%, #3538CD 100%);
  --topbar-item-color: #fff;
  --topbar-item-hover-color: var(--gray-900);
  --topbar-item-border: rgba(255, 255, 255, 0.1);
  --topbar-btn-color: #E7E8EB;
}

:root[data-topbar=gradienttopbar2] {
  --topbar-bg: linear-gradient(180deg, #4E59DB 0%, #0C1367 100%);
  --topbar-item-color: #fff;
  --topbar-item-hover-color: var(--gray-900);
  --topbar-item-border: rgba(255, 255, 255, 0.1);
  --topbar-btn-color: #E7E8EB;
}

:root[data-topbar=gradienttopbar3] {
  --topbar-bg: linear-gradient(90deg, #2EF4E9 0%, #01ADA3 100%);
  --topbar-item-color: #fff;
  --topbar-item-hover-color: var(--gray-900);
  --topbar-item-border: rgba(255, 255, 255, 0.1);
  --topbar-btn-color: #E7E8EB;
}

:root[data-topbar=gradienttopbar4] {
  --topbar-bg: linear-gradient(90deg, #484545 0%, #030303 100%);
  --topbar-item-color: #fff;
  --topbar-item-hover-color: var(--gray-900);
  --topbar-item-border: rgba(255, 255, 255, 0.1);
  --topbar-btn-color: #E7E8EB;
}

:root[data-topbar=gradienttopbar5] {
  --topbar-bg: linear-gradient(90deg, #B319B3 0%, #530953 100%);
  --topbar-item-color: #fff;
  --topbar-item-hover-color: var(--gray-900);
  --topbar-item-border: rgba(255, 255, 255, 0.1);
  --topbar-btn-color: #E7E8EB;
}

:root[data-topbar=gradienttopbar6] {
  --topbar-bg: linear-gradient(90deg, #F46730 0%, #B73704 100%);
  --topbar-item-color: #fff;
  --topbar-item-hover-color: var(--gray-900);
  --topbar-item-border: rgba(255, 255, 255, 0.1);
  --topbar-btn-color: #E7E8EB;
}

:root[data-topbar=gradienttopbar7] {
  --topbar-bg: linear-gradient(90deg, #64A5FD 0%, #004DB4 100%);
  --topbar-item-color: #fff;
  --topbar-item-hover-color: var(--gray-900);
  --topbar-item-border: rgba(255, 255, 255, 0.1);
  --topbar-btn-color: #E7E8EB;
}
`;

// Landing Page Layout
function LandingPageLayout({ children }) {
    useEffect(() => {
    import("@website-assets/library/bootstrap/css/bootstrap.min.css");
    import("@website-assets/library/fontawesome/css/all.min.css"); 
    import("@website-assets/library/linea/basic/styles.css");
    import("@website-assets/css/style.css");
    import("@website-assets/css/media.css");
    import("@website-assets/colors/red.css");
  }, []);
  return (
    <>
      <WebHeader />
      {children}
      <WebFooter />
    </>
  );
}

// Default Layout
function DefaultLayout({ children }) {
  return (
    <>
      <style>{rootVariables}</style>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Host+Grotesk:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <WebHeader />
      {children}
      <WebFooter />
      <Script src="/web/assets/js/jquery-3.7.1.min.js" strategy="afterInteractive" />
      <Script src="/web/assets/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/web/assets/js/script.js" strategy="afterInteractive" />
   
    </>
  );
}

// Admin Layout
function AdminLayout({ children }) {
  return (
    <>
      <style>{rootVariables}</style>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Host+Grotesk:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="main-wrapper" id="adminsidebar-info">
        <AdminHeader />
        <AdminSidebar />
        <div className="page-wrapper">
          <div className="content">
            <main >{children}</main>
          </div>
          <AdminFooter />
        </div>
      </div>

      {/* JS Scripts */}
      <Script src="/web/assets/js/jquery-3.7.1.min.js" strategy="afterInteractive" />
      <Script src="/web/assets/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/web/assets/js/script.js" strategy="afterInteractive" />
      <Script src="/web/assets/plugins/simplebar/simplebar.min.js" strategy="afterInteractive" />
      <Script src="/web/assets/plugins/select2/js/select2.min.js" strategy="afterInteractive" />
      <Script src="/web/assets/js/moment.min.js" strategy="afterInteractive" />
      <Script src="/web/assets/plugins/daterangepicker/daterangepicker.js" strategy="afterInteractive" />
      <Script src="/web/assets/js/bootstrap-datetimepicker.min.js" strategy="afterInteractive" />
    </>
  );
}


function ClinicLayout({ children }) {
  return (
    <>
      <style>{rootVariables}</style>
      <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet"/>
      </Head>
      <div className="main-wrapper">
        <ClinicHeader />
        <ClinicSidebar />
        <div className="page-wrapper">
          <div className="content">
            {children}
          </div>
          <AdminFooter />
        </div>
      </div>

      {/* JS Scripts */}
      <Script src="/web/assets/js/jquery-3.7.1.min.js" strategy="afterInteractive" />
      <Script src="/web/assets/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/web/assets/js/script.js" strategy="afterInteractive" />
      <Script src="/web/assets/plugins/simplebar/simplebar.min.js" strategy="afterInteractive" />
      <Script src="/web/assets/plugins/select2/js/select2.min.js" strategy="afterInteractive" />
      <Script src="/web/assets/js/moment.min.js" strategy="afterInteractive" />
      <Script src="/web/assets/plugins/daterangepicker/daterangepicker.js" strategy="afterInteractive" />
      <Script src="/web/assets/js/bootstrap-datetimepicker.min.js" strategy="afterInteractive" />
     
    </>
  );
}

export default function RootLayout({ children }) {
  const pathname = usePathname();

  let Layout;
  if (pathname === "/" || pathname === "/book-a-demo" || pathname === "/success"|| pathname === "/successpage") {
    Layout = LandingPageLayout;
  } else if (pathname.startsWith("/admin")) {
    Layout = AdminLayout;
  } else if (pathname.startsWith("/clinic")) {
    Layout = ClinicLayout;
  } else {
    Layout = DefaultLayout;
  }

  return (
    <html lang="en">
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#000000cf",
              color: "#ffffff",
              fontSize: "15px",
              borderRadius: "5px",
            },
          }}
        />
        <UserProvider>
          <AuthGuard>
            <Layout>{children}</Layout>
          </AuthGuard>
        </UserProvider>
      </body>
    </html>
  );
}