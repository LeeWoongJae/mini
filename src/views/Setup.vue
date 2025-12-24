<script setup> 
import { ref ,  computed} from 'vue'
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
/**
 * @ 최초생성일 : 2025. 12. 24.
 * @ author : 이웅재
 * @ 설명 : 명예의 전당 초기화
 */
const clearHall = () => {
  game.clearHallOfFame()
}

const loopedHall = computed(() => [...game.hallOfFame, ...game.hallOfFame])

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
    &nbsp;
    <button @click="clearHall">전당초기화</button>
  </div>
    <div class="hall-wrapper">
    <ul class="hall-list">
      <li v-for="(record, index) in loopedHall" :key="index">
        {{ record.user }} | {{ record.monster }} | {{ record.clearTime }} | {{ record.lang }} | {{ record.mode }}
      </li>
    </ul>
  </div>
</template>
<style scoped>
  .hall-wrapper {
  height: 200px; /* 보여줄 영역 높이 */
  overflow: hidden;
  position: relative;
  margin-top: 20px;
  border: 1px solid #acc91c;
  border-radius: 8px;
}

.hall-list {
  list-style: none;
  margin: 0;
  padding: 0;
  /* border: 1px solid #000000; */
  display: flex;
  flex-direction: column;
  animation: scroll-up 20s linear infinite; /* 속도 조절 */
}

.hall-list li {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #61615f;
  font-size: 14px;
  color: #b6b6b6;
  text-shadow: 
    1px 1px 0 #000,   /* 오른쪽 아래 그림자 */
   -1px 1px 0 #000,   /* 왼쪽 아래 그림자 */
    1px -1px 0 #000,  /* 오른쪽 위 그림자 */
   -1px -1px 0 #000;  /* 왼쪽 위 그림자 */
}

/* keyframes: 밑에서 위로 이동 */
@keyframes scroll-up {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-100%); /* 리스트 길이만큼 이동 */
  }
}
</style>