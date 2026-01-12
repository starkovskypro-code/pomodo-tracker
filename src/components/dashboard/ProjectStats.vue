<!--
  PROJECT STATS — Статистика по проектам
  
  Отображает общую статистику по всем проектам:
  - Количество проектов
  - Общее время
  - Общий доход
-->

<template>
  <div class="project-stats">
    <!-- Количество проектов -->
    <StatCard label="Проектов" :value="String(projectCount)">
      <template #icon>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      </template>
    </StatCard>
    
    <!-- Общее время -->
    <StatCard label="Общее время" :value="formattedTotalTime">
      <template #icon>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12,6 12,12 16,14"></polyline>
        </svg>
      </template>
    </StatCard>
    
    <!-- Общий доход -->
    <StatCard label="Общий доход" :value="formattedTotalIncome">
      <template #icon>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      </template>
    </StatCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import StatCard from './StatCard.vue';
import { formatDuration } from '../../utils/formatTime.js';
import { formatMoney, calculateCost } from '../../utils/calculations.js';
import { getAllProjects } from '../../data/projectRepository.js';
import { getAllTasks } from '../../data/taskRepository.js';
import { getAllTimeEntries } from '../../data/timeEntryRepository.js';

const props = defineProps({
  // Триггер для обновления статистики
  refreshTrigger: {
    type: Number,
    default: 0
  }
});

// Данные
const projects = ref([]);
const tasks = ref([]);
const timeEntries = ref([]);

// Количество проектов
const projectCount = computed(() => projects.value.length);

// Общее время (в минутах)
const totalMinutes = computed(() => {
  return timeEntries.value.reduce((sum, entry) => sum + (entry.duration || 0), 0);
});

// Отформатированное время
const formattedTotalTime = computed(() => {
  return formatDuration(totalMinutes.value);
});

// Общий доход
const totalIncome = computed(() => {
  // Считаем доход по каждому проекту
  let total = 0;
  
  for (const project of projects.value) {
    // Находим задачи проекта
    const projectTasks = tasks.value.filter(t => t.projectId === project.id);
    const taskIds = projectTasks.map(t => t.id);
    
    // Находим записи времени для этих задач
    const projectEntries = timeEntries.value.filter(e => taskIds.includes(e.taskId));
    const projectMinutes = projectEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
    
    // Считаем стоимость
    total += calculateCost(projectMinutes, project.hourlyRate);
  }
  
  return total;
});

// Отформатированный доход
const formattedTotalIncome = computed(() => {
  return formatMoney(totalIncome.value);
});

// Загрузка данных
async function loadData() {
  try {
    projects.value = await getAllProjects();
    tasks.value = await getAllTasks();
    timeEntries.value = await getAllTimeEntries();
  } catch (e) {
    console.error('Ошибка загрузки статистики:', e);
  }
}

// Загружаем при монтировании
onMounted(() => {
  loadData();
});

// Перезагружаем при изменении триггера
watch(() => props.refreshTrigger, () => {
  loadData();
});
</script>

<style scoped>
.project-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

/* Каждая карточка занимает равное пространство */
.project-stats > * {
  flex: 1;
  min-width: 200px;
}
</style>
