'use client';

import Image from 'next/image';

const links = [
  { href: '#inicio', label: 'Inicio', accent: true },
  { href: '#divisiones', label: 'Divisiones' },
  { href: '#proyectos', label: 'Proyectos' },
  { href: '#actualidad', label: 'Actualidad' },
  { href: '#sostenibilidad', label: 'Sostenibilidad' }
];

export default function FloatingNav() {
  return (
    <div className="floating-nav" role="presentation">
      <nav aria-label="Navegación principal" className="floating-nav__inner">
        <a className="floating-nav__brand" href="#inicio">
          <span className="floating-nav__brand-mark">
            <Image
              src="/brand/aisa-logo.svg"
              alt="Logotipo de AISA Group"
              width={120}
              height={32}
              priority
            />
          </span>
          <span className="floating-nav__brand-copy">
            <span className="floating-nav__brand-name">AISA Group</span>
            <span className="floating-nav__brand-tagline">Arquitectura · Inversión · Citymaking</span>
          </span>
        </a>
        <ul className="floating-nav__links">
          {links.map((link) => (
            <li key={link.href} className="floating-nav__item">
              <a
                href={link.href}
                className={`floating-nav__link${link.accent ? ' floating-nav__link--accent' : ''}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a className="floating-nav__cta" href="#contacto">
          <span>Contactar</span>
          <svg viewBox="0 0 16 16" width="16" height="16" role="presentation">
            <path
              d="M4.5 11.5L11.5 4.5M11.5 4.5H6.1M11.5 4.5V9.9"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </nav>
      <style jsx>{`
        .floating-nav {
          position: fixed;
          inset: clamp(1.5rem, 4vw, 3rem) auto auto 50%;
          transform: translateX(-50%);
          z-index: 40;
          width: min(960px, calc(100% - clamp(1.5rem, 4vw, 3rem)));
          pointer-events: none;
        }

        .floating-nav__inner {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: clamp(0.75rem, 2.5vw, 1.5rem);
          padding: clamp(0.85rem, 2vw, 1.1rem) clamp(1.2rem, 4vw, 1.75rem);
          border-radius: 999px;
          background: linear-gradient(145deg, rgba(9, 19, 33, 0.78), rgba(8, 16, 29, 0.86));
          border: 1px solid rgba(118, 147, 187, 0.24);
          box-shadow: 0 24px 48px rgba(4, 10, 24, 0.35);
          backdrop-filter: blur(18px);
          pointer-events: auto;
        }

        .floating-nav__brand {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: inherit;
          padding-right: clamp(0.25rem, 2vw, 0.75rem);
          border-right: 1px solid rgba(118, 147, 187, 0.2);
        }

        .floating-nav__brand-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .floating-nav__brand-copy {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .floating-nav__brand-name {
          font-weight: 600;
          letter-spacing: 0.04em;
          font-size: 0.95rem;
          color: #f4f6fb;
        }

        .floating-nav__brand-tagline {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(193, 211, 238, 0.7);
        }

        .floating-nav__links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(0.45rem, 1.8vw, 1rem);
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .floating-nav__link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.65rem clamp(0.9rem, 2vw, 1.15rem);
          border-radius: 999px;
          text-decoration: none;
          font-size: 0.86rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(217, 231, 253, 0.82);
          background: rgba(255, 255, 255, 0.02);
          transition: background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
        }

        .floating-nav__link:hover,
        .floating-nav__link:focus-visible {
          color: #f7fbff;
          background: rgba(129, 186, 255, 0.18);
          box-shadow: inset 0 0 0 1px rgba(177, 215, 255, 0.4);
        }

        .floating-nav__link--accent {
          color: #0b1425;
          background: linear-gradient(135deg, #8be0ff, #aee4ff);
          box-shadow: 0 12px 24px rgba(110, 195, 255, 0.35);
        }

        .floating-nav__link--accent:hover,
        .floating-nav__link--accent:focus-visible {
          color: #061327;
          background: linear-gradient(135deg, #9fe7ff, #d4f3ff);
        }

        .floating-nav__cta {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.65rem 1.2rem;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #f4f8ff, #dcecff);
          color: #0a1830;
          box-shadow: 0 16px 30px rgba(160, 198, 255, 0.35);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .floating-nav__cta:hover,
        .floating-nav__cta:focus-visible {
          transform: translateY(-1px);
          box-shadow: 0 20px 36px rgba(160, 198, 255, 0.45);
        }

        .floating-nav__cta svg {
          display: block;
        }

        @media (max-width: 960px) {
          .floating-nav {
            width: calc(100% - clamp(1.5rem, 4vw, 2rem));
          }

          .floating-nav__inner {
            grid-template-columns: 1fr;
            row-gap: 1rem;
            border-radius: 32px;
          }

          .floating-nav__brand {
            justify-content: center;
            border-right: none;
            padding-right: 0;
          }

          .floating-nav__links {
            flex-wrap: wrap;
          }

          .floating-nav__cta {
            justify-self: center;
          }
        }

        @media (max-width: 640px) {
          .floating-nav__brand-copy {
            display: none;
          }

          .floating-nav__brand-mark {
            width: 46px;
            height: 46px;
          }

          .floating-nav__link {
            padding: 0.55rem 0.9rem;
            font-size: 0.82rem;
          }

          .floating-nav__cta {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 420px) {
          .floating-nav__inner {
            padding: 1rem;
          }

          .floating-nav__links {
            gap: 0.35rem;
          }
        }
      `}</style>
    </div>
  );
}
