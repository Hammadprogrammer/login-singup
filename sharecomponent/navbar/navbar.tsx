"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaRegUser, FaShoppingBag, FaSearch } from "react-icons/fa";
import Link from "next/link";
import style from "./navbar.module.scss";
import { useRouter } from "next/navigation";

// --- Menu Data (No Changes) ---
const menuItems = [
  { name: "NEW IN", href: "/new-in", dropdown: null },
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
      isMegaMenu: false,
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
      isMegaMenu: false,
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
  { name: "UNSTITCHED", href: "/unstitched", dropdown: null },
];

const Navbar: React.FC = () => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  const handleHamburgerClick = () => setIsOpen((prev) => !prev);
  const handleCloseClick = () => setIsOpen(false);

  // --- Core Function: Check Login Status using Server API ---
  const checkLoginStatus = async () => {
    try {
      // Calls the /api/auth/check-token route to check for the httpOnly token cookie
      const res = await fetch("/api/auth/check-token", { method: "GET" });
      
      // If the server returns 200 (res.ok is true), the token is present
      if (res.ok) {
        setIsLoggedIn(true);
      } else {
        // If the server returns 401 or any other error, the user is logged out
        setIsLoggedIn(false);
      }
    } catch (err) {
      // Handles network errors (e.g., server is down)
      console.error("Check login status failed (Network error):", err);
      setIsLoggedIn(false); 
    }
  };

  const handleLoginClick = () => {
    setIsOpen(false);
    router.push("/login");
  };

  const handleLogoutClick = async () => {
    try {
      // Calls the API route to delete the token cookie on the server (maxAge: -1)
      const res = await fetch("/api/auth/logout", { method: "POST" });
      
      if (res.ok) {
        // 1. Update state to logged out immediately
        setIsLoggedIn(false); 
        // 2. Redirect the user
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    // 1. IMPORTANT: Check login status when the component mounts
    checkLoginStatus(); 

    // 2. Click outside handler for mobile drawer
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    // Scroll handling for sticky navbar
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
      <div className={style.topBanner}>
        <p className={style.text}>NEW DROP EVERY WEDNESDAY</p>
      </div>

      <nav className={style.navbar}>
        <div className={style.leftSection}>
          <div className={style.hamburger} onClick={handleHamburgerClick}>
            ☰
          </div>
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

          {/* DESKTOP: Dynamic Login Icon / Logout Button */}
          {isLoggedIn ? (
            <div
              className={`${style.icon} ${style.desktopOnlyIcon}`}
              onClick={handleLogoutClick}
              style={{ cursor: "pointer" }}
              title="Logout" 
            >
              Logout
            </div>
          ) : (
            <div
              className={`${style.icon} ${style.desktopOnlyIcon}`}
              onClick={handleLoginClick}
              style={{ cursor: "pointer" }}
              title="Login" 
            >
              <FaRegUser size={22} />
            </div>
          )}

          <Link href="/cart" className={style.icon}>
            <FaShoppingBag size={22} />
          </Link>
        </div>

        {/* DESKTOP NAV LINKS */}
        <div className={style.desktopNavLinks} onMouseLeave={() => setHoveredLink(null)}>
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
        <div ref={drawerRef} className={`${style.navbarLinks} ${isOpen ? style.active : ""}`}>
          <div className={style.closeIcon} onClick={handleCloseClick}>
            <FaTimes size={30} />
          </div>

          <div className={style.mobileLinks}>
            {menuItems.map((item) => (
              <Link key={item.name} href={item.href} onClick={handleCloseClick}>
                {item.name}
              </Link>
            ))}

            {/* MOBILE: Dynamic Login/Logout Display */}
            <div onClick={isLoggedIn ? handleLogoutClick : handleLoginClick} className={style.mobileAccount}>
              {isLoggedIn ? "Logout" : "Account"}
            </div>
          </div>
        </div>
      </nav>

      {isOpen && <div className={style.backdrop} onClick={handleCloseClick}></div>}
    </div>
  );
};

export default Navbar;