<!--
  APP.VUE — Корневой компонент приложения
  
  Содержит:
  - Боковую навигацию
  - Глобальный Pomodoro таймер
  - Основное содержимое (router-view)
-->

<template>
  <div class="app">
    <!-- Боковая навигация -->
    <nav class="nav">
      <!-- Логотип -->
      <div class="nav__header">
        <h1 class="nav__logo">⏱ Time Tracker</h1>
      </div>
      
      <!-- Глобальный Pomodoro (под логотипом) -->
      <div class="nav__pomodoro">
        <MiniPomodoro 
          @work-start="handlePomodoroWorkStart"
          @work-pause="handlePomodoroPause"
          @work-resume="handlePomodoroResume"
          @break-start="handlePomodoroBreakStart"
          @stop="handlePomodoroStop"
        />
      </div>
      
      <!-- Ссылки -->
      <ul class="nav__links">
        <li>
          <router-link to="/" class="nav__link" active-class="nav__link--active" exact>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9,22 9,12 15,12 15,22"></polyline>
            </svg>
            Дашборд
          </router-link>
        </li>
        <li>
          <router-link to="/projects" class="nav__link" active-class="nav__link--active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            Проекты
          </router-link>
        </li>
        <li>
          <router-link to="/settings" class="nav__link" active-class="nav__link--active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Настройки
          </router-link>
        </li>
        <li>
          <router-link to="/trash" class="nav__link" active-class="nav__link--active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Корзина
          </router-link>
        </li>
      </ul>
    </nav>
    
    <!-- Основное содержимое -->
    <main class="main">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import MiniPomodoro from './components/timer/MiniPomodoro.vue';
import { useTimer } from './composables/useTimer.js';
import { usePomodoro } from './composables/usePomodoro.js';

const timer = useTimer();
const pomodoro = usePomodoro();

// --- Pomodoro синхронизация ---

function handlePomodoroWorkStart() {
  if (timer.isRunning.value) {
    timer.resumeTicking();
  }
}

function handlePomodoroPause() {
  if (timer.isRunning.value) {
    timer.pauseTicking();
  }
}

function handlePomodoroResume() {
  if (timer.isRunning.value) {
    timer.resumeTicking();
  }
}

function handlePomodoroBreakStart() {
  if (timer.isRunning.value) {
    timer.pauseTicking();
  }
}

// Остановка Pomodoro — останавливаем task timer ТОЛЬКО если они связаны
async function handlePomodoroStop() {
  if (pomodoro.isLinkedToTask.value && timer.isRunning.value) {
    await timer.stop();
  }
}
</script>

<style scoped>
.app {
  display: flex;
  min-height: 100vh;
}

.nav {
  width: 240px;
  background-color: #111827;
  padding: 24px 16px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.nav__header {
  margin-bottom: 32px;
  padding: 0 12px;
}

.nav__logo {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.nav__links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  text-decoration: none;
  color: #9CA3AF;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav__link:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav__link--active {
  background-color: #6366F1;
  color: white;
}

/* Pomodoro под логотипом */
.nav__pomodoro {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.main {
  margin-left: 240px;
  flex: 1;
  background-color: #F9FAFB;
  min-height: 100vh;
}
</style>
