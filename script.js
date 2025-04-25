let basket = [];
let allProducts = [];
let showWishedOnly = false;

document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const logoutBtn = document.getElementById("logout-btn");
    const avatarInput = document.getElementById("avatar-upload");
    const togglePasswordBtn = document.getElementById("toggle-password");
    const toggleConfirmPasswordBtn = document.getElementById("toggle-confirm-password");
    const passwordInput = document.getElementById("login-password");
    const registerPasswordInput = document.getElementById("register-password");
    const confirmPasswordInput = document.getElementById("register-confirm");
    const eyeIcon = document.getElementById("eye-icon");
    const eyeIconPassword = document.getElementById("eye-icon-password");
    const eyeIconConfirm = document.getElementById("eye-icon-confirm");
    const basketBtn = document.querySelector('.basket-btn');
    const closeBasketBtn = document.querySelector('#close-basket');
    const searchInput = document.getElementById('search-input');
    const wishedProductsBtn = document.getElementById('wished-products-btn');
    const accountBtn = document.querySelector('.account-btn');

    const loginBox = document.querySelector(".login-box");
    if (loginBox) {
        loginBox.classList.add("fly-in");
    }

    const registerBox = document.querySelector(".register-box");
    if (registerBox) {
        registerBox.classList.add("fly-in");
    }

    if (registerForm) registerForm.addEventListener("submit", register);
    if (loginForm) loginForm.addEventListener("submit", login);
    if (logoutBtn) logoutBtn.addEventListener("click", logout);
    if (avatarInput) avatarInput.addEventListener("change", uploadAvatar);

    if (document.getElementById("account-username")) loadAccount();
    checkSession();

    if (togglePasswordBtn && passwordInput && eyeIcon) {
        togglePasswordBtn.addEventListener("click", () => {
            const isPasswordVisible = passwordInput.type === "text";
            passwordInput.type = isPasswordVisible ? "password" : "text";
            eyeIcon.src = isPasswordVisible
                ? "./ico/eye/cat-white/cat-closed-eye-32px.png"
                : "./ico/eye/cat-white/cat-open-eye-32px.png";
            eyeIcon.alt = isPasswordVisible ? "Show password" : "Hide password";
        });
    }

    if (togglePasswordBtn && registerPasswordInput && eyeIconPassword) {
        togglePasswordBtn.addEventListener("click", () => {
            const isPasswordVisible = registerPasswordInput.type === "text";
            registerPasswordInput.type = isPasswordVisible ? "password" : "text";
            eyeIconPassword.src = isPasswordVisible
                ? "./ico/eye/cat-white/cat-closed-eye-32px.png"
                : "./ico/eye/cat-white/cat-open-eye-32px.png";
            eyeIconPassword.alt = isPasswordVisible ? "Show password" : "Hide password";
        });
    }

    if (toggleConfirmPasswordBtn && confirmPasswordInput && eyeIconConfirm) {
        toggleConfirmPasswordBtn.addEventListener("click", () => {
            const isConfirmVisible = confirmPasswordInput.type === "text";
            confirmPasswordInput.type = isConfirmVisible ? "password" : "text";
            eyeIconConfirm.src = isConfirmVisible
                ? "./ico/eye/cat-white/cat-closed-eye-32px.png"
                : "./ico/eye/cat-white/cat-open-eye-32px.png";
            eyeIconConfirm.alt = isConfirmVisible ? "Show confirm password" : "Hide confirm password";
        });
    }

    const addProductBtn = document.getElementById("add-product-btn");
    const productModal = document.getElementById("product-modal");
    const productForm = document.getElementById("product-form");
    const cancelProduct = document.getElementById("cancel-product");
    const productsGrid = document.getElementById("products-grid");
    const modalTitle = document.getElementById("modal-title");

    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.prefix === "admin") {
        addProductBtn.style.display = "flex";
    }

    if (user && accountBtn) {
        const avatarImg = accountBtn.querySelector('.account-avatar');
        if (avatarImg) {
            avatarImg.src = user.avatar ? `/avatars/${user.avatar}` : "./ico/user/white/white-user-40px.png";
        }
    }

    if (accountBtn) {
        accountBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const href = "account.html";

            const tab = document.querySelector('.tab');
            const products = document.querySelectorAll('.product-card');
            const basketBtn = document.querySelector('.basket-btn');
            const addProductBtn = document.querySelector('.add-product-btn');
            const wishedProductsBtn = document.querySelector('.wished-products-btn');

            if (products.length > 0) {
                products.forEach((product, index) => {
                    setTimeout(() => {
                        product.style.opacity = '0';
                        product.style.transform = 'scale(0.8)';
                    }, (products.length - 1 - index) * 100);
                });
            }

            setTimeout(() => {
                if (wishedProductsBtn) {
                    wishedProductsBtn.style.transform = 'translateY(-50px)';
                    wishedProductsBtn.style.opacity = '0';
                }
            }, products.length * 100);

            setTimeout(() => {
                if (addProductBtn) {
                    addProductBtn.style.transform = 'translateY(-50px)';
                    addProductBtn.style.opacity = '0';
                }
            }, products.length * 100 + 100);

            setTimeout(() => {
                if (basketBtn) {
                    basketBtn.style.transform = 'translateY(-50px)';
                    basketBtn.style.opacity = '0';
                }
            }, products.length * 100 + 200);

            setTimeout(() => {
                if (accountBtn) {
                    accountBtn.style.transform = 'translateY(-50px)';
                    accountBtn.style.opacity = '0';
                }
            }, products.length * 100 + 300);

            setTimeout(() => {
                if (tab) {
                    tab.classList.add('hidden');
                }
            }, products.length * 100 + 400);

            setTimeout(() => {
                window.location.href = href;
            }, products.length * 100 + 500);
        });
    }

    loadProducts();

    if (addProductBtn) {
        addProductBtn.addEventListener("click", () => {
            modalTitle.textContent = "Добавить новый товар";
            productForm.reset();
            productForm.dataset.editId = "";
            productModal.style.display = "flex";
        });
    }

    if (cancelProduct) {
        cancelProduct.addEventListener("click", () => {
            productModal.style.display = "none";
        });
    }

    if (productForm) {
        productForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const title = document.getElementById("product-title").value;
            const description = document.getElementById("product-description").value;
            const price = parseFloat(document.getElementById("product-price").value);
            const stock = parseInt(document.getElementById("product-stock").value);
            const coverInput = document.getElementById("product-cover");
            const editId = productForm.dataset.editId;

            let coverFileName = "";
            if (coverInput.files[0]) {
                const formData = new FormData();
                formData.append("cover", coverInput.files[0]);
                formData.append("title", title);

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
                title,
                description,
                cover: coverFileName,
                price,
                stock,
                createdBy: user.username,
                wishedBy: []
            };

            try {
                if (editId) {
                    const response = await fetch(`/api/products/${editId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(productData)
                    });
                    if (!response.ok) throw new Error(`Edit product failed: ${response.status}`);
                } else {
                    const response = await fetch("/api/products", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(productData)
                    });
                    if (!response.ok) throw new Error(`Create product failed: ${response.status}`);
                }
                loadProducts();
                productModal.style.display = "none";
            } catch (err) {
                alert("Ошибка сохранения товара: " + err.message);
            }
        });
    }

    if (basketBtn) {
        basketBtn.addEventListener('click', () => {
            const basketModal = document.querySelector('.basket-modal');
            console.log('Basket Modal:', basketModal);
            if (basketModal) {
                basketModal.style.display = 'flex';
                renderBasket();
            } else {
                console.error('Basket modal not found!');
            }
        });
    }

    if (closeBasketBtn) {
        closeBasketBtn.addEventListener('click', () => {
            const basketModal = document.querySelector('.basket-modal');
            if (basketModal) {
                basketModal.style.display = 'none';
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            filterProducts(searchTerm, showWishedOnly);
        });
    }

    if (wishedProductsBtn) {
        wishedProductsBtn.addEventListener('click', () => {
            wishedProductsBtn.classList.remove(showWishedOnly ? 'toggle-off' : 'toggle-on');
            wishedProductsBtn.classList.add(showWishedOnly ? 'toggle-on' : 'toggle-off');

            setTimeout(() => {
                showWishedOnly = !showWishedOnly;
                wishedProductsBtn.classList.toggle('active', showWishedOnly);
                const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
                filterProducts(searchTerm, showWishedOnly);

                wishedProductsBtn.classList.remove('toggle-on', 'toggle-off');
            }, 300);
        });
    }

    document.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const href = this.getAttribute("href");

            if (loginBox) {
                loginBox.classList.remove("fly-in");
                loginBox.classList.add("fly-out");
            }
            if (registerBox) {
                registerBox.classList.remove("fly-in");
                registerBox.classList.add("fly-out");
            }

            setTimeout(() => {
                window.location.href = href;
            }, 700);
        });
    });
});

function filterProducts(searchTerm, showWishedOnly) {
    const productsGrid = document.getElementById("products-grid");
    const user = JSON.parse(localStorage.getItem("user"));
    const username = user ? user.username : null;

    const filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm);
        const isWished = username && product.wishedBy.includes(username);
        return matchesSearch && (!showWishedOnly || isWished);
    });

    const productCards = productsGrid.querySelectorAll('.product-card');
    productCards.forEach(card => {
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
            const isAdmin = user && user.prefix === "admin";
            const isInBasket = basket.some(item => item.id === product.id);

            productCard.innerHTML = `
                <img src="${product.cover ? `/covers/${product.cover}` : './img/placeholder-product.jpg'}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p>${product.description}</p>
                <span class="price">${product.price} ₽</span>
                <div class="product-buttons">
                    <button class="buy-btn">Купить</button>
                    <button class="cart-btn ${isInBasket ? 'added' : ''}">${isInBasket ? 'Добавлено' : 'В корзину'}</button>
                    <button class="wish-btn ${isWished ? 'active' : ''}">${isWished ? '★' : '☆'}</button>
                    ${isAdmin ? `
                        <button class="delete-btn">Удалить</button>
                        <button class="edit-btn">Редактировать</button>
                    ` : ''}
                </div>
            `;

            productsGrid.appendChild(productCard);

            setTimeout(() => {
                productCard.classList.add('visible');
            }, 50);

            productCard.querySelector(".buy-btn").addEventListener("click", () => buyProduct(product.id));
            productCard.querySelector(".cart-btn").addEventListener("click", () => addToCart(product));
            productCard.querySelector(".wish-btn").addEventListener("click", () => toggleWish(product.id));

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
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

async function loadProducts() {
    const productsGrid = document.getElementById("products-grid");
    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin = user && user.prefix === "admin";

    try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error(`Failed to load products: ${response.status}`);
        allProducts = await response.json();

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
    const existingItem = basket.find(item => item.id === product.id);
    if (existingItem) {
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

    const productCard = document.querySelector(`.product-card[data-id="${product.id}"]`);
    if (productCard) {
        const cartBtn = productCard.querySelector('.cart-btn');
        if (cartBtn) {
            cartBtn.textContent = 'Добавлено';
            cartBtn.classList.add('added');
            cartBtn.disabled = true;
        }
    }

    showNotification('Товар добавлен в корзину!');
    console.log('Basket updated:', basket);
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
        total = 0;
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

            const removeBtn = basketItem.querySelector('.remove-btn');
            removeBtn.addEventListener('click', () => {
                basket.splice(index, 1);
                renderBasket();

                const productCard = document.querySelector(`.product-card[data-id="${item.id}"]`);
                if (productCard) {
                    const cartBtn = productCard.querySelector('.cart-btn');
                    if (cartBtn) {
                        cartBtn.textContent = 'В корзину';
                        cartBtn.classList.remove('added');
                        cartBtn.disabled = false;
                    }
                }
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
        // Получаем продукт
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error(`Не удалось загрузить продукт: ${response.status}`);
        const product = await response.json();

        // Проверяем, есть ли пользователь в списке wishedBy
        let wishedBy = product.wishedBy || [];
        const userIndex = wishedBy.indexOf(user.username);

        if (userIndex === -1) {
            wishedBy.push(user.username);
            showNotification("Товар добавлен в желаемые!");
        } else {
            wishedBy.splice(userIndex, 1);
            showNotification("Товар удалён из желаемых!");
        }

        // Обновляем продукт на сервере
        const updateResponse = await fetch(`/api/products/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...product, wishedBy })
        });

        if (!updateResponse.ok) throw new Error(`Не удалось обновить желаемые: ${updateResponse.status}`);

        // Обновляем локальный список продуктов
        const productIndex = allProducts.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            allProducts[productIndex].wishedBy = wishedBy;
        }

        // Перерисовываем продукты
        const searchInput = document.getElementById('search-input');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        filterProducts(searchTerm, showWishedOnly);
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
    const productModal = document.getElementById("product-modal");
    const modalTitle = document.getElementById("modal-title");
    const productForm = document.getElementById("product-form");

    modalTitle.textContent = "Редактировать товар";
    document.getElementById("product-title").value = product.title;
    document.getElementById("product-description").value = product.description;
    document.getElementById("product-price").value = product.price;
    document.getElementById("product-stock").value = product.stock;
    productForm.dataset.editId = product.id;

    productModal.style.display = "flex";
}

