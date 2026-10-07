const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const User = require('../models/User');

const hash = (t) => crypto.createHash('sha256').update(t).digest('hex');
const makeAccess = (u) => jwt.sign({ sub: u.id, role: u.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
const makeRefresh = (u) => jwt.sign({ sub: u.id, jti: crypto.randomUUID() }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
const cookieOpts = { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 3600 * 1000, path: '/api/v1/auth' };

async function issue(user, res) {
  const rt = makeRefresh(user);
  user.refreshTokens.push(hash(rt));
  await user.save();
  res.cookie('refreshToken', rt, cookieOpts);
  return makeAccess(user);
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5, skipSuccessfulRequests: true,
  message: { message: 'Too many failed attempts. Try again in 15 minutes.' }
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string' || password.length < 8)
    return res.status(400).json({ message: 'Valid email and password (min 8 chars) required' });
  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ message: 'Email already registered' });
  const user = await User.create({
    name, email, password: await bcrypt.hash(password, 12)
  });
  res.status(201).json({ id: user.id, email: user.email, role: user.role });
});

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string')
    return res.status(400).json({ message: 'Invalid input' });
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.password || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ accessToken: await issue(user, res), role: user.role });
});

router.post('/refresh', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET); }
  catch { return res.status(401).json({ message: 'Invalid refresh token' }); }
  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ message: 'User not found' });
  if (!user.refreshTokens.includes(hash(token))) {
    user.refreshTokens = []; await user.save();
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    return res.status(401).json({ message: 'Token reuse detected. All sessions revoked.' });
  }
  user.refreshTokens = user.refreshTokens.filter((h) => h !== hash(token));
  res.json({ accessToken: await issue(user, res) });
});

router.post('/logout', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const p = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.updateOne({ _id: p.sub }, { $pull: { refreshTokens: hash(token) } });
    } catch {}
  }
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  res.json({ message: 'Logged out, token revoked' });
});

const oauthDone = async (req, res) => { await issue(req.user, res); res.redirect('/dashboard.html'); };

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), oauthDone);
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/' }), oauthDone);

   module.exports = router;