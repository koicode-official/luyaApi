
const express = require('express');
var router = express.Router();
const axios = require("axios")

require("dotenv").config();



// YouTube 자막 ID 가져오기
async function getYouTubeCaptionId(videoId) {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/captions?part=id&videoId=${videoId}&key=${process.env.YOUTUBE_APIKEY}`
    );

    return response.data.items[0].id;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// YouTube 자막 가져오기
async function getYouTubeCaptionDetails(captionId) {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${process.env.YOUTUBE_APIKEY}`
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}




// 루트 엔드포인트
router.get('/script', async (req, res) => {
  try {
    // const videoId = req.query.videoId; // GET 요청의 쿼리 매개변수에서 비디오 ID 추출

    // if (!videoId) {
    //   return res.status(400).json({ error: '비디오 ID가 제공되지 않았습니다.' });
    // }

    videoId = "_2MJIdbgECM"
    const captionId = await getYouTubeCaptionId(videoId);
    console.log('captionId', captionId)
    const captionDetails = await getYouTubeCaptionDetails(captionId);

    res.json({ captionDetails });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router