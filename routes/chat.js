const express = require('express');
var router = express.Router();
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();



// OpenAI API 설정

const configuration = new Configuration({
  apiKey: process.env.CHAT_GPT_APIKEY,
});
const openai = new OpenAIApi(configuration);



// 대화 엔드포인트
router.post('/completions', async (req, res) => {
  const { message } = req.body;

  try {

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        { role: 'system', content: '당신은 세상에서 제일 훌륭한 목사입니다. 모든 대답은 성의있고 조언을 하듯이 성경의 내용으로 대답하세요.' },
        { role: 'user', content: message }
      ],
      stream: true
    });


    res.json({ message: 'success', advice: response.data.choices[0].message });


  } catch (error) {
    console.error('ChatGPT 요청 오류:', error);
    res.status(500).json({ message: 'error' });
  }
});


router.get("/todaywords", async (req, res) => {
  try {



    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: '당신은 세상에서 제일 훌륭한 목사입니다. 모든 대답은 성의있고 조언을 하듯이 성경의 내용으로 대답하세요.' },
        { role: 'user', content: "오늘의 성경말씀 한문장과 그 문장을 풀어서 해설한 2문단의 글을 작성해서 [ sentence: 성경말씀 , descriptions : [문단1 , 문단2] ]으로  json 형태로 보여주세요." }
      ],
    });

    res.json({ message: 'success', data: completion.data.choices[0].message });

  } catch (error) {
    console.error('ChatGPT 요청 오류:', error);
    res.status(500).json({ message: 'error' });
  }
})

module.exports = router;
