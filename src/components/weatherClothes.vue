<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import FormData from 'form-data';
/**
 * @ 최초 생성일 :  2025. 12. 12
 * @ author : 이웅재
 * @ 변수 설명
 * nx : 예보지점 x 좌표 , 경도 lon
 * ny : 예보지점 y 좌표 , 위도 lat
 * rn : 1시간 강수량
 * pty : 강수형태 (0:없음, 1:비, 2:비/눈, 3:눈, 5:빗방울, 6:빗방울눈날림, 7:눈날림
 * reh : 습도
 * wsd : 풍속
 * t1h : 기온
 * gender : 성별 선택 박스
 * stylebox : 스타일 리스트 저장
 * styleOpen : 스타일 선택 박스 오픈 여부
 * checkStyle : 선택된 스타일 값
 * today : 현재 날짜
 * baseTime : 현재시간으로부터 1시간 전
 * weatherUrl : 기상청 초단기 실황 조회 url
 * textareaContent : 사용자가 원하는 스타일 디테일 내용을 담을 변수
 * imageSrc : 결과 이미지 변수
 * loading : 로딩
 * transResult : 번역된 결과 변수
 * reportBase64 : base64코드를 LLM으로 분석한 결과를 담는 임시 변수
 * translateKorFromEng : 변환된 이미지 분석 한국어 변환 문장을 담는 변수
 * searchList : 검색할 상품 리스트를 담는 변수
 * shopResults : 검색한 상품리스트 결과를 담는 배열 변수
 * leftItems : 결과배열의 0번째 인덱스에 있는 데이터를 담는 변수
 * rightItems : 결과배열의 1번째 인덱스에 있는 데이터를 담는 변수
 * showGuide : 가이드 표시 여부 변수
 * clothingCategories : 의류 카테고리 리스트 변수
 * koreanToEnglishMap : 한글 의류 카테고리를 영문 코드로 매핑하는 변수
 */
const lat = ref(null); // 위도
const lon = ref(null); // 경도
const weatherData = ref(null); // 기상 정보 변수
const rn = ref(0.0); // 강수량
const pty = ref(0); // 강수형태
const reh = ref(0); // 습도
const wsd = ref(0.0); // 풍속
const t1h = ref(0.0); // 기온
const gender = ref('Male'); // gender select box
// const style = ref(null); // 스타일 선택 박스
const styleOpen = ref(false);
const stylebox = ref([{code : 'ca', name : '캐주얼',value:'캐주얼', description:'편안함을 강조하며 격식 없이 일상생활에서 가볍게 입을 수 있는 옷차림'}, 
                   {code : 'st', name : '스트릿',value : '스트릿', description:'특정 틀에 얽매이지 않고 자신의 취향을 개성 있게 표현하는 옷차림'},
                   {code : 'vtg', name : '빈티지',value : '빈티지', description:'시간의 흔적과 깊이를 더하고 개성을 표현하는 옷차림'},
                   {code : 'cls', name : '클래식',value : '클래식', description:'유행을 타지 않는 고전적이고 단정한 옷차림'},
                   {code : 'nc', name : '놈코어',value : '놈코어', description:'일부러 꾸미지 않은 듯한 평범하고 일상적인 옷차림을 통해 오히려 세련됨을 추구하는 옷차림'}, // 일상적인 평범한 패션
                   {code : 'md', name : '모던', value : '모던', description:'장식적 요소를 배제하고 기능성과 실용성을 강조하는 심플하면서도 세련된 옷차림'},
                   {code : 'fe', name : '페미닌', value : '페미닌', description:'여성스러움과 우아함을 강조하는 옷차림'},// 여성스러운 패션
                   {code : 'da', name : '댄디', value : '댄디', description:'격식을 갖추면서도 너무 딱딱하지 않고 세련되고 깔끔하며 도시적인 느낌을 주는 옷차림'},
                   {code : 'mi', name : '미니멀리즘', value : '미니멀리즘', description:'극도의 단순함과 절제를 추구하며, 과도한 장식과 화려함을 배제하고 최소한의 요소로 세련됨을 표현하는 옷차림'},
                   {code : 'la', name : '레이어드', value : '레이어드', description:'다양한 소재와 길이의 아이템을 조합해 개성과 깊이감을 주는 옷차림'},
                   {code : 'spt', name : '스포티', value : '스포티', description:'스포츠웨어의 활동성과 편안함을 일상복에 접목한 옷차림'},
                   {code : 'av', name : '아방가르드', value : '아방가르드', description:'예술적이고 혁신적인 접근으로 평범함을 거부하고 새로운 미학을 추구하는 옷차림'},
                   ]);
