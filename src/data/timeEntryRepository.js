/**
 * TIME ENTRY REPOSITORY — Операции с записями времени
 * 
 * TimeEntry — это одна "сессия" работы над задачей.
 * Например: начал в 10:00, закончил в 11:30 = одна запись.
 * 
 * Структура записи:
 * - taskId: к какой задаче относится
 * - startTime: когда начали работать (Date)
 * - endTime: когда закончили работать (Date или null, если ещё работаем)
 * - duration: длительность в СЕКУНДАХ (считается автоматически)
 */

import db from './database.js';

/**
 * Получить все записи времени для задачи
 * 
 * @param {number} taskId - ID задачи
 * @returns {Promise<Array>} Массив записей времени
 */
export async function getTimeEntriesByTask(taskId) {
    return await db.timeEntries.where('taskId').equals(taskId).toArray();
}

/**
 * Получить все записи времени
 * 
 * @returns {Promise<Array>} Массив всех записей
 */
export async function getAllTimeEntries() {
    return await db.timeEntries.toArray();
}

/**
 * Получить запись по ID
 * 
 * @param {number} id - ID записи
 * @returns {Promise<Object|undefined>}
 */
export async function getTimeEntryById(id) {
    return await db.timeEntries.get(id);
}

/**
 * Найти активную запись (где endTime === null)
 * 
 * Это нужно для проверки: работает ли сейчас таймер?
 * У нас может быть только ОДНА активная запись в любой момент.
 * 
 * @returns {Promise<Object|undefined>} Активная запись или undefined
 */
export async function getActiveTimeEntry() {
    // filter() позволяет делать сложные проверки
    // Ищем запись, где endTime отсутствует (null)
    const entries = await db.timeEntries.filter(entry => entry.endTime === null).toArray();
    // Возвращаем первую найденную (должна быть только одна)
    return entries[0];
}

/**
 * Начать новую запись времени (START)
 * 
 * @param {number} taskId - ID задачи
 * @returns {Promise<number>} ID созданной записи
 * 
 * ⚠️ Перед вызовом убедитесь, что нет активной записи!
 */
export async function startTimeEntry(taskId) {
    return await db.timeEntries.add({
        taskId,
        startTime: new Date(),
        endTime: null, // null означает "ещё идёт"
        duration: 0
    });
}

/**
 * Остановить запись времени (STOP)
 * 
 * @param {number} id - ID записи
 * @returns {Promise<number>} Количество обновлённых записей
 * 
 * Автоматически вычисляет duration в СЕКУНДАХ.
 */
export async function stopTimeEntry(id) {
    const entry = await db.timeEntries.get(id);
    if (!entry) return 0;

    const endTime = new Date();

    // Вычисляем длительность в СЕКУНДАХ
    // getTime() возвращает миллисекунды, делим на 1000 для секунд
    const durationMs = endTime.getTime() - new Date(entry.startTime).getTime();
    const duration = Math.round(durationMs / 1000);

    return await db.timeEntries.update(id, {
        endTime,
        duration
    });
}

/**
 * Удалить запись времени
 * 
 * @param {number} id - ID записи
 * @returns {Promise<void>}
 */
export async function deleteTimeEntry(id) {
    return await db.timeEntries.delete(id);
}

/**
 * Получить общее время по задаче (в СЕКУНДАХ)
 * 
 * @param {number} taskId - ID задачи
 * @returns {Promise<number>} Сумма секунд
 */
export async function getTotalTimeByTask(taskId) {
    const entries = await getTimeEntriesByTask(taskId);
    // reduce() суммирует все duration (в секундах)
    return entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
}

/**
 * Получить общее время по проекту (в СЕКУНДАХ)
 * 
 * @param {number} projectId - ID проекта
 * @param {Array} taskIds - Массив ID задач проекта
 * @returns {Promise<number>} Сумма секунд
 */
export async function getTotalTimeByProject(taskIds) {
    if (!taskIds || taskIds.length === 0) return 0;

    const entries = await db.timeEntries
        .where('taskId')
        .anyOf(taskIds)
        .toArray();

    return entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
}

/**
 * Добавить время вручную (для случаев, когда забыли включить таймер)
 * 
 * @param {number} taskId - ID задачи
 * @param {number} seconds - Количество секунд для добавления
 * @returns {Promise<number>} ID созданной записи
 */
export async function addManualTimeEntry(taskId, seconds) {
    if (!seconds || seconds <= 0) return null;

    const now = new Date();
    // Создаём "фиктивную" запись с указанным временем
    // startTime вычисляем задним числом
    const startTime = new Date(now.getTime() - (seconds * 1000));

    return await db.timeEntries.add({
        taskId,
        startTime,
        endTime: now,
        duration: seconds
    });
}
