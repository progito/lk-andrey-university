document.getElementById('toggleSidebar').addEventListener('click', function () {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
});

document.getElementById('messagesLink').addEventListener('click', function(event) {
    event.preventDefault();  // Останавливаем переход по умолчанию
    window.location.href = "https://api.whatsapp.com/qr/4NRBWPWDCWULH1?autoload=1&app_absent=0";  // Переход на WhatsApp
});


function generateCertificate(encodedTitle, imagePath, username) {
    const canvas = document.getElementById(`canvas_${encodedTitle}`);
    if (!canvas) {
        console.error(`Canvas с ID canvas_${encodedTitle} не найден`);
        return;
    }

    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = imagePath;

    img.onload = () => {
        // Рисуем фон сертификата
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Настраиваем текст
        ctx.font = "30px Arial";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";

        // Рисуем имя выпускника
        ctx.fillText(username, canvas.width / 2, canvas.height - 250);

        // Скачивание сертификата
        const link = document.createElement("a");
        link.download = `certificate_${decodeURIComponent(encodedTitle)}_${username}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    img.onerror = () => {
        console.error(`Ошибка загрузки изображения: ${imagePath}`);
        alert("Не удалось загрузить изображение для сертификата.");
    };
}


document.addEventListener("DOMContentLoaded", function () {
    const purchasesLink = document.querySelector('.fa-shopping-cart').parentElement;

    purchasesLink.addEventListener("click", function (event) {
        event.preventDefault(); // Предотвращаем переход по ссылке
        loadPurchases();
    });

    function loadPurchases() {
        const contentContainer = document.getElementById("dynamic-content");
        contentContainer.innerHTML = "<h2 class='mb-4'>Покупки</h2><p>Загружаем данные...</p>";

        fetch('https://progito.github.io/resource/data/purchase.json')
            .then(response => {
                if (!response.ok) throw new Error("Ошибка загрузки данных");
                return response.json();
            })
            .then(data => {
                const username = localStorage.getItem('username');
                if (username && data[username]) {
                    renderPurchasesTable(data[username]);
                } else {
                    contentContainer.innerHTML = "<p class='text-danger'>У вас нет покупок или пользователь не найден.</p>";
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

        let tableHTML = `
            <table class="table table-striped table-bordered table-hover">
                <thead class="table-light">
                    <tr>
                        <th>Название курса</th>
                        <th>Описание курса</th>
                        <th>Цена курса</th>
                        <th class="text-center">Статус операции</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach((purchase) => {
            tableHTML += `
                <tr>
                    <td>${purchase.course}</td>
                    <td>${purchase.description}</td>
                    <td>${purchase.price}</td>
                    <td class="text-center">
                        <span class="badge bg-success" style="font-size: 1rem;">Оплачен</span>
                    </td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        contentContainer.innerHTML = tableHTML;
    }
});
