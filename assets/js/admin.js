/* ============================================================
   admin.js — پنل مدیریت فروشگاه  (نشانی: index.html#/admin)
   رمز نمایشی: 1234  (از بخش تنظیمات عوض می‌شود)
   هر بخش پنل یک تابع در PAGES است. فرم‌ها با تابع openForm از روی
   فهرست فیلدها ساخته می‌شوند؛ برای افزودن فیلد تازه کافی است یک خط
   به همان فهرست اضافه کنید.
   ============================================================ */
(function () {
  'use strict';
  var esc = UI.esc, ic = UI.ic, toast = UI.toast, root, cur = 'dash', sub = '';
  var D = function () { return DB.load(); };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var authed = false, oq = '';
  try { authed = sessionStorage.getItem('niloofar_admin') === '1'; } catch (e) { }

  var MENU = [
    ['dash', 'داشبورد', 'chart'], ['orders', 'سفارش‌ها', 'list'], ['bouquets', 'دسته‌گل‌ها', 'gift'], ['flowers', 'گل‌ها', 'flower'],
    ['cats', 'دسته‌بندی‌ها', 'grid'], ['discounts', 'تخفیف و کد', 'tag'], ['front', 'ویترین و پیشنهادها', 'star'], ['insta', 'اینستاگرام', 'insta'],
    ['customers', 'مشتری‌ها', 'user'], ['requests', 'درخواست مراسم', 'phone'], ['reviews', 'نظرها', 'chat'], ['delivery', 'ارسال و افزودنی', 'truck'], ['settings', 'تنظیمات', 'gear']
  ];
  var ST = { new: ['تازه', 'b-new'], preparing: ['در حال بستن', 'b-prep'], sending: ['در راه', 'b-send'], delivered: ['تحویل شد', 'b-done'], cancelled: ['لغو شد', 'b-cancel'] };
  var PAYS = { online: 'آنلاین', card: 'کارت به کارت', cod: 'هنگام تحویل' };

  function save(msg) { if (!DB.save()) { toast('ذخیره نشد؛ حافظه‌ی مرورگر پر است. یک عکس را حذف کنید.', true); return false; } if (msg) toast(msg); return true; }
  function sw(on, a, id, label) { return '<button class="sw-t' + (on ? ' on' : '') + '" role="switch" aria-checked="' + !!on + '" aria-label="' + esc(label || '') + '" data-a="' + a + '" data-id="' + id + '"><i></i></button>'; }
  function table(heads, rows, emptyMsg) {
    if (!rows.length) return '<div class="a-empty">' + (emptyMsg || 'هنوز چیزی اینجا نیست.') + '</div>';
    return '<div class="a-table"><table><thead><tr>' + heads.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function rowBtns(kind, id) {
    return '<div class="a-acts"><button class="a-ib" data-a="edit" data-k="' + kind + '" data-id="' + id + '" aria-label="ویرایش">' + ic('edit') + '</button><button class="a-ib del" data-a="del" data-k="' + kind + '" data-id="' + id + '" aria-label="حذف">' + ic('trash') + '</button></div>';
  }
  function head(title, text, btn) { return '<div class="a-head"><div><h1>' + title + '</h1>' + (text ? '<p>' + text + '</p>' : '') + '</div>' + (btn || '') + '</div>'; }
  function thumbB(b) { return '<span class="a-th" style="background:' + UI.bgB(b) + '">' + UI.artBouquet(b, { max: 8 }) + '</span>'; }
  function thumbF(f) { return '<span class="a-th round" style="background:' + UI.bgF(f) + '">' + UI.artFlower(f) + '</span>'; }

  /* ================= داشبورد ================= */
  function dash() {
    var d = D(), now = Date.now(), sod = new Date(); sod.setHours(0, 0, 0, 0);
    var ok = d.orders.filter(function (o) { return o.status !== 'cancelled'; });
    function sum(from) { return ok.filter(function (o) { return o.date >= from; }).reduce(function (s, o) { return s + o.total; }, 0); }
    function cnt(from) { return ok.filter(function (o) { return o.date >= from; }).length; }
    var t30 = sum(now - 30 * DAY), c30 = cnt(now - 30 * DAY), prev7 = ok.filter(function (o) { return o.date >= now - 14 * DAY && o.date < now - 7 * DAY; }).reduce(function (s, o) { return s + o.total; }, 0), s7 = sum(now - 7 * DAY);
    var chg = prev7 ? Math.round((s7 - prev7) / prev7 * 100) : 0;
    var pending = d.orders.filter(function (o) { return o.status === 'new' || o.status === 'preparing'; }).length;
    function kpi(l, v, s, cls) { return '<div class="kpi' + (cls ? ' ' + cls : '') + '"><span>' + l + '</span><b class="num" data-count="' + Math.round(v) + '">' + fmt(v) + '</b><small>' + (s || '') + '</small></div>'; }
    var h = head('داشبورد', fdate(now, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), '<a class="btn btn-g btn-sm" href="#/">' + ic('eye') + 'دیدن فروشگاه</a>');
    h += '<div class="kpis">' + kpi('فروش امروز', sum(sod.getTime()), fa(cnt(sod.getTime())) + ' سفارش · تومان') +
      kpi('فروش ۷ روز', s7, '<i class="' + (chg >= 0 ? 'up' : 'down') + '">' + (chg >= 0 ? '▲' : '▼') + ' ' + fa(Math.abs(chg)) + '٪</i> نسبت به هفته‌ی قبل') +
      kpi('فروش ۳۰ روز', t30, fa(c30) + ' سفارش · تومان') + kpi('میانگین هر سفارش', c30 ? t30 / c30 : 0, 'تومان، در ۳۰ روز') +
      kpi('منتظر شما', pending, 'سفارش تازه یا در حال بستن', pending ? 'hot' : '') + '</div>';

    // نمودار فروش ۱۴ روز
    var days = [], max = 1;
    for (var i = 13; i >= 0; i--) { var a = new Date(sod.getTime() - i * DAY), b = a.getTime() + DAY, v = ok.filter(function (o) { return o.date >= a.getTime() && o.date < b; }).reduce(function (s, o) { return s + o.total; }, 0); days.push({ d: a, v: v }); if (v > max) max = v; }
    h += '<div class="a-grid2"><div class="a-card"><h3>فروش ۱۴ روز گذشته <small>میلیون تومان</small></h3><div class="bars">' + days.map(function (x, i) {
      return '<div class="bar-col' + (i === 13 ? ' today' : '') + '" style="--k:' + i + '" title="' + fdate(x.d) + ': ' + fmt(x.v) + ' تومان"><span class="num">' + fa((x.v / 1e6).toFixed(1)) + '</span><i style="height:calc(' + (x.v / max * 100).toFixed(1) + '% - 20px)"></i><em>' + fa(x.d.toLocaleDateString('fa-IR-u-nu-latn', { day: 'numeric' })) + '</em></div>';
    }).join('') + '</div></div>';

    // پرفروش‌ها
    var m = Q.soldMap(), top = Object.keys(m).map(function (k) { return m[k]; }).filter(function (x) { return x.type === 'bouquet'; }).sort(function (a, b) { return b.qty - a.qty; }).slice(0, 7), tmax = top.length ? top[0].qty : 1;
    h += '<div class="a-card"><h3>پرفروش‌ترین دسته‌گل‌ها <small>همه‌ی سفارش‌ها</small></h3><div class="rank">' + top.map(function (x, i) {
      var b = Q.bouquet(x.id);
      return '<div class="rank-row"><span class="rank-n num">' + fa(i + 1) + '</span>' + (b ? thumbB(b) : '') + '<div class="rank-b"><div><b>' + esc(b ? b.name : x.name) + '</b><span class="num">' + fa(x.qty) + ' فروش · ' + fmt(x.rev) + ' تومان</span></div><div class="meter"><i style="width:' + (x.qty / tmax * 100) + '%"></i></div></div></div>';
    }).join('') + '</div></div></div>';

    var topF = Object.keys(m).map(function (k) { return m[k]; }).filter(function (x) { return x.type === 'flower'; }).sort(function (a, b) { return b.qty - a.qty; }).slice(0, 5);
    var low = d.bouquets.filter(function (b) { return b.active && b.stock <= 3; }).map(function (b) { return { n: b.name, s: b.stock, u: 'عدد' }; }).concat(d.flowers.filter(function (f) { return f.active && f.stock <= 40; }).map(function (f) { return { n: f.name, s: f.stock, u: 'شاخه' }; }));
    var occ = {}; ok.forEach(function (o) { o.items.forEach(function (it) { var b = Q.bouquet(it.id); if (b) b.cats.slice(0, 1).forEach(function (c) { occ[c] = (occ[c] || 0) + it.qty; }); }); });
    var occL = Object.keys(occ).map(function (k) { return { c: Q.cat(k), n: occ[k] }; }).filter(function (x) { return x.c; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 6), omax = occL.length ? occL[0].n : 1;
    h += '<div class="a-grid3"><div class="a-card"><h3>فروش بر اساس مناسبت</h3>' + occL.map(function (x) { return '<div class="rank-b" style="margin-bottom:10px"><div><b>' + esc(x.c.name) + '</b><span class="num">' + fa(x.n) + '</span></div><div class="meter"><i style="width:' + (x.n / omax * 100) + '%"></i></div></div>'; }).join('') + '</div>' +
      '<div class="a-card"><h3>گل‌های شاخه‌ای پرفروش</h3>' + (topF.length ? topF.map(function (x) { var f = Q.flower(x.id); return '<div class="rank-row">' + (f ? thumbF(f) : '') + '<div class="rank-b"><div><b>' + esc(x.name) + '</b><span class="num">' + fa(x.qty) + ' شاخه</span></div></div></div>'; }).join('') : '<p class="a-muted">هنوز فروش شاخه‌ای نداشته‌اید.</p>') + '</div>' +
      '<div class="a-card"><h3>موجودی رو به اتمام</h3>' + (low.length ? low.slice(0, 7).map(function (x) { return '<div class="sum-row" style="padding-block:5px"><span>' + esc(x.n) + '</span><b class="num ' + (x.s <= 0 ? 'down' : '') + '">' + (x.s <= 0 ? 'تمام شده' : fa(x.s) + ' ' + x.u) + '</b></div>'; }).join('') : '<p class="a-muted">همه‌چیز به اندازه‌ی کافی موجود است.</p>') + '</div></div>';

    var recent = d.orders.slice().sort(function (a, b) { return b.date - a.date; }).slice(0, 6);
    h += '<div class="a-card"><h3>آخرین سفارش‌ها <a class="link" href="#/admin/orders" style="float:left;font-size:13px">همه</a></h3>' + ordersTable(recent) + '</div>';
    return h;
  }

  /* ================= سفارش‌ها ================= */
  function ordersTable(list) {
    return table(['کد', 'زمان ثبت', 'مشتری', 'اقلام', 'تحویل', 'مبلغ', 'وضعیت', ''], list.map(function (o) {
      return ['<b>' + o.id + '</b>', '<span class="num">' + fdate(o.date, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '</span>', esc(o.customer.name),
      esc(o.items.map(function (i) { return i.name + (i.qty > 1 ? ' ×' + fa(i.qty) : ''); }).join('، ')), fdate(o.slot.date, { day: 'numeric', month: 'short' }) + '، ' + esc(o.slot.time), '<b class="num">' + fmt(o.total) + '</b>',
      '<span class="badge ' + ST[o.status][1] + '">' + ST[o.status][0] + '</span>', '<button class="btn btn-g btn-sm" data-a="order" data-id="' + o.id + '">جزئیات</button>'];
    }), 'سفارشی با این وضعیت نیست.');
  }
  function orders() {
    var d = D(), f = sub || 'all', list = d.orders.slice().sort(function (a, b) { return b.date - a.date; });
    var tabs = [['all', 'همه']].concat(Object.keys(ST).map(function (k) { return [k, ST[k][0]]; }));
    var shown = f === 'all' ? list : list.filter(function (o) { return o.status === f; });
    if (oq) shown = shown.filter(function (o) { return (o.id + ' ' + o.customer.name + ' ' + o.customer.phone + ' ' + o.recipient.name + ' ' + o.recipient.phone).toLowerCase().indexOf(oq.toLowerCase()) > -1; });
    return head('سفارش‌ها', fa(list.length) + ' سفارش ثبت شده است.') + '<div class="a-tabs">' + tabs.map(function (t) { var n = t[0] === 'all' ? list.length : list.filter(function (o) { return o.status === t[0]; }).length; return '<a class="' + (f === t[0] ? 'on' : '') + '" href="#/admin/orders/' + t[0] + '">' + t[1] + ' <span class="num">' + fa(n) + '</span></a>'; }).join('') + '<input class="a-search" type="search" placeholder="جست‌وجوی کد، نام یا موبایل" value="' + esc(oq) + '" data-c="osearch" aria-label="جست‌وجو در سفارش‌ها"></div><div class="a-card">' + ordersTable(shown.slice(0, 60)) + '</div>';
  }
  function orderModal(id) {
    var o = D().orders.find(function (x) { return x.id === id; }); if (!o) return;
    var flow = ['new', 'preparing', 'sending', 'delivered'];
    modal('سفارش ' + o.id, '<div class="a-two"><div><h4>مشتری</h4><p>' + esc(o.customer.name) + '<br><span dir="ltr">' + esc(o.customer.phone) + '</span></p><h4>گیرنده' + (o.anonymous ? ' <span class="badge b-prep">ارسال ناشناس</span>' : '') + '</h4><p>' + esc(o.recipient.name) + '<br><span dir="ltr">' + esc(o.recipient.phone) + '</span><br>' + esc(o.recipient.address) + '</p><h4>تحویل</h4><p>' + fdate(o.slot.date, { weekday: 'long', day: 'numeric', month: 'long' }) + '، ساعت ' + esc(o.slot.time) + '</p>' + (o.card ? '<h4>متن کارت</h4><p class="a-quote">' + esc(o.card) + '</p>' : '') + '</div><div><h4>اقلام</h4>' +
      o.items.map(function (i) { return '<div class="sum-row"><span>' + esc(i.name) + ' × ' + fa(i.qty) + (i.detail ? '<br><small class="a-muted">' + esc(i.detail) + '</small>' : '') + '</span><span class="num">' + fmt(i.price * i.qty) + '</span></div>'; }).join('') +
      (o.addons || []).map(function (a) { return '<div class="sum-row"><span>' + esc(a.name) + '</span><span class="num">' + fmt(a.price) + '</span></div>'; }).join('') +
      (o.discount ? '<div class="sum-row"><span>تخفیف ' + esc(o.coupon || '') + '</span><span class="num neg">−' + fmt(o.discount) + '</span></div>' : '') + '<div class="sum-row"><span>ارسال</span><span class="num">' + (o.delivery ? fmt(o.delivery) : 'رایگان') + '</span></div><div class="sum-row total"><span>جمع · ' + PAYS[o.payment] + '</span><span class="num">' + fmt(o.total) + ' تومان</span></div></div></div>' +
      '<h4 style="margin-top:16px">وضعیت سفارش</h4><div class="a-tabs">' + flow.concat(['cancelled']).map(function (s) { return '<button class="' + (o.status === s ? 'on' : '') + '" data-a="ostatus" data-id="' + o.id + '" data-v="' + s + '">' + ST[s][0] + '</button>'; }).join('') + '</div>');
  }

  /* ================= دسته‌گل‌ها و گل‌ها ================= */
  function bouquets() {
    var d = D(), m = Q.soldMap();
    return head('دسته‌گل‌ها', 'هر دسته‌گل از گل‌های بخش «گل‌ها» ساخته می‌شود و تصویرش خودکار کشیده می‌شود؛ عکس واقعی هم می‌توانید بگذارید.', '<button class="btn" data-a="new" data-k="bouquet">' + ic('plus') + 'دسته‌گل تازه</button>') +
      '<div class="a-card">' + table(['', 'نام', 'قیمت پایه', 'تخفیف', 'موجودی', 'فروش', 'پیشنهاد ما', 'نمایش', ''], d.bouquets.map(function (b) {
        var p = Q.priceOf(b, true, 0);
        return [thumbB(b), '<b>' + esc(b.name) + '</b><br><small class="a-muted">' + esc((Q.cat(b.style) || {}).name || '') + '</small>', '<span class="num">' + fmt(b.price) + '</span>',
        p.discount ? '<span class="badge b-prep num">' + fa(p.discount) + '٪</span>' : '—', '<input class="a-num" type="number" min="0" value="' + b.stock + '" data-c="stock" data-k="bouquet" data-id="' + b.id + '" aria-label="موجودی ' + esc(b.name) + '">',
        '<span class="num">' + fa((m['bouquet:' + b.id] || { qty: 0 }).qty) + '</span>', sw(b.featured, 'feat', b.id, 'پیشنهاد ما'), sw(b.active, 'actB', b.id, 'نمایش در فروشگاه'), rowBtns('bouquet', b.id)];
      })) + '</div>';
  }
  function flowers() {
    var d = D();
    return head('گل‌ها', 'قیمت هر شاخه، موجودی و مشخصات هر گل. دسته‌گل‌ها از همین گل‌ها ساخته می‌شوند.', '<button class="btn" data-a="new" data-k="flower">' + ic('plus') + 'گل تازه</button>') +
      '<div class="a-card">' + table(['', 'نام', 'قیمت شاخه', 'تخفیف ٪', 'موجودی', 'در چند دسته‌گل', 'نمایش', ''], d.flowers.map(function (f) {
        return [thumbF(f), '<b>' + esc(f.name) + '</b><br><small class="a-muted">' + esc(f.season) + '</small>',
        '<input class="a-num wide" type="number" min="0" step="1000" value="' + f.price + '" data-c="price" data-k="flower" data-id="' + f.id + '" aria-label="قیمت ' + esc(f.name) + '">',
        '<input class="a-num" type="number" min="0" max="90" value="' + (f.discount || 0) + '" data-c="discount" data-k="flower" data-id="' + f.id + '" aria-label="تخفیف ' + esc(f.name) + '">',
        '<input class="a-num" type="number" min="0" value="' + f.stock + '" data-c="stock" data-k="flower" data-id="' + f.id + '" aria-label="موجودی ' + esc(f.name) + '">',
        '<span class="num">' + fa(Q.bouquetsWith(f.id).length) + '</span>', sw(f.active, 'actF', f.id, 'نمایش'), rowBtns('flower', f.id)];
      })) + '</div>';
  }
  function cats() {
    var d = D();
    function block(type, title, text) {
      var list = d.cats.filter(function (c) { return c.type === type; });
      return '<div class="a-card"><h3>' + title + ' <button class="btn btn-g btn-sm" style="float:left" data-a="new" data-k="cat" data-t="' + type + '">' + ic('plus') + 'افزودن</button></h3><p class="a-muted" style="margin-bottom:10px">' + text + '</p>' + table(['نام', 'تعداد دسته‌گل', 'نمایش', ''], list.map(function (c) {
        var n = d.bouquets.filter(function (b) { return type === 'occasion' ? b.cats.indexOf(c.id) > -1 : b.style === c.id; }).length;
        return [(c.tone ? '<i class="dot" style="background:' + c.tone + '"></i>' : '') + '<b>' + esc(c.name) + '</b>', '<span class="num">' + fa(n) + '</span>', sw(c.active, 'actC', c.id, 'نمایش'), rowBtns('cat', c.id)];
      })) + '</div>';
    }
    return head('دسته‌بندی‌ها', 'مشتری با این دسته‌ها فروشگاه را می‌گردد. دسته‌بندی «بر اساس گل» و «رنگ» خودکار از روی گل‌ها ساخته می‌شود.') + '<div class="a-grid2">' + block('occasion', 'مناسبت‌ها', 'تولد، عیادت، تسلیت و…') + block('style', 'نوع بسته‌بندی', 'دسته‌گل، باکس، سبد و…') + '</div>';
  }

  /* ================= تخفیف ================= */
  function discounts() {
    var d = D(), of = d.settings.offer, left = of.ends - Date.now();
    var h = head('تخفیف و کد', 'سه راه برای تخفیف: پیشنهاد زمان‌دار روی چند دسته‌گل، تخفیف ثابت روی یک محصول، و کد تخفیف برای سبد خرید.');
    h += '<div class="a-card"><h3>پیشنهاد زمان‌دار ' + sw(of.on, 'offerOn', 'x', 'فعال') + '</h3><p class="a-muted">' + (of.on && left > 0 ? 'فعال است؛ ' + fa(Math.floor(left / DAY)) + ' روز و ' + fa(Math.floor(left % DAY / 3600000)) + ' ساعت دیگر تمام می‌شود.' : (of.on ? 'زمانش تمام شده است. تاریخ پایان را جلو ببرید.' : 'خاموش است.')) + '</p>' +
      '<form data-f="offer" class="a-form"><div class="a-fields">' + fldHTML({ k: 'title', l: 'عنوان', t: 'text' }, of.title) + fldHTML({ k: 'percent', l: 'درصد تخفیف', t: 'number', min: 1, max: 90 }, of.percent) + fldHTML({ k: 'ends', l: 'پایان', t: 'datetime' }, of.ends) + '</div>' +
      fldHTML({ k: 'ids', l: 'روی کدام دسته‌گل‌ها؟', t: 'checks', opts: d.bouquets.map(function (b) { return [b.id, b.name]; }) }, of.ids) + '<button class="btn" type="submit">ذخیره‌ی پیشنهاد</button></form></div>';
    h += '<div class="a-card"><h3>کدهای تخفیف <button class="btn btn-g btn-sm" style="float:left" data-a="new" data-k="coupon">' + ic('plus') + 'کد تازه</button></h3>' + table(['کد', 'مقدار', 'حداقل خرید', 'انقضا', 'استفاده', 'فعال', ''], d.coupons.map(function (c) {
      var exp = c.expires && c.expires < Date.now();
      return ['<b dir="ltr">' + esc(c.code) + '</b><br><small class="a-muted">' + esc(c.note || '') + '</small>', '<span class="num">' + (c.type === 'percent' ? fa(c.value) + '٪' : fmt(c.value) + ' تومان') + '</span>', '<span class="num">' + (c.min ? fmt(c.min) : '—') + '</span>',
      '<span class="' + (exp ? 'down' : '') + '">' + (c.expires ? fdate(c.expires) : 'ندارد') + (exp ? ' (گذشته)' : '') + '</span>', '<span class="num">' + fa(c.used || 0) + (c.limit ? ' از ' + fa(c.limit) : '') + '</span>', sw(c.active, 'actCp', c.id, 'فعال'), rowBtns('coupon', c.id)];
    })) + '</div>';
    h += '<div class="a-card"><h3>تخفیف ثابت هر دسته‌گل</h3><p class="a-muted" style="margin-bottom:10px">درصد را بنویسید؛ همان لحظه در فروشگاه اعمال می‌شود. صفر یعنی بدون تخفیف.</p>' + table(['', 'دسته‌گل', 'قیمت', 'تخفیف ٪', 'قیمت بعد از تخفیف'], d.bouquets.map(function (b) {
      return [thumbB(b), '<b>' + esc(b.name) + '</b>', '<span class="num">' + fmt(b.price) + '</span>', '<input class="a-num" type="number" min="0" max="90" value="' + (b.discount || 0) + '" data-c="discount" data-k="bouquet" data-id="' + b.id + '" aria-label="تخفیف ' + esc(b.name) + '">', '<b class="num" id="after-' + b.id + '">' + fmt(Q.priceOf(b, true, 0).final) + '</b>'];
    })) + '</div>';
    return h;
  }

  /* ================= ویترین ================= */
  function front() {
    var d = D(), s = d.settings;
    return head('ویترین و پیشنهادها', 'آنچه مشتری در صفحه‌ی اول می‌بیند.') +
      '<div class="a-card"><h3>بالای صفحه‌ی اول</h3><form data-f="front" class="a-form"><div class="a-fields">' + fldHTML({ k: 'heroTitle', l: 'تیتر اصلی', t: 'text', full: 1 }, s.heroTitle) + fldHTML({ k: 'heroText', l: 'متن زیر تیتر', t: 'textarea', full: 1 }, s.heroText) +
      fldHTML({ k: 'heroBouquet', l: 'دسته‌گلِ قاب اصلی', t: 'select', opts: d.bouquets.map(function (b) { return [b.id, b.name]; }) }, s.heroBouquet) + fldHTML({ k: 'announceOn', l: 'نوار خبر بالای سایت', t: 'checkbox', hint: 'نمایش داده شود' }, s.announceOn) + fldHTML({ k: 'announcement', l: 'متن نوار خبر', t: 'text', full: 1 }, s.announcement) + '</div><button class="btn" type="submit">ذخیره</button></form></div>' +
      '<div class="a-card"><h3>پیشنهاد ویژه</h3><p class="a-muted" style="margin-bottom:10px">دسته‌گل‌هایی که روشن باشند در بخش «پیشنهاد ویژه» صفحه‌ی اول می‌آیند (حداکثر ۸ تا).</p><div class="feat-grid">' + d.bouquets.map(function (b) {
        return '<div class="feat' + (b.featured ? ' on' : '') + '">' + thumbB(b) + '<b>' + esc(b.name) + '</b>' + sw(b.featured, 'feat', b.id, 'پیشنهاد ' + b.name) + '</div>';
      }).join('') + '</div></div>' +
      '<div class="a-card"><h3>طرح‌های اشتراک</h3>' + table(['نام', 'دوره', 'قیمت هر نوبت', 'توضیح'], s.plans.map(function (p) {
        return ['<b>' + esc(p.name) + '</b>', esc(p.every), '<input class="a-num wide" type="number" step="1000" min="0" value="' + p.price + '" data-c="planPrice" data-id="' + p.id + '" aria-label="قیمت ' + esc(p.name) + '">', esc(p.note)];
      })) + '</div>';
  }

  /* ================= اینستاگرام ================= */
  function insta() {
    var d = D(), i = d.insta;
    return head('اینستاگرام', 'پست‌های پیج را در صفحه‌ی اول نشان دهید و هر پست را به دسته‌گلش وصل کنید تا مشتری از همان‌جا بخرد.') +
      '<div class="a-card"><h3>اتصال پیج ' + sw(i.enabled, 'instaOn', 'x', 'نمایش در سایت') + '</h3><form data-f="insta" class="a-form"><div class="a-fields">' + fldHTML({ k: 'handle', l: 'آیدی پیج (بدون @)', t: 'text', ltr: 1 }, i.handle) + fldHTML({ k: 'title', l: 'عنوان بخش در سایت', t: 'text' }, i.title) +
      fldHTML({ k: 'token', l: 'توکن دسترسی Instagram Graph API', t: 'text', ltr: 1, full: 1, ph: 'IGQVJ…' }, i.token) + '</div>' +
      '<div class="note">' + ic('insta') + '<span>در این نسخه‌ی نمایشی، پست‌ها را خودتان پایین همین صفحه اضافه می‌کنید. برای اینکه پست‌های تازه خودکار بیایند، سایت به یک سرور کوچک نیاز دارد که با این توکن از اینستاگرام بخواند؛ جای توکن از همین حالا آماده است.</span></div><button class="btn" type="submit">ذخیره</button></form></div>' +
      '<div class="a-card"><h3>پست‌ها <button class="btn btn-g btn-sm" style="float:left" data-a="new" data-k="post">' + ic('plus') + 'پست تازه</button></h3><div class="feat-grid">' + i.posts.map(function (p) {
        var b = Q.bouquet(p.bid);
        return '<div class="feat on"><span class="a-th big" style="background:' + (b ? UI.bgB(b) : 'var(--surface-2)') + '">' + (p.img ? '<img src="' + esc(p.img) + '" alt="">' : (b ? UI.artBouquet(b, { max: 8 }) : '')) + '</span><b>' + esc(p.caption) + '</b><small class="a-muted">' + (b ? 'وصل به ' + esc(b.name) : 'بدون محصول') + '</small>' + rowBtns('post', p.id) + '</div>';
      }).join('') + '</div></div>';
  }

  /* ================= نظرها ================= */
  function reviews() {
    var d = D(), list = d.reviews.slice().sort(function (a, b) { return (a.approved - b.approved) || (b.date - a.date); });
    return head('نظرها', 'نظر تازه تا وقتی تأیید نکنید در فروشگاه دیده نمی‌شود.') + '<div class="a-card">' + table(['مشتری', 'دسته‌گل', 'امتیاز', 'متن', 'تاریخ', 'نمایش', ''], list.map(function (r) {
      var b = Q.bouquet(r.bid);
      return ['<b>' + esc(r.name) + '</b>' + (r.approved ? '' : ' <span class="badge b-new">تازه</span>'), esc(b ? b.name : '—'), '<span class="num">' + fa(r.rating) + ' از ۵</span>', '<span class="a-wrap">' + esc(r.text) + '</span>', fdate(r.date), sw(r.approved, 'actR', r.id, 'تأیید'), '<div class="a-acts"><button class="a-ib del" data-a="del" data-k="review" data-id="' + r.id + '" aria-label="حذف">' + ic('trash') + '</button></div>'];
    }), 'هنوز نظری ثبت نشده است.') + '</div>';
  }

  /* ================= مشتری‌ها و درخواست‌ها ================= */
  function customers() {
    var m = {}; D().orders.forEach(function (o) { if (o.status === 'cancelled') return; var k = o.customer.phone, c = m[k] = m[k] || { name: o.customer.name, phone: k, n: 0, total: 0, last: 0 }; c.n++; c.total += o.total; if (o.date > c.last) c.last = o.date; });
    var list = Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return b.total - a.total; }), rep = list.filter(function (c) { return c.n > 1; }).length;
    return head('مشتری‌ها', fa(list.length) + ' مشتری از روی سفارش‌ها؛ ' + fa(rep) + ' نفر بیش از یک‌بار خرید کرده‌اند.') + '<div class="a-card">' + table(['مشتری', 'موبایل', 'تعداد سفارش', 'جمع خرید (تومان)', 'آخرین خرید', ''], list.slice(0, 80).map(function (c) {
      return ['<b>' + esc(c.name) + '</b>', '<span dir="ltr" class="num">' + esc(c.phone) + '</span>', '<span class="num">' + fa(c.n) + '</span>', '<b class="num">' + fmt(c.total) + '</b>', fdate(c.last), c.n > 1 ? '<span class="badge b-done">مشتری ثابت</span>' : ''];
    })) + '</div>';
  }
  function requests() {
    var list = D().requests.slice().sort(function (a, b) { return (a.done - b.done) || (b.date - a.date); });
    return head('درخواست مراسم', 'درخواست‌هایی که از صفحه‌ی «گل‌آرایی مراسم» رسیده است.') + '<div class="a-card">' + table(['نام', 'موبایل', 'مراسم', 'زمان و مهمان', 'بودجه', 'توضیح', 'پیگیری شد', ''], list.map(function (r) {
      return ['<b>' + esc(r.name) + '</b>' + (r.done ? '' : ' <span class="badge b-new">تازه</span>') + '<br><small class="a-muted">' + fdate(r.date) + '</small>', '<span dir="ltr" class="num">' + esc(r.phone) + '</span>', esc(r.type), esc(r.when || '—') + (r.guests ? '<br><small class="a-muted">' + fa(r.guests) + ' مهمان</small>' : ''), esc(r.budget), '<span class="a-wrap">' + esc(r.note || '—') + '</span>', sw(r.done, 'actQ', r.id, 'پیگیری شد'), '<div class="a-acts"><button class="a-ib del" data-a="del" data-k="request" data-id="' + r.id + '" aria-label="حذف">' + ic('trash') + '</button></div>'];
    }), 'هنوز درخواستی نرسیده است.') + '</div>';
  }

  /* ================= ارسال و افزودنی ================= */
  function delivery() {
    var d = D(), s = d.settings;
    return head('ارسال و افزودنی', 'محله‌ها و هزینه‌ی پیک، بازه‌های تحویل و چیزهایی که کنار گل می‌فروشید.') +
      '<div class="a-grid2"><div class="a-card"><h3>محله‌ها و هزینه‌ی ارسال <button class="btn btn-g btn-sm" style="float:left" data-a="new" data-k="zone">' + ic('plus') + 'محله</button></h3>' + table(['محله', 'هزینه (تومان)', ''], s.zones.map(function (z) { return ['<b>' + esc(z.name) + '</b>', '<span class="num">' + (z.fee ? fmt(z.fee) : 'رایگان') + '</span>', rowBtns('zone', z.id)]; })) + '</div>' +
      '<div class="a-card"><h3>افزودنی‌ها <button class="btn btn-g btn-sm" style="float:left" data-a="new" data-k="addon">' + ic('plus') + 'افزودنی</button></h3>' + table(['نام', 'قیمت', 'نمایش', ''], d.addons.map(function (a) { return ['<b>' + esc(a.name) + '</b>', '<span class="num">' + fmt(a.price) + '</span>', sw(a.active, 'actA', a.id, 'نمایش'), rowBtns('addon', a.id)]; })) + '</div></div>' +
      '<div class="a-card"><h3>قواعد تحویل</h3><form data-f="rules" class="a-form"><div class="a-fields">' + fldHTML({ k: 'cutoff', l: 'آخرین ساعت سفارش برای تحویل همان روز', t: 'number', min: 0, max: 23 }, s.cutoff) + fldHTML({ k: 'freeMin', l: 'ارسال رایگان برای خرید بالای (تومان)', t: 'number', min: 0, step: 50000 }, s.freeMin) + fldHTML({ k: 'slots', l: 'بازه‌های تحویل (هر خط یک بازه)', t: 'textarea', full: 1 }, s.slots.join('\n')) + '</div><button class="btn" type="submit">ذخیره</button></form></div>';
  }

  /* ================= تنظیمات ================= */
  function settings() {
    var s = D().settings, size = 0; try { size = (localStorage.getItem('niloofar_db_v1') || '').length; } catch (e) { }
    return head('تنظیمات', 'مشخصات فروشگاه که در سربرگ، پاصفحه و صفحه‌ی تماس دیده می‌شود.') +
      '<div class="a-card"><h3>مشخصات فروشگاه</h3><form data-f="store" class="a-form"><div class="a-fields">' + fldHTML({ k: 'name', l: 'نام فروشگاه', t: 'text' }, s.name) + fldHTML({ k: 'tagline', l: 'زیرعنوان', t: 'text' }, s.tagline) + fldHTML({ k: 'phone', l: 'تلفن', t: 'text' }, s.phone) + fldHTML({ k: 'mobile', l: 'موبایل', t: 'text' }, s.mobile) + fldHTML({ k: 'address', l: 'نشانی', t: 'text', full: 1 }, s.address) + fldHTML({ k: 'hours', l: 'ساعت کار', t: 'text' }, s.hours) + fldHTML({ k: 'adminPass', l: 'رمز پنل مدیریت', t: 'text', ltr: 1 }, s.adminPass) + fldHTML({ k: 'usePhotos', l: 'تصویر محصولات', t: 'checkbox', hint: 'عکس واقعی نشان بده (خاموش = نقاشی)' }, s.usePhotos !== false) + '</div><button class="btn" type="submit">ذخیره</button></form></div>' +
      '<div class="a-card"><h3>پشتیبان و بازنشانی</h3><p class="a-muted">همه‌ی داده‌ها در همین مرورگر نگه‌داری می‌شود (' + fa(Math.round(size / 1024)) + ' کیلوبایت). برای جابه‌جایی به مرورگر دیگر، فایل پشتیبان بگیرید.</p><div class="a-acts" style="margin-top:12px;flex-wrap:wrap"><button class="btn btn-g" data-a="backup">دانلود فایل پشتیبان</button><label class="btn btn-g" style="cursor:pointer">بازگردانی از فایل<input type="file" accept=".json,application/json" data-c="restore" hidden></label><button class="btn btn-g del" data-a="reset">برگرداندن داده‌های نمونه</button></div></div>';
  }

  var PAGES = { dash: dash, orders: orders, bouquets: bouquets, flowers: flowers, cats: cats, discounts: discounts, front: front, insta: insta, reviews: reviews, customers: customers, requests: requests, delivery: delivery, settings: settings };

  /* ================= فرم‌ساز ================= */
  function fldHTML(f, v) {
    var id = 'af-' + f.k, cls = 'a-field' + (f.full ? ' full' : ''), inner;
    if (v == null) v = f.def == null ? '' : f.def;
    if (f.t === 'textarea') inner = '<textarea id="' + id + '" name="' + f.k + '" rows="3">' + esc(v) + '</textarea>';
    else if (f.t === 'select') inner = '<select id="' + id + '" name="' + f.k + '">' + f.opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(v) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>';
    else if (f.t === 'checkbox') inner = '<label class="a-check"><input type="checkbox" id="' + id + '" name="' + f.k + '"' + (v ? ' checked' : '') + '><span>' + (f.hint || 'بله') + '</span></label>';
    else if (f.t === 'checks') inner = '<div class="a-checks">' + f.opts.map(function (o) { return '<label class="a-check"><input type="checkbox" name="' + f.k + '" value="' + esc(o[0]) + '"' + ((v || []).indexOf(o[0]) > -1 ? ' checked' : '') + '><span>' + esc(o[1]) + '</span></label>'; }).join('') + '</div>';
    else if (f.t === 'color') inner = '<input type="color" id="' + id + '" name="' + f.k + '" value="' + esc(v || '#ffffff') + '">';
    else if (f.t === 'datetime') { var dt = new Date(v || Date.now()), loc = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16); inner = '<input type="datetime-local" id="' + id + '" name="' + f.k + '" value="' + loc + '">'; }
    else if (f.t === 'image') inner = '<div class="a-img"><span class="a-th big" id="' + id + '-prev">' + (v ? '<img src="' + esc(v) + '" alt="">' : ic('image')) + '</span><div><label class="btn btn-g btn-sm" style="cursor:pointer">انتخاب عکس<input type="file" accept="image/*" data-c="img" data-target="' + id + '" hidden></label> <button type="button" class="btn btn-g btn-sm" data-a="imgclear" data-target="' + id + '">بدون عکس</button><input type="hidden" id="' + id + '" name="' + f.k + '" value="' + esc(v) + '"><p class="a-muted" style="font-size:12.5px;margin-top:6px">' + (f.hint || 'اگر عکس نگذارید، تصویر نقاشی‌شده نمایش داده می‌شود.') + '</p></div></div>';
    else if (f.t === 'items') inner = '<div id="items-ed"></div><button type="button" class="btn btn-g btn-sm" data-a="itemadd">' + ic('plus') + 'افزودن گل</button>';
    else inner = '<input type="' + (f.t || 'text') + '" id="' + id + '" name="' + f.k + '" value="' + esc(v) + '"' + (f.min != null ? ' min="' + f.min + '"' : '') + (f.max != null ? ' max="' + f.max + '"' : '') + (f.step ? ' step="' + f.step + '"' : '') + (f.ltr ? ' dir="ltr"' : '') + (f.ph ? ' placeholder="' + f.ph + '"' : '') + (f.req ? ' required' : '') + '>';
    return '<div class="' + cls + '"><label' + (f.t === 'checks' || f.t === 'items' || f.t === 'image' ? '' : ' for="' + id + '"') + '>' + f.l + '</label>' + inner + '</div>';
  }
  function collect(form, fields) {
    var o = {};
    fields.forEach(function (f) {
      if (f.t === 'items') return;
      if (f.t === 'checks') { o[f.k] = Array.prototype.map.call(form.querySelectorAll('input[name="' + f.k + '"]:checked'), function (e) { return e.value; }); return; }
      var el = form.elements[f.k]; if (!el) return;
      if (f.t === 'checkbox') o[f.k] = el.checked; else if (f.t === 'number') o[f.k] = +el.value || 0; else if (f.t === 'datetime') o[f.k] = new Date(el.value).getTime() || Date.now(); else o[f.k] = el.value.trim ? el.value.trim() : el.value;
    });
    return o;
  }
  var formCtx = null, itemsState = [];
  function modal(title, body) {
    var m = $('#a-modal'); m.innerHTML = '<div class="modal-box a-modal"><button class="icon-btn modal-x" data-a="mclose" aria-label="بستن">' + ic('x') + '</button><h2>' + title + '</h2>' + body + '</div>'; m.classList.add('on'); $('#a-ovl').classList.add('on');
  }
  function mclose() { $('#a-modal').classList.remove('on'); $('#a-ovl').classList.remove('on'); formCtx = null; }
  function openForm(o) {
    formCtx = o;
    modal(o.title, '<form data-f="modal" class="a-form">' + (o.preview ? '<div class="a-prev arch" id="a-prev"></div>' : '') + '<div class="a-fields">' + o.fields.map(function (f) { return fldHTML(f, o.value[f.k]); }).join('') + '</div><div class="a-acts" style="justify-content:flex-start;margin-top:6px"><button class="btn" type="submit">ذخیره</button><button class="btn btn-g" type="button" data-a="mclose">انصراف</button></div></form>');
    if (o.fields.some(function (f) { return f.t === 'items'; })) { itemsState = (o.value.items || []).map(function (i) { return { f: i.f, n: i.n }; }); itemsRender(); }
    preview();
  }
  function itemsRender() {
    var el = $('#items-ed'); if (!el) return; var fl = D().flowers;
    el.innerHTML = itemsState.map(function (it, i) { return '<div class="item-row"><select data-c="itemf" data-i="' + i + '" aria-label="گل">' + fl.map(function (f) { return '<option value="' + f.id + '"' + (f.id === it.f ? ' selected' : '') + '>' + esc(f.name) + '</option>'; }).join('') + '</select><input type="number" min="1" max="60" value="' + it.n + '" data-c="itemn" data-i="' + i + '" aria-label="تعداد شاخه"><span class="a-muted">شاخه</span><button type="button" class="a-ib del" data-a="itemdel" data-i="' + i + '" aria-label="حذف گل">' + ic('trash') + '</button></div>'; }).join('') || '<p class="a-muted">هنوز گلی اضافه نشده است.</p>';
    var cost = itemsState.reduce(function (s, it) { var f = Q.flower(it.f); return s + (f ? f.price * it.n : 0); }, 0);
    el.insertAdjacentHTML('beforeend', '<p class="a-muted" style="font-size:13px">جمع قیمت شاخه‌ها: <b class="num">' + fmt(cost) + '</b> تومان</p>');
  }
  function preview() {
    var el = $('#a-prev'); if (!el || !formCtx) return; var form = el.closest('form'), v = collect(form, formCtx.fields);
    if (formCtx.preview === 'bouquet') {
      var its = itemsState.map(function (it) { var f = Q.flower(it.f); return f ? { kind: f.kind, color: f.color, c2: f.c2, n: it.n } : null; }).filter(Boolean);
      el.style.background = UI.tile(formCtx.value.id || 'new');
      el.innerHTML = v.img ? '<img class="photo" src="' + esc(v.img) + '" alt="">' : Flora.bouquet(its, { seed: formCtx.value.id || 'new', wrap: v.wrap });
    } else {
      el.style.background = UI.tile(formCtx.value.id || 'new');
      el.innerHTML = v.img ? '<img class="photo" src="' + esc(v.img) + '" alt="">' : Flora.single({ kind: v.kind, color: v.color, c2: v.useC2 ? v.c2 : '', name: v.name, id: formCtx.value.id || 'new' });
    }
  }

  /* تعریف فرم هر چیز */
  function schema(kind, item) {
    var d = D();
    if (kind === 'bouquet') return {
      title: item ? 'ویرایش ' + item.name : 'دسته‌گل تازه', preview: 'bouquet', list: d.bouquets, prefix: 'b',
      value: item || { name: '', desc: '', price: 1500000, discount: 0, stock: 10, style: 's1', cats: [], wrap: '#f6d9c2', items: [], img: '', featured: false, active: true, created: Date.now() },
      fields: [{ k: 'name', l: 'نام دسته‌گل', t: 'text', req: 1 }, { k: 'price', l: 'قیمت اندازه‌ی معمولی (تومان)', t: 'number', min: 0, step: 10000 }, { k: 'desc', l: 'توضیح کوتاه', t: 'textarea', full: 1 },
      { k: 'items', l: 'گل‌های این دسته‌گل', t: 'items', full: 1 }, { k: 'wrap', l: 'رنگ کاغذ', t: 'color' }, { k: 'style', l: 'نوع', t: 'select', opts: d.cats.filter(function (c) { return c.type === 'style'; }).map(function (c) { return [c.id, c.name]; }) },
      { k: 'cats', l: 'مناسبت‌ها', t: 'checks', full: 1, opts: d.cats.filter(function (c) { return c.type === 'occasion'; }).map(function (c) { return [c.id, c.name]; }) },
      { k: 'discount', l: 'تخفیف ٪', t: 'number', min: 0, max: 90 }, { k: 'stock', l: 'موجودی امروز', t: 'number', min: 0 }, { k: 'img', l: 'عکس واقعی (اختیاری)', t: 'image', full: 1 },
      { k: 'featured', l: 'پیشنهاد ویژه', t: 'checkbox', hint: 'در صفحه‌ی اول نمایش بده' }, { k: 'active', l: 'وضعیت', t: 'checkbox', hint: 'در فروشگاه دیده شود' }],
      after: function (o) { o.items = itemsState.filter(function (i) { return i.n > 0; }); if (!o.items.length) { toast('دست‌کم یک گل به دسته‌گل اضافه کنید.', true); return false; } }
    };
    if (kind === 'flower') return {
      title: item ? 'ویرایش ' + item.name : 'گل تازه', preview: 'flower', list: d.flowers, prefix: 'f',
      value: item ? Object.assign({ useC2: !!item.c2 }, item, { c2: item.c2 || '#f6b21b' }) : { name: '', kind: 'rose', color: '#e0457b', c2: '#f6b21b', useC2: false, colorName: 'صورتی', price: 80000, discount: 0, stock: 100, season: 'همه‌ی سال', meaning: '', care: '', life: 7, img: '', active: true },
      fields: [{ k: 'name', l: 'نام گل', t: 'text', req: 1 }, { k: 'price', l: 'قیمت هر شاخه (تومان)', t: 'number', min: 0, step: 1000 }, { k: 'kind', l: 'شکل گل (برای نقاشی)', t: 'select', opts: Flora.kinds.map(function (k) { return [k, Flora.kindLabels[k]]; }) },
      { k: 'color', l: 'رنگ گلبرگ', t: 'color' }, { k: 'useC2', l: 'رنگ دوم', t: 'checkbox', hint: 'مرکز یا لبه رنگ جدا دارد' }, { k: 'c2', l: 'رنگ مرکز', t: 'color' },
      { k: 'colorName', l: 'نام رنگ (برای فیلتر)', t: 'select', opts: ['قرمز', 'صورتی', 'سفید', 'زرد', 'نارنجی', 'بنفش', 'آبی', 'سبز'].map(function (c) { return [c, c]; }) }, { k: 'stock', l: 'موجودی (شاخه)', t: 'number', min: 0 },
      { k: 'discount', l: 'تخفیف ٪', t: 'number', min: 0, max: 90 }, { k: 'life', l: 'ماندگاری (روز)', t: 'number', min: 1 }, { k: 'season', l: 'فصل', t: 'text' }, { k: 'meaning', l: 'معنی گل', t: 'text' }, { k: 'care', l: 'نکته‌ی نگهداری', t: 'textarea', full: 1 },
      { k: 'img', l: 'عکس واقعی (اختیاری)', t: 'image', full: 1 }, { k: 'active', l: 'وضعیت', t: 'checkbox', hint: 'در فروشگاه دیده شود' }],
      after: function (o) { if (!o.useC2) o.c2 = ''; delete o.useC2; }
    };
    if (kind === 'cat') return { title: item ? 'ویرایش دسته' : 'دسته‌ی تازه', list: d.cats, prefix: 'k', value: item || { name: '', type: 'occasion', tone: '#e0457b', active: true }, fields: [{ k: 'name', l: 'نام', t: 'text', req: 1 }, { k: 'type', l: 'گروه', t: 'select', opts: [['occasion', 'مناسبت'], ['style', 'نوع بسته‌بندی']] }, { k: 'tone', l: 'رنگ نشانه', t: 'color' }, { k: 'active', l: 'وضعیت', t: 'checkbox', hint: 'نمایش در فروشگاه' }] };
    if (kind === 'coupon') return {
      title: item ? 'ویرایش کد' : 'کد تخفیف تازه', list: d.coupons, prefix: 'c', value: item || { code: '', type: 'percent', value: 10, min: 0, expires: Date.now() + 14 * DAY, limit: 100, used: 0, active: true, note: '' },
      fields: [{ k: 'code', l: 'کد (حروف انگلیسی)', t: 'text', ltr: 1, req: 1 }, { k: 'type', l: 'نوع', t: 'select', opts: [['percent', 'درصدی'], ['fixed', 'مبلغ ثابت (تومان)']] }, { k: 'value', l: 'مقدار', t: 'number', min: 1 }, { k: 'min', l: 'حداقل خرید (تومان)', t: 'number', min: 0, step: 50000 }, { k: 'expires', l: 'انقضا', t: 'datetime' }, { k: 'limit', l: 'سقف تعداد استفاده', t: 'number', min: 0 }, { k: 'note', l: 'یادداشت', t: 'text', full: 1 }, { k: 'active', l: 'وضعیت', t: 'checkbox', hint: 'فعال' }],
      after: function (o) { o.code = o.code.toUpperCase().replace(/\s/g, ''); if (!o.code) { toast('کد را بنویسید.', true); return false; } }
    };
    if (kind === 'post') return { title: item ? 'ویرایش پست' : 'پست تازه', list: d.insta.posts, prefix: 'i', value: item || { caption: '', bid: d.bouquets[0] ? d.bouquets[0].id : '', img: '', link: '', likes: 0 }, fields: [{ k: 'caption', l: 'کپشن کوتاه', t: 'text', req: 1, full: 1 }, { k: 'bid', l: 'وصل به کدام دسته‌گل؟', t: 'select', opts: [['', 'هیچ‌کدام']].concat(d.bouquets.map(function (b) { return [b.id, b.name]; })) }, { k: 'likes', l: 'تعداد لایک', t: 'number', min: 0 }, { k: 'link', l: 'لینک پست در اینستاگرام', t: 'text', ltr: 1, full: 1, ph: 'https://instagram.com/p/…' }, { k: 'img', l: 'عکس پست', t: 'image', full: 1, hint: 'اگر عکس نگذارید، تصویر دسته‌گلِ وصل‌شده نمایش داده می‌شود.' }] };
    if (kind === 'zone') return { title: item ? 'ویرایش محله' : 'محله‌ی تازه', list: d.settings.zones, prefix: 'z', value: item || { name: '', fee: 100000 }, fields: [{ k: 'name', l: 'نام محله‌ها', t: 'text', req: 1, full: 1 }, { k: 'fee', l: 'هزینه‌ی ارسال (تومان؛ صفر یعنی رایگان)', t: 'number', min: 0, step: 10000 }] };
    if (kind === 'addon') return { title: item ? 'ویرایش افزودنی' : 'افزودنی تازه', list: d.addons, prefix: 'a', value: item || { name: '', price: 200000, active: true }, fields: [{ k: 'name', l: 'نام', t: 'text', req: 1 }, { k: 'price', l: 'قیمت (تومان)', t: 'number', min: 0, step: 10000 }, { k: 'active', l: 'وضعیت', t: 'checkbox', hint: 'نمایش هنگام خرید' }] };
    if (kind === 'review') return { list: d.reviews };
    if (kind === 'request') return { list: d.requests };
    return null;
  }

  /* ================= رویدادها ================= */
  function find(kind, id) { var s = schema(kind); return s ? s.list.find(function (x) { return x.id === id; }) : null; }
  function toggle(list, id, key, msgOn, msgOff) { var x = list.find(function (i) { return i.id === id; }); if (!x) return; x[key] = !x[key]; save(x[key] ? msgOn : msgOff); paint(); }
  var A = {
    mclose: mclose,
    logout: function () { authed = false; try { sessionStorage.removeItem('niloofar_admin'); } catch (e) { } paint(); },
    nav: function () { $('#a-side').classList.toggle('on'); },
    new: function (el) { var s = schema(el.dataset.k); if (el.dataset.t) s.value.type = el.dataset.t; s.kind = el.dataset.k; openForm(s); },
    edit: function (el) { var it = find(el.dataset.k, el.dataset.id); if (!it) return; var s = schema(el.dataset.k, it); s.kind = el.dataset.k; s.editing = it; openForm(s); },
    del: function (el) {
      if (!el.classList.contains('sure')) { el.classList.add('sure'); el.innerHTML = 'حذف شود؟'; setTimeout(function () { if (el.isConnected) { el.classList.remove('sure'); el.innerHTML = ic('trash'); } }, 3000); return; }
      var s = schema(el.dataset.k), i = s.list.findIndex(function (x) { return x.id === el.dataset.id; }); if (i < 0) return;
      if (el.dataset.k === 'flower' && Q.bouquetsWith(el.dataset.id).length) { toast('این گل در چند دسته‌گل به کار رفته؛ اول از آن‌ها برش دارید یا فقط نمایشش را خاموش کنید.', true); paint(); return; }
      if (el.dataset.k === 'zone' && s.list.length < 2) { toast('دست‌کم یک محله باید بماند.', true); paint(); return; }
      s.list.splice(i, 1); save('حذف شد'); paint();
    },
    feat: function (el) { toggle(D().bouquets, el.dataset.id, 'featured', 'به پیشنهادها اضافه شد', 'از پیشنهادها برداشته شد'); },
    actB: function (el) { toggle(D().bouquets, el.dataset.id, 'active', 'در فروشگاه نمایش داده می‌شود', 'از فروشگاه پنهان شد'); },
    actF: function (el) { toggle(D().flowers, el.dataset.id, 'active', 'در فروشگاه نمایش داده می‌شود', 'از فروشگاه پنهان شد'); },
    actC: function (el) { toggle(D().cats, el.dataset.id, 'active', 'نمایش داده می‌شود', 'پنهان شد'); },
    actCp: function (el) { toggle(D().coupons, el.dataset.id, 'active', 'کد فعال شد', 'کد غیرفعال شد'); },
    actR: function (el) { toggle(D().reviews, el.dataset.id, 'approved', 'نظر تأیید شد', 'نظر پنهان شد'); },
    actQ: function (el) { toggle(D().requests, el.dataset.id, 'done', 'پیگیری‌شده علامت خورد', 'به درخواست‌های باز برگشت'); },
    actA: function (el) { toggle(D().addons, el.dataset.id, 'active', 'نمایش داده می‌شود', 'پنهان شد'); },
    offerOn: function () { var o = D().settings.offer; o.on = !o.on; save(o.on ? 'پیشنهاد زمان‌دار روشن شد' : 'پیشنهاد زمان‌دار خاموش شد'); paint(); },
    instaOn: function () { var i = D().insta; i.enabled = !i.enabled; save(i.enabled ? 'بخش اینستاگرام در سایت نمایش داده می‌شود' : 'بخش اینستاگرام پنهان شد'); paint(); },
    order: function (el) { orderModal(el.dataset.id); },
    ostatus: function (el) { var o = D().orders.find(function (x) { return x.id === el.dataset.id; }); o.status = el.dataset.v; save('وضعیت سفارش: ' + ST[o.status][0]); paint(); orderModal(o.id); },
    itemadd: function () { var fl = D().flowers, used = itemsState.map(function (i) { return i.f; }), nx = fl.find(function (f) { return used.indexOf(f.id) < 0; }) || fl[0]; itemsState.push({ f: nx.id, n: 5 }); itemsRender(); preview(); },
    itemdel: function (el) { itemsState.splice(+el.dataset.i, 1); itemsRender(); preview(); },
    imgclear: function (el) { var t = el.dataset.target; document.getElementById(t).value = ''; document.getElementById(t + '-prev').innerHTML = ic('image'); preview(); },
    backup: function () {
      var blob = new Blob([DB.exportJSON()], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'niloofar-backup.json'; document.body.appendChild(a); a.click(); a.remove(); toast('فایل پشتیبان ساخته شد');
    },
    reset: function (el) {
      if (!el.classList.contains('sure')) { el.classList.add('sure'); el.textContent = 'همه‌ی تغییرها پاک شود؟'; setTimeout(function () { if (el.isConnected) { el.classList.remove('sure'); el.textContent = 'برگرداندن داده‌های نمونه'; } }, 3500); return; }
      DB.reset(); toast('داده‌های نمونه برگشت'); paint();
    }
  };
  var C = {
    stock: function (el) { var it = find(el.dataset.k, el.dataset.id); it.stock = Math.max(0, +el.value || 0); save('موجودی ذخیره شد'); },
    price: function (el) { var it = find(el.dataset.k, el.dataset.id); it.price = Math.max(0, +el.value || 0); save('قیمت ذخیره شد'); },
    discount: function (el) { var it = find(el.dataset.k, el.dataset.id); it.discount = Math.max(0, Math.min(90, +el.value || 0)); el.value = it.discount; save('تخفیف ذخیره شد'); var a = document.getElementById('after-' + it.id); if (a) a.textContent = fmt(Q.priceOf(it, true, 0).final); },
    planPrice: function (el) { var p = D().settings.plans.find(function (x) { return x.id === el.dataset.id; }); p.price = +el.value || 0; save('قیمت اشتراک ذخیره شد'); },
    osearch: function (el) { oq = el.value.trim(); paint(); },
    itemf: function (el) { itemsState[+el.dataset.i].f = el.value; itemsRender(); preview(); },
    itemn: function (el) { itemsState[+el.dataset.i].n = Math.max(1, +el.value || 1); itemsRender(); preview(); },
    img: function (el) { var f = el.files[0]; if (!f) return; UI.readImage(f, function (url) { var t = el.dataset.target; document.getElementById(t).value = url; document.getElementById(t + '-prev').innerHTML = '<img src="' + url + '" alt="">'; preview(); }); },
    restore: function (el) { var f = el.files[0]; if (!f) return; var fr = new FileReader(); fr.onload = function () { try { DB.importJSON(fr.result); toast('داده‌ها بازگردانی شد'); paint(); } catch (e) { toast('این فایل، پشتیبانِ این فروشگاه نیست.', true); } }; fr.readAsText(f); }
  };
  var FM = {
    login: function (f) { if (f.elements.pass.value === D().settings.adminPass) { authed = true; try { sessionStorage.setItem('niloofar_admin', '1'); } catch (e) { } paint(); } else { $('#login-msg').hidden = false; f.elements.pass.select(); } },
    modal: function (f) {
      var s = formCtx, o = collect(f, s.fields); if (!o.name && !o.code && !o.caption) { toast('نام را بنویسید.', true); return; }
      if (s.after && s.after(o) === false) return;
      if (s.editing) Object.assign(s.editing, o); else { o.id = DB.uid(s.prefix); if (s.value.created) o.created = Date.now(); if (s.kind === 'coupon') o.used = 0; s.list.push(o); }
      if (save('ذخیره شد')) { mclose(); paint(); }
    },
    offer: function (f) { var o = collect(f, [{ k: 'title' }, { k: 'percent', t: 'number' }, { k: 'ends', t: 'datetime' }, { k: 'ids', t: 'checks' }]); Object.assign(D().settings.offer, o); save('پیشنهاد زمان‌دار ذخیره شد'); paint(); },
    front: function (f) { Object.assign(D().settings, collect(f, [{ k: 'heroTitle' }, { k: 'heroText' }, { k: 'heroBouquet' }, { k: 'announceOn', t: 'checkbox' }, { k: 'announcement' }])); save('ویترین ذخیره شد'); },
    insta: function (f) { var o = collect(f, [{ k: 'handle' }, { k: 'title' }, { k: 'token' }]); o.handle = o.handle.replace(/^@/, ''); Object.assign(D().insta, o); save('تنظیمات اینستاگرام ذخیره شد'); },
    rules: function (f) { var o = collect(f, [{ k: 'cutoff', t: 'number' }, { k: 'freeMin', t: 'number' }, { k: 'slots' }]); o.slots = o.slots.split('\n').map(function (x) { return x.trim(); }).filter(Boolean); if (!o.slots.length) { toast('دست‌کم یک بازه‌ی تحویل بنویسید.', true); return; } Object.assign(D().settings, o); save('قواعد تحویل ذخیره شد'); },
    store: function (f) { var o = collect(f, [{ k: 'name' }, { k: 'tagline' }, { k: 'phone' }, { k: 'mobile' }, { k: 'address' }, { k: 'hours' }, { k: 'adminPass' }, { k: 'usePhotos', t: 'checkbox' }]); if (!o.adminPass) { toast('رمز نمی‌تواند خالی باشد.', true); return; } Object.assign(D().settings, o); save('مشخصات فروشگاه ذخیره شد'); }
  };
  var bound = false;
  function bind() {
    if (bound) return; bound = true;
    document.addEventListener('click', function (ev) { if (!document.body.classList.contains('is-admin')) return; var el = ev.target.closest('[data-a]'); if (el && A[el.dataset.a]) { A[el.dataset.a](el, ev); } });
    document.addEventListener('change', function (ev) { if (!document.body.classList.contains('is-admin')) return; var el = ev.target.closest('[data-c]'); if (el && C[el.dataset.c]) C[el.dataset.c](el); else if (formCtx && ev.target.closest('#a-modal')) preview(); });
    document.addEventListener('input', function (ev) { if (formCtx && formCtx.preview && ev.target.type === 'color') preview(); });
    document.addEventListener('submit', function (ev) { if (!document.body.classList.contains('is-admin')) return; var f = ev.target.closest('[data-f]'); if (f) { ev.preventDefault(); FM[f.dataset.f](f); } });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && document.body.classList.contains('is-admin') && $('#a-modal')) mclose(); });
  }

  function paint() {
    var d = D();
    if (!authed) {
      root.innerHTML = '<div class="a-login"><form class="a-card" data-f="login"><div class="a-login-art">' + Flora.bouquet([{ kind: 'narenj', color: '#ffffff', c2: '#f2952b', n: 3 }, { kind: 'rose', color: '#f4a6c0', n: 4 }, { kind: 'peony', color: '#f6b8c8', n: 2 }], { seed: 'login', wrap: '#fbe1ea' }) + '</div><h1>پنل مدیریت ' + esc(d.settings.name) + '</h1><p class="a-muted">برای ورود، رمز فروشگاه را بنویسید.</p><div class="a-field"><label for="a-pass">رمز</label><input id="a-pass" name="pass" type="password" dir="ltr" autocomplete="current-password" autofocus></div><p id="login-msg" class="down" hidden>رمز درست نیست. دوباره امتحان کنید.</p><button class="btn btn-block" type="submit">ورود</button><p class="a-hint">نسخه‌ی نمایشی · رمز: <b dir="ltr">' + esc(d.settings.adminPass) + '</b></p><a class="link" href="#/" style="align-self:center">بازگشت به فروشگاه</a></form></div>';
      return;
    }
    var newO = d.orders.filter(function (o) { return o.status === 'new'; }).length, newR = d.reviews.filter(function (r) { return !r.approved; }).length, newQ = d.requests.filter(function (r) { return !r.done; }).length;
    root.innerHTML = '<div class="a-shell"><aside class="a-side" id="a-side"><a class="logo" href="#/admin"><span class="logo-name">' + esc(d.settings.name) + '</span><span class="a-tag">مدیریت</span></a><nav>' +
      MENU.map(function (m) { var n = m[0] === 'orders' ? newO : m[0] === 'reviews' ? newR : m[0] === 'requests' ? newQ : 0; return '<a href="#/admin/' + m[0] + '" class="' + (cur === m[0] ? 'on' : '') + '">' + ic(m[2]) + '<span>' + m[1] + '</span>' + (n ? '<b class="num">' + fa(n) + '</b>' : '') + '</a>'; }).join('') +
      '</nav><div class="a-side-f"><a href="#/">' + ic('eye') + '<span>دیدن فروشگاه</span></a><button data-a="logout">' + ic('out') + '<span>خروج</span></button></div></aside>' +
      '<div class="a-main"><div class="a-top"><button class="icon-btn" data-a="nav" aria-label="فهرست">' + ic('menu') + '</button><b>' + (MENU.find(function (m) { return m[0] === cur; }) || MENU[0])[1] + '</b><a class="btn btn-g btn-sm" href="#/">فروشگاه</a></div><div class="a-content">' + (PAGES[cur] || dash)() + '</div></div></div>' +
      '<div class="ovl" id="a-ovl" data-a="mclose"></div><div class="modal" id="a-modal" role="dialog" aria-modal="true"></div>';
    if (window.FX) FX.refresh();
  }
  window.Admin = {
    render: function (parts, el) { root = el; cur = PAGES[parts[0]] ? parts[0] : 'dash'; sub = parts[1] || ''; bind(); paint(); document.title = 'مدیریت | گل‌فروشی ' + D().settings.name; }
  };
})();
