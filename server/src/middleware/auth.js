import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { asyncHandler } from '../utils/serializers.js';

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required.' });
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET); }
  catch { return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' }); }
  const user = await User.findByPk(payload.sub);
  if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Account is unavailable.' });
  req.user = { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, department: user.department, isActive: user.isActive };
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'You do not have permission to do that.' });
  next();
};
