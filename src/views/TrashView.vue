<!--
  TRASH VIEW — Корзина
  
  Отображает удалённые задачи и проекты.
  Позволяет восстанавливать или перманентно удалять.
-->

<template>
  <div class="trash-view">
    <header class="trash-view__header">
      <div>
        <h1 class="trash-view__title">Корзина</h1>
        <p class="trash-view__subtitle">
          Удалённые задачи и проекты. Можно восстановить или удалить навсегда.
        </p>
      </div>
      
      <!-- Кнопка очистки всей корзины -->
      <button 
        v-if="groupedTasks.length > 0"
        class="trash-view__clear-btn"
        @click="showClearAllDialog = true"
      >
        🗑️ Очистить корзину
      </button>
    </header>

    <!-- Загрузка -->
    <div v-if="isLoading" class="trash-view__loading">
      Загрузка...
    </div>

    <!-- Пустая корзина -->
    <div v-else-if="groupedTasks.length === 0" class="trash-view__empty">
      <div class="trash-view__empty-icon">✨</div>
      <h3>Корзина пуста</h3>
      <p>Нет удалённых элементов</p>
    </div>

    <!-- Список -->
    <div v-else class="trash-view__list">
      <div 
        v-for="group in groupedTasks" 
        :key="group.project.id"
        class="trash-project"
      >
        <!-- Заголовок проекта -->
        <div class="trash-project__header">
          <div class="trash-project__info">
            <div 
              class="trash-project__color" 
              :style="{ backgroundColor: group.project.color }"
            ></div>
            <div>
              <h2 class="trash-project__name">{{ group.project.name }}</h2>
              <span v-if="group.project.deletedAt" class="trash-project__deleted-badge">
                Проект удалён
              </span>
            </div>
          </div>
          
          <div class="trash-project__actions">
            <div class="trash-project__stats">
              <span class="trash-project__time">{{ formatDuration(group.totalSeconds) }}</span>
              <span class="trash-project__cost">{{ formatMoney(group.totalCost) }}</span>
            </div>
            
            <!-- Кнопки для проекта -->
            <div v-if="group.project.deletedAt" class="trash-project__btns">
              <button 
                class="trash-btn trash-btn--restore"
                @click="handleRestoreProject(group.project.id)"
                title="Восстановить проект"
              >
                ↩ Восстановить
              </button>
              <button 
                class="trash-btn trash-btn--delete"
                @click="confirmPermanentDeleteProject(group.project.id)"
                title="Удалить навсегда"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Список задач -->
        <div class="trash-project__tasks">
          <div 
            v-for="task in group.tasks" 
            :key="task.id"
            class="trash-task"
          >
            <div class="trash-task__name">{{ task.name }}</div>
            <div class="trash-task__right">
              <div class="trash-task__meta">
                <span>{{ formatDuration(task.totalSeconds) }}</span>
                <span>{{ formatMoney(task.totalCost) }}</span>
              </div>
              <button 
                class="trash-btn trash-btn--icon"
                @click="handleRestoreTask(task.id)"
                title="Восстановить"
              >
                ↩
              </button>
              <button 
                class="trash-btn trash-btn--icon trash-btn--delete"
                @click="confirmPermanentDeleteTask(task.id)"
                title="Удалить навсегда"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Диалог подтверждения -->
    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Удалить навсегда?"
      message="Это действие нельзя отменить. Все данные будут удалены безвозвратно."
      confirm-text="Удалить навсегда"
      @confirm="executePermanentDelete"
    />
    
    <!-- Диалог очистки корзины -->
    <ConfirmDialog
      v-model="showClearAllDialog"
      title="Очистить корзину?"
      message="Все удалённые проекты и задачи будут удалены НАВСЕГДА. Это действие нельзя отменить."
      confirm-text="Очистить всё"
      @confirm="handleClearAll"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAllDeletedTasks, restoreTask, permanentDeleteTask } from '../data/taskRepository.js';
import { getAllProjects, getDeletedProjects, restoreProject, permanentDeleteProject, clearAllTrash } from '../data/projectRepository.js';
import { getTotalTimeByTask } from '../data/timeEntryRepository.js';
import { calculateCost, formatMoney } from '../utils/calculations.js';
import { formatDuration } from '../utils/formatTime.js';
import ConfirmDialog from '../components/base/ConfirmDialog.vue';

const isLoading = ref(true);
const groupedTasks = ref([]);

// Диалоги
const showDeleteDialog = ref(false);
const showClearAllDialog = ref(false);
const deleteTarget = ref({ type: null, id: null }); // { type: 'task' | 'project', id: number }

onMounted(async () => {
  await loadTrash();
});

