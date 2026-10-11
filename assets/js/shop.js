/* ============================================================
   shop.js — صفحه‌های فروشگاه (آنچه مشتری می‌بیند)
   هر تابع view یک صفحه را می‌سازد. مسیرها پایین فایل در ROUTES هستند.
   ============================================================ */
(function () {
  'use strict';
  var esc = UI.esc, ic = UI.ic, toast = UI.toast;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var D = function () { return DB.load(); };
  var app;

  /* ---------- تکه‌های تکراری ---------- */
  function priceHTML(p) {
    return '<div class="price-row"><span class="price">' + fmt(p.final) + '<small>تومان</small></span>' +
      (p.discount ? '<span class="price-old">' + fmt(p.base) + '</span>' : '') + '</div>';
  }
  function stars(r) {
    if (!r) return '';
    return '<span class="stars">' + ic('star') + '<b class="num">' + fa(r.avg.toFixed(1)) + '</b> (' + fa(r.n) + ')</span>';
  }
  function isWish(id) { return D().wish.indexOf(id) > -1; }
  function cardB(b, i) {
    var p = Q.priceOf(b, true, 0), names = Q.bouquetItems(b).slice(0, 3).map(function (i) { return i.f.name; }).join('، ');
    var isNew = Date.now() - b.created < 12 * DAY;
    return '<article class="card' + (b.stock <= 0 ? ' soldout' : '') + '" style="--n:' + (i || 0) + '"><div class="card-top">' +
      '<a class="card-art arch" href="#/bouquet/' + b.id + '" style="background:' + UI.bgB(b) + '" aria-label="' + esc(b.name) + '">' + UI.artBouquet(b) + '</a>' +
      '<div class="tags">' + (p.discount ? '<span class="tag">' + fa(p.discount) + '٪ تخفیف</span>' : '') + (b.stock <= 0 ? '<span class="tag dark">تمام شد</span>' : (isNew ? '<span class="tag dark">تازه</span>' : '')) + '</div>' +
      '<button class="card-wish' + (isWish(b.id) ? ' on' : '') + '" data-act="wish" data-id="' + b.id + '" aria-label="افزودن به علاقه‌مندی‌ها">' + ic('heart') + '</button>' +
      (b.stock > 0 ? '<button class="card-add" data-act="add" data-type="bouquet" data-id="' + b.id + '">افزودن به سبد</button>' : '') +
      '</div><div class="card-b"><h3><a href="#/bouquet/' + b.id + '">' + esc(b.name) + '</a></h3>' +
      '<div class="card-meta">' + esc(names) + '</div>' + priceHTML(p) + stars(Q.rating(b.id)) + '</div></article>';
  }
  function cardF(f, i) {
    var p = Q.priceOf(f, false), n = Q.bouquetsWith(f.id).length;
    return '<article class="card' + (f.stock <= 0 ? ' soldout' : '') + '" style="--n:' + (i || 0) + '"><div class="card-top">' +
      '<a class="card-art arch" href="#/flower/' + f.id + '" style="background:' + UI.bgF(f) + '" aria-label="' + esc(f.name) + '">' + UI.artFlower(f) + '</a>' +
      '<div class="tags">' + (p.discount ? '<span class="tag">' + fa(p.discount) + '٪ تخفیف</span>' : '') + (f.stock <= 0 ? '<span class="tag dark">تمام شد</span>' : '') + '</div>' +
      (f.stock > 0 ? '<button class="card-add" data-act="add" data-type="flower" data-id="' + f.id + '">افزودن یک شاخه</button>' : '') +
      '</div><div class="card-b"><h3><a href="#/flower/' + f.id + '">' + esc(f.name) + '</a></h3>' +
      '<div class="card-meta">' + (n ? 'در ' + fa(n) + ' دسته‌گل' : esc(f.season)) + '</div>' +
      '<div class="price-row"><span class="price">' + fmt(p.final) + '<small>تومان / شاخه</small></span>' + (p.discount ? '<span class="price-old">' + fmt(p.base) + '</span>' : '') + '</div></div></article>';
  }
  function empty(title, text, btn) {
    return '<div class="empty">' + Flora.single({ kind: 'narcissus', color: '#fffdf2', c2: '#f6b21b', name: '' }) + '<h3>' + title + '</h3><p>' + text + '</p>' + (btn || '') + '</div>';
  }
  function crumbs(list) {
    return '<nav class="crumbs" aria-label="مسیر"><a href="#/">خانه</a>' + list.map(function (c) { return '<span>/</span>' + (c[1] ? '<a href="' + c[1] + '">' + esc(c[0]) + '</a>' : '<span>' + esc(c[0]) + '</span>'); }).join('') + '</nav>';
  }
  function activeB() { return D().bouquets.filter(function (b) { return b.active; }); }
  function activeF() { return D().flowers.filter(function (f) { return f.active; }); }
  function occs() { return D().cats.filter(function (c) { return c.type === 'occasion' && c.active; }); }
  function styles() { return D().cats.filter(function (c) { return c.type === 'style' && c.active; }); }

  /* مهلت تحویل امروز */
  function sameDay() {
    var s = D().settings, now = new Date(), cut = new Date(); cut.setHours(s.cutoff, 0, 0, 0);
    var left = cut - now;
    if (left <= 0) return { open: false, text: 'سفارش‌های الان، فردا صبح تحویل می‌شوند' };
    var h = Math.floor(left / 3600000), m = Math.floor(left % 3600000 / 60000), sec = Math.floor(left % 60000 / 1000);
    return { open: true, text: 'تحویل امروز، اگر تا <b>' + fa(String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0')) + '</b> دیگر سفارش دهید' };
  }
  function clockParts(ends) {
    var left = Math.max(0, ends - Date.now());
    return [Math.floor(left / DAY), Math.floor(left % DAY / 3600000), Math.floor(left % 3600000 / 60000), Math.floor(left % 60000 / 1000)].map(function (v) { return fa(String(v).padStart(2, '0')); });
  }
  function clockHTML(ends) {
    var p = clockParts(ends), l = ['روز', 'ساعت', 'دقیقه', 'ثانیه'];
    return p.map(function (v, i) { return '<div><b>' + v + '</b><span>' + l[i] + '</span></div>'; }).join('');
  }
  function clockTick(el) { // فقط رقمی که عوض شده ورق می‌خورد
    var p = clockParts(+el.dataset.clock), bs = el.querySelectorAll('b');
    p.forEach(function (v, i) { if (bs[i] && bs[i].textContent !== v) { bs[i].textContent = v; bs[i].classList.remove('flip'); void bs[i].offsetWidth; bs[i].classList.add('flip'); } });
  }

  /* ---------- صفحه‌ی اول ---------- */
  function home() {
    var d = D(), s = d.settings, heroB = Q.bouquet(s.heroBouquet) || activeB()[0], sd = sameDay();
    var feat = activeB().filter(function (b) { return b.featured; }).slice(0, 8);
    var best = Q.bestSellers(4), offer = s.offer, h = '';
    var okRev = d.reviews.filter(function (r) { return r.approved; });
    var avg = okRev.length ? okRev.reduce(function (n, r) { return n + r.rating; }, 0) / okRev.length : 5;
    var delivered = d.orders.filter(function (o) { return o.status === 'delivered'; }).length;

    // تیتر: هر واژه جدا بالا می‌آید؛ نیمه‌ی دوم رنگِ گرادیانی می‌گیرد
    var words = String(s.heroTitle).split(' '), cut = Math.ceil(words.length / 2);
    var title = words.map(function (w, i) { return '<span class="w' + (i >= cut ? ' grad-t' : '') + '" style="--i:' + i + '">' + esc(w) + '</span>'; }).join(' ');

    h += '<section class="hero"><div class="wrap hero-in"><div>' +
      '<div class="same-day"><i class="pulse"></i><span data-sameday>' + sd.text + '</span></div>' +
      '<h1>' + title + '</h1><p class="lead">' + esc(s.heroText) + '</p>' +
      '<div class="hero-cta"><a class="btn" href="#/shop">دیدن دسته‌گل‌ها</a><a class="btn btn-g" href="#/builder">' + ic('wand') + 'دسته‌گل خودتان را بسازید</a></div>' +
      '<form class="finder" data-form="finder"><div><label for="fd-occ">برای چه مناسبتی؟</label><select id="fd-occ" name="occ"><option value="">همه</option>' +
      occs().map(function (o) { return '<option value="' + o.id + '">' + esc(o.name) + '</option>'; }).join('') + '</select></div>' +
      '<div><label for="fd-col">چه رنگی؟</label><select id="fd-col" name="color"><option value="">فرقی ندارد</option>' + colors().map(function (c) { return '<option>' + c.name + '</option>'; }).join('') + '</select></div>' +
      '<div><label for="fd-bud">تا چه قیمتی؟</label><select id="fd-bud" name="max"><option value="0">هر قیمتی</option><option value="1500000">تا ۱٫۵ میلیون</option><option value="2500000">تا ۲٫۵ میلیون</option><option value="4000000">تا ۴ میلیون</option></select></div>' +
      '<button class="btn" type="submit">نشانم بده</button></form>' +
      '<div class="hero-stats"><div class="stat"><b class="grad-t" data-count="' + delivered + '">' + fa(delivered) + '</b><span>سفارش تحویل‌شده در این ماه</span></div>' +
      '<div class="stat"><b class="grad-t" data-count="' + avg.toFixed(1) + '" data-dec="1">' + fa(avg.toFixed(1)) + '</b><span>میانگین امتیاز خریدارها از ۵</span></div>' +
      '<div class="stat"><b class="grad-t" data-count="' + activeF().length + '">' + fa(activeF().length) + '</b><span>نوع گل تازه در ویترین</span></div></div></div>';
    if (heroB) {
      var orbs = activeF().filter(function (f) { return ['rose', 'peony', 'hydrangea', 'lisianthus', 'damask', 'orchid'].indexOf(f.kind) > -1; }).slice(0, 3);
      h += '<div class="stage" id="stage"><div class="stage-blob"></div>' +
        '<div class="stage-orbit" aria-hidden="true">' + orbs.map(function (f) { return '<span class="orb">' + Flora.single(f, { bare: true }) + '</span>'; }).join('') + '</div>' +
        '<a class="stage-bq" href="#/bouquet/' + heroB.id + '" aria-label="' + esc(heroB.name) + '">' + UI.artBouquet(heroB, { animate: true }) + '</a>' +
        '<a class="chip-f c1" href="#/bouquet/' + heroB.id + '"><span class="dot-ic">' + ic('bag') + '</span><span><strong>' + esc(heroB.name) + '</strong><span>از ' + fmt(Q.priceOf(heroB, true, 0).final) + ' تومان</span></span></a>' +
        '<div class="chip-f c2"><span class="dot-ic">' + ic('camera') + '</span><span><strong>عکس قبل از ارسال</strong><span>اول شما می‌بینید</span></span></div>' +
        '<div class="chip-f c3"><span class="stars">' + ic('star') + '</span><strong class="num">' + fa(avg.toFixed(1)) + '</strong></div></div>';
    }
    h += '</div></section>';

    var mq = ['تحویل همان روز در شیراز', 'عکس قبل از ارسال', 'هفت روز تازگی', 'کارت دست‌نویس رایگان', 'ساخت دسته‌گل دلخواه', 'اشتراک گل تازه', 'گل‌آرایی عروسی و مراسم'];
    var mqh = mq.map(function (t) { return '<span>' + t + '</span>'; }).join('');
    h += '<div class="marquee" aria-hidden="true"><div class="marquee-track">' + mqh + mqh + mqh + mqh + '</div></div>';

    h += '<div class="wrap"><div class="promise">' +
      '<div>' + ic('truck') + '<b>تحویل همان روز در شیراز</b><span>سفارش تا ساعت ' + fa(s.cutoff) + '، در بازه‌ای که شما می‌گویید</span></div>' +
      '<div>' + ic('camera') + '<b>عکس قبل از ارسال</b><span>دسته‌گل آماده را اول شما می‌بینید</span></div>' +
      '<div>' + ic('leaf') + '<b>هفت روز تازگی</b><span>اگر زودتر پژمرد، دوباره می‌فرستیم</span></div>' +
      '<div>' + ic('gift') + '<b>کارت دست‌نویس رایگان</b><span>پیامتان را با خودنویس می‌نویسیم</span></div></div></div>';

    h += '<section class="sec"><div class="wrap"><div class="sec-h"><div><h2>برای چه روزی گل می‌خواهید؟</h2><p>مناسبت را انتخاب کنید؛ دسته‌گل‌های مناسبش را نشان می‌دهیم.</p></div></div><div class="bento">' +
      occs().map(function (o) {
        var list = activeB().filter(function (x) { return x.cats.indexOf(o.id) > -1; }), b = list[0];
        var art = b ? UI.artBouquet(b, { max: 12, bare: true }) : Flora.single({ kind: 'rose', color: '#f4a6c0', name: o.name }, { bare: true });
        return '<a class="bento-i" href="#/shop/occ/' + o.id + '"><b>' + esc(o.name) + '</b><small>' + fa(list.length) + ' دسته‌گل</small>' + art + '</a>';
      }).join('') + '</div></div></section>';

    var dA = Flora.single({ kind: 'hydrangea', color: '#8fa8e8', id: 'dA' }, { bare: true, cls: 'sec-deco l' }), dB = Flora.single({ kind: 'peony', color: '#f6b8c8', id: 'dB' }, { bare: true, cls: 'sec-deco r' });
    if (feat.length) h += '<section class="sec">' + dA + dB + '<div class="wrap"><div class="sec-h"><div><h2>پیشنهاد ' + esc(s.name) + '</h2><p>دسته‌گل‌هایی که این روزها بیشتر از همه دوستشان داریم.</p></div><a class="link" href="#/shop">همه‌ی دسته‌گل‌ها</a></div><div class="grid">' + feat.map(cardB).join('') + '</div></div></section>';

    if (offer && offer.on && offer.ends > Date.now()) {
      var obs = offer.ids.map(Q.bouquet).filter(function (b) { return b && b.active; }).slice(0, 3);
      if (obs.length) h += '<section class="sec"><div class="wrap"><div class="offer"><div><h2>' + esc(offer.title) + '</h2><p>' + fa(offer.percent) + '٪ تخفیف روی این دسته‌گل‌ها، فقط تا پایان این شمارش.</p><div class="clock num" data-clock="' + offer.ends + '">' + clockHTML(offer.ends) + '</div><a class="btn" href="#/shop/sale">همه‌ی تخفیف‌دارها</a></div><div class="grid">' + obs.map(cardB).join('') + '</div></div></div></section>';
    }

    h += '<section class="sec"><div class="wrap"><div class="sec-h"><div><h2>گل شاخه‌ای</h2><p>هر گل را جدا بخرید، یا ببینید با آن چه دسته‌گل‌هایی بسته‌ایم.</p></div><a class="link" href="#/flowers">همه‌ی گل‌ها و قیمت‌ها</a></div>' +
      '<div class="scroller-wrap"><button class="sc-btn prev" aria-label="قبلی">' + ic('back') + '</button><div class="scroller">' +
      activeF().map(function (f) {
        return '<a class="stem" href="#/flower/' + f.id + '"><span class="stem-art" style="background:' + UI.bgF(f) + '">' + UI.artFlower(f) + '</span><b>' + esc(f.name) + '</b><span class="num">' + fmt(Q.priceOf(f, false).final) + ' تومان</span></a>';
      }).join('') + '</div><button class="sc-btn next" aria-label="بعدی">' + ic('back') + '</button></div></div></section>';

    var decoA = Flora.bouquet([{ kind: 'peony', color: '#f6b8c8', n: 3 }, { kind: 'anemone', color: '#ffffff', c2: '#1d1830', n: 2 }, { kind: 'lisianthus', color: '#b79ae0', n: 3 }], { seed: 'decoA', bare: true, cls: 'deco' });
    var decoB = Flora.bouquet([{ kind: 'hydrangea', color: '#8fa8e8', n: 2 }, { kind: 'rose', color: '#fbf6ee', n: 3 }, { kind: 'rose', color: '#f4a6c0', n: 2 }], { seed: 'decoB', bare: true, cls: 'deco' });
    h += '<section class="sec"><div class="wrap duo">' +
      '<div class="panel panel-a"><h2>دسته‌گل خودتان را بسازید</h2><p>شاخه‌ها را یکی‌یکی انتخاب کنید و همان لحظه ببینید دسته‌گلتان چه شکلی می‌شود.</p><a class="btn" href="#/builder">شروع ساخت</a>' + decoA + '</div>' +
      '<div class="panel panel-b"><h2>اشتراک گل تازه</h2><p>هر هفته یا هر ماه، گل فصل به خانه یا دفتر شما می‌رسد. هر وقت خواستید لغو کنید.</p><a class="btn" href="#/subscribe">دیدن طرح‌ها</a>' + decoB + '</div></div></section>';

    if (best.length) h += '<section class="sec">' + Flora.single({ kind: 'lisianthus', color: '#b79ae0', id: 'dC' }, { bare: true, cls: 'sec-deco l' }) + Flora.single({ kind: 'rose', color: '#f4a6c0', id: 'dD' }, { bare: true, cls: 'sec-deco r' }) + '<div class="wrap"><div class="sec-h"><div><h2>پرفروش‌های این ماه</h2><p>بر اساس سفارش‌های سی روز گذشته.</p></div></div><div class="grid">' + best.map(cardB).join('') + '</div></div></section>';

    h += '<section class="sec"><div class="wrap"><div class="band"><div><h2>عروسی یا افتتاحیه در پیش دارید؟</h2><p>سالن را می‌بینیم، طرح می‌دهیم و روز مراسم خودمان می‌چینیم.</p></div><div class="hero-cta" style="margin:0"><a class="btn" href="#/events">درخواست مشاوره</a><a class="btn btn-g" href="#/guide">راهنمای گل‌ها</a></div></div></div></section>';

    // آخرین چیزهایی که همین مشتری دیده است
    var seen = d.recent.map(function (k) { var id = k.slice(2); return k[0] === 'b' ? { b: Q.bouquet(id) } : { f: Q.flower(id) }; }).filter(function (x) { return (x.b && x.b.active) || (x.f && x.f.active); }).slice(0, 4);
    if (seen.length > 1) h += '<section class="sec"><div class="wrap"><div class="sec-h"><h2>آخرین بازدیدهای شما</h2></div><div class="grid">' + seen.map(function (x) { return x.b ? cardB(x.b) : cardF(x.f); }).join('') + '</div></div></section>';

    if (okRev.length) {
      var rh = okRev.map(revHTML).join('');
      h += '<section class="sec"><div class="wrap"><div class="sec-h"><div><h2>از زبان مشتری‌ها</h2><p>نظر خریدارها، همان‌طور که نوشته‌اند.</p></div></div></div><div class="rev-marquee"><div class="marquee-track">' + rh + rh + rh + rh + '</div></div></section>';
    }

    if (d.insta.enabled && d.insta.posts.length) {
      h += '<section class="sec"><div class="wrap"><div class="sec-h"><div><h2>' + esc(d.insta.title) + '</h2><p dir="ltr" style="text-align:end">@' + esc(d.insta.handle) + '</p></div><a class="btn btn-g" target="_blank" rel="noopener" href="https://instagram.com/' + encodeURIComponent(d.insta.handle) + '">' + ic('insta') + 'دنبال کردن</a></div><div class="insta-grid">' +
        d.insta.posts.slice(0, 6).map(function (p) {
          var b = Q.bouquet(p.bid), href = b ? '#/bouquet/' + b.id : (p.link || 'https://instagram.com/' + encodeURIComponent(d.insta.handle));
          var art = p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.caption) + '" loading="lazy">' : (b ? UI.artBouquet(b, { max: 12 }) : '');
          return '<a class="insta" href="' + esc(href) + '"' + (b ? '' : ' target="_blank" rel="noopener"') + ' style="background:' + (b ? UI.bgB(b) : 'var(--surface-2)') + '">' + art +
            '<span class="insta-cap"><span>' + esc(p.caption) + '</span><b>' + ic('heart') + fa((p.likes || 0).toLocaleString('en')) + (b ? ' · خرید همین دسته‌گل' : '') + '</b></span></a>';
        }).join('') + '</div></div></section>';
    }
    return h;
  }
  function revHTML(r) {
    var b = Q.bouquet(r.bid), st = '';
    for (var i = 0; i < 5; i++) st += '<svg viewBox="0 0 24 24" style="' + (i < r.rating ? '' : 'opacity:.25') + '"><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8L12 3.5Z"/></svg>';
    return '<blockquote class="rev" style="margin:0"><span class="stars">' + st + '</span><p>' + esc(r.text) + '</p><footer><span>' + esc(r.name) + '</span>' + (b ? '<a class="link" href="#/bouquet/' + b.id + '">' + esc(b.name) + '</a>' : '') + '</footer></blockquote>';
  }
  function colors() {
    var seen = {}, out = [];
    activeF().forEach(function (f) { if (!seen[f.colorName]) { seen[f.colorName] = 1; out.push({ name: f.colorName, hex: f.color }); } });
    return out;
  }

  /* ---------- فهرست دسته‌گل‌ها با فیلتر ---------- */
  var F = { occ: '', style: '', flower: '', color: '', max: 0, sale: false, q: '', sort: 'pop' };
  function shop(a) {
    F = { occ: '', style: '', flower: '', color: '', max: 0, sale: false, q: '', sort: F.sort }; // هر بار ورود به صفحه، فیلترها از نو
    if (a[0] === 'occ') F.occ = a[1]; else if (a[0] === 'style') F.style = a[1]; else if (a[0] === 'flower') F.flower = a[1];
    else if (a[0] === 'sale') F.sale = true; else if (a[0] === 'q') F.q = decodeURIComponent(a[1] || '');
    else if (a[0] === 'find') { F.occ = a[1] === '-' ? '' : a[1]; F.color = a[2] === '-' ? '' : decodeURIComponent(a[2] || ''); F.max = +a[3] || 0; }
    var title = F.q ? 'نتیجه‌ی جست‌وجوی «' + F.q + '»' : F.sale ? 'تخفیف‌دارها' : F.occ && Q.cat(F.occ) ? 'گل برای ' + Q.cat(F.occ).name : F.style && Q.cat(F.style) ? Q.cat(F.style).name : 'دسته‌گل‌ها';
    return '<div class="wrap"><div class="page-h">' + crumbs([['دسته‌گل‌ها', '#/shop']]) + '<h1 id="shop-title">' + esc(title) + '</h1></div>' +
      '<div class="shop"><aside class="filters" id="filters">' + filtersHTML() + '</aside><div><div class="toolbar"><span id="shop-count"></span><div style="display:flex;gap:8px">' +
      '<button class="btn btn-g btn-sm filter-toggle" data-act="filters">' + ic('filter') + 'فیلترها</button>' +
      '<select class="select" id="sort" data-change="sort" aria-label="مرتب‌سازی"><option value="pop">پرفروش‌ترین</option><option value="new">تازه‌ترین</option><option value="low">ارزان‌ترین</option><option value="high">گران‌ترین</option><option value="off">بیشترین تخفیف</option></select></div></div>' +
      '<div id="shop-grid"></div></div></div></div>';
  }
  function filtersHTML() {
    function pills(key, list, all) {
      return '<div class="pills"><button class="pill' + (!F[key] ? ' on' : '') + '" data-act="f" data-k="' + key + '" data-v="">' + all + '</button>' +
        list.map(function (c) { return '<button class="pill' + (F[key] === c.id ? ' on' : '') + '" data-act="f" data-k="' + key + '" data-v="' + c.id + '">' + esc(c.name) + '</button>'; }).join('') + '</div>';
    }
    return '<div class="f-group"><h4>مناسبت</h4>' + pills('occ', occs(), 'همه') + '</div>' +
      '<div class="f-group"><h4>نوع</h4>' + pills('style', styles(), 'همه') + '</div>' +
      '<div class="f-group"><h4>رنگ</h4><div class="swatches">' + colors().map(function (c) { return '<button class="sw' + (F.color === c.name ? ' on' : '') + '" style="background:' + c.hex + '" title="' + c.name + '" aria-label="' + c.name + '" data-act="f" data-k="color" data-v="' + (F.color === c.name ? '' : c.name) + '"></button>'; }).join('') + '</div></div>' +
      '<div class="f-group"><h4>دارای این گل</h4><select class="select" style="width:100%" data-change="fflower" aria-label="گل"><option value="">هر گلی</option>' + activeF().map(function (f) { return '<option value="' + f.id + '"' + (F.flower === f.id ? ' selected' : '') + '>' + esc(f.name) + '</option>'; }).join('') + '</select></div>' +
      '<div class="f-group"><h4>سقف قیمت</h4><div class="pills">' + [[0, 'هر قیمتی'], [1500000, 'تا ۱٫۵ م'], [2500000, 'تا ۲٫۵ م'], [4000000, 'تا ۴ م']].map(function (x) { return '<button class="pill' + (F.max === x[0] ? ' on' : '') + '" data-act="f" data-k="max" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div>' +
      '<label class="check"><input type="checkbox" data-change="fsale"' + (F.sale ? ' checked' : '') + '><span>فقط تخفیف‌دارها</span></label>' +
      '<button class="btn btn-g btn-sm" data-act="fclear">پاک کردن فیلترها</button>';
  }
  function shopFill() {
    var grid = $('#shop-grid'); if (!grid) return;
    var sold = Q.soldMap(), q = F.q.trim();
    var list = activeB().filter(function (b) {
      var p = Q.priceOf(b, true, 0), its = Q.bouquetItems(b);
      if (F.occ && b.cats.indexOf(F.occ) < 0) return false;
      if (F.style && b.style !== F.style) return false;
      if (F.flower && !b.items.some(function (i) { return i.f === F.flower; })) return false;
      if (F.color && !its.some(function (i) { return i.f.colorName === F.color; })) return false;
      if (F.max && p.final > F.max) return false;
      if (F.sale && !p.discount) return false;
      if (q && (b.name + ' ' + b.desc + ' ' + its.map(function (i) { return i.f.name; }).join(' ')).indexOf(q) < 0) return false;
      return true;
    });
    var key = { pop: function (b) { return -((sold['bouquet:' + b.id] || {}).qty || 0); }, new: function (b) { return -b.created; }, low: function (b) { return Q.priceOf(b, true, 0).final; }, high: function (b) { return -Q.priceOf(b, true, 0).final; }, off: function (b) { return -Q.priceOf(b, true, 0).discount; } }[F.sort];
    list.sort(function (a, b) { return key(a) - key(b); });
    $('#shop-count').textContent = fa(list.length) + ' دسته‌گل';
    $('#sort').value = F.sort;
    var extra = '';
    if (q) { var fl = activeF().filter(function (f) { return f.name.indexOf(q) > -1; }); if (fl.length) extra = '<h3 style="margin:30px 0 14px">گل‌های شاخه‌ای</h3><div class="grid">' + fl.map(cardF).join('') + '</div>'; }
    grid.innerHTML = (list.length ? '<div class="grid">' + list.map(cardB).join('') + '</div>' : empty('با این فیلترها دسته‌گلی پیدا نشد', 'یکی از فیلترها را بردارید، یا خودتان دسته‌گل را بسازید.', '<a class="btn" href="#/builder">ساخت دسته‌گل</a>')) + extra;
    $('#filters').innerHTML = filtersHTML();
    if (window.FX) FX.refresh();
  }

  /* ---------- گل‌های شاخه‌ای ---------- */
  function flowers() {
    return '<div class="wrap"><div class="page-h">' + crumbs([['گل شاخه‌ای']]) + '<h1>گل شاخه‌ای و قیمت روز</h1><p style="color:var(--muted);max-width:60ch">قیمت هر شاخه را ببینید، جدا سفارش دهید یا روی هر گل بزنید تا دسته‌گل‌های ساخته‌شده با آن را ببینید.</p></div><div class="sec" style="padding-top:18px"><div class="grid">' + activeF().map(cardF).join('') + '</div></div></div>';
  }
  var qtyState = 1, sizeState = 0;
  function flowerPage(a) {
    var f = Q.flower(a[0]); if (!f || !f.active) return notFound();
    var p = Q.priceOf(f, false), bs = Q.bouquetsWith(f.id); qtyState = 5; remember('f:' + f.id);
    return '<div class="wrap"><div class="page-h">' + crumbs([['گل شاخه‌ای', '#/flowers'], [f.name]]) + '</div><div class="pd">' +
      '<div class="pd-art arch" style="background:' + UI.bgF(f) + '">' + UI.artFlower(f) + '</div><div class="pd-info">' +
      '<h1>' + esc(f.name) + '</h1><div class="pd-price"><span class="price">' + fmt(p.final) + '<small>تومان برای هر شاخه</small></span>' + (p.discount ? '<span class="price-old">' + fmt(p.base) + '</span><span class="off-pill">' + fa(p.discount) + '٪</span>' : '') + '</div>' +
      '<div class="facts"><div class="fact"><span>معنی</span><b>' + esc(f.meaning) + '</b></div><div class="fact"><span>فصل</span><b>' + esc(f.season) + '</b></div><div class="fact"><span>ماندگاری در گلدان</span><b>حدود ' + fa(f.life || 7) + ' روز</b></div><div class="fact"><span>موجودی</span><b>' + (f.stock > 0 ? fa(f.stock) + ' شاخه' : 'تمام شده') + '</b></div></div>' +
      (f.stock > 0 ? '<div><div class="opt-h">تعداد شاخه <span id="f-total">' + fmt(p.final * qtyState) + ' تومان</span></div><div class="buy"><div class="qty"><button data-act="qty" data-d="1" aria-label="بیشتر">+</button><span id="qty">' + fa(qtyState) + '</span><button data-act="qty" data-d="-1" aria-label="کمتر">−</button></div>' +
        '<button class="btn btn-r" data-act="addq" data-type="flower" data-id="' + f.id + '">' + ic('bag') + 'افزودن به سبد</button></div></div>' : '<div class="note">' + ic('clock') + '<span>این گل فعلاً تمام شده است. فصلش: ' + esc(f.season) + '.</span></div>') +
      '<div class="note">' + ic('leaf') + '<span><b>نگهداری: </b>' + esc(f.care) + '</span></div>' +
      '<a class="link" style="align-self:flex-start" href="#/builder/' + f.id + '">با این گل دسته‌گل خودتان را بسازید</a></div></div>' +
      '<section class="sec"><div class="sec-h"><div><h2>دسته‌گل‌های ساخته‌شده با ' + esc(f.name) + '</h2>' + (bs.length ? '<p>' + fa(bs.length) + ' دسته‌گل از این گل در ویترین داریم.</p>' : '') + '</div></div>' +
      (bs.length ? '<div class="grid">' + bs.map(cardB).join('') + '</div>' : empty('هنوز دسته‌گلی با این گل نبسته‌ایم', 'اولین نفر باشید؛ دسته‌گل را خودتان بسازید.', '<a class="btn" href="#/builder/' + f.id + '">ساخت دسته‌گل</a>')) + '</section></div>';
  }

  /* ---------- صفحه‌ی دسته‌گل ---------- */
  function bouquetPage(a) {
    var b = Q.bouquet(a[0]); if (!b || !b.active) return notFound();
    var d = D(), s = d.settings, its = Q.bouquetItems(b), rt = Q.rating(b.id); sizeState = 0; qtyState = 1; remember('b:' + b.id);
    var revs = d.reviews.filter(function (r) { return r.bid === b.id && r.approved; });
    var rel = activeB().filter(function (x) { return x.id !== b.id && x.cats.some(function (c) { return b.cats.indexOf(c) > -1; }); }).slice(0, 4);
    var total = its.reduce(function (n, i) { return n + i.n; }, 0), sd = sameDay();
    return '<div class="wrap"><div class="page-h">' + crumbs([['دسته‌گل‌ها', '#/shop'], [b.name]]) + '</div><div class="pd">' +
      '<div class="pd-art" style="background:' + UI.bgB(b) + '">' + UI.artBouquet(b, { animate: true }) + (UI.hasPhoto(b) ? '' : '<div class="stage-orbit pd-orbit" aria-hidden="true">' + its.slice(0, 3).map(function (i) { return '<span class="orb">' + Flora.single(i.f, { bare: true }) + '</span>'; }).join('') + '</div>') + '</div><div class="pd-info">' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' + b.cats.map(function (c) { var o = Q.cat(c); return o ? '<a class="pill" href="#/shop/occ/' + o.id + '">' + esc(o.name) + '</a>' : ''; }).join('') + '</div>' +
      '<h1>' + esc(b.name) + '</h1>' + (rt ? '<a href="#reviews" data-act="scroll" data-to="reviews">' + stars(rt) + '</a>' : '') + '<p style="font-size:16px;color:var(--muted)">' + esc(b.desc) + '</p>' +
      '<div class="pd-price" id="pd-price">' + pdPrice(b) + '</div>' +
      '<div><div class="opt-h">اندازه <span>' + fa(total) + ' شاخه در اندازه‌ی معمولی</span></div><div class="sizes">' + s.sizes.map(function (z, i) { return '<button class="size' + (i === 0 ? ' on' : '') + '" data-act="size" data-i="' + i + '" data-id="' + b.id + '"><b>' + esc(z.name) + '</b><span>' + fmt(Q.priceOf(b, true, i).final) + ' تومان</span></button>'; }).join('') + '</div></div>' +
      (b.stock > 0 ? '<div class="buy"><div class="qty"><button data-act="qty" data-d="1" aria-label="بیشتر">+</button><span id="qty">' + fa(1) + '</span><button data-act="qty" data-d="-1" aria-label="کمتر">−</button></div><button class="btn btn-r" data-act="addq" data-type="bouquet" data-id="' + b.id + '">' + ic('bag') + 'افزودن به سبد</button>' +
        '<button class="icon-btn card-wish' + (isWish(b.id) ? ' on' : '') + '" style="position:static;box-shadow:inset 0 0 0 1.5px var(--line);width:48px;height:48px" data-act="wish" data-id="' + b.id + '" aria-label="علاقه‌مندی">' + ic('heart') + '</button></div>' : '<div class="note">' + ic('clock') + '<span>این دسته‌گل برای امروز تمام شده است. فردا صبح دوباره می‌بندیم.</span></div>') +
      '<div class="note">' + ic('truck') + '<span data-sameday>' + sd.text + '</span></div>' +
      '<div><div class="opt-h">در این دسته‌گل چه گل‌هایی هست؟</div><div class="comp">' + its.map(function (i) { return '<a href="#/flower/' + i.f.id + '"><span class="th" style="background:' + UI.bgF(i.f) + '">' + UI.artFlower(i.f) + '</span><b>' + esc(i.f.name) + '</b><small>' + fa(i.n) + ' شاخه · ' + esc(i.f.meaning) + '</small></a>'; }).join('') + '</div></div>' +
      '<details class="acc"><summary>نگهداری از این دسته‌گل</summary><div>' + its.slice(0, 3).map(function (i) { return '<p><b>' + esc(i.f.name) + ': </b>' + esc(i.f.care) + '</p>'; }).join('') + '</div></details>' +
      '<details class="acc"><summary>ارسال و جایگزینی</summary><div><p>در محله‌های پاسداران، قصردشت و عفیف‌آباد ارسال رایگان است. اگر گلی در بازار نباشد، با نزدیک‌ترین گل هم‌رنگ و هم‌قیمت جایگزین می‌کنیم و پیش از ارسال عکسش را می‌فرستیم.</p></div></details>' +
      '</div></div>' +
      '<section class="sec" id="reviews"><div class="sec-h"><div><h2>نظر خریدارها</h2></div></div><div class="two"><div class="revs" style="grid-template-columns:1fr">' + (revs.length ? revs.map(revHTML).join('') : '<p style="color:var(--muted)">هنوز کسی نظری ننوشته است. اولین نظر را شما بنویسید.</p>') + '</div>' +
      '<form class="box" data-form="review" data-id="' + b.id + '"><h3>نظر شما</h3><div class="field"><label for="rv-name">نام</label><input id="rv-name" name="name" required maxlength="40"></div><div class="field"><label for="rv-rate">امتیاز</label><select id="rv-rate" name="rating"><option value="5">۵ از ۵</option><option value="4">۴ از ۵</option><option value="3">۳ از ۵</option><option value="2">۲ از ۵</option><option value="1">۱ از ۵</option></select></div><div class="field"><label for="rv-text">تجربه‌ی شما</label><textarea id="rv-text" name="text" required maxlength="400"></textarea></div><button class="btn" type="submit">ثبت نظر</button></form></div></section>' +
      (rel.length ? '<section class="sec"><div class="sec-h"><h2>شاید این‌ها را هم بپسندید</h2></div><div class="grid">' + rel.map(cardB).join('') + '</div></section>' : '') + '</div>';
  }
  function pdPrice(b) {
    var p = Q.priceOf(b, true, sizeState);
    return '<span class="price">' + fmt(p.final) + '<small>تومان</small></span>' + (p.discount ? '<span class="price-old">' + fmt(p.base) + '</span><span class="off-pill">' + fa(p.discount) + '٪ تخفیف</span>' : '');
  }
  function remember(k) { var d = D(); d.recent = [k].concat(d.recent.filter(function (x) { return x !== k; })).slice(0, 8); DB.save(); }
  function notFound() { return '<div class="wrap">' + empty('این صفحه پیدا نشد', 'شاید این گل از ویترین برداشته شده باشد.', '<a class="btn" href="#/shop">دیدن دسته‌گل‌ها</a>') + '</div>'; }

  /* ---------- ساخت دسته‌گل دلخواه ---------- */
  var BLD = { picks: {}, wrap: '#f6d9c2' };
  var WRAPS = [['#f6d9c2', 'کرافت روشن'], ['#2b2b2b', 'مشکی مات'], ['#ffffff', 'سفید'], ['#fbe1ea', 'صورتی'], ['#dfe9d2', 'سبز پسته‌ای'], ['#d6dcf5', 'آبی یخی'], ['#1c2340', 'سرمه‌ای']];
  var WRAP_FEE = 180000;
  function builder(a) {
    if (a[0] && Q.flower(a[0]) && !BLD.picks[a[0]]) BLD.picks[a[0]] = 5;
    return '<div class="wrap"><div class="page-h">' + crumbs([['ساخت دسته‌گل']]) + '<h1>دسته‌گل خودتان را بسازید</h1><p style="color:var(--muted)">با + شاخه اضافه کنید. تصویر و قیمت همان لحظه عوض می‌شود.</p></div>' +
      '<div class="bld"><div class="bld-list">' + activeF().filter(function (f) { return f.stock > 0; }).map(function (f) {
        return '<div class="pick' + (BLD.picks[f.id] ? ' on' : '') + '" id="pick-' + f.id + '"><span class="stem-art" style="background:' + UI.bgF(f) + '">' + UI.artFlower(f) + '</span><b>' + esc(f.name) + '</b><span class="num">' + fmt(Q.priceOf(f, false).final) + ' تومان</span>' +
          '<div class="qty sm"><button data-act="bq" data-id="' + f.id + '" data-d="1" aria-label="یک شاخه بیشتر ' + esc(f.name) + '">+</button><span id="bq-' + f.id + '">' + fa(BLD.picks[f.id] || 0) + '</span><button data-act="bq" data-id="' + f.id + '" data-d="-1" aria-label="یک شاخه کمتر ' + esc(f.name) + '">−</button></div></div>';
      }).join('') + '</div><aside class="bld-side" id="bld-side"></aside></div></div>';
  }
  function builderSide() {
    var el = $('#bld-side'); if (!el) return;
    var items = [], total = 0, count = 0, lines = '';
    Object.keys(BLD.picks).forEach(function (id) {
      var f = Q.flower(id), n = BLD.picks[id]; if (!f || !n) return;
      var p = Q.priceOf(f, false).final; items.push({ kind: f.kind, color: f.color, c2: f.c2, n: n }); total += p * n; count += n;
      lines += '<div class="sum-row"><span>' + esc(f.name) + ' × ' + fa(n) + '</span><span class="num">' + fmt(p * n) + '</span></div>';
    });
    el.innerHTML = '<div class="bld-art">' + Flora.bouquet(items, { seed: 'custom', wrap: BLD.wrap, max: 23, label: 'دسته‌گل شما' }) + '</div>' +
      '<div><div class="opt-h">کاغذ دور گل</div><div class="wraps">' + WRAPS.map(function (w) { return '<button class="sw' + (BLD.wrap === w[0] ? ' on' : '') + '" style="background:' + w[0] + '" title="' + w[1] + '" aria-label="' + w[1] + '" data-act="bwrap" data-v="' + w[0] + '"></button>'; }).join('') + '</div></div>' +
      (count ? lines + '<div class="sum-row"><span>بستن و کاغذ</span><span class="num">' + fmt(WRAP_FEE) + '</span></div><div class="sum-row total"><span>' + fa(count) + ' شاخه</span><span class="num">' + fmt(total + WRAP_FEE) + ' تومان</span></div>' : '<p style="color:var(--muted);text-align:center">هنوز شاخه‌ای انتخاب نکرده‌اید. از فهرست کنار، اولین گل را اضافه کنید.</p>') +
      '<button class="btn btn-r btn-block" data-act="badd"' + (count < 3 ? ' disabled' : '') + '>' + (count < 3 ? 'حداقل ۳ شاخه انتخاب کنید' : 'افزودن به سبد') + '</button>' +
      (count ? '<button class="rm" data-act="bclear" style="align-self:center">از نو شروع کن</button>' : '');
  }

  /* ---------- اشتراک ---------- */
  function subscribe() {
    var s = D().settings;
    return '<div class="wrap"><div class="page-h">' + crumbs([['اشتراک گل']]) + '<h1>اشتراک گل تازه</h1><p style="color:var(--muted);max-width:60ch">گل‌های هر نوبت را خودمان از تازه‌ترین‌های همان هفته انتخاب می‌کنیم. هر وقت خواستید یک نوبت را رد کنید یا اشتراک را ببندید.</p></div>' +
      '<div class="revs sec" style="padding-top:20px">' + s.plans.map(function (p, i) {
        return '<div class="box plan' + (i === 1 ? ' best' : '') + '"><h3>' + esc(p.name) + '</h3><p style="color:var(--muted)">' + esc(p.note) + '</p><div class="pd-price"><span class="price">' + fmt(p.price) + '<small>تومان / ' + esc(p.every) + '</small></span></div><ul style="color:var(--muted);font-size:14px"><li>ارسال رایگان در شیراز</li><li>گلدان هدیه در اولین نوبت</li><li>لغو بدون هزینه</li></ul><button class="btn' + (i === 1 ? ' btn-r' : '') + '" data-act="plan" data-id="' + p.id + '">شروع اشتراک ' + esc(p.name) + '</button></div>';
      }).join('') + '</div></div>';
  }

  /* ---------- راهنمای گل‌ها ---------- */
  function guide() {
    return '<div class="wrap"><div class="page-h">' + crumbs([['راهنمای گل‌ها']]) + '<h1>هر گل چه می‌گوید و چطور بماند</h1><p style="color:var(--muted);max-width:60ch">معنی، فصل و نگهداری همه‌ی گل‌هایی که در ویترین داریم.</p></div><div class="guide sec" style="padding-top:20px">' +
      activeF().map(function (f) {
        return '<article class="box guide-item"><a class="stem-art" href="#/flower/' + f.id + '" style="background:' + UI.bgF(f) + '" aria-label="' + esc(f.name) + '">' + UI.artFlower(f) + '</a><div><h3><a href="#/flower/' + f.id + '">' + esc(f.name) + '</a></h3><p><b>' + esc(f.meaning) + '</b></p><p style="color:var(--muted);font-size:14px">' + esc(f.care) + '</p><p class="guide-meta"><span>' + ic('clock') + 'حدود ' + fa(f.life || 7) + ' روز</span><span>' + ic('leaf') + esc(f.season) + '</span></p></div></article>';
      }).join('') + '</div></div>';
  }

  /* ---------- گل‌آرایی مراسم ---------- */
  function events() {
    var deco = Flora.bouquet([{ kind: 'orchid', color: '#ffffff', c2: '#c2338b', n: 3 }, { kind: 'rose', color: '#fbf6ee', n: 6 }, { kind: 'lisianthus', color: '#b79ae0', n: 4 }, { kind: 'eucalyptus', color: '#7fa695', n: 3 }], { seed: 'events', wrap: '#efe6f7' });
    return '<div class="wrap"><div class="page-h">' + crumbs([['گل‌آرایی مراسم']]) + '<h1>گل‌آرایی عروسی و مراسم</h1></div><div class="two sec" style="padding-top:20px"><div class="prose"><div class="arch" style="background:var(--pink-soft);max-width:300px;padding:6% 4% 2%">' + deco + '</div>' +
      '<p>برای عروسی، خواستگاری، افتتاحیه و همایش، اول سالن را می‌بینیم و بعد طرح و قیمت می‌دهیم. فرم را پر کنید؛ همان روز تماس می‌گیریم.</p>' +
      '<div class="comp"><div>' + ic('check') + '<span>بازدید رایگان از محل مراسم در شیراز</span></div><div>' + ic('check') + '<span>طرح اولیه و برآورد قیمت تا ۴۸ ساعت</span></div><div>' + ic('check') + '<span>چیدن در محل و جمع‌آوری بعد از مراسم</span></div></div></div>' +
      '<form class="box" data-form="event"><h3>درخواست مشاوره</h3><div class="fields"><div class="field"><label for="ev-name">نام شما</label><input id="ev-name" name="name" required></div><div class="field"><label for="ev-phone">موبایل</label><input id="ev-phone" name="phone" dir="ltr" placeholder="09xxxxxxxxx" inputmode="numeric" required><span class="msg" hidden>شماره موبایل ۱۱ رقمی است و با ۰۹ شروع می‌شود.</span></div>' +
      '<div class="field"><label for="ev-type">نوع مراسم</label><select id="ev-type" name="type"><option>عروسی</option><option>خواستگاری و نامزدی</option><option>افتتاحیه</option><option>همایش شرکتی</option><option>ترحیم</option><option>چیز دیگر</option></select></div><div class="field"><label for="ev-when">تاریخ تقریبی</label><input id="ev-when" name="when" placeholder="مثلاً ۲۰ آبان"></div>' +
      '<div class="field"><label for="ev-guests">تعداد مهمان</label><input id="ev-guests" name="guests" type="number" min="1" placeholder="۱۵۰"></div><div class="field"><label for="ev-budget">بودجه‌ی گل</label><select id="ev-budget" name="budget"><option>هنوز نمی‌دانم</option><option>تا ۲۰ میلیون</option><option>۲۰ تا ۵۰ میلیون</option><option>۵۰ تا ۱۰۰ میلیون</option><option>بیشتر از ۱۰۰ میلیون</option></select></div>' +
      '<div class="field full"><label for="ev-note">چه در ذهن دارید؟</label><textarea id="ev-note" name="note" placeholder="رنگ‌ها، گل‌های دلخواه، محل مراسم…"></textarea></div></div><button class="btn btn-r" type="submit">ارسال درخواست</button></form></div></div>';
  }

  /* ---------- علاقه‌مندی‌ها ---------- */
  function wishlist() {
    var list = D().wish.map(Q.bouquet).filter(Boolean);
    return '<div class="wrap"><div class="page-h">' + crumbs([['علاقه‌مندی‌ها']]) + '<h1>علاقه‌مندی‌های شما</h1></div><div class="sec" style="padding-top:18px">' +
      (list.length ? '<div class="grid">' + list.map(cardB).join('') + '</div>' : empty('هنوز چیزی را نشان نکرده‌اید', 'روی قلبِ هر دسته‌گل بزنید تا اینجا جمع شود.', '<a class="btn" href="#/shop">دیدن دسته‌گل‌ها</a>')) + '</div></div>';
  }

  /* ---------- درباره، تماس، پرسش‌ها ---------- */
  function about() {
    var s = D().settings;
    var map = '<svg viewBox="0 0 400 260" role="img" aria-label="نقشه‌ی ساده‌ی محل فروشگاه در خیابان پاسداران"><rect width="400" height="260" fill="var(--surface-2)"/><g stroke="var(--surface)" stroke-linecap="round"><path d="M-10 150 410 110" stroke-width="26"/><path d="M120 -10 170 270" stroke-width="16"/><path d="M290 -10 260 270" stroke-width="12"/><path d="M-10 60 410 40" stroke-width="9"/><path d="M-10 220 410 205" stroke-width="9"/></g><text x="200" y="124" font-size="13" fill="var(--muted)" text-anchor="middle" transform="rotate(-5.4 200 124)">خیابان پاسداران</text><g transform="translate(218 118)"><g class="pin"><path d="M0 0c-14-18-20-27-20-36a20 20 0 0 1 40 0c0 9-6 18-20 36Z" fill="var(--pink)"/><circle cy="-36" r="8" fill="#fff"/></g></g></svg>';
    return '<div class="wrap"><div class="page-h">' + crumbs([['درباره و تماس']]) + '<h1>گل‌فروشی ' + esc(s.name) + '، خیابان پاسداران</h1></div><div class="two sec" style="padding-top:20px"><div class="prose">' +
      '<p>هر روز پیش از طلوع، گل‌ها را از گلخانه‌های اطراف شیراز و بازار گل می‌آوریم. هیچ دسته‌گلی از دیروز نمی‌ماند؛ هرچه بماند شب به خانه‌ی سالمندان محله می‌رود.</p>' +
      '<div class="comp"><div>' + ic('pin') + '<span>' + esc(s.address) + '</span></div><div>' + ic('phone') + '<span dir="ltr">' + esc(s.phone) + '</span><small dir="ltr">' + esc(s.mobile) + '</small></div><div>' + ic('clock') + '<span>' + esc(s.hours) + '</span></div><div>' + ic('insta') + '<span dir="ltr">@' + esc(D().insta.handle) + '</span></div></div>' +
      '<h3 style="margin-top:14px">پرسش‌های پرتکرار</h3>' +
      [['تا چه ساعتی سفارش بدهم که امروز برسد؟', 'تا ساعت ' + fa(s.cutoff) + '. بعد از آن، سفارش در اولین بازه‌ی فردا تحویل می‌شود.'],
      ['می‌شود گیرنده نفهمد گل از طرف کیست؟', 'بله. هنگام ثبت سفارش گزینه‌ی «ارسال ناشناس» را بزنید؛ نام و شماره‌ی شما به گیرنده داده نمی‌شود.'],
      ['اگر گیرنده خانه نبود چه می‌شود؟', 'پیک با گیرنده تماس می‌گیرد. اگر پاسخ نداد با خود شما هماهنگ می‌کنیم و گل را به نگهبان یا همسایه نمی‌سپاریم مگر شما بگویید.'],
      ['گل‌ها چند روز می‌مانند؟', 'بسته به نوع گل، ۴ تا ۱۴ روز. اگر دسته‌گلی زودتر از هفت روز پژمرد عکسش را بفرستید؛ دوباره می‌فرستیم.'],
      ['برای مراسم و عروسی هم گل‌آرایی می‌کنید؟', 'بله. با شماره‌ی فروشگاه تماس بگیرید تا برای بازدید از سالن وقت بگذاریم.']].map(function (q) { return '<details class="acc"><summary>' + q[0] + '</summary><div>' + q[1] + '</div></details>'; }).join('') +
      (function () { // نام عکاس‌ها، اگر عکس واقعی روشن باشد
        var names = {}, P = window.PHOTOS || {}; Object.keys(P).forEach(function (k) { if (P[k].by) names[P[k].by] = 1; }); names = Object.keys(names);
        return names.length && s.usePhotos !== false ? '<details class="acc"><summary>عکس‌ها از کجاست؟</summary><div><p>عکس گل‌ها و دسته‌گل‌ها از سایت Unsplash و با مجوز رایگان آن است. عکاس‌ها: <span dir="ltr">' + esc(names.join(', ')) + '</span></p></div></details>' : '';
      })() +
      '</div><div class="box"><div class="map">' + map + '</div><h3>هزینه‌ی ارسال در شیراز</h3>' + s.zones.map(function (z) { return '<div class="sum-row"><span>' + esc(z.name) + '</span><b class="num">' + (z.fee ? fmt(z.fee) + ' تومان' : 'رایگان') + '</b></div>'; }).join('') +
      '<p style="color:var(--muted);font-size:13.5px">خرید بالای ' + fmt(s.freeMin) + ' تومان در همه‌ی محله‌ها رایگان ارسال می‌شود.</p></div></div></div>';
  }

  /* ---------- سبد خرید (کشو) ---------- */
  function lineArt(l) {
    if (l.type === 'bouquet') return '<span class="line-art" style="background:' + UI.bgB(l.ref) + '">' + UI.artBouquet(l.ref, { max: 9 }) + '</span>';
    if (l.type === 'flower') return '<span class="line-art" style="background:' + UI.bgF(l.ref) + '">' + UI.artFlower(l.ref) + '</span>';
    if (l.type === 'custom') return '<span class="line-art" style="background:var(--pink-soft)">' + Flora.bouquet(l.custom.items, { seed: 'custom', wrap: l.custom.wrap, max: 9 }) + '</span>';
    return '<span class="line-art" style="background:var(--gold-soft)">' + Flora.single({ kind: 'tulip', color: '#f47b2a', name: '' }) + '</span>';
  }
  function cartHTML() {
    var lines = Q.cartLines(), s = D().settings, sub = Q.cartSubtotal();
    if (!lines.length) return '<div class="drawer-b">' + empty('سبد شما خالی است', 'از ویترین یک دسته‌گل بردارید.', '<a class="btn" href="#/shop" data-act="close">دیدن دسته‌گل‌ها</a>') + '</div>';
    var left = Math.max(0, s.freeMin - sub), pct = Math.min(100, sub / s.freeMin * 100);
    return '<div class="drawer-b"><div class="ship-bar">' + (left ? 'فقط <b class="num">' + fmt(left) + '</b> تومان تا ارسال رایگان در کل شیراز' : 'ارسال شما در کل شیراز رایگان شد') + '<div class="bar"><i style="width:' + pct + '%"></i></div></div>' +
      lines.map(function (l) {
        return '<div class="line">' + lineArt(l) + '<div class="line-b"><b>' + esc(l.name) + '</b><small>' + esc(l.sub || '') + '</small><div class="line-f"><div class="qty sm"><button data-act="cq" data-i="' + l.idx + '" data-d="1" aria-label="بیشتر">+</button><span>' + fa(l.qty) + '</span><button data-act="cq" data-i="' + l.idx + '" data-d="-1" aria-label="کمتر">−</button></div><b class="num">' + fmt(l.price * l.qty) + '</b></div></div></div>';
      }).join('') + '</div><div class="drawer-f"><div class="sum-row total" style="border:0;padding:0;margin:0"><span>جمع سبد</span><span class="num">' + fmt(sub) + ' تومان</span></div><a class="btn btn-r btn-block" href="#/checkout" data-act="close">ادامه و انتخاب زمان تحویل</a></div>';
  }
  function openCart() { $('#cart-body').innerHTML = cartHTML(); $('#cart').classList.add('on'); $('#ovl').classList.add('on'); }
  function closeAll() { ['#cart', '#menu', '#ovl', '#filters'].forEach(function (s) { var e = $(s); if (e) e.classList.remove('on'); }); }
  function addCart(item, silent, from) {
    var d = D(), ex = d.cart.find(function (c) { return c.type === item.type && c.id === item.id && (c.size || 0) === (item.size || 0) && item.type !== 'custom' && item.type !== 'plan'; });
    if (ex) ex.qty += item.qty; else d.cart.push(item);
    DB.save(); badges();
    if (silent) return;
    if (window.FX && from) FX.fly(from, openCart); else openCart(); // محصول به سمت سبد پرواز می‌کند، بعد کشو باز می‌شود
  }
  function badges() {
    var n = Q.cartCount(), w = D().wish.length;
    document.querySelectorAll('[data-cart-count]').forEach(function (e) { e.textContent = fa(n); e.hidden = !n; });
    document.querySelectorAll('[data-wish-count]').forEach(function (e) { e.textContent = fa(w); e.hidden = !w; });
  }

  /* ---------- تسویه ---------- */
  var CO = null;
  function coInit() { CO = { day: sameDay().open ? 0 : 1, slot: '', zone: D().settings.zones[0].id, addons: {}, coupon: '', pay: 'online', anon: false }; }
  function days() {
    var out = [], names = ['امروز', 'فردا'];
    for (var i = 0; i < 7; i++) { var dt = new Date(Date.now() + i * DAY); out.push({ i: i, ts: dt.getTime(), label: names[i] || dt.toLocaleDateString('fa-IR', { weekday: 'long' }), num: dt.toLocaleDateString('fa-IR', { day: 'numeric' }), mon: dt.toLocaleDateString('fa-IR', { month: 'long' }) }); }
    return out;
  }
  function slotOpen(slotIdx) {
    if (CO.day > 0) return true; if (!sameDay().open) return false;
    var ends = [13, 16, 19, 22][slotIdx] || 22; return new Date().getHours() < ends - 1;
  }
  function checkout() {
    var lines = Q.cartLines(), d = D(), s = d.settings;
    if (!lines.length) return '<div class="wrap">' + empty('سبد شما خالی است', 'برای ثبت سفارش اول یک دسته‌گل انتخاب کنید.', '<a class="btn" href="#/shop">دیدن دسته‌گل‌ها</a>') + '</div>';
    if (!CO) coInit();
    var msgs = ['تولدت مبارک', 'دوستت دارم', 'زود خوب شو', 'قدم نورسیده مبارک', 'ممنون که هستی', 'تسلیت می‌گویم'];
    return '<div class="wrap"><div class="page-h">' + crumbs([['ثبت سفارش']]) + '<h1>ثبت سفارش</h1></div><form class="co" data-form="order" novalidate><div class="co-main">' +
      '<div class="box"><h3><span class="step-n">۱</span>گل به دست چه کسی می‌رسد؟</h3><div class="fields">' +
      fld('rname', 'نام گیرنده', 'text', true) + fld('rphone', 'موبایل گیرنده', 'tel', true, 'dir="ltr" placeholder="09xxxxxxxxx" inputmode="numeric"') +
      '<div class="field full"><label for="co-zone">محله</label><select id="co-zone" name="zone" data-change="zone">' + s.zones.map(function (z) { return '<option value="' + z.id + '"' + (CO.zone === z.id ? ' selected' : '') + '>' + esc(z.name) + ' — ' + (z.fee ? fmt(z.fee) + ' تومان' : 'ارسال رایگان') + '</option>'; }).join('') + '</select></div>' +
      '<div class="field full"><label for="co-addr">نشانی کامل</label><textarea id="co-addr" name="address" required placeholder="خیابان، کوچه، پلاک، واحد"></textarea><span class="msg" hidden>نشانی را بنویسید تا پیک راه را پیدا کند.</span></div></div>' +
      '<label class="check"><input type="checkbox" name="anon" data-change="anon"><span>ارسال ناشناس؛ نام من به گیرنده گفته نشود</span></label></div>' +
      '<div class="box"><h3><span class="step-n">۲</span>چه روزی و چه ساعتی؟</h3><div id="co-when"></div></div>' +
      '<div class="box"><h3><span class="step-n">۳</span>کارت همراه گل</h3><div class="field"><label for="co-card">پیامی که با خودنویس روی کارت می‌نویسیم (اختیاری)</label><textarea id="co-card" name="card" maxlength="180" placeholder="مثلاً: تولدت مبارک، امسال سال توست."></textarea></div><div class="quick">' + msgs.map(function (m) { return '<button type="button" class="pill" data-act="msg" data-v="' + m + '">' + m + '</button>'; }).join('') + '</div></div>' +
      '<div class="box"><h3><span class="step-n">۴</span>چیزی کنار گل بگذاریم؟</h3><div class="addon-list">' + d.addons.filter(function (a) { return a.active; }).map(function (a) { return '<label class="check"><input type="checkbox" data-change="addon" value="' + a.id + '"' + (CO.addons[a.id] ? ' checked' : '') + '><span>' + esc(a.name) + '</span><small>' + fmt(a.price) + ' تومان</small></label>'; }).join('') + '</div></div>' +
      '<div class="box"><h3><span class="step-n">۵</span>مشخصات شما و پرداخت</h3><div class="fields">' + fld('cname', 'نام شما', 'text', true) + fld('cphone', 'موبایل شما', 'tel', true, 'dir="ltr" placeholder="09xxxxxxxxx" inputmode="numeric"') + '</div>' +
      '<div class="pay">' + [['online', 'پرداخت آنلاین', 'درگاه بانکی (در این نسخه‌ی نمایشی شبیه‌سازی می‌شود)'], ['card', 'کارت به کارت', 'شماره کارت بعد از ثبت سفارش پیامک می‌شود'], ['cod', 'پرداخت هنگام تحویل', 'فقط برای محله‌های با ارسال رایگان']].map(function (p) { return '<label class="check"><input type="radio" name="pay" value="' + p[0] + '"' + (CO.pay === p[0] ? ' checked' : '') + ' data-change="pay"><span><b>' + p[1] + '</b><br><span style="color:var(--muted);font-size:13px">' + p[2] + '</span></span></label>'; }).join('') + '</div></div>' +
      '</div><aside class="co-side box" id="co-sum"></aside></form></div>';
  }
  function fld(name, label, type, req, extra) {
    return '<div class="field"><label for="co-' + name + '">' + label + '</label><input id="co-' + name + '" name="' + name + '" type="' + type + '"' + (req ? ' required' : '') + ' ' + (extra || '') + '><span class="msg" hidden></span></div>';
  }
  function coWhen() {
    var el = $('#co-when'); if (!el) return; var s = D().settings, open = sameDay().open;
    el.innerHTML = '<div class="days">' + days().map(function (dd) { return '<button type="button" class="day' + (CO.day === dd.i ? ' on' : '') + '" data-act="day" data-i="' + dd.i + '"' + (dd.i === 0 && !open ? ' disabled style="opacity:.4"' : '') + '><span>' + dd.label + '</span><b>' + dd.num + '</b><span>' + dd.mon + '</span></button>'; }).join('') + '</div>' +
      '<div class="slots" style="margin-top:12px">' + s.slots.map(function (sl, i) { var ok = slotOpen(i); if (!ok && CO.slot === sl) CO.slot = ''; return '<button type="button" class="slot' + (CO.slot === sl ? ' on' : '') + '" data-act="slot" data-v="' + sl + '"' + (ok ? '' : ' disabled') + '>' + sl + '</button>'; }).join('') + '</div><span class="msg" id="slot-msg" hidden style="color:var(--bad);font-size:13px">یک بازه‌ی زمانی برای تحویل انتخاب کنید.</span>';
  }
  function coTotals() {
    var d = D(), s = d.settings, sub = Q.cartSubtotal(), add = 0, addList = [];
    d.addons.forEach(function (a) { if (CO.addons[a.id]) { add += a.price; addList.push(a); } });
    var zone = s.zones.find(function (z) { return z.id === CO.zone; }) || s.zones[0];
    var cp = CO.coupon ? Q.coupon(CO.coupon, sub + add) : null, disc = cp && cp.ok ? cp.amount : 0;
    var del = (sub + add) >= s.freeMin ? 0 : zone.fee;
    return { sub: sub, add: add, addList: addList, zone: zone, disc: disc, del: del, total: sub + add - disc + del, cp: cp };
  }
  function coSum() {
    var el = $('#co-sum'); if (!el) return; var t = coTotals(), lines = Q.cartLines();
    el.innerHTML = '<h3>خلاصه‌ی سفارش</h3>' + lines.map(function (l) { return '<div class="sum-row"><span>' + esc(l.name) + (l.qty > 1 ? ' × ' + fa(l.qty) : '') + '<br><small style="color:var(--muted)">' + esc(l.sub || '') + '</small></span><span class="num">' + fmt(l.price * l.qty) + '</span></div>'; }).join('') +
      t.addList.map(function (a) { return '<div class="sum-row"><span>' + esc(a.name) + '</span><span class="num">' + fmt(a.price) + '</span></div>'; }).join('') +
      '<div class="coupon"><input class="input" id="co-coupon" placeholder="کد تخفیف" value="' + esc(CO.coupon) + '" aria-label="کد تخفیف"><button type="button" class="btn btn-g btn-sm" data-act="coupon">اعمال</button></div>' +
      (t.cp ? '<small style="color:' + (t.cp.ok ? 'var(--ok)' : 'var(--bad)') + '">' + (t.cp.ok ? 'کد اعمال شد.' : t.cp.msg) + '</small>' : '<small style="color:var(--muted)">برای آزمایش: SHIRAZ10</small>') +
      (t.disc ? '<div class="sum-row"><span>تخفیف</span><span class="num neg">−' + fmt(t.disc) + '</span></div>' : '') +
      '<div class="sum-row"><span>ارسال به ' + esc(t.zone.name.split('،')[0]) + '</span><span class="num">' + (t.del ? fmt(t.del) : 'رایگان') + '</span></div>' +
      '<div class="sum-row total"><span>قابل پرداخت</span><span class="num">' + fmt(t.total) + ' تومان</span></div><button class="btn btn-r btn-block" type="submit">ثبت سفارش و پرداخت</button>';
  }
  function placeOrder(form) {
    var ok = true, v = {}, first = null;
    function bad(el, msg) { var f = el.closest('.field'); f.classList.add('err'); var m = f.querySelector('.msg'); if (m) { m.hidden = false; if (msg) m.textContent = msg; } ok = false; first = first || el; }
    form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('err'); var m = f.querySelector('.msg'); if (m) m.hidden = true; });
    ['rname', 'cname'].forEach(function (n) { var el = form.elements[n]; v[n] = el.value.trim(); if (v[n].length < 2) bad(el, 'نام را کامل بنویسید.'); });
    ['rphone', 'cphone'].forEach(function (n) { var el = form.elements[n]; v[n] = el.value.replace(/[۰-۹]/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(c); }).replace(/\D/g, ''); if (!/^09\d{9}$/.test(v[n])) bad(el, 'شماره موبایل ۱۱ رقمی است و با ۰۹ شروع می‌شود.'); });
    var addr = form.elements.address; v.address = addr.value.trim(); if (v.address.length < 8) bad(addr);
    if (!CO.slot) { $('#slot-msg').hidden = false; ok = false; first = first || $('#co-when'); }
    if (!ok) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (first.focus) first.focus({ preventScroll: true }); toast('چند مورد کامل نیست؛ با رنگ قرمز مشخص شده.', true); return; }
    var d = D(), t = coTotals(), lines = Q.cartLines(), dd = days()[CO.day], max = 4100;
    d.orders.forEach(function (o) { var n = +String(o.id).replace(/\D/g, ''); if (n > max) max = n; });
    var o = {
      id: 'N' + (max + 1), date: Date.now(),
      items: lines.map(function (l) { return { type: l.type, id: l.id || '', name: l.name + (l.type === 'bouquet' && l.size ? ' (' + l.sub + ')' : ''), size: l.size, qty: l.qty, price: l.price, detail: l.type === 'custom' ? l.sub : '' }; }),
      addons: t.addList.map(function (a) { return { id: a.id, name: a.name, price: a.price }; }),
      subtotal: t.sub + t.add, discount: t.disc, coupon: t.disc ? CO.coupon.toUpperCase() : '', delivery: t.del, total: t.total,
      customer: { name: v.cname, phone: v.cphone }, recipient: { name: v.rname, phone: v.rphone, address: 'شیراز، ' + v.address, zone: t.zone.name },
      slot: { date: dd.ts, time: CO.slot }, card: form.elements.card.value.trim(), anonymous: CO.anon, payment: CO.pay, status: 'new'
    };
    d.orders.push(o); d.myOrders.unshift(o.id);
    lines.forEach(function (l) { if (l.ref) l.ref.stock = Math.max(0, (l.ref.stock || 0) - l.qty); });
    if (t.cp && t.cp.ok) t.cp.c.used++;
    d.cart = []; DB.save(); CO = null; badges(); location.hash = '#/order/' + o.id;
    if (window.FX) setTimeout(FX.confetti, 350);
  }
  var STATUS = { new: ['ثبت شد', 0], preparing: ['در حال بستن گل', 1], sending: ['پیک در راه است', 2], delivered: ['تحویل شد', 3], cancelled: ['لغو شد', -1] };
  function trackHTML(o) {
    var st = STATUS[o.status] || STATUS.new;
    if (st[1] < 0) return '<div class="note">' + ic('x') + '<span>این سفارش لغو شده است.</span></div>';
    return '<div class="track">' + ['ثبت شد', 'در حال بستن گل', 'پیک در راه است', 'تحویل شد'].map(function (t, i) { return '<div class="' + (i <= st[1] ? 'on' : '') + '">' + t + '</div>'; }).join('') + '</div>';
  }
  function orderPage(a) {
    var o = D().orders.find(function (x) { return x.id === a[0]; }); if (!o) return notFound();
    var deco = Flora.bouquet([{ kind: 'narenj', color: '#ffffff', c2: '#f2952b', n: 3 }, { kind: 'rose', color: '#f4a6c0', n: 4 }, { kind: 'tuberose', color: '#fffef5', n: 2 }], { seed: o.id, wrap: '#fbe1ea', animate: true });
    return '<div class="wrap"><div class="done">' + deco + '<h1>سفارش شما ثبت شد</h1><p>کد پیگیری را نگه دارید. وقتی دسته‌گل آماده شد عکسش را برای ' + esc(o.customer.phone) + ' می‌فرستیم.</p><div class="code">' + o.id + '</div>' + trackHTML(o) +
      '<div class="box" style="width:100%;text-align:start"><div class="sum-row"><span>گیرنده</span><b>' + esc(o.recipient.name) + '</b></div><div class="sum-row"><span>زمان تحویل</span><b>' + fdate(o.slot.date, { weekday: 'long', day: 'numeric', month: 'long' }) + '، ساعت ' + esc(o.slot.time) + '</b></div><div class="sum-row"><span>نشانی</span><b style="text-align:end">' + esc(o.recipient.address) + '</b></div>' +
      o.items.map(function (i) { return '<div class="sum-row"><span>' + esc(i.name) + ' × ' + fa(i.qty) + '</span><span class="num">' + fmt(i.price * i.qty) + '</span></div>'; }).join('') + '<div class="sum-row total"><span>پرداخت‌شده</span><span class="num">' + fmt(o.total) + ' تومان</span></div></div>' +
      '<div class="hero-cta"><a class="btn" href="#/">بازگشت به ویترین</a><a class="btn btn-g" href="#/track/' + o.id + '">پیگیری سفارش</a></div></div></div>';
  }
  function track(a) {
    var d = D(), o = a[0] ? d.orders.find(function (x) { return x.id.toLowerCase() === a[0].toLowerCase(); }) : null;
    var mine = d.myOrders.map(function (id) { return d.orders.find(function (x) { return x.id === id; }); }).filter(Boolean);
    return '<div class="wrap"><div class="page-h">' + crumbs([['پیگیری سفارش']]) + '<h1>پیگیری سفارش</h1></div><div class="sec" style="padding-top:20px;max-width:680px"><form class="coupon" data-form="track"><input class="input" name="code" placeholder="کد پیگیری، مثل N4180" value="' + esc(a[0] || '') + '" aria-label="کد پیگیری"><button class="btn" type="submit">پیگیری</button></form>' +
      (a[0] ? (o ? '<div class="box" style="margin-top:18px"><h3>سفارش ' + o.id + '</h3>' + trackHTML(o) + '<div class="sum-row"><span>گیرنده</span><b>' + esc(o.recipient.name) + '</b></div><div class="sum-row"><span>تحویل</span><b>' + fdate(o.slot.date, { weekday: 'long', day: 'numeric', month: 'long' }) + '، ' + esc(o.slot.time) + '</b></div><div class="sum-row"><span>مبلغ</span><b class="num">' + fmt(o.total) + ' تومان</b></div></div>' : '<div class="note" style="margin-top:18px">' + ic('search') + '<span>سفارشی با این کد پیدا نشد. کد با حرف N شروع می‌شود.</span></div>') : '') +
      (mine.length ? '<h3 style="margin:26px 0 10px">سفارش‌های شما در این مرورگر</h3><div class="comp">' + mine.map(function (m) { return '<a href="#/track/' + m.id + '"><b>' + m.id + '</b><span>' + esc(m.items[0].name) + '</span><small>' + STATUS[m.status][0] + '</small></a>'; }).join('') + '</div>' : '') + '</div></div>';
  }

  /* ---------- قاب کلی سایت ---------- */
  function logoSVG() {
    return '<svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="lg-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6d86ff"/><stop offset="1" stop-color="#3554f2"/></linearGradient><linearGradient id="lg-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9cc8"/><stop offset="1" stop-color="#f0398b"/></linearGradient></defs>' +
      '<path d="M20 31C8 31 3 24 3 17c7 0 12 4 17 14Z" fill="url(#lg-a)"/><path d="M20 31c12 0 17-7 17-14-7 0-12 4-17 14Z" fill="url(#lg-a)"/>' +
      '<path d="M20 31C11 26 9 16 13 8c6 4 9 12 7 23Z" fill="url(#lg-b)" opacity=".9"/><path d="M20 31c9-5 11-15 7-23-6 4-9 12-7 23Z" fill="url(#lg-b)" opacity=".9"/>' +
      '<path d="M20 32c-5-7-5-18 0-27 5 9 5 20 0 27Z" fill="#ff5fa6"/><path d="M8 35c8 2 16 2 24 0" stroke="#6d86ff" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg>';
  }
  function shell() {
    var s = D().settings;
    var links = [['#/shop', 'دسته‌گل‌ها'], ['#/flowers', 'گل شاخه‌ای'], ['#/builder', 'بسازید'], ['#/subscribe', 'اشتراک'], ['#/shop/sale', 'تخفیف‌ها'], ['#/about', 'درباره و تماس']];
    return (s.announceOn && s.announcement ? '<div class="announce">' + esc(s.announcement) + '</div>' : '') +
      '<header class="hdr"><div class="wrap hdr-in"><button class="icon-btn menu-btn" data-act="menu" aria-label="فهرست">' + ic('menu') + '</button>' +
      '<a class="logo" href="#/" aria-label="' + esc(s.name) + '، صفحه‌ی اول">' + logoSVG() + '<span><span class="logo-name">' + esc(s.name) + '</span><div class="logo-sub">' + esc(s.tagline) + '</div></span></a>' +
      '<nav class="nav" aria-label="بخش‌های سایت">' + links.map(function (l) { return '<a href="' + l[0] + '" data-nav="' + l[0] + '">' + l[1] + '</a>'; }).join('') + '</nav>' +
      '<div class="hdr-tools"><form class="search" data-form="search" role="search"><input id="q" name="q" type="search" placeholder="جست‌وجوی گل یا دسته‌گل" autocomplete="off" aria-label="جست‌وجو">' + ic('search') + '<div class="sugg" id="sugg" hidden></div></form>' +
      '<button class="icon-btn" data-act="theme" aria-label="حالت تیره یا روشن">' + ic('moon') + '</button>' +
      '<a class="icon-btn" href="#/track" aria-label="پیگیری سفارش">' + ic('truck') + '</a>' +
      '<a class="icon-btn" href="#/wishlist" aria-label="علاقه‌مندی‌ها">' + ic('heart') + '<span class="count" data-wish-count hidden></span></a>' +
      '<button class="icon-btn" data-act="cart" aria-label="سبد خرید">' + ic('bag') + '<span class="count" data-cart-count hidden></span></button></div></div></header>' +
      '<main id="view"></main>' +
      '<footer class="ftr"><svg class="wave" viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M0 30 C 240 70 480 0 720 30 S 1200 70 1440 30 V70 H0Z"/></svg><div class="wrap"><div class="ftr-in"><div><a class="logo" href="#/">' + logoSVG() + '<span><span class="logo-name" style="color:#fff;background:none">' + esc(s.name) + '</span><div class="logo-sub">' + esc(s.tagline) + '</div></span></a><p style="margin-top:12px;font-size:14px;opacity:.85;max-width:34ch">' + esc(s.address) + '<br>' + esc(s.hours) + '</p><p dir="ltr" style="text-align:end;font-weight:700;margin-top:6px">' + esc(s.phone) + '</p></div>' +
      '<div><h4>خرید</h4><ul>' + links.slice(0, 5).map(function (l) { return '<li><a href="' + l[0] + '">' + l[1] + '</a></li>'; }).join('') + '</ul></div>' +
      '<div><h4>راهنما</h4><ul><li><a href="#/track">پیگیری سفارش</a></li><li><a href="#/guide">راهنمای گل‌ها و نگهداری</a></li><li><a href="#/events">گل‌آرایی عروسی و مراسم</a></li><li><a href="#/about">هزینه‌ی ارسال و پرسش‌ها</a></li><li><a href="#/admin">ورود مدیر فروشگاه</a></li></ul></div>' +
      '<div><h4>یادآور مناسبت‌ها</h4><p style="font-size:14px;opacity:.85">شماره بدهید؛ سه روز قبل از تولدها و سالگردهایتان پیامک می‌زنیم.</p><form class="news" data-form="news"><input name="phone" placeholder="09xxxxxxxxx" dir="ltr" aria-label="شماره موبایل" inputmode="numeric"><button class="btn btn-r btn-sm" type="submit">ثبت</button></form></div></div>' +
      '<div class="ftr-note"><span>نسخه‌ی نمایشی. محصولات، قیمت‌ها و سفارش‌ها نمونه‌اند.</span><span>شیراز، خیابان پاسداران</span></div></div></footer>' +
      '<nav class="tabbar" aria-label="دسترسی سریع"><a href="#/" data-nav="#/">' + ic('home') + 'خانه</a><a href="#/shop" data-nav="#/shop">' + ic('grid') + 'دسته‌گل‌ها</a><a href="#/builder" data-nav="#/builder">' + ic('wand') + 'بسازید</a><a href="#/wishlist" data-nav="#/wishlist">' + ic('heart') + 'علاقه‌مندی</a><button data-act="cart">' + ic('bag') + 'سبد<span class="count" data-cart-count hidden></span></button></nav>' +
      '<button class="to-top" aria-label="بازگشت به بالای صفحه">' + ic('back') + '</button>' +
      '<div class="ovl" id="ovl" data-act="close"></div>' +
      '<aside class="drawer" id="cart" aria-label="سبد خرید"><div class="drawer-h"><h3>سبد خرید</h3><button class="icon-btn" data-act="close" aria-label="بستن">' + ic('x') + '</button></div><div id="cart-body" style="display:contents"></div></aside>' +
      '<aside class="drawer menu-drawer" id="menu" aria-label="فهرست"><div class="drawer-h"><h3>' + esc(s.name) + '</h3><button class="icon-btn" data-act="close" aria-label="بستن">' + ic('x') + '</button></div><div class="drawer-b" style="gap:0">' + links.concat([['#/guide', 'راهنمای گل‌ها'], ['#/events', 'گل‌آرایی مراسم'], ['#/track', 'پیگیری سفارش'], ['#/admin', 'ورود مدیر']]).map(function (l) { return '<a href="' + l[0] + '" data-act="close">' + l[1] + '</a>'; }).join('') + '</div></aside>';
  }

  var ROUTES = { '': home, shop: shop, flowers: flowers, flower: flowerPage, bouquet: bouquetPage, builder: builder, subscribe: subscribe, wishlist: wishlist, about: about, guide: guide, events: events, checkout: checkout, order: orderPage, track: track };
  var TITLES = { shop: 'دسته‌گل‌ها', flowers: 'گل شاخه‌ای', builder: 'ساخت دسته‌گل', subscribe: 'اشتراک گل', wishlist: 'علاقه‌مندی‌ها', guide: 'راهنمای گل‌ها', events: 'گل‌آرایی مراسم', about: 'درباره و تماس', checkout: 'ثبت سفارش', track: 'پیگیری سفارش' };
  function render(parts) {
    if (!$('#view')) { app.innerHTML = shell(); }
    var name = parts[0] || '', fn = ROUTES[name] || notFound;
    $('#view').innerHTML = fn(parts.slice(1));
    if (name === 'shop') shopFill();
    if (name === 'builder') builderSide();
    if (name === 'checkout') { coWhen(); coSum(); }
    document.title = (TITLES[name] ? TITLES[name] + ' | ' : '') + 'گل‌فروشی ' + D().settings.name;
    document.querySelectorAll('[data-nav]').forEach(function (a) { var h = a.getAttribute('data-nav'), cur = '#/' + parts.join('/'); a.classList.toggle('on', h === '#/' ? cur === '#/' : cur.indexOf(h) === 0); });
    badges(); closeAll();
    if (window.FX) FX.refresh();
  }

  /* ---------- رویدادها ---------- */
  var ACT = {
    cart: openCart, close: closeAll,
    menu: function () { $('#menu').classList.add('on'); $('#ovl').classList.add('on'); },
    filters: function () { $('#filters').classList.add('on'); $('#ovl').classList.add('on'); },
    theme: function (el) {
      var r = document.documentElement, dark = r.getAttribute('data-theme') ? r.getAttribute('data-theme') === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      function apply() { r.setAttribute('data-theme', dark ? 'light' : 'dark'); }
      if (window.FX) FX.themeSwap(el, apply); else apply();
      try { localStorage.setItem('niloofar_theme', dark ? 'light' : 'dark'); } catch (e) { }
    },
    wish: function (el) {
      var d = D(), id = el.dataset.id, i = d.wish.indexOf(id);
      if (i > -1) d.wish.splice(i, 1); else d.wish.push(id);
      DB.save(); el.classList.toggle('on', i < 0); badges(); toast(i < 0 ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها برداشته شد');
    },
    add: function (el) { addCart({ type: el.dataset.type, id: el.dataset.id, size: 0, qty: 1 }, false, el.closest('.card').querySelector('.card-art')); },
    addq: function (el) { addCart({ type: el.dataset.type, id: el.dataset.id, size: el.dataset.type === 'bouquet' ? sizeState : 0, qty: qtyState }, false, document.querySelector('.pd-art')); },
    qty: function (el) {
      qtyState = Math.max(1, Math.min(99, qtyState + (+el.dataset.d))); $('#qty').textContent = fa(qtyState);
      var t = $('#f-total'), f = Q.flower((location.hash.split('/')[2] || '')); if (t && f) t.textContent = fmt(Q.priceOf(f, false).final * qtyState) + ' تومان';
    },
    size: function (el) {
      sizeState = +el.dataset.i; document.querySelectorAll('.size').forEach(function (s) { s.classList.toggle('on', s === el); });
      var pp = $('#pd-price'); pp.innerHTML = pdPrice(Q.bouquet(el.dataset.id)); pp.classList.remove('changed'); void pp.offsetWidth; pp.classList.add('changed');
    },
    scroll: function (el, ev) { ev.preventDefault(); var t = document.getElementById(el.dataset.to); if (t) t.scrollIntoView({ behavior: 'smooth' }); },
    f: function (el) { var k = el.dataset.k; F[k] = k === 'max' ? +el.dataset.v : el.dataset.v; shopFill(); },
    fclear: function () { F = { occ: '', style: '', flower: '', color: '', max: 0, sale: false, q: '', sort: F.sort }; shopFill(); },
    cq: function (el) {
      var d = D(), c = d.cart[+el.dataset.i]; if (!c) return; c.qty += +el.dataset.d; if (c.qty <= 0) d.cart.splice(+el.dataset.i, 1);
      DB.save(); badges(); $('#cart-body').innerHTML = cartHTML(); if ($('#co-sum')) { if (!d.cart.length) route(); else coSum(); }
    },
    bq: function (el) {
      var id = el.dataset.id, f = Q.flower(id), n = Math.max(0, Math.min(Math.min(30, f.stock), (BLD.picks[id] || 0) + (+el.dataset.d)));
      if (n) BLD.picks[id] = n; else delete BLD.picks[id];
      $('#bq-' + id).textContent = fa(n); $('#pick-' + id).classList.toggle('on', !!n); builderSide();
    },
    bwrap: function (el) { BLD.wrap = el.dataset.v; builderSide(); },
    bclear: function () { BLD.picks = {}; route(); },
    badd: function () {
      var items = [], price = WRAP_FEE, parts = [];
      Object.keys(BLD.picks).forEach(function (id) { var f = Q.flower(id), n = BLD.picks[id]; if (!f) return; items.push({ kind: f.kind, color: f.color, c2: f.c2, n: n }); price += Q.priceOf(f, false).final * n; parts.push(fa(n) + ' ' + f.name); });
      addCart({ type: 'custom', id: DB.uid('cu'), qty: 1, price: price, items: items, wrap: BLD.wrap, summary: parts.join('، ') }, false, document.querySelector('.bld-art'));
      BLD.picks = {};
    },
    plan: function (el) { var p = D().settings.plans.find(function (x) { return x.id === el.dataset.id; }); addCart({ type: 'plan', id: p.id, qty: 1, price: p.price, name: p.name, summary: 'اولین نوبت · ' + p.every }); },
    day: function (el) { if (el.disabled) return; CO.day = +el.dataset.i; coWhen(); },
    slot: function (el) { CO.slot = el.dataset.v; coWhen(); },
    msg: function (el) { $('#co-card').value = el.dataset.v; },
    coupon: function () { CO.coupon = $('#co-coupon').value.trim(); coSum(); }
  };
  var CHG = {
    sort: function (el) { F.sort = el.value; shopFill(); },
    fflower: function (el) { F.flower = el.value; shopFill(); },
    fsale: function (el) { F.sale = el.checked; shopFill(); },
    zone: function (el) { CO.zone = el.value; coSum(); },
    anon: function (el) { CO.anon = el.checked; },
    addon: function (el) { CO.addons[el.value] = el.checked; coSum(); },
    pay: function (el) { CO.pay = el.value; }
  };
  var FORMS = {
    finder: function (f) { location.hash = '#/shop/find/' + (f.elements.occ.value || '-') + '/' + (encodeURIComponent(f.elements.color.value) || '-') + '/' + f.elements.max.value; },
    search: function (f) { var q = f.elements.q.value.trim(); $('#sugg').hidden = true; if (q) location.hash = '#/shop/q/' + encodeURIComponent(q); },
    order: placeOrder,
    track: function (f) { var c = f.elements.code.value.trim(); if (c) location.hash = '#/track/' + encodeURIComponent(c); },
    news: function (f) { if (!/^09\d{9}$/.test(f.elements.phone.value.trim())) { toast('شماره موبایل ۱۱ رقمی را با ۰۹ وارد کنید.', true); return; } f.reset(); toast('شماره‌ی شما ثبت شد'); },
    event: function (f) {
      var ph = f.elements.phone, v = ph.value.replace(/[۰-۹]/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(c); }).replace(/\D/g, '');
      if (!/^09\d{9}$/.test(v)) { var fd = ph.closest('.field'); fd.classList.add('err'); fd.querySelector('.msg').hidden = false; ph.focus(); return; }
      D().requests.push({ id: DB.uid('q'), date: Date.now(), name: f.elements.name.value.trim(), phone: v, type: f.elements.type.value, when: f.elements.when.value.trim(), guests: +f.elements.guests.value || 0, budget: f.elements.budget.value, note: f.elements.note.value.trim(), done: false });
      DB.save(); f.reset(); toast('درخواست شما رسید؛ امروز تماس می‌گیریم');
    },
    review: function (f) {
      D().reviews.push({ id: DB.uid('r'), bid: f.dataset.id, name: f.elements.name.value.trim(), rating: +f.elements.rating.value, text: f.elements.text.value.trim(), date: Date.now(), approved: false });
      DB.save(); f.reset(); toast('نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود');
    }
  };
  function suggest(q) {
    var box = $('#sugg'); q = q.trim(); if (!q) { box.hidden = true; return; }
    var bs = activeB().filter(function (b) { return (b.name + ' ' + Q.bouquetItems(b).map(function (i) { return i.f.name; }).join(' ')).indexOf(q) > -1; }).slice(0, 4);
    var fs = activeF().filter(function (f) { return f.name.indexOf(q) > -1; }).slice(0, 3);
    if (!bs.length && !fs.length) { box.innerHTML = '<p style="padding:10px;color:var(--muted);font-size:13.5px">چیزی با «' + esc(q) + '» پیدا نشد. نام یک گل را امتحان کنید، مثل رز یا نرگس.</p>'; box.hidden = false; return; }
    box.innerHTML = bs.map(function (b) { return '<a href="#/bouquet/' + b.id + '"><span class="th" style="background:' + UI.bgB(b) + '">' + UI.artBouquet(b, { max: 7 }) + '</span>' + esc(b.name) + '<small>دسته‌گل</small></a>'; }).join('') +
      fs.map(function (f) { return '<a href="#/flower/' + f.id + '"><span class="th" style="background:' + UI.bgF(f) + '">' + UI.artFlower(f) + '</span>' + esc(f.name) + '<small>شاخه‌ای</small></a>'; }).join('');
    box.hidden = false;
  }
  function bind() {
    document.addEventListener('click', function (ev) {
      if (document.body.classList.contains('is-admin')) return;
      var el = ev.target.closest('[data-act]'); if (!el) { var sg = $('#sugg'); if (sg && !ev.target.closest('.search')) sg.hidden = true; return; }
      var fn = ACT[el.dataset.act]; if (fn) { if (el.tagName === 'BUTTON') ev.preventDefault(); fn(el, ev); }
    });
    document.addEventListener('change', function (ev) { if (document.body.classList.contains('is-admin')) return; var el = ev.target.closest('[data-change]'); if (el && CHG[el.dataset.change]) CHG[el.dataset.change](el); });
    document.addEventListener('submit', function (ev) { if (document.body.classList.contains('is-admin')) return; var f = ev.target.closest('[data-form]'); if (f && FORMS[f.dataset.form]) { ev.preventDefault(); FORMS[f.dataset.form](f); } });
    document.addEventListener('input', function (ev) {
      if (ev.target.id === 'q') suggest(ev.target.value);
      var f = ev.target.closest && ev.target.closest('.field.err'); // با شروع تایپ، خطای همان فیلد پاک می‌شود
      if (f) { f.classList.remove('err'); var m = f.querySelector('.msg'); if (m) m.hidden = true; }
    });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeAll(); });
    setInterval(function () {
      document.querySelectorAll('[data-clock]').forEach(clockTick);
      var sd = sameDay(); document.querySelectorAll('[data-sameday]').forEach(function (e) { e.innerHTML = sd.text; });
    }, 1000);
  }

  /* ---------- مسیریاب ---------- */
  function route() {
    var parts = location.hash.replace(/^#\/?/, '').split('/').filter(function (p, i) { return p !== '' || i > 0; });
    if (parts[0] === 'admin') {
      document.body.classList.add('is-admin'); app.innerHTML = ''; app.removeAttribute('data-shop'); Admin.render(parts.slice(1), app);
    } else {
      if (document.body.classList.contains('is-admin') || !app.hasAttribute('data-shop')) { document.body.classList.remove('is-admin'); app.innerHTML = ''; app.setAttribute('data-shop', ''); }
      render(parts);
    }
    window.scrollTo(0, 0);
  }
  window.Shop = { route: route };
  document.addEventListener('DOMContentLoaded', function () {
    app = document.getElementById('app');
    try { var th = localStorage.getItem('niloofar_theme'); if (th) document.documentElement.setAttribute('data-theme', th); } catch (e) { }
    DB.load(); bind(); window.addEventListener('hashchange', route); route();
  });
})();
