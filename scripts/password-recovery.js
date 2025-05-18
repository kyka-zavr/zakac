document.addEventListener('DOMContentLoaded', () => {
    const recoveryForm = document.querySelector('#recovery-form');
    const recoveryEmail = document.querySelector('#recovery-email');
    const errorBox = document.querySelector('.error');
    const recovery1Box = document.querySelector('.recovery1-box');
    const recovery2Box = document.querySelector('.recovery2-box');

    // Инициализация EmailJS
    emailjs.init('BosMMvVTlCTuxIHql');

    // Функция для отображения ошибки
    function showError(message) {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
        setTimeout(() => {
            errorBox.style.display = 'none';
        }, 20000);
    }

    // Функция для отправки письма через EmailJS
    async function sendEmail(to, username, password) {
        try {
            await emailjs.send('service_y9vvc8m', 'template_7xxggci', {
                to_email: to,
                to_name: username,
                password: password
            });
            console.log('Письмо успешно отправлено!');
        } catch (error) {
            console.error('Ошибка при отправке письма:', error);
            showError('Ошибка при отправке письма');
        }
    }

    // Обработка отправки формы
    recoveryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const input = recoveryEmail.value.trim();

        try {
            const response = await fetch('./db.json');
            const data = await response.json();

            const user = data.users.find(user => 
                user.email === input || user.username === input
            );

            if (user) {
                await sendEmail(user.email, user.username, user.password);
                recovery1Box.style.display = 'none';
                recovery2Box.style.display = 'block';
            } else {
                showError('Пользователь с таким Email или именем не найден.');
            }
        } catch (error) {
            console.error('Ошибка при чтении базы данных:', error);
            showError('Ошибка сервера. Попробуйте позже.');
        }
    });
});