async function loadTrash() {
  isLoading.value = true;
  try {
    const activeProjects = await getAllProjects();
    const deletedProjects = await getDeletedProjects();
    const allProjects = [...activeProjects, ...deletedProjects];
    const projectsMap = new Map(allProjects.map(p => [p.id, p]));

    const deletedTasks = await getAllDeletedTasks();

    const tasksWithStats = await Promise.all(deletedTasks.map(async (task) => {
      const totalSeconds = await getTotalTimeByTask(task.id);
      const project = projectsMap.get(task.projectId);
      const hourlyRate = project ? project.hourlyRate : 0;
      
      return {
        ...task,
        totalSeconds,
        totalCost: calculateCost(totalSeconds, hourlyRate),
        project
      };
    }));

    const groups = {};
    
    tasksWithStats.forEach(task => {
      if (!task.project) return;
      
      if (!groups[task.projectId]) {
        groups[task.projectId] = {
          project: task.project,
          tasks: [],
          totalSeconds: 0,
          totalCost: 0
        };
      }
      
      groups[task.projectId].tasks.push(task);
      groups[task.projectId].totalSeconds += task.totalSeconds;
      groups[task.projectId].totalCost += task.totalCost;
    });

    groupedTasks.value = Object.values(groups).sort((a, b) => b.totalCost - a.totalCost);

  } catch (e) {
    console.error('Ошибка загрузки корзины:', e);
  } finally {
    isLoading.value = false;
  }
}

// Восстановление
async function handleRestoreTask(taskId) {
  try {
    await restoreTask(taskId);
    await loadTrash();
  } catch (e) {
    console.error('Ошибка восстановления:', e);
  }
}

async function handleRestoreProject(projectId) {
  try {
    await restoreProject(projectId);
    await loadTrash();
  } catch (e) {
    console.error('Ошибка восстановления:', e);
  }
}

// Перманентное удаление
function confirmPermanentDeleteTask(taskId) {
  deleteTarget.value = { type: 'task', id: taskId };
  showDeleteDialog.value = true;
}

function confirmPermanentDeleteProject(projectId) {
  deleteTarget.value = { type: 'project', id: projectId };
  showDeleteDialog.value = true;
}

async function executePermanentDelete() {
  try {
    if (deleteTarget.value.type === 'task') {
      await permanentDeleteTask(deleteTarget.value.id);
    } else if (deleteTarget.value.type === 'project') {
      await permanentDeleteProject(deleteTarget.value.id);
    }
    await loadTrash();
  } catch (e) {
    console.error('Ошибка удаления:', e);
  } finally {
    deleteTarget.value = { type: null, id: null };
  }
}

// Очистка всей корзины
async function handleClearAll() {
  try {
    await clearAllTrash();
    await loadTrash();
  } catch (e) {
    console.error('Ошибка очистки корзины:', e);
  }
}
</script>

<style scoped>
.trash-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 20px;
}

.trash-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.trash-view__title {
  margin: 0 0 4px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.trash-view__subtitle {
  margin: 0;
  color: #6B7280;
  font-size: 14px;
}

.trash-view__clear-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #FEE2E2;
  color: #EF4444;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.trash-view__clear-btn:hover {
  background: #FECACA;
}

.trash-view__loading,
.trash-view__empty {
  text-align: center;
  padding: 60px 20px;
  color: #6B7280;
}

.trash-view__empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* Проект */
.trash-project {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  overflow: hidden;
}

.trash-project__header {
  padding: 16px 20px;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.trash-project__info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trash-project__color {
  width: 4px;
  height: 32px;
  border-radius: 2px;
}

.trash-project__name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.trash-project__deleted-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  color: #EF4444;
  background: #FEE2E2;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 2px;
}

.trash-project__actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trash-project__stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 13px;
}

.trash-project__time {
  font-weight: 500;
  color: #374151;
  font-family: 'SF Mono', monospace;
}

.trash-project__cost {
  color: #6B7280;
}

.trash-project__btns {
  display: flex;
  gap: 8px;
}

/* Кнопки */
.trash-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.trash-btn--restore {
  background: #ECFDF5;
  color: #059669;
}

.trash-btn--restore:hover {
  background: #D1FAE5;
}

.trash-btn--delete {
  background: #FEE2E2;
  color: #EF4444;
}

.trash-btn--delete:hover {
  background: #FECACA;
}

.trash-btn--icon {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  color: #6B7280;
}

.trash-btn--icon:hover {
  background: #E5E7EB;
}

.trash-btn--icon.trash-btn--delete {
  background: #FEE2E2;
  color: #EF4444;
}

/* Задачи */
.trash-project__tasks {
  padding: 8px 0;
}

.trash-task {
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #F3F4F6;
}

.trash-task:last-child {
  border-bottom: none;
}

.trash-task__name {
  font-size: 14px;
  color: #4B5563;
}

.trash-task__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trash-task__meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #9CA3AF;
}
</style>
