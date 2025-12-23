<script setup>
  import { onMounted } from 'vue'

// onMounted(() => {
//   document.documentElement.classList.add('dark')
// })
</script>

<!-- <template>
   <router-view />
</template> -->

<template>
   <!-- <div class="app-root"> -->
  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
<!-- </div> -->
</template>

<style scoped>
/* .app-root {
  min-height: 100vh;
  background: radial-gradient(circle at top, #1b1b1b, #000);
  color: #eaeaea;
} */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
