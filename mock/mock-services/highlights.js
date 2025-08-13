const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors())
app.use(express.json());

app.post('/highlights/start', async (req, res) => {
  const { jobId, streamUrl, expiry, updated_at } = req.body;
  console.log(`[highlights] Processing started for Job ID: ${jobId}`);

  setTimeout(async () => {
    const result = { highlights: [`[highlights] Horizontal to Vertical url from ${streamUrl} is processed`] };

    const data = {streamUrl, expiry, updated_at}

    await axios.post(process.env.MAIN_SERVER, {
      jobId,
      service: 'highlights',
      status: 'completed',
      data: data,
    });

    res.json({success: true, message: 'highlights started processing', data: data });
    
    console.log(`[highlights] Callback sent for Job ID: ${jobId} with result: ${JSON.stringify(result)}`);
  }, 3000);
});

app.listen(process.env.PORT_HIGHLIGHTS, () => {
  console.log(`🔧 highlights mock running at port ${process.env.PORT_HIGHLIGHTS}`);
});
