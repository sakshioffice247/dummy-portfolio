/* Portfolio interactions: theme, loader, nav, reveal, counters, accordion, tilt, particles */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const root = document.documentElement;

  /* ---------- Theme (persisted) ---------- */
  const themeBtn = $('#theme');
  const applyTheme = t => {
    root.dataset.theme = t;
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  };
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  applyTheme(saved || 'dark');
  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    colors();
  });

  /* ---------- Split hero title into animated words ---------- */
  const h1 = $('h1.split');
  h1.innerHTML = h1.textContent.split(' ').map((w, i) => `<span class="w" aria-hidden="true"><i style="--i:${i}">${w}</i></span>`).join('');

  /* ---------- Loader, then hero entrance ---------- */
  const start = () => {
    $('#loader').classList.add('done');
    setTimeout(() => { h1.classList.add('in'); typeLoop(); }, 250);
  };
  window.addEventListener('load', () => setTimeout(start, reduce ? 0 : 900));
  setTimeout(() => $('#loader').classList.contains('done') || start(), 4000); // safety net

  /* ---------- Typed role line ---------- */
  const roles = ['DevOps Engineer', 'Software Architect', 'Site Reliability Engineer', 'Infrastructure Team Lead'];
  const typed = $('#typed');
  let ri = 0, ci = 0, del = false, running = false;
  function typeLoop() {
    if (running) return; running = true;
    if (reduce) { typed.textContent = roles.join(' · '); return; }
    const tick = () => {
      const w = roles[ri];
      ci += del ? -1 : 1;
      typed.textContent = w.slice(0, ci);
      let t = del ? 40 : 80;
      if (!del && ci === w.length) { del = true; t = 1700; }
      else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; t = 350; }
      setTimeout(tick, t);
    };
    tick();
  }

  /* ---------- Scroll reveal with stagger ---------- */
  $$('.reveal').forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.setProperty('--d', Math.min(sibs.indexOf(el), 6) * 0.09 + 's');
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(count);
    if (e.target.matches('[data-count]')) count(e.target);
    io.unobserve(e.target);
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Animated counters ---------- */
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const n = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = n.toFixed(dec) + suf; return; }
    const t0 = performance.now(), dur = 1600;
    const step = t => {
      const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (n * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Navigation: mobile menu, active section, indicator ---------- */
  const nav = $('#nav'), menu = $('#menu'), burger = $('#burger');
  const links = $$('a', menu), indicator = $('.indicator', menu);
  const setMenu = open => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  links.forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));
  document.addEventListener('click', e => { if (!nav.contains(e.target)) setMenu(false); });

  const moveIndicator = a => {
    if (!a) { indicator.style.opacity = 0; return; }
    indicator.style.opacity = 1;
    indicator.style.width = a.offsetWidth + 'px';
    indicator.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  let current = null;
  const setActive = id => {
    current = links.find(a => a.getAttribute('href') === '#' + id) || null;
    links.forEach(a => { const on = a === current; a.classList.toggle('active', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
    moveIndicator(current);
  };
  const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
    { rootMargin: '-45% 0px -50% 0px' });
  $$('main section').forEach(s => spy.observe(s));
  window.addEventListener('resize', () => moveIndicator(current));

  /* ---------- Scroll progress, nav shadow, back-to-top ---------- */
  const bar = $('#progress');
  const onScroll = () => {
    const h = root.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
    nav.classList.toggle('scrolled', scrollY > 30);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#top').addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Experience accordion ---------- */
  $$('.job-head').forEach(btn => btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !open);
    btn.nextElementSibling.classList.toggle('open', !open);
  }));

  /* ---------- Subtle tilt + magnetic buttons (pointer devices only) ---------- */
  if (fine && !reduce) {
    $$('.tilt').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(700px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-3px)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
  }

  /* ---------- Particle network background ---------- */
  const cv = $('#bg'), ctx = cv.getContext('2d');
  let W, H, pts = [], rgb = '34,211,238';
  const mouse = { x: -999, y: -999 };
  function colors() { rgb = root.dataset.theme === 'light' ? '109,40,217' : '34,211,238'; }
  function size() {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * d; H = cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.min(70, Math.floor(innerWidth * innerHeight / 22000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 }));
  }
  function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of pts) {
      if (!reduce) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
      ctx.fillStyle = `rgba(${rgb},.7)`; ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, 6.283); ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130) { ctx.strokeStyle = `rgba(${rgb},${.16 * (1 - d / 130)})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    for (const p of pts) {
      const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (d < 150) { ctx.strokeStyle = `rgba(${rgb},${.3 * (1 - d / 150)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    }
    if (!document.hidden && !reduce) requestAnimationFrame(draw);
  }
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  addEventListener('resize', size);
  document.addEventListener('visibilitychange', () => !document.hidden && !reduce && requestAnimationFrame(draw));
  colors(); size(); draw();
})();
