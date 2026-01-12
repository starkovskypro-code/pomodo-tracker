<!--
  TIME ENTRY LIST — Список записей времени
  
  Отображает историю работы над задачей:
  - Дата
  - Время начала и окончания
  - Длительность
-->

<template>
  <div class="time-entry-list">
    <h4 class="time-entry-list__title">История работы</h4>
    
    <!-- Пустое состояние -->
    <div v-if="entries.length === 0" class="time-entry-list__empty">
      Записей пока нет
    </div>
    
    <!-- Список записей -->
    <div v-else class="time-entry-list__items">
      <div 
        v-for="entry in sortedEntries" 
        :key="entry.id" 
        class="time-entry"
      >
        <!-- Дата -->
        <span class="time-entry__date">{{ formatDate(entry.startTime) }}</span>
        
        <!-- Время: начало - окончание -->
        <span class="time-entry__time">
          {{ formatTime(entry.startTime) }} — {{ formatTime(entry.endTime) }}
        </span>
        
        <!-- Длительность -->
        <span class="time-entry__duration">{{ formatDuration(entry.duration) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatTime, formatDate, formatDuration } from '../../utils/formatTime.js';

const props = defineProps({
  // Массив записей времени
  entries: {
    type: Array,
    required: true
  }
});

// Сортируем записи по дате (новые сверху)
const sortedEntries = computed(() => {
  return [...props.entries]
    .filter(e => e.endTime) // Только завершённые записи
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
});
</script>

<style scoped>
.time-entry-list {
  width: 100%;
}

.time-entry-list__title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.time-entry-list__empty {
  font-size: 13px;
  color: #9CA3AF;
  text-align: center;
  padding: 20px;
}

.time-entry-list__items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Одна запись */
.time-entry {
  display: flex;
  align-items: center;
  gap: 16px;
  
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  
  font-size: 13px;
}

.time-entry__date {
  color: #6B7280;
  min-width: 100px;
}

.time-entry__time {
  color: #374151;
  flex: 1;
}

.time-entry__duration {
  font-weight: 500;
  color: #111827;
}
</style>
