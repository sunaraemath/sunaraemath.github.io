// Builds the page from content/site.yml.
// To change what the page says, edit that file.
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Blank lines split paragraphs; single line breaks stay as line breaks
  const paras = text => String(text ?? "").trim().split(/\n\s*\n/).filter(Boolean)
    .map(p => `<p>${esc(p.trim()).replace(/\n/g, "<br>")}</p>`).join("");
  const items = list => (list || []).map(li => `<li>${esc(li)}</li>`).join("");
  const isBlank = s => !s || /^\[.*\]$/.test(String(s).trim());
  const fill = (key, html) => $$(`[data-site="${key}"]`).forEach(el => { el.innerHTML = html; });

  function render(S) {
    fill("name", esc(S.name));
    fill("shortName", esc(S.short_name || S.name));
    $$('[data-site="mark"]').forEach(img => { img.src = S.mark; img.alt = S.name; });
    fill("intro", paras(S.intro));
    if (S.main_photo) {
      $$('[data-site="heroPhoto"]').forEach(el => { el.style.backgroundImage = `url("${S.main_photo}")`; el.textContent = ""; });
    }
    fill("footer", esc(S.footer));

    const d = S.director || {};
    fill("directorName", esc(d.name));
    fill("directorRole", esc(d.title));
    fill("career", items(d.career));
    fill("message", paras(d.philosophy));
    if (d.photo) $('[data-site="directorPhoto"]').style.backgroundImage = `url("${d.photo}")`;

    fill("classes", (S.classes || []).map(c => `
      <div class="class-item">
        <h3>${esc(c.name)}</h3>
        <div>
          ${c.summary ? `<p class="summary">${esc(c.summary)}</p>` : ""}
          <ul>${items(c.details)}</ul>
        </div>
      </div>`).join(""));

    const L = S.location || {};
    const q = isBlank(L.address) ? "" : encodeURIComponent(L.address);
    const mapLinks = [
      ["네이버 지도", L.naver_map || (q && `https://map.naver.com/p/search/${q}`)],
      ["카카오맵", L.kakao_map || (q && `https://map.kakao.com/?q=${q}`)]
    ].filter(([, url]) => url)
      .map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`)
      .join("");
    const phone = String(L.phone ?? "");
    const tel = phone.replace(/[^\d+]/g, "");
    const row = (label, value, html) => value ? `<div><dt>${label}</dt><dd>${html || esc(value)}</dd></div>` : "";

    fill("location", `
      <div class="loc">
        ${L.map ? `<img class="map" src="${esc(L.map)}" alt="${esc(S.name)} 약도">` : `<div class="map">약도 이미지 자리</div>`}
        <div>
          <dl class="info">
            ${row("주소", L.address)}
            ${row("위치", L.detail)}
            ${row("전화", phone, tel && `<a class="tel" href="tel:${tel}">${esc(phone)}</a>`)}
            ${row("운영 시간", L.hours)}
          </dl>
          ${mapLinks ? `<div class="map-links">${mapLinks}</div>` : ""}
        </div>
      </div>`);

    const A = S.apply || {};
    fill("applyTitle", esc(A.title));
    fill("applyText", paras(A.text));
    const applyLink = $('[data-site="applyLink"]');
    applyLink.textContent = A.button || "상담 신청서 작성하기";
    applyLink.href = A.link || "#";
  }

  // ----- Pages (one view at a time, chosen by the #hash) -----
  const views = $$(".view").map(v => v.dataset.view);
  const titles = { director: "원장 소개", classes: "수업 안내", location: "오시는 길" };
  let siteName = document.title;

  function show() {
    const id = location.hash.slice(1);
    const view = views.includes(id) ? id : "home";
    $$(".view").forEach(v => { v.hidden = v.dataset.view !== view; });
    $$(".nav a, .drawer a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${view}`));
    document.title = titles[view] ? `${titles[view]} · ${siteName}` : siteName;
    closeMenu();
    window.scrollTo(0, 0);
    if (id === "apply") openApply();  // a shared link ending in #apply opens the popup right away
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

  // ----- Apply popup: short note + button to the Naver form -----
  const dialog = $(".apply-dialog");

  function openApply() {
    closeMenu();
    if (!dialog.open) dialog.showModal();
  }
  $$("[data-apply]").forEach(b => b.addEventListener("click", openApply));
  $(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });  // click outside the box
  $('[data-site="applyLink"]').addEventListener("click", () => dialog.close());

  // Each page opens at the top instead of the browser's remembered position
  history.scrollRestoration = "manual";
  window.addEventListener("hashchange", show);

  fetch("content/site.yml", { cache: "no-cache" })
    .then(res => { if (!res.ok) throw new Error(`content/site.yml (${res.status})`); return res.text(); })
    .then(text => {
      const S = jsyaml.load(text);
      render(S);
      siteName = S.name;
    })
    .catch(err => {
      // Most likely a typo in site.yml; say where so it can be fixed
      $(".page").insertAdjacentHTML("afterbegin",
        `<p class="load-error">content/site.yml 파일을 읽지 못했어요. 최근에 고친 부분의 따옴표나 들여쓰기를 확인해 주세요.<br><small>${esc(err.message)}</small></p>`);
    })
    .finally(() => {
      body.classList.add("ready");
      show();
    });
})();
