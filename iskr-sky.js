(() => {
if (customElements.get('iskr-sky')) return;
const W = 1280, H = 820, HZ = 566;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const gauss = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));
const hn = x => ((x % 360) + 360) % 360;
const mixH = (a, b, k) => hn(a + (((b - a + 540) % 360) - 180) * k);
function rng(seed) { let s = (Math.abs(Math.floor(seed)) * 2654435761 + 1) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function oklch(l, c, h) {
  const hr = h * Math.PI / 180, a = c * Math.cos(hr), b = c * Math.sin(hr);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3, m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3, s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const f = x => { x = clamp(x); return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055); };
  return [f(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_), f(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_), f(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_)];
}
const mixC = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k), lerp(p[2], q[2], k)];
const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
function makeNoise(seed) {
  const r = rng(seed), perm = new Uint16Array(512), base = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0; [base[i], base[j]] = [base[j], base[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = base[i & 255];
  const vals = new Float32Array(256).map(() => r());
  const n2 = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const X = xi & 255, Y = yi & 255;
    return lerp(lerp(vals[perm[X + perm[Y]]], vals[perm[X + 1 + perm[Y]]], u), lerp(vals[perm[X + perm[Y + 1]]], vals[perm[X + 1 + perm[Y + 1]]], u), v);
  };
  const fbm = (x, y, o = 5) => { let s = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < o; i++) { s += a * n2(x * f + i * 31.7, y * f); n += a; a *= 0.5; f *= 2.03; } return s / n; };
  return { n2, fbm };
}
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };

