<!--
  PROJECT DETAIL VIEW — Детальная страница проекта
  
  Отображает:
  - Информацию о проекте
  - Таймер
  - Список задач
  - Форму добавления задачи
  - Модальные окна для редактирования
-->

<template>
  <div class="project-detail">
    <!-- Назад к проектам -->
    <router-link to="/projects" class="project-detail__back">
      ← Назад к проектам
    </router-link>
    
    <!-- Загрузка -->
    <div v-if="isLoading" class="project-detail__loading">
      Загрузка проекта...
    </div>
    
    <!-- Проект не найден -->
    <div v-else-if="!project" class="project-detail__not-found">
      <h2>Проект не найден</h2>
      <router-link to="/projects" class="project-detail__link">
        Вернуться к списку проектов
      </router-link>
    </div>
    
    <!-- Содержимое проекта -->
    <template v-else>
      <!-- Заголовок проекта -->
      <header class="project-detail__header">
        <div class="project-detail__info">
          <div 
            class="project-detail__color" 
            :style="{ backgroundColor: project.color }"
          ></div>
          <div>
            <h1 class="project-detail__title">{{ project.name }}</h1>
            <p class="project-detail__rate">
              Ставка: {{ formatMoney(project.hourlyRate) }}/час
            </p>
          </div>
        </div>
        
        <!-- Кнопки управления -->
        <div class="project-detail__actions">
          <BaseButton variant="secondary" @click="openEditModal">
            Редактировать
          </BaseButton>
          <BaseButton variant="danger" @click="handleDeleteProject">
            Удалить
          </BaseButton>
        </div>
      </header>
      
      <!-- Таймер -->
      <section class="project-detail__section">
        <Timer
          :is-running="timer.isRunning.value"
          :active-task="timer.activeTask.value"
          :elapsed-seconds="timer.elapsedSeconds.value"
          @stop="handleStopTimer"
        />
      </section>
      
      <!-- Форма добавления задачи -->
      <section class="project-detail__section">
        <h2 class="project-detail__subtitle">Добавить задачу</h2>
        <TaskForm @submit="handleAddTask" />
      </section>
      
      <!-- Список задач -->
      <section class="project-detail__section">
        <h2 class="project-detail__subtitle">Задачи</h2>
        <TaskList
          :tasks="tasks"
          :hourly-rate="project.hourlyRate"
          :active-task-id="timer.activeTaskId.value"
          :is-timer-running="timer.isRunning.value"
          :elapsed-seconds="timer.elapsedSeconds.value"
          @start-timer="handleStartTimer"
          @stop-timer="handleStopTimer"
          @edit="openTaskEditModal"
          @delete="handleDeleteTask"
          @complete="handleCompleteTask"
          @restore="handleRestoreTask"
        />
      </section>
    </template>
    
    <!-- Модальное окно редактирования проекта -->
    <BaseModal v-model="isEditModalOpen" title="Редактировать проект">
      <ProjectForm
        :project="project"
        @submit="handleEditProject"
        @cancel="isEditModalOpen = false"
      />
    </BaseModal>
    
    <!-- Модальное окно редактирования задачи -->
    <BaseModal v-model="isTaskEditModalOpen" title="Редактировать задачу">
      <TaskEditForm
        v-if="taskToEdit"
        :task="taskToEdit"
        @submit="handleEditTask"
        @cancel="isTaskEditModalOpen = false"
      />
    </BaseModal>
    
    <!-- Диалог подтверждения удаления задачи -->
    <ConfirmDialog
      v-model="isDeleteTaskDialogOpen"
      title="Удалить задачу?"
      message="Задача будет перемещена в корзину. Вы сможете восстановить её позже."
      confirm-text="Удалить"
      @confirm="confirmDeleteTask"
    />
    
    <!-- Диалог подтверждения удаления проекта -->
    <ConfirmDialog
      v-model="isDeleteProjectDialogOpen"
      title="Удалить проект?"
      message="Проект и все его задачи будут перемещены в корзину."
      confirm-text="Удалить проект"
      @confirm="confirmDeleteProject"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '../components/base/BaseButton.vue';
import BaseModal from '../components/base/BaseModal.vue';
import ConfirmDialog from '../components/base/ConfirmDialog.vue';
import Timer from '../components/timer/Timer.vue';
import TaskForm from '../components/task/TaskForm.vue';
import TaskList from '../components/task/TaskList.vue';
import TaskEditForm from '../components/task/TaskEditForm.vue';
import ProjectForm from '../components/project/ProjectForm.vue';
import { useTimer } from '../composables/useTimer.js';
import { useTasks } from '../composables/useTasks.js';
import { formatMoney } from '../utils/calculations.js';
import { getProjectById, updateProject, deleteProject } from '../data/projectRepository.js';
import { deleteTask, updateTask, createTask, toggleTaskComplete } from '../data/taskRepository.js';
import { addManualTimeEntry } from '../data/timeEntryRepository.js';

