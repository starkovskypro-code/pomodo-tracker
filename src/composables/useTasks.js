/**
 * USE TASKS — Composable для работы с задачами
 * 
 * Задачи всегда связаны с проектом через projectId.
 * Этот хук предоставляет функции для управления задачами.
 */

import { ref } from 'vue';
import * as taskRepo from '../data/taskRepository.js';

/**
 * Хук для работы с задачами
 */
export function useTasks() {
    // Список задач (текущего проекта)
    const tasks = ref([]);

    const isLoading = ref(false);
    const error = ref(null);

    /**
     * Загрузить задачи конкретного проекта
     * 
     * @param {number} projectId - ID проекта
     */
    async function loadTasksByProject(projectId) {
        isLoading.value = true;
        error.value = null;

        try {
            tasks.value = await taskRepo.getTasksByProject(projectId);
        } catch (e) {
            error.value = 'Не удалось загрузить задачи';
            console.error('Ошибка загрузки задач:', e);
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Загрузить все задачи (из всех проектов)
     */
    async function loadAllTasks() {
        isLoading.value = true;
        error.value = null;

        try {
            tasks.value = await taskRepo.getAllTasks();
        } catch (e) {
            error.value = 'Не удалось загрузить задачи';
            console.error('Ошибка загрузки задач:', e);
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Добавить новую задачу
     * 
     * @param {number} projectId - ID проекта
     * @param {string} name - Название задачи
     * @returns {Promise<number|null>} ID новой задачи
     */
    async function addTask(projectId, name) {
        try {
            const id = await taskRepo.createTask({ projectId, name });
            await loadTasksByProject(projectId);
            return id;
        } catch (e) {
            error.value = 'Не удалось создать задачу';
            console.error('Ошибка создания задачи:', e);
            return null;
        }
    }

    /**
     * Обновить задачу
     * 
     * @param {number} id - ID задачи
     * @param {Object} updates - Обновлённые поля
     * @param {number} projectId - ID проекта (для перезагрузки списка)
     */
    async function editTask(id, updates, projectId) {
        try {
            await taskRepo.updateTask(id, updates);
            if (projectId) {
                await loadTasksByProject(projectId);
            }
        } catch (e) {
            error.value = 'Не удалось обновить задачу';
            console.error('Ошибка обновления задачи:', e);
        }
    }

    /**
     * Переключить статус завершённости задачи
     * 
     * @param {number} id - ID задачи
     * @param {boolean} completed - Новый статус
     * @param {number} projectId - ID проекта
     */
    async function toggleComplete(id, completed, projectId) {
        try {
            await taskRepo.toggleTaskComplete(id, completed);
            if (projectId) {
                await loadTasksByProject(projectId);
            }
        } catch (e) {
            error.value = 'Не удалось обновить статус задачи';
            console.error('Ошибка обновления статуса:', e);
        }
    }

    /**
     * Удалить задачу
     * 
     * @param {number} id - ID задачи
     * @param {number} projectId - ID проекта
     */
    async function removeTask(id, projectId) {
        try {
            await taskRepo.deleteTask(id);
            if (projectId) {
                await loadTasksByProject(projectId);
            }
        } catch (e) {
            error.value = 'Не удалось удалить задачу';
            console.error('Ошибка удаления задачи:', e);
        }
    }

    /**
     * Получить задачу по ID
     * 
     * @param {number} id - ID задачи
     * @returns {Promise<Object|undefined>}
     */
    async function getTask(id) {
        try {
            return await taskRepo.getTaskById(id);
        } catch (e) {
            console.error('Ошибка получения задачи:', e);
            return undefined;
        }
    }

    return {
        tasks,
        isLoading,
        error,
        loadTasksByProject,
        loadAllTasks,
        addTask,
        editTask,
        toggleComplete,
        removeTask,
        getTask
    };
}
