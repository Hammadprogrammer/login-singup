// File: ./navbar.module.scss

"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { FaRegUser, FaShoppingBag, FaSearch } from "react-icons/fa";
import Link from "next/link";
import style from "./navbar.module.scss";
import { useRouter } from "next/navigation";
// 🚨 NEW IMPORT: Import the updated LoginPopup component
import LoginPopup from "../login-popup/login-popup"; // Adjust path as necessary (e.g., if you place it in /components)


const menuItems = [
  {
    name: "NEW IN",
    href: "/new-in",
    dropdown: null,
  },
  {
    name: "READY TO WEAR",
    href: "/ready-to-wear",
    dropdown: {
      isMegaMenu: true,
      categories: [
        {
          title: "EVERYDAY",
          links: [
            { label: "Tunics & Kurtas", href: "/ready-to-wear/everyday/tunics-kurtas" },
            { label: "Jackets", href: "/ready-to-wear/everyday/jackets" },
            { label: "Kaftans", href: "/ready-to-wear/everyday/kaftans" },
            { label: "Tops", href: "/ready-to-wear/everyday/tops" },
            { label: "Matching Sets", href: "/ready-to-wear/everyday/matching-sets" },
            { label: "Pants", href: "/ready-to-wear/everyday/pants" },
            { label: "All", href: "/ready-to-wear/everyday/all" },
          ],
        },
        {
          title: "OCCASION WEAR",
          links: [
            { label: "Kurta sets", href: "/ready-to-wear/occasion/kurta-sets" },
            { label: "Kaftans", href: "/ready-to-wear/occasion/kaftans" },
            { label: "Jackets", href: "/ready-to-wear/occasion/jackets" },
            { label: "Anarkalis", href: "/ready-to-wear/occasion/anarkalis" },
            { label: "Saree Set", href: "/ready-to-wear/occasion/saree-set" },
            { label: "All", href: "/ready-to-wear/occasion/all" },
          ],
        },
        {
          title: "ALL",
          links: [
            { label: "Kaftans", href: "/ready-to-wear/all/kaftans" },
            { label: "Tunics & Kurtas", href: "/ready-to-wear/all/tunics-kurtas" },
            { label: "Tops", href: "/ready-to-wear/all/tops" },
            { label: "Jackets", href: "/ready-to-wear/all/jackets" },
            { label: "Matching Sets", href: "/ready-to-wear/all/matching-sets" },
            { label: "Pants", href: "/ready-to-wear/all/pants" },
            { label: "All", href: "/ready-to-wear/all" },
          ],
        },
      ],
      imageUrl: "https://images.fashionpass.com/collection_images/navArtboard%203.jpg?profile=b",
      imageLink: "/ready-to-wear",
    },
  },
  {
    name: "COUTURE",
    href: "/couture",
    dropdown: {
      isMegaMenu: false, // Flag for the simple, narrow layout
      categories: [
        {
          title: "BRIDAL",
          links: [
            { label: "Luxury Bridal", href: "/couture/bridal/luxury" },
            { label: "Destination Wedding", href: "/couture/bridal/destination" },
            { label: "Consultation", href: "/couture/bridal/consultation" },
          ],
        },
        {
          title: "SEMI-FORMAL",
          links: [
            { label: "Evening Wear", href: "/couture/semi-formal/evening" },
            { label: "Party Wear", href: "/couture/semi-formal/party" },
            { label: "View All", href: "/couture/semi-formal/all" },
          ],
        },
      ],
      imageUrl: "https://images.fashionpass.com/collection_images/navArtboard%203.jpg?profile=b",
      imageLink: "/couture",
    },
  },
  {
    name: "WINTER EDIT",
    href: "/winter-edit",
    dropdown: {
      isMegaMenu: false, // Flag for the simple, narrow layout
      categories: [
        {
          title: "SEASONAL PICKS",
          links: [
            { label: "Shawls & Wraps", href: "/winter-edit/shawls" },
            { label: "Woolen Kurta", href: "/winter-edit/woolen-kurta" },
            { label: "Velvet Collection", href: "/winter-edit/velvet" },
          ],
        },
      ],
      imageUrl: "https://images.fashionpass.com/collection_images/navArtboard%203.jpg?profile=b",
      imageLink: "/winter-edit",
    },
  },
  {
    name: "UNSTITCHED",
    href: "/unstitched",
    dropdown: null,
  },
];

