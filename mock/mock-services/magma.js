const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/magma/start', async (req, res) => {
  const { jobId, streamUrl } = req.body;
  console.log(`[Magma] Processing started for Job ID: ${jobId}`);

  setTimeout(async () => {
    const result = { transcript: [`Transcript for Scene 1 from ${streamUrl} is processed`] };
    await axios.post(process.env.MAIN_SERVER, {
      jobId,
      service: 'magma',
      data: result
    });
    console.log(`[Magma] Callback sent for Job ID: ${jobId} with result: ${JSON.stringify(result)}`);
  }, 4000);

  res.json({ success:true, message: 'Magma started processing' });
});

app.listen(process.env.PORT_MAGMA, () => {
  console.log(`🔥 Magma mock running at port ${process.env.PORT_MAGMA}`);
});
