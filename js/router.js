document.addEventListener("DOMContentLoaded", () => {
    const dynamicContent = document.getElementById("dynamic-content");
    const username = localStorage.getItem("username");
    const elemUsername = document.getElementById("username");

    elemUsername.textContent = username;
    if (!username) {
        window.location.href = "../index.html";
        return;
    }

    const courseProgress = JSON.parse(localStorage.getItem("courseProgress")) || {};

    // Функция для расчёта прогресса
    function calculateProgress(completed, total) {
        return Math.min(100, Math.round((completed / total) * 100)); // Ограничение до 100%
    }

    // Выгрузка данных localStorage
    function downloadLocalStorage() {
        const dataStr = JSON.stringify(localStorage, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "localStorage.txt";
        a.click();
        URL.revokeObjectURL(url);
    }

    // Импорт данных в localStorage
    function importLocalStorage(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const importedData = JSON.parse(e.target.result);
                Object.keys(importedData).forEach(key => {
                    localStorage.setItem(key, importedData[key]);
                });
                alert("Данные успешно импортированы! Перезагрузите страницу для применения изменений.");
            } catch (err) {
                console.error("Ошибка импорта данных:", err);
                alert("Не удалось импортировать данные. Проверьте формат файла.");
            }
        };
        reader.readAsText(file);
    }

    // Функция обновления статуса урока
    function updateLessonStatus(course, section, lesson, status) {
        if (!courseProgress[course]) courseProgress[course] = {};
        if (!courseProgress[course][section]) courseProgress[course][section] = {};

        courseProgress[course][section][lesson] = status;
        localStorage.setItem("courseProgress", JSON.stringify(courseProgress));
    }

    // Обработчик выхода из аккаунта
    document.getElementById('logout').addEventListener('click', function () {
        localStorage.removeItem('username');
        window.location.href = "../index.html";
    });

    // Обработчик маршрутов
    const routes = {
        "#/home": renderHome,
        "#/settings": renderSettings,
        "#/certificates": renderCertificate,
        "#/courses": renderCourses,
        "#/course": renderCourseDetails,
        "#/section": renderSectionDetails,
        "#/lesson": renderLessonDetails,
        "#/404": renderNotFound,
    };

    function loadRoute() {
        const [path, queryString] = window.location.hash.split("?");
        const render = routes[path] || renderNotFound;
        render(queryString);
    }

    async function renderHome() {
        // Получение информации о местоположении
        let userCountry = "Неизвестно";
        try {
            const response = await fetch("https://ipapi.co/json/");
            const data = await response.json();
            userCountry = data.country_name || "Неизвестно";
        } catch (error) {
            console.error("Не удалось получить данные о местоположении:", error);
        }
    
        // Обновление времени
        function updateTime() {
            const now = new Date();
            const time = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            document.getElementById("current-time").textContent = time;
        }
    
        const now = new Date();
        const date = now.toLocaleDateString("ru-RU", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    
        const courseData = JSON.parse(localStorage.getItem("courseProgress")) || {};
        const courses = Object.keys(courseData);
        const coursesHTML = courses.length > 0
            ? courses.map((course, index) => `
                <div class="card mb-3 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${course}</h5>
                        <a href="#/course?name=${encodeURIComponent(course)}" class="btn btn-outline-primary">Перейти</a>
                    </div>
                </div>
            `).join("")
            : `<p class="text-muted">Курсы пока не добавлены. Начните обучение, чтобы видеть ваш прогресс.</p>`;
    
        dynamicContent.innerHTML = `
            <div class="container mt-4">
                <!-- Панель с информацией -->
                <div class="row justify-content-center mb-4">
                    <div class="col-md-8">
                        <div class="alert alert-light border shadow-sm p-4 d-flex justify-content-between align-items-center" style="background-color: #ffe5e5;">
                            <div>
                                <h5 class="mb-0">Текущая дата: <span class="fw-bold">${date}</span></h5>
                                <p class="mb-0 text-muted">Время: <span id="current-time" class="fw-bold">...</span></p>
                            </div>
                            <div>
                                <p class="mb-0">Страна: <span class="fw-bold">${userCountry}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Приветствие -->
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <div class="text-center">
                            <h1 class="mb-4">Добро пожаловать, ${username}!</h1>
                            <p class="fs-5">Изучайте курсы и достигайте новых высот.</p>
                            <a href="https://telegra.ph/Pered-prohozhdeniem-kursa-12-06" class="text-decoration-underline">Важно прочитать (перед прохождением курсов)!</a>
                            <br><br>
                            <a href="#/courses" class="btn btn-primary btn-lg">Мои курсы</a>
                        </div>
                        <hr class="my-4">
                        
                        <!-- Список курсов -->
                        <h3 class="text-center">Ваши курсы</h3>
                        ${coursesHTML}
                    </div>
                </div>
            </div>
        `;
    
        // Запуск обновления времени каждую секунду
        updateTime(); // Первый вызов для немедленного отображения времени
        setInterval(updateTime, 1000); // Обновление каждую секунду
    }
    
    
    

    function renderSettings() {
        dynamicContent.innerHTML = `
            <div class="text-center">
                <h1>Настройки</h1>
                <p>Ваш username: ${username}</p>
                <p><strong>Выгрузка прогресса курсов (для других устройств/браузеров)</strong></p>
                <div class="mt-4">
                    <button id="download-btn" class="btn btn-outline-secondary">Выгрузить localStorage</button>
                    <label class="btn btn-outline-secondary">
                        Импортировать localStorage
                        <input type="file" id="import-file" class="d-none" accept=".txt,.json">
                    </label>
                </div>
            </div>
        `;

        // Подключаем обработчики для кнопок
        document.getElementById("download-btn").addEventListener("click", downloadLocalStorage);
        document.getElementById("import-file").addEventListener("change", importLocalStorage);
    }

    const key = 'isdfii823r7247fy437fterftgersdf23728'; 
    

    const courseImages = {
        "Основы Git": {
            image: "https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png",
            bg: "#F5F5F5" // Светлый фон
        },
        "Основы HTML": {
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/HTML5_logo_and_wordmark.svg/800px-HTML5_logo_and_wordmark.svg.png",
            bg: "#FFEBCC" // Нежный оранжевый фон
        },
        "Junior Python Developer": {
            image: "https://img.icons8.com/color/512/python.png",
            bg: "#E0F7FA" // Светлый голубой фон
        },
        "Junior Frontend Developer": {
            image: "https://cdni.iconscout.com/illustration/premium/thumb/frontend-developer-illustration-download-in-svg-png-gif-file-formats--website-development-web-programming-backend-programmer-pack-design-illustrations-6109659.png?f=webp",
            bg: "#E8F5E9" // Светлый зелёный фон
        },
        "Основы программирования": {
            image: "https://ouch-cdn2.icons8.com/8Ch0S_gf7Z61bPTRyrjRiKSWp_Fbnv1i6VnNcX8UIRM/rs:fit:456:456/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNjg0/LzI0YWNlM2U2LTll/N2MtNDMyZC05NjJj/LTY0YjQ4MjYyYWEy/Zi5zdmc.png",
            bg: "#FFF9C4" // Светлый жёлтый фон
        },
        "Основы работы с компьютером": {
            image: "https://pngimg.com/d/computer_pc_PNG7720.png",
            bg: "#FCE4EC" // Светлый розовый фон
        },
        "Middle Frontend Developer": {
            image: "https://png.pngtree.com/png-vector/20240805/ourmid/pngtree-freelancer-software-developer-programmer-coder-illustrator-png-image_13076689.png",
            bg: "#FF8F8F" 
        }
    };
    

    function renderCourses() {
        fetch('https://progito.github.io/resource/data/purchase.json')
            .then(response => response.json())
            .then(data => {
                const userCourses = data[username];
                if (!userCourses || userCourses.length === 0) {
                    dynamicContent.innerHTML = `
                        <h3>Курсы не найдены.</h3>
                        <a href="#/home" class="btn btn-secondary">На главную</a>
                    `;
                    return;
                }
    
                const coursesHTML = userCourses.map((course, index) => {
                    const completedLessons = Object.values(courseProgress[course.course] || {})
                        .flatMap(module => Object.values(module))
                        .filter(status => status).length;
                    const totalLessons = 10; // Примерное количество уроков
                    const progress = calculateProgress(completedLessons, totalLessons);
                    const courseInfo = courseImages[course.course] || {};
                    const imageUrl = courseInfo.image || "https://example.com/default-course-image.jpg";
                    const bgColor = courseInfo.bg || "#FFFFFF";
    
                    return `
                        <div class="col-md-6 mb-4">
                            <div id="key${index}" class="card h-100" 
                                onclick="window.location.href='#/course?name=${encodeURIComponent(course.course)}'"
                                style="background-color: ${bgColor}; border-radius: 8px; overflow: hidden;">
                                <div class="card-body d-flex align-items-center">
                                    <div class="flex-grow-1">
                                        <h5>${course.course}</h5>
                                        <p>${course.description || "Описание отсутствует"}</p>
                                        <div class="progress">
                                            <div class="progress-bar bg-info" role="progressbar" style="width: ${progress}%;" 
                                                 aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
                                                 ${progress}%
                                            </div>
                                        </div>
                                    </div>
                                    <div class="ms-3">
                                        <img src="${imageUrl}" alt="${course.course}" class="img-fluid" style="max-width: 100px; border-radius: 8px;">
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join("");
    
                dynamicContent.innerHTML = `
                    <h2>Ваши курсы</h2>
                    <div class="row">${coursesHTML}</div>
                `;
            })
            .catch(err => {
                console.error("Ошибка загрузки курсов:", err);
                dynamicContent.innerHTML = `<p>Ошибка загрузки данных. Проверьте подключение к интернету.</p>`;
            });
    }
    
   

    async function fetchAndDecrypt(encryptedData) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, key);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
            return JSON.parse(decryptedData);
        } catch (err) { throw err;  }
    }
    
    function renderCourseDetails(queryString) {
        const courseName = new URLSearchParams(queryString).get("name");
    
        fetch("https://progito.github.io/resource/data/data.json")
            .then(res => res.text())  
            .then(text => fetchAndDecrypt(text))  
            .then(data => {
                const courseContent = data[courseName]?.[0];
                if (!courseContent) {
                    dynamicContent.innerHTML = `<p>Материалы пока недоступны.</p>`;
                    return;
                }

                const sectionsHTML = Object.keys(courseContent).map((section, index) => {
                    const completedLessons = Object.values(courseProgress[courseName]?.[section] || {}).filter(status => status).length;
                    const totalLessons = courseContent[section]?.length || 0;
                    const progress = calculateProgress(completedLessons, totalLessons);
    
                    return `
                        <div class="card mb-3" onclick="window.location.href='#/section?course=${encodeURIComponent(courseName)}&section=${encodeURIComponent(section)}'" style="${courseName.includes('Middle') ? 'border: 2px solid red;' : ''}">
                            <div class="card-body">
                                <h5>${section}</h5>
                                <div class="progress">
                                    <div class="progress-bar" role="progressbar" style="width: ${progress}%;" 
                                         aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
                                         ${progress}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join("");
                dynamicContent.innerHTML = `<h2>${courseName}</h2>${sectionsHTML}`;
            })
            .catch(err => {
                console.error("Ошибка загрузки контента курса:", err);
                dynamicContent.innerHTML = `<p>Ошибка загрузки данных курса.</p>`;
            });
    }
    

    // Разделы курса
    function renderSectionDetails(queryString) {
        const params = new URLSearchParams(queryString);
        const courseName = params.get("course");
        const sectionName = params.get("section");

        fetch("https://progito.github.io/resource/data/data.json")
            .then(res => res.text())  
            .then(text => fetchAndDecrypt(text))  
            .then(data => {
                const sectionContent = data[courseName]?.[0]?.[sectionName];
                if (!sectionContent) {
                    dynamicContent.innerHTML = `<p>Раздел не найден.</p>`;
                    return;
                }

                const lessonsHTML = sectionContent.map((lesson, index) => {
                    const lessonName = Object.keys(lesson)[0];
                    const isCompleted = courseProgress[courseName]?.[sectionName]?.[lessonName] === true;

                    return `
                        <div class="card mb-3" onclick="window.location.href='#/lesson?course=${encodeURIComponent(courseName)}&section=${encodeURIComponent(sectionName)}&lesson=${index}&lsn=${encodeURIComponent(lessonName)}'">
                            <div class="card-body d-flex justify-content-between align-items-center">
                                <h5>${lessonName}</h5>
                                <div class="text-end">
                                    <i class="fas fa-check-circle ${isCompleted ? 'text-success' : 'text-muted'}"></i>
                                    <small class="${isCompleted ? '' : 'text-lightgray'}">${isCompleted ? 'Урок пройден' : 'Не пройден'}</small>
                                </div>

                            </div>
                        </div>
                    `;
                }).join("");

                dynamicContent.innerHTML = `
                    <a href="#/course?name=${encodeURIComponent(courseName)}" class="text-primary">Назад к модулям</a>
                    <h2>${sectionName}</h2>
                    ${lessonsHTML}
                `;
            })
            .catch(err => {
                console.error("Ошибка загрузки данных раздела:", err);
                dynamicContent.innerHTML = `<p>Ошибка загрузки данных раздела.</p>`;
            });
    }

    // Уроки
    function renderLessonDetails(queryString) {
        const params = new URLSearchParams(queryString);
        const courseName = params.get("course");
        const sectionName = params.get("section");
        const lessonIndex = parseInt(params.get("lesson"), 10);
        const les = params.get("lsn");

        fetch("https://progito.github.io/resource/data/data.json")
            .then(res => res.text())  
            .then(text => fetchAndDecrypt(text))  
            .then(data => {
                const sectionContent = data[courseName]?.[0]?.[sectionName];
                const lessonArray = sectionContent?.[lessonIndex];
                const lessonContent = lessonArray[les]?.[0];

                if (!lessonContent) {
                    dynamicContent.innerHTML = `<p>Урок не найден.</p>`;
                    return;
                }

                // Отмечаем урок как завершенный
                updateLessonStatus(courseName, sectionName, les, true);

                const videos = lessonContent.videos?.map(video => `
                    <div class="mb-3 video-container">
                        <iframe width="720" height="405" src="${video}" class="rounded border-light shadow-sm"
                            frameBorder="0" allow="clipboard-write; autoplay" webkitAllowFullScreen mozallowfullscreen allowFullScreen>
                        </iframe>
                    </div>`).join("") || "";
                

                const text = lessonContent.text?.map(paragraph => `<p class="text-muted">${paragraph.replace(/\n/g, '<br>')}</p>`).join("") || "";

                const tasks = lessonContent.tasks?.map(task => `
                    <a href="${task}" target="_blank" class="btn btn-outline-primary me-2 mb-2 shadow-sm">Задание</a>`).join("") || "";

                    const link = lessonContent.link ? `
                    <iframe src="${lessonContent.link}" width="100%" height="500" class="mb-2 shadow-sm"></iframe>` : "";
                
                // Кнопки "Предыдущий" и "Следующий"
                const prevLesson = lessonIndex > 0 ? `
                    <a href="#/lesson?course=${encodeURIComponent(courseName)}&section=${encodeURIComponent(sectionName)}&lesson=${lessonIndex - 1}&lsn=${encodeURIComponent(Object.keys(sectionContent[lessonIndex - 1])[0])}" 
                       class="btn btn-outline-secondary">Предыдущий урок</a>` : "";

                const nextLesson = lessonIndex < sectionContent.length - 1 ? `
                    <a href="#/lesson?course=${encodeURIComponent(courseName)}&section=${encodeURIComponent(sectionName)}&lesson=${lessonIndex + 1}&lsn=${encodeURIComponent(Object.keys(sectionContent[lessonIndex + 1])[0])}" 
                       class="btn btn-outline-secondary">Следующий урок</a>` : "";

                dynamicContent.innerHTML = `
                    <a href="#/section?course=${encodeURIComponent(courseName)}&section=${encodeURIComponent(sectionName)}" class="text-primary">Назад к разделу</a>
                    <div class="d-flex justify-content-between align-items-center my-3 mt-1">
                        ${prevLesson}
                        <h2 class="text-center flex-grow-1 text-nowrap">${les}</h2>
                        ${nextLesson}
                    </div>

                
                    ${videos}
                    ${text}
                    <div>${tasks}</div>
                    ${link}

                `;
                if (lessonContent.comment) {
                    dynamicContent.innerHTML += `
                        <div class="comment-container">
                            <blockquote class="comment">
                                <p class="mb-0">${lessonContent.comment}</p>
                            </blockquote>
                        </div>
                    `;
                }
                   
            })
            .catch(err => {
                console.error("Ошибка загрузки урока:", err);
                dynamicContent.innerHTML = `<p>Ошибка загрузки данных урока.</p>`;
            });
    }

    async function renderCertificate() {
        if (!username) {
            dynamicContent.innerHTML = `<p>Необходима авторизация. <a href="../index.html">Войти</a></p>`;
            return;
        }
    
        try {
            const response = await fetch("https://progito.github.io/resource/data/cert.json");
            const certificates = await response.json();
    
            // Проверка, что сертификаты - это массив
            if (!Array.isArray(certificates)) {
                console.error("Ожидался массив сертификатов, но получены другие данные.");
                dynamicContent.innerHTML = `<p>Ошибка загрузки сертификатов.</p>`;
                return;
            }
    
            // Фильтрация сертификатов для текущего пользователя
            const userCertificates = certificates.filter(cert => cert.username === username);
    
            if (userCertificates.length === 0) {
                dynamicContent.innerHTML = `<p>Сертификаты не найдены.</p>`;
                return;
            }
    
            // Соответствие названия курса и пути к изображению
            const courseImages = {
                "Основы HTML": "../assets/cert/i6.jpg",
                "Junior Python Developer": "../assets/cert/i1.jpg",
                "Junior Frontend Developer": "../assets/cert/i3.jpg",
                "Middle Frontend Developer": "../assets/cert/i2.jpg",
                "Основы Git": "../assets/cert/i4.jpg",
                "Основы работы с компьютером": "../assets/cert/i5.jpg",
            };

            // Рендер сертификатов в виде таблицы
            dynamicContent.innerHTML = `
                <h1>Мои сертификаты</h1>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Название курса</th>
                            <th>Кому выдан?</th>
                            <th>Статус прохождения</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${userCertificates.map(cert => {
                            // Проверка наличия всех необходимых данных
                            
                            if (!cert.title) {
                                return ''; // Пропускаем сертификат, если нет обязательных данных
                            }
    
                            return `
                                <tr>
                                    <td>${cert.title}</td>
                                    <td>${cert.name}</td>
                                    <td>Пройден</td>
                                    <td>
                                        <button onclick="generateCertificate('${encodeURIComponent(cert.title)}', '${courseImages[cert.title]}', '${cert.name}')" class="btn btn-primary">
                                            Скачать сертификат
                                        </button>
                                    </td>
                                    <canvas style="display:none" id="canvas_${encodeURIComponent(cert.title)}" width="800" height="600" style="border: 1px solid #ccc; display: block; margin: 20px 0;"></canvas>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
                
            `;
        } catch (err) {
            console.error("Ошибка загрузки данных сертификатов:", err);
            dynamicContent.innerHTML = `<p>Ошибка загрузки сертификатов.</p>`;
        }
    }
    

    // Страница 404
    function renderNotFound() {
        dynamicContent.innerHTML = `<h3>Страница не найдена. Вернитесь <a href="#/home">на главную</a>.</h3>`;
    }

    // Запуск обработчика маршрутов
    window.addEventListener("hashchange", loadRoute);
    loadRoute();
});
