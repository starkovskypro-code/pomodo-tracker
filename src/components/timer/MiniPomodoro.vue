<!--
  MINI POMODORO — Компактный Pomodoro для боковой панели
  
  Отображает таймер в минималистичном виде.
  При клике разворачивается в полный режим.
-->

<template>
  <div class="mini-pomodoro" :class="`mini-pomodoro--${mode}`">
    <div class="mini-pomodoro__header">
      <span class="mini-pomodoro__label">🍅 Pomodoro</span>
      <span class="mini-pomodoro__mode">{{ modeLabel }}</span>
    </div>
    
    <!-- Таймер -->
    <div class="mini-pomodoro__timer">
      {{ formattedTime }}
    </div>
    
    <!-- Прогресс бар -->
    <div class="mini-pomodoro__progress-bar">
      <div 
        class="mini-pomodoro__progress-fill" 
        :style="{ width: progress + '%' }"
      ></div>
    </div>
    
    <!-- Сессии -->
    <div class="mini-pomodoro__sessions">
      <span 
        v-for="i in settings.sessionsUntilLongBreak" 
        :key="i" 
        class="mini-pomodoro__dot"
        :class="{ 'mini-pomodoro__dot--done': i <= completedSessions }"
      ></span>
    </div>
    
    <!-- Кнопки -->
    <div class="mini-pomodoro__controls">
      <template v-if="mode === 'idle'">
        <button class="mini-pomodoro__btn mini-pomodoro__btn--primary" @click="handleStart('work')">
          ▶ Старт
        </button>
      </template>
      
      <template v-else>
        <button 
          class="mini-pomodoro__btn"
          @click="isRunning ? pause() : resume()"
        >
          {{ isRunning ? '⏸' : '▶' }}
        </button>
        <button class="mini-pomodoro__btn" @click="handleSkip">
          ⏭
        </button>
        <button class="mini-pomodoro__btn mini-pomodoro__btn--stop" @click="stop">
          ⏹
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onUnmounted } from 'vue';
import { usePomodoro } from '../../composables/usePomodoro.js';
import { useNotifications } from '../../composables/useNotifications.js';

const emit = defineEmits(['work-start', 'work-pause', 'work-resume', 'break-start', 'stop']);

const {
  settings,
  mode,
  isRunning,
  remainingSeconds,
  completedSessions,
  progress,
  modeLabel,
  formattedTime,
  start,
  pause: pausePomodoro,
  resume: resumePomodoro,
  stop: stopPomodoro,
  skip,
  updateSettings
} = usePomodoro();

const {
  notifyWorkStart,
  notifyBreakStart,
  notifySessionComplete
} = useNotifications();

// Отслеживаем окончание таймера
watch(remainingSeconds, (newVal, oldVal) => {
  if (oldVal > 0 && newVal === 0 && isRunning.value) {
    handleTimerComplete();
  }
});

function handleStart(newMode) {
  start(newMode);
  if (newMode === 'work') {
    notifyWorkStart();
    emit('work-start');
  } else {
    notifyBreakStart(newMode === 'longBreak');
    emit('break-start');
  }
}

function pause() {
  pausePomodoro();
  if (mode.value === 'work') {
    emit('work-pause');
  }
}

function resume() {
  resumePomodoro();
  if (mode.value === 'work') {
    emit('work-resume');
  }
}

function stop() {
  stopPomodoro();
  emit('stop');
}

function handleSkip() {
  pause();
  handleTimerComplete();
}

function handleTimerComplete() {
  if (mode.value === 'work') {
    notifySessionComplete(completedSessions.value + 1);
    
    const isLongBreak = (completedSessions.value + 1) % settings.value.sessionsUntilLongBreak === 0;
    const nextMode = isLongBreak ? 'longBreak' : 'shortBreak';
    
    setTimeout(() => {
      start(nextMode);
      notifyBreakStart(isLongBreak);
      emit('break-start');
    }, 500);
  } else {
    notifyWorkStart();
    setTimeout(() => {
      start('work');
      emit('work-start');
    }, 500);
  }
}

onUnmounted(() => {
  pausePomodoro();
});
</script>

<style scoped>
.mini-pomodoro {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
}

.mini-pomodoro--work {
  border-left: 3px solid #EF4444;
}

.mini-pomodoro--shortBreak {
  border-left: 3px solid #22C55E;
}

.mini-pomodoro--longBreak {
  border-left: 3px solid #3B82F6;
}

.mini-pomodoro__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.mini-pomodoro__label {
  font-size: 11px;
  font-weight: 600;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mini-pomodoro__mode {
  font-size: 11px;
  color: #6B7280;
}

.mini-pomodoro__timer {
  font-size: 28px;
  font-weight: 700;
  font-family: 'SF Mono', 'Consolas', monospace;
  color: white;
  text-align: center;
  margin-bottom: 8px;
}

.mini-pomodoro__progress-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 10px;
}

.mini-pomodoro__progress-fill {
  height: 100%;
  background: #EF4444;
  transition: width 0.5s ease;
}

.mini-pomodoro--shortBreak .mini-pomodoro__progress-fill {
  background: #22C55E;
}

.mini-pomodoro--longBreak .mini-pomodoro__progress-fill {
  background: #3B82F6;
}

.mini-pomodoro__sessions {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
}

.mini-pomodoro__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.mini-pomodoro__dot--done {
  background: #EF4444;
}

.mini-pomodoro__controls {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.mini-pomodoro__btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: background 0.15s;
}

.mini-pomodoro__btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.mini-pomodoro__btn--primary {
  background: #EF4444;
  flex: 1;
}

.mini-pomodoro__btn--primary:hover {
  background: #DC2626;
}

.mini-pomodoro__btn--stop {
  background: rgba(239, 68, 68, 0.2);
  color: #FCA5A5;
}

.mini-pomodoro__btn--stop:hover {
  background: rgba(239, 68, 68, 0.3);
}
</style>
