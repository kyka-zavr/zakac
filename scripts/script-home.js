let lastScrollY = 0;

document.addEventListener('DOMContentLoaded', () => {
    const scrollTopBtn = document.querySelector('.scroll-top-btn');
    const tab = document.querySelector('.tab');
    const productsGrid = document.querySelector('#products-grid');
    const accountBtn = document.querySelector('.account-btn');
    const basketBtn = document.querySelector('.basket-btn');
    const addProductBtn = document.querySelector('.add-product-btn');

    // Проверка на наличие элементов
    console.log('Scroll Top Button:', scrollTopBtn);
    console.log('Tab:', tab);
    console.log('Products Grid:', productsGrid);
    console.log('Account Button:', accountBtn);
    console.log('Basket Button:', basketBtn);
    console.log('Add Product Button:', addProductBtn);

    // Скрываем кнопку "Наверх" изначально
    if (scrollTopBtn) {
        scrollTopBtn.classList.add('hidden');
    }

    // Появление tab
    if (tab) {
        setTimeout(() => {
            tab.classList.add('visible');
        }, 300);
    }

    // Появление кнопок в tab по очереди после tab
    if (accountBtn) {
        setTimeout(() => {
            accountBtn.classList.add('visible');
        }, 800); // 300 (tab) + 500
    }

    if (basketBtn) {
        setTimeout(() => {
            basketBtn.classList.add('visible');
        }, 1000); // 800 + 200
    }

    if (addProductBtn) { // Плюсик появляется только для админа
        setTimeout(() => {
            addProductBtn.classList.add('visible');
        }, 1200); // 1000 + 200
    }

    // Функция для применения видимости товаров
    const applyProductVisibility = () => {
        const products = document.querySelectorAll('.product-card');
        console.log('Products found:', products);

        if (products.length > 0) {
            products.forEach((product, index) => {
                setTimeout(() => {
                    product.classList.add('visible');
                    console.log(`Product ${index + 1} made visible`);
                }, index * 200);
            });
        } else {
            console.warn('No products found on the page!');
        }
    };

    // Отслеживание изменений в products-grid с помощью MutationObserver
    if (productsGrid) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    console.log('New nodes added to products-grid:', mutation.addedNodes);
                    applyProductVisibility();
                }
            });
        });

        observer.observe(productsGrid, {
            childList: true,
            subtree: true
        });

        // Первоначальная проверка
        applyProductVisibility();
    }
});

document.addEventListener('scroll', () => {
    const scrollTopBtn = document.querySelector('.scroll-top-btn');
    const tab = document.querySelector('.tab');
    const currentScrollY = window.scrollY;

    // Управление кнопкой "Наверх"
    if (scrollTopBtn) {
        if (currentScrollY > 100) {
            scrollTopBtn.classList.remove('hidden');
        } else {
            scrollTopBtn.classList.add('hidden');
        }
    }

    // Управление навигационной панелью (tab)
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

    lastScrollY = currentScrollY;
});

// Анимация ухода со страницы
window.addEventListener('beforeunload', (e) => {
    const tab = document.querySelector('.tab');
    const products = document.querySelectorAll('.product-card');
    const accountBtn = document.querySelector('.account-btn');
    const basketBtn = document.querySelector('.basket-btn');
    const addProductBtn = document.querySelector('.add-product-btn');

    // Отменяем стандартное поведение, чтобы анимация успела проиграться
    e.preventDefault();
    e.returnValue = '';

    // Исчезновение товаров лесенкой (в обратном порядке)
    if (products.length > 0) {
        products.forEach((product, index) => {
            setTimeout(() => {
                product.style.opacity = '0';
                product.style.transform = window.innerWidth <= 768 ? 'translateX(-100%)' : 'opacity(0)';
            }, (products.length - 1 - index) * 200);
        });
    }

    // Исчезновение кнопок в tab
    setTimeout(() => {
        if (addProductBtn) {
            addProductBtn.style.transform = 'translateX(-100px)';
            addProductBtn.style.opacity = '0';
        }
    }, products.length * 200);

    setTimeout(() => {
        if (basketBtn) {
            basketBtn.style.transform = 'translateX(-100px)';
            basketBtn.style.opacity = '0';
        }
    }, products.length * 200 + 200);

    setTimeout(() => {
        if (accountBtn) {
            accountBtn.style.transform = 'translateX(-100px)';
            accountBtn.style.opacity = '0';
        }
    }, products.length * 200 + 400);

    // Исчезновение tab
    setTimeout(() => {
        if (tab) {
            tab.classList.add('hidden');
        }
    }, products.length * 200 + 600);

    // Задержка, чтобы анимации успели проиграться
    setTimeout(() => {
        window.removeEventListener('beforeunload', this);
    }, products.length * 200 + 1100);
});