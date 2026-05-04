const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const todoRoutes = require('./routes/todo');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', todoRoutes);

module.exports = app;
