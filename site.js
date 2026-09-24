// ================= efeitos e transições (compartilhado) =================
(function(){
  const raiz = document.documentElement;
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.fxReduz = reduz;
  raiz.classList.add("fx");
  let raf = 0;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function rolar(y, dur){
    cancelAnimationFrame(raf);
    if (reduz) { scrollTo(0, y); return; }
    const ini = scrollY, d = y - ini, t0 = performance.now();
    dur = dur || Math.min(1600, 650 + Math.abs(d) * .2);
    const passo = t => { const p = Math.min(1, (t - t0) / dur); scrollTo(0, ini + d * ease(p)); raf = p < 1 ? requestAnimationFrame(passo) : 0; };
    raf = requestAnimationFrame(passo);
  }
  ["wheel", "touchstart"].forEach(ev => addEventListener(ev, () => { cancelAnimationFrame(raf); raf = 0; }, {passive: true}));
  window.fxRolarAte = el => {
    const topo = document.querySelector(".topo");
    rolar(Math.max(0, el.getBoundingClientRect().top + scrollY - (topo ? topo.offsetHeight : 0)));
  };
  function destacar(alvo){
    const h = alvo.matches("section, footer, div") ? (alvo.querySelector("h2") || alvo) : alvo;
    setTimeout(() => { h.classList.remove("fx-destaque"); void h.offsetWidth; h.classList.add("fx-destaque"); }, reduz ? 0 : 850);
  }
  window.fxDestacar = destacar;
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = decodeURIComponent(a.getAttribute("href").slice(1));
    const alvo = id ? document.getElementById(id) : null;
    if (!alvo) return;
    e.preventDefault();
    if (alvo.tagName === "MAIN") { rolar(0); return; }
    fxRolarAte(alvo); destacar(alvo);
  });
  const barra = document.createElement("div");
  barra.className = "fx-barra"; barra.setAttribute("aria-hidden", "true"); document.body.append(barra);
  const topo = document.querySelector(".topo");
  let pedido = false;
  addEventListener("scroll", () => {
    if (pedido) return; pedido = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      barra.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
      if (topo) topo.classList.toggle("rolou", scrollY > 20);
      pedido = false;
    });
  }, {passive: true});
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); }
  }), {rootMargin: "0px 0px -6% 0px", threshold: .06}) : null;
  window.fxRevelar = (sel, tipo) => document.querySelectorAll(sel).forEach(el => {
    if (el.classList.contains("visto")) return;
    if (!el.hasAttribute("data-revela")) el.setAttribute("data-revela", tipo || "");
    const irmaos = [...el.parentElement.children].filter(x => x.matches(sel));
    el.style.setProperty("--atraso", (Math.min(Math.max(0, irmaos.indexOf(el)), 6) * .09) + "s");
    if (io) io.observe(el); else el.classList.add("visto");
  });
  document.addEventListener("pointerdown", e => {
    const b = e.target.closest(".bt, .kit-bt, .contato-enviar, .barra-sacola, .modo button");
    if (!b || reduz) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.4;
    const o = document.createElement("span");
    o.className = "onda-clique";
    o.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left}px;top:${e.clientY - r.top}px`;
    if (getComputedStyle(b).position === "static") b.style.position = "relative";
    b.style.overflow = "hidden"; b.append(o);
    setTimeout(() => o.remove(), 800);
  });
  window.fxNumero = (el, valor, fmt, dur) => {
    if (typeof el === "string") el = document.getElementById(el);
    if (!el) return;
    const de = typeof el._v === "number" ? el._v : valor;
    el._v = valor;
    cancelAnimationFrame(el._raf);
    if (reduz || de === valor) { el.textContent = fmt(valor); return; }
    const t0 = performance.now(); dur = dur || 600;
    const passo = t => {
      const p = Math.min(1, (t - t0) / dur), k = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(de + (valor - de) * k);
      if (p < 1) el._raf = requestAnimationFrame(passo);
    };
    el._raf = requestAnimationFrame(passo);
  };
  window.fxLetras = (el, base) => {
    const txt = el.textContent; el.textContent = ""; el.setAttribute("aria-label", txt);
    el.style.setProperty("--atraso-base", (base || 0) + "s");
    txt.split(" ").forEach((p, j, arr) => {
      const w = document.createElement("span"); w.className = "ti-letras"; w.setAttribute("aria-hidden", "true");
      [...p].forEach(c => { const s = document.createElement("span"); s.textContent = c; s.style.setProperty("--i", el._n = (el._n || 0) + 1); w.append(s); });
      el.append(w); if (j < arr.length - 1) el.append(" ");
    });
  };
  // foto nova ainda não enviada? usa a reserva (e marca como foto, pra ganhar moldura)
  function reserva(img){
    if (img.dataset.reserva && img.src.indexOf(img.dataset.reserva) < 0) { img.classList.add("foto"); img.closest(".recorte")?.classList.remove("recorte"); img.src = img.dataset.reserva; }
    else if (img.hasAttribute("data-sem-logo")) { const o = document.createElement("span"); o.className = "oval"; o.textContent = "BITES"; img.replaceWith(o); }
  }
  window.fxReserva = reserva;
  document.addEventListener("error", e => { if (e.target.tagName === "IMG") reserva(e.target); }, true);
  // imagens que já falharam antes deste script rodar
  document.querySelectorAll("img").forEach(img => { if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) reserva(img); });
})();

// ================= Bites: produtos, sacola e pedido =================
// Número do WhatsApp da Bites (DDI+DDD+número, só dígitos). EXEMPLO — trocar pelo número real.
const WHATS = "5585900000000";

// Pontos de venda do carrossel de mapas. "busca" é o que vai pro Google Maps (endereço ou nome do lugar).
const PONTOS = [
  {nome:"CC da Unifor", sub:"Farmácia Santa Cecília · Centro de Convivência", busca:"Centro de Convivência Unifor, Av. Washington Soares, 1321 - Edson Queiroz, Fortaleza - CE", foto:"img/ponto.jpg"},
  {nome:"Fazendinha", sub:"Fortaleza, CE", busca:"Fazendinha, Fortaleza - CE"}
];

// Preços de EXEMPLO — trocar pelos valores reais.
// recorte: foto de pacote sem fundo (fica inteira no card, como no modelo)
const PRODUTOS = [
  {id:"milky", nome:"Milky", vem:"1× 110g", desc:"Pipoca crocante coberta com chocolate branco e leite em pó. A queridinha da casa.", preco:14.90, foto:"img/pacote-milky.webp", reserva:"img/milky.jpg", recorte:true, selo:"Mais pedido", camadas:["Pipoca crocante","Chocolate branco","Leite em pó"]},
  {id:"caramel", nome:"Salted Caramel", vem:"1× 110g", desc:"Caramelo com um toque de sal. Doce, crocante e difícil de parar.", preco:14.90, foto:"img/pacote-caramel.webp", reserva:"img/caramel.jpg", recorte:true, camadas:["Pipoca crocante","Caramelo","Pitada de sal"]},
  {id:"duo", nome:"Duo Bites", vem:"2× 110g", desc:"1 Milky + 1 Salted Caramel. O único duo que a gente gosta.", preco:27.90, de:29.80, pacotes:2, foto:"img/celular.jpg", camadas:["1 Milky 110g","1 Salted Caramel 110g"]},
  {id:"viciado", nome:"Kit Viciado", vem:"4× 110g", desc:"2 Milky + 2 Salted Caramel. Pra dividir… ou não.", preco:54.90, de:59.60, pacotes:4, foto:"img/duo.jpg", selo:"Mais vendido", camadas:["2 Milky 110g","2 Salted Caramel 110g"]},
  {id:"presente", nome:"Presente Bites", vem:"2× 110g + 1 Pop Bites", desc:"Sacola rosa da Bites com 1 Milky, 1 Salted Caramel e 1 pote Pop Bites. Pronto pra entregar.", preco:44.90, foto:"img/presente.jpg", selo:"Pra presentear", brinde:"Vai na sacolinha rosa da Bites 🎁", camadas:["Sacola Bites","1 Milky","1 Salted Caramel","1 Pop Bites"]}
];
const porId = Object.fromEntries(PRODUTOS.map(p => [p.id, p]));
const $ = s => document.querySelector(s);
const R = v => Sacola.preco(v);
const esc = t => String(t).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const imgDe = (p, extra) => `<img src="${p.foto}"${p.reserva ? ` data-reserva="${p.reserva}"` : ""} alt="${esc(p.nome)}" ${extra || ""}>`;
let armazem = null; try { armazem = window.localStorage; } catch (e) {}
const sacola = Sacola.criar("bites-pacote", armazem);

document.querySelectorAll(".link-zap").forEach(a => a.href = Sacola.link(WHATS, "Olá! Vim pelo site e quero saber mais sobre a Bites 🩷"));

// ---------- carrossel de produtos (comportamento do modelo) ----------
const trilho = $("#trilho");
trilho.innerHTML = PRODUTOS.map((p, i) => `
  <div class="kit" data-i="${i}" role="group" aria-roledescription="produto" aria-label="${i + 1} de ${PRODUTOS.length}: ${esc(p.nome)}">
    <div class="kit-brilho"></div>
    <div class="kit-card">
      ${p.selo ? `<div class="kit-selo">🔥 ${p.selo}</div>` : ""}
      <button class="kit-foto${p.recorte ? " recorte" : ""}" data-abre="${p.id}" aria-label="Ver detalhes: ${esc(p.nome)}">${imgDe(p, 'draggable="false"')}</button>
      <div class="kit-info">
        <h3 class="kit-nome">${p.nome}</h3>
        <p class="kit-vem">${p.vem}</p>
        <p class="kit-desc">${p.desc}</p>
        <div class="kit-preco">
          ${p.de ? `<span class="kit-de num">De ${R(p.de)} por:</span>` : ""}
          <span class="kit-por num">${R(p.preco)}</span>
          ${p.pacotes ? `<span class="kit-extra num">Cada pacote de 110g sai por ${R(Math.round(p.preco * 100 / p.pacotes) / 100)}</span>` : ""}
          ${p.brinde ? `<span class="kit-brinde">${p.brinde}</span>` : ""}
        </div>
        <button class="kit-bt" data-add="${p.id}"><svg><use href="#i-sacola"/></svg> Adicionar à sacola</button>
      </div>
    </div>
  </div>`).join("");
$("#kits-pilulas").innerHTML = PRODUTOS.map((p, i) => `<button class="kit-pilula" role="tab" data-i="${i}" aria-selected="false">${p.nome}</button>`).join("");

const kitsEls = [...trilho.children], pilulas = [...document.querySelectorAll(".kit-pilula")];
let kitAtivo = 0, arrasto = 0, autoTimer = 0;
function posicionarKits(){
  const janela = trilho.parentElement.offsetWidth, w = kitsEls[0].offsetWidth, gap = parseFloat(getComputedStyle(trilho).gap) || 0;
  trilho.style.transform = `translateX(${janela / 2 - (kitAtivo * (w + gap) + w / 2) + arrasto}px)`;
  kitsEls.forEach((k, i) => {
    const d = Math.abs(i - kitAtivo), on = d === 0;
    k.style.transform = `scale(${on ? 1 : d === 1 ? .87 : .75})`;
    k.style.opacity = on ? 1 : d === 1 ? .58 : .22;
    k.classList.toggle("ativo", on);
    k.setAttribute("aria-hidden", on ? "false" : "true");
    k.querySelectorAll("button").forEach(b => b.tabIndex = on ? 0 : -1);
  });
  pilulas.forEach((b, i) => b.setAttribute("aria-selected", i === kitAtivo));
  $("#kits-prog").style.width = ((kitAtivo + 1) / PRODUTOS.length * 100) + "%";
}
function irKit(i){ kitAtivo = (i + PRODUTOS.length) % PRODUTOS.length; posicionarKits(); }
function autoPlay(){ clearInterval(autoTimer); if (!fxReduz) autoTimer = setInterval(() => { if (!painelAberto && !document.hidden) irKit(kitAtivo + 1); }, 4500); }
$("#kit-ant").onclick = () => { irKit(kitAtivo - 1); autoPlay(); };
$("#kit-prox").onclick = () => { irKit(kitAtivo + 1); autoPlay(); };
$("#kits-pilulas").addEventListener("click", e => { const b = e.target.closest(".kit-pilula"); if (b) { irKit(+b.dataset.i); autoPlay(); } });
const carrossel = $("#carrossel");
carrossel.addEventListener("mouseenter", () => clearInterval(autoTimer));
carrossel.addEventListener("mouseleave", autoPlay);
carrossel.addEventListener("focusin", () => clearInterval(autoTimer));
carrossel.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") { irKit(kitAtivo - 1); e.preventDefault(); }
  if (e.key === "ArrowRight") { irKit(kitAtivo + 1); e.preventDefault(); }
});
addEventListener("resize", posicionarKits);
// inclinação 3D no card ativo
if (!fxReduz) {
  trilho.addEventListener("mousemove", e => {
    const k = e.target.closest(".kit.ativo"); if (!k) return;
    const c = k.querySelector(".kit-card"), r = c.getBoundingClientRect();
    const ty = ((e.clientX - r.left) / r.width - .5) * 16, tx = -((e.clientY - r.top) / r.height - .5) * 10;
    c.style.transform = `perspective(1200px) rotateX(${tx}deg) rotateY(${ty}deg)`;
  });
  trilho.addEventListener("mouseleave", () => trilho.querySelectorAll(".kit-card").forEach(c => c.style.transform = ""));
}
// arrastar / deslizar
(() => {
  let x0 = null, y0 = 0, id = null, mexeu = false;
  trilho.addEventListener("pointerdown", e => {
    if (e.button !== 0) return;
    x0 = e.clientX; y0 = e.clientY; id = e.pointerId; mexeu = false; arrasto = 0;
  });
  trilho.addEventListener("pointermove", e => {
    if (x0 === null || e.pointerId !== id) return;
    const dx = e.clientX - x0;
    if (!mexeu) {
      if (Math.abs(dx) < 8) return;
      if (Math.abs(e.clientY - y0) > Math.abs(dx)) { x0 = null; return; }
      mexeu = true; trilho.classList.add("arrastando"); clearInterval(autoTimer);
      try { trilho.setPointerCapture(id); } catch (err) {}
    }
    arrasto = dx; posicionarKits();
  });
  const soltar = () => {
    if (x0 === null) return;
    x0 = null; trilho.classList.remove("arrastando");
    if (!mexeu) return;
    const dx = arrasto; arrasto = 0;
    if (Math.abs(dx) > 60) irKit(kitAtivo + (dx < 0 ? 1 : -1)); else posicionarKits();
    autoPlay();
    // um arrasto não vira clique
    const trava = ev => { ev.stopPropagation(); ev.preventDefault(); };
    trilho.addEventListener("click", trava, {capture:true, once:true});
    setTimeout(() => { trilho.removeEventListener("click", trava, {capture:true}); mexeu = false; }, 80);
  };
  trilho.addEventListener("pointerup", soltar);
  trilho.addEventListener("pointercancel", soltar);
  // clicar num card de lado traz ele pro centro
  trilho.addEventListener("click", e => {
    const k = e.target.closest(".kit");
    if (k && !k.classList.contains("ativo")) { e.stopPropagation(); e.preventDefault(); irKit(+k.dataset.i); autoPlay(); }
  });
})();
posicionarKits();
if (document.fonts) document.fonts.ready.then(posicionarKits);
autoPlay();

// ---------- onde encontrar: carrossel de mapas ----------
(() => {
  const trilhoM = $("#mapas-trilho");
  const q = t => encodeURIComponent(t);
  trilhoM.innerHTML = PONTOS.map((p, i) => `
    <article class="mapa-card" data-i="${i}" aria-label="${esc(p.nome)}">
      <div class="mapa-quadro">
        <span class="mapa-pino"><svg><use href="#i-pino"/></svg>${esc(p.nome)}</span>
        <iframe src="https://www.google.com/maps?q=${q(p.busca)}&z=16&output=embed" title="Mapa: ${esc(p.nome)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" tabindex="-1"></iframe>
        <button class="mapa-trava" aria-label="Mexer no mapa de ${esc(p.nome)}"><span>Toque pra mexer no mapa</span></button>
      </div>
      <div class="mapa-info">
        ${p.foto ? `<img src="${p.foto}" alt="" loading="lazy">` : ""}
        <div class="mapa-txt"><div class="mapa-nome">${esc(p.nome)}</div><div class="mapa-sub">${esc(p.sub)}</div></div>
        <a class="mapa-bt" href="https://www.google.com/maps/dir/?api=1&destination=${q(p.busca)}" target="_blank" rel="noopener"><svg><use href="#i-pino"/></svg> Como chegar</a>
      </div>
    </article>`).join("");
  $("#mapas-pilulas").innerHTML = PONTOS.map((p, i) => `<button class="kit-pilula" role="tab" data-i="${i}" aria-selected="false">${esc(p.nome)}</button>`).join("");
  const cards = [...trilhoM.children], pils = [...document.querySelectorAll("#mapas-pilulas .kit-pilula")];
  let atual = -1;
  function marca(){
    const meio = trilhoM.scrollLeft + trilhoM.clientWidth / 2;
    let i = 0, melhor = Infinity;
    cards.forEach((c, k) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - meio); if (d < melhor) { melhor = d; i = k; } });
    if (i === atual) return;
    atual = i;
    cards.forEach((c, k) => {
      c.classList.toggle("ativo", k === i);
      if (k !== i) { c.classList.remove("solto"); c.querySelector("iframe").tabIndex = -1; } // volta a travar o mapa que saiu do centro
    });
    pils.forEach((b, k) => b.setAttribute("aria-selected", k === i));
  }
  const irMapa = i => { i = Math.max(0, Math.min(cards.length - 1, i)); const c = cards[i]; trilhoM.scrollTo({left: c.offsetLeft + c.offsetWidth / 2 - trilhoM.clientWidth / 2, behavior: fxReduz ? "auto" : "smooth"}); };
  trilhoM.addEventListener("scroll", () => requestAnimationFrame(marca), {passive:true});
  $("#mapa-ant").onclick = () => irMapa(atual - 1);
  $("#mapa-prox").onclick = () => irMapa(atual + 1);
  $("#mapas-pilulas").addEventListener("click", e => { const b = e.target.closest(".kit-pilula"); if (b) irMapa(+b.dataset.i); });
  trilhoM.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") { irMapa(atual - 1); e.preventDefault(); }
    if (e.key === "ArrowRight") { irMapa(atual + 1); e.preventDefault(); }
  });
  trilhoM.addEventListener("click", e => {
    const c = e.target.closest(".mapa-card"); if (!c) return;
    const i = +c.dataset.i;
    if (i !== atual) { e.preventDefault(); irMapa(i); return; } // card de lado: traz pro centro
    if (e.target.closest(".mapa-trava")) { c.classList.add("solto"); const f = c.querySelector("iframe"); f.tabIndex = 0; f.focus({preventScroll:true}); }
  });
  addEventListener("resize", () => { atual = -1; marca(); });
  marca();
})();

fxRevelar(".sobre-txt"); fxRevelar(".sobre-img");

// ---------- menu: marca a seção atual ----------
const linksMenu = [...document.querySelectorAll(".menu a")];
const secoesMenu = linksMenu.map(a => document.getElementById(a.getAttribute("href").slice(1)));
function marcaMenu(){
  const lim = $("#topo").offsetHeight + innerHeight * .3;
  let at = 0;
  secoesMenu.forEach((s, i) => { if (s && s.tagName !== "MAIN" && s.getBoundingClientRect().top <= lim) at = i; });
  linksMenu.forEach((a, i) => a.classList.toggle("ativo", i === at));
}
addEventListener("scroll", () => requestAnimationFrame(marcaMenu), {passive:true});
marcaMenu();

// ---------- painéis ----------
const veu = $("#veu");
let painelAberto = null, focoAntes = null;
function abrir(p){
  if (painelAberto) fechar(true);
  focoAntes = document.activeElement;
  p.hidden = false; void p.offsetWidth;
  p.classList.add("on"); veu.classList.add("on"); painelAberto = p;
  document.body.style.overflow = "hidden";
  atualizaBarra();
  setTimeout(() => { if (painelAberto === p) (p.querySelector(".fecha") || p).focus({preventScroll:true}); }, 350);
}
function fechar(rapido){
  const p = painelAberto; if (!p) return;
  p.classList.remove("on"); veu.classList.remove("on"); painelAberto = null;
  document.body.style.overflow = "";
  atualizaBarra();
  setTimeout(() => { if (!p.classList.contains("on")) p.hidden = true; }, rapido ? 0 : 560);
  if (!rapido && focoAntes) focoAntes.focus({preventScroll:true});
}
veu.addEventListener("click", () => fechar());
addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (painelAberto) fechar();
});
document.addEventListener("click", e => {
  const f = e.target.closest("[data-fecha]"); if (!f) return;
  fechar();
  if (f.dataset.ir) setTimeout(() => { fxRolarAte(document.getElementById(f.dataset.ir)); fxDestacar(document.getElementById(f.dataset.ir)); }, 300);
});
// no celular, arrastar pra baixo fecha
const celular = matchMedia("(max-width: 859px)");
document.querySelectorAll(".painel").forEach(p => {
  let y0 = null, dy = 0;
  p.addEventListener("touchstart", e => { if (!celular.matches) return; const r = p.querySelector(".rola"); if (r.scrollTop > 0) return; y0 = e.touches[0].clientY; dy = 0; }, {passive:true});
  p.addEventListener("touchmove", e => { if (y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); p.style.transition = "none"; p.style.transform = `translate(-50%,${dy}px)`; }, {passive:true});
  p.addEventListener("touchend", () => { if (y0 === null) return; p.style.transition = ""; p.style.transform = ""; if (dy > 110) fechar(); y0 = null; });
});

// ---------- produto ----------
let atual = null, qtdAtual = 1;
function abrirProduto(id){
  const p = porId[id]; if (!p) return;
  atual = p; qtdAtual = 1;
  const f = $("#pp-foto");
  if (p.reserva) f.dataset.reserva = p.reserva; else delete f.dataset.reserva;
  f.classList.remove("foto");
  f.parentElement.classList.toggle("recorte", !!p.recorte);
  f.src = p.foto; f.alt = p.nome;
  $("#pp-selo").textContent = p.selo || ""; $("#pp-selo").hidden = !p.selo;
  $("#pp-nome").textContent = p.nome; $("#pp-desc").textContent = p.desc;
  $("#pp-camadas").innerHTML = p.camadas.map(c => `<span>${c}</span>`).join("");
  $("#pp-preco").innerHTML = R(p.preco) + (p.de ? ` <span style="font-size:15px;color:var(--tinta-2);text-decoration:line-through;font-weight:500">${R(p.de)}</span>` : "");
  atualizaProduto(); abrir($("#p-prod"));
  $("#p-prod .rola").scrollTop = 0;
}
function atualizaProduto(){
  $("#pp-qtd").textContent = qtdAtual;
  $("#pp-menos").disabled = qtdAtual <= 1;
  fxNumero("pp-soma", atual.preco * qtdAtual, R, 400);
}
$("#pp-menos").onclick = () => { if (qtdAtual > 1) { qtdAtual--; atualizaProduto(); } };
$("#pp-mais").onclick = () => { if (qtdAtual < 50) { qtdAtual++; atualizaProduto(); } };
$("#pp-add").onclick = () => {
  const alvo = alvoSacola(); // com o painel aberto, mira no botão do topo
  fechar();
  adicionar(atual, qtdAtual, $("#pp-foto"), alvo);
};

document.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  if (add) { e.stopPropagation(); adicionar(porId[add.dataset.add], 1, add); return; }
  const it = e.target.closest("[data-abre]");
  if (it && it.closest(".kit:not(.ativo)")) return;
  if (it) abrirProduto(it.dataset.abre);
});

// ---------- colocar na sacola: pipocas voam, a sacola "engole", o número pula ----------
let emVoo = 0;
function alvoSacola(){
  const barra = $("#barra-sacola");
  // se a barra de baixo já está visível, as pipocas vão pra ela; senão, pro botão do topo
  return barra.classList.contains("on") && !painelAberto ? {caixa: barra, num: $("#bs-qt")} : {caixa: $("#bt-sacola"), num: $("#badge")};
}
function adicionar(p, n, origem, alvo){
  alvo = alvo || alvoSacola();
  const dur = voarPipocas(origem, alvo.num);
  emVoo++;
  sacola.add(p, n);
  const chegou = () => {
    emVoo = Math.max(0, emVoo - 1);
    contador(true);
    atualizaBarra();
    const c = alvo.caixa; c.classList.remove("engole"); void c.offsetWidth; c.classList.add("engole");
    toast(`${n}x ${p.nome} na sacola`);
  };
  if (dur) setTimeout(chegou, dur); else chegou();
}
// devolve em quantos ms a primeira pipoca chega (0 = sem animação)
function voarPipocas(origem, alvo){
  if (fxReduz || !origem) return 0;
  const a = origem.getBoundingClientRect(), b = alvo.getBoundingClientRect();
  const x1 = b.left + b.width / 2 - 13, y1 = b.top + b.height / 2 - 13;
  const base = 760;
  for (let i = 0; i < 6; i++) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 40 36"); s.setAttribute("class", "voa");
    if (i % 2) s.style.color = "#D9954A";
    s.innerHTML = '<use href="#pip"/>';
    document.body.append(s);
    const x0 = a.left + a.width / 2 - 13 + (Math.random() - .5) * Math.min(80, a.width), y0 = a.top + a.height / 2 - 13 + (Math.random() - .5) * Math.min(40, a.height);
    const alto = Math.min(y0, y1) - 90 - Math.random() * 70;
    const rot = (Math.random() - .5) * 720;
    s.animate([
      {transform:`translate(${x0}px,${y0}px) scale(.5) rotate(0)`, opacity:0},
      {transform:`translate(${x0 + (x1 - x0) * .35}px,${alto}px) scale(1.3) rotate(${rot / 2}deg)`, opacity:1, offset:.4},
      {transform:`translate(${x1}px,${y1}px) scale(.3) rotate(${rot}deg)`, opacity:.9}
    ], {duration:base + i * 80, delay:i * 50, easing:"cubic-bezier(.3,.1,.4,1)", fill:"forwards"}).onfinish = () => s.remove();
  }
  return base;
}

let tt;
function toast(t){
  const el = $("#toast"); el.textContent = t; el.classList.add("on");
  clearTimeout(tt); tt = setTimeout(() => el.classList.remove("on"), 1900);
}

// ---------- sacola ----------
let modo = "entrega";
// o número da sacola só muda quando as pipocas chegam
function contador(pular){
  if (emVoo && !pular) return;
  const n = sacola.contagem();
  [$("#badge"), $("#bs-qt")].forEach(el => {
    if (el.textContent === String(n)) return;
    el.textContent = n;
    if (pular) { el.classList.remove("pula"); void el.offsetWidth; el.classList.add("pula"); }
  });
}
function atualizaBarra(){
  const barra = $("#barra-sacola");
  // com pipocas no ar, a barra não aparece ainda: ela sobe quando elas chegam
  const on = sacola.contagem() > 0 && !painelAberto && (!emVoo || barra.classList.contains("on"));
  barra.classList.toggle("on", on);
  document.body.classList.toggle("tem-barra", on);
}
function desenharSacola(){
  const n = sacola.contagem(), total = sacola.total();
  contador(false);
  fxNumero("bs-total", total, R, 500);
  atualizaBarra();
  const vazia = n === 0;
  $("#sac-vazia").hidden = !vazia; $("#form").hidden = vazia; $("#sac-pe").hidden = vazia;
  $("#sac-lista").innerHTML = sacola.itens.map(i => {
    const p = porId[i.id];
    return `<div class="sac-item" data-id="${esc(i.id)}">
      <img src="${p ? p.foto : "img/milky.jpg"}"${p && p.reserva ? ` data-reserva="${p.reserva}"` : ""} alt="">
      <div><b>${esc(i.nome)}</b><small class="num">${R(i.preco)} cada · ${R(i.preco * i.qtd)}</small></div>
      <div class="passo"><button data-menos aria-label="Tirar um ${esc(i.nome)}">−</button><output class="num">${i.qtd}</output><button data-mais aria-label="Mais um ${esc(i.nome)}">+</button></div>
    </div>`;
  }).join("");
  fxNumero("sac-total", total, R, 500);
  validar();
}
$("#sac-lista").addEventListener("click", e => {
  const linha = e.target.closest(".sac-item"); if (!linha) return;
  const id = linha.dataset.id, q = sacola.qtd(id);
  if (e.target.closest("[data-mais]")) sacola.set(id, q + 1);
  else if (e.target.closest("[data-menos]")) {
    if (q <= 1 && !fxReduz) {
      linha.animate([{opacity:1, transform:"none"}, {opacity:0, transform:"translateX(40px)"}], {duration:280, easing:"ease-in"}).onfinish = () => { if (sacola.qtd(id) <= 1) sacola.set(id, 0); else desenharSacola(); };
    } else sacola.set(id, q - 1);
  }
});
sacola.onChange(desenharSacola);

function abrirSacola(){ abrir($("#p-sacola")); desenharSacola(); }
$("#bt-sacola").onclick = abrirSacola;
$("#barra-sacola").onclick = abrirSacola;
document.querySelectorAll(".link-sacola").forEach(b => b.onclick = abrirSacola);

$("#modo").addEventListener("click", e => {
  const b = e.target.closest("[data-modo]"); if (!b) return;
  modo = b.dataset.modo;
  $("#modo").classList.toggle("ret", modo === "retirada");
  $("#modo").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
  $("#campo-end").classList.toggle("fecha-end", modo === "retirada");
  $("#campo-end").inert = modo === "retirada";
  validar();
});
function validar(){
  const nome = $("#f-nome").value.trim(), end = $("#f-end").value.trim();
  let falta = "";
  if (!sacola.contagem()) falta = "Sua sacola está vazia.";
  else if (!nome) falta = "Coloque seu nome pra enviar.";
  else if (modo === "entrega" && !end) falta = "Coloque o endereço da entrega.";
  const bp = $("#bt-pedir");
  bp.setAttribute("aria-disabled", falta ? "true" : "false");
  bp.href = falta ? "#" : Sacola.link(WHATS, Sacola.mensagem(sacola.itens, {nome, modo, endereco:end, obs:$("#f-obs").value.trim()}));
  $("#aviso").textContent = falta || "Abre o WhatsApp com o pedido pronto.";
}
["f-nome", "f-end", "f-obs"].forEach(id => $("#" + id).addEventListener("input", validar));
$("#bt-pedir").addEventListener("click", e => {
  validar();
  if ($("#bt-pedir").getAttribute("aria-disabled") === "true") e.preventDefault();
});
$("#form").addEventListener("submit", e => e.preventDefault());
desenharSacola();

// ---------- contato: manda pelo WhatsApp ----------
$("#contato-form").addEventListener("submit", e => {
  e.preventDefault();
  const nome = $("#c-nome").value.trim(), bairro = $("#c-bairro").value.trim(), msg = $("#c-msg").value.trim();
  if (!nome || !msg) return;
  const link = Sacola.link(WHATS, `Oi, Bites! Aqui é ${nome}${bairro ? ` (${bairro})` : ""} 🩷\n\n${msg}`);
  const w = window.open(link, "_blank");
  if (w) w.opener = null; else location.href = link;
});

// ---------- hero: o pacote ----------
const pacote = $("#pacote");
fxLetras($("#hero-titulo"), .5);
setTimeout(() => pacote.classList.add("balanca"), fxReduz ? 0 : 1300);
let estourando = false;
pacote.addEventListener("click", () => {
  if (estourando) return; estourando = true;
  $("#dica").classList.add("some");
  pacote.classList.remove("balanca"); pacote.classList.add("aberto");
  const est = $("#estouro");
  if (!fxReduz) for (let i = 0; i < 18; i++) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 40 36"); if (i % 3 === 0) s.classList.add("car");
    s.innerHTML = '<use href="#pip"/>'; est.append(s);
    const ang = (-165 + Math.random() * 150) * Math.PI / 180, dist = 130 + Math.random() * 180;
    const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist;
    s.animate([
      {transform:"translate(0,20px) scale(.4)", opacity:0},
      {transform:`translate(${dx * .6}px,${dy}px) scale(1.2) rotate(${Math.random() * 300}deg)`, opacity:1, offset:.45},
      {transform:`translate(${dx}px,${dy + 300}px) scale(1) rotate(${Math.random() * 600}deg)`, opacity:0}
    ], {duration:1300 + Math.random() * 500, delay:120 + i * 25, easing:"cubic-bezier(.2,.6,.4,1)", fill:"forwards"}).onfinish = () => s.remove();
  }
  // fecha de novo pra poder estourar outra vez
  setTimeout(() => { pacote.classList.remove("aberto"); }, 1500);
  setTimeout(() => { pacote.classList.add("balanca"); estourando = false; }, 2400);
});
