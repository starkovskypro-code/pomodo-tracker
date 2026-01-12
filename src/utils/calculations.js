/**
 * CALCULATIONS — Функции расчёта стоимости
 * 
 * Здесь находятся функции для расчёта денежной стоимости работы.
 * Формула простая: время (в часах) × часовая ставка
 */

/**
 * Рассчитать стоимость по времени и ставке
 * 
 * @param {number} seconds - Время в СЕКУНДАХ
 * @param {number} hourlyRate - Часовая ставка (руб.)
 * @returns {number} Стоимость в рублях
 * 
 * Пример:
 * calculateCost(5400, 2000) → 3000 (1.5 часа × 2000 руб.)
 */
export function calculateCost(seconds, hourlyRate) {
    if (!seconds || !hourlyRate) return 0;

    // Переводим секунды в часы и умножаем на ставку
    const hours = seconds / 3600;
    return Math.round(hours * hourlyRate);
}

/**
 * Форматирует число в денежный формат
 * 
 * @param {number} amount - Сумма
 * @returns {string} Отформатированная строка
 * 
 * Пример:
 * formatMoney(15000) → "15 000 ₽"
 */
export function formatMoney(amount) {
    if (!amount && amount !== 0) return '0 ₽';

    // toLocaleString добавляет разделители тысяч
    return amount.toLocaleString('ru-RU') + ' ₽';
}
