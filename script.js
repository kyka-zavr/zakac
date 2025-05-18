let basket = [];
let allProducts = [];
let showWishedOnly = false;

document.addEventListener("DOMContentLoaded", initialize);

function initialize() {
    // DOM Elements
    const elements = {
        registerForm: document.getElementById("register-form"),
        loginForm: document.getElementById("login-form"),
        logoutBtn: document.getElementById("logout-btn"),
        avatarInput: document.getElementById("avatar-upload"),
        togglePasswordBtn: document.getElementById("toggle-password"),
        toggleConfirmPasswordBtn: document.getElementById("toggle-confirm-password"),
        passwordInput: document.getElementById("login-password"),
        registerPasswordInput: document.getElementById("register-password"),
        confirmPasswordInput: document.getElementById("register-confirm"),
        eyeIcon: document.getElementById("eye-icon"),
        eyeIconPassword: document.getElementById("eye-icon-password"),
        eyeIconConfirm: document.getElementById("eye-icon-confirm"),
        basketBtn: document.querySelector('.basket-btn'),
        closeBasketBtn: document.querySelector('#close-basket'),
        searchInput: document.getElementById('search-input'),
        wishedProductsBtn: document.getElementById('wished-products-btn'),
        accountBtn: document.querySelector('.account-btn'),
        loginBox: document.querySelector(".login-box"),
        registerBox: document.querySelector(".register-box"),
        addProductBtn: document.getElementById("add-product-btn"),
        productModal: document.getElementById("product-modal"),
        productForm: document.getElementById("product-form"),
        cancelProduct: document.getElementById("cancel-product"),
        productsGrid: document.getElementById("products-grid"),
        modalTitle: document.getElementById("modal-title")
    };

    // Apply fly-in animation
    [elements.loginBox, elements.registerBox].forEach(box => {
        if (box) box.classList.add("fly-in");
    });

    // Event Listeners
    const eventListeners = [
        { element: elements.registerForm, event: "submit", handler: register },
        { element: elements.loginForm, event: "submit", handler: login },
        { element: elements.logoutBtn, event: "click", handler: logout },
        { element: elements.avatarInput, event: "change", handler: uploadAvatar },
        { element: elements.addProductBtn, event: "click", handler: () => {
            elements.modalTitle.textContent = "Добавить новый товар";
            elements.productForm.reset();
            elements.productForm.dataset.editId = "";
            elements.productModal.style.display = "flex";
        }},
        { element: elements.cancelProduct, event: "click", handler: () => {
            elements.productModal.style.display = "none";
        }},
        { element: elements.productForm, event: "submit", handler: saveProduct },
        { element: elements.basketBtn, event: "click", handler: () => {
            const basketModal = document.querySelector('.basket-modal');
            if (basketModal) {
                basketModal.style.display = 'flex';
                renderBasket();
            } else {
                console.error('Basket modal not found!');
            }
        }},
        { element: elements.closeBasketBtn, event: "click", handler: () => {
            const basketModal = document.querySelector('.basket-modal');
            if (basketModal) basketModal.style.display = 'none';
        }},
        { element: elements.searchInput, event: "input", handler: () => {
            filterProducts(elements.searchInput.value.toLowerCase(), showWishedOnly);
        }},
        { element: elements.wishedProductsBtn, event: "click", handler: toggleWishedProducts }
    ];

    eventListeners.forEach(({ element, event, handler }) => {
        if (element) element.addEventListener(event, handler);
    });

    // Password Toggle Functionality
    setupPasswordToggle(elements.togglePasswordBtn, elements.passwordInput, elements.eyeIcon, "password");
    setupPasswordToggle(elements.togglePasswordBtn, elements.registerPasswordInput, elements.eyeIconPassword, "password");
    setupPasswordToggle(elements.toggleConfirmPasswordBtn, elements.confirmPasswordInput, elements.eyeIconConfirm, "confirm password");

    // Account Button Animation
    if (elements.accountBtn) {
        elements.accountBtn.addEventListener('click', (e) => {
            e.preventDefault();
            animateTransition("account.html");
        });
    }

    // User-specific UI
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        updateAvatarDisplay(user);
        if (user.prefix === "admin" && elements.addProductBtn) {
            elements.addProductBtn.style.display = "flex";
        }
    }

    // Initial Loads
    if (document.getElementById("account-username")) loadAccount();
    checkSession();
    loadProducts();

    // Link Animation
    document.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const href = link.getAttribute("href");
            [elements.loginBox, elements.registerBox].forEach(box => {
                if (box) {
                    box.classList.remove("fly-in");
                    box.classList.add("fly-out");
                }
            });
            setTimeout(() => window.location.href = href, 700);
        });
    });

    // Update account avatar
    if (user && document.getElementById("account-avatar")) {
        const avatarImg = document.getElementById("account-avatar");
        avatarImg.src = user.avatar ? `/avatars/${user.avatar}` : "./ico/user/white/white-user-40px.png";
    }
}

