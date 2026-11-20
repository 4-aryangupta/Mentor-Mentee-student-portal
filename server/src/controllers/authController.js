import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { asyncHandler, safeUser, sendData } from '../utils/serializers.js';
import { createAccessToken, createRefreshToken, refreshCookieOptions } from '../utils/tokens.js';

const issueTokens = (res, user) => {
  res.cookie('refreshToken', createRefreshToken(user), refreshCookieOptions());
  return { accessToken: createAccessToken(user), user: safeUser(user) };
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, department } = req.body;
  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  const user = await User.create({ name: name.trim(), email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: 'student', phone, department });
  sendData(res, issueTokens(res, user), 201);
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ where: { email: String(req.body.email).toLowerCase() } });
  if (!user || !user.isActive || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    return res.status(401).json({ success: false, message: 'Email or password is incorrect.' });
  }
  sendData(res, issueTokens(res, user));
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: 'Refresh session not found.' });
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET); }
  catch { return res.status(401).json({ success: false, message: 'Refresh session expired. Please sign in again.' }); }
  if (payload.type !== 'refresh') return res.status(401).json({ success: false, message: 'Invalid refresh session.' });
  const user = await User.findByPk(payload.sub);
  if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Account is unavailable.' });
  sendData(res, issueTokens(res, user));
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', { ...refreshCookieOptions(), maxAge: undefined });
  res.json({ success: true, message: 'You have been signed out.' });
});
