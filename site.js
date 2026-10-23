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
  fill("intro", paras(S.intro));
  fill("applyLead", esc(S.apply.lead));
  fill("privacy", items(S.apply.privacy));
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
  const infoRow = (label, value) => value ? `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>` : "";

  fill("location", `
    <div class="loc">
      ${L.map ? `<img class="map" src="${esc(L.map)}" alt="${esc(S.name)} 약도">` : `<div class="map">약도 이미지 자리</div>`}
      <div>
        <dl class="info">
          ${infoRow("주소", L.address)}
          ${infoRow("위치", L.detail)}
          ${infoRow("전화", L.phone)}
          ${infoRow("상담", L.hours)}
        </dl>
        ${L.directions.length ? `<ul class="directions">${items(L.directions)}</ul>` : ""}
        ${links ? `<div class="map-links">${links}</div>` : ""}
      </div>
    </div>`);

  // ----- Pages (one view at a time, chosen by the #hash) -----
  const views = $$(".view").map(v => v.dataset.view);
  const titles = { director: "원장 소개", classes: "수업 안내", location: "오시는 길", apply: "상담 신청" };

  function show() {
    const id = location.hash.slice(1);
    const view = views.includes(id) ? id : "home";
    $$(".view").forEach(v => { v.hidden = v.dataset.view !== view; });
    $$(".nav a, .drawer a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${view}`));
    document.title = titles[view] ? `${titles[view]} · ${S.name}` : S.name;
    closeMenu();
    window.scrollTo(0, 0);
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

  // Each page opens at the top instead of the browser's remembered position
  history.scrollRestoration = "manual";
  window.addEventListener("hashchange", show);
  show();

  // ----- Apply form -----
  const form = $("#apply-form");
  const status = $(".form-status");
  const val = name => (form.elements[name]?.value || "").trim();

  // Fields that appear only for certain answers (선행 → 선행 진도, 기타 → 직접 입력)
  function toggleConditional() {
    $$("[data-show-when]", form).forEach(el => {
      const [name, value] = el.dataset.showWhen.split("=");
      el.hidden = val(name) !== value;
    });
  }
  form.addEventListener("change", toggleConditional);

  // 01012345678 → 010-1234-5678
  const phone = form.elements.phone;
  phone.addEventListener("input", () => {
    const n = phone.value.replace(/\D/g, "").slice(0, 11);
    phone.value = n.length < 4 ? n
      : n.length < 8 ? `${n.slice(0, 3)}-${n.slice(3)}`
      : n.length < 11 ? `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`
      : `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`;
  });

  function setError(name, msg) {
    const err = $(`.err[data-for="${name}"]`, form);
    if (err) err.textContent = msg;
    const el = form.elements[name];
    if (el && el.tagName) el.classList.toggle("invalid", !!msg);
  }
  form.addEventListener("input", e => setError(e.target.name, ""));
  form.addEventListener("change", e => {
    setError(e.target.name, "");
    if (e.target.name.endsWith("Other")) setError(e.target.name.replace("Other", ""), "");
  });

  function validate() {
    const errors = {};
    if (!val("name")) errors.name = "학생 성명을 적어주세요.";
    if (!/^01\d-\d{3,4}-\d{4}$/.test(val("phone"))) errors.phone = "연락처를 010-1234-5678 형식으로 적어주세요.";
    if (!val("gender")) errors.gender = "성별을 선택해 주세요.";
    if (!val("school")) errors.school = "학교를 적어주세요.";
    if (!val("grade")) errors.grade = "학년을 선택해 주세요.";
    if (!val("progress")) errors.progress = "진도를 선택해 주세요.";
    else if (val("progress") === "선행" && !val("advance")) errors.advance = "선행 진도를 적어주세요.";
    if (!val("days")) errors.days = "수업 요일을 선택해 주세요.";
    else if (val("days") === "기타" && !val("daysOther")) errors.days = "희망 요일을 적어주세요.";
    if (!val("hours")) errors.hours = "희망 시간을 선택해 주세요.";
    else if (val("hours") === "기타" && !val("hoursOther")) errors.hours = "희망 시간을 적어주세요.";
    if (!form.elements.consent.checked) errors.consent = "개인정보 수집·이용에 동의해 주세요.";
    return errors;
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    status.textContent = "";
    status.classList.remove("error");

    const errors = validate();
    $$(".err", form).forEach(el => setError(el.dataset.for, errors[el.dataset.for] || ""));
    const first = Object.keys(errors)[0];
    if (first) {
      const target = $(`.err[data-for="${first}"]`, form).closest(".field, .consent");
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (val("website")) return;  // spam bot filled the hidden field

    if (!S.apply.endpoint) {
      status.textContent = "접수 기능이 아직 연결되지 않았어요. 전화로 문의해 주세요.";
      status.classList.add("error");
      return;
    }

    const data = {
      name: val("name"),
      phone: val("phone"),
      gender: val("gender"),
      school: val("school"),
      grade: val("grade"),
      progress: val("progress"),
      advance: val("progress") === "선행" ? val("advance") : "",
      score: val("score"),
      otherAcademy: val("otherAcademy"),
      days: val("days") === "기타" ? `기타: ${val("daysOther")}` : val("days"),
      hours: val("hours") === "기타" ? `기타: ${val("hoursOther")}` : val("hours"),
      friend: val("friend")
    };

    const button = $("button[type=submit]", form);
    button.disabled = true;
    status.textContent = "보내는 중…";
    try {
      // Google Apps Script doesn't send CORS headers, so the reply can't be read; a network error still throws.
      await fetch(S.apply.endpoint, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) });
      form.hidden = true;
      $(".done").hidden = false;
      $(".done").scrollIntoView({ block: "center" });
    } catch {
      status.textContent = "신청서를 보내지 못했어요. 인터넷 연결을 확인하고 다시 눌러주세요.";
      status.classList.add("error");
    } finally {
      button.disabled = false;
    }
  });
})();