function setupPasswordToggle(btn, input, icon, type) {
    if (btn && input && icon) {
        btn.addEventListener("click", () => {
            const isVisible = input.type === "text";
            input.type = isVisible ? "password" : "text";
            icon.src = isVisible
                ? "./ico/eye/cat-white/cat-closed-eye-32px.png"
                : "./ico/eye/cat-white/cat-open-eye-32px.png";
            icon.alt = isVisible ? `Show ${type}` : `Hide ${type}`;
        });
    }
}

function animateTransition(href) {
    const elements = {
        products: document.querySelectorAll('.product-card'),
        wishedProductsBtn: document.querySelector('.wished-products-btn'),
        addProductBtn: document.querySelector('.add-product-btn'),
        basketBtn: document.querySelector('.basket-btn'),
        accountBtn: document.querySelector('.account-btn'),
        tab: document.querySelector('.tab')
    };

    if (elements.products.length > 0) {
        elements.products.forEach((product, index) => {
            setTimeout(() => {
                product.style.opacity = '0';
                product.style.transform = 'scale(0.8)';
            }, (elements.products.length - 1 - index) * 100);
        });
    }

    const timeouts = [
        { element: elements.wishedProductsBtn, delay: elements.products.length * 100 },
        { element: elements.addProductBtn, delay: elements.products.length * 100 + 100 },
        { element: elements.basketBtn, delay: elements.products.length * 100 + 200 },
        { element: elements.accountBtn, delay: elements.products.length * 100 + 300 }
    ];

    timeouts.forEach(({ element, delay }) => {
        if (element) {
            setTimeout(() => {
                element.style.transform = 'translateY(-50px)';
                element.style.opacity = '0';
            }, delay);
        }
    });

    setTimeout(() => {
        if (elements.tab) elements.tab.classList.add('hidden');
    }, elements.products.length * 100 + 400);

    setTimeout(() => window.location.href = href, elements.products.length * 100 + 500);
}

function updateAvatarDisplay(user) {
    document.querySelectorAll('img.account-avatar').forEach(img => {
        img.src = user.avatar && user.avatar.trim() !== ""
            ? `/avatars/${user.avatar}`
            : "./ico/user/white/white-user-512px.png";
    });
}

