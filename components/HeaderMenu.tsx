import Link from 'next/link';
import AisaLogo from './AisaLogo';
import styles from './header-menu.module.css';

const NAV_ITEMS = [
  { label: 'Somos Aisa', href: '#somos-aisa' },
  { label: 'Divisiones', href: '#divisiones' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Actualidad', href: '#actualidad' },
  { label: 'Sostenibilidad', href: '#sostenibilidad' }
];

export default function HeaderMenu() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logoLink} aria-label="Ir al inicio">
          <AisaLogo className={styles.logo} imgClassName={styles.logoImage} />
        </Link>

        <div className={styles.navWrapper}>
          <nav className={styles.navPill} aria-label="Navegación principal">
            <ul className={styles.navList}>
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={styles.navLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.actions}>
          <span className={styles.language} aria-hidden="true">
            ES / EN
          </span>
          <Link href="/contacto/" className={styles.contactLink}>
            Contactar <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