// ---------- static geometry (shared) ----------
let MAPS = null, GEO = null, MILKY = null, GRAIN = null;
const CLOUDS = new Map();
function ridgeFn(seed, base, amp, freq) {
  const N = makeNoise(seed), R = new Float32Array(W + 1);
  for (let x = 0; x <= W; x++) {
    let s = 0, a = 1, f = freq, n = 0;
    for (let o = 0; o < 4; o++) { const v = 1 - Math.abs(N.n2(x * f, o * 17.3) * 2 - 1); s += a * v * v; n += a; a *= 0.4; f *= 2.2; }
    R[x] = base - amp * (s / n) * (0.55 + 0.6 * N.n2(x * freq * 0.35, 91.1));
  }
  return R;
}
function buildMaps() {
  if (MAPS) return MAPS;
  const MW = W / 2;
  const defs = [
    { seed: 11, base: 540, amp: 320, freq: 0.0026, snow: true, bottom: HZ + 6, hz: 0.5, mat: 'rockFar' },
    { seed: 23, base: 556, amp: 170, freq: 0.0045, bottom: HZ + 6, hz: 0.36, mat: 'rockMid' },
    { seed: 37, base: 572, amp: 70, freq: 0.0105, bottom: HZ + 10, hz: 0.26, forest: true, mat: 'forest' }
  ];
  MAPS = defs.map(d => {
    const R = ridgeFn(d.seed, d.base, d.amp, d.freq), N = makeNoise(d.seed + 100);
    let top = Infinity; for (const v of R) top = Math.min(top, v);
    const y0 = Math.max(0, Math.floor(top / 2) - 2), rows = Math.ceil(d.bottom / 2) - y0, n = MW * rows;
    const sL = new Float32Array(n), sR = new Float32Array(n), snow = new Float32Array(n), vert = new Float32Array(n).fill(-1);
    for (let my = 0; my < rows; my++) for (let mx = 0; mx < MW; mx++) {
      const x = mx * 2, y = (my + y0) * 2, r = R[x], dd = y - r, i = my * MW + mx;
      if (dd < -4) continue;
      const s = 4 + Math.max(0, dd) * 0.75;
      const slope = (R[Math.min(W, Math.round(x + s))] - R[Math.max(0, Math.round(x - s))]) / (2 * s);
      const nz = N.fbm(x * 0.012, y * 0.028, 4) - 0.5, st = N.fbm(x * 0.045 + y * 0.03 * Math.sign(slope || 1), y * 0.02, 3) - 0.5;
      const b = slope * 2.6;
      sL[i] = clamp(0.5 - b + nz * 0.55 + st * 0.22); sR[i] = clamp(0.5 + b + nz * 0.55 + st * 0.22);
      vert[i] = clamp((y - top) / (d.bottom - top));
      const sl = top + 70 + (N.fbm(x * 0.008, 7.7, 3) - 0.5) * 110;
      snow[i] = d.snow ? smooth(-8, 10, sl - y) * smooth(-0.2, 0.08, st + 0.04 + (0.35 - Math.abs(slope)) * 0.3) : smooth(0.55, 0.25, vert[i]) * smooth(-0.1, 0.12, st + 0.05);
    }
    const path = new Path2D(); path.moveTo(-2, R[0]); for (let x = 0; x <= W; x += 2) path.lineTo(x, R[x]); path.lineTo(W + 2, R[W]); path.lineTo(W + 2, d.bottom + 60); path.lineTo(-2, d.bottom + 60); path.closePath();
    let trees = null;
    if (d.forest) { const r = rng(77); trees = []; for (let x = 0; x <= W; x += 3) if (r() < 0.75) { const hh = 6 + r() * 14 * (1 - (R[x] - top) / (d.base - top) * 0.4); trees.push([x + r() * 3, R[x] + 2 + r() * 6, hh]); } }
    return { ...d, R, top, y0, rows, sL, sR, snow, vert, MW, path, trees };
  });
  return MAPS;
}
function buildGeo() {
  if (GEO) return GEO;
  const r = rng(5);
  const strokes = (n, y0, y1, h0, h1) => Array.from({ length: n }, () => ({ x: r() * W, y: lerp(y0, y1, r() ** 0.8), h: lerp(h0, h1, r()), b: (r() - 0.5) * 6, k: r(), w: 0.8 + r() * 1.2 }));
  GEO = {
    stars: Array.from({ length: 200 }, () => ({ x: r() * W, y: r() * (HZ - 40), r: 0.4 + r() ** 3 * 1.6, sp: 0.6 + r() * 2.5, ph: r() * 6.3, t: r() })),
    meadowS: strokes(700, 600, 760, 2.5, 6).map(s => ({ ...s, h: s.h * (0.6 + (s.y - 600) / 160) })),
    foreS: strokes(1100, 700, 850, 5, 15).map(s => ({ ...s, h: s.h * (0.5 + (s.y - 700) / 150) })),
    flies: Array.from({ length: 26 }, () => ({ x: r() < 0.5 ? r() * 360 : 920 + r() * 360, y: 640 + r() * 170, ph: r() * 6.3, sp: 0.4 + r() * 0.6 })),
    snow: Array.from({ length: 420 }, () => ({ x: r() * W, y: r() * H, v: 18 + r() * 34, s: 0.8 + r() * 2.2, ph: r() * 6.3, z: r() })),
    leaves: Array.from({ length: 22 }, () => ({ x: r() * W, y: r() * H, v: 20 + r() * 25, ph: r() * 6.3, s: 3 + r() * 3, hue: 30 + r() * 40 })),
    ripples: Array.from({ length: 26 }, () => ({ x: r() * W, y: HZ + 4 + r() ** 1.4 * 70, w: 20 + r() * 120, sp: 3 + r() * 6, ph: r() * 6.3 })),
    glit: Array.from({ length: 60 }, () => [r(), r(), r()]),
    patches: Array.from({ length: 70 }, () => ({ x: r() * W, y: 610 + r() * 230, r: 60 + r() * 160, k: r() })),
    meadow: new Path2D('M-20 880 L-20 612 Q220 590 520 620 Q800 650 1010 628 Q1180 610 1300 618 L1300 880 Z'),
    meadowTop: new Path2D('M-20 612 Q220 590 520 620 Q800 650 1010 628 Q1180 610 1300 618'),
    fore: new Path2D('M-20 880 L-20 728 Q200 700 430 746 Q700 802 1000 754 Q1180 720 1300 728 L1300 880 Z'),
    foreTop: new Path2D('M-20 728 Q200 700 430 746 Q700 802 1000 754 Q1180 720 1300 728'),
    mid: [[214, 610, 46], [232, 608, 62], [252, 606, 84], [276, 610, 56], [298, 612, 70], [322, 616, 48], [344, 620, 38], [948, 640, 44], [972, 636, 66], [996, 632, 88], [1024, 630, 60], [1050, 628, 74], [1078, 624, 50], [1136, 616, 54], [1162, 616, 72], [1192, 618, 58], [1222, 620, 46]],
    back: [[12, 744, 300], [312, 750, 128]],
    front: [[1030, 800, 190], [1118, 792, 340], [1236, 786, 470]]
  };
  return GEO;
}
function buildMilky() {
  if (MILKY) return MILKY;
  const w = 320, h = Math.ceil(HZ / 4), cv = mk(w, h), c = cv.getContext('2d'), img = c.createImageData(w, h), N = makeNoise(9), r = rng(3);
  const ax = 0.12 * w, ay = 0, bx = 0.78 * w, by = h, L = Math.hypot(bx - ax, by - ay);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const d = ((bx - ax) * (ay - y) - (ax - x) * (by - ay)) / L;
    const n = N.fbm(x * 0.03, y * 0.03, 5), lane = gauss(d + (n - 0.5) * 14, 2, 4.5) * smooth(0.3, 0.6, N.fbm(x * 0.05 + 9, y * 0.05, 3));
    const v = clamp(gauss(d, 0, 15) * (0.2 + 1.1 * n) - lane * 0.7), i = (y * w + x) * 4;
    img.data[i] = 225; img.data[i + 1] = 230; img.data[i + 2] = 255; img.data[i + 3] = v * 120;
  }
  c.putImageData(img, 0, 0);
  for (let k = 0; k < 900; k++) { const t = r(), x = lerp(ax, bx, t) + (r() - 0.5) * 50 * (r() + 0.3), y = lerp(ay, by, t) + (r() - 0.5) * 20; c.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`; c.fillRect(x, y, 0.5, 0.5); }
  return MILKY = cv;
}
function buildGrain() {
  if (GRAIN) return GRAIN;
  const cv = mk(256, 256), c = cv.getContext('2d'), img = c.createImageData(256, 256), r = rng(12);
  for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (r() - 0.5) * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  c.putImageData(img, 0, 0);
  return GRAIN = cv;
}
function cloudSet(doy) {
  if (CLOUDS.has(doy)) return CLOUDS.get(doy);
  const r = rng(doy * 7919 + 13), cover = r(), n = Math.round(cover * 6), arr = [];
  for (let k = 0; k < n; k++) {
    const w = 260 + r() * 340, h = w * (0.34 + r() * 0.12), sw = Math.round(w / 2), sh = Math.round(h / 2), N = makeNoise(doy * 31 + k * 7 + 1);
    const a = new Float32Array(sw * sh), l = new Float32Array(sw * sh), sx = 3.4 * (w / 320);
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
      const nx = x / sw, ny = y / sh, dx = (nx - 0.5) * 2, dy = ny < 0.62 ? (0.62 - ny) / 0.62 : (ny - 0.62) / 0.38 * 2;
      const e = 1 - (dx * dx + dy * dy), f = N.fbm(nx * sx, ny * 1.7, 5), dens = (f - 0.5) * 2.4 + e * 1.15 - 0.2, i = y * sw + x;
      a[i] = smooth(0, 0.5, dens) * smooth(0, 0.1, nx) * smooth(1, 0.9, nx) * smooth(0, 0.14, ny) * smooth(1, 0.88, ny);
      const fu = N.fbm(nx * sx, (ny - 0.1) * 1.7, 4);
      l[i] = clamp(1.1 - ny * 1.05 + (fu - f) * -1.8 + dens * 0.1);
    }
    arr.push({ w, h, sw, sh, a, l, x0: r(), y: 40 + r() * 250 + k * 6, sp: 5 + r() * 9 });
  }
  if (CLOUDS.size > 40) CLOUDS.delete(CLOUDS.keys().next().value);
  CLOUDS.set(doy, arr);
  return arr;
}

// ---------- palette ----------
function seasons(doy) {
  const O = oklch;
  const M = { w: [O(0.95, 0.012, 250), O(0.93, 0.016, 250)], sp: [O(0.7, 0.13, 128), O(0.68, 0.11, 134)], su: [O(0.6, 0.13, 140), O(0.63, 0.12, 146)], au: [O(0.62, 0.1, 88), O(0.58, 0.09, 78)] };
  const K = [[0, 'w'], [62, 'w'], [100, 'sp'], [160, 'su'], [240, 'su'], [282, 'au'], [326, 'au'], [342, 'w'], [367, 'w']];
  let i = 0; while (i < K.length - 2 && doy >= K[i + 1][0]) i++;
  const k = smooth(0, 1, (doy - K[i][0]) / (K[i + 1][0] - K[i][0])), a = K[i][1], b = K[i + 1][1];
  return { grass: mixC(M[a][0], M[b][0], k), meadow: mixC(M[a][1], M[b][1], k), snowK: (a === 'w' ? 1 - k : 0) + (b === 'w' ? k : 0), summer: a === 'su' && b === 'su', autumn: a === 'au' || b === 'au' };
}
// Observer: latitude and local clock time of solar noon (Moscow ≈ 55.75°, 12:30)
const LAT = 55.75, NOON = 12.5, EPS = 23.44 * Math.PI / 180;
function astro(doy, t, abs = doy) {
  const R = Math.PI / 180, phi = LAT * R;
  const phase = ((((abs + t / 24 - 18) % 29.5306) + 29.5306) % 29.5306) / 29.5306;
  const lamS = 2 * Math.PI * (doy - 80) / 365.2422, decS = Math.asin(Math.sin(EPS) * Math.sin(lamS));
  const HS = (t - NOON) * 15 * R;
  const body = (H, dec) => {
    const sAlt = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H);
    const alt = Math.asin(clamp(sAlt, -1, 1)) / R;
    const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)) / R;
    return { s: sAlt, alt, x: W / 2 + az * (W / 205), y: HZ + 6 - (alt > 0 ? 520 * (1 - Math.exp(-alt / 8)) : alt * 7.4) };
  };
  const sun = body(HS, decS);
  const lamM = lamS + phase * 2 * Math.PI, decM = Math.asin(Math.sin(EPS) * Math.sin(lamM)) + 5.1 * R * Math.sin(lamM * 0.7 + doy * 0.23);
  const moon = body(HS - phase * 2 * Math.PI, decM);
  const h0 = Math.acos(clamp((Math.sin(-0.83 * R) - Math.sin(phi) * Math.sin(decS)) / (Math.cos(phi) * Math.cos(decS)), -1, 1)) / R / 15;
  return { sun, moon, phase, rise: NOON - h0, set: NOON + h0 };
}
function palette(doy, t, abs = doy) {
  const O = oklch;
  const AS = astro(doy, t, abs), sa = AS.sun.s, ma = AS.moon.s, phase = AS.phase, illum = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  const D = smooth(-0.04, 0.26, sa), G = gauss(sa, 0.04, 0.085), T = gauss(sa, -0.1, 0.07), N = 1 - smooth(-0.22, -0.02, sa);
  const h0 = (((abs * 137.508) % 360) + 360) % 360, hDay = mixH(h0, 235, 0.5), hNight = mixH(h0, 265, 0.6);
  const seq = (n, b, g, d, gk = 0.85) => { let c = mixC(n, d, D); c = mixC(c, b, T * 0.85); return mixC(c, g, G * gk); };
  const zen = seq(O(0.16, 0.045, hNight), O(0.3, 0.085, mixH(hNight, 280, 0.3)), O(0.44, 0.09, mixH(h0, 300, 0.45)), O(0.55, 0.11, hDay), 0.45);
  const mid = seq(O(0.21, 0.05, hNight), O(0.42, 0.09, mixH(h0, 310, 0.5)), O(0.64, 0.13, mixH(h0, 15, 0.55)), O(0.7, 0.09, hDay), 0.7);
  const hor = seq(O(0.28, 0.05, mixH(hNight, 230, 0.3)), O(0.56, 0.08, mixH(h0, 330, 0.5)), O(0.8, 0.13, 58), O(0.86, 0.05, mixH(hDay, 210, 0.4)));
  const amb = seq(O(0.34, 0.06, hNight), O(0.48, 0.07, mixH(hNight, 280, 0.3)), O(0.62, 0.08, mixH(h0, 330, 0.5)), O(0.84, 0.04, hDay));
  const sunC = mixC(O(0.72, 0.17, 38), O(0.98, 0.04, 95), smooth(0, 0.45, sa));
  const moonC = O(0.88, 0.02, 250);
  const sunK = clamp(D + G * 0.4), moonK = N * 0.34 * (0.25 + 0.75 * illum) * smooth(-0.05, 0.2, ma), ambK = 0.5 + 0.2 * D;
  const key = [0, 1, 2].map(i => (sunC[i] * sunK + moonC[i] * moonK) / 255);
  const S = seasons(doy), tint = O(0.62, 0.1, h0);
  const tm = c => mixC(c, tint, 0.1);
  const mat = {
    rockFar: tm(O(0.64, 0.03, 50)), rockMid: tm(mixC(O(0.56, 0.04, 60), S.grass, 0.25)), forest: tm(O(0.46, 0.07, 152)),
    meadow: tm(S.meadow), grass: tm(S.grass), pine: tm(O(0.43, 0.07, 160)), snow: O(0.97, 0.01, 250),
    wood: O(0.6, 0.08, 50), roof: O(0.42, 0.08, 25), trim: O(0.92, 0.015, 90), brick: O(0.52, 0.11, 35), dirt: tm(O(0.6, 0.05, 65)), fence: O(0.5, 0.05, 55)
  };
  const light = (m, f, hz) => { const o = [0, 0, 0]; for (let i = 0; i < 3; i++) o[i] = clamp(m[i] * (amb[i] / 255 * ambK + key[i] * f * 1.05), 0, 255); return mixC(o, hor, hz || 0); };
  const sx = AS.sun.x, mx = AS.moon.x;
  const lx = D > 0.05 || G > 0.2 ? sx : mx;
  const warm = Math.max(gauss(t, AS.rise + 0.5, 1.1), gauss(t, AS.set - 0.3, 1.2)), hh = mixH(h0, 30, warm * 0.55), spread = 28 + (((abs * 29) % 48) + 48) % 48;
  const br = rng(abs * 3 + 1);
  const blobs = [hh, hh + spread, hh - spread * 0.8, hh + 150 + (((abs % 4) + 4) % 4) * 25].map(q => ({ c: O(0.7, 0.15, q), x: 0.1 + br() * 0.8, y: 0.15 + br() * 0.6, r: 260 + br() * 220, sp: 0.04 + br() * 0.05, ph: br() * 6.3 }));
  const cloudLit = seq(mixC(O(0.24, 0.03, hNight), O(0.6, 0.03, 250), clamp(moonK * 3)), O(0.62, 0.08, mixH(h0, 330, 0.5)), O(0.86, 0.12, 52), O(0.98, 0.01, hDay));
  const cloudSh = seq(O(0.17, 0.035, hNight), O(0.38, 0.07, mixH(hNight, 290, 0.4)), O(0.52, 0.11, mixH(h0, 345, 0.6)), O(0.76, 0.03, hDay));
  return {
    t, doy, D, G, T, N, sa, illum, phase, zen, mid, hor, sunC, moonC, mat, light, S, blobs, cloudLit, cloudSh,
    fl: smooth(W * 0.62, W * 0.38, lx), blobA: 0.12 + 0.1 * N,
    fog: 0.12 + 0.62 * gauss(t, AS.rise + 0.4, 1.3) + 0.25 * gauss(t, AS.set + 0.6, 1.5), AS, abs, fogC: mixC(hor, [255, 255, 255], 0.15 + 0.25 * D),
    lake: mixC(mixC(zen, hor, 0.35), [0, 0, 0], 0.35),
    lit: (t >= 17.75 && t < 23.6) || (t >= 5.6 && t < 7.8) || ((doy >= 354 || doy <= 10) && t >= 16.5) || ((doy === 365 || doy === 1) && t < 1.5),
    ny: doy >= 354 || doy <= 10, nye: (doy === 365 && t >= 23.4) || (doy === 1 && t < 1.2)
  };
}

// ---------- drawing helpers ----------
function pine(c, x, by, h, dark, lit, fl, seed, snowC, snowK) {
  const r = rng(seed), w = h * 0.3, tiers = h > 150 ? 10 : h > 60 ? 7 : 5, Lp = [], Rp = [];
  for (let i = 0; i < tiers; i++) {
    const k = i / tiers, k2 = (i + 1) / tiers, yb = by - h * 0.1 - k * h * 0.86, yt = by - h * 0.1 - k2 * h * 0.86, wb = w * Math.pow(1 - k, 0.95) * (0.88 + r() * 0.26);
    Lp.push([x - wb, yb + h * 0.012 * (1 + r())], [x - wb * 0.3, yt + h * 0.035]);
    Rp.push([x + wb * (0.94 + r() * 0.12), yb + h * 0.012 * (1 + r())], [x + wb * 0.3, yt + h * 0.035]);
  }
  { const tw = h * 0.05, tg = c.createLinearGradient(x - tw / 2, 0, x + tw / 2, 0), bark = mixC(dark, [120, 80, 52], 0.42), barkL = mixC(lit, [150, 100, 64], 0.5);
    tg.addColorStop(0, css(fl > 0.5 ? barkL : bark)); tg.addColorStop(1, css(fl > 0.5 ? bark : barkL));
    c.fillStyle = 'rgba(15,20,25,.18)'; c.beginPath(); c.ellipse(x + (0.5 - fl) * h * 0.12, by, h * 0.16, h * 0.022 + 1, 0, 0, 7); c.fill();
    c.fillStyle = tg; c.beginPath(); c.moveTo(x - tw * 0.4, by - h * 0.15); c.lineTo(x + tw * 0.4, by - h * 0.15); c.lineTo(x + tw * 0.55, by); c.lineTo(x - tw * 0.55, by); c.closePath(); c.fill(); }
  c.beginPath(); c.moveTo(x, by - h * 0.1);
  Lp.forEach(p => c.lineTo(p[0], p[1])); c.lineTo(x, by - h);
  for (let i = Rp.length - 1; i >= 0; i--) c.lineTo(Rp[i][0], Rp[i][1]);
  c.closePath();
  const g = c.createLinearGradient(x - w, 0, x + w, 0), a = mixC(dark, lit, lerp(0.15, 1, fl)), b = mixC(dark, lit, lerp(1, 0.15, fl));
  g.addColorStop(0, css(a)); g.addColorStop(0.5, css(mixC(a, b, 0.5))); g.addColorStop(1, css(b));
  c.fillStyle = g; c.fill();
  if (snowK > 0.3) {
    const al = clamp((snowK - 0.3) * 1.6), rs = rng(seed * 13 + 7), maxTh = 1.2 + h * 0.028;
    const shade = mixC(snowC, [60, 80, 125], 0.42);
    c.save(); c.globalAlpha = al * 0.14; c.fillStyle = css(snowC); c.fill(); c.globalAlpha = al;
    const side = (T, N, col, dir, tierK) => {
      const s0 = 0.12 + rs() * 0.1, s1 = 0.78 + rs() * 0.2, dx = T[0] - N[0], dy = T[1] - N[1], len = Math.hypot(dx, dy) || 1;
      let nx = -dy / len, ny = dx / len; if (ny > 0) { nx = -nx; ny = -ny; }
      const nb = 2 + Math.floor(rs() * 3), ph = rs() * 3, top = [], bot = [], n = 12;
      for (let j = 0; j <= n; j++) {
        const q = j / n, sq = s0 + q * (s1 - s0), px = N[0] + dx * sq, py = N[1] + dy * sq;
        const th = Math.max(0.8, h * 0.086 * 0.34) * (0.7 + 0.3 * (1 - tierK)) * Math.sin(Math.PI * q) ** 0.45 * (0.7 + 0.3 * q) * (0.72 + 0.4 * Math.abs(Math.sin(q * Math.PI * nb + ph)));
        top.push([px + nx * th * 0.35, py + ny * th * 0.35]); bot.push([px - nx * th, py - ny * th]);
      }
      c.fillStyle = col; c.beginPath(); c.moveTo(top[0][0], top[0][1]);
      for (let j = 1; j < top.length; j++) c.lineTo(top[j][0], top[j][1]);
      for (let j = bot.length - 1; j >= 0; j--) c.lineTo(bot[j][0], bot[j][1]);
      c.closePath(); c.fill();
    };
    const cl = css(mixC(shade, snowC, lerp(0.35, 1, fl))), cr = css(mixC(shade, snowC, lerp(1, 0.35, fl)));
    const nT = Lp.length / 2;
    for (let i = 0; i < Lp.length; i += 2) {
      const tierK = (i / 2 + 1) / nT;
      if (i >= Lp.length - 4) continue;
      if (rs() > 0.1) side(Lp[i], Lp[i + 1], cl, -1, tierK);
      if (rs() > 0.1) side(Rp[i], Rp[i + 1], cr, 1, tierK);
    }
    c.fillStyle = cl; c.beginPath(); c.moveTo(x, by - h - 0.5); c.quadraticCurveTo(x - h * 0.006, by - h * 0.988, x - h * 0.011, by - h * 0.976); c.quadraticCurveTo(x - h * 0.004, by - h * 0.97, x, by - h * 0.974); c.quadraticCurveTo(x + h * 0.005, by - h * 0.968, x + h * 0.011, by - h * 0.977); c.quadraticCurveTo(x + h * 0.006, by - h * 0.988, x, by - h - 0.5); c.fill();
    c.restore();
  }
}
function drawMoon(c, x, y, r, phase, alpha, sky, night) {
  const waxing = phase < 0.5, ct = Math.cos(phase * 2 * Math.PI), rx = Math.abs(ct) * r;
  c.save(); c.translate(x, y); c.globalAlpha = alpha;
  c.globalAlpha = alpha * night; c.fillStyle = css(mixC(sky, [200, 210, 235], 0.12)); c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill(); c.globalAlpha = alpha;
  const P = new Path2D();
  if (waxing) { P.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false); if (ct > 0) P.ellipse(0, 0, rx, r, 0, Math.PI / 2, -Math.PI / 2, true); else P.ellipse(0, 0, rx, r, 0, Math.PI / 2, Math.PI * 1.5, false); }
  else { P.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, true); if (ct > 0) P.ellipse(0, 0, rx, r, 0, Math.PI / 2, Math.PI * 1.5, false); else P.ellipse(0, 0, rx, r, 0, Math.PI / 2, -Math.PI / 2, true); }
  P.closePath();
  const g = c.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r); g.addColorStop(0, '#fdfdfb'); g.addColorStop(0.7, '#e6e8ef'); g.addColorStop(1, '#c9cedb');
  c.fillStyle = g; c.fill(P);
  c.save(); c.clip(P); c.fillStyle = 'rgba(140,148,172,.28)';
  [[-0.35, -0.2, 0.28], [0.2, 0.25, 0.2], [0.1, -0.45, 0.14], [-0.1, 0.45, 0.12], [0.45, -0.05, 0.16]].forEach(([a, b, s]) => { c.beginPath(); c.arc(a * r, b * r, s * r, 0, Math.PI * 2); c.fill(); });
  c.restore(); c.restore();
}
function drawHouse(c, P) {
  const M = P.mat, fl = P.fl, fF = lerp(0.3, 0.92, fl), fS = lerp(0.92, 0.28, fl), fR = lerp(0.95, 0.6, fl), snowK = P.S.snowK;
  const L = (m, f) => css(P.light(m, f, 0.02));
  const fill = (d, col) => { c.fillStyle = col; c.fill(new Path2D(d)); };
  const ao = (d, y0, y1, a) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); c.fillStyle = g; c.fill(new Path2D(d)); };
  const line = (d, col, w, a) => { c.strokeStyle = col; c.lineWidth = w; c.globalAlpha = a; c.stroke(new Path2D(d)); c.globalAlpha = 1; };
  c.save(); c.translate(34, 513); c.scale(1.1, 1.1); c.lineJoin = 'round'; c.lineCap = 'round';
  const trimC = f => L(M.trim, lerp(0.35, 0.9, f));
  const SW = 'M110 84 L206 90 L206 181 L110 193 Z', FW = 'M6 192 L6 84 L58 31 L110 84 L110 192 Z';
  fill(SW, L(M.wood, fS)); ao(SW, 96, 192, 0.3);
  line('M110 108 L206 110 M110 126 L206 127 M110 144 L206 144 M110 162 L206 160 M110 180 L206 177', L(M.wood, 0), 1, 0.45);
  fill(FW, L(M.wood, fF)); ao(FW, 70, 192, 0.25);
  line('M6 106 H110 M6 124 H110 M6 142 H110 M6 160 H110 M6 178 H110', L(M.wood, 0), 1, 0.45);
  fill('M110 86 L206 92 L206 104 L110 99 Z', 'rgba(0,0,0,.28)');
  const RF = 'M57 29 L152 24 L216 92 L121 95 Z';
  fill(RF, L(snowK > 0.5 ? M.snow : M.roof, fR));
  if (snowK <= 0.5) line('M70 42 L163 36 M82 54 L174 48 M94 66 L186 61 M106 78 L198 73 M118 90 L208 86', L(M.roof, 0), 1.6, 0.6);
  else ao(RF, 24, 98, 0.12);
  fill('M116 93.5 L216 92 L216 96.5 L117 98.5 Z', L(M.roof, 0.2));
  fill('M138 14 L152 13 L152 52 L138 54 Z', L(M.brick, fF)); fill('M152 13 L161 15 L161 49 L152 52 Z', L(M.brick, fS));
  fill('M135 10 L154 9 L164 12 L164 16 L135 16 Z', L(M.roof, 0.3));
  c.strokeStyle = L(M.trim, lerp(0.5, 0.95, fl)); c.lineWidth = 7; c.stroke(new Path2D('M-4 94 L58 30 L119 92.5'));
  fill('M5 183 H110 V199 H5 Z', L(M.brick, fF * 0.6)); fill('M110 183 L206 171.5 L206 191 L110 199 Z', L(M.brick, fS * 0.6));
  fill('M110 99 L114 99 L114 198.5 L110 199 Z', 'rgba(0,0,0,.14)'); fill('M110 99 L111.2 99 L111.2 199 L110 199 Z', `rgba(255,255,255,${(0.12 * P.D).toFixed(3)})`);
  const glass = (d, cx, cy) => {
    let g;
    if (P.lit) { g = c.createRadialGradient(cx, cy, 0, cx, cy, 24); g.addColorStop(0, '#fff3d0'); g.addColorStop(1, '#ffb955'); }
    else { g = c.createLinearGradient(0, cy - 16, 0, cy + 16); g.addColorStop(0, css(mixC(P.hor, [0, 0, 0], 0.15))); g.addColorStop(1, css(mixC(P.zen, [0, 0, 0], 0.5))); }
    c.fillStyle = g; c.fill(new Path2D(d));
  };
  const trim = L(M.trim, lerp(0.55, 0.95, fl)), trimS = L(M.trim, lerp(0.95, 0.5, fl));
  glass('M48 68 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0', 58, 68); c.strokeStyle = trim; c.lineWidth = 3; c.beginPath(); c.arc(58, 68, 10, 0, Math.PI * 2); c.stroke();
  glass('M70 112 H98 V146 H70 Z', 84, 129); c.lineWidth = 3; c.strokeRect(70, 112, 28, 34); c.lineWidth = 2; c.stroke(new Path2D('M84 112 V146 M70 129 H98'));
  fill('M66 148 H102 V152 H66 Z', trim);
  fill('M28 132 H54 V188 H28 Z', L(M.roof, fF * 0.7)); c.lineWidth = 2.5; c.strokeRect(28, 132, 26, 56);
  c.fillStyle = trim; c.beginPath(); c.arc(49, 162, 1.8, 0, 7); c.fill();
  c.fillStyle = L(M.roof, 0.3); c.fillRect(55.5, 125, 3.5, 1.6); c.fillRect(58.2, 121.5, 1.4, 5); c.fillStyle = P.lit ? '#fff0c2' : trim; c.beginPath(); c.arc(59, 128.6, 2.8, 0, 7); c.fill();
  [['M126 113.6 L154 114 L154 151.2 L126 152.8 Z', 140, 131.9, 'M140 113.8 V152 M126 132.2 L154 131.6', 'M123.5 153.7 L156 151.8 L156 154.6 L123.5 156.7 Z', 2.6], ['M168 114.1 L192 114.4 L192 149 L168 150.4 Z', 180, 131, 'M180 114.3 V149.7 M168 131.3 L192 130.8', 'M165.5 151.3 L194 149.6 L194 152.2 L165.5 154 Z', 2.3]].forEach(([d, cx, cy, m, sl, lw]) => { glass(d, cx, cy); c.strokeStyle = trimS; c.lineWidth = lw; c.stroke(new Path2D(d)); c.lineWidth = lw * 0.62; c.stroke(new Path2D(m)); fill(sl, trimS); });
  { const stone = oklch(0.62, 0.015, 70), top = snowK > 0.5 ? M.snow : stone;
    c.fillStyle = 'rgba(15,20,30,.22)'; c.beginPath(); c.ellipse(41, 200.5, 23, 2.6, 0, 0, 7); c.fill();
    fill('M23 190.5 L59 190.5 L62 194 L20 194 Z', L(top, lerp(0.55, 1, fl)));
    fill('M20 194 L62 194 L62 199.5 L20 199.5 Z', L(stone, 0.25));
    fill('M62 194 L62 199.5 L64 198.5 L64 194.8 Z', L(stone, 0.1)); }
  if (P.ny) {
    c.lineWidth = 3.4; c.strokeStyle = css(P.light(oklch(0.45, 0.09, 150), lerp(0.4, 0.9, fl))); c.beginPath(); c.arc(41, 147, 6.5, 0, 7); c.stroke();
    c.fillStyle = css(P.light(oklch(0.55, 0.19, 25), 0.9)); c.beginPath(); c.moveTo(41, 153); c.lineTo(37, 158); c.lineTo(39.5, 158.5); c.lineTo(41, 154.5); c.lineTo(42.5, 158.5); c.lineTo(45, 158); c.closePath(); c.fill(); c.beginPath(); c.arc(41, 153, 1.6, 0, 7); c.fill();
    c.strokeStyle = 'rgba(25,30,30,.6)'; c.lineWidth = 0.7; GARLAND.forEach(seg => { c.beginPath(); seg.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); });
  }
  c.restore();
}

const GARLAND = [[[-2, 93], [58, 33]], [[58, 33], [118, 93]], [[121, 98], [214, 95]]].map(([a, b]) => { const n = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 8), out = []; for (let i = 0; i <= n; i++) { const t = i / n; out.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t) + 2.5 + Math.sin(((i % 3) / 3) * Math.PI) * 3]); } return out; });
const TREE_LIGHTS = (() => { const x = 1030, by = 800, h = 190, out = [], wires = []; for (let j = 0; j < 5; j++) { const t0 = 0.12 + j * 0.15, y0 = by - h * 0.1 - t0 * h * 0.86, hw = h * 0.3 * Math.pow(1 - t0, 0.95) * 0.8, n = 8 - j, wire = []; for (let i = 0; i <= n; i++) { const u = i / n, px = x - hw + u * 2 * hw, py = y0 + Math.sin(u * Math.PI) * h * 0.03 - (u - 0.5) * h * 0.07; wire.push([px, py]); out.push([px, py, (i + j * 2) % 4]); } wires.push(wire); } return { out, wires, star: [x, by - h - 1] }; })();
function snowman(c, P, x, y, S) {
  const M = P.mat, fl = P.fl, sh = mixC(M.snow, [70, 92, 140], 0.45), lit = P.light(M.snow, 1.08), dark = P.light(sh, 0.12);
  const lx = (0.5 - fl) * 2;
  c.save(); c.translate(x, y); c.scale(S, S); c.lineCap = 'round'; c.lineJoin = 'round';
  let g = c.createRadialGradient(-lx * 18, 2, 2, -lx * 18, 2, 40); g.addColorStop(0, 'rgba(20,30,60,.28)'); g.addColorStop(1, 'rgba(20,30,60,0)');
  c.fillStyle = g; c.beginPath(); c.ellipse(-lx * 18, 2, 40, 7, 0, 0, 7); c.fill();
  const ball = (cy, r, sq) => {
    const gr = c.createRadialGradient(lx * r * 0.45, cy - r * 0.5, r * 0.08, 0, cy, r * 1.08);
    gr.addColorStop(0, css(lit)); gr.addColorStop(0.55, css(mixC(lit, dark, 0.3))); gr.addColorStop(1, css(dark));
    c.fillStyle = gr; c.beginPath(); c.ellipse(0, cy, r, r * sq, 0, 0, 7); c.fill();
    const rim = c.createLinearGradient(-lx * r, 0, lx * r, 0); rim.addColorStop(0, 'rgba(255,255,255,0)'); rim.addColorStop(1, css(mixC(lit, [255, 255, 255], 0.4), 0.0));
  };
  const ao = (cy, r) => { const gg = c.createRadialGradient(0, cy, 0, 0, cy, r); gg.addColorStop(0, 'rgba(30,40,80,.32)'); gg.addColorStop(1, 'rgba(30,40,80,0)'); c.fillStyle = gg; c.beginPath(); c.ellipse(0, cy, r, r * 0.35, 0, 0, 7); c.fill(); };
  const wood = css(P.light(oklch(0.34, 0.05, 50), 0.7)), woodL = css(P.light(oklch(0.42, 0.05, 55), 0.9));
  c.strokeStyle = wood; c.lineWidth = 1.7;
  c.beginPath(); c.moveTo(-12, -47); c.quadraticCurveTo(-24, -54, -35, -66); c.moveTo(-27, -58); c.lineTo(-33, -56); c.moveTo(-31, -62); c.lineTo(-30, -71); c.stroke();
  c.beginPath(); c.moveTo(12, -46); c.quadraticCurveTo(25, -50, 36, -48); c.moveTo(28, -49); c.lineTo(33, -57); c.moveTo(32, -48.5); c.lineTo(37, -42); c.stroke();
  ball(-17, 20, 0.92);
  ao(-31, 15);
  ball(-44, 14.5, 0.95);
  ao(-55, 11);
  ball(-65, 11, 1);
  g = c.createRadialGradient(0, -1, 2, 0, -1, 30); g.addColorStop(0, css(lit, 0.85)); g.addColorStop(0.55, css(lit, 0.45)); g.addColorStop(1, css(lit, 0));
  c.save(); c.scale(1, 0.24); c.fillStyle = g; c.beginPath(); c.arc(0, -4, 30, 0, 7); c.fill(); c.restore();
  [[-9, -6], [7, -4], [13, -12], [-15, -15]].forEach(([dx, dy]) => { c.fillStyle = css(dark, 0.25); c.beginPath(); c.arc(dx, dy, 1.1, 0, 7); c.fill(); });
  const red = P.light(oklch(0.52, 0.19, 25), lerp(0.4, 1, fl)), redD = P.light(oklch(0.42, 0.17, 22), 0.4), cream = P.light(oklch(0.92, 0.03, 90), lerp(0.5, 1, fl));
  g = c.createLinearGradient(-12, 0, 12, 0); g.addColorStop(0, css(lx > 0 ? redD : red)); g.addColorStop(1, css(lx > 0 ? red : redD));
  c.fillStyle = g; c.beginPath(); c.moveTo(-11.5, -57); c.quadraticCurveTo(0, -52, 11.5, -57); c.lineTo(11, -52); c.quadraticCurveTo(0, -47, -11, -52); c.closePath(); c.fill();
  c.strokeStyle = css(cream, 0.85); c.lineWidth = 1.1; c.beginPath(); c.moveTo(-6, -54); c.lineTo(-7, -50); c.moveTo(0, -52.5); c.lineTo(0, -48.6); c.moveTo(6, -54); c.lineTo(7, -50); c.stroke();
  c.fillStyle = g; c.beginPath(); c.moveTo(4, -52); c.quadraticCurveTo(9, -44, 7, -35); c.lineTo(11.5, -36); c.quadraticCurveTo(12.5, -45, 8.5, -53); c.closePath(); c.fill();
  c.strokeStyle = css(cream, 0.85); c.beginPath(); c.moveTo(7.2, -38.5); c.lineTo(11.6, -39.2); c.moveTo(7.6, -41.5); c.lineTo(11.9, -42.3); c.stroke();
  c.strokeStyle = css(red); c.lineWidth = 1; [7.5, 9.2, 10.9].forEach(xx => { c.beginPath(); c.moveTo(xx, -35.5); c.lineTo(xx + 0.3, -32.5); c.stroke(); });
  const coal = '#1c1a1d';
  c.fillStyle = coal; [[-4, -68], [4, -68]].forEach(([ex, ey]) => { c.beginPath(); c.ellipse(ex, ey, 1.5, 1.8, 0, 0, 7); c.fill(); });
  c.fillStyle = 'rgba(255,255,255,.7)'; [[-3.5, -68.6], [4.5, -68.6]].forEach(([ex, ey]) => { c.beginPath(); c.arc(ex, ey, 0.5, 0, 7); c.fill(); });
  c.fillStyle = coal; for (let i = 0; i < 5; i++) { const an = Math.PI * (0.22 + i * 0.14); c.beginPath(); c.arc(Math.cos(an) * 5.5, -63.5 + Math.sin(an) * 3.2 - 2.4, 0.85, 0, 7); c.fill(); }
  [-44, -38, -32].forEach((by, i) => { c.beginPath(); c.arc(0, by + (i === 0 ? 1 : 0), 1.5, 0, 7); c.fill(); });
  g = c.createLinearGradient(0, -66.5, 0, -63); g.addColorStop(0, css(P.light(oklch(0.74, 0.17, 55), 1))); g.addColorStop(1, css(P.light(oklch(0.6, 0.17, 45), 0.6)));
  c.fillStyle = g; c.beginPath(); c.moveTo(-0.5, -67); c.quadraticCurveTo(7, -66, 13, -64.2); c.quadraticCurveTo(7, -64, -0.5, -63.2); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(120,50,10,.45)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(4, -66.2); c.lineTo(4.4, -64); c.moveTo(7.5, -65.6); c.lineTo(7.8, -64.1); c.stroke();
  if (P.ny) {
    g = c.createLinearGradient(-10, -90, 12, -74); g.addColorStop(0, css(red)); g.addColorStop(1, css(redD));
    c.fillStyle = g; c.beginPath(); c.moveTo(-10, -73); c.quadraticCurveTo(-7, -86, 2, -89); c.quadraticCurveTo(11, -91, 15, -83); c.quadraticCurveTo(9, -84, 9.5, -73); c.closePath(); c.fill();
    c.fillStyle = css(cream); c.beginPath(); c.ellipse(0, -73.5, 11.5, 3.4, 0, 0, 7); c.fill(); c.beginPath(); c.arc(15.5, -82.5, 3.1, 0, 7); c.fill();
  } else {
    g = c.createLinearGradient(-9, 0, 9, 0); g.addColorStop(0, css(P.light(oklch(0.3, 0.03, 60), 0.9))); g.addColorStop(1, css(P.light(oklch(0.24, 0.03, 60), 0.3)));
    c.fillStyle = g; c.beginPath(); c.moveTo(-8, -74); c.lineTo(-6.5, -85); c.lineTo(6.5, -85); c.lineTo(8, -74); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(0, -74, 11, 2.6, 0, 0, 7); c.fill();
  }
  c.restore();
}

// ---------- element ----------
class IskrSky extends HTMLElement {
  static get observedAttributes() { return ['doy', 'hour', 'still', 'year']; }
  constructor() { super(); this._year = new Date().getFullYear(); this._doy = 1; this._hour = 12; this._still = false; this._need = true; }
  set doy(v) { v = +v; if (v && v !== this._doy) { this._doy = v; this._need = true; } } get doy() { return this._doy; }
  set hour(v) { v = +v; if (!isNaN(v) && v !== this._hour) { this._hour = v; if (Math.abs(v - (this._ch ?? -9)) > 0.008) this._need = true; this._drawOnce = true; } } get hour() { return this._hour; }
  set still(v) { const was = this._still; this._still = !(v == null || v === false || v === 'false' || v === '0' || v === 0); if (was !== this._still) this._drawOnce = true; }
  set year(v) { v = +v; if (v && v !== this._year) { this._year = v; this._need = true; } } get year() { return this._year; } get still() { return this._still; }
  attributeChangedCallback(n, o, v) { this[n] = n === 'still' ? v : v; }
  connectedCallback() {
    Object.assign(this.style, { display: 'block', position: 'relative', width: '100%', height: '100%', overflow: 'hidden' });
    this.cv = document.createElement('canvas'); this.cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block';
    this.appendChild(this.cv); this.ctx = this.cv.getContext('2d');
    this.ro = new ResizeObserver(() => this._resize()); this.ro.observe(this);
    this.io = new IntersectionObserver(es => { this._vis = es[es.length - 1].isIntersecting; }); this.io.observe(this);
    this._vis = true; this._last = 0;
    const loop = ts => { this.raf = requestAnimationFrame(loop); this._tick(ts); };
    this.raf = requestAnimationFrame(loop);
  }
  disconnectedCallback() { cancelAnimationFrame(this.raf); this.ro && this.ro.disconnect(); this.io && this.io.disconnect(); }
  _resize() {
    const w = this.clientWidth || W; if (!w) return;
    const pr = Math.min(2.5, (w / W) * (window.devicePixelRatio || 1));
    if (Math.abs(pr - (this.pr || 0)) < 0.01) return;
    this.pr = pr; const cw = Math.round(W * pr), ch = Math.round(H * pr);
    this.cv.width = cw; this.cv.height = ch;
    this.far = mk(cw, ch); this.near = mk(cw, ch); this.tmp = mk(cw, ch); this.refl = mk(cw, Math.round(170 * pr));
    this._need = true; this._drawOnce = true;
  }
  _tick(ts) {
    if (!this.pr || !this._vis) return;
    if (this._still) { if (!this._need && !this._drawOnce) return; }
    else if (ts - this._last < 33) return;
    this._last = ts;
    if (this._need) { this._recolor(); this._need = false; }
    this._frame(this._still ? 40 : ts / 1000);
    this._drawOnce = false;
  }
  _recolor() {
    const P = this.P = palette(this._doy, this._hour, this._doy + Math.round((Date.UTC(this._year, 0, 1) - Date.UTC(2026, 0, 1)) / 864e5)); this._ch = this._hour;
    buildMaps(); buildGeo();
    const pr = this.pr, MAP = buildMaps();
    // far layers
    const fc = this.far.getContext('2d'), tc = this.tmp.getContext('2d');
    fc.setTransform(1, 0, 0, 1, 0, 0); fc.clearRect(0, 0, this.far.width, this.far.height);
    MAP.forEach((m, li) => {
      if (!this['mcv' + li]) this['mcv' + li] = mk(m.MW, m.rows);
      const mc = this['mcv' + li], mx = mc.getContext('2d'), img = mx.createImageData(m.MW, m.rows), d = img.data;
      const lit = P.light(P.mat[m.mat], 1), sh = P.light(P.mat[m.mat], 0), sL = P.light(P.mat.snow, 1), sS = P.light(P.mat.snow, 0.05);
      const snowAmt = m.snow ? lerp(0.85, 1, P.S.snowK) : P.S.snowK * 0.9, fl = P.fl, hz = m.hz, mist = P.fog * 0.55, hor = P.hor;
      for (let i = 0, n = m.vert.length; i < n; i++) {
        const v = m.vert[i]; if (v < 0) continue;
        const f = lerp(m.sR[i], m.sL[i], fl), s = m.snow[i] * snowAmt, k = clamp(hz + mist * v * v), j = i * 4;
        for (let ch = 0; ch < 3; ch++) { let col = sh[ch] + (lit[ch] - sh[ch]) * f; col += ((sS[ch] + (sL[ch] - sS[ch]) * f) - col) * s; d[j + ch] = col + (hor[ch] - col) * k; }
        d[j + 3] = 255;
      }
      mx.putImageData(img, 0, 0);
      tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalCompositeOperation = 'source-over'; tc.clearRect(0, 0, this.tmp.width, this.tmp.height);
      tc.setTransform(pr, 0, 0, pr, 0, 0); tc.imageSmoothingQuality = 'high';
      tc.drawImage(mc, 0, m.y0 * 2, W, m.rows * 2);
      tc.globalCompositeOperation = 'destination-in'; tc.fill(m.path); tc.globalCompositeOperation = 'source-over';
      if (m.trees) {
        const tcol = css(mixC(P.light(P.mat.pine, 0.35), hor, hz + 0.06));
        tc.fillStyle = tcol; tc.beginPath();
        for (const [x, y, hh] of m.trees) { tc.moveTo(x, y - hh); tc.lineTo(x + hh * 0.3, y + 3); tc.lineTo(x - hh * 0.3, y + 3); }
        tc.fill();
      }
      fc.drawImage(this.tmp, 0, 0);
    });
    // near
    const c = this.near.getContext('2d'), G = GEO, M = P.mat, snowK = P.S.snowK;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.near.width, this.near.height); c.setTransform(pr, 0, 0, pr, 0, 0);
    const ground = snowK > 0.5 ? M.snow : M.meadow, gF = snowK > 0.5 ? M.snow : M.grass;
    let g = c.createLinearGradient(0, 595, 0, 760); g.addColorStop(0, css(P.light(ground, 0.85, 0.16))); g.addColorStop(1, css(P.light(ground, 0.4, 0.08)));
    c.fillStyle = g; c.fill(G.meadow);
    c.save(); c.clip(G.meadow);
    G.meadowS.forEach(s => { c.strokeStyle = css(P.light(ground, s.k, 0.12), snowK > 0.5 ? 0.25 : 0.55); c.lineWidth = s.w * 0.8; c.beginPath(); c.moveTo(s.x, s.y); c.quadraticCurveTo(s.x + s.b * 0.4, s.y - s.h * 0.6, s.x + s.b, s.y - s.h); c.stroke(); });
    G.patches.forEach(p => { if (p.y > 760) return; c.save(); c.translate(p.x, p.y); c.scale(1, 0.22); const pg = c.createRadialGradient(0, 0, 0, 0, 0, p.r); const pc = p.k > 0.5 ? P.light(ground, 1, 0.1) : P.light(ground, 0, 0.1); pg.addColorStop(0, css(pc, 0.35)); pg.addColorStop(1, css(pc, 0)); c.fillStyle = pg; c.fillRect(-p.r, -p.r, p.r * 2, p.r * 2); c.restore(); });
    c.restore();
    G.mid.forEach(([x, y, h], i) => pine(c, x, y, h, P.light(M.pine, 0.1, 0.16), P.light(M.pine, 1, 0.14), P.fl, 100 + i, P.light(M.snow, 0.8, 0.14), snowK));
    g = c.createLinearGradient(0, 700, 0, 860); g.addColorStop(0, css(P.light(gF, 0.9, 0.04))); g.addColorStop(1, css(P.light(gF, 0.3, 0)));
    G.back.forEach(([x, y, h], i) => pine(c, x, y - 26, h, P.light(M.pine, 0.08, 0.03), P.light(M.pine, 1, 0.02), P.fl, 200 + i, P.light(M.snow, 0.8), snowK));
    c.fillStyle = g; c.fill(G.fore);
    c.save(); c.clip(G.fore);
    G.foreS.forEach(s => { c.strokeStyle = css(P.light(gF, s.k * 1.1, 0.02), snowK > 0.5 ? 0.22 : 0.6); c.lineWidth = s.w; c.beginPath(); c.moveTo(s.x, s.y); c.quadraticCurveTo(s.x + s.b * 0.4, s.y - s.h * 0.6, s.x + s.b, s.y - s.h); c.stroke(); });
    G.patches.forEach(p => { if (p.y < 700) return; c.save(); c.translate(p.x, p.y); c.scale(1, 0.25); const pg = c.createRadialGradient(0, 0, 0, 0, 0, p.r * 1.4); const pc = p.k > 0.5 ? P.light(gF, 1.1, 0) : P.light(gF, 0, 0); pg.addColorStop(0, css(pc, 0.4)); pg.addColorStop(1, css(pc, 0)); c.fillStyle = pg; c.fillRect(-p.r * 1.4, -p.r * 1.4, p.r * 2.8, p.r * 2.8); c.restore(); });
    const sg = c.createRadialGradient(140, 760, 10, 140, 760, 260); sg.addColorStop(0, 'rgba(0,0,0,.18)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = sg; c.fillRect(0, 600, 500, 260);
    c.restore();
    const pth = new Path2D('M56 729 Q60 731 54 734 Q98 784 126 880 L392 880 Q212 796 106 734 Q100 731 104 729 Z');
    g = c.createLinearGradient(0, 729, 0, 840); g.addColorStop(0, css(P.light(snowK > 0.5 ? mixC(M.snow, M.dirt, 0.25) : M.dirt, 0.7, 0.04))); g.addColorStop(1, css(P.light(snowK > 0.5 ? mixC(M.snow, M.dirt, 0.25) : M.dirt, 0.45)));
    c.fillStyle = g; c.fill(pth);
    const fc2 = css(P.light(M.fence, lerp(0.35, 0.85, P.fl), 0.02)), pts = [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 0.98].map(k => { const q = k * k * 0.45 + k * 0.55; return { x: lerp(186, 520, q), y: lerp(752, 870, q), h: lerp(16, 62, q), w: lerp(2.7, 8.5, q) }; });
    c.fillStyle = fc2; c.strokeStyle = fc2; c.lineCap = 'round';
    [0.8, 0.42].forEach(k => { c.lineWidth = 2.6; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p.x, p.y - p.h * k) : c.moveTo(p.x, p.y - p.h * k)); c.stroke(); });
    pts.forEach(p => c.fillRect(p.x - p.w / 2, p.y - p.h, p.w, p.h));
    if (snowK > 0.5) { const sn = css(P.light(M.snow, lerp(0.5, 1, P.fl), 0.02)); c.strokeStyle = sn; c.fillStyle = sn; [0.8, 0.42].forEach(k => { c.lineWidth = 1.6; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p.x, p.y - p.h * k - 1.8) : c.moveTo(p.x, p.y - p.h * k - 1.8)); c.stroke(); }); pts.forEach(p => { c.beginPath(); c.ellipse(p.x, p.y - p.h - 0.5, p.w * 0.75, p.w * 0.45, 0, 0, 7); c.fill(); }); }
    drawHouse(c, P);
    if (snowK > 0.6) snowman(c, P, 610, 806, 1);
    G.front.forEach(([x, y, h], i) => pine(c, x, y, h, P.light(M.pine, 0.05), P.light(M.pine, 0.95), P.fl, 300 + i, P.light(M.snow, 0.8), snowK));
    if (P.ny) {
      c.strokeStyle = 'rgba(25,30,30,.55)'; c.lineWidth = 0.8; TREE_LIGHTS.wires.forEach(w => { c.beginPath(); w.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); });
      const [stx, sty] = TREE_LIGHTS.star; c.save(); c.translate(stx, sty); c.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? 4 : 10, an = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } c.closePath(); const sg2 = c.createLinearGradient(-8, -10, 8, 10); sg2.addColorStop(0, '#fff3b8'); sg2.addColorStop(1, '#f2b53a'); c.fillStyle = sg2; c.fill(); c.restore();
    }
    // clouds
    const cs = cloudSet(P.abs);
    this.cl = cs.map((s, i) => {
      const cv = (this.cl && this.cl[i] && this.cl[i].cv && this.cl[i].cv.width === s.sw && this.cl[i].cv.height === s.sh) ? this.cl[i].cv : mk(s.sw, s.sh);
      const x = cv.getContext('2d'), img = x.createImageData(s.sw, s.sh), d = img.data, Lc = P.cloudLit, Sc = P.cloudSh;
      for (let k = 0; k < s.a.length; k++) { const l = s.l[k], j = k * 4; d[j] = lerp(Sc[0], Lc[0], l); d[j + 1] = lerp(Sc[1], Lc[1], l); d[j + 2] = lerp(Sc[2], Lc[2], l); d[j + 3] = s.a[k] * 245; }
      x.putImageData(img, 0, 0);
      return { ...s, cv };
    });
    if (!this.grainPat) this.grainPat = this.ctx.createPattern(buildGrain(), 'repeat');
  }
  _frame(time) {
    const P = this.P, c = this.ctx, pr = this.pr, t = this._hour, G = GEO;
    const AS = P.AS, sa = AS.sun.s, ma = AS.moon.s, sx = AS.sun.x, sy = AS.sun.y, mx = AS.moon.x, my = AS.moon.y;
    const sunOp = clamp((sa + 0.03) * 6), moonOp = clamp((ma + 0.03) * 6) * (1 - P.D * 0.55);
    c.setTransform(pr, 0, 0, pr, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    let g = c.createLinearGradient(0, 0, 0, HZ); g.addColorStop(0, css(P.zen)); g.addColorStop(0.55, css(P.mid)); g.addColorStop(1, css(P.hor));
    c.fillStyle = g; c.fillRect(0, 0, W, HZ + 60);
    c.globalCompositeOperation = 'screen';
    const ga = P.G * 0.7 + P.D * 0.12 + P.T * 0.2;
    if (ga > 0.01) { const gx = clamp(sx, -200, W + 200); g = c.createRadialGradient(gx, HZ, 0, gx, HZ, 800); g.addColorStop(0, css(mixC(P.sunC, [255, 170, 110], P.G * 0.5), ga)); g.addColorStop(0.45, css(P.sunC, ga * 0.25)); g.addColorStop(1, css(P.sunC, 0)); c.fillStyle = g; c.fillRect(0, 0, W, HZ + 60); }
    P.blobs.forEach((b, i) => {
      const x = b.x * W + Math.sin(time * b.sp + b.ph) * W * 0.14, y = b.y * HZ * 0.85 + Math.cos(time * b.sp * 0.8 + b.ph * 1.7) * 80, r = b.r * (1 + 0.14 * Math.sin(time * b.sp * 1.3 + i));
      g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, css(b.c, P.blobA)); g.addColorStop(0.6, css(b.c, P.blobA * 0.35)); g.addColorStop(1, css(b.c, 0)); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
    });
    const starA = P.N * (1 - P.D);
    if (starA > 0.02) {
      c.globalAlpha = starA * 0.5; c.drawImage(buildMilky(), 0, 0, W, HZ); c.globalAlpha = 1;
      G.stars.forEach(s => { const a = starA * (0.45 + 0.55 * Math.sin(time * s.sp + s.ph) ** 2); c.fillStyle = s.t < 0.15 ? `rgba(255,220,190,${a})` : s.t > 0.85 ? `rgba(200,215,255,${a})` : `rgba(255,255,255,${a})`; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 7); c.fill(); });
      const cyc = Math.floor(time / 11), p = (time % 11) / 11;
      if (p < 0.07 && starA > 0.4 && !this._still) { const r = rng(cyc), x0 = W * (0.3 + r() * 0.6), y0 = 40 + r() * 160, q = p / 0.07, dx = -Math.cos(0.45), dy = Math.sin(0.45), hx = x0 + dx * q * 480, hy = y0 + dy * q * 480; g = c.createLinearGradient(hx, hy, hx - dx * 150, hy - dy * 150); g.addColorStop(0, `rgba(255,255,255,${(1 - q) * starA})`); g.addColorStop(1, 'rgba(255,255,255,0)'); c.strokeStyle = g; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx - dx * 150, hy - dy * 150); c.stroke(); }
    }
    if (moonOp > 0.01 && my < HZ + 30) {
      g = c.createRadialGradient(mx, my, 20, mx, my, 170); g.addColorStop(0, `rgba(225,232,255,${0.28 * P.illum * moonOp})`); g.addColorStop(1, 'rgba(225,232,255,0)'); c.fillStyle = g; c.fillRect(mx - 170, my - 170, 340, 340);
      c.globalCompositeOperation = 'source-over'; drawMoon(c, mx, my, 30, P.phase, moonOp, P.zen, P.N); c.globalCompositeOperation = 'screen';
    }
    if (sunOp > 0.01) {
      const sc = P.sunC;
      g = c.createRadialGradient(sx, sy, 0, sx, sy, 280); g.addColorStop(0, css(sc, 0.8 * sunOp)); g.addColorStop(0.1, css(sc, 0.45 * sunOp)); g.addColorStop(0.35, css(sc, 0.1 * sunOp)); g.addColorStop(1, css(sc, 0)); c.fillStyle = g; c.fillRect(sx - 280, sy - 280, 560, 560);
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = sunOp;
      g = c.createRadialGradient(sx - 8, sy - 8, 2, sx, sy, 36); g.addColorStop(0, '#fffef6'); g.addColorStop(0.75, css(mixC(sc, [255, 255, 255], 0.35))); g.addColorStop(1, css(sc));
      c.fillStyle = g; c.beginPath(); c.arc(sx, sy, 36, 0, 7); c.fill(); c.globalAlpha = 1;
    }
    c.globalCompositeOperation = 'source-over';
    if (P.D > 0.3 && !this._still) {
      const q = ((time / 70) + 0.2) % 1, bx = -120 + q * 1520, by = 250 + Math.sin(q * 6) * 30;
      c.strokeStyle = css(P.light(P.mat.pine, 0.1, 0.3), clamp((P.D - 0.3) * 3)); c.lineWidth = 1.6; c.lineCap = 'round';
      [[0, 0], [-20, -10], [-38, -2], [-16, 12], [-34, 18]].forEach(([ox, oy], i) => { const x = bx + ox, y = by + oy, w = Math.sin(time * 9 + i * 1.3) * 3.5; c.beginPath(); c.moveTo(x - 7, y + w * 0.6); c.quadraticCurveTo(x - 3.5, y - 3, x, y); c.quadraticCurveTo(x + 3.5, y - 3, x + 7, y + w * 0.6); c.stroke(); });
    }
    (this.cl || []).forEach(s => { const span = W + s.w, x = ((s.x0 * span + time * s.sp) % span) - s.w; c.drawImage(s.cv, x, s.y, s.w, s.h); });
    if (P.nye && !this._still) {
      c.globalCompositeOperation = 'lighter';
      const per = 1.25;
      for (let k = 0; k < 3; k++) {
        const n = Math.floor(time / per) - k, age = time - n * per; if (age > 2.8 || age < 0) continue;
        const r = rng(n * 97 + 5), cx = 180 + r() * 920, cy = 80 + r() * 190, hue = r() * 360, col = oklch(0.8, 0.17, hue), col2 = oklch(0.93, 0.08, hue + 40), sp = 75 + r() * 55, a = clamp(1 - age / 2.8);
        if (age < 0.2) { g = c.createRadialGradient(cx, cy, 0, cx, cy, 120); g.addColorStop(0, css(col2, 0.5 * (1 - age / 0.2))); g.addColorStop(1, css(col2, 0)); c.fillStyle = g; c.fillRect(cx - 120, cy - 120, 240, 240); }
        const pos = (an, v, tt) => { const d = v * (1 - Math.exp(-2.2 * tt)) / 2.2 * 2.4; return [cx + Math.cos(an) * d, cy + Math.sin(an) * d + 16 * tt * tt]; };
        c.lineWidth = 1.3; c.lineCap = 'round';
        for (let i = 0; i < 54; i++) { const an = i / 54 * Math.PI * 2 + r() * 0.12, v = sp * (0.7 + r() * 0.4), p1 = pos(an, v, age), p0 = pos(an, v, Math.max(0, age - 0.22)); c.strokeStyle = css(col, a * 0.55); c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke(); const tw = 0.6 + 0.4 * Math.sin(time * 30 + i); c.fillStyle = css(col2, a * tw); c.beginPath(); c.arc(p1[0], p1[1], 1.5, 0, 7); c.fill(); }
      }
      c.globalCompositeOperation = 'source-over';
    }
    c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(this.far, 0, 0); c.setTransform(pr, 0, 0, pr, 0, 0);
    // lake
    const rc = this.refl.getContext('2d'), RH = 170, LD = 110;
    rc.setTransform(1, 0, 0, 1, 0, 0); rc.clearRect(0, 0, this.refl.width, this.refl.height);
    rc.drawImage(this.cv, 0, Math.round((HZ - RH) * pr), this.cv.width, Math.round(RH * pr), 0, 0, this.refl.width, this.refl.height);
    for (let r = 0; r < LD; r++) {
      const src = RH - 1 - r * 1.45; if (src < 0) break;
      const amp = 0.5 + r * 0.05, dx = this._still ? 0 : Math.sin(time * 1.3 + r * 0.42) * amp + Math.sin(time * 0.6 + r * 0.11) * amp * 0.7;
      c.drawImage(this.refl, 0, src * pr, this.refl.width, pr, dx - 4, HZ + r, W + 8, 1.05);
    }
    g = c.createLinearGradient(0, HZ, 0, HZ + LD); g.addColorStop(0, css(P.lake, 0.28)); g.addColorStop(1, css(P.lake, 0.6)); c.fillStyle = g; c.fillRect(0, HZ, W, LD);
    c.fillStyle = css(P.lake, 0.35); c.fillRect(0, HZ, W, 1.5);
    c.globalCompositeOperation = 'lighter';
    G.ripples.forEach(rp => { const a = (0.5 + 0.5 * Math.sin(time * 0.5 + rp.ph)) * 0.12; c.fillStyle = css(mixC(P.hor, [255, 255, 255], 0.3), a); c.fillRect(rp.x + Math.sin(time * 0.2 + rp.ph) * 20, rp.y, rp.w, 0.8); });
    const glit = (x, col, op, n, wd) => { for (let k = 0; k < n; k++) { const [a, b, d] = G.glit[k], q = k / n, y = HZ + 2 + k * 1.7, w = (1.5 + a * wd * 0.25) * (1 - q * 0.5), fl = this._still ? 0.7 : (0.5 + 0.5 * Math.sin(time * (2 + d * 5) + k * 2.1)) ** 2; c.fillStyle = css(col, op * fl * (1 - q) * 0.75); c.fillRect(x - w / 2 + (b - 0.5) * (6 + k * 2.2), y, w, 1); c.fillRect(x - w / 2 - (d - 0.5) * (6 + k * 2.2), y + 0.8, w * 0.7, 1); } };
    if (sunOp > 0.02 && sx > -40 && sx < W + 40) glit(sx, P.sunC, sunOp, 40, 60);
    if (moonOp > 0.02 && my < HZ) glit(mx, [230, 236, 255], moonOp * (0.3 + 0.7 * P.illum) * 0.7, 30, 26);
    c.globalCompositeOperation = 'source-over';
    // fog
    if (P.fog > 0.05) for (let k = 0; k < 4; k++) {
      const fx = W * (0.12 + 0.27 * k) + Math.sin(time * 0.025 + k * 1.7) * 140, fy = HZ - 14 + (k % 2) * 30;
      c.save(); c.translate(fx, fy); c.scale(1, 0.14); g = c.createRadialGradient(0, 0, 0, 0, 0, 420); g.addColorStop(0, css(P.fogC, P.fog * 0.55)); g.addColorStop(1, css(P.fogC, 0)); c.fillStyle = g; c.fillRect(-420, -420, 840, 840); c.restore();
    }
    c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(this.near, 0, 0); c.setTransform(pr, 0, 0, pr, 0, 0);
    // lights & particles
    if (P.ny) {
      const cols = [[255, 72, 72], [255, 204, 84], [96, 232, 126], [96, 172, 255]], inten = 0.35 + 0.65 * P.N;
      const bulb = (x, y, ci, i) => { const a = this._still ? 1 : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * 2.4 + i * 1.9)), col = cols[ci]; c.globalCompositeOperation = 'lighter'; g = c.createRadialGradient(x, y, 0, x, y, 8); g.addColorStop(0, css(col, a * inten * 0.85)); g.addColorStop(1, css(col, 0)); c.fillStyle = g; c.fillRect(x - 8, y - 8, 16, 16); c.globalCompositeOperation = 'source-over'; c.fillStyle = css(mixC(col, [255, 255, 255], 0.4 * a), 0.95); c.beginPath(); c.arc(x, y, 1.7, 0, 7); c.fill(); };
      let bi = 0;
      GARLAND.forEach(seg => seg.forEach(([lx, ly]) => { bulb(34 + lx * 1.1, 513 + ly * 1.1, bi % 4, bi); bi++; }));
      TREE_LIGHTS.out.forEach(([x, y, ci]) => { bulb(x, y, ci, bi); bi++; });
      const [stx, sty] = TREE_LIGHTS.star; c.globalCompositeOperation = 'lighter'; g = c.createRadialGradient(stx, sty, 0, stx, sty, 40); g.addColorStop(0, `rgba(255,214,110,${0.55 * inten})`); g.addColorStop(1, 'rgba(255,214,110,0)'); c.fillStyle = g; c.fillRect(stx - 40, sty - 40, 80, 80); c.globalCompositeOperation = 'source-over';
    }
    if (P.lit) {
      c.globalCompositeOperation = 'lighter';
      const fl = this._still ? 1 : 0.94 + 0.06 * Math.sin(time * 7) * Math.sin(time * 2.3);
      [[126, 655, 50], [98, 588, 30], [188, 658, 46], [232, 657, 40], [99, 655, 20]].forEach(([x, y, r]) => { g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,200,110,${0.32 * fl})`); g.addColorStop(1, 'rgba(255,200,110,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); });
      c.save(); c.translate(110, 752); c.scale(1, 0.28); g = c.createRadialGradient(0, 0, 0, 0, 0, 170); g.addColorStop(0, `rgba(255,190,100,${0.22 * fl})`); g.addColorStop(1, 'rgba(255,190,100,0)'); c.fillStyle = g; c.fillRect(-170, -170, 340, 340); c.restore();
      c.globalCompositeOperation = 'source-over';
    }
    if ((P.lit || P.S.snowK > 0.5) && !this._still) {
      const sc = mixC(P.light(P.mat.snow, 0.6, 0.3), [255, 255, 255], 0.1);
      for (let i = 0; i < 12; i++) { const age = (time * 0.11 + i / 12) % 1, x = 198 + age * 46 + Math.sin(age * 5 + i) * 7, y = 524 - age * 130, r = 5 + age * 24; g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, css(sc, (1 - age) * 0.32)); g.addColorStop(1, css(sc, 0)); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
    }
    if (!this._still) {
      if (P.S.summer && P.N > 0.5) { c.globalCompositeOperation = 'lighter'; G.flies.forEach((f, i) => { const x = f.x + Math.sin(time * f.sp + f.ph) * 32, y = f.y + Math.cos(time * f.sp * 1.3 + f.ph * 2) * 18, a = P.N * (0.5 + 0.5 * Math.sin(time * 2.6 + f.ph * 3)) ** 3; g = c.createRadialGradient(x, y, 0, x, y, 9); g.addColorStop(0, `rgba(235,255,150,${a})`); g.addColorStop(1, 'rgba(235,255,150,0)'); c.fillStyle = g; c.fillRect(x - 9, y - 9, 18, 18); }); c.globalCompositeOperation = 'source-over'; }
      if (P.S.autumn && P.S.snowK < 0.3 && P.D > 0.2) G.leaves.forEach(l => { const y = (l.y + time * l.v) % (H + 40) - 20, x = (l.x + time * 14 + Math.sin(time * 0.9 + l.ph) * 30) % (W + 40) - 20; c.save(); c.translate(x, y); c.rotate(time * 1.5 + l.ph); c.fillStyle = css(P.light(oklch(0.65, 0.15, l.hue), 0.8), 0.9); c.beginPath(); c.ellipse(0, 0, l.s, l.s * 0.5, 0, 0, 7); c.fill(); c.restore(); });
      if (P.S.snowK > 0.5) {
        const sc = mixC(P.light(P.mat.snow, 0.85), [255, 255, 255], 0.3), n = P.ny ? G.snow.length : 150;
        for (let i = 0; i < n; i++) { const s = G.snow[i], z = P.ny ? s.z : s.z * 0.6, sp = s.v * (0.45 + z * 1.2), y = (s.y + time * sp) % (H + 30) - 15, x = (((s.x + Math.sin(time * 0.7 + s.ph) * (8 + z * 18) + time * (4 + z * 8)) % (W + 30)) + W + 30) % (W + 30) - 15, rr = s.s * (0.45 + z * 1.4); if (z > 0.93) { g = c.createRadialGradient(x, y, 0, x, y, rr * 2.2); g.addColorStop(0, css(sc, 0.75)); g.addColorStop(1, css(sc, 0)); c.fillStyle = g; c.fillRect(x - rr * 2.2, y - rr * 2.2, rr * 4.4, rr * 4.4); } else { c.fillStyle = css(sc, 0.5 + z * 0.45); c.beginPath(); c.arc(x, y, rr, 0, 7); c.fill(); } }
      }
    }
    g = c.createLinearGradient(0, 0, 0, H * 0.5); g.addColorStop(0, 'rgba(0,0,0,.2)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H * 0.5);
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'overlay'; c.globalAlpha = 0.07; c.fillStyle = this.grainPat; c.fillRect(0, 0, this.cv.width, this.cv.height); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  }
}
customElements.define('iskr-sky', IskrSky);
})();
