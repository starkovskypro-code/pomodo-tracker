<!--
  BASE BUTTON — Универсальная кнопка
  
  Это базовый компонент кнопки, который используется везде в приложении.
  Имеет три варианта оформления: primary (главная), secondary (второстепенная), danger (опасная).
  
  Использование:
  <BaseButton>Обычная кнопка</BaseButton>
  <BaseButton variant="primary">Главная кнопка</BaseButton>
  <BaseButton variant="danger">Удалить</BaseButton>
  <BaseButton :loading="true">Загрузка...</BaseButton>
-->

<template>
  <!-- 
    :class — динамические классы CSS
    :disabled — отключает кнопку когда loading=true или disabled=true
    @click — вызывает событие при клике (если не отключена)
  -->
  <button
    class="base-button"
    :class="[
      `base-button--${variant}`,
      { 'base-button--loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- Если идёт загрузка, показываем спиннер -->
    <span v-if="loading" class="base-button__spinner"></span>
    
    <!-- slot — место, куда вставляется содержимое кнопки -->
    <span class="base-button__content" :class="{ 'base-button__content--hidden': loading }">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
/**
 * ОБЪЯСНЯЕМ SCRIPT SETUP
 * 
 * В Vue 3 используется <script setup> — это более короткий синтаксис.
 * Всё, что мы объявляем здесь, автоматически доступно в <template>.
 */

// defineProps — объявление входных данных компонента
// Это как "настройки", которые можно передать в компонент
const props = defineProps({
  // Вариант оформления: основной, второстепенный, опасный
  variant: {
    type: String,
    default: 'primary',
    // validator проверяет, что передано допустимое значение
    validator: (value) => ['primary', 'secondary', 'danger'].includes(value)
  },
  // Отключена ли кнопка
  disabled: {
    type: Boolean,
    default: false
  },
  // Показывать ли состояние загрузки
  loading: {
    type: Boolean,
    default: false
  }
});

// defineEmits — объявление событий, которые компонент может отправлять
// 'click' — событие клика, которое родитель может поймать через @click
const emit = defineEmits(['click']);

// Обработчик клика
function handleClick(event) {
  // Если кнопка не отключена, отправляем событие родителю
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
}
</script>

<style scoped>
/**
 * СТИЛИ КОМПОНЕНТА
 * 
 * scoped означает, что эти стили применяются ТОЛЬКО к этому компоненту.
 * Они не повлияют на другие кнопки в приложении.
 */

/* Базовые стили для всех кнопок */
.base-button {
  /* Внутренние отступы: вертикальные 12px, горизонтальные 24px */
  padding: 12px 24px;
  
  /* Убираем стандартную рамку */
  border: none;
  
  /* Скругление углов */
  border-radius: 8px;
  
  /* Размер и жирность шрифта */
  font-size: 14px;
  font-weight: 500;
  
  /* Курсор в виде руки при наведении */
  cursor: pointer;
  
  /* Плавный переход при изменении цветов (hover, active) */
  transition: background-color 0.2s ease, transform 0.1s ease;
  
  /* Flexbox для выравнивания содержимого */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  /* Позиционирование для спиннера */
  position: relative;
}

/* Эффект при наведении */
.base-button:hover:not(:disabled) {
  /* Небольшое смещение вверх */
  transform: translateY(-1px);
}

/* Эффект при нажатии */
.base-button:active:not(:disabled) {
  transform: translateY(0);
}

/* Отключённое состояние */
.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* --- ВАРИАНТЫ ОФОРМЛЕНИЯ --- */

/* PRIMARY — главная кнопка (индиго цвет) */
.base-button--primary {
  background-color: #6366F1;
  color: white;
}

.base-button--primary:hover:not(:disabled) {
  background-color: #4F46E5;
}

/* SECONDARY — второстепенная кнопка (серая) */
.base-button--secondary {
  background-color: #F3F4F6;
  color: #374151;
}

.base-button--secondary:hover:not(:disabled) {
  background-color: #E5E7EB;
}

/* DANGER — опасная кнопка (красная) */
.base-button--danger {
  background-color: #EF4444;
  color: white;
}

.base-button--danger:hover:not(:disabled) {
  background-color: #DC2626;
}

/* --- СОСТОЯНИЕ ЗАГРУЗКИ --- */

/* Спиннер (маленький крутящийся круг) */
.base-button__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  
  /* Анимация вращения */
  animation: spin 0.8s linear infinite;
}

/* Скрываем текст при загрузке, но сохраняем место */
.base-button__content--hidden {
  opacity: 0;
}

/* Анимация вращения спиннера */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
