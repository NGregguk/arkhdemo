const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const form = document.querySelector(".enquiry-form");

function updateHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

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
