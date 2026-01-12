<!--
  SETTINGS VIEW — Страница настроек
  
  Содержит:
  - Экспорт данных в JSON
  - Импорт данных из JSON
-->

<template>
  <div class="settings">
    <header class="settings__header">
      <h1 class="settings__title">Настройки</h1>
    </header>
    
    <!-- Экспорт/Импорт данных -->
    <section class="settings__section">
      <h2 class="settings__subtitle">Резервное копирование</h2>
      <p class="settings__description">
        Сохраните все данные в JSON-файл или восстановите из ранее сохранённой копии.
      </p>
      
      <BaseCard>
        <div class="settings__backup">
          <!-- Экспорт -->
          <div class="settings__backup-item">
            <div class="settings__backup-info">
              <h3 class="settings__backup-title">Экспорт данных</h3>
              <p class="settings__backup-text">
                Скачать все проекты, задачи и записи времени в JSON-файл
              </p>
            </div>
            <BaseButton 
              variant="secondary" 
              @click="handleExport"
              :loading="backup.isExporting.value"
            >
              Скачать JSON
            </BaseButton>
          </div>
          
          <!-- Разделитель -->
          <div class="settings__divider"></div>
          
          <!-- Импорт -->
          <div class="settings__backup-item">
            <div class="settings__backup-info">
              <h3 class="settings__backup-title">Импорт данных</h3>
              <p class="settings__backup-text">
                Загрузить данные из ранее сохранённого файла.
                <strong>Внимание: текущие данные будут заменены!</strong>
              </p>
            </div>
            
            <!-- Скрытый input для выбора файла -->
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              class="settings__file-input"
              @change="handleFileSelect"
            />
            
            <BaseButton 
              variant="secondary" 
              @click="triggerFileSelect"
              :loading="backup.isImporting.value"
            >
              Загрузить JSON
            </BaseButton>
          </div>
        </div>
      </BaseCard>
      
      <!-- Сообщение об ошибке -->
      <p v-if="backup.error.value" class="settings__error">
        {{ backup.error.value }}
      </p>
      
      <!-- Сообщение об успехе -->
      <p v-if="successMessage" class="settings__success">
        {{ successMessage }}
      </p>
    </section>
    
    <!-- О приложении -->
    <section class="settings__section">
      <h2 class="settings__subtitle">О приложении</h2>
      <BaseCard>
        <div class="settings__about">
          <p>
            <strong>Time Tracker</strong> — персональный сервис для отслеживания рабочего времени.
          </p>
          <p>
            Все данные хранятся локально в вашем браузере (IndexedDB).
            Ничего не отправляется на сервер.
          </p>
          <p class="settings__version">Версия 1.0.0</p>
        </div>
      </BaseCard>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BaseCard from '../components/base/BaseCard.vue';
import BaseButton from '../components/base/BaseButton.vue';
import { useBackup } from '../composables/useBackup.js';

const backup = useBackup();

// Сообщение об успехе
const successMessage = ref('');

// Ссылка на input для загрузки файла
const fileInput = ref(null);

// Экспорт данных
async function handleExport() {
  successMessage.value = '';
  const success = await backup.exportData();
  if (success) {
    successMessage.value = 'Данные успешно экспортированы!';
    setTimeout(() => { successMessage.value = ''; }, 3000);
  }
}

// Клик по скрытому input
function triggerFileSelect() {
  fileInput.value?.click();
}

// Обработка выбора файла
async function handleFileSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  
  // Подтверждение
  if (!confirm('Все текущие данные будут заменены данными из файла. Продолжить?')) {
    // Сбрасываем input
    event.target.value = '';
    return;
  }
  
  successMessage.value = '';
  const success = await backup.importData(file);
  
  if (success) {
    successMessage.value = 'Данные успешно импортированы! Обновите страницу для применения.';
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }
  
  // Сбрасываем input
  event.target.value = '';
}
</script>

<style scoped>
.settings {
  max-width: 600px;
  margin: 0 auto;
  padding: 32px 20px;
}

.settings__header {
  margin-bottom: 32px;
}

.settings__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.settings__section {
  margin-bottom: 32px;
}

.settings__subtitle {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.settings__description {
  margin: 0 0 16px;
  font-size: 14px;
  color: #6B7280;
}

/* Backup секция */
.settings__backup {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings__backup-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.settings__backup-info {
  flex: 1;
}

.settings__backup-title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.settings__backup-text {
  margin: 0;
  font-size: 13px;
  color: #6B7280;
}

.settings__backup-text strong {
  color: #EF4444;
}

/* Разделитель */
.settings__divider {
  height: 1px;
  background-color: #E5E7EB;
}

/* Скрытый input */
.settings__file-input {
  display: none;
}

/* Сообщения */
.settings__error {
  margin: 16px 0 0;
  font-size: 14px;
  color: #EF4444;
}

.settings__success {
  margin: 16px 0 0;
  font-size: 14px;
  color: #22C55E;
}

/* О приложении */
.settings__about p {
  margin: 0 0 12px;
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}

.settings__about p:last-child {
  margin-bottom: 0;
}

.settings__version {
  color: #9CA3AF;
  font-size: 13px;
}
</style>
