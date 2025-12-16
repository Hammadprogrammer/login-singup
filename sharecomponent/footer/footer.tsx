// ElegantFooter.tsx
import React from 'react';
import style from './footer.module.scss'

const allLinks = [
  { name: "About Us", href: "/about" },
  { name: "Our Brands", href: "/brands" },
  { name: "Gift Cards", href: "/gift-cards" },
  { name: "Our Blog", href: "/blog" },
  { name: "FAQs", href: "/faqs" },
  { name: "Shipping & Returns", href: "/shipping-returns" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Careers", href: "/careers" },
  { name: "Press", href: "/press" },
  { name: "Contact Us", href: "/contact" },
  { name: "Report a Bug", href: "/report-bug" },
];

const ElegantFooter: React.FC = () => {
  return (
    <footer className={style.footer}>
      
      <div className={style.footerContent}>
        
        {/* 1. Centralized Links Grid */}
        <nav className={style.linksGridContainer} aria-label="Footer Navigation">
          <ul className={style.linksGrid}>
            {allLinks.map((link) => (
              <li key={link.name} className={style.listItem}>
                <a href={link.href} className={style.link}>{link.name}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Separator */}
        <hr className={style.divider} />

        {/* 2. Social & App Download Section */}
        <div className={style.utilitySection}>
          
          {/* Social Icons */}
          <div className={style.socialIcons}>
            <a href="https://instagram.com" aria-label="Instagram" className={style.socialLink}>
                <i className="fab fa-instagram"></i>
            </a>
            <a href="https://tiktok.com" aria-label="TikTok" className={style.socialLink}>
                <i className="fab fa-tiktok"></i>
            </a>
            <a href="https://pinterest.com" aria-label="Pinterest" className={style.socialLink}>
                <i className="fab fa-pinterest-p"></i>
            </a>
            <a href="https://facebook.com" aria-label="Facebook" className={style.socialLink}>
                <i className="fab fa-facebook-f"></i>
            </a>
          </div>
          
          {/* App Store Badge */}
          <div className={style.appStore}>
            <a href="https://appstore.com/fashionpass" className={style.appStoreLink}>
              <img 
                src="/images/app-store-badge-dark.svg" 
                alt="Download on the App Store" 
                className={style.appStoreImage}
              />
            </a>
          </div>

        </div>
      </div>

      {/* 3. Copyright Bar */}
      <div className={style.copyrightBar}>
        <p className={style.copyrightText}>
          COPYRIGHT &copy; 2025 FASHIONPASS, INC. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
};

export default ElegantFooter;