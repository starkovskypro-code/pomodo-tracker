/**
 * USE TIMER — Composable для таймера (SINGLETON)
 * 
 * Глобальный экземпляр для всего приложения.
 * 
 * Ключевые правила:
 * 1. Может быть активен только ОДИН таймер в любой момент
 * 2. Состояние таймера сохраняется в IndexedDB
 * 3. При перезагрузке страницы таймер продолжает работать
 */

import { ref, computed } from 'vue';
import * as timeEntryRepo from '../data/timeEntryRepository.js';
import * as taskRepo from '../data/taskRepository.js';

// ============================================
// ГЛОБАЛЬНОЕ СОСТОЯНИЕ (SINGLETON)
// ============================================
const activeEntryId = ref(null);
const activeTaskId = ref(null);
const activeTask = ref(null);
const startTime = ref(null);
const elapsedSeconds = ref(0);
let tickInterval = null;

// Вычисляемое свойство: запущен ли таймер?
const isRunning = computed(() => activeEntryId.value !== null);

/**
 * Запустить "тикающий" интервал
 */
function startTicking() {
    if (tickInterval) {
        clearInterval(tickInterval);
    }

    tickInterval = setInterval(() => {
        if (startTime.value) {
            const now = new Date();
            const diffMs = now.getTime() - new Date(startTime.value).getTime();
            elapsedSeconds.value = Math.floor(diffMs / 1000);
        }
    }, 1000);
}

function stopTicking() {
    if (tickInterval) {
        clearInterval(tickInterval);
        tickInterval = null;
    }
}

/**
 * Проверить, есть ли активная запись в базе
 */
async function checkActiveTimer() {
    try {
        const entry = await timeEntryRepo.getActiveTimeEntry();

        if (entry) {
            activeEntryId.value = entry.id;
            activeTaskId.value = entry.taskId;
            startTime.value = entry.startTime;
            activeTask.value = await taskRepo.getTaskById(entry.taskId);
            startTicking();
        }
    } catch (e) {
        console.error('Ошибка проверки активного таймера:', e);
    }
}

/**
 * Запустить таймер для задачи
 */
async function start(taskId) {
    if (isRunning.value) {
        console.warn('Таймер уже запущен. Сначала остановите его.');
        return false;
    }

    try {
        const entryId = await timeEntryRepo.startTimeEntry(taskId);

        activeEntryId.value = entryId;
        activeTaskId.value = taskId;
        startTime.value = new Date();
        elapsedSeconds.value = 0;

        activeTask.value = await taskRepo.getTaskById(taskId);
        startTicking();

        return true;
    } catch (e) {
        console.error('Ошибка запуска таймера:', e);
        return false;
    }
}

/**
 * Остановить таймер
 */
async function stop() {
    if (!isRunning.value) {
        console.warn('Таймер не запущен.');
        return false;
    }

    try {
        await timeEntryRepo.stopTimeEntry(activeEntryId.value);

        activeEntryId.value = null;
        activeTaskId.value = null;
        activeTask.value = null;
        startTime.value = null;
        elapsedSeconds.value = 0;

        stopTicking();

        return true;
    } catch (e) {
        console.error('Ошибка остановки таймера:', e);
        return false;
    }
}

// ============================================
// ЭКСПОРТ SINGLETON
// ============================================
export function useTimer() {
    return {
        // Состояние (глобальное)
        isRunning,
        activeTaskId,
        activeTask,
        elapsedSeconds,

        // Методы
        checkActiveTimer,
        start,
        stop
    };
}
