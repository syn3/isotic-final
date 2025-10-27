// ====== Isotic Website Script (Clean & Safe) ======

// ====== Конфигурация ======
// Telegram-токен теперь хранится на сервере. JS только вызывает API-шлюз.
const TELEGRAM_API_URL = '/send-telegram'; // Ваш серверный endpoint для отправки сообщений

// ====== Вспомогательные функции ======
function createModalForm(id, title) {
    return `
        <h3>${title}</h3>
        <form id="form-${id}">
            <input type="text" name="Имя" placeholder="Ваше имя" required>
            <input type="tel" name="Телефон" placeholder="Номер телефона" required>
            <textarea name="Комментарий" placeholder="Комментарий"></textarea>
            <button type="submit" class="btn btn-primary">Отправить</button>
        </form>
    `;
}

async function sendToTelegram(formData) {
    try {
        const response = await fetch(TELEGRAM_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Ошибка при отправке');

        console.log('✅ Сообщение успешно отправлено');
        return true;
    } catch (err) {
        console.error('Ошибка отправки в Telegram:', err);
        return false;
    }
}

// ====== DOMContentLoaded ======
document.addEventListener('DOMContentLoaded', () => {
    // --- Навигация ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !expanded);
            navMenu.classList.toggle('active');
        });
    }

    // --- Прайс-лист ---
    const showPriceBtn = document.getElementById('showPriceBtn');
    const priceWrapper = document.getElementById('priceWrapper');
    const priceTable = priceWrapper?.querySelector('.price-list-expanded');
    if (showPriceBtn && priceWrapper && priceTable) {
        showPriceBtn.addEventListener('click', () => {
            const isExpanded = priceWrapper.classList.toggle('expanded');
            priceTable.classList.toggle('expanded');
            showPriceBtn.classList.toggle('active');
            showPriceBtn.innerHTML = isExpanded
                ? '<i class="fas fa-times"></i> Скрыть прайс-лист'
                : '<i class="fas fa-list"></i> Показать весь прайс-лист';
            
            if (isExpanded) priceWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // --- Обработка форм ---
    document.addEventListener('submit', async (e) => {
        const form = e.target.closest('form');
        if (!form) return;
        e.preventDefault();

        const formData = {};
        new FormData(form).forEach((value, key) => (formData[key] = value.trim()));

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const success = await sendToTelegram(formData);

        if (success) {
            alert('✅ Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
            form.reset();
        } else {
            alert('⚠️ Не удалось отправить заявку. Проверьте интернет или настройки бота.');
        }

        if (submitBtn) submitBtn.disabled = false;
    });
});

// ====== Модальные окна ======
function openModal(modalId) {
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = modalId;
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeModal('${modalId}')"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="closeModal('${modalId}')">
                    <i class="fas fa-times"></i>
                </button>
                ${modalId === 'diagnostic' ? createModalForm(modalId, 'Бесплатная диагностика') : createModalForm(modalId, 'Обратный звонок')}
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 50);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}