async function saveProduct(event) {
    event.preventDefault();
    const elements = {
        title: document.getElementById("product-title").value,
        description: document.getElementById("product-description").value,
        price: parseFloat(document.getElementById("product-price").value),
        stock: parseInt(document.getElementById("product-stock").value),
        coverInput: document.getElementById("product-cover"),
        editId: document.getElementById("product-form").dataset.editId
    };
    const user = JSON.parse(localStorage.getItem("user"));

    let coverFileName = "";
    if (elements.coverInput.files[0]) {
        const formData = new FormData();
        formData.append("cover", elements.coverInput.files[0]);
        formData.append("title", elements.title);

        try {
            const response = await fetch("/api/upload-cover", {
                method: "POST",
                body: formData
            });
            if (!response.ok) throw new Error(`Upload cover failed: ${response.status}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.message || "Ошибка загрузки обложки");
            coverFileName = data.filename;
        } catch (err) {
            alert("Ошибка загрузки обложки: " + err.message);
            return;
        }
    }

    const productData = {
        title: elements.title,
        description: elements.description,
        cover: coverFileName,
        price: elements.price,
        stock: elements.stock,
        createdBy: user.username,
        wishedBy: []
    };

    try {
        const response = await fetch(elements.editId ? `/api/products/${elements.editId}` : "/api/products", {
            method: elements.editId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData)
        });
        if (!response.ok) throw new Error(`${elements.editId ? 'Edit' : 'Create'} product failed: ${response.status}`);
        loadProducts();
        document.getElementById("product-modal").style.display = "none";
    } catch (err) {
        alert("Ошибка сохранения товара: " + err.message);
    }
}

function toggleWishedProducts() {
    const btn = document.getElementById('wished-products-btn');
    btn.classList.remove(showWishedOnly ? 'toggle-off' : 'toggle-on');
    btn.classList.add(showWishedOnly ? 'toggle-on' : 'toggle-off');

    setTimeout(() => {
        showWishedOnly = !showWishedOnly;
        btn.classList.toggle('active', showWishedOnly);
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        filterProducts(searchTerm, showWishedOnly);
        btn.classList.remove('toggle-on', 'toggle-off');
    }, 300);
}

function filterProducts(searchTerm, showWishedOnly) {
    const productsGrid = document.getElementById("products-grid");
    const user = JSON.parse(localStorage.getItem("user"));
    const username = user?.username;

    const filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm);
        const isWished = username && product.wishedBy.includes(username);
        return matchesSearch && (!showWishedOnly || isWished);
    });

    productsGrid.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('visible');
        card.classList.add('hidden');
    });

    setTimeout(() => {
        productsGrid.innerHTML = '';
        filteredProducts.forEach(product => {
            const productCard = document.createElement("div");
            productCard.className = "product-card";
            productCard.dataset.id = product.id;

            const isWished = username && product.wishedBy.includes(username);
            const isAdmin = user?.prefix === "admin";
            const isInBasket = basket.some(item => item.id === product.id);

            productCard.innerHTML = `
                <img src="${product.cover ? `/covers/${product.cover}` : './img/placeholder-product.jpg'}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p>${product.description}</p>
                <span class="price">${product.price} ₽</span>
                <div class="product-buttons">
                    <button class="buy-btn">Купить</button>
                    <button class="cart-btn ${isInBasket ? 'added' : ''}">${isInBasket ? 'Добавлено' : 'В корзину'}</button>
                    <button class="wish-btn ${isWished ? 'active' : ''}">
                        <img src="${isWished ? './ico/heart/fill/white-heart-50px.png' : './ico/heart/no-fill/white-heart-50px.png'}" alt="Добавить в избранное">
                    </button>
                    ${isAdmin ? `
                        <button class="delete-btn">Удалить</button>
                        <button class="edit-btn">Редактировать</button>
                    ` : ''}
                </div>
            `;

            productsGrid.appendChild(productCard);
            setTimeout(() => productCard.classList.add('visible'), 50);

            productCard.querySelector(".buy-btn").addEventListener("click", () => buyProduct(product.id));
            productCard.querySelector(".cart-btn").addEventListener("click", () => addToCart(product));
            productCard.querySelector(".wish-btn").addEventListener("click", (event) => {
                event.preventDefault();
                toggleWish(product.id);
            });

            if (isAdmin) {
                productCard.querySelector(".delete-btn").addEventListener("click", () => deleteProduct(product.id));
                productCard.querySelector(".edit-btn").addEventListener("click", () => editProduct(product));
            }
        });

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = '<p>Товары не найдены.</p>';
        }
    }, 500);
}

function showNotification(message) {
    let notification = document.querySelector('.notification') || document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

async function loadProducts() {
    const productsGrid = document.getElementById("products-grid");
    try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error(`Failed to load products: ${response.status}`);
        allProducts = await response.json();
        console.log("Loaded products from server:", allProducts);
        filterProducts('', showWishedOnly);
    } catch (err) {
        console.error("Ошибка загрузки товаров:", err);
        productsGrid.innerHTML = "<p>Не удалось загрузить товары. Попробуйте позже.</p>";
    }
}

function buyProduct(productId) {
    alert(`Куплен товар с ID ${productId}! (Функционал в разработке)`);
}

async function addToCart(product) {
    if (basket.find(item => item.id === product.id)) {
        showNotification('Товар уже в корзине!');
        return;
    }

    const productData = {
        id: product.id,
        name: product.title,
        description: product.description,
        price: product.price,
        image: product.cover ? `/covers/${product.cover}` : './img/placeholder-product.jpg'
    };

    basket.push(productData);
    updateCartButton(product.id, true);
    showNotification('Товар добавлен в корзину!');
    console.log('Basket updated:', basket);
}

function updateCartButton(productId, added) {
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (productCard) {
        const cartBtn = productCard.querySelector('.cart-btn');
        if (cartBtn) {
            cartBtn.textContent = added ? 'Добавлено' : 'В корзину';
            cartBtn.classList.toggle('added', added);
            cartBtn.disabled = added;
        }
    }
}

function renderBasket() {
    const basketItemsContainer = document.querySelector('.basket-items');
    const basketTotal = document.querySelector('.basket-total p');
    if (!basketItemsContainer || !basketTotal) {
        console.error('Basket items container or total not found!');
        return;
    }

    basketItemsContainer.innerHTML = '';
    let total = 0;

    if (basket.length === 0) {
        basketItemsContainer.innerHTML = '<p>Корзина пуста</p>';
    } else {
        basket.forEach((item, index) => {
            const basketItem = document.createElement('div');
            basketItem.classList.add('basket-item');
            basketItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="basket-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                </div>
                <span class="price">${item.price} ₽</span>
                <button class="remove-btn">Удалить</button>
            `;
            basketItemsContainer.appendChild(basketItem);

            basketItem.querySelector('.remove-btn').addEventListener('click', () => {
                basket.splice(index, 1);
                renderBasket();
                updateCartButton(item.id, false);
            });

            total += item.price;
        });
    }

    basketTotal.textContent = `Итого: ${total} ₽`;
}

