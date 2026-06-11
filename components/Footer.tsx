'use client'

import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  const links = [
    { label: 'Home', href: '/customer/products' },
    { label: 'Wishlist', href: '/customer/wishlist' },
    { label: 'My Orders', href: '/customer/orders' },
  ]

  const legal = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Contact Us', href: '#' },
  ]

  return (
    <footer className="shopme-footer">
      {/* ── ROW 1: Main Content ── */}
      <div className="footer-main-row">
        {/* Left Column */}
        <div className="footer-col footer-col-left">
          <span className="footer-logo">SHOP ME</span>
          <p className="footer-tagline">Premium products, unbeatable prices.</p>
          <div className="footer-social-row">
            <a href="#" className="footer-social" aria-label="Instagram">
              <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a href="#" className="footer-social" aria-label="Twitter">
              <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
            <a href="#" className="footer-social" aria-label="Facebook">
              <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Middle Column */}
        <div className="footer-col">
          <span className="footer-col-heading">QUICK LINKS</span>
          <div className="footer-links-list">
            {links.map(link => (
              <Link key={link.href} href={link.href} className="footer-link">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="footer-col">
          <span className="footer-col-heading">SUPPORT</span>
          <div className="footer-links-list">
            {legal.map(item => (
              <a key={item.label} href={item.href} className="footer-link">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 2: Divider ── */}
      <div className="footer-divider" />

      {/* ── ROW 3: Copyright Bar ── */}
      <div className="footer-bottom-row">
        <span className="footer-copyright">
          © {year} ShopMe. All rights reserved.
        </span>
        <span className="footer-made-in">
          Made with ♥ in India
        </span>
      </div>

      {/* CSS Stylesheet */}
      <style>{`
        .shopme-footer {
          background-color: #111827;
          color: #9ca3af;
          padding: 48px 0 0 0;
          font-family: inherit;
          width: 100%;
        }
        .footer-main-row {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 64px;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
        }
        .footer-col-left {
          align-items: flex-start;
        }
        .footer-logo {
          color: #ffffff;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 0.05em;
          line-height: 1;
        }
        .footer-tagline {
          color: #9ca3af;
          font-size: 13px;
          margin-top: 8px;
          margin-bottom: 16px;
        }
        .footer-social-row {
          display: flex;
          gap: 12px;
        }
        .footer-social {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #374151;
          color: #9ca3af;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .social-icon {
          width: 16px;
          height: 16px;
        }
        .footer-col-heading {
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
          text-transform: uppercase;
        }
        .footer-links-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-link {
          font-size: 14px;
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.15s ease;
          display: block;
        }
        .footer-divider {
          border-top: 1px solid #1f2937;
          width: 100%;
          margin-top: 40px;
        }
        .footer-bottom-row {
          max-width: 1280px;
          margin: 0 auto;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-copyright, .footer-made-in {
          font-size: 13px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .footer-main-row {
            grid-template-columns: 1fr;
            gap: 32px;
            text-align: center;
          }
          .footer-col-left {
            align-items: center;
          }
          .footer-social-row {
            justify-content: center;
          }
          .footer-bottom-row {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  )
}
