const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const form = document.querySelector(".enquiry-form");
const counters = document.querySelectorAll("[data-count]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroImage = document.querySelector(".hero-image");

document.body.classList.toggle("motion-ready", !reducedMotion);

function updateHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

function updateHeroParallax() {
  if (reducedMotion || !heroImage) return;
  const hero = document.querySelector(".hero");
  const heroHeight = hero?.offsetHeight || 1;
  const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
  heroImage.style.transform = `translateY(${progress * 34}px) scale(1.04)`;
}

updateHeroParallax();
window.addEventListener("scroll", updateHeroParallax, { passive: true });

menuToggle?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = form.querySelector("button");
  const originalText = button.textContent;
  button.textContent = "Enquiry ready";
  window.setTimeout(() => {
    button.textContent = originalText;
  }, 1800);
});

function setCounterValue(element, value) {
  const decimals = String(element.dataset.count).includes(".") ? 1 : 0;
  element.textContent = Number(value).toFixed(decimals);
}

function animateCounter(element) {
  const target = Number(element.dataset.count);
  const start = performance.now();
  const duration = 1300;

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    setCounterValue(element, target * eased);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

if (reducedMotion) {
  counters.forEach((counter) => setCounterValue(counter, counter.dataset.count));
} else if (counters.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.65 });

  counters.forEach((counter) => counterObserver.observe(counter));
}

function markRevealTargets() {
  const revealSelectors = [
    ".proof-intro",
    ".section-heading",
    ".lead",
    ".split-copy",
    ".quality-copy",
    ".people-section > div",
    ".cta-section > div",
    ".enquiry-form",
    ".site-footer > *",
  ];

  document.querySelectorAll(revealSelectors.join(",")).forEach((element) => {
    element.classList.add("reveal");
  });

  document.querySelectorAll(".metric").forEach((element) => {
    element.classList.add("reveal");
  });

  document.querySelectorAll(
    ".value-card, .service-card, .process-grid article, .proof-grid article, .resource-grid article, .sector-list span"
  ).forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
  });

  document.querySelectorAll(".split-section img, .people-section img").forEach((image) => {
    image.classList.add("image-reveal");
  });

  document.querySelectorAll(".split-copy, .quality-copy, .cta-section > div").forEach((element) => {
    element.classList.add("reveal-from-left");
  });

  document.querySelectorAll(".people-section > div, .enquiry-form").forEach((element) => {
    element.classList.add("reveal-from-right");
  });
}

function initReveals() {
  markRevealTargets();
  const revealElements = document.querySelectorAll(".reveal, .image-reveal");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("in-view"));
    return;
  }

  const imageRevealMap = new Map();
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const linkedImage = imageRevealMap.get(entry.target);
      if (linkedImage) {
        linkedImage.classList.add("in-view");
      } else {
        entry.target.classList.add("in-view");
      }
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.01, rootMargin: "0px 0px 18% 0px" });

  revealElements.forEach((element) => {
    if (element.classList.contains("image-reveal")) {
      const trigger = element.closest("section") || element.parentElement || element;
      imageRevealMap.set(trigger, element);
      revealObserver.observe(trigger);
      return;
    }

    revealObserver.observe(element);
  });
}

initReveals();
