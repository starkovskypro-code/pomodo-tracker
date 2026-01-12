/**
 * USE POMODORO — Composable для Pomodoro таймера (SINGLETON)
 * 
 * Создаётся один глобальный экземпляр для всего приложения.
 * 
 * Два режима работы:
 * 1. Самостоятельный — запущен из UI, не связан с задачей
 * 2. Привязанный — запущен при старте задачи, связан с ней
 */

import { ref, computed, watch } from 'vue';

// Настройки по умолчанию (в минутах)
const DEFAULT_SETTINGS = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4
};

function loadSettings() {
    try {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('Ошибка загрузки настроек Pomodoro:', e);
    }
    return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
    try {
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    } catch (e) {
        console.error('Ошибка сохранения настроек Pomodoro:', e);
    }
}

// ============================================
// ГЛОБАЛЬНОЕ СОСТОЯНИЕ (SINGLETON)
// ============================================
const settings = ref(loadSettings());
const mode = ref('idle'); // 'idle' | 'work' | 'shortBreak' | 'longBreak'
const isRunning = ref(false);
const remainingSeconds = ref(0);
const completedSessions = ref(0);

// Флаг: привязан ли Pomodoro к задаче
// true — запущен при старте задачи, остановка синхронизирована
// false — самостоятельный режим
const isLinkedToTask = ref(false);

let timerInterval = null;

// Вычисляемые свойства
const currentDuration = computed(() => {
    switch (mode.value) {
        case 'work':
            return settings.value.workDuration * 60;
        case 'shortBreak':
            return settings.value.shortBreakDuration * 60;
        case 'longBreak':
            return settings.value.longBreakDuration * 60;
        default:
            return settings.value.workDuration * 60;
    }
});

const progress = computed(() => {
    if (currentDuration.value === 0) return 0;
    return ((currentDuration.value - remainingSeconds.value) / currentDuration.value) * 100;
});

const modeLabel = computed(() => {
    switch (mode.value) {
        case 'work': return 'Работа';
        case 'shortBreak': return 'Короткий перерыв';
        case 'longBreak': return 'Длинный перерыв';
        default: return 'Готов';
    }
});

const formattedTime = computed(() => {
    const mins = Math.floor(remainingSeconds.value / 60);
    const secs = remainingSeconds.value % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});

// Следим за изменением настроек
watch(settings, (newSettings) => {
    saveSettings(newSettings);
}, { deep: true });

// ============================================
// Методы
// ============================================

/**
 * Запустить Pomodoro
 * @param {string} newMode - режим ('work', 'shortBreak', 'longBreak')
 * @param {boolean} linkedToTask - привязан ли к задаче
 */
function start(newMode = 'work', linkedToTask = false) {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    mode.value = newMode;
    remainingSeconds.value = currentDuration.value;
    isRunning.value = true;
    isLinkedToTask.value = linkedToTask;

    timerInterval = setInterval(() => {
        if (remainingSeconds.value > 0) {
            remainingSeconds.value--;
        } else {
            handleTimerComplete();
        }
    }, 1000);
}

function pause() {
    isRunning.value = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resume() {
    if (mode.value === 'idle') return;

    isRunning.value = true;
    timerInterval = setInterval(() => {
        if (remainingSeconds.value > 0) {
            remainingSeconds.value--;
        } else {
            handleTimerComplete();
        }
    }, 1000);
}

function stop() {
    pause();
    mode.value = 'idle';
    remainingSeconds.value = 0;
    completedSessions.value = 0;
    isLinkedToTask.value = false;
}

function skip() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    handleTimerComplete();
}

function handleTimerComplete() {
    pause();

    if (mode.value === 'work') {
        completedSessions.value++;
        const isLongBreak = completedSessions.value % settings.value.sessionsUntilLongBreak === 0;
        return {
            completed: 'work',
            nextMode: isLongBreak ? 'longBreak' : 'shortBreak',
            sessionsCompleted: completedSessions.value
        };
    } else {
        return {
            completed: mode.value,
            nextMode: 'work',
            sessionsCompleted: completedSessions.value
        };
    }
}

function updateSettings(newSettings) {
    settings.value = { ...settings.value, ...newSettings };
}

// ============================================
// ЭКСПОРТ SINGLETON
// ============================================
export function usePomodoro() {
    return {
        // Состояние
        settings,
        mode,
        isRunning,
        remainingSeconds,
        completedSessions,
        isLinkedToTask,

        // Вычисляемые
        currentDuration,
        progress,
        modeLabel,
        formattedTime,

        // Методы
        start,
        pause,
        resume,
        stop,
        skip,
        updateSettings
    };
}
