// Полноэкранный скролл с анимациями
let currentSection = 0;
const sections = document.querySelectorAll('.section');
const totalSections = sections.length;
let isScrolling = false;
let touchStartY = 0;
let touchEndY = 0;
let scrollQueue = [];
let isProcessingQueue = false;
const visitedSections = new Set(); // Отслеживаем посещённые секции

// Инициализация
function init() {
    // Устанавливаем первую секцию активной
    sections[0].classList.add('active');
    currentSection = 0;
    
    // Запускаем анимации для первой секции и отмечаем её как посещённую
    setTimeout(() => {
        restartAnimations(sections[0]);
    }, 300);
    visitedSections.add(0);
}

// Перезапустить анимации букв и слов
function restartAnimations(section) {
    // Анимация букв (для первой страницы)
    const letters = section.querySelectorAll('.letter');
    if (letters.length > 0) {
        letters.forEach(letter => {
            // Удаляем и добавляем снова, чтобы перезапустить анимацию
            const clone = letter.cloneNode(true);
            letter.parentNode.replaceChild(clone, letter);
        });
    }
    
    // Анимация букв-сборки (для страницы приглашения)
    const lettersGather = section.querySelectorAll('.letter-gather');
    if (lettersGather.length > 0) {
        lettersGather.forEach(letter => {
            const clone = letter.cloneNode(true);
            letter.parentNode.replaceChild(clone, letter);
        });
    }
    
    // Анимация слов дресс-кода
    const dresscodeWords = section.querySelectorAll('.dresscode-word');
    if (dresscodeWords.length > 0) {
        dresscodeWords.forEach(word => {
            const clone = word.cloneNode(true);
            word.parentNode.replaceChild(clone, word);
        });
    }
    
    // Анимация слов (для всех страниц)
    const words = section.querySelectorAll('.word');
    if (words.length > 0) {
        words.forEach(word => {
            const clone = word.cloneNode(true);
            word.parentNode.replaceChild(clone, word);
        });
    }
}

// Показать секцию с анимацией
function showSection(index, direction = 'down') {
    if (index < 0 || index >= totalSections) return;
    if (index === currentSection) return;
    
    const prevSection = sections[currentSection];
    const nextSection = sections[index];
    
    // Удаляем активный класс с предыдущей секции
    prevSection.classList.remove('active');
    
    // Добавляем классы анимации
    if (direction === 'down') {
        prevSection.classList.add('slide-out-up');
        nextSection.classList.add('slide-in-from-bottom');
    } else {
        prevSection.classList.add('slide-out-down');
        nextSection.classList.add('slide-in-from-top');
    }
    
    // Добавляем активный класс к новой секции
    nextSection.classList.add('active');
    
    // Перезапускаем анимации букв и слов только если секция ещё не посещалась
    if (!visitedSections.has(index)) {
        setTimeout(() => {
            restartAnimations(nextSection);
        }, 100);
        visitedSections.add(index);
    }
    
    // Удаляем классы анимации после завершения
    setTimeout(() => {
        prevSection.classList.remove('slide-out-up', 'slide-out-down');
        nextSection.classList.remove('slide-in-from-bottom', 'slide-in-from-top');
    }, 700);
    
    currentSection = index;
}

// Обработка очереди скроллов
function processScrollQueue() {
    if (scrollQueue.length === 0) {
        isProcessingQueue = false;
        return;
    }
    
    isProcessingQueue = true;
    const direction = scrollQueue.shift();
    
    if (direction === 'down' && currentSection < totalSections - 1) {
        showSection(currentSection + 1, 'down');
    } else if (direction === 'up' && currentSection > 0) {
        showSection(currentSection - 1, 'up');
    }
    
    // Обрабатываем следующий скролл через короткую задержку
    setTimeout(() => {
        processScrollQueue();
    }, 450);
}

// Переход к следующей секции
function nextSection() {
    if (currentSection < totalSections - 1) {
        showSection(currentSection + 1, 'down');
    }
}

// Переход к предыдущей секции
function prevSection() {
    if (currentSection > 0) {
        showSection(currentSection - 1, 'up');
    }
}

// Обработчик скролла колесом мыши
function handleWheel(e) {
    e.preventDefault();
    
    const direction = e.deltaY > 0 ? 'down' : 'up';
    
    // Добавляем в очередь
    scrollQueue.push(direction);
    
    // Ограничиваем размер очереди
    if (scrollQueue.length > 3) {
        scrollQueue.shift();
    }
    
    // Запускаем обработку очереди, если она не запущена
    if (!isProcessingQueue) {
        processScrollQueue();
    }
}

// Обработчик свайпов для мобильных
function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
    if (isScrolling) return;
    
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        isScrolling = true;
        
        if (diff > 0) {
            // Свайп вверх - следующая секция
            nextSection();
        } else {
            // Свайп вниз - предыдущая секция
            prevSection();
        }
        
        setTimeout(() => {
            isScrolling = false;
        }, 1000);
    }
}

// Обработчик клавиатуры
function handleKeydown(e) {
    switch(e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
            e.preventDefault();
            scrollQueue.push('down');
            if (!isProcessingQueue) {
                processScrollQueue();
            }
            break;
        case 'ArrowUp':
        case 'PageUp':
            e.preventDefault();
            scrollQueue.push('up');
            if (!isProcessingQueue) {
                processScrollQueue();
            }
            break;
        case 'Home':
            e.preventDefault();
            scrollQueue = [];
            showSection(0, currentSection > 0 ? 'up' : 'down');
            break;
        case 'End':
            e.preventDefault();
            scrollQueue = [];
            showSection(totalSections - 1, 'down');
            break;
    }
}

// Добавляем обработчики событий
window.addEventListener('wheel', handleWheel, { passive: false });
window.addEventListener('touchstart', handleTouchStart, { passive: true });
window.addEventListener('touchend', handleTouchEnd, { passive: true });
window.addEventListener('keydown', handleKeydown);

// Инициализация при загрузке
window.addEventListener('load', init);

// Предотвращаем обычный скролл
document.body.style.overflow = 'hidden';