const styleDesc = ref(''); // 스타일 설명 툴팁
const checkStyle = ref("A"); // 선택된 스타일 값
const textareaContent = ref('');
const transResult = ref(null);
const baseTime = ref('');
const imageSrc = ref(null)
const loading = ref(false)
const reportBase64 = ref('');
const translateKorFromEng = ref('');
const searchList = ref('');
const shopResults = ref([]);
const leftItems = ref([]);
const rightItems = ref([]);
const showGuide = ref(false);
const clothingCategories = [
  { code: 'blouson', name: '블루종', value: '블루종' },
  { code: 'windbreaker', name: '바람막이', value: '바람막이' },
  { code: 'singlecoat', name: '싱글코트', value: '싱글코트' },
  { code: 'doublecoat', name: '더블코트', value: '더블코트' },
  { code: 'leatherjacket', name: '레더자켓', value: '레더자켓' },
  { code: 'suedejacket', name: '스웨이드자켓', value: '스웨이드자켓' },
  { code: 'denimjacket', name: '청자켓', value: '청자켓' },
  { code: 'chinopants', name: '치노팬츠', value: '치노팬츠' },
  { code: 'slacks', name: '슬렉스', value: '슬렉스' },
  { code: 'jeans', name: '청바지', value: '청바지' },
  { code: 'slimjeans', name: '슬림진', value: '슬림진' },
  { code: 'regularpants', name: '레귤러핏바지', value: '레귤러핏바지' },
  { code: 'semipants', name: '세미와이드핏바지', value: '세미와이드핏바지' },
  { code: 'hoodie', name: '후드티', value: '후드티' },
  { code: 'sweatpants', name: '트레이닝팬츠', value: '트레이닝팬츠' },
  { code: 'shirt', name: '셔츠', value: '셔츠' },
  { code: 'tshirt', name: '티셔츠', value: '티셔츠' },
  { code: 'knit', name: '니트', value: '니트' },
  { code: 'cardigan', name: '가디건', value: '가디건' },
  { code: 'sneakers', name: '운동화', value: '운동화' },
  { code: 'dressshoes', name: '구두', value: '구두' },
  { code: 'boots', name: '부츠', value: '부츠' },
  { code: 'derbyshoes', name: '더비슈즈', value: '더비슈즈' },
  { code: 'loafers', name: '로퍼', value: '로퍼' },

];
const koreanToEnglishMap = {};
clothingCategories.forEach(item => {
  koreanToEnglishMap[item.value] = item.code;
});

/**
 * @ 최초 생성일 :  2026. 01. 05
 * @ author : 이웅재
 * @ 함수명 : convertClothingKeywords
 * @ 설명 : 사용자가 입력한 의상 키워드 문장에서 의상 카테고리만 영어로 변환하는 함수
 */
function convertClothingKeywords(inputText) {
    // 쉼표 기준으로 분리
  const segments = inputText.split(',').map(s => s.trim());

  const result = segments.map(segment => {
    // 각 단어 중 의상 카테고리를 영어로 변환
    const words = segment.split(/\s+/).map(word => koreanToEnglishMap[word] || word);
    return words.join(' '); // 색상 + 의상 공백 유지
  });

  return result.join(', '); // 각 의상 조합은 쉼표로 구분
}

/**
 * @ 최초 생성일 :  2025. 12. 17
 * @ author : 이웅재
 * @ 함수명 : generateImage
 * @ 설명 : 번역된 문장들을 prompt에 담아서 결과값인 base64코드를 받환 받고 생성된 이미지를 분석하는 함수
 */
