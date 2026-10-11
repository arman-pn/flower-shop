/* ============================================================
   photos.js — عکس واقعی هر گل و دسته‌گل
   هر خط: شناسه‌ی محصول، نشانی عکس (src) و نام عکاس (by).
   عکس‌ها از Unsplash هستند (مجوز رایگان Unsplash) و مستقیم از سرور
   Unsplash بارگذاری می‌شوند؛ یعنی برای دیدنشان اینترنت لازم است.
   اگر عکسی بار نشود، خودکار همان نقاشی قبلی نشان داده می‌شود.

   برای آفلاین‌کردن: یک بار «python download-photos.py» را اجرا کنید؛
   عکس‌ها در assets/img ذخیره و همین فایل به مسیرهای محلی بازنویسی می‌شود.
   برای عوض‌کردن یک عکس: src همان خط را عوض کنید، یا از پنل مدیریت
   برای آن محصول عکس بارگذاری کنید (عکس پنل همیشه مقدم است).
   ============================================================ */
window.PHOTO_QUERY = '?auto=format&fit=crop&w=900&q=75';
window.PHOTOS = {
  f1: { src: "assets/img/f1.jpg", by: "Marcus Ganahl" },
  f2: { src: "assets/img/f2.jpg", by: "Allec Gomes" },
  f3: { src: "assets/img/f3.jpg", by: "Laura Chouette" },
  f4: { src: "assets/img/f4.jpg", by: "JOGphotos" },
  f5: { src: "assets/img/f5.jpg", by: "Aaron Burden" },
  f6: { src: "assets/img/f6.jpg", by: "Kolby Milton" },
  f7: { src: "assets/img/f7.jpg", by: "Sibeli Velázquez" },
  f8: { src: "assets/img/f8.jpg", by: "Jean-Louis Paulin" },
  f9: { src: "assets/img/f9.jpg", by: "Pawel Czerwinski" },
  f10: { src: "assets/img/f10.jpg", by: "Aaron Burden" },
  f11: { src: "assets/img/f11.jpg", by: "Anna Evans" },
  f12: { src: "assets/img/f12.jpg", by: "Jason Leung" },
  f13: { src: "assets/img/f13.jpg", by: "MChe Lee" },
  f14: { src: "assets/img/f14.jpg", by: "Natalie Kinnear" },
  f15: { src: "assets/img/f15.jpg", by: "Helen Van" },
  f16: { src: "assets/img/f16.jpg", by: "Damir Korotaj" },
  f17: { src: "assets/img/f17.jpg", by: "Anindita Barma" },
  f18: { src: "assets/img/f18.jpg", by: "Annie Spratt" },
  f19: { src: "assets/img/f19.jpg", by: "Sixteen Miles Out" },
  f20: { src: "assets/img/f20.jpg", by: "Raja Patel" },
  f21: { src: "assets/img/f21.jpg", by: "Rebecca Niver" },
  f22: { src: "assets/img/f22.jpg", by: "Anya Chernykh" },
  b1: { src: "assets/img/b1.jpg", by: "Preillumination SeTh" },
  b2: { src: "assets/img/b2.jpg", by: "Liubov Ilchuk" },
  b3: { src: "assets/img/b3.jpg", by: "Pavlo Talpa" },
  b4: { src: "assets/img/b4.jpg", by: "Robert Arnar" },
  b5: { src: "assets/img/b5.jpg", by: "Alexander Mass" },
  b6: { src: "assets/img/b6.jpg", by: "sina rezakhani" },
  b7: { src: "assets/img/b7.jpg", by: "Jessica Fadel" },
  b8: { src: "assets/img/b8.jpg", by: "Volodymyr Lymariev" },
  b9: { src: "assets/img/b9.jpg", by: "Nik Bagherzadegan" },
  b10: { src: "assets/img/b10.jpg", by: "Boris Izmaylov" },
  b11: { src: "assets/img/b11.jpg", by: "Jerry Wang" },
  b12: { src: "assets/img/b12.jpg", by: "Anita Austvika" },
  b13: { src: "assets/img/b13.jpg", by: "Nika Benedictova" },
  b14: { src: "assets/img/b14.jpg", by: "Mariah Hewines" },
  b15: { src: "assets/img/b15.jpg", by: "Karolina Bobek" },
  b16: { src: "assets/img/b16.jpg", by: "Night Glow" }
};