const route = useRoute();
const router = useRouter();
const timer = useTimer();
const { tasks, loadTasksByProject, addTask } = useTasks();

// Состояние
const project = ref(null);
const isLoading = ref(true);
const isEditModalOpen = ref(false);

// Состояние для редактирования задачи
const isTaskEditModalOpen = ref(false);
const taskToEdit = ref(null);

// Состояние для диалогов подтверждения
const isDeleteTaskDialogOpen = ref(false);
const taskToDeleteId = ref(null);
const isDeleteProjectDialogOpen = ref(false);

// Получаем ID из URL
const projectId = ref(Number(route.params.id));

// Загрузка данных
async function loadData() {
  isLoading.value = true;
  try {
    project.value = await getProjectById(projectId.value);
    if (project.value) {
      await loadTasksByProject(projectId.value);
    }
    await timer.checkActiveTimer();
  } catch (e) {
    console.error('Ошибка загрузки проекта:', e);
  } finally {
    isLoading.value = false;
  }
}

// При монтировании
onMounted(() => {
  loadData();
});

// При изменении ID в URL
watch(() => route.params.id, (newId) => {
  projectId.value = Number(newId);
  loadData();
});

// --- Проект ---

function openEditModal() {
  isEditModalOpen.value = true;
}

async function handleEditProject(data) {
  await updateProject(projectId.value, data);
  project.value = await getProjectById(projectId.value);
  isEditModalOpen.value = false;
}

// --- Задачи ---

async function handleAddTask(taskName) {
  await addTask(projectId.value, taskName);
}

async function handleStartTimer(taskId) {
  await timer.start(taskId);
}

async function handleStopTimer() {
  await timer.stop();
  await loadTasksByProject(projectId.value);
}

// Редактирование задачи
function openTaskEditModal(task) {
  taskToEdit.value = task;
  isTaskEditModalOpen.value = true;
}

async function handleEditTask(data) {
  if (!taskToEdit.value) return;
  
  try {
    await updateTask(taskToEdit.value.id, { name: data.name });
    
    if (data.additionalSeconds > 0) {
      await addManualTimeEntry(taskToEdit.value.id, data.additionalSeconds);
    }
    
    await loadTasksByProject(projectId.value);
    isTaskEditModalOpen.value = false;
    taskToEdit.value = null;
  } catch (e) {
    console.error('Ошибка обновления задачи:', e);
    alert('Ошибка при обновлении задачи');
  }
}

// Удаление задачи — открытие диалога
function handleDeleteTask(taskId) {
  taskToDeleteId.value = taskId;
  isDeleteTaskDialogOpen.value = true;
}

// Подтверждение удаления задачи
async function confirmDeleteTask() {
  if (!taskToDeleteId.value) return;
  try {
    await deleteTask(taskToDeleteId.value);
    await loadTasksByProject(projectId.value);
  } catch (e) {
    console.error('Ошибка удаления задачи:', e);
  } finally {
    taskToDeleteId.value = null;
  }
}

// Удаление проекта — открытие диалога
function handleDeleteProject() {
  isDeleteProjectDialogOpen.value = true;
}

// Подтверждение удаления проекта
async function confirmDeleteProject() {
  try {
    await deleteProject(projectId.value);
    router.push('/projects');
  } catch (e) {
    console.error('Ошибка удаления проекта:', e);
  }
}

// Завершение задачи
async function handleCompleteTask(taskId) {
  try {
    await toggleTaskComplete(taskId, true);
    await loadTasksByProject(projectId.value);
  } catch (e) {
    console.error('Ошибка завершения задачи:', e);
  }
}

// Восстановление задачи (создаёт новую с маркером)
async function handleRestoreTask(task) {
  try {
    // Создаём новую задачу с маркером восстановления
    await createTask({
      projectId: projectId.value,
      name: task.name,
      isRestored: true
    });
    await loadTasksByProject(projectId.value);
  } catch (e) {
    console.error('Ошибка восстановления задачи:', e);
  }
}
</script>

<style scoped>
.project-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 20px;
}

.project-detail__back,
.project-detail__link {
  display: inline-block;
  margin-bottom: 24px;
  font-size: 14px;
  color: #6366F1;
  text-decoration: none;
}

.project-detail__back:hover,
.project-detail__link:hover {
  text-decoration: underline;
}

.project-detail__loading,
.project-detail__not-found {
  text-align: center;
  padding: 60px 20px;
  color: #6B7280;
}

.project-detail__not-found h2 {
  margin: 0 0 16px;
  color: #374151;
}

.project-detail__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.project-detail__info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.project-detail__color {
  width: 8px;
  height: 48px;
  border-radius: 4px;
  flex-shrink: 0;
}

.project-detail__title {
  margin: 0 0 4px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.project-detail__rate {
  margin: 0;
  font-size: 14px;
  color: #6B7280;
}

.project-detail__actions {
  display: flex;
  gap: 12px;
}

.project-detail__section {
  margin-bottom: 32px;
}

.project-detail__subtitle {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}
</style>
