/* ==============================
   CONFIG
============================== */

const SHEET_ID =
  "2PACX-1vTYwEzVNtmrj5rXIGekpYFkPE8K1ljPu9O6aRzaKaFLGmNYGbUuYYeAuXDH2TlfuOjjFNt0A334Pr-t";

/* 🔴 IMPORTANT: REPLACE THESE GIDs WITH YOUR REAL ONES */
const TABS = {
  settings: 0,
  hero: 47314690,
  services: 2115602335,
  team: 2083947791,
  areas: 2078424701,
  faq: 1404829501,
  reviews: 2124503187,
  why_us: 991971280
};

/* ==============================
   HELPERS
============================== */

function sheetUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=${gid}&single=true&output=tsv`;
}

async function fetchSheet(gid) {
  const res = await fetch(sheetUrl(gid));
  const text = await res.text();
  return parseTSV(text);
}

function parseTSV(tsv) {
  if (!tsv.trim()) return [];
  const lines = tsv.trim().split("\n");
  const headers = lines.shift().split("\t");

  return lines.map(line => {
    const values = line.split("\t");
    return headers.reduce((obj, h, i) => {
      obj[h.trim()] = values[i]?.trim() || "";
      return obj;
    }, {});
  });
}

function keyValueToObject(rows) {
  const obj = {};
  rows.forEach(r => {
    if (r.key && r.value) obj[r.key] = r.value;
  });
  return obj;
}

/* ==============================
   POPULATORS
============================== */

function populateText(data) {
  document.querySelectorAll("[data-text]").forEach(el => {
    const key = el.dataset.text;
    el.textContent = data[key] || "";
  });
}

function populateLinks(settings) {
  document.querySelectorAll("[data-phone]").forEach(el => {
    el.textContent = settings.phone_main || "";
    el.href = `tel:${settings.phone_main || ""}`;
  });

  document.querySelectorAll("[data-email]").forEach(el => {
    el.textContent = settings.email || "";
    el.href = `mailto:${settings.email || ""}`;
  });
}

/* ==============================
   RENDER FUNCTIONS
============================== */

function renderServices(items) {
  const grid = document.querySelector(".services-grid");
  if (!grid) return;

  grid.innerHTML = items.map(s => `
    <div class="service-card">
      <div class="service-icon">${s.icon || "🛠️"}</div>
      <h3>${s.title || ""}</h3>
      <p>${s.description || ""}</p>
    </div>
  `).join("");

  const cards = grid.querySelectorAll(".service-card");
  staggerReveal(cards);
}

function renderTeam(items) {
  const grid = document.querySelector(".team-grid");
  if (!grid) return;

  grid.innerHTML = items.map(m => `
    <div class="team-card">
      <h3>${m.name || ""}</h3>
      <span class="role">${m.role || ""}</span>
      <p>${m.bio || ""}</p>
    </div>
  `).join("");
}

function renderAreas(items) {
  const list = document.querySelector(".areas-list");
  if (!list) return;

  list.innerHTML = items
    .map(a => Object.values(a)[0])
    .filter(Boolean)
    .map(v => `<li>${v}</li>`)
    .join("");
}

function renderFAQ(items) {
  const container = document.querySelector(".faq-list");
  if (!container) return;

  container.innerHTML = items.map((f, i) => `
    <div class="faq-item ${i === 0 ? "active" : ""}">
      <button class="faq-question">
        <span>${f.question || ""}</span>
        <span class="faq-icon">⌄</span>
      </button>
      <div class="faq-answer">
        <p>${f.answer || ""}</p>
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const open = container.querySelector(".faq-item.active");

      if (open && open !== item) open.classList.remove("active");
      item.classList.toggle("active");
    });
  });
}

function renderReviews(items) {
  const grid = document.querySelector(".reviews-grid");
  if (!grid) return;

  grid.innerHTML = items.map(r => `
    <div class="review-card">
      <div class="stars">${"★".repeat(Number(r.rating || 5))}</div>
      <p>${r.text || ""}</p>
      <span class="reviewer">— ${r.author || ""}</span>
    </div>
  `).join("");
}

function staggerReveal(cards, delay = 120) {
  cards.forEach((card, i) => {
    setTimeout(() => {
      card.classList.add("reveal-in");
    }, i * delay);
  });
}

function renderWhyUs(items) {
  const grid = document.querySelector("#why-us .why-grid");
  if (!grid) return;

  grid.innerHTML = items.map(w => `
    <div class="why-card">
      <div class="why-icon">${w.icon || "🛠️"}</div>
      <h3>${w.title || "Title"}</h3>
      <p>${w.description || "Description"}</p>
    </div>
  `).join("");
}

/* ==============================
   INIT
============================== */

async function initSite() {
  const settings = keyValueToObject(await fetchSheet(TABS.settings));
  const hero = keyValueToObject(await fetchSheet(TABS.hero));

  const services = await fetchSheet(TABS.services);
  const team = await fetchSheet(TABS.team);
  const areas = await fetchSheet(TABS.areas);
  const faq = await fetchSheet(TABS.faq);
  const reviews = await fetchSheet(TABS.reviews);

  const whyUs = await fetchSheet(TABS.why_us);
  renderWhyUs(whyUs);

  populateText({ ...settings, ...hero });
  populateLinks(settings);

  const heroImg = document.getElementById("hero-image");
  if (heroImg && hero.hero_image) heroImg.src = hero.hero_image;

  const wa = document.querySelector(".whatsapp-float");
  if (wa && settings.whatsapp_number) {
    wa.href = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(settings.whatsapp_message || "")}`;
  }

  renderServices(services);
  renderTeam(team);
  renderAreas(areas);
  renderFAQ(faq);
  renderReviews(reviews);
}

document.addEventListener("DOMContentLoaded", initSite);