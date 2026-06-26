/* Alic Landing — GSAP Animations */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CENSOR_CHARS = '!@#$%^&*';

  /* ── Utilities ── */
  function fmt(n) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  function parseAdvance(str) {
    return parseInt(String(str).replace(/[^0-9]/g, ''), 10) || 0;
  }

  function paintSlider(input) {
    const pct = ((Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100;
    input.style.setProperty('--fill', pct + '%');
  }

  function drawNeverContours() {
    const c = document.getElementById('never-contours');
    if (!c || !c.parentElement) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const rect = c.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const cx = rect.width * 0.82;
    const cy = rect.height * 0.2;
    const rings = 26;
    const SEG = 140;

    for (let r = 0; r < rings; r++) {
      const base = 50 + r * 34;
      ctx.beginPath();
      for (let i = 0; i <= SEG; i++) {
        const a = (i / SEG) * Math.PI * 2;
        const wob =
          Math.sin(a * 3 + r * 0.9) * (7 + r * 1.6) + Math.sin(a * 7 + r * 1.7) * (4 + r * 0.7);
        const rad = base + wob;
        const x = cx + Math.cos(a) * rad;
        const y = cy + Math.sin(a) * rad * 0.85;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(73,197,182,${0.16 - r * 0.0045})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /* ── Rotating censor characters ── */
  function initCensorChars() {
    const slots = document.querySelectorAll('.censor-char');
    if (!slots.length) return;

    slots.forEach((slot, i) => {
      let idx = i % CENSOR_CHARS.length;
      slot.textContent = CENSOR_CHARS[idx];

      if (prefersReducedMotion) return;

      const cycle = () => {
        idx = (idx + 1) % CENSOR_CHARS.length;
        gsap.fromTo(
          slot,
          { y: -12, opacity: 0, rotateX: -90 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.14,
            ease: 'power2.out',
            onStart: () => { slot.textContent = CENSOR_CHARS[idx]; }
          }
        );
      };

      gsap.delayedCall(0.6 + i * 0.35, function tick() {
        cycle();
        gsap.delayedCall(0.16 + Math.random() * 0.08, tick);
      });
    });
  }

  initCensorChars();

  /* ── Nav ── */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navBackdrop = document.getElementById('nav-backdrop');
  const navProgress = document.getElementById('nav-progress');

  function updateNavScroll() {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    nav.classList.toggle('scrolled', y > 40);
    if (navProgress) {
      navProgress.classList.toggle('is-active', y > 0);
      if (y <= 0) navProgress.style.setProperty('--scroll-progress', '0');
    }
  }

  window.addEventListener('scroll', updateNavScroll, { passive: true });
  updateNavScroll();

  if (navProgress && !prefersReducedMotion) {
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if ((window.scrollY || 0) <= 0) return;
        navProgress.style.setProperty('--scroll-progress', self.progress);
      }
    });
  }

  const darkSections = [
    { sel: '#bleed-phase-1', cls: 'is-dark-bleed' },
    { sel: '#never', cls: 'is-dark' },
    { sel: '.stats', cls: 'is-dark' },
    { sel: '#cta', cls: 'is-dark' }
  ];

  darkSections.forEach(({ sel, cls }) => {
    ScrollTrigger.create({
      trigger: sel,
      start: 'top 80px',
      end: 'bottom 80px',
      onEnter: () => nav.classList.add(cls),
      onLeave: () => nav.classList.remove(cls),
      onEnterBack: () => nav.classList.add(cls),
      onLeaveBack: () => nav.classList.remove(cls)
    });
  });

  function closeNav() {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navBackdrop.hidden = true;
  }

  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navBackdrop.hidden = !open;
  });

  navBackdrop?.addEventListener('click', closeNav);
  navLinks?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));

  /* ── Sticky CTA orb ── */
  const ctaOrb = document.getElementById('cta-orb');
  if (ctaOrb) {
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'bottom 60%',
      onEnter: () => ctaOrb.classList.add('is-visible'),
      onLeaveBack: () => ctaOrb.classList.remove('is-visible')
    });

    if (!prefersReducedMotion) {
      // Pulse handled via CSS ::before (matches Alic invest-orb)
    }
  }

  /* ── Hero entrance ── */
  if (!prefersReducedMotion) {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl
      .to('#headline .line > span', {
        y: 0,
        duration: 1.1,
        stagger: 0.12
      })
      .from('.hero-eyebrow, .hero-sub, .hero-actions, .hero-proof', {
        autoAlpha: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.1
      }, '-=0.5')
      .from('#hero-photo', {
        autoAlpha: 0,
        scale: 0.96,
        duration: 1,
        ease: 'power2.out',
        immediateRender: false
      }, '-=1')
      .from('#browser-frame', {
        autoAlpha: 0,
        y: 40,
        x: 24,
        scale: 0.94,
        duration: 1.2,
        ease: 'power2.out',
        immediateRender: false
      }, '-=0.85')
      .from('.hero-photo-pill', {
        autoAlpha: 0,
        y: -12,
        duration: 0.6,
        ease: 'back.out(2)',
        immediateRender: false
      }, '-=0.7')
      .to('.chart-line', {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: 'power2.inOut'
      }, '-=0.6');

    gsap.to('#browser-frame', {
      y: -12,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });

    /* Mouse parallax on hero browser frame */
    const browserFrame = document.getElementById('browser-frame');
    const heroVisual = document.querySelector('.hero-visual');
    if (browserFrame && heroVisual) {
      heroVisual.addEventListener('mousemove', (e) => {
        const rect = heroVisual.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(browserFrame, {
          rotationY: x * 8,
          rotationX: -y * 6,
          duration: 0.6,
          ease: 'power2.out',
          transformPerspective: 900
        });
      });
      heroVisual.addEventListener('mouseleave', () => {
        gsap.to(browserFrame, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'power2.out' });
      });
    }
  } else {
    gsap.set('#headline .line > span', { y: 0 });
    gsap.set('.reveal, .reveal-now', { autoAlpha: 1, y: 0 });
    gsap.set('#hero-photo, .hero-photo-pill, #browser-frame', { autoAlpha: 1, scale: 1, x: 0, y: 0 });
  }

  /* ── Live hero balance + debit toasts ── */
  const heroBalance = document.getElementById('hero-balance');
  const heroDebitToast = document.getElementById('hero-debit-toast');
  const DEBITS = [486, 394, 360, 520, 412];
  let balanceVal = 13400;

  if (heroBalance && !prefersReducedMotion) {
    function flashDebit(amt) {
      if (!heroDebitToast) return;
      heroDebitToast.querySelector('.hero-debit-amt').textContent = '−$' + amt;
      heroDebitToast.classList.add('is-visible');
      setTimeout(() => heroDebitToast.classList.remove('is-visible'), 2200);
    }

    function tickHeroBalance() {
      const isCredit = Math.random() > 0.55;
      if (isCredit) {
        const credit = [820, 1200, 4200, 680][Math.floor(Math.random() * 4)];
        balanceVal += credit;
      } else {
        const debit = DEBITS[Math.floor(Math.random() * DEBITS.length)];
        balanceVal = Math.max(2800, balanceVal - debit);
        flashDebit(debit);
      }
      gsap.to({ val: parseFloat(heroBalance.textContent.replace(/[^0-9.-]/g, '')) || balanceVal }, {
        val: balanceVal,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: function () {
          heroBalance.textContent = '$' + fmt(Math.round(this.targets()[0].val));
        }
      });
    }

    setInterval(tickHeroBalance, 3200);
  }

  /* ── Daily Bleed — pinned scroll narrative ── */
  function initBleedScene() {
    const phase1 = document.getElementById('bleed-phase-1');
    const phase2 = document.getElementById('bleed-phase-2');
    if (!phase1 || !phase2) return;

    const sceneBalance = document.getElementById('scene-balance');
    const sceneDays = document.getElementById('scene-days');
    const bleedLine = document.querySelector('[data-draw="bleed-line"]');
    const bleedDot = document.querySelector('[data-bleed-dot]');

    if (bleedLine) {
      const len = bleedLine.getTotalLength();
      gsap.set(bleedLine, { strokeDasharray: len, strokeDashoffset: len });
    }
    if (bleedDot) gsap.set(bleedDot, { scale: 0, transformOrigin: 'center', opacity: 0 });

    if (prefersReducedMotion) {
      gsap.set('[data-word]', { opacity: 1 });
      gsap.set('[data-raw]', { opacity: 1, x: 0, y: 0, scale: 1 });
      if (bleedLine) gsap.set(bleedLine, { strokeDashoffset: 0 });
      if (bleedDot) gsap.set(bleedDot, { scale: 1, opacity: 1 });
      return;
    }

    const balanceProxy = { val: 24800 };
    const daysProxy = { val: 47 };

    const p1 = gsap.timeline({
      scrollTrigger: {
        trigger: phase1,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8
      }
    });

    p1.to('[data-word]', { opacity: 1, stagger: 0.04, ease: 'none' }, 0);

    gsap.utils.toArray('[data-raw]').forEach((card, i) => {
      p1.from(
        card,
        {
          x: card.dataset.fx,
          y: card.dataset.fy,
          scale: 0.5,
          opacity: 0,
          ease: 'power2.out',
          duration: 0.85
        },
        0.08 + i * 0.1
      );
    });

    p1.to(balanceProxy, {
      val: 4200,
      duration: 1,
      ease: 'power1.in',
      onUpdate: () => {
        if (sceneBalance) sceneBalance.textContent = '$' + fmt(Math.round(balanceProxy.val));
      }
    }, 0.35);

    p1.to(daysProxy, {
      val: 8,
      duration: 1,
      ease: 'power1.in',
      onUpdate: () => {
        if (sceneDays) sceneDays.textContent = Math.round(daysProxy.val);
      }
    }, 0.35);

    p1.to('.bleed-hud-warn', { scale: 1.05, duration: 0.3, yoyo: true, repeat: 3 }, 0.6);

    const p2 = gsap.timeline({
      scrollTrigger: {
        trigger: phase2,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8
      }
    });

    p2.from('[data-p2-title]', { opacity: 0, y: 40, duration: 0.5 }, 0)
      .from('.bleed-exit-eyebrow, .bleed-exit-sub', { opacity: 0, y: 24, duration: 0.4, stagger: 0.1 }, 0.1)
      .from('[data-analysis]', { opacity: 0, y: 50, duration: 0.5 }, 0.2)
      .from('[data-restructure]', { opacity: 0, x: 40, duration: 0.5 }, 0.35);

    if (bleedLine) {
      p2.to(bleedLine, { strokeDashoffset: 0, duration: 0.6, ease: 'none' }, 0.25);
    }
    if (bleedDot) {
      p2.to(bleedDot, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }, 0.7);
    }

    p2.from('.bleed-card-faded', {
      opacity: 0,
      y: 16,
      scale: 0.94,
      duration: 0.35,
      stagger: 0.06,
      ease: 'power2.out'
    }, 0.12)
      .to('.bleed-card-faded', {
        opacity: 0.55,
        y: 0,
        scale: 1,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out'
      }, 0.12)
      .to('.bleed-card-faded', { opacity: 0.38, duration: 0.7, ease: 'none' }, 0.65);
  }

  initBleedScene();

  /* ── Trust marquee ── */
  const trustTrack = document.getElementById('trust-track');
  if (trustTrack && !prefersReducedMotion) {
    const trackWidth = trustTrack.scrollWidth / 2;
    gsap.to(trustTrack, {
      x: -trackWidth,
      duration: 28,
      ease: 'none',
      repeat: -1
    });
  }

  /* ── Scroll reveals ── */
  if (!prefersReducedMotion) {
    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  }

  /* Never cards: visible by default — animation was leaving them hidden */

  /* ── Value prop — scrubbed highlight + background chapters ── */
  if (!prefersReducedMotion) {
    const valueLines = gsap.utils.toArray('.value-line');
    gsap.timeline({
      scrollTrigger: {
        trigger: '.value-prop',
        start: 'top 70%',
        end: 'bottom 40%',
        scrub: 0.5
      }
    })
      .from(valueLines, { autoAlpha: 0.3, y: 30, stagger: 0.33, ease: 'none' })
      .to(valueLines, { autoAlpha: 1, y: 0, stagger: 0.33, ease: 'none' }, 0);

    ScrollTrigger.create({
      trigger: '.value-prop',
      start: 'top 60%',
      end: 'bottom 40%',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        const el = document.querySelector('.value-prop');
        if (!el) return;
        if (p < 0.33) el.style.background = '#eef2f9';
        else if (p < 0.66) el.style.background = '#f5f7fb';
        else el.style.background = 'rgba(73, 197, 182, 0.08)';
      }
    });
  }

  /* ── Feature cards slide in ── */
  document.querySelectorAll('.feature').forEach((feature) => {
    const visual = feature.querySelector('.feature-visual');
    const content = feature.querySelector('.feature-content');
    const isReverse = feature.classList.contains('feature-reverse');

    if (prefersReducedMotion || !visual) return;

    gsap.from(visual, {
      x: isReverse ? -80 : 80,
      autoAlpha: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: feature, start: 'top 70%' }
    });

    if (content) {
      gsap.from(content, {
        x: isReverse ? 60 : -60,
        autoAlpha: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: feature, start: 'top 70%' }
      });
    }
  });

  /* ── Invoice progress bar ── */
  ScrollTrigger.create({
    trigger: '#invoice-progress',
    start: 'top 85%',
    onEnter: () => {
      document.getElementById('invoice-progress').style.width = '68%';
    },
    once: true
  });

  /* ── Forecast chart draw ── */
  if (!prefersReducedMotion) {
    gsap.to('.forecast-line', {
      strokeDashoffset: 0,
      duration: 1.6,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: '.forecast-card', start: 'top 75%', once: true }
    });

    gsap.from('.crunch-dot', {
      scale: 0,
      autoAlpha: 0,
      duration: 0.5,
      ease: 'back.out(2)',
      scrollTrigger: { trigger: '.forecast-card', start: 'top 70%', once: true },
      delay: 1.2
    });
  }

  /* ── How it works connector ── */
  if (!prefersReducedMotion) {
    const howFill = document.getElementById('how-connector-fill');
    if (howFill) {
      gsap.to(howFill, {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.how-steps',
          start: 'top 75%',
          end: 'bottom 60%',
          scrub: 0.6
        }
      });
    }
  }

  /* ── Verticals horizontal scroll ── */
  function initVerticalsScroll() {
    const wrap = document.querySelector('.verticals-scroll-wrap');
    const track = document.getElementById('verticals-track');
    if (!wrap || !track || prefersReducedMotion) return;

    const getScroll = () => Math.max(0, track.scrollWidth - wrap.offsetWidth + 48);

    gsap.to(track, {
      x: () => -getScroll(),
      ease: 'none',
      scrollTrigger: {
        trigger: wrap,
        start: 'top 85%',
        end: () => '+=' + (getScroll() + 200),
        scrub: 1,
        invalidateOnRefresh: true
      }
    });
  }

  initVerticalsScroll();

  /* ── Compare rows — stagger + highlight Alic column ── */
  if (!prefersReducedMotion) {
    gsap.from('.compare-row:not(.compare-header)', {
      autoAlpha: 0,
      x: -30,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.compare-table', start: 'top 80%' }
    });

    document.querySelectorAll('.compare-row:not(.compare-header)').forEach((row) => {
      ScrollTrigger.create({
        trigger: row,
        start: 'top 85%',
        onEnter: () => row.classList.add('is-lit'),
        onLeaveBack: () => row.classList.remove('is-lit')
      });
    });
  }

  /* ── Counter animation ── */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';

    if (prefersReducedMotion) {
      el.textContent = prefix + fmt(target) + suffix;
      return;
    }

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: target >= 1000000 ? 2.2 : 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => {
        el.textContent = prefix + fmt(Math.round(obj.val)) + suffix;
      }
    });
  }

  document.querySelectorAll('[data-count]').forEach((el) => {
    if (prefersReducedMotion) {
      el.textContent = (el.dataset.prefix || '') + fmt(parseFloat(el.dataset.count));
      return;
    }
    const proxy = { val: 0 };
    gsap.to(proxy, {
      val: parseFloat(el.dataset.count),
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => {
        el.textContent = (el.dataset.prefix || '') + fmt(Math.round(proxy.val));
      }
    });
  });

  document.querySelectorAll('.count').forEach(animateCounter);

  /* ── MCA Calculator ── */
  const advanceInput = document.getElementById('advance-input');
  const advanceSlider = document.getElementById('advance-slider');
  const termSlider = document.getElementById('term-slider');
  const termDisplay = document.getElementById('term-display');
  const valReceive = document.getElementById('val-receive');
  const valRepay = document.getElementById('val-repay');
  const valNet = document.getElementById('val-net');
  const valDaily = document.getElementById('val-daily');
  const barReceive = document.getElementById('bar-receive');
  const barRepay = document.getElementById('bar-repay');
  const aprValue = document.getElementById('apr-value');
  const aprCallout = document.getElementById('apr-callout');
  const valDailyStolen = document.getElementById('val-daily-stolen');
  const valWeeklyStolen = document.getElementById('val-weekly-stolen');
  const valYearlyKept = document.getElementById('val-yearly-kept');
  const calcFeedRows = document.getElementById('calc-feed-rows');
  const aprDays = document.getElementById('apr-days');

  const FACTOR = 1.4;
  const FEE_RATE = 0.05;
  const BUSINESS_DAYS_PER_MONTH = 21;
  const MAX_BAR = 100;
  const FUNDERS = ['RapidFnd', 'MerchCap', 'JetAdv', 'CapFlow', 'DailyDr'];

  function calcDailyDebitAPR(netReceived, totalRepay, months) {
    const businessDays = Math.round(months * BUSINESS_DAYS_PER_MONTH);
    if (businessDays <= 0 || netReceived <= 0) return 0;

    const financeCharge = totalRepay - netReceived;
    return Math.round((financeCharge / netReceived) * (365 / businessDays) * 100);
  }

  function pushFeedRow(amount) {
    if (!calcFeedRows) return;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const funder = FUNDERS[Math.floor(Math.random() * FUNDERS.length)];
    const row = document.createElement('div');
    row.className = 'calc-feed-row';
    row.innerHTML =
      '<span class="feed-when">' + days[Math.floor(Math.random() * days.length)] + '</span>' +
      '<span class="feed-desc">DAILY DEBIT · ' + funder + '</span>' +
      '<span class="feed-amt">−$' + fmt(amount) + '</span>';
    calcFeedRows.prepend(row);
    while (calcFeedRows.children.length > 5) {
      calcFeedRows.removeChild(calcFeedRows.lastChild);
    }
  }

  function updateCalculator(amount, months) {
    const termMonths = months || parseInt(termSlider?.value || '5', 10);
    const gross = amount;
    const fees = Math.round(gross * FEE_RATE);
    const receive = gross - fees;
    const repay = Math.round(gross * FACTOR);
    const nDays = Math.round(termMonths * BUSINESS_DAYS_PER_MONTH);
    const dailyDebit = Math.round(repay / nDays);
    const weeklyStolen = dailyDebit * 5;
    const apr = calcDailyDebitAPR(receive, repay, termMonths);
    const yearlyKept = weeklyStolen * 52;

    if (valReceive) valReceive.textContent = '$' + fmt(receive);
    if (valRepay) valRepay.textContent = '$' + fmt(repay);
    if (valNet) valNet.textContent = '$' + fmt(receive);
    if (valDaily) valDaily.textContent = '$' + fmt(dailyDebit);
    if (aprValue) aprValue.textContent = fmt(apr);
    if (valDailyStolen) valDailyStolen.textContent = '$' + fmt(dailyDebit);
    if (valWeeklyStolen) valWeeklyStolen.textContent = '$' + fmt(weeklyStolen);
    if (valYearlyKept) valYearlyKept.textContent = '$' + fmt(yearlyKept);
    if (termDisplay) termDisplay.textContent = termMonths + ' month' + (termMonths === 1 ? '' : 's');
    if (aprDays) aprDays.textContent = String(nDays);

    if (barReceive) barReceive.style.width = Math.min((receive / repay) * MAX_BAR, MAX_BAR) + '%';
    if (barRepay) barRepay.style.width = MAX_BAR + '%';

    if (advanceInput) advanceInput.value = fmt(amount);
    if (advanceSlider) {
      advanceSlider.value = amount;
      paintSlider(advanceSlider);
    }
    if (termSlider) {
      termSlider.value = termMonths;
      paintSlider(termSlider);
    }

    pushFeedRow(dailyDebit);

    if (aprCallout && !prefersReducedMotion) {
      gsap.fromTo(aprCallout, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: 'power2.out' });
      if (apr >= 150) {
        gsap.fromTo(aprCallout, { x: 0 }, { x: 4, duration: 0.06, repeat: 5, yoyo: true, ease: 'power1.inOut' });
      }
    }
  }

  if (advanceSlider) {
    advanceSlider.addEventListener('input', () => {
      updateCalculator(parseInt(advanceSlider.value, 10));
    });
    paintSlider(advanceSlider);
  }

  if (termSlider) {
    termSlider.addEventListener('input', () => {
      updateCalculator(parseInt(advanceSlider?.value || '100000', 10), parseInt(termSlider.value, 10));
    });
    paintSlider(termSlider);
  }

  if (advanceInput) {
    advanceInput.addEventListener('blur', () => {
      let val = parseAdvance(advanceInput.value);
      val = Math.max(25000, Math.min(500000, val));
      val = Math.round(val / 5000) * 5000;
      updateCalculator(val);
    });
    advanceInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') advanceInput.blur();
    });
  }

  updateCalculator(100000, 5);

  ScrollTrigger.create({
    trigger: '#calculator',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      if (prefersReducedMotion) return;
      gsap.from('#bar-receive, #bar-repay', {
        width: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out'
      });
    }
  });

  /* ── Quote hover ── */
  document.querySelectorAll('.quote').forEach((card) => {
    card.addEventListener('mouseenter', () => {
      if (prefersReducedMotion) return;
      gsap.to(card, { y: -4, duration: 0.35, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, duration: 0.35, ease: 'power2.out' });
    });
  });

  /* ── Testimonial hover lift (legacy) ── */
  document.querySelectorAll('.testimonial').forEach((card) => {
    card.addEventListener('mouseenter', () => {
      if (prefersReducedMotion) return;
      gsap.to(card, { y: -6, duration: 0.35, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, duration: 0.35, ease: 'power2.out' });
    });
  });

  /* ── Button micro-interactions ── */
  document.querySelectorAll('.btn, .btn-recover, .cta-orb').forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      if (prefersReducedMotion) return;
      gsap.to(btn, { scale: 1.02, duration: 0.2, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { scale: 1, duration: 0.2, ease: 'power2.out' });
    });
  });

  /* ── Parallax on hero glow ── */
  if (!prefersReducedMotion) {
    gsap.to('.hero-glow', {
      y: 80,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });
  }

  /* ── Chart line dash setup ── */
  document.querySelectorAll('.chart-line, .forecast-line').forEach((path) => {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
  });

  /* ── Refresh on load ── */
  drawNeverContours();
  window.addEventListener('resize', drawNeverContours);
  window.addEventListener('load', () => {
    drawNeverContours();
    ScrollTrigger.refresh();
  });

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set('.reveal, .never-card', { autoAlpha: 1, y: 0, scale: 1 });
    gsap.killTweensOf('#browser-frame');
    if (ctaOrb) ctaOrb.classList.add('is-visible');
  });
})();
