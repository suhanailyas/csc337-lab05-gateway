const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('./models/User');

async function sync(provider, profile, done) {
  try {
    const email = ((profile.emails && profile.emails[0] && profile.emails[0].value)
      || `${profile.id}@${provider}.local`).toLowerCase();
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email, name: profile.displayName || profile.username,
        provider, providerId: profile.id
      });
    }
    done(null, user);
  } catch (e) { done(e); }
}

if (process.env.GOOGLE_CLIENT_ID)
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BASE_URL + '/api/v1/auth/google/callback'
  }, (a, r, p, d) => sync('google', p, d)));

if (process.env.GITHUB_CLIENT_ID)
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.BASE_URL + '/api/v1/auth/github/callback',
    scope: ['user:email']
  }, (a, r, p, d) => sync('github', p, d)));