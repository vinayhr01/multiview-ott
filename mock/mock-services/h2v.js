const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors())
app.use(express.json());

app.post('/h2v/start', async (req, res) => {
  const { jobId, streamUrl, expiry, updated_at } = req.body;
  console.log(`[H2V] Processing started for Job ID: ${jobId}`);

  setTimeout(async () => {
    const result = { highlights: [`[H2V] Horizontal to Vertical url from ${streamUrl} is processed`] };

    const data = {streamUrl, expiry, updated_at}

    await axios.post(process.env.MAIN_SERVER, {
      jobId,
      service: 'h2v',
      status: 'completed',
      data: data,
    });

    res.json({success: true, message: 'H2V started processing', data: data });
    
    console.log(`[H2V] Callback sent for Job ID: ${jobId} with result: ${JSON.stringify(result)}`);
  }, 3000);
});

app.listen(process.env.PORT_H2V, () => {
  console.log(`🔧 H2V mock running at port ${process.env.PORT_H2V}`);
});
