import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // ВАЖНО: Если деплоите на GitHub Pages в https://user.github.io/repo/,
  // раскомментируйте строку ниже и замените 'repo' на название вашего репозитория
  base: '/pomodo-tracker/',
})
