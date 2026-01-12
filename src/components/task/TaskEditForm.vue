<!--
  TASK EDIT FORM — Форма редактирования задачи
  
  Позволяет:
  - Изменить название задачи
  - Вручную добавить время (если забыли включить таймер)
-->

<template>
  <form class="task-edit-form" @submit.prevent="handleSubmit">
    <!-- Название задачи -->
    <BaseInput
      v-model="form.name"
      label="Название задачи"
      placeholder="Название..."
      :error="errors.name"
    />
    
    <!-- Добавить время вручную -->
    <div class="task-edit-form__time-section">
      <label class="task-edit-form__label">Добавить время вручную</label>
      <p class="task-edit-form__hint">
        Укажите часы, минуты и секунды, которые нужно добавить
      </p>
      
      <div class="task-edit-form__time-inputs">
        <div class="task-edit-form__time-field">
          <input
            v-model="addTime.hours"
            type="number"
            min="0"
            placeholder="0"
            class="task-edit-form__time-input"
          />
          <span class="task-edit-form__time-suffix">ч</span>
        </div>
        <div class="task-edit-form__time-field">
          <input
            v-model="addTime.minutes"
            type="number"
            min="0"
            max="59"
            placeholder="0"
            class="task-edit-form__time-input"
          />
          <span class="task-edit-form__time-suffix">мин</span>
        </div>
        <div class="task-edit-form__time-field">
          <input
            v-model="addTime.seconds"
            type="number"
            min="0"
            max="59"
            placeholder="0"
            class="task-edit-form__time-input"
          />
          <span class="task-edit-form__time-suffix">сек</span>
        </div>
      </div>
    </div>
    
    <!-- Кнопки -->
    <div class="task-edit-form__actions">
      <BaseButton variant="secondary" type="button" @click="$emit('cancel')">
        Отмена
      </BaseButton>
      <BaseButton variant="primary" type="submit" :loading="isSubmitting">
        Сохранить
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import BaseInput from '../base/BaseInput.vue';
import BaseButton from '../base/BaseButton.vue';

const props = defineProps({
  // Задача для редактирования
  task: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['submit', 'cancel']);

// Данные формы
const form = reactive({
  name: ''
});

// Время для добавления
const addTime = reactive({
  hours: '',
  minutes: '',
  seconds: ''
});

// Ошибки
const errors = reactive({
  name: ''
});

const isSubmitting = ref(false);

// Заполняем форму данными задачи
watch(() => props.task, (newTask) => {
  if (newTask) {
    form.name = newTask.name || '';
  }
}, { immediate: true });

// Валидация
function validate() {
  let isValid = true;
  errors.name = '';
  
  if (!form.name.trim()) {
    errors.name = 'Укажите название задачи';
    isValid = false;
  }
  
  return isValid;
}

// Вычисляем добавляемые секунды
function getAdditionalSeconds() {
  const hours = parseInt(addTime.hours) || 0;
  const minutes = parseInt(addTime.minutes) || 0;
  const seconds = parseInt(addTime.seconds) || 0;
  
  return (hours * 3600) + (minutes * 60) + seconds;
}

// Отправка формы
async function handleSubmit() {
  if (!validate()) return;
  
  isSubmitting.value = true;
  
  emit('submit', {
    name: form.name.trim(),
    additionalSeconds: getAdditionalSeconds()
  });
  
  isSubmitting.value = false;
}
</script>

<style scoped>
.task-edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Секция добавления времени */
.task-edit-form__time-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-edit-form__label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.task-edit-form__hint {
  font-size: 12px;
  color: #9CA3AF;
  margin: 0;
}

.task-edit-form__time-inputs {
  display: flex;
  gap: 8px;
}

.task-edit-form__time-field {
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-edit-form__time-input {
  width: 60px;
  padding: 8px 10px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  color: #111827;
}

.task-edit-form__time-input:focus {
  outline: none;
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.task-edit-form__time-input::placeholder {
  color: #9CA3AF;
}

/* Убираем стрелки в number input */
.task-edit-form__time-input::-webkit-outer-spin-button,
.task-edit-form__time-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.task-edit-form__time-input[type=number] {
  -moz-appearance: textfield;
}

.task-edit-form__time-suffix {
  font-size: 13px;
  color: #6B7280;
}

/* Кнопки */
.task-edit-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
</style>
