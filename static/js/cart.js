// LocalStorage nunchi RK Bazaar cart data techukuntunnam
let cart = JSON.parse(localStorage.getItem("rk_bazaar_cart")) || [];

function renderCart() {
    let container = document.getElementById("cart-items-container");
    let totalPriceEl = document.getElementById("total-price");
    let finalPriceEl = document.getElementById("final-price");
    
    if (!container) return;

    container.innerHTML = "";
    let total = 0;

    // Cart khali ga unte Empty Message chupistundi
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart" style="text-align:center; padding: 50px;">
                <i class="fa-solid fa-cart-shopping" style="font-size: 60px; color: #ccc; margin-bottom:15px;"></i>
                <h2>Your Cart is Empty!</h2>
                <p style="color:#666; margin-bottom:20px;">Looks like you haven't added anything to your cart yet.</p>
                <a href="/home" style="display:inline-block; background:#2563eb; color:white; padding:10px 25px; text-decoration:none; border-radius:25px; cursor:pointer; font-weight:bold;">Shop Now</a>
            </div>`;
        totalPriceEl.innerText = "₹0";
        finalPriceEl.innerText = "₹0";
        return;
    }

    // Cart lo unna items ni loop chesi display cheyyadam
    cart.forEach((item, index) => {
        let cleanPrice = parseFloat(item.price.toString().replace(/,/g, '')) || 0;
        let quantity = item.quantity || 1;
        let itemTotal = cleanPrice * quantity;
        total += itemTotal;

        let itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";
        itemDiv.style.cssText = "display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);";

        itemDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: contain;">
                <div>
                    <h3 style="margin: 0 0 5px 0; color: #1e293b; font-size: 16px;">${item.name}</h3>
                    <p class="price" style="margin: 0; color: #2563eb; font-weight: bold;">₹${cleanPrice.toLocaleString()}</p>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 20px;">
                <div class="qty-box" style="display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 4px;">
                    <button onclick="changeQty(${index}, -1)" style="padding: 5px 12px; background: #f8fafc; border: none; cursor: pointer; font-weight: bold;">-</button>
                    <span style="padding: 0 12px; font-weight: 500;">${quantity}</span>
                    <button onclick="changeQty(${index}, 1)" style="padding: 5px 12px; background: #f8fafc; border: none; cursor: pointer; font-weight: bold;">+</button>
                </div>
                <div class="item-total" style="text-align: right;">
                    <h4 style="margin: 0 0 5px 0; color: #0f172a;">₹${itemTotal.toLocaleString()}</h4>
                    <button class="remove-btn" onclick="removeItem(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 14px;"><i class="fa-solid fa-trash"></i> Remove</button>
                </div>
            </div>
        `;
        container.appendChild(itemDiv);
    });

    totalPriceEl.innerText = `₹${total.toLocaleString()}`;
    finalPriceEl.innerText = `₹${total.toLocaleString()}`;
}

// Quantity (+) leda (-) cheyyadaniki
function changeQty(index, change) {
    cart[index].quantity = (cart[index].quantity || 1) + change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveAndRender();
}

// Item ni delete cheyyadaniki
function removeItem(index) {
    cart.splice(index, 1);
    saveAndRender();
}

// LocalStorage lo save chesi UI update chese main function
function saveAndRender() {
    localStorage.setItem("rk_bazaar_cart", JSON.stringify(cart));
    renderCart();
}

// Page load avvagane renderCart run avvali
document.addEventListener("DOMContentLoaded", () => {
    renderCart();
});


// ================= CHECKOUT & ADDRESS LOGIC =================

// Checkout button click chesinappudu check chestundi
function handleCheckout() {
    let cart = JSON.parse(localStorage.getItem("rk_bazaar_cart")) || [];
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    let savedAddress = localStorage.getItem("rk_bazaar_address");
    let modal = document.getElementById("addressModal");
    let viewSection = document.getElementById("viewAddressSection");
    let editSection = document.getElementById("editAddressSection");

    if (!modal) return;

    if (savedAddress) {
        // Old address undhi, so view section chupinchi form hide chestunnam
        document.getElementById("savedAddressDisplay").innerText = savedAddress;
        viewSection.style.display = "block";
        editSection.style.display = "none";
    } else {
        // First time aithe direct ga edit/form section chupisthundi
        viewSection.style.display = "none";
        editSection.style.display = "block";
    }

    modal.style.display = "flex";
    modal.classList.add("modal-active");
}

// User "Edit Address" button meedha click chesinappudu
function switchToEditMode() {
    document.getElementById("viewAddressSection").style.display = "none";
    document.getElementById("editAddressSection").style.display = "block";
}

// Back button nokkithe malli old address display ki velladaniki
function cancelEdit() {
    let savedAddress = localStorage.getItem("rk_bazaar_address");
    if (savedAddress) {
        document.getElementById("viewAddressSection").style.display = "block";
        document.getElementById("editAddressSection").style.display = "none";
    } else {
        closeModal();
    }
}

function closeModal() {
    let modal = document.getElementById("addressModal");
    if (modal) {
        modal.classList.remove("modal-active");
        modal.style.display = "none";
    }
}

// Kotha address enter chesi Save & Place Order nokkithe
function saveNewAddressAndOrder(event) {
    event.preventDefault();
    
    let name = document.getElementById("fullName").value;
    let phone = document.getElementById("phone").value;
    let addr = document.getElementById("fullAddress").value;

    let formattedAddress = `${name}, Phone: ${phone}, Address: ${addr}`;
    
    // LocalStorage lo kotha address save avuthundi
    localStorage.setItem("rk_bazaar_address", formattedAddress);
    
    closeModal();
    placeOrderSuccess();
}

// OK click chesinappudu direct order place aipovali
function placeOrderSuccess() {
    localStorage.removeItem("rk_bazaar_cart");
    alert("🎉 Order Placed Successfully! Thank you for shopping with RK Bazaar.");
    window.location.href = "/home";
}