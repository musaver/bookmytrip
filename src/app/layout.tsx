import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import "../../public/css/animate.css";
import "../../public/css/bootstrap.min.css";
import "../../public/css/meanmenu.css";
import "../../public/plugins/tabler-icons/tabler-icons.css";
import "../../public/plugins/fontawesome/css/fontawesome.min.css";
import "../../public/plugins/fontawesome/css/all.min.css";
import "../../public/plugins/fancybox/jquery.fancybox.min.css";
import "../../public/plugins/owlcarousel/owl.carousel.min.css";
import "../../public/plugins/ion-rangeslider/css/ion.rangeSlider.css";
import "../../public/plugins/ion-rangeslider/css/ion.rangeSlider.min.css";
import "../../public/css/iconsax.css";
import "../../public/css/bootstrap-datetimepicker.min.css";
import "../../public/css/style.css";
import Link from "next/link";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flight Booking App",
  description: "Book your flights easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@100;400;500;600;700&display=swap" />
        <script src="https://code.jquery.com/jquery-3.6.0.min.js" defer></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js" defer></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.3.1/css/ion.rangeSlider.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.3.1/js/ion.rangeSlider.min.js" defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
<div className="main-header">
        <div className="header-topbar text-center bg-white">
            <div className="container">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <div className="d-flex align-items-center fw-medium fs-14 mb-12 gap-2">
                    <p className="d-flex align-items-center fw-medium fs-14 mb-2 text-dark"><i className="isax isax-call5 me-2"></i>+971-543699299</p>
                     <p className="d-flex align-items-center fw-medium fs-14 mb-2 text-dark"><i className="isax isax-message-text-15 me-2 text-dark"></i>Email : <a href="#!" >info@bookmytripae.com</a></p>
                    
                    </div>
                     <div className="d-flex align-items-end flex-column justify-content-end gap-4">
                        <ul className="social-icon">
                            <li>
                                <a href="javascript:void(0);"><i className="fa-brands fa-facebook text-dark"></i></a>
                            </li>
                            <li>
                                <a href="javascript:void(0);"><i className="fa-brands fa-x-twitter text-dark"></i></a>
                            </li>
                            <li>
                                <a href="javascript:void(0);"><i className="fa-brands fa-instagram text-dark"></i></a>
                            </li>
                            <li>
                                <a href="javascript:void(0);"><i className="fa-brands fa-linkedin text-dark"></i></a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <header>
            <div className="container">
                <div className="offcanvas-info">
                    <div className="offcanvas-wrap">
                        <div className="offcanvas-detail">
                            <div className="offcanvas-head">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <a href="#!" className="black-logo-responsive">
                                        <Image src="/images/logo.png" alt="logo-img" width={100} height={100} />
                                    </a>
                                    <a href="#!" className="white-logo-responsive">
                                        <Image src="/images/logo.png" alt="logo-img" width={100} height={100} />
                                    </a>
                                    <div className="offcanvas-close">
                                        <i className="ti ti-x"></i>
                                    </div>
                                </div>
                                
                            </div>
                            <div className="mobile-menu fix mb-3"></div>
                        </div>
                    </div>
                </div>
                <div className="offcanvas-overlay"></div>
                <div className="header-nav">
                    <div className="main-menu-wrapper">
                        <div className="navbar-logo">
                            <Link className="logo-white header-logo" href="/">
                                <Image src="/images/logo.png" className="logo" alt="Logo" width={100} height={100} />
                            </Link>
                            <Link className="logo-dark header-logo" href="/">
                                <Image src="/images/logo.png" className="logo" alt="Logo" width={100} height={100} />
                            </Link>
                        </div>
                        <nav id="mobile-menu">
                            <ul className="main-nav">
                           
                                <li><Link href="/">Home</Link></li>   
                                <li><Link href="/about-us">About Us</Link></li>   
                                <li><Link href="/flights-landing">Flight</Link></li>   
                                <li><Link href="/hotels-landing">Hotel</Link></li>   
                               
                            </ul>
                        </nav>
                        <div className="header-btn d-flex align-items-center">
                            <div><a href="javascript:void(0);" className="btn btn-white me-3" data-bs-toggle="modal" data-bs-target="#login-modal">Sign In</a></div>
                            <a href="javascript:void(0);" className="btn btn-primary me-0">Sign Up</a>
                            <div className="header__hamburger d-xl-none my-auto">
                                <div className="sidebar-menu">
                                    <i className="isax isax-menu5"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    </div>

      
        {children}
      

      <footer>
            <div className="container" style={{padding: "20px 0px"}}>
                <div className="footer-top">
                    <div className="row justify-content-center m-auto">
                        <div className="col-lg-2 col-md-6 col-12">
                            <div className="footer-widget">
                                <h5>Company</h5>
                                <ul className="footer-menu">
                                    <li>
                                        <Link href="/about-us">About Us</Link>
                                    </li>
                                    <li>
                                        <Link href="/careers">Careers</Link>
                                    </li>
                                    <li>
                                        <Link href="/blogs">Blogs</Link>
                                    </li>
                                    <li>
                                        <Link href="/affiliate-program">Affilate Program</Link>
                                    </li>
                                    <li>
                                        <Link href="/add-your-listing">Add Your Listing</Link>
                                    </li>
                                    <li>
                                        <Link href="/our-partners">Our Partners</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-6 col-12">
                            <div className="footer-widget">
                                <h5>Quick links</h5>
                                <ul className="footer-menu">
                                    <li>
                                        <Link href="/contact-us">Contact Us</Link>
                                    </li>
                                    <li>
                                        <Link href="/legal-notice">Legal Notice</Link>
                                    </li>
                                    <li>
                                        <Link href="/privacy-policy">Privacy Policy</Link>
                                    </li>
                                    <li>
                                        <Link href="/t-c">T&C</Link>
                                    </li>
                                    <li>
                                        <Link href="/chat-support">Chat Support</Link>
                                    </li>
                                    <li>
                                        <Link href="/refund-policy">Refund Policy</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-6 col-12">
                            <div className="footer-widget">
                                <h5>Destinations</h5>
                                <ul className="footer-menu">
                                    <li>
                                        <a href="javascript:void(0);">Hawai</a>
                                    </li>
                                    <li>
                                        <a href="javascript:void(0);">Istanbul</a>
                                    </li>
                                    <li>
                                        <a href="javascript:void(0);">San Diego</a>
                                    </li>
                                    <li>
                                        <a href="javascript:void(0);">Belgium</a>
                                    </li>
                                    <li>
                                        <a href="javascript:void(0);">Los Angeles</a>
                                    </li>
                                    <li>
                                        <a href="javascript:void(0);">Newyork</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                            <div className="footer-widget">
                                <div className="mb-4">
                                    <h5 className="mb-1">Our Newsletter</h5>
                                    <p className="mb-3">Just sign up and we'll send you a notification by email.</p>
                                    <div className="footer-input">
                                        <div className="input-group align-items-center justify-content-center">
                                            <span className="input-group-text px-1"><i
                                                    className="isax isax-message-favorite5"></i></span>
                                            <input type="email" className="form-control" placeholder="Enter Email Address" />
                                            <button type="submit" className="btn btn-primary btn-md">Subscribe</button>
                                        </div>
                                    </div>
                                </div>
                                <h5 className="mb-0">Contact Info</h5>
                                <div className="d-sm-flex align-items-center justify-content-center justify-content-between">
                                    <div
                                        className="d-flex align-items-center justify-content-center justify-content-sm-start me-3 mt-2">
                                        <span className="avatar avatar-lg bg-light rounded-circle flex-shrink-0"
                                            style={{border: "none!important", background: "transparent!important"}}>
                                            <i className="ti ti-headphones-filled fs-24" style={{color: "red"}}></i>
                                        </span>
                                        <div className="ms-2">
                                            <p className="fs-14 mb-1">Customer Support</p>
                                            <h6 className="fw-medium">+971-543699299</h6>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center justify-content-sm-start mt-2">
                                        <span className="avatar avatar-lg bg-light rounded-circle flex-shrink-0"
                                            style={{border: "none!important", background: "transparent!important"}}>
                                            <i className="ti ti-message-2 fs-24 " style={{color: "red"}}></i>
                                        </span>
                                        <div className="ms-2">
                                            <p className="fs-14 mb-1">Drop Us an Email</p>
                                            <h6 className="fw-medium text-dark">info@bookmytripae.com</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="footer-bottom" style={{background: "#0A0911", padding: "20px 0px 0px 0px"}}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-12">
                            <h5 className="text-white">Payment & Security</h5>
                            <img src="/images/151.PNG" className="mb-4 mt-4" />
                        </div>
                        <div className="col-md-6 col-12">
                            <div className="d-flex align-items-end flex-column justify-content-end gap-4">
                                <h5 className="text-white">Follow us on</h5>
                                <ul className="social-icon">
                                    <li>
                                        <a href="javascript:void(0);"><i className="fa-brands fa-facebook text-white"></i></a>
                                    </li>
                                    <li>
                                        <a href="javascript:void(0);"><i className="fa-brands fa-x-twitter text-white"></i></a>
                                    </li>
                                    <li>
                                        <a href="javascript:void(0);"><i className="fa-brands fa-instagram text-white"></i></a>
                                    </li>
                                    <li>
                                        <a href="javascript:void(0);"><i className="fa-brands fa-linkedin text-white"></i></a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center" style={{borderTop: "1px solid #FFF", paddingTop: "10px"}}>
                        <div className="col-md-6 col-12">
                            <p className="fs-14 text-white">Copyright &copy; 2025. All Rights Reserved, <a
                                    href="javascript:void(0);" className="text-primary fw-medium">BookMyTrip</a></p>
                        </div>
                        <div className="col-md-6 col-12">
                            <div className="d-flex align-items-center justify-content-end">
                                <ul className="social-icon">
                                    <li>
                                        <a href="javascript:void(0);" className="text-white">Privacy Policy</a>
                                    </li>
                                    <li>
                                        <a href="javascript:void(0);" className="text-white">Terms & Conditions</a>
                                    </li>
                                    <li>
                                        <a href="javascript:void(0);" className="text-white">Refund Policy</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
        </footer>
        </Providers>
      </body>
    </html>
  );
}
