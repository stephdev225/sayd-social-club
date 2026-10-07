"use client";

import { useEffect, useRef } from "react";

/**
 * Animated WebGL backdrop: slow, warped silk-like light in the brand colours
 * (sable gold, wine, charcoal), with a soft glow that follows the pointer.
 * - Pauses when off screen, renders a single still frame with reduced motion.
 * - Renders at reduced resolution (it is a soft gradient, sharpness is useless).
 * - Draws nothing if WebGL is unavailable: the page underneath stays as is.
 */
const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_intensity;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 q = uv; q.x *= u_res.x / u_res.y;
  float t = u_time * 0.045;

  // Domain warping: two layers of noise bend a third, like silk folding.
  vec2 w1 = vec2(fbm(q * 1.6 + t), fbm(q * 1.6 - t + 4.0));
  vec2 w2 = vec2(fbm(q * 1.3 + 2.5 * w1 + vec2(1.7, 9.2) + t * 0.8), fbm(q * 1.3 + 2.5 * w1 + vec2(8.3, 2.8) - t * 0.6));
  float f = fbm(q * 1.2 + 2.2 * w2);

  vec3 charcoal = vec3(0.071, 0.059, 0.055);
  vec3 wine = vec3(0.353, 0.078, 0.125);
  vec3 sable = vec3(0.851, 0.698, 0.416);

  vec3 col = mix(charcoal, wine, smoothstep(0.25, 0.85, f));
  col = mix(col, sable, smoothstep(0.62, 0.95, f * (0.6 + 0.6 * length(w2))) * 0.55);

  // Pointer glow (eased on the JS side).
  vec2 m = u_mouse; m.x *= u_res.x / u_res.y;
  float d = distance(q, m);
  col += sable * 0.22 * exp(-d * d * 7.0);

  // Vignette keeps the edges deep so text stays readable.
  float vig = smoothstep(1.25, 0.25, distance(uv, vec2(0.5, 0.55)));
  col *= mix(0.55, 1.0, vig);

  gl_FragColor = vec4(col, u_intensity);
}
`;

export function ShaderBackdrop({ className = "", intensity = 1, interactive = true }: { className?: string; intensity?: number; interactive?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false, alpha: true });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uIntensity = gl.getUniformLocation(prog, "u_intensity");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;
    const scale = small ? 0.35 : 0.5;

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const target = { x: 0.7, y: 0.6 };
    const mouse = { x: 0.7, y: 0.6 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
    };
    if (interactive && !reduce) window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let visible = true;
    const start = performance.now() - Math.random() * 20000;
    const frame = () => {
      resize();
      mouse.x += (target.x - mouse.x) * 0.04;
      mouse.y += (target.y - mouse.y) * 0.04;
      // Without a mouse, the glow drifts slowly on its own.
      const t = (performance.now() - start) / 1000;
      const drift = small || !interactive ? { x: 0.5 + 0.25 * Math.sin(t * 0.21), y: 0.55 + 0.2 * Math.cos(t * 0.17) } : mouse;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, drift.x, drift.y);
      gl.uniform1f(uIntensity, intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce && visible) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [intensity, interactive]);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none block h-full w-full ${className}`} />;
}
