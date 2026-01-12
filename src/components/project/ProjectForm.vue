<!--
  PROJECT FORM — Форма создания/редактирования проекта
  
  Содержит поля:
  - Название проекта
  - Часовая ставка
  - Цвет проекта
  
  Может работать в двух режимах:
  - Создание нового проекта (project не передан)
  - Редактирование существующего (project передан)
-->

<template>
  <form class="project-form" @submit.prevent="handleSubmit">
    <!-- Поле названия проекта -->
    <BaseInput
      v-model="form.name"
      label="Название проекта"
      placeholder="Например: Редизайн сайта"
      :error="errors.name"
    />
    
    <!-- Поле часовой ставки -->
    <BaseInput
      v-model="form.hourlyRate"
      label="Часовая ставка"
      type="number"
      placeholder="2000"
      suffix="₽/час"
      :error="errors.hourlyRate"
    />
    
    <!-- Выбор цвета -->
    <div class="project-form__color-field">
      <label class="project-form__label">Цвет проекта</label>
      <div class="project-form__colors">
        <!-- 
          Предустановленные цвета для выбора
          :class — добавляет active класс для выбранного цвета
        -->
        <button
          v-for="color in availableColors"
          :key="color"
          type="button"
          class="project-form__color-btn"
          :class="{ 'project-form__color-btn--active': form.color === color }"
          :style="{ backgroundColor: color }"
          @click="form.color = color"
          :aria-label="`Выбрать цвет ${color}`"
        >
          <!-- Галочка для выбранного цвета -->
          <svg v-if="form.color === color" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Кнопки формы -->
    <div class="project-form__actions">
      <BaseButton variant="secondary" type="button" @click="handleCancel">
        Отмена
      </BaseButton>
      <BaseButton variant="primary" type="submit" :loading="isSubmitting">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import BaseInput from '../base/BaseInput.vue';
import BaseButton from '../base/BaseButton.vue';

const props = defineProps({
  // Проект для редактирования (опционально)
  project: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['submit', 'cancel']);

// Предустановленные цвета для выбора
const availableColors = [
  '#6366F1', // Индиго
  '#8B5CF6', // Фиолетовый
  '#EC4899', // Розовый
  '#EF4444', // Красный
  '#F97316', // Оранжевый
  '#EAB308', // Жёлтый
  '#22C55E', // Зелёный
  '#14B8A6', // Бирюзовый
  '#0EA5E9', // Синий
  '#6B7280', // Серый
];

// Данные формы
const form = reactive({
  name: '',
  hourlyRate: '',
  color: availableColors[0]
});

// Ошибки валидации
const errors = reactive({
  name: '',
  hourlyRate: ''
});

// Состояние отправки
const isSubmitting = ref(false);

// Текст кнопки зависит от режима
const submitLabel = computed(() => {
  return props.project ? 'Сохранить' : 'Создать проект';
});

// Если передан проект — заполняем форму его данными
watch(() => props.project, (newProject) => {
  if (newProject) {
    form.name = newProject.name || '';
    form.hourlyRate = newProject.hourlyRate?.toString() || '';
    form.color = newProject.color || availableColors[0];
  }
}, { immediate: true });

// Валидация формы
function validate() {
  let isValid = true;
  
  // Очищаем предыдущие ошибки
  errors.name = '';
  errors.hourlyRate = '';
  
  // Проверка названия
  if (!form.name.trim()) {
    errors.name = 'Укажите название проекта';
    isValid = false;
  }
  
  // Проверка ставки
  const rate = Number(form.hourlyRate);
  if (form.hourlyRate && (isNaN(rate) || rate < 0)) {
    errors.hourlyRate = 'Укажите корректную ставку';
    isValid = false;
  }
  
  return isValid;
}

// Обработка отправки
async function handleSubmit() {
  if (!validate()) return;
  
  isSubmitting.value = true;
  
  // Формируем данные для отправки
  const projectData = {
    name: form.name.trim(),
    hourlyRate: Number(form.hourlyRate) || 0,
    color: form.color
  };
  
  // Отправляем событие родителю
  emit('submit', projectData);
  
  isSubmitting.value = false;
}

// Обработка отмены
function handleCancel() {
  emit('cancel');
}
</script>

<style scoped>
.project-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Поле выбора цвета */
.project-form__color-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-form__label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.project-form__colors {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Кнопка выбора цвета */
.project-form__color-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  
  /* Центрирование галочки */
  display: flex;
  align-items: center;
  justify-content: center;
  
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.project-form__color-btn:hover {
  transform: scale(1.1);
}

/* Выбранный цвет */
.project-form__color-btn--active {
  border-color: white;
  /* Тень для контраста */
  box-shadow: 0 0 0 2px #374151;
}

/* Кнопки действий */
.project-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
</style>
