const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());

app.post('/h2v/start', async (req, res) => {
  const { jobId, streamUrl } = req.body;
  console.log(`[H2V] Processing started for Job ID: ${jobId}`);

  setTimeout(async () => {
    const result = { highlights: [`[H2V] Horizontal to Vertical url from ${streamUrl} is processed`] };
    await axios.post(process.env.MAIN_SERVER, {
      jobId,
      service: 'h2v',
      data: streamUrl
    });
    console.log(`[H2V] Callback sent for Job ID: ${jobId} with result: ${JSON.stringify(result)}`);
  }, 3000);

  res.json({success: true, message: 'H2V started processing' });
});

app.listen(process.env.PORT_H2V, () => {
  console.log(`🔧 H2V mock running at port ${process.env.PORT_H2V}`);
});
