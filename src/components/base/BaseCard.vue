<!--
  BASE CARD — Универсальная карточка
  
  Простой контейнер с мягкими тенями и скруглёнными углами.
  Используется как основа для ProjectCard, TaskCard, StatCard и др.
  
  Использование:
  <BaseCard>
    <h3>Заголовок</h3>
    <p>Содержимое карточки</p>
  </BaseCard>
  
  <BaseCard :clickable="true" @click="openProject">
    Кликабельная карточка
  </BaseCard>
-->

<template>
  <!-- 
    :class — динамически добавляет класс clickable, если карточка кликабельная
    @click — вызывает handleClick при клике
  -->
  <div
    class="base-card"
    :class="{ 'base-card--clickable': clickable }"
    @click="handleClick"
  >
    <!-- slot — сюда вставляется всё содержимое карточки -->
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  // Можно ли кликать на карточку
  clickable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

function handleClick(event) {
  if (props.clickable) {
    emit('click', event);
  }
}
</script>

<style scoped>
.base-card {
  /* Белый фон */
  background-color: white;
  
  /* Скруглённые углы */
  border-radius: 12px;
  
  /* Внутренние отступы */
  padding: 20px;
  
  /* Мягкая тень
     - первая часть: маленькая тень близко к карточке
     - вторая часть: большая размытая тень для глубины */
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.05);
  
  /* Плавный переход для hover-эффектов */
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

/* Кликабельная карточка */
.base-card--clickable {
  cursor: pointer;
}

/* Эффект при наведении на кликабельную карточку */
.base-card--clickable:hover {
  /* Более выраженная тень */
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.08);
  
  /* Небольшой подъём */
  transform: translateY(-2px);
}
</style>
