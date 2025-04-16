// server.js (updated - remove passport & session)
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const recipeRoutes = require('./routes/recipes');
const authRoutes = require('./routes/auth');
const passport = require('passport');

dotenv.config();

const app = express();

// Configure CORS without credentials
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Disable credentials
}));

// Initialize Passport and session support
app.use(passport.initialize());

const BASE_PATH = process.env.BASE_PATH || ''; // e.g., "/recipe-portal"

app.use(`${BASE_PATH}/api/recipes`, recipeRoutes);
app.use(`${BASE_PATH}/api/auth`, authRoutes);


const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

startServer();
