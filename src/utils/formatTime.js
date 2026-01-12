/**
 * FORMAT TIME — Функции форматирования времени
 * 
 * Эти функции превращают "сырые" секунды в читаемый текст.
 * Например: 3661 секунд → "01:01:01"
 */

/**
 * Преобразует секунды в формат "ЧЧ:ММ:СС"
 * 
 * @param {number} seconds - Количество секунд
 * @returns {string} Отформатированная строка
 * 
 * Примеры:
 * formatDuration(45)   → "00:00:45"
 * formatDuration(90)   → "00:01:30"
 * formatDuration(3661) → "01:01:01"
 */
export function formatDuration(seconds) {
    // Если секунд нет или отрицательное значение
    if (!seconds || seconds <= 0) {
        return '00:00:00';
    }

    // Вычисляем часы, минуты и секунды
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    // Форматируем с ведущими нулями
    return [
        hrs.toString().padStart(2, '0'),
        mins.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
    ].join(':');
}

/**
 * Форматирует Date в читаемую строку времени
 * 
 * @param {Date|string} date - Дата
 * @returns {string} Время в формате "HH:MM"
 * 
 * Пример:
 * formatTime(new Date('2024-01-15T14:30:00')) → "14:30"
 */
export function formatTime(date) {
    if (!date) return '';

    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');

    return `${hours}:${mins}`;
}

/**
 * Форматирует Date в читаемую дату
 * 
 * @param {Date|string} date - Дата
 * @returns {string} Дата в формате "15 января 2024"
 */
export function formatDate(date) {
    if (!date) return '';

    const d = new Date(date);
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
}

/**
 * Преобразует секунды в формат "HH:MM:SS"
 * 
 * Используется для отображения тикающего таймера.
 * 
 * @param {number} seconds - Количество секунд
 * @returns {string} Время в формате "00:00:00"
 */
export function formatTimerDisplay(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
        hrs.toString().padStart(2, '0'),
        mins.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
    ].join(':');
}
