// passport.js (updated)
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Assuming you have a User model
require('dotenv').config();
const passport = require('passport');
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://1ac9-2405-201-f000-7015-b98f-f9a1-34ce-4ee.ngrok-free.app/api/auth/google/callback',
  },
  async function(accessToken, refreshToken, profile, done) {
    console.log('Google profile received:', profile); // Log the received profile
    try {
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        console.log('Creating new user with Google ID:', profile.id); // Log user creation
        user = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0].value
        });
        await user.save();
      } else {
        console.log('User found:', user); // Log existing user
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Error during user authentication:', error); // Log errors
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id); // Just store the user ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;