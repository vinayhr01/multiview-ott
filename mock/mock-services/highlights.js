const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());

app.post('/highlights/start', async (req, res) => {
  const { jobId, streamUrl } = req.body;
  console.log(`[Highlights] Processing started for Job ID: ${jobId}`);

  setTimeout(async () => {
    const result = { clips: [`[Highlights] Clip X from ${streamUrl}`] };
    await axios.post(process.env.MAIN_SERVER, {
      jobId,
      service: 'highlights',
      data: streamUrl
    });
    console.log(`[Highlights] Callback sent for Job ID: ${jobId} with result: ${JSON.stringify(result)}`);
  }, 5000);

  res.json({ success:true, message: 'Highlights started processing' });
});

app.listen(process.env.PORT_HIGHLIGHTS, () => {
  console.log(`🎬 Highlights mock running at port ${process.env.PORT_HIGHLIGHTS}`);
});
