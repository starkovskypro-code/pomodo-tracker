/**
 * TASK REPOSITORY — Операции с задачами
 * 
 * Задача (Task) всегда принадлежит какому-то проекту.
 * Связь между ними — через поле projectId.
 */

import db from './database.js';

/**
 * Получить все АКТИВНЫЕ задачи конкретного проекта
 * 
 * @param {number} projectId - ID проекта
 * @returns {Promise<Array>} Массив задач проекта
 */
export async function getTasksByProject(projectId) {
    return await db.tasks
        .where('projectId').equals(projectId)
        .filter(task => !task.deletedAt)
        .toArray();
}

/**
 * Получить все УДАЛЁННЫЕ задачи (для корзины)
 * 
 * @returns {Promise<Array>} Массив удалённых задач
 */
export async function getAllDeletedTasks() {
    return await db.tasks
        .filter(task => !!task.deletedAt)
        .toArray();
}

/**
 * Получить все задачи (из всех проектов, кроме удалённых)
 * 
 * @returns {Promise<Array>} Массив всех задач
 */
export async function getAllTasks() {
    return await db.tasks
        .filter(task => !task.deletedAt)
        .toArray();
}

/**
 * Получить задачу по ID
 * 
 * @param {number} id - ID задачи
 * @returns {Promise<Object|undefined>} Задача или undefined
 */
export async function getTaskById(id) {
    return await db.tasks.get(id);
}

/**
 * Создать новую задачу
 * 
 * @param {Object} taskData - Данные задачи
 * @param {number} taskData.projectId - ID проекта
 * @param {string} taskData.name - Название задачи
 * @param {boolean} [taskData.isRestored] - Маркер восстановленной задачи
 * @returns {Promise<number>} ID созданной задачи
 */
export async function createTask(taskData) {
    return await db.tasks.add({
        projectId: taskData.projectId,
        name: taskData.name,
        completed: false,
        isRestored: taskData.isRestored || false,
        createdAt: new Date(),
        deletedAt: null // Явно указываем null
    });
}

/**
 * Обновить задачу
 * 
 * @param {number} id - ID задачи
 * @param {Object} updates - Поля для обновления
 * @returns {Promise<number>} Количество обновлённых записей
 */
export async function updateTask(id, updates) {
    return await db.tasks.update(id, updates);
}

/**
 * Отметить задачу как выполненную/невыполненную
 * 
 * @param {number} id - ID задачи
 * @param {boolean} completed - Статус завершённости
 * @returns {Promise<number>}
 */
export async function toggleTaskComplete(id, completed) {
    return await db.tasks.update(id, { completed });
}

/**
 * Soft delete задачи (перемещение в корзину)
 * 
 * @param {number} id - ID задачи
 * @returns {Promise<void>}
 */
export async function deleteTask(id) {
    // Просто помечаем как удалённую
    // Записи времени НЕ удаляем, чтобы сохранить статистику
    await db.tasks.update(id, { deletedAt: new Date() });
}

/**
 * Восстановить задачу из корзины
 * 
 * @param {number} id - ID задачи
 * @returns {Promise<void>}
 */
export async function restoreTask(id) {
    await db.tasks.update(id, { deletedAt: null });
}

/**
 * ПЕРМАНЕНТНО удалить задачу и все связанные записи времени
 * 
 * @param {number} id - ID задачи
 * @returns {Promise<void>}
 */
export async function permanentDeleteTask(id) {
    await db.transaction('rw', [db.tasks, db.timeEntries], async () => {
        await db.timeEntries.where('taskId').equals(id).delete();
        await db.tasks.delete(id);
    });
}

/**
 * Очистить ВСЮ корзину (удалить все удалённые задачи)
 * 
 * @returns {Promise<void>}
 */
export async function clearAllDeletedTasks() {
    const deletedTasks = await db.tasks.filter(t => !!t.deletedAt).toArray();
    const taskIds = deletedTasks.map(t => t.id);

    await db.transaction('rw', [db.tasks, db.timeEntries], async () => {
        // Удаляем записи времени
        if (taskIds.length > 0) {
            await db.timeEntries.where('taskId').anyOf(taskIds).delete();
        }
        // Удаляем задачи
        for (const id of taskIds) {
            await db.tasks.delete(id);
        }
    });
}
