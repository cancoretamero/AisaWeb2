'use client';

import FloatingNav from '@/components/FloatingNav';
import HeroDepth from '@/components/HeroDepth';

const sections = [
  {
    id: 'divisiones',
    title: 'Divisiones',
    description:
      'Nuestro ecosistema se organiza en unidades especializadas para ofrecer soluciones a medida en cada etapa del ciclo inmobiliario.',
    highlights: [
      'AISA Capital: inversión y financiación estructurada',
      'AISA Arquitectura: diseño y dirección de obra',
      'AISA Living: comercialización y experiencias residenciales'
    ]
  },
  {
    id: 'proyectos',
    title: 'Proyectos',
    description:
      'Creamos espacios que combinan carácter local con estándares globales de habitabilidad, tecnología y bienestar.',
    highlights: [
      'Residenciales de alto valor en la península ibérica',
      'Hoteles boutique con identidad mediterránea',
      'Oficinas híbridas orientadas al talento del futuro'
    ]
  },
  {
    id: 'actualidad',
    title: 'Actualidad',
    description:
      'Compartimos logros, acuerdos estratégicos y tendencias del sector que inspiran la ciudad que viene.',
    highlights: [
      'Premios recientes a la excelencia constructiva',
      'Nuevos lanzamientos y entregas en curso',
      'Participación en foros de innovación urbana'
    ]
  },
  {
    id: 'sostenibilidad',
    title: 'Sostenibilidad',
    description:
      'Integramos criterios ESG desde la concepción del proyecto hasta su operación diaria, midiendo el impacto en personas y territorio.',
    highlights: [
      'Certificaciones LEED, BREEAM y WELL',
      'Plan maestro de descarbonización 2030',
      'Programas sociales con comunidades locales'
    ]
  }
];

export default function Home() {
  return (
    <main className="home">
      <FloatingNav />
      <HeroDepth id="inicio" fadeStart={0.72} />
      <div className="home__content">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="home__section">
            <div className="home__section-inner">
              <header className="home__section-header">
                <p className="home__eyebrow">Sección</p>
                <h2>{section.title}</h2>
              </header>
              <p className="home__description">{section.description}</p>
              <ul className="home__list">
                {section.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </section>
        ))}
        <section id="contacto" className="home__section home__section--contact">
          <div className="home__section-inner">
            <header className="home__section-header">
              <p className="home__eyebrow">Conversemos</p>
              <h2>Contacto</h2>
            </header>
            <p className="home__description">
              Escríbenos a <a href="mailto:info@serrasalza.com">info@serrasalza.com</a> o llámanos al{' '}
              <a href="tel:+34930000000">+34 930 000 000</a>. También puedes visitarnos en Passeig de Gràcia 17, Barcelona.
            </p>
          </div>
        </section>
      </div>
      <style jsx>{`
        .home {
          background: radial-gradient(circle at top, rgba(10, 20, 35, 0.95), #03060c 70%);
          color: #f5f7fa;
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .home__content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: clamp(4rem, 8vw, 6.5rem);
          padding: clamp(4rem, 10vw, 8rem) clamp(1.5rem, 5vw, 5rem) clamp(6rem, 12vw, 10rem);
        }

        .home__section {
          scroll-margin-top: clamp(6rem, 12vw, 8rem);
        }

        .home__section-inner {
          max-width: 960px;
          margin: 0 auto;
          background: rgba(9, 18, 30, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 28px;
          padding: clamp(2rem, 5vw, 3rem);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(18px);
        }

        .home__section-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .home__eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 0.75rem;
          color: rgba(143, 170, 210, 0.85);
        }

        .home__section h2 {
          font-size: clamp(2rem, 4vw, 2.8rem);
          margin: 0;
          font-weight: 600;
        }

        .home__description {
          margin: 0 0 1.75rem;
          font-size: 1.05rem;
          line-height: 1.75;
          color: rgba(226, 233, 247, 0.92);
        }

        .home__description a {
          color: #8be7ff;
          text-decoration: none;
        }

        .home__description a:hover,
        .home__description a:focus-visible {
          text-decoration: underline;
        }

        .home__list {
          display: grid;
          gap: 0.85rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .home__list li {
          position: relative;
          padding-left: 1.75rem;
          font-size: 1rem;
          line-height: 1.6;
          color: rgba(210, 225, 245, 0.9);
        }

        .home__list li::before {
          content: '';
          position: absolute;
          left: 0.25rem;
          top: 0.6rem;
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #5e9cff, #8be7ff);
          box-shadow: 0 0 12px rgba(139, 231, 255, 0.6);
        }

        .home__section--contact .home__section-inner {
          background: linear-gradient(135deg, rgba(15, 32, 52, 0.85), rgba(9, 20, 38, 0.85));
        }

        @media (max-width: 768px) {
          .home__section-inner {
            padding: clamp(1.75rem, 6vw, 2.5rem);
          }

          .home__description {
            font-size: 1rem;
          }

          .home__list li {
            font-size: 0.97rem;
          }
        }
      `}</style>
    </main>
  );
}
