(() => {
  const S = window.SITE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const paras = list => list.map(p => `<p>${esc(p)}</p>`).join("");
  const items = list => list.map(li => `<li>${esc(li)}</li>`).join("");
  const isBlank = s => !s || /^\[.*\]$/.test(s.trim());

  // ----- Fill content -----
  const fill = (key, html) => $$(`[data-site="${key}"]`).forEach(el => { el.innerHTML = html; });

  fill("name", esc(S.name));
  fill("shortName", esc(S.shortName));
  $$('[data-site="mark"]').forEach(img => { img.src = S.mark; img.alt = S.name; });
  fill("intro", `<p>${esc(S.intro)}</p>`);
  if (S.heroPhoto) {
    $$('[data-site="heroPhoto"]').forEach(el => { el.style.backgroundImage = `url("${S.heroPhoto}")`; el.textContent = ""; });
  }
  fill("footer", esc(S.footer));

  const d = S.director;
  fill("directorName", esc(d.name));
  fill("directorRole", esc(d.role));
  fill("career", items(d.career));
  fill("message", paras(d.message));
  if (d.photo) $('[data-site="directorPhoto"]').style.backgroundImage = `url("${d.photo}")`;

  fill("classes", S.classes.map(c => `
    <div class="class-item">
      <h3>${esc(c.name)}</h3>
      <div>
        <p class="summary">${esc(c.summary)}</p>
        <ul>${items(c.details)}</ul>
      </div>
    </div>`).join(""));

  const L = S.location;
  const mapUrl = link => {
    if (link.url) return link.url;
    if (isBlank(L.address)) return "";
    const q = encodeURIComponent(L.address);
    if (link.label.includes("네이버")) return `https://map.naver.com/p/search/${q}`;
    if (link.label.includes("카카오")) return `https://map.kakao.com/?q=${q}`;
    return "";
  };
  const links = L.links
    .map(l => ({ label: l.label, url: mapUrl(l) }))
    .filter(l => l.url)
    .map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`)
    .join("");
  const infoRow = (label, value, html) => value ? `<div><dt>${label}</dt><dd>${html || esc(value)}</dd></div>` : "";
  const tel = L.phone.replace(/[^\d+]/g, "");

  fill("location", `
    <div class="loc">
      ${L.map ? `<img class="map" src="${esc(L.map)}" alt="${esc(S.name)} 약도">` : `<div class="map">약도 이미지 자리</div>`}
      <div>
        <dl class="info">
          ${infoRow("주소", L.address)}
          ${infoRow("위치", L.detail)}
          ${infoRow("전화", L.phone, tel ? `<a class="tel" href="tel:${tel}">${esc(L.phone)}</a>` : "")}
          ${infoRow("운영 시간", L.hours)}
        </dl>
        ${links ? `<div class="map-links">${links}</div>` : ""}
      </div>
    </div>`);

  fill("applyLead", esc(S.apply.lead));
  fill("applyForms", S.apply.forms.map(f => f.url
    ? `<a class="choice" href="${esc(f.url)}" target="_blank" rel="noopener">
         <span>${esc(f.label)}</span>
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
       </a>`
    : `<div class="choice is-empty"><span>${esc(f.label)}</span><small>준비 중</small></div>`
  ).join(""));

  // ----- Pages (one view at a time, chosen by the #hash) -----
  const views = $$(".view").map(v => v.dataset.view);
  const titles = { director: "원장 소개", classes: "수업 안내", location: "오시는 길" };

  function show() {
    const id = location.hash.slice(1);
    const view = views.includes(id) ? id : "home";
    $$(".view").forEach(v => { v.hidden = v.dataset.view !== view; });
    $$(".nav a, .drawer a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${view}`));
    document.title = titles[view] ? `${titles[view]} · ${S.name}` : S.name;
    closeMenu();
    window.scrollTo(0, 0);
    if (id === "apply") openApply();  // a shared link ending in #apply opens the choice right away
  }

  // ----- Mobile menu -----
  const body = document.body;
  const menuBtn = $(".menu-btn");
  const scrim = $(".scrim");

  function openMenu() {
    body.classList.add("menu-open");
    scrim.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
  }
  function closeMenu() {
    body.classList.remove("menu-open");
    scrim.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  }
  menuBtn.addEventListener("click", openMenu);
  $(".close-btn").addEventListener("click", closeMenu);
  scrim.addEventListener("click", closeMenu);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

  // ----- Apply popup: pick 중등부 / 고등부, then open its Naver form -----
  const dialog = $(".apply-dialog");

  function openApply() {
    closeMenu();
    if (!dialog.open) dialog.showModal();
  }
  $$("[data-apply]").forEach(b => b.addEventListener("click", openApply));
  $(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });  // click outside the box
  $$(".choice[href]", dialog).forEach(a => a.addEventListener("click", () => dialog.close()));

  // Each page opens at the top instead of the browser's remembered position
  history.scrollRestoration = "manual";
  window.addEventListener("hashchange", show);
  show();
})();
