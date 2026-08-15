// ================= HERO SLIDER LOGIC =================
const slidesContainer = document.querySelector(".slides");
const slides = document.querySelectorAll(".slide");
const next = document.querySelector(".next");
const prev = document.querySelector(".prev");

if (slides.length > 0 && slidesContainer) {
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    firstClone.id = "first-clone";
    lastClone.id = "last-clone";

    slidesContainer.appendChild(firstClone);
    slidesContainer.insertBefore(lastClone, slides[0]);

    const allSlides = document.querySelectorAll(".slide");
    let current = 1;
    let slideTimer;

    slidesContainer.style.transition = "none";
    slidesContainer.style.transform = `translateX(-${current * 100}%)`;

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

    function resetTimer() {
        clearInterval(slideTimer);
        slideTimer = setInterval(nextSlide, 4000);
    }

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

    slideTimer = setInterval(nextSlide, 4000);
}


// ================= SHOPPING CART LOGIC (RK MART) =================

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
    let countBadges = document.querySelectorAll(".cart-count");
    let totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    countBadges.forEach(badge => {
        badge.innerText = totalItems;
    });
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
    } else {
        wishlist = wishlist.filter(item => item.name !== name);
    }

    localStorage.setItem("rk_bazaar_wishlist", JSON.stringify(wishlist));
}


// ================= ROBUST CATEGORY FILTERING LOGIC =================
function filterCategory(categoryName) {
    let productCards = document.querySelectorAll(".product-card, .deal-card");
    let target = categoryName.toLowerCase().trim();

    productCards.forEach(card => {
        let title = card.querySelector("h3") ? card.querySelector("h3").innerText.toLowerCase() : "";
        let badge = card.querySelector(".badge") ? card.querySelector(".badge").innerText.toLowerCase() : "";
        
        let isMatch = false;

        if (target === "all") {
            isMatch = true;
        } else if (target === "mobiles") {
            if (title.includes("iphone") || title.includes("samsung") || title.includes("mobile") || badge.includes("mobile")) {
                isMatch = true;
            }
        } else if (target === "laptops") {
            if (title.includes("hp") || title.includes("macbook") || title.includes("laptop") || title.includes("ipad") || badge.includes("laptop")) {
                isMatch = true;
            }
        } else if (target === "electronics") {
            if (title.includes("sony") || title.includes("tv") || title.includes("headphone") || title.includes("drone") || title.includes("camera") || badge.includes("electronics")) {
                isMatch = true;
            }
        } else if (target === "fashion") {
            if (title.includes("nike") || title.includes("shoe") || title.includes("shirt") || badge.includes("fashion") || badge.includes("sale")) {
                isMatch = true;
            }
        } else {
            if (title.includes(target) || badge.includes(target)) {
                isMatch = true;
            }
        }

        if (isMatch) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });

    window.scrollTo({ top: 500, behavior: 'smooth' });
}


// ================= SERVER-SIDE SEARCH REDIRECT LOGIC =================
const searchInput = document.getElementById("search-input") || document.querySelector(".navbar input[type='text']");

if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            let query = e.target.value.trim();
            if (query !== "") {
                let searchForm = searchInput.closest("form");
                if (searchForm) {
                    searchForm.submit();
                } else {
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }
            }
        }
    });
}