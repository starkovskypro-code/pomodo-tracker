/**
 * ROUTER — Настройка маршрутизации Vue Router
 * 
 * Маршрутизация позволяет переключаться между "страницами" приложения
 * без перезагрузки браузера. Это одностраничное приложение (SPA).
 * 
 * Каждый маршрут связывает URL с компонентом:
 * '/' → DashboardView
 * '/projects' → ProjectsView
 * '/projects/1' → ProjectDetailView
 */

import { createRouter, createWebHashHistory } from 'vue-router';

// Ленивая загрузка компонентов — они загружаются только когда нужны
// Это ускоряет начальную загрузку приложения
const DashboardView = () => import('./views/DashboardView.vue');
const ProjectsView = () => import('./views/ProjectsView.vue');
const ProjectDetailView = () => import('./views/ProjectDetailView.vue');
const SettingsView = () => import('./views/SettingsView.vue');

// Определяем маршруты
const routes = [
    {
        // Главная страница — дашборд
        path: '/',
        name: 'dashboard',
        component: DashboardView
    },
    {
        // Список проектов
        path: '/projects',
        name: 'projects',
        component: ProjectsView
    },
    {
        // Детальная страница проекта
        // :id — динамический параметр (ID проекта)
        path: '/projects/:id',
        name: 'project',
        component: ProjectDetailView
    },
    {
        // Настройки (экспорт/импорт)
        path: '/settings',
        name: 'settings',
        component: SettingsView
    },
    {
        // Корзина (архив задач)
        path: '/trash',
        name: 'trash',
        component: () => import('./views/TrashView.vue')
    }
];

// Создаём роутер
const router = createRouter({
    // Hash-режим работает на GitHub Pages без настройки сервера
    // URL будет выглядеть как: example.com/#/projects
    history: createWebHashHistory(),
    routes
});

export default router;
