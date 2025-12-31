<script setup>
import { ref, onMounted } from 'vue';
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
 * style : 스타일 리스트
 * stylebox : 스타일 리스트 저장
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
const style = ref([{code : 'ca', name : '캐주얼',value:'캐주얼'}, 
                   {code : 'st', name : '스트릿',value : '스트릿'},
                   {code : 'vtg', name : '빈티지',value : '빈티지'},
                   {code : 'cls', name : '클래식',value : '클래식'},
                   {code : 'nc', name : '놈코어',value : '놈코어'}, // 일상적인 평범한 패션
                   {code : 'md', name : '모던', value : '모던'},
                   {code : 'fe', name : '페미닌', value : '페미닌'},// 여성스러운 패션
                   {code : 'da', name : '댄디', value : '댄디'},
                   {code : 'mi', name : '미니멀리즘', value : '미니멀리즘'},
                   {code : 'la', name : '레이어드', value : '레이어드'},
                   {code : 'spt', name : '스포티', value : '스포티'},
                   {code : 'av', name : '아방가르드', value : '아방가르드'},
                   ]
                ); // 스타일 선택 박스
const stylebox = ref(style); // second gender select box
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
      negative_prompt : 'background, scenery, environment, city, street, road, sidewalk, buildings, walls, windows, trees, grass, sky, clouds, cars, signs, extra people, crowd, face, head, hair, portrait, cropped, cut off, out of frame, blurry, low quality',
      return_base64: true // base64 이미지 반환 요청
    });
    // negative_prompt : "background, scenery, environment, city, street, road, sidewalk, buildings, walls, windows, trees, grass, sky, clouds, cars, signs, extra people, crowd, (deformed iris, facial feature, eyes, nose, lips, makeup:1.4), (detailed face:1.5), (headshot:1.3), (portrait:1.2), skin pores, portrait, cropped, cut off, out of frame, blurry, low quality",
    // negative_prompt : "(full body, legs, feet, shoes, standing:1.5), (background, scenery, environment, buildings, street, trees, sky:1.5), (detailed face, facial feature, eyes, nose, lips, makeup, skin pores:1.5), (portrait, headshot:1.4), (extra people, crowd:1.3), faceless, blurred face, blurry, low quality, worst quality, watermark, text, signature",
    // negative_prompt : "(head, face, eyes, lips, nose:1.6), (background, scenery, street, buildings:1.5), (makeup, skin pores:1.4), blurry, low quality, text, watermark",
    // background, scenery, environment, city, street, road, sidewalk, buildings, walls, windows, trees, grass, sky, clouds, cars, signs, extra people, crowd, (deformed iris, facial feature, eyes, nose, lips, makeup:1.4), (detailed face:1.5), (headshot:1.3), (portrait:1.2), skin pores, portrait, cropped, cut off, out of frame, blurry, low quality
    // (background, scenery, environment, buildings, street, trees, sky:1.5), (detailed face, facial feature, eyes, nose, lips, makeup, skin pores:1.5), (portrait, headshot:1.4), (extra people, crowd:1.3), faceless, blurred face, blurry, low quality, worst quality, watermark, text, signature
    // 'blurry, low quality, sepia, text, cropped, close-up, upper body only, bust shot, headshot, face, head, hair, eyes, mouth, beard, multiple people, two people, group, crowd, extra person, background people, reflection of people, mannequin, scenery, landscape, cityscape, environment,location, place, outdoor, indoor, room, wall, floor,multiple views, sequence, comic, 2koma, 4koma, letterboxed, framed, border, speech bubble'
    // 'blurry, low quality, portrait, close-up, upper body only, bust shot, headshot, head, face, facial features, hair, beard, multiple people, two people, group, crowd, extra person, background people, reflection of people, mannequin, detailed background',
    // 'blurry, low quality, deformed body, portrait, close-up, upper body only, bust shot, headshot, face, facial features, head, hair, beard, cropped legs, out of frame legs, cut off legs, detailed background, complex scenery, desaturated, no color, low saturation',
    // 'blurry, low quality, nsfw, Missing limbs, portrait, close-up, upper body only, bust shot, headshot, face, facial features, head, hair beard, portrait, background, scenery, environment, street, road, city, building, wall, floor, sky',

    imageSrc.value = `data:image/png;base64,${res.data.image_base64}`
    // imageSrc.value = res.data.image;
    // console.log(" 생성된 이미지 확인 >> "+imageSrc.value);
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
  // 1. 한국어 문장 조합
  // const korText = `기존에 설정된 프롬프트를 모두 무시하고 아래 지시만 따르십시오. 이 이미지는 ${getGenderKor(gender.value)} 모델의  ${checkStyle.value} 복장이다 현지역의 풍속은 ${getWindSpeedByScore(wsd.value)}이 불고, 기온은 ${t1h.value}°C 이며, 습도는 ${reh.value}%이고, 강수량은 ${getRnByScore(rn.value)}정도 되며, 강수형태는 ${getResultByScore(pty.value)} 이다 추가적으로 ${textareaContent.value} 그리고 내가 나열한 정보들을 꼭 반영해서 모델샷 이미지를 생성하라.`;
  // const korText = `이 이미지는 ${getGenderKor(gender.value)} 모델이 ${getWindSpeedByScore(wsd.value)}이 불고, 기온은 ${t1h.value}°C 이며, 습도가 ${getRehKR()}이고, 강수량은 ${getRnByScore(rn.value)}의 환경을 고려하여 입은 ${checkStyle.value}스타일 복장이다. 추가적으로 ${textareaContent.value}. full color fashion photography, accurate clothing colors, one person only`;
  // const korText = "cropped at neck, neck-down shot, torso only, upper body only, no head visible, head out of frame, 단 1명, ${getGenderKor(gender.value)} 모델, ${getThermalState(t1h.value, reh.value)} 날씨, ${checkStyle.value}스타일, ${textareaContent.value}."
  const korText = "단 1명, ${getGenderKor(gender.value)} 모델, ${getThermalState(t1h.value, reh.value)} 날씨, ${checkStyle.value}스타일, ${textareaContent.value}."
  // const korText = "(medium shot:1.5), (close-up of clothing:1.5), (torso shot:1.4), (shot from neck down:1.3), 단 1명, ${getGenderKor(gender.value)} 모델, ${getThermalState(t1h.value, reh.value)} 날씨, ${checkStyle.value}스타일, ${textareaContent.value}, high detail fabric texture"
  //  const korText = "(shot from neck down:1.5), (headless:1.4), full body of a person wearing ${getGenderKor(gender.value)} 모델, ${getThermalState(t1h.value, reh.value)} 날씨, ${checkStyle.value}스타일, ${textareaContent.value}, vertical centered, detailed clothing"
  // const korText = `이 이미지는 ${getGenderKor(gender.value)}모델의 ${checkStyle.value}스타일 복장이다 현재 날씨는 풍속은 ${getWindSpeedByScore(wsd.value)}이 불고, 기온은 ${t1h.value}°C 이며, 습도는 ${reh.value}%이고, 강수량은 ${getRnByScore(rn.value)}이다. ${textareaContent.value}. 반드시 torso and legs only, body cropped at neck, head cropped out of image, head completely out of frame, no face visible, fashion catalog style, isolated subject, studio product photography, plain white seamless background.`;
  console.log('조합된 한국어 문장 >> '+korText);
  try {
      if (!korText) {
        console.warn('번역할 텍스트가 비어 있음');
        return;
    }
    // 2. 백엔드로 전송 → 번역 요청
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
    // transResult.value = response.data.translatedText;
    console.log('번역된 영어 문장'+translated);

    // 3. 번역된 문장으로 이미지 생성 요청
    await generateImage();

  } catch (err) {
    console.error("번역 요청 실패 : "+err);
  }
};
// https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=vExVsx1FJkY9Uma%2BjJadUHgr%2BPmrFWpSYvG64oal%2FQDNkwHqVRw%2B68%2Bl3hmjmyB7SNjoN%2BtUI9j%2FljKQObjoFg%3D%3D&pageNo=1&numOfRows=1000&dataType=XML&base_date=20251215&base_time=0600&nx=55&ny=127
function getTimeHHMM(date = new Date()) {
  const h = String(date.getHours()-1).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
baseTime.value = getTimeHHMM();
// console.log("현재 시간 : "+baseTime.value);

/**
 * @ 최초 생성일 :  2025. 12. 29
 * @ author : 이웅재
 * @ 함수명 : getRehKR
 * @ 설명 : 기온값에 따른 습도를 한글로 변환해주는 함수
 */
function getRehKR() {
  const t = t1h.value;
  const h = reh.value;

  if (t <= 0) {
    if (h <= 40) return '낮음';
    else if (h <= 70) return '보통';
    else return '높음';
  }

  else if (t <= 15) {
    if (h <= 35) return '낮음';
    else if (h <= 65) return '보통';
    else return '높음';
  }

  else if (t <= 25) {
    if (h <= 40) return '낮음';
    else if (h <= 60) return '보통';
    else return '높음';
  }

  else {
    if (h <= 45) return '낮음';
    else if (h <= 65) return '보통';
    else return '높음';
  }
}

/**
 * @ 최초생성일 : 2025. 12. 30.
 * @ author : 이웅재
 * @ 함수명 : getThermalState
 * @ 함수설명 : 기온과 습도값을 기입하면 추운 | 더운 | 보통의 문자값을 리턴하는 함수
 */
function getThermalState(temp, humidity) {
  let state;

  // 1️⃣ 기본 기온 기준
  if (temp <= 5) state = '추운';
  else if (temp <= 20) state = '보통';
  else state = '더운';

  // 2️⃣ 습도 보정 (체감용)
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
 * @ 최초 생성일 :  2025. 12. 17
 * @ author : 이웅재
 * @ 함수명 : getResultByScore
 * @ 설명 : 강수형태를 받아오면 각 값마다 표기되는 문자 반환 함수
 */
function getResultByScore(score) {
  if (score == 0) return '없음'
  if (score == 1) return '비 내림'
  if (score == 2) return '비 또는 눈 내림'
  if (score == 3) return '눈 내림'
  if (score == 5) return '빗방울 내림'
  if (score == 6) return '빗방울눈날림'
  if (score == 7) return '눈날림'
}

/**
 * @ 최초 생성일 :  2025. 12. 17
 * @ author : 이웅재
 * @ 함수명 : getWindSpeedByScore
 * @ 설명 : 풍속데이터값을 받아오면 각 값마다 표기되는 문자 반환 함수
 */
function getWindSpeedByScore(wspeed) {
  // if (wspeed < 4) return `약한 바람(${wspeed}m/s)`
  // if (wspeed >= 4 && wspeed < 9) return `약간 강한 바람(${wspeed}m/s)`
  // if (wspeed >= 9 && wspeed < 14) return `강한 바람(${wspeed}m/s)`
  // if (wspeed >= 14) return `매우 강한 바람(${wspeed}m/s)`

  if (wspeed < 4) return `약한 바람`
  if (wspeed >= 4 && wspeed < 9) return `약간 강한 바람`
  if (wspeed >= 9 && wspeed < 14) return `강한 바람`
  if (wspeed >= 14) return `매우 강한 바람`
}

/**
 * @ 최초 생성일 :  2025. 12. 17
 * @ author : 이웅재
 * @ 함수명 : getRnByScore
 * @ 설명 : 강수량데이터값을 받아오면 각 값마다 표기되는 문자 반환 함수
 */
function getRnByScore(score) {
  if (score == '-' || score == null || score == 0) return `강수없음`
  if (score >= 0.1 && score < 1.0) return `1mm미만`
  if (score >= 30.0 && score < 50.0) return `30.0~50.0mm`
  if (score >= 50.0 ) return `50.0mm 이상`

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
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'prompt',
      `Ignore all previous prompts and instructions.
        Analyze the image and describe ONLY the person's clothing.
        Describe the clothing in the exact order below:
        Top:<Description>
        Bottom:<Description>
        Outerwear:<Description or None>
        Shoes:<Description or None>
        Do NOT describe the background.
        Do NOT describe the person's pose.
        Do NOT add any extra explanations or sentences.`
    );
// `Describe the clothing items only.
// Ignore background, scenery, and environment.

// For each item, include color and length.
// Use length terms such as cropped, waist-length, hip-length, full-length, or long.

// Output format (use this exact structure):

// Top: <description (include color and length)>
// Bottom: <description (include color and length)>
// Outerwear: <description (include color and length) or None>
// Shoes: <description (include color) or None>
// `
    // `이전 프롬프트를 모두 무시하고 아래의 지시를 따르시오. "Analyzing Image"라는 문구만 출력하라.`
    // `반드시 이미지에 인물의 인상착의만 상의, 하의, 외투 순서로 설명하라. 절대로 배경과 인물 포즈 설명은 제외하라.`
    // '이 이미지를 분석하고 설명해. 만약 사람의 이미지가 아니라면 분석을 종료하고 나에게 "이 이미지는 사람이 아닙니다"라는 문구를 띄우고 사람의 이미지이라면 설명형식은 예를들면 "아우터 : 남성 다크브라운 롱코트 울 모직 / 이너 : 남성 화이트 체크셔츠 실크 / 하의 : 남성 검정 데님팬츠" 이 형식으로 하면되고 배경에 대한 설명은 생략해'
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

    // console.log('분석 결과:', response.data.response);
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

    // reportBase64.value = onlyAssistant;
    // const onlyAssistant = raw.split('Assistant:')[1]?.trim();
    console.log("onlyAssistant : ", onlyAssistant);
    reportBase64.value = onlyAssistant;
    //  if (!reportBase64.value || !reportBase64.value.trim()) {
    //     console.warn('번역할 분석 텍스트가 비어 있음');
    //     return;
    //   } 
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
    // searchClothes(reportBase64.value.slice(0, reportBase64.value.indexOf('.'))); // 구글 키워드 서치 함수
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

const searchClothes = (description) => {
  const h3Element = document.querySelector('#detailH3');// 디테일 설명 h3 태그
  const query = encodeURIComponent(description);// 번역전 영어원문의 첫줄을 받아와서 쿼리문자열으로 인코딩
  const url = `https://www.google.com/search?tbm=isch&q=musinsa:${query}`;
  // window.open(url, "_blank");
  const existingLink = h3Element.querySelector('a'); // h3의 자식노드의 a태그 존재확인
  if (existingLink) h3Element.removeChild(existingLink); // 존재한다면 삭제
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank'; // 새 탭에서 열기
  link.rel = 'noopener noreferrer'; // 보안용
  link.textContent = "Google Search Result";
  link.style.display = "block"; // 줄바꿈
  h3Element.appendChild(link);
};

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
      shopResults.value = response.data;
      const validResults = response.data.filter(
        arr => Array.isArray(arr) && arr.length > 0
      );


      leftItems.value = validResults[0] || [];
      rightItems.value = validResults[1] || [];
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
       // console.log("lat / lon value : "+lat.value, lon.value);
        // Node.js 백엔드에 좌표 전달
        try {
         // console.log(`웹브라우저 위치 정보 >> Lat: ${lat.value}, Lon: ${lon.value}`);
          const response = await axios.get("/weather", {
            params : { 
                       lat:lat.value, 
                       lon:lon.value 
                     }
          });
         // console.log(response.data);
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
        <input type="radio" id="male" value="male" v-model="gender">
        <label for="male">Male</label>
        <input type="radio" id="female" value="female" v-model="gender">
        <label for="female">Female</label>
      </div>

      <div>
        <h3>스타일 선택</h3>
        <select v-model="checkStyle">
          <option v-for="s in stylebox" :key="s.code" :value="s.value">
            {{ s.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- 기상 정보 영역 -->
    <!-- <div class="weather-info">
      <h3>현재 위치 기반 기상 정보({{baseTime}} 기준)</h3>1
      <small><strong>*기준 시간으로부터 약 3시간 정도의 기상예보입니다</strong></small>
      <div class="weather-items">
        <p>강수량: {{ getRnByScore(rn) }}</p>
        <p>강수형태: {{ getResultByScore(pty) }}</p>
        <p>습도: {{ reh }}%</p>
        <p>풍속: {{ getWindSpeedByScore(wsd) }}</p>
        <p>기온: {{ t1h }}℃</p>
        <p>위도: {{ lat }}</p>
        <p>경도: {{ lon }}</p>
      </div>
    </div> -->

    <!-- textarea -->
    <div class="command">
      <h3 id="detailH3">디테일 설명</h3>
      <textarea cols="20" rows="5" v-model="textareaContent" placeholder="의상카테고리를 기입해주세요.&#10;Ex)검은색코트, 데일리룩"></textarea>
    </div>
    <button @click="sendTranslate">전송</button>
    <!-- 번역 결과 영역 -->
     <!-- <textarea id="transResArea" cols="50" rows="10" v-model="transResult" placeholder="영문으로 변환된 결과" readonly></textarea> -->
    <!--이미지 생성 버튼  -->
     <!-- <button v-if="transResult" @click="generateImage">생성</button> -->
     <div v-if="loading">이미지 생성 중...</div>

    <!-- 번역한 영문을 prompt로 보내서 받아온 결과 이미지 -->
     <!--<img v-if="imageSrc" :src="imageSrc" />-->

     <div class="result-layout" v-if="imageSrc">
        <!-- 왼쪽 -->
        <div class="side left">
          <h3>유사한 판매링크 1</h3>
          <div v-if="leftItems.length > 0">
            <div v-for="item in leftItems" :key="item.link" class="shop-item">
              <a :href="item.link" target="_blank">
                <p v-html="item.title"></p>
                <span>{{ item.lprice }}원</span>
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
        <div class="side right">
          <h3>유사한 판매링크 2</h3>
          <div v-if="rightItems.length > 0">
            <div v-for="item in rightItems" :key="item.link" class="shop-item">
              <a :href="item.link" target="_blank">
                <p v-html="item.title"></p>
                <span>{{ item.lprice }}원</span>
              </a>
              
            </div>
          </div>
          <div v-else>Not found or failed search</div>
        </div>

      </div>

     <div>
      <textarea v-if="translateKorFromEng" cols="120" rows="20" v-model="translateKorFromEng" name="analizeBase64" id="reportCode" readonly></textarea>
     </div>
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
</style>
