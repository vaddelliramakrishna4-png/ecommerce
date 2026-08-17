// transparent localStorage interceptor for user cart and address isolation
(function() {
    const ogGet = localStorage.getItem;
    const ogSet = localStorage.setItem;
    const ogRemove = localStorage.removeItem;
    
    // Check global window object for logged-in user phone
    function getSuffix() {
        const phone = window.CURRENT_USER_PHONE || "";
        return phone ? "_" + phone : "_guest";
    }

    localStorage.getItem = function(key) {
        if (['rk_bazaar_cart', 'rk_bazaar_address', 'rk_bazaar_pincode'].includes(key)) {
            return ogGet.call(localStorage, key + getSuffix());
        }
        return ogGet.apply(localStorage, arguments);
    };

    localStorage.setItem = function(key, value) {
        if (['rk_bazaar_cart', 'rk_bazaar_address', 'rk_bazaar_pincode'].includes(key)) {
            return ogSet.call(localStorage, key + getSuffix(), value);
        }
        return ogSet.apply(localStorage, arguments);
    };

    localStorage.removeItem = function(key) {
        if (['rk_bazaar_cart', 'rk_bazaar_address', 'rk_bazaar_pincode'].includes(key)) {
            return ogRemove.call(localStorage, key + getSuffix());
        }
        return ogRemove.apply(localStorage, arguments);
    };

    // Sync database address and pincode to localStorage if not already set locally
    document.addEventListener("DOMContentLoaded", () => {
        const suffix = getSuffix();
        if (suffix !== "_guest") {
            if (window.SAVED_ADDRESS_FROM_DB && !ogGet.call(localStorage, "rk_bazaar_address" + suffix)) {
                ogSet.call(localStorage, "rk_bazaar_address" + suffix, window.SAVED_ADDRESS_FROM_DB);
            }
            if (window.SAVED_PINCODE_FROM_DB && !ogGet.call(localStorage, "rk_bazaar_pincode" + suffix)) {
                ogSet.call(localStorage, "rk_bazaar_pincode" + suffix, window.SAVED_PINCODE_FROM_DB);
            }

            // Sync guest cart to database if logged in
            let guestCartKey = "rk_bazaar_cart_guest";
            let guestCart = JSON.parse(ogGet.call(localStorage, guestCartKey)) || [];
            if (guestCart.length > 0) {
                fetch("/api/cart/merge", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ cart: guestCart })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        ogRemove.call(localStorage, guestCartKey);
                        if (typeof updateCartCount === 'function') {
                            updateCartCount();
                        }
                    }
                })
                .catch(err => console.error("Error merging cart:", err));
            }
        }
    });
})();

// Global function to update cart counter badge across all pages
window.updateCartCount = function() {
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
};

// Auto-run cart count retrieval on load and pageshow (fixes back button browser cache)
document.addEventListener("DOMContentLoaded", () => {
    window.updateCartCount();
});
window.addEventListener("pageshow", (event) => {
    window.updateCartCount();
});

// Global function to add items to cart, handling both database storage (logged in) and localStorage (guest)
window.addToCart = function(name, price, image, quantity = 1, redirect = false) {
    let cleanPrice = Number(price.toString().replace(/[^0-9]/g, ''));
    const phone = window.CURRENT_USER_PHONE || "";
    
    if (phone) {
        return fetch("/api/cart/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: name, price: cleanPrice, image: image, quantity: quantity })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.updateCartCount();
                if (redirect) {
                    window.location.href = "/cart";
                }
                return data;
            } else {
                alert("Failed to add item to cart: " + data.message);
                throw new Error(data.message);
            }
        })
        .catch(err => {
            console.error("Error adding to cart:", err);
            alert("Error adding to cart.");
            throw err;
        });
    } else {
        let guestCartKey = "rk_bazaar_cart_guest";
        let guestCart = JSON.parse(localStorage.getItem(guestCartKey)) || [];
        let existingItem = guestCart.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            guestCart.push({
                name: name,
                price: cleanPrice,
                image: image,
                quantity: quantity
            });
        }

        localStorage.setItem(guestCartKey, JSON.stringify(guestCart));
        window.updateCartCount();
        if (redirect) {
            window.location.href = "/cart";
        }
        return Promise.resolve({ success: true });
    }
};

// Global click handler to animate add-to-cart buttons
window.handleAddToCartClick = function(button, name, price, image) {
    if (button.disabled) return;
    button.disabled = true;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
    button.style.backgroundColor = '#10b981'; // Green color for success
    button.style.borderColor = '#10b981';
    button.style.color = '#ffffff';
    
    window.addToCart(name, price, image, 1, false)
    .then(() => {
        setTimeout(() => {
            button.disabled = false;
            button.innerHTML = originalText;
            button.style.backgroundColor = '';
            button.style.borderColor = '';
            button.style.color = '';
        }, 1500);
    })
    .catch(() => {
        button.disabled = false;
        button.innerHTML = originalText;
        button.style.backgroundColor = '';
        button.style.borderColor = '';
        button.style.color = '';
    });
};

// Password toggler (conditional to prevent errors on pages without togglePassword)
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");

if (togglePassword && password) {
    togglePassword.addEventListener("click", function () {
        if (password.type === "password") {
            password.type = "text";
            togglePassword.classList.remove("fa-eye");
            togglePassword.classList.add("fa-eye-slash");
        } else {
            password.type = "password";
            togglePassword.classList.remove("fa-eye-slash");
            togglePassword.classList.add("fa-eye");
        }
    });
}

// User menu dropdown togglers (desktop & mobile)
window.toggleUserMenu = function(event) {
    event.stopPropagation();
    const menu = document.getElementById('userDropdownMenu');
    if (menu) {
        menu.style.display = (menu.style.display === 'none' || !menu.style.display) ? 'block' : 'none';
    }
};

window.toggleMobileUserMenu = function(event) {
    event.stopPropagation();
    const menu = document.getElementById('mobileUserDropdownMenu');
    if (menu) {
        menu.style.display = (menu.style.display === 'none' || !menu.style.display) ? 'block' : 'none';
    }
};

document.addEventListener('click', () => {
    const desktopMenu = document.getElementById('userDropdownMenu');
    if (desktopMenu) desktopMenu.style.display = 'none';
    const mobileMenu = document.getElementById('mobileUserDropdownMenu');
    if (mobileMenu) mobileMenu.style.display = 'none';
});