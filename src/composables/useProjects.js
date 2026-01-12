/**
 * USE PROJECTS — Composable для работы с проектами
 * 
 * "Composable" — это переиспользуемая логика в Vue 3.
 * Можно подключить этот хук в любом компоненте и получить
 * доступ к проектам и функциям для работы с ними.
 * 
 * Зачем это нужно:
 * - Логика в одном месте, а не размазана по компонентам
 * - Легко переиспользовать в разных частях приложения
 * - Реактивность "из коробки" — данные автоматически обновляются
 */

import { ref, onMounted } from 'vue';
import * as projectRepo from '../data/projectRepository.js';

/**
 * Хук для работы с проектами
 * 
 * Использование в компоненте:
 * 
 * import { useProjects } from '@/composables/useProjects.js';
 * 
 * const { projects, loadProjects, addProject } = useProjects();
 */
export function useProjects() {
    // ref() создаёт реактивную переменную
    // Когда projects.value изменится, все компоненты обновятся
    const projects = ref([]);

    // Флаг загрузки — показывать спиннер или нет
    const isLoading = ref(false);

    // Сообщение об ошибке
    const error = ref(null);

    /**
     * Загрузить все проекты из базы данных
     */
    async function loadProjects() {
        isLoading.value = true;
        error.value = null;

        try {
            projects.value = await projectRepo.getAllProjects();
        } catch (e) {
            error.value = 'Не удалось загрузить проекты';
            console.error('Ошибка загрузки проектов:', e);
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Добавить новый проект
     * 
     * @param {Object} projectData - Данные проекта
     * @returns {Promise<number|null>} ID нового проекта или null при ошибке
     */
    async function addProject(projectData) {
        try {
            const id = await projectRepo.createProject(projectData);
            // Перезагружаем список, чтобы увидеть новый проект
            await loadProjects();
            return id;
        } catch (e) {
            error.value = 'Не удалось создать проект';
            console.error('Ошибка создания проекта:', e);
            return null;
        }
    }

    /**
     * Обновить существующий проект
     * 
     * @param {number} id - ID проекта
     * @param {Object} updates - Обновлённые поля
     */
    async function editProject(id, updates) {
        try {
            await projectRepo.updateProject(id, updates);
            await loadProjects();
        } catch (e) {
            error.value = 'Не удалось обновить проект';
            console.error('Ошибка обновления проекта:', e);
        }
    }

    /**
     * Удалить проект
     * 
     * @param {number} id - ID проекта
     */
    async function removeProject(id) {
        try {
            await projectRepo.deleteProject(id);
            await loadProjects();
        } catch (e) {
            error.value = 'Не удалось удалить проект';
            console.error('Ошибка удаления проекта:', e);
        }
    }

    /**
     * Получить проект по ID
     * 
     * @param {number} id - ID проекта
     * @returns {Promise<Object|undefined>}
     */
    async function getProject(id) {
        try {
            return await projectRepo.getProjectById(id);
        } catch (e) {
            console.error('Ошибка получения проекта:', e);
            return undefined;
        }
    }

    // Возвращаем всё, что может понадобиться компонентам
    return {
        projects,
        isLoading,
        error,
        loadProjects,
        addProject,
        editProject,
        removeProject,
        getProject
    };
}
