/* ================================================================
   AGRINHO — AGRO FORTE, FUTURO SUSTENTÁVEL
   Script principal (interatividade do site)
   Sumário:
   1 utilidades · 2 header/menu · 3 scrollspy + reveal
   4 hero (scramble, parallax, canteiro) · 5 contadores
   6 calculadora verde · 7 quiz · 8 missão verde · 9 mural
================================================================ */
(function(){
"use strict";

/* ---------- 1. utilidades ---------- */
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmt = n => Math.round(n).toLocaleString("pt-BR");
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const escapeHTML = s => s.replace(/[&<>"']/g, m =>
  ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));

/* ---------- 2. header, progresso, voltar ao topo ---------- */
const header = $(".top"), bar = $("#progressBar"), toTop = $("#toTop");
function onScroll(){
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 10);
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  toTop.classList.toggle("show", y > 600);
}
addEventListener("scroll", onScroll, { passive:true });
onScroll();
toTop.addEventListener("click", () =>
  window.scrollTo({ top:0, behavior: reduced ? "auto" : "smooth" }));

/* ---------- menu móvel ---------- */
const mNav = $("#mobileNav"), burger = $("#navToggle");
function setMenu(open){
  mNav.classList.toggle("open", open);
  mNav.setAttribute("aria-hidden", String(!open));
  burger.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
}
burger.addEventListener("click", () => setMenu(true));
$("#navClose").addEventListener("click", () => setMenu(false));
$$("#mobileNav a").forEach(a => a.addEventListener("click", () => setMenu(false)));

/* ---------- 3. scrollspy + reveal ---------- */
const spyLinks = $$("nav.main a[data-spy]");
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting){
      spyLinks.forEach(l =>
        l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    }
  });
}, { rootMargin:"-40% 0px -55% 0px" });
$$("main section[id]").forEach(s => spy.observe(s));

const reveal = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting){ e.target.classList.add("in"); reveal.unobserve(e.target); }
  });
}, { threshold:.15 });
$$(".reveal").forEach(el => reveal.observe(el));

/* ---------- 4. hero: scramble, parallax, canteiro ---------- */
// efeito de "decodificação" no texto de abertura
function scramble(el){
  const txt = el.dataset.text;
  if (reduced){ el.textContent = txt; return; }
  const glyphs = "▚▞#%&*+=AGRMNHSTVZ0123456789";
  const t0 = performance.now(), dur = 1100;
  (function tick(now){
    const p = Math.min(1, (now - t0) / dur), cut = Math.floor(p * txt.length);
    let out = "";
    for (let i = 0; i < txt.length; i++){
      out += i < cut ? txt[i]
        : (txt[i] === " " || txt[i] === "✦" ? txt[i]
        : glyphs[(Math.random() * glyphs.length) | 0]);
    }
    el.textContent = out;
    if (p < 1) requestAnimationFrame(tick); else el.textContent = txt;
  })(t0);
}
setTimeout(() => scramble($(".scramble")), 250);

// parallax suave das camadas de morros
const hills = $$(".hill");
if (!reduced && matchMedia("(pointer:fine)").matches){
  $(".hero").addEventListener("mousemove", e => {
    const cx = e.clientX / innerWidth - .5, cy = e.clientY / innerHeight - .5;
    hills.forEach(h => {
      const d = +h.dataset.depth;
      h.style.transform = `translate(${cx * d}px, ${cy * d * .35}px)`;
    });
  });
}

// canteiro interativo: clique para plantar sementes
const canteiro = $("#canteiro"), seedCount = $("#seedCount");
let seeds = +(localStorage.getItem("agrinho.sementes") || 0);
seedCount.textContent = seeds;
const sproutSVG = `<svg viewBox="0 0 44 52" width="44" height="52"><path d="M22 52V22" stroke="#3f7e34" stroke-width="3.4" stroke-linecap="round" fill="none"/><path d="M22 26C10 26 4 18 3 8c9 0 16 6 19 18z" fill="#4b9b3e" stroke="#2c5a24" stroke-width="1.6"/><path d="M22 30c12 0 18-8 19-18-9 0-16 6-19 18z" fill="#8cc152" stroke="#2c5a24" stroke-width="1.6"/></svg>`;
function plant(x){
  const s = document.createElement("span");
  s.className = "sprout";
  s.style.left = Math.max(4, Math.min(x - 22, canteiro.clientWidth - 48)) + "px";
  s.innerHTML = sproutSVG;
  canteiro.appendChild(s);
  seeds++;
  seedCount.textContent = seeds;
  localStorage.setItem("agrinho.sementes", seeds);
  const all = $$(".sprout", canteiro);
  if (all.length > 60) all[0].remove();
}
canteiro.addEventListener("click", e => {
  const r = canteiro.getBoundingClientRect();
  plant(e.clientX - r.left);
});
canteiro.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " "){
    e.preventDefault();
    plant(Math.random() * canteiro.clientWidth);
  }
});

