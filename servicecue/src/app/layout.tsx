import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/styles/globals.css";
import Script from "next/script";

// library css (from public folder)

import "../../public/assets/library/bootstrap/css/bootstrap.min.css";
import "../../public/assets/library/fontawesome/css/all.min.css";
import "../../public/assets/library/linea/arrows/styles.css";
import "../../public/assets/library/linea/basic/styles.css";
import "../../public/assets/library/linea/ecommerce/styles.css";
import "../../public/assets/library/linea/software/styles.css";
import "../../public/assets/library/linea/weather/styles.css";
import "../../public/assets/library/animate/animate.css";
import "../../public/assets/library/lightcase/css/lightcase.css";
import "../../public/assets/library/swiper/swiper-bundle.min.css";
import "../../public/assets/library/owlcarousel/owl.carousel.min.css";
import "../../public/assets/library/slick/slick.css";
import "../../public/assets/library/magnificpopup/magnific-popup.css";
import "../../public/assets/library/ytplayer/css/jquery.mb.ytplayer.min.css";
import "../../public/assets/colors/red.css";
import "../../public/assets/css/media.css";
import "../../public/assets/css/style.css";

export const metadata: Metadata = {
  title: {
    default: "ServiceCue",
    template: "%s | ServiceCue",
  },
  description:
    "ServiceCue: 3 Connected Platforms, 1 Monthly Subscription. Built for salons, clinics, and professionals.",
  openGraph: {
    title: "ServiceCue",
    description:
      "3 Connected Platforms for clinics, therapists, and clients.",
    url: "https://servicecue.com",
    siteName: "ServiceCue",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@ServiceCue",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
        {/* scripts */}
        <Script src="/assets/library/jquery/jquery.js" strategy="beforeInteractive" />
        <Script src="/assets/library/bootstrap/js/bootstrap.min.js" strategy="afterInteractive" />
        <Script src="/assets/library/retina/retina.min.js" strategy="afterInteractive" />
        <Script src="/assets/library/backstretch/jquery.backstretch.min.js" strategy="afterInteractive" />
        <Script src="/assets/library/swiper/swiper-bundle.min.js" strategy="afterInteractive" />
        <Script src="/assets/library/owlcarousel/owl.carousel.min.js" strategy="afterInteractive" />
        <Script src="/assets/library/slick/slick.js" strategy="afterInteractive" />
        <Script src="/assets/library/waypoints/jquery.waypoints.min.js" strategy="afterInteractive" />
        <Script src="/assets/library/isotope/isotope.pkgd.min.js" strategy="afterInteractive" />
        <Script src="/assets/library/waitforimages/jquery.waitforimages.min.js" strategy="afterInteractive" />
        <Script src="/assets/library/lightcase/js/lightcase.js" strategy="afterInteractive" />
        <Script src="/assets/library/wow/wow.min.js" strategy="afterInteractive" />
        <Script src="/assets/library/parallax/jquery.parallax.min.js" strategy="afterInteractive" />
        <Script src="/assets/library/counterup/jquery.counterup.min.js" strategy="afterInteractive" />
        <Script src="/assets/library/magnificpopup/jquery.magnific-popup.min.js" strategy="afterInteractive" />
        <Script src="/assets/library/ytplayer/jquery.mb.ytplayer.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/main.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
