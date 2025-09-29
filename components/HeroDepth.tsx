'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type DepthStatus = 'unknown' | 'available' | 'missing';

type HeroDepthProps = {
  fadeStart?: number;
  strength?: number;
  layers?: number;
};

const clampFade = (value: number) => Math.min(Math.max(value, 0.65), 0.85);

const shaders = {
  vertex: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragment: /* glsl */ `
    uniform sampler2D u_tex;
    uniform sampler2D u_depth;
    uniform vec2 u_mouse;
    uniform vec2 u_res;
    uniform float u_strength;
    uniform float u_layerCount;

    vec2 clampUv(vec2 uv) {
      return clamp(uv, vec2(0.001), vec2(0.999));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float depthValue = texture2D(u_depth, uv).r;
      float layerCount = max(u_layerCount, 1.0);
      float layerIndex = floor(depthValue * layerCount);
      float maxIndex = max(layerCount - 1.0, 1.0);
      float layerFactor = layerIndex / maxIndex;
      vec2 parallax = u_mouse * (layerFactor - 0.5) * u_strength;
      vec4 color = texture2D(u_tex, clampUv(uv + parallax));
      gl_FragColor = color;
    }
  `
};

export default function HeroDepth({ fadeStart = 0.7, strength = 0.06, layers = 5 }: HeroDepthProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fallbackRef = useRef<HTMLDivElement | null>(null);
  const inputControllerRef = useRef<{ setTarget: (x: number, y: number) => void } | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [depthStatus, setDepthStatus] = useState<DepthStatus>('unknown');
  const [mode, setMode] = useState<'static' | 'three' | 'fallback'>('static');

  const fadeValue = useMemo(() => clampFade(fadeStart), [fadeStart]);
  const maskStyle = useMemo(
    () => ({
      maskImage: `linear-gradient(to bottom, rgba(0,0,0,1) ${fadeValue * 100}%, rgba(0,0,0,0) 100%)`,
      WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,1) ${fadeValue * 100}%, rgba(0,0,0,0) 100%)`
    }),
    [fadeValue]
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
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = '/hero/montanas-depth.png';
    const handleLoad = () => setDepthStatus('available');
    const handleError = () => setDepthStatus('missing');
    img.addEventListener('load', handleLoad, { once: true });
    img.addEventListener('error', handleError, { once: true });
    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setMode('static');
      return;
    }
    if (depthStatus === 'available') {
      setMode('three');
    } else if (depthStatus === 'missing') {
      setMode('fallback');
    }
  }, [reduceMotion, depthStatus]);

  useEffect(() => {
    if (mode !== 'fallback') return;

    const state = {
      target: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
      raf: null as number | null
    };

    const step = () => {
      state.raf = null;
      state.current.x += (state.target.x - state.current.x) * 0.075;
      state.current.y += (state.target.y - state.current.y) * 0.075;
      if (fallbackRef.current) {
        const maxShift = 30;
        fallbackRef.current.style.transform = `translate3d(${state.current.x * maxShift}px, ${state.current.y * maxShift}px, 0)`;
      }
      if (Math.abs(state.current.x - state.target.x) > 0.001 || Math.abs(state.current.y - state.target.y) > 0.001) {
        state.raf = requestAnimationFrame(step);
      }
    };

    inputControllerRef.current = {
      setTarget: (x, y) => {
        state.target.x = THREE.MathUtils.clamp(x, -1, 1);
        state.target.y = THREE.MathUtils.clamp(y, -1, 1);
        if (state.raf == null) {
          state.raf = requestAnimationFrame(step);
        }
      }
    };

    return () => {
      if (state.raf != null) {
        cancelAnimationFrame(state.raf);
      }
      if (fallbackRef.current) {
        fallbackRef.current.style.transform = 'translate3d(0, 0, 0)';
      }
      inputControllerRef.current = null;
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== 'three') return;
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const loader = new THREE.TextureLoader();

    type UniformMap = Record<string, { value: unknown }>;

    const state = {
      target: new THREE.Vector2(),
      current: new THREE.Vector2(),
      raf: null as number | null,
      frame: null as number | null,
      uniforms: null as UniformMap | null,
      material: null as any,
      mesh: null as any,
      colorTex: null as any,
      depthTex: null as any
    };

    const scheduleRender = () => {
      if (state.frame != null) return;
      state.frame = requestAnimationFrame(() => {
        state.frame = null;
        if (!state.uniforms) return;
        const width = renderer.domElement.width;
        const height = renderer.domElement.height;
        const resolution = state.uniforms.u_res.value as any;
        resolution.set(width, height);
        renderer.render(scene, camera);
      });
    };

    const step = () => {
      state.raf = null;
      state.current.lerp(state.target, 0.08);
      if (state.uniforms) {
        const mouse = state.uniforms.u_mouse.value as any;
        mouse.copy(state.current);
      }
      scheduleRender();
      if (state.current.distanceTo(state.target) > 0.001) {
        state.raf = requestAnimationFrame(step);
      }
    };

    inputControllerRef.current = {
      setTarget: (x, y) => {
        state.target.set(THREE.MathUtils.clamp(x, -1, 1), THREE.MathUtils.clamp(y, -1, 1));
        if (state.raf == null) {
          state.raf = requestAnimationFrame(step);
        }
      }
    };

    Promise.all([
      loader.loadAsync('/hero/montanas.jpg'),
      loader.loadAsync('/hero/montanas-depth.png')
    ])
      .then(([colorTex, depthTex]) => {
        if (disposed) {
          colorTex.dispose();
          depthTex.dispose();
          return;
        }
        colorTex.colorSpace = THREE.SRGBColorSpace;
        colorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        colorTex.wrapS = THREE.ClampToEdgeWrapping;
        colorTex.wrapT = THREE.ClampToEdgeWrapping;
        depthTex.wrapS = THREE.ClampToEdgeWrapping;
        depthTex.wrapT = THREE.ClampToEdgeWrapping;

        const uniforms: UniformMap = {
          u_tex: { value: colorTex },
          u_depth: { value: depthTex },
          u_mouse: { value: new THREE.Vector2() },
          u_strength: { value: strength },
          u_res: { value: new THREE.Vector2(renderer.domElement.width, renderer.domElement.height) },
          u_layerCount: { value: Math.max(1, Math.floor(layers)) }
        };

        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: shaders.vertex,
          fragmentShader: shaders.fragment
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        state.uniforms = uniforms;
        state.material = material;
        state.mesh = mesh;
        state.colorTex = colorTex;
        state.depthTex = depthTex;
        if (state.raf == null) {
          state.raf = requestAnimationFrame(step);
        }
        scheduleRender();
      })
      .catch(() => {
        if (!disposed) {
          setMode('fallback');
        }
      });

    const handleResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight, false);
      scheduleRender();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      if (state.raf != null) cancelAnimationFrame(state.raf);
      if (state.frame != null) cancelAnimationFrame(state.frame);
      if (state.mesh) scene.remove(state.mesh);
      if (state.material) state.material.dispose();
      if (state.colorTex) state.colorTex.dispose();
      if (state.depthTex) state.depthTex.dispose();
      geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      inputControllerRef.current = null;
    };
  }, [mode, strength, layers]);

  useEffect(() => {
    if (mode === 'static') return;

    const handlePointerMove = (event: PointerEvent) => {
      const controller = inputControllerRef.current;
      if (!controller) return;
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = -((event.clientY / window.innerHeight) * 2 - 1);
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
        const gamma = THREE.MathUtils.clamp(event.gamma / 20, -1, 1);
        const beta = THREE.MathUtils.clamp(event.beta / 20, -1, 1);
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

  return (
    <section
      aria-hidden="true"
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
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      ) : null}
      {mode === 'fallback' ? (
        <div
          ref={fallbackRef}
          aria-hidden
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/hero/montanas.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#000',
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform'
          }}
        />
      ) : null}
    </section>
  );
}