const Navbar = () => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLDivElement>(null);

  // LOGIN POPUP STATE
  const [loginPopup, setLoginPopup] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if the popup is currently visible, if not, do nothing.
    if (!loginPopup) return;
    
    // Logic for API call
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.redirect) {
      router.push(data.redirect);
      setLoginPopup(false); // Close popup on successful login
    } else {
      alert(data.error || "Login failed");
    }
  };

  const handleHamburgerClick = () => {
    setIsOpen((prev) => !prev);
  };

  const handleCloseClick = () => setIsOpen(false);

  const closeLoginPopup = () => {
    setLoginPopup(false);
    // Optional: Clear form fields when closing the popup
    setEmail("");
    setPassword("");
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close mobile drawer on outside click
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
    setHoveredLink(null);
  };

  return (
    <div className={`${style.main} ${scrolled ? style.scrolled : ""}`}>
      <div className={style.topBanner}><p className={style.text}>NEW DROP EVERY WEDNESDAY</p></div>

      <nav className={style.navbar}>
        <div className={style.leftSection}>
          <div className={style.hamburger} onClick={handleHamburgerClick}>☰</div>
        </div>

        <div className={style.brandCenter}>
          <Link href="/" onClick={handleLinkClick}>
            <div className={style.logoText}>
              <span className={style.misha}>Cloting</span>
              <span className={style.lakhani}>Brand</span>
            </div>
          </Link>
        </div>

        <div className={style.rightSection}>
          <FaSearch size={22} className={style.icon} />

          {/* USER ICON — OPEN POPUP */}
          <div
            className={`${style.icon} ${style.desktopOnlyIcon}`}
            onClick={() => setLoginPopup(true)}
            style={{ cursor: "pointer" }}
          >
            <FaRegUser size={22} />
          </div>

          <Link href="/cart" className={style.icon}>
            <FaShoppingBag size={22} />
          </Link>
        </div>

        <div
          ref={navLinksRef}
          className={style.desktopNavLinks}
          onMouseLeave={() => setHoveredLink(null)}
        >
          {/* MENU ITEMS */}
          {menuItems.map((item) => (
            <div
              key={item.name}
              className={style.desktopNavLinkItem}
              onMouseEnter={() => setHoveredLink(item.name)}
            >
              <Link href={item.href} onClick={() => setHoveredLink(null)}>
                {item.name}
              </Link>

              {item.dropdown && (
                <div
                  className={`
                    ${style.dropdownMenu}
                    ${item.dropdown.isMegaMenu ? style.megaMenu : style.simpleMenu}
                    ${hoveredLink === item.name ? style.menuVisible : ""}
                  `}
                >
                  <div className={style.dropdownContent}>
                    <div className={style.categoryColumns}>
                      {item.dropdown.categories.map((category) => (
                        <div key={category.title} className={style.categoryColumn}>
                          <h4 className={style.categoryTitle}>{category.title}</h4>
                          {category.links.map((link) => (
                            <Link
                              key={link.label}
                              href={link.href}
                              className={style.dropdownLink}
                              onClick={handleLinkClick}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>

                    <Link href={item.dropdown.imageLink} onClick={handleLinkClick} className={style.dropdownImage}>
                      <img src={item.dropdown.imageUrl} alt={`${item.name} image`} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* MOBILE DRAWER */}
        <div
          ref={drawerRef}
          className={`${style.navbarLinks} ${isOpen ? style.active : ""}`}
        >
          <div className={style.closeIcon} onClick={handleCloseClick}>
            <FaTimes size={30} />
          </div>

          <div className={style.mobileLinks}>
            {menuItems.map((item) => (
              <Link key={item.name} href={item.href} onClick={handleCloseClick}>
                {item.name}
              </Link>
            ))}

            {/* MOBILE ACCOUNT → OPEN POPUP */}
            <div
              onClick={() => {
                setLoginPopup(true);
                setIsOpen(false);
              }}
              className={style.mobileAccount}
            >
              Account
            </div>
          </div>
        </div>
      </nav>

      {isOpen && <div className={style.backdrop} onClick={handleCloseClick}></div>}
      
      {/* --- Login Popup Integration --- */}
      {/* Renders the Tailwind styled popup */}
      <LoginPopup 
        isVisible={loginPopup}
        onClose={closeLoginPopup}
        handleLogin={handleLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
      />
      {/* --- End Login Popup Integration --- */}
    
    </div>
  );
};

export default Navbar;