/* ---------- 5. contadores animados (seção Impacto) ---------- */
const counters = $$(".count");
const cObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    cObs.unobserve(e.target);
    const target = +e.target.dataset.count;
    if (reduced){ e.target.textContent = fmt(target); return; }
    const t0 = performance.now(), dur = 1700;
    (function step(now){
      const p = Math.min(1, (now - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
      e.target.textContent = fmt(target * ease);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  });
}, { threshold:.6 });
counters.forEach(c => cObs.observe(c));

/* ---------- 6. calculadora verde ---------- */
const rHa = $("#rHa"), rTr = $("#rTrees"), rCi = $("#rCis");
const oCo2 = $("#oCo2"), oW = $("#oWater"), oO2 = $("#oO2"), oKm = $("#oKm");
const bCo2 = $("#bCo2"), bW = $("#bWater"), bO2 = $("#bO2"), bKm = $("#bKm");
const MAX = {
  co2:   100*1400 + 500*20 + 30*8,
  water: 100*120000 + 30*6000,
  o2:    500*110,
  km:    (100*1400 + 500*20 + 30*8) * 6.7
};
const shown = { co2:0, water:0, o2:0, km:0 };
function tween(el, key, to){
  const from = shown[key];
  if (reduced){ shown[key] = to; el.textContent = fmt(to); return; }
  const t0 = performance.now(), dur = 480;
  (function step(now){
    const p = Math.min(1, (now - t0) / dur);
    shown[key] = from + (to - from) * p;
    el.textContent = fmt(shown[key]);
    if (p < 1) requestAnimationFrame(step); else shown[key] = to;
  })(t0);
}
function calc(){
  const ha = +rHa.value, tr = +rTr.value, ci = +rCi.value;
  $("#lHa").textContent    = ha + " ha";
  $("#lTrees").textContent = tr + " árvores";
  $("#lCis").textContent   = ci + (ci === 1 ? " unidade" : " unidades");
  const co2   = ha*1400 + tr*20 + ci*8;       // kg CO₂ evitados/ano
  const water = ha*120000 + ci*6000;          // litros preservados/ano
  const o2    = tr*110;                       // kg de oxigênio/ano
  const km    = co2 * 6.7;                    // km de carro compensados/ano
  tween(oCo2, "co2", co2);  tween(oW, "water", water);
  tween(oO2, "o2", o2);     tween(oKm, "km", km);
  bCo2.style.width = Math.min(100, co2   / MAX.co2   * 100) + "%";
  bW.style.width   = Math.min(100, water / MAX.water * 100) + "%";
  bO2.style.width  = Math.min(100, o2    / MAX.o2    * 100) + "%";
  bKm.style.width  = Math.min(100, km    / MAX.km    * 100) + "%";
}
[rHa, rTr, rCi].forEach(i => i.addEventListener("input", calc));
calc();

/* ---------- 7. quiz ---------- */
const QUESTIONS = [
  { q:"O plantio direto ajuda o solo porque…",
    a:["Revira a terra para deixá-la arejada",
       "Mantém a palhada protegendo o solo da chuva e do sol",
       "Usa mais máquinas e mais diesel"], c:1,
    why:"A palhada funciona como um cobertor: evita erosão, guarda umidade e alimenta a vida do solo." },
  { q:"ILPF é a sigla para…",
    a:["Irrigação, Luz, Poda e Feno",
       "Integração Lavoura-Pecuária-Floresta",
       "Insetos, Lagartas e Pragas da Folha"], c:1,
    why:"O sistema integra lavoura, pecuária e floresta na mesma área, gerando renda o ano todo e serviços ambientais." },
  { q:"Uma cisterna no campo serve para…",
    a:["Guardar sementes antigas",
       "Medir a força do vento",
       "Armazenar água da chuva para os períodos de estiagem"], c:2,
    why:"Cisternas captam água da chuva e garantem reserva para a seca — adaptação climática na prática." },
  { q:"Bioinsumos são…",
    a:["Produtos com microrganismos e inimigos naturais que reduzem químicos",
       "Sementes proibidas por lei",
       "Adubos importados muito caros"], c:0,
    why:"Eles nutrem plantas e controlam pragas com menos impacto, fortalecendo o equilíbrio do solo." },
  { q:"O que você pode fazer HOJE pelo futuro sustentável?",
    a:["Nada — isso é tarefa só do produtor rural",
       "Escolher alimentos da estação e de produtores locais, sem desperdício",
       "Usar mais descartáveis para economizar água"], c:1,
    why:"Consumo consciente apoia a agricultura local e reduz desperdício e emissões. Todo mundo faz parte do agro!" }
];
const quizBox = $("#quizBox");
let qi = 0, score = 0;