async function toggleWish(productId) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        showNotification("Войдите в аккаунт, чтобы добавить в желаемые!");
        return;
    }

    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error(`Не удалось загрузить продукт: ${response.status}`);
        const product = await response.json();

        let wishedBy = product.wishedBy || [];
        const userIndex = wishedBy.indexOf(user.username);
        const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
        const wishBtn = productCard.querySelector('.wish-btn');
        const wishImg = wishBtn.querySelector('img');

        if (userIndex === -1) {
            wishedBy.push(user.username);
            wishImg.src = './ico/heart/fill/white-heart-50px.png';
            wishBtn.classList.add('active');
            showNotification("Товар добавлен в желаемые!");
        } else {
            wishedBy.splice(userIndex, 1);
            wishImg.src = './ico/heart/no-fill/white-heart-50px.png';
            wishBtn.classList.remove('active');
            showNotification("Товар удалён из желаемых!");
        }

        const updateResponse = await fetch(`/api/products/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...product, wishedBy })
        });

        if (!updateResponse.ok) throw new Error(`Не удалось обновить желаемые: ${updateResponse.status}`);

        const productIndex = allProducts.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            allProducts[productIndex].wishedBy = wishedBy;
        }

        filterProducts(document.getElementById('search-input')?.value.toLowerCase() || '', showWishedOnly);
    } catch (err) {
        showNotification("Ошибка: " + err.message);
        console.error("Ошибка в toggleWish:", err);
    }
}

async function deleteProduct(productId) {
    if (confirm("Удалить товар?")) {
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error(`Failed to delete product: ${response.status}`);
            loadProducts();
        } catch (err) {
            alert("Ошибка удаления товара: " + err.message);
        }
    }
}

async function editProduct(product) {
    const elements = {
        modal: document.getElementById("product-modal"),
        title: document.getElementById("modal-title"),
        form: document.getElementById("product-form")
    };

    elements.title.textContent = "Редактировать товар";
    document.getElementById("product-title").value = product.title;
    document.getElementById("product-description").value = product.description;
    document.getElementById("product-price").value = product.price;
    document.getElementById("product-stock").value = product.stock;
    elements.form.dataset.editId = product.id;
    elements.modal.style.display = "flex";
}

async function register(event) {
    event.preventDefault();
    const elements = {
        email: document.getElementById("register-email").value,
        username: document.getElementById("register-username").value,
        password: document.getElementById("register-password").value,
        confirmPassword: document.getElementById("register-confirm").value,
        registerBox: document.querySelector(".register-box")
    };

    if (elements.password !== elements.confirmPassword) {
        alert("Пароли не совпадают!");
        return;
    }

    try {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
        const users = await response.json();

        if (users.find(user => user.username === elements.username)) {
            alert("Такой ник уже занят!");
            return;
        }

        const newUser = { 
            email: elements.email, 
            username: elements.username, 
            password: elements.password, 
            avatar: "", 
            description: "Нет описания" 
        };
        const postResponse = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser)
        });

        if (!postResponse.ok) throw new Error(`Failed to register: ${await postResponse.text()}`);

        localStorage.setItem("user", JSON.stringify(newUser));
        if (elements.registerBox) {
            elements.registerBox.classList.remove("fly-in");
            elements.registerBox.classList.add("fly-up");
        }
        setTimeout(() => window.location.href = "home.html", 700);
    } catch (err) {
        alert("Ошибка регистрации: " + err.message);
    }
}

async function login(event) {
    event.preventDefault();
    const elements = {
        username: document.getElementById("login-username").value,
        password: document.getElementById("login-password").value,
        loginBox: document.querySelector(".login-box")
    };

    try {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
        const users = await response.json();
        const user = users.find(user => user.username === elements.username && user.password === elements.password);

        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
            if (elements.loginBox) {
                elements.loginBox.classList.remove("fly-in");
                elements.loginBox.classList.add("fly-up");
            }
            setTimeout(() => window.location.href = "home.html", 700);
        } else {
            alert("Неправильный ник или пароль!");
        }
    } catch (err) {
        alert("Ошибка входа: " + err.message);
    }
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

function checkSession() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && !["/home.html", "/account.html"].includes(window.location.pathname)) {
        window.location.href = "home.html";
    }
}

async function loadAccount() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("account-username").textContent = user.username;
    document.getElementById("account-email").textContent = user.email;
    const avatarImg = document.getElementById("account-avatar");
    avatarImg.src = user.avatar ? `/avatars/${user.avatar}` : "./ico/user/white/white-user-512px.png";
}

async function uploadAvatar(event) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !event.target.files[0]) return;

    const formData = new FormData();
    formData.append("avatar", event.target.files[0]);

    try {
        const response = await fetch(`/api/upload-avatar?username=${encodeURIComponent(user.username)}`, {
            method: "POST",
            body: formData
        });
        if (!response.ok) throw new Error(`Failed to upload avatar: ${response.status}`);
        const data = await response.json();

        if (data.success) {
            user.avatar = data.filename;
            localStorage.setItem("user", JSON.stringify(user));
            document.getElementById("account-avatar").src = `/avatars/${data.filename}`;
            location.reload();
        } else {
            alert("Ошибка загрузки аватарки: " + data.message);
        }
    } catch (err) {
        alert("Ошибка загрузки аватарки: " + err.message);
    }
}