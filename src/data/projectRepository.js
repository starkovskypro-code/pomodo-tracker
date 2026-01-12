/**
 * PROJECT REPOSITORY — Операции с проектами
 * 
 * "Repository" (репозиторий) — это паттерн проектирования,
 * который изолирует логику работы с данными от остального кода.
 * 
 * Зачем это нужно:
 * - Если захотим поменять способ хранения — меняем только здесь
 * - Компоненты не знают, откуда приходят данные
 * - Код компонентов остаётся чистым и простым
 */

import db from './database.js';

/**
 * Получить все Активные проекты
 * 
 * @returns {Promise<Array>} Массив всех проектов (кроме удалённых)
 */
export async function getAllProjects() {
    return await db.projects
        .filter(project => !project.deletedAt)
        .toArray();
}

/**
 * Получить проект по ID
 * 
 * @param {number} id - ID проекта
 * @returns {Promise<Object|undefined>} Проект или undefined
 */
export async function getProjectById(id) {
    return await db.projects.get(id);
}

/**
 * Создать новый проект
 * 
 * @param {Object} projectData - Данные нового проекта
 * @returns {Promise<number>} ID созданного проекта
 */
export async function createProject(projectData) {
    return await db.projects.add({
        name: projectData.name,
        hourlyRate: projectData.hourlyRate || 0,
        color: projectData.color || '#6366F1',
        createdAt: new Date(),
        deletedAt: null // Явно указываем null
    });
}

/**
 * Обновить существующий проект
 * 
 * @param {number} id - ID проекта
 * @param {Object} updates - Поля для обновления
 * @returns {Promise<number>} Количество обновлённых записей
 */
export async function updateProject(id, updates) {
    return await db.projects.update(id, updates);
}

/**
 * Soft delete проекта (перемещение в корзину)
 * 
 * @param {number} id - ID проекта
 * @returns {Promise<void>}
 */
export async function deleteProject(id) {
    await db.transaction('rw', [db.projects, db.tasks], async () => {
        // Помечаем проект как удалённый
        await db.projects.update(id, { deletedAt: new Date() });

        // Помечаем все задачи проекта как удалённые
        // (чтобы они тоже попали в корзину)
        const tasks = await db.tasks.where('projectId').equals(id).toArray();
        const now = new Date();

        // Массовое обновление не поддерживается напрямую в Dexie для update,
        // но можно пройтись циклом (в транзакции это быстро)
        for (const task of tasks) {
            // Удаляем только те, что ещё не удалены
            if (!task.deletedAt) {
                await db.tasks.update(task.id, { deletedAt: now });
            }
        }
    });
}

/**
 * Получить все УДАЛЁННЫЕ проекты (для корзины)
 */
export async function getDeletedProjects() {
    return await db.projects
        .filter(project => !!project.deletedAt)
        .toArray();
}

/**
 * Восстановить проект из корзины
 * 
 * @param {number} id - ID проекта
 * @returns {Promise<void>}
 */
export async function restoreProject(id) {
    await db.transaction('rw', [db.projects, db.tasks], async () => {
        // Восстанавливаем проект
        await db.projects.update(id, { deletedAt: null });

        // Восстанавливаем все задачи проекта
        const tasks = await db.tasks.where('projectId').equals(id).toArray();
        for (const task of tasks) {
            if (task.deletedAt) {
                await db.tasks.update(task.id, { deletedAt: null });
            }
        }
    });
}

/**
 * ПЕРМАНЕНТНО удалить проект и все связанные данные
 * 
 * @param {number} id - ID проекта
 * @returns {Promise<void>}
 */
export async function permanentDeleteProject(id) {
    await db.transaction('rw', [db.projects, db.tasks, db.timeEntries], async () => {
        // Находим все задачи проекта
        const tasks = await db.tasks.where('projectId').equals(id).toArray();
        const taskIds = tasks.map(t => t.id);

        // Удаляем все записи времени для этих задач
        if (taskIds.length > 0) {
            await db.timeEntries.where('taskId').anyOf(taskIds).delete();
        }

        // Удаляем все задачи проекта
        await db.tasks.where('projectId').equals(id).delete();

        // Удаляем сам проект
        await db.projects.delete(id);
    });
}

/**
 * Очистить ВСЮ корзину (удалить все удалённые проекты и задачи)
 * 
 * @returns {Promise<void>}
 */
export async function clearAllTrash() {
    // Сначала получаем все удалённые проекты и задачи
    const deletedProjects = await db.projects.filter(p => !!p.deletedAt).toArray();
    const deletedTasks = await db.tasks.filter(t => !!t.deletedAt).toArray();

    const projectIds = deletedProjects.map(p => p.id);
    const taskIds = deletedTasks.map(t => t.id);

    await db.transaction('rw', [db.projects, db.tasks, db.timeEntries], async () => {
        // Удаляем записи времени
        if (taskIds.length > 0) {
            await db.timeEntries.where('taskId').anyOf(taskIds).delete();
        }

        // Удаляем задачи
        for (const id of taskIds) {
            await db.tasks.delete(id);
        }

        // Удаляем проекты
        for (const id of projectIds) {
            await db.projects.delete(id);
        }
    });
}
