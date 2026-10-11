/* ============================================================
   flora.js — نقاش گل‌ها
   همه‌ی تصویر گل‌ها و دسته‌گل‌ها با کد (SVG) کشیده می‌شود، پس سایت
   بدون هیچ عکس و اینترنتی کار می‌کند. اگر مدیر برای محصولی عکس
   واقعی بارگذاری کند، همان عکس جایگزین نقاشی می‌شود.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- ابزارها ---------- */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(s) {
    var h = 2166136261; s = String(s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rgb(h) {
    h = String(h || '#cccccc').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function hex(r, g, b) {
    return '#' + [r, g, b].map(function (v) {
      return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    }).join('');
  }
  function mix(a, b, t) {
    var A = rgb(a), B = rgb(b);
    return hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  }
  function lum(c) { var v = rgb(c); return (v[0] * 0.299 + v[1] * 0.587 + v[2] * 0.114) / 255; }
  function lighten(c, t) { return mix(c, '#ffffff', t); }
  // گل‌های سفید با خاکستری سبزفام سایه می‌خورند تا کثیف دیده نشوند
  function darken(c, t) { return mix(c, lum(c) > 0.86 ? '#a9b79a' : '#2a0f1c', lum(c) > 0.86 ? t * 1.15 : t); }
  function f(n) { return (Math.round(n * 10) / 10).toString(); }

  /* ---------- شکل گلبرگ (از مرکز رو به بالا) ---------- */
  function petal(shape, L, W) {
    switch (shape) {
      case 'point':
        return 'M0,0C' + f(W) + ',' + f(-L * 0.3) + ' ' + f(W * 0.55) + ',' + f(-L * 0.8) + ' 0,' + f(-L) +
          'C' + f(-W * 0.55) + ',' + f(-L * 0.8) + ' ' + f(-W) + ',' + f(-L * 0.3) + ' 0,0Z';
      case 'narrow':
        return 'M0,0C' + f(W) + ',' + f(-L * 0.4) + ' ' + f(W) + ',' + f(-L * 0.97) + ' 0,' + f(-L) +
          'C' + f(-W) + ',' + f(-L * 0.97) + ' ' + f(-W) + ',' + f(-L * 0.4) + ' 0,0Z';
      case 'heart':
        return 'M0,0C' + f(W) + ',' + f(-L * 0.25) + ' ' + f(W * 1.05) + ',' + f(-L * 1.03) + ' ' + f(W * 0.35) + ',' + f(-L) +
          'Q0,' + f(-L * 0.97) + ' 0,' + f(-L * 0.86) + 'Q0,' + f(-L * 0.97) + ' ' + f(-W * 0.35) + ',' + f(-L) +
          'C' + f(-W * 1.05) + ',' + f(-L * 1.03) + ' ' + f(-W) + ',' + f(-L * 0.25) + ' 0,0Z';
      case 'ruffle':
        return 'M0,0C' + f(W) + ',' + f(-L * 0.2) + ' ' + f(W * 1.1) + ',' + f(-L * 0.75) + ' ' + f(W * 0.7) + ',' + f(-L * 0.88) +
          'Q' + f(W * 0.62) + ',' + f(-L * 1.05) + ' ' + f(W * 0.3) + ',' + f(-L * 0.95) +
          'Q0,' + f(-L * 1.1) + ' ' + f(-W * 0.3) + ',' + f(-L * 0.95) +
          'Q' + f(-W * 0.62) + ',' + f(-L * 1.05) + ' ' + f(-W * 0.7) + ',' + f(-L * 0.88) +
          'C' + f(-W * 1.1) + ',' + f(-L * 0.75) + ' ' + f(-W) + ',' + f(-L * 0.2) + ' 0,0Z';
      default: // round
        return 'M0,0C' + f(W) + ',' + f(-L * 0.2) + ' ' + f(W * 0.95) + ',' + f(-L) + ' 0,' + f(-L) +
          'C' + f(-W * 0.95) + ',' + f(-L) + ' ' + f(-W) + ',' + f(-L * 0.2) + ' 0,0Z';
    }
  }

  /* یک حلقه گلبرگ دور مرکز */
  function ring(r, o) {
    var s = '', d = petal(o.shape || 'round', o.L, o.W), st = o.stroke || darken(o.color, 0.32);
    var vary = o.vary == null ? 0.07 : o.vary, jit = o.jit == null ? 5 : o.jit;
    for (var i = 0; i < o.n; i++) {
      var a = (o.off || 0) + i * 360 / o.n + (r() - 0.5) * jit;
      var v = (r() - 0.5) * 2 * vary;
      var c = v > 0 ? lighten(o.color, v) : darken(o.color, -v);
      s += '<path d="' + d + '" transform="rotate(' + f(a) + ')" fill="' + c + '" stroke="' + st +
        '" stroke-opacity=".42" stroke-width=".7"/>';
    }
    return s;
  }
  function rings(r, list) { return list.map(function (o) { return ring(r, o); }).join(''); }
  var DEPTH = '<circle r="50" fill="url(#fl-depth)"/>';
  function dots(r, n, rad, size, color, op) {
    var s = '';
    for (var i = 0; i < n; i++) {
      var a = i * 2 * Math.PI / n + r() * 0.3;
      s += '<circle cx="' + f(Math.cos(a) * rad) + '" cy="' + f(Math.sin(a) * rad) + '" r="' + size + '" fill="' + color + '"' +
        (op ? ' opacity="' + op + '"' : '') + '/>';
    }
    return s;
  }
  function leaf(L, W, color, rot, x, y) {
    return '<g transform="translate(' + f(x || 0) + ',' + f(y || 0) + ') rotate(' + f(rot || 0) + ')">' +
      '<path d="' + petal('point', L, W) + '" fill="' + color + '"/>' +
      '<path d="M0,-3L0,' + f(-L * 0.86) + '" stroke="' + lighten(color, 0.35) + '" stroke-width=".8" stroke-opacity=".7" fill="none"/></g>';
  }

  /* ---------- سرِ هر نوع گل (دید از بالا، شعاع ~۴۸) ---------- */
  var KINDS = {
    rose: function (c, c2, r) {
      return rings(r, [
        { n: 6, L: 48, W: 35, color: lighten(c, 0.14) },
        { n: 6, L: 40, W: 31, color: c, off: 30 },
        { n: 5, L: 31, W: 26, color: darken(c, 0.09), off: 12 },
        { n: 5, L: 22, W: 20, color: darken(c, 0.17), off: 48 },
        { n: 3, L: 13, W: 14, color: darken(c, 0.25), off: 20 }
      ]) + DEPTH + '<path d="M-3,1a4,4 0 1 1 6,-1a2.5,2.5 0 1 0 -3,2" fill="none" stroke="' + darken(c, 0.45) + '" stroke-width="1.1" stroke-linecap="round"/>';
    },
    ranunculus: function (c, c2, r) {
      var L = [47, 41, 35, 29, 23, 17, 10], out = [];
      L.forEach(function (l, i) { out.push({ n: 9 - Math.floor(i * 0.9), L: l, W: l * 0.62 + 4, color: i < 2 ? lighten(c, 0.16 - i * 0.08) : darken(c, (i - 2) * 0.05), off: i * 23 }); });
      return rings(r, out) + DEPTH + '<circle r="3.2" fill="' + mix(c, '#7a9a3a', 0.6) + '"/>';
    },
    peony: function (c, c2, r) {
      return rings(r, [
        { n: 9, L: 48, W: 27, shape: 'ruffle', color: lighten(c, 0.22) },
        { n: 8, L: 41, W: 25, shape: 'ruffle', color: lighten(c, 0.1), off: 20 },
        { n: 7, L: 33, W: 22, shape: 'ruffle', color: c, off: 5 },
        { n: 6, L: 24, W: 18, shape: 'ruffle', color: darken(c, 0.08), off: 33 },
        { n: 5, L: 15, W: 13, shape: 'ruffle', color: darken(c, 0.15), off: 10 }
      ]) + DEPTH + dots(r, 7, 3.2, 1.3, '#f5c84a');
    },
    damask: function (c, c2, r) {
      return rings(r, [
        { n: 5, L: 48, W: 38, shape: 'heart', color: lighten(c, 0.16) },
        { n: 5, L: 39, W: 32, shape: 'heart', color: c, off: 36 },
        { n: 5, L: 28, W: 25, shape: 'heart', color: darken(c, 0.1), off: 8 }
      ]) + DEPTH + '<circle r="8" fill="#f7cf4d"/>' + dots(r, 12, 8, 1.5, '#d99a1b') + dots(r, 6, 3.5, 1.2, '#b9791a');
    },
    tulip: function (c, c2, r) {
      return rings(r, [
        { n: 3, L: 47, W: 42, shape: 'point', color: lighten(c, 0.12), jit: 2 },
        { n: 3, L: 42, W: 38, shape: 'point', color: c, off: 60, jit: 2 },
        { n: 3, L: 25, W: 24, shape: 'point', color: darken(c, 0.14), off: 30 }
      ]) + DEPTH + ring(r, { n: 6, L: 8, W: 3, shape: 'narrow', color: '#2b2118', jit: 0, vary: 0 }) + '<circle r="2.4" fill="#d8e27a"/>';
    },
    lily: function (c, c2, r) {
      var spot = c2 || darken(c, 0.5), s = rings(r, [
        { n: 3, L: 50, W: 25, shape: 'point', color: lighten(c, 0.08), jit: 3 },
        { n: 3, L: 48, W: 21, shape: 'point', color: c, off: 60, jit: 3 }
      ]);
      for (var i = 0; i < 6; i++) {
        s += '<g transform="rotate(' + (i * 60) + ')"><path d="M0,-4L0,-40" stroke="' + darken(c, 0.2) + '" stroke-width=".8" stroke-opacity=".6"/>' +
          '<circle cx="2.5" cy="-14" r=".9" fill="' + spot + '" opacity=".7"/><circle cx="-2.5" cy="-19" r=".9" fill="' + spot + '" opacity=".7"/><circle cx="1.5" cy="-24" r=".8" fill="' + spot + '" opacity=".6"/></g>';
      }
      s += DEPTH;
      for (var k = 0; k < 6; k++) {
        s += '<g transform="rotate(' + (k * 60 + 30) + ')"><path d="M0,0L0,-17" stroke="#cfe0a4" stroke-width="1.1"/><ellipse cx="0" cy="-18.5" rx="1.8" ry="3.6" fill="#9a4b1c"/></g>';
      }
      return s + '<circle r="3" fill="#b8d07a"/>';
    },
    alstro: function (c, c2, r) {
      var s = rings(r, [
        { n: 3, L: 47, W: 33, shape: 'round', color: c, jit: 3 },
        { n: 3, L: 45, W: 22, shape: 'point', color: lighten(c, 0.35), off: 60, jit: 3 }
      ]);
      for (var i = 0; i < 3; i++) {
        s += '<g transform="rotate(' + (i * 120 + 60) + ')" stroke="' + darken(c, 0.55) + '" stroke-width="1" stroke-linecap="round">' +
          '<path d="M0,-16l0,-5M3,-22l.6,-5M-3,-22l-.6,-5M0,-28l0,-5"/></g>';
      }
      return s + DEPTH + dots(r, 6, 5, 1.5, '#7a4a1f') + '<circle r="2.5" fill="#dce88c"/>';
    },
    narcissus: function (c, c2, r) {
      var cup = c2 || '#f6b21b';
      var s = rings(r, [
        { n: 3, L: 48, W: 33, shape: 'point', color: c, jit: 3 },
        { n: 3, L: 47, W: 31, shape: 'point', color: lighten(c, 0.3), off: 60, jit: 3 }
      ]) + DEPTH;
      s += ring(r, { n: 9, L: 17, W: 9, shape: 'round', color: cup, jit: 2, vary: 0.04 });
      return s + '<circle r="9.5" fill="' + darken(cup, 0.18) + '"/>' + dots(r, 3, 3, 1.5, '#fff1b0');
    },
    daisy: function (c, c2, r) {
      var disc = c2 || '#3a2416';
      return rings(r, [
        { n: 22, L: 48, W: 8, shape: 'narrow', color: c, jit: 3 },
        { n: 20, L: 40, W: 7.5, shape: 'narrow', color: lighten(c, 0.13), off: 8, jit: 3 },
        { n: 16, L: 23, W: 5.5, shape: 'narrow', color: darken(c, 0.16), off: 3 }
      ]) + DEPTH + '<circle r="11" fill="' + disc + '"/>' + dots(r, 14, 8.5, 1.3, lighten(disc, 0.3)) + dots(r, 7, 4, 1.1, lighten(disc, 0.18));
    },
    sunflower: function (c, c2, r) {
      return rings(r, [
        { n: 17, L: 48, W: 14, shape: 'point', color: c, jit: 4 },
        { n: 17, L: 43, W: 13, shape: 'point', color: darken(c, 0.1), off: 10, jit: 4 }
      ]) + '<circle r="21" fill="#4a2b12"/>' + dots(r, 24, 18, 1.5, '#74481c') + dots(r, 18, 13.5, 1.4, '#6a3f18') +
        dots(r, 12, 9, 1.3, '#5d3514') + '<circle r="6" fill="#2f1a0a"/>';
    },
    chrys: function (c, c2, r) {
      return rings(r, [
        { n: 22, L: 48, W: 7.5, shape: 'narrow', color: lighten(c, 0.15) },
        { n: 20, L: 41, W: 7.5, shape: 'narrow', color: lighten(c, 0.05), off: 8 },
        { n: 16, L: 33, W: 7, shape: 'narrow', color: c, off: 3 },
        { n: 12, L: 24, W: 6.5, shape: 'narrow', color: darken(c, 0.07), off: 14 },
        { n: 9, L: 15, W: 5.5, shape: 'narrow', color: darken(c, 0.14), off: 5 }
      ]) + DEPTH + '<circle r="3.5" fill="' + mix(c, '#b7c94a', 0.65) + '"/>';
    },
    carnation: function (c, c2, r) {
      return rings(r, [
        { n: 13, L: 47, W: 15, shape: 'ruffle', color: lighten(c, 0.1), jit: 9 },
        { n: 11, L: 38, W: 14, shape: 'ruffle', color: c, off: 14, jit: 9 },
        { n: 9, L: 28, W: 12, shape: 'ruffle', color: darken(c, 0.08), off: 4, jit: 9 },
        { n: 7, L: 18, W: 10, shape: 'ruffle', color: darken(c, 0.15), off: 22, jit: 9 },
        { n: 4, L: 9, W: 7, shape: 'ruffle', color: darken(c, 0.22) }
      ]) + DEPTH;
    },
    orchid: function (c, c2, r) {
      var lip = c2 || '#c2338b';
      return ring(r, { n: 3, L: 47, W: 19, shape: 'point', color: lighten(c, 0.05), jit: 2 }) +
        '<path d="' + petal('round', 45, 36) + '" transform="rotate(72)" fill="' + c + '" stroke="' + darken(c, 0.32) + '" stroke-opacity=".42" stroke-width=".7"/>' +
        '<path d="' + petal('round', 45, 36) + '" transform="rotate(-72)" fill="' + c + '" stroke="' + darken(c, 0.32) + '" stroke-opacity=".42" stroke-width=".7"/>' +
        DEPTH + '<path d="' + petal('heart', 25, 22) + '" transform="rotate(180)" fill="' + lip + '"/>' +
        '<path d="' + petal('round', 12, 10) + '" transform="rotate(180)" fill="' + lighten(lip, 0.55) + '"/>' +
        '<ellipse cx="0" cy="-3" rx="4.5" ry="6" fill="#fff8e0" stroke="' + lip + '" stroke-width=".8"/><circle cy="-4" r="1.6" fill="#f2b632"/>';
    },
    hydrangea: function (c, c2, r) {
      var s = '', N = 15;
      for (var i = N - 1; i >= 0; i--) {
        var rad = 35 * Math.sqrt((i + 0.3) / N), a = i * 2.39996 + 0.5;
        var v = (r() - 0.5) * 0.36, col = v > 0 ? lighten(c, v) : darken(c, -v * 0.7);
        s += '<g transform="translate(' + f(Math.cos(a) * rad) + ',' + f(Math.sin(a) * rad) + ') rotate(' + f(r() * 90) + ')">' +
          ring(r, { n: 4, L: 13.5, W: 13, color: col, jit: 6, vary: 0.04 }) + '<circle r="1.5" fill="' + lighten(c, 0.7) + '"/></g>';
      }
      return s;
    },
    lisianthus: function (c, c2, r) {
      return rings(r, [
        { n: 5, L: 47, W: 44, color: lighten(c, 0.2) },
        { n: 5, L: 37, W: 36, color: c, off: 36 },
        { n: 3, L: 22, W: 22, color: darken(c, 0.12), off: 15 }
      ]) + DEPTH + '<circle r="5" fill="#d6e08a"/>' + dots(r, 5, 5.5, 1.3, '#f1c232');
    },
    anemone: function (c, c2, r) {
      var eye = c2 || '#1d1830';
      return rings(r, [
        { n: 7, L: 47, W: 31, color: c },
        { n: 6, L: 37, W: 27, color: lighten(c, 0.12), off: 25 }
      ]) + DEPTH + dots(r, 22, 13, 1.25, eye, 0.85) + '<circle r="9.5" fill="' + eye + '"/>' + dots(r, 9, 5, 1, lighten(eye, 0.25));
    },
    tuberose: function (c, c2, r) {
      var s = '', pos = [[0, -24, 1.15], [-22, 6, 1], [20, 10, 1.05], [-2, 28, 0.8], [26, -18, 0.75], [-27, -20, 0.7]];
      s += '<path d="M0,0L0,-24M0,0L-22,6M0,0L20,10M0,0L-2,28M0,0L26,-18M0,0L-27,-20" stroke="#7fa35a" stroke-width="2" stroke-linecap="round"/>';
      pos.forEach(function (p, i) {
        s += '<g transform="translate(' + p[0] + ',' + p[1] + ') scale(' + p[2] + ') rotate(' + f(r() * 60) + ')">';
        s += i > 3 ? '<ellipse rx="6" ry="9" fill="' + mix(c, '#cfe3a0', 0.45) + '" stroke="#9fb878" stroke-width=".7"/>'
          : ring(r, { n: 6, L: 18, W: 9, shape: 'point', color: c, jit: 4, vary: 0.03 }) + '<circle r="3" fill="#e9eaa8"/>';
        s += '</g>';
      });
      return s;
    },
    gypsophila: function (c, c2, r) {
      var s = '', pts = [];
      for (var i = 0; i < 26; i++) {
        var rad = 44 * Math.sqrt((i + 0.6) / 26), a = i * 2.39996;
        pts.push([Math.cos(a) * rad + (r() - 0.5) * 5, Math.sin(a) * rad + (r() - 0.5) * 5, 2.8 + r() * 2.2]);
      }
      s += '<g stroke="#8fae7c" stroke-width=".8" fill="none">';
      pts.forEach(function (p, i) { if (i % 2 === 0) s += '<path d="M0,0Q' + f(p[0] * 0.3) + ',' + f(p[1] * 0.7) + ' ' + f(p[0]) + ',' + f(p[1]) + '"/>'; });
      s += '</g>';
      pts.forEach(function (p) {
        s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(p[2]) + '" fill="' + c + '" stroke="#c9d3c2" stroke-width=".6"/>' +
          '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(p[2] * 0.3) + '" fill="#e8dc9a"/>';
      });
      return s;
    },
    eucalyptus: function (c, c2, r) {
      var s = '';
      [-90, 28, 150].forEach(function (ang, bi) {
        s += '<g transform="rotate(' + (ang + 90 + (r() - 0.5) * 14) + ')"><path d="M0,0L0,-46" stroke="' + darken(c, 0.3) + '" stroke-width="1.4"/>';
        for (var i = 0; i < 4; i++) {
          var y = -10 - i * 10.5, rr = 8.5 - i * 1.3, col = i % 2 ? lighten(c, 0.14) : c;
          s += '<ellipse cx="' + f(-rr * 0.85) + '" cy="' + f(y) + '" rx="' + f(rr) + '" ry="' + f(rr * 0.85) + '" fill="' + col + '"/>' +
            '<ellipse cx="' + f(rr * 0.85) + '" cy="' + f(y - 3) + '" rx="' + f(rr) + '" ry="' + f(rr * 0.85) + '" fill="' + (bi % 2 ? c : lighten(c, 0.08)) + '"/>';
        }
        s += '<ellipse cx="0" cy="-49" rx="4.5" ry="5" fill="' + lighten(c, 0.2) + '"/></g>';
      });
      return s;
    },
    narenj: function (c, c2, r) {
      var s = leaf(46, 23, '#1f5a3a', 20) + leaf(44, 22, '#2b6e47', 150) + leaf(45, 22, '#174a30', 265);
      [[0, -18, 1.1], [-17, 12, 0.95], [18, 13, 0.9]].forEach(function (p) {
        s += '<g transform="translate(' + p[0] + ',' + p[1] + ') scale(' + p[2] + ') rotate(' + f(r() * 72) + ')">' +
          ring(r, { n: 5, L: 20, W: 9.5, shape: 'narrow', color: c, jit: 5, vary: 0.02 }) +
          '<circle r="4.6" fill="#f6cf52"/>' + dots(r, 8, 4.4, 1, '#e0a021') + '</g>';
      });
      return s + '<circle cx="31" cy="-25" r="9" fill="' + (c2 || '#f2952b') + '"/><circle cx="28.5" cy="-27.5" r="2.4" fill="#ffd9a1" opacity=".7"/>';
    }
  };
  KINDS.gerbera = KINDS.daisy;

  /* گل‌های ریز و سبزینه‌ها بیرونِ دسته‌گل می‌نشینند */
  var FILLER = { gypsophila: 1, eucalyptus: 1 };
  var SMALLISH = { tuberose: 1, narenj: 1, alstro: 1, lisianthus: 1 };

  var KIND_LABELS = {
    rose: 'رز', ranunculus: 'رانکلوس', peony: 'پیونی', damask: 'گل محمدی', tulip: 'لاله', lily: 'لیلیوم',
    alstro: 'آلسترومریا', narcissus: 'نرگس', daisy: 'ژربرا / مینا', sunflower: 'آفتابگردان', chrys: 'داوودی',
    carnation: 'میخک', orchid: 'ارکیده', hydrangea: 'هورتانسیا', lisianthus: 'لیسیانتوس', anemone: 'آنمون',
    tuberose: 'مریم', gypsophila: 'عروس (ژیپسوفیلا)', eucalyptus: 'اکالیپتوس', narenj: 'بهارنارنج'
  };

  /* ---------- مخزن مشترک: هر گل یک‌بار کشیده و با <use> تکرار می‌شود ---------- */
  function defsRoot() {
    var el = document.getElementById('flora-defs');
    if (!el) {
      var wrap = document.createElement('div');
      wrap.innerHTML = '<svg id="flora-defs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
        '<radialGradient id="fl-depth"><stop offset="0" stop-color="#1c0812" stop-opacity=".3"/><stop offset=".55" stop-color="#1c0812" stop-opacity=".07"/><stop offset="1" stop-color="#1c0812" stop-opacity="0"/></radialGradient>' +
        '</defs></svg>';
      el = wrap.firstChild;
      document.body.appendChild(el);
    }
    return el.querySelector('defs');
  }
  function headId(kind, color, c2) {
    if (!KINDS[kind]) kind = 'rose';
    color = color || '#e0457b';
    var id = 'fh-' + kind + '-' + String(color).replace('#', '') + (c2 ? '-' + String(c2).replace('#', '') : '');
    if (!document.getElementById(id)) {
      var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', id);
      g.innerHTML = KINDS[kind](color, c2, rng(hash(id)));
      defsRoot().appendChild(g);
    }
    return id;
  }
  function use(id, x, y, rot, scale, extra) {
    return '<use href="#' + id + '" transform="translate(' + f(x) + ',' + f(y) + ') rotate(' + f(rot) + ') scale(' + (Math.round(scale * 1000) / 1000) + ')"' + (extra || '') + '/>';
  }

  /* ---------- تصویر تک‌شاخه ---------- */
  function single(fl, o) {
    o = o || {};
    var id = headId(fl.kind, fl.color, fl.c2), r = rng(hash(fl.id || fl.name || id));
    var rot = r() * 360, s = '';
    if (!o.bare && !FILLER[fl.kind] && fl.kind !== 'narenj') {
      s += leaf(44, 20, '#2f6b4c', 35 + r() * 20, 0, 0) + leaf(44, 20, '#245a3e', 200 + r() * 30, 0, 0) + leaf(40, 18, '#3b7d58', 285 + r() * 20, 0, 0);
      s = '<g transform="scale(1.32)">' + s + '</g>';
    }
    s += (o.bare ? '' : '<ellipse cx="1" cy="3" rx="46" ry="46" fill="#131a45" opacity=".14"/>') + use(id, 0, 0, rot, o.bare ? 1.2 : 0.96);
    return '<svg class="flora' + (o.cls ? ' ' + o.cls : '') + '" viewBox="-64 -64 128 128"' + (fl.name ? ' role="img" aria-label="' + esc(fl.name) + '"' : ' aria-hidden="true"') + '>' + s + '</svg>';
  }

  /* ---------- تصویر دسته‌گل (دید از بالا) ----------
     items: [{kind,color,c2,n}]  o: {seed, wrap, max, animate, label} */
  function bouquet(items, o) {
    o = o || {};
    var r = rng(hash(o.seed || 'b')), heads = [], total = 0;
    (items || []).forEach(function (it) { total += it.n || 0; });
    var MAX = o.max || 19;
    (items || []).forEach(function (it) {
      var k = total > MAX ? Math.max(1, Math.round(it.n / total * MAX)) : it.n;
      for (var i = 0; i < k; i++) heads.push(it);
    });
    for (var i = heads.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = heads[i]; heads[i] = heads[j]; heads[j] = t; }
    function rank(h) { return FILLER[h.kind] ? 2 : (SMALLISH[h.kind] ? 1 : 0); }
    heads.sort(function (a, b) { return rank(a) - rank(b); });
    var N = heads.length, wrap = o.wrap || '#f6d9c2';
    var s = '';
    // کاغذ دورِ دسته‌گل
    function paper(R1, R2, n, rot, fill, op) {
      var d = '';
      for (var i = 0; i < n * 2; i++) {
        var a = (i * Math.PI / n) + rot, R = i % 2 ? R2 : R1, am = a - Math.PI / n / 2, Rm = (R1 + R2) / 2 + 4;
        d += (i ? 'Q' + f(Math.cos(am) * Rm) + ',' + f(Math.sin(am) * Rm) + ' ' : 'M') + f(Math.cos(a) * R) + ',' + f(Math.sin(a) * R) + ' ';
      }
      return '<path d="' + d + 'Z" fill="' + fill + '"' + (op ? ' opacity="' + op + '"' : '') + '/>';
    }
    if (!o.bare) {
      s += paper(97, 86, 9, 0.2, darken(wrap, 0.1)) + paper(92, 80, 9, 0.55, wrap) + paper(80, 71, 11, 0.1, lighten(wrap, 0.35), 0.75);
      for (var L = 0; L < 11; L++) {
        var la = L * 360 / 11 + r() * 14;
        s += leaf(34 + r() * 8, 15 + r() * 4, ['#2f6b4c', '#245a3e', '#3b7d58', '#1c4a38'][L % 4], la, Math.sin(la * Math.PI / 180) * 44, -Math.cos(la * Math.PI / 180) * 44);
      }
    }
    if (!N) {
      s += '<circle r="40" fill="none" stroke="#1b4a38" stroke-opacity=".3" stroke-width="1.5" stroke-dasharray="4 5"/>';
    }
    var R = N <= 1 ? 0 : (N < 4 ? 28 : (N < 8 ? 44 : 56));
    var size = N <= 1 ? 120 : Math.max(50, Math.min(92, 215 / Math.sqrt(N)));
    var off = r() * 6.28, parts = [];
    heads.forEach(function (h, i) {
      var rad = N <= 1 ? 0 : R * Math.sqrt((i + 0.25) / N) * 1.08, a = i * 2.39996 + off;
      var x = Math.cos(a) * rad + (r() - 0.5) * 5, y = Math.sin(a) * rad + (r() - 0.5) * 5;
      var sc = size / 100 * (FILLER[h.kind] ? 0.86 : 1) * (0.9 + r() * 0.2);
      var id = headId(h.kind, h.color, h.c2);
      var inner = '<circle cx="' + f(x + 1) + '" cy="' + f(y + 2.5) + '" r="' + f(sc * 45) + '" fill="#131a45" opacity="' + (FILLER[h.kind] ? 0 : 0.16) + '"/>' +
        use(id, x, y, r() * 360, sc);
      parts.push(o.animate ? '<g class="bloom" style="--i:' + (N - i) + ';transform-origin:' + f(x) + 'px ' + f(y) + 'px">' + inner + '</g>' : inner);
    });
    s += parts.reverse().join('');
    return '<svg class="flora' + (o.cls ? ' ' + o.cls : '') + '" viewBox="-100 -100 200 200" role="img" aria-label="' + esc(o.label || 'دسته‌گل') + '">' + s + '</svg>';
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* رنگ ملایم پس‌زمینه‌ی کارت، از روی رنگ گل */
  function tint(color, t) {
    var c = color || '#e0457b';
    if (lum(c) > 0.86) c = '#a9bdf0';
    return mix(c, '#ffffff', t == null ? 0.8 : t);
  }

  window.Flora = {
    single: single, bouquet: bouquet, tint: tint, mix: mix, lighten: lighten, darken: darken,
    kinds: Object.keys(KIND_LABELS), kindLabels: KIND_LABELS, hash: hash, rng: rng, headId: headId
  };
})();
