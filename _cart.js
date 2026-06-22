/* ═══════════════════════════════════════════════
   PANIER — Logique partagée par toutes les pages
   ═══════════════════════════════════════════════ */

// ────── DATA
// PRODUCTS est défini dans chaque page ou dans products.js
// Ce fichier suppose que PRODUCTS est accessible globalement

function fmt(n) { return n.toFixed(2).replace('.', ','); }
function cartKey() { return '__aqz_cart'; }

let cart = JSON.parse(localStorage.getItem(cartKey()) || '[]');

function saveCart() {
  localStorage.setItem(cartKey(), JSON.stringify(cart));
  renderCart();
}

function cartCount() { return cart.reduce((s, i) => s + i.qty, 0); }
function cartSubtotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }

function addToCart(id, qty = 1) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const ex = cart.find(x => x.id === id);
  if (ex) ex.qty += qty;
  else cart.push({ id, name: p.name, price: p.price, emoji: p.emoji, img: p.img, qty });
  saveCart();
  showToast(`"${p.name}" ajouté à votre sélection`);
}

function cQty(id, d) {
  const i = cart.find(x => x.id === id);
  if (!i) return;
  i.qty += d;
  if (i.qty <= 0) cart = cart.filter(x => x.id !== id);
  saveCart();
}

function cRemove(id) {
  cart = cart.filter(x => x.id !== id);
  saveCart();
}

// ────── RENDER PANIER
function renderCart() {
  const n = cartCount();
  document.querySelectorAll('.cart-badge').forEach(b => {
    if (n > 0) { b.textContent = n; b.classList.add('visible'); }
    else b.classList.remove('visible');
  });
  document.querySelectorAll('#cart-label').forEach(el => {
    el.textContent = n > 0 ? `(${n})` : '';
  });

  const body = document.getElementById('cart-body');
  const foot = document.getElementById('cart-foot');
  if (!body) return;

  if (!cart.length) {
    body.innerHTML = `<div class="cart-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
      <p>Votre sélection est vide</p>
    </div>`;
    if (foot) foot.style.display = 'none';
    return;
  }
  if (foot) foot.style.display = 'block';
  body.innerHTML = `<div class="cart-items">` + cart.map(i => {
    const p = (typeof PRODUCTS !== 'undefined') ? PRODUCTS.find(x => x.id === i.id) : null;
    const img = i.img || (p && p.img);
    return `
    <div class="cart-item">
      <div class="ci-img" style="position:relative;overflow:hidden">${img ? `<img src="${img}" alt="${i.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">` : ''}</div>
      <div>
        <div class="ci-name">${i.name}</div>
        <div class="ci-price">${fmt(i.price)} €</div>
        <div class="ci-qty">
          <button class="qty-btn" onclick="cQty(${i.id},-1)">−</button>
          <span class="qty-val">${i.qty}</span>
          <button class="qty-btn" onclick="cQty(${i.id},1)">+</button>
        </div>
      </div>
      <button class="ci-remove" onclick="cRemove(${i.id})">✕</button>
    </div>`;
  }).join('') + `</div>`;
  const total = document.getElementById('cart-total');
  if (total) total.textContent = fmt(cartSubtotal()) + ' €';
}

// ────── DRAWER
function openCart() {
  document.getElementById('overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
  document.body.style.overflow = '';
}

// ────── TOAST
let _tTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  document.getElementById('toast-msg').textContent = msg;
  el.classList.add('show');
  clearTimeout(_tTimer);
  _tTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ────── SCROLL HEADER
window.addEventListener('scroll', () => {
  const h = document.querySelector('.site-header');
  if (h) h.classList.toggle('scrolled', window.scrollY > 8);
});

// ────── REVEAL
const _obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); _obs.unobserve(e.target); } });
}, { threshold: 0.08 });
document.querySelectorAll('[data-reveal]').forEach(el => _obs.observe(el));

// ────── MENU MOBILE
function toggleMenu() {
  const nav = document.querySelector('.nav-left');
  if (!nav) return;
  if (nav.style.display === 'flex') {
    nav.style.display = '';
  } else {
    nav.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:72px;left:0;right:0;background:var(--ivory);padding:20px 24px;border-bottom:1px solid var(--border);gap:4px;z-index:99;';
    const sn = nav.querySelector('.site-nav');
    if (sn) sn.style.cssText = 'display:flex;flex-direction:column;gap:4px';
  }
}

function openSearch() {
  showToast('Recherche — à connecter à votre moteur');
}

function checkout() {
  window.location.href = 'panier.html';
}
