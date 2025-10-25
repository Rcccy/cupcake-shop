/* script.js - Cupcake Shop site */
const products = [
  {id:1,name:'Chocolate',price:8.90,image:'assets/images/cupcake1.svg',desc:'Cupcake de chocolate, recheado e cremoso.'},
  {id:2,name:'Morango',price:9.90,image:'assets/images/cupcake2.svg',desc:'Cupcake de morango com cobertura fresca.'},
  {id:3,name:'Blueberry',price:10.50,image:'assets/images/cupcake3.svg',desc:'Blueberry artesanal com frutas selecionadas.'},
  {id:4,name:'Tasty',price:11.00,image:'assets/images/cupcake4.svg',desc:'Especial Tasty com toques gourmets.'},
  {id:5,name:'Especial',price:13.50,image:'assets/images/cupcake5.svg',desc:'Edição especial, ótima para presentes.'},
  {id:6,name:'Doce',price:7.20,image:'assets/images/cupcake6.svg',desc:'Sabor doce e suave para o seu dia.'}
];

let cart = [];
let showing = 'catalog';
let modalQty = 1;
let modalProductId = null;

function $(sel){return document.querySelector(sel)}
function $all(sel){return Array.from(document.querySelectorAll(sel))}


function init(){
  renderCatalog();
  renderRatings();
  updateCartUI();
 
  navigate('catalog');
  $('#btn-comprar')?.addEventListener('click', completePayment);
  function goToPayment(){
  
  const paymentSection = document.getElementById('payment') || document.getElementById('cart') || null;
  if(paymentSection){
    paymentSection.classList.remove('hidden');
    // esconder outras seções se necessário:
    const catalog = document.getElementById('catalog');
    if(catalog) catalog.classList.add('hidden');
    const detail = document.getElementById('product-detail');
    if(detail) detail.classList.add('hidden');
  
    if(typeof updateCartUI === 'function') updateCartUI();
  } else {
    
    console.warn('goToPayment: seção de pagamento não encontrada. Verifique se existe id="payment" ou id="cart" no HTML.');
  }
}
}

