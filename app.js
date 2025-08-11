require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const connectDB = require('./config/db');
const routes = require('./routes');
const cors = require('cors');

const app = express();
app.use(cors())
const PORT = process.env.PORT || 3000;

connectDB();

app.use(morgan('dev'));
app.use(express.json());
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.status(200).send({ status: 'OK', message: 'Healthy' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
