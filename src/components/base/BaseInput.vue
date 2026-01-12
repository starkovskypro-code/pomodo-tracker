<!--
  BASE INPUT — Универсальное поле ввода
  
  Поле ввода с label (подписью) и возможностью отображения ошибки.
  Поддерживает v-model для двустороннего связывания.
  
  Использование:
  <BaseInput
    v-model="projectName"
    label="Название проекта"
    placeholder="Введите название..."
  />
  
  <BaseInput
    v-model="rate"
    label="Часовая ставка"
    type="number"
    suffix="₽/час"
  />
-->

<template>
  <div class="base-input">
    <!-- 
      Label (подпись) над полем ввода
      v-if — показываем только если label передан
    -->
    <label v-if="label" class="base-input__label" :for="inputId">
      {{ label }}
    </label>
    
    <!-- Обёртка для поля и суффикса -->
    <div class="base-input__wrapper" :class="{ 'base-input__wrapper--error': error }">
      <!-- 
        Само поле ввода
        :id — связь с label через for
        :type — тип поля (text, number, email и т.д.)
        :value — текущее значение
        @input — событие при вводе (обновляет v-model)
        :placeholder — подсказка когда поле пустое
      -->
      <input
        :id="inputId"
        class="base-input__field"
        :type="type"
        :value="modelValue"
        @input="updateValue"
        :placeholder="placeholder"
        :disabled="disabled"
      />
      
      <!-- Суффикс справа от поля (например, "₽/час") -->
      <span v-if="suffix" class="base-input__suffix">
        {{ suffix }}
      </span>
    </div>
    
    <!-- Сообщение об ошибке -->
    <p v-if="error" class="base-input__error">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
/**
 * ОБЪЯСНЯЕМ V-MODEL
 * 
 * v-model — это сокращение для двустороннего связывания:
 * - modelValue — входное значение (от родителя к компоненту)
 * - update:modelValue — событие для обновления значения (от компонента к родителю)
 * 
 * Когда используешь <BaseInput v-model="name" />,
 * Vue автоматически передаёт name в modelValue
 * и обновляет name при событии update:modelValue
 */

const props = defineProps({
  // Значение поля (связь с v-model)
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // Подпись над полем
  label: {
    type: String,
    default: ''
  },
  // Тип поля ввода
  type: {
    type: String,
    default: 'text'
  },
  // Подсказка внутри пустого поля
  placeholder: {
    type: String,
    default: ''
  },
  // Текст справа от поля
  suffix: {
    type: String,
    default: ''
  },
  // Сообщение об ошибке
  error: {
    type: String,
    default: ''
  },
  // Отключено ли поле
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

// Уникальный ID для связи label и input
// Используем случайное число, чтобы ID был уникальным на странице
const inputId = `input-${Math.random().toString(36).substring(2, 9)}`;

// Обработчик ввода — отправляет новое значение родителю
function updateValue(event) {
  emit('update:modelValue', event.target.value);
}
</script>

<style scoped>
/* Контейнер всего компонента */
.base-input {
  /* Вертикальное расположение элементов */
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Label (подпись) */
.base-input__label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

/* Обёртка поля и суффикса */
.base-input__wrapper {
  display: flex;
  align-items: center;
  
  /* Рамка вокруг поля */
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  
  /* Плавное изменение цвета рамки */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

/* При фокусе на поле — подсветка рамки */
.base-input__wrapper:focus-within {
  border-color: #6366F1;
  /* Мягкое свечение */
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* При ошибке — красная рамка */
.base-input__wrapper--error {
  border-color: #EF4444;
}

.base-input__wrapper--error:focus-within {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Само поле ввода */
.base-input__field {
  /* Занимает всё доступное пространство */
  flex: 1;
  
  /* Внутренние отступы */
  padding: 12px 16px;
  
  /* Убираем стандартные стили браузера */
  border: none;
  background: transparent;
  
  /* Размер шрифта */
  font-size: 14px;
  color: #111827;
  
  /* Важно: убираем outline при фокусе (мы используем border-color) */
  outline: none;
  
  /* Скругление слева */
  border-radius: 8px 0 0 8px;
}

/* Если нет суффикса — скругление со всех сторон */
.base-input__field:only-child {
  border-radius: 8px;
}

/* Placeholder (подсказка) */
.base-input__field::placeholder {
  color: #9CA3AF;
}

/* Отключённое состояние */
.base-input__field:disabled {
  background-color: #F9FAFB;
  cursor: not-allowed;
}

/* Суффикс справа */
.base-input__suffix {
  padding: 12px 16px;
  padding-left: 0;
  font-size: 14px;
  color: #6B7280;
}

/* Сообщение об ошибке */
.base-input__error {
  font-size: 12px;
  color: #EF4444;
  margin: 0;
}
</style>
