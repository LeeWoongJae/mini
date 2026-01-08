import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayouts from '@/layouts/DefaultLayouts.vue'
// import Weather from '@/components/weatherClothes.vue'
import Weather from '@/views/WeatherView.vue'
import Sample from '@/views/sample.vue'
import SetupView from '@/views/Setup.vue'
import TypingWorld from '@/views/typingWorld.vue'

const routes = [
 {
    path: '/',
    component: DefaultLayouts,
    children: [
      { path: '', redirect: '/sample' },
      { path: 'weather', component: Weather },
      { path: 'sample', component: Sample },
      { path: 'setup', component: SetupView },
      { path: 'typingWorld', component: TypingWorld }
    ]
  },


]
export default createRouter({
  history: createWebHistory(),
  routes
})
// const router = createRouter({
//   history: createWebHistory(),
//   routes,
// })

// export default router