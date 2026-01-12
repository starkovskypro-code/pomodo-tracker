<!--
  TASK CARD — Карточка задачи
  
  Отображает информацию о задаче:
  - Название
  - Время работы (в реальном времени для активной задачи)
  - Стоимость (обновляется каждые 10 секунд)
  - Кебаб-меню с действиями
  - Кнопка запуска таймера
-->

<template>
  <div class="task-card" :class="{ 'task-card--completed': task.completed, 'task-card--active': isActiveTask }">
    <!-- Левая часть: название -->
    <div class="task-card__left">
      <!-- Маркер восстановленной задачи -->
      <span v-if="task.isRestored" class="task-card__restored-badge" title="Восстановленная задача">
        ↩
      </span>
      
      <!-- Название задачи -->
      <span class="task-card__name">
        {{ task.name }}
      </span>
    </div>
    
    <!-- Правая часть: статистика, меню и таймер -->
    <div class="task-card__right">
      <!-- Время и стоимость -->
      <div class="task-card__stats">
        <!-- Для активной задачи показываем реальное время -->
        <span class="task-card__time" :class="{ 'task-card__time--active': isActiveTask }">
          {{ formatDuration(displaySeconds) }}
        </span>
        <span class="task-card__cost">{{ formatMoney(displayCost) }}</span>
      </div>
      
      <!-- Кебаб-меню -->
      <div class="task-card__menu-wrapper">
        <button
          class="task-card__menu-btn"
          @click="toggleMenu"
          aria-label="Меню действий"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2"></circle>
            <circle cx="12" cy="12" r="2"></circle>
            <circle cx="12" cy="19" r="2"></circle>
          </svg>
        </button>
        
        <!-- Выпадающее меню -->
        <div v-if="isMenuOpen" class="task-card__dropdown">
          <!-- Редактировать -->
          <button class="task-card__dropdown-item" @click="handleEdit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Редактировать
          </button>
          
          <!-- Завершить / Восстановить -->
          <button 
            v-if="!task.completed" 
            class="task-card__dropdown-item"
            @click="handleComplete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            Завершить
          </button>
          
          <button 
            v-else 
            class="task-card__dropdown-item"
            @click="handleRestore"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1,4 1,10 7,10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            Восстановить
          </button>
          
          <!-- Удалить -->
          <button class="task-card__dropdown-item task-card__dropdown-item--danger" @click="handleDelete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Удалить
          </button>
        </div>
      </div>
      
      <!-- Кнопка таймера (только для незавершённых) -->
      <button
        v-if="!task.completed"
        class="task-card__timer-btn"
        :class="{ 'task-card__timer-btn--active': isActiveTask }"
        @click="handleTimerClick"
        :aria-label="isActiveTask ? 'Остановить таймер' : 'Запустить таймер'"
        :disabled="isTimerRunning && !isActiveTask"
      >
        <svg v-if="isActiveTask" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2"></rect>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21"></polygon>
        </svg>
      </button>
    </div>
    
    <!-- Overlay для закрытия меню при клике снаружи -->
    <div v-if="isMenuOpen" class="task-card__overlay" @click="closeMenu"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { formatDuration } from '../../utils/formatTime.js';
import { formatMoney, calculateCost } from '../../utils/calculations.js';
import { getTotalTimeByTask } from '../../data/timeEntryRepository.js';

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  hourlyRate: {
    type: Number,
    default: 0
  },
  activeTaskId: {
    type: Number,
    default: null
  },
  isTimerRunning: {
    type: Boolean,
    default: false
  },
  // Текущее время таймера в секундах (передаётся для активной задачи)
  elapsedSeconds: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['start-timer', 'stop-timer', 'edit', 'delete', 'complete', 'restore']);

// Состояние меню
const isMenuOpen = ref(false);

// Сохранённое время по задаче (в секундах)
const savedSeconds = ref(0);

// Эта ли задача сейчас активна?
const isActiveTask = computed(() => {
  return props.activeTaskId === props.task.id;
});