function renderQ(){
  const item = QUESTIONS[qi];
  const last = qi === QUESTIONS.length - 1;
  quizBox.innerHTML = `
    <div class="quiz-progress"><i style="width:${qi / QUESTIONS.length * 100}%"></i></div>
    <p class="mono" style="color:var(--gold-deep);margin-bottom:.6rem">Pergunta ${qi+1} de ${QUESTIONS.length}</p>
    <h3 class="quiz-q">${item.q}</h3>
    <div class="quiz-opts">
      ${item.a.map((opt, i) => `<button class="quiz-opt" data-i="${i}">${opt}</button>`).join("")}
    </div>
    <div class="quiz-why" id="qWhy">💡 ${item.why}</div>
    <button class="btn quiz-next" id="qNext">${last ? "Ver resultado 🌾" : "Próxima →"}</button>`;
  $$(".quiz-opt", quizBox).forEach(btn =>
    btn.addEventListener("click", () => answer(btn)));
  $("#qNext").addEventListener("click", () => {
    if (qi < QUESTIONS.length - 1){ qi++; renderQ(); }
    else renderResult();
  });
}
function answer(btn){
  const item = QUESTIONS[qi];
  $$(".quiz-opt", quizBox).forEach(b => {
    b.disabled = true;
    if (+b.dataset.i === item.c) b.classList.add("right");
  });
  if (+btn.dataset.i === item.c) score++;
  else btn.classList.add("wrong");
  $("#qWhy").classList.add("show");
  $("#qNext").classList.add("show");
  $(".quiz-progress i", quizBox).style.width = ((qi + 1) / QUESTIONS.length * 100) + "%";
}
function renderResult(){
  const emoji = score === 5 ? "🌳" : score >= 4 ? "🌿" : score >= 3 ? "🌱" : "🌰";
  const msg =
    score === 5 ? "Guardião(ã) da Mata! Você domina o agro sustentável." :
    score >= 4 ? "Cultivador(a) experiente! Falta pouquinho para o topo." :
    score >= 3 ? "Broto promissor! Continue explorando o site para crescer." :
                 "Semente em germinação! Role as seções e tente de novo.";
  quizBox.innerHTML = `
    <div class="quiz-progress"><i style="width:100%"></i></div>
    <div class="quiz-result show">
      <span class="big">${emoji}</span>
      <b>${score} de 5 acertos</b>
      <p>${msg}</p>
      <button class="btn" id="qRestart">↻ Jogar de novo</button>
    </div>`;
  $("#qRestart").addEventListener("click", () => { qi = 0; score = 0; renderQ(); });
}
renderQ();

/* ---------- 8. missão verde (localStorage) ---------- */
const LEVELS = [
  [0, "🌰 Semente dormente"],
  [1, "🌱 Broto curioso"],
  [3, "🌿 Cultivador(a)"],
  [5, "🌳 Guardião(ã) da mata"],
  [7, "🏆 Mestre da colheita"]
];
const mChecks = $$("#missaoList input");
const savedM = JSON.parse(localStorage.getItem("agrinho.missao") || "[]");
mChecks.forEach((c, i) => c.checked = !!savedM[i]);
function updateMissao(){
  const done = mChecks.filter(c => c.checked).length;
  localStorage.setItem("agrinho.missao", JSON.stringify(mChecks.map(c => c.checked)));
  $("#missaoBar").style.width = (done / 8 * 100) + "%";
  $("#missaoCount").textContent = done + " de 8 missões concluídas";
  let lvl = LEVELS[0][1];
  for (const [min, name] of LEVELS){ if (done >= min) lvl = name; }
  $("#missaoLevel").textContent = lvl;
  mChecks.forEach(c => c.closest(".m-item").classList.toggle("done", c.checked));
}
mChecks.forEach(c => c.addEventListener("change", updateMissao));
updateMissao();

/* ---------- 9. mural de compromissos (localStorage) ---------- */
const muralGrid = $("#muralGrid");
const DEFAULTS = [
  { nome:"Turma 5º B", msg:"Vamos montar uma composteira na escola e adubar a horta." },
  { nome:"Dona Marta", msg:"Trocar o canto esquecido do quintal por uma horta de temperos." },
  { nome:"João Pedro", msg:"Plantar uma muda de ipê no dia do meu aniversário." }
];
let commits = JSON.parse(localStorage.getItem("agrinho.mural") || "null") || DEFAULTS;
function drawMural(){
  muralGrid.innerHTML = commits.map((c, i) => `
    <article class="commit">
      <header><strong>${escapeHTML(c.nome)}</strong>
      <button class="del" data-del="${i}" aria-label="Remover compromisso">×</button></header>
      <p>“${escapeHTML(c.msg)}”</p>
      <footer>🌱 compromisso plantado</footer>
    </article>`).join("");
}
drawMural();
$("#muralForm").addEventListener("submit", e => {
  e.preventDefault();
  const nome = $("#mName").value.trim(), msg = $("#mMsg").value.trim();
  if (!nome || !msg) return;
  commits.unshift({ nome, msg });
  localStorage.setItem("agrinho.mural", JSON.stringify(commits));
  $("#mName").value = ""; $("#mMsg").value = "";
  drawMural();
});
muralGrid.addEventListener("click", e => {
  const d = e.target.dataset.del;
  if (d !== undefined){
    commits.splice(+d, 1);
    localStorage.setItem("agrinho.mural", JSON.stringify(commits));
    drawMural();
  }
});

/* ---------- extras ---------- */
// duplica a trilha do ticker para o loop infinito ficar perfeito
const track = $("#tickerTrack");
track.innerHTML += track.innerHTML;

// ano atual no rodapé
$("#year").textContent = new Date().getFullYear();
})();
