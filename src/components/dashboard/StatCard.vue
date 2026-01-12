<!--
  STAT CARD — Карточка статистики
  
  Универсальный компонент для отображения одного числового показателя.
  Используется на дашборде для отображения:
  - Общего времени
  - Общего дохода
  - Количества проектов
  - и т.д.
-->

<template>
  <BaseCard>
    <div class="stat-card">
      <!-- Иконка (опционально) -->
      <div v-if="$slots.icon" class="stat-card__icon">
        <slot name="icon"></slot>
      </div>
      
      <!-- Содержимое -->
      <div class="stat-card__content">
        <!-- Подпись -->
        <span class="stat-card__label">{{ label }}</span>
        
        <!-- Значение -->
        <span class="stat-card__value">{{ value }}</span>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from '../base/BaseCard.vue';

defineProps({
  // Подпись (например: "Общее время")
  label: {
    type: String,
    required: true
  },
  // Значение (например: "12 ч 30 мин")
  value: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

/* Иконка */
.stat-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: #EEF2FF;
  color: #6366F1;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  flex-shrink: 0;
}

/* Содержимое */
.stat-card__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Подпись */
.stat-card__label {
  font-size: 13px;
  color: #6B7280;
}

/* Значение */
.stat-card__value {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}
</style>
