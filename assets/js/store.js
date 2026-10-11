/* ============================================================
   store.js — داده‌ها
   همه‌چیز (گل‌ها، دسته‌گل‌ها، سفارش‌ها، تنظیمات) در localStorage مرورگر
   ذخیره می‌شود. برای وصل کردن به بک‌اند واقعی فقط همین فایل را
   عوض کنید: DB.load و DB.save را به API خودتان وصل کنید.
   ============================================================ */
(function () {
  'use strict';
  var KEY = 'niloofar_db_v1';
  var DAY = 86400000;

  /* ---------- داده‌ی اولیه‌ی دمو ---------- */
  function seed() {
    var now = Date.now();
    var flowers = [
      { id: 'f1', name: 'رز هلندی قرمز', kind: 'rose', color: '#c8102e', colorName: 'قرمز', price: 95000, stock: 240, season: 'همه‌ی سال', meaning: 'عشق عمیق و بی‌پرده', care: 'ساقه را اریب ببُرید و هر دو روز آب گلدان را عوض کنید. از نور مستقیم دور نگه دارید.', life: 7 },
      { id: 'f2', name: 'رز صورتی', kind: 'rose', color: '#f4a6c0', colorName: 'صورتی', price: 90000, stock: 180, season: 'همه‌ی سال', meaning: 'قدردانی و مهربانی', care: 'برگ‌های زیر سطح آب را جدا کنید تا آب دیرتر کدر شود.', life: 7 },
      { id: 'f3', name: 'رز سفید', kind: 'rose', color: '#fbf6ee', colorName: 'سفید', price: 90000, stock: 150, season: 'همه‌ی سال', meaning: 'پاکی و شروع تازه', care: 'آب خنک و تمیز؛ کمی دور از میوه‌ها نگه دارید.', life: 7 },
      { id: 'f4', name: 'گل محمدی', kind: 'damask', color: '#f27fa5', colorName: 'صورتی', price: 70000, stock: 90, season: 'اردیبهشت و خرداد', meaning: 'عشق کهن ایرانی', care: 'عمر کوتاه‌تری دارد؛ در جای خنک نگه دارید و از عطرش لذت ببرید.', life: 4 },
      { id: 'f5', name: 'نرگس شیراز', kind: 'narcissus', color: '#fffdf2', c2: '#f6b21b', colorName: 'سفید', price: 45000, stock: 300, season: 'آذر تا اسفند', meaning: 'امید و چشم‌به‌راهی', care: 'آب کم و خنک کافی است. با گل‌های دیگر در یک گلدان نگذارید؛ شیره‌اش عمرشان را کم می‌کند.', life: 6 },
      { id: 'f6', name: 'لاله نارنجی', kind: 'tulip', color: '#f47b2a', colorName: 'نارنجی', price: 110000, stock: 120, season: 'بهمن تا اردیبهشت', meaning: 'شور و گرمی', care: 'لاله در گلدان هم قد می‌کشد؛ هر دو روز یک سانت از ساقه کوتاه کنید.', life: 6 },
      { id: 'f7', name: 'لیلیوم صورتی', kind: 'lily', color: '#f7c6d9', c2: '#b0356e', colorName: 'صورتی', price: 180000, stock: 70, season: 'همه‌ی سال', meaning: 'شکوه و احترام', care: 'پرچم‌های قهوه‌ای را جدا کنید تا گرده روی گلبرگ و لباس نریزد.', life: 10 },
      { id: 'f8', name: 'ارکیده فالانوپسیس', kind: 'orchid', color: '#ffffff', c2: '#c2338b', colorName: 'سفید', price: 480000, stock: 35, season: 'همه‌ی سال', meaning: 'زیبایی کمیاب', care: 'هفته‌ای یک بار آب ولرم؛ نور غیرمستقیم پشت پنجره.', life: 21 },
      { id: 'f9', name: 'ژربرا نارنجی', kind: 'daisy', color: '#ff7a45', c2: '#3a2416', colorName: 'نارنجی', price: 60000, stock: 200, season: 'همه‌ی سال', meaning: 'شادی بی‌دلیل', care: 'آب گلدان کم باشد (حدود ۵ سانت) تا ساقه نرم نشود.', life: 8 },
      { id: 'f10', name: 'آفتابگردان', kind: 'sunflower', color: '#f6b61c', colorName: 'زرد', price: 120000, stock: 80, season: 'خرداد تا مهر', meaning: 'وفاداری و روشنایی', care: 'آب زیاد می‌خورد؛ گلدان را هر روز پر کنید.', life: 8 },
      { id: 'f11', name: 'داوودی زرد', kind: 'chrys', color: '#f2d34b', colorName: 'زرد', price: 55000, stock: 160, season: 'مهر تا دی', meaning: 'دوستی دیرینه', care: 'یکی از پرعمرترین گل‌های شاخه‌بریده است؛ فقط آب را تمیز نگه دارید.', life: 14 },
      { id: 'f12', name: 'میخک سرخابی', kind: 'carnation', color: '#e84c7a', colorName: 'صورتی', price: 40000, stock: 260, season: 'همه‌ی سال', meaning: 'دلبستگی', care: 'ساقه را از بالای گره ببُرید تا بهتر آب بکشد.', life: 12 },
      { id: 'f13', name: 'هورتانسیا آبی', kind: 'hydrangea', color: '#8fa8e8', colorName: 'آبی', price: 320000, stock: 40, season: 'اردیبهشت تا شهریور', meaning: 'سپاس از ته دل', care: 'اگر پژمرد، کل گل را ۳۰ دقیقه در آب خنک غرق کنید تا برگردد.', life: 7 },
      { id: 'f14', name: 'لیسیانتوس بنفش', kind: 'lisianthus', color: '#b79ae0', colorName: 'بنفش', price: 85000, stock: 110, season: 'همه‌ی سال', meaning: 'قدرشناسی آرام', care: 'غنچه‌های بسته هم باز می‌شوند؛ گل‌های پژمرده را جدا کنید.', life: 10 },
      { id: 'f15', name: 'پیونی (گل صدتومانی)', kind: 'peony', color: '#f6b8c8', colorName: 'صورتی', price: 390000, stock: 30, season: 'اردیبهشت و خرداد', meaning: 'خوشبختی و برکت', care: 'غنچه را با آب ولرم باز کنید و از گرما دور نگه دارید.', life: 6 },
      { id: 'f16', name: 'آنمون سفید', kind: 'anemone', color: '#ffffff', c2: '#1d1830', colorName: 'سفید', price: 75000, stock: 60, season: 'دی تا فروردین', meaning: 'انتظار شیرین', care: 'به سرما علاقه دارد؛ شب‌ها جای خنک‌تری بگذارید.', life: 6 },
      { id: 'f17', name: 'گل مریم', kind: 'tuberose', color: '#fffef5', colorName: 'سفید', price: 65000, stock: 140, season: 'همه‌ی سال', meaning: 'پاکی و آرامش', care: 'عطرش شب‌ها بیشتر می‌شود؛ غنچه‌های پایین را که خشک شدند جدا کنید.', life: 9 },
      { id: 'f18', name: 'عروس (ژیپسوفیلا)', kind: 'gypsophila', color: '#ffffff', colorName: 'سفید', price: 50000, stock: 150, season: 'همه‌ی سال', meaning: 'عشق همیشگی', care: 'خشک‌شده‌اش هم زیباست؛ وارونه در جای تاریک آویزان کنید.', life: 12 },
      { id: 'f19', name: 'اکالیپتوس', kind: 'eucalyptus', color: '#7fa695', colorName: 'سبز', price: 55000, stock: 120, season: 'همه‌ی سال', meaning: 'تازگی و سلامت', care: 'بدون آب هم خشک و ماندگار می‌شود.', life: 20 },
      { id: 'f20', name: 'شاخه‌ی بهارنارنج', kind: 'narenj', color: '#ffffff', c2: '#f2952b', colorName: 'سفید', price: 85000, stock: 50, season: 'فروردین و اردیبهشت', meaning: 'عطر شیراز', care: 'شاخه را در آب خنک بگذارید؛ عطرش تا سه روز خانه را پر می‌کند.', life: 4 },
      { id: 'f21', name: 'آلسترومریا صورتی', kind: 'alstro', color: '#f59ab5', colorName: 'صورتی', price: 48000, stock: 170, season: 'همه‌ی سال', meaning: 'دوستی ماندگار', care: 'برگ‌ها زودتر از گل زرد می‌شوند؛ جدایشان کنید.', life: 12 },
      { id: 'f22', name: 'رانکلوس هلویی', kind: 'ranunculus', color: '#f8a15a', colorName: 'نارنجی', price: 98000, stock: 75, season: 'بهمن تا اردیبهشت', meaning: 'تو دلربایی', care: 'ساقه‌ی توخالی دارد؛ آب کم و تمیز بهترین است.', life: 6 }
    ];
    flowers.forEach(function (f) { f.active = true; f.discount = 0; f.img = ''; });

    var cats = [
      { id: 'o1', type: 'occasion', name: 'تولد', active: true, tone: '#ff7a45' },
      { id: 'o2', type: 'occasion', name: 'عاشقانه و سالگرد', active: true, tone: '#c8102e' },
      { id: 'o3', type: 'occasion', name: 'تبریک و قدردانی', active: true, tone: '#f6b61c' },
      { id: 'o4', type: 'occasion', name: 'عیادت', active: true, tone: '#8fa8e8' },
      { id: 'o5', type: 'occasion', name: 'قدم نورسیده', active: true, tone: '#f4a6c0' },
      { id: 'o6', type: 'occasion', name: 'خواستگاری و عروسی', active: true, tone: '#b79ae0' },
      { id: 'o7', type: 'occasion', name: 'تسلیت', active: true, tone: '#9cc0a4' },
      { id: 'o8', type: 'occasion', name: 'افتتاحیه', active: true, tone: '#f47b2a' },
      { id: 'o9', type: 'occasion', name: 'بی‌بهانه', active: true, tone: '#e84c7a' },
      { id: 's1', type: 'style', name: 'دسته‌گل', active: true },
      { id: 's2', type: 'style', name: 'باکس گل', active: true },
      { id: 's3', type: 'style', name: 'سبد گل', active: true },
      { id: 's4', type: 'style', name: 'گل عروس', active: true }
    ];

    function B(id, name, desc, items, wrap, price, cats, style, extra) {
      var o = { id: id, name: name, desc: desc, items: items, wrap: wrap, price: price, cats: cats, style: style, discount: 0, featured: false, stock: 12, active: true, img: '', created: now - Math.round(Math.random() * 60) * DAY };
      for (var k in (extra || {})) o[k] = extra[k];
      return o;
    }
    function I(f, n) { return { f: f, n: n }; }
    var bouquets = [
      B('b1', 'شب شیراز', 'پانزده رز هلندی قرمز با عروس و اکالیپتوس، در کاغذ مشکی مات.', [I('f1', 15), I('f18', 3), I('f19', 3)], '#2b2b2b', 1890000, ['o2', 'o6'], 's1', { featured: true }),
      B('b2', 'باغ ارم', 'پیونی و رز صورتی و لیسیانتوس؛ همان‌قدر شلوغ و خوش‌رنگ که بهارِ باغ ارم.', [I('f15', 5), I('f2', 7), I('f14', 4), I('f19', 3)], '#f6d9c2', 3480000, ['o2', 'o3', 'o5'], 's1', { featured: true, discount: 10 }),
      B('b3', 'نرگس‌زار', 'پانزده شاخه نرگس شهلای شیراز، ساده و معطر.', [I('f5', 15), I('f19', 2)], '#dfe9d2', 890000, ['o9', 'o4', 'o3'], 's1', { featured: true }),
      B('b4', 'بهار نارنج', 'شاخه‌های بهارنارنج کنار رز سفید و مریم. بوی کوچه‌باغ‌های قصردشت.', [I('f20', 5), I('f3', 7), I('f17', 3)], '#ffffff', 1490000, ['o6', 'o3', 'o9'], 's1', { featured: true }),
      B('b5', 'آفتاب پاسداران', 'آفتابگردان و ژربرا و داوودی؛ برای روزی که باید روشن شود.', [I('f10', 5), I('f9', 4), I('f11', 3), I('f19', 2)], '#e9c9a0', 1290000, ['o1', 'o3', 'o8', 'o4'], 's1', {}),
      B('b6', 'حافظیه', 'هورتانسیا آبی، رز سفید، لیسیانتوس و آنمون. آرام مثل غروب حافظیه.', [I('f13', 3), I('f3', 6), I('f14', 5), I('f16', 3)], '#d6dcf5', 2650000, ['o3', 'o4', 'o6'], 's1', { featured: true }),
      B('b7', 'نصیرالملک', 'لاله، رانکلوس، میخک، ژربرا و آلسترومریا؛ رنگ‌های شیشه‌های مسجد صورتی.', [I('f6', 6), I('f22', 5), I('f12', 4), I('f9', 3), I('f21', 4)], '#fbe1ea', 1980000, ['o1', 'o9', 'o8'], 's1', { discount: 15 }),
      B('b8', 'عروس ارغوانی', 'ارکیده، لیلیوم و رز سفید برای دست عروس.', [I('f8', 3), I('f7', 3), I('f3', 5)], '#efe6f7', 2890000, ['o6'], 's4', {}),
      B('b9', 'سعدیه', 'گل محمدی و مریم؛ دسته‌گلی که اول بویش می‌رسد.', [I('f4', 9), I('f17', 3), I('f18', 3)], '#fbe1ea', 1150000, ['o2', 'o9'], 's1', {}),
      B('b10', 'تولدت مبارک', 'ژربرا، لاله و آلسترومریا با عروس.', [I('f9', 6), I('f6', 5), I('f21', 5), I('f18', 2)], '#fff3c4', 1420000, ['o1'], 's1', { discount: 5 }),
      B('b11', 'آرام', 'لیلیوم، داوودی و رز سفید برای همدردی.', [I('f7', 4), I('f11', 6), I('f3', 6), I('f19', 3)], '#ffffff', 1950000, ['o7'], 's3', {}),
      B('b12', 'قدم نورسیده', 'رز صورتی، هورتانسیا، لیسیانتوس و عروس.', [I('f2', 5), I('f13', 2), I('f18', 4), I('f14', 3)], '#fbe1ea', 1760000, ['o5'], 's3', {}),
      B('b13', 'باکس مخمل', 'بیست‌ویک رز هلندی قرمز در باکس مخمل سرمه‌ای.', [I('f1', 21)], '#1c2340', 2450000, ['o2', 'o6'], 's2', { featured: true }),
      B('b14', 'دشت ارژن', 'آنمون، رانکلوس و داوودی به سبک گل‌های خودرو.', [I('f16', 5), I('f22', 6), I('f11', 3), I('f19', 4)], '#dfe9d2', 1580000, ['o9', 'o3', 'o4'], 's1', {}),
      B('b15', 'باکس صبح', 'رز سفید و صورتی با میخک در باکس گرد کرم.', [I('f3', 6), I('f2', 6), I('f12', 5), I('f18', 2)], '#f3e6d0', 1690000, ['o3', 'o5', 'o1'], 's2', {}),
      B('b16', 'سبد زندیه', 'سبد بزرگ افتتاحیه: آفتابگردان، لیلیوم، ژربرا و داوودی.', [I('f10', 7), I('f7', 4), I('f9', 6), I('f11', 6), I('f19', 4)], '#c9a878', 3950000, ['o8', 'o3'], 's3', {})
    ];

    var addons = [
      { id: 'a1', name: 'گلدان شیشه‌ای', price: 280000, active: true },
      { id: 'a2', name: 'شکلات دست‌ساز (۱۲ عددی)', price: 420000, active: true },
      { id: 'a3', name: 'شمع معطر بهارنارنج', price: 350000, active: true },
      { id: 'a4', name: 'بادکنک هلیومی', price: 150000, active: true },
      { id: 'a5', name: 'عروسک خرس کوچک', price: 390000, active: true }
    ];

    var coupons = [
      { id: 'c1', code: 'SHIRAZ10', type: 'percent', value: 10, min: 1000000, expires: now + 30 * DAY, active: true, used: 14, limit: 100, note: 'خوش‌آمد مشتری تازه' },
      { id: 'c2', code: 'NILOOFAR', type: 'fixed', value: 150000, min: 1500000, expires: now + 10 * DAY, active: true, used: 6, limit: 50, note: 'کمپین اینستاگرام' },
      { id: 'c3', code: 'YALDA', type: 'percent', value: 20, min: 0, expires: now - 5 * DAY, active: false, used: 41, limit: 60, note: 'تمام‌شده' }
    ];

    var names = ['سارا محمدی', 'علی رضایی', 'نگار کریمی', 'محمد حسینی', 'مریم زارع', 'رضا دهقان', 'الناز شیرازی', 'امیر جعفری', 'فاطمه نوروزی', 'حسین صادقی', 'ترانه فرهادی', 'پویا اکبری', 'شیوا رستمی', 'کیان مرادی', 'لیلا احمدی'];
    var zones = [
      { id: 'z1', name: 'پاسداران، قصردشت، عفیف‌آباد', fee: 0 },
      { id: 'z2', name: 'معالی‌آباد، فرهنگ‌شهر، ستارخان', fee: 90000 },
      { id: 'z3', name: 'زند، ملاصدرا، ارم', fee: 70000 },
      { id: 'z4', name: 'صدرا و گلستان', fee: 220000 },
      { id: 'z5', name: 'سایر محله‌های شیراز', fee: 140000 }
    ];
    var streets = ['خیابان عفیف‌آباد، کوچه ۷', 'بلوار معالی‌آباد، خیابان دوستان', 'خیابان ملاصدرا، کوچه ۴', 'بلوار ستارخان، کوچه ۲۱', 'خیابان قصردشت، کوچه ۶۳', 'شهرک صدرا، فاز ۱', 'خیابان ارم، کوچه ۱۵', 'بلوار پاسداران، کوچه ۳۸'];

    // سفارش‌های نمونه برای ۳۰ روز گذشته تا داشبورد خالی نباشد
    var r = Flora.rng(20261010), orders = [], weights = [9, 7, 8, 6, 5, 5, 6, 2, 3, 5, 2, 2, 6, 3, 3, 1];
    function pick(arr) { return arr[Math.floor(r() * arr.length)]; }
    function pickB() { var t = 0, s = 0, x; weights.forEach(function (w) { t += w; }); x = r() * t; for (var i = 0; i < weights.length; i++) { s += weights[i]; if (x < s) return bouquets[i]; } return bouquets[0]; }
    var num = 4100;
    for (var d = 30; d >= 0; d--) {
      var count = 1 + Math.floor(r() * 4) + (d % 7 === 2 ? 2 : 0);
      for (var k = 0; k < count; k++) {
        var b = pickB(), size = r() < 0.6 ? 0 : (r() < 0.7 ? 1 : 2), qty = 1;
        var unit = Math.round(b.price * (1 - b.discount / 100) * [1, 1.45, 1.9][size] / 1000) * 1000;
        var items = [{ type: 'bouquet', id: b.id, name: b.name, size: size, qty: qty, price: unit }];
        if (r() < 0.25) { var fl = pick(flowers), q = 3 + Math.floor(r() * 8); items.push({ type: 'flower', id: fl.id, name: fl.name, qty: q, price: fl.price }); }
        var ad = []; if (r() < 0.35) { var a = pick(addons); ad.push({ id: a.id, name: a.name, price: a.price }); }
        var zone = pick(zones), sub = items.reduce(function (s, i) { return s + i.price * i.qty; }, 0) + ad.reduce(function (s, a) { return s + a.price; }, 0);
        var disc = r() < 0.15 ? Math.round(sub * 0.1 / 1000) * 1000 : 0;
        var when = now - d * DAY - Math.floor(r() * 10) * 3600000;
        var st = d > 1 ? (r() < 0.05 ? 'cancelled' : 'delivered') : pick(['new', 'new', 'preparing', 'sending']);
        orders.push({
          id: 'N' + (++num), date: when, items: items, addons: ad, subtotal: sub, discount: disc, coupon: disc ? 'SHIRAZ10' : '', delivery: zone.fee, total: sub - disc + zone.fee,
          customer: { name: pick(names), phone: '0917' + String(1000000 + Math.floor(r() * 8999999)) },
          recipient: { name: pick(names), phone: '0917' + String(1000000 + Math.floor(r() * 8999999)), address: 'شیراز، ' + pick(streets), zone: zone.name },
          slot: { date: when + DAY * (r() < 0.6 ? 0 : 1), time: pick(['۱۰ تا ۱۳', '۱۳ تا ۱۶', '۱۶ تا ۱۹', '۱۹ تا ۲۲']) },
          card: r() < 0.6 ? pick(['تولدت مبارک عزیز دلم', 'با آرزوی سلامتی', 'قدم نورسیده مبارک', 'دوستت دارم', 'موفقیتت مبارک']) : '', anonymous: r() < 0.1,
          payment: pick(['online', 'online', 'card', 'cod']), status: st
        });
      }
    }

    var reviews = [
      { id: 'r1', bid: 'b1', name: 'نگار ک.', rating: 5, text: 'رزها تا ده روز سرحال موندن. عکس قبل از ارسال هم فرستادن که خیالم راحت شد.', date: now - 3 * DAY, approved: true },
      { id: 'r2', bid: 'b3', name: 'امیر ج.', rating: 5, text: 'بوی نرگس کل خونه رو گرفت. سر ساعت رسید.', date: now - 6 * DAY, approved: true },
      { id: 'r3', bid: 'b2', name: 'ترانه ف.', rating: 4, text: 'خیلی قشنگ بود، فقط پیونی‌ها غنچه بودن و دو روز طول کشید باز بشن.', date: now - 9 * DAY, approved: true },
      { id: 'r4', bid: 'b6', name: 'رضا د.', rating: 5, text: 'برای عیادت مادرم سفارش دادم، از شهر دیگه. همه‌چی مرتب و باسلیقه.', date: now - 12 * DAY, approved: true },
      { id: 'r5', bid: 'b7', name: 'شیوا ر.', rating: 5, text: 'رنگ‌هاش عین عکس بود. بسته‌بندی عالی.', date: now - 1 * DAY, approved: false },
      { id: 'r6', bid: 'b4', name: 'لیلا ا.', rating: 5, text: 'بهارنارنجش واقعی بود! حس و حال اردیبهشت شیراز.', date: now - 15 * DAY, approved: true }
    ];

    return {
      v: 1,
      flowers: flowers, bouquets: bouquets, cats: cats, addons: addons, coupons: coupons, orders: orders, reviews: reviews,
      insta: {
        enabled: true, handle: 'niloofar.flower', title: 'از پیشخوان ما در اینستاگرام', token: '',
        posts: [
          { id: 'i1', bid: 'b2', img: '', caption: 'پیونی‌های امسال رسید', link: '', likes: 1284 },
          { id: 'i2', bid: 'b4', img: '', caption: 'بهارنارنج، فقط همین دو هفته', link: '', likes: 2310 },
          { id: 'i3', bid: 'b7', img: '', caption: 'رنگ‌های نصیرالملک', link: '', likes: 986 },
          { id: 'i4', bid: 'b3', img: '', caption: 'نرگس شهلا از کازرون', link: '', likes: 1750 },
          { id: 'i5', bid: 'b13', img: '', caption: 'باکس مخمل برای شب خواستگاری', link: '', likes: 1422 },
          { id: 'i6', bid: 'b6', img: '', caption: 'سفارش امروز برای بیمارستان نمازی', link: '', likes: 804 }
        ]
      },
      settings: {
        name: 'نیلوفر', tagline: 'گل‌فروشی و گل‌آرایی', phone: '۰۷۱-۳۶۲۸ ۴۰ ۴۰', mobile: '۰۹۱۷ ۷۰۰ ۴۰ ۴۰',
        address: 'شیراز، خیابان پاسداران، نبش کوچه ۴۲', hours: 'هر روز ۹ صبح تا ۱۰ شب', email: 'salam@niloofar.example',
        announcement: 'ارسال رایگان در پاسداران، قصردشت و عفیف‌آباد · سفارش تا ساعت ۱۷، تحویل همان روز',
        announceOn: true, cutoff: 17, freeMin: 2500000, zones: zones,
        slots: ['۱۰ تا ۱۳', '۱۳ تا ۱۶', '۱۶ تا ۱۹', '۱۹ تا ۲۲'],
        heroTitle: 'گل تازه‌ی امروز، از پاسداران تا درِ خانه', heroText: 'هر صبح از گلخانه می‌چینیم، همان روز می‌بندیم و قبل از ارسال عکسش را برایتان می‌فرستیم.',
        heroBouquet: 'b6', adminPass: '1234',
        offer: { on: true, title: 'پیشنهاد این هفته', percent: 20, ends: now + 2 * DAY + 5 * 3600000, ids: ['b7', 'b10', 'b5'] },
        sizes: [{ name: 'معمولی', mul: 1 }, { name: 'پُر', mul: 1.45 }, { name: 'باشکوه', mul: 1.9 }],
        plans: [
          { id: 'p1', name: 'هفتگی', every: 'هر هفته', price: 690000, note: 'گل تازه‌ی فصل، هر پنجشنبه' },
          { id: 'p2', name: 'دو هفته یک‌بار', every: 'هر دو هفته', price: 790000, note: 'محبوب‌ترین انتخاب' },
          { id: 'p3', name: 'ماهانه', every: 'هر ماه', price: 950000, note: 'دسته‌گل بزرگ‌تر، ماهی یک‌بار' }
        ]
      },
      requests: [
        { id: 'q1', date: now - 2 * DAY, name: 'نیلوفر حقیقی', phone: '09173334455', type: 'عروسی', when: 'اواخر آبان', guests: 250, budget: '۵۰ تا ۱۰۰ میلیون', note: 'باغ‌تالار در قصردشت؛ تم سفید و سبز.', done: false },
        { id: 'q2', date: now - 6 * DAY, name: 'شرکت پارس‌داده', phone: '09171112233', type: 'افتتاحیه', when: '۲۵ مهر', guests: 80, budget: '۲۰ تا ۵۰ میلیون', note: 'دفتر تازه در معالی‌آباد؛ سه سبد بزرگ و گل میز پذیرایی.', done: true }
      ],
      cart: [], wish: [], recent: [], myOrders: []
    };
  }

  /* ---------- خواندن و نوشتن ---------- */
  var data = null;
  var DB = {
    load: function () {
      if (data) return data;
      try { var raw = localStorage.getItem(KEY); if (raw) data = JSON.parse(raw); } catch (e) { data = null; }
      if (!data || !data.flowers) { data = seed(); DB.save(); }
      if (!data.requests) data.requests = [];
      return data;
    },
    save: function () {
      try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
      catch (e) { return false; } // حافظه پر است یا مرورگر اجازه نمی‌دهد؛ سایت تا بستن صفحه کار می‌کند
    },
    reset: function () { data = seed(); DB.save(); return data; },
    exportJSON: function () { return JSON.stringify(data, null, 1); },
    importJSON: function (txt) { var o = JSON.parse(txt); if (!o.flowers || !o.bouquets) throw new Error('bad'); data = o; DB.save(); },
    uid: function (p) { return p + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }
  };

  /* ---------- محاسبه‌ها ---------- */
  var Q = {
    flower: function (id) { return DB.load().flowers.find(function (f) { return f.id === id; }); },
    bouquet: function (id) { return DB.load().bouquets.find(function (b) { return b.id === id; }); },
    cat: function (id) { return DB.load().cats.find(function (c) { return c.id === id; }); },
    // درصد تخفیف مؤثر: تخفیف خود محصول یا پیشنهاد زمان‌دار، هر کدام بیشتر بود
    discountOf: function (p, isBouquet) {
      var d = p.discount || 0, of = DB.load().settings.offer;
      if (isBouquet && of && of.on && of.ends > Date.now() && of.ids.indexOf(p.id) > -1) d = Math.max(d, of.percent);
      return d;
    },
    priceOf: function (p, isBouquet, sizeIdx) {
      var mul = isBouquet ? (DB.load().settings.sizes[sizeIdx || 0] || { mul: 1 }).mul : 1;
      var base = Math.round(p.price * mul / 1000) * 1000, d = Q.discountOf(p, isBouquet);
      return { base: base, final: Math.round(base * (1 - d / 100) / 1000) * 1000, discount: d };
    },
    bouquetItems: function (b) {
      return (b.items || []).map(function (it) { var f = Q.flower(it.f); return f ? { kind: f.kind, color: f.color, c2: f.c2, n: it.n, f: f } : null; }).filter(Boolean);
    },
    mainColor: function (b) { var it = Q.bouquetItems(b)[0]; return it ? it.color : '#e0457b'; },
    bouquetsWith: function (fid) { return DB.load().bouquets.filter(function (b) { return b.active && b.items.some(function (i) { return i.f === fid; }); }); },
    soldMap: function () {
      var m = {};
      DB.load().orders.forEach(function (o) { if (o.status === 'cancelled') return; o.items.forEach(function (i) { var k = i.type + ':' + i.id; m[k] = m[k] || { qty: 0, rev: 0, name: i.name, type: i.type, id: i.id }; m[k].qty += i.qty; m[k].rev += i.qty * i.price; }); });
      return m;
    },
    bestSellers: function (n) {
      var m = Q.soldMap();
      return DB.load().bouquets.filter(function (b) { return b.active; }).map(function (b) { return { b: b, qty: (m['bouquet:' + b.id] || { qty: 0 }).qty }; })
        .sort(function (a, c) { return c.qty - a.qty; }).slice(0, n || 8).map(function (x) { return x.b; });
    },
    rating: function (bid) {
      var rs = DB.load().reviews.filter(function (r) { return r.bid === bid && r.approved; });
      if (!rs.length) return null;
      return { avg: rs.reduce(function (s, r) { return s + r.rating; }, 0) / rs.length, n: rs.length };
    },
    cartLines: function () {
      var d = DB.load();
      return d.cart.map(function (c, idx) {
        var line = { idx: idx, qty: c.qty, type: c.type, id: c.id, size: c.size || 0 };
        if (c.type === 'bouquet') { var b = Q.bouquet(c.id); if (!b) return null; var p = Q.priceOf(b, true, c.size); line.name = b.name; line.sub = d.settings.sizes[c.size || 0].name; line.price = p.final; line.base = p.base; line.ref = b; }
        else if (c.type === 'flower') { var f = Q.flower(c.id); if (!f) return null; var pf = Q.priceOf(f, false); line.name = f.name; line.sub = 'شاخه‌ای'; line.price = pf.final; line.base = pf.base; line.ref = f; }
        else if (c.type === 'custom') { line.name = c.name || 'دسته‌گل سفارشی شما'; line.sub = c.summary; line.price = c.price; line.base = c.price; line.custom = c; }
        else if (c.type === 'plan') { line.name = 'اشتراک گل ' + c.name; line.sub = c.summary; line.price = c.price; line.base = c.price; line.plan = c; }
        return line;
      }).filter(Boolean);
    },
    cartCount: function () { return DB.load().cart.reduce(function (s, c) { return s + c.qty; }, 0); },
    cartSubtotal: function () { return Q.cartLines().reduce(function (s, l) { return s + l.price * l.qty; }, 0); },
    coupon: function (code, subtotal) {
      var c = DB.load().coupons.find(function (x) { return x.code.toLowerCase() === String(code || '').trim().toLowerCase(); });
      if (!c) return { ok: false, msg: 'این کد را نمی‌شناسیم. حروفش را دوباره نگاه کنید.' };
      if (!c.active) return { ok: false, msg: 'این کد غیرفعال شده است.' };
      if (c.expires && c.expires < Date.now()) return { ok: false, msg: 'مهلت این کد تمام شده است.' };
      if (c.limit && c.used >= c.limit) return { ok: false, msg: 'ظرفیت استفاده از این کد پر شده است.' };
      if (subtotal < (c.min || 0)) return { ok: false, msg: 'این کد برای خرید بالای ' + fmt(c.min) + ' تومان است.' };
      var amt = c.type === 'percent' ? Math.round(subtotal * c.value / 100 / 1000) * 1000 : Math.min(c.value, subtotal);
      return { ok: true, amount: amt, c: c };
    }
  };

  function fmt(n) { return Math.round(n || 0).toLocaleString('fa-IR'); }
  function fa(n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }
  function fdate(ts, opts) { try { return new Date(ts).toLocaleDateString('fa-IR', opts || { day: 'numeric', month: 'long' }); } catch (e) { return ''; } }

  window.DB = DB; window.Q = Q; window.fmt = fmt; window.fa = fa; window.fdate = fdate; window.DAY = DAY;
})();
