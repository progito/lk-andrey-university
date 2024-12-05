document.getElementById('toggleSidebar').addEventListener('click', function () {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
});

document.getElementById('messagesLink').addEventListener('click', function(event) {
    event.preventDefault();  // Останавливаем переход по умолчанию
    window.location.href = "https://api.whatsapp.com/qr/4NRBWPWDCWULH1?autoload=1&app_absent=0";  // Переход на WhatsApp
});


document.addEventListener("DOMContentLoaded", function () {
    // Обработчик клика на "Покупки"
    const purchasesLink = document.querySelector('.fa-shopping-cart').parentElement;

    purchasesLink.addEventListener("click", function (event) {
        event.preventDefault(); // Предотвращаем переход по ссылке
        loadPurchases();
    });

    function loadPurchases() {
        // Очищаем контейнер
        const contentContainer = document.getElementById("dynamic-content");
        contentContainer.innerHTML = "<h2 class='mb-4'>Покупки</h2><p>Загружаем данные...</p>";

        // Загружаем данные из JSON
        fetch('https://progito.github.io/resource/data/purchase.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error("Ошибка загрузки данных");
                }
                return response.json();
            })
            .then(data => {
                // Фильтруем покупки для текущего пользователя
                const username = localStorage.getItem('username');
                if (username) {
                    const filteredData = data.filter(purchase => purchase.username === username);
                    renderPurchasesTable(filteredData);
                } else {
                    contentContainer.innerHTML = "<p class='text-danger'>Не удалось найти имя пользователя в localStorage.</p>";
                }
            })
            .catch(error => {
                contentContainer.innerHTML = `<p class="text-danger">Ошибка загрузки данных: ${error.message}</p>`;
            });
    }

    function renderPurchasesTable(data) {
        const contentContainer = document.getElementById("dynamic-content");

        if (data.length === 0) {
            contentContainer.innerHTML = "<p>У вас нет покупок.</p>";
            return;
        }

        // Создаем таблицу
        let tableHTML = `
            <table class="table table-bordered table-hover">
                <thead class="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Пользователь</th>
                        <th>Название курса</th>
                        <th>Дата покупки</th>
                        <th>Статус</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Заполняем таблицу данными
        data.forEach(purchase => {
            tableHTML += `
                <tr>
                    <td>${purchase.id}</td>
                    <td>${purchase.username}</td>
                    <td>${purchase.course}</td>
                    <td>${purchase.date}</td>
                    <td>${purchase.status}</td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;

        // Заменяем содержимое контейнера
        contentContainer.innerHTML = tableHTML;
    }
});
