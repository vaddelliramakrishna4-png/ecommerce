function updateCartCount() {
    let countBadges = document.querySelectorAll(".cart-count");
    if (window.CURRENT_USER_PHONE) {
        fetch("/api/cart")
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                let totalItems = data.cart.reduce((total, item) => total + item.quantity, 0);
                countBadges.forEach(badge => {
                    badge.innerText = totalItems;
                });
            }
        })
        .catch(err => console.error("Error fetching cart count:", err));
    } else {
        let guestCart = JSON.parse(localStorage.getItem("rk_bazaar_cart_guest")) || [];
        let totalItems = guestCart.reduce((total, item) => total + item.quantity, 0);
        countBadges.forEach(badge => {
            badge.innerText = totalItems;
        });
    }
}

function renderCart() {
    updateCartCount();
    let container = document.getElementById("cart-items-container");
    let totalPriceEl = document.getElementById("total-price");
    let finalPriceEl = document.getElementById("final-price");
    
    if (!container) return;

    container.innerHTML = "";

    function displayCartItems(items) {
        let total = 0;
        if (items.length === 0) {
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

        items.forEach((item) => {
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
                        <button onclick="changeQty('${item.name}', -1)" style="padding: 5px 12px; background: #f8fafc; border: none; cursor: pointer; font-weight: bold;">-</button>
                        <span style="padding: 0 12px; font-weight: 500;">${quantity}</span>
                        <button onclick="changeQty('${item.name}', 1)" style="padding: 5px 12px; background: #f8fafc; border: none; cursor: pointer; font-weight: bold;">+</button>
                    </div>
                    <div class="item-total" style="text-align: right;">
                        <h4 style="margin: 0 0 5px 0; color: #0f172a;">₹${itemTotal.toLocaleString()}</h4>
                        <button class="remove-btn" onclick="removeItem('${item.name}')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 14px;"><i class="fa-solid fa-trash"></i> Remove</button>
                    </div>
                </div>
            `;
            container.appendChild(itemDiv);
        });

        totalPriceEl.innerText = `₹${total.toLocaleString()}`;
        finalPriceEl.innerText = `₹${total.toLocaleString()}`;
    }

    if (window.CURRENT_USER_PHONE) {
        fetch("/api/cart")
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                displayCartItems(data.cart);
            }
        })
        .catch(err => console.error("Error rendering cart:", err));
    } else {
        let guestCart = JSON.parse(localStorage.getItem("rk_bazaar_cart_guest")) || [];
        displayCartItems(guestCart);
    }
}

// Quantity (+) leda (-) cheyyadaniki
function changeQty(name, change) {
    if (window.CURRENT_USER_PHONE) {
        fetch("/api/cart/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: name, change: change })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderCart();
            }
        })
        .catch(err => console.error("Error updating cart quantity:", err));
    } else {
        let guestCart = JSON.parse(localStorage.getItem("rk_bazaar_cart_guest")) || [];
        let existingItem = guestCart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += change;
            if (existingItem.quantity <= 0) {
                guestCart = guestCart.filter(item => item.name !== name);
            }
            localStorage.setItem("rk_bazaar_cart_guest", JSON.stringify(guestCart));
            renderCart();
        }
    }
}

// Item ni delete cheyyadaniki
function removeItem(name) {
    if (window.CURRENT_USER_PHONE) {
        fetch("/api/cart/remove", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: name })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderCart();
            }
        })
        .catch(err => console.error("Error removing cart item:", err));
    } else {
        let guestCart = JSON.parse(localStorage.getItem("rk_bazaar_cart_guest")) || [];
        guestCart = guestCart.filter(item => item.name !== name);
        localStorage.setItem("rk_bazaar_cart_guest", JSON.stringify(guestCart));
        renderCart();
    }
}

// Page load avvagane renderCart run avvali
document.addEventListener("DOMContentLoaded", () => {
    renderCart();
});

// ================= CHECKOUT & ADDRESS LOGIC =================

// Checkout button click chesinappudu check chestundi
function handleCheckout() {
    if (window.CURRENT_USER_PHONE) {
        fetch("/api/cart")
        .then(res => res.json())
        .then(data => {
            if (!data.success || data.cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }
            proceedToAddressModal();
        })
        .catch(err => console.error("Error checking checkout cart:", err));
    } else {
        let guestCart = JSON.parse(localStorage.getItem("rk_bazaar_cart_guest")) || [];
        if (guestCart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        proceedToAddressModal();
    }
}

function proceedToAddressModal() {
    let savedAddress = localStorage.getItem("rk_bazaar_address");
    let modal = document.getElementById("addressModal");
    let viewSection = document.getElementById("viewAddressSection");
    let editSection = document.getElementById("editAddressSection");

    if (!modal) return;

    if (savedAddress) {
        document.getElementById("savedAddressDisplay").innerText = savedAddress;
        viewSection.style.display = "block";
        editSection.style.display = "none";
    } else {
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
    
    let name = document.getElementById("fullName").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let addr = document.getElementById("fullAddress").value.trim();
    let pincode = document.getElementById("pincode").value.trim();

    if (!name || !phone || !addr || !pincode) {
        alert("Please fill in all the required fields.");
        return;
    }

    let formattedAddress = `${name}, Phone: ${phone}, Address: ${addr}, Pincode: ${pincode}`;
    
    localStorage.setItem("rk_bazaar_address", formattedAddress);
    localStorage.setItem("rk_bazaar_pincode", pincode);
    
    closeModal();
    placeOrderSuccess();
}

function placeOrderSuccess() {
    placeOrder();
}

// Order dynamic ga backend `/checkout` route ki pampadaniki
function placeOrder() {
    let savedAddress = localStorage.getItem("rk_bazaar_address") || "No address provided";
    let pincode = localStorage.getItem("rk_bazaar_pincode") || "";

    fetch("/checkout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            address: savedAddress,
            pincode: pincode
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            localStorage.removeItem("rk_bazaar_cart_guest");
            alert("🎉 Order Placed Successfully! Order ID: " + data.order_id);
            window.location.href = "/profile/orders";
        } else {
            alert("Failed to place order: " + data.message);
        }
    })
    .catch(err => {
        console.error("Error placing order:", err);
        alert("An error occurred while placing the order.");
    });
}