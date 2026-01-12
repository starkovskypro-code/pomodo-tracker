/**
 * USE BACKUP — Composable для экспорта и импорта данных
 * 
 * Этот хук позволяет:
 * - Экспортировать все данные в JSON-файл (бэкап)
 * - Импортировать данные из JSON-файла (восстановление)
 * 
 * Зачем это нужно:
 * - IndexedDB привязана к браузеру
 * - Если очистить данные браузера — всё пропадёт
 * - Экспорт позволяет сохранить данные на диск
 * - Импорт позволяет перенести данные на другой компьютер
 */

import { ref } from 'vue';
import db from '../data/database.js';

/**
 * Хук для экспорта/импорта данных
 */
export function useBackup() {
    const isExporting = ref(false);
    const isImporting = ref(false);
    const error = ref(null);

    /**
     * Экспортировать все данные в JSON-файл
     * 
     * Создаёт файл и автоматически скачивает его.
     */
    async function exportData() {
        isExporting.value = true;
        error.value = null;

        try {
            // Собираем все данные из всех таблиц
            const data = {
                // Метаданные экспорта
                exportedAt: new Date().toISOString(),
                version: 1,

                // Данные таблиц
                projects: await db.projects.toArray(),
                tasks: await db.tasks.toArray(),
                timeEntries: await db.timeEntries.toArray()
            };

            // Преобразуем в JSON-строку с отступами (для читаемости)
            const jsonString = JSON.stringify(data, null, 2);

            // Создаём Blob (бинарный объект)
            const blob = new Blob([jsonString], { type: 'application/json' });

            // Создаём временную ссылку для скачивания
            const url = URL.createObjectURL(blob);

            // Создаём скрытый элемент <a> и кликаем по нему
            const link = document.createElement('a');
            link.href = url;

            // Имя файла с датой
            const date = new Date().toISOString().split('T')[0];
            link.download = `time-tracker-backup-${date}.json`;

            // Добавляем на страницу, кликаем, удаляем
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Освобождаем память
            URL.revokeObjectURL(url);

            return true;
        } catch (e) {
            error.value = 'Ошибка при экспорте данных';
            console.error('Ошибка экспорта:', e);
            return false;
        } finally {
            isExporting.value = false;
        }
    }

    /**
     * Импортировать данные из JSON-файла
     * 
     * @param {File} file - Файл для импорта
     * @returns {Promise<boolean>} Успешно ли выполнен импорт
     * 
     * ⚠️ ВНИМАНИЕ: Импорт ЗАМЕНЯЕТ все существующие данные!
     */
    async function importData(file) {
        isImporting.value = true;
        error.value = null;

        try {
            // Читаем содержимое файла
            const text = await file.text();

            // Парсим JSON
            const data = JSON.parse(text);

            // Проверяем структуру данных
            if (!data.projects || !data.tasks || !data.timeEntries) {
                throw new Error('Неверный формат файла');
            }

            // Используем транзакцию для атомарной операции
            await db.transaction('rw', [db.projects, db.tasks, db.timeEntries], async () => {
                // Очищаем все таблицы
                await db.projects.clear();
                await db.tasks.clear();
                await db.timeEntries.clear();

                // Добавляем данные из файла
                // bulkAdd добавляет множество записей за раз (быстрее)
                if (data.projects.length > 0) {
                    await db.projects.bulkAdd(data.projects);
                }
                if (data.tasks.length > 0) {
                    await db.tasks.bulkAdd(data.tasks);
                }
                if (data.timeEntries.length > 0) {
                    await db.timeEntries.bulkAdd(data.timeEntries);
                }
            });

            return true;
        } catch (e) {
            error.value = 'Ошибка при импорте данных: ' + e.message;
            console.error('Ошибка импорта:', e);
            return false;
        } finally {
            isImporting.value = false;
        }
    }

    return {
        isExporting,
        isImporting,
        error,
        exportData,
        importData
    };
}