function renderCatalog(){
  const grid = $('#product-grid');
  grid.innerHTML = '';
  const q = $('#search-input')?.value?.toLowerCase() || '';
  const sort = $('#sort')?.value || 'default';
  let list = products.filter(p=>p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  if(sort==='price-asc') list.sort((a,b)=>a.price-b.price);
  if(sort==='price-desc') list.sort((a,b)=>b.price-a.price);
  list.forEach(p=>{
    const card = document.createElement('div'); card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="name">${p.name}</div>
      <div class="price">R$ ${p.price.toFixed(2)}</div>
      <div style="height:6px"></div>
      <div style="display:flex;gap:8px">
        <button class="btn ghost" onclick="openProduct(${p.id})">Ver</button>
        <button class="btn primary" onclick="addToCart(${p.id},1)">Adicionar</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function openProduct(id){
  const p = products.find(x => x.id === id);
  if(!p) return;

  // Ingredientes de cada sabor
  const ingredientes = {
    'Chocolate': 'Cacau, farinha, ovos, manteiga e açúcar.',
    'Morango': 'Morango fresco, farinha, leite, açúcar e manteiga.',
    'Blueberry': 'Blueberry, farinha, manteiga e leite.',
    'Tasty': 'Baunilha, açúcar, manteiga e leite condensado.',
    'Especial': 'Chocolate branco, frutas vermelhas e chantilly.',
    'Doce': 'Doce de leite, farinha, ovos e açúcar.'
  };

  // Atualiza o modal
  $('#modal-img').src = p.image;
  $('#modal-name').textContent = p.name;
  $('#modal-price').textContent = `R$ ${p.price.toFixed(2)}`;
  $('#modal-desc').innerHTML = `
    ${p.desc}<br><br>
    <strong>Ingredientes:</strong><br>${ingredientes[p.name] || 'Ingredientes não informados.'}
  `;

  // Esconde quantidade e botão "Adicionar ao carrinho"
  document.querySelector('.qty-row').style.display = 'none';
  document.querySelector('#modal-add').style.display = 'none';

  $('#product-modal').classList.remove('hidden');
}



function closeProductModal(){
  $('#product-modal').classList.add('hidden');
  modalProductId = null;

  // Restaura quantidade e botão 
  document.querySelector('.qty-row').style.display = 'flex';
  document.querySelector('#modal-add').style.display = 'block';
}


function addToCart(id, qty){
  const p = products.find(x=>x.id===id); if(!p) return;
  const existing = cart.find(x=>x.id===id);
  if(existing) existing.qty += qty; else cart.push({id:p.id,name:p.name,price:p.price,image:p.image,qty});
  toast('Adicionado ao carrinho');
  updateCartUI();
}

function updateCartUI() {
  $('#cart-count').textContent = cart.reduce((s, i) => s + i.qty, 0);
  const list = $('#cart-items');
  if (list) list.innerHTML = '';

  if (cart.length === 0) {
    if (list) list.innerHTML = '<div class="muted" style="padding:10px">Carrinho vazio</div>';
    $('#cart-total').textContent = 'Total: R$ 0,00';
    return;
  }

  cart.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'space-between';
    div.style.marginBottom = '10px';

    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;">
      <div style="flex:1;margin-left:10px;">
        <div style="font-weight:800">${item.name}</div>
        <div>Qtd: ${item.qty}</div>
      </div>
      <div style="font-weight:900;">R$ ${(item.price * item.qty).toFixed(2)}</div>
      <button class="remove-btn" data-index="${index}">Remover</button>
    `;

    list.appendChild(div);
  });

  // Total atualizado
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  $('#cart-total').textContent = `Total: R$ ${total.toFixed(2)}`;
  $('#payment-summary').textContent = `Total: R$ ${total.toFixed(2)}`;

  // Evento dos botões "Remover"
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      removeFromCart(index);
    });
  });
}


// Remove um item específico do carrinho

function removeFromCart(index) {
  if (index >= 0 && index < cart.length) {
    const removed = cart.splice(index, 1)[0];
    toast(`${removed.name} removido do carrinho`);
    updateCartUI();
  }
}


function toggleCart(){
  const cartEl = $('#cart');
  if(!cartEl) return;
  cartEl.classList.toggle('hidden');
  cartEl.setAttribute('aria-hidden', cartEl.classList.contains('hidden') ? 'true' : 'false');
}

function goToPayment(){
  toggleCart();
  navigate('payment');
}

function completePayment(){
  if(cart.length===0){ alert('Carrinho vazio'); return; }
  alert('Compra realizada com sucesso! Obrigado :)');
  cart = []; updateCartUI(); navigate('catalog');
}

function navigate(section){
  showing = section;

  // Lista atualizada com a seção de criar conta
  ['catalog','payment','ratings','about','signup'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    if(id === section){
      el.classList.remove('hidden');
      el.setAttribute('aria-hidden', 'false');
    } else {
      el.classList.add('hidden');
      el.setAttribute('aria-hidden', 'true');
    }
  });

  window.scrollTo({top:0, behavior:'smooth'});
}


function openLogin(){ $('#login-modal').classList.remove('hidden'); }
function closeLogin(){ $('#login-modal').classList.add('hidden'); }

function renderRatings(){
  const out = $('#rating-list'); if(!out) return;
  out.innerHTML = '';
  const samples = [
    {name:'Chocolate Cup',rate:5,txt:'Delicioso, recomendo!'},
    {name:'Morango',rate:4,txt:'Muito bom, cobertura fresca.'},
    {name:'Tasty',rate:5,txt:'Perfeito para festas.'}
  ];
  samples.forEach(s=>{
    const div = document.createElement('div'); div.className='rating-row';
    div.style.border='1px solid #f0f0f0'; div.style.padding='10px'; div.style.borderRadius='10px'; div.innerHTML = `<div style="font-weight:800">${s.name}</div><div>${'★'.repeat(s.rate)}</div><div style="color:var(--muted)">${s.txt}</div>`;
    out.appendChild(div);
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.querySelector('#signup-form');
  const successModal = document.querySelector('#signup-success');
  const successOk = document.querySelector('#signup-success-ok');

  if (signupForm) {
    signupForm.addEventListener('submit', (ev) => {
      ev.preventDefault();

      const nome = document.querySelector('#signup-name')?.value.trim();
      const email = document.querySelector('#signup-email')?.value.trim();
      const senha = document.querySelector('#signup-pass')?.value.trim();

      if (!nome || !email || !senha) {
        alert('Preencha todos os campos antes de criar a conta!');
        return;
      }

      successModal.classList.remove('hidden');
    });
  }

  if (successOk) {
    successOk.addEventListener('click', () => {
      successModal.classList.add('hidden');
      navigate('catalog');
    });
  }

  // links e botões auxiliares
  document.querySelector('#to-signup')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigate('signup');
  });

  document.querySelector('#signup-cancel')?.addEventListener('click', () => {
    navigate('catalog');
  });
});


  const signupForm = document.querySelector('#signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', function(ev) {
    ev.preventDefault();

    // captura os campos do formulário
    const nome = document.querySelector('#signup-name')?.value.trim();
    const email = document.querySelector('#signup-email')?.value.trim();
    const senha = document.querySelector('#signup-pass')?.value.trim();


    // se algum estiver vazio, mostra erro e não cria conta
    if (!nome || !email || !senha) {
      alert('Preencha todos os campos antes de criar a conta!');
      return;
    }

    // se passou na validação, mostra mensagem de sucesso
    document.querySelector('#signup-success').classList.remove('hidden');
  });
}
  

  const successOk = document.querySelector('#signup-success-ok');
  if (successOk) {
    successOk.addEventListener('click', function() {
      document.querySelector('#signup-success').classList.add('hidden');
      navigate('catalog');
    });
  }


function toast(msg){ console.log(msg); /* simple stub, could show UI */ }


document.addEventListener('DOMContentLoaded', init);
