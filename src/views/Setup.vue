<script setup> 
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const game = useGameStore()
/**
 * @ 최초생성일 : 2025. 12. 19.
 * @ author : 이웅재
 * @ 설명 : 게임 시작 라우팅 함수
 */
const startGame = () => {
  router.push('/typingWorld')
  //   game.setGameConfig({
  //   mode: selectedMode.value,
  //   difficulty: selectedDifficulty.value
  // })

  
}

</script>
<template>
  <button @click="router.push('/sample')">
        Home 이동
  </button>
  <div class="setup">
    <h1>Typing Adventure</h1>
     <select @change="game.setMode($event.target.value)">
      <option value="single">Single Play</option>
      <!-- <option value="multi">Multi Play</option> -->
    </select>
    &nbsp;
    <select @change="game.setDifficulty($event.target.value)">
      <option value="easy">Easy</option>
      <option value="normal">Normal</option>
      <option value="hard">Hard</option>
    </select>
    &nbsp;
    <button @click="game.setLanguage('ko')">한글</button>
    <button @click="game.setLanguage('en')">English</button>
    &nbsp;
    <p>⏱ 제한 시간: {{ game.timeLimit }}초</p>
    &nbsp;
    <button @click="startGame">
      게임 시작
    </button>
  </div>
</template>
<style scoped></style>