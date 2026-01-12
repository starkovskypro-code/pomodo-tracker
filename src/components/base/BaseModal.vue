<!--
  BASE MODAL — Модальное окно
  
  Всплывающее окно с затемнённым фоном.
  Закрывается по клику на фон или по кнопке закрытия.
  
  Использование:
  <BaseModal v-model="isModalOpen" title="Создать проект">
    <p>Содержимое модального окна</p>
  </BaseModal>
  
  Где isModalOpen — ref(true/false) для управления видимостью
-->

<template>
  <!-- 
    Teleport — "телепортирует" содержимое в конец body.
    Это нужно, чтобы модальное окно было поверх всего,
    независимо от того, где его вызвали в коде.
  -->
  <Teleport to="body">
    <!-- 
      Transition — плавное появление/исчезновение
      Показываем только если modelValue === true
    -->
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <!-- 
          @click.self — закрывает только при клике на сам overlay,
          а не на содержимое модального окна
        -->
        
        <!-- Само окно -->
        <div class="modal-window">
          <!-- Заголовок с кнопкой закрытия -->
          <div class="modal-header">
            <h2 class="modal-title">{{ title }}</h2>
            
            <!-- Кнопка закрытия (крестик) -->
            <button class="modal-close" @click="close" aria-label="Закрыть">
              <!-- SVG иконка крестика -->
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <!-- Основное содержимое -->
          <div class="modal-body">
            <slot></slot>
          </div>
          
          <!-- 
            Footer (подвал) — опционально 
            Показывается только если в слот footer что-то передано
          -->
          <div class="modal-footer" v-if="$slots.footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  // Видимость модального окна (связь с v-model)
  modelValue: {
    type: Boolean,
    default: false
  },
  // Заголовок окна
  title: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

// Функция закрытия — отправляет false родителю
function close() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
/* Затемнённый фон на всю страницу */
.modal-overlay {
  /* Фиксированное позиционирование — поверх всего */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  
  /* Полупрозрачный чёрный фон */
  background-color: rgba(0, 0, 0, 0.5);
  
  /* Центрирование содержимого */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Поверх всего контента */
  z-index: 1000;
  
  /* Внутренние отступы (для мобильных) */
  padding: 20px;
}

/* Само модальное окно */
.modal-window {
  background: white;
  border-radius: 16px;
  
  /* Максимальная ширина */
  width: 100%;
  max-width: 480px;
  
  /* Ограничение высоты со скроллом */
  max-height: 90vh;
  overflow-y: auto;
  
  /* Тень для глубины */
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

/* Заголовок */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  padding: 20px 24px;
  
  /* Разделительная линия снизу */
  border-bottom: 1px solid #E5E7EB;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

/* Кнопка закрытия */
.modal-close {
  /* Убираем стандартные стили */
  background: none;
  border: none;
  padding: 4px;
  
  cursor: pointer;
  color: #9CA3AF;
  
  /* Плавный переход цвета */
  transition: color 0.2s ease;
  
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #374151;
}

/* Тело модального окна */
.modal-body {
  padding: 24px;
}

/* Подвал */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #E5E7EB;
  
  /* Кнопки в ряд справа */
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* --- АНИМАЦИЯ ПОЯВЛЕНИЯ/ИСЧЕЗНОВЕНИЯ --- */

/* Начальное и конечное состояние */
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-window,
.modal-leave-to .modal-window {
  transform: scale(0.95);
}

/* Анимация */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-window,
.modal-leave-active .modal-window {
  transition: transform 0.2s ease;
}
</style>
