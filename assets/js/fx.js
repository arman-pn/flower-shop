/* ============================================================
   fx.js — جلوه‌ها و انیمیشن‌ها
   هیچ‌کدام برای کارکرد سایت لازم نیست؛ اگر این فایل حذف شود سایت
   بدون انیمیشن ولی کامل کار می‌کند. اگر کاربر «کاهش حرکت» را در
   سیستم‌عاملش روشن کرده باشد، همه خاموش می‌شوند.
   ============================================================ */
(function () {
  'use strict';
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = null, root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ---------- لایه‌های ثابت: شفق، گلبرگ‌های در حال ریزش، نوار پیشرفت ---------- */
  function layers() {
    var a = document.createElement('div'); a.className = 'aurora'; a.setAttribute('aria-hidden', 'true'); a.innerHTML = '<i></i><i></i><i></i>';
    document.body.insertBefore(a, document.body.firstChild);
    var p = document.createElement('div'); p.className = 'progress'; p.setAttribute('aria-hidden', 'true'); document.body.appendChild(p);
    if (calm) return;
    if (fine) { var g = document.createElement('div'); g.className = 'cursor-glow'; g.setAttribute('aria-hidden', 'true'); document.body.insertBefore(g, a.nextSibling); }
    var box = document.createElement('div'); box.className = 'petals'; box.setAttribute('aria-hidden', 'true');
    var cols = ['#ff8fc0', '#ffb3d5', '#8ea6ff', '#b9a2ff', '#ffd0e4', '#a9c1ff'], h = '';
    for (var i = 0; i < 14; i++) {
      var s = 10 + Math.random() * 12;
      h += '<i class="petal" style="left:' + (Math.random() * 100).toFixed(1) + '%;width:' + s.toFixed(0) + 'px;height:' + (s * 1.35).toFixed(0) + 'px;background:' + cols[i % cols.length] +
        ';animation-duration:' + (11 + Math.random() * 12).toFixed(1) + 's;animation-delay:-' + (Math.random() * 20).toFixed(1) + 's;--sway:' + ((Math.random() - 0.5) * 30).toFixed(0) + 'vw;--spin:' + (300 + Math.random() * 600).toFixed(0) + 'deg"></i>';
    }
    box.innerHTML = h; document.body.insertBefore(box, a.nextSibling);
  }

  /* ---------- اسکرول: نوار پیشرفت، جمع‌شدن سربرگ، دکمه‌ی بالا ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var max = root.scrollHeight - innerHeight, y = window.scrollY || 0;
      root.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
      var h = $('.hdr'); if (h) h.classList.toggle('scrolled', y > 30);
      var t = $('.to-top'); if (t) t.classList.toggle('on', y > 700);
    });
  }

  /* ---------- نمایش تدریجی هنگام رسیدن به هر بخش ---------- */
  var RV = '.sec-h, .grid > .card, .bento-i, .promise > div, .panel, .band, .offer, .insta, .guide-item, .scroller-wrap, .rev-marquee, .kpi, .a-card, .two > *, .plan, .hero-stats';
  function reveal() {
    if (calm || !('IntersectionObserver' in window)) return;
    root.classList.add('has-fx');
    if (!io) io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; io.unobserve(el); el.classList.add('in');
        // بعد از پایان حرکت، ویژگی را برمی‌داریم تا حرکت‌های hover خودِ عنصر آزاد شود
        setTimeout(function () { el.removeAttribute('data-rv'); el.classList.remove('in'); el.style.removeProperty('--d'); }, 900 + (parseFloat(el.style.getPropertyValue('--d')) || 0) * 70);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    var groups = new Map();
    document.querySelectorAll(RV).forEach(function (el) {
      if (el.hasAttribute('data-seen') || el.closest('#shop-grid') || el.closest('.offer .grid') || el.closest('.modal')) return;
      el.setAttribute('data-seen', '');
      var par = el.parentNode, n = groups.get(par) || 0; groups.set(par, n + 1);
      el.setAttribute('data-rv', el.classList.contains('insta') || el.classList.contains('bento-i') ? 'zoom' : '');
      el.style.setProperty('--d', Math.min(n, 7));
      io.observe(el);
    });
  }

  /* ---------- شمارش عددها ---------- */
  function fa(n, dec) { return Number(n).toLocaleString('fa-IR', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
  function counters() {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      if (el.hasAttribute('data-counted')) return; el.setAttribute('data-counted', '');
      var to = parseFloat(el.dataset.count) || 0, dec = +el.dataset.dec || 0, t0 = null, dur = 1300;
      if (calm) { el.textContent = fa(to, dec); return; }
      function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.textContent = fa(to * e, dec); if (k < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  }

  /* ---------- کج‌شدن سه‌بعدی کارت‌ها و حرکت قهرمان با ماوس ---------- */
  var lastCard = null;
  function onMove(ev) {
    root.style.setProperty('--cx', ev.clientX + 'px'); root.style.setProperty('--cy', ev.clientY + 'px');
    var st = $('.stage');
    if (st) { var r = st.getBoundingClientRect(); if (r.bottom > 0) { st.style.setProperty('--mx', ((ev.clientX - r.left - r.width / 2) / innerWidth).toFixed(3)); st.style.setProperty('--my', ((ev.clientY - r.top - r.height / 2) / innerHeight).toFixed(3)); } }
    var card = ev.target.closest ? ev.target.closest('.card') : null;
    if (lastCard && lastCard !== card) { lastCard.style.removeProperty('--rx'); lastCard.style.removeProperty('--ry'); lastCard = null; }
    if (!card || card.hasAttribute('data-rv')) return;
    var b = card.getBoundingClientRect(), x = (ev.clientX - b.left) / b.width, y = (ev.clientY - b.top) / b.height;
    card.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg'); card.style.setProperty('--rx', ((0.5 - y) * 9).toFixed(2) + 'deg');
    var art = card.querySelector('.card-art'); if (art) { art.style.setProperty('--gx', (x * 100).toFixed(0) + '%'); art.style.setProperty('--gy', (y * 100).toFixed(0) + '%'); }
    lastCard = card;
  }

  /* ---------- موج روی دکمه‌ها ---------- */
  function ripple(ev) {
    var b = ev.target.closest ? ev.target.closest('.btn') : null; if (!b || calm) return;
    var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement('span');
    s.className = 'ripple'; s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (ev.clientX - r.left - d / 2) + 'px;top:' + (ev.clientY - r.top - d / 2) + 'px';
    b.appendChild(s); setTimeout(function () { s.remove(); }, 650);
  }

  /* ---------- پرواز محصول به سبد ---------- */
  function cartIcon() { var list = document.querySelectorAll('[data-act="cart"]'); for (var i = 0; i < list.length; i++) if (list[i].offsetParent !== null) return list[i]; return null; }
  function bump() { var c = cartIcon(); if (!c) return; c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
  function fly(from, done) {
    var to = cartIcon();
    if (calm || !from || !to) { bump(); if (done) done(); return; }
    var a = from.getBoundingClientRect(), b = to.getBoundingClientRect(), size = Math.min(a.width, a.height, 220);
    var f = document.createElement('div'); f.className = 'flyer';
    f.style.cssText = 'left:' + (a.left + a.width / 2 - size / 2) + 'px;top:' + (a.top + a.height / 2 - size / 2) + 'px;width:' + size + 'px;height:' + size + 'px;background:' + getComputedStyle(from).backgroundImage;
    f.innerHTML = from.innerHTML; document.body.appendChild(f);
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      f.style.transform = 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2) + 'px,' + (b.top + b.height / 2 - a.top - a.height / 2) + 'px) scale(.12) rotate(200deg)'; f.style.opacity = '.4';
    }); });
    setTimeout(function () { f.remove(); bump(); if (done) done(); }, 760);
  }

  /* ---------- بارانِ گلبرگ بعد از ثبت سفارش ---------- */
  function confetti() {
    if (calm) return;
    var cols = ['#f0398b', '#ff7fb8', '#3554f2', '#6d86ff', '#8b5cf6', '#ffd0e4', '#ffc14d'];
    for (var i = 0; i < 56; i++) {
      var c = document.createElement('i'), ang = Math.random() * Math.PI * 2, dist = 28 + Math.random() * 46;
      c.className = 'confetti';
      c.style.cssText = 'background:' + cols[i % cols.length] + ';--x:' + (50 + Math.cos(ang) * dist).toFixed(1) + 'vw;--y:' + (45 + Math.sin(ang) * dist * 0.9 + 14).toFixed(1) + 'vh;--r:' + (Math.random() * 900 - 450).toFixed(0) + 'deg;animation-delay:' + (Math.random() * 0.25).toFixed(2) + 's';
      document.body.appendChild(c); (function (el) { setTimeout(function () { el.remove(); }, 2400); })(c);
    }
  }

  function clicks(ev) {
    ripple(ev);
    var sb = ev.target.closest ? ev.target.closest('.sc-btn') : null;
    if (sb) { var sc = sb.parentNode.querySelector('.scroller'); if (sc) sc.scrollBy({ left: (sb.classList.contains('next') ? -1 : 1) * sc.clientWidth * 0.8, behavior: 'smooth' }); }
    if (ev.target.closest && ev.target.closest('.to-top')) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- تایپ‌شدن نمونه‌ها در کادر جست‌وجو ---------- */
  var typeTimer = null;
  function typer() {
    if (calm || typeTimer) return;
    var words = ['رز قرمز', 'نرگس شیراز', 'دسته‌گل تولد', 'ارکیده', 'باکس گل', 'بهارنارنج'], w = 0, n = 0, dir = 1, wait = 0;
    typeTimer = setInterval(function () {
      var el = document.getElementById('q'); if (!el || document.activeElement === el || el.value) return;
      if (wait > 0) { wait--; return; }
      n += dir; el.placeholder = 'مثلاً: ' + words[w].slice(0, n);
      if (n >= words[w].length) { dir = -1; wait = 14; } else if (n <= 0) { dir = 1; w = (w + 1) % words.length; wait = 3; }
    }, 110);
  }

  /* ---------- عوض‌شدن تم با موج دایره‌ای از محل دکمه ---------- */
  function themeSwap(btn, apply) {
    if (calm || !document.startViewTransition || !btn) { apply(); return; }
    var r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var vt = document.startViewTransition(apply);
    vt.ready.then(function () {
      root.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + rad + 'px at ' + x + 'px ' + y + 'px)'] }, { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(function () { });
  }

  function refresh() { reveal(); counters(); onScroll(); typer(); }

  document.addEventListener('DOMContentLoaded', function () {
    layers();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    document.addEventListener('click', clicks);
    if (fine && !calm) document.addEventListener('mousemove', onMove, { passive: true });
  });

  window.FX = { refresh: refresh, fly: fly, confetti: confetti, bump: bump, themeSwap: themeSwap };
})();
