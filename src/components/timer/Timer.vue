<!--
  TIMER — Глобальный таймер
  
  Отображает текущий активный таймер.
  Показывает:
  - Название активной задачи
  - Прошедшее время
  - Кнопку остановки
  
  Если таймер не активен — показывает подсказку.
-->

<template>
  <div class="timer" :class="{ 'timer--active': isRunning }">
    <!-- Активный таймер -->
    <div v-if="isRunning" class="timer__content">
      <!-- Информация о задаче -->
      <div class="timer__info">
        <span class="timer__label">Работа над задачей</span>
        <span class="timer__task-name">{{ activeTask?.name || 'Загрузка...' }}</span>
      </div>
      
      <!-- Время и кнопка -->
      <div class="timer__controls">
        <!-- Отображение времени -->
        <div class="timer__time">
          {{ formatTimerDisplay(elapsedSeconds) }}
        </div>
        
        <!-- Кнопка остановки -->
        <button class="timer__stop-btn" @click="handleStop" aria-label="Остановить таймер">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2"></rect>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Неактивный таймер -->
    <div v-else class="timer__content timer__content--inactive">
      <span class="timer__inactive-text">
        Выберите задачу и нажмите ▶ для начала работы
      </span>
    </div>
  </div>
</template>

<script setup>
import { formatTimerDisplay } from '../../utils/formatTime.js';

defineProps({
  // Запущен ли таймер
  isRunning: {
    type: Boolean,
    default: false
  },
  // Информация об активной задаче
  activeTask: {
    type: Object,
    default: null
  },
  // Прошедшие секунды
  elapsedSeconds: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['stop']);

function handleStop() {
  emit('stop');
}
</script>

<style scoped>
.timer {
  /* Светло-серый фон по умолчанию */
  background-color: #F9FAFB;
  border-radius: 12px;
  padding: 16px 20px;
  
  /* Плавный переход цвета */
  transition: background-color 0.3s ease;
}

/* Активный таймер — зеленоватый фон */
.timer--active {
  background-color: #ECFDF5;
  /* Левая зелёная полоска */
  border-left: 4px solid #22C55E;
}

.timer__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* Информация о задаче */
.timer__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timer__label {
  font-size: 12px;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timer__task-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

/* Время и кнопка */
.timer__controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Отображение времени */
.timer__time {
  /* Моноширинный шрифт для стабильной ширины */
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 28px;
  font-weight: 600;
  color: #22C55E;
  
  /* Минимальная ширина для стабильности */
  min-width: 120px;
  text-align: right;
}

/* Кнопка остановки */
.timer__stop-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  
  background-color: #EF4444;
  color: white;
  
  cursor: pointer;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.timer__stop-btn:hover {
  background-color: #DC2626;
  transform: scale(1.05);
}

/* Неактивное состояние */
.timer__content--inactive {
  justify-content: center;
}

.timer__inactive-text {
  font-size: 14px;
  color: #9CA3AF;
}
</style>
