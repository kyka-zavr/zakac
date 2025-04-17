let lastScrollY = 0; // Для отслеживания направления прокрутки

document.addEventListener('scroll', () => {
    const scrollTopBtn = document.querySelector('.scroll-top-btn');
    const tab = document.querySelector('.tab');
    const currentScrollY = window.scrollY;

    // Управление кнопкой "Наверх"
    if (currentScrollY > 100) {
        scrollTopBtn.classList.remove('hidden');
    } else {
        scrollTopBtn.classList.add('hidden');
    }

    // Управление навигационной панелью (tab)
    if (currentScrollY > 200) { // Порог для скрытия tab
        if (currentScrollY > lastScrollY) { // Прокрутка вниз
            tab.classList.add('hidden');
        } else { // Прокрутка вверх
            tab.classList.remove('hidden');
        }
    } else { // Если прокрутка меньше 200 пикселей, всегда показываем tab
        tab.classList.remove('hidden');
    }

    lastScrollY = currentScrollY; // Обновляем последнее положение прокрутки
});

// Изначально скрываем кнопку "Наверх" при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const scrollTopBtn = document.querySelector('.scroll-top-btn');
    scrollTopBtn.classList.add('hidden');
});