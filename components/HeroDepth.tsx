'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type HeroDepthProps = {
  fadeStart?: number;
  strength?: number;
};

const clampFade = (value: number) => Math.min(Math.max(value, 0.65), 0.85);
type LayerConfig = {
  id: string;
  clipPath: string;
  shift: number;
  opacity: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function HeroDepth({ fadeStart = 0.7, strength = 0.06 }: HeroDepthProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inputControllerRef = useRef<{ setTarget: (x: number, y: number) => void } | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [mode, setMode] = useState<'static' | 'parallax'>('static');

  const fadeValue = useMemo(() => clampFade(fadeStart), [fadeStart]);
  const maskStyle = useMemo(
    () => ({
      maskImage: `linear-gradient(to bottom, rgba(0,0,0,1) ${fadeValue * 100}%, rgba(0,0,0,0) 100%)`,
      WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,1) ${fadeValue * 100}%, rgba(0,0,0,0) 100%)`
    }),
    [fadeValue]
  );

  const layers = useMemo<LayerConfig[]>(
    () => [
      {
        id: 'ridge-far',
        clipPath:
          'polygon(0% 36%, 10% 32%, 22% 40%, 34% 30%, 47% 42%, 59% 31%, 73% 44%, 86% 33%, 100% 39%, 100% 100%, 0% 100%)',
        shift: 12,
        opacity: 0.95
      },
      {
        id: 'ridge-mid',
        clipPath:
          'polygon(0% 46%, 9% 52%, 18% 44%, 31% 58%, 44% 46%, 58% 60%, 72% 50%, 86% 64%, 100% 54%, 100% 100%, 0% 100%)',
        shift: 22,
        opacity: 0.98
      },
      {
        id: 'ridge-near',
        clipPath:
          'polygon(0% 58%, 8% 66%, 20% 58%, 33% 74%, 48% 60%, 62% 76%, 78% 64%, 90% 80%, 100% 70%, 100% 100%, 0% 100%)',
        shift: 32,
        opacity: 1
      }
    ],
    []
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setMode('static');
      return;
    }
    setMode('parallax');
  }, [reduceMotion]);

  useEffect(() => {
    if (mode !== 'parallax') return;

    const state = {
      target: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
      raf: null as number | null
    };

    const applyTransforms = () => {
      layerRefs.current.forEach((layer, index) => {
        const config = layers[index];
        if (!layer || !config) return;
        const amount = config.shift * strength;
        layer.style.transform = `translate3d(${state.current.x * amount}px, ${state.current.y * amount}px, 0)`;
      });
    };

    const step = () => {
      state.raf = null;
      state.current.x += (state.target.x - state.current.x) * 0.08;
      state.current.y += (state.target.y - state.current.y) * 0.08;
      applyTransforms();
      if (Math.abs(state.current.x - state.target.x) > 0.001 || Math.abs(state.current.y - state.target.y) > 0.001) {
        state.raf = requestAnimationFrame(step);
      }
    };

    inputControllerRef.current = {
      setTarget: (x, y) => {
        state.target.x = clamp(x, -1, 1);
        state.target.y = clamp(y, -1, 1);
        if (state.raf == null) {
          state.raf = requestAnimationFrame(step);
        }
      }
    };

    applyTransforms();

    return () => {
      if (state.raf != null) {
        cancelAnimationFrame(state.raf);
      }
      layerRefs.current.forEach((layer) => {
        if (layer) {
          layer.style.transform = 'translate3d(0, 0, 0)';
        }
      });
      inputControllerRef.current = null;
    };
  }, [layers, mode, strength]);

  useEffect(() => {
    if (mode === 'static') return;

    const handlePointerMove = (event: PointerEvent) => {
      const controller = inputControllerRef.current;
      const container = containerRef.current;
      if (!controller || !container) return;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const clamp01 = (value: number) => clamp(value, 0, 1);
      const nx = clamp01((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(clamp01((event.clientY - rect.top) / rect.height) * 2 - 1);
      controller.setTarget(nx, ny);
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [mode]);

  useEffect(() => {
    if (mode === 'static') return;
    const container = containerRef.current;
    if (!container || typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
      return;
    }

    let cleanupRequest: (() => void) | null = null;
    let orientationHandler: ((event: DeviceOrientationEvent) => void) | null = null;

    const activateOrientation = () => {
      if (orientationHandler) return;
      orientationHandler = (event: DeviceOrientationEvent) => {
        if (event.beta == null || event.gamma == null) return;
        const gamma = clamp(event.gamma / 20, -1, 1);
        const beta = clamp(event.beta / 20, -1, 1);
        inputControllerRef.current?.setTarget(gamma, -beta * 0.8);
      };
      window.addEventListener('deviceorientation', orientationHandler);
    };

    const requestPermission = () => {
      const anyDeviceOrientation = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
      };

      if (typeof anyDeviceOrientation.requestPermission === 'function') {
        const handler = () => {
          anyDeviceOrientation
            .requestPermission?.()
            .then((response) => {
              if (response === 'granted') {
                activateOrientation();
              }
            })
            .finally(() => {
              container.removeEventListener('click', handler);
              container.removeEventListener('touchstart', handler);
            });
        };
        container.addEventListener('click', handler, { once: true, passive: true });
        container.addEventListener('touchstart', handler, { once: true, passive: true });
        cleanupRequest = () => {
          container.removeEventListener('click', handler);
          container.removeEventListener('touchstart', handler);
        };
      } else {
        activateOrientation();
      }
    };

    requestPermission();

    return () => {
      cleanupRequest?.();
      if (orientationHandler) {
        window.removeEventListener('deviceorientation', orientationHandler);
      }
    };
  }, [mode]);

  const description = 'Fotografía panorámica de montañas al atardecer con efecto de profundidad.';

  return (
    <section
      aria-label={description}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#000',
        ...maskStyle
      }}
      ref={containerRef}
    >
      {mode === 'static' ? (
        <img
          src="/hero/montanas.jpg"
          alt={description}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      ) : null}
      {mode === 'parallax' ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden'
          }}
        >
          <img
            src="/hero/montanas.jpg"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {layers.map((layer, index) => (
            <div
              key={layer.id}
              ref={(el) => {
                layerRefs.current[index] = el;
              }}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'url(/hero/montanas.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                clipPath: layer.clipPath,
                WebkitClipPath: layer.clipPath,
                opacity: layer.opacity,
                mixBlendMode: 'screen',
                willChange: 'transform',
                transform: 'translate3d(0, 0, 0)'
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
