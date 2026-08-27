const seed=[
  {
    id:"1",
    name:"Aero Noir",
    price:22990,
    category:"Signature",
    sizes:["40","41","42","43","44"],
    description:"Minimalističke crne patike sa modernim đonom i premium detaljima.",
    images:["assets/logo.png"]
  },
  {
    id:"2",
    name:"Violet 01",
    price:26990,
    category:"Nova kolekcija",
    sizes:["39","40","41","42","43"],
    description:"Ljubičasti statement model za upečatljiv svakodnevni izgled.",
    images:["assets/logo.png"]
  },
  {
    id:"3",
    name:"Luxe Runner",
    price:29990,
    category:"Premium",
    sizes:["41","42","43","44","45"],
    description:"Lagane patike modernog profila, namenjene svakodnevnom nošenju.",
    images:["assets/logo.png"]
  }
];

const key="stepluxe_products";

let products=JSON.parse(localStorage.getItem(key)||"null")||seed;
let cart=JSON.parse(localStorage.getItem("stepluxe_cart")||"[]");

function save(){
  localStorage.setItem(key,JSON.stringify(products));
  localStorage.setItem("stepluxe_cart",JSON.stringify(cart));
}

function money(n){
  return Number(n).toLocaleString("sr-RS")+" RSD";
}

function renderProducts(){
  let list=[...products];
  let s=document.getElementById("sort").value;

  if(s==="price-low") list.sort((a,b)=>a.price-b.price);
  if(s==="price-high") list.sort((a,b)=>b.price-a.price);

  document.getElementById("products").innerHTML=list.map(p=>`
    <article class="product" onclick="openProduct('${p.id}')">
      <div class="product-img">
        <img src="${p.images[0]}" alt="${p.name}">
      </div>

      <div class="product-info">
        <div class="cat">${p.category||"STEPLUXE"}</div>
        <h3>${p.name}</h3>
        <div class="price">${money(p.price)}</div>
      </div>
    </article>
  `).join("");
}

function openProduct(id){
  let p=products.find(x=>x.id===id);

  document.getElementById("productDetail").innerHTML=`
    <div class="detail">

      <div class="detail-gallery">
        ${p.images.map(i=>`
          <img src="${i}" alt="${p.name}">
        `).join("")}
      </div>

      <div>
        <p class="eyebrow">${p.category||"STEPLUXE"}</p>

        <h2>${p.name}</h2>

        <div class="price">${money(p.price)}</div>

        <p class="muted">${p.description||""}</p>

        <h4>Izaberi veličinu</h4>

        <div class="sizes">
          ${p.sizes.map(s=>`
            <button
              onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));this.classList.add('selected')"
              data-size="${s}">
              ${s}
            </button>
          `).join("")}
        </div>

        <button class="button full" onclick="addToCart('${p.id}')">
          Dodaj u korpu <span>→</span>
        </button>

      </div>

    </div>
  `;

  document.getElementById("productModal").classList.add("show");
}

function closeProduct(){
  document.getElementById("productModal").classList.remove("show");
}

function addToCart(id){
  let p=products.find(x=>x.id===id);

  let size=
    document.querySelector("#productDetail .sizes .selected")?.dataset.size
    ||p.sizes[0];

  let item=cart.find(x=>x.id===id&&x.size===size);

  if(item){
    item.qty++;
  }else{
    cart.push({
      id,
      size,
      qty:1
    });
  }

  save();
  closeProduct();
  renderCart();
  openCart();
}

function renderCart(){

  document.getElementById("cartCount").textContent=
    cart.reduce((a,x)=>a+x.qty,0);

  let total=0;

  document.getElementById("cartItems").innerHTML=cart.length
    ?cart.map((x,i)=>{

      let p=products.find(p=>p.id===x.id);

      total+=p.price*x.qty;

      return `
        <div class="cart-item">

          <img src="${p.images[0]}" alt="">

          <div>
            <strong>${p.name}</strong>

            <div class="muted">
              Veličina ${x.size}
            </div>

            <div class="qty">

              <button onclick="changeQty(${i},-1)">
                −
              </button>

              ${x.qty}

              <button onclick="changeQty(${i},1)">
                +
              </button>

            </div>
          </div>

          <strong>
            ${money(p.price*x.qty)}
          </strong>

        </div>
      `;

    }).join("")
    :`<p class="muted">Korpa je prazna.</p>`;

  document.getElementById("cartTotal").textContent=
    money(total);
}

function changeQty(i,d){

  cart[i].qty+=d;

  if(cart[i].qty<=0){
    cart.splice(i,1);
  }

  save();
  renderCart();
}

function openCart(){
  document.getElementById("cart").classList.add("open");
  document.getElementById("backdrop").classList.add("show");
}

function closeCart(){
  document.getElementById("cart").classList.remove("open");
  document.getElementById("backdrop").classList.remove("show");
}

function closeCheckout(){
  document.getElementById("checkoutModal").classList.remove("show");
}

document.getElementById("openCart").onclick=openCart;

document.getElementById("closeCart").onclick=closeCart;

document.getElementById("backdrop").onclick=closeCart;

document.getElementById("sort").onchange=renderProducts;

document.getElementById("checkoutBtn").onclick=()=>{

  if(!cart.length){
    return alert("Korpa je prazna.");
  }

  document.getElementById("checkoutModal").classList.add("show");
};

document.getElementById("orderForm").onsubmit=e=>{

  e.preventDefault();

  let fd=new FormData(e.target);

  let order={
    id:"SL-"+Date.now().toString().slice(-6),
    date:new Date().toISOString(),
    customer:Object.fromEntries(fd.entries()),
    items:cart
  };

  let orders=
    JSON.parse(localStorage.getItem("stepluxe_orders")||"[]");

  orders.unshift(order);

  localStorage.setItem(
    "stepluxe_orders",
    JSON.stringify(orders)
  );

  cart=[];

  save();
  renderCart();
  closeCheckout();
  closeCart();

  e.target.reset();

  alert(
    "Porudžbina je uspešno primljena! Hvala što kupuješ u StepLuxe."
  );
};

renderProducts();
renderCart();
