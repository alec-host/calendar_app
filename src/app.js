const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;