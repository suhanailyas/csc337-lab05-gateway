require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const passport = require('passport');
require('./src/passport');

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(passport.initialize());
app.use(express.static('public'));

app.use('/api/v1/auth', require('./src/routes/auth'));
app.use('/api/v1', require('./src/routes/resources'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 3000, () => console.log('Running')))
  .catch((e) => { console.error(e); process.exit(1); });