const generateImage = async () => {
  loading.value = true
  try {
    const res = await axios.post('/generate', {
      prompt: transResult.value,
      negative_prompt : "(head, face, facial feature, eyes, nose, lips, hair, mouth:2.0), (neck, forehead, skin:1.6), (background, scenery, environment, city, street, cafe, nature:1.8), (portrait, headshot:1.6), (multiple people, two people:1.5), blurry, low quality, worst quality, text, watermark, signature", // 2026. 01. 05
      return_base64: true // base64 이미지 반환 요청
    });
    // negative_prompt : "(head, face, facial feature, eyes, nose, lips, hair, mouth:2.0), (neck, forehead, skin:1.6), (background, scenery, environment, city, street, cafe, nature:1.8), (portrait, headshot, waist up, upper body shot:1.6), (multiple people, two people:1.5), blurry, low quality, worst quality, text, watermark, signature", // 2026. 01. 02
    // negative_prompt : 'blurry, low quality, background, scenery, environment, city, street, road, sidewalk, buildings, walls, windows, trees, grass, sky, clouds, cars, signs, extra people, crowd, face, head, hair, portrait, cropped, cut off, out of frame.',
    // negative_prompt : "(full body, legs, feet, shoes, standing:1.5), (background, scenery, environment, buildings, street, trees, sky:1.5), (detailed face, facial feature, eyes, nose, lips, makeup, skin pores:1.5), (portrait, headshot:1.4), (extra people, crowd:1.3), faceless, blurred face, blurry, low quality, worst quality, watermark, text, signature",
    // (background, scenery, environment, buildings, street, trees, sky:1.5), (detailed face, facial feature, eyes, nose, lips, makeup, skin pores:1.5), (portrait, headshot:1.4), (extra people, crowd:1.3), faceless, blurred face, blurry, low quality, worst quality, watermark, text, signature

    imageSrc.value = `data:image/png;base64,${res.data.image_base64}`
    // imageSrc.value = res.data.image;
    // console.log(" 생성된 이미지 코드 >> "+imageSrc.value);
    analizeClothesByBase64(imageSrc.value);
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

/**
 * @ 최초 생성일 :  2025. 12. 16
 * @ author : 이웅재
 * @ 함수명 : sendTranslate
 * @ 설명 : 사용자가 선택한 성별, 스타일, 기상정보, 추가 디테일 내용을 백엔드로 전송하여 번역
 */
const sendTranslate = async () => {
  // 0. 공란 존재 확인
  if(checkStyle.value === "A"){
    alert('스타일을 선택해주세요!');    return;
  }
  // 사용자가 입력한 의상 키워드 영어로 변환
  const convertedKeywords = convertClothingKeywords(textareaContent.value);
  // 1. 한국어 문장 조합
  // const korText = `(invisible man wearing clothes:1.6), (headless:1.5), (shot from neck down to feet:1.5), (white background:1.4), 단 1명, ${getGenderKor(gender.value)} 모델, ${getThermalState(t1h.value, reh.value)} 날씨, ${checkStyle.value}스타일, (${textareaContent.value}), (one set of outfit:1.5), (outerwear, top, pants, shoes:1.4), full body outfit showcase, highly detailed fabric texture.` // 2026. 01. 02
  const korText = `neck-down shot, lower body visible, full legs, 단 1명, ${getGenderKor(gender.value)} 모델, ${getThermalState(t1h.value, reh.value)} 날씨, ${checkStyle.value}스타일, ${convertedKeywords}.`;// 2026. 01. 05 14:31
  //const korText = `cropped at neck, neck-down shot, torso only, upper body only, no head visible, head out of frame, 단 1명, ${getGenderKor(gender.value)} 모델, ${getThermalState(t1h.value, reh.value)} 날씨, ${checkStyle.value}스타일, ${convertedKeywords}.`; // 2026. 01. 05
  //const korText = `cropped at neck, neck-down shot, torso only, upper body only, no head visible, head out of frame, 단 1명, ${getGenderKor(gender.value)} 모델, ${getThermalState(t1h.value, reh.value)} 날씨, ${checkStyle.value}스타일, ${textareaContent.value}.` // 2026. 01. 02
  console.log('조합된 한국어 문장 >> '+korText);
  try {
      if (!korText) {
        console.warn('번역할 텍스트가 비어 있음');
        return;
    }
    // 2. 백엔드로 번역 요청
    const response = await axios.post('/translate', {
      text: korText,
      source : 'ko',
      target : 'en'
    });

    const translated = response?.data?.translatedText;

    if (!translated) {
      console.error('번역 실패 응답:', response.data);
      return;
    }
    transResult.value = translated;
    console.log('번역된 영어 문장'+translated);

    // 3. 번역된 문장으로 이미지 생성 요청
    await generateImage();

  } catch (err) {
    console.error("번역 요청 실패 : "+err);
  }
};

function getTimeHHMM(date = new Date()) {
  const h = String(date.getHours()-1).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
baseTime.value = getTimeHHMM();

/**
 * @ 최초생성일 : 2025. 12. 30.
 * @ author : 이웅재
 * @ 함수명 : getThermalState
 * @ 함수설명 : 기온과 습도값을 기입하면 추운 | 더운 | 보통의 문자값을 리턴하는 함수
 */
function getThermalState(temp, humidity) {
  let state;

  // 기온 기준
  if (temp <= 5) state = '추운';
  else if (temp <= 20) state = '보통';
  else state = '더운';

  // 습도 (체감용)
  if (humidity >= 70) {
    if (state === '보통' && temp <= 10) state = '추운';
    if (state === '보통' && temp >= 25) state = '더운';
  }

  if (humidity <= 30) {
    if (state === '추운' && temp >= 3) state = '보통';
  }

  return state;
}

/**
 * @ 최초 생성일 :  2025. 12. 18
 * @ author : 이웅재
 * @ 함수명 : getGenderKor
 * @ 설명 : 성별 영문을 받아오면 한글로 변환해주는 함수
 */
function getGenderKor(gender) {
  if (gender == 'male') return '남자'
  if (gender == 'female') return '여자'
  if (gender == 'none') return '선택안함'
}

/**
 * @ 최초 생성일 :  2025. 12. 30.
 * @ author : 이웅재
 * @ 함수명 : findWaGwaIndex
 * @ 설명 : 분석문에 와 또는 과의 인덱스를 반환하는 함수
 */
function findWaGwaIndex(text) {
  const wa = text.indexOf('와');
  const gwa = text.indexOf('과');

  if (wa === -1) return gwa;
  if (gwa === -1) return wa;

  return Math.min(wa, gwa);
}

/**
 * @ 최초 생성일 :  2025. 12. 30.
 * @ author : 이웅재
 * @ 함수명 : findUlRulIndex
 * @ 설명 : 분석문에 을 또는 를의 인덱스를 반환하는 함수
 */
function findUlRulIndex(text) {
  const u = text.indexOf('을');
  const r = text.indexOf('를');

  if (u === -1) return r;
  if (r === -1) return u;

  return Math.min(u, r);
}

/**
 * @ 최초 생성일 :  2025. 12. 17
 * @ author : 이웅재
 * @ 함수명 : analizeClothesByBase64
 * @ 설명 : base64코드값을 file로 변환해 api를 통해 이미지를 분석한 결과를 반환하는 함수
 */
const analizeClothesByBase64 = async (code)=> {
  try {
    // base64 → Blob 변환
    const byteString = atob(code.split(',')[1] || code);
    const mimeString = 'image/png';
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], 'test_output_base64.png', {
      type: mimeString
    });

    // FormData 구성
    // 기존 프롬프트에 덮어씌우려 했으나 강제로 참고만 당하고 대부분 무시당하게 되어 공란으로 처리(Default Prompt + Custom Prompt[ignore])
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'prompt',
      
 `Output format (strict):

      Top: <Description or None>
      Outerwear: <Description or None>
      Bottom: <Description>
      Shoes: <Description or None>

      Example Output:
      Top: None
      Outerwear: gray coat
      Bottom: black pants
      Shoes: None`
    );
      // `Focus on identifying visible clothing only.

      // Include outerwear and inner layers if visible.
      // Do not describe the face, pose, or background.

      // Return the clothing summary using the labels below.
      // Any extra descriptions outside the labels are optional and may be ignored.

      // Clothing summary format:

      // Top: <Description or None>
      // Outerwear: <Description or None>
      // Bottom: <Description>
      // Shoes: <Description or None>

      // Example:
      // Top: None
      // Outerwear: gray coat
      // Bottom: black pants
      // Shoes: None`
    formData.append('max_tokens', 100);
    formData.append('temperature', 0.15);
    formData.append('return_base64', true);
    // multipart 요청
    const response = await axios.post(
      '/upload_and_generate',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    // console.log('분석 결과:', response?.data);
    const raw = response.data.response;
    console.log("raw : ", raw);
    let onlyAssistant = raw;

    if (raw.includes('Assistant:')) { // LLM 답문 자르기
      onlyAssistant = raw.split('Assistant:').pop().trim();
    }else {
     onlyAssistant = raw.trim();
    }

    if (!onlyAssistant) {
      console.warn('LLM 응답이 비어있음:', raw);
      return;
    }
    
    // const onlyAssistant = raw.split('Assistant:')[1]?.trim();
    console.log("onlyAssistant : ", onlyAssistant);
    reportBase64.value = onlyAssistant;

    console.log('의상 분석 결과(reportBase64):', reportBase64.value);
    
  } catch (error) {
    console.error('의상 분석 실패:', error);
  }

  try {
    const response = await axios.post('/translate', {
      text: reportBase64.value,
      source : 'en',
      target : 'ko'
    });
    console.log(response.data.translatedText);
    translateKorFromEng.value = response.data.translatedText;
    

    const splitDotStr = translateKorFromEng.value.slice(0, translateKorFromEng.value.indexOf('.'));
    const standardStr = splitDotStr;
    const firstStr = standardStr.indexOf('는') // 남자는 , 여자는
    const topStr = standardStr.slice(0,firstStr)+" "+standardStr.slice(firstStr+1 , findWaGwaIndex(standardStr)); // ex > 남자 검은색자켓
    const bottomStr = standardStr.slice(0,firstStr)+" "+standardStr.slice(findWaGwaIndex(standardStr)+1, findUlRulIndex(standardStr)); // 남자 검은색바지
    const targetStr = topStr +","+bottomStr;
    console.log("테스트 슬라이스 : "+targetStr);
    searchList.value = targetStr;
    getShopSearchResult(searchList.value);
    
  } catch (error) {
    console.log(error);
  }

}// End of analizeClothesByBase64

/**
 * @ 최초 생성일 :  2025. 12. 31.
 * @ author : 이웅재
 * @ 함수명 : getShopSearchResult
 * @ 설명 : 이미지분석결과의 키워드를 받아 네이버쇼핑 api를 통해 상품조회 결과를 반환하는 함수
 */
const getShopSearchResult = async (text) =>{
  console.log("getShopSearchResult >> TEXT : ",text);
  try {
    const response = await axios.get('/naver/shop',
    {
    params: {
        queries: text,
    },
    });
    if(response.data){
      console.log("유사한 판매링크 obj : "+response?.data[0]);
      shopResults.value = response.data;
      const validResults = response.data.filter(
        arr => Array.isArray(arr) && arr.length > 0
      );


      leftItems.value = validResults[0] || [];
      // rightItems.value = validResults[1] || [];
      return response.data;
    }
  } catch (error) {
    console.log("search Error : ",error);
  }
}

onMounted(async () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
         lat.value = position.coords.latitude;
         lon.value = position.coords.longitude;
        // Node.js 백엔드에 좌표 전달
        try {
          const response = await axios.get("/weather", {
            params : { 
                       lat:lat.value, 
                       lon:lon.value 
                     }
          });
          weatherData.value = response.data;
          const items = weatherData.value?.response?.body?.items?.item || [];
          rn.value  = items.find(i => i.category === "RN1")?.obsrValue;
          pty.value = items.find(i => i.category === "PTY")?.obsrValue;
          reh.value = items.find(i => i.category === "REH")?.obsrValue;
          t1h.value = items.find(i => i.category === "T1H")?.obsrValue;
          wsd.value = items.find(i => i.category === "WSD")?.obsrValue;

          // console.log(weatherData.value?.response?.body?.items?.item);
        } catch (err) {
          console.error(err);
        }
      },
       (err) => {
        console.error("Geo error:", err);
      },
      { enableHighAccuracy: true }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
});
</script>

