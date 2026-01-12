<!--
  PROJECT CARD — Карточка проекта
  
  Отображает информацию о проекте:
  - Название
  - Часовая ставка
  - Общее время работы
  - Общая стоимость
  
  При клике открывает детальную страницу проекта.
-->

<template>
  <BaseCard :clickable="true" @click="goToProject">
    <!-- Цветовая метка слева -->
    <div class="project-card">
      <!-- Цветная полоска слева для визуального отличия проектов -->
      <div class="project-card__color" :style="{ backgroundColor: project.color }"></div>
      
      <!-- Основная информация -->
      <div class="project-card__content">
        <!-- Заголовок и ставка -->
        <div class="project-card__header">
          <h3 class="project-card__title">{{ project.name }}</h3>
          <span class="project-card__rate">{{ formatMoney(project.hourlyRate) }}/час</span>
        </div>
        
        <!-- Статистика: время и стоимость -->
        <div class="project-card__stats">
          <div class="project-card__stat">
            <!-- Иконка часов -->
            <svg class="project-card__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
            <span>{{ formatDuration(totalMinutes) }}</span>
          </div>
          
          <div class="project-card__stat">
            <!-- Иконка денег -->
            <svg class="project-card__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span>{{ formatMoney(totalCost) }}</span>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import BaseCard from '../base/BaseCard.vue';
import { formatDuration } from '../../utils/formatTime.js';
import { formatMoney, calculateCost } from '../../utils/calculations.js';
import { getTasksByProject } from '../../data/taskRepository.js';
import { getTotalTimeByProject } from '../../data/timeEntryRepository.js';

const props = defineProps({
  // Объект проекта с полями: id, name, hourlyRate, color
  project: {
    type: Object,
    required: true
  }
});

const router = useRouter();

// Общее время по проекту (в минутах)
const totalMinutes = ref(0);

// Общая стоимость = время × ставка
const totalCost = computed(() => {
  return calculateCost(totalMinutes.value, props.project.hourlyRate);
});

// Загружаем статистику при монтировании
onMounted(async () => {
  await loadStats();
});

// Также перезагружаем при изменении проекта
watch(() => props.project.id, async () => {
  await loadStats();
});

// Функция загрузки статистики
async function loadStats() {
  try {
    // Получаем все задачи проекта
    const tasks = await getTasksByProject(props.project.id);
    const taskIds = tasks.map(t => t.id);
    
    // Получаем общее время по всем задачам
    totalMinutes.value = await getTotalTimeByProject(taskIds);
  } catch (e) {
    console.error('Ошибка загрузки статистики проекта:', e);
  }
}

// Переход на страницу проекта
function goToProject() {
  router.push({ name: 'project', params: { id: props.project.id } });
}
</script>

<style scoped>
.project-card {
  display: flex;
  gap: 16px;
}

/* Цветная полоска слева */
.project-card__color {
  width: 4px;
  border-radius: 2px;
  /* Минимальная высота для пустых карточек */
  min-height: 60px;
}

/* Содержимое карточки */
.project-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Заголовок и ставка */
.project-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.project-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.project-card__rate {
  font-size: 13px;
  color: #6B7280;
  /* Не даём тексту сжиматься */
  flex-shrink: 0;
}

/* Статистика */
.project-card__stats {
  display: flex;
  gap: 20px;
}

.project-card__stat {
  display: flex;
  align-items: center;
  gap: 6px;
  
  font-size: 14px;
  color: #374151;
}

.project-card__icon {
  color: #9CA3AF;
}
</style>
