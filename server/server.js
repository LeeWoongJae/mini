// server.js
import express, { response } from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import FormData from 'form-data';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors({
  origin: '*',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.LIVE_PORT;
const HOST = process.env.LIVE_HOST;
const generateApiIp = process.env.GENERATE_API_IP; // Image Generation API IP
const vlApiIp = process.env.VL_API_IP; // Vision Language API IP
const serviceKey = process.env.SERVICE_KEY;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const upload = multer({ dest: 'uploads/' });
const upload = multer({
  storage: multer.memoryStorage()
});

/** @ 최초생성일 : 2025. 12. 16.
 * @ 작성자 : 이웅재
 * @ 함수명 : latLonToGrid
 * @ 설명 : 위도 경도를 기상청 격자 좌표로 변환하는 함수
 */
function latLonToGrid(lat, lon) {
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0; // 격자 간격(km)
  const SLAT1 = 30.0; // 투영 위도1(degree)
  const SLAT2 = 60.0; // 투영 위도2(degree)
  const OLON = 126.0; // 기준점 경도(degree)
  const OLAT = 38.0; // 기준점 위도(degree)
  const XO = 43; // 기준점 X좌표(GRID)
  const YO = 136; // 기준점 Y좌표(GRID)
  
  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;
  
  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);
  
  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = re * sf / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;
  
  const nx = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  
  return { nx, ny };
}

function getYYYYMMDD(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function getTimeHHMM(date = new Date()) {
  const h = String(date.getHours()-1).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}${m}`;
}
// --- Vue SPA 서빙 ---
app.use(express.static(path.join(__dirname, '../dist')));
app.get('/', (req, res) => {
  console.log('🔥 ROOT HIT');
  
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

/**
 * @ 최초생성일 : 2025. 12. 16.
 * @ 작성자 : 이웅재
 * @ 설명 : 기상청 초단기실황조회 API 엔드포인트
 */
app.get('/weather',  async (req, res) => {
  console.log('🔥 /weather HIT');
  //console.log('SERVER_SERVICE_KEY:', serviceKey);
  const { lat, lon } = req.query;
  const { nx, ny } = latLonToGrid(Number(lat), Number(lon));
  const base_date = getYYYYMMDD();
  const base_time = getTimeHHMM();
  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${serviceKey}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}`;
  console.log('Request URL:', url);
  
  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @ 최초생성일 : 2025. 12. 16.
 * @ author : 이웅재
 * @ 설명 : 한글 영문번역 엔드포인트
 */
app.post('/translate', async (req, res) => {
  const { text, source,  target} = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({
      error: 'text parameter is required'
    });
  }
  console.log('Received text:', text);
  try{
      const response = await axios.post(`https://papago.apigw.ntruss.com/nmt/v1/translation`, 
      { 
        source,
        target,
        text
      }, {
        headers: {
          'X-NCP-APIGW-API-KEY-ID': process.env.NCP_CLIENT_ID,
          'X-NCP-APIGW-API-KEY': process.env.NCP_CLIENT_SECRET,
          'Content-Type': 'application/json; charset=UTF-8'
        }
      }
     );
      console.log('Translated text:', response.data.message.result.translatedText);
      const translatedText = response.data.message.result.translatedText;
      res.json({ translatedText });

  }catch(err){
   console.error(err);
   console.log(err.response?.data || err.message);
   res.status(500).json({
   error: err.response?.data || err.message
  });
  }

});
/**
 * @ 최초생성일 : 2025. 12. 17.
 * @ author : 이웅재
 * @ 설명 : prompt에 넘긴 명령문을 base64코드 반환 엔드포인트
 */
app.post('/generate',async (req, res)=>{
let {prompt, negative_prompt, width, height} = req.body;
if(width==null || width=='') width = 512
if(height==null || height=='') height = 512
try{
  if(prompt == null || prompt.trim() === ''){
    return res.status(400).json({ message: 'Prompt is required' });
  }else{
    console.log("서버로 넘어온 프롬프트 : "+prompt);
  }
  const response = await axios.post(`${generateApiIp}/generate`,
    {
      prompt,
      negative_prompt,
      num_inference_steps: 20,
      guidance_scale: 7.5,
      seed : 123,    
      width,
      height,
      return_base64: true
    }
  );
  // seed: Math.floor(Math.random() * 1e9),
  
   console.log("서버에서 넘어온 이미지 : "+response.data);
   return res.status(200).json(response.data);
}catch(err){
   console.error(err);
   console.log(err.response?.data || err.message);
}

});

/**
 * @ 최초생성일 : 2025. 12. 17.
 * @ author : 이웅재
 * @ 설명 : base64코드를 기반으로 분석한 결과 반환 엔드포인트
 */
app.post('/upload_and_generate', upload.single('file'), async (req, res) => {
  console.log('-----req.body:', req.body);
  try {
    // multer가 파싱한 파일
    const file = req.file;
    const { prompt, max_tokens, temperature, return_base64 } = req.body;
    // FormData 생성
    const formData = new FormData();
    formData.append(
      'file',
       file.buffer,
        {
          filename: file.originalname,
          contentType: file.mimetype
        }
      // fs.createReadStream(file.path),
      // file.originalname
    );

    formData.append('prompt', prompt);
    formData.append('max_tokens', max_tokens);
    formData.append('temperature', temperature);
    formData.append('return_base64', return_base64);
    
    const response = await axios.post(
      `${vlApiIp}/upload_and_generate`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );

    res.json(response.data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'upload_and_generate failed' });
  }
});

/**
 * @ 최초생성일 : 2025. 12. 31.
 * @ author : 이웅재
 * @ 함수명 : searchNaverShop
 * @ 설명 : 네이버 검색API를 통해 제품 조회 결과 반환 엔드포인트
 */
async function searchNaverShop(keyword) {
  const response = await axios.get(
    'https://openapi.naver.com/v1/search/shop.json',
    {
      params: { query: keyword, display: 5, start: 1, sort: 'sim' },
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
      },
    }
  );

  return response.data.items;
}

/**
 * @ 최초생성일 : 2025. 12. 31.
 * @ author : 이웅재
 * @ 설명 : 네이버 검색API를 통해 제품 조회 결과 반환 엔드포인트
 */
app.get('/naver/shop', async (req, res) => {
  const { queries } = req.query; // "검은색 자켓,청바지"
  const list = queries.split(',');

  const results = await Promise.all(
    list.map(q => searchNaverShop(q.trim()))
  );

  res.json(results);
});

app.listen(PORT, HOST, () => console.log(`Server running on ${HOST}:${PORT}`));
// setInterval(() => {
//   console.log('server alive');
// }, 5000);