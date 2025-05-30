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
        }, 800);
    }

    if (basketBtn) {
        setTimeout(() => {
            basketBtn.classList.add('visible');
        }, 1000);
    }

    if (addProductBtn) {
        setTimeout(() => {
            addProductBtn.classList.add('visible');
        }, 1200);
    }

    if (wishedProductsBtn) {
        setTimeout(() => {
            wishedProductsBtn.classList.add('visible');
        }, 1400);
    }

    // Убрали applyProductVisibility, так как анимация теперь управляется в script.js
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
                product.style.transform = window.innerWidth <= 768 ? 'translateX(-100%)' : 'opacity(0)';
            }, (products.length - 1 - index) * 100);
        });
    }

    setTimeout(() => {
        if (wishedProductsBtn) {
            wishedProductsBtn.style.transform = 'translateX(-100px)';
            wishedProductsBtn.style.opacity = '0';
        }
    }, products.length * 100);

    setTimeout(() => {
        if (addProductBtn) {
            addProductBtn.style.transform = 'translateX(-100px)';
            addProductBtn.style.opacity = '0';
        }
    }, products.length * 100 + 100);

    setTimeout(() => {
        if (basketBtn) {
            basketBtn.style.transform = 'translateX(-100px)';
            basketBtn.style.opacity = '0';
        }
    }, products.length * 100 + 200);

    setTimeout(() => {
        if (accountBtn) {
            accountBtn.style.transform = 'translateX(-100px)';
            accountBtn.style.opacity = '0';
        }
    }, products.length * 100 + 300);

    setTimeout(() => {
        if (tab) {
            tab.classList.add('hidden');
        }
    }, products.length * 100 + 400);
});