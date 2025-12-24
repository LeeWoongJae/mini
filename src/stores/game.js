import { defineStore } from 'pinia'
export const useGameStore = defineStore('game', {
  state: () => ({
    language : 'ko',
    mode: 'single',
    difficulty: 'normal',
    timeLimit: 100,
    critical: 0.5,
    boss: {
      type: 'goblin',
      maxHp: 100,
      currentHp: 100
    },
    hallOfFame:JSON.parse(localStorage.getItem('hallOfFame')) || []// 명예의 전당
  }),
  actions: {
    // setupBoss() {
    //   if (Math.random() < 0.5) {
    //     this.boss.type = 'goblin'
    //     this.boss.maxHp = 100
    //   } else {
    //     this.boss.type = 'dragon'
    //     this.boss.maxHp = 300
    //   }
    //   this.boss.currentHp = this.boss.maxHp
    // },
    setupBoss(type, maxHp) {
      this.boss.type = type;
      this.boss.maxHp = maxHp;
      this.boss.currentHp = maxHp;
    },

    setLanguage(lang) {
      this.language = lang
    },

    updateTimeLimit() {
      // 난이도 제어 테이블
      const table = {
        single: {
          hard: 60,
          normal: 120,
          easy: 180
        },
        // multi: {
        //   hard: 30,
        //   normal: 60,
        //   easy: 100
        // }
      }

      // this.timeLimit = table[this.mode][this.difficulty]
       // 크리티컬 발동 제어 테이블
      const criticalTable = {
        easy: 0.5,
        normal: 0.3,
        hard: 0.1
      }

      this.timeLimit = table[this.mode][this.difficulty]
      this.critical = criticalTable[this.difficulty]
    },

    setMode(mode) {
      this.mode = mode
      this.updateTimeLimit()
    },

    setDifficulty(level) {
      this.difficulty = level
      this.updateTimeLimit()
    },
    // 기본 히트 데미지 조정
    calculateBaseDamage() {
      return 10
    },
    // 데미지 계산
    calculateDamage(payload) {
    const context = {
      isCritical: false,
      isMiss: false
    }
      const base = this.calculateBaseDamage(payload)
      const finalDamage = this.applyModifiers(base, payload, context )

      return { damage: finalDamage, ...context }
    },

    applyModifiers(baseDamage, payload, context) {
    let damage = baseDamage

    // 오타 패널티 (난이도별)
    if (payload.hasTypo) {
      if (this.difficulty === 'hard') return 0 // 하드모드는 즉시 실패
      damage *= 0.9 // easy / normal
    }

    // miss 판정(추후 구현 - 현재는 기준문장과 불일치시 데미지0 고정)
    if (Math.random() < this.missRate) {
      context.isMiss = true
      return 0
    }

    // 크리티컬 판정(제어 테이블 참조하여 발동확률별 데미지 2배)
    if (Math.random() < this.critical) {
      context.isCritical = true
      damage *= 2
    }

      return Math.floor(damage)
    },
    // 계산된 데미지 잔존 체력에 적용
    damageBoss(damage) {
    this.boss.currentHp = Math.max(
        this.boss.currentHp - damage,
        0
      )
    },
    // 명예의 전당 추가
    addRecordToHall(record) {
      this.hallOfFame.push(record)
      if(this.hallOfFame.length > 15) this.hallOfFame.shift() // 최대 15개
      localStorage.setItem('hallOfFame', JSON.stringify(this.hallOfFame))
    },
    clearHallOfFame() {
      this.hallOfFame = [],
      localStorage.removeItem('hallOfFame')
    }
  }
})