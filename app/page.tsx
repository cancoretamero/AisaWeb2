import HeroDepth from '@/components/HeroDepth';

export default function Home() {
  return (
    <main>
      <HeroDepth fadeStart={0.72} />
      <section className="section">
        <h2>Explora las cumbres</h2>
        <p>
          Un paisaje enigmático que reacciona a tus movimientos, revelando la profundidad de las
          montañas gracias a un mapa de profundidad generado automáticamente. Desplázate para
          encontrar más contenido sumergido en la oscuridad.
        </p>
      </section>
      <section className="section">
        <h2>Experiencia inmersiva</h2>
        <p>
          Interactúa con el entorno moviendo el cursor o inclinando tu dispositivo. Las capas más
          cercanas cobran vida mientras el cielo permanece casi inmóvil, creando una sensación 3D
          realista.
        </p>
      </section>
      <section className="section">
        <h2>Accesible y adaptable</h2>
        <p>
          El efecto se desactiva automáticamente si prefieres menos movimiento y ofrece un fallback
          elegante cuando el mapa de profundidad no está disponible.
        </p>
      </section>
    </main>
  );
}
