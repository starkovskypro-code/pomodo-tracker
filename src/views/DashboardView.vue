<!--
  DASHBOARD VIEW — Главная страница (Дашборд)
  
  Отображает:
  - Глобальный таймер
  - Общую статистику
  - Последние проекты
  
  Примечание: Pomodoro перенесён в боковую панель (App.vue)
-->

<template>
  <div class="dashboard">
    <!-- Заголовок -->
    <header class="dashboard__header">
      <h1 class="dashboard__title">Дашборд</h1>
    </header>
    
    <!-- Глобальный таймер -->
    <section class="dashboard__section">
      <Timer
        :is-running="timer.isRunning.value"
        :active-task="timer.activeTask.value"
        :elapsed-seconds="timer.elapsedSeconds.value"
        :is-paused="timer.isPaused.value"
        @stop="handleStopTimer"
      />
    </section>
    
    <!-- Статистика -->
    <section class="dashboard__section">
      <h2 class="dashboard__subtitle">Статистика</h2>
      <ProjectStats :refresh-trigger="refreshTrigger" />
    </section>
    
    <!-- Последние проекты -->
    <section class="dashboard__section">
      <div class="dashboard__section-header">
        <h2 class="dashboard__subtitle">Проекты</h2>
        <router-link to="/projects" class="dashboard__link">
          Все проекты →
        </router-link>
      </div>
      
      <div v-if="isLoading" class="dashboard__loading">
        Загрузка...
      </div>
      
      <div v-else-if="recentProjects.length === 0" class="dashboard__empty">
        <p>У вас пока нет проектов</p>
        <router-link to="/projects" class="dashboard__link">
          Создать первый проект
        </router-link>
      </div>
      
      <div v-else class="dashboard__projects">
        <ProjectCard
          v-for="project in recentProjects"
          :key="project.id"
          :project="project"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Timer from '../components/timer/Timer.vue';
import ProjectStats from '../components/dashboard/ProjectStats.vue';
import ProjectCard from '../components/project/ProjectCard.vue';
import { useTimer } from '../composables/useTimer.js';
import { useProjects } from '../composables/useProjects.js';

const timer = useTimer();
const { projects, isLoading, loadProjects } = useProjects();

const refreshTrigger = ref(0);

const recentProjects = computed(() => {
  return [...projects.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);
});

onMounted(async () => {
  await timer.checkActiveTimer();
  await loadProjects();
});

async function handleStopTimer() {
  await timer.stop();
  refreshTrigger.value++;
}
</script>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 20px;
}

.dashboard__header {
  margin-bottom: 32px;
}

.dashboard__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.dashboard__section {
  margin-bottom: 32px;
}

.dashboard__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.dashboard__subtitle {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.dashboard__section-header .dashboard__subtitle {
  margin-bottom: 0;
}

.dashboard__link {
  font-size: 14px;
  color: #6366F1;
  text-decoration: none;
}

.dashboard__link:hover {
  text-decoration: underline;
}

.dashboard__loading,
.dashboard__empty {
  text-align: center;
  padding: 20px;
  color: #6B7280;
  font-size: 14px;
}

.dashboard__projects {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
