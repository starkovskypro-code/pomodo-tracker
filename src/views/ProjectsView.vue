<!--
  PROJECTS VIEW — Страница списка проектов
  
  Отображает все проекты пользователя.
  Позволяет создавать новые проекты.
-->

<template>
  <div class="projects-view">
    <!-- Заголовок и кнопка создания -->
    <header class="projects-view__header">
      <h1 class="projects-view__title">Проекты</h1>
      <BaseButton variant="primary" @click="openCreateModal">
        + Новый проект
      </BaseButton>
    </header>
    
    <!-- Список проектов -->
    <ProjectList
      :projects="projects"
      :is-loading="isLoading"
      @create="openCreateModal"
    />
    
    <!-- Модальное окно создания проекта -->
    <BaseModal v-model="isModalOpen" title="Новый проект">
      <ProjectForm
        @submit="handleCreateProject"
        @cancel="closeModal"
      />
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseButton from '../components/base/BaseButton.vue';
import BaseModal from '../components/base/BaseModal.vue';
import ProjectList from '../components/project/ProjectList.vue';
import ProjectForm from '../components/project/ProjectForm.vue';
import { useProjects } from '../composables/useProjects.js';

// Используем composable для работы с проектами
const { projects, isLoading, loadProjects, addProject } = useProjects();

// Состояние модального окна
const isModalOpen = ref(false);

// При монтировании загружаем проекты
onMounted(async () => {
  await loadProjects();
});

// Открыть модальное окно
function openCreateModal() {
  isModalOpen.value = true;
}

// Закрыть модальное окно
function closeModal() {
  isModalOpen.value = false;
}

// Создать проект
async function handleCreateProject(projectData) {
  await addProject(projectData);
  closeModal();
}
</script>

<style scoped>
.projects-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 20px;
}

.projects-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.projects-view__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}
</style>
