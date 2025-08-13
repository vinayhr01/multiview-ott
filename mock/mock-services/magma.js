const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors())
app.use(express.json());

app.post('/magma/start', async (req, res) => {
  const { jobId, streamUrl, expiry, updated_at } = req.body;
  console.log(`[magma] Processing started for Job ID: ${jobId}`);

  setTimeout(async () => {
    const result = { magma: [`[magma] Horizontal to Vertical url from ${streamUrl} is processed`] };

    const data = {streamUrl, expiry, updated_at}

    await axios.post(process.env.MAIN_SERVER, {
      jobId,
      service: 'magma',
      status: 'completed',
      data: data,
    });

    res.json({success: true, message: 'magma started processing', data: data });
    
    console.log(`[magma] Callback sent for Job ID: ${jobId} with result: ${JSON.stringify(result)}`);
  }, 3000);
});

app.listen(process.env.PORT_MAGMA, () => {
  console.log(`🔧 magma mock running at port ${process.env.PORT_MAGMA}`);
});
