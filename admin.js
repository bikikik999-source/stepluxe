const ADMIN_PASSWORD = "stepluxemiksa";
const key = "stepluxe_products";

let products = JSON.parse(localStorage.getItem(key) || "null") || [];
let editImages = [];

const $ = s => document.querySelector(s);

function money(n) {
  return Number(n).toLocaleString("sr-RS") + " RSD";
}

function save() {
  localStorage.setItem(key, JSON.stringify(products));
}

function render() {
  let el = $("#adminProducts");

  el.innerHTML = products.length
    ? products.map(p => `
      <div class="admin-row">
        <img src="${p.images[0]}" alt="">
        <div>
          <h3>${p.name}</h3>
          <span class="muted">
            ${money(p.price)} · ${(p.sizes || []).join(", ")}
          </span>
        </div>

        <div class="admin-actions">
          <button onclick="editProduct('${p.id}')">
            Izmeni
          </button>

          <button onclick="deleteProduct('${p.id}')">
            Obriši
          </button>
        </div>
      </div>
    `).join("")
    : `<p class="muted">Nema proizvoda.</p>`;
}

function editProduct(id) {
  let p = products.find(x => x.id === id);
  let f = $("#productForm");

  $("#adminModalTitle").textContent = "Izmeni proizvod";

  f.elements.id.value = p.id;
  f.elements.name.value = p.name;
  f.elements.price.value = p.price;
  f.elements.category.value = p.category || "";
  f.elements.sizes.value = (p.sizes || []).join(", ");
  f.elements.description.value = p.description || "";

  editImages = [...p.images];

  preview();

  $("#adminModal").classList.add("show");
}

function deleteProduct(id) {
  if (confirm("Obrisati proizvod?")) {
    products = products.filter(p => p.id !== id);
    save();
    render();
  }
}

function preview() {
  $("#imagePreview").innerHTML = editImages
    .map(x => `<img src="${x}" alt="">`)
    .join("");
}

$("#newProduct").onclick = () => {
  $("#productForm").reset();

  $("#productForm").elements.id.value = "";

  editImages = [];

  preview();

  $("#adminModalTitle").textContent = "Dodaj proizvod";

  $("#adminModal").classList.add("show");
};

$("#closeAdmin").onclick = () => {
  $("#adminModal").classList.remove("show");
};

$("#productForm").elements.images.onchange = e => {
  [...e.target.files].forEach(file => {
    let reader = new FileReader();

    reader.onload = () => {
      editImages.push(reader.result);
      preview();
    };

    reader.readAsDataURL(file);
  });
};

$("#productForm").onsubmit = e => {
  e.preventDefault();

  let f = e.target;

  let id =
    f.elements.id.value ||
    Date.now().toString();

  let p = {
    id,
    name: f.elements.name.value,
    price: Number(f.elements.price.value),
    category: f.elements.category.value,

    sizes: f.elements.sizes.value
      .split(",")
      .map(x => x.trim())
      .filter(Boolean),

    description: f.elements.description.value,

    images: editImages.length
      ? editImages
      : ["assets/logo.png"]
  };

  let i = products.findIndex(x => x.id === id);

  if (i >= 0) {
    products[i] = p;
  } else {
    products.unshift(p);
  }

  save();
  render();

  $("#adminModal").classList.remove("show");
};

function renderOrders() {
  let orders =
    JSON.parse(
      localStorage.getItem("stepluxe_orders") || "[]"
    );

  $("#adminOrders").innerHTML = orders.length
    ? orders.map(o => `
      <div class="order-card">

        <strong>${o.id}</strong>
        ·
        ${new Date(o.date).toLocaleString("sr-RS")}

        <p>
          ${o.customer.name}
          ·
          ${o.customer.phone}
          ·
          ${o.customer.email}
        </p>

        <p class="muted">
          ${o.customer.address},
          ${o.customer.city}
          ${o.customer.zip}
        </p>

        <p>
          ${o.items.map(i => {
            let p = products.find(p => p.id === i.id);

            return `
              ${p ? p.name : i.id}
              × ${i.qty}
              (vel. ${i.size})
            `;
          }).join("<br>")}

          <br>
          Plaćanje: ${o.customer.payment}
        </p>

      </div>
    `).join("")
    : `<p class="muted">Nema porudžbina.</p>`;
}

$("#loginForm").onsubmit = e => {
  e.preventDefault();

  if ($("#password").value === ADMIN_PASSWORD) {

    $("#login").classList.add("hidden");

    $("#dashboard").classList.remove("hidden");

    render();

  } else {

    $("#loginError").textContent =
      "Pogrešna šifra.";
  }
};

$("#logout").onclick = () => location.reload();

document.querySelectorAll(".tab").forEach(button => {

  button.onclick = () => {

    document.querySelectorAll(".tab")
      .forEach(x => x.classList.remove("active"));

    button.classList.add("active");

    document.querySelectorAll(".admin-panel")
      .forEach(x => x.classList.add("hidden"));

    $("#" + button.dataset.tab)
      .classList.remove("hidden");

    if (button.dataset.tab === "ordersTab") {
      renderOrders();
    }
  };

});

$("#clearOrders").onclick = () => {

  if (confirm("Obrisati sve demo porudžbine?")) {

    localStorage.removeItem("stepluxe_orders");

    renderOrders();
  }
};
