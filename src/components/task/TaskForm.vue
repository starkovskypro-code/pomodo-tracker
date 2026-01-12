<!--
  TASK FORM — Форма создания задачи
  
  Простая форма с одним полем — названием задачи.
  Можно отправить нажатием Enter или кнопкой.
-->

<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <!-- Поле ввода и кнопка в одну строку -->
    <div class="task-form__row">
      <BaseInput
        v-model="taskName"
        placeholder="Новая задача..."
        :error="error"
      />
      <BaseButton variant="primary" type="submit" :disabled="!taskName.trim()">
        Добавить
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import BaseInput from '../base/BaseInput.vue';
import BaseButton from '../base/BaseButton.vue';

const emit = defineEmits(['submit']);

// Название задачи
const taskName = ref('');

// Ошибка валидации
const error = ref('');

// Обработчик отправки
function handleSubmit() {
  // Очищаем ошибку
  error.value = '';
  
  // Проверяем, что название не пустое
  const name = taskName.value.trim();
  if (!name) {
    error.value = 'Введите название задачи';
    return;
  }
  
  // Отправляем событие родителю
  emit('submit', name);
  
  // Очищаем поле
  taskName.value = '';
}
</script>

<style scoped>
.task-form {
  width: 100%;
}

.task-form__row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

/* Поле ввода занимает всё доступное пространство */
.task-form__row > :first-child {
  flex: 1;
}
</style>
