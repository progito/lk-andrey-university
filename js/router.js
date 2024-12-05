document.addEventListener("DOMContentLoaded", () => {
    const dynamicContent = document.getElementById("dynamic-content");
    const username = localStorage.getItem('username');

    // Проверка имени пользователя
    if (!username) {
        window.location.href = "../index.html"; // Перенаправление, если пользователь не авторизован
        return;
    }

    // Рендер контента по маршруту
    const routes = {
        "#/home": renderHome,
        "#/course": renderCourses,
        "#/404": renderNotFound,
    };

    // Функция загрузки маршрута
    function loadRoute() {
        const path = window.location.hash; // Используем hash-часть URL
        const render = routes[path] || renderNotFound; // Если нет маршрута, показываем страницу 404
        render();
    }

    // Отображение главной страницы
    function renderHome() {
        dynamicContent.innerHTML = `
            <div class="text-center">
                <h1 class="mb-4 display-4">Добро пожаловать в <span class="text-primary">Andrey University</span>!</h1>
                <p class="lead text-muted">
                    Мы предлагаем лучшие курсы по IT-технологиям, чтобы вы смогли достичь своей мечты и стать высококлассным профессионалом. 
                    От практических курсов до реальных проектов — мы всегда с вами на пути к успеху!
                </p>
                <a href="#/course" class="btn btn-primary btn-lg">
                    Начать обучение <i class="fas fa-arrow-right ms-2"></i>
                </a>
            </div>
        `;
    }

    // Отображение списка курсов
    function renderCourses() {
        const username = localStorage.getItem('username');

        if (username) {
            fetch('https://progito.github.io/resource/data/purchase.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка загрузки данных');
                    }
                    return response.json();
                })
                .then(data => {
                    const userCourses = data[username];

                    if (!userCourses || userCourses.length === 0) {
                        dynamicContent.innerHTML = `
                            <h3>У вас пока нет курсов.</h3>
                            <a href="#/home" class="btn btn-secondary">Перейти на главную</a>
                        `;
                    } else {
                        const coursesHTML = userCourses.map(course => `
                            <div class="card mb-4 shadow-lg border-light course-card">
                                <div class="card-body">
                                    <h5 class="card-title">${course.course}</h5>
                                    <div class="progress mb-3" style="height: 30px;">
                                        <div class="progress-bar position-relative bg-success" role="progressbar" style="width: ${course.progress}%" aria-valuenow="${course.progress}" aria-valuemin="0" aria-valuemax="100">
                                            <span class="position-absolute top-50 start-50 translate-middle text-white fw-bold">${course.progress}%</span>
                                        </div>
                                    </div>
                                    <p class="card-text">${course.description || "Описание отсутствует"}</p>
                                </div>
                            </div>
                        `).join("");
                        dynamicContent.innerHTML = `
                            <h2>Ваши курсы</h2>
                            ${coursesHTML}
                        `;
                    }
                })
                .catch(error => {
                    console.error('Ошибка при загрузке данных:', error);
                    dynamicContent.innerHTML = `<p>Ошибка загрузки курсов. Попробуйте позже.</p>`;
                });
        } else {
            console.log('Имя пользователя не найдено в localStorage');
            window.location.href = "../index.html"; // Перенаправление, если имя пользователя отсутствует
        }
    }

    // Отображение страницы 404
    function renderNotFound() {
        dynamicContent.innerHTML = `
            <div class="text-center">
                <h1 class="display-4 text-danger">404</h1>
                <p class="lead">Страница не найдена.</p>
                <a href="#/home" class="btn btn-primary">Вернуться на главную</a>
            </div>
        `;
    }

    // Слушаем изменения пути (hash)
    window.addEventListener("hashchange", loadRoute);

    // Инициализация при загрузке страницы
    loadRoute(); // Это гарантирует, что нужная страница будет отрендерена сразу при первой загрузке.

    // Обработчик кликов по ссылкам
    document.querySelectorAll('.d-block').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const path = link.getAttribute('href');
            window.location.hash = path; // Обновляем хэш
            window.location.reload()
        });
    });
});
