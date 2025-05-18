let lastScrollY = 0;

function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function applyProductVisibility() {
    const products = document.querySelectorAll('.product-card');
    if (!products) return;

    const windowHeight = window.innerHeight;
    const isMobile = window.innerWidth <= 768;

    products.forEach((product, index) => {
        const rect = product.getBoundingClientRect();
        const isVisible = rect.top <= windowHeight * 0.8 && rect.bottom >= 0;

        if (isVisible && !product.classList.contains('visible')) {
            setTimeout(() => {
                product.classList.add('visible');
            }, isMobile ? index * 150 : index * 75);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const scrollTopBtn = document.querySelector('.scroll-top-btn');
    const tab = document.querySelector('.tab');
    const productsGrid = document.querySelector('#products-grid');
    const accountBtn = document.querySelector('.account-btn');
    const basketBtn = document.querySelector('.basket-btn');
    const addProductBtn = document.querySelector('.add-product-btn');
    const wishedProductsBtn = document.querySelector('.wished-products-btn');

    console.log('Scroll Top Button:', scrollTopBtn);
    console.log('Tab:', tab);
    console.log('Products Grid:', productsGrid);
    console.log('Account Button:', accountBtn);
    console.log('Basket Button:', basketBtn);
    console.log('Add Product Button:', addProductBtn);
    console.log('Wished Products Button:', wishedProductsBtn);

    if (scrollTopBtn) {
        scrollTopBtn.classList.add('hidden');
    }

    if (tab) {
        setTimeout(() => {
            tab.classList.add('visible');
        }, 300);
    }

    if (accountBtn) {
        setTimeout(() => {
            accountBtn.classList.add('visible');
            accountBtn.classList.add('pulse');
        }, 800);
    }

    if (basketBtn) {
        setTimeout(() => {
            basketBtn.classList.add('visible');
            basketBtn.classList.add('pulse');
        }, 1000);
    }

    if (addProductBtn) {
        setTimeout(() => {
            addProductBtn.classList.add('visible');
            addProductBtn.classList.add('pulse');
        }, 1200);
    }

    if (wishedProductsBtn) {
        setTimeout(() => {
            wishedProductsBtn.classList.add('visible');
        }, 1400);
    }

    applyProductVisibility();
});

document.addEventListener('scroll', throttle(() => {
    const scrollTopBtn = document.querySelector('.scroll-top-btn');
    const tab = document.querySelector('.tab');
    const currentScrollY = window.scrollY;

    if (scrollTopBtn) {
        if (currentScrollY > 100) {
            scrollTopBtn.classList.remove('hidden');
        } else {
            scrollTopBtn.classList.add('hidden');
        }
    }

    if (tab) {
        if (currentScrollY > 200) {
            if (currentScrollY > lastScrollY) {
                tab.classList.add('hidden');
            } else {
                tab.classList.remove('hidden');
            }
        } else {
            tab.classList.remove('hidden');
        }
    }

    applyProductVisibility();

    lastScrollY = currentScrollY;
}, 100));

window.addEventListener('beforeunload', () => {
    const tab = document.querySelector('.tab');
    const products = document.querySelectorAll('.product-card');
    const accountBtn = document.querySelector('.account-btn');
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
});


// вход и выход страниц
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const registerBtn = document.querySelector('.register-btn');
    const regLink = document.querySelector('.reg a');
    const signUpBtn = document.querySelector('.sign-up');
    const fpBtn = document.querySelector('.fp'); // Находим кнопку с классом fp

    // Тестовая анимация ухода при клике на кнопку регистрации
    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Предотвращаем отправку формы
            container.classList.remove('fly-in');
            container.classList.add('fly-out');
        });
    }

    // // Анимация ухода при клике на кнопку входа
    // if (signUpBtn) {
    //     signUpBtn.addEventListener('click', (e) => {
    //         e.preventDefault(); // Предотвращаем отправку формы
    //         container.classList.remove('fly-in');
    //         container.classList.add('fly-out');
            
    //     });
    // }

    // Анимация ухода при клике на ссылку "sign-up"
    regLink.addEventListener('click', (e) => {
        e.preventDefault(); // Предотвращаем переход
        container.classList.remove('fly-in');
        container.classList.add('fly-out');
        setTimeout(() => {
            window.location.href = 'register.html';
        }, 700);
    });

    // Анимация ухода при клике на кнопку "fp"
    if (fpBtn) {
        fpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            container.classList.remove('fly-in');
            container.classList.add('fly-out');
            setTimeout(() => {
                window.location.href = 'password-recovery.html';
            }, 700);
        });
    }

    // Обработчик отправки формы восстановления пароля
    const recoveryForm = document.querySelector('#recovery-form');
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            container.classList.remove('fly-in');
            container.classList.add('fly-out');

            setTimeout(() => {
                alert('Инструкция по восстановлению пароля отправлена на ваш Email.');
                window.location.href = 'index.html';
            }, 700);
        });
    }
});
