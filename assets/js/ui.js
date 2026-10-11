/* ============================================================
   ui.js — ابزارهای مشترک فروشگاه و پنل مدیریت
   ============================================================ */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var P = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    heart: '<path d="M12 20.5s-7.5-4.4-7.5-10A4.5 4.5 0 0 1 12 7.6a4.5 4.5 0 0 1 7.5 2.9c0 5.6-7.5 10-7.5 10Z"/>',
    bag: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/>',
    camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    leaf: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19c3-5 6-8 10-10"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8L12 3.5Z"/>',
    insta: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.7"/><circle cx="16.6" cy="7.4" r=".6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    wand: '<path d="m5 19 10-10M14 5l.7 2.3L17 8l-2.3.7L14 11l-.7-2.3L11 8l2.3-.7L14 5ZM18.5 13l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5Z"/>',
    phone: '<path d="M6 4h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 2-2Z"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
    moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4"/>',
    trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>',
    chart: '<path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-7"/>',
    tag: '<path d="M4 4h8l8 8-8 8-8-8V4Z"/><circle cx="8.5" cy="8.5" r="1.3"/>',
    box: '<path d="M4 8 12 4l8 4v8l-8 4-8-4V8ZM4 8l8 4 8-4M12 12v8"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18"/>',
    list: '<path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"/>',
    gift: '<path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7s-1-3.5-3.5-3.5S6 7 12 7Zm0 0s1-3.5 3.5-3.5S18 7 12 7Z"/>',
    out: '<path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
    chat: '<path d="M4 5h16v11H9l-5 4V5Z"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    flower: '<circle cx="12" cy="12" r="2.4"/><path d="M12 9.6C10 4 14 4 12 9.6ZM14.1 10.8c4.7-3.6 6.7-.2 0 0ZM14.1 13.2c6.7.2 4.7 3.6 0 0ZM12 14.4c2 5.6-2 5.6 0 0ZM9.9 13.2c-4.7 3.6-6.7.2 0 0ZM9.9 10.8c-6.7-.2-4.7-3.6 0 0Z"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="m4 16 4.5-4.5 4 4 2.5-2.5L20 17"/><circle cx="15" cy="9.5" r="1.3"/>',
    back: '<path d="M10 6l6 6-6 6"/>'
  };
  function ic(name, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  }

  function toast(msg, bad) {
    var box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.className = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    var t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.innerHTML = (bad ? '' : ic('check')) + '<span>' + esc(msg) + '</span>';
    box.appendChild(t); setTimeout(function () { t.remove(); }, 2800);
  }

  /* تصویر محصول: عکس بارگذاری‌شده یا نقاشی */
  function artBouquet(b, o) {
    if (b.img) return '<img class="photo" src="' + esc(b.img) + '" alt="' + esc(b.name) + '" loading="lazy">';
    o = o || {};
    return Flora.bouquet(Q.bouquetItems(b), { seed: b.id, wrap: b.wrap, label: b.name, animate: o.animate, max: o.max, bare: o.bare });
  }
  function artFlower(f) {
    if (f.img) return '<img class="photo" src="' + esc(f.img) + '" alt="' + esc(f.name) + '" loading="lazy">';
    return Flora.single(f);
  }
  // کاشی پس‌زمینه‌ی هر محصول یکی از سه گرادیان تم است (در style.css: --tile-1 تا --tile-3)
  function tile(id) { return 'var(--tile-' + (Flora.hash(String(id)) % 3 + 1) + ')'; }
  function bgB(b) { return tile(b.id); }
  function bgF(f) { return tile(f.id); }

  /* کوچک‌کردن عکس قبل از ذخیره تا حافظه‌ی مرورگر پر نشود */
  function readImage(file, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        var m = 720, s = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.82));
      };
      im.onerror = function () { toast('این فایل عکس نیست یا خراب است.', true); };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  window.UI = { esc: esc, ic: ic, toast: toast, artBouquet: artBouquet, artFlower: artFlower, bgB: bgB, bgF: bgF, tile: tile, readImage: readImage };
})();
