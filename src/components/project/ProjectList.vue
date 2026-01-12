<!--
  PROJECT LIST — Список проектов
  
  Отображает все проекты пользователя в виде списка карточек.
  Если проектов нет — показывает заглушку с призывом создать первый.
-->

<template>
  <div class="project-list">
    <!-- Состояние загрузки -->
    <div v-if="isLoading" class="project-list__loading">
      Загрузка проектов...
    </div>
    
    <!-- Пустое состояние (нет проектов) -->
    <div v-else-if="projects.length === 0" class="project-list__empty">
      <div class="project-list__empty-icon">
        <!-- Иконка папки -->
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <h3 class="project-list__empty-title">Нет проектов</h3>
      <p class="project-list__empty-text">
        Создайте первый проект, чтобы начать отслеживать время
      </p>
      <BaseButton variant="primary" @click="$emit('create')">
        Создать проект
      </BaseButton>
    </div>
    
    <!-- Список проектов -->
    <div v-else class="project-list__grid">
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
      />
    </div>
  </div>
</template>

<script setup>
import ProjectCard from './ProjectCard.vue';
import BaseButton from '../base/BaseButton.vue';

defineProps({
  // Массив проектов для отображения
  projects: {
    type: Array,
    required: true
  },
  // Флаг загрузки
  isLoading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['create']);
</script>

<style scoped>
.project-list {
  /* Занимает всю доступную ширину */
  width: 100%;
}

/* Сетка карточек */
.project-list__grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Состояние загрузки */
.project-list__loading {
  text-align: center;
  padding: 40px;
  color: #6B7280;
  font-size: 14px;
}

/* Пустое состояние */
.project-list__empty {
  /* Центрирование содержимого */
  display: flex;
  flex-direction: column;
  align-items: center;
  
  /* Отступы */
  padding: 60px 20px;
  
  /* Текст по центру */
  text-align: center;
}

.project-list__empty-icon {
  color: #D1D5DB;
  margin-bottom: 16px;
}

.project-list__empty-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.project-list__empty-text {
  margin: 0 0 24px;
  font-size: 14px;
  color: #6B7280;
  max-width: 280px;
}
</style>