async function register(event) {
    event.preventDefault();

    const email = document.getElementById("register-email").value;
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm").value;
    const registerBox = document.querySelector(".register-box");

    if (password !== confirmPassword) {
        alert("Пароли не совпадают!");
        return;
    }

    try {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
        const users = await response.json();

        if (users.find(user => user.username === username)) {
            alert("Такой ник уже занят!");
            return;
        }

        const newUser = { email, username, password, avatar: "", description: "Нет описания" };
        const postResponse = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser)
        });

        if (!postResponse.ok) {
            const errorText = await postResponse.text();
            throw new Error(`Failed to register: ${errorText}`);
        }

        localStorage.setItem("user", JSON.stringify(newUser));

        if (registerBox) {
            registerBox.classList.remove("fly-in");
            registerBox.classList.add("fly-up");
        }

        setTimeout(() => {
            window.location.href = "home.html";
        }, 700);
    } catch (err) {
        alert("Ошибка регистрации: " + err.message);
    }
}

async function login(event) {
    event.preventDefault();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const loginBox = document.querySelector(".login-box");

    try {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
        const users = await response.json();

        const user = users.find(user => user.username === username && user.password === password);

        if (user) {
            localStorage.setItem("user", JSON.stringify(user));

            if (loginBox) {
                loginBox.classList.remove("fly-in");
                loginBox.classList.add("fly-up");
            }

            setTimeout(() => {
                window.location.href = "home.html";
            }, 700);
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
    if (user.avatar) {
        avatarImg.src = `/avatars/${user.avatar}`;
    } else {
        avatarImg.src = "./ico/user/white/white-user-40px.png";
    }
}

async function uploadAvatar(event) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

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

document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("user"));
    const avatarImg = document.getElementById("account-avatar");
    
    if (user && avatarImg) {
        avatarImg.src = user.avatar ? `/avatars/${user.avatar}` : "./ico/user/white/white-user-40px.png";
    }
});