<template>
 <button @click="$router.push('/sample')">
 Home 이동
 </button>
 <div class="container">
    <!-- 좌측 위쪽 선택 영역 -->
    <div class="controls">
      <div>
        <h3>성별 선택</h3>
        <!-- <input type="radio" id="none" value="none" v-model="gender">
        <label for="none">선택안함</label> -->
        <!-- <input type="radio" id="male" value="male" v-model="gender">
        <label for="male">Male</label>
        <input type="radio" id="female" value="female" v-model="gender">
        <label for="female">Female</label> -->
        <div class="gender-group">
          <label
            class="gender-card"
            :class="{ active: gender === 'male' }"
          >
            <input type="radio" value="male" v-model="gender" />
            <span class="icon"><img src="http://img.icons8.com/?size=36&id=12351&format=png&color=000000"></span>
          </label>

          <label
            class="gender-card"
            :class="{ active: gender === 'female' }"
          >
            <input type="radio" value="female" v-model="gender" />
            <span class="icon"><img src="http://img.icons8.com/?size=36&id=pj-lbkskSrS2&format=png&color=000000"></span>
          </label>
        </div>
      </div>

      <div>
        <h3>스타일 선택</h3>
        <select v-model="checkStyle">
          <option v-for="s in stylebox" :key="s.code" :value="s.value" :title="s.description">
            {{ s.name }}
          </option>
        </select>
        <p class="guide-text">
          스타일 리스트에 마우스를 올려두면 설명이 표시됩니다.
        </p>
      </div>
    </div>

    <!-- 기상 정보 영역 -->
    <!-- <div class="weather-info">
    </div> -->

    <div class="command">
      <h3 id="detailH3">사용자 입력</h3>

      <textarea
        cols="20"
        rows="5"
        v-model="textareaContent"
        placeholder="의상 정보를 입력해주세요"
        @focus="showGuide = true"
        @blur="showGuide = false"
      ></textarea>

      <!-- focus 되었을 때만 가이드 노출 -->
      <p v-if="showGuide" class="guide-text">
        · 의상 정보는 영어권 기준으로 입력해주세요<br />
        · 여러 개일 경우 쉼표(,)로 구분해주세요<br />
        · 색상 키워드는 한국어로 입력해도 무방합니다<br />
        · 형식은 색상  의상종류, 색상  의상종류, ...입니다(키워드로만 입력시 정확도 상승)<br />
        · 예) 검은색 코트, 청바지, ...<br />
        · 예) 검은색 셔츠와 청바지를 입은 데일리룩 추천해주세요.<br />
      </p>
    </div>
    <!--이미지 생성 버튼  -->
    <button @click="sendTranslate">전송</button>

     <div v-if="loading">이미지 생성 중...</div>

    <!-- 번역한 영문을 prompt로 보내서 받아온 결과 이미지 -->
     <div class="result-layout" v-if="imageSrc">
        <!-- 왼쪽 -->
        <div class="side left">
          <h3>유사한 판매링크</h3>
          <div v-if="leftItems.length > 0">
            <div v-for="item in leftItems" :key="item.link" class="shop-item">
              <a :href="item.link" target="_blank">
                <p v-html="item.title"></p>
                <!-- <span>{{ item.lprice }}원</span> -->
              </a>
              
            </div>
          </div>
          <div v-else>Not found or failed search</div>
        </div>
        <!-- 중앙 이미지 -->
        <div class="center">
          <img :src="imageSrc" class="generated-image" />
          
        </div>
        

        <!-- 오른쪽 -->
        <!-- <div class="side right">
          <h3>유사한 판매링크 2</h3>
          <div v-if="rightItems.length > 0">
            <div v-for="item in rightItems" :key="item.link" class="shop-item">
              <a :href="item.link" target="_blank">
                <p v-html="item.title"></p>
                
              </a>
              
            </div>
          </div>
          <div v-else>Not found or failed search</div>
        </div> -->

      </div>

      <div>
          <textarea v-if="translateKorFromEng" cols="120" rows="20" v-model="translateKorFromEng" name="analizeBase64" id="reportCode" readonly></textarea>
      </div>

      <!-- End of container -->
  </div>

</template>

<style scoped>
  .container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.controls {
  display: flex;
  gap: 100px;
  /* align-items: flex-start; */
  justify-content: center;
  align-items: center;
}

.weather-info .weather-items {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.command textarea {
  width: 100%;
  margin-top: 10px;
}

.result-layout {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-top: 30px;
}

.side {
  width: 280px;
}

.center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.gender-group {
  display: flex;
  gap: 8px;
}

.gender-card input {
  display: none;
}

.gender-card {
  border: 1px solid #374151;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
}

.gender-card.active {
  border-color: #6366f1;
  background: #1f2937;
}

.generated-image {
  max-width: 400px;
  border-radius: 8px;
}

.shop-item {
  margin-bottom: 12px;
}

.shop-item img {
  width: 100%;
  border-radius: 4px;
}

textarea {
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}

.guide-text {
  text-align: left;
  margin-top: 6px;
  font-size: 14px;
  /* color: #e4dfdf; */
   color: var(--text-muted);
  line-height: 1.4;
}
</style>
