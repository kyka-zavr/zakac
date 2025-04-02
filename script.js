document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const logoutBtn = document.getElementById("logout-btn");
    const avatarInput = document.getElementById("avatar-upload");

    if (registerForm) registerForm.addEventListener("submit", register);
    if (loginForm) loginForm.addEventListener("submit", login);
    if (logoutBtn) logoutBtn.addEventListener("click", logout);
    if (avatarInput) avatarInput.addEventListener("change", uploadAvatar);

    if (document.getElementById("account-username")) loadAccount();
    checkSession();
});

// Функция регистрации
function register(event) {
    event.preventDefault();

    const email = document.getElementById("register-email").value;
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm").value;

    if (password !== confirmPassword) {
        alert("Пароли не совпадают!");
        return;
    }

    fetch("/api/users")
        .then(response => response.json())
        .then(users => {
            if (users.find(user => user.username === username)) {
                alert("Такой ник уже занят!");
                return;
            }

            const newUser = { email, username, password, avatar: "" };
            fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser)
            })
            .then(response => response.text())
            .then(() => {
                localStorage.setItem("user", JSON.stringify(newUser));
                window.location.href = "home.html";
            })
            .catch(err => alert("Ошибка: " + err.message));
        });
}

// Функция входа
function login(event) {
    event.preventDefault();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    fetch("/api/users")
        .then(response => response.json())
        .then(users => {
            const user = users.find(user => user.username === username && user.password === password);

            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
                window.location.href = "home.html";
            } else {
                alert("Неправильный ник или пароль!");
            }
        });
}

// Функция выхода
function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

// Проверка сессии
function checkSession() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && !["/home.html", "/account.html"].includes(window.location.pathname)) {
        window.location.href = "home.html";
    }
}

// Загрузка данных аккаунта
function loadAccount() {
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
        avatarImg.src = "ico/user/white/white-user-32px.png";
    }
}

// Загрузка аватарки
function uploadAvatar(event) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    fetch(`/api/upload-avatar?username=${encodeURIComponent(user.username)}`, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            user.avatar = data.filename;
            localStorage.setItem("user", JSON.stringify(user));
            document.getElementById("account-avatar").src = `/avatars/${data.filename}`;

            // Перезагрузка страницы
            location.reload();
        } else {
            alert("Ошибка загрузки аватарки!");
        }
    });
}

// Обработчик для загрузки аватара через кликабельное изображение
window.addEventListener('DOMContentLoaded', (event) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.avatar) {
        document.getElementById("account-avatar").src = `/avatars/${user.avatar}`;
    }

    // Сделаем картинку кликабельной для загрузки аватара
    const avatarUploadImg = document.getElementById("avatar-upload-img");
    const avatarUploadInput = document.getElementById("avatar-upload");

    avatarUploadImg.addEventListener('click', () => {
        avatarUploadInput.click();  // Активируем клик по скрытому input
    });

    avatarUploadInput.addEventListener('change', (event) => {
        uploadAvatar(event);
    });
});


document.addEventListener("DOMContentLoaded", () => {
    // Скрипт для аватара
    const avatar = document.getElementById("account-avatar");
    const uploadImg = document.getElementById("avatar-upload-img");

    if (avatar && uploadImg) {
        avatar.addEventListener("mouseenter", () => {
            uploadImg.style.display = "block";  // Показываем кнопку
        });

        avatar.addEventListener("mouseleave", () => {
            if (!uploadImg.matches(':hover')) {  
                uploadImg.style.display = "none";  // Скрываем кнопку
            }
        });

        uploadImg.addEventListener("mouseenter", () => {
            uploadImg.style.display = "block";  // Оставляем кнопку видимой
        });

        uploadImg.addEventListener("mouseleave", () => {
            if (!avatar.matches(':hover')) {  
                uploadImg.style.display = "none";  // Скрываем кнопку
            }
        });
    }

    // Скрипт для переключения пароля
    const togglePassword = document.getElementById('toggle-password');
    const passwordField = document.getElementById('login-password');
    const eyeIcon = document.getElementById('eye-icon');

    if (togglePassword && passwordField && eyeIcon) {
        togglePassword.addEventListener('click', () => {
            console.log("Toggle password clicked"); // Для отладки
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                eyeIcon.src = './ico/eye/cat-white/cat-open-eye-32px.png';  // Изображение с открытым глазом
                eyeIcon.alt = 'Hide password';
            } else {
                passwordField.type = 'password';
                eyeIcon.src = './ico/eye/cat-white/cat-closed-eye-32px.png';  // Изображение с закрытым глазом
                eyeIcon.alt = 'Show password';
            }
        });
    } else {
        console.error("One or more elements for password toggle are missing.");
    }
});


document.addEventListener("DOMContentLoaded", function () {
    loadAccountDescription();

    document.getElementById("edit-description").addEventListener("click", function () {
        document.getElementById("description-input").style.display = "block";
        document.getElementById("save-description").style.display = "block";
        document.getElementById("description-input").value = document.getElementById("account-description").textContent;
    });

    document.getElementById("save-description").addEventListener("click", function () {
        const newDescription = document.getElementById("description-input").value;
        saveAccountDescription(newDescription);
    });
});

function loadAccountDescription() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    fetch(`/api/users`)
        .then(response => response.json())
        .then(users => {
            const foundUser = users.find(u => u.username === user.username);
            if (foundUser && foundUser.description) {
                document.getElementById("account-description").textContent = foundUser.description;
            }
        });
}

function saveAccountDescription(description) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    fetch("/api/update-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, description })
    }).then(response => response.text())
      .then(() => {
          document.getElementById("account-description").textContent = description;
          document.getElementById("description-input").style.display = "none";
          document.getElementById("save-description").style.display = "none";
      });
}

document.addEventListener("DOMContentLoaded", function () {
    let originalDescription = ""; // Для хранения старого описания

    document.getElementById("edit-description").addEventListener("click", function () {
        const descriptionText = document.getElementById("account-description").textContent;
        originalDescription = descriptionText; // Запоминаем старое описание
        document.getElementById("description-input").value = descriptionText;

        document.getElementById("description-input").style.display = "block";
        document.querySelector(".description-buttons").style.display = "block";
    });

    document.getElementById("save-description").addEventListener("click", function () {
        const newDescription = document.getElementById("description-input").value;
        saveAccountDescription(newDescription);
    });

    document.getElementById("cancel-description").addEventListener("click", function () {
        document.getElementById("description-input").style.display = "none";
        document.querySelector(".description-buttons").style.display = "none";
        document.getElementById("description-input").value = originalDescription; // Возвращаем старое описание
    });
});

document.getElementById("save-description").addEventListener("click", function () {
    const newDescription = document.getElementById("description-input").value;
    saveAccountDescription(newDescription);

    // Скрываем поле и кнопки после сохранения
    document.getElementById("description-input").style.display = "none";
    document.querySelector(".description-buttons").style.display = "none";
});