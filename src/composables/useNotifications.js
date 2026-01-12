/**
 * USE NOTIFICATIONS — Composable для уведомлений
 * 
 * Работа с Web Notifications API
 */

import { ref } from 'vue';

export function useNotifications() {
    const permission = ref(Notification.permission);
    const isEnabled = ref(localStorage.getItem('notificationsEnabled') === 'true');

    // Запросить разрешение на уведомления
    async function requestPermission() {
        if (!('Notification' in window)) {
            console.warn('Браузер не поддерживает уведомления');
            return false;
        }

        const result = await Notification.requestPermission();
        permission.value = result;

        if (result === 'granted') {
            isEnabled.value = true;
            localStorage.setItem('notificationsEnabled', 'true');
            return true;
        }

        return false;
    }

    // Включить/выключить уведомления
    function setEnabled(enabled) {
        isEnabled.value = enabled;
        localStorage.setItem('notificationsEnabled', enabled.toString());
    }

    // Показать уведомление
    function showNotification(title, options = {}) {
        if (!isEnabled.value || permission.value !== 'granted') {
            return null;
        }

        try {
            const notification = new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                vibrate: [200, 100, 200],
                ...options
            });

            // Автоматически закрыть через 5 секунд
            setTimeout(() => notification.close(), 5000);

            return notification;
        } catch (e) {
            console.error('Ошибка показа уведомления:', e);
            return null;
        }
    }

    // Уведомления для Pomodoro
    function notifyWorkStart() {
        showNotification('🍅 Время работать!', {
            body: 'Начинается рабочая сессия. Сосредоточьтесь!',
            tag: 'pomodoro-work'
        });
        playSound('work');
    }

    function notifyBreakStart(isLong = false) {
        const title = isLong ? '🌴 Длинный перерыв!' : '☕ Короткий перерыв!';
        const body = isLong
            ? 'Отлично поработали! Время на хороший отдых.'
            : 'Сделайте небольшую паузу.';

        showNotification(title, { body, tag: 'pomodoro-break' });
        playSound('break');
    }

    function notifySessionComplete(sessionsCount) {
        showNotification('✅ Сессия завершена!', {
            body: `Завершено сессий: ${sessionsCount}`,
            tag: 'pomodoro-complete'
        });
    }

    // Воспроизвести звук
    function playSound(type) {
        // Создаём простой звуковой сигнал через Web Audio API
        try {
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Разные частоты для разных типов
            oscillator.frequency.value = type === 'work' ? 800 : 600;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.5);
        } catch (e) {
            // Звук не критичен, просто игнорируем ошибку
        }
    }

    return {
        permission,
        isEnabled,
        requestPermission,
        setEnabled,
        showNotification,
        notifyWorkStart,
        notifyBreakStart,
        notifySessionComplete,
        playSound
    };
}
