/* Alic Service Pages — nav, reveals, counters */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fmt(n) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  /* ── Nav ── */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navBackdrop = document.getElementById('nav-backdrop');
  const navProgress = document.getElementById('nav-progress');

  function updateNavScroll() {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    nav?.classList.toggle('scrolled', y > 40);
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
    { sel: '.service-paths.panel-navy', cls: 'is-dark' },
    { sel: '.service-proof-stats-dark', cls: 'is-dark' },
    { sel: '#cta', cls: 'is-dark' }
  ];

  darkSections.forEach(({ sel, cls }) => {
    const trigger = document.querySelector(sel);
    if (!trigger) return;
    ScrollTrigger.create({
      trigger,
      start: 'top 80px',
      end: 'bottom 80px',
      onEnter: () => nav?.classList.add(cls),
      onLeave: () => nav?.classList.remove(cls),
      onEnterBack: () => nav?.classList.add(cls),
      onLeaveBack: () => nav?.classList.remove(cls)
    });
  });

  function closeNav() {
    nav?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    if (navBackdrop) navBackdrop.hidden = true;
  }

  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    if (navBackdrop) navBackdrop.hidden = !open;
  });

  navBackdrop?.addEventListener('click', closeNav);
  navLinks?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));

  /* ── Sticky CTA orb ── */
  const ctaOrb = document.getElementById('cta-orb');
  const heroTrigger = document.querySelector('.service-hero');
  if (ctaOrb && heroTrigger) {
    ScrollTrigger.create({
      trigger: heroTrigger,
      start: 'bottom 60%',
      onEnter: () => ctaOrb.classList.add('is-visible'),
      onLeaveBack: () => ctaOrb.classList.remove('is-visible')
    });
  }

  /* ── Hero entrance ── */
  if (!prefersReducedMotion) {
    gsap.from('.service-hero-inner > *', {
      autoAlpha: 0,
      y: 28,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.1
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

  /* ── Counters ── */
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';

    if (prefersReducedMotion) {
      el.textContent = prefix + fmt(target) + suffix;
      return;
    }

    const proxy = { val: 0 };
    gsap.to(proxy, {
      val: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => {
        el.textContent = prefix + fmt(Math.round(proxy.val)) + suffix;
      }
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
})();
