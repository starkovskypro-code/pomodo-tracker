<!--
  CONFIRM DIALOG — Диалог подтверждения действия
  
  Красивый попап вместо window.confirm()
  Используется для подтверждения удаления и других опасных действий.
-->

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="modelValue" class="confirm-dialog-overlay" @click.self="handleCancel">
        <div class="confirm-dialog" role="alertdialog" aria-modal="true">
          <!-- Иконка -->
          <div class="confirm-dialog__icon" :class="`confirm-dialog__icon--${variant}`">
            <svg v-if="variant === 'danger'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          
          <!-- Заголовок -->
          <h3 class="confirm-dialog__title">{{ title }}</h3>
          
          <!-- Сообщение -->
          <p class="confirm-dialog__message">{{ message }}</p>
          
          <!-- Кнопки -->
          <div class="confirm-dialog__actions">
            <button 
              class="confirm-dialog__btn confirm-dialog__btn--cancel"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
            <button 
              class="confirm-dialog__btn"
              :class="`confirm-dialog__btn--${variant}`"
              @click="handleConfirm"
              ref="confirmBtn"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Подтверждение'
  },
  message: {
    type: String,
    default: 'Вы уверены?'
  },
  confirmText: {
    type: String,
    default: 'Подтвердить'
  },
  cancelText: {
    type: String,
    default: 'Отмена'
  },
  variant: {
    type: String,
    default: 'danger', // 'danger' | 'warning' | 'info'
    validator: (v) => ['danger', 'warning', 'info'].includes(v)
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const confirmBtn = ref(null);

// Фокус на кнопке подтверждения при открытии
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    confirmBtn.value?.focus();
  }
});

function handleConfirm() {
  emit('confirm');
  emit('update:modelValue', false);
}

function handleCancel() {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>

<style scoped>
.confirm-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.confirm-dialog {
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.confirm-dialog__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.confirm-dialog__icon--danger {
  background: #FEE2E2;
  color: #EF4444;
}

.confirm-dialog__icon--warning {
  background: #FEF3C7;
  color: #F59E0B;
}

.confirm-dialog__icon--info {
  background: #DBEAFE;
  color: #3B82F6;
}

.confirm-dialog__title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.confirm-dialog__message {
  margin: 0 0 24px;
  font-size: 14px;
  color: #6B7280;
  line-height: 1.5;
}

.confirm-dialog__actions {
  display: flex;
  gap: 12px;
}

.confirm-dialog__btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.confirm-dialog__btn--cancel {
  background: #F3F4F6;
  color: #374151;
}

.confirm-dialog__btn--cancel:hover {
  background: #E5E7EB;
}

.confirm-dialog__btn--danger {
  background: #EF4444;
  color: white;
}

.confirm-dialog__btn--danger:hover {
  background: #DC2626;
}

.confirm-dialog__btn--warning {
  background: #F59E0B;
  color: white;
}

.confirm-dialog__btn--warning:hover {
  background: #D97706;
}

.confirm-dialog__btn--info {
  background: #3B82F6;
  color: white;
}

.confirm-dialog__btn--info:hover {
  background: #2563EB;
}

/* Анимация появления */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-active .confirm-dialog,
.dialog-fade-leave-active .confirm-dialog {
  transition: transform 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .confirm-dialog,
.dialog-fade-leave-to .confirm-dialog {
  transform: scale(0.95);
}
</style>
