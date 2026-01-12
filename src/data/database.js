/**
 * DATABASE.JS — Настройка IndexedDB через Dexie.js
 * 
 * Этот файл — "сердце" хранения данных.
 * Здесь мы определяем структуру базы данных:
 * какие таблицы будут, какие поля в них.
 * 
 * Dexie.js — это обёртка над IndexedDB, которая делает
 * работу с базой данных простой и понятной.
 */

// Импортируем библиотеку Dexie
import Dexie from 'dexie';

// Создаём экземпляр базы данных с именем 'TimeTrackerDB'
// Это имя будет видно в DevTools браузера (Application → IndexedDB)
const db = new Dexie('TimeTrackerDB');

/**
 * ВЕРСИЯ СХЕМЫ БАЗЫ ДАННЫХ
 * 
 * Версионирование нужно для того, чтобы:
 * - Можно было добавлять новые таблицы в будущем
 * - Можно было менять структуру существующих таблиц
 * - Данные пользователя не терялись при обновлении
 * 
 * Синтаксис описания таблиц:
 * '++id'      — автоматически увеличивающийся первичный ключ
 * 'name'      — обычное поле (индексируется для поиска)
 * 'projectId' — поле для связи с другой таблицей
 */
db.version(1).stores({
    // Таблица ПРОЕКТОВ
    // ++id — автоматический ID (1, 2, 3...)
    // name — название проекта (индексируется)
    // createdAt — дата создания (индексируется)
    projects: '++id, name, createdAt',

    // Таблица ЗАДАЧ
    // projectId — связь с проектом (можно искать все задачи проекта)
    // completed — фильтр по статусу
    tasks: '++id, projectId, name, completed, createdAt',

    // Таблица ЗАПИСЕЙ ВРЕМЕНИ
    // taskId — связь с задачей
    // startTime, endTime — для поиска по периодам
    timeEntries: '++id, taskId, startTime, endTime'
});

// Версия 2: Добавляем deletedAt для поддержки корзины
db.version(2).stores({
    projects: '++id, name, createdAt, deletedAt',
    tasks: '++id, projectId, name, completed, createdAt, deletedAt',
    timeEntries: '++id, taskId, startTime, endTime'
});

// Экспортируем базу данных для использования в других файлах
export default db;