// Отображаемые секунды: для активной задачи = сохранённое + текущее
const displaySeconds = computed(() => {
  if (isActiveTask.value && props.isTimerRunning) {
    return savedSeconds.value + props.elapsedSeconds;
  }
  return savedSeconds.value;
});

// Отображаемая стоимость
const displayCost = computed(() => {
  return calculateCost(displaySeconds.value, props.hourlyRate);
});

// Загружаем время при монтировании
onMounted(async () => {
  await loadTime();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Перезагружаем при изменении задачи
watch(() => props.task.id, async () => {
  await loadTime();
});

// Перезагружаем время когда таймер останавливается
watch(() => props.isTimerRunning, async (newValue, oldValue) => {
  if (oldValue === true && newValue === false) {
    await loadTime();
  }
});

watch(() => props.activeTaskId, async (newId, oldId) => {
  if (oldId === props.task.id && newId !== props.task.id) {
    await loadTime();
  }
});

async function loadTime() {
  try {
    savedSeconds.value = await getTotalTimeByTask(props.task.id);
  } catch (e) {
    console.error('Ошибка загрузки времени задачи:', e);
  }
}

// Меню
function toggleMenu(e) {
  e.stopPropagation();
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}

function handleClickOutside(e) {
  if (isMenuOpen.value) {
    closeMenu();
  }
}

// Обработчики действий
function handleTimerClick() {
  if (isActiveTask.value) {
    emit('stop-timer');
  } else {
    emit('start-timer', props.task.id);
  }
}

function handleEdit() {
  closeMenu();
  emit('edit', props.task);
}

function handleComplete() {
  closeMenu();
  emit('complete', props.task.id);
}

function handleRestore() {
  closeMenu();
  emit('restore', props.task);
}

function handleDelete() {
  closeMenu();
  emit('delete', props.task.id);
}

defineExpose({ loadTime });
</script>

<style scoped>
.task-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  
  transition: all 0.2s ease;
}

/* Активная задача (таймер запущен) */
.task-card--active {
  background: #ECFDF5;
  border-left: 4px solid #22C55E;
}

/* Завершённая задача */
.task-card--completed {
  background: #F3F4F6;
  opacity: 0.7;
}

.task-card--completed .task-card__name {
  color: #9CA3AF;
  text-decoration: line-through;
}

.task-card--completed .task-card__time,
.task-card--completed .task-card__cost {
  color: #9CA3AF;
}

/* Левая часть */
.task-card__left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.task-card__restored-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: #DBEAFE;
  color: #3B82F6;
  font-size: 12px;
  flex-shrink: 0;
}

.task-card__name {
  font-size: 15px;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Правая часть */
.task-card__right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* Статистика */
.task-card__stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.task-card__time {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  font-family: 'SF Mono', 'Consolas', monospace;
}

/* Активное время — зелёный цвет */
.task-card__time--active {
  color: #22C55E;
}

.task-card__cost {
  font-size: 12px;
  color: #6B7280;
}

/* Кебаб-меню */
.task-card__menu-wrapper {
  position: relative;
}

.task-card__menu-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #9CA3AF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.task-card__menu-btn:hover {
  background: #F3F4F6;
  color: #374151;
}

/* Выпадающее меню */
.task-card__dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  
  min-width: 160px;
  padding: 4px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.task-card__dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: none;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
}

.task-card__dropdown-item:hover {
  background: #F3F4F6;
}

.task-card__dropdown-item--danger {
  color: #EF4444;
}

.task-card__dropdown-item--danger:hover {
  background: #FEE2E2;
}

/* Кнопка таймера */
.task-card__timer-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #22C55E;
  color: white;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.task-card__timer-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.task-card__timer-btn--active {
  background-color: #EF4444;
}

.task-card__timer-btn:disabled {
  background-color: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
}

/* Overlay для закрытия меню */
.task-card__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
}
</style>
