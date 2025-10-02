'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type HeroDepthProps = {
  id?: string;
  fadeStart?: number;
  strength?: number;
};

const clampFade = (value: number) => Math.min(Math.max(value, 0.65), 0.85);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function HeroDepth({ id, fadeStart = 0.7, strength = 0.06 }: HeroDepthProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const inputControllerRef = useRef<{ setTarget: (x: number, y: number) => void } | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [mode, setMode] = useState<'static' | 'parallax'>('static');

  const fadeValue = useMemo(() => clampFade(fadeStart), [fadeStart]);
  const overlayStyle = useMemo(() => {
    const softStart = Math.max(fadeValue - 0.2, 0);
    return {
      background: `linear-gradient(to bottom, rgba(0,0,0,0) ${softStart * 100}%, rgba(0,0,0,0.55) ${
        fadeValue * 100
      }%, rgba(0,0,0,0.95) 100%)`
    };
  }, [fadeValue]);

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
      const wrapper = imageRef.current;
      if (!wrapper) return;
      const translateIntensity = 18 * strength * 16;
      const rotateIntensity = 8 * strength * 16;
      const translateX = state.current.x * translateIntensity;
      const translateY = state.current.y * translateIntensity * 0.6;
      const rotateY = state.current.x * -rotateIntensity;
      const rotateX = state.current.y * rotateIntensity;
      wrapper.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
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
      const wrapper = imageRef.current;
      if (wrapper) {
        wrapper.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';
      }
      inputControllerRef.current = null;
    };
  }, [mode, strength]);

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
      id={id}
      aria-label={description}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#000',
        perspective: mode === 'parallax' ? '1200px' : undefined
      }}
      ref={containerRef}
    >
      <div
        ref={imageRef}
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transition: mode === 'static' ? 'transform 0.4s ease' : 'transform 0.12s linear',
          willChange: mode === 'parallax' ? 'transform' : undefined,
          transform: 'translate3d(0, 0, 0)'
        }}
      >
        <img
          src="/hero/montanas.jpg"
          alt={description}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: mode === 'parallax' ? 'scale3d(1.08, 1.08, 1)' : 'scale3d(1.02, 1.02, 1)',
            transformOrigin: 'center',
            filter: 'saturate(1.05) contrast(1.05)'
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            ...overlayStyle
          }}
        />
      </div>
    </section>
  );
}
