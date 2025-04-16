// server.js (updated - remove passport & session)
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const recipeRoutes = require('./routes/recipes');
const authRoutes = require('./routes/auth');
const passport = require('passport');
const session = require('express-session');

dotenv.config();

const app = express();

// Configure CORS without credentials
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Disable credentials
}));

// Configure session middleware
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false }  // Use secure: false for HTTP in development
// }));


// Initialize Passport and session support
app.use(passport.initialize());
// app.use(passport.session());

// Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes);

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
