const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('vis');
      }
    });
  },
  { threshold: 0.08, rootMargin: '-10px 0px' }
);

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const sections = Array.from(document.querySelectorAll('section[id], footer[id]'));
const navLinks = Array.from(document.querySelectorAll('.nav-menu a[href^="#"]'));
const navToggle = document.querySelector('.nav-toggle');
const navbar = document.getElementById('navbar');

function setActiveNav(linkHref) {
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === linkHref);
  });
}

function updateActiveSection() {
  const navbar = document.getElementById('navbar');
  const navbarHeight = (navbar && navbar.offsetHeight) ? navbar.offsetHeight : 64;
  const buffer = 16; // small buffer so section becomes active slightly after passing the navbar
  const scrollPosition = window.scrollY + navbarHeight + buffer;

  let currentSectionId = 'home';
  sections.forEach((section) => {
    if (scrollPosition >= section.offsetTop) {
      currentSectionId = section.id;
    }
  });

  setActiveNav(`#${currentSectionId}`);
}

window.addEventListener('scroll', updateActiveSection, { passive: true });
window.addEventListener('load', updateActiveSection);
window.addEventListener('resize', updateActiveSection);

// IntersectionObserver-based section tracker (more reliable than scroll position)
let sectionObserver = null;
function createSectionObserver() {
  if (sectionObserver) sectionObserver.disconnect();
  const navbar = document.getElementById('navbar');
  const navbarHeight = (navbar && navbar.offsetHeight) ? navbar.offsetHeight : 64;
  const rootMargin = `-${navbarHeight}px 0px -40% 0px`;

  sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((e) => e.isIntersecting);
    if (visible.length > 0) {
      visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      const topEntry = visible[0];
      setActiveNav(`#${topEntry.target.id}`);
    }
  }, { threshold: [0.15, 0.25, 0.5, 0.75], rootMargin });

  sections.forEach((s) => sectionObserver.observe(s));
}

window.addEventListener('load', createSectionObserver);
window.addEventListener('resize', createSectionObserver);

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      setActiveNav(href);
    }
    if (navbar.classList.contains('nav-open')) {
      navbar.classList.remove('nav-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });
  // Also handle touch and pointer events so mobile devices set active on first tap
  link.addEventListener('touchstart', (e) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      setActiveNav(href);
    }
  }, { passive: true });
  link.addEventListener('pointerdown', (e) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      setActiveNav(href);
    }
  });
});

navToggle?.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navbar.classList.toggle('nav-open', !expanded);
});

updateActiveSection();
