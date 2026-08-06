/* =========================================================================
  FULL LIFE EXPEDITION, interactions
  Lightweight vanilla JS · respects prefers-reduced-motion
  ========================================================================= */
(function () {
 "use strict";
 document.documentElement.classList.add("js");
 const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

 /* --- 1. Nav: scrolled state + dark/light switch over hero --- */
 const nav = document.querySelector(".nav");
 const hero = document.querySelector("[data-dark-hero]");
 if (nav) {
  const onScroll = () => {
   const scrolled = window.scrollY > 24;
   nav.classList.toggle("is-scrolled", scrolled);
   if (hero) {
    const past = window.scrollY > hero.offsetHeight - 90;
    nav.classList.toggle("on-dark", !past);
   }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
 }

 /* --- 2. Mobile menu --- */
 const burger = document.querySelector(".nav__burger");
 if (burger) {
  const toggle = (open) => {
   const isOpen = open ?? !document.body.classList.contains("menu-open");
   document.body.classList.toggle("menu-open", isOpen);
   burger.setAttribute("aria-expanded", String(isOpen));
  };
  burger.addEventListener("click", () => toggle());
  document.querySelectorAll(".nav__panel a").forEach((a) =>
   a.addEventListener("click", () => toggle(false))
  );
  document.addEventListener("keydown", (e) => {
   if (e.key === "Escape") toggle(false);
  });
 }

 /* --- 3. Scroll reveal --- */
 const reveal = document.querySelectorAll("[data-reveal]");
 if (reveal.length && !reduceMotion && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
   (entries) => {
    entries.forEach((entry) => {
     if (entry.isIntersecting) {
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);
     }
    });
   },
   { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  reveal.forEach((el) => io.observe(el));
 } else {
  reveal.forEach((el) => el.classList.add("is-in"));
 }

 /* --- 4. Essay archive filters --- */
 const filters = document.querySelectorAll("[data-filter]");
 const items = document.querySelectorAll("[data-cat]");
 if (filters.length && items.length) {
  filters.forEach((btn) => {
   btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const f = btn.getAttribute("data-filter");
    items.forEach((it) => {
     const match = f === "all" || it.getAttribute("data-cat") === f;
     it.classList.toggle("is-hidden", !match);
    });
   });
  });
 }

 /* --- 5. Newsletter (demo, no backend) --- */
 document.querySelectorAll("[data-newsletter]").forEach((form) => {
  form.addEventListener("submit", (e) => {
   e.preventDefault();
   const input = form.querySelector("input");
   const note = form.parentElement.querySelector("[data-form-note]");
   if (input && input.value.includes("@")) {
    if (note) note.textContent = "Thank you, please confirm via the link in your inbox.";
    input.value = "";
   } else if (note) {
    note.textContent = "Please enter a valid email address.";
   }
  });
 });

 /* --- 6. Hero constellation (soft tech magic) --- */
 const canvas = document.querySelector("[data-constellation]");
 if (canvas && !reduceMotion) {
  const ctx = canvas.getContext("2d");
  let w, h, dpr, nodes, raf;
  const COUNT = 26;

  // deterministic-ish pseudo random (no Math.random dependency at module load issue)
  let seed = 7;
  const rnd = () => {
   seed = (seed * 9301 + 49297) % 233280;
   return seed / 233280;
  };

  const init = () => {
   dpr = Math.min(window.devicePixelRatio || 1, 2);
   w = canvas.clientWidth;
   h = canvas.clientHeight;
   canvas.width = w * dpr;
   canvas.height = h * dpr;
   ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
   nodes = Array.from({ length: COUNT }, () => ({
    x: rnd() * w,
    y: rnd() * h,
    vx: (rnd() - 0.5) * 0.18,
    vy: (rnd() - 0.5) * 0.18,
    r: rnd() * 1.6 + 0.6,
   }));
  };

  const draw = () => {
   ctx.clearRect(0, 0, w, h);
   for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    a.x += a.vx; a.y += a.vy;
    if (a.x < 0 || a.x > w) a.vx *= -1;
    if (a.y < 0 || a.y > h) a.vy *= -1;
    for (let j = i + 1; j < nodes.length; j++) {
     const b = nodes[j];
     const dx = a.x - b.x, dy = a.y - b.y;
     const dist = Math.hypot(dx, dy);
     if (dist < 130) {
      ctx.strokeStyle = `rgba(198,164,93,${(1 - dist / 130) * 0.28})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
     }
    }
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(232,201,130,0.65)";
    ctx.fill();
   }
   raf = requestAnimationFrame(draw);
  };

  init();
  draw();
  let to;
  window.addEventListener("resize", () => {
   clearTimeout(to);
   to = setTimeout(() => { cancelAnimationFrame(raf); init(); draw(); }, 180);
  });
 }

 /* --- 6b. Scroll-expand showcase (scroll-driven, no hijack) --- */
  const sxp = document.querySelector("[data-sxp]");
  if (sxp && !reduceMotion) {
    const media = sxp.querySelector("[data-sxp-media]");
    const bg = sxp.querySelector("[data-sxp-bg]");
    const w1 = sxp.querySelector("[data-sxp-w1]");
    const w2 = sxp.querySelector("[data-sxp-w2]");
    const hint = sxp.querySelector("[data-sxp-hint]");

    const update = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const mobile = vw < 768;
      const total = sxp.offsetHeight - vh;
      const scrolled = Math.min(Math.max(-sxp.getBoundingClientRect().top, 0), total);
      const p = total > 0 ? scrolled / total : 0;

      const sW = mobile ? 0.82 : 0.44, eW = mobile ? 0.96 : 0.95;
      const sH = mobile ? 0.34 : 0.46, eH = mobile ? 0.80 : 0.86;
      if (media) {
        media.style.width = (sW + (eW - sW) * p) * vw + "px";
        media.style.height = (sH + (eH - sH) * p) * vh + "px";
        media.style.borderRadius = (16 - 8 * p) + "px";
      }
      if (bg) bg.style.opacity = String(1 - p * 0.85);
      const tx = p * (mobile ? 0.26 : 0.16) * vw;
      if (w1) w1.style.transform = "translateX(" + (-tx) + "px)";
      if (w2) w2.style.transform = "translateX(" + tx + "px)";
      if (hint) hint.style.opacity = String(Math.max(0, 1 - p * 1.6));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

 /* --- 6c. Latest from Substack (auto-update via feed, graceful fallback) ---
    Generic: works for any number of feed boxes. Each box:
      <div data-substack-feed="FEED_URL" data-feed-count="6" data-feed-cat="AI">…fallback…</div>
    The whole publication feed is "…/feed"; a single section is "…/feed?sectionId=NNN". */
  document.querySelectorAll("[data-substack-feed]").forEach((box) => {
    const feed = box.dataset.substackFeed;
    if (!feed) return;
    const count = parseInt(box.dataset.feedCount || "3", 10);
    const fallbackCat = box.dataset.feedCat || "Essay";
    const esc = (s) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const fmt = (d) => { try { return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" }); } catch (e) { return ""; } };
    // Same-origin proxy (Cloudflare Pages Function) — no external CORS dependency
    let endpoint = "/substack-feed";
    const sec = feed.match(/[?&]sectionId=(\d+)/);
    if (sec) endpoint += "?sectionId=" + sec[1];
    fetch(endpoint)
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((xml) => {
        const doc = new DOMParser().parseFromString(xml, "text/xml");
        const items = Array.from(doc.querySelectorAll("item")).slice(0, count);
        if (!items.length) return;
        const html = items.map((it) => {
          const t = esc((it.querySelector("title") || {}).textContent || "");
          const link = ((it.querySelector("link") || {}).textContent || feed).trim();
          const date = fmt((it.querySelector("pubDate") || {}).textContent || "");
          let cat = ((it.querySelector("category") || {}).textContent || "").trim();
          if (!cat) cat = fallbackCat;
          return '<a class="sub-post" href="' + esc(link) + '" target="_blank" rel="noopener">' +
                 '<span class="sub-post__cat">' + esc(cat) + '</span>' +
                 '<h4>' + t + '</h4>' +
                 '<span>' + date + ' · Read on Substack</span></a>';
        }).join("");
        if (html) box.innerHTML = html;
      })
      .catch(() => { /* keep static fallback */ });
  });

 /* --- 7. Current year in footer --- */
 document.querySelectorAll("[data-year]").forEach((el) => {
  // static fallback; updated at runtime
  el.textContent = new Date().getFullYear();
 });
})();
