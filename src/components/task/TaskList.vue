<!--
  TASK LIST — Список задач проекта
  
  Отображает все задачи проекта.
  Если задач нет — показывает заглушку.
-->

<template>
  <div class="task-list">
    <!-- Пустое состояние -->
    <div v-if="tasks.length === 0" class="task-list__empty">
      <p>Пока нет задач</p>
      <p class="task-list__empty-hint">Добавьте первую задачу выше</p>
    </div>
    
    <!-- Список задач -->
    <div v-else class="task-list__items">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :hourly-rate="hourlyRate"
        :active-task-id="activeTaskId"
        :is-timer-running="isTimerRunning"
        :elapsed-seconds="elapsedSeconds"
        @start-timer="$emit('start-timer', $event)"
        @stop-timer="$emit('stop-timer')"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @complete="$emit('complete', $event)"
        @restore="$emit('restore', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import TaskCard from './TaskCard.vue';

defineProps({
  // Массив задач
  tasks: {
    type: Array,
    required: true
  },
  // Часовая ставка проекта
  hourlyRate: {
    type: Number,
    default: 0
  },
  // ID активной задачи (где запущен таймер)
  activeTaskId: {
    type: Number,
    default: null
  },
  // Запущен ли таймер
  isTimerRunning: {
    type: Boolean,
    default: false
  },
  // Текущее время таймера в секундах
  elapsedSeconds: {
    type: Number,
    default: 0
  }
});

defineEmits(['start-timer', 'stop-timer', 'edit', 'delete', 'complete', 'restore']);
</script>

<style scoped>
.task-list {
  width: 100%;
}

.task-list__items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Пустое состояние */
.task-list__empty {
  text-align: center;
  padding: 40px 20px;
  color: #9CA3AF;
}

.task-list__empty p {
  margin: 0;
  font-size: 14px;
}

.task-list__empty-hint {
  margin-top: 4px;
  font-size: 13px;
  color: #D1D5DB;
}
</style>
