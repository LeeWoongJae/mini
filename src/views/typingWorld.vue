<script setup>
import { ref, computed, readonly, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import axios from 'axios'
/**
 * @ 최초생성일 : 2025. 12. 18.
 * @ author : 이웅재
 * @ description : 키보드 타이필을 하며 타이핑 속도를 향상시킴과 동시에 평균타수만큼 
 * @ 변수설명
 * - practiceGroups : 타이핑 연습 문장 그룹 - 한국어
 * - practiceEnglishGroups : 타이핑 연습 문장 그룹 - 영어
 * - currentIndex : 현재 연습 중인 문장 그룹 인덱스
 * - inputText : 사용자가 입력한 텍스트
 * - inputEl : 빈값으로 엔터를 쳤을경우 포커싱용 변수
 * - startTime : 타이핑 시작 시간
 * - speed10s : 10초 동안의 타이핑 속도
 * - currentGroup : 현재 연습 중인 문장 그룹 (계산된 속성)
 * - typingLine : 타이핑 대상의 인덱스 변수
 * - elapsedTime : 경과 시간 (화면 표시용)
 * - timerId : 타이머 ID
 * - gameStore : 타이핑 핑퐁의 초기 설정값을 받아오는 변수
 * - isReadonly : 유저가 타이핑하는 텍스트공간의 읽기 쓰기 모드 제어 변수
 * - showRetryBtn : 재도전 버튼의 보이기 / 숨기기 제어 변수
 * - imageSrc : 이미지 저장 변수
 * - resetGame : 게임 재시작 함수
 * - selectedPracticeGroups : 게임 셋팅시 선택한 언어
 * - hasTypo : 영문 오타 판정 기준
 * - calTypoEngResult : 영문 오타 판정 결과
 * - nameTag : 몬스터의 접두사 (ex > 방황하는 ~)
 * - fullName : 몬스터의 풀네임
 */
const nameTag = [['방황하는'],['어리버리한'],['강력한'],['소심한'],['혼란스러운'],['영리한'],['상냥한'],['비겁한'],['즐거운']];
const fullName = ref(null)
const practiceGroups = [
  ['오늘 우리는 빠르게 변하는 세상 속에서 살아간다.'],
  ['아침에 눈을 뜨면 스마트폰을 확인하게 된다.'],
  ['메시지를 읽고 날씨를 보며 하루를 준비한다.'],
  ['작은 선택들이 하루의 흐름을 결정한다.'],

  ['사람들은 각자의 일정에 맞춰 움직인다.'],
  ['누군가는 출근을 준비하며 하루를 시작한다.'],
  ['또 다른 누군가는 조용히 공부를 이어간다.'],
  ['도시는 아침마다 새로운 에너지로 깨어난다.'],

  ['효율적인 시간 관리는 점점 더 중요해진다.'],
  ['작은 습관 하나가 하루의 결과를 바꾼다.'],
  ['집중력 있는 짧은 시간이 성과로 이어진다.'],
  ['이런 경험은 누구나 한 번쯤 겪는다.'],

  ['타이핑 연습은 꾸준함이 핵심 요소다.'],
  ['처음에는 느리고 어색하게 느껴진다.'],
  ['반복적인 연습을 통해 점점 익숙해진다.'],
  ['속도보다 정확함이 중요하다는 걸 알게 된다.'],

  ['지금 이 순간에도 우리는 무언가를 배운다.'],
  ['작은 노력들이 모여 큰 변화를 만든다.'],
  ['오늘의 연습은 내일의 자신감이 된다.'],
  ['이 과정을 즐길 수 있다면 더 좋을 것이다.'],

  ['하루의 시작은 작은 다짐 하나로 충분하다.'],
  ['조용한 시간은 생각을 정리하기에 가장 좋다.'],
  ['익숙한 일상 속에서도 새로운 배움은 존재한다.'],
  ['집중해서 한 가지에 몰입하는 경험은 소중하다.'],

  ['짧은 휴식은 다시 나아갈 힘을 준다.'],
  ['꾸준한 반복은 결국 실력을 만들어낸다.'],
  ['오늘의 선택은 내일의 방향을 결정한다.'],
  ['작은 성공이 자신감을 키워준다.'],

  ['차분한 마음이 더 나은 결과를 만든다.'],
  ['생각을 글로 적으면 목표가 분명해진다.'],
  ['어제보다 나은 오늘을 만드는 것이 중요하다.'],
  ['시간을 의식하며 행동하면 효율이 높아진다.'],

  ['집중력은 연습을 통해 충분히 향상될 수 있다.'],
  ['한 번의 시도가 새로운 기회를 만든다.'],
  ['과정에 충실하면 결과는 따라온다.'],
  ['스스로에게 솔직해지는 순간 성장이 시작된다.'],

  ['익숙함을 벗어나면 시야가 넓어진다.'],
  ['천천히 가더라도 멈추지 않는 것이 중요하다.'],
  ['배움은 언제나 현재 진행형이다.'],
  ['오늘의 노력이 내일의 실력이 된다.']
]
const practiceEnglishGroups = [
  ['Today we live in a world that changes faster than ever.'],
  ['When we wake up in the morning, we often check our phones.'],
  ['We read messages, check the weather, and prepare for the day.'],
  ['Small choices decide the direction of our daily life.'],

  ['People move according to their own schedules.'],
  ['Some get ready for work to start their day.'],
  ['Others quietly continue studying on their own.'],
  ['The city wakes up with fresh energy every morning.'],

  ['Managing time efficiently has become more important.'],
  ['One small habit can change the outcome of a day.'],
  ['Short moments of focus lead to real results.'],
  ['Almost everyone has experienced this before.'],

  ['Typing practice depends heavily on consistency.'],
  ['At first, it feels slow and uncomfortable.'],
  ['Through repetition, it becomes more familiar.'],
  ['You learn that accuracy matters more than speed.'],

  ['Even now, we are learning something new.'],
  ['Small efforts come together to create big changes.'],
  ['Today’s practice builds confidence for tomorrow.'],
  ['Enjoying the process makes everything better.'],

  ['A day can start with just one small resolution.'],
  ['Quiet moments are the best time to organize your thoughts.'],
  ['Even in familiar routines, there is always something new to learn.'],
  ['The experience of focusing on one thing is truly valuable.'],

  ['A short break gives you the strength to move forward again.'],
  ['Consistent repetition eventually builds real skill.'],
  ['Today’s choices determine tomorrow’s direction.'],
  ['Small successes help build confidence.'],

  ['A calm mind leads to better results.'],
  ['Writing down your thoughts makes your goals clearer.'],
  ['It is important to make today better than yesterday.'],
  ['Being mindful of time increases efficiency.'],

  ['Focus can be greatly improved through practice.'],
  ['One attempt can create a new opportunity.'],
  ['When you commit to the process, results will follow.'],
  ['Growth begins the moment you become honest with yourself.'],

  ['Stepping outside familiarity broadens your perspective.'],
  ['Even if you move slowly, it is important not to stop.'],
  ['Learning is always an ongoing process.'],
  ['Today’s effort becomes tomorrow’s ability.']
]
const currentIndex = ref(0)
const inputText = ref('')
const inputEl = ref(null)
const startTime = ref(null)
const speed10s = ref(0)
const typingLine = ref(0)
const currentSentenceIndex = ref(0)
const elapsedTime = ref(0)   // 화면 표시용
const timerId = ref(null)
const isReadonly = ref(false)
const showRetryBtn = ref(false)
const gameStore = useGameStore()
const imageSrc = ref(null)
const loading = ref(false)
const router = useRouter()  // router 인스턴스 가져오기
/**
 * @ 최초생성일 : 2025. 12. 18.
 * @ author : 이웅재
 * @ 함수설명
 * - currentGroup : 현재 연습 중인 문장 그룹 (계산된 속성)
 * - onInput : 입력 이벤트 핸들러(시작시간을 기록하고 타이핑 속도 계산)
 * - timeOver : 타임 오버 함수
 * - onKeydown : 엔터키를 입력시 다음 문단으로 이동
 * - gameTimerReset : 제한시간 초기화 함수
 */

 // 랜덤 접두사
const getRandomName = () => {
  const nameArray = nameTag[Math.floor(Math.random() * nameTag.length)];
  return `${nameArray[0]}`;
}


// 선택한 언어 (한글 or 영어)
const selectedPracticeGroups = computed(() => {
  return gameStore.language === 'en'
    ? practiceEnglishGroups
    : practiceGroups
})

const currentSentence = computed(() => {
  return currentGroup.value[typingLine.value]
})

// 현재 연습 중인 문장 그룹 인덱스 (계산된 속성)
const currentGroup = computed(() => {
  return selectedPracticeGroups.value[currentIndex.value]
});

const timeOver = () => {
  clearInterval(timerId.value)
  timerId.value = null;
  isReadonly.value = true;
  alert('제한된 시간이 초과하였습니다\n게임 종료')
  showRetryBtn.value = true;
}

const gameOver = () => {
  isReadonly.value = true;
  if(!showRetryBtn.value) showRetryBtn.value = true; // false 라면 true로

  const retry = confirm('연습 완료!\n재도전하겠습니까?')
  if (retry) {
    if(showRetryBtn.value) showRetryBtn.value = false; // true라면 false로
    resetGame();
  }
}

function gameTimerReset() {
  clearInterval(timerId.value);
  timerId.value = null;

  startTime.value = null;
  elapsedTime.value = 0;
}

const resetGame = async () => {
  gameTimerReset()
  currentIndex.value = 0
  inputText.value = ''
  // typingLineCnt.value = 0
  // startTime.value = null
  // elapsedTime.value = 0
  speed10s.value = 0
  isReadonly.value = false;
  showRetryBtn.value = false;
  await generateImage(); // 랜덤 보스 생성
  // gameStore.setupBoss(); // 새로운 보스 HP 세팅
}

const goToWeather = () => {
  resetGame()
  router.push('/weather')
}

const goToHome = () => {
  resetGame()
  router.push('/sample')
}

// 입력 이벤트 핸들러(시작시간을 기록하고 타이핑 속도 계산)
const onInput = () => {
  if (!startTime.value) {
    startTime.value = Date.now()
    console.log("timeLimit:", gameStore.timeLimit)
     timerId.value = setInterval(() => {
      elapsedTime.value = Math.floor(
        (Date.now() - startTime.value) / 1000
      )
       if (elapsedTime.value >= gameStore.timeLimit) {
        timeOver()
      }
    }, 200)
  }
  // 3초당 타수 계산
  const elapsed = (Date.now() - startTime.value) / 1000
  if (elapsed > 0) {
    speed10s.value = Math.round(
      (inputText.value.length / elapsed) * 3
    )
  }
}

// 엔터키를 입력시 다음 문단으로 이동
const onKeydown = (e) => {
  if (e.key !== 'Enter') return;
   e.preventDefault()  // 기본 줄바꿈 막기
  
    if(!inputText.value){
        alert('문장을 입력해주세요!')
        // inputText.value = '';
        return;
    }

    if(inputText.value.slice(0,3) != currentSentence.value.slice(0,3)){
        gameStore.damageBoss(0) // 첫 3글자 불일치시 0데미지 반영
    }
    else if(inputText.value.slice(0,3) === currentSentence.value.slice(0,3) && inputText.value.length != currentSentence.value.length){
        gameStore.damageBoss(0) // 첫 3글자 불일치시 이면서 문장길이가 맞지 않을경우
    }else{
        const hasTypo = hasAllTypo(inputText.value, currentSentence.value);
        const result = gameStore.calculateDamage({ hasTypo })
        gameStore.damageBoss(result.damage)
    }

    if(gameStore.boss.currentHp <= 0){
      const displayTime = elapsedTime.value < 60 ? `${elapsedTime.value}s` : `${Math.floor(elapsedTime.value / 60)}min`;
      gameStore.addRecordToHall({user:'Annoymous', monster:fullName.value, clearTime: displayTime, lang: gameStore.language, mode:gameStore.mode+"-"+gameStore.difficulty});
      console.log(gameStore.hallOfFame);
      const reJoin = confirm('Mission Complete!\nCongratuations');
      if(reJoin){
        resetGame();
         return; // 게임 리셋 후 바로 리턴
      }
      else{
        gameTimerReset()
        currentIndex.value = 0
        inputText.value = ''
        speed10s.value = 0
        isReadonly.value = false;
        alert('메인화면으로 되돌아 갑니다.');
        router.push('/sample');
      }
    }

    // 다음 문장으로 이동
    if (currentIndex.value < selectedPracticeGroups.value.length - 1) {
      currentIndex.value++
      // typingLineCnt.value = 0
    } else {
      // 그룹 마지막 문장 완료 시, 다음 그룹으로 이동
       if (currentIndex.value < selectedPracticeGroups.value.length - 1) {
              currentIndex.value++
              currentSentenceIndex.value = 0
        } else {
          gameOver()
        }
    }

    // 텍스트 초기화 + 커서 재배치
    inputText.value = ''
    inputEl.value?.focus()

    // 타이머 초기화
    // gameTimerReset()

}

const hasTypo = hasAllTypo(
  inputText.value,
  currentGroup.value[0]
)

const calTypoEngResult = gameStore.calculateDamage({
  hasTypo
})
function hasAllTypo(input, answer) {
  if (gameStore.language === 'en') {
    // 영어: 대소문자 구분하여 비교
    const len = Math.max(input.length, answer.length);
    for (let i = 0; i < len; i++) {
      if ((input[i] || '') !== (answer[i] || '')) {
        return true; // 오타 존재
      }
    }
    return false; // 완벽 일치
  } else {
    // 한글: 단순 존재 여부만 체크 (길이 상관없이 틀리면 오타)
    return input !== answer;
  }
}

gameStore.damageBoss(calTypoEngResult.damage)

const generateImage = async () => {
  const goblin = 'A 3D cartoon-style green goblin character similar to a reference image, fantasy style, cute and playful, clear contours, centered on white background, no other elements, resembling the character in this reference: https://cdnb.artstation.com/p/assets/images/images/025/923/221/large/-goblin-export.jpg?1587352888';
  const dragon = 'A detailed red dragon character in fantasy style, similar to a reference image, bright red scales, fierce and majestic, 3D illustration style, centered on white background, no other elements, resembling the character in this reference: https://e7.pngegg.com/pngimages/81/655/png-clipart-perler-beads-pixel-art-dragon-dragon-text-dragon.png';
  
  const isDragon = Math.random() < 0.15;
  let prompt = isDragon ? dragon : goblin;
  if(prompt == dragon){
    fullName.value = getRandomName() + ' dragon'
  }else {
    fullName.value = getRandomName() + ' goblin'
  }
  // 스토어 보스 세팅 (프롬프트와 맞춰서)
  gameStore.boss.type = isDragon ? 'dragon' : 'goblin';
  gameStore.boss.maxHp = isDragon ? 300 : 100;
  gameStore.boss.currentHp = gameStore.boss.maxHp;
  
  console.log("생성되는 prompt : "+prompt);
  loading.value = true
  try {
    const res = await axios.post('/generate', {
      prompt: prompt,
      negative_prompt : 'blurry, low quality,multiple people, group, crowd,extra limbs, duplicate face',
      width : 480,
      height : 240,
      return_base64: true // base64 이미지 반환 요청
    })

    imageSrc.value = `data:image/png;base64,${res.data.image_base64}`
    
    // imageSrc.value = res.data.image;
    // console.log(" 생성된 이미지 확인 >> "+imageSrc.value);
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
 
}

// 게임 시작 시 보스 초기화
onMounted(() => {
//   gameStore.setupBoss()
  generateImage();// Boss Image Generate
})
</script>
<template>
  <button @click="goToWeather">
  Weather 이동
  </button>
  &nbsp;
  <button @click="goToHome">
  Home 이동
  </button>
  <div class="sample-view">
    <h1 style="margin-bottom: 5px; margin-top: 3px;">타이핑 World</h1>
  <div class="top-area">
    <!-- 이미지 영역 -->
    <div class="image-area">
      <div v-if="loading">이미지 생성 중...</div>
      <img v-if="imageSrc" :src="imageSrc" />
    </div>
    <p style="margin-top: 0; margin-bottom: 3px;"> &lt;Boss&gt; {{ fullName }}</p>
    <!-- 상태 정보 영역 -->
    <div class="status-area">
      <div class="hp-bar-container">
        <!-- <div class="hp-bar" :style="{ width:  gameStore.boss.currentHp/3 + '%'}"></div> -->
         <div class="hp-bar" :style="{ width: (gameStore.boss.currentHp / gameStore.boss.maxHp * 100) + '%' }"></div>
         <span class="hp-text">{{ gameStore.boss.currentHp  }}</span>
      </div>
      <p>⌨️ 3초당 타수: <strong>{{ speed10s }}</strong></p>
      <p>⏱ 제한시간: {{ gameStore.timeLimit }}초</p>
      <p>⏱ 경과 시간: {{ elapsedTime }}초</p>
    </div>
  </div>

  &nbsp;

  <!-- 문장 영역 -->
  <div style="border: 1px solid #ccc; padding: 12px; margin-bottom: 10px;">
    <p v-for="(line, idx) in currentGroup" :key="idx">
      {{ line }}
    </p>
  </div>

  <textarea
    v-model="inputText"
    @input="onInput"
    @keydown="onKeydown"
    :readonly="isReadonly"
    rows="5"
    style="width: 100%;"
    placeholder="위 문장을 입력하고 Enter를 누르세요"
  />

  <button v-if="showRetryBtn" @click="resetGame">재도전</button>
</div>
</template>
<style scoped>
.hp-bar-container {
  position: relative;
  width: 480px;
  height: 20px;
  background-color: gray;
  border-radius: 5px;
}
.hp-bar {
  height: 20px;
  background-color: red;
  border-radius: 5px;
  text-align: center;
}
.hp-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #000;
  font-size: 12px;
  font-weight: bold;
}

</style>