import React from "react";

// Hero background: a procedural liquid-metal surface drawn with raw WebGL (no library).
// Folds come from a warped height field; the light follows the pointer and the folds roll with scroll.
// Colours are the site's navy palette. Falls back to a CSS gradient when WebGL is missing.

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform float uScroll;

float field(vec2 p){
  vec2 q = p;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    q += 0.42 * vec2(
      sin(q.y * 1.6 + uTime * 0.25 + fi * 1.7 + uScroll * 1.4),
      cos(q.x * 1.3 - uTime * 0.2 + fi * 2.3)
    );
  }
  return 0.5 + 0.5 * sin(q.x * 2.3 + q.y * 1.5);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 pt = (uPointer - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  vec2 p = uv * 2.4 + vec2(0.0, uScroll * 0.9);
  // The surface bends gently toward the pointer.
  vec2 d = uv - pt;
  p += 0.18 * d * exp(-dot(d, d) * 3.0);

  float e = 0.0025;
  float h = field(p);
  float hx = (field(p + vec2(e, 0.0)) - field(p - vec2(e, 0.0))) / (2.0 * e);
  float hy = (field(p + vec2(0.0, e)) - field(p - vec2(0.0, e))) / (2.0 * e);
  vec3 n = normalize(vec3(-hx * 0.35, -hy * 0.35, 1.0));

  vec3 L = normalize(vec3(pt * 1.6, 0.9));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  float dif = max(dot(n, L), 0.0);
  float spec = pow(max(dot(n, H), 0.0), 70.0);
  float rim = pow(1.0 - max(n.z, 0.0), 1.6);

  vec3 deep  = vec3(0.020, 0.040, 0.085);   // #050A16
  vec3 navy  = vec3(0.039, 0.184, 0.361);   // #0A2F5C
  vec3 line  = vec3(0.184, 0.435, 0.690);   // #2F6FB0
  vec3 light = vec3(0.553, 0.722, 0.949);   // #8DB8F2

  // Brushed-metal reflection: bands of an imagined studio environment seen in the folds.
  vec3 R = reflect(-V, n);
  float env = smoothstep(0.15, 0.55, R.y + 0.25 * R.x) * (1.0 - smoothstep(0.55, 0.95, R.y + 0.25 * R.x));
  vec3 col = mix(deep, navy, smoothstep(0.05, 0.95, pow(dif, 1.6) * (0.5 + 0.5 * h)));
  col += line * env * 0.55;
  col += line * rim * 0.6;
  col += light * spec * 1.1;
  // Soft glow around the pointer.
  col += line * 0.16 * exp(-dot(d, d) * 5.0);
  // Vignette, darker toward the bottom so the content that follows reads well.
  float vig = smoothstep(1.25, 0.25, length(uv * vec2(0.8, 1.0)));
  col *= mix(0.35, 1.0, vig);
  col *= mix(0.55, 1.0, smoothstep(-0.55, 0.1, uv.y));
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
  return s;
}

export function MetalShader({ className }) {
  const ref = React.useRef(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    const canvas = ref.current;
    const gl = canvas && (canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" }));
    if (!gl) { setFailed(true); return; }
    const vs = compile(gl, gl.VERTEX_SHADER, VERT), fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { setFailed(true); return; }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFailed(true); return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes"), uTime = gl.getUniformLocation(prog, "uTime"),
      uPointer = gl.getUniformLocation(prog, "uPointer"), uScroll = gl.getUniformLocation(prog, "uScroll");

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: 0.62, y: 0.62 }, cur = { x: 0.62, y: 0.62 };
    let visible = true, raf = 0, last = performance.now(), time = 8;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * (window.innerWidth < 768 ? 0.75 : 1);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    };
    const draw = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!still) time += dt;
      cur.x += (target.x - cur.x) * 0.06; cur.y += (target.y - cur.y) * 0.06;
      resize();
      const scroll = Math.min(1.5, window.scrollY / Math.max(1, canvas.clientHeight));
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uPointer, cur.x, cur.y);
      gl.uniform1f(uScroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = now => { draw(now); raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0; };
    const kick = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } };

    const onMove = e => {
      const r = canvas.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width; target.y = 1 - (e.clientY - r.top) / r.height;
      if (still) draw(performance.now());
    };
    const onScroll = () => { if (still && visible) draw(performance.now()); };
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (still) draw(performance.now()); else kick(); });
    io.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("visibilitychange", kick);
    if (still) draw(performance.now()); else kick();

    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", kick);
    };
  }, []);

  return failed
    ? <div aria-hidden="true" className={className} style={{ background: "radial-gradient(80% 60% at 65% 35%, #1B4E8A 0%, #0A2F5C 38%, #050A16 100%)" }} />
    : <canvas ref={ref} aria-hidden="true" className={className} />;
}
