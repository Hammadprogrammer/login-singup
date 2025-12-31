"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaShoppingBag, FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Link from "next/link";
import style from "./navbar.module.scss";
import { useRouter, usePathname } from "next/navigation";

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
      imageUrl: "/aaa.webp",
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
      imageUrl: "/aaa.webp",
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
      imageUrl: "/aaa.webp",
      imageLink: "/winter-edit",
    },
  },
  { name: "UNSTITCHED", href: "/unstitched", dropdown: null },
];

const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [activeMobileSub, setActiveMobileSub] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  const handleHamburgerClick = () => setIsOpen(true);
  const handleCloseClick = () => {
    setIsOpen(false);
    setActiveMobileSub(null);
  };

  const toggleMobileSub = (name: string) => {
    setActiveMobileSub(activeMobileSub === name ? null : name);
  };

  // --- Auth Functions ---
  const checkLoginStatus = async () => {
    try {
      const res = await fetch("/api/auth/check-token");
      setIsLoggedIn(res.ok);
    } catch {
      setIsLoggedIn(false);
    }
  };

  const handleLoginClick = () => {
    handleCloseClick();
    router.push("/login");
  };

  const handleLogoutClick = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setIsLoggedIn(false);
        handleCloseClick();
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        handleCloseClick();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ShopSellToggle = ({ isMobile = false }) => (
    <div className={`${style.toggleContainer} ${isMobile ? style.mobileToggle : style.desktopToggle}`}>
      <Link href="/" onClick={handleCloseClick} className={`${style.toggleBtn} ${pathname === "/" ? style.activeToggle : ""}`}>
        SHOP
      </Link>
      <Link href="/sell" onClick={handleCloseClick} className={`${style.toggleBtn} ${pathname === "/sell" ? style.activeToggle : ""}`}>
        SELL
      </Link>
    </div>
  );

  return (
    <div className={`${style.main} ${scrolled ? style.scrolled : ""}`}>
      <div className={style.topBanner}>
        <p className={style.text}>NEW DROP EVERY WEDNESDAY</p>
      </div>

      <nav className={style.navbar}>
        <div className={style.leftSection}>
          <div className={style.hamburger} onClick={handleHamburgerClick}>☰</div>
          <ShopSellToggle isMobile={false} />
          {/* <FaSearch size={18} className={style.searchIcon} /> */}
        </div>

        <div className={style.brandCenter}>
          <Link href="/" onClick={handleCloseClick}>
            <div className={style.logoText}>
              <span className={style.misha}>CLothing</span>
              <span className={style.lakhani}>Brand</span>
            </div>
          </Link>
        </div>

        <div className={style.rightSection}>
          <Link href="/cart" className={style.icon}>
            <FaShoppingBag size={20} />
          </Link>
          {/* DESKTOP LOGOUT/LOGIN */}
          <div
            className={`${style.loginButton} ${style.desktopOnlyIcon}`}
            onClick={isLoggedIn ? handleLogoutClick : handleLoginClick}
          >
            {isLoggedIn ? "LOGOUT" : "LOGIN"}
          </div>
        </div>

        {/* --- DESKTOP NAVIGATION --- */}
        <div className={style.desktopNavLinks} onMouseLeave={() => setHoveredLink(null)}>
          {menuItems.map((item) => (
            <div key={item.name} className={style.desktopNavLinkItem} onMouseEnter={() => setHoveredLink(item.name)}>
              <Link href={item.href} onClick={() => setHoveredLink(null)}>{item.name}</Link>
              {item.dropdown && (
                <div className={`${style.dropdownMenu} ${hoveredLink === item.name ? style.menuVisible : ""}`}>
                  <div className={style.dropdownContent}>
                    <div className={style.categoryColumns}>
                      {item.dropdown.categories.map((cat) => (
                        <div key={cat.title} className={style.categoryColumn}>
                          <h4 className={style.categoryTitle}>{cat.title}</h4>
                          {cat.links.map((link) => (
                            <Link key={link.label} href={link.href} className={style.dropdownLink} onClick={handleCloseClick}>
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                    <Link href={item.dropdown.imageLink} className={style.dropdownImage}>
                      <img src={item.dropdown.imageUrl} alt="nav" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- MOBILE DRAWER --- */}
        <div ref={drawerRef} className={`${style.navbarLinks} ${isOpen ? style.active : ""}`}>
          <div className={style.closeIcon} onClick={handleCloseClick}>
            <FaTimes size={24} color="black" />
          </div>

          <div className={style.mobileLinks}>
            <div className={style.mobileToggleWrapper}>
              <ShopSellToggle isMobile={true} />
            </div>

            {menuItems.map((item) => (
              <div key={item.name}>
                {item.dropdown ? (
                  <>
                    <div className={style.mobileMainLink} onClick={() => toggleMobileSub(item.name)}>
                      {item.name}
                      {activeMobileSub === item.name ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </div>
                    <div className={`${style.mobileSubMenu} ${activeMobileSub === item.name ? style.subMenuOpen : ""}`}>
                      {item.dropdown.categories.map((cat) => (
                        <div key={cat.title}>
                          <p style={{ fontSize: '11px', fontWeight: 'bold', padding: '10px 0 5px', color: '#888' }}>{cat.title}</p>
                          {cat.links.map((link) => (
                            <Link key={link.label} href={link.href} className={style.mobileSubLink} onClick={handleCloseClick}>
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link href={item.href} className={style.mobileMainLink} onClick={handleCloseClick}>
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className={style.mobileFooter}>
            {/* MOBILE LOGOUT/LOGIN */}
            <div onClick={isLoggedIn ? handleLogoutClick : handleLoginClick} className={style.mobileAccount}>
              {isLoggedIn ? "LOGOUT" : "LOGIN / REGISTER"}
            </div>
          </div>
        </div>
      </nav>

      {isOpen && <div className={style.backdrop} onClick={handleCloseClick}></div>}
    </div>
  );
};

export default Navbar;