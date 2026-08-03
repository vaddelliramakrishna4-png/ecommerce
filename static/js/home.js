// ================= HERO SLIDER LOGIC =================
const slidesContainer = document.querySelector(".slides");
const slides = document.querySelectorAll(".slide");
const next = document.querySelector(".next");
const prev = document.querySelector(".prev");

if (slides.length > 0 && slidesContainer) {
    // 🔥 1. Infinite Loop kosam 1st mariyu Last slides ni Clone chestunnam
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    firstClone.id = "first-clone";
    lastClone.id = "last-clone";

    slidesContainer.appendChild(firstClone);
    slidesContainer.insertBefore(lastClone, slides[0]);

    const allSlides = document.querySelectorAll(".slide");
    let current = 1; // Real 1st slide index 1 nunchi start avuthundi
    let slideTimer;

    // Start lo animation lekunda correct position lo peduthundi
    slidesContainer.style.transition = "none";
    slidesContainer.style.transform = `translateX(-${current * 100}%)`;

    // 🔥 2. Slide move ayye function
    function updateSlider() {
        slidesContainer.style.transition = "transform 0.6s ease-in-out";
        slidesContainer.style.transform = `translateX(-${current * 100}%)`;
    }

    function nextSlide() {
        if (current >= allSlides.length - 1) return;
        current++;
        updateSlider();
    }

    function prevSlide() {
        if (current <= 0) return;
        current--;
        updateSlider();
    }

    // 🔥 3. Clone daggariki vellagane real slide ki jump avuthundi!
    slidesContainer.addEventListener("transitionend", () => {
        if (allSlides[current].id === "first-clone") {
            slidesContainer.style.transition = "none";
            current = 1;
            slidesContainer.style.transform = `translateX(-${current * 100}%)`;
        }
        if (allSlides[current].id === "last-clone") {
            slidesContainer.style.transition = "none";
            current = allSlides.length - 2;
            slidesContainer.style.transform = `translateX(-${current * 100}%)`;
        }
    });

    // Timer Reset
    function resetTimer() {
        clearInterval(slideTimer);
        slideTimer = setInterval(nextSlide, 4000);
    }

    // Button Clicks
    if (next && prev) {
        next.addEventListener("click", () => {
            nextSlide();
            resetTimer();
        });

        prev.addEventListener("click", () => {
            prevSlide();
            resetTimer();
        });
    }

    // Auto Slide every 4 seconds
    slideTimer = setInterval(nextSlide, 4000);
}


// ================= SHOPPING CART LOGIC (RK BAZAAR) =================

let cart = JSON.parse(localStorage.getItem("rk_bazaar_cart")) || [];
updateCartCount();

function addToCart(name, price, image) {
    let cleanPrice = Number(price.toString().replace(/[^0-9]/g, ''));
    let existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: cleanPrice,
            image: image,
            quantity: 1
        });
    }

    localStorage.setItem("rk_bazaar_cart", JSON.stringify(cart));
    updateCartCount();
    window.location.href = "/cart";
}

function updateCartCount() {
    let countBadge = document.querySelector(".cart-count");
    if (countBadge) {
        let totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        countBadge.innerText = totalItems;
    }
}


// ================= WISHLIST LOGIC (LOCALSTORAGE) =================

function toggleWishlist(element) {
    element.classList.toggle("active");

    let card = element.closest(".product-card") || element.closest(".deal-card");
    if (!card) return;

    let name = card.querySelector("h3").innerText;
    let priceText = card.querySelector(".price").innerText.split(" ")[0];
    let image = card.querySelector("img").src;

    let wishlist = JSON.parse(localStorage.getItem("rk_bazaar_wishlist")) || [];

    if (element.classList.contains("active")) {
        wishlist.push({ name: name, price: priceText, image: image });
        alert(`❤️ "${name}" Wishlist loki add ayyindi!`);
    } else {
        wishlist = wishlist.filter(item => item.name !== name);
        alert(`🤍 "${name}" Wishlist nunchi remove aipoyindi!`);
    }

    localStorage.setItem("rk_bazaar_wishlist", JSON.stringify(wishlist));
}


// ================= CATEGORY FILTERING LOGIC =================
function filterCategory(categoryName) {
    let productCards = document.querySelectorAll(".product-card, .deal-card");
    let category = categoryName.toLowerCase();

    productCards.forEach(card => {
        let titleElement = card.querySelector("h3");
        let badgeElement = card.querySelector(".badge");
        
        let title = titleElement ? titleElement.innerText.toLowerCase() : "";
        let badge = badgeElement ? badgeElement.innerText.toLowerCase() : "";

        // "all" click chesthe anni kanipisthayi, ledha title/badge lo match avvali
        if (category === "all" || title.includes(category) || badge.includes(category)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });

    // Smooth scroll down to products section
    window.scrollTo({ top: 500, behavior: 'smooth' });
}


// ================= LIVE SEARCH BAR LOGIC =================
const searchInput = document.getElementById("search-input") || document.querySelector(".navbar input[type='text']");

if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        let query = e.target.value.toLowerCase().trim();
        let productCards = document.querySelectorAll(".product-card, .deal-card");

        productCards.forEach(card => {
            let title = card.querySelector("h3") ? card.querySelector("h3").innerText.toLowerCase() : "";

            if (title.includes(query)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
}